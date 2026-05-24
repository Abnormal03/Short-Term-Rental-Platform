import { Copyright, ExternalLink, Link2, Underline } from 'lucide-react'
import React from 'react'
import { NavLink } from 'react-router-dom'
import useUser from '../../store/useUser'


const GuestFooter = () => {
    return (
        <div className='absolute bottom-0 bg-primary text-text-2 w-full min-h-70 p-2 md:flex justify-between lg:px-10 lg:pt-10 pb-20 md:pb-0'>
            <div className='text-text-2/70 text-sm'>
                <NavLink to={'/'} className='font-bold text-2xl text-text-2'>Betoch</NavLink>
                <p className='max-w-80'>Modern Hospitality in the
                    Heart of Ethiopia. Connecting
                    premium spaces with
                    discerning travelers since
                    2024.</p>
                <hr className='sm:hidden mt-4' />
            </div>

            <div className='flex flex-col text-sm gap-1 mt-4 text-text-2/80'>
                <h1 className='text-lg text-text-2 '>Company</h1>
                <NavLink to={'/about'} className={"underline font-light"} >About Us</NavLink>
                <NavLink to={'/terms'} className={"underline font-light"} >terms and conditions</NavLink>
                <NavLink to={'/privacy'} className={"underline font-light"} >Privacy Policy</NavLink>
                <hr className='sm:hidden my-4' />
            </div>

            <div className='flex flex-col text-sm gap-1 mt-4 text-text-2/80'>
                <h1 className='text-lg text-text-2 '>Support</h1>
                <a href="https://chapa.co" target='_blank' className={"underline font-light"} >Payment Integration</a>
                <NavLink to={'/contact'} className={"underline font-light"} >Contact Us</NavLink>
                <hr className='sm:hidden my-4' />
            </div>


            <div className='text-text-2/80 text-sm flex flex-col gap-1'>
                <h1 className='text-text-2 text-lg'>Stay Connected!</h1>
                <a href="https://linkedin.com" target='_blank' className='flex items-center gap-3 text-secondary'> <ExternalLink className='size-4' />LinkedIn </a>
                <a href="https://instagram.com" target='_blank' className='flex items-center gap-3 text-secondary'> <ExternalLink className='size-4' />Instagram </a>
                <a href="https://twitter.com" target='_blank' className='flex items-center gap-3 text-secondary'> <ExternalLink className='size-4' />X-Twitter </a>
                <p className='flex items-center gap-2'><Copyright className='size-4' />2026 Betoch Rentals</p>
            </div>
        </div>
    )
}


const HostFooter = () => {
    return (
        <div className='absolute bottom-0 md:right-0 sm:flex justify-between px-3 items-center  md:py-4 w-full z-5'>
            <hr className='w-screen sm:hidden' />
            <div className=''>
                <h1 className='text-primary text-2xl font-bold'>Betoch</h1>
                <p className='flex gap-1 text-sm'><Copyright /> 2026 BETOCH RENTALS ETHIOPIA.</p>
            </div>
            <div className='flex flex-col gap-1 lg:flex-row lg:gap-3 lg:pr-20'>
                <NavLink to={'/privacy'} className={"underline sm:decoration-0"} >privacy</NavLink>
                <NavLink to={'/terms'} className={"underline sm:decoration-0"} >terms and conditions</NavLink>
                <NavLink to={'/guarantee'} className={"underline sm:decoration-0"} >host guarantee</NavLink>
            </div>
        </div>
    )
}

const Footer = () => {

    const { user } = useUser();

    const ishost = user?.role === "HOST" || false
    return (
        true ? <HostFooter /> : <GuestFooter />
    )
}

export default Footer