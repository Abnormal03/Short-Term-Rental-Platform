import Navbar from './Navbar'
import { AdminTopBar } from './Navbar'
import Footer from './Footer'
import useUserStore from '../../store/useUser'
import { useLocation } from 'react-router-dom'

const PageShell = ({ children }) => {
    const role = useUserStore((state) => state.role)
    const location = useLocation()
    const isHost = role === 'HOST'
    const isAdmin = role === 'ADMIN' && location.pathname !== '/admin/site'

    if (isHost) {
        return (
            <div className='min-h-screen bg-[#f4f5f1] dark:bg-[#071911] md:flex'>
                <Navbar />
                <div className='flex min-h-screen min-w-0 flex-1 flex-col bg-[#f4f5f1] dark:bg-[#071911]'>
                    <main className='flex-1'>{children}</main>
                    <Footer />
                </div>
            </div>
        )
    }

    if (isAdmin) {
        return (
            <div className="min-h-screen bg-bg-2 md:flex">
                <Navbar />
                <div className="flex min-h-screen min-w-0 flex-1 flex-col">
                    <AdminTopBar />
                    <main className="flex-1">{children}</main>
                    <Footer />
                </div>
            </div>
        )
    }

    return (
        <div className='min-h-screen flex flex-col bg-bg-2'>
            <Navbar />
            <main className='flex flex-1'>
                {children}
            </main>
            <Footer />
        </div>
    )
}

export default PageShell
