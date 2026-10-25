import { NavLink, useLocation, useNavigate } from "react-router-dom"
import useLanguageStore from "../../store/useLanguageStore"
import Button from "../UI/Botton";
import { Bell, Calendar, CalendarDays, ChevronLeft, ClipboardCheck, House, LayoutDashboard, MapPinHouse, Menu, Search, User, ShieldCheck, UsersRound, Scale } from 'lucide-react'
import { useEffect, useState } from "react";
import { useUser as useClerkUser, useClerk, useAuth } from "@clerk/clerk-react";
import useUserStore from "../../store/useUser";
import { ThemeToggle } from "../UI/ThemeToggle";
import { useQuery } from "@tanstack/react-query";
import { adminService } from "../../features/admin/adminService";
import { propertyService } from "../../features/properties/services/propertyService";
import { profileServices } from "../../features/profile/services/profileServices";

function LanguageToggle({ className = '' }) {
    const { language, setLanguage } = useLanguageStore()
    const role = useUserStore((state) => state.role)
    const { isSignedIn } = useClerkUser()
    const { getToken } = useAuth()
    const changeLanguage = async () => {
        const previous = language
        const next = language === 'en' ? 'am' : 'en'
        setLanguage(next)
        if (!isSignedIn || !['GUEST', 'HOST'].includes(role)) return
        try {
            const token = await getToken()
            await profileServices.updateLanguage(next, token ? { headers: { Authorization: `Bearer ${token}` } } : undefined)
        } catch (error) {
            setLanguage(previous)
            console.error('Could not save language preference:', error.message)
        }
    }
    return <button type="button" onClick={changeLanguage} aria-label={language === 'en' ? 'Switch to Amharic' : 'Switch to English'} className={className}>{language === 'en' ? 'EN · አማ' : 'አማ · EN'}</button>
}

function useAdminAttentionCounts() {
    const properties = useQuery({
        queryKey: ['admin', 'nav-pending-listings'],
        queryFn: async () => (await propertyService.getAdminProperties({ page: 1, limit: 1, status: 'PENDING' })).data,
        staleTime: 30_000,
    })
    const users = useQuery({
        queryKey: ['admin', 'nav-pending-users'],
        queryFn: async () => (await adminService.getUsers(1, 1)).data,
        staleTime: 30_000,
    })
    return {
        listings: properties.data?.statusCounts?.PENDING ?? 0,
        users: (users.data?.unverifiedHosts ?? 0) + (users.data?.pendingGuests ?? 0),
    }
}

function AttentionBadge({ count }) {
    if (!count) return null
    return <span aria-label={`${count} items need review`} className="ml-auto grid min-w-5 place-items-center rounded-full bg-[#f5a900] px-1.5 py-0.5 text-[10px] font-bold leading-none text-[#17231c]">{count > 99 ? '99+' : count}</span>
}

const GuestNavbar = () => {
    const { signOut } = useClerk()
    const { isSignedIn } = useClerkUser();
    const { user } = useUserStore();
    const role = useUserStore((state) => state.role);
    const location = useLocation()
    const isAdminPreview = role === 'ADMIN' && location.pathname === '/admin/site'
    const navStyle = ({ isActive }) => {
        return isActive ? "underline underline-offset-8 text-secondary " : "hover:text-secondary text-primary "
    }

    return (
        <nav className="flex font-bold justify-between w-full px-6 sm:p-1 items-center max-w-screen lg:top-0 left-0 lg:w-full bg-bg fixed z-10 min-h-15">
            <NavLink to={isAdminPreview ? '/admin' : '/'} className={`text-2xl text-primary text-shadow-lg sm:fixed top-4 lg:top-0 left-5 lg:left-2 lg:relative`} >Betoch</NavLink>
            <div className="gap-3 flex items-center z-20 bg-bg py-3 lg:py-0 rounded-full lg:rounded-0 fixed lg:relative bottom-5 lg:border-0 pt-2 lg:pt-0 lg:bottom-0 left-0 justify-evenly w-screen lg:w-auto">
                <NavLink to={isAdminPreview ? '/admin/site' : '/explore'} className={navStyle} ><span className="hidden sm:block">Explore</span> <MapPinHouse className="sm:hidden" /> </NavLink>
                {!isAdminPreview && role !== 'ADMIN' && <NavLink to={'/properties'} className={navStyle}><span className="hidden sm:block">Properties</span><House className="sm:hidden" /></NavLink>}
                {role === 'ADMIN' && !isAdminPreview && <><NavLink to={'/admin'} className={navStyle}>Dashboard</NavLink><NavLink to={'/admin/properties'} className={navStyle}><ShieldCheck className="sm:hidden" /><span className="hidden sm:block">Listings</span></NavLink><NavLink to={'/admin/users'} className={navStyle}><UsersRound className="sm:hidden" /><span className="hidden sm:block">Users</span></NavLink><NavLink to={'/admin/disputes'} className={navStyle}><Scale className="sm:hidden" /><span className="hidden sm:block">Disputes</span></NavLink></>}
                {isSignedIn && role !== 'ADMIN' ? (
                    <NavLink to={'/my-bookings'} className={navStyle}><span className="hidden sm:block">My Bookings</span><Calendar className="sm:hidden" /></NavLink>
                ) : null}
            </div>

            <div className="flex items-center gap-2 lg:p-3 sm:fixed top-3 lg:top-0 lg:relative right-2">
                {role !== 'ADMIN' && !isAdminPreview && <LanguageToggle className="rounded-full border border-border bg-bg px-3 py-2 text-[11px] font-semibold text-primary" />}
                <ThemeToggle />
                {isSignedIn && !isAdminPreview ?
                    <div className="flex items-center gap-3">
                        <NavLink to={'/profile'} aria-label={user?.firstName ? `Profile, ${user.firstName}` : 'Profile'}>
                            <div className="flex items-center gap-2">
                                <User aria-hidden="true" className="border-2 rounded-full size-9 p-1 text-primary" />
                                <p className="hidden sm:block">{user?.firstName}</p>
                                <span className="sr-only">{user?.firstName ? `Profile for ${user.firstName}` : 'Profile'}</span>
                            </div>
                        </NavLink>
                    </div>
                    : isAdminPreview ? <NavLink to="/admin" className="rounded-lg border border-border px-3 py-2 text-xs font-semibold text-primary">Admin dashboard</NavLink>
                        :
                        <div className="items-center gap-3 hidden sm:flex">
                            <NavLink to={'/sign-in'}><Button variant="outline">Login</Button></NavLink>
                            <NavLink to={'/sign-up'}><Button variant="primary">Sign Up</Button></NavLink>
                        </div>}

            </div>
        </nav>
    )
}


const HostNavBar = () => {

    //side bar for hosts...
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const user = useUserStore((state) => state.user);
    const navStyle = ({ isActive }) => isActive
        ? "flex min-h-10 items-center gap-2.5 rounded-lg bg-[#f5a900] px-3 text-sm font-semibold text-[#17231c] transition-colors"
        : "flex min-h-10 items-center gap-2.5 rounded-lg px-3 text-sm font-medium text-white/90 transition-colors hover:bg-white/10";

    const handleClick = () => {
        setIsMenuOpen(false);
    }
    return (
        <nav className="z-20 w-full shrink-0 bg-[#0d3d2d] font-bold md:sticky md:top-0 md:h-screen md:w-[220px] md:flex-none">
            <div className="flex w-full items-center justify-between px-3 py-2 text-white md:hidden">
                <button type="button" aria-label="Open host navigation" aria-expanded={isMenuOpen} onClick={() => setIsMenuOpen(true)} className={`md:hidden ${isMenuOpen ? "invisible" : "block"}`}>
                    <Menu className="size-7" />
                </button>
                <p className="mr-auto ml-3 text-xl font-extrabold">Betoch <span className="text-[#f5a900]">Host</span></p>
            </div>
            <div className={`${isMenuOpen ? "flex" : "hidden"} fixed inset-y-0 left-0 z-30 w-[250px] flex-col justify-between bg-[#0d3d2d] p-3 shadow-2xl md:static md:flex md:h-full md:w-full md:shadow-none`}>
                <div className="pt-1">
                    <div className="flex items-start justify-between text-white">
                        <NavLink to={'/overview'} onClick={handleClick} className="text-xl font-extrabold leading-6">Betoch <span className="text-[#f5a900]">Host</span></NavLink>
                        <button type="button" aria-label="Close host navigation" onClick={() => setIsMenuOpen(false)} className="md:hidden">
                            <ChevronLeft className="size-7 rounded-full" />
                        </button>
                    </div>
                    <p className="mt-1 text-xs font-normal text-white/70">Host property management</p>

                    <div className="mt-4 flex flex-col gap-0.5">
                        <NavLink to={'/overview'} className={navStyle} onClick={handleClick}> <LayoutDashboard size={14} /> <span>Overview</span> </NavLink>
                        <NavLink to={'/properties'} className={navStyle} onClick={handleClick}> <House size={14} /> Properties</NavLink>
                        <NavLink to={'/host/bookings'} className={navStyle} onClick={handleClick}> <CalendarDays size={14} /> Bookings</NavLink>
                        <NavLink to={'/host/calendar'} className={navStyle} onClick={handleClick}> <Calendar size={15} /> Calendar</NavLink>
                    </div>
                </div>

                <div className="border-t border-white/10 pt-2">
                    <NavLink to={'/profile'} onClick={handleClick} className="flex items-center gap-2 px-1.5 py-1.5 text-left text-white">
                        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#f5a900] text-sm font-bold text-[#17231c]">{(user?.firstName || user?.fullName || 'H').slice(0, 1).toUpperCase()}</span>
                        <div className="min-w-0">
                            <p className="truncate text-xs font-semibold">{user?.fullName || 'Host account'}</p>
                            <p className="text-[11px] font-medium text-[#f5a900]">Host</p>
                        </div>
                    </NavLink>
                    <div className="mt-1.5 flex items-center gap-2 px-1">
                        <LanguageToggle className="min-h-8 rounded-full border border-white/10 bg-white/10 px-3 text-[11px] font-semibold text-white" />
                        <ThemeToggle />
                    </div>
                </div>
            </div>
        </nav>
    )
}


const AdminNavBar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const user = useUserStore((state) => state.user)
    const attention = useAdminAttentionCounts()
    const items = [
        { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
        { to: '/admin/properties', label: 'Listings', icon: ClipboardCheck, count: attention.listings },
        { to: '/admin/users', label: 'Users', icon: UsersRound, count: attention.users },
        { to: '/admin/disputes', label: 'Disputes', icon: Scale },
    ]
    const navStyle = ({ isActive }) => `flex min-h-10 items-center gap-2.5 rounded-lg px-3 text-sm font-semibold transition-colors ${isActive ? 'bg-[#f5a900] text-[#17231c]' : 'text-white/90 hover:bg-white/10'}`
    const closeMenu = () => setIsMenuOpen(false)

    return <>
        <div className="flex items-center justify-between bg-[#0d3d2d] px-4 py-3 text-white md:hidden">
            <button type="button" aria-label="Open admin navigation" onClick={() => setIsMenuOpen(true)}><Menu className="size-6" /></button>
            <span className="mr-auto ml-3 text-lg font-extrabold">Betoch <span className="text-[#f5a900]">Admin</span></span>
        </div>
        <aside className={`${isMenuOpen ? 'flex' : 'hidden'} fixed inset-y-0 left-0 z-30 w-[238px] flex-col justify-between bg-[#0d3d2d] p-3 text-white md:sticky md:top-0 md:flex md:h-screen md:w-[198px] md:flex-none`}>
            <div>
                <NavLink to="/admin" onClick={closeMenu} className="block px-2 pt-2 text-xl font-extrabold">Betoch <span className="text-[#f5a900]">Admin</span></NavLink>
                <p className="px-2 pt-1 text-xs font-normal text-white/70">Platform management</p>
                <nav aria-label="Admin navigation" className="mt-5 flex flex-col gap-1">{items.map(({ to, label, icon: Icon, end, count }) => <NavLink key={to} to={to} end={end} onClick={closeMenu} className={navStyle}><Icon size={15} />{label}<AttentionBadge count={count} /></NavLink>)}</nav>
            </div>
            <div className="border-t border-white/10 pt-3">
                <NavLink to="/admin/site" onClick={closeMenu} className="flex min-h-9 items-center gap-2 px-2 text-sm font-semibold text-white/90 hover:text-white"><span aria-hidden="true">↗</span> View site</NavLink>
                <NavLink to="/profile" onClick={closeMenu} className={({ isActive }) => `mt-2 flex items-center gap-2 rounded-lg px-2 py-1.5 text-white ${isActive ? 'bg-white/10' : 'hover:bg-white/10'}`}>
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#f5a900] text-sm font-bold text-[#17231c]">{(user?.firstName || user?.fullName || 'A').slice(0, 1).toUpperCase()}</span>
                    <div className="min-w-0"><p className="truncate text-xs font-semibold">{user?.fullName || user?.firstName || 'Admin'}</p><p className="text-[11px] text-[#f5a900]">Admin</p></div>
                </NavLink>
            </div>
        </aside>
    </>
}

const AdminTopBar = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const [search, setSearch] = useState(() => new URLSearchParams(location.search).get('search') || '')
    const attention = useAdminAttentionCounts()
    const attentionCount = attention.listings + attention.users
    useEffect(() => setSearch(new URLSearchParams(location.search).get('search') || ''), [location.search])
    return <header className="sticky top-0 z-10 flex min-h-14 items-center justify-between gap-3 border-b border-border bg-bg px-5 sm:px-7">
        <form onSubmit={(event) => { event.preventDefault(); const target = location.pathname.startsWith('/admin/properties') ? '/admin/properties' : '/admin/users'; navigate(`${target}?search=${encodeURIComponent(search.trim())}`) }} className="flex h-10 w-full max-w-md items-center gap-2 rounded-lg border border-border bg-bg-2 px-3 text-text-2">
            <Search size={15} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search users" aria-label="Search admin users or listings" className="min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-text-2/70" />
        </form>
        <div className="flex shrink-0 items-center gap-2"><button type="button" onClick={() => navigate('/admin#needs-attention')} aria-label={attentionCount ? `${attentionCount} items need attention` : 'No items need attention'} className="relative grid size-9 place-items-center rounded-full border border-border bg-bg text-text hover:bg-bg-2"><Bell size={15} />{attentionCount > 0 && <span aria-hidden="true" className="absolute right-1 top-1 size-2 rounded-full bg-[#f5a900] ring-2 ring-bg" />}</button><ThemeToggle /></div>
    </header>
}

const Navbar = () => {
    const { role } = useUserStore();
    const location = useLocation()
    const isHost = role === "HOST";
    const isAdminPreview = role === 'ADMIN' && location.pathname === '/admin/site'
    return (
        isHost ? <HostNavBar /> : role === 'ADMIN' && !isAdminPreview ? <AdminNavBar /> : <GuestNavbar />
    )
}

export { AdminTopBar }
export default Navbar
