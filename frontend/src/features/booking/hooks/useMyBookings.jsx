// features/bookings/hooks/useMyBookings.js
import { useQuery } from '@tanstack/react-query'
import { bookingServices } from '../services/bookingServices'

export function useMyBookings() {
    return useQuery({
        queryKey: ['my-bookings'],
        queryFn: async () => {
            const res = await bookingServices.getMyBookings()
            return res.data.bookings
        },
    })
}
