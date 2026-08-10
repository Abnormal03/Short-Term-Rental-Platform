import { useQuery } from "@tanstack/react-query"
import { propertyService } from "../services/propertyService"

const usePropertyDetails = (id)=>{
    return useQuery({
        queryKey: ['property', 'details', id],
        queryFn: async ()=>{
            const res = await propertyService.getPropertyDetails(id);
            return res;
        },
        select: (res) => res.data.property
    })
}

export default usePropertyDetails;