import React from 'react'
import Navbar from './Navbar'
import Footer from './Footer'
import useUserStore from '../../store/useUser'

const PageShell = ({ children }) => {
    const isHost = useUserStore((state) => state.role === 'HOST')

    if (isHost) {
        return (
            <div className='min-h-screen bg-bg-2 md:flex'>
                <Navbar />
                <div className='flex min-h-screen min-w-0 flex-1 flex-col'>
                    <main className='flex-1'>{children}</main>
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
