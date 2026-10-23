import { Navigate, Outlet } from 'react-router-dom'
import useUserStore from '../store/useUser'

export default function HostOnlyRoute() {
    const role = useUserStore((state) => state.role)
    return role === 'HOST' ? <Outlet /> : <Navigate to="/explore" replace />
}
