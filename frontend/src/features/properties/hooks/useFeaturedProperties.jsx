import { useQuery } from '@tanstack/react-query'
import { propertyService } from '../services/propertyService'
const useFeaturedProperties = (limit = 4) => {
    return useQuery({
        queryKey: ['properties', 'featured', limit],
        queryFn: async () => {
            const res = await propertyService.getFeaturedProperties(limit)
            return res
        },
        select: (res) => res.data.featuredProperties,
    })
}

export default useFeaturedProperties