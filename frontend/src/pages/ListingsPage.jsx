import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, ArrowRight, House, MapPin, Search } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import PageShell from '../components/layout/PageShell'
import Skeleton from '../components/UI/Skeleton'
import RetryButton from '../components/UI/RetryButton'
import { propertyService } from '../features/properties/services/propertyService'

const PAGE_SIZE = 8
const POPULAR_CITIES = ['Addis Ababa', 'Bahir Dar', 'Lalibela', 'Hawassa', 'Gondar']

export default function ListingsPage() {
    const [searchParams, setSearchParams] = useSearchParams()
    const city = searchParams.get('city') || ''
    const [cityInput, setCityInput] = useState(city)
    const page = Math.max(1, Number(searchParams.get('page')) || 1)
    const { data, isLoading, isError, refetch, isFetching } = useQuery({
        queryKey: ['properties', 'public-list', city, page],
        queryFn: async () => {
            const response = city
                ? await propertyService.getPropertiesByCity(city, page, PAGE_SIZE)
                : await propertyService.getProperties(page, PAGE_SIZE)
            return response.data
        },
    })
    const properties = data?.properties || []
    const count = Number(data?.count || 0)
    const pageCount = Math.max(1, Math.ceil(count / PAGE_SIZE))
    const pageItems = getPageItems(page, pageCount)

    const search = (event) => {
        event.preventDefault()
        const next = new URLSearchParams()
        const value = cityInput.trim()
        if (value) next.set('city', value)
        setSearchParams(next)
    }

    const selectCity = (selectedCity) => {
        setCityInput(selectedCity)
        setSearchParams({ city: selectedCity })
    }

    const changePage = (nextPage) => {
        const next = new URLSearchParams(searchParams)
        if (nextPage > 1) next.set('page', String(nextPage))
        else next.delete('page')
        setSearchParams(next)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    return (
        <PageShell>
            <div className="w-full bg-bg-2 pt-16 text-text">
                <header className="px-5 pb-5 pt-15 sm:px-8 sm:pb-6">
                    <div className="mx-auto max-w-6xl">
                        <form onSubmit={search} className="flex flex-col gap-2 rounded-2xl border border-border bg-bg p-2.5 shadow-[0_8px_24px_rgb(0,0,0,0.08)] sm:flex-row sm:items-center sm:rounded-full sm:pl-4">
                            <label className="flex min-w-0 flex-1 items-center gap-3 px-2 py-1.5">
                                <MapPin size={19} className="shrink-0 text-primary" />
                                <span className="min-w-0 flex-1">
                                    <span className="block text-[0.58rem] font-bold uppercase tracking-[0.12em] text-text-2">City</span>
                                    <input list="property-city-suggestions" value={cityInput} onChange={(event) => setCityInput(event.target.value)} placeholder="Where would you like to stay?" aria-label="Search properties by city" className="mt-0.5 w-full bg-transparent text-sm font-medium outline-none placeholder:text-text-2/70" />
                                </span>
                            </label>
                            <datalist id="property-city-suggestions">{POPULAR_CITIES.map((cityName) => <option key={cityName} value={cityName} />)}</datalist>
                            <button type="submit" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-secondary px-7 text-sm font-bold text-on-secondary transition hover:brightness-105 sm:rounded-full"><Search size={16} className="sm:hidden" />Search</button>
                        </form>
                        <nav aria-label="Filter properties by popular city" className="mt-2.5 flex gap-2 overflow-x-auto pb-1 scrollbar-none [&::-webkit-scrollbar]:hidden">
                            {POPULAR_CITIES.map((cityName) => {
                                const selected = city.trim().toLocaleLowerCase() === cityName.toLocaleLowerCase()
                                return <button key={cityName} type="button" onClick={() => selectCity(cityName)} aria-pressed={selected} className={`shrink-0 rounded-full border px-3.5 py-2 text-xs font-semibold transition ${selected ? 'border-primary bg-primary text-button-text' : 'border-border bg-bg text-text hover:border-primary hover:text-primary'}`}>{cityName}</button>
                            })}
                        </nav>
                    </div>
                </header>

                <section className="mx-auto min-h-[50vh] max-w-7xl px-5 py-8 sm:px-8 sm:py-10" aria-labelledby="listings-title">
                    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                        <div><h2 id="listings-title" className="text-xl font-bold sm:text-2xl">{city ? `Stays in ${city}` : 'Browse all stays'}</h2><p className="mt-1 text-sm text-text-2">{isLoading ? 'Loading listings…' : `${count} ${count === 1 ? 'property' : 'properties'} available`}</p></div>
                        {city && <button type="button" onClick={() => { setCityInput(''); setSearchParams({}) }} className="text-sm font-semibold text-primary hover:underline">Clear city filter</button>}
                    </div>

                    {isLoading && <div role="status" aria-label="Loading properties" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{Array.from({ length: PAGE_SIZE }, (_, index) => <ListingCardSkeleton key={index} />)}</div>}
                    {isError && <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-bg p-5"><p role="alert" className="text-sm text-danger">Could not load listings.</p><RetryButton onRetry={refetch} isRetrying={isFetching} /></div>}
                    {!isLoading && !isError && properties.length === 0 && <div className="rounded-xl border border-border bg-bg px-5 py-14 text-center"><House className="mx-auto text-primary/70" size={34} /><h3 className="mt-3 font-bold">No stays found</h3><p className="mt-1 text-sm text-text-2">Try another city or clear the filter to browse all listings.</p></div>}
                    {!isLoading && !isError && properties.length > 0 && <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{properties.map((property) => <ListingCard key={property.property_id} property={property} />)}</div>}

                    {pageCount > 1 && <nav aria-label="Listings pages" className="mt-8 flex flex-wrap items-center justify-center gap-2">
                        <button type="button" disabled={page <= 1} onClick={() => changePage(page - 1)} className="inline-flex items-center gap-2 rounded-lg border border-border bg-bg px-3 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40"><ArrowLeft size={15} /><span className="hidden sm:inline">Previous</span></button>
                        {pageItems.map((item, index) => item === '…'
                            ? <span key={`ellipsis-${index}`} aria-hidden="true" className="px-1 text-text-2">…</span>
                            : <button key={item} type="button" aria-current={item === page ? 'page' : undefined} onClick={() => changePage(item)} className={`size-9 rounded-lg border text-sm font-semibold ${item === page ? 'border-primary bg-primary text-button-text' : 'border-border bg-bg text-text hover:border-primary hover:text-primary'}`}>{item}</button>)}
                        <button type="button" disabled={page >= pageCount} onClick={() => changePage(page + 1)} className="inline-flex items-center gap-2 rounded-lg border border-border bg-bg px-3 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40"><span className="hidden sm:inline">Next</span><ArrowRight size={15} /></button>
                    </nav>}
                </section>
            </div>
        </PageShell>
    )
}

function ListingCardSkeleton() {
    return <article className="overflow-hidden rounded-xl border border-border bg-bg shadow-sm">
        <Skeleton className="h-48 rounded-none" />
        <div className="space-y-3 p-4"><Skeleton className="h-4 w-4/5" /><Skeleton className="h-3 w-1/2" /><div className="flex items-center justify-between border-t border-border pt-3"><Skeleton className="h-4 w-1/2" /><Skeleton className="h-8 w-20 rounded-lg" /></div></div>
    </article>
}

function getPageItems(currentPage, totalPages) {
    const pages = new Set([1, totalPages, currentPage - 1, currentPage, currentPage + 1])
    const sorted = [...pages].filter((page) => page >= 1 && page <= totalPages).sort((a, b) => a - b)
    return sorted.reduce((items, page, index) => {
        if (index > 0 && page - sorted[index - 1] > 1) items.push('…')
        items.push(page)
        return items
    }, [])
}

function ListingCard({ property }) {
    const image = property.propertyImages?.[0]?.image_url
    return <article className="overflow-hidden rounded-xl border border-border bg-bg shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
        <Link to={`/properties/${property.property_id}`} aria-label={`View ${property.title}`} className="relative block h-48 overflow-hidden bg-bg-2">
            {image ? <img src={image} alt={property.title} className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-primary/50"><House size={34} /></div>}
            <span className="absolute left-3 top-3 rounded-full bg-bg/90 px-2.5 py-1 text-[0.6rem] font-bold text-primary">Verified</span>
        </Link>
        <div className="p-4"><Link to={`/properties/${property.property_id}`} className="line-clamp-1 font-bold text-text hover:text-primary">{property.title}</Link><p className="mt-1 line-clamp-1 text-xs text-text-2">{property.city}, {property.country}</p><div className="mt-4 flex items-center justify-between gap-2 border-t border-border pt-3"><p className="text-sm font-bold">ETB {Number(property.price_per_night).toLocaleString()} <span className="text-xs font-normal text-text-2">/ night</span></p><Link to={`/properties/${property.property_id}`} className="rounded-lg bg-primary/10 px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/20">View stay</Link></div></div>
    </article>
}
