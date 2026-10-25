import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { PageSpinner } from '../components/UI/Spinner'
import useUserStore from '../store/useUser'

export default function GuestOnlyRoute() {
    const role = useUserStore((state) => state.role)
    const accountStatus = useUserStore((state) => state.accountStatus)
    const profileStatus = useUserStore((state) => state.profileStatus)
    const location = useLocation()

    // Clerk can restore a session before AuthSync has resolved the platform role.
    if (profileStatus === 'loading' || !role) return <PageSpinner />

    if (role === 'GUEST') {
        if (accountStatus && accountStatus !== 'ACTIVE' && location.pathname !== '/explore') return <Navigate to="/explore" replace />
        return <Outlet />
    }
    if (role === 'HOST') return <Navigate to="/overview" replace />
    if (role === 'ADMIN') return <Navigate to="/admin" replace />
    return <Navigate to="/" replace />
}
