import { useQueries } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { ArrowRight, CalendarDays, CircleCheck, CircleX, Clock3, House, TriangleAlert } from 'lucide-react'
import PageShell from '../components/layout/PageShell'
import { Spinner } from '../components/UI/Spinner'
import RetryButton from '../components/UI/RetryButton'
import { useMyProperties } from '../features/properties/hooks/useMyProperties'
import { useProfile } from '../features/profile/hooks/useProfile'
import { bookingServices } from '../features/booking/services/bookingServices'

export default function HostOverviewPage() {
    const propertiesQuery = useMyProperties()
    const profileQuery = useProfile()
    const properties = propertiesQuery.data || []
    const bookingQueries = useQueries({
        queries: properties.map((property) => ({
            queryKey: ['host', 'bookings', property.property_id, 1],
            queryFn: async () => (await bookingServices.getHostPropertyBookings(property.property_id, 1, 10)).data,
        })),
    })
    const bookings = bookingQueries.flatMap((query) => query.data?.bookings || []).slice(0, 2)
    const bookingsLoading = propertiesQuery.isLoading || bookingQueries.some((query) => query.isLoading)
    const bookingsError = bookingQueries.some((query) => query.isError)
    const approved = properties.filter((property) => property.verification_status === 'APPROVED').length
    const pending = properties.filter((property) => property.verification_status === 'PENDING').length
    const needsChanges = properties.filter((property) => property.verification_status === 'REJECTED').length
    const verificationPending = profileQuery.data?.user?.is_verified_host !== true

    return (
        <PageShell>
            <section className="w-full px-5 py-6 sm:px-7 lg:px-9 xl:px-10 sm:py-7" aria-labelledby="host-overview-title">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Host workspace</p>
                        <h1 id="host-overview-title" className="mt-1 text-3xl font-extrabold leading-tight tracking-tight text-text">Overview</h1>
                        <p className="mt-1 text-sm text-text-2">Manage your listings and keep their availability up to date.</p>
                    </div>
                    <Link to="/properties" className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-button-text transition hover:brightness-110">
                        Manage properties <ArrowRight size={15} />
                    </Link>
                </div>

                {verificationPending && <div className="mt-4 flex items-center gap-3 rounded-xl border border-[#f1d99f] bg-[#fff3d6] px-3.5 py-2.5 text-[#76510b] dark:border-[#594717] dark:bg-[#30270f] dark:text-[#f7d98f]">
                    <TriangleAlert size={15} className="shrink-0" aria-hidden="true" />
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold">Host verification pending</p>
                        <p className="text-xs">We're reviewing your details. You'll be notified once you're approved.</p>
                    </div>
                    <Link to="/profile" className="shrink-0 text-xs font-bold underline underline-offset-2">View status</Link>
                </div>}

                {propertiesQuery.isLoading && <div className="flex justify-center py-10"><Spinner size="lg" /></div>}
                {propertiesQuery.isError && <div className="mt-5 flex flex-wrap items-center gap-3 rounded-xl border border-border bg-surface p-4"><p role="alert" className="text-sm text-danger">Could not load your properties.</p><RetryButton onRetry={propertiesQuery.refetch} isRetrying={propertiesQuery.isFetching} /></div>}

                {!propertiesQuery.isLoading && !propertiesQuery.isError && <>
                    <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                        <SummaryCard icon={House} label="Your properties" value={properties.length} />
                        <SummaryCard icon={CircleCheck} label="Approved" value={approved} />
                        <SummaryCard icon={Clock3} label="Awaiting review" value={pending} />
                        <SummaryCard icon={CircleX} label="Needs changes" value={needsChanges} />
                    </div>

                    {properties.length === 0 ? <div className="mt-4 rounded-2xl border border-border bg-surface p-7 text-center">
                        <h2 className="text-base font-bold text-text">Start with your first listing</h2>
                        <p className="mx-auto mt-1 max-w-lg text-sm text-text-2">Add the property details, nightly price, and the dates you can host guests.</p>
                        <Link to="/properties" className="mt-4 inline-flex rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-button-text">Add a property</Link>
                    </div> : <div className="mt-4 grid items-stretch gap-3.5 md:grid-cols-[1.25fr_0.9fr]">
                        <section className="rounded-2xl border border-border bg-surface px-4 py-3.5" aria-labelledby="host-listings-title">
                            <div className="mb-2.5 flex items-center justify-between">
                                <h2 id="host-listings-title" className="text-base font-bold text-text">Your listings</h2>
                                <Link to="/properties" className="text-xs font-bold text-primary underline underline-offset-2">Manage</Link>
                            </div>
                            <div className="divide-y divide-border">
                                {properties.slice(0, 3).map((property) => <ListingRow key={property.property_id} property={property} />)}
                            </div>
                        </section>

                        <section className="flex min-h-40 flex-col rounded-2xl border border-border bg-surface px-4 py-4" aria-labelledby="host-bookings-title">
                            <div className="flex items-center justify-between">
                                <h2 id="host-bookings-title" className="text-base font-bold text-text">Bookings</h2>
                                <Link to="/host/bookings" className="text-xs font-bold text-primary underline underline-offset-2">View all</Link>
                            </div>
                            {bookingsLoading ? <div className="grid flex-1 place-items-center"><Spinner /></div>
                                : bookingsError ? <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center"><p role="alert" className="text-sm text-danger">Could not load bookings.</p><RetryButton onRetry={() => bookingQueries.forEach((query) => query.refetch())} isRetrying={bookingQueries.some((query) => query.isFetching)} /></div>
                                    : bookings.length === 0 ? <div className="flex flex-1 flex-col items-center justify-center py-4 text-center">
                                        <span className="grid size-9 place-items-center rounded-full bg-primary/10 text-primary"><CalendarDays size={16} /></span>
                                        <h3 className="mt-2 text-sm font-bold text-text">No bookings yet</h3>
                                        <p className="mt-1 max-w-56 text-xs leading-5 text-text-2">Reservations will appear here once guests book your properties.</p>
                                    </div> : <div className="mt-2 divide-y divide-border">
                                        {bookings.map((booking) => <BookingRow key={booking.booking_id} booking={booking} />)}
                                    </div>}
                        </section>
                    </div>}
                </>}
            </section>
        </PageShell>
    )
}

function SummaryCard({ icon: Icon, label, value }) {
    return <article className="rounded-xl border border-border bg-surface px-3.5 py-3 shadow-sm">
        <div className="flex items-center gap-2 text-primary"><Icon size={15} /><span className="text-sm font-medium text-text">{label}</span></div>
        <p className="mt-1.5 text-3xl font-extrabold leading-none text-text">{value}</p>
    </article>
}

function ListingRow({ property }) {
    const image = property.propertyImages?.[0]?.image_url
    const statusClass = property.verification_status === 'APPROVED'
        ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
        : property.verification_status === 'REJECTED'
            ? 'bg-red-500/10 text-red-700 dark:text-red-300'
            : 'bg-amber-500/10 text-amber-800 dark:text-amber-200'
    return <Link to="/properties" className="flex min-h-[55px] items-center gap-2.5 py-2 transition hover:bg-bg-2/40">
        {image ? <img src={image} alt="" className="size-10 shrink-0 rounded-lg object-cover" /> : <span className="size-10 shrink-0 rounded-lg bg-gradient-to-br from-[#d6e7db] to-[#e8ddbd] dark:from-[#31463a] dark:to-[#554a31]" aria-hidden="true" />}
        <span className="min-w-0 flex-1"><span className="block truncate text-sm font-bold text-text">{property.title}</span><span className="mt-0.5 block truncate text-xs text-text-2">{property.city} · ETB {Number(property.price_per_night).toLocaleString()}</span></span>
        <span className={`shrink-0 rounded-full px-2 py-1 text-[9px] font-bold ${statusClass}`}>{property.verification_status}</span>
    </Link>
}

function BookingRow({ booking }) {
    return <div className="flex items-center justify-between gap-2 py-2.5">
        <div className="min-w-0"><p className="truncate text-sm font-bold text-text">{booking.user?.name || 'Guest reservation'}</p><p className="mt-0.5 truncate text-xs text-text-2">{booking.property?.title || `Booking ${booking.booking_id.slice(0, 8)}`}</p></div>
        <span className="shrink-0 rounded-full bg-primary/10 px-2 py-1 text-[9px] font-bold text-primary">{booking.booking_status?.replaceAll('_', ' ')}</span>
    </div>
}
