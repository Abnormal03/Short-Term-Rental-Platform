import React, { useState } from 'react'
import PageShell from '../../components/layout/PageShell'
import home from '../../assets/home.jpg'
import Input from '../../components/UI/Input'
import { Calendar, Group, GroupIcon, PinIcon, Search, Users } from 'lucide-react'
import Button from '../../components/UI/Botton'

const Hero = () => {

    const [date, setDate] = useState('');

    return (
        <div className="min-h-200 w-full bg-cover bg-center pt-15 lg:px-10" style={{ backgroundImage: `url(${home})` }}>

            <div className='max-w-screen min-h-25 mx-2 lg:w-full bg-bg py-2 px-5 sm:px-10 flex flex-col lg:flex-row gap-8  rounded-2xl justify-between relative top-110 lg:top-140 lg:items-center'>

                <div>
                    <p className='text-text'>Location</p>
                    <div className='flex items-center'>
                        <PinIcon className='size-5 text-primary' />
                        <Input size='sm' placeholder='Where are you going?'></Input>
                    </div>
                </div>

                <div className='flex overflow-hidden items-center h-fit py-2 lg:py-0 sm:justify-between lg:justify-evenly w-full'>

                    <div className='flex flex-col justify-evenly -mt-5'>
                        <p className='text-text'>Dates</p>
                        <div className='flex items-center'>
                            <input
                                type="date"
                                id="start-date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className='text-primary text-lg'
                            />
                        </div>
                    </div>
                    <div>
                        <p className='text-text'>Guests</p>
                        <div className='flex items-center'>
                            <Users className='text-primary size-8' />
                            <Input type='number' size='sm' placeholder='Add Guest'></Input>
                        </div>
                    </div>
                </div>
                <Button variant='secondary' size='wide' className={"max-w-80"}>
                    <div className='flex items-center gap-5'>
                        <Search />
                        Search
                    </div>
                </Button>

            </div>
        </div>
    )
}

export default Hero