import { Copyright, ExternalLink, Globe, Mail, Phone } from 'lucide-react'
import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import useUser from '../../store/useUser'


const GuestFooter = () => {
    const [email, setEmail] = useState('')

    return (
        <footer className='bg-primary text-white'>
            {/* Main footer grid */}
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 px-6 sm:px-10 lg:px-16 py-14'>

                {/* Brand column */}
                <div className='flex flex-col gap-4'>
                    <NavLink to='/' className='font-bold text-2xl text-white'>Zemen</NavLink>
                    <p className='text-white/70 text-sm leading-relaxed max-w-56'>
                        Modern Hospitality in the Heart of Ethiopia. Redefining your stay
                        with security and local excellence.
                    </p>
                    <div className='flex items-center gap-4 mt-2 text-white/60'>
                        <a href='https://zemenrentals.com' target='_blank' rel='noreferrer' aria-label='Website'>
                            <Globe className='size-5 hover:text-secondary transition-colors' />
                        </a>
                        <a href='mailto:hello@zemenrentals.com' aria-label='Email'>
                            <Mail className='size-5 hover:text-secondary transition-colors' />
                        </a>
                        <a href='tel:+251900000000' aria-label='Phone'>
                            <Phone className='size-5 hover:text-secondary transition-colors' />
                        </a>
                    </div>
                </div>

                {/* Company column */}
                <div className='flex flex-col gap-3'>
                    <h2 className='font-bold text-lg text-white'>Company</h2>
                    <NavLink to='/about' className='text-white/70 hover:text-white text-sm transition-colors'>About Us</NavLink>
                    <NavLink to='/terms' className='text-white/70 hover:text-white text-sm transition-colors'>Terms of Service</NavLink>
                    <NavLink to='/privacy' className='text-white/70 hover:text-white text-sm transition-colors'>Privacy Policy</NavLink>
                </div>

                {/* Support column */}
                <div className='flex flex-col gap-3'>
                    <h2 className='font-bold text-lg text-white'>Support</h2>
                    <a href='https://telebirr.com' target='_blank' rel='noreferrer' className='text-white/70 hover:text-white text-sm transition-colors'>Telebirr Support</a>
                    <a href='https://combanketh.et' target='_blank' rel='noreferrer' className='text-white/70 hover:text-white text-sm transition-colors'>CBE Integration</a>
                    <NavLink to='/contact' className='text-white/70 hover:text-white text-sm transition-colors'>Contact Us</NavLink>
                </div>

                {/* Newsletter column */}
                <div className='flex flex-col gap-3'>
                    <h2 className='font-bold text-lg text-white'>Newsletter</h2>
                    <p className='text-white/70 text-sm leading-relaxed'>
                        Subscribe for exclusive offers and travel tips in Ethiopia.
                    </p>
                    <div className='flex mt-1'>
                        <input
                            type='email'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder='Email address'
                            className='flex-1 bg-white/10 border border-white/20 rounded-l-lg px-3 py-2 text-sm text-white placeholder:text-white/40 outline-none focus:border-secondary transition-colors'
                        />
                        <button className='bg-secondary text-white font-semibold px-4 py-2 rounded-r-lg text-sm hover:brightness-110 transition-all'>
                            Join
                        </button>
                    </div>
                </div>
            </div>

            {/* Copyright bar */}
            <div className='border-t border-white/10 py-4 px-6 sm:px-10 text-center'>
                <p className='text-white/50 text-xs'>
                    © 2024 Zemen Rentals. Modern Hospitality in the Heart of Ethiopia. All rights reserved.
                </p>
            </div>
        </footer>
    )
}

const HostFooter = () => {
    return (
        <div className='fixed bottom-0 md:right-0 sm:flex justify-between px-3 items-center  md:py-4 w-full z-5 sm:z-0'>
            <hr className='w-screen sm:hidden text-green-500' />
            <div className='sm:hidden'>
                <h1 className='text-primary text-2xl font-bold text-shadow-lg'>Betoch</h1>
                <p className='flex gap-1 text-sm text-primary'><Copyright /> 2026 BETOCH RENTALS ETHIOPIA.</p>
            </div>
            <div></div>
            <div className='flex flex-col gap-1 lg:flex-row sm:flex-row sm:gap-5 lg:gap-3 lg:pr-20'>
                <NavLink to={'/privacy'} className={"underline sm:decoration-0 text-secondary"} >privacy</NavLink>
                <NavLink to={'/terms'} className={"underline sm:decoration-0 text-secondary"} >terms and conditions</NavLink>
                <NavLink to={'/guarantee'} className={"underline sm:decoration-0 text-secondary"} >host guarantee</NavLink>
            </div>
        </div>
    )
}

const Footer = () => {

    const { role } = useUser();

    const ishost = role === "HOST";
    return (
        ishost ? <HostFooter /> : <GuestFooter />
    )
}

export default Footer   