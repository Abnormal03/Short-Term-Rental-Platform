const express = require('express');
const { verifyRole } = require('../middlewares/Role.middleware');

const { addBooking, cancelBooking, getPropertyBookings, paymentSuccessFail, getConfirmedBookings, myBookings, guestDetailBooking } = require('../controllers/Booking.controller');

const router = express.Router();

//add new booking...
router.post('/:propertyId', verifyRole(['GUEST']), addBooking);

//cancel a booking...
router.put('/cancel/:bookingId', verifyRole(['GUEST']), cancelBooking);

// get all bookings of a property...
router.get('/property/:propertyId', verifyRole(['HOST', 'ADMIN']), getPropertyBookings);

// payment success / failed
router.put('/payment/:bookingId', verifyRole(['GUEST', 'ADMIN']), paymentSuccessFail);

//get confirmed bookings for a property
router.get('/confirmed/:propertyId', verifyRole(['HOST']), getConfirmedBookings);

//view all my bookings guest...
router.get('/my-bookings', verifyRole(['GUEST']), myBookings);

//booking detail view for guest
router.get('/my-bookings/:bookingId', verifyRole(['GUEST']), guestDetailBooking);

module.exports = router;