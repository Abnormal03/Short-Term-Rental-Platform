import { Navigate, Route, Routes } from "react-router-dom"
import { SignedIn, SignedOut } from "@clerk/clerk-react"
import LoginPage from '../pages/Auth/LoginPage'
import LandingPage from '../pages/LandingPage'
import ExplorePage from '../pages/ExplorePage'

import PropertyDetails from '../pages/PropertyDetails'
import SignUpPage from '../pages/Auth/Signup'
import CompleteProfileForm from '../features/profile/components/CompleteProfile'
import RoleProfilePage from '../pages/RoleProfilePage'
import EditProfilePage from '../pages/EditProfilePage'
import MyBookingsPage from '../pages/MyBookingsPage'
import BookingDetailsPage from '../pages/BookingDetailsPage'
import CheckoutReviewPage from '../pages/CheckoutReviewPage'
import { BookingConfirmationPage, BookingPaymentResultPage, BookingSignInRequiredPage } from '../pages/BookingPaymentPages'
import { CompleteProfileRoute, ProfileCompletionGate } from './ProfileCompletionGate'
import HostOnlyRoute from './HostOnlyRoute'
import HostOverviewPage from '../pages/HostOverviewPage'
import HostPropertiesPage from '../pages/HostPropertiesPage'
import HostBookingsPage from '../pages/HostBookingsPage'
import HostCalendarPage from '../pages/HostCalendarPage'
import ListingsPage from '../pages/ListingsPage'
import AdminPropertyReviewPage from '../pages/AdminPropertyReviewPage'
import useUserStore from '../store/useUser'
import AdminOnlyRoute from './AdminOnlyRoute'
import AdminDashboardPage from '../pages/AdminDashboardPage'
import AdminUsersPage from '../pages/AdminUsersPage'
import AdminDisputesPage from '../pages/AdminDisputesPage'
import AdminPropertyDetailPage from '../pages/AdminPropertyDetailPage'
import { AdminGuestReviewPage, AdminHostReviewPage } from '../pages/AdminUserReviewPage'
import GuestOnlyRoute from './GuestOnlyRoute'
import InformationPage from '../pages/InformationPage'

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
                    <Route path='/sign-up/*' element={<Navigate to="/" replace />} />
                    <Route element={<ProfileCompletionGate />}>
                        <Route path='/' element={<SignedInHome />} />
                        <Route element={<GuestOnlyRoute />}>
                            <Route path='/explore' element={<ExplorePage />} />
                            <Route path='/my-bookings' element={<MyBookingsPage />} />
                            <Route path='/my-bookings/:bookingId' element={<BookingDetailsPage />} />
                            <Route path='/properties/:id/checkout' element={<CheckoutReviewPage />} />
                            <Route path='/bookings/:bookingId/confirmation' element={<BookingConfirmationPage />} />
                            <Route path='/bookings/:bookingId/success' element={<BookingPaymentResultPage />} />
                            <Route path='/bookings/:bookingId/failed' element={<BookingPaymentResultPage />} />
                            <Route path='/bookings/:bookingId/cancelled' element={<BookingPaymentResultPage />} />
                        </Route>
                        <Route path='/edit-profile' element={<EditProfilePage />} />
                        <Route path='/properties' element={<PropertiesHome />} />
                        <Route path='/listings' element={<Navigate to="/properties" replace />} />
                        <Route path='/properties/:id' element={<PropertyDetails />} />
                        <Route path='/profile' element={<RoleProfilePage />} />
                        <Route path='/about' element={<InformationPage />} />
                        <Route path='/terms' element={<InformationPage />} />
                        <Route path='/privacy' element={<InformationPage />} />
                        <Route path='/contact' element={<InformationPage />} />
                        <Route path='/guarantee' element={<InformationPage />} />
                        <Route element={<HostOnlyRoute />}>
                            <Route path='/overview' element={<HostOverviewPage />} />
                            <Route path='/host/bookings' element={<HostBookingsPage />} />
                            <Route path='/host/calendar' element={<HostCalendarPage />} />
                        </Route>
                        <Route element={<AdminOnlyRoute />}>
                            <Route path='/admin' element={<AdminDashboardPage />} />
                            <Route path='/admin/site' element={<ExplorePage />} />
                            <Route path='/admin/properties' element={<AdminPropertyReviewPage />} />
                            <Route path='/admin/properties/:propertyId' element={<AdminPropertyDetailPage />} />
                            <Route path='/admin/users' element={<AdminUsersPage />} />
                            <Route path='/admin/users/host/:userId' element={<AdminHostReviewPage />} />
                            <Route path='/admin/users/guest/:userId' element={<AdminGuestReviewPage />} />
                            <Route path='/admin/disputes' element={<AdminDisputesPage />} />
                        </Route>
                        <Route path='*' element={<InformationPage />} />
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
                    <Route path='/bookings/:bookingId/confirmation' element={<BookingSignInRequiredPage />} />
                    <Route path='/bookings/:bookingId/success' element={<BookingSignInRequiredPage />} />
                    <Route path='/bookings/:bookingId/failed' element={<BookingSignInRequiredPage />} />
                    <Route path='/bookings/:bookingId/cancelled' element={<BookingSignInRequiredPage />} />
                    <Route path='/about' element={<InformationPage />} />
                    <Route path='/terms' element={<InformationPage />} />
                    <Route path='/privacy' element={<InformationPage />} />
                    <Route path='/contact' element={<InformationPage />} />
                    <Route path='/guarantee' element={<InformationPage />} />
                    <Route path='*' element={<InformationPage />} />
                </Routes>
            </SignedOut>
        </>
    )
}

export default AppRoutes
