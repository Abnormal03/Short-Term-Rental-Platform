import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowRight, BadgeCheck, ClipboardCheck, Clock3, Scale, ShieldAlert, UsersRound, UserRound } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import PageShell from '../components/layout/PageShell'
import RetryButton from '../components/UI/RetryButton'
import { Spinner } from '../components/UI/Spinner'
import { propertyService } from '../features/properties/services/propertyService'
import { adminService } from '../features/admin/adminService'

const formatRelativeDate = (date) => {
    if (!date) return 'Recently'
    const parsed = new Date(date)
    if (Number.isNaN(parsed.getTime())) return 'Recently'
    return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(parsed)
}

function StatCard({ title, count, subtitle, icon: Icon, to, iconTone = 'text-primary' }) {
    return <Link to={to} className="group rounded-2xl border border-border bg-bg p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5">
        <div className="flex items-center justify-between"><span className={`grid size-10 place-items-center rounded-xl bg-primary/10 ${iconTone}`}><Icon size={19} /></span><ArrowRight size={17} className="text-text-2 transition group-hover:translate-x-1" /></div>
        <p className="mt-4 text-sm font-medium text-text-2">{title}</p><p className="mt-0.5 text-3xl font-bold leading-tight text-text">{count}</p><p className="mt-1 text-xs font-medium text-text-2">{subtitle}</p>
    </Link>
}

function CountBar({ label, count, total, tone = 'bg-primary', to }) {
    const percentage = total ? Math.min(100, (count / total) * 100) : 0
    return <Link to={to} className="block rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"><div className="mb-1 flex justify-between text-xs text-text"><span>{label}</span><span className="font-semibold">{count}</span></div><div className="h-1.5 overflow-hidden rounded-full bg-bg-2"><div className={`h-full rounded-full ${tone}`} style={{ width: `${percentage}%` }} /></div></Link>
}

export default function AdminDashboardPage() {
    const [searchParams] = useSearchParams()
    const search = (searchParams.get('search') || '').trim().toLocaleLowerCase()
    const properties = useQuery({ queryKey: ['admin', 'pending-properties-count'], queryFn: async () => (await propertyService.getPendingProperties(1, 5)).data })
    const users = useQuery({ queryKey: ['admin', 'dashboard-users'], queryFn: async () => (await adminService.getUsers(1, 100)).data })
    const disputes = useQuery({ queryKey: ['admin', 'disputes-count'], queryFn: async () => (await adminService.getDisputes(1, 100)).data })
    const pendingProperties = properties.data?.properties || []
    const usersList = users.data?.users || []
    const roleCounts = users.data?.roleCounts || {}
    const unverifiedHosts = usersList.filter((user) => user.Role === 'HOST' && ['PENDING', 'NEEDS_CHANGES'].includes(user.host_review_status))
    const pendingGuests = usersList.filter((user) => user.Role === 'GUEST' && user.account_status === 'PENDING')
    const platformUserCount = (roleCounts.GUEST || 0) + (roleCounts.HOST || 0) + (roleCounts.ADMIN || 0)
    const filteredProperties = useMemo(() => pendingProperties.filter((property) => `${property.title} ${property.city} ${property.host?.name} ${property.host?.email}`.toLocaleLowerCase().includes(search)), [pendingProperties, search])
    const filteredHosts = useMemo(() => unverifiedHosts.filter((user) => `${user.name} ${user.email}`.toLocaleLowerCase().includes(search)), [unverifiedHosts, search])
    const filteredGuests = useMemo(() => pendingGuests.filter((user) => `${user.name} ${user.email}`.toLocaleLowerCase().includes(search)), [pendingGuests, search])
    const filteredUsers = useMemo(() => usersList.filter((user) => `${user.name} ${user.email} ${user.Role}`.toLocaleLowerCase().includes(search)).slice(0, 5), [usersList, search])
    const disputeCount = disputes.data?.disputes?.count ?? disputes.data?.count
    const isLoading = properties.isLoading || users.isLoading || disputes.isLoading
    const hasError = properties.isError || users.isError || disputes.isError

    return <PageShell><section className="mx-auto w-full max-w-[1600px] px-5 py-6 sm:px-7 lg:px-8">
        <div className="mb-5"><p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">Admin workspace</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-text">Dashboard</h1><p className="mt-1 text-sm text-text-2">Review listing submissions, host accounts and booking disputes.</p></div>
        {hasError && <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-danger/20 bg-danger/5 px-4 py-3"><p role="alert" className="text-sm text-danger">Some dashboard information could not be loaded.</p><RetryButton onRetry={() => { properties.refetch(); users.refetch(); disputes.refetch() }} isRetrying={properties.isFetching || users.isFetching || disputes.isFetching} /></div>}
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <StatCard title="Listing approvals" count={properties.isLoading ? <Spinner /> : properties.isError ? '—' : properties.data?.count ?? 0} subtitle={`${properties.data?.count ?? 0} awaiting review`} icon={ClipboardCheck} to="/admin/properties" />
            <StatCard title="User management" count={users.isLoading ? <Spinner /> : users.isError ? '—' : platformUserCount} subtitle={`${(users.data?.unverifiedHosts ?? unverifiedHosts.length) + (users.data?.pendingGuests ?? pendingGuests.length)} accounts need review`} icon={UsersRound} to="/admin/users" />
            <StatCard title="Open disputes" count={disputes.isLoading ? <Spinner /> : disputes.isError ? '—' : disputeCount ?? 0} subtitle={disputeCount ? 'Needs your attention' : 'All clear'} icon={Scale} to="/admin/disputes" iconTone="text-amber-700" />
        </div>

        <div className="mt-4 grid items-start gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(280px,0.9fr)]">
            <section id="needs-attention" className="rounded-2xl border border-border bg-bg p-4 shadow-sm sm:p-5">
                <div className="mb-3 flex items-center justify-between gap-3"><div><h2 className="text-lg font-bold text-text">Needs your attention</h2><p className="mt-0.5 text-xs text-text-2">Pending listings and account reviews</p></div><Link to="/admin/properties" className="text-xs font-semibold text-primary underline underline-offset-2">Review queue</Link></div>
                {isLoading ? <div className="flex justify-center py-10"><Spinner /></div> : <div className="divide-y divide-border">
                    {filteredProperties.map((property) => <div key={property.property_id} className="flex items-center gap-3 py-3 first:pt-1"><span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"><ClipboardCheck size={17} /></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-text">{property.title}</p><p className="truncate text-xs text-text-2">Listing · {property.host?.name || property.city} · ETB {Number(property.price_per_night || 0).toLocaleString()} / night</p></div><span className="hidden rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold uppercase text-amber-800 sm:inline-flex">Pending</span><Link to={`/admin/properties/${property.property_id}`} className="rounded-lg bg-primary/10 px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/15">Review</Link></div>)}
                    {filteredHosts.slice(0, Math.max(0, 5 - filteredProperties.length)).map((host) => <div key={host.user_id} className="flex items-center gap-3 py-3"><span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"><ShieldAlert size={17} /></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-text">{host.name || 'Host account'}</p><p className="truncate text-xs text-text-2">Host verification · {host.email}</p></div><span className="hidden rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold uppercase text-amber-800 sm:inline-flex">Not verified</span><Link to={`/admin/users/host/${host.user_id}`} className="rounded-lg bg-primary/10 px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/15">Review</Link></div>)}
                    {filteredGuests.slice(0, Math.max(0, 5 - filteredProperties.length - filteredHosts.length)).map((guest) => <div key={guest.user_id} className="flex items-center gap-3 py-3"><span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"><UserRound size={17} /></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-text">{guest.name || 'Guest account'}</p><p className="truncate text-xs text-text-2">Account approval · {guest.email}</p></div><span className="hidden rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold uppercase text-amber-800 sm:inline-flex">Pending</span><Link to={`/admin/users/guest/${guest.user_id}`} className="rounded-lg bg-primary/10 px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/15">Review</Link></div>)}
                    {!filteredProperties.length && !filteredHosts.length && !filteredGuests.length && <div className="py-8 text-center text-sm text-text-2">{search ? `No attention items match “${search}”.` : 'There are no pending listings or accounts to review.'}</div>}
                    {(filteredProperties.length + filteredHosts.length + filteredGuests.length > 5) && <Link to="/admin/properties" className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary">View all review items <ArrowRight size={14} /></Link>}
                </div>}
            </section>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                <section className="rounded-2xl border border-border bg-bg p-4 shadow-sm sm:p-5"><div className="mb-4 flex items-center gap-2"><UsersRound size={17} className="text-primary" /><h2 className="text-base font-bold text-text">Users by role</h2></div><div className="space-y-3"><CountBar label="Guests" count={roleCounts.GUEST ?? 0} total={platformUserCount} to="/admin/users?role=GUEST" /><CountBar label="Hosts" count={roleCounts.HOST ?? 0} total={platformUserCount} tone="bg-secondary" to="/admin/users?role=HOST" /><CountBar label="Admins" count={roleCounts.ADMIN ?? 0} total={platformUserCount} tone="bg-amber-500" to="/admin/users?role=ADMIN" /></div></section>
                <section className="rounded-2xl border border-border bg-bg p-4 shadow-sm sm:p-5"><div className="mb-3 flex items-center justify-between"><div className="flex items-center gap-2"><Clock3 size={17} className="text-primary" /><h2 className="text-base font-bold text-text">Recent accounts</h2></div><Link to="/admin/users" aria-label="View all users" className="text-text-2 hover:text-primary"><ArrowRight size={16} /></Link></div>{users.isLoading ? <div className="flex justify-center py-6"><Spinner /></div> : <div className="space-y-3">{filteredUsers.slice(0, 4).map((user) => <div key={user.user_id} className="flex items-center gap-2.5"><span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary/10 text-primary"><UserRound size={15} /></span><div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold text-text">{user.name || user.email}</p><p className="truncate text-[11px] text-text-2">{user.Role.toLowerCase()} · {formatRelativeDate(user.create_at)}</p></div><BadgeCheck size={14} className={user.Role === 'HOST' && user.is_verified_host ? 'text-primary' : 'text-text-2/50'} /></div>)}{filteredUsers.length === 0 && <p className="py-3 text-sm text-text-2">{search ? 'No accounts match your search.' : 'No accounts found.'}</p>}</div>}</section>
            </div>
        </div>
    </section></PageShell>
}
