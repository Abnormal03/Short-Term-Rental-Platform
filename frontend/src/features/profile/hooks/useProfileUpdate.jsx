import { useMutation } from '@tanstack/react-query'
import React from 'react'
import { profileServices } from '../services/profileServices'

const useProfileUpdate = () => {
    return useMutation({
        mutationFn: async ({ phoneNumber, role }) => {
            const res = await profileServices.updateProfile(phoneNumber, role);
            return res.data;
        }
    })
}

export default useProfileUpdate