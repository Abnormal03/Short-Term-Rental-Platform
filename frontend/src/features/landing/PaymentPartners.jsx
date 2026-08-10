import React from 'react'

const partners = [
    {
        label: 'telebirr',
        abbr: 't',
        bg: 'bg-blue-500',
        text: 'text-white',
    },
    {
        label: 'CBE Birr',
        abbr: 'CBE',
        bg: 'bg-purple-500',
        text: 'text-white',
    },
    {
        label: 'Awash Bank',
        abbr: 'A',
        bg: 'bg-amber-400',
        text: 'text-white',
    },
]

const PaymentPartners = () => {
    return (
        <section className='bg-bg-2 py-12 px-4 sm:px-10'>
            <p className='text-center text-xs font-semibold tracking-widest text-text/50 uppercase mb-8'>
                Our Payment Partners
            </p>

            <div className='flex flex-wrap justify-center items-center gap-8 sm:gap-14'>
                {partners.map(({ label, abbr, bg, text }) => (
                    <div key={label} className='flex items-center gap-3'>
                        {/* Logo bubble */}
                        <div className={`${bg} ${text} w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm shrink-0`}>
                            {abbr}
                        </div>
                        <span className='text-text font-medium text-lg'>{label}</span>
                    </div>
                ))}
            </div>
        </section>
    )
}

export default PaymentPartners
