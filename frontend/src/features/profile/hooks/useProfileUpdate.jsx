import { useMutation } from '@tanstack/react-query'
import { profileServices } from '../services/profileServices'

const useProfileUpdate = () => {
    return useMutation({
        mutationFn: async ({ phoneNumber, role }) => {
            const res = await profileServices.updateRole(phoneNumber, role);
            return res.data;
        }
    })
}

export default useProfileUpdate
