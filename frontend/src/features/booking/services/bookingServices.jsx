import api from '../../../lib/axios'

export const bookingServices = {
    initializeBooking: async (booking, paymentDetail, propertyId) => {
        return api.post(`/bookings/${propertyId}`, {
            booking,
            paymentDetail
        })
    },
    getMyBookings: () =>
        api.get('/bookings/my-bookings'),

    getBookingById: (id) =>
        api.get(`/bookings/my-bookings/${id}`),

    confirmBookingPayment: (id, returnStatus) =>
        api.get(`/bookings/my-bookings/${id}/confirmation`, { params: returnStatus ? { return_status: returnStatus } : {} }),

    retryBookingPayment: (id, paymentDetails) =>
        api.post(`/bookings/my-bookings/${id}/payment/retry`, { paymentDetails }),

    cancelBooking: (id) =>
        api.put(`/bookings/cancel/${id}`),
}
