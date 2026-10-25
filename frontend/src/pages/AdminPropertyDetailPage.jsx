import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertTriangle, ArrowLeft, CalendarDays, Check, House, MapPin, ShieldAlert, X } from 'lucide-react'
import PageShell from '../components/layout/PageShell'
import RetryButton from '../components/UI/RetryButton'
import { Spinner } from '../components/UI/Spinner'
import { propertyService } from '../features/properties/services/propertyService'

const dateLabel = (value) => value ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(value)) : 'Not set'

export default function AdminPropertyDetailPage() {
    const { propertyId } = useParams()
    const navigate = useNavigate()
    const client = useQueryClient()
    const [internalNote, setInternalNote] = useState('')
    const [hostMessage, setHostMessage] = useState('')
    const [checklist, setChecklist] = useState([false, false, false, false])
    const propertyQuery = useQuery({ queryKey: ['admin', 'property', propertyId], queryFn: async () => (await propertyService.getAdminProperty(propertyId)).data.property })
    const review = useMutation({
        mutationFn: ({ approved, message, note }) => propertyService.reviewProperty(propertyId, approved, note, message),
        onSuccess: async () => {
            await Promise.all([
                client.invalidateQueries({ queryKey: ['admin', 'properties'] }),
                client.invalidateQueries({ queryKey: ['properties', 'pending-review'] }),
                client.invalidateQueries({ queryKey: ['admin', 'pending-properties-count'] }),
            ])
            navigate('/admin/properties')
        },
    })
    const property = propertyQuery.data
    const reviewStatus = property?.verification_status || 'PENDING'
    const decisionNeeded = reviewStatus === 'PENDING'
    const toggleCheck = (index) => setChecklist((items) => items.map((checked, current) => current === index ? !checked : checked))
    const decide = (approved) => {
        if (!approved && !hostMessage.trim()) return
        review.mutate({ approved, message: hostMessage.trim(), note: internalNote.trim() })
    }

    if (propertyQuery.isLoading) return <PageShell><div className="grid min-h-[50vh] place-items-center"><Spinner size="lg" /></div></PageShell>
    if (propertyQuery.isError || !property) return <PageShell><section className="mx-auto max-w-3xl px-5 py-10"><p role="alert" className="text-sm text-danger">Could not load this listing for review.</p><div className="mt-4 flex gap-3"><RetryButton onRetry={propertyQuery.refetch} isRetrying={propertyQuery.isFetching} /><Link to="/admin/properties" className="rounded-lg border border-border px-4 py-2 text-sm text-text">Back to listings</Link></div></section></PageShell>

    const photos = property.propertyImages || []
    const checklistItems = ['Photos are clear and match the description', 'Price looks reasonable for the area', 'Location and availability look right', 'Host account is verified']
    return <PageShell><section className="mx-auto w-full max-w-[1500px] px-5 py-5 sm:px-7 lg:px-8">
        <Link to="/admin/properties" className="inline-flex items-center gap-1.5 text-[11px] font-medium text-primary hover:underline"><ArrowLeft size={13} /> Listings <span className="text-text-2">/ {property.title}</span></Link>
        <header className="mt-2"><div className="flex flex-wrap items-center gap-2"><h1 className="text-2xl font-bold leading-tight text-text sm:text-3xl">{property.title}</h1><span className={`rounded-full px-2.5 py-1 text-[9px] font-bold uppercase ${reviewStatus === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : reviewStatus === 'REJECTED' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'}`}>{reviewStatus === 'REJECTED' ? 'Needs changes' : reviewStatus === 'PENDING' ? 'Pending review' : 'Approved'}</span></div><p className="mt-1 text-sm text-text-2">Review everything about this listing before you decide.</p></header>

        <div className="mt-4 grid items-start gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(290px,0.8fr)]">
            <div className="grid gap-3">
                <section aria-label="Listing photos" className="grid h-[300px] grid-cols-3 grid-rows-2 gap-1.5 overflow-hidden rounded-2xl bg-bg p-2 sm:h-[340px]">
                    {photos.length ? photos.slice(0, 5).map((photo, index) => <img key={photo.image_id} src={photo.image_url} alt={`${property.title}, photo ${index + 1}`} className={`h-full w-full rounded-lg object-cover ${index === 0 ? 'row-span-2' : ''}`} />) : <div className="col-span-3 row-span-2 grid place-items-center text-text-2"><House size={35} /><span className="text-xs">No listing photos uploaded</span></div>}
                </section>
                <section className="rounded-2xl border border-border bg-bg p-4 sm:p-5"><h2 className="text-sm font-bold text-text">Listing details</h2><div className="mt-2 flex flex-wrap items-baseline justify-between gap-2"><h3 className="text-lg font-bold text-text">{property.title}</h3><p className="text-base font-bold text-primary">ETB {Number(property.price_per_night).toLocaleString()} <span className="text-xs font-normal text-text-2">/ night</span></p></div><p className="mt-1 flex items-center gap-1 text-xs text-text-2"><MapPin size={13} /> {property.city}, {property.country}</p><p className="mt-3 whitespace-pre-wrap text-xs leading-5 text-text-2">{property.description}</p></section>
                <section className="rounded-2xl border border-border bg-bg p-4 sm:p-5"><h2 className="text-sm font-bold text-text">Stay rules and availability</h2><div className="mt-3 grid grid-cols-2 gap-4 text-xs sm:grid-cols-4"><p><span className="block text-[9px] font-semibold uppercase text-text-2">Minimum nights</span>{property.min_stay_duration}</p><p><span className="block text-[9px] font-semibold uppercase text-text-2">Maximum nights</span>{property.max_stay_duration}</p><p><span className="block text-[9px] font-semibold uppercase text-text-2">Available from</span>{dateLabel(property.availabilities?.available_from)}</p><p><span className="block text-[9px] font-semibold uppercase text-text-2">Available until</span>{dateLabel(property.availabilities?.available_to)}</p></div></section>
                <section className="rounded-2xl border border-border bg-bg p-4 sm:p-5"><h2 className="text-sm font-bold text-text">Amenities</h2><div className="mt-3 flex flex-wrap gap-2">{(property.amenities || []).length ? property.amenities.map((amenity, index) => <span key={`${amenity}-${index}`} className="rounded-full border border-border px-3 py-1.5 text-[10px] text-text-2">{amenity}</span>) : <span className="text-xs text-text-2">No amenities listed</span>}</div></section>
                <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-bg p-4 sm:p-5"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-full bg-secondary/20 text-sm font-bold text-primary">{property.host?.name?.slice(0, 1).toUpperCase() || 'H'}</span><div><h2 className="text-sm font-bold text-text">Host</h2><p className="mt-0.5 text-xs font-semibold text-text">{property.host?.name}</p><p className="text-[10px] text-text-2">{property.host?.email} · {property.host?.phone_number || 'No phone number'}</p></div></div><div className="flex items-center gap-2"><span className={`rounded-full px-2.5 py-1 text-[9px] font-bold ${property.host?.host_review_status === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>{property.host?.host_review_status === 'VERIFIED' ? 'VERIFIED' : 'NOT VERIFIED'}</span>{property.host?.user_id && <Link to={`/admin/users/host/${property.host.user_id}`} className="rounded-lg border border-border px-3 py-2 text-[10px] font-semibold text-text">View host</Link>}</div></section>
            </div>

            <aside className="grid gap-3">
                {property.host?.host_review_status !== 'VERIFIED' && <div className="flex gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-950"><AlertTriangle size={15} className="mt-0.5 shrink-0 text-amber-700" /><p className="text-[10px] leading-4">The host isn’t verified yet. Consider verifying the host before approving this listing.</p></div>}
                <section className="rounded-2xl border border-border bg-bg p-4"><h2 className="text-sm font-bold text-text">Review checklist</h2><div className="mt-3 space-y-3">{checklistItems.map((item, index) => <label key={item} className="flex cursor-pointer items-start gap-2 text-[10px] leading-4 text-text"><input type="checkbox" checked={checklist[index]} onChange={() => toggleCheck(index)} className="mt-0.5 size-3 accent-emerald-700" />{item}</label>)}</div><label className="mt-4 block text-[10px] font-semibold text-text">Internal note<textarea value={internalNote} onChange={(event) => setInternalNote(event.target.value)} rows={2} placeholder="Visible to admins only" className="mt-1.5 w-full resize-y rounded-lg border border-border bg-bg px-3 py-2 text-xs font-normal text-text outline-none focus:border-primary" /></label></section>
                <section className="rounded-2xl border border-border bg-bg p-4"><h2 className="text-sm font-bold text-text">Decision</h2><p className="mt-1 text-[10px] text-text-2">Message to host is required to request changes or reject.</p>{!decisionNeeded && (property.admin_review_note || property.review_message) && <div className="mt-3 grid gap-2 rounded-lg bg-bg-2 p-3 text-xs text-text-2">{property.review_message && <p><span className="font-semibold text-text">Sent message:</span> {property.review_message}</p>}{property.admin_review_note && <p><span className="font-semibold text-text">Internal note:</span> {property.admin_review_note}</p>}</div>}{decisionNeeded && <><label className="mt-3 block text-[10px] font-semibold text-text">Message to host *<textarea value={hostMessage} onChange={(event) => setHostMessage(event.target.value)} rows={3} placeholder="Explain what needs to change" maxLength={1000} className="mt-1.5 w-full resize-y rounded-lg border border-border bg-bg px-3 py-2 text-xs font-normal text-text outline-none focus:border-primary" /></label><div className="mt-3 grid gap-2"><button type="button" disabled={review.isPending} onClick={() => decide(true)} className="inline-flex min-h-9 items-center justify-center gap-1 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-button-text disabled:opacity-50"><Check size={14} /> Approve listing</button><button type="button" disabled={review.isPending || !hostMessage.trim()} onClick={() => decide(false)} className="min-h-9 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-text disabled:opacity-50">Request changes</button><button type="button" disabled={review.isPending || !hostMessage.trim()} onClick={() => decide(false)} className="min-h-9 rounded-lg border border-danger/20 px-3 py-2 text-xs font-semibold text-danger disabled:opacity-50"><X size={13} className="mr-1 inline" /> Reject listing</button></div></>}{review.isPending && <p className="mt-3 text-xs text-text-2">Saving decision…</p>}{review.isError && <p role="alert" className="mt-3 text-xs text-danger">Could not save this decision.</p>}</section>
                <section className="divide-y divide-border rounded-2xl border border-border bg-bg px-4 text-xs"><p className="flex justify-between gap-3 py-3 text-text-2"><span>Listing ID</span><span className="font-semibold text-text">{property.property_id.slice(0, 8)}</span></p><p className="flex justify-between gap-3 py-3 text-text-2"><span>Submitted</span><span className="font-semibold text-text">{dateLabel(property.create_at)}</span></p><p className="flex justify-between gap-3 py-3 text-text-2"><span>Status</span><span className="font-semibold text-text">{reviewStatus}</span></p><p className="flex items-center justify-between gap-3 py-3 text-text-2"><span><CalendarDays size={13} className="inline" /> Updated</span><span className="font-semibold text-text">{dateLabel(property.updated_at)}</span></p></section>
            </aside>
        </div>
    </section></PageShell>
}
