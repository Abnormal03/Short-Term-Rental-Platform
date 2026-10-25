const prisma = require("../config/db");

const { refund: chapaRefund, verifyPayment, failSuccessPayment, initializePayment } = require('./Chapa.service')
const SERVICE_FEE = 500;
const CLEANING_FEE = 800;

const createBooking = async (booking, clerkId, propertyId) => {
    try {
        const checkIn = new Date(booking.checkInDate);
        const checkOut = new Date(booking.checkOutDate);
        if (!Number.isFinite(checkIn.getTime()) || !Number.isFinite(checkOut.getTime())) {
            throw new Error('Choose valid check-in and check-out dates.');
        }
        return await prisma.$transaction(async (tx) => {
            const property = await tx.property.findFirst({
                where: {
                    property_id: propertyId,
                    deleted_at: null,
                    verification_status: "APPROVED"
                },
                include: {
                    availabilities: true,
                    availabilityOverrides: {
                        where: { date: { gte: checkIn, lt: checkOut } },
                    },
                    bookings: {
                        where: {
                            booking_status: { notIn: ["CANCELLED", "COMPLETED"] }
                        },
                        select: { check_in_date: true, check_out_date: true }
                    }
                }
            });

            if (!property) throw new Error('Property not found or not approved.');

            //Calculate Stay Duration in Days...
            const durationInDays = (checkOut - checkIn) / (1000 * 60 * 60 * 24);

            const dateKey = (date) => new Date(date).toISOString().slice(0, 10);
            const dateOverrides = new Map(property.availabilityOverrides.map((override) => [dateKey(override.date), override]));
            const requiredMinimum = dateOverrides.get(dateKey(checkIn))?.min_stay_duration || property.min_stay_duration;
            if (!Number.isInteger(durationInDays) || durationInDays <= 0 ||
                durationInDays < requiredMinimum || durationInDays > property.max_stay_duration) {
                throw new Error(`Stay duration must be between ${requiredMinimum} and ${property.max_stay_duration} days.`);
            }

            //Check General Availability Range...
            if (!property.availabilities) {
                throw new Error('Property availability has not been configured.');
            }
            const { available_from, available_to } = property.availabilities;
            const todayKey = new Date().toISOString().slice(0, 10);
            if (dateKey(checkIn) < todayKey || dateKey(checkIn) < dateKey(available_from) || dateKey(checkOut) > dateKey(available_to)) {
                throw new Error('Property is not available for these dates.');
            }

            //Check for Overlapping Bookings...
            //Logic: (NewStart < ExistingEnd) AND (NewEnd > ExistingStart)...
            const isOverlapping = property.bookings.some(existing => {
                return (checkIn < new Date(existing.check_out_date) &&
                    checkOut > new Date(existing.check_in_date));
            });

            if (isOverlapping) {
                throw new Error('Property is already booked for these dates.');
            }

            let stayPrice = 0;
            for (let night = new Date(checkIn); night < checkOut; night.setUTCDate(night.getUTCDate() + 1)) {
                const override = dateOverrides.get(dateKey(night));
                if (override?.is_available === false) {
                    throw new Error('Property is blocked for one or more selected dates.');
                }
                stayPrice += override?.price_per_night ?? property.price_per_night;
            }

            //get the user and clerkId
            const user = await tx.user.findFirst({
                where: {
                    Clerk_id: clerkId
                }
            })
            if (!user) throw new Error('Guest account not found.');
            const totalPrice = Number((stayPrice + SERVICE_FEE + CLEANING_FEE).toFixed(2));
            //Create Booking....
            return await tx.booking.create({
                data: {
                    property_id: propertyId,
                    user_id: user.user_id,
                    guest_count: Math.max(1, Number(booking.guests) || 1),
                    check_in_date: checkIn,
                    check_out_date: checkOut,
                    total_price: totalPrice,
                    payment: {
                        create: {
                            payment_method: booking.paymentMethod,
                            amount: totalPrice
                        }
                    }
                },
                include: {
                    payment: true
                }
            });
        });
    } catch (error) {
        console.error("Booking Error:", error.message);
        throw new Error(error.message || 'Unable to process booking.');
    }
};

const cancelBook = async (bookingId, clerkId, reason) => {
    try {
        //fetch booking...
        const booking = await prisma.$transaction(async (tx) => {

            const booking = await tx.booking.findUnique({
                where: { booking_id: bookingId },
                include: {
                    payment: { include: { refund: true } },
                    user: { select: { Clerk_id: true } }
                }
            });

            if (!booking) throw new Error("Booking not found");
            if (booking.user.Clerk_id !== clerkId) throw new Error('You can only cancel your own booking.');

            if (!['PENDING', 'CONFIRMED'].includes(booking.booking_status)) {
                throw new Error("Booking not cancellable");
            }

            // prevent race conditions (TOCTOU)
            await tx.booking.update({
                where: {
                    booking_id: bookingId
                },
                data: {
                    booking_status: "REFUNDING"
                }
            });

            return booking;
        });

        if (!booking) {
            throw new Error('Unable to find Booking.')
        }

        if (booking.payment?.refund) {
            throw new Error("Already refunded");
        }

        // check Elligable...
        const hoursSinceBooking = (new Date() - new Date(booking.created_at)) / (1000 * 60 * 60);
        const isElligible = hoursSinceBooking <= 24;

        // refund in chapa if illigable...
        let refundDetail;
        if (isElligible && booking.payment?.payment_status === 'COMPLETED') {
            try {
                refundDetail = await chapaRefund(booking.payment.transaction_reference);
                if (!refundDetail?.success) throw new Error('Unable to refund transaction.');
            } catch (refundError) {
                await prisma.booking.updateMany({
                    where: { booking_id: booking.booking_id, booking_status: 'REFUNDING' },
                    data: { booking_status: booking.booking_status }
                });
                throw refundError;
            }
        }

        let result;
        try {
            result = await prisma.$transaction(async (tx) => {
                if (booking.payment?.payment_status === 'PENDING') {
                    const paymentFailure = await tx.payment.updateMany({
                        where: {
                            payment_id: booking.payment.payment_id,
                            payment_status: 'PENDING'
                        },
                        data: { payment_status: 'FAILED' }
                    });

                    if (paymentFailure.count === 0) {
                        const currentPayment = await tx.payment.findUnique({
                            where: { payment_id: booking.payment.payment_id },
                            select: { payment_status: true }
                        });
                        if (currentPayment?.payment_status !== 'FAILED') {
                            throw new Error('Payment status changed while cancellation was processing. Refresh the booking and try again.');
                        }
                    }
                }

                // create refund if elligable...
                if (refundDetail?.success && booking.payment) {
                    await tx.payment.update({
                        where: {
                            payment_id: booking.payment.payment_id
                        },
                        data: {
                            payment_status: "REFUNDED"
                        }
                    })
                }

                if (refundDetail?.success && booking.payment) {
                    await tx.refund.create({
                        data: {
                            payment_id: booking.payment.payment_id,
                            reason: reason,
                            refund_status: "COMPLETED",
                            amount: booking.total_price,
                            transaction_reference: refundDetail.tx_ref
                        }
                    });
                }

                // cancel booking...
                const cancelBooking = await tx.booking.update({
                    where: {
                        booking_id: booking.booking_id
                    },
                    data: {
                        booking_status: 'CANCELLED'
                    },
                    include: {
                        payment: {
                            include: {
                                refund: true
                            }
                        }
                    }
                })


                return cancelBooking;
            });
        } catch (error) {
            // The booking was marked REFUNDING before provider calls. Restore it
            // for a pending payment if its local cancellation cannot complete.
            if (booking.payment?.payment_status === 'PENDING') {
                await prisma.booking.updateMany({
                    where: { booking_id: booking.booking_id, booking_status: 'REFUNDING' },
                    data: { booking_status: booking.booking_status }
                });
            }
            throw error;
        }

        return result;

    } catch (error) {
        console.log("Cancel Booking Error:", error.message);
        throw new Error(error.message || "Unable to cancel booking.");
    }
}


const propertyBookings = async (propertyId, clerkId, page, limit) => {
    try {
        if (!page || page < 1) {
            throw new Error('Page must be a positive integer');
        }
        if (!limit || limit < 1 || limit > 100) {
            throw new Error('Limit must be between 1 and 100');
        }
        const skip = (page - 1) * limit;
        const requester = await prisma.user.findUnique({
            where: { Clerk_id: clerkId },
            select: { Role: true }
        });
        if (!requester) throw new Error('User not found.');
        const where = { property_id: propertyId };
        if (requester.Role !== 'ADMIN') {
            where.property = { host: { Clerk_id: clerkId } };
        }
        const bookings = await prisma.booking.findMany({
            where,
            include: {
                property: { select: { title: true, city: true, country: true } },
                user: { select: { name: true, email: true, phone_number: true } },
                payment: { select: { payment_method: true, payment_status: true } }
            },
            orderBy: { created_at: 'desc' },
            skip,
            take: limit
        })

        const count = await prisma.booking.count({ where })
        return { bookings, count };
    } catch (error) {
        console.log(error.message);
        throw new Error(error.message || "Failed to fetch Bookings.")
    }
}

const confirmedBookings = async (propertyId, clerkId, page, limit) => {
    try {
        if (!page || page < 1) {
            throw new Error('Page must be a positive integer');
        }
        if (!limit || limit < 1 || limit > 100) {
            throw new Error('Limit must be between 1 and 100');
        }
        const skip = (page - 1) * limit;
        const bookings = await prisma.booking.findMany({
            where: {
                property_id: propertyId,
                property: {
                    host: {
                        Clerk_id: clerkId
                    }
                },
                booking_status: "CONFIRMED"
            },
            skip,
            take: limit
        });

        const count = await prisma.booking.count({
            where: {
                property_id: propertyId,
                property: {
                    host: {
                        Clerk_id: clerkId
                    }
                },
                booking_status: "CONFIRMED"
            }
        })

        return { bookings, count };
    } catch (error) {
        console.log(error.message);
        throw new Error(error.message || "Failed to Fetch Bookings");
    }
}


const paymentSuccessfulFail = async (bookingId, success) => {
    try {
        const updatedBooking = await prisma.booking.update({
            where: {
                booking_id: bookingId,
                booking_status: "PENDING"
            },
            data: {
                booking_status: success ? "CONFIRMED" : "CANCELLED",
                payment: {
                    update: {
                        payment_status: success ? "COMPLETED" : "FAILED"
                    }
                }
            },
            include: {
                payment: true
            }
        })

        if (!updatedBooking) {
            throw new Error('Unable to Update Booking.')
        }
        return updatedBooking;
    } catch (error) {
        console.log(error.message);
        throw new Error(error.message || "Failed to update Bookings.")
    }
}


const attachTransactionRef = async (bookingId, paymentId, tx_ref) => {
    try {
        const paymentUpdated = await prisma.booking.update({
            where: {
                booking_id: bookingId
            },
            data: {
                payment: {
                    update: {
                        where: {
                            payment_id: paymentId
                        },
                        data: {
                            transaction_reference: tx_ref
                        }
                    }
                }
            }, include: {
                payment: true
            }
        })

        return paymentUpdated
    } catch (error) {
        console.log(error.message)
        throw new Error(error.message || 'Fail to update Booking.')
    }
}

const retryGuestBookingPayment = async (bookingId, guestId, paymentDetails = {}) => {
    const booking = await bookingDetail(bookingId, guestId);
    if (!booking) return null;
    if (booking.booking_status !== 'PENDING' || booking.payment?.payment_status !== 'PENDING') {
        throw new Error('Only unpaid pending bookings can retry payment.');
    }

    const storedName = String(booking.user?.name || '').trim().split(/\s+/);
    const details = {
        price: booking.payment.amount,
        email: paymentDetails.email || booking.user?.email,
        first_name: paymentDetails.first_name || storedName[0],
        last_name: paymentDetails.last_name || storedName.slice(1).join(' '),
        phone_number: paymentDetails.phone_number || booking.user?.phone_number,
    };
    if (!details.email || !details.first_name || !details.phone_number) {
        throw new Error('Add your name, email, and phone number before retrying payment.');
    }

    if (booking.payment.transaction_reference) {
        try {
            const verification = await verifyPayment(booking.payment.transaction_reference);
            if (String(verification?.data?.status || '').toLowerCase() === 'success') {
                await failSuccessPayment(booking.payment.transaction_reference, booking.payment.payment_method, true);
                return { state: 'success', booking: await bookingDetail(bookingId, guestId) };
            }
        } catch (error) {
            console.warn('Could not verify the existing payment before retry:', error.message);
        }
    }
    const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
    const initialized = await initializePayment(details, `${frontendUrl}/bookings/${bookingId}/confirmation`);
    if (!initialized.success) throw new Error(initialized.message || 'Unable to restart payment.');

    const updatedBooking = await attachTransactionRef(bookingId, booking.payment.payment_id, initialized.tx_ref);
    return { booking: updatedBooking, checkout_url: initialized.checkout_url?.checkout_url || initialized.checkout_url };
};
const guestBookings = async (guestId) => {
    try {
        const guest = await prisma.user.findUnique({
            where: {
                Clerk_id: guestId
            }
        })
        if (!guest) return [];
        const bookings = await prisma.booking.findMany({
            where: { user_id: guest.user_id },
            include: {
                property: {
                    include: {
                        propertyImages: true,
                        host: { select: { name: true } },
                    },
                },
                payment: true,
            },
            orderBy: { created_at: 'desc' }
        })
        return bookings;
    } catch (error) {
        console.log(error.message);
        throw new Error(error.message || 'Unable to fetch Bookings.')
    }
}

const bookingDetail = async (bookingId, guestId) => {
    try {
        const guest = await prisma.user.findUnique({
            where: {
                Clerk_id: guestId
            }
        })

        if (!guest) {
            throw new Error('Guest not found.')
        }

        const booking = await prisma.booking.findFirst({
            where: {
                booking_id: bookingId,
                user_id: guest.user_id
            }, include: {
                payment: true,
                user: { select: { name: true, email: true, phone_number: true } },
                property: {
                    include: {
                        propertyImages: true,
                        availabilities: true,
                        host: { select: { name: true, email: true, phone_number: true, is_verified_host: true } }
                    }
                }

            }
        })
        return booking;
    } catch (error) {
        console.log(error.message);
        throw new Error(error.message || 'Unable to fetch Booking Detail.')
    }
}

const confirmGuestBookingPayment = async (bookingId, guestId, returnStatus) => {
    const booking = await bookingDetail(bookingId, guestId);
    if (!booking) return null;

    const payment = booking.payment;
    let state = getBookingPaymentState(booking.booking_status, payment?.payment_status);
    const paymentWasCancelled = ['cancelled', 'canceled'].includes(String(returnStatus || '').toLowerCase());
    let providerStatus = null;

    if (state === 'failed' && paymentWasCancelled) state = 'cancelled';

    if (state === 'pending' && payment?.transaction_reference) {
        try {
            const verification = await verifyPayment(payment.transaction_reference);
            providerStatus = String(verification?.data?.status || verification?.status || '').toLowerCase();

            if (providerStatus === 'success') {
                await failSuccessPayment(payment.transaction_reference, payment.payment_method, true);
                state = 'success';
            } else if (['failed', 'cancelled', 'canceled', 'expired'].includes(providerStatus)) {
                await failSuccessPayment(payment.transaction_reference, payment.payment_method, false);
                state = providerStatus === 'cancelled' || providerStatus === 'canceled' || paymentWasCancelled ? 'cancelled' : 'failed';
            }
        } catch (error) {
            console.warn('Chapa confirmation check pending:', error.message);
        }
    }

    const currentBooking = await bookingDetail(bookingId, guestId);
    state = getBookingPaymentState(currentBooking.booking_status, currentBooking.payment?.payment_status, state);
    return { state, booking: currentBooking, providerStatus };
}

function getBookingPaymentState(bookingStatus, paymentStatus, previousState) {
    if (['REFUNDED', 'REFUNDING'].includes(bookingStatus) || paymentStatus === 'REFUNDED') return 'cancelled';
    if (paymentStatus === 'FAILED') return previousState === 'cancelled' ? 'cancelled' : 'failed';
    if (bookingStatus === 'CANCELLED') return 'cancelled';
    if (paymentStatus === 'COMPLETED' && ['CONFIRMED', 'COMPLETED', 'DISPUTED'].includes(bookingStatus)) return 'success';
    return 'pending';
}


module.exports = { createBooking, cancelBook, propertyBookings, paymentSuccessfulFail, attachTransactionRef, confirmedBookings, guestBookings, bookingDetail, confirmGuestBookingPayment, retryGuestBookingPayment };
