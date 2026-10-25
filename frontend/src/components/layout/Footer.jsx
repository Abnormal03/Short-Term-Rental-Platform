import { Copyright, Globe, Mail, Phone } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import useUser from '../../store/useUser'
import { useLocation } from 'react-router-dom'


const GuestFooter = () => {
    return (
        <footer className='bg-primary text-white'>
            {/* Main footer grid */}
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 px-6 sm:px-10 lg:px-16 py-14'>

                {/* Brand column */}
                <div className='flex flex-col gap-4'>
                    <NavLink to='/' className='font-bold text-2xl text-white'>Betoch</NavLink>
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

                <div className='flex flex-col gap-3'>
                    <h2 className='font-bold text-lg text-white'>Discover</h2>
                    <NavLink to='/explore' className='text-white/70 hover:text-white text-sm transition-colors'>Explore stays</NavLink>
                    <NavLink to='/properties' className='text-white/70 hover:text-white text-sm transition-colors'>Browse properties</NavLink>
                    <NavLink to='/about' className='text-white/70 hover:text-white text-sm transition-colors'>About Betoch</NavLink>
                </div>
            </div>

            {/* Copyright bar */}
            <div className='border-t border-white/10 py-4 px-6 sm:px-10 text-center'>
                <p className='text-white/50 text-xs'>
                    © {new Date().getFullYear()} Betoch Rentals Ethiopia. All rights reserved.
                </p>
            </div>
        </footer>
    )
}

const HostFooter = () => {
    return (
        <footer className='mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-border/60 bg-transparent px-4 py-3'>
            <div className='sm:hidden'>
                <h1 className='text-primary text-2xl font-bold text-shadow-lg'>Betoch</h1>
                <p className='flex gap-1 text-sm text-primary'><Copyright /> 2026 BETOCH RENTALS ETHIOPIA.</p>
            </div>
            <div></div>
            <div className='flex flex-wrap gap-4'>
                <NavLink to={'/privacy'} className="text-[9px] text-text-2 underline underline-offset-2 hover:text-primary">Privacy</NavLink>
                <NavLink to={'/terms'} className="text-[9px] text-text-2 underline underline-offset-2 hover:text-primary">Terms and conditions</NavLink>
                <NavLink to={'/guarantee'} className="text-[9px] text-text-2 underline underline-offset-2 hover:text-primary">Host guarantee</NavLink>
            </div>
        </footer>
    )
}

const Footer = () => {

    const { role } = useUser();
    const location = useLocation()

    const ishost = role === "HOST";
    if (role === 'ADMIN' && location.pathname === '/admin/site') {
        return <footer className="flex items-center justify-between gap-3 border-t border-border bg-bg px-5 py-3 text-[10px] text-text-2 sm:px-7"><span>© {new Date().getFullYear()} Betoch Rentals Ethiopia</span><NavLink to="/admin" className="font-semibold text-primary hover:underline">Back to admin</NavLink></footer>
    }
    if (role === 'ADMIN' && location.pathname !== '/admin/site') {
        return <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-border bg-bg px-5 py-3 text-[10px] text-text-2 sm:px-7"><span>© {new Date().getFullYear()} Betoch Rentals Ethiopia · Admin console</span><span className="flex gap-3"><NavLink to="/privacy" className="hover:underline">Privacy</NavLink><NavLink to="/terms" className="hover:underline">Terms</NavLink><NavLink to="/contact" className="hover:underline">Support</NavLink></span></footer>
    }
    return (
        ishost ? <HostFooter /> : <GuestFooter />
    )
}

export default Footer
