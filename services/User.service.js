const prisma = require('../config/db')

const updateRole = async (userId, role, phoneNumber) => {
    try {
        const user = await prisma.$transaction(async (prisma) => {
            //check if phone number is already associated with another user
            const existingUser = await prisma.user.findFirst({
                where: {
                    phone_number: phoneNumber,
                    Clerk_id: {
                        not: userId
                    }
                }
            });

            if (existingUser) {
                throw new Error('Phone number is already associated with another user.');
            }

            const user = await prisma.user.update({
                where: {
                    Clerk_id: userId
                },
                data: {
                    Role: role,
                    phone_number: phoneNumber
                }
            })

            return user;
        })

        return user;
    } catch (error) {
        console.error('Error updating user role:', error.message);
        throw new Error(error.message || 'Failed to update user role');
    }
}

const getAllUsersFromDB = async (userId) => {
    try {
        const users = await prisma.user.findMany({
            where: {
                Clerk_id: {
                    not: userId
                }
            }
        });
        return users;
    } catch (error) {
        console.error('Error fetching all users:', error.message);
        throw new Error(error.message || 'Failed to fetch all users');
    }
}

const verifyHost = async (userId, verified) => {
    try {
        const user = await prisma.user.update({
            where: {
                Clerk_id: userId
            },
            data: {
                isVerifiedHost: verified
            }
        });
        return user;
    } catch (error) {
        console.error('Error verifying host:', error.message);
        throw new Error(error.message || 'Failed to verify host');
    }
}


// deleteUserFromDb = async (userId) => {
//     try {
//         //delete preferences, properties, and bookings associated with the user before deleting the user
//         await prisma.language_preference.deleteMany({
//             where: {
//                 user_id: userId
//             }
//         });

//         await prisma.property.deleteMany({
//             where: {
//                 host_id: userId
//             }
//         });

//         await prisma.booking.deleteMany({
//             where: {
//                 user_id: userId
//             }
//         });
//         const deletedUser = await prisma.user.delete({
//             where: {
//                 user_id: userId
//             },
//             include: {
//                 languagePreference: true,
//             }

//         });
//         return deletedUser;
//     } catch (error) {
//         console.error('Error deleting user:', error.message);
//         throw new Error(error.message || 'Failed to delete user');
//     }
// }

module.exports = {
    updateRole,
    getAllUsersFromDB,
    verifyHost,
    // deleteUserFromDb
}