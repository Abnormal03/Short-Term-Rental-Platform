import { Navigate, Outlet } from 'react-router-dom'
import useUserStore from '../store/useUser'

export default function AdminOnlyRoute() {
    const role = useUserStore((state) => state.role)
    return role === 'ADMIN' ? <Outlet /> : <Navigate to="/explore" replace />
}
