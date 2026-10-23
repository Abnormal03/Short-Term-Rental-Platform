import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'
import { Check, Circle, Clock3, Download, MapPin, MessageCircle, X } from 'lucide-react'
import CheckoutShell from '../components/layout/CheckoutShell'
import Skeleton from '../components/UI/Skeleton'
import RetryButton from '../components/UI/RetryButton'
import Contact from '../features/properties/components/Contact'
import { bookingServices } from '../features/booking/services/bookingServices'
import { useMyBookingDetails } from '../features/booking/hooks/useMyBookingDetails'
import { formatDate } from '../lib/utils'
import { getPaymentRetryDetails } from '../features/booking/services/paymentRetryDetails'
import useUserStore from '../store/useUser'

const stages = ['Review', 'Pay', 'Confirmation']
const PAYMENT_CHECK_WINDOW_MS = 5 * 60 * 1000
const PAYMENT_CHECK_INTERVAL_MS = 60 * 1000

export function BookingConfirmationPage() {
    const { bookingId } = useParams()
    const location = useLocation()
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const { user } = useUser()
    const profilePhone = useUserStore((state) => state.phoneNumber)
    const [pollingStartedAt, setPollingStartedAt] = useState(() => Date.now())
    const [timedOut, setTimedOut] = useState(false)
    const [cancelError, setCancelError] = useState('')
    const confirmation = useQuery({
        queryKey: ['booking-payment-confirmation', bookingId],
        queryFn: async () => (await bookingServices.confirmBookingPayment(bookingId, new URLSearchParams(location.search).get('status'))).data,
        enabled: Boolean(bookingId),
        refetchInterval: (query) => { const remaining = PAYMENT_CHECK_WINDOW_MS - (Date.now() - pollingStartedAt); return query.state.data?.state === 'pending' && remaining > 0 ? Math.min(PAYMENT_CHECK_INTERVAL_MS, remaining) : false },
    })

    useEffect(() => {
        setTimedOut(false)
        const remaining = Math.max(0, PAYMENT_CHECK_WINDOW_MS - (Date.now() - pollingStartedAt))
        const timeout = window.setTimeout(() => setTimedOut(true), remaining)
        return () => window.clearTimeout(timeout)
    }, [pollingStartedAt])

    useEffect(() => {
        const result = confirmation.data
        if (!result?.booking) return
        queryClient.setQueryData(['my-booking', bookingId], result.booking)
        if (['success', 'failed', 'cancelled'].includes(result.state)) {
            navigate(`/bookings/${bookingId}/${result.state}`, { replace: true })
        }
    }, [confirmation.data, bookingId, navigate, queryClient])

    const retryPayment = useMutation({
        mutationFn: (paymentDetails) => bookingServices.retryBookingPayment(bookingId, paymentDetails),
        onSuccess: (response) => {
            if (response?.data?.state === 'success') {
                navigate(`/bookings/${bookingId}/success`, { replace: true })
                return
            }
            const checkoutUrl = response?.data?.checkout_url
            if (typeof checkoutUrl === 'string' && checkoutUrl.startsWith('https://')) {
                window.location.assign(checkoutUrl)
                return
            }
            setCancelError('Could not create a new secure payment link. Please check your booking details and retry.')
        },
        onError: (error) => setCancelError(error?.response?.data?.message || 'Could not retry this payment. Please try again.'),
    })
    const cancelBooking = useMutation({
        mutationFn: () => bookingServices.cancelBooking(bookingId),
        onSuccess: async (response) => {
            const cancelledBooking = response?.data?.canceledBooking
            if (cancelledBooking) queryClient.setQueryData(['my-booking', bookingId], cancelledBooking)
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ['my-booking', bookingId] }),
                queryClient.invalidateQueries({ queryKey: ['my-bookings'] }),
            ])
            navigate(`/bookings/${bookingId}/cancelled`, { replace: true })
        },
        onError: (error) => setCancelError(error?.response?.data?.message || 'Could not cancel this booking. Please try again.'),
    })

    const checkAgain = () => {
        setCancelError('')
        setPollingStartedAt(Date.now())
        confirmation.refetch()
    }
    const waitingTooLong = timedOut && (!confirmation.data || confirmation.data.state === 'pending')
    const reference = confirmation.data?.booking?.payment?.transaction_reference

    return <CheckoutShell>
        <div className="min-h-[calc(100vh-4rem)] bg-bg-2 px-4 pb-10 pt-4 text-text sm:px-6">
            <div className="mx-auto max-w-6xl">
                <CheckoutHeader stage="Confirmation" />
                <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(17rem,0.8fr)]">
                    <section className="rounded-2xl border border-border bg-bg p-6 shadow-sm sm:p-9">
                        {waitingTooLong ? <>
                            <span className="grid size-12 place-items-center rounded-full bg-secondary/15 text-secondary"><Clock3 size={24} /></span>
                            <h1 className="mt-4 text-2xl font-bold sm:text-3xl">This is taking longer than usual</h1>
                            <p className="mt-2 text-base leading-7 text-text-2">We have not received payment confirmation yet. Check again or retry if your last attempt did not complete. Avoid approving more than one payment.</p>
                            <ol className="mt-5 grid gap-3 text-sm">
                                <ProgressItem done label="Returned from the payment screen" />
                                <ProgressItem active label="Waiting for payment confirmation" />
                                <ProgressItem label="Confirming your booking" />
                            </ol>
                            {reference && <p className="mt-5 text-xs text-text-2">Reference: {reference}</p>}
                            {(cancelError || retryPayment.error) && <p role="alert" className="mt-3 text-sm text-danger">{cancelError || retryPayment.error?.response?.data?.message || "Could not retry payment."}</p>}
                            <div className="mt-5 flex flex-wrap gap-2">
                                <button type="button" onClick={() => retryPayment.mutate(getPaymentRetryDetails(confirmation.data.booking, user, profilePhone))} disabled={!confirmation.data?.booking || confirmation.isFetching || retryPayment.isPending || cancelBooking.isPending} className="rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-text disabled:opacity-60">{retryPayment.isPending ? "Preparing…" : "Retry payment"}</button>
                                <button type="button" onClick={checkAgain} disabled={confirmation.isFetching || cancelBooking.isPending} className="rounded-lg bg-secondary px-4 py-2.5 text-sm font-bold text-on-secondary disabled:opacity-60">{confirmation.isFetching ? 'Checking…' : 'Check again'}</button>
                                <Link to="/my-bookings" className="rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-text">View my bookings</Link>
                                <button type="button" onClick={() => { setCancelError(''); cancelBooking.mutate() }} disabled={confirmation.isFetching || cancelBooking.isPending} className="rounded-lg border border-danger/30 px-4 py-2.5 text-sm font-semibold text-danger disabled:opacity-60">{cancelBooking.isPending ? 'Cancelling…' : 'Cancel booking'}</button>
                                <a href="mailto:hello@zemenrentals.com" className="px-2 py-2.5 text-sm font-semibold text-primary underline">Contact support</a>
                            </div>
                        </> : confirmation.isError ? <>
                            <span className="grid size-12 place-items-center rounded-full bg-danger/10 text-danger"><X size={25} /></span>
                            <h1 className="mt-4 text-xl font-bold">We couldn’t verify your payment yet</h1>
                            <p className="mt-2 text-sm leading-6 text-text-2">Your booking remains unchanged while we reconnect to the payment provider. Retry the check in a moment.</p>
                            <RetryButton onRetry={confirmation.refetch} isRetrying={confirmation.isFetching} label="Check payment again" />
                        </> : <>
                            <span className="mx-auto block size-10 animate-spin rounded-full border-[3px] border-border border-t-secondary" />
                            <h1 className="mt-4 text-xl font-bold">Verifying your payment…</h1>
                            <p className="mt-2 text-sm leading-6 text-text-2">Welcome back. We’re verifying your payment and confirming your booking. This usually takes a few seconds.</p>
                            <ol className="mx-auto mt-6 grid max-w-xs gap-3 text-left text-xs">
                                <ProgressItem done label="Returned from the payment screen" />
                                <ProgressItem active label="Verifying your payment" />
                                <ProgressItem label="Confirming your booking" />
                            </ol>
                            {reference && <p className="mt-5 text-xs text-text-2">Reference: {reference}</p>}
                            <p className="mt-2 text-xs text-text-2">We’ll check for payment updates for up to five minutes.</p>
                        </>}
                    </section>
                    <PaymentBookingSummary booking={confirmation.data?.booking} />
                </div>
            </div>
        </div>
    </CheckoutShell>
}

export function BookingPaymentResultPage() {
    const { bookingId } = useParams()
    const location = useLocation()
    const [showContact, setShowContact] = useState(false)
    const { data: booking, isLoading, isError, refetch, isFetching } = useMyBookingDetails(bookingId)
    const result = location.pathname.split('/').at(-1)

    if (isLoading) return <CheckoutShell><ResultSkeleton /></CheckoutShell>
    if (isError || !booking) return <CheckoutShell><div className="mx-auto flex min-h-[60vh] items-center justify-center gap-3 px-4 pt-4"><p role="alert" className="text-sm text-danger">Could not load your payment result.</p><RetryButton onRetry={refetch} isRetrying={isFetching} /></div></CheckoutShell>

    const property = booking.property || {}
    const payment = booking.payment || {}
    const nights = getNights(booking.check_in_date, booking.check_out_date)
    const total = Number(booking.total_price || payment.amount || 0)
    const nightlySubtotal = Number(property.price_per_night || 0) * nights
    const fees = Math.max(0, total - nightlySubtotal)
    const isSuccess = result === 'success'
    const isCancelled = result === 'cancelled'
    const title = isSuccess ? 'Your stay is confirmed' : isCancelled ? 'You cancelled the payment' : 'Payment didn’t go through'
    const confirmationContact = [booking.user?.email, booking.user?.phone_number].filter(Boolean).join(' and ')
    const description = isSuccess
        ? `Your payment was confirmed${confirmationContact ? `. We sent your confirmation to ${confirmationContact}` : ''}.`
        : isCancelled
            ? 'No payment was confirmed. Your booking is not active; you can return to the property and choose another payment method.'
            : 'We couldn’t complete your payment, so your booking has not been confirmed.'
    const checkoutParams = new URLSearchParams({ checkIn: toDateInput(booking.check_in_date), checkOut: toDateInput(booking.check_out_date), guests: String(booking.guest_count || 1) })
    const checkoutUrl = `/properties/${booking.property_id}/checkout?${checkoutParams.toString()}&paymentMethod=${encodeURIComponent(payment.payment_method || 'telebirr')}`
    const differentPaymentUrl = `/properties/${booking.property_id}/checkout?${checkoutParams.toString()}`
    const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([property.city, property.country].filter(Boolean).join(', '))}`

    return <CheckoutShell>
        <Contact showUserInfo={showContact} setShowUserInfo={setShowContact} property={property} />
        <div className="min-h-[calc(100vh-4rem)] bg-bg-2 px-4 pb-10 pt-4 text-text sm:px-6">
            <div className="mx-auto max-w-6xl">
                <CheckoutHeader stage="Confirmation" result={result} />
                {isSuccess ? <>
                    <header className="mx-auto mt-7 max-w-xl text-center">
                        <span className="mx-auto grid size-14 place-items-center rounded-full bg-primary/10 text-primary"><Check size={28} /></span>
                        <h1 className="mt-4 text-2xl font-bold sm:text-3xl">{title}</h1>
                        <p className="mt-2 text-sm leading-6 text-text-2">{description}</p>
                        <p className="mt-3 inline-flex rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">Booking ref {booking.booking_id}</p>
                    </header>
                    <section className="mx-auto mt-5 max-w-2xl rounded-2xl border border-border bg-bg p-5 shadow-sm">
                        <h2 className="font-bold">Booking receipt</h2>
                        <ReceiptRow label="Property" value={`${property.title || 'Stay'}, ${property.city || ''}`} />
                        <ReceiptRow label="Dates" value={`${formatDate(booking.check_in_date)} – ${formatDate(booking.check_out_date)} · ${nights} nights`} />
                        <ReceiptRow label="Guests" value={`${booking.guest_count || 1}`} />
                        <ReceiptRow label="Paid with" value={payment.payment_method || 'Payment provider'} />
                        <ReceiptRow label="Payment reference" value={payment.transaction_reference || 'Unavailable'} />
                        <ReceiptRow label="Total paid" value={`ETB ${total.toLocaleString()}`} strong />
                    </section>
                    <section className="mx-auto mt-5 max-w-2xl">
                        <h2 className="mb-3 font-bold">What’s next</h2>
                        <div className="grid gap-3 sm:grid-cols-3">
                            <NextAction icon={<MessageCircle size={16} />} title="Message your host" text="Share your arrival time." onClick={() => setShowContact(true)} />
                            <NextAction href={directionsUrl} target="_blank" rel="noreferrer" icon={<MapPin size={16} />} title="Get directions" text="Open directions to the area." />
                            <button type="button" onClick={() => window.print()}><NextAction icon={<Download size={16} />} title="Download receipt" text="Print or save a copy." /></button>
                        </div>
                    </section>
                    <div className="mt-5 flex flex-wrap justify-center gap-3">
                        <Link to="/my-bookings" className="rounded-lg bg-secondary px-5 py-2.5 text-sm font-bold text-on-secondary">View my bookings</Link>
                        <Link to="/explore" className="rounded-lg border border-border bg-bg px-5 py-2.5 text-sm font-semibold text-text">Back to explore</Link>
                    </div>
                </> : <div className="mt-8 grid items-start gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(17rem,0.8fr)]">
                    <section className="rounded-2xl border border-border bg-bg p-6 shadow-sm sm:p-8">
                        <span className={`grid size-12 place-items-center rounded-full ${isCancelled ? 'bg-neutral text-text-2' : 'bg-danger/10 text-danger'}`}>{isCancelled ? <X size={23} /> : <X size={23} />}</span>
                        <h1 className="mt-4 text-xl font-bold sm:text-2xl">{title}</h1>
                        <p className="mt-2 text-sm leading-6 text-text-2">{description}</p>
                        {!isCancelled && <div className="mt-4 rounded-xl border border-danger/20 bg-danger/5 p-3 text-xs text-danger">Reason: {payment.payment_status === 'FAILED' ? 'The payment provider reported that the payment failed.' : 'The payment could not be verified as complete.'}</div>}
                        {!isCancelled && <ul className="mt-4 list-disc space-y-1 pl-5 text-xs leading-5 text-text-2"><li>Your bank or wallet may have declined the payment.</li><li>The payment may have timed out before approval.</li><li>Your connection may have been interrupted.</li></ul>}
                        <div className="mt-5 flex flex-wrap gap-2">
                            <Link to={checkoutUrl} className="rounded-lg bg-secondary px-4 py-2.5 text-xs font-bold text-on-secondary">{isCancelled ? 'Resume payment' : `Try again with ${payment.payment_method || 'payment'}`}</Link>
                            <Link to={differentPaymentUrl} className="rounded-lg border border-border px-4 py-2.5 text-xs font-semibold text-text">Choose a different method</Link>
                            <a href="mailto:hello@zemenrentals.com" className="px-2 py-2.5 text-sm font-semibold text-primary underline">Contact support</a>
                        </div>
                        <p className="mt-4 text-[0.68rem] leading-5 text-text-2">If you were charged, contact support with payment reference {payment.transaction_reference || 'not available'}.</p>
                        {isCancelled && <Link to="/explore" className="mt-3 inline-block text-xs font-semibold text-primary underline">Back to explore</Link>}
                    </section>
                    <PaymentBookingSummary booking={booking} />
                </div>}
            </div>
        </div>
    </CheckoutShell>
}

function CheckoutHeader({ stage, result }) {
    const current = ['failed', 'cancelled'].includes(result) ? 1 : result === 'success' || stage === 'Confirmation' ? 2 : 0
    return <header className="relative left-1/2 flex w-screen max-w-[100vw] -translate-x-1/2 flex-wrap items-center justify-between gap-4 border-b border-border bg-bg px-4 pb-4 pt-2 sm:px-8">
        <Link to="/" className="font-bold text-primary">Betoch</Link>
        <ol aria-label="Checkout progress" className="flex items-center gap-2 sm:gap-4">
            {stages.map((label, index) => {
                const done = index < current || (result === 'success' && index === current)
                const active = index === current && !done
                const failedPay = ['failed', 'cancelled'].includes(result) && index === current
                return <li key={label} className="flex items-center gap-1 text-xs font-semibold sm:gap-2 sm:text-sm"><span className={`grid size-5 place-items-center rounded-full ${done ? 'bg-primary text-white' : failedPay && active ? 'bg-danger text-white' : active ? 'bg-secondary text-on-secondary' : 'bg-neutral text-text-2'}`}>{done ? <Check size={12} /> : failedPay && active ? <X size={11} /> : <Circle size={9} />}</span><span className={active ? 'text-text' : 'text-text-2'}>{label}</span>{index < 2 && <span className="mx-1 h-px w-3 bg-border sm:w-8" />}</li>
            })}
        </ol>
        <span className="text-xs font-semibold text-text-2">Secure checkout</span>
    </header>
}

function ProgressItem({ done = false, active = false, label }) {
    return <li className={`flex items-center gap-2 ${active ? 'font-semibold text-text' : 'text-text-2'}`}>{done ? <Check size={14} className="text-primary" /> : active ? <span className="grid size-3.5 place-items-center rounded-full bg-secondary text-[8px] font-bold text-on-secondary">•</span> : <Circle size={13} className="text-neutral" />}<span>{label}</span></li>
}

function PaymentBookingSummary({ booking }) {
    if (!booking) return <aside className="space-y-3 rounded-2xl border border-border bg-bg p-4"><Skeleton className="h-16 rounded-xl" /><Skeleton className="h-36 rounded-xl" /></aside>
    const property = booking.property || {}
    const payment = booking.payment || {}
    const nights = getNights(booking.check_in_date, booking.check_out_date)
    const total = Number(booking.total_price || payment.amount || 0)
    const stayCost = Number(property.price_per_night || 0) * nights
    const fees = Math.max(0, total - stayCost)
    const image = property.propertyImages?.[0]?.image_url
    return <aside className="rounded-2xl border border-border bg-bg p-4 shadow-sm">
        <div className="flex gap-3"><div className="size-14 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-primary/15 via-bg-2 to-secondary/25">{image && <img src={image} alt={property.title || 'Property'} className="h-full w-full object-cover" />}</div><div className="min-w-0"><h2 className="line-clamp-2 text-xs font-bold">{property.title || 'Property'}</h2><p className="text-[0.62rem] text-text-2">{property.city}, {property.country}</p></div></div>
        <div className="mt-3 grid grid-cols-3 gap-2 border-y border-border py-3 text-[0.55rem]"><MiniFact label="Check-in" value={formatDate(booking.check_in_date)} /><MiniFact label="Check-out" value={formatDate(booking.check_out_date)} /><MiniFact label="Guests" value={String(booking.guest_count || 1)} /></div>
        <div className="mt-3 space-y-2 text-[0.65rem]"><SummaryRow label={`ETB ${Number(property.price_per_night || 0).toLocaleString()} × ${nights} nights`} value={`ETB ${stayCost.toLocaleString()}`} />{fees >= 1300 ? <><SummaryRow label="Service fee" value="ETB 500" /><SummaryRow label="Cleaning fee" value="ETB 800" /></> : <SummaryRow label="Service and cleaning fees" value={`ETB ${fees.toLocaleString()}`} />}<div className="flex justify-between border-t border-border pt-2 font-bold"><span>Total</span><span className="text-primary">ETB {total.toLocaleString()}</span></div></div>
    </aside>
}

function MiniFact({ label, value }) { return <div><p className="font-bold uppercase text-text-2">{label}</p><p className="mt-1 font-semibold text-text">{value}</p></div> }
function SummaryRow({ label, value }) { return <div className="flex justify-between gap-2 text-text-2"><span>{label}</span><span className="font-semibold text-text">{value}</span></div> }
function ReceiptRow({ label, value, strong = false }) { return <div className={`flex justify-between gap-3 border-b border-border py-2.5 text-xs last:border-0 ${strong ? 'font-bold' : ''}`}><span className="text-text-2">{label}</span><span className="text-right text-text">{value}</span></div> }

function NextAction({ icon, title, text, onClick, href, target, rel }) {
    const content = <><span className="text-primary">{icon}</span><h3 className="mt-2 text-xs font-bold text-text">{title}</h3><p className="mt-1 text-[0.65rem] leading-4 text-text-2">{text}</p></>
    const className = 'h-full w-full rounded-xl border border-border bg-bg p-3 text-left transition hover:border-primary/50'
    return href
        ? <a href={href} target={target} rel={rel} className={className}>{content}</a>
        : <button type="button" onClick={onClick} className={className}>{content}</button>
}

function ResultSkeleton() { return <div role="status" className="mx-auto max-w-6xl space-y-5 px-4 pb-10 pt-4"><Skeleton className="h-10" /><div className="grid gap-5 lg:grid-cols-[1.4fr_0.8fr]"><Skeleton className="h-80 rounded-2xl" /><Skeleton className="h-60 rounded-2xl" /></div></div> }
function getNights(checkIn, checkOut) { return Math.max(1, Math.round((new Date(checkOut) - new Date(checkIn)) / 86_400_000)) }
function toDateInput(value) { const date = new Date(value); return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 10) }

