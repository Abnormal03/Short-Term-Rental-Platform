const express = require('express');
const { verifyRole } = require('../middlewares/Role.middleware');

const { addBooking, cancelBooking, getPropertyBookings, paymentSuccessFail } = require('../controllers/Booking.controller');

const router = express.Router();

//add new booking...
router.post('/:propertyId', verifyRole(['GUEST']), addBooking);

//cancel a booking...
router.put('/cancel/:bookingId', verifyRole(['GUEST']), cancelBooking);

// get all bookings of a property...
router.get('/:propertyId', verifyRole(['HOST', 'ADMIN']), getPropertyBookings);

// payment success/failed
router.put('/:bookingId', verifyRole(['GUEST', 'ADMIN']), paymentSuccessFail)

module.exports = router;