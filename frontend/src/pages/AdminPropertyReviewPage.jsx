import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, House, X } from 'lucide-react'
import PageShell from '../components/layout/PageShell'
import { Spinner } from '../components/UI/Spinner'
import { propertyService } from '../features/properties/services/propertyService'
import RetryButton from '../components/UI/RetryButton'
export default function AdminPropertyReviewPage() {
    const queryClient = useQueryClient()
    const [page, setPage] = useState(1)
    const { data, isLoading, isError, refetch, isFetching } = useQuery({
        queryKey: ['properties', 'pending-review', page],
        queryFn: async () => (await propertyService.getPendingProperties(page, 50)).data,
    })
    const review = useMutation({
        mutationFn: ({ propertyId, approved }) => propertyService.reviewProperty(propertyId, approved),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['properties', 'pending-review'] })
            if (properties.length === 1 && page > 1) setPage((current) => current - 1)
        },
    })
    const properties = data?.properties || []
    const totalPages = Math.max(1, Math.ceil((data?.count || 0) / 50))
    return (
        <PageShell>
            <section className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8" aria-labelledby="review-title">
                <p className="text-sm font-semibold uppercase tracking-wide text-primary">Admin workspace</p>
                <h1 id="review-title" className="mt-1 text-3xl font-bold text-text">Property review</h1>
                <p className="mt-2 text-text-2">Approve properties to make them visible in public browsing and property details.</p>
                {isLoading && <div className="flex justify-center py-16"><Spinner size="lg" /></div>}
                {isError && <div className="mt-8 flex items-center gap-3 rounded-xl border border-border bg-surface p-4"><p role="alert" className="text-danger">Could not load pending properties.</p><RetryButton onRetry={refetch} isRetrying={isFetching} /></div>}
                {review.isError && <div className="mt-4 flex items-center gap-3"><p role="alert" className="text-danger">Could not update this property.</p><RetryButton onRetry={() => review.variables && review.mutate(review.variables)} isRetrying={review.isPending} /></div>}
                {!isLoading && !isError && properties.length === 0 && <div className="mt-8 rounded-2xl border border-border bg-surface p-8 text-center text-text-2">There are no properties awaiting review.</div>}
                <div className="mt-6 grid gap-4">
                    {properties.map((property) => <article key={property.property_id} className="overflow-hidden rounded-2xl border border-border bg-surface md:flex">
                        {property.propertyImages?.[0]?.image_url ? <img src={property.propertyImages[0].image_url} alt={property.title} className="h-52 w-full object-cover md:h-auto md:w-64" /> : <div className="grid h-52 w-full place-items-center bg-bg-2 text-primary md:w-64"><House size={40} /></div>}
                        <div className="flex flex-1 flex-col gap-3 p-5">
                            <div><h2 className="text-xl font-bold text-text">{property.title}</h2><p className="text-sm text-text-2">{property.city}, {property.country} - Host: {property.host?.name || property.host?.email || 'Unknown'}</p></div>
                            <p className="line-clamp-3 text-sm text-text-2">{property.description}</p>
                            <p className="font-semibold text-primary">ETB {Number(property.price_per_night).toLocaleString()} / night</p>
                            <div className="mt-auto flex gap-3">
                                <button type="button" disabled={review.isPending} onClick={() => review.mutate({ propertyId: property.property_id, approved: true })} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-semibold text-button-text disabled:opacity-60"><Check size={17} /> Approve</button>
                                <button type="button" disabled={review.isPending} onClick={() => review.mutate({ propertyId: property.property_id, approved: false })} className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 font-semibold text-text disabled:opacity-60"><X size={17} /> Reject</button>
                            </div>
                        </div>
                    </article>)}
                </div>
                {data?.count > 50 && <nav aria-label="Review queue pages" className="mt-8 flex items-center justify-center gap-4">
                    <button type="button" disabled={page <= 1} onClick={() => setPage((current) => current - 1)} className="rounded-lg border border-border px-4 py-2 text-text disabled:opacity-50">Previous</button>
                    <span className="text-sm text-text-2">Page {page} of {totalPages}</span>
                    <button type="button" disabled={page >= totalPages} onClick={() => setPage((current) => current + 1)} className="rounded-lg border border-border px-4 py-2 text-text disabled:opacity-50">Next</button>
                </nav>}
            </section>
        </PageShell>
    )
}
