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

const userProfile = async (userId) => {
    try {
        //getting user profile and recent bookings or properties if user is host
        const user = await prisma.user.findUnique({
            where: {
                Clerk_id: userId
            }, include: {
                languagePreference: true,
                properties: {
                    take: 5,
                    orderBy: {
                        created_at: 'desc'
                    }
                },
                bookings: {
                    take: 5,
                    orderBy: {
                        created_at: 'desc'
                    }
                }
            }
        });
        return user;
    } catch (error) {
        console.error('Error fetching user profile:', error.message);
        throw new Error(error.message || 'Failed to fetch user profile');
    }
}


const updateUser = async (userId, updateData) => {
    try {
        // Allowlist of fields that can be updated via this function
        const allowedFields = ['name', 'phone_number'];
        const sanitizedData = {};
        for (const field of allowedFields) {
            if (updateData[field] !== undefined) {
                sanitizedData[field] = updateData[field];
            }
        }

        const updatedUser = await prisma.user.update({
            where: {
                Clerk_id: userId
            },
            data: sanitizedData
        })
        return updatedUser;
    } catch (error) {
        console.error('Error updating user profile:', error.message);
        throw new Error(error.message || 'Failed to update user profile');
    }
}

const hostProfile = async (hostId) => {
    try {
        //hostId is user_id of the host whose profile is being fetched
        const host = await prisma.user.findUnique({
            where: {
                user_id: hostId
            },
            include: {
                properties: true
            }
        })
        return host;
    } catch (error) {
        console.error('Error fetching host profile:', error.message);
        throw new Error(error.message || 'Failed to fetch host profile');
    }
}


const updatePref = async (userId, languageCode) => {
    try {

        const user = await prisma.user.findUnique({
            where: {
                Clerk_id: userId
            }
        });

        if (!user) {
            throw new Error('User not found');
        }

        const updatedPref = await prisma.language_preference.upsert({
            where: {
                user_id: user.user_id
            },
            update: {
                language_code: languageCode
            },
            create: {
                user_id: user.user_id,
                language_code: languageCode
            }
        })
        return updatedPref;
    } catch (error) {
        console.error('Error updating language preference:', error.message);
        throw new Error(error.message || 'Failed to update language preference');
    }
}

module.exports = {
    updateRole,
    getAllUsersFromDB,
    verifyHost,
    userProfile,
    updateUser,
    hostProfile,
    updatePref,
    // deleteUserFromDb
}