import { Navigate } from 'react-router-dom'
import useUserStore from '../store/useUser'
import GuestProfilePage from './GuestProfilePage'
import HostProfilePage from './HostProfilePage'
import AdminProfilePage from './AdminProfilePage'

export default function RoleProfilePage() {
    const role = useUserStore((state) => state.role)
    if (role === 'HOST') return <HostProfilePage />
    if (role === 'ADMIN') return <AdminProfilePage />
    if (role === 'GUEST') return <GuestProfilePage />
    return <Navigate to="/" replace />
}
