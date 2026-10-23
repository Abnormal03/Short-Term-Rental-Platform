import api from '../../lib/axios'

export const adminService = {
    getUsers: (page = 1, limit = 50) => api.get('/users/all', { params: { page, limit } }),
    verifyHost: (hostId, verified) => api.put('/users/verify-host', { hostId, verified }),
    getDisputes: (page = 1, limit = 50) => api.get('/disputes/all', { params: { page, limit } }),
    resolveDispute: (disputeId, resolution, action) => api.put(`/disputes/${disputeId}/resolve`, { resolution, action }),
}
