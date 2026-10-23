import { Navigate, Outlet } from 'react-router-dom'
import useUserStore from '../store/useUser'

export default function GuestOnlyRoute() {
    const role = useUserStore((state) => state.role)

    if (role === 'GUEST') return <Outlet />
    if (role === 'HOST') return <Navigate to="/overview" replace />
    if (role === 'ADMIN') return <Navigate to="/admin" replace />
    return <Navigate to="/" replace />
}
