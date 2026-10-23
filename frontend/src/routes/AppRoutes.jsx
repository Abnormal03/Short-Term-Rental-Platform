import React from 'react'
import { Navigate, Route, Routes } from "react-router-dom"
import { SignedIn, SignedOut } from "@clerk/clerk-react"
import LoginPage from '../pages/Auth/LoginPage'
import LandingPage from '../pages/LandingPage'
import ExplorePage from '../pages/ExplorePage'

import PropertyDetails from '../pages/PropertyDetails'
import SignUpPage from '../pages/Auth/Signup'
import CompleteProfileForm from '../features/profile/components/CompleteProfile'
import RoleProfilePage from '../pages/RoleProfilePage'
import MyBookingsPage from '../pages/MyBookingsPage'
import BookingDetailsPage from '../pages/BookingDetailsPage'
import CheckoutReviewPage from '../pages/CheckoutReviewPage'
import { BookingConfirmationPage, BookingPaymentResultPage } from '../pages/BookingPaymentPages'
import { CompleteProfileRoute, ProfileCompletionGate } from './ProfileCompletionGate'
import HostOnlyRoute from './HostOnlyRoute'
import HostOverviewPage from '../pages/HostOverviewPage'
import HostPropertiesPage from '../pages/HostPropertiesPage'
import ListingsPage from '../pages/ListingsPage'
import AdminPropertyReviewPage from '../pages/AdminPropertyReviewPage'
import useUserStore from '../store/useUser'
import AdminOnlyRoute from './AdminOnlyRoute'
import AdminDashboardPage from '../pages/AdminDashboardPage'
import AdminUsersPage from '../pages/AdminUsersPage'
import AdminDisputesPage from '../pages/AdminDisputesPage'
import GuestOnlyRoute from './GuestOnlyRoute'

function SignedInHome() {
    const role = useUserStore((state) => state.role)
    if (role === 'HOST') return <Navigate to="/overview" replace />
    if (role === 'ADMIN') return <Navigate to="/admin" replace />
    return <Navigate to="/explore" replace />
}

function PropertiesHome() {
    const role = useUserStore((state) => state.role)
    if (role === 'HOST') return <HostPropertiesPage />
    if (role === 'ADMIN') return <Navigate to="/admin" replace />
    return <ListingsPage />
}

const AppRoutes = () => {
    return (
        <>
            <SignedIn>
                <Routes>
                    <Route path='/complete-profile' element={<CompleteProfileRoute><CompleteProfileForm /></CompleteProfileRoute>} />
                    <Route path='/sign-in/*' element={<Navigate to="/" replace />} />
                    <Route element={<ProfileCompletionGate />}>
                        <Route path='/' element={<SignedInHome />} />
                        <Route element={<GuestOnlyRoute />}>
                            <Route path='/explore' element={<ExplorePage />} />
                            <Route path='/my-bookings/:bookingId' element={<BookingDetailsPage />} />
                            <Route path='/properties/:id/checkout' element={<CheckoutReviewPage />} />
                            <Route path='/bookings/:bookingId/confirmation' element={<BookingConfirmationPage />} />
                            <Route path='/bookings/:bookingId/success' element={<BookingPaymentResultPage />} />
                            <Route path='/bookings/:bookingId/failed' element={<BookingPaymentResultPage />} />
                            <Route path='/bookings/:bookingId/cancelled' element={<BookingPaymentResultPage />} />
                        </Route>
                        <Route path='/properties' element={<PropertiesHome />} />
                        <Route path='/listings' element={<Navigate to="/properties" replace />} />
                        <Route path='/properties/:id' element={<PropertyDetails />} />
                        <Route path='/my-bookings' element={<MyBookingsPage />} />
                        <Route path='/profile' element={<RoleProfilePage />} />
                        <Route element={<HostOnlyRoute />}>
                            <Route path='/overview' element={<HostOverviewPage />} />
                        </Route>
                        <Route element={<AdminOnlyRoute />}>
                            <Route path='/admin' element={<AdminDashboardPage />} />
                            <Route path='/admin/properties' element={<AdminPropertyReviewPage />} />
                            <Route path='/admin/users' element={<AdminUsersPage />} />
                            <Route path='/admin/disputes' element={<AdminDisputesPage />} />
                        </Route>
                    </Route>
                </Routes>
            </SignedIn>
            <SignedOut >

                <Routes>
                    <Route path='/' element={<LandingPage />} />
                    <Route path='/sign-up/*' element={<SignUpPage />} />
                    <Route path='/sign-in/*' element={<LoginPage />} />
                    <Route path='/explore' element={<ExplorePage />} />
                    <Route path='/properties' element={<ListingsPage />} />
                    <Route path='/listings' element={<Navigate to="/properties" replace />} />
                    <Route path='/properties/:id' element={<PropertyDetails />} />
                    <Route path='/properties/:id/checkout' element={<CheckoutReviewPage />} />
                </Routes>
            </SignedOut>
        </>
    )
}

export default AppRoutes
