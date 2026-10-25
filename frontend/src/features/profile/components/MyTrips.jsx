import { useState } from 'react'
import { ArrowUpRight, FileText, MapPin, MessageCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useMyTrips } from '../hooks/useProfile'
import { Spinner } from '../../../components/UI/Spinner'
import { formatDate } from '../../../lib/utils'
import RetryButton from '../../../components/UI/RetryButton'

const tabs = ['Upcoming', 'Past', 'Cancelled']

export default function MyTrips() {
    const [activeTab, setActiveTab] = useState('Upcoming')
    const { data: trips = [], isLoading, isError, refetch, isFetching } = useMyTrips()
    const groups = {
        Upcoming: trips.filter((trip) => ['CONFIRMED', 'PENDING', 'DISPUTED'].includes(trip.booking_status)),
        Past: trips.filter((trip) => trip.booking_status === 'COMPLETED'),
        Cancelled: trips.filter((trip) => ['CANCELLED', 'REFUNDED', 'REFUNDING'].includes(trip.booking_status)),
    }
    const filtered = groups[activeTab]

    return (
        <section className="rounded-2xl border border-border bg-surface p-4 sm:p-5" aria-labelledby="my-trips-title">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h2 id="my-trips-title" className="text-base font-bold text-text">My trips</h2>
                <div role="tablist" aria-label="Filter trips" className="flex gap-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            type="button"
                            role="tab"
                            aria-selected={activeTab === tab}
                            onClick={() => setActiveTab(tab)}
                            className={`border-b-2 px-2 py-2 text-[0.68rem] font-semibold transition sm:px-3 ${activeTab === tab
                                ? 'border-secondary text-primary'
                                : 'border-transparent text-text-2 hover:text-text'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {isLoading ? (
                <div className="grid min-h-48 place-items-center"><Spinner /></div>
            ) : isError ? (
                <div className="grid min-h-48 content-center justify-items-center gap-3">
                    <p role="alert" className="text-sm text-danger">Could not load trips.</p>
                    <RetryButton onRetry={refetch} isRetrying={isFetching} />
                </div>
            ) : filtered.length === 0 ? (
                <div className="grid min-h-48 place-items-center rounded-xl border border-dashed border-border px-4 text-center">
                    <div>
                        <p className="text-sm font-semibold text-text">No {activeTab.toLowerCase()} trips yet</p>
                        <p className="mt-1 text-xs text-text-2">Your stays will show up here when you book one.</p>
                        {activeTab === 'Upcoming' && <Link to="/properties" className="mt-3 inline-flex text-xs font-bold text-primary hover:underline">Browse stays</Link>}
                    </div>
                </div>
            ) : (
                <div className="grid gap-3">
                    {filtered.map((trip) => <TripCard key={trip.booking_id} trip={trip} activeTab={activeTab} />)}
                </div>
            )}
        </section>
    )
}

function TripCard({ trip, activeTab }) {
    const image = trip.property?.propertyImages?.[0]?.image_url
    const location = [trip.property?.city, trip.property?.country].filter(Boolean).join(', ') || 'Ethiopia'
    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`
    const nights = Math.max(1, Math.round((new Date(trip.check_out_date) - new Date(trip.check_in_date)) / 86400000))
    const canCancel = activeTab === 'Upcoming'
        && ['PENDING', 'CONFIRMED'].includes(trip.booking_status)
        && new Date() < new Date(trip.check_in_date)
    const isCancelled = ['CANCELLED', 'REFUNDED', 'REFUNDING'].includes(trip.booking_status)
    const statusLabel = trip.booking_status === 'CONFIRMED' ? 'Confirmed' : trip.booking_status.replaceAll('_', ' ').toLowerCase()

    return (
        <article className="grid min-w-0 gap-3 rounded-xl border border-border p-2.5 sm:grid-cols-[6.5rem_minmax(0,1fr)] sm:gap-3.5 sm:p-3">
            <div className="relative h-36 overflow-hidden rounded-lg bg-primary/10 sm:h-24">
                {image
                    ? <img src={image} alt={trip.property?.title || 'Booked property'} className="absolute inset-0 size-full object-cover" />
                    : <span className="absolute bottom-2 left-2 rounded bg-surface/90 px-1.5 py-0.5 text-[0.55rem] font-semibold text-text-2">Photo coming soon</span>}
            </div>
            <div className="min-w-0 py-0.5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                        <h3 className="line-clamp-2 text-sm font-bold leading-tight text-text">{trip.property?.title || 'Your stay'}</h3>
                        <p className="mt-1 flex items-center gap-1 text-[0.65rem] text-text-2"><MapPin size={11} aria-hidden="true" />{location}</p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-[0.55rem] font-bold uppercase tracking-wide ${isCancelled ? 'bg-danger/10 text-danger' : trip.booking_status === 'PENDING' ? 'bg-secondary/20 text-text' : 'bg-secondary text-on-secondary'}`}>
                        {statusLabel}
                    </span>
                </div>

                <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-[0.55rem] sm:grid-cols-4">
                    <TripFact label="Check-in" value={formatDate(trip.check_in_date)} />
                    <TripFact label="Check-out" value={formatDate(trip.check_out_date)} />
                    <TripFact label="Length" value={`${nights} night${nights === 1 ? '' : 's'}`} />
                    <TripFact label="Booking ref" value={`BT-${trip.booking_id.slice(0, 6).toUpperCase()}`} />
                </dl>

                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-[0.65rem] font-semibold">
                    <Link to={`/my-bookings/${trip.booking_id}`} className="inline-flex items-center gap-1 rounded-md bg-primary px-2.5 py-1.5 text-button-text hover:brightness-110">
                        <MessageCircle size={11} aria-hidden="true" /> Message host
                    </Link>
                    <a href={mapUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
                        View directions <ArrowUpRight size={11} aria-hidden="true" />
                    </a>
                    <Link to={`/my-bookings/${trip.booking_id}`} className="inline-flex items-center gap-1 text-primary hover:underline">
                        <FileText size={11} aria-hidden="true" /> Details
                    </Link>
                    {canCancel && <Link to={`/my-bookings/${trip.booking_id}`} className="text-danger underline underline-offset-2 hover:text-danger/80">Cancel booking</Link>}
                </div>
            </div>
        </article>
    )
}

function TripFact({ label, value }) {
    return <div className="min-w-0">
        <dt className="font-semibold uppercase tracking-wide text-text-2">{label}</dt>
        <dd className="mt-0.5 truncate font-semibold text-text">{value}</dd>
    </div>
}
