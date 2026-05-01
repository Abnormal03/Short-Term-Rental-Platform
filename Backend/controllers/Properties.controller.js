const { getAuth } = require('@clerk/express')

const { getAllProperties, getUserProperty, addNewProperty, getunverifiedProperty, deleteUserProperty, deletedProperties, propertyUpdate, approveProp } = require("../services/Properties.service");


const getProperties = async (req, res) => {
    try {
        const properties = await getAllProperties();

        return res.status(200).json({ properties: properties });
    } catch (error) {

        return res.status(500).json({ message: error.message })
    }
}


const getUserProperties = async (req, res) => {

    const { id } = req.params;
    try {
        const properties = await getUserProperty(id);

        return res.status(200).json({ properties: properties });
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
        const properties = await getunverifiedProperty();

        if (properties) {
            return res.status(200).json({ properties: properties })
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
        const properties = await deletedProperties();

        if (properties) {
            return res.status(200).json({ deletedProperties: properties })
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
module.exports = { getProperties, getUserProperties, createProperty, getUnverifiedProperties, deleteProperty, getDeletedProperties, updateProperty, approveProperty }