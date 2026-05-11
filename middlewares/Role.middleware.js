const { getAuth } = require('@clerk/express');
const prisma = require('../config/db');

const verifyRole = (Role) => {
    return async (req, res, next) => {
        const { userId } = getAuth(req);

        try {
            const user = await prisma.user.findFirst({
                where: {
                    Clerk_id: userId
                }
            })

            if (!user) {
                return res.status(404).json({ message: "user not found!" })
            }
            const authorized = Role.some((role) => role === user.Role)
            if (!authorized) {
                return res.status(403).json({ message: "unauthorized access!" })
            }
            next();
        } catch (error) {
            console.log(error)
            return res.status(403).json({ message: "unable to process user!" })
        }
    }
}

module.exports = { verifyRole }