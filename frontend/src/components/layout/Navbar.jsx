import { NavLink } from "react-router-dom"
import useLanguageStore from "../../store/useLanguageStore"
import Button from "../UI/Botton";
import { BookOpenCheck, Calendar, ChevronLeft, CircleHelp, CircleQuestionMark, HandCoins, HandIcon, Home, House, HouseWifi, LayoutDashboard, MapPinHouse, Menu, ToggleLeft, ToggleRight, User, Wallet } from 'lucide-react'
import { Profiler, useState } from "react";
import useUser from "../../store/useUser";

const GuestNavbar = ({ isLoggedIn = true }) => {

    const { language, toggleLanguage } = useLanguageStore();
    const navStyle = ({ isActive }) => {
        return isActive ? "underline underline-offset-8 text-primary " : "hover:text-primary "
    }

    const changeLanguagePref = () => {
        toggleLanguage(language => language === "en" ? "am" : "en")
    }
    return (
        <nav className="flex font-bold justify-between sm:p-1 p-1 border-b items-center max-w-screen lg:top-0 left-0 lg:w-full">
            <NavLink to={'/'} className={`text-2xl text-primary`} >Betoch</NavLink>
            <div className="gap-3 flex items-center z-20 bg-bg py-3 lg:py-0 rounded-full lg:rounded-0 absolute lg:relative bottom-2 lg:border-0 pt-2 lg:pt-0 lg:bottom-0 left-0 justify-evenly w-screen lg:w-auto ">
                <NavLink to={'/explore'} className={navStyle} ><span className="hidden sm:block">Explore</span> <MapPinHouse className="sm:hidden" /> </NavLink>
                <NavLink to={'/properties'} className={navStyle} ><span className="hidden sm:block">List Properties</span> <HouseWifi className="sm:hidden" /></NavLink>
                {isLoggedIn && <NavLink to={'/mybookings'} className={navStyle} ><span className="hidden sm:block">My Bookings</span> <Calendar className="sm:hidden" /></NavLink>}
                <NavLink to={'/howitworks'} className={navStyle} ><span className="hidden sm:block">How Is works?</span> <CircleQuestionMark className="sm:hidden" /></NavLink>
                <NavLink to={'/support'} className={navStyle} ><span className="hidden sm:block">Support</span> <HandCoins className="sm:hidden" /></NavLink>
            </div>

            <div className="flex items-center gap-2 p-3">
                <div className={`items-center gap-2 text-primary flex ${isLoggedIn && "hidden"}`} onClick={changeLanguagePref}>
                    <p className={language === "en" ? "text-primary" : "text-primary/50"}>En</p>
                    {language === "en" ? <ToggleLeft className="size-7" /> : <ToggleRight className="size-7" />}
                    <p className={language === "am" ? "text-primary" : "text-primary/50"}>አማ</p>
                </div>
                {isLoggedIn ?
                    <NavLink to={'/profile'}>
                        <User className="border-2 rounded-full size-9 p-1 text-primary" />
                    </NavLink> :
                    <div className="items-center gap-3 hidden sm:flex">
                        <Button variant="outline">Login</Button>
                        <Button variant="primary">Sign Up</Button>
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
        return isActive ? "flex items-center gap-3 bg-secondary py-2 px-5 rounded-full font-semibold" : "flex items-center gap-3 py-2 px-5 rounded-full font-light";
    }

    const handleClick = () => {
        setIsMenuOpen(false);
    }
    return (
        <nav className="flex flex-col font-semibold">
            <div className="flex w-screen justify-between p-2 text-primary md:hidden">
                <Menu className={`md:hidden ${isMenuOpen ? "invisible" : "block"}`} onClick={() => setIsMenuOpen(true)} />
                <p className="font-bold text-3xl">Betoch</p>
            </div>
            <div className={`flex flex-col ${isMenuOpen ? "flex" : "hidden"} md:flex md:min-h-screen fixed top-0 left-0 inset-y-0 md:w-70 md:min-w-70 z-10 md:z-0 bg-bg-2 justify-between p-2 md:max-w-fit`}>
                <div className="py-10">
                    <div className="flex items-center justify-between text-primary">
                        <NavLink to={'/'} className={"text-2xl text-primary"} >Betoch Host</NavLink>
                        <ChevronLeft className={`md:hidden border size-8 rounded-full ${!isMenuOpen ? "hidden" : "block"}`} onClick={() => setIsMenuOpen(false)} />
                    </div>
                    <p className="text-sm font-light">Host property management</p>

                    <div className="mt-5">
                        <NavLink to={'/overview'} className={navStyle} onClick={handleClick} > <LayoutDashboard /> <span>Overview</span> </NavLink>
                        <NavLink to={'/properties'} className={navStyle} onClick={handleClick}> <House /> Properties</NavLink>
                        <NavLink to={'/bookings'} className={navStyle} onClick={handleClick}> <Calendar /> Bookings</NavLink>
                        <NavLink to={'/earning'} className={navStyle} onClick={handleClick}> <Wallet /> Earnings</NavLink>
                        <NavLink to={'/support'} className={navStyle} onClick={handleClick}> <CircleHelp /> Support</NavLink>
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
    const { user, setUser } = useUser();
    const isHost = user?.role === "HOST" || false;
    return (
        isHost ? <HostNavBar /> : <GuestNavbar isLoggedIn={false} />
    )
}

export default Navbar