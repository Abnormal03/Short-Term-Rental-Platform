import { useState } from 'react'
import { ArrowRight, Compass, CreditCard, Headphones, House, MapPin, Search, ShieldCheck } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import PageShell from '../components/layout/PageShell'
import RetryButton from '../components/UI/RetryButton'
import Skeleton from '../components/UI/Skeleton'
import useFeaturedProperties from '../features/properties/hooks/useFeaturedProperties'

const CITIES = [
    { name: 'Addis Ababa', gradient: 'from-emerald-900 to-emerald-500', image: "../../src/assets/Images/Addis Ababa.avif" },
    { name: 'Bahir Dar', gradient: 'from-sky-900 to-sky-400', image: "../../src/assets/Images/bahir dar.jpg" },
    { name: 'Lalibela', gradient: 'from-amber-900 to-amber-400', image: "../../src/assets/Images/lalibela.jpg" },
    { name: 'Hawassa', gradient: 'from-lime-900 to-lime-500', image: "../../src/assets/Images/hawassa.jpg" },
    { name: 'Gondar', gradient: 'from-orange-900 to-orange-400', image: "../../src/assets/Images/Gonder.jpg" },
]

const GUEST_BENEFITS = [
    { icon: ShieldCheck, title: 'Verified properties', description: 'Listings are reviewed before guests can book.' },
    { icon: CreditCard, title: 'Local payments', description: 'Pay in birr with the options shown at checkout.' },
    { icon: Compass, title: 'A local perspective', description: 'Find your way around with local context.' },
]

export default function ExplorePage() {
    const [city, setCity] = useState('')
    const navigate = useNavigate()
    const { data: properties = [], isLoading, isError, refetch, isFetching } = useFeaturedProperties(4)

    const goToProperties = (nextCity = city) => {
        const query = nextCity.trim() ? `?city=${encodeURIComponent(nextCity.trim())}` : ''
        navigate(`/properties${query}`)
    }

    const handleSearch = (event) => {
        event.preventDefault()
        goToProperties()
    }

    if (isLoading) return <PageShell><ExplorePageSkeleton /></PageShell>

    return (
        <PageShell>
            <div className="w-full bg-bg-2 pt-16 text-text">
                <section className="bg-primary px-5 py-8 text-white sm:px-8 sm:py-10">
                    <div className="mx-auto grid max-w-7xl items-center gap-7 lg:grid-cols-[1fr_0.85fr]">
                        <div>
                            <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-secondary">Verified stays across Ethiopia</p>
                            <h1 className="mt-3 max-w-xl text-balance text-3xl font-bold leading-[1.05] tracking-tight sm:text-4xl lg:text-5xl">Stay like you belong here.</h1>
                            <p className="mt-3 max-w-xl text-sm leading-6 text-white/75">From Addis Ababa apartments to guest houses in Lalibela, find locally hosted homes and pay in birr with Betoch.</p>
                        </div>
                        <div className="relative hidden h-80 overflow-hidden rounded-2xl lg:block" aria-hidden="true">
                            <img src='../../src/assets/Images/Ethiopia.jpg' className='object-center h-full w-full' />
                            <div className="absolute bottom-3 left-3 rounded-full bg-bg/80 px-3 py-1 text-[0.6rem] font-semibold text-text-2">Explore Ethiopia</div>
                        </div>
                    </div>
                    <form onSubmit={handleSearch} className="mx-auto mt-7 grid max-w-7xl gap-3 rounded-2xl bg-bg p-3 text-text shadow-xl sm:grid-cols-[1fr_auto] sm:items-center sm:p-4">
                        <label className="flex min-w-0 items-center gap-3 px-2">
                            <MapPin className="shrink-0 text-primary" size={18} />
                            <span className="min-w-0 flex-1">
                                <span className="block text-[0.58rem] font-bold uppercase tracking-wide text-text-2">Location</span>
                                <input value={city} onChange={(event) => setCity(event.target.value)} placeholder="City or destination" aria-label="Search by city" className="mt-1 w-full bg-transparent text-sm text-text outline-none placeholder:text-text-2/70" />
                            </span>
                        </label>
                        <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-lg bg-secondary px-5 py-3 text-sm font-bold text-on-secondary transition hover:brightness-105"><Search size={16} /> Search stays</button>
                    </form>
                </section>

                <div className="mx-auto max-w-7xl px-5 sm:px-8">
                    <section className="py-9 sm:py-12" aria-labelledby="city-title">
                        <div className="mb-5">
                            <p className="text-[0.6rem] font-bold uppercase tracking-[0.16em] text-primary">Where do you want to wake up?</p>
                            <h2 id="city-title" className="mt-2 text-2xl font-bold tracking-tight text-text">Explore by city</h2>
                        </div>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                            {CITIES.map(({ name, gradient, image }) => <button type="button" key={name} onClick={() => goToProperties(name)} aria-label={`Explore stays in ${name}`} className="group relative h-32 overflow-hidden rounded-xl text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg sm:h-40">
                                {/* Replace this gradient placeholder with the city image when it is ready. */}
                                <img src={image} className='object-fill h-full w-full' />
                                <span className="absolute bottom-3 left-3 rounded-full bg-white/85 px-2 py-1 text-[0.6rem] font-semibold text-slate-800">{name}</span>
                            </button>)}
                        </div>
                    </section>

                    <section className="pb-10 sm:pb-14" aria-labelledby="featured-title">
                        <div className="flex flex-wrap items-end justify-between gap-4">
                            <div><p className="text-[0.6rem] font-bold uppercase tracking-[0.16em] text-primary">Popular, verified stays in Ethiopia</p><h2 id="featured-title" className="mt-2 text-2xl font-bold tracking-tight text-text">Featured stays</h2></div>
                            <Link to="/properties" className="inline-flex items-center gap-2 rounded-lg bg-secondary px-4 py-2.5 text-xs font-bold text-on-secondary transition hover:brightness-105">See all listings <ArrowRight size={14} /></Link>
                        </div>
                        {isError && <div className="mt-5 flex flex-wrap items-center gap-3 rounded-xl border border-border bg-bg p-5"><p role="alert" className="text-sm text-danger">Could not load featured stays.</p><RetryButton onRetry={refetch} isRetrying={isFetching} /></div>}
                        {!isLoading && !isError && properties.length === 0 && <div className="mt-5 rounded-xl border border-border bg-bg p-8 text-center"><House className="mx-auto text-primary" size={30} /><p className="mt-3 text-sm text-text-2">New stays are on their way. Browse all listings to see what is available.</p></div>}
                        {!isLoading && !isError && properties.length > 0 && <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{properties.map((property) => <FeaturedStay key={property.property_id} property={property} />)}</div>}
                    </section>

                    <section className="border-t border-border py-10 sm:py-14" aria-labelledby="steps-title">
                        <h2 id="steps-title" className="text-2xl font-bold text-text">Book in three steps</h2>
                        <div className="mt-6 grid gap-7 sm:grid-cols-3">
                            {[
                                ['Find your stay', 'Search by city and explore places that fit your trip.'],
                                ['Pay in birr', 'Review the booking details and available payment options.'],
                                ['Check in with confidence', 'Keep your stay information and booking details together.'],
                            ].map(([title, copy], index) => <article key={title}><span className="text-3xl font-bold text-secondary">{index + 1}</span><h3 className="mt-2 font-bold text-text">{title}</h3><p className="mt-1 max-w-sm text-xs leading-5 text-text-2">{copy}</p></article>)}
                        </div>
                    </section>
                </div>

                <section className="bg-primary px-5 py-10 text-white sm:px-8 sm:py-14" aria-labelledby="why-title">
                    <div className="mx-auto max-w-7xl">
                        <h2 id="why-title" className="text-center text-2xl font-bold">Why guests choose Betoch</h2>
                        <div className="mt-7 grid gap-3 sm:grid-cols-3">{GUEST_BENEFITS.map(({ icon: Icon, title, description }) => <article key={title} className="rounded-xl border border-white/10 bg-white/8 p-4"><Icon size={18} className="text-secondary" /><h3 className="mt-3 text-sm font-bold">{title}</h3><p className="mt-1 text-xs leading-5 text-white/70">{description}</p></article>)}</div>
                        <div className="mt-7 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs font-semibold"><span className="text-[0.55rem] font-bold uppercase tracking-[0.15em] text-white/60">Pay with</span><PaymentPartner mark="t" label="telebirr" className="bg-blue-500" /><PaymentPartner mark="CBE" label="CBE Birr" className="bg-purple-600" /><PaymentPartner mark="A" label="Awash Bank" className="bg-amber-500" /></div>
                    </div>
                </section>

                <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
                    <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-secondary/15 px-5 py-6 sm:px-8"><div><h2 className="font-bold text-text">Have a place to share?</h2><p className="mt-1 text-xs text-text-2">List your property and welcome guests to Ethiopia.</p></div><Link to="/sign-up" className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-xs font-semibold text-button-text">Become a host <ArrowRight size={14} /></Link></div>
                </section>
            </div>
        </PageShell>
    )
}

export function ExplorePageSkeleton() {
    return <div role="status" aria-label="Loading stays and destinations" className="min-h-screen w-full bg-bg-2 pt-16 text-text">
        <section className="bg-primary px-5 py-8 sm:px-8 sm:py-10">
            <div className="mx-auto grid max-w-7xl items-center gap-7 lg:grid-cols-[1fr_0.85fr]">
                <div className="space-y-3"><Skeleton className="h-3 w-36 bg-white/15" /><Skeleton className="h-8 w-3/4 bg-white/15 sm:h-10" /><Skeleton className="h-4 w-2/3 bg-white/15" /><Skeleton className="h-4 w-1/2 bg-white/15" /></div>
                <Skeleton className="hidden h-44 rounded-2xl bg-white/15 lg:block" />
            </div>
            <Skeleton className="mx-auto mt-7 h-16 max-w-7xl rounded-2xl bg-white/15" />
        </section>
        <div className="mx-auto max-w-7xl space-y-10 px-5 py-9 sm:px-8 sm:py-12">
            <section><Skeleton className="mb-3 h-3 w-36" /><Skeleton className="mb-5 h-7 w-48" /><div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">{Array.from({ length: 5 }, (_, index) => <Skeleton key={index} className="h-32 rounded-xl sm:h-40" />)}</div></section>
            <section><Skeleton className="mb-3 h-3 w-44" /><Skeleton className="mb-5 h-7 w-36" /><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <ExploreCardSkeleton key={index} />)}</div></section>
            <section className="border-t border-border pt-9"><Skeleton className="h-7 w-56" /><div className="mt-5 grid gap-4 sm:grid-cols-3">{Array.from({ length: 3 }, (_, index) => <div key={index} className="space-y-3"><Skeleton className="h-4 w-4/5" /><Skeleton className="h-3 w-full" /><Skeleton className="h-3 w-2/3" /></div>)}</div></section>
        </div>
    </div>
}

function ExploreCardSkeleton() {
    return <div className="overflow-hidden rounded-xl border border-border bg-bg"><Skeleton className="h-40 rounded-none" /><div className="space-y-3 p-3.5"><Skeleton className="h-4 w-4/5" /><Skeleton className="h-3 w-1/2" /><Skeleton className="h-4 w-full" /></div></div>
}

function FeaturedStay({ property }) {
    const image = property.propertyImages?.[0]?.image_url
    return <article className="overflow-hidden rounded-xl border border-border bg-bg shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
        <Link to={`/properties/${property.property_id}`} aria-label={`View ${property.title}`} className="relative block h-40 overflow-hidden bg-bg-2">
            {image ? <img src={image} alt={property.title} className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-primary/50"><House size={32} /></div>}
            <span className="absolute left-2 top-2 rounded-full bg-secondary px-2 py-1 text-[0.55rem] font-bold text-on-secondary">Verified</span>
        </Link>
        <div className="p-3.5"><Link to={`/properties/${property.property_id}`} className="line-clamp-1 text-sm font-bold text-text hover:text-primary">{property.title}</Link><p className="mt-1 line-clamp-1 text-[0.65rem] text-text-2">{property.city}, {property.country}</p><div className="mt-3 flex items-center justify-between gap-2 border-t border-border pt-3"><p className="text-xs font-bold text-text">ETB {Number(property.price_per_night).toLocaleString()} <span className="font-normal text-text-2">/ night</span></p><Link to={`/properties/${property.property_id}`} className="rounded-lg bg-primary/10 px-2.5 py-1.5 text-[0.65rem] font-semibold text-primary hover:bg-primary/20">Details</Link></div></div>
    </article>
}

function PaymentPartner({ mark, label, className }) {
    return <span className="inline-flex items-center gap-2"><span className={`grid size-6 place-items-center rounded-md ${className} text-[0.5rem] font-bold text-white`}>{mark}</span>{label}</span>
}
