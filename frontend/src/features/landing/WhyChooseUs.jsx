import React from 'react'
import { ShieldCheck, CreditCard, Languages } from 'lucide-react'

const reasons = [
    {
        icon: ShieldCheck,
        title: 'Verified Properties',
        description:
            'Every listing undergoes a rigorous 50-point inspection to ensure international safety and luxury standards are met.',
    },
    {
        icon: CreditCard,
        title: 'Local Payments',
        description:
            'Seamless integration with Telebirr, CBE Birr, and Awash. No international transaction fees or exchange rate hassles.',
    },
    {
        icon: Languages,
        title: 'Multi-language Support',
        description:
            'Full support in Amharic and English. Our local concierge team is available 24/7 to assist in your native tongue.',
    },
]

const WhyChooseUs = () => {
    return (
        <section className='bg-primary py-20 px-4 sm:px-10'>
            <h2 className='text-white font-bold text-3xl sm:text-4xl text-center mb-14'>
                Why Guests Choose Zemen
            </h2>

            <div className='grid grid-cols-1 sm:grid-cols-3 gap-10 max-w-8xl mx-auto'>
                {reasons.map(({ icon: Icon, title, description }) => (
                    <div key={title} className='flex flex-col items-center text-center gap-4'>
                        {/* Icon bubble */}
                        <div className='bg-white/10 p-5 rounded-2xl'>
                            <Icon className='size-8 text-secondary' strokeWidth={1.5} />
                        </div>

                        <h3 className='text-white font-bold text-lg'>{title}</h3>
                        <p className='text-white/75 text-sm leading-relaxed'>{description}</p>
                    </div>
                ))}
            </div>
        </section>
    )
}

export default WhyChooseUs
