const { getAuth } = require('@clerk/express');
const prisma = require('../config/db');

const verifyRole = (Role) => {
    return async (req, res, next) => {
        const { userId } = await getAuth(req);

        try {
            if (!userId) {
                return res.status(400).json({
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
            next();
        } catch (error) {
            console.log(error.message)
            return res.status(403).json({ success: false, message: "unable to process user!" })
        }
    }
}

module.exports = { verifyRole }