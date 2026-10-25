import { Check, Circle, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatDate } from '../../../lib/utils'

const BOOKING_STEPS = ['Booked', 'Paid', 'Check-in', 'Stay', 'Complete']

export default function BookingCard({ booking, selected = false, onManage, onCancel, cancelling = false }) {
    const now = new Date()
    const checkIn = new Date(booking.check_in_date)
    const checkOut = new Date(booking.check_out_date)
    const isStaying = booking.booking_status === 'CONFIRMED' && now >= checkIn && now < checkOut
    const isCompleted = booking.booking_status === 'COMPLETED'
    const isCancelled = ['CANCELLED', 'REFUNDED', 'REFUNDING'].includes(booking.booking_status)
    const isPaid = booking.payment?.payment_status === 'COMPLETED' || ['CONFIRMED', 'COMPLETED'].includes(booking.booking_status)
    const canCancelBeforePayment = booking.booking_status === 'PENDING' && booking.payment?.payment_status !== 'COMPLETED'
    const currentStep = isCompleted ? BOOKING_STEPS.length : isStaying ? 3 : isPaid ? 2 : 1
    const image = booking.property?.propertyImages?.[0]?.image_url
    const status = isStaying ? 'CHECKED IN' : booking.booking_status.replaceAll('_', ' ')

    return <article className={`overflow-hidden rounded-2xl border bg-bg shadow-sm transition ${selected ? 'border-primary/60 ring-1 ring-primary/20' : 'border-border'}`}>
        <div className="grid md:grid-cols-[1.1fr_0.9fr]">
            <div className="relative min-h-48 bg-linear-to-br from-primary/20 via-bg-2 to-secondary/35 md:min-h-64">
                {image && <img src={image} alt={booking.property?.title || 'Booked property'} className="absolute inset-0 h-full w-full object-cover" />}
                <span className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[0.6rem] font-bold text-white ${isCancelled ? 'bg-danger' : 'bg-secondary'}`}>{status}</span>
                {!image && <span className="absolute bottom-3 left-3 rounded-full bg-bg/80 px-2 py-1 text-[0.55rem] font-semibold text-text-2">Property photo</span>}
            </div>

            <div className="flex min-w-0 flex-col p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <h2 className="line-clamp-2 text-lg font-bold leading-tight text-text">{booking.property?.title || 'Your stay'}</h2>
                        <p className="mt-1 flex items-center gap-1 text-xs text-text-2"><MapPin size={13} />{booking.property?.city || 'Ethiopia'}, {booking.property?.country || 'Ethiopia'}</p>
                    </div>
                    <div className="shrink-0 text-right"><span className="block text-[0.55rem] font-bold uppercase tracking-wide text-text-2">Total</span><span className="font-bold text-primary">ETB {Number(booking.total_price).toLocaleString()}</span></div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                    <BookingFact label="Check-in" value={formatDate(booking.check_in_date)} />
                    <BookingFact label="Check-out" value={formatDate(booking.check_out_date)} />
                    <BookingFact label="Length" value={`${getNightCount(booking.check_in_date, booking.check_out_date)} nights`} />
                    <BookingFact label="Host" value={booking.property?.host?.name || 'Host details'} />
                </div>

                <div className="mt-auto flex flex-wrap gap-2 pt-4">
                    <Link to={`/my-bookings/${booking.booking_id}`} className="rounded-lg bg-primary px-3.5 py-2 text-xs font-bold text-button-text hover:brightness-110">Booking details</Link>
                    <button type="button" onClick={() => onManage?.(booking)} className="rounded-lg bg-primary/10 px-3.5 py-2 text-xs font-bold text-primary hover:bg-primary/15">Quick check-in info</button>
                    <Link to={`/properties/${booking.property_id}`} className="rounded-lg bg-primary/10 px-3.5 py-2 text-xs font-bold text-primary hover:bg-primary/15">View property</Link>
                    {canCancelBeforePayment && <button type="button" onClick={() => onCancel?.(booking)} disabled={cancelling} className="rounded-lg border border-danger/25 px-3.5 py-2 text-xs font-bold text-danger hover:bg-danger/5 disabled:opacity-60">{cancelling ? "Cancelling…" : "Cancel unpaid booking"}</button>}
                </div>
            </div>
        </div>

        {!isCancelled && <ol aria-label="Booking progress" className="grid grid-cols-5 border-t border-border bg-bg-2/60 px-2 py-3 sm:px-5">
            {BOOKING_STEPS.map((step, index) => {
                const done = index < currentStep || isCompleted
                const active = index === currentStep && !isCompleted
                return <li key={step} className="flex flex-col items-center gap-1 text-center">
                    <span className={`grid size-5 place-items-center rounded-full ${done ? 'bg-primary text-white' : active ? 'border-2 border-secondary bg-bg text-secondary' : 'bg-neutral text-text-2'}`}>{done ? <Check size={12} /> : <Circle size={8} fill="currentColor" />}</span>
                    <span className={`text-[0.55rem] font-semibold ${active ? 'text-text' : done ? 'text-primary' : 'text-text-2'}`}>{step}</span>
                </li>
            })}
        </ol>}
    </article>
}

function BookingFact({ label, value }) {
    return <div><span className="block text-[0.55rem] font-bold uppercase tracking-wide text-text-2">{label}</span><span className="mt-0.5 block truncate font-semibold text-text">{value}</span></div>
}

function getNightCount(checkIn, checkOut) {
    return Math.max(1, Math.round((new Date(checkOut) - new Date(checkIn)) / 86400000))
}
