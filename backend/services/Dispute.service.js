const prisma = require("../config/db");
const { refund } = require("./Chapa.service");

const raiseDisputeService = async (bookingId, clerkId, reason) => {
    try {
        return await prisma.$transaction(async (tx) => {

            // check if the status of booking is confirmed+paid...
            const booking = await tx.booking.findUnique({
                where: {
                    booking_id: bookingId,
                }, include: {
                    user: true,
                    property: {
                        select: {
                            host_id: true
                        }
                    }
                }
            })

            if (!booking) {
                throw new Error('Booking not found');
            }

            if (booking.booking_status !== "CONFIRMED") {
                throw new Error('Dispute can only be raised for confirmed bookings');
            }

            //check if the useris the guest or host of the booking...
            if (booking.user.Clerk_id !== clerkId && booking.property.host_id !== clerkId) {
                throw new Error('Only guest or host of the booking can raise a dispute');
            }

            //check for an open existing dispute for the booking...
            const exists = await tx.dispute.findFirst({
                where: {
                    booking_id: bookingId,
                    status: 'OPEN'
                }
            })

            if (exists) {
                throw new Error('An open dispute already exists for this booking');
            }

            const dispute = await tx.dispute.create({
                data: { booking_id: bookingId, raised_by: booking.user_id, reason: reason }
            });

            await tx.booking.update({
                where: {
                    booking_id: bookingId
                },
                data: {
                    booking_status: "DISPUTED"
                }
            })

            return dispute;
        })
    } catch (error) {
        console.error('Error raising dispute:', error.message);
        throw new Error(error.message);
    }
}


const resolveDisputeService = async (disputeId, resolution, action) => {
    try {
        return await prisma.$transaction(async (tx) => {

            const dispute = await tx.dispute.findUnique({
                where: {
                    id: disputeId
                }
            })

            if (!dispute) {
                throw new Error('Dispute not found');
            }

            if (dispute.status !== 'OPEN') {
                throw new Error('Only open disputes can be resolved');
            }

            let updateData = {
                status: resolution === 'APPROVE' ? 'RESOLVED' : 'REJECTED',
                resolution: action
            }

            const udpatedDispute = await tx.dispute.update({
                where: {
                    id: disputeId
                },
                data: updateData,
                include: {
                    booking: {
                        include: { payment: true }
                    }
                }
            })

            const newBookingStatus = action === 'REFUND' ? 'REFUNDED' : 'CONFIRMED';

            //refund if refund the update booking status to refunded and update payment status to refunded as well...
            if (action === "REFUND") {
                const tx_ref = udpatedDispute.booking.payment.transaction_reference;
                const refunded = await refund(tx_ref);

                console.log("refunded: ", refunded)

                if (!refunded || !refunded.success) {
                    throw new Error('Unable to process refund!');
                }
            }

            const updatedBooking = await tx.booking.update({
                where: {
                    booking_id: updatedDispute.booking_id
                },
                data: {
                    booking_status: newBookingStatus
                }
            })

            return { dispute: updatedDispute, action: action };

        })
    } catch (error) {
        console.error('Error resolving dispute:', error.message);
        throw new Error(error.message);
    }
}

const getAllDisputesService = async (page, limit) => {
    try {
        if (!page || page < 1) {
            throw new Error('Page must be a positive integer');
        }
        if (!limit || limit < 1 || limit > 100) {
            throw new Error('Limit must be between 1 and 100');
        }
        const skip = (page - 1) * limit;
        const disputes = await prisma.dispute.findMany({
            where: {
                status: 'OPEN'
            },
            include: {
                booking: {
                    include: {
                        user: {
                            select: {
                                name: true,
                                email: true
                            }
                        },
                        property: {
                            select: {
                                title: true,
                                host_id: true
                            }
                        }
                    }
                }
            },
            skip,
            take: limit
        })

        if (!disputes || disputes.length === 0) {
            throw new Error('No open disputes found');
        }

        return disputes;
    } catch (error) {
        console.error('Error fetching all disputes:', error.message);
        throw new Error(error.message);
    }
}


module.exports = {
    raiseDisputeService,
    resolveDisputeService,
    getAllDisputesService
}