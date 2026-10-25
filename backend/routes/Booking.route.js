const express = require('express');
const { verifyRole } = require('../middlewares/Role.middleware');

const { addBooking, cancelBooking, getPropertyBookings, paymentSuccessFail, getConfirmedBookings, myBookings, guestDetailBooking, confirmGuestBooking, retryGuestPayment } = require('../controllers/Booking.controller');

const router = express.Router();

//add new booking...
router.post('/:propertyId', verifyRole(['GUEST'], { requireActiveGuest: true }), addBooking);

//cancel a booking...
router.put('/cancel/:bookingId', verifyRole(['GUEST'], { requireActiveGuest: true }), cancelBooking);

// get all bookings of a property...
router.get('/property/:propertyId', verifyRole(['HOST', 'ADMIN'], { requireActiveAccount: true }), getPropertyBookings);

// payment success / failed
// router.put('/payment/:bookingId', verifyRole(['GUEST', 'ADMIN']), paymentSuccessFail);

//get confirmed bookings for a property
router.get('/confirmed/:propertyId', verifyRole(['HOST'], { requireActiveAccount: true }), getConfirmedBookings);

//view all my bookings guest...
router.get('/my-bookings', verifyRole(['GUEST'], { requireActiveGuest: true }), myBookings);

// Retry payment for an existing unpaid booking.
router.post('/my-bookings/:bookingId/payment/retry', verifyRole(['GUEST'], { requireActiveGuest: true }), retryGuestPayment);

// Verify payment state with Chapa and return the current guest-owned booking.
router.get('/my-bookings/:bookingId/confirmation', verifyRole(['GUEST'], { requireActiveGuest: true }), confirmGuestBooking);

//booking detail view for guest
router.get('/my-bookings/:bookingId', verifyRole(['GUEST'], { requireActiveGuest: true }), guestDetailBooking);

module.exports = router;
