import { Headphones } from 'lucide-react'

export default function BookingHelpBand() {
    return <section className="rounded-2xl bg-primary p-5 text-white">
        <div className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white/15"><Headphones size={19} /></span>
            <div><h2 className="text-sm font-bold">Need help with a booking?</h2><p className="mt-1 text-xs leading-5 text-white/75">Our support team can help with check-in, cancellations, or contacting your host.</p></div>
        </div>
        <a href="mailto:hello@zemenrentals.com" className="mt-4 block rounded-lg bg-bg px-4 py-2.5 text-center text-xs font-bold text-primary transition hover:brightness-95">Contact help centre</a>
    </section>
}
