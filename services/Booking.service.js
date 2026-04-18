const prisma = require("../config/db");

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
                    booking_status: 'PENDING',
                    total_price: booking.totalPrice,
                    payment: {
                        create: {
                            payment_method: booking.paymentMethod,
                            amount: booking.totalPrice
                        }
                    }
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
        return await prisma.$transaction(async (tx) => {
            //check if it is valid for refund or not...
            const booking = await tx.booking.findFirst({
                where: {
                    booking_id: bookingId,
                    payment: {
                        payment_status: "COMPLETED"
                    },
                    booking_status: {
                        notIn: ["CANCELLED", "COMPLETED",]
                    },
                },
                include: {
                    payment: true,
                }
            })
            console.log(booking)

            if (!booking) {
                throw new Error('Unable to cancel Booking.')
            }
            console.log(booking)
            //check if it is less than 24hr after booking...
            const illegible = (new Date(booking.created_at) - new Date()) / (1000 * 60 * 60) <= 24

            // refund the money back if illigable...
            if (illegible) {
                const refund = await tx.refund.create({
                    data: {
                        payment_id: booking.payment.payment_id,
                        reason: reason,
                        refund_status: "COMPLETED",
                        amount: booking.total_price
                    }
                })
            }

            // cancel the booking...
            const canceledBooking = await tx.booking.update({
                where: {
                    booking_id: bookingId
                },
                data: {
                    booking_status: "CANCELLED"
                }
            })

            return canceledBooking;
        })
    } catch (error) {
        console.log(error.message);
        throw new Error(error.message || "Unable to cancel booking.")
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

module.exports = { createBooking, cancelBook, propertyBookings, paymentSuccessfulFail };