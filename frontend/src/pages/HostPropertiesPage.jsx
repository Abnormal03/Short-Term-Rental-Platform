import { useMemo, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Edit3, Plus, House, ImagePlus, X, Eye, MapPin } from 'lucide-react'
import PageShell from '../components/layout/PageShell'
import { Modal } from '../components/UI/Modal'
import { Spinner } from '../components/UI/Spinner'
import { propertyService } from '../features/properties/services/propertyService'
import { useMyProperties } from '../features/properties/hooks/useMyProperties'
import { uploadPropertyImage } from '../features/properties/services/cloudinaryService'
import RetryButton from '../components/UI/RetryButton'
const emptyForm = {
    title: '', description: '', city: '', country: 'Ethiopia', price_per_night: '',
    min_stay_duration: 1, max_stay_duration: 30, amenities: '', property_images: [],
    available_from: '', available_to: '',
}
export default function HostPropertiesPage() {
    const queryClient = useQueryClient()
    const { data: properties = [], isLoading, isError, refetch, isFetching } = useMyProperties()
    const [editingProperty, setEditingProperty] = useState(null)
    const [isEditorOpen, setIsEditorOpen] = useState(false)
    const [statusFilter, setStatusFilter] = useState('ALL')
    const [form, setForm] = useState(emptyForm)
    const [saveError, setSaveError] = useState('')
    const saveProperty = useMutation({
        mutationFn: async (values) => {
            const payload = {
                title: values.title.trim(),
                description: values.description.trim(),
                city: values.city.trim(),
                country: values.country.trim(),
                price_per_night: Number(values.price_per_night),
                min_stay_duration: Number(values.min_stay_duration),
                max_stay_duration: Number(values.max_stay_duration),
                amenities: values.amenities.split(',').map((value) => value.trim()).filter(Boolean),
                property_images: values.property_images,
                availability: { available_from: values.available_from, available_to: values.available_to },
            }
            if (editingProperty) {
                const result = await propertyService.updateProperty(editingProperty.property_id, payload)
                return result.data.updatedProperty
            }
            const result = await propertyService.createProperty(payload)
            const property = result.data.property
            return property
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['properties', 'mine'] })
            setEditingProperty(null)
            setForm(emptyForm)
            setIsEditorOpen(false)
            setSaveError('')
        },
        onError: (error) => {
            setSaveError(error.response?.data?.message || error.message || 'Could not save this property.')
            queryClient.invalidateQueries({ queryKey: ['properties', 'mine'] })
        },
    })
    const submitProperty = (event) => {
        event.preventDefault()
        setSaveError('')
        const minNights = Number(form.min_stay_duration)
        const maxNights = Number(form.max_stay_duration)
        if (!Number.isFinite(Number(form.price_per_night)) || Number(form.price_per_night) <= 0 ||
            !Number.isInteger(minNights) || !Number.isInteger(maxNights) || minNights < 1 || maxNights < minNights) {
            setSaveError('Enter a positive nightly price and a valid minimum and maximum stay.')
            return
        }
        if (!form.available_from || !form.available_to || form.available_to <= form.available_from) {
            setSaveError('The available-until date must be after the available-from date.')
            return
        }
        saveProperty.mutate(form)
    }
    const openCreate = () => {
        setEditingProperty(null)
        setForm(emptyForm)
        setIsEditorOpen(true)
        setSaveError('')
    }
    const openEdit = (property) => {
        setEditingProperty(property)
        setIsEditorOpen(true)
        setForm({
            title: property.title || '',
            description: property.description || '',
            city: property.city || '',
            country: property.country || '',
            price_per_night: property.price_per_night ?? '',
            min_stay_duration: property.min_stay_duration ?? 1,
            max_stay_duration: property.max_stay_duration ?? 30,
            amenities: (property.amenities || []).join(', '),
            property_images: (property.propertyImages || []).map((image) => image.image_url),
            available_from: toDateInput(property.availabilities?.available_from),
            available_to: toDateInput(property.availabilities?.available_to),
        })
        setSaveError('')
    }
    const statusCounts = useMemo(() => ({
        APPROVED: properties.filter((property) => property.verification_status === 'APPROVED').length,
        PENDING: properties.filter((property) => property.verification_status === 'PENDING').length,
        REJECTED: properties.filter((property) => property.verification_status === 'REJECTED').length,
    }), [properties])
    const visibleProperties = statusFilter === 'ALL'
        ? properties
        : properties.filter((property) => property.verification_status === statusFilter)
    return (
        <PageShell>
            <section className="w-full px-5 py-6 sm:px-7 lg:px-9 xl:px-10 sm:py-7" aria-labelledby="host-properties-title">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">Host workspace</p>
                        <h1 id="host-properties-title" className="mt-1 text-3xl font-extrabold leading-tight tracking-tight text-text">Your properties</h1>
                        <p className="mt-1 text-sm text-text-2">Add listings, update their details and set the dates you're available.</p>
                    </div>
                    <button type="button" onClick={openCreate} className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-[#f5a900] px-4 py-2.5 text-sm font-bold text-[#17231c] transition hover:brightness-105">
                        <Plus size={14} /> Add property
                    </button>
                </div>
                {!isLoading && !isError && (
                    <div className="mt-4 flex flex-wrap gap-2">
                        <StatusCount active={statusFilter === 'ALL'} onClick={() => setStatusFilter('ALL')} label="All" count={properties.length} />
                        <StatusCount active={statusFilter === 'APPROVED'} onClick={() => setStatusFilter('APPROVED')} label="Approved" count={statusCounts.APPROVED} />
                        <StatusCount active={statusFilter === 'PENDING'} onClick={() => setStatusFilter('PENDING')} label="Pending review" count={statusCounts.PENDING} />
                        <StatusCount active={statusFilter === 'REJECTED'} onClick={() => setStatusFilter('REJECTED')} label="Needs changes" count={statusCounts.REJECTED} />
                    </div>
                )}
                {isLoading && <div className="flex justify-center py-16"><Spinner size="lg" /></div>}
                {isError && <div className="mt-8 flex items-center gap-3 rounded-xl border border-border bg-surface p-4"><p role="alert" className="text-danger">Could not load your properties.</p><RetryButton onRetry={refetch} isRetrying={isFetching}/></div>}
                {!isLoading && !isError && properties.length === 0 && (
                    <div className="mt-5 rounded-2xl border border-dashed border-border bg-surface p-10 text-center">
                        <House className="mx-auto text-primary" size={34} />
                        <h2 className="mt-3 text-xl font-bold text-text">No properties yet</h2>
                        <p className="mt-2 text-sm text-text-2">Create your first listing to start hosting.</p>
                        <button type="button" onClick={openCreate} className="mt-5 rounded-lg bg-[#f5a900] px-5 py-3 text-sm font-bold text-[#17231c]">Create a listing</button>
                    </div>
                )}
                {!isLoading && !isError && properties.length > 0 && <div className="mt-3 grid items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                    {visibleProperties.map((property) => <PropertyCard key={property.property_id} property={property} onEdit={() => openEdit(property)} />)}
                    <button type="button" onClick={openCreate} className="flex min-h-[360px] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-[#cbd7ce] text-center text-primary transition hover:border-primary hover:bg-primary/5 dark:border-[#31513f] dark:hover:bg-[#11291f]">
                        <span className="grid size-9 place-items-center rounded-full bg-primary/10 text-primary"><Plus size={20} /></span>
                        <span className="text-sm font-bold">Add another property</span>
                    </button>
                </div>
                }
            </section>
            <Modal
                isOpen={isEditorOpen}
                onClose={() => { if (!saveProperty.isPending) { setIsEditorOpen(false); setEditingProperty(null); setForm(emptyForm); } }}
                title={editingProperty ? 'Edit property' : 'Add property'}
                description={editingProperty
                    ? <><span className={`mr-1.5 inline-flex rounded-full px-1.5 py-0.5 text-[9px] font-bold ${editingProperty.verification_status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>{editingProperty.verification_status}</span>Big changes may need re-review.</>
                    : '[New listings are reviewed before they go live.]'}
                size="lg"
                className="max-h-[95vh] overflow-hidden"
                bodyClassName="overflow-y-auto pb-0"
            >
                {form && <PropertyForm
                    form={form}
                    setForm={setForm}
                    isSaving={saveProperty.isPending}
                    error={saveError}
                    onCancel={() => { setIsEditorOpen(false); setEditingProperty(null); setForm(emptyForm); }}
                    onSubmit={submitProperty}
                    onRetrySave={() => saveProperty.mutate(form)}
                />}
            </Modal>
        </PageShell>
    )
}
function PropertyCard({ property, onEdit }) {
    const image = property.propertyImages?.[0]?.image_url
    const availability = property.availabilities
    const statusClass = property.verification_status === 'APPROVED'
        ? 'bg-emerald-100/90 text-emerald-800 dark:bg-[#0b2d20]/90 dark:text-[#4bd49a]'
        : property.verification_status === 'REJECTED'
            ? 'bg-red-100/90 text-red-800 dark:bg-[#38201c]/90 dark:text-[#f6a399]'
            : 'bg-amber-100/90 text-amber-800 dark:bg-[#392d13]/90 dark:text-[#f4cd72]'
    return (
        <article className="flex min-h-[360px] flex-col overflow-hidden rounded-2xl border border-[#e5e9e5] bg-white shadow-sm dark:border-[#183a2c] dark:bg-[#11291f]">
            <div className="relative h-[145px] shrink-0 bg-gradient-to-br from-[#d8e7db] to-[#e8ddbd] dark:from-[#35473d] dark:to-[#5b5137]">
                {image && <img src={image} alt={`Photo of ${property.title}`} className="absolute inset-0 size-full object-cover" />}
                <span className={`absolute left-2.5 top-2 rounded-full px-2.5 py-1 text-[11px] font-bold ${statusClass}`}>{property.verification_status}</span>
                {!image && <span className="absolute bottom-2 left-2 rounded bg-white/70 px-1.5 py-0.5 text-[10px] font-medium text-slate-700">Photo</span>}
            </div>
            <div className="flex flex-1 flex-col px-4 pb-3 pt-3">
                <h2 className="line-clamp-2 text-lg font-bold leading-6 text-text">{property.title}</h2>
                <p className="mt-1 flex items-center gap-1 text-sm text-text-2"><MapPin size={14} aria-hidden="true" />{property.city}, {property.country}</p>
                <p className="mt-2 text-base font-bold text-primary">ETB {Number(property.price_per_night).toLocaleString()} <span className="text-sm font-normal text-text-2">/ night</span></p>
                <p className="mt-1 text-sm text-text-2">Available {availability ? `${formatAvailabilityDate(availability.available_from)} – ${formatAvailabilityDate(availability.available_to)}` : 'dates not set'}</p>
                {property.verification_status === 'REJECTED' && property.review_message && <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-950"><span className="font-semibold">Admin feedback:</span> {property.review_message}</p>}
                <div className="mt-auto flex flex-wrap gap-2 pt-3">
                    <button type="button" onClick={onEdit} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-[#e6f1ea] px-3.5 py-2 text-sm font-bold text-[#126144] transition hover:bg-[#d7e9de] dark:bg-[#1c3e2f] dark:text-[#4bd49a] dark:hover:bg-[#24503c]">
                        <Edit3 size={14} /> Edit details and dates
                    </button>
                    {property.verification_status === 'APPROVED'
                        ? <Link to={`/properties/${property.property_id}`} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-[#e1e7e2] px-3.5 py-2 text-sm font-bold text-text transition hover:bg-bg-2 dark:border-[#294838] dark:hover:bg-[#193829]">
                            <Eye size={14} /> Preview
                        </Link>
                        : <button type="button" disabled title="Preview is available after approval" className="inline-flex min-h-9 cursor-not-allowed items-center gap-1.5 rounded-lg border border-border px-3.5 py-2 text-sm font-bold text-text-2 opacity-50">
                            <Eye size={14} /> Preview
                        </button>}
                </div>
            </div>
        </article>
    )
}
function StatusCount({ label, count, active, onClick }) {
    return <button type="button" aria-pressed={active} onClick={onClick} className={`min-h-9 rounded-full border px-3.5 py-1.5 text-sm transition ${active ? 'border-[#0d3d2d] bg-[#0d3d2d] text-white dark:border-[#2f6048] dark:bg-[#194330]' : 'border-[#e1e7e2] bg-white text-text hover:border-primary/50 dark:border-[#294838] dark:bg-[#11291f]'}`}>
        {label} <span className="font-bold">({count})</span>
    </button>
}
function PropertyForm({ form, setForm, isSaving, error, onCancel, onSubmit, onRetrySave }) {
    const [isUploading, setIsUploading] = useState(false)
    const [uploadMessage, setUploadMessage] = useState('')
    const [failedImages, setFailedImages] = useState([])
    const [amenityDraft, setAmenityDraft] = useState('')
    const field = (name, value) => setForm((current) => ({ ...current, [name]: value }))
    const addImages = async (event) => {
        const selected = Array.from(event.dataTransfer?.files || event.target?.files || [])
        if (event.target) event.target.value = ''
        if (!selected.length) return
        const remaining = Math.max(0, 10 - form.property_images.length)
        if (!remaining) {
            setUploadMessage('You can add up to 10 property photos.')
            return
        }
        const accepted = selected.slice(0, remaining)
        const invalid = accepted.find((file) => !['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(file.type) || file.size > 10 * 1024 * 1024)
        if (invalid) {
            setUploadMessage('Choose JPG, PNG, WebP, or AVIF images up to 10 MB each.')
            return
        }
        setUploadMessage('')
        setIsUploading(true)
        const results = await Promise.allSettled(accepted.map(uploadPropertyImage))
        const uploaded = results.filter((result) => result.status === 'fulfilled').map((result) => result.value)
        const failed = accepted.filter((_, index) => results[index].status === 'rejected')
        setFailedImages(failed)
        if (uploaded.length) field('property_images', [...form.property_images, ...uploaded])
        if (uploaded.length !== accepted.length) {
            const reason = results.find((result) => result.status === 'rejected')?.reason?.message
            setUploadMessage(reason || 'Some images could not be uploaded.')
        }
        setIsUploading(false)
    }
    const retryFailedImages = async () => {
        setIsUploading(true)
        const results = await Promise.allSettled(failedImages.map(uploadPropertyImage))
        const uploaded = results.filter((result) => result.status === 'fulfilled').map((result) => result.value)
        const failed = failedImages.filter((_, index) => results[index].status === 'rejected')
        if (uploaded.length) field('property_images', [...form.property_images, ...uploaded])
        setFailedImages(failed)
        setUploadMessage(failed.length ? 'Some images could not be uploaded.' : '')
        setIsUploading(false)
    }
    const removeImage = (index) => field('property_images', form.property_images.filter((_, imageIndex) => imageIndex !== index))
    const amenities = form.amenities.split(',').map((amenity) => amenity.trim()).filter(Boolean)
    const addAmenity = (event) => {
        if (event.key !== 'Enter') return
        event.preventDefault()
        const next = amenityDraft.trim()
        if (!next) return
        field('amenities', [...amenities, next].join(', '))
        setAmenityDraft('')
    }
    const removeAmenity = (index) => field('amenities', amenities.filter((_, amenityIndex) => amenityIndex !== index).join(', '))
    const inputClass = 'min-h-9 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm font-normal text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 placeholder:text-text-2'
    return (
        <form onSubmit={onSubmit} className="grid gap-4 text-text sm:grid-cols-2">
            <FormSection title="Basic info" description="What guests see first." className="sm:col-span-2">
                <label className="grid gap-1 text-xs font-semibold">Property title<input required maxLength={120} value={form.title} onChange={(event) => field('title', event.target.value)} className={inputClass} /></label>
                <label className="grid gap-1 text-xs font-semibold">City<input required value={form.city} onChange={(event) => field('city', event.target.value)} className={inputClass} /></label>
                <label className="grid gap-1 text-xs font-semibold">Country<input required value={form.country} onChange={(event) => field('country', event.target.value)} className={inputClass} /></label>
            </FormSection>

            <FormSection title="Pricing and stay rules" description="Set your nightly price and how long guests can stay." className="sm:col-span-2">
                <label className="grid gap-1 text-xs font-semibold sm:col-span-2">Price per night
                    <span className="flex min-h-9 items-center rounded-lg border border-border bg-surface px-3 text-sm font-normal text-text"><span className="mr-2 text-text-2">ETB</span><input required min="0.01" step="0.01" type="number" value={form.price_per_night} onChange={(event) => field('price_per_night', event.target.value)} className="w-full bg-transparent outline-none" /></span>
                </label>
                <label className="grid gap-1 text-xs font-semibold">Minimum nights<input required min="1" max={form.max_stay_duration || undefined} step="1" type="number" value={form.min_stay_duration} onChange={(event) => field('min_stay_duration', event.target.value)} className={inputClass} /></label>
                <label className="grid gap-1 text-xs font-semibold">Maximum nights<input required min={form.min_stay_duration || 1} step="1" type="number" value={form.max_stay_duration} onChange={(event) => field('max_stay_duration', event.target.value)} className={inputClass} /></label>
            </FormSection>

            <FormSection title="Availability" description="Guests can only book between these dates." className="sm:col-span-2">
                <label className="grid gap-1 text-xs font-semibold">Available from<input required type="date" value={form.available_from} onChange={(event) => field('available_from', event.target.value)} className={inputClass} /></label>
                <label className="grid gap-1 text-xs font-semibold">Available until<input required type="date" min={form.available_from || undefined} value={form.available_to} onChange={(event) => field('available_to', event.target.value)} className={inputClass} /></label>
            </FormSection>

            <FormSection title="Description" description="Tell guests what makes this place special." className="sm:col-span-2">
                <label className="grid gap-1 text-xs font-semibold sm:col-span-2"><span className="sr-only">Property description</span><textarea required rows={3} value={form.description} onChange={(event) => field('description', event.target.value)} placeholder="Describe your property, the neighbourhood and what's nearby" className={`${inputClass} min-h-20 resize-y`} /></label>
            </FormSection>

            <FormSection title="Amenities" description="Type an amenity and press Enter to add it." className="sm:col-span-2">
                {amenities.length > 0 && <div className="flex flex-wrap gap-1.5 sm:col-span-2">{amenities.map((amenity, index) => <span key={`${amenity}-${index}`} className="inline-flex items-center gap-1 rounded-full border border-border bg-bg-2 px-2.5 py-1 text-[11px] font-medium">{amenity}<button type="button" aria-label={`Remove ${amenity}`} onClick={() => removeAmenity(index)} className="grid size-4 place-items-center rounded-full text-text-2 hover:bg-border"><X size={11} /></button></span>)}</div>}
                <label className="grid gap-1 text-xs font-semibold sm:col-span-2"><span className="sr-only">Add amenity</span><input value={amenityDraft} onChange={(event) => setAmenityDraft(event.target.value)} onKeyDown={addAmenity} placeholder="e.g. Wi-Fi, Breakfast, Parking" className={inputClass} /></label>
            </FormSection>

            <FormSection title="Photos" description="Up to 10 images, 10 MB each. Your first photo is the cover." className="sm:col-span-2">
                <div onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); addImages(event) }} className="grid min-h-24 place-items-center rounded-xl border border-dashed border-[#b9c9bd] bg-bg-2/50 px-4 py-3 text-center dark:border-[#31513f] sm:col-span-2">
                    <label className="grid cursor-pointer justify-items-center gap-1.5">
                        <span className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-xs font-semibold text-text shadow-sm"><ImagePlus size={14} />{isUploading ? 'Uploading images…' : 'Choose images'}</span>
                        <span className="text-[10px] text-text-2">or drag them here</span>
                        <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple disabled={isUploading || form.property_images.length >= 10} onChange={addImages} className="sr-only" />
                    </label>
                </div>
                {uploadMessage && <div className="grid justify-items-start gap-2 sm:col-span-2"><p role="alert" className="text-xs text-danger">{uploadMessage}</p>{failedImages.length > 0 && <RetryButton onRetry={retryFailedImages} isRetrying={isUploading} label="Retry image upload" />}</div>}
                {form.property_images.length > 0 && <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 sm:col-span-2">
                    {form.property_images.map((url, index) => <div key={`${url}-${index}`} className="relative overflow-hidden rounded-lg border border-border">
                        <img src={url} alt={`Property photo ${index + 1}`} className="h-20 w-full object-cover" />
                        <button type="button" aria-label={`Remove photo ${index + 1}`} onClick={() => removeImage(index)} className="absolute right-1 top-1 grid size-5 place-items-center rounded-full bg-white text-slate-700 shadow"><X size={12} /></button>
                        <span className="absolute bottom-1 left-1 rounded bg-white/90 px-1.5 py-0.5 text-[9px] text-slate-700">{index === 0 ? 'Cover' : 'Photo'}</span>
                    </div>)}
                </div>}
            </FormSection>

            {error && <div className="grid justify-items-start gap-2 sm:col-span-2"><p role="alert" className="text-sm text-danger">{error}</p><RetryButton onRetry={onRetrySave} isRetrying={isSaving} label="Retry save" /></div>}
            <div className="sticky bottom-0 z-10 -mx-5 mt-1 flex justify-end gap-2 border-t border-border bg-surface/95 px-5 py-2.5 backdrop-blur sm:col-span-2">
                <button type="button" disabled={isSaving} onClick={onCancel} className="min-h-9 rounded-lg border border-border bg-surface px-4 py-2 text-xs font-semibold text-text">Cancel</button>
                <button type="submit" disabled={isSaving || isUploading} className="inline-flex min-h-9 items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-button-text disabled:opacity-60">{isSaving && <Spinner size="sm" />}{isSaving ? 'Saving…' : 'Save property'}</button>
            </div>
        </form>
    )
}

function FormSection({ title, description, className = '', children }) {
    return <section className={`grid gap-2.5 border-b border-border/70 pb-4 last:border-b-0 sm:grid-cols-2 ${className}`}>
        <div className="sm:col-span-2"><h3 className="text-sm font-bold text-text">{title}</h3><p className="mt-0.5 text-[11px] text-text-2">{description}</p></div>
        {children}
    </section>
}
function toDateInput(value) {
    return value ? new Date(value).toISOString().slice(0, 10) : ''
}

function formatAvailabilityDate(value) {
    if (!value) return ''
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(new Date(value))
}
