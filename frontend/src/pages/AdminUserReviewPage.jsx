import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, FileText, Mail, ShieldCheck } from 'lucide-react'
import PageShell from '../components/layout/PageShell'
import RetryButton from '../components/UI/RetryButton'
import { Spinner } from '../components/UI/Spinner'
import { adminService } from '../features/admin/adminService'

const dateLabel = (date) => date ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(date)) : '—'
const statusLabel = (status, host = false) => {
    if (status === 'PENDING') return host ? 'not verified' : 'pending approval'
    return String(status || '').replaceAll('_', ' ').toLowerCase()
}

export function AdminHostReviewPage() {
    return <AdminUserReviewPage expectedRole="HOST" />
}

export function AdminGuestReviewPage() {
    return <AdminUserReviewPage expectedRole="GUEST" />
}

function AdminUserReviewPage({ expectedRole }) {
    const { userId } = useParams()
    const queryClient = useQueryClient()
    const [message, setMessage] = useState('')
    const [internalNote, setInternalNote] = useState('')
    const detail = useQuery({ queryKey: ['admin', 'user-detail', userId], queryFn: async () => (await adminService.getUser(userId)).data.user })
    const review = useMutation({
        mutationFn: ({ decision, note = internalNote.trim(), reviewMessage = message.trim() }) => adminService.reviewUser(userId, decision, note, reviewMessage),
        onSuccess: async () => {
            setMessage('')
            setInternalNote('')
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ['admin', 'user-detail', userId] }),
                queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }),
                queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard-users'] }),
            ])
        },
    })
    const user = detail.data

    if (detail.isLoading) return <PageShell><div className="grid min-h-[50vh] place-items-center"><Spinner size="lg" /></div></PageShell>
    if (detail.isError || !user) return <PageShell><section className="mx-auto max-w-3xl px-5 py-10"><p role="alert" className="text-sm text-danger">Could not load this account.</p><div className="mt-4 flex gap-3"><RetryButton onRetry={detail.refetch} isRetrying={detail.isFetching} /><Link to="/admin/users" className="rounded-lg border border-border px-4 py-2 text-sm text-text">Back to users</Link></div></section></PageShell>
    if (user.Role !== expectedRole) return <Navigate to={user.Role === 'HOST' ? `/admin/users/host/${userId}` : `/admin/users/guest/${userId}`} replace />

    const isHost = expectedRole === 'HOST'
    const status = user.account_status === 'SUSPENDED' ? 'SUSPENDED' : isHost ? user.host_review_status : user.account_status
    const statusText = isHost && user.account_status !== 'SUSPENDED' ? statusLabel(user.host_review_status, true) : statusLabel(status)
    const verified = isHost && user.is_verified_host
    const statusTone = status === 'ACTIVE' || status === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800' : status === 'REJECTED' || status === 'SUSPENDED' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
    const needsMessage = (decision) => !['VERIFY', 'APPROVE', 'SUSPEND', 'RESTORE'].includes(decision)
    const act = (decision) => {
        if (needsMessage(decision) && !message.trim()) return
        if (decision === 'SUSPEND' && !window.confirm(`Suspend ${user.name}'s account?`)) return
        review.mutate({ decision })
    }
    const mailto = `mailto:${encodeURIComponent(user.email || '')}?subject=${encodeURIComponent('Betoch account review')}`

    return <PageShell><section className="mx-auto w-full max-w-[1500px] px-5 py-5 sm:px-7 lg:px-8">
        <Link to="/admin/users" className="inline-flex items-center gap-1.5 text-[11px] font-medium text-primary hover:underline"><ArrowLeft size={13} /> Users <span className="text-text-2">/ {user.name}</span></Link>
        <header className="mt-2"><div className="flex flex-wrap items-center gap-2"><h1 className="text-2xl font-bold leading-tight text-text sm:text-3xl">{user.name}</h1><span className="rounded-full bg-primary/10 px-2.5 py-1 text-[9px] font-bold uppercase text-primary">{user.Role}</span><span className={`rounded-full px-2.5 py-1 text-[9px] font-bold uppercase ${statusTone}`}>{statusText}</span></div><p className="mt-1 text-sm text-text-2">{user.email}</p></header>

        <div className={`mt-4 grid items-start gap-4 ${isHost ? 'xl:grid-cols-[minmax(0,1.55fr)_minmax(290px,0.8fr)]' : 'xl:grid-cols-[minmax(0,1.5fr)_minmax(290px,0.8fr)]'}`}>
            <div className="grid gap-3">
                <section className="rounded-2xl border border-border bg-bg p-4 sm:p-5"><h2 className="text-sm font-bold text-text">Account information</h2><div className="mt-2 divide-y divide-border">{[
                    ['Full name', user.name], ['Email', user.email], ['Phone', user.phone_number || 'Not provided'], ['Role', user.Role], ['Payment preference', String(user.payment_preference || 'TELEBIRR').replaceAll('_', ' ').toLowerCase()], ['Joined', dateLabel(user.create_at)], [isHost ? 'Profile updated' : 'Account status', isHost ? dateLabel(user.updated_at) : statusLabel(user.account_status)],
                ].map(([label, value]) => <p key={label} className="flex items-center justify-between gap-4 py-2 text-[11px]"><span className="text-text-2">{label}</span><span className="text-right font-semibold text-text">{value}</span></p>)}</div></section>

                {isHost ? <>
                    <section className="rounded-2xl border border-border bg-bg p-4 sm:p-5"><div className="flex items-center justify-between gap-2"><h2 className="text-sm font-bold text-text">Verification documents</h2><span className="text-[9px] font-semibold uppercase text-text-2">Not available</span></div><div className="mt-3 flex items-start gap-3 rounded-xl bg-bg-2 p-3"><span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"><FileText size={17} /></span><p className="text-xs leading-5 text-text-2">Identity and ownership documents are not stored by the current platform, so there are no files to review here.</p></div></section>
                    <section className="rounded-2xl border border-border bg-bg p-4 sm:p-5"><h2 className="text-sm font-bold text-text">Listings by this host</h2>{user.properties?.length ? <div className="mt-3 divide-y divide-border">{user.properties.map((property) => <div key={property.property_id} className="flex items-center gap-3 py-2.5 first:pt-0"><div className="size-11 shrink-0 overflow-hidden rounded-lg bg-bg-2">{property.propertyImages?.[0]?.image_url && <img src={property.propertyImages[0].image_url} alt="" className="size-full object-cover" />}</div><div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold text-text">{property.title}</p><p className="mt-0.5 text-[10px] text-text-2">{property.city} · ETB {Number(property.price_per_night).toLocaleString()} / night</p></div><span className={`rounded-full px-2 py-1 text-[9px] font-bold uppercase ${property.verification_status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>{property.verification_status}</span><Link to={`/admin/properties/${property.property_id}`} className="rounded-lg border border-border px-2.5 py-1.5 text-[10px] font-semibold text-text">Review</Link></div>)}</div> : <p className="mt-3 text-xs text-text-2">No listings have been submitted by this host.</p>}</section>
                    <section className="rounded-2xl border border-border bg-bg p-4 sm:p-5"><h2 className="text-sm font-bold text-text">Activity</h2><div className="mt-3 space-y-2 text-[11px] text-text-2"><p>Bookings as host: <strong className="text-text">{user.activity?.hostBookings ?? 0}</strong></p><p>Disputes: <strong className="text-text">{user.activity?.hostDisputes ?? 0}</strong></p><p>Profile updated: {dateLabel(user.updated_at)}</p>{user.review_message && <p className="border-t border-border pt-2"><span className="font-semibold text-text">Last message to host:</span> {user.review_message}</p>}{user.admin_review_note && <p className="border-t border-border pt-2">Internal note: {user.admin_review_note}</p>}</div></section>
                </> : <>
                    <section className="rounded-2xl border border-border bg-bg p-4 sm:p-5"><h2 className="text-sm font-bold text-text">Bookings</h2>{user.bookings?.length ? <div className="mt-3 divide-y divide-border">{user.bookings.map((booking) => <div key={booking.booking_id} className="flex items-center justify-between gap-3 py-2.5"><div className="min-w-0"><p className="truncate text-xs font-semibold text-text">{booking.property?.title || 'Booking'}</p><p className="mt-0.5 text-[10px] text-text-2">{booking.property?.city} · {dateLabel(booking.check_in_date)} – {dateLabel(booking.check_out_date)}</p></div><span className="rounded-full bg-bg-2 px-2 py-1 text-[9px] font-semibold text-text-2">{booking.booking_status}</span></div>)}</div> : <p className="py-6 text-center text-xs text-text-2">No bookings yet.</p>}</section>
                    <section className="rounded-2xl border border-border bg-bg p-4 sm:p-5"><h2 className="text-sm font-bold text-text">Reports and disputes</h2><p className="mt-2 text-xs text-text-2">Disputes raised by this account: <strong className="text-text">{user.activity?.guestDisputes ?? 0}</strong></p>{user.disputes?.length > 0 && <div className="mt-2 space-y-2">{user.disputes.slice(0, 5).map((dispute) => <p key={dispute.id} className="text-[10px] text-text-2">{dispute.booking?.booking_id?.slice(0, 8)} · {dispute.status} · {dispute.reason}</p>)}</div>}<p className="mt-2 text-[10px] text-text-2">A separate guest review and report history is not available in the current platform.</p></section>
                    <section className="rounded-2xl border border-border bg-bg p-4 sm:p-5"><h2 className="text-sm font-bold text-text">Activity</h2><p className="mt-2 text-[11px] text-text-2">Account created: {dateLabel(user.create_at)}</p><p className="mt-1 text-[11px] text-text-2">Profile updated: {dateLabel(user.updated_at)}</p>{user.review_message && <p className="mt-2 border-t border-border pt-2 text-[11px] text-text-2"><span className="font-semibold text-text">Last message to guest:</span> {user.review_message}</p>}{user.admin_review_note && <p className="mt-2 border-t border-border pt-2 text-[11px] text-text-2">Internal note: {user.admin_review_note}</p>}</section>
                </>}
            </div>

            <aside className="grid gap-3">
                    <section className="rounded-2xl border border-border bg-bg p-4"><div className="flex items-start justify-between gap-2"><div><h2 className="text-sm font-bold text-text">{isHost ? 'Host decision' : 'Account decision'}</h2><p className="mt-1 text-[10px] leading-4 text-text-2">Message to {isHost ? 'host' : 'guest'} is required to reject or request information.</p></div><span className={`shrink-0 rounded-full px-2 py-1 text-[9px] font-bold uppercase ${statusTone}`}>{statusLabel(status)}</span></div>
                    <label className="mt-3 block text-[10px] font-semibold text-text">Message to {isHost ? 'host' : 'guest'}{status !== 'ACTIVE' && !verified ? ' *' : ''}<textarea value={message} onChange={(event) => setMessage(event.target.value)} rows={3} placeholder="Explain your decision" maxLength={1000} className="mt-1.5 w-full resize-y rounded-lg border border-border bg-bg px-3 py-2 text-xs font-normal text-text outline-none focus:border-primary" /></label>
                    {isHost && <label className="mt-3 block text-[10px] font-semibold text-text">Internal note<textarea value={internalNote} onChange={(event) => setInternalNote(event.target.value)} rows={2} placeholder="Visible to admins only" maxLength={1000} className="mt-1.5 w-full resize-y rounded-lg border border-border bg-bg px-3 py-2 text-xs font-normal text-text outline-none focus:border-primary" /></label>}
                    <div className="mt-3 grid gap-2">{isHost ? <><button type="button" disabled={review.isPending || user.account_status === 'SUSPENDED'} onClick={() => act('VERIFY')} className="min-h-9 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-button-text disabled:opacity-50"><ShieldCheck size={13} className="mr-1 inline" /> Verify host</button><button type="button" disabled={review.isPending || !message.trim() || user.account_status === 'SUSPENDED'} onClick={() => act('REQUEST_INFO')} className="min-h-9 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-text disabled:opacity-50">Request more information</button><button type="button" disabled={review.isPending || !message.trim() || user.account_status === 'SUSPENDED'} onClick={() => act('REJECT')} className="min-h-9 rounded-lg border border-danger/20 px-3 py-2 text-xs font-semibold text-danger disabled:opacity-50">Reject host</button></> : <><button type="button" disabled={review.isPending || user.account_status === 'SUSPENDED'} onClick={() => act('APPROVE')} className="min-h-9 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-button-text disabled:opacity-50"><ShieldCheck size={13} className="mr-1 inline" /> Approve account</button><button type="button" disabled={review.isPending || !message.trim() || user.account_status === 'SUSPENDED'} onClick={() => act('REJECT')} className="min-h-9 rounded-lg border border-danger/20 px-3 py-2 text-xs font-semibold text-danger disabled:opacity-50">Reject account</button></>}</div>
                    {review.isPending && <p className="mt-3 text-xs text-text-2">Saving decision…</p>}{review.isError && <p role="alert" className="mt-3 text-xs text-danger">Could not save the decision.</p>}
                </section>
                <section className="rounded-2xl border border-border bg-bg p-4"><h2 className="text-sm font-bold text-text">Account actions</h2><a href={mailto} className="mt-3 inline-flex min-h-9 w-full items-center justify-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-text hover:bg-bg-2"><Mail size={13} /> Send message</a><button type="button" disabled={review.isPending} onClick={() => act(user.account_status === 'SUSPENDED' ? 'RESTORE' : 'SUSPEND')} className={`mt-2 min-h-9 w-full rounded-lg border px-3 py-2 text-xs font-semibold disabled:opacity-50 ${user.account_status === 'SUSPENDED' ? 'border-primary/20 text-primary' : 'border-danger/20 text-danger'}`}>{user.account_status === 'SUSPENDED' ? 'Restore account' : 'Suspend account'}</button></section>
            </aside>
        </div>
    </section></PageShell>
}
