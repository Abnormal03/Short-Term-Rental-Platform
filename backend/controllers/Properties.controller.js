const { getAuth } = require('@clerk/express')

const { getAllProperties, getUserProperty, addNewProperty, getunverifiedProperty, deleteUserProperty, deletedProperties, propertyUpdate, approveProp, propertyDetail, propertyByCity, availabilityUpdate, getFeaturedProperties } = require("../services/Properties.service");


const getProperties = async (req, res) => {
    try {
        const { page, limit } = req.query;
        const { properties, count } = await getAllProperties(page, limit);

        return res.status(200).json({ properties: properties, count });
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

const getPropertyDetails = async (req, res) => {
    try {
        const { propertyId } = req.params;

        const propertyDetails = await propertyDetail(propertyId);

        if (!propertyDetails) {
            return res.status(404).json({ message: "Property not found" })
        }

        return res.status(200).json({ propertyDetails: propertyDetails })
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}


const getUserProperties = async (req, res) => {

    const { id } = req.params;
    const { page, limit } = req.query;
    try {
        const { properties, count } = await getUserProperty(id, page, limit);

        return res.status(200).json({ properties: properties, count });
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}


const createProperty = async (req, res) => {

    try {
        const { userId } = req.params;
        const { title, description, city, country, price_per_night, min_stay_duration, max_stay_duration, property_images } = req.body;

        if (!title || !city || !country || !price_per_night || !min_stay_duration || !property_images) {
            return res.status(400).json({ message: "full information not provided!" });
        }

        const data = {
            title, description, city, country, price_per_night, min_stay_duration, max_stay_duration, property_images
        }

        const property = await addNewProperty(data, userId)

        if (property) {
            return res.status(201).json({ property: property })
        }
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

const getUnverifiedProperties = async (req, res) => {
    try {

        const { page, limit } = req.query;
        const { properties, count } = await getunverifiedProperty(page, limit);

        if (properties) {
            return res.status(200).json({ properties: properties, count })
        } else {
            throw new Error('unable to process the request!')
        }
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

const deleteProperty = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = getAuth(req);
        const deletedProperty = await deleteUserProperty(userId, id)

        if (deleteProperty) {
            return res.status(200).json({ deletedProperty: deletedProperty })
        }
        return res.status(500).json({ message: "Unable to delete property" })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error.message })
    }
}

const getDeletedProperties = async (req, res) => {
    try {
        const { page, limit } = req.query;
        const { properties, count } = await deletedProperties(page, limit);

        if (properties && count > 0) {
            const count = properties.length;
            return res.status(200).json({ deletedProperties: properties, count })
        }
        return res.status(400).json({ message: "No Deleted properties." })
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

const updateProperty = async (req, res) => {
    try {
        const { userId } = getAuth(req);
        const { propertyId } = req.params;
        const { title, description, city, country, price_per_night, min_stay_duration, max_stay_duration, property_images } = req.body;

        const property = {
            title, description, city, country, price_per_night, min_stay_duration, max_stay_duration, property_images
        };

        const updatedProperty = await propertyUpdate(propertyId, userId, property)

        if (!updatedProperty) {
            return res.status(400).json({ message: 'Failed to update property.' })
        }

        return res.status(200).json({ updatedProperty: updatedProperty })
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

// approve or reject property....
const approveProperty = async (req, res) => {
    try {
        const { propertyId } = req.params;
        const { approved } = req.body;

        const approvedProperty = await approveProp(propertyId, approved);

        if (!approvedProperty) {
            return res.status(400).json({ message: 'Failed to updated Property.' });
        }

        return res.status(200).json({ approvedProperty: approvedProperty })
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}


const getPropertiesByCity = async (req, res) => {
    try {
        const { city } = req.params;
        const { page, limit } = req.query;

        const { properties, count } = await propertyByCity(city, page, limit);

        if (!properties) {
            return res.status(400).json({ message: 'Failed to fetch properties.' });
        }
        return res.status(200).json({ properties: properties, count })
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}


const updateAvailability = async (req, res) => {
    try {
        const { propertyId } = req.params;
        const { available } = req.body;
        const { userId } = getAuth(req);

        const updatedProperty = await availabilityUpdate(propertyId, userId, available)

        if (!updatedProperty) {
            return res.status(400).json({ message: 'Failed to update property availability.' })
        }

        return res.status(200).json({ updatedProperty: updatedProperty })
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}


const featuredProperties = async (req, res) => {
    try {
        const { limit } = req.body;
        const featured = await getFeaturedProperties(limit);

        if (!featured) {
            return res.status(400).json({ message: 'Failed to load featured properties.' })
        }
        return res.status(200).json({ featuredProperties: featured })
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

module.exports = {
    getProperties,
    getUserProperties,
    createProperty,
    getUnverifiedProperties,
    deleteProperty,
    getDeletedProperties,
    updateProperty,
    approveProperty,
    getPropertyDetails,
    getPropertiesByCity,
    updateAvailability,
    featuredProperties
}