import React from 'react'
import { Route, Routes } from "react-router-dom"
import { SignedIn, SignedOut } from "@clerk/clerk-react"
import LoginPage from '../pages/Auth/LoginPage'
import DashboardShell from "../components/layout/DashboardShell"
import LandingPage from '../pages/LandingPage'

import PropertyDetails from '../pages/PropertyDetails'
import SignUpPage from '../pages/Auth/Signup'
import CompleteProfileForm from '../features/profile/components/CompleteProfile'

const AppRoutes = () => {
    return (
        <>
            <SignedIn>
                <Routes>
                    <Route path='/' element={<DashboardShell />} />
                    <Route path='/explore' element={<LandingPage />} />
                    <Route path='/properties/:id' element={<PropertyDetails />} />
                    <Route path='/complete-profile' element={<CompleteProfileForm />} />
                </Routes>
            </SignedIn>
            <SignedOut >

                <Routes>
                    <Route path='/' element={<DashboardShell />} />
                    <Route path='/sign-up/*' element={<SignUpPage />} />
                    <Route path='/sign-in/*' element={<LoginPage />} />
                    <Route path='/explore' element={<LandingPage />} />
                    <Route path='/properties/:id' element={<PropertyDetails />} />
                </Routes>
            </SignedOut>
        </>
    )
}

export default AppRoutes