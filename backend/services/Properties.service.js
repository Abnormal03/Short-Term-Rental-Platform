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
                    },
                    availabilities: {
                        upsert: {
                            update: {
                                available_from: new Date(property.availability.available_from),
                                available_to: new Date(property.availability.available_to)
                            },
                            create: {
                                available_from: new Date(property.availability.available_from),
                                available_to: new Date(property.availability.available_to)
                            }
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
                availabilityOverrides: {
                    select: { date: true, is_available: true, price_per_night: true, min_stay_duration: true },
                },
                bookings: {
                    where: {
                        booking_status: { in: ['PENDING', 'CONFIRMED', 'DISPUTED'] },
                        check_out_date: { gte: new Date() },
                    },
                    select: { check_in_date: true, check_out_date: true },
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

const getPropertyCalendar = async (propertyId, clerkId, fromValue, toValue) => {
    const from = new Date(`${fromValue}T00:00:00.000Z`)
    const to = new Date(`${toValue}T00:00:00.000Z`)
    if (!Number.isFinite(from.getTime()) || !Number.isFinite(to.getTime()) || from > to) {
        const error = new Error('A valid calendar date range is required.')
        error.status = 400
        throw error
    }
    const host = await prisma.user.findUnique({ where: { Clerk_id: clerkId }, select: { user_id: true } })
    if (!host) throw new Error('Host account not found.')
    const property = await prisma.property.findFirst({
        where: { property_id: propertyId, host_id: host.user_id, deleted_at: null },
        select: {
            property_id: true,
            title: true,
            price_per_night: true,
            min_stay_duration: true,
            max_stay_duration: true,
            availabilities: { select: { available_from: true, available_to: true } },
            availabilityOverrides: {
                where: { date: { gte: from, lte: to } },
                select: { date: true, is_available: true, price_per_night: true, min_stay_duration: true },
                orderBy: { date: 'asc' },
            },
            bookings: {
                where: {
                    booking_status: { in: ['PENDING', 'CONFIRMED', 'DISPUTED'] },
                    check_in_date: { lte: to },
                    check_out_date: { gte: from },
                },
                select: {
                    booking_id: true,
                    check_in_date: true,
                    check_out_date: true,
                    booking_status: true,
                    user: { select: { name: true } },
                },
            },
        },
    })
    if (!property) {
        const error = new Error('Property not found or you are not the owner.')
        error.status = 404
        throw error
    }
    return property
}

const updatePropertyCalendar = async (propertyId, clerkId, overrides) => {
    if (!Array.isArray(overrides) || overrides.length === 0 || overrides.length > 62) {
        const error = new Error('Select between 1 and 62 calendar dates to update.')
        error.status = 400
        throw error
    }
    const host = await prisma.user.findUnique({ where: { Clerk_id: clerkId }, select: { user_id: true } })
    if (!host) throw new Error('Host account not found.')
    const property = await prisma.property.findFirst({
        where: { property_id: propertyId, host_id: host.user_id, deleted_at: null },
        select: { property_id: true, max_stay_duration: true },
    })
    if (!property) {
        const error = new Error('Property not found or you are not the owner.')
        error.status = 404
        throw error
    }

    const normalizedOverrides = overrides.map((item) => {
        const date = new Date(`${item?.date}T00:00:00.000Z`)
        const hasPrice = item?.price_per_night !== undefined && item?.price_per_night !== null && item?.price_per_night !== ''
        const price = hasPrice ? Number(item.price_per_night) : null
        const hasMinStay = item?.min_stay_duration !== undefined && item?.min_stay_duration !== null && item?.min_stay_duration !== ''
        const minimum = hasMinStay ? Number(item.min_stay_duration) : null
        if (!Number.isFinite(date.getTime()) || typeof item?.is_available !== 'boolean' ||
            (item.is_available && hasPrice && (!Number.isFinite(price) || price <= 0)) ||
            (item.is_available && hasMinStay && (!Number.isInteger(minimum) || minimum < 1 || minimum > property.max_stay_duration))) {
            const error = new Error('Calendar dates, prices, or minimum nights are invalid.')
            error.status = 400
            throw error
        }
        return {
            property_id: propertyId,
            date,
            is_available: item.is_available,
            price_per_night: item.is_available ? price : null,
            min_stay_duration: item.is_available ? minimum : null,
        }
    })

    const activeBookings = await prisma.booking.findMany({
        where: {
            property_id: propertyId,
            booking_status: { in: ['PENDING', 'CONFIRMED', 'DISPUTED'] },
            OR: normalizedOverrides.map((item) => ({
                check_in_date: { lte: item.date },
                check_out_date: { gt: item.date },
            })),
        },
        select: { check_in_date: true, check_out_date: true },
    })
    if (activeBookings.length) {
        const error = new Error('You cannot change availability for dates with an active booking.')
        error.status = 409
        throw error
    }

    return prisma.$transaction(normalizedOverrides.map((item) => prisma.availabilityOverride.upsert({
        where: { property_id_date: { property_id: item.property_id, date: item.date } },
        update: { is_available: item.is_available, price_per_night: item.price_per_night, min_stay_duration: item.min_stay_duration },
        create: item,
    })))
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
    getPropertyCalendar,
    updatePropertyCalendar,
    getFeaturedProperties
};
