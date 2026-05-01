const prisma = require('../config/db');
const getAllProperties = async () => {
    try {
        //get all verified and active/not deleted hosts properties...
        const properties = await prisma.property.findMany({
            where: {
                AND: {
                    verification_status: "APPROVED",
                    deleted_at: null
                }

            },
            include: {
                availabilities: true,
                host: {
                    select: {
                        name: true,
                        email: true,
                    }
                },
                propertyImages: true
            }
        });

        if (!properties) {
            throw new Error('unable to get products')
        }

        return properties;
    } catch (error) {
        console.log(error.message);
        throw new Error(error.message || 'unable to get products')
    }
}

const getUserProperty = async (id) => {
    try {

        const properties = await prisma.property.findMany({
            where: {
                AND: {
                    host_id: id,
                    deleted_at: null
                }
            }
        })
        if (!properties) {
            throw new Error('unable to get products')
        }

        return properties;
    } catch (error) {
        console.log(error.message);
        throw new Error(error.message || 'unable to get products');
    }
}

const addNewProperty = async (property, userId) => {

    if (property.property_images.length >= 1) {
        property.property_images = property.property_images.map(image => ({
            image_url: image
        }))
    }

    try {
        const NewProperty = await prisma.property.create({
            data: {
                title: property.title,
                description: property.description,
                city: property.city,
                country: property.country,
                price_per_night: property.price_per_night,
                min_stay_duration: property.min_stay_duration,
                max_stay_duration: property.max_stay_duration,
                host_id: userId,
                propertyImages: {
                    createMany: {
                        data: property.property_images
                    }
                }
            },
        })

        if (NewProperty) {
            return NewProperty;
        } else {
            throw new Error('something went wrong while creating property!');
        }
    } catch (error) {
        console.log(error.message);
        throw new Error(error.message || 'unable to create Propduct!');
    }
}


const getunverifiedProperty = async () => {
    try {
        const properties = await prisma.property.findMany({
            where: {
                verification_status: "PENDING",
                deleted_at: null
            }
        })

        if (!properties) {
            throw new Error('unable to get products')
        }

        return properties;
    } catch (error) {
        console.log(error.message);
        throw new Error(error.message || 'unable to create Propduct!');
    }
}

const deleteUserProperty = async (hostId, id) => {
    try {
        //verify is the user is the owner of the property...
        const exists = await prisma.property.findFirst({
            where: {
                property_id: id,
                host: {
                    Clerk_id: hostId
                }
            }
        })

        if (!exists) {
            return null;
        }
        //using transaction to complete the task...
        return prisma.$transaction(async (tx) => {

            //get all bookings that needs a refund...
            const bookings = tx.booking.findMany({
                where: {
                    property_id: id,
                    booking_status: "CONFIRMED",
                    payment: {
                        payment_status: 'COMPLETED'
                    }
                },
                include: {
                    payment: true
                }
            })

            //create refund for each successful payments...
            for (const booking in bookings) {
                if (booking.payment) {
                    await tx.refund.create({
                        data: {
                            payment_id: booking.payment.payment_id,
                            amount: booking.total_price,
                            reason: "HOST deleted property!",
                        }
                    })
                }
            }

            //update bookings to 'CANCELED'
            await tx.booking.updateMany({
                where: {
                    property_id: id,
                    booking_status: 'CONFIRMED'
                },
                data: {
                    booking_status: 'CANCELLED'
                }
            })

            //soft delete the property
            const deletedProperty = await tx.property.update({
                where: {
                    property_id: id
                },
                data: {
                    deleted_at: new Date(),
                }
            })

            return deletedProperty;
        })
    } catch (error) {
        console.log(error.message);
        throw new Error(error.message || 'Failed to deleted property.');
    }
}


const deletedProperties = async () => {
    try {
        const deletedProperties = await prisma.property.findMany({
            where: {
                deleted_at: {
                    not: null
                }
            },
            include: {
                bookings: true,
                availabilities: true,
                host: {
                    select: {
                        name: true,
                    }
                },
                propertyImages: true
            }
        })

        if (deletedProperties) {
            return deletedProperties
        }
        return null;
    } catch (error) {
        console.log(error.message);
        throw new Error(error.message || 'Failed to fetch deleted properties.');
    }
}


const propertyUpdate = async (propertyId, clerkId, property) => {

    if (property.property_images.length >= 1) {
        property.property_images = property.property_images.map(image => ({
            image_url: image
        }))
    }
    try {
        return await prisma.$transaction(async (tx) => {
            // get the user...
            const user = await tx.user.findFirst({
                where: {
                    Clerk_id: clerkId
                }
            })

            const formerProperty = await tx.property.findFirst({
                where: {
                    property_id: propertyId,
                    host_id: user.user_id
                },
                include: {
                    propertyImages: {
                        select: {
                            image_id: true
                        }
                    }
                }
            })

            const updatedProperty = await tx.property.update({
                where: {
                    property_id: propertyId,
                    host_id: user.user_id
                },
                data: {
                    title: property.title,
                    description: property.description,
                    city: property.city,
                    country: property.country,
                    price_per_night: property.price_per_night,
                    min_stay_duration: property.min_stay_duration,
                    max_stay_duration: property.max_stay_duration,
                    host_id: user.user_id,
                    propertyImages: {
                        deleteMany: {},
                        createMany: {
                            data: property.property_images
                        }
                    }
                },
                include: {
                    propertyImages: true
                }
            })
            if (!updatedProperty) {
                throw new Error('Property not found.')
            }

            return updatedProperty;
        })
    } catch (error) {
        console.log(error.message);
        throw new Error(error.message || "Unable to update Property.")
    }
}

const approveProp = async (propertyId, approved) => {
    try {
        const approvedProperty = await prisma.property.update({
            where: {
                property_id: propertyId
            },
            data: {
                verification_status: approved ? "APPROVED" : "REJECTED"
            }
        })

        if (approvedProperty) {
            return approvedProperty;
        }

        throw new Error('Unable to updated property.');
    } catch (error) {
        console.log(error.message);
        throw new Error(error.message || "Failed to update property.");
    }
}


module.exports = { getAllProperties, getUserProperty, addNewProperty, getunverifiedProperty, deleteUserProperty, deletedProperties, propertyUpdate, approveProp };