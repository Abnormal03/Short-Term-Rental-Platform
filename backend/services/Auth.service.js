const prisma = require('../config/db');

const createUser = async (user) => {
    try {
        const email = user.email_addresses?.find((address) => address.id === user.primary_email_address_id)?.email_address
            || user.email_addresses?.find((address) => address.verification?.status === 'verified')?.email_address;
        if (!user.id || !email) throw new Error('Clerk user is missing an ID or email address.');
        const name = [user.first_name, user.last_name].filter(Boolean).join(' ') || 'Unknown';

        await prisma.user.upsert({
            where: {
                Clerk_id: user.id
            },
            update: {
                name,
                email,
                phone_number: user.phone_numbers?.[0]?.phone_number,
            },
            create: {
                Clerk_id: user.id,
                name,
                email,
                phone_number: user.phone_numbers?.[0]?.phone_number || null,
                Role: "GUEST"
            },
        })
        console.log('user successfully created.')

    } catch (error) {
        console.log(error)
        throw new Error('Unable to create a user.')
    }
}


const deleteUser = async (clerkId) => {
    try {
        const deleted = await prisma.user.delete({
            where: {
                Clerk_id: clerkId
            }
        })
        if (!deleted) {
            throw new Error('unable to delete user.');
        }

        console.log('user deleted successully!')
    } catch (error) {
        console.log(error);
        throw new Error('unable to delete user.');
    }
}

const getMe = async (clerkId) => {
    try {
        const me = await prisma.user.findUnique({
            where: {
                Clerk_id: clerkId
            },
            select: {
                Role: true,
                phone_number: true
            }
        })

        return me;
    } catch (error) {
        console.log("Get Me Service Error: ", error.message);
        throw new Error('unable to get me.');
    }
}

module.exports = { createUser, deleteUser, getMe }
