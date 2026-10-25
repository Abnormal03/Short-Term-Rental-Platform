import api from '../../lib/axios'

export const adminService = {
    getUsers: (page = 1, limit = 50, filters = {}) => api.get('/users/all', { params: { page, limit, ...filters } }),
    getUser: (userId) => api.get(`/users/admin/${userId}`),
    reviewUser: (userId, decision, note, message) => api.put(`/users/admin/${userId}/review`, { decision, note, message }),
    verifyHost: (hostId, verified) => api.put('/users/verify-host', { hostId, verified }),
    getDisputes: (page = 1, limit = 50, status = 'OPEN') => api.get('/disputes/all', { params: { page, limit, status } }),
    resolveDispute: (disputeId, resolution, action) => api.put(`/disputes/${disputeId}/resolve`, { resolution, action }),
}
