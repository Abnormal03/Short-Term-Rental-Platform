const { createBooking, cancelBook, propertyBookings, paymentSuccessfulFail, attachTransactionRef, confirmedBookings, guestBookings, bookingDetail } = require("../services/Booking.service");
const { getAuth } = require('@clerk/express');
const { initializePayment } = require("../services/Chapa.service");

const addBooking = async (req, res) => {
    try {
        const { propertyId } = req.params;
        const { userId } = getAuth(req);
        const { booking, paymentDetail } = req.body;

        if (!booking || !booking.checkInDate || !booking.checkOutDate || !booking.totalPrice || !booking.paymentMethod || !paymentDetail) {
            return res.status(400).json({ success: false, message: 'Full information is required.' });
        }

        const newBooking = await createBooking(booking, userId, propertyId);

        if (!newBooking) {
            return res.status(400).json({ success: false, message: 'Unable to book property.' });
        }

        const initialize = await initializePayment(paymentDetail);

        if (!initialize.success) {
            await paymentSuccessfulFail(newBooking.booking_id, false);
            throw new Error(initialize.message || 'Payment Failed.');
        }

        const paymentUpdated = await attachTransactionRef(newBooking.booking_id, newBooking.payment.payment_id, initialize.tx_ref);

        return res.status(200).json({ success: true, booking: paymentUpdated, checkout_url: initialize.checkout_url.checkout_url });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}


const cancelBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;
        // BUG FIX: `body` could be null, then `body.reason` throws a TypeError — use optional chaining
        const reason = req.body?.reason ?? null;

        const canceledBooking = await cancelBook(bookingId, reason);

        if (canceledBooking) {
            return res.status(200).json({ success: true, canceledBooking });
        }
        return res.status(400).json({ success: false, message: 'Unable to cancel booking.' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}


const getPropertyBookings = async (req, res) => {
    try {
        const { propertyId } = req.params;
        const { page, limit } = req.query;

        const { bookings, count } = await propertyBookings(propertyId, page, limit);

        if (bookings) {
            return res.status(200).json({ success: true, bookings, count });
        }
        return res.status(400).json({ success: false, message: 'Something went wrong while fetching bookings.' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

const getConfirmedBookings = async (req, res) => {
    try {
        const { propertyId } = req.params;
        const { userId } = getAuth(req);
        const { page, limit } = req.query;

        const { bookings, count } = await confirmedBookings(propertyId, userId, page, limit);

        if (bookings) {
            return res.status(200).json({ success: true, bookings, count });
        }
        return res.status(400).json({ success: false, message: 'Something went wrong while fetching bookings.' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}


const paymentSuccessFail = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { paymentStatus } = req.body;
        const success = paymentStatus === 'SUCCESS';

        const updatedBooking = await paymentSuccessfulFail(bookingId, success);

        if (updatedBooking) {
            return res.status(200).json({ success: true, updatedBooking });
        }

        return res.status(400).json({ success: false, message: 'Unable to update payment status.' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

const myBookings = async (req, res) => {
    try {
        const { userId } = getAuth(req);

        const bookings = await guestBookings(userId);

        if (bookings) {
            return res.status(200).json({ success: true, bookings });
        }
        return res.status(400).json({ success: false, message: 'Unable to fetch bookings.' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

const guestDetailBooking = async (req, res) => {
    try {
        const { userId } = getAuth(req);
        const { bookingId } = req.params;

        const booking = await bookingDetail(bookingId, userId);

        if (booking) {
            return res.status(200).json({ success: true, booking });
        }
        return res.status(400).json({ success: false, message: 'Unable to fetch booking.' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

module.exports = { addBooking, cancelBooking, getPropertyBookings, paymentSuccessFail, getConfirmedBookings, myBookings, guestDetailBooking }