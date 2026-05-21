const { getAuth } = require('@clerk/express');
const { updateRole, getAllUsersFromDB, verifyHost: getVerifiedHost, hostProfile, userProfile, updateUser, updatePref } = require('../services/User.service');

const updateUserRole = async (req, res) => {
    try {
        const { role, phoneNumber } = req.body;
        const { userId } = getAuth(req);

        if (role?.toUpperCase() === "ADMIN") {
            return res.status(403).json({ message: 'You are not authorized to assign ADMIN role.' });
        }

        const updatedUser = await updateRole(userId, role, phoneNumber);
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ user: updatedUser });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Failed to update user.' });
    }
}

const getAllUsers = async (req, res) => {
    try {
        const { userId } = getAuth(req);
        const { page, limit } = req.query;
        const { users, count } = await getAllUsersFromDB(userId, page, limit);

        if (!users) {
            return res.status(404).json({ message: 'No users found' });
        }
        res.status(200).json({ users: users, count });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Failed to get all users.' });
    }
}


const verifyHost = async (req, res) => {
    try {
        const { userId } = getAuth(req);
        const { verified } = req.body;
        const updatedUser = await getVerifiedHost(userId, verified);

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ user: updatedUser });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Failed to verify host.' });
    }
}

// const deleteUser = async (req, res) => {
//     try {
//         const { userId } = req.body;

//         const deletedUser = await deleteUserFromDb(userId);

//         if (!deletedUser) {
//             return res.status(404).json({ message: 'User not found' });
//         }
//         res.status(200).json({ message: 'User deleted successfully', user: deletedUser });
//     } catch (error) {
//         res.status(500).json({ message: error.message || 'Failed to delete user.' });
//     }
// }


const getUserProfile = async (req, res) => {
    try {
        const { userId } = getAuth(req);
        const user = await userProfile(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ user: user });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Failed to get user profile.' });
    }
}

const updateUserProfile = async (req, res) => {
    try {
        const { userId } = getAuth(req);
        const updates = req.body; // exprecting an object with fields to update... {name, phone_number}

        const updatedUser = await updateUser(userId, updates);

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ user: updatedUser });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Failed to update user profile.' });
    }
}


const getHostProfile = async (req, res) => {
    try {
        const { hostId } = req.params;
        const user = await hostProfile(hostId);

        if (!user) {
            return res.status(404).json({ message: 'Host not found' });
        }
        res.status(200).json({ user: user });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Failed to get host profile.' });
    }
}


const updatePreference = async (req, res) => {
    try {
        const { userId } = getAuth(req);
        const { language } = req.body;

        const updatedUser = await updatePref(userId, language);

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ preference: updatedUser });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Failed to update language preference.' });
    }
}

module.exports = {
    updateUserRole,
    getAllUsers,
    verifyHost,
    getUserProfile,
    updateUserProfile,
    getHostProfile,
    updatePreference
    // deleteUser
}