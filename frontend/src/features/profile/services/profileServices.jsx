import api from "../../../lib/axios"

export const profileServices = {
    updateRole: async (phoneNumber, role) => {
        return api.put('/users/user/update-user', {
            phoneNumber,
            role
        })
    },
    getProfile: (config) =>
        api.get('/users/profile', config),

    updateProfile: (data, config) =>
        api.put('/users/profile/update', data, config),

    updateLanguage: (language, config) =>
        api.put('/users/user/update-language', { language }, config),

    getMyTrips: () =>
        api.get('/bookings/my-bookings'),
}
