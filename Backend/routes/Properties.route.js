const { getProperties, getUserProperties, createProperty, getUnverifiedProperties, deleteProperty, getDeletedProperties } = require('../controllers/Properties.controller')
const { verifyRole } = require('../middlewares/Role.middleware');
const express = require('express');

const router = express.Router();


//getting all verified the properties...
router.get('/', getProperties)

//getting user's properties...
router.get('/user/:id', getUserProperties);

//add a new properties...
router.post('/:userId', verifyRole(['HOST']), createProperty);

//get unverified properties...Admin Only
router.get('/notverified', verifyRole(['ADMIN']), getUnverifiedProperties);

//delete users' property...
router.delete('/:id', verifyRole(['HOST']), deleteProperty)

//get deleted properties... Admin Only
router.get('/deleted', verifyRole(['ADMIN']), getDeletedProperties)

module.exports = router;