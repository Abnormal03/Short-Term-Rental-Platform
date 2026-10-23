const prisma = require('../config/db');


const validatePagination = (page, limit, maxLimit = 100) => {
    if (!page || page < 1) {
        throw new Error('Page must be a positive integer');
    }
    if (!limit || limit < 1 || limit > maxLimit) {
        throw new Error(`Limit must be between 1 and ${maxLimit}`);
    }
};


const getAllProperties = async (page, limit) => {
    try {
        validatePagination(page, limit);
        const skip = (page - 1) * limit;
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
                    }
                },
                propertyImages: {
                    select: {
                        property_id: true,
                        image_url: true
                    }
                }
            },
            skip: skip,
            take: limit
        });

        const count = await prisma.property.count({
            where: {
                AND: {
                    verification_status: "APPROVED",
                    deleted_at: null
                }

            }
        })

        if (!properties) {
            throw new Error('unable to get products')
        }

        return { properties, count };
    } catch (error) {
        console.log(error.message);
        throw new Error(error.message || 'unable to get products')
    }
}

const getUserProperty = async (id, page, limit) => {
    try {
        validatePagination(page, limit)
        const host = await prisma.user.findUnique({ where: { Clerk_id: id }, select: { user_id: true } });
        if (!host) throw new Error('Host account not found.');
        const skip = (page - 1) * limit;
        const properties = await prisma.property.findMany({
            where: {
                AND: {
                    host_id: host.user_id,
                    deleted_at: null
                }
            },
            include: { availabilities: true, propertyImages: true },
            skip: skip,
            take: limit
        })

        const count = await prisma.property.count({
            where: {
                AND: {
                    host_id: host.user_id,
                    deleted_at: null
                }
            }
        })
        if (!properties) {
            throw new Error('unable to get products')
        }

        return { properties, count };
    } catch (error) {
        console.log(error.message);
        throw new Error(error.message || 'unable to get products');
    }
}

const addNewProperty = async (property, userId) => {
    const images = Array.isArray(property.property_images) ? property.property_images : [];
    const imageData = images.map(image => ({
            image_url: image
        }));

    try {
        const host = await prisma.user.findUnique({ where: { Clerk_id: userId }, select: { user_id: true } });
        if (!host) throw new Error('Host account not found.');
        const NewProperty = await prisma.property.create({
            data: {
                title: property.title,
                description: property.description,
                city: property.city,
                country: property.country,
                price_per_night: property.price_per_night,
                min_stay_duration: property.min_stay_duration,
                max_stay_duration: property.max_stay_duration,
                host_id: host.user_id,
                ...(imageData.length > 0 && { propertyImages: { createMany: { data: imageData } } }),
                amenities: Array.isArray(property.amenities) ? property.amenities : [],
                availabilities: {
                    create: {
                        available_from: new Date(property.availability.available_from),
                        available_to: new Date(property.availability.available_to)
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


const getunverifiedProperty = async (page, limit) => {
    try {
        validatePagination(page, limit);
        const skip = (page - 1) * limit;
        const properties = await prisma.property.findMany({
            where: {
                verification_status: "PENDING",
                deleted_at: null
            },
            include: {
                host: { select: { name: true, email: true } },
                propertyImages: { select: { image_id: true, image_url: true } },
                availabilities: true,
            },
            skip: skip,
            take: limit
        })

        const count = await prisma.property.count({
            where: {
                verification_status: "PENDING",
                deleted_at: null
            }
        })

        if (!properties) {
            throw new Error('unable to get products')
        }

        return { properties, count };
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
            const bookings = await tx.booking.findMany({
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
            for (const booking of bookings) {
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


const deletedProperties = async (page, limit) => {
    try {
        validatePagination(page, limit);
        const skip = (page - 1) * limit;
        const properties = await prisma.property.findMany({
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
            },
            skip,
            take: limit
        })

        const count = await prisma.property.count({
            where: {
                deleted_at: {
                    not: null
                }
            }
        })

        if (properties) {
            return { properties, count }
        }
        return { properties: null, count };
    } catch (error) {
        console.log(error.message);
        throw new Error(error.message || 'Failed to fetch deleted properties.');
    }
}


const propertyUpdate = async (propertyId, clerkId, property) => {
    const imageData = (Array.isArray(property.property_images) ? property.property_images : [])
        .map((image) => ({ image_url: image }));
    try {
        return await prisma.$transaction(async (tx) => {
            // get the user...
            const user = await tx.user.findFirst({
                where: {
                    Clerk_id: clerkId
                }
            })
            if (!user) throw new Error('Host account not found.');

            const formerProperty = await tx.property.findFirst({
                where: {
                    property_id: propertyId,
                    host_id: user.user_id,
                    deleted_at: null,
                },
                include: {
                    propertyImages: {
                        select: {
                            image_id: true
                        }
                    }
                }
            })
            if (!formerProperty) return null

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
                    verification_status: 'PENDING',
                    amenities: Array.isArray(property.amenities) ? property.amenities : [],
                    host_id: user.user_id,
                    propertyImages: {
                        deleteMany: {},
                        ...(imageData.length > 0 && { createMany: { data: imageData } })
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

const propertyDetail = async (propertyId, includeHostContact = false) => {
    try {
        const property = await prisma.property.findFirst({
            where: {
                property_id: propertyId,
                verification_status: "APPROVED",
                deleted_at: null
            },
            include: {
                availabilities: {
                    select: {
                        available_from: true,
                        available_to: true
                    }
                },
                host: {
                    select: {
                        name: true,
                        is_verified_host: true,
                        ...(includeHostContact && { email: true, phone_number: true }),
                    }
                },
                propertyImages: {
                    select: {
                        property_id: true,
                        image_url: true,
                        image_id: true
                    }
                },
                _count: {
                    select: {
                        propertyImages: true
                    }
                }
            }
        })
        return property;
    } catch (error) {
        console.log(error.message);
        throw new Error(error.message || "Failed to get property details.");
    }
}

const propertyByCity = async (city, page, limit) => {
    try {
        validatePagination(page, limit);
        const skip = (page - 1) * limit;
        const properties = await prisma.property.findMany({
            where: {
                city: {
                    equals: city,
                    mode: 'insensitive'
                },
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
                        is_verified_host: true
                    }
                },
                propertyImages: true
            },
            skip,
            take: limit
        })

        const count = await prisma.property.count({
            where: {
                city: {
                    equals: city,
                    mode: 'insensitive'
                },
                AND: {
                    verification_status: "APPROVED",
                    deleted_at: null
                }
            }
        })
        return { properties, count };
    } catch (error) {
        console.log(error.message);
        throw new Error(error.message || "Failed to get properties by city.");
    }
}

const availabilityUpdate = async (propertyId, userId, availability) => {
    try {
        const host = await prisma.user.findUnique({ where: { Clerk_id: userId }, select: { user_id: true } });
        if (!host) throw new Error('Host account not found.');
        const from = new Date(availability?.available_from);
        const to = new Date(availability?.available_to);
        if (!Number.isFinite(from.getTime()) || !Number.isFinite(to.getTime()) || from >= to) {
            throw new Error('Availability dates are invalid.');
        }
        const updatedProperty = await prisma.$transaction(async (tx) => {
            //check if the user is the owner of the property...
            const exists = await tx.property.findFirst({
                where: {
                    property_id: propertyId,
                    host_id: host.user_id,
                    deleted_at: null,
                }
            })

            if (!exists) {
                const error = new Error('Property not found or you are not the owner of the property.')
                error.status = 404
                throw error
            }

            const updatedProperty = await tx.property.update({
                where: { property_id: propertyId },
                data: {
                    availabilities: {
                        upsert: {
                            update: { available_from: from, available_to: to },
                            create: { available_from: from, available_to: to }
                        }
                    }
                }
            })

            return updatedProperty;
        })

        return updatedProperty;
    } catch (error) {
        console.log(error.message);
        throw new Error(error.message || "Unable to update Property.")
    }
}


const getFeaturedProperties = async (limit) => {
    try {
        const featuredProperties = await prisma.property.findMany({
            where: { verification_status: 'APPROVED', deleted_at: null },
            orderBy: {
                bookings: {
                    _count: 'desc',
                },
            },
            take: Math.min(Math.max(Number(limit) || 5, 1), 20),
            include: {
                _count: {
                    select: { bookings: true },
                },
                propertyImages: {
                    select: {
                        image_url: true
                    }
                }
            },
        })

        return featuredProperties;
    } catch (error) {
        console.log(error.message);
        throw new Error(error.message || "Unable to load featured properties.");
    }
}


module.exports = {
    getAllProperties,
    getUserProperty,
    addNewProperty,
    getunverifiedProperty,
    deleteUserProperty,
    deletedProperties,
    propertyUpdate,
    approveProp,
    propertyDetail,
    propertyByCity,
    availabilityUpdate,
    getFeaturedProperties
};
