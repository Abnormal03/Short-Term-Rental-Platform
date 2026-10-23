import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import PageShell from '../../../components/layout/PageShell'
import usePropertyDetails from '../hooks/usePropertyDetails'
import PropertyDetailsSkeleton from './PropertyDetailsSkeleton'
import { Badge } from '../../../components/UI/Badge'
import Button from '../../../components/UI/Botton'
import { MapPin, Star, Verified, LayoutGrid, Users } from 'lucide-react'
import Input from '../../../components/UI/Input'
import Contact from './Contact'
import RetryButton from '../../../components/UI/RetryButton'
import PropertyImageGallery from './PropertyImageGallery'

const Details = () => {
    const { id } = useParams();
    const navigate = useNavigate()
    const { data: property, isLoading, error, refetch, isFetching } = usePropertyDetails(id);
    const [nights, setNights] = useState(0);
    const [guests, setGuests] = useState(2);

    const [checkIn, setCheckIn] = useState('');
    const [checkOut, setCheckOut] = useState('');

    const [internalError, setInternalError] = useState(null);
    const [isAllSet, setIsAllSet] = useState(false);

    const [showUserInfo, setShowUserInfo] = useState(false);


    useEffect(() => {
        if (!property?.property_id) return
        const today = toDateInput(new Date())
        const minimumStay = Math.max(1, Number(property.min_stay_duration) || 1)
        setCheckIn(today)
        setCheckOut(addDaysToDateInput(today, minimumStay))
    }, [property?.property_id])

    useEffect(() => {
        if (!checkIn || !checkOut) {
            setNights(0)
            setIsAllSet(false)
            return
        }

        const stayLength = daysBetweenDateInputs(checkIn, checkOut)
        const minimumStay = Math.max(1, Number(property?.min_stay_duration) || 1)
        const maximumStay = Number(property?.max_stay_duration) || 30
        setNights(Math.max(0, stayLength))

        let validationMessage = null
        if (checkIn < toDateInput(new Date())) validationMessage = "Check-in can't be in the past."
        else if (stayLength <= 0) validationMessage = 'Check-out must be after check-in.'
        else if (guests < 1) validationMessage = 'At least one guest is required.'
        else if (stayLength < minimumStay) validationMessage = `This property requires a minimum stay of ${minimumStay} nights.`
        else if (stayLength > maximumStay) validationMessage = `This property allows a maximum stay of ${maximumStay} nights.`

        setInternalError(validationMessage)
        setIsAllSet(!validationMessage)
    }, [checkIn, checkOut, guests, property?.min_stay_duration, property?.max_stay_duration])

    if (isLoading) {
        return <PropertyDetailsSkeleton />
    }

    if (error || !property) {
        return (
            <PageShell>
                <div className="flex-1 flex items-center justify-center min-h-[60vh]">
                    <div className="flex items-center gap-3"><p role="alert" className="text-danger">Failed to load property details.</p><RetryButton onRetry={refetch} isRetrying={isFetching} /></div>
                </div>
            </PageShell>
        )
    }

    const propertyImages = property?.propertyImages ?? [];
    const today = toDateInput(new Date())
    const minimumStay = Math.max(1, Number(property.min_stay_duration) || 1)
    return (
        <PageShell>
            <Contact showUserInfo={showUserInfo} setShowUserInfo={setShowUserInfo} property={property} />
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-8 flex flex-col">

                <nav aria-label="Breadcrumb" className="mb-4 text-xs text-text-2">
                    <Link to="/explore" className="hover:text-primary">Explore</Link>
                    <span className="mx-2">/</span>
                    <Link to={`/properties?city=${encodeURIComponent(property.city || '')}`} className="hover:text-primary">{property.city || 'Properties'}</Link>
                    <span className="mx-2">/</span>
                    <span className="font-semibold text-text">{property.title}</span>
                </nav>

                <PropertyImageGallery images={propertyImages} title={property.title} />

                {/* Main Content Area */}
                <div className="flex flex-col lg:flex-row gap-12 mt-10">

                    {/* Left Column */}
                    <div className="lg:w-2/3 flex flex-col gap-8">

                        {/* Title and Location */}
                        <div>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <h1 className="text-3xl font-bold text-text">{property.title}</h1>
                                <Badge variant="verified" className="flex items-center gap-1 w-fit bg-amber-500 text-white border-none px-3 py-1">
                                    <Verified className="size-4" /> Verified
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between mt-3 text-text-2">
                                <div className="flex items-center gap-2">
                                    <MapPin className="size-5 text-primary" />
                                    <span>{property.city}, {property.country}</span>
                                </div>
                                {/* <div className="flex items-center gap-1 font-bold text-text">
                                    <Star className="size-5 fill-amber-500 text-amber-500" /> 4.9
                                </div> */}
                            </div>
                        </div>

                        <section className="border-t border-border pt-6">
                            <h2 className="text-xl font-bold text-text">About this place</h2>
                            <p className="mt-3 whitespace-pre-line text-sm leading-7 text-text-2">{property.description}</p>
                        </section>

                        {/* Host Info Box */}
                        <div className="rounded-2xl border border-border bg-bg/60 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
                            <div className="flex items-center gap-4">
                                <div aria-hidden="true" className="grid size-14 place-items-center rounded-full bg-primary text-lg font-bold text-button-text shrink-0">
                                    {getInitials(property.host?.name)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-base text-text">Hosted by {property.host?.name || 'Local host'}</h3>
                                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-text-2">
                                        {property.host?.is_verified_host && <span className="flex items-center gap-1 font-semibold text-primary"><Verified className="size-3.5" /> Verified host</span>}
                                        <span>{property.host?.is_verified_host ? '· ' : ''}Local host · Contact them about your stay</span>
                                    </div>
                                </div>
                            </div>
                            <Button variant="outline" className="border-primary text-primary hover:bg-primary/5" onClick={() => { setShowUserInfo(true) }}>Contact host</Button>
                        </div>

                        {/* Amenities Box */}
                        <div>
                            <h2 className="text-xl font-bold mb-5 text-text">What this place offers</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {(property.amenities || []).map((amenity) => (
                                    <div key={amenity} className="border border-border rounded-xl p-4 flex items-center gap-3 bg-bg/60 shadow-md">
                                        <LayoutGrid /> <p className='text-primary text-sm font-medium'>{amenity}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <section className="border-t border-border pt-6">
                            <h2 className="mb-3 text-xl font-bold text-text">Things to know</h2>
                            <div className="grid gap-4 text-sm sm:grid-cols-3">
                                <div><h3 className="font-semibold text-text">Stay length</h3><p className="mt-1 text-text-2">{property.min_stay_duration || 1} to {property.max_stay_duration || '30'} nights</p></div>
                                <div><h3 className="font-semibold text-text">Availability</h3><p className="mt-1 text-text-2">Choose dates in the booking panel to check your stay.</p></div>
                                <div><h3 className="font-semibold text-text">Payment</h3><p className="mt-1 text-text-2">Review the payment options before confirming your booking.</p></div>
                            </div>
                        </section>

                        <section className="border-t border-border pt-6">
                            <h2 className="mb-3 text-xl font-bold text-text">Where you’ll be</h2>
                            <p className="text-sm text-text-2">{property.city}, {property.country}</p>
                            <div className="mt-3 flex h-36 items-end rounded-2xl bg-linear-to-br from-primary/15 via-bg-2 to-secondary/25 p-4">
                                <span className="rounded-full bg-bg/90 px-3 py-1.5 text-xs font-semibold text-text-2"><MapPin className="mr-1 inline size-3.5 text-primary" />Approximate area</span>
                            </div>
                        </section>

                        <section className="border-t border-border pt-6">
                            <h2 className="mb-3 text-xl font-bold text-text">Reviews</h2>
                            <p className="rounded-xl border border-border bg-bg px-4 py-6 text-center text-sm text-text-2">Guests can share a review after their stay.</p>
                        </section>

                    </div>

                    {/* Right Column - Booking Widget */}
                    <div className="lg:w-1/3">
                        <div className="sticky top-24 rounded-2xl border border-border bg-bg p-6 shadow-[0_8px_30px_rgb(0,0,0,0.08)]">

                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-text">ETB {property.price_per_night?.toLocaleString()} <span className="text-sm text-text-2 font-normal">/ night</span></h2>
                                <div className="flex items-center gap-1 font-bold text-text">
                                    <Star className="size-4 fill-amber-500 text-amber-500" />
                                </div>
                            </div>

                            {/* Date & Guests Selection */}
                            <div className="border border-border rounded-xl mb-6 overflow-hidden">
                                <div className="flex border-b border-border">
                                    <div className="w-1/2 p-3 border-r border-border cursor-pointer hover:bg-neutral">
                                        <label className="block text-[10px] font-bold text-text uppercase mb-1">Check-in</label>
                                        <input type="date" onChange={(e) => {
                                            const nextCheckIn = e.target.value
                                            setCheckIn(nextCheckIn)
                                            if (nextCheckIn && checkOut && daysBetweenDateInputs(nextCheckIn, checkOut) < minimumStay) {
                                                setCheckOut(addDaysToDateInput(nextCheckIn, minimumStay))
                                            }
                                        }} value={checkIn} min={today} className="w-full outline-none text-sm bg-transparent text-text cursor-pointer" />
                                    </div>
                                    <div className="w-1/2 p-3 cursor-pointer hover:bg-neutral">
                                        <label className="block text-[10px] font-bold text-text uppercase mb-1">Check-out</label>
                                        <input type="date" onChange={(e) => setCheckOut(e.target.value)} value={checkOut} min={checkIn ? addDaysToDateInput(checkIn, minimumStay) : undefined} className="w-full outline-none text-sm bg-transparent text-text cursor-pointer" />
                                    </div>
                                </div>
                                <div className="p-3 flex justify-between items-center">
                                    <div>
                                        <label className="block text-[10px] font-bold text-text uppercase mb-1">Guests</label>
                                        <div className='flex items-center w-full gap-2'>
                                            <Users className="size-4 shrink-0 text-text-2" aria-hidden="true" />
                                            <Input aria-label="Number of guests" placeholder='Guests' onChange={(e) => { setGuests(Number(e.target.value)) }} value={guests} min={1} type='number' className={"bg-bg-2"} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <p className='font-light text-center text-red-500 text-sm'>{internalError}</p>
                            </div>

                            {/* <Button className="w-full mb-4 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl">Book Now</Button> */}
                            <Button className={"text-sm md:text-lg"} variant={`${isAllSet ? "primary" : "ghost"}`} size='wide' disabled={!isAllSet} onClick={() => {
                                const params = new URLSearchParams({ checkIn, checkOut, guests: String(guests) })
                                navigate(`/properties/${id}/checkout?${params.toString()}`)
                            }}>Book Now</Button>

                            <p className="text-center text-xs text-text-2 mb-6">You won't be charged yet</p>

                            <div className="space-y-4 text-text-2 mb-6 text-sm">
                                <div className="flex justify-between">
                                    <span className="underline">ETB {property.price_per_night?.toLocaleString()} x {!nights ? "---" : nights + " nights"} </span>
                                    <span>{!nights ? "---" : "ETB " + (property.price_per_night * nights)?.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="underline">Service fee</span>
                                    <span>ETB 500</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="underline">Cleaning fee</span>
                                    <span>ETB 800</span>
                                </div>
                            </div>

                            <hr className="border-border mb-6" />

                            <div className="flex justify-between font-bold text-lg mb-8 text-text">
                                <span>Total</span>
                                <span className="text-primary">{!nights ? "---" : "ETB " + (property.price_per_night * nights + 500 + 800)?.toLocaleString()}</span>
                            </div>

                            {/* Secure Local Payments */}
                            <div className="bg-bg-2 p-4 rounded-xl">
                                <p className="text-[10px] font-bold text-primary/70 uppercase text-center mb-3">Secure Local Payments</p>
                                <div className="flex justify-center gap-2">
                                    <div className="bg-surface border border-border rounded-md px-2 py-1.5 text-[10px] font-bold text-text-2 flex-1 text-center shadow-sm">Telebirr</div>
                                    <div className="bg-surface border border-border rounded-md px-2 py-1.5 text-[10px] font-bold text-text-2 flex-1 text-center shadow-sm">CBE</div>
                                    <div className="bg-surface border border-border rounded-md px-2 py-1.5 text-[10px] font-bold text-text-2 flex-1 text-center shadow-sm">AWASH</div>
                                </div>
                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </PageShell>
    )
}

export default Details

function toDateInput(date) {
    const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
    return localDate.toISOString().slice(0, 10)
}

function addDaysToDateInput(value, days) {
    const [year, month, day] = value.split('-').map(Number)
    const date = new Date(year, month - 1, day, 12)
    date.setDate(date.getDate() + days)
    return toDateInput(date)
}

function daysBetweenDateInputs(start, end) {
    const [startYear, startMonth, startDay] = start.split('-').map(Number)
    const [endYear, endMonth, endDay] = end.split('-').map(Number)
    return (Date.UTC(endYear, endMonth - 1, endDay) - Date.UTC(startYear, startMonth - 1, startDay)) / 86_400_000
}

function getInitials(name = '') {
    const initials = name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0])
    return initials.join('').toUpperCase() || 'H'
}
