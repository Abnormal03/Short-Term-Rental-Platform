const { getAuth } = require('@clerk/express');
const { updateRole, getAllUsersFromDB, verifyHost: getVerifiedHost, hostProfile, userProfile, updateUser, updatePref } = require('../services/User.service');

const updateUserRole = async (req, res) => {
    try {
        const { role, phoneNumber } = req.body;
        const { userId } = getAuth(req);
        const normalizedRole = typeof role === 'string' ? role.toUpperCase() : '';
        const normalizedPhone = typeof phoneNumber === 'string' ? phoneNumber.trim() : '';

        if (!['GUEST', 'HOST'].includes(normalizedRole)) {
            return res.status(400).json({ success: false, message: 'Role must be GUEST or HOST.' });
        }
        if (!/^\+?[0-9()\s-]{7,20}$/.test(normalizedPhone)) {
            return res.status(400).json({ success: false, message: 'Enter a valid phone number.' });
        }

        const updatedUser = await updateRole(userId, normalizedRole, normalizedPhone);
        if (!updatedUser) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }
        return res.status(200).json({ success: true, user: updatedUser });
    } catch (error) {
        if (error.code === 'P2002') {
            return res.status(409).json({ success: false, message: 'Phone number is already associated with another account.' });
        }
        return res.status(500).json({ success: false, message: 'Failed to update user.' });
    }
}

const getAllUsers = async (req, res) => {
    try {
        const { userId } = getAuth(req);
        const { page, limit } = req.query;
        const { users, count } = await getAllUsersFromDB(userId, Number(page) || 1, Number(limit) || 20);

        if (!users) {
            return res.status(404).json({ success: false, message: 'No users found.' });
        }
        return res.status(200).json({ success: true, users, count });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message || 'Failed to get all users.' });
    }
}


const verifyHost = async (req, res) => {
    try {
        const { hostId, verified } = req.body;
        if (typeof hostId !== 'string' || typeof verified !== 'boolean') {
            return res.status(400).json({ success: false, message: 'A host ID and boolean verification status are required.' });
        }
        const updatedUser = await getVerifiedHost(hostId, verified);

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }
        return res.status(200).json({ success: true, user: updatedUser });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Failed to verify host.' });
    }
}


const getUserProfile = async (req, res) => {
    try {
        const { userId } = getAuth(req);
        const user = await userProfile(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }
        return res.status(200).json({ success: true, user });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message || 'Failed to get user profile.' });
    }
}

const updateUserProfile = async (req, res) => {
    try {
        const { userId } = getAuth(req);
        const updates = req.body;
        const hasAllowedField = updates && ['name', 'phone_number'].some((field) => updates[field] !== undefined);
        if (!hasAllowedField) {
            return res.status(400).json({ success: false, message: 'Provide a name or phone_number to update.' });
        }
        if (updates.phone_number !== undefined && updates.phone_number !== null &&
            (typeof updates.phone_number !== 'string' || !/^\+?[0-9()\s-]{7,20}$/.test(updates.phone_number.trim()))) {
            return res.status(400).json({ success: false, message: 'Enter a valid phone number.' });
        }
        if (updates.name !== undefined && (typeof updates.name !== 'string' || !updates.name.trim())) {
            return res.status(400).json({ success: false, message: 'Name must not be empty.' });
        }

        const updatedUser = await updateUser(userId, updates);

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }
        return res.status(200).json({ success: true, user: updatedUser });
    } catch (error) {
        if (error.code === 'P2002') {
            return res.status(409).json({ success: false, message: 'Phone number is already associated with another account.' });
        }
        return res.status(500).json({ success: false, message: 'Failed to update user profile.' });
    }
}


const getHostProfile = async (req, res) => {
    try {
        const { hostId } = req.params;
        const user = await hostProfile(hostId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'Host not found.' });
        }
        return res.status(200).json({ success: true, user });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message || 'Failed to get host profile.' });
    }
}


const updatePreference = async (req, res) => {
    try {
        const { userId } = getAuth(req);
        const { language } = req.body;
        if (!['en', 'am'].includes(language)) {
            return res.status(400).json({ success: false, message: 'Language must be en or am.' });
        }

        const updatedUser = await updatePref(userId, language);

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }
        return res.status(200).json({ success: true, preference: updatedUser });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message || 'Failed to update language preference.' });
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
}
