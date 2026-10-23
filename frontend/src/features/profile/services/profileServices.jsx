import api from "../../../lib/axios"

export const profileServices = {
    updateRole: async (phoneNumber, role) => {
        return api.put('/users/user/update-user', {
            phoneNumber,
            role
        })
    },
    getProfile: () =>
        api.get('/users/profile'),

    updateProfile: (data) =>
        api.put('/users/profile/update', data),

    getMyTrips: () =>
        api.get('/bookings/my-bookings'),
}
