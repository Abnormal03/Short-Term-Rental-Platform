import { Link } from 'react-router-dom'
import { useClerk } from '@clerk/clerk-react'
import { CircleCheck, CircleX, Clock3, House, LogOut } from 'lucide-react'
import PageShell from '../components/layout/PageShell'
import RetryButton from '../components/UI/RetryButton'
import { useProfile } from '../features/profile/hooks/useProfile'
import { useMyProperties } from '../features/properties/hooks/useMyProperties'
import useUserStore from '../store/useUser'

export default function HostProfilePage() {
    const { signOut } = useClerk()
    const { data: profileData, isLoading: profileLoading, isError: profileError, refetch: refetchProfile, isFetching: profileFetching } = useProfile()
    const { data: properties = [], isLoading, isError, refetch, isFetching } = useMyProperties()
    const clerkUser = useUserStore((state) => state.user)
    const profile = profileData?.user
    const name = profile?.name || clerkUser?.fullName || 'Host account'
    const email = clerkUser?.primaryEmailAddress?.emailAddress || profile?.email || ''
    const imageUrl = clerkUser?.imageUrl
    const approved = properties.filter((property) => property.verification_status === 'APPROVED').length
    const pending = properties.filter((property) => property.verification_status === 'PENDING').length
    const rejected = properties.filter((property) => property.verification_status === 'REJECTED').length
    const isVerified = profile?.is_verified_host === true
    const hostReviewStatus = profile?.host_review_status || (isVerified ? 'VERIFIED' : 'PENDING')

    return <PageShell>
        <section className="w-full px-5 pb-12 sm:px-7 lg:px-9 xl:px-10" aria-labelledby="host-profile-title">
            <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border/70 py-5 sm:py-6">
                <div className="flex min-w-0 items-center gap-4">
                    {imageUrl
                        ? <img src={imageUrl} alt="" className="size-16 shrink-0 rounded-full object-cover sm:size-[70px]" />
                        : <div className="grid size-16 shrink-0 place-items-center rounded-full bg-[#f5a900] text-2xl font-bold text-[#17231c] sm:size-[70px] sm:text-3xl" aria-hidden="true">{name.slice(0, 1).toUpperCase()}</div>}
                    <div className="min-w-0">
                        <h1 id="host-profile-title" className="truncate text-2xl font-extrabold tracking-tight text-text sm:text-3xl">{profileLoading ? 'Loading profile…' : name}</h1>
                        {email && <p className="mt-0.5 truncate text-sm text-text-2">{email}</p>}
                        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                            <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase text-primary">Host</span>
                            <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${isVerified ? 'bg-emerald-100 text-emerald-800 dark:bg-[#0b2d20] dark:text-[#4bd49a]' : 'bg-amber-100 text-amber-800 dark:bg-[#392d13] dark:text-[#f4cd72]'}`}>{isVerified ? 'Verified host' : hostReviewStatus === 'NEEDS_CHANGES' ? 'Changes requested' : hostReviewStatus === 'REJECTED' ? 'Verification rejected' : 'Host verification pending'}</span>
                        </div>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Link to="/edit-profile" className="inline-flex min-h-10 items-center justify-center rounded-xl border border-border bg-surface px-4 py-2 text-xs font-bold text-text transition hover:border-primary">Edit profile</Link>
                    <Link to="/properties" className="inline-flex min-h-10 items-center justify-center rounded-xl bg-primary px-4 py-2 text-xs font-bold text-button-text transition hover:brightness-110">Manage properties</Link>
                </div>
            </header>

            {profileError && <div className="mt-3 flex items-center gap-3"><p role="alert" className="text-sm text-danger">Could not load your account details.</p><RetryButton onRetry={refetchProfile} isRetrying={profileFetching} /></div>}

            <div className="mt-4 grid items-start gap-4 md:grid-cols-[minmax(260px,0.9fr)_minmax(0,1.35fr)]">
                <section className="min-h-[270px] rounded-2xl border border-border bg-surface px-5 py-5 sm:px-6" aria-labelledby="account-details-title">
                    <h2 id="account-details-title" className="text-lg font-bold text-text">Account details</h2>
                    {profile ? <dl className="mt-3 divide-y divide-border/80 text-base">
                        <AccountRow label="Phone" value={profile.phone_number || 'Not added'} />
                        <AccountRow label="Role" value={profile.Role || 'Host'} />
                        <AccountRow label="Payment preference" value={formatPaymentPreference(profile.payment_preference)} />
                    </dl> : profileLoading ? <p role="status" className="mt-4 text-sm text-text-2">Loading account details…</p> : null}
                    <button type="button" onClick={() => signOut({ redirectUrl: '/' })} className="mt-3 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-semibold text-text transition hover:border-danger/40 hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                        <LogOut size={16} aria-hidden="true" /> Log out
                    </button>
                </section>

                <section className="min-h-[225px] rounded-2xl border border-border bg-surface px-5 py-5 sm:px-6" aria-labelledby="hosting-summary-title">
                    <h2 id="hosting-summary-title" className="text-lg font-bold text-text">Hosting summary</h2>
                    {isLoading ? <p role="status" className="mt-4 text-sm text-text-2">Loading your listings…</p> : isError ? <div className="mt-3 flex items-center gap-3"><p role="alert" className="text-sm text-danger">Could not load your listing summary.</p><RetryButton onRetry={refetch} isRetrying={isFetching} /></div> : <div className="mt-3 grid grid-cols-2 gap-2.5">
                        <Summary icon={House} label="Total listings" value={properties.length} />
                        <Summary icon={CircleCheck} label="Approved" value={approved} />
                        <Summary icon={Clock3} label="Awaiting review" value={pending} />
                        <Summary icon={CircleX} label="Needs changes" value={rejected} />
                    </div>}
                    <Link to="/properties" className="mt-4 inline-flex items-center text-sm font-semibold text-primary underline underline-offset-2">Manage your listings <span aria-hidden="true" className="ml-1">→</span></Link>
                </section>
            </div>

            <section className="mt-4 flex min-h-[112px] flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-surface px-5 py-5 sm:px-6" aria-labelledby="host-verification-title">
                <div>
                    <h2 id="host-verification-title" className="text-lg font-bold text-text">Host verification</h2>
                    <p className="mt-1 max-w-xl text-base leading-6 text-text-2">{isVerified ? 'Your host account is verified and ready to welcome guests.' : hostReviewStatus === 'NEEDS_CHANGES' ? 'More information is needed before your host account can be verified.' : hostReviewStatus === 'REJECTED' ? 'Your host verification was rejected. Contact support if you need help.' : "Your details are being reviewed. We'll notify you once they're verified."}</p>
                    {!isVerified && profile?.review_message && <p className="mt-2 max-w-xl rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950"><span className="font-semibold">Admin message:</span> {profile.review_message}</p>}
                </div>
                <span className={`rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide ${isVerified ? 'bg-emerald-100 text-emerald-800 dark:bg-[#0b2d20] dark:text-[#4bd49a]' : 'bg-amber-100 text-amber-800 dark:bg-[#392d13] dark:text-[#f4cd72]'}`}>{isVerified ? 'Verified' : hostReviewStatus.replaceAll('_', ' ')}</span>
            </section>
        </section>
    </PageShell>
}

function AccountRow({ label, value }) {
    return <div className="flex min-h-12 items-center justify-between gap-3 py-2"><dt className="text-text-2">{label}</dt><dd className="text-right font-semibold text-text">{value}</dd></div>
}

function Summary({ icon: Icon, label, value }) {
    return <div className="min-h-[88px] rounded-xl border border-border/70 bg-surface px-4 py-4">
        <div className="flex items-center gap-2 text-primary"><Icon size={16} /><span className="text-sm text-text">{label}</span></div>
        <p className="mt-2 text-2xl font-extrabold leading-none text-text">{value}</p>
    </div>
}

function formatPaymentPreference(value) {
    return ({ TELEBIRR: 'telebirr', CBEBIRR: 'CBE Birr', AWASH: 'Awash Bank', MPESA: 'M-PESA' })[value] || value || 'telebirr'
}
