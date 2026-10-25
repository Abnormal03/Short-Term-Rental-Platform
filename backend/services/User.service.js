const prisma = require('../config/db')

const updateRole = async (userId, role, phoneNumber) => {
    try {
        return await prisma.user.update({
            where: { Clerk_id: userId },
            data: { Role: role, phone_number: phoneNumber, ...(role === 'HOST' && { is_verified_host: false, host_review_status: 'PENDING' }) }
        });
    } catch (error) {
        console.error('Error updating user role:', error.message);
        throw error;
    }
}

const getAllUsersFromDB = async (userId, page, limit, { role, search, needsAction = false, hostStatus, accountStatus, sort } = {}) => {
    try {
        if (!page || page < 1) {
            throw new Error('Page must be a positive integer');
        }
        if (!limit || limit < 1 || limit > 100) {
            throw new Error('Limit must be between 1 and 100');
        }
        const skip = (page - 1) * limit;
        const where = {}
        const and = []
        if (role && ['GUEST', 'HOST', 'ADMIN'].includes(String(role).toUpperCase())) where.Role = String(role).toUpperCase()
        if (needsAction) {
            and.push({ OR: [
                { Role: 'HOST', host_review_status: { in: ['PENDING', 'NEEDS_CHANGES'] } },
                { Role: 'GUEST', account_status: 'PENDING' },
            ] })
        }
        if (hostStatus === 'VERIFIED' || hostStatus === 'NOT_VERIFIED') {
            where.Role = 'HOST'
            where.host_review_status = hostStatus === 'VERIFIED' ? 'VERIFIED' : { not: 'VERIFIED' }
        }
        if (['PENDING', 'ACTIVE', 'REJECTED', 'SUSPENDED'].includes(String(accountStatus).toUpperCase())) where.account_status = String(accountStatus).toUpperCase()
        if (search) {
            and.push({ OR: [
                { name: { contains: String(search), mode: 'insensitive' } },
                { email: { contains: String(search), mode: 'insensitive' } },
            ] })
        }
        if (and.length) where.AND = and
        const users = await prisma.user.findMany({
            where,
            orderBy: { create_at: String(sort).toLowerCase() === 'oldest' ? 'asc' : 'desc' },
            skip,
            take: limit
        });

        const [count, guests, hosts, admins, unverifiedHosts, pendingGuests] = await Promise.all([
            prisma.user.count({ where }),
            prisma.user.count({ where: { Role: 'GUEST' } }),
            prisma.user.count({ where: { Role: 'HOST' } }),
            prisma.user.count({ where: { Role: 'ADMIN' } }),
            prisma.user.count({ where: { Role: 'HOST', host_review_status: { in: ['PENDING', 'NEEDS_CHANGES'] } } }),
            prisma.user.count({ where: { Role: 'GUEST', account_status: 'PENDING' } }),
        ])
        return { users, count, roleCounts: { GUEST: guests, HOST: hosts, ADMIN: admins }, unverifiedHosts, pendingGuests };
    } catch (error) {
        console.error('Error fetching all users:', error.message);
        throw new Error(error.message || 'Failed to fetch all users');
    }
}

const verifyHost = async (hostId, verified) => {
    try {
        const host = await prisma.user.findUnique({
            where: { user_id: hostId },
            select: { user_id: true, Role: true }
        });
        if (!host || host.Role !== 'HOST') return null;
        const user = await prisma.user.update({
            where: {
                user_id: hostId
            },
            data: {
                is_verified_host: verified,
                host_review_status: verified ? 'VERIFIED' : 'PENDING',
                ...(verified && { account_status: 'ACTIVE' }),
                admin_review_note: null,
            }
        });
        return user;
    } catch (error) {
        console.error('Error verifying host:', error.message);
        throw new Error(error.message || 'Failed to verify host');
    }
}

const getAdminUserDetail = async (userId) => {
    const user = await prisma.user.findUnique({
        where: { user_id: userId },
        include: {
            properties: {
                where: { deleted_at: null },
                orderBy: { create_at: 'desc' },
                include: {
                    propertyImages: { select: { image_id: true, image_url: true } },
                    availabilities: true,
                    _count: { select: { bookings: true } },
                },
            },
            bookings: {
                orderBy: { created_at: 'desc' },
                take: 20,
                include: {
                    property: { select: { title: true, city: true, host: { select: { name: true } } } },
                    payment: { select: { payment_method: true, payment_status: true } },
                    disputes: { select: { id: true, status: true } },
                },
            },
            disputes: {
                orderBy: { created_at: 'desc' },
                take: 20,
                include: { booking: { select: { booking_id: true, booking_status: true } } },
            },
            languagePreference: { select: { language_code: true } },
        },
    })
    if (!user) return null
    const [hostBookings, hostDisputes, guestBookings, guestDisputes] = await Promise.all([
        user.Role === 'HOST' ? prisma.booking.count({ where: { property: { is: { host_id: user.user_id } } } }) : 0,
        user.Role === 'HOST' ? prisma.dispute.count({ where: { booking: { is: { property: { is: { host_id: user.user_id } } } } } }) : 0,
        user.Role === 'GUEST' ? prisma.booking.count({ where: { user_id: user.user_id } }) : 0,
        user.Role === 'GUEST' ? prisma.dispute.count({ where: { raised_by: user.user_id } }) : 0,
    ])
    return { ...user, activity: { hostBookings, hostDisputes, guestBookings, guestDisputes } }
}

const reviewAdminUser = async (userId, decision, note, message) => {
    const user = await prisma.user.findUnique({ where: { user_id: userId }, select: { user_id: true, Role: true } })
    if (!user) return null
    const adminReviewNote = typeof note === 'string' ? note.trim() || null : null
    const reviewMessage = typeof message === 'string' ? message.trim() || null : null
    if (decision === 'SUSPEND' && ['HOST', 'GUEST'].includes(user.Role)) {
        return prisma.user.update({ where: { user_id: userId }, data: { account_status: 'SUSPENDED', admin_review_note: adminReviewNote, review_message: reviewMessage } })
    }
    if (decision === 'RESTORE' && ['HOST', 'GUEST'].includes(user.Role)) {
        return prisma.user.update({ where: { user_id: userId }, data: { account_status: 'ACTIVE', admin_review_note: adminReviewNote, review_message: reviewMessage } })
    }
    if (user.Role === 'HOST') {
        const statuses = { VERIFY: 'VERIFIED', REQUEST_INFO: 'NEEDS_CHANGES', REJECT: 'REJECTED' }
        const host_review_status = statuses[decision]
        if (!host_review_status) throw new Error('Unsupported host review decision.')
        if (decision !== 'VERIFY' && !reviewMessage) throw new Error('A message to the host is required for this decision.')
        return prisma.user.update({
            where: { user_id: userId },
            data: { host_review_status, is_verified_host: decision === 'VERIFY', ...(decision === 'VERIFY' && { account_status: 'ACTIVE' }), admin_review_note: adminReviewNote, review_message: reviewMessage },
        })
    }
    if (user.Role === 'GUEST') {
        const statuses = { APPROVE: 'ACTIVE', REJECT: 'REJECTED', SUSPEND: 'SUSPENDED' }
        const account_status = statuses[decision]
        if (!account_status) throw new Error('Unsupported guest account decision.')
        if (decision === 'REJECT' && !reviewMessage) throw new Error('A message to the guest is required to reject this account.')
        return prisma.user.update({ where: { user_id: userId }, data: { account_status, admin_review_note: adminReviewNote, review_message: reviewMessage } })
    }
    throw new Error('Only host and guest accounts can be reviewed.')
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
                host_review_status: true,
                account_status: true,
                admin_review_note: true,
                review_message: true,
                payment_preference: true,
                booking_updates_enabled: true,
                host_messages_enabled: true,
                offers_enabled: true,
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
        const allowedFields = [
            'name',
            'phone_number',
            'payment_preference',
            'booking_updates_enabled',
            'host_messages_enabled',
            'offers_enabled'
        ];
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
        throw error;
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
    getAdminUserDetail,
    reviewAdminUser,
    userProfile,
    updateUser,
    hostProfile,
    updatePref,
    // deleteUserFromDb
}
