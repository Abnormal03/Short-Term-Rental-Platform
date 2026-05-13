const { getProperties, getUserProperties, createProperty, getUnverifiedProperties, deleteProperty, getDeletedProperties, updateProperty, approveProperty, getPropertyDetails, getPropertiesByCity, updateAvailability } = require('../controllers/Properties.controller')
const { verifyRole } = require('../middlewares/Role.middleware');
const express = require('express');

const router = express.Router();


//getting all verified the properties...
router.get('/', getProperties)

//update property....
router.put('/update/:propertyId', verifyRole(['HOST']), updateProperty)

//getting user's properties...
router.get('/user/:id', verifyRole(['HOST']), getUserProperties);


//add a new properties...
router.post('/:userId', verifyRole(['HOST']), createProperty);

//get unverified properties...Admin Only
router.get('/notverified', verifyRole(['ADMIN']), getUnverifiedProperties);


//get deleted properties... Admin Only
router.get('/deleted', verifyRole(['ADMIN']), getDeletedProperties);

// approve or reject a property...
router.put('/approve/:propertyId', verifyRole(['ADMIN']), approveProperty);

//get propety by city...
router.get('/city/:city', getPropertiesByCity);

//udpated availablity of the property... host only
router.put('/availability/:propertyId', verifyRole(['HOST']), updateAvailability);

//property details
router.get('/:id', getPropertyDetails);

//delete users' property...
router.delete('/:id', verifyRole(['HOST']), deleteProperty)

module.exports = router;