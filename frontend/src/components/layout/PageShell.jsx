import React from 'react'
import Navbar from './Navbar'
import Footer from './Footer'

const PageShell = ({ children }) => {
    return (
        <div className='min-h-screen flex flex-col bg-bg-2'>
            <Navbar />
            <main className='flex'>
                {children}
            </main>
            <Footer />
        </div>
    )
}

export default PageShell