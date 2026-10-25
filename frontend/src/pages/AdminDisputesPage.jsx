import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { formatDate } from '../lib/utils'
import { Scale, ShieldCheck, X } from 'lucide-react'
import PageShell from '../components/layout/PageShell'
import RetryButton from '../components/UI/RetryButton'
import { Spinner } from '../components/UI/Spinner'
import { adminService } from '../features/admin/adminService'

const tabs = [
    { value: 'OPEN', label: 'Open' },
    { value: 'UNDER_REVIEW', label: 'Under review' },
    { value: 'RESOLVED', label: 'Resolved' },
]

export default function AdminDisputesPage() {
    const [params, setParams] = useSearchParams()
    const [page, setPage] = useState(1)
    const [selectedDispute, setSelectedDispute] = useState(null)
    const client = useQueryClient()
    const status = params.get('status') || 'OPEN'
    const underReview = status === 'UNDER_REVIEW'
    const disputes = useQuery({
        queryKey: ['admin', 'disputes', page, status],
        enabled: !underReview,
        queryFn: async () => (await adminService.getDisputes(page, 20, status)).data.disputes,
    })
    const resolve = useMutation({
        mutationFn: ({ id, resolution, action }) => adminService.resolveDispute(id, resolution, action),
        onSuccess: async () => {
            setSelectedDispute(null)
            await client.invalidateQueries({ queryKey: ['admin', 'disputes'] })
            await client.invalidateQueries({ queryKey: ['admin', 'disputes-count'] })
        },
    })
    const list = disputes.data?.disputes || []
    const totalPages = Math.max(1, Math.ceil((disputes.data?.count || 0) / 20))
    const chooseTab = (value) => {
        const next = new URLSearchParams(params)
        if (value === 'OPEN') next.delete('status')
        else next.set('status', value)
        setParams(next)
        setPage(1)
    }

    return <PageShell><section className="mx-auto w-full max-w-[1500px] px-5 py-6 sm:px-7 lg:px-8">
        <header><h1 className="text-3xl font-bold tracking-tight text-text">Disputes</h1><p className="mt-1 text-sm text-text-2">Review and resolve booking disputes between guests and hosts.</p></header>
        <nav aria-label="Dispute status filters" className="mt-4 flex flex-wrap gap-2">{tabs.map((tab) => <button key={tab.value} type="button" onClick={() => chooseTab(tab.value)} className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${status === tab.value ? 'border-primary bg-primary text-button-text' : 'border-border bg-bg text-text hover:bg-bg-2'}`}>{tab.label}</button>)}</nav>

        {underReview ? <div className="mt-4 rounded-2xl border border-border bg-bg px-6 py-12 text-center"><span className="mx-auto grid size-12 place-items-center rounded-full bg-primary/10 text-primary"><Scale size={21} /></span><h2 className="mt-3 text-base font-bold text-text">No separate in-review state</h2><p className="mx-auto mt-1 max-w-md text-sm text-text-2">Disputes remain open until an administrator resolves them, so there are no records in this category yet.</p></div> : <>
            {disputes.isLoading && <div className="flex justify-center py-12"><Spinner size="lg" /></div>}
            {disputes.isError && <div className="mt-5 flex items-center gap-3 rounded-xl border border-border bg-bg p-4"><p role="alert" className="text-sm text-danger">Could not load disputes.</p><RetryButton onRetry={disputes.refetch} isRetrying={disputes.isFetching} /></div>}
            {resolve.isError && <div className="mt-4 flex items-center gap-3 rounded-xl border border-danger/20 bg-danger/5 p-3"><p role="alert" className="text-sm text-danger">Could not resolve this dispute.</p><RetryButton onRetry={() => resolve.variables && resolve.mutate(resolve.variables)} isRetrying={resolve.isPending} /></div>}
            {!disputes.isLoading && !disputes.isError && <div className="mt-4 overflow-x-auto rounded-xl border border-border bg-bg"><table className="w-full min-w-[830px] text-left"><thead className="bg-bg-2 text-[10px] font-semibold uppercase tracking-wide text-text-2"><tr><th className="px-3 py-3">Dispute</th><th className="px-3 py-3">Booking</th><th className="px-3 py-3">Guest</th><th className="px-3 py-3">Host</th><th className="px-3 py-3">Reason</th><th className="px-3 py-3">Opened</th><th className="px-3 py-3 text-right">Details</th></tr></thead><tbody>{list.map((item) => <tr key={item.id} className="border-t border-border text-xs"><td className="px-3 py-3 font-semibold text-text">{item.id.slice(0, 8)}</td><td className="px-3 py-3 text-text-2">{item.booking_id.slice(0, 8)}</td><td className="px-3 py-3 text-text">{item.booking?.user?.name || item.booking?.user?.email || 'Unknown guest'}</td><td className="px-3 py-3 text-text">{item.booking?.property?.host?.name || item.booking?.property?.host?.email || 'Unknown host'}</td><td className="max-w-[180px] truncate px-3 py-3 text-text-2">{item.reason}</td><td className="whitespace-nowrap px-3 py-3 text-text-2">{formatDate(item.created_at)}</td><td className="px-3 py-3 text-right"><button type="button" onClick={() => setSelectedDispute(item)} className="rounded-lg border border-border px-3 py-2 text-[11px] font-semibold text-text hover:bg-bg-2">Open</button></td></tr>)}</tbody></table>
                {list.length === 0 && <div className="px-5 py-9 text-center"><span className="mx-auto grid size-11 place-items-center rounded-full bg-primary/10 text-primary"><ShieldCheck size={19} /></span><h2 className="mt-2 text-sm font-bold text-text">{status === 'RESOLVED' ? 'No resolved disputes yet' : 'No open disputes'}</h2><p className="mt-1 text-xs text-text-2">{status === 'RESOLVED' ? 'Resolved disputes will appear here.' : 'When a guest or host reports a booking issue, it will appear here.'}</p></div>}
            </div>}
            {!disputes.isLoading && !disputes.isError && totalPages > 1 && <nav aria-label="Dispute pages" className="mt-5 flex items-center justify-center gap-3 text-xs"><button type="button" disabled={page <= 1} onClick={() => setPage((value) => value - 1)} className="rounded-lg border border-border px-3 py-2 text-text disabled:opacity-50">Previous</button><span className="text-text-2">Page {page} of {totalPages}</span><button type="button" disabled={page >= totalPages} onClick={() => setPage((value) => value + 1)} className="rounded-lg border border-border px-3 py-2 text-text disabled:opacity-50">Next</button></nav>}
        </>}
    </section>

        {selectedDispute && <div className="fixed inset-0 z-40 grid place-items-center bg-black/50 p-4" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setSelectedDispute(null)}><section role="dialog" aria-modal="true" aria-labelledby="dispute-detail-title" className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-bg p-5 shadow-2xl"><header className="flex items-start justify-between gap-4"><div><h2 id="dispute-detail-title" className="text-xl font-bold text-text">Booking dispute</h2><p className="mt-1 text-sm text-text-2">Dispute {selectedDispute.id}</p></div><button type="button" aria-label="Close dispute details" onClick={() => setSelectedDispute(null)} className="rounded-full border border-border p-2 text-text"><X size={16} /></button></header><div className="mt-4 divide-y divide-border rounded-xl border border-border px-4"><p className="py-3 text-sm text-text"><span className="inline-block w-32 text-text-2">Property</span>{selectedDispute.booking?.property?.title || 'Property'}</p><p className="py-3 text-sm text-text"><span className="inline-block w-32 text-text-2">Guest</span>{selectedDispute.booking?.user?.name || selectedDispute.booking?.user?.email || 'Unknown'}</p><p className="py-3 text-sm text-text"><span className="inline-block w-32 text-text-2">Host</span>{selectedDispute.booking?.property?.host?.name || selectedDispute.booking?.property?.host?.email || 'Unknown'}</p><p className="py-3 text-sm text-text"><span className="inline-block w-32 text-text-2">Stay</span>{formatDate(selectedDispute.booking?.check_in_date)} – {formatDate(selectedDispute.booking?.check_out_date)}</p><p className="py-3 text-sm text-text"><span className="inline-block w-32 text-text-2">Payment</span>{selectedDispute.booking?.payment?.payment_status || 'Unavailable'} · ETB {Number(selectedDispute.booking?.total_price || 0).toLocaleString()}</p><div className="py-3"><p className="text-xs font-semibold text-text-2">Reason</p><p className="mt-1 whitespace-pre-wrap text-sm text-text">{selectedDispute.reason}</p></div>{selectedDispute.resolution && <p className="py-3 text-sm text-text"><span className="inline-block w-32 text-text-2">Resolution</span>{selectedDispute.resolution}</p>}</div>{status === 'OPEN' && <div className="mt-4 flex flex-wrap justify-end gap-2"><button type="button" onClick={() => setSelectedDispute(null)} className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-text">Close</button><button type="button" disabled={resolve.isPending} onClick={() => resolve.mutate({ id: selectedDispute.id, resolution: 'REJECT', action: 'CONFIRM' })} className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-text disabled:opacity-50">Dismiss dispute</button><button type="button" disabled={resolve.isPending} onClick={() => { if (window.confirm('Issue a refund for this booking and resolve the dispute?')) resolve.mutate({ id: selectedDispute.id, resolution: 'APPROVE', action: 'REFUND' }) }} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-button-text disabled:opacity-50">Approve and refund</button></div>}</section></div>}
    </PageShell>
}
