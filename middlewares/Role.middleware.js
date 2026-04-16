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
            if (user.Role !== Role) {
                return res.status(403).json({ message: "unauthorized access!" })
            }
            next();
        } catch (error) {
            return res.status(403).json({ message: "unable to propcess user!" })
        }
    }
}

module.exports = { verifyRole }