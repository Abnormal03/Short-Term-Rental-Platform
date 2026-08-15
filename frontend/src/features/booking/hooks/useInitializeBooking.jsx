import { useMutation } from "@tanstack/react-query";
import { bookingServices } from "../services/bookingServices";

const useInitializeBooking = () => {
    return useMutation({
        mutationFn: async ({ booking, paymentDetails, propertyId }) => {
            const res = await bookingServices.initializeBooking(booking, paymentDetails, propertyId);
            return res.data; // Retaining your select logic
        },
    });
};

export default useInitializeBooking;