import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import PageShell from '../components/layout/PageShell'
import usePropertyDetails from '../features/properties/hooks/usePropertyDetails'
import { Spinner } from '../components/UI/Spinner'
import { Badge } from '../components/UI/Badge'
import Button from '../components/UI/Botton'
import { MapPin, Star, Verified, LayoutGrid, CreditCard, Wallet, Circle, Smartphone, Landmark, Banknote, Lock } from 'lucide-react'
import Input from '../components/UI/Input'
import { Modal } from '../components/UI/Modal'
import { useUser } from '@clerk/clerk-react'

const PropertyDetails = () => {
    const {isSignedIn} = useUser()

    const { id } = useParams();
    const { data: property, isLoading, error } = usePropertyDetails(id);
    const [nights, setNights] = useState(0);
    const [guests, setGuests] = useState(2);

    const [checkIn, setCheckIn] = useState('');
    const [checkOut, setCheckOut] = useState('');

    const [internalError, setInternalError] = useState('Fill out checkin and checkout date.');
    const [isAllSet, setIsAllSet] = useState(false);

    const [showUserInfo, setShowUserInfo] = useState(false);
    const [paymentMethods, setPaymentMethods] = useState(false);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('telebirr');

    useEffect(() => {
        if (checkIn && checkOut) {
            const start = new Date(checkIn);
            const end = new Date(checkOut);
            const diffTime = end - start;
            if (diffTime > 0) {
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                setNights(diffDays);
                if (guests<=0) {
                    setInternalError("Guest must be atleast 1.");
                    setIsAllSet(false);
                }else{
                    setInternalError(null);
                    setIsAllSet(true);
                }

                if (Math.ceil((start-Date.now()) / (1000 * 60 * 60 * 24))<0) {
                    setInternalError("CheckIn can't be in the past.");
                    setIsAllSet(false);
                }

            } else {
                setInternalError("checkout must be after checkin.");
                setIsAllSet(false);
                setNights(0);
            }
        } else {
            setNights(0);
        }
    }, [checkIn, checkOut, guests]);

    useEffect(()=>{
        if (nights > Number(property?.max_stay_duration)) {
            setInternalError("Maxinum Stay For This Property Is "+`${property?.max_stay_duration}.`);
            setIsAllSet(false);
        }else if (nights < property?.min_stay_duration) {
            setInternalError("Minimum Stay For This Property Is "+`${property?.min_stay_duration}.`);
            setIsAllSet(false);
        }
    }, [nights])

    if (isLoading) {
        return (
            <PageShell>
                <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] gap-4">
                    <Spinner />
                    <p className="text-gray-500">Loading property details...</p>
                </div>
            </PageShell>
        )
    }

    if (error || !property) {
        return (
            <PageShell>
                <div className="flex-1 flex items-center justify-center min-h-[60vh]">
                    <p className="text-red-500">Failed to load property details.</p>
                </div>
            </PageShell>
        )
    }

    const mainImg = property?.propertyImages[0]?.image_url || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2000&auto=format&fit=crop'
    return (
        <PageShell>
            <Modal isOpen={showUserInfo} onClose={()=>{setShowUserInfo(false)}} key={"md"}>
                <div className='w-full flex flex-col items-center gap-2'>
                    <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-200 shrink-0 border">
                        <img src={property?.host?.profile_url || "https://thumbs.dreamstime.com/b/user-profile-avatar-icon-134114292.jpg"} alt={property.host?.name || "Host"} className="w-full h-full object-cover"/>
                    </div>
                    <Badge variant='verified' className={"text-primary"}> <Verified className='size-5' /> <p className='text-sm'>Verified</p></Badge>
                    <div className='flex flex-col items-center'>
                        <p className='font-bold text-xl'>{property?.host?.name}</p>
                        <p>{property?.host?.email}</p>
                    </div>
                    <div className='flex justify-evenly w-full gap-2'>
                        {isSignedIn? <Button size='xl'> <a href={`tel:${property?.host?.phone_number}`} target='_blank'>Call</a></Button>: ""}
                        <Button size={`${isSignedIn?"xl":"wide"}`} variant='secondary'> <a href={`mailto:${property?.host?.email}`} target='_blank'>Email</a></Button>
                    </div>
                    <p className='text-sm font-light text-center text-red-400'> <span className='font-bold'>Safety Alert:</span> Please Avoid Making Deals Aside.</p>
                </div>
            </Modal>
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-20 flex flex-col">
                
                {/* Image Gallery */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[400px] sm:h-[600px]">
                    {/* Large image */}
                    <div className="h-full w-full rounded-2xl overflow-hidden">
                        <img src={mainImg} alt={property.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                    </div>
                    {/*The rest of the Image*/}
                    <div className="hidden md:grid grid-cols-2 gap-4 h-full">
                        {property?.propertyImages.map((img,index)=>(
                            index===0? <></>:
                            <div className='bg-gray-200 rounded-2xl overflow-hidden' key={img.image_id}>
                                <img src={img.image_url} alt="property_Image" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex flex-col lg:flex-row gap-12 mt-10">
                    
                    {/* Left Column */}
                    <div className="lg:w-2/3 flex flex-col gap-8">
                        
                        {/* Title and Location */}
                        <div>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <h1 className="text-3xl font-bold text-gray-900">{property.title}</h1>
                                <Badge variant="verified" className="flex items-center gap-1 w-fit bg-amber-500 text-white border-none px-3 py-1">
                                    <Verified className="size-4"/> Verified
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between mt-3 text-gray-600">
                                <div className="flex items-center gap-2">
                                    <MapPin className="size-5 text-primary" />
                                    <span>{property.city}, {property.country}</span>
                                </div>
                                {/* <div className="flex items-center gap-1 font-bold text-gray-900">
                                    <Star className="size-5 fill-amber-500 text-amber-500" /> 4.9
                                </div> */}
                            </div>
                        </div>

                        {/* Description */}
                        <p className="text-gray-600 leading-relaxed">
                            {property.description}
                        </p>

                        {/* Host Info Box */}
                        <div className="border border-gray-200 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-200 shrink-0">
                                    <img src={property.host?.profile_url || "https://thumbs.dreamstime.com/b/user-profile-avatar-icon-134114292.jpg"} alt={property.host?.name || "Host"} className="w-full h-full object-cover"/>
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-gray-900">Hosted by {property.host?.name?.split(' ')[1] || "Normal's"}</h3>
                                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                        <span className="flex items-center gap-1 text-amber-500 font-medium">
                                            <Verified className="size-4"/> Verified
                                        </span>
                                        <span>•</span>
                                        <span>Response time: ---</span>
                                    </div>
                                </div>
                            </div>
                            <Button variant="outline" className="text-primary border-primary hover:bg-primary/5" onClick={()=>{setShowUserInfo(true)}}>Contact Host</Button>
                        </div>

                        {/* Amenities Box */}
                        <div>
                            <h2 className="text-xl font-bold mb-5 text-gray-900">What this place offers</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {property.amenities.map((amenity)=>(
                                    <div className="border border-gray-200 rounded-xl p-4 flex items-center gap-3">
                                        <LayoutGrid /> <p className='text-primary text-sm font-medium'>{amenity}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>

                    {/* Right Column - Booking Widget */}
                    <div className="lg:w-1/3">
                        <div className="border border-gray-200 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.08)] sticky top-24">
                            
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">ETB {property.price_per_night?.toLocaleString()} <span className="text-sm text-gray-500 font-normal">/ night</span></h2>
                                <div className="flex items-center gap-1 font-bold text-gray-900">
                                    <Star className="size-4 fill-amber-500 text-amber-500" />
                                </div>
                            </div>
                            
                            {/* Date & Guests Selection */}
                            <div className="border border-gray-300 rounded-xl mb-6 overflow-hidden">
                                <div className="flex border-b border-gray-300">
                                    <div className="w-1/2 p-3 border-r border-gray-300 cursor-pointer hover:bg-gray-50">
                                        <label className="block text-[10px] font-bold text-gray-800 uppercase mb-1">Check-in</label>
                                        <input type="date" onChange={(e) => setCheckIn(e.target.value)} value={checkIn} className="w-full outline-none text-sm bg-transparent text-gray-900 cursor-pointer"/>
                                    </div>
                                    <div className="w-1/2 p-3 cursor-pointer hover:bg-gray-50">
                                        <label className="block text-[10px] font-bold text-gray-800 uppercase mb-1">Check-out</label>
                                        <input type="date" onChange={(e) => setCheckOut(e.target.value)} value={checkOut} min={checkIn ? checkIn : undefined} className="w-full outline-none text-sm bg-transparent text-gray-900 cursor-pointer"/>
                                    </div>
                                </div>
                                <div className="p-3 flex justify-between items-center">
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-800 uppercase mb-1">Guests</label>
                                        {/* <div className="text-sm text-gray-900">2 guests</div> */}
                                        <div className='flex justify-between items-center w-full gap-5 '>
                                            <Input placeholder='Guests' onChange={(e)=>{setGuests(e.target.value)}} value={guests} type='number' className={"bg-bg-2"}/>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <p className='font-light text-center text-red-500 text-sm'>{internalError}</p>
                            </div>

                            {/* <Button className="w-full mb-4 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl">Book Now</Button> */}
                            <Button className={"text-sm md:text-lg"} variant={`${isAllSet?"primary":"ghost"}`} size='wide' disabled={!isAllSet} onClick={()=>{setPaymentMethods(true)}}>Book Now</Button>
                            
                            <p className="text-center text-xs text-gray-500 mb-6">You won't be charged yet</p>

                            <div className="space-y-4 text-gray-600 mb-6 text-sm">
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

                            <hr className="border-gray-200 mb-6"/>

                            <div className="flex justify-between font-bold text-lg mb-8 text-gray-900">
                                <span>Total</span>
                                <span className="text-primary">{!nights ? "---" : "ETB " + (property.price_per_night * nights + 500 + 800)?.toLocaleString()}</span>
                            </div>

                            {/* Secure Local Payments */}
                            <div className="bg-blue-50/50 p-4 rounded-xl">
                                <p className="text-[10px] font-bold text-primary/70 uppercase text-center mb-3">Secure Local Payments</p>
                                <div className="flex justify-center gap-2">
                                    <div className="bg-white border border-gray-200 rounded-md px-2 py-1.5 text-[10px] font-bold text-gray-500 flex-1 text-center shadow-sm">Telebirr</div>
                                    <div className="bg-white border border-gray-200 rounded-md px-2 py-1.5 text-[10px] font-bold text-gray-500 flex-1 text-center shadow-sm">CBE</div>
                                    <div className="bg-white border border-gray-200 rounded-md px-2 py-1.5 text-[10px] font-bold text-gray-500 flex-1 text-center shadow-sm">AWASH</div>
                                </div>
                            </div>
                            
                        </div>
                    </div>

                </div>
            </div>

            <Modal isOpen={paymentMethods} onClose={()=>{setPaymentMethods(false)}}>
                <div className='w-full max-w-md mx-auto'>
                    <div className='flex gap-3 items-center mb-6'>
                        <Wallet className='text-primary size-7' /> 
                        <h2 className='font-bold text-2xl text-gray-900'>Payment Method</h2>
                    </div>

                    <div className='flex flex-col gap-4'>
                        {/* Telebirr */}
                        <div 
                            className={`w-full border p-4 rounded-xl flex items-center justify-between cursor-pointer transition-colors ${
                                selectedPaymentMethod === 'telebirr' ? 'border-primary bg-[#f4f7fc]' : 'border-gray-200 hover:border-primary/50'
                            }`}
                            onClick={() => setSelectedPaymentMethod('telebirr')}
                        >
                            <div className='flex items-center gap-4'>
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedPaymentMethod === 'telebirr' ? 'border-primary' : 'border-gray-300'}`}>
                                    {selectedPaymentMethod === 'telebirr' && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                                </div>
                                <span className='font-medium text-lg text-gray-900'>Telebirr</span>
                            </div>
                            <div className='bg-[#e8ecef] p-2 rounded-lg text-primary'>
                                <Smartphone className='size-5' />
                            </div>
                        </div>

                        {/* CBE Birr */}
                        <div 
                            className={`w-full border p-4 rounded-xl flex items-center justify-between cursor-pointer transition-colors ${
                                selectedPaymentMethod === 'cbe' ? 'border-primary bg-[#f4f7fc]' : 'border-gray-200 hover:border-primary/50'
                            }`}
                            onClick={() => setSelectedPaymentMethod('cbe')}
                        >
                            <div className='flex items-center gap-4'>
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedPaymentMethod === 'cbe' ? 'border-primary' : 'border-gray-300'}`}>
                                    {selectedPaymentMethod === 'cbe' && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                                </div>
                                <span className='font-medium text-lg text-gray-900'>CBE Birr</span>
                            </div>
                            <div className='bg-[#e8ecef] p-2 rounded-lg text-primary'>
                                <Landmark className='size-5' />
                            </div>
                        </div>

                        {/* Bank Transfer */}
                        <div 
                            className={`w-full border p-4 rounded-xl flex items-center justify-between cursor-pointer transition-colors ${
                                selectedPaymentMethod === 'bank_transfer' ? 'border-primary bg-[#f4f7fc]' : 'border-gray-200 hover:border-primary/50'
                            }`}
                            onClick={() => setSelectedPaymentMethod('bank_transfer')}
                        >
                            <div className='flex items-center gap-4'>
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedPaymentMethod === 'bank_transfer' ? 'border-primary' : 'border-gray-300'}`}>
                                    {selectedPaymentMethod === 'bank_transfer' && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                                </div>
                                <span className='font-medium text-lg text-gray-900'>Bank Transfer</span>
                            </div>
                            <div className='bg-[#e8ecef] p-2 rounded-lg text-primary'>
                                <Banknote className='size-5' />
                            </div>
                        </div>
                    </div>

                    <div className='mt-8'>
                        <Button className="w-full flex items-center justify-center gap-2 py-4" size="xl">
                            <Lock className="size-5" /> Pay {"&"} Confirm Booking
                        </Button>
                    </div>
                </div>
            </Modal>
        </PageShell>
    )
}

export default PropertyDetails