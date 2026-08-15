import { NavLink } from "react-router-dom"
import useLanguageStore from "../../store/useLanguageStore"
import Button from "../UI/Botton";
import { BookOpenCheck, Calendar, ChevronLeft, CircleHelp, CircleQuestionMark, HandCoins, HandIcon, Home, House, HouseWifi, LayoutDashboard, LogOut, MapPinHouse, Menu, ToggleLeft, ToggleRight, User, Wallet } from 'lucide-react'
import { Profiler, useEffect, useState } from "react";
import { useUser as useClerkUser, useClerk } from "@clerk/clerk-react";
import useUserStore from "../../store/useUser";

const GuestNavbar = () => {
    const { signOut } = useClerk()
    const { isSignedIn } = useClerkUser();
    const { user } = useUserStore();
    const { language, toggleLanguage } = useLanguageStore();
    const navStyle = ({ isActive }) => {
        return isActive ? "underline underline-offset-8 text-secondary " : "hover:text-secondary text-primary "
    }

    const changeLanguagePref = () => {
        toggleLanguage(language => language === "en" ? "am" : "en")
    }
    return (
        <nav className="flex font-bold justify-between w-full px-6 sm:p-1 items-center max-w-screen lg:top-0 left-0 lg:w-full rounded-2xl shadow-lg bg-bg fixed z-10 min-h-15">
            <NavLink to={'/'} className={`text-2xl text-primary text-shadow-lg sm:fixed top-4 lg:top-0 left-5 lg:left-2 lg:relative`} >Betoch</NavLink>
            <div className="gap-3 flex items-center z-20 bg-bg py-3 lg:py-0 rounded-full lg:rounded-0 fixed lg:relative bottom-5 lg:border-0 pt-2 lg:pt-0 lg:bottom-0 left-0 justify-evenly w-screen lg:w-auto">
                <NavLink to={'/explore'} className={navStyle} ><span className="hidden sm:block">Explore</span> <MapPinHouse className="sm:hidden" /> </NavLink>
                <NavLink to={'/properties'} className={navStyle} ><span className="hidden sm:block">List Properties</span> <HouseWifi className="sm:hidden" /></NavLink>
                {isSignedIn && <NavLink to={'/mybookings'} className={navStyle} ><span className="hidden sm:block">My Bookings</span> <Calendar className="sm:hidden" /></NavLink>}
                <NavLink to={'/howitworks'} className={navStyle} ><span className="hidden sm:block">How Is works?</span> <CircleQuestionMark className="sm:hidden" /></NavLink>
                <NavLink to={'/support'} className={navStyle} ><span className="hidden sm:block">Support</span> <HandCoins className="sm:hidden" /></NavLink>
            </div>

            <div className="flex items-center gap-2 lg:p-3 sm:fixed top-3 lg:top-0 lg:relative right-2">
                <div className={`items-center gap-2 text-primary flex ${isSignedIn && "hidden"}`} onClick={changeLanguagePref}>
                    <p className={language === "en" ? "text-primary" : "text-primary/50"}>En</p>
                    {language === "en" ? <ToggleLeft className="size-7" /> : <ToggleRight className="size-7" />}
                    <p className={language === "am" ? "text-primary" : "text-primary/50"}>አማ</p>
                </div>
                {isSignedIn ?
                    <div className="flex items-center gap-3">
                        <NavLink to={'/profile'}>
                            <div className="flex items-center gap-2">
                                <User className="border-2 rounded-full size-9 p-1 text-primary" />
                                <p className="hidden sm:block">{user?.firstName}</p>
                            </div>
                        </NavLink>
                        <NavLink className={"hidden sm:block"}><Button variant="outline" onClick={() => { signOut() }}><LogOut /></Button></NavLink>
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
    const { language, toggleLanguage } = useLanguageStore();

    const navStyle = ({ isActive }) => {
        return isActive ? "flex items-center gap-3 bg-secondary py-2 px-5 rounded-full font-semibold shadow-lg" : "flex items-center gap-3 py-2 px-5 rounded-full font-light bg-bg-2 shadow-lg hover:scale-101";
    }

    const handleClick = () => {
        setIsMenuOpen(false);
    }
    return (
        <nav className="flex flex-col font-bold bg-bg-2">
            <div className="flex w-screen justify-between p-2 text-primary md:hidden rounded-2xl shadow-sm">
                <Menu className={`md:hidden ${isMenuOpen ? "invisible" : "block"} size-8`} onClick={() => setIsMenuOpen(true)} />
                <p className="font-bold text-3xl text-shadow-lg">Betoch</p>
            </div>
            <div className={`flex flex-col ${isMenuOpen ? "flex" : "hidden"} md:flex md:min-h-screen fixed sm:relative md:min-w-70 md:col-span-1 top-0 left-0 inset-y-0 z-10 md:z-1 bg-bg justify-between p-2 rounded-r-2xl shadow-2xl`}>
                <div className="py-10">
                    <div className="flex items-center justify-between text-primary">
                        <NavLink to={'/'} className={"text-2xl text-primary text-shadow-lg"} >Betoch Host</NavLink>
                        <ChevronLeft className={`md:hidden size-8 rounded-full shadow-lg`} onClick={() => setIsMenuOpen(false)} />
                    </div>
                    <p className="text-sm font-light">Host property management</p>

                    <div className="mt-5 flex flex-col gap-2">
                        <NavLink to={'/overview'} className={navStyle} onClick={handleClick} > <LayoutDashboard className="text-green-400" /> <span>Overview</span> </NavLink>
                        <NavLink to={'/properties'} className={navStyle} onClick={handleClick}> <House className="text-green-400" /> Properties</NavLink>
                        <NavLink to={'/bookings'} className={navStyle} onClick={handleClick}> <Calendar className="text-green-400" /> Bookings</NavLink>
                        <NavLink to={'/earning'} className={navStyle} onClick={handleClick}> <Wallet className="text-green-400" /> Earnings</NavLink>
                        <NavLink to={'/support'} className={navStyle} onClick={handleClick}> <CircleHelp className="text-green-400" /> Support</NavLink>
                    </div>
                </div>

                <NavLink to={'/profile'} className="flex px-5 gap-5 items-center border-t border-gray-400 pt-2 cursor-pointer">
                    <User className="border-2 rounded-full size-9 p-1 text-primary" />
                    <div className=" text-primary text-center">
                        <p>Host name</p>
                        <p className="text-sm text-secondary">featured</p>
                    </div>
                </NavLink>

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