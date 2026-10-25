import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@clerk/clerk-react'
import { profileServices } from '../services/profileServices'

export function useProfile({ enabled = true } = {}) {
    const { getToken, isLoaded, isSignedIn } = useAuth()
    return useQuery({
        queryKey: ['profile'],
        enabled: enabled && isLoaded && isSignedIn,
        queryFn: async () => {
            const token = await getToken()
            const res = await profileServices.getProfile({
                headers: token ? { Authorization: `Bearer ${token}` } : undefined,
            })
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

