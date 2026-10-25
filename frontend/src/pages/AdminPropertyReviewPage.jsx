import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertTriangle, Check, House, Search, X } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import PageShell from '../components/layout/PageShell'
import { Spinner } from '../components/UI/Spinner'
import { propertyService } from '../features/properties/services/propertyService'
import RetryButton from '../components/UI/RetryButton'

const tabs = [
    { value: 'PENDING', label: 'Pending' },
    { value: 'APPROVED', label: 'Approved' },
    { value: 'REJECTED', label: 'Rejected' },
]

const dateLabel = (value) => value ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(value)) : 'Date unavailable'

export default function AdminPropertyReviewPage() {
    const queryClient = useQueryClient()
    const [params, setParams] = useSearchParams()
    const [page, setPage] = useState(1)
    const [searchDraft, setSearchDraft] = useState(params.get('search') || '')
    const status = params.get('status') || 'PENDING'
    const city = params.get('city') || ''
    const sort = params.get('sort') || 'newest'
    const search = params.get('search') || ''
    const filters = { page, limit: 20, status, city, search, sort }
    const { data, isLoading, isError, refetch, isFetching } = useQuery({
        queryKey: ['admin', 'properties', filters],
        queryFn: async () => (await propertyService.getAdminProperties(filters)).data,
    })
    const review = useMutation({
        mutationFn: ({ propertyId, approved, message }) => propertyService.reviewProperty(propertyId, approved, null, message),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['admin', 'properties'] })
            await queryClient.invalidateQueries({ queryKey: ['properties', 'pending-review'] })
            await queryClient.invalidateQueries({ queryKey: ['admin', 'pending-properties-count'] })
        },
    })
    const properties = data?.properties || []
    const totalPages = Math.max(1, Math.ceil((data?.count || 0) / 20))
    const updateFilter = (key, value) => {
        const next = new URLSearchParams(params)
        if (value) next.set(key, value)
        else next.delete(key)
        setParams(next)
        setPage(1)
    }

    return <PageShell>
        <section className="mx-auto w-full max-w-[1500px] px-5 py-6 sm:px-7 lg:px-8" aria-labelledby="review-title">
            <header><h1 id="review-title" className="text-3xl font-bold tracking-tight text-text">Property review</h1><p className="mt-1 text-sm text-text-2">Approve properties to make them visible in public browsing and property details.</p></header>
            <div className="mt-4 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-950"><AlertTriangle size={17} className="mt-0.5 shrink-0 text-amber-700" /><p className="text-xs leading-5"><span className="font-semibold">Open Review details</span> to check photos, host and availability before you approve or reject.</p></div>

            <nav aria-label="Property status filters" className="mt-4 flex flex-wrap gap-2">{tabs.map((tab) => <button key={tab.value} type="button" onClick={() => updateFilter('status', tab.value)} className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${status === tab.value ? 'border-primary bg-primary text-button-text' : 'border-border bg-bg text-text hover:bg-bg-2'}`}>{tab.label} ({data?.statusCounts?.[tab.value] ?? '—'})</button>)}</nav>

            <form onSubmit={(event) => { event.preventDefault(); updateFilter('search', searchDraft.trim()) }} className="mt-4 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto_auto]">
                <label className="flex min-h-10 min-w-0 items-center gap-2 rounded-lg border border-border bg-bg px-3 text-text-2"><Search size={15} /><input value={searchDraft} onChange={(event) => setSearchDraft(event.target.value)} placeholder="Search by title, city or host" aria-label="Search listings" className="min-w-0 flex-1 bg-transparent text-xs text-text outline-none placeholder:text-text-2/70" /></label>
                <select value={city} onChange={(event) => updateFilter('city', event.target.value)} aria-label="Filter by city" className="min-h-10 rounded-lg border border-border bg-bg px-3 text-xs text-text"><option value="">All cities</option>{(data?.cities || []).map((option) => <option key={option} value={option}>{option}</option>)}</select>
                <select value={sort} onChange={(event) => updateFilter('sort', event.target.value)} aria-label="Sort listings" className="min-h-10 rounded-lg border border-border bg-bg px-3 text-xs text-text"><option value="newest">Sort: Newest</option><option value="oldest">Sort: Oldest</option></select>
            </form>

            {isLoading && <div className="flex justify-center py-16"><Spinner size="lg" /></div>}
            {isError && <div className="mt-6 flex items-center gap-3 rounded-xl border border-border bg-bg p-4"><p role="alert" className="text-sm text-danger">Could not load properties.</p><RetryButton onRetry={refetch} isRetrying={isFetching} /></div>}
            {review.isError && <div className="mt-4 flex items-center gap-3 rounded-xl border border-danger/20 bg-danger/5 p-3"><p role="alert" className="text-sm text-danger">Could not update this property.</p><RetryButton onRetry={() => review.variables && review.mutate(review.variables)} isRetrying={review.isPending} /></div>}
            {!isLoading && !isError && properties.length === 0 && <div className="mt-5 rounded-2xl border border-border bg-bg p-8 text-center text-sm text-text-2">No {status.toLowerCase()} listings match these filters.</div>}

            {!isLoading && !isError && <div className="mt-4 grid gap-3">{properties.map((property) => <article key={property.property_id} className="flex flex-col gap-3 rounded-2xl border border-border bg-bg p-2 sm:flex-row sm:items-center sm:p-2.5">
                {property.propertyImages?.[0]?.image_url ? <img src={property.propertyImages[0].image_url} alt={property.title} className="h-40 w-full shrink-0 rounded-xl object-cover sm:h-[132px] sm:w-[154px]" /> : <div className="grid h-40 w-full shrink-0 place-items-center rounded-xl bg-bg-2 text-primary sm:h-[132px] sm:w-[154px]"><House size={34} /></div>}
                <div className="flex min-w-0 flex-1 flex-col gap-1 px-1 pb-1 sm:px-0">
                    <div className="flex flex-wrap items-start justify-between gap-2"><div className="min-w-0"><h2 className="truncate text-base font-bold text-text">{property.title}</h2><p className="mt-0.5 text-xs text-text-2">{property.city}, {property.country} · Host: {property.host?.name || property.host?.email || 'Unknown'} · Submitted {dateLabel(property.create_at)}</p></div><span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-800">{status === 'REJECTED' ? 'Needs changes' : status === 'PENDING' ? 'Pending review' : 'Approved'}</span></div>
                    <p className="line-clamp-1 text-xs text-text-2">{property.description}</p><p className="text-sm font-bold text-primary">ETB {Number(property.price_per_night).toLocaleString()} <span className="font-normal text-text-2">/ night</span></p>
                    <div className="mt-1 flex flex-wrap gap-2"><Link to={`/admin/properties/${property.property_id}`} className="rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-button-text">Review details</Link>{status === 'PENDING' && <><button type="button" disabled={review.isPending} onClick={() => review.mutate({ propertyId: property.property_id, approved: true })} className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-3.5 py-2 text-xs font-semibold text-primary disabled:opacity-50"><Check size={14} /> Approve</button><button type="button" disabled={review.isPending} onClick={() => { const message = window.prompt('Message to the host is required to reject this listing.'); if (message?.trim()) review.mutate({ propertyId: property.property_id, approved: false, message: message.trim() }) }} className="inline-flex items-center gap-1 rounded-lg border border-danger/20 px-3.5 py-2 text-xs font-semibold text-danger disabled:opacity-50"><X size={14} /> Reject</button></>}</div>
                </div>
            </article>)}</div>}
            {!isLoading && data?.count > 20 && <nav aria-label="Review queue pages" className="mt-6 flex items-center justify-center gap-4"><button type="button" disabled={page <= 1} onClick={() => setPage((current) => current - 1)} className="rounded-lg border border-border px-4 py-2 text-sm text-text disabled:opacity-50">Previous</button><span className="text-sm text-text-2">Page {page} of {totalPages}</span><button type="button" disabled={page >= totalPages} onClick={() => setPage((current) => current + 1)} className="rounded-lg border border-border px-4 py-2 text-sm text-text disabled:opacity-50">Next</button></nav>}
        </section>


    </PageShell>
}
