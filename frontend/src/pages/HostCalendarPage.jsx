import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CalendarDays, ChevronLeft, ChevronRight, Edit2, LoaderCircle } from 'lucide-react'
import PageShell from '../components/layout/PageShell'
import RetryButton from '../components/UI/RetryButton'
import Skeleton from '../components/UI/Skeleton'
import { propertyService } from '../features/properties/services/propertyService'
import { useMyProperties } from '../features/properties/hooks/useMyProperties'

export default function HostCalendarPage() {
    const queryClient = useQueryClient()
    const propertiesQuery = useMyProperties()
    const properties = propertiesQuery.data || []
    const [selectedPropertyId, setSelectedPropertyId] = useState('')
    const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1))
    const [selectedStart, setSelectedStart] = useState('')
    const [selectedEnd, setSelectedEnd] = useState('')
    const [mode, setMode] = useState('AVAILABLE')
    const [price, setPrice] = useState('')
    const [minimumNights, setMinimumNights] = useState('')
    const [editWindow, setEditWindow] = useState(false)
    const [windowFrom, setWindowFrom] = useState('')
    const [windowTo, setWindowTo] = useState('')
    const [error, setError] = useState('')
    const propertyId = selectedPropertyId || properties[0]?.property_id || ''
    const property = properties.find((item) => item.property_id === propertyId)
    const from = dateKey(new Date(month.getFullYear(), month.getMonth(), 1))
    const to = dateKey(new Date(month.getFullYear(), month.getMonth() + 1, 0))
    const calendarQuery = useQuery({
        queryKey: ['property-calendar', propertyId, from, to],
        queryFn: async () => (await propertyService.getPropertyCalendar(propertyId, from, to)).data.property,
        enabled: Boolean(propertyId),
    })
    const calendar = calendarQuery.data
    const overrides = useMemo(() => new Map((calendar?.availabilityOverrides || []).map((item) => [dateKey(new Date(item.date)), item])), [calendar?.availabilityOverrides])
    const bookings = calendar?.bookings || []
    const selectedDays = selectedStart ? getDateRange(selectedStart, selectedEnd || selectedStart) : []
    const bookedSelectedDate = selectedDays.some((day) => {
        const booking = getBookingForDate(day, bookings)
        return booking && !booking.isCheckout
    })

    const saveDates = useMutation({
        mutationFn: async () => {
            const isAvailable = mode === 'AVAILABLE'
            const parsedPrice = price === '' ? null : Number(price)
            const parsedMinimum = minimumNights === '' ? null : Number(minimumNights)
            if (isAvailable && parsedPrice !== null && (!Number.isFinite(parsedPrice) || parsedPrice <= 0)) throw new Error('Enter a price greater than zero.')
            if (isAvailable && parsedMinimum !== null && (!Number.isInteger(parsedMinimum) || parsedMinimum < 1 || parsedMinimum > (calendar?.max_stay_duration || property?.max_stay_duration || 30))) throw new Error('Enter a valid minimum stay.')
            if (bookedSelectedDate) throw new Error('One or more selected dates already have a booking.')
            const values = selectedDays.map((date) => ({
                date,
                is_available: isAvailable,
                price_per_night: isAvailable ? parsedPrice : null,
                min_stay_duration: isAvailable ? parsedMinimum : null,
            }))
            return propertyService.updatePropertyCalendar(propertyId, values)
        },
        onSuccess: async () => {
            setError('')
            await queryClient.invalidateQueries({ queryKey: ['property-calendar', propertyId] })
        },
        onError: (saveError) => setError(saveError.response?.data?.message || saveError.message || 'Could not save calendar changes.'),
    })

    const saveWindow = useMutation({
        mutationFn: () => propertyService.updateAvailability(propertyId, { available_from: windowFrom, available_to: windowTo }),
        onSuccess: async () => {
            setEditWindow(false)
            setError('')
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ['properties', 'mine'] }),
                queryClient.invalidateQueries({ queryKey: ['property-calendar', propertyId] }),
            ])
        },
        onError: (saveError) => setError(saveError.response?.data?.message || saveError.message || 'Could not update availability window.'),
    })

    const chooseProperty = (id) => {
        setSelectedPropertyId(id)
        setSelectedStart('')
        setSelectedEnd('')
        setError('')
    }
    const chooseDate = (day) => {
        if (!day.selectable) return
        setError('')
        if (!selectedStart || selectedEnd) {
            setSelectedStart(day.key)
            setSelectedEnd('')
        } else if (day.key < selectedStart) {
            setSelectedStart(day.key)
        } else {
            setSelectedEnd(day.key)
        }
    }
    const moveMonth = (amount) => setMonth((current) => new Date(current.getFullYear(), current.getMonth() + amount, 1))
    const setToday = () => setMonth(new Date(new Date().getFullYear(), new Date().getMonth(), 1))
    const selectedLabel = selectedStart
        ? selectedStart === selectedEnd || !selectedEnd
            ? formatLongDate(selectedStart)
            : `${formatLongDate(selectedStart)} – ${formatLongDate(selectedEnd)}`
        : 'Choose dates on the calendar'
    const availability = calendar?.availabilities || property?.availabilities
    const allDays = makeMonthDays(month, availability, overrides, bookings, selectedDays, calendar?.price_per_night || property?.price_per_night)

    return <PageShell>
        <section className="w-full px-5 py-6 sm:px-7 lg:px-9 xl:px-10 sm:py-7" aria-labelledby="host-calendar-title">
            <header className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Host workspace</p>
                    <h1 id="host-calendar-title" className="mt-1 text-3xl font-extrabold tracking-tight text-text">Calendar</h1>
                    <p className="mt-1 text-sm text-text-2">See bookings at a glance and control which dates guests can book.</p>
                </div>
                <label className="grid gap-1 text-xs font-semibold text-text">
                    <span className="sr-only">Select a property</span>
                    <select value={propertyId} onChange={(event) => chooseProperty(event.target.value)} disabled={!properties.length} className="min-h-10 min-w-56 rounded-full border border-border bg-surface px-4 text-sm text-text">
                        {properties.length === 0 && <option value="">No properties yet</option>}
                        {properties.map((item) => <option key={item.property_id} value={item.property_id}>{item.title}</option>)}
                    </select>
                </label>
            </header>

            {propertiesQuery.isLoading && <div className="mt-6 grid gap-4 lg:grid-cols-[1.6fr_0.8fr]"><Skeleton className="h-[480px] rounded-2xl" /><Skeleton className="h-72 rounded-2xl" /></div>}
            {propertiesQuery.isError && <div className="mt-6 flex items-center gap-3 rounded-xl border border-border bg-surface p-4"><p role="alert" className="text-sm text-danger">Could not load your properties.</p><RetryButton onRetry={propertiesQuery.refetch} isRetrying={propertiesQuery.isFetching} /></div>}
            {!propertiesQuery.isLoading && !propertiesQuery.isError && !properties.length && <div className="mt-6 rounded-2xl border border-border bg-surface p-10 text-center"><h2 className="text-lg font-bold text-text">Add a property to use your calendar</h2><p className="mt-2 text-sm text-text-2">Your listing availability and reservations will appear here.</p></div>}
            {property && <div className="mt-5 grid items-start gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(290px,0.8fr)]">
                <section className="rounded-2xl border border-border bg-surface p-4 sm:p-5" aria-label="Availability calendar">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <h2 className="text-lg font-bold text-text">{month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h2>
                        <div className="flex items-center gap-1.5">
                            <button type="button" aria-label="Previous month" onClick={() => moveMonth(-1)} className="grid size-9 place-items-center rounded-full border border-border text-text hover:border-primary"><ChevronLeft size={16} /></button>
                            <button type="button" onClick={setToday} className="min-h-9 rounded-full border border-border px-3 text-xs font-semibold text-text hover:border-primary">Today</button>
                            <button type="button" aria-label="Next month" onClick={() => moveMonth(1)} className="grid size-9 place-items-center rounded-full border border-border text-text hover:border-primary"><ChevronRight size={16} /></button>
                        </div>
                    </div>

                    {calendarQuery.isLoading && <div className="mt-4 grid grid-cols-7 gap-1.5">{Array.from({ length: 35 }, (_, index) => <Skeleton key={index} className="h-16 rounded-lg" />)}</div>}
                    {calendarQuery.isError && <div className="mt-5 flex items-center gap-3"><p role="alert" className="text-sm text-danger">Could not load this calendar.</p><RetryButton onRetry={calendarQuery.refetch} isRetrying={calendarQuery.isFetching} /></div>}
                    {!calendarQuery.isLoading && !calendarQuery.isError && <>
                        <div className="mt-4 grid grid-cols-7 gap-1 text-center text-[10px] font-bold uppercase tracking-wide text-text-2">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => <span key={day} className="py-1">{day}</span>)}</div>
                        <div className="grid grid-cols-7 gap-1.5">
                            {allDays.map((day, index) => day ? <CalendarDay key={day.key} day={day} selected={selectedDays.includes(day.key)} onClick={() => chooseDate(day)} /> : <span key={`blank-${index}`} aria-hidden="true" />)}
                        </div>
                        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-[10px] text-text-2">
                            <Legend color="bg-[#dff1e7] border-[#9ac6ad] dark:bg-[#183b2d] dark:border-[#397252]" label="Booked" />
                            <Legend color="bg-surface border-border" label="Available" />
                            <Legend color="bg-[repeating-linear-gradient(45deg,#f0f2ed,#f0f2ed_4px,#dfe4dc_4px,#dfe4dc_8px)] dark:bg-[repeating-linear-gradient(45deg,#18231c,#18231c_4px,#293b30_4px,#293b30_8px)] border-border" label="Blocked" />
                            <Legend color="bg-[#fff0d0] border-[#f5a900] dark:bg-[#3a2e16] dark:border-[#d99a17]" label="Selected" />
                        </div>
                    </>}
                </section>

                <div className="grid gap-3.5">
                    <section className="rounded-2xl border border-border bg-surface p-4 sm:p-5" aria-labelledby="selected-dates-title">
                        <h2 id="selected-dates-title" className="text-base font-bold text-text">Selected dates</h2>
                        <p className="mt-1 text-xs text-text-2">{selectedLabel}{selectedDays.length > 0 && ` · ${selectedDays.length} ${selectedDays.length === 1 ? 'night' : 'nights'}`}</p>
                        {bookedSelectedDate && <p role="alert" className="mt-2 text-xs font-medium text-danger">Selection includes booked dates. Choose another range.</p>}
                        {selectedDays.length > 0 ? <>
                            <div className="mt-3 grid gap-2">
                                <AvailabilityChoice selected={mode === 'AVAILABLE'} onClick={() => setMode('AVAILABLE')}>Available</AvailabilityChoice>
                                <AvailabilityChoice selected={mode === 'BLOCKED'} onClick={() => setMode('BLOCKED')}>Blocked</AvailabilityChoice>
                            </div>
                            {mode === 'AVAILABLE' && <div className="mt-3 grid gap-2.5">
                                <label className="grid gap-1 text-xs font-semibold text-text">Price per night (ETB)<input type="number" min="1" step="0.01" value={price || calendar?.price_per_night || property.price_per_night || ''} onChange={(event) => setPrice(event.target.value)} className="min-h-9 rounded-lg border border-border bg-surface px-3 text-sm font-normal text-text" /></label>
                                <p className="-mt-1 text-[10px] text-text-2">Base price is ETB {Number(calendar?.price_per_night || property.price_per_night).toLocaleString()}. Change it for these dates only.</p>
                                <label className="grid gap-1 text-xs font-semibold text-text">Minimum nights<input type="number" min="1" max={calendar?.max_stay_duration || property.max_stay_duration} value={minimumNights || calendar?.min_stay_duration || property.min_stay_duration || 1} onChange={(event) => setMinimumNights(event.target.value)} className="min-h-9 rounded-lg border border-border bg-surface px-3 text-sm font-normal text-text" /></label>
                            </div>}
                            {error && <p role="alert" className="mt-2 text-xs text-danger">{error}</p>}
                            <button type="button" onClick={() => saveDates.mutate()} disabled={saveDates.isPending || bookedSelectedDate} className="mt-3 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-button-text disabled:opacity-60">
                                {saveDates.isPending && <LoaderCircle size={15} className="animate-spin" />}{saveDates.isPending ? 'Saving…' : 'Save changes'}
                            </button>
                        </> : <p className="mt-3 rounded-lg bg-bg-2 p-3 text-xs text-text-2">Select one or more dates to change availability, nightly price, or minimum stay.</p>}
                    </section>

                    <section className="rounded-2xl border border-border bg-surface p-4 sm:p-5" aria-labelledby="availability-window-title">
                        <div className="flex items-center justify-between gap-3">
                            <h2 id="availability-window-title" className="text-sm font-bold text-text">Availability window</h2>
                            <button type="button" onClick={() => { setWindowFrom(toInputDate(availability?.available_from)); setWindowTo(toInputDate(availability?.available_to)); setEditWindow((open) => !open) }} className="inline-flex items-center gap-1 text-xs font-semibold text-primary underline underline-offset-2"><Edit2 size={12} />{editWindow ? 'Close' : 'Edit'}</button>
                        </div>
                        {!editWindow ? <p className="mt-2 text-xs leading-5 text-text-2">{availability ? `${formatLongDate(toInputDate(availability.available_from))} – ${formatLongDate(toInputDate(availability.available_to))}` : 'No availability dates set'}<br />Stay length: {property.min_stay_duration} – {property.max_stay_duration} nights</p> : <div className="mt-3 grid gap-2">
                            <label className="grid gap-1 text-xs font-medium text-text">Available from<input type="date" value={windowFrom} onChange={(event) => setWindowFrom(event.target.value)} className="min-h-9 rounded-lg border border-border bg-surface px-2 text-sm text-text" /></label>
                            <label className="grid gap-1 text-xs font-medium text-text">Available to<input type="date" min={windowFrom || undefined} value={windowTo} onChange={(event) => setWindowTo(event.target.value)} className="min-h-9 rounded-lg border border-border bg-surface px-2 text-sm text-text" /></label>
                            <button type="button" onClick={() => saveWindow.mutate()} disabled={!windowFrom || !windowTo || windowTo <= windowFrom || saveWindow.isPending} className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg bg-primary px-3 text-xs font-bold text-button-text disabled:opacity-50">{saveWindow.isPending && <LoaderCircle size={14} className="animate-spin" />}Save window</button>
                        </div>}
                    </section>
                </div>
            </div>}
        </section>
    </PageShell>
}

function CalendarDay({ day, selected, onClick }) {
    const isBooked = day.booking && !day.booking.isCheckout
    const disabled = !day.selectable
    const stateStyle = day.booking
        ? 'border-[#9ac6ad] bg-[#dff1e7] text-[#124c34] dark:border-[#397252] dark:bg-[#183b2d] dark:text-[#94e5b8]'
        : day.blocked
            ? 'border-border bg-[repeating-linear-gradient(45deg,#f0f2ed,#f0f2ed_5px,#e4e8e1_5px,#e4e8e1_10px)] text-text-2 hover:border-primary dark:bg-[repeating-linear-gradient(45deg,#18231c,#18231c_5px,#293b30_5px,#293b30_10px)]'
            : day.available
                ? 'border-border bg-surface text-text hover:border-primary'
                : 'border-transparent bg-bg-2/60 text-text-2/50'
    return <button type="button" disabled={disabled} onClick={onClick} aria-label={`${formatLongDate(day.key)}${isBooked ? ', booked' : day.booking?.isCheckout ? ', check-out' : day.blocked ? ', blocked, selectable' : day.available ? ', available' : ', unavailable'}`} className={`relative flex min-h-[68px] flex-col rounded-lg border p-1.5 text-left transition sm:min-h-[72px] ${stateStyle} ${selected ? 'z-10 border-2 border-[#e58c00] !bg-[#ffe0a3] text-[#3e2b00] ring-1 ring-[#f5a900]/50 dark:!bg-[#533b12] dark:text-[#fff1c2]' : ''} ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
        <span className={`text-xs font-bold ${day.available && !day.blocked && !day.booking ? 'text-text' : ''}`}>{day.date.getDate()}</span>
        <span className="mt-auto line-clamp-2 text-[9px] font-medium leading-3">{isBooked ? day.booking.checkIn ? `${day.booking.user?.name?.split(' ')[0] || 'Guest'} · check-in` : 'Booked' : day.booking?.isCheckout ? 'Check-out' : day.blocked ? 'Blocked' : day.available ? `ETB ${Number(day.price).toLocaleString()}` : 'Unavailable'}</span>
    </button>
}

function AvailabilityChoice({ selected, onClick, children }) {
    return <button type="button" role="radio" aria-checked={selected} onClick={onClick} className={`flex min-h-11 items-center gap-2.5 rounded-lg border px-3 text-sm font-medium transition ${selected ? 'border-primary bg-primary/5 text-text ring-1 ring-primary/20' : 'border-border bg-surface text-text hover:border-primary/50'}`}>
        <span className={`grid size-4 place-items-center rounded-full border ${selected ? 'border-primary' : 'border-text-2'}`}>{selected && <span className="size-2 rounded-full bg-primary" />}</span>{children}
    </button>
}

function Legend({ color, label }) {
    return <span className="inline-flex items-center gap-1.5"><span className={`size-3 rounded border ${color}`} />{label}</span>
}

function makeMonthDays(month, availability, overrides, bookings, selectedDays, basePrice) {
    const first = new Date(month.getFullYear(), month.getMonth(), 1)
    const lastDate = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
    const leading = (first.getDay() + 6) % 7
    const today = dateKey(new Date())
    const start = availability?.available_from ? dateKey(new Date(availability.available_from)) : ''
    const end = availability?.available_to ? dateKey(new Date(availability.available_to)) : ''
    return [
        ...Array.from({ length: leading }, () => null),
        ...Array.from({ length: lastDate }, (_, index) => {
            const date = new Date(month.getFullYear(), month.getMonth(), index + 1)
            const key = dateKey(date)
            const override = overrides.get(key)
            const booking = getBookingForDate(key, bookings)
            const inWindow = Boolean(start && end && key >= start && key <= end)
            return {
                key, date, booking,
                selectable: inWindow && key >= today && (!booking || booking.isCheckout),
                available: inWindow && key >= today && override?.is_available !== false && (!booking || booking.isCheckout),
                blocked: override?.is_available === false,
                beforeToday: key < today,
                price: override?.price_per_night ?? basePrice,
                selected: selectedDays.includes(key),
            }
        }),
    ]
}

function getBookingForDate(key, bookings) {
    let checkoutBooking = null
    for (const booking of bookings) {
        const checkIn = dateKey(new Date(booking.check_in_date))
        const checkOut = dateKey(new Date(booking.check_out_date))
        if (key >= checkIn && key < checkOut) return { ...booking, checkIn: key === checkIn, checkOut: false, isCheckout: false }
        if (key === checkOut) checkoutBooking = { ...booking, checkIn: false, checkOut: true, isCheckout: true }
    }
    return checkoutBooking
}

function getDateRange(from, to) {
    if (!from) return []
    const start = parseDate(from)
    const end = parseDate(to || from)
    const dates = []
    for (const date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) dates.push(dateKey(date))
    return dates
}

function dateKey(date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

function parseDate(value) {
    const [year, month, day] = value.split('-').map(Number)
    return new Date(year, month - 1, day)
}

function toInputDate(value) {
    if (!value) return ''
    return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : dateKey(new Date(value))
}

function formatLongDate(value) {
    if (!value) return ''
    return parseDate(toInputDate(value)).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
