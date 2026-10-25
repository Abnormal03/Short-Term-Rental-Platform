import { useClerk } from '@clerk/clerk-react'
import { ArrowRight, CalendarDays, CircleHelp, LogOut, MapPin, UserRound } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import PageShell from '../components/layout/PageShell'
import ProfileSettings from '../features/profile/components/ProfileSettings'
import MyTrips from '../features/profile/components/MyTrips'
import useUserStore from '../store/useUser'
import { useProfile } from '../features/profile/hooks/useProfile'
import RetryButton from '../components/UI/RetryButton'

export default function GuestProfilePage() {
    const { signOut } = useClerk()
    const location = useLocation()
    const clerkUser = useUserStore((state) => state.user)
    const { data, isLoading, isError, refetch, isFetching } = useProfile()
    const profile = data?.user
    const name = profile?.name || clerkUser?.fullName || 'Your profile'
    const email = clerkUser?.primaryEmailAddress?.emailAddress || profile?.email || ''
    const imageUrl = clerkUser?.imageUrl

    return (
        <PageShell>
            <div className="w-full pb-12 pt-[60px]">
                {location.state?.profileUpdated && <div role="status" className="mx-auto w-full max-w-6xl px-4 pt-4 sm:px-6 lg:px-8"><p className="rounded-xl border border-success/25 bg-success/10 px-4 py-3 text-sm font-semibold text-success">Your profile has been updated.</p></div>}
                {profile && profile.account_status !== 'ACTIVE' && <div role="status" className="mx-auto w-full max-w-6xl px-4 pt-4 sm:px-6 lg:px-8"><p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">{profile.account_status === 'PENDING' ? 'Your account is awaiting admin approval. Booking features will be available after approval.' : profile.account_status === 'SUSPENDED' ? 'Your account is suspended. Contact support if you need help.' : 'Your account was not approved. Contact support for more information.'}{profile.review_message && <span className="mt-1 block"><strong>Admin message:</strong> {profile.review_message}</span>}</p></div>}
                <header className="bg-[#0d3d27] text-white" aria-labelledby="guest-profile-title">
                    <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-5 px-4 py-6 sm:px-6 lg:px-8">
                        <div className="flex min-w-0 items-center gap-4 sm:gap-5">
                            {imageUrl ? (
                                <img src={imageUrl} alt="" className="size-16 shrink-0 rounded-full border-2 border-white/20 object-cover sm:size-20" />
                            ) : (
                                <div className="grid size-16 shrink-0 place-items-center rounded-full bg-secondary text-2xl font-bold text-on-secondary sm:size-20 sm:text-3xl" aria-hidden="true">
                                    {name.slice(0, 1).toUpperCase()}
                                </div>
                            )}
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h1 id="guest-profile-title" className="break-words text-xl font-bold tracking-tight sm:text-2xl">{isLoading ? 'Loading profile…' : name}</h1>
                                    <span className="rounded-full bg-white/15 px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wide text-white/90">Guest</span>
                                </div>
                                {email && <p className="mt-1 flex items-center gap-1.5 break-all text-xs text-white/75 sm:text-sm"><UserRound size={13} aria-hidden="true" />{email}</p>}
                                {isError && <div className="mt-2 flex flex-wrap items-center gap-2"><span role="alert" className="text-xs text-white">Could not load profile.</span><RetryButton onRetry={refetch} isRetrying={isFetching} /></div>}
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Link to="/edit-profile" className="inline-flex min-h-10 items-center justify-center rounded-xl border border-white/30 bg-white/10 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/15">Edit profile</Link>
                            <Link to="/properties" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-secondary px-4 py-2 text-xs font-bold text-on-secondary transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
                                Browse stays <ArrowRight size={14} aria-hidden="true" />
                            </Link>
                        </div>
                    </div>
                </header>

                <div className="mx-auto grid w-full max-w-6xl items-start gap-5 px-4 py-5 sm:px-6 lg:grid-cols-[250px_minmax(0,1fr)] lg:px-8 lg:py-6">
                    <aside className="grid content-start gap-4">
                        <div id="account-details">
                            <ProfileSettings showLogout={false} showLanguage />
                        </div>
                        <nav aria-label="Guest profile links" className="overflow-hidden rounded-2xl border border-border bg-surface px-4">
                            <Link to="/properties" className="flex min-h-11 items-center justify-between border-b border-border text-xs font-semibold text-text transition hover:text-primary">
                                Browse stays <MapPin size={15} aria-hidden="true" className="text-text-2" />
                            </Link>
                            <Link to="/my-bookings" className="flex min-h-11 items-center justify-between border-b border-border text-xs font-semibold text-text transition hover:text-primary">
                                My bookings <CalendarDays size={15} aria-hidden="true" className="text-text-2" />
                            </Link>
                            <Link to="/contact" className="flex min-h-11 items-center justify-between text-xs font-semibold text-text transition hover:text-primary">
                                Help and support <CircleHelp size={15} aria-hidden="true" className="text-text-2" />
                            </Link>
                        </nav>
                        <button
                            type="button"
                            onClick={() => signOut({ redirectUrl: '/' })}
                            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 py-2 text-xs font-bold text-text transition hover:border-danger/40 hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        >
                            <LogOut size={14} aria-hidden="true" /> Log out
                        </button>
                    </aside>

                    <div className="min-w-0 space-y-4">
                        {profile?.account_status === 'ACTIVE' || !profile ? <MyTrips /> : <section className="rounded-2xl border border-border bg-surface p-6 text-center"><h2 className="text-sm font-bold text-text">Bookings unavailable</h2><p className="mt-1 text-xs text-text-2">You can manage bookings after your account is approved.</p></section>}
                        <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-primary/5 px-5 py-4 sm:px-6" aria-label="Plan another trip">
                            <div>
                                <h2 className="text-sm font-bold text-text">Planning your next trip?</h2>
                                <p className="mt-1 text-xs text-text-2">Browse stays and find a place that feels like home.</p>
                            </div>
                            <Link to="/properties" className="inline-flex min-h-9 items-center rounded-lg border border-border bg-surface px-4 py-2 text-xs font-semibold text-primary transition hover:border-primary">
                                Browse stays
                            </Link>
                        </section>
                    </div>
                </div>
            </div>
        </PageShell>
    )
}
