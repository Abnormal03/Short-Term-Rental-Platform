import { NavLink } from "react-router-dom"
import useLanguageStore from "../../store/useLanguageStore"
import Button from "../UI/Botton";
import { Calendar, ChevronLeft, House, LayoutDashboard, LogOut, MapPinHouse, Menu, ToggleLeft, ToggleRight, User, ShieldCheck, UsersRound, Scale } from 'lucide-react'
import { useState } from "react";
import { useUser as useClerkUser, useClerk } from "@clerk/clerk-react";
import useUserStore from "../../store/useUser";
import { ThemeToggle } from "../UI/ThemeToggle";

const GuestNavbar = () => {
    const { signOut } = useClerk()
    const { isSignedIn } = useClerkUser();
    const { user } = useUserStore();
    const role = useUserStore((state) => state.role);
    const { language, toggleLanguage } = useLanguageStore();
    const navStyle = ({ isActive }) => {
        return isActive ? "underline underline-offset-8 text-secondary " : "hover:text-secondary text-primary "
    }

    const changeLanguagePref = () => {
        toggleLanguage(language => language === "en" ? "am" : "en")
    }
    return (
        <nav className="flex font-bold justify-between w-full px-6 sm:p-1 items-center max-w-screen lg:top-0 left-0 lg:w-full bg-bg fixed z-10 min-h-15">
            <NavLink to={'/'} className={`text-2xl text-primary text-shadow-lg sm:fixed top-4 lg:top-0 left-5 lg:left-2 lg:relative`} >Betoch</NavLink>
            <div className="gap-3 flex items-center z-20 bg-bg py-3 lg:py-0 rounded-full lg:rounded-0 fixed lg:relative bottom-5 lg:border-0 pt-2 lg:pt-0 lg:bottom-0 left-0 justify-evenly w-screen lg:w-auto">
                <NavLink to={'/explore'} className={navStyle} ><span className="hidden sm:block">Explore</span> <MapPinHouse className="sm:hidden" /> </NavLink>
                {role !== 'ADMIN' && <NavLink to={'/properties'} className={navStyle}><span className="hidden sm:block">Properties</span><House className="sm:hidden" /></NavLink>}
                {role === 'ADMIN' && <><NavLink to={'/admin'} className={navStyle}>Dashboard</NavLink><NavLink to={'/admin/properties'} className={navStyle}><ShieldCheck className="sm:hidden" /><span className="hidden sm:block">Listings</span></NavLink><NavLink to={'/admin/users'} className={navStyle}><UsersRound className="sm:hidden" /><span className="hidden sm:block">Users</span></NavLink><NavLink to={'/admin/disputes'} className={navStyle}><Scale className="sm:hidden" /><span className="hidden sm:block">Disputes</span></NavLink></>}
                {isSignedIn && role !== 'ADMIN' ? (
                    <NavLink to={'/my-bookings'} className={navStyle}><span className="hidden sm:block">My Bookings</span><Calendar className="sm:hidden" /></NavLink>
                ) : null}
            </div>

            <div className="flex items-center gap-2 lg:p-3 sm:fixed top-3 lg:top-0 lg:relative right-2">
                <div className={`items-center gap-2 text-primary flex ${isSignedIn && "hidden"}`} onClick={changeLanguagePref}>
                    <p className={language === "en" ? "text-primary" : "text-primary/50"}>En</p>
                    {language === "en" ? <ToggleLeft className="size-7" /> : <ToggleRight className="size-7" />}
                    <p className={language === "am" ? "text-primary" : "text-primary/50"}>አማ</p>
                </div>
                <ThemeToggle />
                {isSignedIn ?
                    <div className="flex items-center gap-3">
                        <NavLink to={'/profile'} aria-label={user?.firstName ? `Profile, ${user.firstName}` : 'Profile'}>
                            <div className="flex items-center gap-2">
                                <User aria-hidden="true" className="border-2 rounded-full size-9 p-1 text-primary" />
                                <p className="hidden sm:block">{user?.firstName}</p>
                                <span className="sr-only">{user?.firstName ? `Profile for ${user.firstName}` : 'Profile'}</span>
                            </div>
                        </NavLink>
                        <div className="hidden sm:block">
                            <Button aria-label="Log out" variant="outline" onClick={() => signOut()}>
                                <LogOut aria-hidden="true" />
                            </Button>
                        </div>
                    </div>
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

    const navStyle = ({ isActive }) => {
        return isActive ? "flex items-center gap-3 bg-secondary text-on-secondary py-2 px-5 rounded-full font-semibold shadow-lg" : "flex items-center gap-3 py-2 px-5 rounded-full font-light bg-bg-2 text-text shadow-sm hover:bg-neutral";
    }

    const handleClick = () => {
        setIsMenuOpen(false);
    }
    return (
        <nav className="z-20 w-full shrink-0 bg-bg-2 font-bold md:sticky md:top-0 md:h-screen md:w-72">
            <div className="flex w-full justify-between p-2 text-primary md:hidden rounded-2xl shadow-sm">
                <button type="button" aria-label="Open host navigation" aria-expanded={isMenuOpen} onClick={() => setIsMenuOpen(true)} className={`md:hidden ${isMenuOpen ? "invisible" : "block"}`}>
                    <Menu className="size-8" />
                </button>
                <p className="font-bold text-3xl text-shadow-lg">Betoch</p>
            </div>
            <div className={`flex flex-col ${isMenuOpen ? "flex" : "hidden"} fixed inset-y-0 left-0 z-30 w-72 flex-col justify-between bg-bg p-4 shadow-2xl md:static md:flex md:h-full md:w-full md:rounded-none md:shadow-none`}>
                <div className="py-6">
                    <div className="flex items-center justify-between text-primary">
                        <NavLink to={'/overview'} className="text-2xl text-primary text-shadow-lg">Betoch Host</NavLink>
                        <button type="button" aria-label="Close host navigation" onClick={() => setIsMenuOpen(false)} className="md:hidden">
                            <ChevronLeft className="size-8 rounded-full shadow-lg" />
                        </button>
                    </div>
                    <p className="text-sm font-light text-text-2">Host property management</p>

                    <div className="mt-5 flex flex-col gap-2">
                        <NavLink to={'/overview'} className={navStyle} onClick={handleClick}> <LayoutDashboard className="text-primary" /> <span>Overview</span> </NavLink>
                        <NavLink to={'/properties'} className={navStyle} onClick={handleClick}> <House className="text-primary" /> Properties</NavLink>
                    </div>
                </div>

                <div className="flex items-center justify-between border-t border-border pt-3">
                    <NavLink to={'/profile'} className="flex px-2 gap-3 items-center cursor-pointer">
                        <User className="border-2 rounded-full size-9 p-1 text-primary" />
                        <div className="text-primary text-center">
                            <p>{user?.fullName || 'Host account'}</p>
                            <p className="text-sm text-secondary">Host</p>
                        </div>
                    </NavLink>
                    <ThemeToggle />
                </div>
            </div>
        </nav>
    )
}


const Navbar = () => {
    const { role } = useUserStore();
    const isHost = role === "HOST";
    return (
        isHost ? <HostNavBar /> : <GuestNavbar />
    )
}

export default Navbar
