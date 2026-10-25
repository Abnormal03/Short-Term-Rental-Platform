import { useClerk } from '@clerk/clerk-react'
import { Link } from 'react-router-dom'
import { ArrowRight, ClipboardCheck, LockKeyhole, Scale, UsersRound } from 'lucide-react'
import PageShell from '../components/layout/PageShell'
import ProfileSettings from '../features/profile/components/ProfileSettings'
import useUserStore from '../store/useUser'

const adminLinks = [
    { to: '/admin/properties', label: 'Review listings', description: 'Approve or reject host submissions.', icon: ClipboardCheck },
    { to: '/admin/users', label: 'Manage users', description: 'Review accounts and host verification.', icon: UsersRound },
    { to: '/admin/disputes', label: 'Resolve disputes', description: 'Review open booking disputes.', icon: Scale },
]

export default function AdminProfilePage() {
    const clerkUser = useUserStore((state) => state.user)
    const { signOut } = useClerk()
    const name = clerkUser?.fullName || clerkUser?.firstName || 'Admin account'
    const email = clerkUser?.primaryEmailAddress?.emailAddress || clerkUser?.emailAddresses?.[0]?.emailAddress || ''
    const avatar = clerkUser?.imageUrl

    return <PageShell><section className="mx-auto w-full max-w-[1500px] px-5 py-6 sm:px-7 lg:px-8" aria-labelledby="admin-profile-title">
        <header className="flex flex-wrap items-center justify-between gap-5 border-b border-border pb-5">
            <div className="flex min-w-0 items-center gap-4">
                {avatar ? <img src={avatar} alt="" className="size-20 shrink-0 rounded-full object-cover" /> : <span className="grid size-20 shrink-0 place-items-center rounded-full bg-secondary text-2xl font-bold text-on-secondary">{name.slice(0, 1).toUpperCase()}</span>}
                <div className="min-w-0"><h1 id="admin-profile-title" className="truncate text-2xl font-bold text-text sm:text-3xl">{name}</h1><p className="mt-0.5 truncate text-sm text-text-2">{email}</p><span className="mt-2 inline-flex rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-primary">Admin</span></div>
            </div>
            <Link to="/edit-profile" className="rounded-lg border border-border bg-bg px-4 py-2.5 text-xs font-semibold text-text hover:bg-bg-2">Edit profile</Link>
        </header>

        <div className="mt-5 grid items-start gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
            <div className="grid gap-4"><ProfileSettings showLogout={false} /><section className="rounded-2xl border border-border bg-bg p-5"><h2 className="text-base font-bold text-text">Security</h2><Link to="/edit-profile" className="mt-3 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-semibold text-text hover:bg-bg-2"><LockKeyhole size={15} /> Change password</Link><button type="button" onClick={() => signOut({ redirectUrl: '/' })} className="mt-2 min-h-10 w-full rounded-xl border border-border px-4 py-2 text-sm font-semibold text-text hover:bg-bg-2">Log out</button></section></div>
            <div className="grid gap-3">{adminLinks.map(({ to, label, description, icon: Icon }) => <Link key={to} to={to} className="flex min-h-[82px] items-center gap-4 rounded-2xl border border-border bg-bg p-4 transition hover:bg-bg-2 sm:px-5"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><Icon size={20} /></span><span className="min-w-0 flex-1"><span className="block text-sm font-bold text-text">{label}</span><span className="mt-1 block text-xs text-text-2">{description}</span></span><ArrowRight size={17} className="shrink-0 text-text-2" /></Link>)}</div>
        </div>
    </section></PageShell>
}
