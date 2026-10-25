const { createBooking, cancelBook, propertyBookings, paymentSuccessfulFail, attachTransactionRef, confirmedBookings, guestBookings, bookingDetail, confirmGuestBookingPayment, retryGuestBookingPayment } = require("../services/Booking.service");
const { getAuth } = require('@clerk/express');
const { initializePayment } = require("../services/Chapa.service");

const addBooking = async (req, res) => {
    try {
        const { propertyId } = req.params;
        const { userId } = getAuth(req);
        const { booking, paymentDetail } = req.body;
        const checkIn = new Date(booking?.checkInDate);
        const checkOut = new Date(booking?.checkOutDate);
        const validPaymentMethods = ['telebirr', 'cbe', 'awash'];

        if (!booking || !booking.checkInDate || !booking.checkOutDate || !booking.paymentMethod ||
            !paymentDetail?.email || !paymentDetail?.first_name || !paymentDetail?.phone_number ||
            !Number.isFinite(checkIn.getTime()) || !Number.isFinite(checkOut.getTime()) || checkIn >= checkOut ||
            !Number.isInteger(Number(booking.guests)) || Number(booking.guests) < 1 ||
            !validPaymentMethods.includes(String(booking.paymentMethod).toLowerCase())) {
            return res.status(400).json({ success: false, message: 'Full information is required.' });
        }

        const newBooking = await createBooking(booking, userId, propertyId);

        if (!newBooking) {
            return res.status(400).json({ success: false, message: 'Unable to book property.' });
        }

        const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
        const returnUrl = `${frontendUrl}/bookings/${newBooking.booking_id}/confirmation`;
        const initialize = await initializePayment({ ...paymentDetail, price: newBooking.total_price }, returnUrl);

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
        const { userId } = getAuth(req);
        // BUG FIX: `body` could be null, then `body.reason` throws a TypeError — use optional chaining
        const reason = req.body?.reason ?? null;

        const canceledBooking = await cancelBook(bookingId, userId, reason);

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
        const { userId } = getAuth(req);
        const { page, limit } = req.query;

        const { bookings, count } = await propertyBookings(propertyId, userId, Number(page) || 1, Number(limit) || 20);

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

        const { bookings, count } = await confirmedBookings(propertyId, userId, Number(page) || 1, Number(limit) || 20);

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

const retryGuestPayment = async (req, res) => {
    try {
        const { userId } = getAuth(req);
        const result = await retryGuestBookingPayment(req.params.bookingId, userId, req.body?.paymentDetails || {});
        if (!result) return res.status(404).json({ success: false, message: 'Booking not found.' });
        return res.status(200).json({ success: true, ...result });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message || 'Unable to retry payment.' });
    }
}
const confirmGuestBooking = async (req, res) => {
    try {
        const { userId } = getAuth(req);
        const { bookingId } = req.params;
        const result = await confirmGuestBookingPayment(bookingId, userId, req.query.return_status);
        if (!result) return res.status(404).json({ success: false, message: 'Booking not found.' });
        return res.status(200).json({ success: true, ...result });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message || 'Unable to confirm booking payment.' });
    }
}

module.exports = { addBooking, cancelBooking, getPropertyBookings, paymentSuccessFail, getConfirmedBookings, myBookings, guestDetailBooking, confirmGuestBooking, retryGuestPayment }
