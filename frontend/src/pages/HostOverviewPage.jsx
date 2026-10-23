import { Link } from 'react-router-dom'
import { ArrowRight, House, Clock3, CircleCheck, CircleX } from 'lucide-react'
import PageShell from '../components/layout/PageShell'
import { Spinner } from '../components/UI/Spinner'
import { useMyProperties } from '../features/properties/hooks/useMyProperties'
import RetryButton from '../components/UI/RetryButton'

export default function HostOverviewPage() {
    const { data: properties = [], isLoading, isError, refetch, isFetching } = useMyProperties()
    const approved = properties.filter((property) => property.verification_status === 'APPROVED').length
    const pending = properties.filter((property) => property.verification_status === 'PENDING').length
    const needsChanges = properties.filter((property) => property.verification_status === 'REJECTED').length

    return (
        <PageShell>
            <section className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8" aria-labelledby="host-overview-title">
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-wide text-primary">Host workspace</p>
                        <h1 id="host-overview-title" className="mt-1 text-3xl font-bold text-text">Overview</h1>
                        <p className="mt-2 text-text-2">Manage your listings and keep their availability up to date.</p>
                    </div>
                    <Link to="/properties" className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 font-semibold text-button-text">
                        Manage properties <ArrowRight size={18} />
                    </Link>
                </div>

                {isLoading ? <div className="flex justify-center py-16"><Spinner size="lg" /></div> : null}
                {isError ? <div className="mt-8 flex items-center gap-3 rounded-xl border border-border bg-surface p-4"><p role="alert" className="text-danger">Could not load your properties.</p><RetryButton onRetry={refetch} isRetrying={isFetching} /></div> : null}

                {!isLoading && !isError && (
                    <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <SummaryCard icon={House} label="Your properties" value={properties.length} />
                        <SummaryCard icon={CircleCheck} label="Approved" value={approved} />
                        <SummaryCard icon={Clock3} label="Awaiting review" value={pending} />
                        <SummaryCard icon={CircleX} label="Needs changes" value={needsChanges} />
                    </div>
                )}

                {!isLoading && !isError && properties.length === 0 && (
                    <div className="mt-8 rounded-2xl border border-border bg-surface p-8 text-center">
                        <h2 className="text-xl font-bold text-text">Start with your first listing</h2>
                        <p className="mx-auto mt-2 max-w-lg text-text-2">Add the property details, nightly price, and the dates you can host guests.</p>
                        <Link to="/properties" className="mt-5 inline-flex rounded-lg bg-primary px-5 py-3 font-semibold text-button-text">Add a property</Link>
                    </div>
                )}
            </section>
        </PageShell>
    )
}

function SummaryCard({ icon: Icon, label, value }) {
    return (
        <article className="rounded-2xl border border-border bg-surface p-5">
            <div className="flex items-center gap-3 text-primary"><Icon size={20} /><span className="text-sm font-semibold text-text-2">{label}</span></div>
            <p className="mt-4 text-3xl font-bold text-text">{value}</p>
        </article>
    )
}
