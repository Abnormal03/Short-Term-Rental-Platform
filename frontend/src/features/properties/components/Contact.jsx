import { useUser } from '@clerk/clerk-react'
import { Mail, MessageCircle, Phone, ShieldAlert, Verified, X } from 'lucide-react'
import { Modal } from '../../../components/UI/Modal'

const Contact = ({ showUserInfo, setShowUserInfo, property }) => {
    const { isSignedIn } = useUser()
    const host = property?.host
    const hostName = host?.name || 'Your host'
    const close = () => setShowUserInfo(false)

    const emailHref = host?.email ? `mailto:${host.email}` : undefined
    const phoneHref = host?.phone_number ? `tel:${host.phone_number}` : undefined

    return (
        <Modal
            isOpen={showUserInfo}
            onClose={close}
            className="max-w-[22rem] overflow-hidden rounded-2xl border border-border bg-bg-2 p-0 shadow-2xl"
        >
            <div className="relative -mx-6 -my-5 flex flex-col items-center px-5 pb-5 pt-6 text-center text-text">
                <button
                    type="button"
                    onClick={close}
                    aria-label="Close contact host dialog"
                    className="absolute right-3 top-3 grid size-8 place-items-center rounded-full border border-border text-text-2 transition hover:bg-neutral hover:text-text"
                >
                    <X size={16} />
                </button>

                <div aria-hidden="true" className="mb-3 grid size-14 place-items-center rounded-full bg-amber-500 text-2xl font-bold text-amber-950">
                    H
                </div>
                <h2 className="text-lg font-bold">Host {hostName}</h2>
                {host?.is_verified_host && <p className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-text-2"><Verified size={14} className="text-primary" /> Verified host</p>}

                {isSignedIn && host?.email && <a href={emailHref} className="mt-2 text-xs text-text-2 hover:text-primary">{host.email}</a>}
                <p className="mt-1 text-xs text-text-2">Contact your host about the property or your stay.</p>

                {isSignedIn ? (
                    <>
                        {emailHref
                            ? <a href={emailHref} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-button-text transition hover:brightness-95"><MessageCircle size={16} /> Message host</a>
                            : <button type="button" disabled className="mt-4 inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-primary/40 px-4 py-3 text-sm font-semibold text-button-text/70"><MessageCircle size={16} /> Message host</button>}
                        <div className="mt-2 grid w-full grid-cols-2 gap-2">
                            <ContactAction href={phoneHref} icon={<Phone size={14} />} label="Call" />
                            <ContactAction href={emailHref} icon={<Mail size={14} />} label="Email" />
                        </div>
                    </>
                ) : (
                    <a href="/sign-in" className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-button-text transition hover:brightness-95">
                        <MessageCircle size={16} /> Sign in to contact host
                    </a>
                )}

                <div className="mt-4 flex w-full items-start gap-2.5 rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-3 text-left text-xs leading-relaxed text-text-2">
                    <ShieldAlert size={15} className="mt-0.5 shrink-0 text-amber-500" />
                    <p><span className="font-semibold text-text">Stay safe.</span> Keep payments and messages on Betoch. Never pay a host directly or make deals outside the platform.</p>
                </div>
            </div>
        </Modal>
    )
}

function ContactAction({ href, icon, label }) {
    if (!href) {
        return <span className="inline-flex cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-border px-3 py-2.5 text-xs font-medium text-text-2/60" aria-label={`${label} unavailable`}>
            {icon}{label}
        </span>
    }

    return <a href={href} className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-3 py-2.5 text-xs font-medium text-text transition hover:border-primary hover:bg-primary/5">
        {icon}{label}
    </a>
}

export default Contact
