import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Download, Search, UserRound } from 'lucide-react'
import PageShell from '../components/layout/PageShell'
import RetryButton from '../components/UI/RetryButton'
import { Spinner } from '../components/UI/Spinner'
import { adminService } from '../features/admin/adminService'

const tabs = [
    { value: '', label: 'All' },
    { value: 'GUEST', label: 'Guests' },
    { value: 'HOST', label: 'Hosts' },
    { value: 'ADMIN', label: 'Admins' },
    { value: 'NEEDS_ACTION', label: 'Needs action' },
]
const dateLabel = (date) => date ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(date)) : '—'
const csvCell = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`

export default function AdminUsersPage() {
    const [params, setParams] = useSearchParams()
    const navigate = useNavigate()
    const [page, setPage] = useState(1)
    const [searchDraft, setSearchDraft] = useState(params.get('search') || '')
    const [hostStatus, setHostStatus] = useState(params.get('hostStatus') || '')
    const [accountStatus, setAccountStatus] = useState(params.get('accountStatus') || '')
    const client = useQueryClient()
    const role = params.get('role') || ''
    const search = params.get('search') || ''
    const sort = params.get('sort') || 'newest'
    const needsAction = role === 'NEEDS_ACTION'
    const apiRole = needsAction ? '' : role
    const users = useQuery({
        queryKey: ['admin', 'users', page, apiRole, search, needsAction, hostStatus, accountStatus, sort],
        queryFn: async () => (await adminService.getUsers(page, 20, { role: apiRole, search, needsAction: needsAction ? 'true' : undefined, hostStatus, accountStatus, sort })).data,
    })
    const verify = useMutation({
        mutationFn: ({ id, value }) => adminService.verifyHost(id, value),
        onSuccess: async () => {
            await client.invalidateQueries({ queryKey: ['admin', 'users'] })
            await client.invalidateQueries({ queryKey: ['admin', 'dashboard-users'] })
        },
    })
    const list = users.data?.users || []
    const totalPages = Math.max(1, Math.ceil((users.data?.count || 0) / 20))
    const roleCounts = users.data?.roleCounts || {}
    const totalUsers = (roleCounts.GUEST || 0) + (roleCounts.HOST || 0) + (roleCounts.ADMIN || 0)
    const selectedTab = needsAction ? 'NEEDS_ACTION' : role
    const filterParams = (key, value) => {
        const next = new URLSearchParams(params)
        if (value) next.set(key, value)
        else next.delete(key)
        if (key === 'role') {
            next.delete('hostStatus')
            next.delete('accountStatus')
            setHostStatus('')
            setAccountStatus('')
        }
        if (key === 'hostStatus' && value) next.set('role', 'HOST')
        if (key === 'status') {
            next.delete('status')
            next.delete('hostStatus')
            next.delete('accountStatus')
            setHostStatus('')
            setAccountStatus('')
            if (value.startsWith('HOST_')) {
                const hostFilter = value.slice(5)
                next.set('hostStatus', hostFilter)
                next.set('role', 'HOST')
                setHostStatus(hostFilter)
            } else if (value) {
                next.set('accountStatus', value)
                setAccountStatus(value)
            }
        }
        setParams(next)
        setPage(1)
    }
    const shownCount = users.data?.count ?? 0
    const exportCsv = () => {
        const rows = [['Name', 'Email', 'Role', 'Account status', 'Host verification', 'Joined']]
        list.forEach((user) => rows.push([user.name, user.email, user.Role, 'Active', user.Role === 'HOST' ? (user.is_verified_host ? 'Verified' : 'Not verified') : '', dateLabel(user.create_at)]))
        const blob = new Blob([rows.map((row) => row.map(csvCell).join(',')).join('\n')], { type: 'text/csv;charset=utf-8' })
        const url = URL.createObjectURL(blob)
        const anchor = document.createElement('a')
        anchor.href = url
        anchor.download = 'betoch-admin-users.csv'
        anchor.click()
        URL.revokeObjectURL(url)
    }

    return <PageShell><section className="mx-auto w-full max-w-[1500px] px-5 py-6 sm:px-7 lg:px-8">
        <header className="flex flex-wrap items-start justify-between gap-4"><div><h1 className="text-3xl font-bold tracking-tight text-text">User management</h1><p className="mt-1 text-sm text-text-2">Review accounts and host verification.</p></div><button type="button" onClick={exportCsv} disabled={!list.length} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-border bg-bg px-4 text-xs font-semibold text-text hover:bg-bg-2 disabled:opacity-50"><Download size={14} /> Export</button></header>

        <nav aria-label="Filter users by role" className="mt-4 flex flex-wrap gap-2">{tabs.map((tab) => {
            const count = tab.value === 'GUEST' ? roleCounts.GUEST ?? 0 : tab.value === 'HOST' ? roleCounts.HOST ?? 0 : tab.value === 'ADMIN' ? roleCounts.ADMIN ?? 0 : tab.value === 'NEEDS_ACTION' ? (users.data?.unverifiedHosts ?? 0) + (users.data?.pendingGuests ?? 0) : totalUsers
            return <button key={tab.value || 'ALL'} type="button" onClick={() => filterParams('role', tab.value)} className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${selectedTab === tab.value ? 'border-primary bg-primary text-button-text' : 'border-border bg-bg text-text hover:bg-bg-2'}`}>{tab.label} ({count})</button>
        })}</nav>

        <form onSubmit={(event) => { event.preventDefault(); filterParams('search', searchDraft.trim()) }} className="mt-4 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto_auto]">
            <label className="flex min-h-10 min-w-0 items-center gap-2 rounded-lg border border-border bg-bg px-3 text-text-2"><Search size={15} /><input value={searchDraft} onChange={(event) => setSearchDraft(event.target.value)} placeholder="Search by name or email" aria-label="Search users" className="min-w-0 flex-1 bg-transparent text-xs text-text outline-none placeholder:text-text-2/70" /></label>
            <select value={hostStatus ? `HOST_${hostStatus}` : accountStatus} onChange={(event) => filterParams('status', event.target.value)} aria-label="Filter by account status" className="min-h-10 rounded-lg border border-border bg-bg px-3 text-xs text-text"><option value="">Status: All</option><option value="PENDING">Pending approval</option><option value="ACTIVE">Active</option><option value="REJECTED">Rejected</option><option value="SUSPENDED">Suspended</option><option value="HOST_VERIFIED">Host verified</option><option value="HOST_NOT_VERIFIED">Host not verified</option></select>
            <select value={sort} onChange={(event) => filterParams('sort', event.target.value === 'newest' ? '' : event.target.value)} aria-label="Sort users" className="min-h-10 rounded-lg border border-border bg-bg px-3 text-xs text-text"><option value="newest">Sort: Newest</option><option value="oldest">Sort: Oldest</option></select>
        </form>

        {users.isLoading && <div className="flex justify-center py-12"><Spinner size="lg" /></div>}
        {users.isError && <div className="mt-6 flex items-center gap-3 rounded-xl border border-border bg-bg p-4"><p role="alert" className="text-sm text-danger">Could not load users.</p><RetryButton onRetry={users.refetch} isRetrying={users.isFetching} /></div>}
        {verify.isError && <div className="mt-4 flex items-center gap-3 rounded-xl border border-danger/20 bg-danger/5 p-3"><p role="alert" className="text-sm text-danger">Could not update host verification.</p><RetryButton onRetry={() => verify.variables && verify.mutate(verify.variables)} isRetrying={verify.isPending} /></div>}

        {!users.isLoading && !users.isError && <>
            <div className="mt-4 overflow-x-auto rounded-xl border border-border bg-bg"><table className="w-full min-w-[850px] text-left"><thead className="bg-bg-2 text-[10px] font-semibold uppercase tracking-wide text-text-2"><tr><th className="px-3 py-3">User</th><th className="px-3 py-3">Role</th><th className="px-3 py-3">Account</th><th className="px-3 py-3">Host status</th><th className="px-3 py-3">Joined</th><th className="px-3 py-3 text-right">Actions</th></tr></thead><tbody>{list.map((user) => <tr key={user.user_id} className="border-t border-border text-xs"><td className="px-3 py-2.5"><div className="flex items-center gap-2.5"><span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary/10 text-primary"><UserRound size={15} /></span><span className="min-w-0"><span className="block max-w-[220px] truncate font-semibold text-text">{user.name || 'Unnamed user'}</span><span className="block max-w-[220px] truncate text-[11px] text-text-2">{user.email}</span></span></div></td><td className="px-3 py-2.5"><span className="rounded-full bg-primary/10 px-2.5 py-1 text-[9px] font-bold text-primary">{user.Role}</span></td><td className="px-3 py-2.5"><span className={`rounded-full px-2.5 py-1 text-[9px] font-bold ${user.account_status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : user.account_status === 'SUSPENDED' || user.account_status === 'REJECTED' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'}`}>{user.account_status === 'PENDING' ? 'PENDING APPROVAL' : user.account_status}</span></td><td className="px-3 py-2.5">{user.Role === 'HOST' ? <span className={`rounded-full px-2.5 py-1 text-[9px] font-bold ${user.host_review_status === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800' : user.host_review_status === 'REJECTED' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'}`}>{user.host_review_status === 'VERIFIED' ? 'VERIFIED' : user.host_review_status === 'NEEDS_CHANGES' ? 'NEEDS CHANGES' : user.host_review_status === 'REJECTED' ? 'REJECTED' : 'NOT VERIFIED'}</span> : <span className="text-text-2">—</span>}</td><td className="px-3 py-2.5 text-text-2">{dateLabel(user.create_at)}</td><td className="px-3 py-2.5"><div className="flex justify-end gap-1.5">{user.Role === 'ADMIN' ? <span className="px-2 py-2 text-[10px] text-text-2">Admin account</span> : <><button type="button" onClick={() => navigate(`/admin/users/${user.Role === 'HOST' ? 'host' : 'guest'}/${user.user_id}`)} className="rounded-lg bg-primary/10 px-3 py-2 text-[11px] font-semibold text-primary hover:bg-primary/15">Review</button>{user.Role === 'HOST' && <button type="button" disabled={verify.isPending} onClick={() => verify.mutate({ id: user.user_id, value: !user.is_verified_host })} className="rounded-lg bg-primary px-3 py-2 text-[11px] font-semibold text-button-text disabled:opacity-50">{user.is_verified_host ? 'Revoke' : 'Verify host'}</button>}</>}</div></td></tr>)}</tbody></table>
                {list.length === 0 && <p className="p-8 text-center text-sm text-text-2">No users match these filters.</p>}
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-[11px] text-text-2"><span>Showing {list.length} of {shownCount} users</span>{totalPages > 1 && <nav aria-label="User pages" className="flex items-center gap-3"><button type="button" disabled={page <= 1} onClick={() => setPage((value) => value - 1)} className="rounded-lg border border-border px-3 py-1.5 text-text disabled:opacity-50">Previous</button><span>Page {page} of {totalPages}</span><button type="button" disabled={page >= totalPages} onClick={() => setPage((value) => value + 1)} className="rounded-lg border border-border px-3 py-1.5 text-text disabled:opacity-50">Next</button></nav>}</div>
        </>}
    </section>


    </PageShell>
}
