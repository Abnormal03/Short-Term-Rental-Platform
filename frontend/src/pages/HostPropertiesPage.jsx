import { useMemo, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Edit3, Plus, House, ImagePlus, X } from 'lucide-react'
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
                await propertyService.updateAvailability(editingProperty.property_id, payload.availability)
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
    return (
        <PageShell>
            <section className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8" aria-labelledby="host-properties-title">
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-wide text-primary">Host workspace</p>
                        <h1 id="host-properties-title" className="mt-1 text-3xl font-bold text-text">Your properties</h1>
                        <p className="mt-2 text-text-2">Add listings, update their details, and set the dates you are available.</p>
                    </div>
                    <button type="button" onClick={openCreate} className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 font-semibold text-button-text">
                        <Plus size={18} /> Add property
                    </button>
                </div>
                {!isLoading && !isError && (
                    <div className="mt-7 flex flex-wrap gap-3 text-sm">
                        <StatusCount label="Approved" count={statusCounts.APPROVED} />
                        <StatusCount label="Pending review" count={statusCounts.PENDING} />
                        <StatusCount label="Needs changes" count={statusCounts.REJECTED} />
                    </div>
                )}
                {isLoading && <div className="flex justify-center py-16"><Spinner size="lg" /></div>}
                {isError && <div className="mt-8 flex items-center gap-3 rounded-xl border border-border bg-surface p-4"><p role="alert" className="text-danger">Could not load your properties.</p><RetryButton onRetry={refetch} isRetrying={isFetching}/></div>}
                {!isLoading && !isError && properties.length === 0 && (
                    <div className="mt-8 rounded-2xl border border-dashed border-border bg-surface p-10 text-center">
                        <House className="mx-auto text-primary" size={34} />
                        <h2 className="mt-3 text-xl font-bold text-text">No properties yet</h2>
                        <p className="mt-2 text-text-2">Create your first listing to start hosting.</p>
                        <button type="button" onClick={openCreate} className="mt-5 rounded-lg bg-primary px-5 py-3 font-semibold text-button-text">Create a listing</button>
                    </div>
                )}
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                    {properties.map((property) => <PropertyCard key={property.property_id} property={property} onEdit={() => openEdit(property)} />)}
                </div>
            </section>
            <Modal
                isOpen={isEditorOpen}
                onClose={() => { if (!saveProperty.isPending) { setIsEditorOpen(false); setEditingProperty(null); setForm(emptyForm); } }}
                title={editingProperty ? 'Edit property' : 'Add property'}
                size="xl"
                className="max-h-[90vh] overflow-y-auto"
            >
                {form && <PropertyForm
                    form={form}
                    setForm={setForm}
                    isSaving={saveProperty.isPending}
                    error={saveError}
                    onCancel={() => { setIsEditorOpen(false); setEditingProperty(null); setForm(emptyForm); }}
                    onSubmit={(event) => { event.preventDefault(); saveProperty.mutate(form); }}
                    onRetrySave={() => saveProperty.mutate(form)}
                />}
            </Modal>
        </PageShell>
    )
}
function PropertyCard({ property, onEdit }) {
    const image = property.propertyImages?.[0]?.image_url
    const availability = property.availabilities
    return (
        <article className="overflow-hidden rounded-2xl border border-border bg-surface">
            {image ? <img src={image} alt="" className="h-44 w-full object-cover" /> : <div className="grid h-44 place-items-center bg-bg-2 text-primary"><House size={36} /></div>}
            <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <h2 className="text-lg font-bold text-text">{property.title}</h2>
                        <p className="mt-1 text-sm text-text-2">{property.city}, {property.country}</p>
                    </div>
                    <span className="rounded-full bg-bg-2 px-3 py-1 text-xs font-semibold text-text-2">{property.verification_status}</span>
                </div>
                <p className="mt-4 font-semibold text-primary">ETB {Number(property.price_per_night).toLocaleString()} <span className="font-normal text-text-2">/ night</span></p>
                <p className="mt-2 text-sm text-text-2">Availability: {availability ? `${toDateInput(availability.available_from)} – ${toDateInput(availability.available_to)}` : 'Not set'}</p>
                <button type="button" onClick={onEdit} className="mt-4 inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-semibold text-text hover:bg-bg-2">
                    <Edit3 size={15} /> Edit details and dates
                </button>
            </div>
        </article>
    )
}
function StatusCount({ label, count }) {
    return <span className="rounded-full border border-border bg-surface px-4 py-2"><strong>{count}</strong> {label}</span>
}
function PropertyForm({ form, setForm, isSaving, error, onCancel, onSubmit, onRetrySave }) {
    const [isUploading, setIsUploading] = useState(false)
    const [uploadMessage, setUploadMessage] = useState('')
    const [failedImages, setFailedImages] = useState([])
    const field = (name, value) => setForm((current) => ({ ...current, [name]: value }))
    const addImages = async (event) => {
        const selected = Array.from(event.target.files || [])
        event.target.value = ''
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
    return (
        <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1 text-sm font-semibold text-text">Property title<input required maxLength={120} value={form.title} onChange={(event) => field('title', event.target.value)} className="rounded-lg border border-border bg-surface px-3 py-2 font-normal text-text placeholder:text-text-2" /></label>
            <label className="grid gap-1 text-sm font-semibold text-text">City<input required value={form.city} onChange={(event) => field('city', event.target.value)} className="rounded-lg border border-border bg-surface px-3 py-2 font-normal text-text placeholder:text-text-2" /></label>
            <label className="grid gap-1 text-sm font-semibold text-text">Country<input required value={form.country} onChange={(event) => field('country', event.target.value)} className="rounded-lg border border-border bg-surface px-3 py-2 font-normal text-text placeholder:text-text-2" /></label>
            <label className="grid gap-1 text-sm font-semibold text-text">Price per night (ETB)<input required min="0.01" step="0.01" type="number" value={form.price_per_night} onChange={(event) => field('price_per_night', event.target.value)} className="rounded-lg border border-border bg-surface px-3 py-2 font-normal text-text placeholder:text-text-2" /></label>
            <label className="grid gap-1 text-sm font-semibold text-text">Minimum nights<input required min="1" step="1" type="number" value={form.min_stay_duration} onChange={(event) => field('min_stay_duration', event.target.value)} className="rounded-lg border border-border bg-surface px-3 py-2 font-normal text-text placeholder:text-text-2" /></label>
            <label className="grid gap-1 text-sm font-semibold text-text">Maximum nights<input required min="1" step="1" type="number" value={form.max_stay_duration} onChange={(event) => field('max_stay_duration', event.target.value)} className="rounded-lg border border-border bg-surface px-3 py-2 font-normal text-text placeholder:text-text-2" /></label>
            <label className="grid gap-1 text-sm font-semibold text-text">Available from<input required type="date" value={form.available_from} onChange={(event) => field('available_from', event.target.value)} className="rounded-lg border border-border bg-surface px-3 py-2 font-normal text-text placeholder:text-text-2" /></label>
            <label className="grid gap-1 text-sm font-semibold text-text">Available until<input required type="date" value={form.available_to} onChange={(event) => field('available_to', event.target.value)} className="rounded-lg border border-border bg-surface px-3 py-2 font-normal text-text placeholder:text-text-2" /></label>
            <label className="grid gap-1 text-sm font-semibold text-text sm:col-span-2">Description<textarea required rows={4} value={form.description} onChange={(event) => field('description', event.target.value)} className="rounded-lg border border-border bg-surface px-3 py-2 font-normal text-text placeholder:text-text-2" /></label>
            <label className="grid gap-1 text-sm font-semibold text-text sm:col-span-2">Amenities <span className="font-normal text-text-2">Separate items with commas</span><input value={form.amenities} onChange={(event) => field('amenities', event.target.value)} className="rounded-lg border border-border bg-surface px-3 py-2 font-normal text-text placeholder:text-text-2" /></label>
            <div className="grid gap-2 text-sm font-semibold text-text sm:col-span-2">
                <span>Property photos <span className="font-normal text-text-2">Up to 10 images, 10 MB each</span></span>
                <label className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-lg border border-border px-4 py-2 font-medium hover:bg-bg-2">
                    <ImagePlus size={17} /> {isUploading ? 'Uploading images...' : 'Choose images'}
                    <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple disabled={isUploading || form.property_images.length >= 10} onChange={addImages} className="sr-only" />
                </label>
                {uploadMessage && <div className="grid justify-items-start gap-2"><p role="alert" className="font-normal text-danger">{uploadMessage}</p>{failedImages.length > 0 && <RetryButton onRetry={retryFailedImages} isRetrying={isUploading} label="Retry image upload"/>}</div>}
                {form.property_images.length > 0 && <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {form.property_images.map((url, index) => <div key={`${url}-${index}`} className="relative overflow-hidden rounded-lg border border-border">
                        <img src={url} alt={`Property photo ${index + 1}`} className="h-28 w-full object-cover" />
                        <button type="button" aria-label={`Remove photo ${index + 1}`} onClick={() => removeImage(index)} className="absolute right-1 top-1 rounded-full bg-bg p-1 text-text shadow"><X size={15} /></button>
                    </div>)}
                </div>}
            </div>
            {error && <div className="grid justify-items-start gap-2 sm:col-span-2"><p role="alert" className="text-sm text-danger">{error}</p><RetryButton onRetry={onRetrySave} isRetrying={isSaving} label="Retry save"/></div>}
            <div className="flex justify-end gap-3 pt-2 sm:col-span-2">
                <button type="button" disabled={isSaving} onClick={onCancel} className="rounded-lg border border-border px-4 py-2">Cancel</button>
                <button type="submit" disabled={isSaving || isUploading} className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2 font-semibold text-button-text disabled:opacity-60">{isSaving && <Spinner size="sm" />}{isSaving ? 'Saving...' : 'Save property'}</button>
            </div>
        </form>
    )
}
function toDateInput(value) {
    return value ? new Date(value).toISOString().slice(0, 10) : ''
}
