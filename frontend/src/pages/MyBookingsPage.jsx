import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { CalendarDays, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import PageShell from '../components/layout/PageShell'
import BookingCard from '../features/booking/components/BookingCard'
import CompletedBookingCard from '../features/booking/components/CompletedBookingCard'
import BookingHelpBand from '../features/booking/components/BookingHelpBand'
import { useMyBookings } from '../features/booking/hooks/useMyBookings'
import RetryButton from '../components/UI/RetryButton'
import Skeleton from '../components/UI/Skeleton'
import { formatDate } from '../lib/utils'
import { bookingServices } from '../features/booking/services/bookingServices'

const tabs = ['Upcoming', 'Completed', 'Cancelled']

export default function MyBookingsPage() {
    const [activeTab, setActiveTab] = useState('Upcoming')
    const [selectedBookingId, setSelectedBookingId] = useState(null)
    const [cancelError, setCancelError] = useState('')
    const queryClient = useQueryClient()
    const { data: bookings = [], isLoading, isError, refetch, isFetching } = useMyBookings()
    const cancelBooking = useMutation({
        mutationFn: (booking) => bookingServices.cancelBooking(booking.booking_id),
        onSuccess: async (response, booking) => {
            const cancelledBooking = response?.data?.canceledBooking
            if (cancelledBooking) {
                queryClient.setQueryData(['my-bookings'], (current = []) => current.map((item) => item.booking_id === booking.booking_id ? cancelledBooking : item))
            }
            await queryClient.invalidateQueries({ queryKey: ['my-bookings'] })
        },
        onError: (error) => setCancelError(error?.response?.data?.message || 'Could not cancel this unpaid booking. Please try again.'),
    })

    const handleCancelBooking = (booking) => {
        if (!window.confirm('Cancel this unpaid booking? This will release the dates for other guests.')) return
        setCancelError('')
        cancelBooking.mutate(booking)
    }

    const upcoming = bookings.filter((booking) => ['CONFIRMED', 'PENDING'].includes(booking.booking_status))
    const completed = bookings.filter((booking) => booking.booking_status === 'COMPLETED')
    const cancelled = bookings.filter((booking) => ['CANCELLED', 'REFUNDED', 'REFUNDING'].includes(booking.booking_status))
    const bookingGroups = { Upcoming: upcoming, Completed: completed, Cancelled: cancelled }
    const activeBookings = bookingGroups[activeTab]
    const selectedBooking = activeBookings.find((booking) => booking.booking_id === selectedBookingId) || activeBookings[0]

    return <PageShell>
        <div className="mx-auto w-full max-w-7xl px-4 pb-10 pt-20 sm:px-6 lg:px-8">
            <header className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-border pb-5">
                <div><h1 className="text-2xl font-bold tracking-tight text-text sm:text-3xl">My bookings</h1><p className="mt-1 text-sm text-text-2">Track, change or cancel your stays.</p></div>
                <Link to="/properties" className="rounded-lg bg-secondary px-4 py-2.5 text-xs font-bold text-on-secondary transition hover:brightness-105">Find a new stay</Link>
            </header>

            <nav aria-label="Booking status" className="mb-5 flex gap-6 border-b border-border">
                {tabs.map((tab) => {
                    const count = bookingGroups[tab].length
                    return <button key={tab} type="button" onClick={() => setActiveTab(tab)} aria-current={activeTab === tab ? 'page' : undefined} className={`-mb-px border-b-2 px-1 pb-3 text-xs font-semibold transition ${activeTab === tab ? 'border-secondary text-primary' : 'border-transparent text-text-2 hover:text-text'}`}>
                        {tab}{tab === 'Upcoming' && !isLoading && !isError ? ` (${count})` : ''}
                    </button>
                })}
            </nav>

            {isLoading ? <BookingsPageSkeleton /> : isError ? <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-bg p-5"><p role="alert" className="text-sm text-danger">Could not load your bookings.</p><RetryButton onRetry={refetch} isRetrying={isFetching} /></div> : (
                <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.8fr)_minmax(15rem,0.85fr)]">
                    <section aria-label={`${activeTab} bookings`} className="space-y-4">
                        {cancelError && <p role="alert" className="mb-4 rounded-lg border border-danger/20 bg-danger/5 p-3 text-sm text-danger">{cancelError}</p>}
                {activeBookings.length === 0 ? <div className="rounded-2xl border border-border bg-bg px-5 py-14 text-center"><CalendarDays className="mx-auto text-primary/70" size={30} /><h2 className="mt-3 font-bold text-text">No {activeTab.toLowerCase()} bookings</h2><p className="mt-1 text-sm text-text-2">Your stays will appear here when you book one.</p><Link to="/properties" className="mt-4 inline-flex rounded-lg bg-primary px-4 py-2.5 text-xs font-semibold text-button-text">Browse properties</Link></div> : activeTab === 'Completed' ? completed.map((booking) => <CompletedBookingCard key={booking.booking_id} booking={booking} />) : activeBookings.map((booking) => <BookingCard key={booking.booking_id} booking={booking} selected={selectedBooking?.booking_id === booking.booking_id} onManage={(item) => setSelectedBookingId(item.booking_id)} onCancel={handleCancelBooking} cancelling={cancelBooking.isPending && cancelBooking.variables?.booking_id === booking.booking_id} />)}
                    </section>

                    <aside className="space-y-4 lg:sticky lg:top-20">
                        {selectedBooking ? <CheckInPanel booking={selectedBooking} /> : <div className="rounded-2xl border border-border bg-bg p-5"><h2 className="font-bold text-text">Your next stay</h2><p className="mt-2 text-sm leading-6 text-text-2">When you book, you’ll find check-in details and your trip information here.</p></div>}
                        <BookingHelpBand />
                    </aside>
                </div>
            )}
        </div>
    </PageShell>
}

function CheckInPanel({ booking }) {
    const checkIn = new Date(booking.check_in_date)
    const now = new Date()
    const checkedIn = now >= checkIn && now < new Date(booking.check_out_date)
    const cancelled = ['CANCELLED', 'REFUNDED', 'REFUNDING'].includes(booking.booking_status)

    return <section className="rounded-2xl border border-border bg-bg p-5">
        <h2 className="font-bold text-text">Check-in info</h2>
        <p className="mt-3 text-xs leading-5 text-text-2">{cancelled ? 'This booking is no longer active.' : checkedIn ? 'You are currently in your stay.' : 'Please confirm your arrival time with your host.'}</p>
        <p className="mt-3 flex items-start gap-2 text-xs leading-5 text-text-2"><MapPin size={15} className="mt-0.5 shrink-0 text-primary" />{booking.property?.city || 'Location'} details are available on your property page.</p>
        <p className="mt-3 flex items-start gap-2 text-xs leading-5 text-text-2"><CalendarDays size={15} className="mt-0.5 shrink-0 text-primary" />Check-in {formatDate(booking.check_in_date)} · Check-out {formatDate(booking.check_out_date)}</p>
        <Link to={`/properties/${booking.property_id}`} className="mt-4 inline-flex text-xs font-bold text-primary hover:underline">View property details</Link>
    </section>
}

function BookingsPageSkeleton() {
    return <div role="status" aria-label="Loading bookings" className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.8fr)_minmax(15rem,0.85fr)]">
        <div className="space-y-4"><Skeleton className="h-64 rounded-2xl" /><Skeleton className="h-64 rounded-2xl" /></div>
        <div className="space-y-4"><Skeleton className="h-32 rounded-2xl" /><Skeleton className="h-40 rounded-2xl" /></div>
    </div>
}
