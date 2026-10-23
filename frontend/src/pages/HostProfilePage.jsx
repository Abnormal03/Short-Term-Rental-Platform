import { Link } from 'react-router-dom'
import { ArrowRight, House, ListChecks, CircleX } from 'lucide-react'
import PageShell from '../components/layout/PageShell'
import ProfileHeader from '../features/profile/components/ProfileHeader'
import ProfileSettings from '../features/profile/components/ProfileSettings'
import { useMyProperties } from '../features/properties/hooks/useMyProperties'
import RetryButton from '../components/UI/RetryButton'

export default function HostProfilePage() {
    const { data: properties = [], isLoading, isError, refetch, isFetching } = useMyProperties()
    const pending = properties.filter((property) => property.verification_status === 'PENDING').length
    const approved = properties.filter((property) => property.verification_status === 'APPROVED').length

    return (
        <PageShell>
            <section className="mx-auto w-full max-w-5xl px-4 pb-16 sm:px-6" aria-labelledby="host-profile-title">
                <ProfileHeader title="Host profile" actionLabel="Manage properties" actionTo="/properties" />
                <div className="mt-6 grid gap-5 md:grid-cols-[280px_1fr]">
                    <ProfileSettings />
                    <div className="grid content-start gap-5">
                        <article className="rounded-2xl border border-border bg-surface p-5">
                            <h2 className="font-bold text-text">Hosting summary</h2>
                            {isLoading ? <p className="mt-3 text-text-2">Loading your listings...</p> : isError ? <div className="mt-3 grid justify-items-start gap-3"><p role="alert" className="text-danger">Could not load your listing summary.</p><RetryButton onRetry={refetch} isRetrying={isFetching} /></div> : <div className="mt-4 grid grid-cols-2 gap-3">
                                <Summary icon={House} label="Total listings" value={properties.length} />
                                <Summary icon={ListChecks} label="Approved" value={approved} />
                                <Summary icon={ListChecks} label="Awaiting review" value={pending} />
                                <Summary icon={CircleX} label="Needs changes" value={properties.filter((property) => property.verification_status === 'REJECTED').length} />
                            </div>}
                            {!isLoading && !isError && properties.length === 0 && <div className="mt-4 rounded-xl border border-dashed border-border bg-bg-2 p-4"><p className="text-sm text-text-2">You have not listed a property yet.</p><Link to="/properties" className="mt-2 inline-flex font-semibold text-primary">Create your first listing <ArrowRight size={16} className="ml-1" /></Link></div>}
                            <Link to="/properties" className="mt-5 inline-flex items-center gap-2 font-semibold text-primary">Manage your listings <ArrowRight size={17} /></Link>
                        </article>
                    </div>
                </div>
            </section>
        </PageShell>
    )
}

function Summary({ icon: Icon, label, value }) {
    return <div className="rounded-xl bg-bg-2 p-4"><div className="flex items-center gap-2 text-text-2"><Icon size={17} /><span className="text-sm">{label}</span></div><p className="mt-2 text-2xl font-bold text-text">{value}</p></div>
}
