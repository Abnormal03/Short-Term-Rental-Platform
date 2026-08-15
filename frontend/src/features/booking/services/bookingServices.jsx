import api from '../../../lib/axios'

export const bookingServices = {
    initializeBooking: async (booking, paymentDetail, propertyId) => {
        return api.post(`/bookings/${propertyId}`, {
            booking,
            paymentDetail
        })
    }
}