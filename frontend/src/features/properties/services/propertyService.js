import api from '../../../lib/axios'

export const propertyService = {
    getProperties: (page = 1, limit = 12) =>
        api.get('/properties', { params: { page, limit } }),
    getPropertiesByCity: (city, page = 1, limit = 12) =>
        api.get(`/properties/city/${encodeURIComponent(city)}`, { params: { page, limit } }),
    getPendingProperties: (page = 1, limit = 50) =>
        api.get('/properties/notverified', { params: { page, limit } }),
    getAdminProperties: (params = {}) => api.get('/properties/admin/all', { params }),
    getAdminProperty: (id) => api.get(`/properties/admin/${id}`),
    reviewProperty: (id, approved, note, message) =>
        api.put(`/properties/approve/${id}`, { approved, note, message }),
    getMyProperties: (page = 1, limit = 100) =>
        api.get('/properties/mine', { params: { page, limit } }),
    createProperty: (property) => api.post('/properties', property),
    updateProperty: (id, property) => api.put(`/properties/update/${id}`, property),
    updateAvailability: (id, availability) =>
        api.put(`/properties/availability/${id}`, { availability }),
    getPropertyCalendar: (id, from, to) =>
        api.get(`/properties/calendar/${id}`, { params: { from, to } }),
    updatePropertyCalendar: (id, overrides) =>
        api.put(`/properties/calendar/${id}`, { overrides }),
    getFeaturedProperties: async (limit = 4) => {
        return api.get('/properties/featured', {
            params: { limit },
        })
    },
    getPropertyDetails: async (id) => {
        return api.get(`/properties/${id}`);
    }
}
