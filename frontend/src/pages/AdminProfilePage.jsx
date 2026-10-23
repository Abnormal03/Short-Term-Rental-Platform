import { Link } from 'react-router-dom'
import { ArrowRight, ClipboardCheck, Scale, UsersRound } from 'lucide-react'
import PageShell from '../components/layout/PageShell'
import ProfileHeader from '../features/profile/components/ProfileHeader'
import ProfileSettings from '../features/profile/components/ProfileSettings'

const adminLinks = [
    { to: '/admin/properties', label: 'Review listings', description: 'Approve or reject host submissions.', icon: ClipboardCheck },
    { to: '/admin/users', label: 'Manage users', description: 'Review accounts and host verification.', icon: UsersRound },
    { to: '/admin/disputes', label: 'Resolve disputes', description: 'Review open booking disputes.', icon: Scale },
]

export default function AdminProfilePage() {
    return (
        <PageShell>
            <section className="mx-auto w-full max-w-5xl px-4 pb-16 sm:px-6" aria-labelledby="admin-profile-title">
                <ProfileHeader title="Administrator profile" actionLabel="Admin dashboard" actionTo="/admin" />
                <div className="mt-6 grid gap-5 md:grid-cols-[280px_1fr]">
                    <ProfileSettings />
                    <div className="grid gap-4">
                        {adminLinks.map(({ to, label, description, icon: Icon }) => <Link key={to} to={to} className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-5 hover:bg-bg-2">
                            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><Icon size={21} /></span>
                            <span className="min-w-0 flex-1"><span className="block font-bold text-text">{label}</span><span className="mt-1 block text-sm text-text-2">{description}</span></span>
                            <ArrowRight size={18} className="text-primary" />
                        </Link>)}
                    </div>
                </div>
            </section>
        </PageShell>
    )
}
