import { useQuery } from '@tanstack/react-query'
import { bookingServices } from '../services/bookingServices'

export function useMyBookingDetails(bookingId) {
    return useQuery({
        queryKey: ['my-booking', bookingId],
        queryFn: async () => {
            const response = await bookingServices.getBookingById(bookingId)
            return response.data.booking
        },
        enabled: Boolean(bookingId),
    })
}
