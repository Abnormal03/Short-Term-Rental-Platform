const prisma = require("../config/db");

const { refund: chapaRefund } = require('./Chapa.service')

const createBooking = async (booking, clerkId, propertyId) => {
    try {
        return await prisma.$transaction(async (tx) => {
            const property = await tx.property.findFirst({
                where: {
                    property_id: propertyId,
                    deleted_at: null,
                    verification_status: "APPROVED"
                },
                include: {
                    availabilities: true,
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
            const checkIn = new Date(booking.checkInDate);
            const checkOut = new Date(booking.checkOutDate);
            const durationInDays = (checkOut - checkIn) / (1000 * 60 * 60 * 24);

            if (durationInDays < property.min_stay_duration || durationInDays > property.max_stay_duration) {
                throw new Error(`Stay duration must be between ${property.min_stay_duration} and ${property.max_stay_duration} days.`);
            }

            //Check General Availability Range...
            const { available_from, available_to } = property.availabilities;
            if (checkIn < new Date(available_from) || checkOut > new Date(available_to)) {
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

            //get the user and clerkId
            const user = await tx.user.findFirst({
                where: {
                    Clerk_id: clerkId
                }
            })
            //Create Booking....
            return await tx.booking.create({
                data: {
                    property_id: propertyId,
                    user_id: user.user_id,
                    check_in_date: checkIn,
                    check_out_date: checkOut,
                    total_price: booking.totalPrice,
                    payment: {
                        create: {
                            payment_method: booking.paymentMethod,
                            amount: booking.totalPrice
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

const cancelBook = async (bookingId, reason) => {
    try {
        //fetch booking...
        const booking = await prisma.$transaction(async (tx) => {

            const booking = await tx.booking.findUnique({
                where: { booking_id: bookingId },
                include: {
                    payment: true
                }
            });

            if (!booking) throw new Error("Booking not found");

            if (["CANCELLED", "COMPLETED"].includes(booking.booking_status)) {
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

        if (booking.payment.refund > 0) {
            throw new Error("Already refunded");
        }

        // check Elligable...
        const hoursSinceBooking = (new Date() - new Date(booking.created_at)) / (1000 * 60 * 60);
        const isElligible = hoursSinceBooking <= 24;

        // refund in chapa if illigable...
        let refundDetail;
        if (isElligible && booking.payment.payment_status === 'COMPLETED') {
            refundDetail = await chapaRefund(booking.payment.transaction_reference);

            if (!refundDetail.success) {
                throw new Error('Unable to Refund Transaction.')
            }
        }

        const result = await prisma.$transaction(async (tx) => {
            // create refund if elligable...
            if (isElligible) {
                await tx.payment.update({
                    where: {
                        payment_id: booking.payment.payment_id
                    },
                    data: {
                        payment_status: "REFUNDED"
                    }
                })
            }

            if (refundDetail && refundDetail.success) {
                await tx.refund.create({
                    data: {
                        payment_id: booking.payment.payment_id,
                        reason: reason,
                        refund_status: "COMPLETED",
                        amount: booking.total_price,
                        transaction_reference: refundDetail.reference
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
        })

        return result;

    } catch (error) {
        console.log("Cancel Booking Error:", error.message);
        throw new Error(error.message || "Unable to cancel booking.");
    }
}


const propertyBookings = async (propertyId) => {
    try {
        const bookings = await prisma.booking.findMany({
            where: {
                property_id: propertyId
            }
        })

        if (bookings.length === 0) {
            throw new Error('No booking found.')
        }
        return bookings;
    } catch (error) {
        console.log(error.message);
        throw new Error(error.message || "Failed to fetch Bookings.")
    }
}

const confirmedBookings = async (propertyId, clerkId) => {
    try {
        const bookings = await prisma.booking.findMany({
            where: {
                property_id: propertyId,
                property: {
                    host: {
                        Clerk_id: clerkId
                    }
                },
                booking_status: "CONFIRMED"
            }
        });

        return bookings;
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

const guestBookings = async (guestId) => {
    try {
        const guest = await prisma.user.findUnique({
            where: {
                Clerk_id: guestId
            }
        })
        const bookings = await prisma.booking.findMany({
            where: {
                user_id: guest.user_id
            }
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
                property: {
                    include: {
                        host: true
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


module.exports = { createBooking, cancelBook, propertyBookings, paymentSuccessfulFail, attachTransactionRef, confirmedBookings, guestBookings, bookingDetail };