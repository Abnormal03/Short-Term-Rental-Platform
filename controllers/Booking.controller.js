const { createBooking, cancelBook, propertyBookings, paymentSuccessfulFail, attachTransactionRef, confirmedBookings, guestBookings, bookingDetail } = require("../services/Booking.service")
const { getAuth } = require('@clerk/express');
const { initializePayment } = require("../services/Chapa.service");

const addBooking = async (req, res) => {
    try {
        const { propertyId } = req.params;
        const { userId } = getAuth(req);
        const { booking, paymentDetail } = req.body;
        if (!booking || !booking.checkInDate || !booking.checkOutDate || !booking.totalPrice || !booking.paymentMethod || !paymentDetail) {
            return res.status(400).json({ message: 'Full information is required.' })
        }

        const NewBooking = await createBooking(booking, userId, propertyId);

        if (!NewBooking) {
            return res.status(400).json({ message: 'Unable to book property.' })
        }
        //initialize payment..
        const initialize = await initializePayment(paymentDetail);

        //if payment fails, fail both booking and payment
        if (!initialize.success) {
            await paymentSuccessfulFail(NewBooking.booking_id, 'unsuccessful', false);
            throw new Error(initialize.message || 'Payment Failed.');
        }
        const paymentUpdated = await attachTransactionRef(NewBooking.booking_id, NewBooking.payment.payment_id, initialize.tx_ref)

        return res.status(200).json({ booking: paymentUpdated, checkout_url: initialize.checkout_url });
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}


const cancelBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const body = req.body ? req.body : null

        const canceledBooking = await cancelBook(bookingId, body.reason || null)

        if (canceledBooking) {
            return res.status(200).json({ canceledBooking: canceledBooking })
        }
        return res.status(400).json({ message: 'Unable to cancel Booking.' })
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}


const getPropertyBookings = async (req, res) => {
    try {
        const { propertyId } = req.params;
        const bookings = await propertyBookings(propertyId);
        if (bookings) {
            return res.status(200).json({ bookings: bookings })
        }
        return res.status(400).json({ message: 'Something Happened while fetching Bookings.' })
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

const getConfirmedBookings = async (req, res) => {
    try {
        const { propertyId } = req.params;
        const { userId } = getAuth(req);

        const bookings = await confirmedBookings(propertyId, userId);

        if (bookings) {
            return res.status(200).json({ bookings: bookings })
        }
        return res.status(400).json({ message: 'Something Happened while fetching Bookings.' })
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}


const paymentSuccessFail = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { paymentStatus } = req.body;
        const success = paymentStatus === 'SUCCESS';

        const updatedBooking = await paymentSuccessfulFail(bookingId, success);

        if (updatedBooking) {
            return res.status(200).json({ updatedBooking: updatedBooking });
        }

        return res.status(400).json({ message: 'Unable to update Payment.' })
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

//get my booking for guest
const myBookings = async (req, res) => {
    try {
        const { userId } = getAuth(req);

        const bookings = await guestBookings(userId);

        if (bookings) {
            return res.status(200).json({ bookings: bookings })
        }
        return res.status(400).json({ message: 'Unable to fetch Bookings.' })
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

const guestDetailBooking = async (req, res) => {
    try {
        const { userId } = getAuth(req);
        const { bookingId } = req.params;

        const booking = await bookingDetail(bookingId, userId);

        if (booking) {
            return res.status(200).json({ booking: booking })
        }
        return res.status(400).json({ message: 'Unable to fetch Booking.' })
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

module.exports = { addBooking, cancelBooking, getPropertyBookings, paymentSuccessFail, getConfirmedBookings, myBookings, guestDetailBooking }