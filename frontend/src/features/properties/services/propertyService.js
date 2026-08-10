import api from '../../../lib/axios'

export const propertyService = {
    getFeaturedProperties: async (limit = 4) => {
        return api.get('/properties/featured', {
            params: { limit },
        })
    },
    getPropertyDetails: async (id) => {
        return api.get(`/properties/${id}`);
    }
}