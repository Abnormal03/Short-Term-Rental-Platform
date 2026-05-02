const { getAuth } = require('@clerk/express');
const { updateRole, getAllUsersFromDB, verifyHost: getVerifiedHost } = require('../services/User.service');

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
        const users = await getAllUsersFromDB(userId);

        if (!users || users.length === 0) {
            return res.status(404).json({ message: 'No users found' });
        }
        res.status(200).json({ users: users });
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

module.exports = {
    updateUserRole,
    getAllUsers,
    verifyHost,
    // deleteUser
}