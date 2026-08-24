import api from "../../../lib/axios"

export const profileServices = {
    updateProfile: async (phoneNumber, role) => {
        return api.put('/users/user/update-user', {
            phoneNumber,
            role
        })
    }
}