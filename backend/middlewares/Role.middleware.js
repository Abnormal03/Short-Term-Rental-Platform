const { getAuth } = require('@clerk/express');
const prisma = require('../config/db');

const verifyRole = (Role, { requireActiveGuest = false, requireActiveAccount = false } = {}) => {
    return async (req, res, next) => {
        try {
            const { userId } = getAuth(req);
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: "Authentication required!"
                })
            }
            const user = await prisma.user.findFirst({
                where: {
                    Clerk_id: userId
                }
            })

            if (!user) {
                return res.status(404).json({ success: false, message: "user not found!" })
            }
            const authorized = Role.some((role) => role === user.Role)
            if (!authorized) {
                return res.status(403).json({ success: false, message: "unauthorized access!" })
            }
            if ((requireActiveAccount || (requireActiveGuest && user.Role === 'GUEST')) && user.account_status !== 'ACTIVE') {
                return res.status(403).json({ success: false, code: 'GUEST_ACCOUNT_NOT_ACTIVE', message: 'Your guest account must be approved before using booking features.' })
            }
            next();
        } catch (error) {
            console.log(error.message)
            return res.status(500).json({ success: false, message: "Unable to authorize this request." })
        }
    }
}

module.exports = { verifyRole }
