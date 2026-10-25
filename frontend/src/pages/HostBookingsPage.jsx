import { useMemo, useState } from 'react'
import { useQueries } from '@tanstack/react-query'
import { CalendarDays, CircleCheck, Clock3, Download, Mail, Phone, Search } from 'lucide-react'
import PageShell from '../components/layout/PageShell'
import RetryButton from '../components/UI/RetryButton'
import Skeleton from '../components/UI/Skeleton'
import { bookingServices } from '../features/booking/services/bookingServices'
import { useMyProperties } from '../features/properties/hooks/useMyProperties'
import { formatDate } from '../lib/utils'

const FILTERS = [
    { id: 'ALL', label: 'All' },
    { id: 'UPCOMING', label: 'Upcoming' },
    { id: 'CURRENT', label: 'Current' },
    { id: 'COMPLETED', label: 'Completed' },
    { id: 'CANCELLED', label: 'Cancelled' },
]

export default function HostBookingsPage() {
    const [activeFilter, setActiveFilter] = useState('ALL')
    const [search, setSearch] = useState('')
    const [selectedPropertyId, setSelectedPropertyId] = useState('')
    const [selectedBookingId, setSelectedBookingId] = useState('')
    const propertiesQuery = useMyProperties()
    const properties = propertiesQuery.data || []
    const bookingQueries = useQueries({
        queries: properties.map((property) => ({
            queryKey: ['host', 'bookings', property.property_id, 'all', 100],
            queryFn: async () => (await bookingServices.getHostPropertyBookings(property.property_id, 1, 100)).data,
        })),
    })
    const allBookings = bookingQueries.flatMap((query) => query.data?.bookings || [])
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const isUpcoming = (booking) => booking.booking_status === 'CONFIRMED' && new Date(booking.check_in_date) > today
    const isCurrent = (booking) => booking.booking_status === 'CONFIRMED' && new Date(booking.check_in_date) <= today && new Date(booking.check_out_date) >= today
    const upcomingCount = allBookings.filter(isUpcoming).length
    const awaitingPaymentCount = allBookings.filter((booking) => booking.booking_status === 'PENDING' || booking.payment?.payment_status === 'PENDING').length
    const completedCount = allBookings.filter((booking) => booking.booking_status === 'COMPLETED').length
    const filteredBookings = useMemo(() => {
        const normalizedSearch = search.trim().toLowerCase()
        return allBookings.filter((booking) => {
            const matchesProperty = !selectedPropertyId || booking.property_id === selectedPropertyId
            const matchesSearch = !normalizedSearch
                || booking.user?.name?.toLowerCase().includes(normalizedSearch)
                || booking.booking_id?.toLowerCase().includes(normalizedSearch)
            const matchesFilter = activeFilter === 'ALL'
                || (activeFilter === 'UPCOMING' && isUpcoming(booking))
                || (activeFilter === 'CURRENT' && isCurrent(booking))
                || (activeFilter === 'COMPLETED' && booking.booking_status === 'COMPLETED')
                || (activeFilter === 'CANCELLED' && ['CANCELLED', 'REFUNDED', 'REFUNDING'].includes(booking.booking_status))
            return matchesProperty && matchesSearch && matchesFilter
        }).sort((a, b) => new Date(a.check_in_date) - new Date(b.check_in_date))
    }, [allBookings, selectedPropertyId, search, activeFilter])
    const selectedBooking = filteredBookings.find((booking) => booking.booking_id === selectedBookingId) || filteredBookings[0]
    const bookingsLoading = propertiesQuery.isLoading || bookingQueries.some((query) => query.isLoading)
    const bookingsError = bookingQueries.some((query) => query.isError)

    const exportBookings = () => {
        const rows = [
            ['Guest', 'Booking reference', 'Property', 'Check-in', 'Check-out', 'Guests', 'Status', 'Total'],
            ...filteredBookings.map((booking) => [
                booking.user?.name || 'Guest', booking.booking_id, booking.property?.title || '',
                formatDate(booking.check_in_date), formatDate(booking.check_out_date),
                booking.guest_count || 1, booking.booking_status, booking.total_price,
            ]),
        ]
        const csv = rows.map((row) => row.map((cell) => `"${String(cell ?? '').replaceAll('"', '""')}"`).join(',')).join('\n')
        const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
        const anchor = document.createElement('a')
        anchor.href = url
        anchor.download = 'host-bookings.csv'
        anchor.click()
        URL.revokeObjectURL(url)
    }

    return <PageShell>
        <section className="w-full px-5 py-6 sm:px-7 lg:px-9 xl:px-10 sm:py-7" aria-labelledby="host-bookings-title">
            <header className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Host workspace</p>
                    <h1 id="host-bookings-title" className="mt-1 text-3xl font-extrabold tracking-tight text-text">Bookings</h1>
                    <p className="mt-1 text-sm text-text-2">Review reservations, message guests and keep track of check-ins.</p>
                </div>
                <button type="button" onClick={exportBookings} disabled={!filteredBookings.length} className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-xs font-semibold text-text transition hover:border-primary disabled:cursor-not-allowed disabled:opacity-50">
                    <Download size={14} /> Export
                </button>
            </header>

            <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                <MetricCard icon={CalendarDays} label="Upcoming" value={upcomingCount} />
                <MetricCard icon={Clock3} label="Awaiting payment" value={awaitingPaymentCount} />
                <MetricCard icon={CircleCheck} label="Completed" value={completedCount} />
            </div>

            <div className="mt-4 flex flex-wrap gap-2" role="tablist" aria-label="Filter bookings">
                {FILTERS.map((filter) => <button key={filter.id} type="button" role="tab" aria-selected={activeFilter === filter.id} onClick={() => setActiveFilter(filter.id)} className={`min-h-8 rounded-full border px-3 py-1.5 text-xs font-medium transition ${activeFilter === filter.id ? 'border-[#0d3d2d] bg-[#0d3d2d] text-white dark:border-[#2c654a] dark:bg-[#194330]' : 'border-border bg-surface text-text hover:border-primary/50'}`}>
                    {filter.label}{filter.id === 'UPCOMING' ? ` (${upcomingCount})` : ''}
                </button>)}
            </div>

            <div className="mt-3 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
                <label className="flex min-h-10 items-center gap-2 rounded-lg border border-border bg-surface px-3 text-text-2 focus-within:border-primary">
                    <Search size={15} aria-hidden="true" />
                    <span className="sr-only">Search by guest or booking reference</span>
                    <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by guest or booking reference" className="min-w-0 flex-1 bg-transparent text-sm text-text outline-none placeholder:text-text-2" />
                </label>
                <label className="sr-only" htmlFor="property-filter">Filter by property</label>
                <select id="property-filter" value={selectedPropertyId} onChange={(event) => setSelectedPropertyId(event.target.value)} className="min-h-10 rounded-lg border border-border bg-surface px-3 text-xs font-semibold text-text">
                    <option value="">All properties</option>
                    {properties.map((property) => <option key={property.property_id} value={property.property_id}>{property.title}</option>)}
                </select>
            </div>

            {propertiesQuery.isLoading && <div className="mt-4 grid gap-3"><Skeleton className="h-32 rounded-2xl" /><Skeleton className="h-32 rounded-2xl" /></div>}
            {propertiesQuery.isError && <div className="mt-5 flex items-center gap-3 rounded-xl border border-border bg-surface p-4"><p role="alert" className="text-sm text-danger">Could not load your properties.</p><RetryButton onRetry={propertiesQuery.refetch} isRetrying={propertiesQuery.isFetching} /></div>}
            {!propertiesQuery.isLoading && !propertiesQuery.isError && properties.length === 0 && <div className="mt-5 rounded-2xl border border-border bg-surface p-8 text-center text-sm text-text-2">Add a property to manage its bookings.</div>}
            {!propertiesQuery.isLoading && !propertiesQuery.isError && properties.length > 0 && <div className="mt-3 grid items-start gap-3.5 md:grid-cols-[minmax(0,1.4fr)_minmax(300px,0.95fr)]">
                <div className="space-y-2">
                    {bookingsLoading && <div className="grid gap-2"><Skeleton className="h-20 rounded-xl" /><Skeleton className="h-20 rounded-xl" /></div>}
                    {!bookingsLoading && bookingsError && <div className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4"><p role="alert" className="text-sm text-danger">Could not load bookings.</p><RetryButton onRetry={() => bookingQueries.forEach((query) => query.refetch())} isRetrying={bookingQueries.some((query) => query.isFetching)} /></div>}
                    {!bookingsLoading && !bookingsError && filteredBookings.length === 0 && <div className="rounded-xl border border-border bg-surface p-8 text-center text-sm text-text-2">No bookings match these filters.</div>}
                    {!bookingsLoading && !bookingsError && filteredBookings.map((booking) => <BookingListItem key={booking.booking_id} booking={booking} selected={selectedBooking?.booking_id === booking.booking_id} onClick={() => setSelectedBookingId(booking.booking_id)} />)}
                </div>
                {selectedBooking && !bookingsLoading && <BookingDetail booking={selectedBooking} />}
            </div>}
        </section>
    </PageShell>
}

function MetricCard({ icon: Icon, label, value }) {
    return <article className="rounded-xl border border-border bg-surface px-4 py-3 shadow-sm">
        <p className="flex items-center gap-2 text-xs font-medium text-text"><Icon size={14} className="text-primary" />{label}</p>
        <p className="mt-1 text-2xl font-extrabold leading-none text-text">{value}</p>
    </article>
}

function BookingListItem({ booking, selected, onClick }) {
    const isAwaitingPayment = booking.booking_status === 'PENDING' || booking.payment?.payment_status === 'PENDING'
    const status = isAwaitingPayment ? 'Awaiting payment' : booking.booking_status.replaceAll('_', ' ')
    const guestName = booking.user?.name || 'Guest name unavailable'
    return <button type="button" onClick={onClick} aria-pressed={selected} className={`w-full rounded-xl border bg-surface px-3 py-2.5 text-left transition ${selected ? 'border-primary ring-1 ring-primary/30' : 'border-border hover:border-primary/50'}`}>
        <div className="flex items-center gap-2.5">
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">{guestName.slice(0, 1).toUpperCase()}</span>
            <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold text-text">{guestName}</span>
                <span className="mt-0.5 block truncate text-xs text-text-2">{booking.property?.title || 'Property'} · {formatDate(booking.check_in_date)} – {formatDate(booking.check_out_date)} · {getNights(booking)} nights</span>
            </span>
            <span className="flex shrink-0 flex-col items-end gap-1">
                <span className={`rounded-full px-2 py-1 text-[9px] font-bold ${isAwaitingPayment ? 'bg-amber-100 text-amber-800 dark:bg-[#392d13] dark:text-[#f4cd72]' : 'bg-emerald-100 text-emerald-800 dark:bg-[#0b2d20] dark:text-[#4bd49a]'}`}>{status}</span>
                <span className="text-xs font-bold text-text">ETB {Number(booking.total_price).toLocaleString()}</span>
            </span>
        </div>
    </button>
}

function BookingDetail({ booking }) {
    const email = booking.user?.email
    const phone = booking.user?.phone_number
    const messageHref = email
        ? `mailto:${email}?subject=${encodeURIComponent(`About your Betoch booking ${booking.booking_id.slice(0, 8).toUpperCase()}`)}`
        : null
    return <aside className="rounded-2xl border border-border bg-surface p-4 shadow-sm" aria-label="Selected booking details">
        <div className="flex items-center justify-between gap-2">
            <h2 className="text-base font-bold text-text">Booking [{booking.booking_id.slice(0, 8).toUpperCase()}]</h2>
            <span className="rounded-full bg-emerald-100 px-2 py-1 text-[9px] font-bold text-emerald-800 dark:bg-[#0b2d20] dark:text-[#4bd49a]">{booking.booking_status.replaceAll('_', ' ')}</span>
        </div>
        <div className="mt-3 flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-full bg-primary/10 text-sm font-bold text-primary">{(booking.user?.name || 'G').slice(0, 1).toUpperCase()}</span>
            <div className="min-w-0"><p className="truncate text-sm font-bold text-text">{booking.user?.name || 'Guest'}</p><p className="text-xs text-text-2">{phone || email || 'Guest contact unavailable'}</p></div>
        </div>
        <h3 className="mb-1 mt-4 text-[10px] font-bold uppercase tracking-wide text-text-2">Stay</h3>
        <DetailRow label="Property" value={booking.property?.title || 'Property'} />
        <DetailRow label="Check-in" value={formatDate(booking.check_in_date)} />
        <DetailRow label="Check-out" value={formatDate(booking.check_out_date)} />
        <DetailRow label="Length" value={`${getNights(booking)} nights`} />
        <DetailRow label="Guests" value={booking.guest_count || 1} />
        <h3 className="mb-1 mt-4 text-[10px] font-bold uppercase tracking-wide text-text-2">Payment</h3>
        <DetailRow label="Paid with" value={booking.payment?.payment_method || 'Not available'} />
        <DetailRow label="Payment status" value={booking.payment?.payment_status || booking.booking_status} />
        <DetailRow label="Total paid by guest" value={`ETB ${Number(booking.total_price).toLocaleString()}`} />
        <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-border pt-3">
            {messageHref ? <a href={messageHref} className="inline-flex min-h-9 items-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-xs font-bold text-button-text transition hover:brightness-110"><Mail size={14} /> Message guest</a> : <span className="text-xs text-text-2">Guest email is unavailable.</span>}
            {phone && <a href={`tel:${phone}`} className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-text"><Phone size={13} />{phone}</a>}
        </div>
    </aside>
}

function DetailRow({ label, value }) {
    return <div className="flex items-center justify-between gap-3 border-b border-border/70 py-1.5 text-xs">
        <span className="text-text-2">{label}</span><span className="text-right font-semibold text-text">{value}</span>
    </div>
}

function getNights(booking) {
    const nights = Math.ceil((new Date(booking.check_out_date) - new Date(booking.check_in_date)) / 86400000)
    return Math.max(1, nights)
}
