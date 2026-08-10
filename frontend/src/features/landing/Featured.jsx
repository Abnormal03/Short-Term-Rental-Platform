import React from 'react'
import { NavLink } from 'react-router-dom'
import useFeaturedProperties from '../properties/hooks/useFeaturedProperties'
import { Spinner } from '../../components/UI/Spinner'
import { Badge } from '../../components/UI/Badge'
import { Verified,Dot } from "lucide-react"
import Button from '../../components/UI/Botton'

const Featured = () => {

    const { data: properties, isLoading, error } = useFeaturedProperties(4);
    return (
        <div>
            <div className='flex items-center justify-between px-3 lg:px-10 mt-10'>
                <div>
                    <h1 className='font-bold text-2xl'>Featured Products</h1>
                    <p className='hidden md:block'>Handpicked premium stays across Ethiopia's most vibrant cities.</p>
                </div>
                <NavLink to={'/listings'}><p className='underline text-primary font-bold flex md:relative md:top-3 hidden sm:block'>View all</p></NavLink>
            </div>
            <div>
                {isLoading ? 
                <div className='h-50 max-w-100 flex items-center justify-center bg-bg/25 m-3 rounded-2xl shadow-lg flex-col gap-2'>
                    <Spinner />
                    fetching featured properties...
                </div> :
                    !properties || error ? <div className='text-center h-50 w-100 md:w-full flex items-center justify-center bg-bg/25 rounded-2xl shadow-lg'>
                        failed to load featured properties...
                    </div> :
                        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 my-10 mx-2 sm:mx-10'>
                            {properties.map((property) => (
                                <div className='relative min-h-50 flex flex-col items-center bg-bg rounded-2xl overflow-hidden' key={property.property_id}>
                                    <Badge className={"absolute top-2 left-2"} variant={'verified'}> <Verified className='size-3' /> verified</Badge>
                                    <img src={property?.propertyImages[0]?.image_url} className='w-100 h-50' alt="" />
                                    <div className='px-5 py-2.5 w-full '>
                                        <h1 className='font-bold text-xl'>{property.title}</h1>
                                        <div className='flex items-center gap-0.5 text-sm'>
                                            <p>{property.city}</p> 
                                            <Dot />
                                            <p>{property.country}</p>
                                        </div>
                                        <hr className='my-5 opacity-25' />
                                        <div className='flex justify-between items-center'>
                                            <p className='font-bold text-xl'>ETB {property.price_per_night} <span className='text-sm font-light'>/night</span></p>
                                            <NavLink to={`/properties/${property.property_id}`}> <Button variant='outline' size='sm' className={"text-primary"}>Details</Button></NavLink>
                                        </div>
                                    </div>
                                    
                                </div>
                            ))}
                            <div className='flex w-full justify-center sm:hidden'>
                                <NavLink to={'/listings'}><Button variant='primary' size='md' className={"w-50 self-center"}>View All</Button> </NavLink>
                            </div>
                        </div>
                }
            </div>
        </div>
    )
}

export default Featured