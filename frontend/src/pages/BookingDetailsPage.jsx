import { useMemo, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'
import { ArrowLeft, Check, Circle, Download, Headphones, MapPin, MessageCircle, ShieldCheck, XCircle } from 'lucide-react'
import PageShell from '../components/layout/PageShell'
import Skeleton from '../components/UI/Skeleton'
import RetryButton from '../components/UI/RetryButton'
import Contact from '../features/properties/components/Contact'
import { useMyBookingDetails } from '../features/booking/hooks/useMyBookingDetails'
import { bookingServices } from '../features/booking/services/bookingServices'
import { formatDate } from '../lib/utils'
import { getPaymentRetryDetails } from '../features/booking/services/paymentRetryDetails'
import useUserStore from '../store/useUser'

const steps = ['Booked', 'Paid', 'Check-in', 'Stay', 'Complete']

export default function BookingDetailsPage() {
    const { bookingId } = useParams()
    const queryClient = useQueryClient()
    const { user } = useUser()
    const profilePhone = useUserStore((state) => state.phoneNumber)
    const { data: booking, isLoading, isError, refetch, isFetching } = useMyBookingDetails(bookingId)
    const [showContact, setShowContact] = useState(false)
    const [cancelError, setCancelError] = useState('')
    const [retryError, setRetryError] = useState('')
    const [disputeReason, setDisputeReason] = useState('')
    const [showDisputeForm, setShowDisputeForm] = useState(false)
    const retryPaymentMutation = useMutation({
        mutationFn: () => bookingServices.retryBookingPayment(bookingId, getPaymentRetryDetails(booking, user, profilePhone)),
        onSuccess: (response) => {
            if (response?.data?.state === 'success') {
                queryClient.invalidateQueries({ queryKey: ['my-booking', bookingId] })
                window.location.assign(`/bookings/${bookingId}/success`)
                return
            }
            const checkoutUrl = response?.data?.checkout_url
            if (typeof checkoutUrl === 'string' && checkoutUrl.startsWith('https://')) {
                window.location.assign(checkoutUrl)
                return
            }
            setRetryError('Could not create a secure payment link. Please try again.')
        },
        onError: (error) => setRetryError(error?.response?.data?.message || 'Could not retry this payment. Please try again.'),
    })
    const cancelMutation = useMutation({
        mutationFn: () => bookingServices.cancelBooking(bookingId),
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ['my-booking', bookingId] }),
                queryClient.invalidateQueries({ queryKey: ['my-bookings'] }),
            ])
        },
        onError: (error) => setCancelError(error?.response?.data?.message || 'Could not cancel this booking. Please try again.'),
    })
    const disputeMutation = useMutation({
        mutationFn: () => bookingServices.raiseDispute(bookingId, disputeReason.trim()),
        onSuccess: async () => {
            setShowDisputeForm(false)
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ['my-booking', bookingId] }),
                queryClient.invalidateQueries({ queryKey: ['my-bookings'] }),
            ])
        },
    })

    const bookingDates = useMemo(() => booking ? getBookingDates(booking.check_in_date, booking.check_out_date) : null, [booking])

    if (isLoading) return <PageShell><BookingDetailsSkeleton /></PageShell>
    if (isError || !booking) return <PageShell><div className="mx-auto flex min-h-[60vh] w-full max-w-5xl items-center justify-center gap-3 px-4 pt-20"><p role="alert" className="text-sm text-danger">Could not load this booking.</p><RetryButton onRetry={refetch} isRetrying={isFetching} /></div></PageShell>

    const property = booking.property || {}
    const host = property.host || {}
    const payment = booking.payment || {}
    const image = property.propertyImages?.[0]?.image_url
    const location = [property.city, property.country].filter(Boolean).join(', ') || 'Location unavailable'
    const total = Number(booking.total_price || payment.amount || 0)
    const isCancelled = ['CANCELLED', 'REFUNDED', 'REFUNDING'].includes(booking.booking_status)
    const isCompleted = booking.booking_status === 'COMPLETED'
    const isPaid = payment.payment_status === 'COMPLETED' || ['CONFIRMED', 'COMPLETED'].includes(booking.booking_status)
    const canRetryPayment = booking.booking_status === 'PENDING' && payment.payment_status === 'PENDING'
    const now = new Date()
    const checkIn = new Date(booking.check_in_date)
    const checkOut = new Date(booking.check_out_date)
    const currentStep = isCancelled ? -1 : isCompleted ? steps.length : now >= checkOut ? 4 : now >= checkIn ? 2 : isPaid ? 2 : 1
    const canCancel = ['PENDING', 'CONFIRMED'].includes(booking.booking_status) && now < checkIn

    const cancelBooking = () => {
        setCancelError('')
        if (window.confirm('Cancel this booking?')) cancelMutation.mutate()
    }

    const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`

    return <PageShell>
        <Contact showUserInfo={showContact} setShowUserInfo={setShowContact} property={property} />
        <div className="mx-auto w-full max-w-6xl px-4 pb-10 pt-20 sm:px-6 lg:px-8">
            <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-2 text-xs text-text-2">
                <Link to="/my-bookings" className="hover:text-primary">My bookings</Link><span>/</span><span className="font-semibold text-text">Booking {booking.booking_id.slice(0, 8).toUpperCase()}</span>
            </nav>

            <header className="mb-5">
                <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-2xl font-bold leading-tight text-text sm:text-3xl">{property.title || 'Your booking'}</h1>
                    <StatusBadge status={booking.booking_status} />
                </div>
                <p className="mt-1 text-sm text-text-2">{location} · Booking ref {booking.booking_id}</p>
            </header>

            <BookingProgress currentStep={currentStep} cancelled={isCancelled} />

            <div className="mt-5 grid items-start gap-5 lg:grid-cols-[minmax(0,1.65fr)_minmax(17rem,0.85fr)]">
                <div className="space-y-4">
                    <section className="rounded-2xl border border-border bg-bg p-4 sm:p-5">
                        <h2 className="font-bold text-text">Your stay</h2>
                        <div className="mt-3 grid gap-4 sm:grid-cols-[9rem_1fr]">
                            <div className="h-28 overflow-hidden rounded-xl bg-gradient-to-br from-primary/15 via-bg-2 to-secondary/25">
                                {image && <img src={image} alt={property.title || 'Booked property'} className="h-full w-full object-cover" />}
                            </div>
                            <div className="grid grid-cols-2 gap-4 content-center">
                                <Fact label="Check-in" value={formatDate(booking.check_in_date)} detail="Confirm time with host" />
                                <Fact label="Check-out" value={formatDate(booking.check_out_date)} detail="Confirm time with host" />
                                <Fact label="Length" value={`${bookingDates.nights} ${bookingDates.nights === 1 ? 'night' : 'nights'}`} />
                                <Fact label="Guests" value={`${booking.guest_count || 1} ${Number(booking.guest_count || 1) === 1 ? 'guest' : 'guests'}`} />
                            </div>
                        </div>
                    </section>

                    <section className="rounded-2xl border border-border bg-bg p-4 sm:p-5">
                        <h2 className="font-bold text-text">Getting there</h2>
                        <a href={directionsUrl} target="_blank" rel="noreferrer" aria-label={`Get directions to ${location}`} className="mt-3 flex h-32 items-end rounded-xl bg-gradient-to-br from-primary/15 via-bg-2 to-secondary/25 p-3 transition hover:brightness-95">
                            <span className="rounded-full bg-bg/90 px-2.5 py-1 text-[10px] font-semibold text-text-2"><MapPin className="mr-1 inline size-3 text-primary" />Approximate area</span>
                        </a>
                        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                            <div><p className="text-sm font-semibold text-text">{location}</p><p className="text-xs text-text-2">Exact address can be confirmed with your host.</p></div>
                            <a href={directionsUrl} target="_blank" rel="noreferrer" className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-button-text hover:brightness-95">Get directions</a>
                        </div>
                    </section>

                    <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-bg p-4 sm:p-5">
                        <div className="flex items-center gap-3">
                            <div aria-hidden="true" className="grid size-10 place-items-center rounded-full bg-amber-500 font-bold text-amber-950">H</div>
                            <div><h2 className="font-bold text-text">Your host</h2><p className="text-sm font-semibold text-text">{host.name || 'Host name unavailable'}</p><p className="text-xs text-text-2">{host.is_verified_host ? 'Verified host' : 'Your property host'}</p></div>
                        </div>
                        <button type="button" onClick={() => setShowContact(true)} className="rounded-lg border border-border px-4 py-2 text-xs font-semibold text-text transition hover:border-primary hover:text-primary">Contact host</button>
                    </section>

                    <section className="rounded-2xl border border-border bg-bg p-4 sm:p-5">
                        <h2 className="font-bold text-text">House rules and cancellation</h2>
                        <div className="mt-3 grid gap-4 text-xs sm:grid-cols-2">
                            <div><h3 className="font-semibold text-text">Stay length</h3><p className="mt-1 text-text-2">{property.min_stay_duration || 1} to {property.max_stay_duration || 30} nights</p></div>
                            <div><h3 className="font-semibold text-text">Cancellation</h3><p className="mt-1 text-text-2">Refund eligibility depends on cancellation timing and payment status.</p></div>
                        </div>
                    </section>
                </div>

                <aside className="space-y-4 lg:sticky lg:top-20">
                    <section className="rounded-2xl border border-border bg-bg p-4 sm:p-5">
                        <div className="flex items-center justify-between gap-2"><h2 className="font-bold text-text">Payment</h2><ShieldCheck size={17} className="text-primary" /></div>
                        <div className="mt-3 space-y-3 text-xs">
                            <PaymentRow label={`ETB ${Number(property.price_per_night || 0).toLocaleString()} × ${bookingDates.nights} nights`} value={`ETB ${total.toLocaleString()}`} />
                            <PaymentRow label="Service and cleaning fees" value={`ETB ${Math.max(0, total - Number(property.price_per_night || 0) * bookingDates.nights).toLocaleString()}`} />
                            <PaymentRow label="Paid with" value={payment.payment_method || 'Payment method unavailable'} />
                            <PaymentRow label="Payment status" value={payment.payment_status || booking.booking_status} />
                            {payment.transaction_reference && <PaymentRow label="Payment reference" value={payment.transaction_reference} />}
                            <div className="flex items-center justify-between border-t border-border pt-3 font-bold text-text"><span>{isPaid ? 'Total paid' : 'Total'}</span><span className="text-primary">ETB {total.toLocaleString()}</span></div>
                        </div>
                        <button type="button" onClick={() => window.print()} className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"><Download size={14} />Print / save receipt</button>
                    {canRetryPayment && <div className="mt-4 rounded-xl border border-secondary/30 bg-secondary/5 p-3">
                        <p className="text-sm font-semibold text-text">Payment is still pending</p>
                        <p className="mt-1 text-xs leading-5 text-text-2">Continue to secure checkout to retry payment for this booking.</p>
                        <button type="button" onClick={() => { setRetryError(''); retryPaymentMutation.mutate() }} disabled={retryPaymentMutation.isPending} className="mt-3 w-full rounded-lg bg-secondary px-3 py-2.5 text-sm font-bold text-on-secondary disabled:opacity-60">{retryPaymentMutation.isPending ? 'Preparing payment…' : 'Retry payment'}</button>
                        {retryError && <p role="alert" className="mt-2 text-xs text-danger">{retryError}</p>}
                    </div>}
                    </section>

                    <section className="rounded-2xl border border-border bg-bg p-4 sm:p-5">
                        <h2 className="font-bold text-text">Manage booking</h2>
                        <div className="mt-3 space-y-2">
                            <button type="button" onClick={() => setShowContact(true)} className="flex w-full items-center justify-center gap-2 rounded-lg border border-border px-3 py-2.5 text-xs font-semibold text-text transition hover:border-primary hover:text-primary"><MessageCircle size={14} />Message host</button>
                            <button type="button" onClick={() => setShowContact(true)} className="block w-full rounded-lg border border-border px-3 py-2.5 text-center text-xs font-semibold text-text transition hover:border-primary hover:text-primary">Ask host about a change</button>
                            {booking.booking_status === 'CONFIRMED' && <button type="button" onClick={() => setShowDisputeForm((open) => !open)} className="block w-full rounded-lg border border-border px-3 py-2.5 text-center text-xs font-semibold text-text transition hover:border-primary hover:text-primary">Report a booking issue</button>}
                            {showDisputeForm && <form onSubmit={(event) => { event.preventDefault(); disputeMutation.mutate() }} className="grid gap-2 rounded-lg border border-border bg-bg-2 p-3">
                                <label htmlFor="dispute-reason" className="text-xs font-semibold text-text">What happened?</label>
                                <textarea id="dispute-reason" required maxLength={1000} value={disputeReason} onChange={(event) => setDisputeReason(event.target.value)} rows={3} className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-xs text-text" />
                                <button type="submit" disabled={disputeMutation.isPending || !disputeReason.trim()} className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-button-text disabled:opacity-50">{disputeMutation.isPending ? 'Sending…' : 'Send to support'}</button>
                                {disputeMutation.isError && <p role="alert" className="text-xs text-danger">{disputeMutation.error?.response?.data?.message || 'Could not report this issue. Please retry.'}</p>}
                            </form>}
                            {canCancel && <button type="button" onClick={cancelBooking} disabled={cancelMutation.isPending} className="flex w-full items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-danger transition hover:bg-danger/5 disabled:opacity-60"><XCircle size={14} />{cancelMutation.isPending ? 'Cancelling…' : 'Cancel booking'}</button>}
                            {isCancelled && <p className="rounded-lg bg-bg-2 px-3 py-2 text-center text-xs text-text-2">This booking has been cancelled.</p>}
                            {cancelError && <p role="alert" className="text-center text-xs text-danger">{cancelError}</p>}
                        </div>
                    </section>

                    <section className="rounded-2xl bg-primary p-4 text-white">
                        <div className="flex items-center gap-2"><Headphones size={17} /><h2 className="text-sm font-bold">Need help with this booking?</h2></div>
                        <p className="mt-1 text-xs leading-5 text-white/80">Our support team can help with check-ins, changes and host communication.</p>
                        <a href="mailto:hello@zemenrentals.com" className="mt-3 block rounded-lg bg-bg px-3 py-2.5 text-center text-xs font-semibold text-primary transition hover:brightness-95">Contact help centre</a>
                    </section>
                </aside>
            </div>
            <div className="mt-5"><Link to="/my-bookings" className="inline-flex items-center gap-2 text-xs font-semibold text-text-2 hover:text-primary"><ArrowLeft size={14} />Back to my bookings</Link></div>
        </div>
    </PageShell>
}

function StatusBadge({ status }) {
    const cancelled = ['CANCELLED', 'REFUNDED', 'REFUNDING'].includes(status)
    return <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${cancelled ? 'bg-danger/10 text-danger' : 'bg-primary/10 text-primary'}`}>{status.replaceAll('_', ' ')}</span>
}

function BookingProgress({ currentStep, cancelled }) {
    return <ol aria-label="Booking progress" className="grid grid-cols-5 rounded-2xl border border-border bg-bg px-2 py-3 sm:px-5">
        {steps.map((step, index) => {
            const done = !cancelled && index < currentStep
            const active = !cancelled && index === currentStep
            return <li key={step} className="flex flex-col items-center gap-1 text-center">
                <span className={`grid size-5 place-items-center rounded-full ${done ? 'bg-primary text-white' : active ? 'border-2 border-secondary bg-bg text-secondary' : 'bg-neutral text-text-2'}`}>{done ? <Check size={12} /> : <Circle size={8} fill="currentColor" />}</span>
                <span className={`text-[9px] font-semibold ${active ? 'text-text' : done ? 'text-primary' : 'text-text-2'}`}>{step}</span>
            </li>
        })}
        {cancelled && <span className="col-span-5 mt-2 text-center text-xs font-semibold text-danger">Booking cancelled</span>}
    </ol>
}

function Fact({ label, value, detail }) {
    return <div><p className="text-[9px] font-bold uppercase tracking-wide text-text-2">{label}</p><p className="mt-0.5 text-xs font-semibold text-text">{value}</p>{detail && <p className="mt-0.5 text-[10px] text-text-2">{detail}</p>}</div>
}

function PaymentRow({ label, value }) {
    return <div className="flex items-start justify-between gap-4"><span className="text-text-2">{label}</span><span className="max-w-[60%] break-all text-right font-semibold text-text">{value}</span></div>
}

function getBookingDates(checkIn, checkOut) {
    const start = new Date(checkIn)
    const end = new Date(checkOut)
    const nights = Math.max(1, Math.round((end - start) / 86_400_000))
    return { nights }
}

function BookingDetailsSkeleton() {
    return <div role="status" aria-label="Loading booking details" className="mx-auto w-full max-w-6xl space-y-5 px-4 pb-10 pt-24 sm:px-6 lg:px-8">
        <Skeleton className="h-7 w-2/3 max-w-lg" /><Skeleton className="h-12 rounded-2xl" />
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.65fr)_minmax(17rem,0.85fr)]"><div className="space-y-4"><Skeleton className="h-44 rounded-2xl" /><Skeleton className="h-56 rounded-2xl" /><Skeleton className="h-28 rounded-2xl" /><Skeleton className="h-28 rounded-2xl" /></div><div className="space-y-4"><Skeleton className="h-64 rounded-2xl" /><Skeleton className="h-40 rounded-2xl" /><Skeleton className="h-32 rounded-2xl" /></div></div>
    </div>
}
