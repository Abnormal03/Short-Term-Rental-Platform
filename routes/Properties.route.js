const { getProperties, getUserProperties, createProperty, getUnverifiedProperties, deleteProperty, getDeletedProperties, updateProperty, approveProperty } = require('../controllers/Properties.controller')
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

//delete users' property...
router.delete('/:id', verifyRole(['HOST']), deleteProperty)

//get deleted properties... Admin Only
router.get('/deleted', verifyRole(['ADMIN']), getDeletedProperties);

// approve or reject a property...
router.put('/approve/:propertyId', verifyRole(['ADMIN']), approveProperty)

module.exports = router;