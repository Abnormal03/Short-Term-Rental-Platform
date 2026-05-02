const express = require('express');
const { verifyRole } = require('../middlewares/Role.middleware');

const { updateUserRole, getAllUsers, verifyHost, deleteUser } = require('../controllers/User.controller');

const router = express.Router();

//set user role...
router.put('/user/update-user', updateUserRole);

//get all users...
router.get('/all', verifyRole(['ADMIN']), getAllUsers);

//verify host...
router.put('/verify-host', verifyRole(['ADMIN']), verifyHost);

//delete user...
// router.delete('/delete-user', verifyRole(['ADMIN']), deleteUser)

module.exports = router;