import { useQuery } from '@tanstack/react-query'
import { propertyService } from '../services/propertyService'

export function useMyProperties() {
    return useQuery({
        queryKey: ['properties', 'mine'],
        queryFn: async () => {
            const response = await propertyService.getMyProperties()
            return response.data.properties
        },
    })
}
