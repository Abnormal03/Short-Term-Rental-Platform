import { useEffect, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'
import { Check, Circle, Landmark, LockKeyhole, MapPin, Smartphone } from 'lucide-react'
import CheckoutShell from '../components/layout/CheckoutShell'
import Skeleton from '../components/UI/Skeleton'
import RetryButton from '../components/UI/RetryButton'
import usePropertyDetails from '../features/properties/hooks/usePropertyDetails'
import useInitializeBooking from '../features/booking/hooks/useInitializeBooking'
import { bookingServices } from '../features/booking/services/bookingServices'
import useUserStore from '../store/useUser'
import { useProfile } from '../features/profile/hooks/useProfile'
import { formatDate } from '../lib/utils'

const SERVICE_FEE = 500
const CLEANING_FEE = 800
const PAYMENT_METHODS = [
    { id: 'telebirr', label: 'Telebirr', icon: Smartphone },
    { id: 'cbe', label: 'CBE Birr', icon: Landmark },
    { id: 'awash', label: 'Awash Bank', icon: Landmark },
]

export default function CheckoutReviewPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const [params] = useSearchParams()
    const location = useLocation()
    const { data: property, isLoading, isError, refetch, isFetching } = usePropertyDetails(id)
    const { isSignedIn, user } = useUser()
    const profilePhone = useUserStore((state) => state.phoneNumber)
    const accountProfile = useProfile({ enabled: Boolean(isSignedIn) })
    const [paymentMethod, setPaymentMethod] = useState(params.get('paymentMethod') || 'telebirr')
    const [hasChosenPaymentMethod, setHasChosenPaymentMethod] = useState(Boolean(params.get('paymentMethod')))
    const [fullName, setFullName] = useState('')
    const [phoneNumber, setPhoneNumber] = useState('')
    const accountName = fullName || [user?.firstName, user?.lastName].filter(Boolean).join(' ')
    const accountPhone = phoneNumber || profilePhone || ''
    const [agreedToPolicy, setAgreedToPolicy] = useState(false)
    const [accountError, setAccountError] = useState('')
    const [paymentError, setPaymentError] = useState('')
    const [paymentCheckoutUrl, setPaymentCheckoutUrl] = useState('')
    const [paymentBookingId, setPaymentBookingId] = useState('')
    useEffect(() => {
        const preference = accountProfile.data?.user?.payment_preference
        if (hasChosenPaymentMethod || !preference) return
        const preferredMethod = { TELEBIRR: 'telebirr', CBEBIRR: 'cbe', AWASH: 'awash' }[preference]
        if (preferredMethod) setPaymentMethod(preferredMethod)
    }, [accountProfile.data?.user?.payment_preference, hasChosenPaymentMethod])
    const initialize = useInitializeBooking()
    const cancelPendingBooking = useMutation({
        mutationFn: () => bookingServices.cancelBooking(paymentBookingId),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['my-bookings'] })
            navigate(`/bookings/${paymentBookingId}/cancelled`, { replace: true })
        },
        onError: (error) => setPaymentError(error?.response?.data?.message || 'Could not cancel the pending booking. Please retry.'),
    })

    const checkIn = params.get('checkIn') || location.state?.checkIn || ''
    const checkOut = params.get('checkOut') || location.state?.checkOut || ''
    const guestCount = Number(params.get('guests') || location.state?.guests || 1)
    const nights = getNights(checkIn, checkOut)

    const startPayment = async () => {
        setAccountError('')
        setPaymentError('')
        setPaymentCheckoutUrl('')
        setPaymentBookingId('')
        if (!isSignedIn) {
            setAccountError('Sign in as a guest to continue to payment.')
            return
        }
        if (!accountName.trim()) {
            setAccountError('Enter your full name to continue.')
            return
        }
        if (!accountPhone.trim()) {
            setAccountError('Enter a phone number to continue.')
            return
        }
        if (!agreedToPolicy) {
            setPaymentError('Please agree to the house rules, cancellation policy, and terms of service.')
            return
        }
        const email = user?.primaryEmailAddress?.emailAddress
        if (!email) {
            setAccountError('A primary email address is required before booking.')
            return
        }
        const checkInOverride = property?.availabilityOverrides?.find((item) => toDateInput(item.date) === checkIn)
        const minimumStay = Math.max(1, Number(checkInOverride?.min_stay_duration) || Number(property?.min_stay_duration) || 1)
        const maximumStay = Number(property?.max_stay_duration) || 30
        const today = getTodayDateInput()
        if (!checkIn || !checkOut || checkIn < today || nights < minimumStay || nights > maximumStay || !guestCount || isDateRangeUnavailable(property, checkIn, checkOut)) {
            setPaymentError('Your dates or guest count are invalid. Return to the property page and review your stay.')
            return
        }

        const total = getStayAmount(property, checkIn, checkOut) + SERVICE_FEE + CLEANING_FEE
        initialize.mutate({
            booking: {
                checkInDate: new Date(`${checkIn}T12:00:00`),
                checkOutDate: new Date(`${checkOut}T12:00:00`),
                totalPrice: total,
                paymentMethod,
                guests: guestCount,
            },
            paymentDetails: {
                price: total,
                email,
                first_name: accountName.trim().split(/\s+/)[0] || 'Guest',
                last_name: accountName.trim().split(/\s+/).slice(1).join(' '),
                phone_number: accountPhone,
            },
            propertyId: id,
        }, {
            onSuccess: (result) => {
                const checkoutUrl = result?.checkout_url
                if (typeof checkoutUrl === 'string' && checkoutUrl.startsWith('https://')) {
                    const bookingId = result?.booking?.booking_id
                    if (bookingId) {
                        try {
                            window.sessionStorage.setItem(`betoch:payment-retry:${bookingId}`, JSON.stringify({
                                email,
                                first_name: accountName.trim().split(/\s+/)[0] || 'Guest',
                                last_name: accountName.trim().split(/\s+/).slice(1).join(' '),
                                phone_number: accountPhone,
                            }))
                        } catch {
                            // Retry can fall back to the guest profile if session storage is unavailable.
                        }
                    }
                    setPaymentCheckoutUrl(checkoutUrl)
                    setPaymentBookingId(result?.booking?.booking_id || '')
                    window.location.assign(checkoutUrl)
                    return
                }
                setPaymentError('The payment provider did not return a secure checkout link. Please try again.')
            },
            onError: (error) => setPaymentError(error?.response?.data?.message || error?.message || 'Could not start payment. Please try again.'),
        })
    }

    if (isLoading) return <CheckoutShell><CheckoutSkeleton /></CheckoutShell>
    if (isError || !property) return <CheckoutShell><div className="mx-auto flex min-h-[55vh] w-full max-w-5xl items-center justify-center gap-3 px-4 pt-4"><p role="alert" className="text-sm text-danger">Could not load checkout details.</p><RetryButton onRetry={refetch} isRetrying={isFetching} /></div></CheckoutShell>

    const stayAmount = getStayAmount(property, checkIn, checkOut)
    const total = stayAmount + SERVICE_FEE + CLEANING_FEE
    const isStarting = initialize.isPending || Boolean(paymentCheckoutUrl)
    const signInUrl = `/sign-in?redirect_url=${encodeURIComponent(`${location.pathname}${location.search}`)}`

    return <CheckoutShell>
        <div className=" w-full min-h-[calc(100vh-4rem)] bg-bg-2 px-4 pb-10 text-text sm:px-6">
            <div className="mx-auto max-w-6xl">
                <header className="relative left-1/2 mb-6 flex w-screen max-w-[100vw] -translate-x-1/2 flex-wrap items-center justify-between gap-4 border-b border-border bg-bg px-4 pb-4 pt-4 sm:px-8">
                    <Link to="/" className="font-bold text-primary">Betoch</Link>
                    <CheckoutProgress />
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-text-2"><LockKeyhole size={13} className="text-primary" />Secure checkout</span>
                </header>

                <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(17rem,0.8fr)]">
                    <section className="space-y-4">
                        {isStarting ? <div className="rounded-2xl border border-border bg-bg p-5 shadow-sm sm:p-7"><p className="text-base font-bold uppercase tracking-[0.15em] text-primary">Review and pay</p><h1 className="mt-2 text-2xl font-bold text-text sm:text-3xl sm:text-2xl">Opening {getPaymentLabel(paymentMethod)} payment…</h1><p className="mt-2 text-sm leading-6 text-text-2">Your booking is being prepared. You’ll continue to Chapa’s secure payment page.</p><PaymentStarting method={paymentMethod} total={total} checkoutUrl={paymentCheckoutUrl} bookingId={paymentBookingId} onCancel={() => cancelPendingBooking.mutate()} isCancelling={cancelPendingBooking.isPending} /></div> : <>
                            <div className="rounded-2xl border border-border bg-bg p-5 shadow-sm sm:p-6">
                                <div className="flex items-start justify-between gap-3"><div><h1 className="text-2xl font-bold text-text sm:text-3xl">Review and pay</h1><p className="mt-1 text-sm text-text-2">Check your trip, choose how to pay, then confirm.</p></div></div>
                                <div className="mt-4 rounded-xl bg-bg-2 p-4"><div className="flex items-center justify-between gap-3"><h2 className="text-base font-bold">Your trip</h2><Link to={`/properties/${id}`} className="text-sm font-semibold text-primary hover:underline">Edit</Link></div><div className="mt-3 grid gap-3 text-sm sm:grid-cols-2"><SummaryFact label="Dates" value={`${checkIn ? formatDate(checkIn) : 'Choose check-in'} – ${checkOut ? formatDate(checkOut) : 'Choose check-out'} · ${nights} nights`} /><SummaryFact label="Guests" value={`${guestCount} guests`} /></div></div>
                            </div>

                            <div className="rounded-2xl border border-border bg-bg p-5 shadow-sm sm:p-6">
                                <h2 className="text-base font-bold">Contact details</h2><p className="mt-1 text-sm text-text-2">We’ll use these details for your booking and payment receipt.</p>
                                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                    <label className="grid gap-1.5 text-sm font-semibold">Full name<input autoComplete="name" value={fullName || accountName} onChange={(event) => setFullName(event.target.value)} className="rounded-lg border border-border bg-bg px-3 py-2.5 font-normal text-text outline-none focus:border-primary" placeholder="Your full name" /></label>
                                    <label className="grid gap-1.5 text-sm font-semibold">Phone number<input autoComplete="tel" type="tel" value={phoneNumber || accountPhone} onChange={(event) => setPhoneNumber(event.target.value)} className="rounded-lg border border-border bg-bg px-3 py-2.5 font-normal text-text outline-none focus:border-primary" placeholder="+251 9…" />
                                    </label>
                                    <span className="text-sm font-normal text-text-2 w-full relative right-0 bottom-0">This information will be used for your booking.</span>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-border bg-bg p-5 shadow-sm sm:p-6">
                                <h2 className="text-base font-bold">Payment method</h2><p className="mt-1 text-sm text-text-2">Choose how you want to pay. You’ll start the payment with your choice, then return to Betoch.</p>
                        <div className="mt-4 grid gap-2 sm:grid-cols-3" role="radiogroup" aria-label="Payment method">{PAYMENT_METHODS.map(({ id: methodId, label, icon: Icon }) => { const selected = paymentMethod === methodId; return <button type="button" role="radio" aria-checked={selected} key={methodId} onClick={() => { setPaymentMethod(methodId); setHasChosenPaymentMethod(true) }} className={`flex items-center gap-2 rounded-xl border p-3 text-left text-sm font-semibold transition ${selected ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : 'border-border hover:border-primary/50'}`}><span className={`grid size-4 shrink-0 place-items-center rounded-full border-2 ${selected ? 'border-primary' : 'border-border'}`}>{selected && <span className="size-2 rounded-full bg-primary" />}</span><Icon size={15} className="text-primary" />{label}</button> })}</div>
                                <p className="mt-3 flex items-start gap-1.5 text-sm leading-5 text-text-2"><LockKeyhole size={12} className="mt-0.5 shrink-0" />Payments are processed securely by Chapa. Your PIN is never entered on Betoch.</p>
                            </div>

                            <div className="rounded-2xl border border-border bg-bg p-5 shadow-sm sm:p-6"><h2 className="text-base font-bold">Cancellation policy</h2><p className="mt-2 text-sm leading-5 text-text-2">Refund eligibility depends on the booking’s payment status and when the booking is cancelled. Review the applicable cancellation terms before paying.</p><Link to="/my-bookings" className="mt-2 inline-block text-sm font-semibold text-primary underline">Read the full policy</Link></div>

                            <label className="flex items-start gap-2 px-1 text-sm text-text-2"><input type="checkbox" checked={agreedToPolicy} onChange={(event) => setAgreedToPolicy(event.target.checked)} className="mt-0.5 accent-primary" /><span>I agree to the house rules, cancellation policy, and Betoch terms of service.</span></label>
                            {accountError && <div className="rounded-lg border border-secondary/30 bg-secondary/10 p-3 text-sm text-text-2"><p role="alert">{accountError}</p>{accountError.includes('Sign in') && <Link to={signInUrl} className="mt-2 inline-flex font-semibold text-primary hover:underline">Sign in to continue</Link>}</div>}
                            {paymentError && <div className="grid justify-items-start gap-2 rounded-lg border border-danger/20 bg-danger/5 p-3"><p role="alert" className="text-sm text-danger">{paymentError}</p><RetryButton onRetry={startPayment} isRetrying={isStarting} label="Retry payment" /></div>}
                            {isSignedIn ? <button type="button" onClick={startPayment} disabled={isStarting || !agreedToPolicy} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-secondary px-5 py-3.5 text-base font-bold text-on-secondary transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60">Pay ETB {total.toLocaleString()} with {getPaymentLabel(paymentMethod)}</button> : <Link to={signInUrl} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-secondary px-5 py-3.5 text-base font-bold text-on-secondary">Sign in to continue</Link>}
                            <p className="text-center text-sm text-text-2">You won’t be charged until you approve the payment.</p>
                            <Link to={`/properties/${id}`} className="block text-center text-sm font-semibold text-text-2 hover:text-primary">Cancel and return to property</Link>
                        </>}
                    </section>
                    <aside className="rounded-2xl border border-border bg-bg p-4 shadow-sm sm:p-5">
                        <div className="flex gap-3">
                            <div className="size-16 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-primary/15 via-bg-2 to-secondary/25">{property.propertyImages?.[0]?.image_url && <img src={property.propertyImages[0].image_url} alt={property.title} className="h-full w-full object-cover" />}</div>
                            <div className="min-w-0"><h2 className="line-clamp-2 text-base font-bold text-text">{property.title}</h2><p className="mt-1 flex items-center gap-1 text-sm text-text-2"><MapPin size={12} />{property.city}, {property.country}</p></div>
                        </div>
                        <div className="mt-4 grid grid-cols-3 gap-2 border-y border-border py-3 text-sm">
                            <SummaryFact label="Check-in" value={checkIn ? formatDate(checkIn) : 'Choose date'} />
                            <SummaryFact label="Check-out" value={checkOut ? formatDate(checkOut) : 'Choose date'} />
                            <SummaryFact label="Guests" value={guestCount ? String(guestCount) : '—'} />
                        </div>
                        <div className="mt-4 space-y-3 text-sm">
                            <PriceRow label={`Nightly rate × ${nights || 0} nights`} value={`ETB ${stayAmount.toLocaleString()}`} />
                            <PriceRow label="Service fee" value={`ETB ${SERVICE_FEE.toLocaleString()}`} />
                            <PriceRow label="Cleaning fee" value={`ETB ${CLEANING_FEE.toLocaleString()}`} />
                            <div className="flex items-center justify-between border-t border-border pt-3 text-base font-bold"><span>Total</span><span className="text-primary">ETB {total.toLocaleString()}</span></div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    </CheckoutShell>
}

function getStayAmount(property, checkIn, checkOut) {
    if (!property || !checkIn || !checkOut) return 0
    const overrides = new Map((property.availabilityOverrides || []).map((item) => [dateKey(item.date), item]))
    let amount = 0
    for (let day = checkIn; day < checkOut; day = addDateInputDays(day, 1)) {
        amount += Number(overrides.get(day)?.price_per_night ?? property.price_per_night ?? 0)
    }
    return amount
}

function isDateRangeUnavailable(property, checkIn, checkOut) {
    if (!property || !checkIn || !checkOut) return false
    const overrides = new Map((property.availabilityOverrides || []).map((item) => [dateKey(item.date), item]))
    for (let day = checkIn; day < checkOut; day = addDateInputDays(day, 1)) {
        if (overrides.get(day)?.is_available === false) return true
    }
    return (property.bookings || []).some((booking) => dateKey(booking.check_in_date) < checkOut && dateKey(booking.check_out_date) > checkIn)
}

function dateKey(value) {
    return typeof value === 'string' ? value.slice(0, 10) : new Date(value).toISOString().slice(0, 10)
}

function addDateInputDays(value, amount) {
    const [year, month, day] = value.split('-').map(Number)
    const date = new Date(Date.UTC(year, month - 1, day + amount))
    return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`
}

function CheckoutProgress() {
    const stages = ['Review', 'Pay', 'Confirmation']
    return <ol aria-label="Checkout progress" className="flex items-center gap-2 sm:gap-5">
        {stages.map((stage, index) => <li key={stage} className="flex items-center gap-1.5 text-sm font-semibold sm:gap-2 sm:text-sm">
            <span className={`grid size-5 place-items-center rounded-full ${index === 0 ? 'bg-primary text-white' : index === 1 ? 'bg-secondary text-on-secondary' : 'bg-neutral text-text-2'}`}>{index === 0 ? <Check size={12} /> : index === 1 ? <span className="size-1.5 rounded-full bg-current" /> : <Circle size={10} />}</span>
            <span className={index < 2 ? 'text-text' : 'text-text-2'}>{stage}</span>{index < stages.length - 1 && <span aria-hidden="true" className="ml-1 h-px w-3 bg-border sm:w-6" />}
        </li>)}
    </ol>
}

function PaymentStarting({ method, total, checkoutUrl, bookingId, onCancel, isCancelling }) {
    const labels = ['Booking details saved', `${getPaymentLabel(method)} selected`, 'Starting your payment', 'Return to Betoch']
    return <div className="mt-6 rounded-xl border border-border bg-bg-2 p-5 text-center sm:p-7">
        <span className="mx-auto block size-9 animate-spin rounded-full border-[3px] border-border border-t-secondary" />
        <p className="mt-3 text-sm font-semibold text-text">You’ll pay ETB {total.toLocaleString()} through a secure payment screen, then return to Betoch.</p>
        <ol className="mx-auto mt-5 grid max-w-xs gap-2 text-left text-sm">
            {labels.map((label, index) => <li key={label} className="flex items-center gap-2 text-text-2">{index < 2 ? <Check size={14} className="text-primary" /> : <Circle size={12} className={index === 2 ? 'text-secondary' : 'text-text-2/50'} />}<span>{label}</span></li>)}
        </ol>
        <p className="mt-5 text-sm text-text-2">If the payment page doesn’t open, continue below.</p>
        {checkoutUrl && <div className="mt-3 flex flex-wrap justify-center gap-2"><a href={checkoutUrl} className="inline-flex rounded-lg bg-primary px-4 py-2.5 text-base font-bold text-button-text">Open payment screen</a>{bookingId && <button type="button" onClick={onCancel} disabled={isCancelling} className="rounded-lg px-3 py-2.5 text-sm font-semibold text-danger underline disabled:opacity-60">{isCancelling ? 'Cancelling…' : 'Cancel payment'}</button>}</div>}
    </div>
}

function SummaryFact({ label, value }) {
    return <div><p className="font-bold uppercase text-text-2">{label}</p><p className="mt-1 font-semibold text-text">{value}</p></div>
}

function PriceRow({ label, value }) {
    return <div className="flex justify-between gap-3 text-text-2"><span>{label}</span><span className="shrink-0 font-semibold text-text">{value}</span></div>
}

function getPaymentLabel(method) {
    return PAYMENT_METHODS.find((item) => item.id === method)?.label || 'payment'
}

function getNights(checkIn, checkOut) {
    if (!checkIn || !checkOut) return 0
    const start = new Date(`${checkIn}T12:00:00`)
    const end = new Date(`${checkOut}T12:00:00`)
    return Math.max(0, Math.round((end - start) / 86_400_000))
}

function getTodayDateInput() {
    const now = new Date()
    return new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 10)
}

function CheckoutSkeleton() {
    return <div role="status" aria-label="Loading checkout" className="mx-auto max-w-6xl space-y-5 px-4 pb-10 pt-4 sm:px-6"><Skeleton className="h-10 rounded-xl" /><div className="grid gap-5 lg:grid-cols-[1.4fr_0.8fr]"><Skeleton className="h-[30rem] rounded-2xl" /><Skeleton className="h-64 rounded-2xl" /></div></div>
}
