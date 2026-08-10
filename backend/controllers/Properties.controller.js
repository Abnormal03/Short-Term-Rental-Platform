const { getAuth } = require('@clerk/express')

const {
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
} = require("../services/Properties.service");


const getProperties = async (req, res) => {
    try {
        const { page, limit } = req.query;
        const { properties, count } = await getAllProperties(Number(page), Number(limit));

        return res.status(200).json({ success: true, properties, count });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

const getPropertyDetails = async (req, res) => {
    try {
        const { id } = req.params;

        const property = await propertyDetail(id);

        if (!property) {
            return res.status(404).json({ success: false, message: "Property not found." });
        }

        return res.status(200).json({ success: true, property });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}


const getUserProperties = async (req, res) => {
    const { id } = req.params;
    const { page, limit } = req.query;
    try {
        const { properties, count } = await getUserProperty(id, Number(page), Number(limit));

        return res.status(200).json({ success: true, properties, count });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}


const createProperty = async (req, res) => {
    try {
        const { userId } = req.params;
        const { title, description, city, country, price_per_night, min_stay_duration, max_stay_duration, property_images, amenities } = req.body;

        if (!title || !city || !country || !price_per_night || !min_stay_duration || !property_images) {
            return res.status(400).json({ success: false, message: "Full information not provided." });
        }

        const data = {
            title, description, city, country, price_per_night, min_stay_duration, max_stay_duration, property_images, amenities
        }

        const property = await addNewProperty(data, userId);

        return res.status(201).json({ success: true, property });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

const getUnverifiedProperties = async (req, res) => {
    try {
        const { page, limit } = req.query;
        const { properties, count } = await getunverifiedProperty(page, limit);

        return res.status(200).json({ success: true, properties, count });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

const deleteProperty = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = getAuth(req);
        const deletedProperty = await deleteUserProperty(userId, id);

        // BUG FIX: was `if (deleteProperty)` — always truthy (function ref), so success branch never ran
        if (deletedProperty) {
            return res.status(200).json({ success: true, deletedProperty });
        }
        return res.status(500).json({ success: false, message: "Unable to delete property." });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: error.message });
    }
}

const getDeletedProperties = async (req, res) => {
    try {
        const { page, limit } = req.query;
        // BUG FIX: was re-declaring `count` with properties.length, shadowing the real DB count
        const { properties, count } = await deletedProperties(page, limit);

        if (properties && count > 0) {
            return res.status(200).json({ success: true, deletedProperties: properties, count });
        }
        return res.status(400).json({ success: false, message: "No deleted properties found." });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
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

        const updatedProperty = await propertyUpdate(propertyId, userId, property);

        if (!updatedProperty) {
            return res.status(400).json({ success: false, message: 'Failed to update property.' });
        }

        return res.status(200).json({ success: true, updatedProperty });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

const approveProperty = async (req, res) => {
    try {
        const { propertyId } = req.params;
        const { approved } = req.body;

        const approvedProperty = await approveProp(propertyId, approved);

        if (!approvedProperty) {
            return res.status(400).json({ success: false, message: 'Failed to update property.' });
        }

        return res.status(200).json({ success: true, approvedProperty });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}


const getPropertiesByCity = async (req, res) => {
    try {
        const { city } = req.params;
        const { page, limit } = req.query;

        const { properties, count } = await propertyByCity(city, page, limit);

        if (!properties) {
            return res.status(400).json({ success: false, message: 'Failed to fetch properties.' });
        }
        return res.status(200).json({ success: true, properties, count });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}


const updateAvailability = async (req, res) => {
    try {
        const { propertyId } = req.params;
        const { availability } = req.body;
        const { userId } = getAuth(req);

        const updatedProperty = await availabilityUpdate(propertyId, userId, availability);

        if (!updatedProperty) {
            return res.status(400).json({ success: false, message: 'Failed to update property availability.' });
        }

        return res.status(200).json({ success: true, updatedProperty });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}


const featuredProperties = async (req, res) => {
    try {
        const { limit } = req.query;
        const featuredPropertiesList = await getFeaturedProperties(Number(limit) || 5);

        if (!featuredPropertiesList) {
            return res.status(400).json({ success: false, message: 'Failed to load featured properties.' });
        }
        return res.status(200).json({ success: true, featuredProperties: featuredPropertiesList });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
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