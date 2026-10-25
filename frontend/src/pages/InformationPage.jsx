import { Link, useLocation } from 'react-router-dom'
import PageShell from '../components/layout/PageShell'

const pages = {
    '/about': {
        title: 'A local way to feel at home',
        intro: 'Betoch helps travelers find locally hosted stays across Ethiopia, with clear prices and a straightforward booking experience.',
        sections: [['For guests', 'Browse reviewed property listings, compare stay details, and pay using the available local payment options at checkout.'], ['For hosts', 'Hosts can share their properties with travelers and manage listing details through the host workspace.'], ['Our name', 'Betoch means homes. We want every stay to connect visitors with the places and people that make Ethiopia special.']],
    },
    '/terms': {
        title: 'Terms of service',
        intro: 'These terms describe the basic rules for using Betoch Rentals.',
        sections: [['Bookings', 'A booking request is subject to property availability and payment confirmation. Check the dates, guest count, price, and cancellation information shown during checkout before paying.'], ['Guests and hosts', 'Guests must provide accurate booking details and follow the host’s stated house rules. Hosts must keep their listing details and availability accurate.'], ['Payments and cancellations', 'Payment processing and any refund are subject to the status and terms of the booking shown in your account. Contact support if a payment or cancellation appears incorrect.'], ['Platform use', 'Do not misuse the service, misrepresent a property, or use another person’s account. We may restrict access when needed to protect users and the service.']],
    },
    '/privacy': {
        title: 'Privacy policy',
        intro: 'Betoch uses account and booking information to operate the rental service.',
        sections: [['Information used', 'We use account details, contact information, and booking details to maintain your account, coordinate stays, process payments, and provide support.'], ['Sharing', 'Booking details are shared with the relevant host or guest as needed to arrange a stay. Payment details are handled by the selected payment provider.'], ['Your choices', 'Keep your account details current and contact support to request help with your information or account.']],
    },
    '/contact': {
        title: 'Contact support',
        intro: 'Need help with a listing, booking, payment, or cancellation? Contact our support team and include the booking reference if you have one.',
        sections: [['Email', 'hello@zemenrentals.com'], ['Phone', '+251 900 000 000'], ['Payment questions', 'For a payment issue, include the payment method and booking reference. Do not email passwords or payment card details.']],
    },
    '/guarantee': {
        title: 'Host support',
        intro: 'Betoch gives hosts tools to manage properties, availability, and guest bookings.',
        sections: [['Keep listings accurate', 'Describe the property, amenities, price, and availability clearly. Update your calendar when your plans change.'], ['Guest communication', 'Share check-in instructions and relevant house rules with confirmed guests in good time.'], ['Need help?', 'Contact hello@zemenrentals.com with the listing or booking details so the team can help.']],
    },
}

export default function InformationPage() {
    const { pathname } = useLocation()
    const page = pages[pathname] || { title: 'Page not found', intro: 'We could not find the page you requested.', sections: [] }
    return <PageShell><article className="mx-auto w-full max-w-3xl px-5 pb-16 pt-24 text-text sm:px-8" aria-labelledby="info-title">
        <Link to="/explore" className="text-sm font-semibold text-primary hover:underline">← Explore stays</Link>
        <h1 id="info-title" className="mt-5 text-3xl font-bold sm:text-4xl">{page.title}</h1>
        <p className="mt-4 text-base leading-7 text-text-2">{page.intro}</p>
        <div className="mt-8 space-y-6">{page.sections.map(([heading, body]) => <section key={heading} className="rounded-2xl border border-border bg-surface p-5"><h2 className="font-bold">{heading}</h2><p className="mt-2 whitespace-pre-line text-sm leading-6 text-text-2">{body}</p></section>)}</div>
    </article></PageShell>
}
