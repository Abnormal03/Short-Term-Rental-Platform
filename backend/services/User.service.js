const prisma = require('../config/db')

const updateRole = async (userId, role, phoneNumber) => {
    try {
        return await prisma.user.update({
            where: { Clerk_id: userId },
            data: { Role: role, phone_number: phoneNumber }
        });
    } catch (error) {
        console.error('Error updating user role:', error.message);
        throw error;
    }
}

const getAllUsersFromDB = async (userId, page, limit) => {
    try {
        if (!page || page < 1) {
            throw new Error('Page must be a positive integer');
        }
        if (!limit || limit < 1 || limit > 100) {
            throw new Error('Limit must be between 1 and 100');
        }
        const skip = (page - 1) * limit;
        const users = await prisma.user.findMany({
            where: {
                Clerk_id: {
                    not: userId
                }
            },
            skip,
            take: limit
        });

        const count = await prisma.user.count({
            where: {
                Clerk_id: {
                    not: userId
                }
            }
        })
        return { users, count };
    } catch (error) {
        console.error('Error fetching all users:', error.message);
        throw new Error(error.message || 'Failed to fetch all users');
    }
}

const verifyHost = async (hostId, verified) => {
    try {
        const user = await prisma.user.update({
            where: {
                user_id: hostId
            },
            data: {
                is_verified_host: verified
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
        const user = await prisma.user.findUnique({
            where: { Clerk_id: userId },
            select: {
                user_id: true,
                name: true,
                email: true,
                Role: true,
                phone_number: true,
                is_verified_host: true,
                payment_preference: true,
                create_at: true,
                languagePreference: { select: { language_code: true } }
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
                sanitizedData[field] = field === 'name' || field === 'phone_number'
                    ? updateData[field]?.trim?.() ?? updateData[field]
                    : updateData[field];
            }
        }
        if (Object.keys(sanitizedData).length === 0) {
            throw new Error('Provide a name or phone number to update.');
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
        const host = await prisma.user.findFirst({
            where: {
                user_id: hostId,
                Role: 'HOST'
            },
            select: {
                user_id: true,
                name: true,
                is_verified_host: true,
                properties: {
                    where: { verification_status: 'APPROVED', deleted_at: null },
                    select: {
                        property_id: true,
                        title: true,
                        city: true,
                        country: true,
                        price_per_night: true,
                        propertyImages: { select: { image_url: true } }
                    }
                }
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
