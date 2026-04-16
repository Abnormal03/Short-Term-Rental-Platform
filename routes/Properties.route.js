const { getProperties, getUserProperties, createProperty, getUnverifiedProperties, deleteProperty, getDeletedProperties } = require('../controllers/Properties.controller')
const { verifyRole } = require('../middlewares/Role.middleware');
const express = require('express');

const route = express.Router();


//getting all verified the properties...
route.get('/', getProperties)

//getting user's properties...
route.get('/user/:id', getUserProperties);

//add a new properties...
route.post('/:userId', verifyRole('HOST'), createProperty);

//get unverified properties...Admin Only
route.get('/notverified', verifyRole('ADMIN'), getUnverifiedProperties);

//delete users' property...
route.delete('/:id', verifyRole('HOST'), deleteProperty)

//get deleted properties... Admin Only
route.get('/deleted', verifyRole('ADMIN'), getDeletedProperties)

module.exports = route;