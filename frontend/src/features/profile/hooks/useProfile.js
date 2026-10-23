import { useQuery } from '@tanstack/react-query'
import { profileServices } from '../services/profileServices'

export function useProfile() {
    return useQuery({
        queryKey: ['profile'],
        queryFn: async () => {
            const res = await profileServices.getProfile()
            return res.data
        },
    })
}

export function useMyTrips() {
    return useQuery({
        queryKey: ['my-trips'],
        queryFn: async () => {
            const res = await profileServices.getMyTrips()
            return res.data.bookings
        },
    })
}

// Saved homes are not persisted by the current backend yet.
export function useSavedHomes() {
    return useQuery({
        queryKey: ['saved-homes'],
        queryFn: async () => [],
    })
}

