import { useState } from 'react'
import { ArrowRight, ArrowUpRight, Check, ChevronDown, Compass, CreditCard, Headphones, House, Menu, ShieldCheck, Sparkles, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ThemeToggle } from '../components/UI/ThemeToggle'

const benefits = [
    { icon: ShieldCheck, title: 'Verified properties', copy: 'Listings are reviewed before they appear on Betoch.' },
    { icon: CreditCard, title: 'Pay in birr', copy: 'Book locally with the payment options available at checkout.' },
    { icon: Compass, title: 'Local perspective', copy: 'Find places and experiences rooted in Ethiopia.' },
    { icon: Headphones, title: 'Help when you need it', copy: 'Get support with your booking and account.' },
    { icon: Check, title: 'Clear pricing', copy: 'Review the booking details before you confirm.' },
    { icon: House, title: 'Built for hosts', copy: 'Manage your properties and bookings in one place.' },
]

const destinations = [
    { name: 'Addis Ababa', note: 'City stays', color: 'from-emerald-800 to-emerald-400', image: "../../src/assets/Images/Addis Ababa.avif" },
    { name: 'Bahir Dar', note: 'Lakeside escapes', color: 'from-sky-900 to-sky-400', image: "../../src/assets/Images/bahir dar.jpg" },
    { name: 'Lalibela', note: 'History and heritage', color: 'from-amber-800 to-amber-400', image: "../../src/assets/Images/lalibela.jpg" },
    { name: 'Hawassa', note: 'A slower pace', color: 'from-lime-900 to-lime-500', image: "../../src/assets/Images/hawassa.jpg" },
    { name: 'Gondar', note: 'Castles and culture', color: 'from-orange-900 to-orange-400', image: "../../src/assets/Images/Gonder.jpg" },
]

const faqs = [
    { question: 'How are properties reviewed?', answer: 'Hosts submit their property details for review. Approved listings are shown to guests browsing Betoch.' },
    { question: 'How do I pay for a stay?', answer: 'Choose a property and review the available payment options and booking total before confirming.' },
    { question: 'Can I list my property?', answer: 'Yes. Create an account, choose the host role during profile setup, then add your property for review.' },
    { question: 'Can I browse before creating an account?', answer: 'Yes. Explore properties first, then sign in when you are ready to continue with a booking.' },
]

export default function LandingPage() {
    const [menuOpen, setMenuOpen] = useState(false)
    const closeMenu = () => setMenuOpen(false)

    return (
        <div className="min-h-screen bg-bg-2 text-text">
            <header className="sticky top-0 z-40 border-b border-border/70 bg-bg/95 backdrop-blur">
                <nav className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-5 sm:px-8" aria-label="Main navigation">
                    <Link to="/" className="shrink-0 text-lg font-bold tracking-tight text-primary">Betoch</Link>
                    <div className="hidden items-center gap-7 text-xs font-medium text-text-2 lg:flex">
                        <a href="#how-it-works" className="transition hover:text-primary">How it works</a>
                        <a href="#why-betoch" className="transition hover:text-primary">Why Betoch</a>
                        <a href="#destinations" className="transition hover:text-primary">Destinations</a>
                        <a href="#faq" className="transition hover:text-primary">FAQ</a>
                    </div>
                    <div className="hidden items-center gap-3 sm:flex">
                        <span className="rounded-full border border-border px-2.5 py-1.5 text-[0.65rem] font-semibold text-text-2">EN · አማ</span>
                        <ThemeToggle />
                        <Link to="/sign-in" className="text-xs font-semibold text-text hover:text-primary">Sign in</Link>
                        <Link to="/sign-up" className="rounded-lg bg-secondary px-4 py-2.5 text-xs font-bold text-on-secondary transition hover:brightness-105">Get started</Link>
                    </div>
                    <div className="flex items-center gap-2 sm:hidden">
                        <ThemeToggle />
                        <button type="button" onClick={() => setMenuOpen((open) => !open)} aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} className="grid size-9 place-items-center rounded-full border border-border text-text">
                            {menuOpen ? <X size={18} /> : <Menu size={18} />}
                        </button>
                    </div>
                </nav>
                {menuOpen && <div className="grid gap-4 border-t border-border bg-bg px-5 py-5 text-sm font-medium text-text-2 sm:hidden">
                    <a href="#how-it-works" onClick={closeMenu}>How it works</a>
                    <a href="#why-betoch" onClick={closeMenu}>Why Betoch</a>
                    <a href="#destinations" onClick={closeMenu}>Destinations</a>
                    <a href="#faq" onClick={closeMenu}>FAQ</a>
                    <div className="flex items-center gap-5 border-t border-border pt-4">
                        <Link to="/sign-in" onClick={closeMenu}>Sign in</Link>
                        <Link to="/sign-up" onClick={closeMenu} className="font-semibold text-primary">Get started</Link>
                    </div>
                </div>}
            </header>

            <main>
                <section className="mx-auto grid max-w-7xl items-center gap-12 px-5 pb-12 pt-14 sm:px-8 sm:pt-20 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 lg:pb-14 lg:pt-20">
                    <div>
                        <p className="mb-4 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-primary">Stays across Ethiopia</p>
                        <h1 className="max-w-xl text-balance text-[clamp(2.6rem,6vw,4.7rem)] font-bold leading-[0.99] tracking-[-0.055em] text-text">
                            Every stay in Ethiopia has a <span className="decoration-secondary decoration-[0.14em] underline underline-offset-4">story.</span> Start yours.
                        </h1>
                        <p className="mt-5 max-w-lg text-sm leading-7 text-text-2 sm:text-base">
                            Betoch connects travelers with local hosts and places worth discovering. Find your next stay, book with confidence, and pay in birr.
                        </p>
                        <div className="mt-7 flex flex-wrap gap-3">
                            <Link to="/explore" className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-button-text transition hover:brightness-110">Find a stay <ArrowRight size={16} /></Link>
                            <Link to="/sign-up" className="inline-flex items-center gap-2 rounded-lg border border-border bg-bg px-5 py-3 text-sm font-semibold text-text transition hover:border-primary hover:text-primary">Become a host <ArrowUpRight size={15} /></Link>
                        </div>
                        <p className="mt-4 text-[0.68rem] text-text-2">Free to join. Pay with the options available at checkout.</p>
                    </div>

                    <div className="relative mx-auto w-full max-w-xl pb-5 pt-2 hidden sm:flex" aria-label="A preview of stays on Betoch">
                        <div className="grid grid-cols-2 gap-3 sm:gap-4">
                            <img src='../../src/assets/Images/Ethiopia-2.jpg' className='object-fill sm:h-48 h-36 rounded-2xl ' />
                            <div className="relative h-36 rounded-2xl shadow-lg sm:h-48 overflow-clip">
                                <img src='../../src/assets/Images/local-payments.jpg' className='object-fill h-full w-full' />
                                {/* <span className="absolute bottom-3 left-3 rounded-full bg-bg/80 px-2 py-1 text-[0.55rem] font-semibold text-text-2">A quiet city stay</span> */}
                            </div>
                            <div className="relative h-28 rounded-2xl shadow-lg sm:h-36">
                                <img src='../../src/assets/Images/Ethiopia-1.jpg' className='object-fill rounded-2xl ' />
                                {/* <span className="absolute bottom-3 left-3 rounded-full bg-bg/80 px-2 py-1 text-[0.55rem] font-semibold text-text-2">Nature nearby</span> */}
                            </div>
                            <div className="relative h-28 rounded-2xl shadow-lg sm:h-36">
                                <img src='../../src/assets/Images/verified homes.jpg' className='object-fill rounded-2xl' />
                                <span className="absolute bottom-0 left-3 rounded-full bg-bg/80 px-2 py-1 text-[0.55rem] font-semibold text-text-2">Made for a getaway</span>
                            </div>
                        </div>
                        <div className="absolute right-0 top-10 flex items-center gap-2 rounded-xl border border-border bg-bg px-3 py-2 text-[0.65rem] font-semibold text-text shadow-lg sm:right-1 sm:top-36">
                            <span className="grid size-7 place-items-center rounded-lg bg-primary/10 text-primary"><CreditCard size={15} /></span>
                            Pay with local options
                        </div>
                        <div className="absolute bottom-0 left-0 flex items-center gap-2 rounded-xl border border-border bg-bg px-3 py-2 text-[0.65rem] font-semibold text-text shadow-lg sm:-left-4">
                            <span className="grid size-7 place-items-center rounded-lg bg-primary/10 text-primary"><ShieldCheck size={15} /></span>
                            <span>Verified stay<small className="block font-normal text-text-2">Reviewed before it goes live</small></span>
                        </div>
                    </div>
                </section>

                <section className="border-y border-border bg-bg" aria-label="Betoch highlights">
                    <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-5 py-5 text-[0.65rem] font-semibold text-text-2 sm:grid-cols-4 sm:px-8 sm:py-6">
                        <p className="flex items-center gap-2"><ShieldCheck size={15} className="text-primary" /> Verified properties</p>
                        <p className="flex items-center gap-2"><CreditCard size={15} className="text-primary" /> Pay in birr</p>
                        <p className="flex items-center gap-2"><Sparkles size={15} className="text-primary" /> Local perspective</p>
                        <p className="flex items-center gap-2"><Headphones size={15} className="text-primary" /> Booking support</p>
                    </div>
                </section>

                <section id="why-betoch" className="scroll-mt-20 bg-primary px-5 py-14 text-white sm:px-8 sm:py-20">
                    <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
                        <div>
                            <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-secondary">Our story</p>
                            <h2 className="mt-3 max-w-lg text-balance text-3xl font-bold leading-tight tracking-tight sm:text-4xl">Betoch means homes. We think every trip should feel like arriving at one.</h2>
                            <p className="mt-5 max-w-xl text-sm leading-7 text-white/75">Ethiopia is full of places worth staying: a stone guest house above Lalibela, a lakeside lodge near Bahir Dar, or an apartment in the middle of Addis Ababa. Betoch brings travelers and local hosts together with a simpler way to discover, book, and stay.</p>
                            <p className="mt-4 max-w-xl text-sm leading-7 text-white/75">For travelers, that means finding a stay that fits. For hosts, it means a clearer way to welcome guests and manage bookings.</p>
                        </div>
                        <div className="grid gap-3">
                            {[
                                ['Trust first', 'Explore reviewed properties and see the details before you book.'],
                                ['Local by design', 'Discover places, hosts, and payment options connected to Ethiopia.'],
                                ['Fair for both sides', 'Guests find a stay; hosts get tools to manage their listings.'],
                            ].map(([title, copy]) => <article key={title} className="rounded-2xl border border-white/10 bg-white/8 p-5 sm:p-6">
                                <h3 className="font-bold text-white">{title}</h3><p className="mt-2 text-sm leading-6 text-white/70">{copy}</p>
                            </article>)}
                        </div>
                    </div>
                </section>

                <section id="how-it-works" className="scroll-mt-20 mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20">
                    <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-primary">How it works</p>
                    <h2 className="mt-3 max-w-2xl text-balance text-3xl font-bold tracking-tight text-text sm:text-4xl">Simple for the people who travel, and the people who host.</h2>
                    <div className="mt-8 grid gap-5 lg:grid-cols-2">
                        <JourneyCard kind="For travelers" title="Find it. Book it. Arrive." steps={['Browse stays by city.', 'Compare property details and prices.', 'Book and follow your stay in one place.']} />
                        <JourneyCard kind="For hosts" title="List it. Get verified. Host." steps={['Add your property and choose your rates.', 'Submit the listing for review.', 'Manage bookings and welcome guests.']} host />
                    </div>
                </section>

                <section className="bg-bg px-5 py-14 sm:px-8 sm:py-20">
                    <div className="mx-auto max-w-7xl">
                        <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-primary">Why Betoch</p>
                        <h2 className="mt-3 max-w-2xl text-balance text-3xl font-bold tracking-tight text-text sm:text-4xl">Built around how Ethiopia actually travels.</h2>
                        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {benefits.map(({ icon: Icon, title, copy }) => <article key={title} className="rounded-2xl border border-border bg-bg-2 p-5 transition hover:-translate-y-0.5 hover:shadow-md">
                                <span className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary"><Icon size={18} /></span>
                                <h3 className="mt-4 font-bold text-text">{title}</h3><p className="mt-2 text-sm leading-6 text-text-2">{copy}</p>
                            </article>)}
                        </div>
                    </div>
                </section>

                <section id="destinations" className="scroll-mt-20 mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20">
                    <div className="flex flex-wrap items-end justify-between gap-4">
                        <div><p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-primary">Destinations</p><h2 className="mt-3 text-3xl font-bold tracking-tight text-text sm:text-4xl">From the capital to the rock-hewn churches.</h2></div>
                        <Link to="/explore" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">Browse stays <ArrowRight size={15} /></Link>
                    </div>
                    <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                        {destinations.map(({ name, note, color, image }) => <Link to={`/explore?city=${encodeURIComponent(name)}`} key={name} className={`group relative flex h-40 items-end overflow-hidden rounded-2xl bg-linear-to-br ${color} p-4 text-white shadow-sm transition hover:-translate-y-1 sm:h-52`}>
                            <img src={image} className="absolute inset-0 wi-full h-full" />
                            <span className="relative"><span className="block font-bold">{name}</span><span className="mt-1 block text-xs text-white/80">{note}</span></span>
                            <ArrowUpRight size={17} className="relative ml-auto self-end opacity-0 transition group-hover:opacity-100" />
                        </Link>)}
                    </div>
                </section>

                <section className="bg-primary/10 px-5 py-14 sm:px-8 sm:py-16">
                    <div className="mx-auto grid max-w-7xl gap-7 md:grid-cols-[0.8fr_1.2fr] md:items-center">
                        <div><p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-primary">A better way to stay</p><h2 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-text">Good trips start with feeling at home.</h2><p className="mt-3 text-sm leading-6 text-text-2">Find a place that feels right, or welcome travelers to a place you love.</p></div>
                        <div className="grid gap-3 sm:grid-cols-3">
                            {[
                                ['For guests', 'Explore places that help you feel at home.'],
                                ['For hosts', 'Share your place with travelers.'],
                                ['For Ethiopia', 'Keep more of the journey local.'],
                            ].map(([title, copy]) => <article key={title} className="rounded-xl border border-border bg-bg p-4"><span className="text-lg font-bold text-secondary">“</span><h3 className="mt-1 font-semibold text-text">{title}</h3><p className="mt-2 text-xs leading-5 text-text-2">{copy}</p></article>)}
                        </div>
                    </div>
                </section>

                <section className="border-y border-border bg-bg px-5 py-8 sm:px-8">
                    <p className="text-center text-[0.6rem] font-bold uppercase tracking-[0.2em] text-text-2">Local payment options</p>
                    <div className="mt-5 flex flex-wrap items-center justify-center gap-6 sm:gap-12">
                        <PaymentName name="telebirr" mark="t" color="bg-blue-500" />
                        <PaymentName name="CBE Birr" mark="CBE" color="bg-purple-600" />
                        <PaymentName name="Awash Bank" mark="A" color="bg-amber-500" />
                    </div>
                </section>

                <section id="faq" className="scroll-mt-20 mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 sm:py-20 md:grid-cols-[0.7fr_1.3fr]">
                    <div><p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-primary">FAQ</p><h2 className="mt-3 text-3xl font-bold tracking-tight text-text sm:text-4xl">Questions, answered.</h2><p className="mt-3 max-w-sm text-sm leading-6 text-text-2">Can’t find what you need? Our support team can help.</p><a href="mailto:hello@zemenrentals.com" className="mt-5 inline-flex rounded-lg border border-border bg-bg px-4 py-2.5 text-sm font-semibold text-primary hover:border-primary">Contact support</a></div>
                    <div className="divide-y divide-border border-y border-border">
                        {faqs.map(({ question, answer }) => <details key={question} className="group py-4">
                            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-text marker:hidden">{question}<ChevronDown size={17} className="shrink-0 text-primary transition group-open:rotate-180" /></summary>
                            <p className="max-w-2xl pt-3 pr-8 text-sm leading-6 text-text-2">{answer}</p>
                        </details>)}
                    </div>
                </section>
            </main>

            <footer className="bg-primary px-5 py-10 text-white sm:px-8">
                <div className="mx-auto flex max-w-7xl flex-col gap-7 sm:flex-row sm:items-end sm:justify-between">
                    <div><Link to="/" className="text-xl font-bold">Betoch</Link><p className="mt-2 max-w-sm text-sm leading-6 text-white/70">Find a stay. Meet a place. Feel at home in Ethiopia.</p></div>
                    <div className="flex flex-wrap gap-x-5 gap-y-3 text-xs font-medium text-white/80"><a href="#how-it-works" className="hover:text-white">How it works</a><a href="#destinations" className="hover:text-white">Destinations</a><Link to="/sign-in" className="hover:text-white">Sign in</Link><Link to="/sign-up" className="hover:text-white">Become a host</Link></div>
                </div>
                <div className="mx-auto mt-8 max-w-7xl border-t border-white/15 pt-4 text-xs text-white/60">© {new Date().getFullYear()} Betoch. Stays across Ethiopia.</div>
            </footer>
        </div>
    )
}

function JourneyCard({ kind, title, steps, host = false }) {
    return (
        <article className="rounded-2xl border border-border bg-bg p-5 shadow-sm sm:p-7">
            <span className={`inline-flex rounded-full px-3 py-1 text-[0.65rem] font-semibold ${host ? 'bg-secondary/20 text-text' : 'bg-primary/10 text-primary'}`}>{kind}</span>
            <h3 className="mt-4 text-xl font-bold tracking-tight text-text">{title}</h3>
            <ol className="mt-5 space-y-4">
                {steps.map((step, index) => <li key={step} className="flex gap-3"><span className="grid size-7 shrink-0 place-items-center rounded-full bg-secondary text-sm font-bold text-on-secondary">{index + 1}</span><p className="pt-1 text-sm leading-6 text-text-2">{step}</p></li>)}
            </ol>
        </article>
    )
}

function PaymentName({ name, mark, color }) {
    return <div className="flex items-center gap-2.5"><span className={`grid size-8 place-items-center rounded-lg ${color} text-[0.6rem] font-bold text-white`}>{mark}</span><span className="text-sm font-semibold text-text">{name}</span></div>
}
