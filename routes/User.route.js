const express = require('express');
const { verifyRole } = require('../middlewares/Role.middleware');

const { updateUserRole, getAllUsers, verifyHost, getUserProfile, updateUserProfile, getHostProfile, updatePreference } = require('../controllers/User.controller');

const router = express.Router();

//set user role...
router.put('/user/update-user', verifyRole(['HOST']), updateUserRole);

//update language preference...
router.put('/user/update-language', verifyRole(['USER', 'HOST', 'ADMIN']), updatePreference);

//get all users...
router.get('/all', verifyRole(['ADMIN']), getAllUsers);

//verify host...
router.put('/verify-host', verifyRole(['ADMIN']), verifyHost);

//delete user...
// router.delete('/delete-user', verifyRole(['ADMIN']), deleteUser)

//profile view...
router.get('/profile', getUserProfile);

//profile update...
router.put('/profile/update', verifyRole(["ADMIN", "HOST", "GUEST"]), updateUserProfile);

//guest view of host profile...
router.get("/host/:hostId", getHostProfile);

module.exports = router;