import { useEffect, useState } from 'react'
import { useAuth, useUser } from '@clerk/clerk-react'
import { useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Check, LoaderCircle, LockKeyhole, Trash2, Upload } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import PageShell from '../components/layout/PageShell'
import RetryButton from '../components/UI/RetryButton'
import Skeleton from '../components/UI/Skeleton'
import { profileServices } from '../features/profile/services/profileServices'
import { useProfile } from '../features/profile/hooks/useProfile'
import useLanguageStore from '../store/useLanguageStore'
import useUserStore from '../store/useUser'

const PAYMENT_OPTIONS = [
    { value: 'TELEBIRR', label: 'telebirr' },
    { value: 'CBEBIRR', label: 'CBE Birr' },
    { value: 'AWASH', label: 'Awash Bank' },
]

const DEFAULT_NOTIFICATIONS = {
    booking_updates_enabled: true,
    host_messages_enabled: true,
    offers_enabled: false,
}

export default function EditProfilePage() {
    const { isLoaded, isSignedIn, user } = useUser()
    const profile = useProfile()
    const role = useUserStore((state) => state.role)

    if (!isLoaded || profile.isLoading) {
        return <PageShell><EditProfileSkeleton isHost={role === 'HOST'} /></PageShell>
    }

    if (!isSignedIn || !user) {
        return <PageShell><div className="mx-auto w-full max-w-4xl px-5 pb-20 pt-24 text-sm text-text-2">Sign in to edit your profile.</div></PageShell>
    }

    if (profile.isError || !profile.data?.user) {
        return <PageShell><div className="mx-auto flex min-h-[55vh] w-full max-w-4xl flex-wrap content-center items-center gap-3 px-5 pt-20"><p role="alert" className="text-sm text-danger">Could not load your profile.</p><RetryButton onRetry={profile.refetch} isRetrying={profile.isFetching} /></div></PageShell>
    }

    return <PageShell><EditProfileForm user={user} profile={profile.data.user} /></PageShell>
}

function EditProfileForm({ user, profile }) {
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const { getToken } = useAuth()
    const language = useLanguageStore((state) => state.language)
    const setLanguage = useLanguageStore((state) => state.setLanguage)
    const setUser = useUserStore((state) => state.setUser)
    const role = useUserStore((state) => state.role)
    const [firstName, setFirstName] = useState(user.firstName || profile.name?.split(' ')[0] || '')
    const [lastName, setLastName] = useState(user.lastName || profile.name?.split(' ').slice(1).join(' ') || '')
    const email = user.primaryEmailAddress?.emailAddress || profile.email || ''
    const [phone, setPhone] = useState(profile.phone_number || '')
    const [paymentPreference, setPaymentPreference] = useState(profile.payment_preference || 'TELEBIRR')
    const [selectedLanguage, setSelectedLanguage] = useState(profile.languagePreference?.language_code || language || 'en')
    const [notifications, setNotifications] = useState({
        booking_updates_enabled: profile.booking_updates_enabled ?? DEFAULT_NOTIFICATIONS.booking_updates_enabled,
        host_messages_enabled: profile.host_messages_enabled ?? DEFAULT_NOTIFICATIONS.host_messages_enabled,
        offers_enabled: profile.offers_enabled ?? DEFAULT_NOTIFICATIONS.offers_enabled,
    })
    const [photoAction, setPhotoAction] = useState(null)
    const [photoPreview, setPhotoPreview] = useState(null)
    const [saving, setSaving] = useState(false)
    const [saveError, setSaveError] = useState('')
    const [passwordOpen, setPasswordOpen] = useState(false)
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [passwordError, setPasswordError] = useState('')
    const [passwordSuccess, setPasswordSuccess] = useState(false)
    const [changingPassword, setChangingPassword] = useState(false)

    useEffect(() => () => {
        if (photoPreview?.startsWith('blob:')) URL.revokeObjectURL(photoPreview)
    }, [photoPreview])

    const finishAndReturn = async () => {
        await user.reload()
        setUser(user, role || 'GUEST', phone.trim() || null, true)
        await queryClient.invalidateQueries({ queryKey: ['profile'] })
        navigate('/profile', { replace: true, state: { profileUpdated: true } })
    }

    const saveProfile = async (event) => {
        event.preventDefault()
        setSaveError('')
        if (!firstName.trim() || !lastName.trim()) {
            setSaveError('Enter both your first and last name.')
            return
        }
        setSaving(true)
        try {
            const token = await getToken()
            if (!token) throw new Error('Your session has expired. Sign in again to save changes.')
            const authConfig = { headers: { Authorization: `Bearer ${token}` } }
            const fullName = `${firstName.trim()} ${lastName.trim()}`
            await user.update({ firstName: firstName.trim(), lastName: lastName.trim() })
            const profileResponse = await profileServices.updateProfile({
                name: fullName,
                phone_number: phone.trim() || null,
                payment_preference: paymentPreference,
                ...notifications,
            }, authConfig)
            const languageResponse = await profileServices.updateLanguage(selectedLanguage, authConfig)
            setLanguage(selectedLanguage)

            if (photoAction instanceof File) {
                await user.setProfileImage({ file: photoAction })
            } else if (photoAction === 'remove') {
                await user.setProfileImage({ file: null })
            }

            queryClient.setQueryData(['profile'], (current) => current ? {
                ...current,
                user: {
                    ...current.user,
                    ...profileResponse.data.user,
                    languagePreference: { language_code: languageResponse.data.preference.language_code },
                },
            } : current)
            await finishAndReturn()
        } catch (error) {
            setSaveError(getErrorMessage(error, 'Could not save your profile. Please try again.'))
        } finally {
            setSaving(false)
        }
    }

    const changePassword = async (event) => {
        event.preventDefault()
        setPasswordError('')
        if (newPassword.length < 8) {
            setPasswordError('Your new password must be at least 8 characters.')
            return
        }
        if (newPassword !== confirmPassword) {
            setPasswordError('The new passwords do not match.')
            return
        }
        setChangingPassword(true)
        try {
            await user.updatePassword({ currentPassword, newPassword, signOutOfOtherSessions: true })
            setPasswordSuccess(true)
            setCurrentPassword('')
            setNewPassword('')
            setConfirmPassword('')
        } catch (error) {
            setPasswordError(getErrorMessage(error, 'Could not change your password. Check your current password and try again.'))
        } finally {
            setChangingPassword(false)
        }
    }

    const handlePhoto = (file) => {
        if (!file) return
        if (!file.type.startsWith('image/')) {
            setSaveError('Choose an image file for your profile photo.')
            return
        }
        if (file.size > 5 * 1024 * 1024) {
            setSaveError('Choose a profile photo smaller than 5 MB.')
            return
        }
        setSaveError('')
        setPhotoAction(file)
        setPhotoPreview(URL.createObjectURL(file))
    }

    const visibleImage = photoPreview || (photoAction === 'remove' ? '' : user.hasImage ? user.imageUrl : '')
    const initial = (firstName.trim().charAt(0) || user.firstName?.charAt(0) || 'U').toUpperCase()

    return (
        <div className={`mx-auto w-full ${role === 'HOST' ? 'max-w-none' : 'max-w-4xl'} px-4 pb-36 pt-20 text-text sm:px-6 sm:pb-28 lg:px-8`}>
            <Link to="/profile" className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"><ArrowLeft size={14} /> Back to profile</Link>
            <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">Edit profile</h1>

            <form className="mt-5 grid gap-4" onSubmit={saveProfile}>
                <section className="rounded-2xl border border-border bg-surface p-4 sm:p-5" aria-labelledby="photo-heading">
                    <h2 id="photo-heading" className="text-sm font-bold">Profile photo</h2>
                    <p className="mt-1 text-xs text-text-2">Hosts see your photo when you book.</p>
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                        {visibleImage
                            ? <img src={visibleImage} alt="Profile preview" className="size-14 rounded-full border border-border object-cover" />
                            : <div className="grid size-14 place-items-center rounded-full bg-secondary text-xl font-bold text-on-secondary" aria-label={`Profile photo placeholder, ${initial}`}>{initial}</div>}
                        <label className="inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/15">
                            <Upload size={13} aria-hidden="true" /> Upload new photo
                            <input type="file" accept="image/*" className="sr-only" onChange={(event) => handlePhoto(event.target.files?.[0])} />
                        </label>
                        {(user.hasImage || photoAction instanceof File) && <button type="button" onClick={() => { setPhotoAction('remove'); setPhotoPreview(null) }} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-text hover:border-danger/40 hover:text-danger"><Trash2 size={13} aria-hidden="true" /> Remove</button>}
                        {photoAction && <span className="text-[0.65rem] text-text-2">Photo change will be applied when you save.</span>}
                    </div>
                </section>

                <section className="rounded-2xl border border-border bg-surface p-4 sm:p-5" aria-labelledby="personal-heading">
                    <h2 id="personal-heading" className="text-sm font-bold">Personal information</h2>
                    <p className="mt-1 text-xs text-text-2">Use the name that matches your ID. Hosts may ask for it at check-in.</p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        <Field label="First name" id="first-name"><input id="first-name" required autoComplete="given-name" value={firstName} onChange={(event) => setFirstName(event.target.value)} className={inputClass} /></Field>
                        <Field label="Last name" id="last-name"><input id="last-name" required autoComplete="family-name" value={lastName} onChange={(event) => setLastName(event.target.value)} className={inputClass} /></Field>
                        <Field label="Email" id="email-address" hint="Email address changes are not available here."><input id="email-address" type="email" autoComplete="email" value={email} readOnly aria-readonly="true" className={`${inputClass} cursor-not-allowed opacity-70`} /></Field>
                        <Field label="Phone number" id="phone-number" hint="Used for booking confirmations and host contact."><input id="phone-number" type="tel" autoComplete="tel" value={phone} onChange={(event) => setPhone(event.target.value)} className={inputClass} /></Field>
                    </div>
                </section>

                <section className="rounded-2xl border border-border bg-surface p-4 sm:p-5" aria-labelledby="payment-heading">
                    <h2 id="payment-heading" className="text-sm font-bold">Payment preference</h2>
                    <p className="mt-1 text-xs text-text-2">Your default at checkout. You can change it for any booking.</p>
                    <div className="mt-4 grid gap-2 sm:grid-cols-3">
                        {PAYMENT_OPTIONS.map((option) => <Choice key={option.value} name="payment-preference" value={option.value} selected={paymentPreference === option.value} onChange={setPaymentPreference}>{option.label}</Choice>)}
                    </div>
                </section>

                <section className="rounded-2xl border border-border bg-surface p-4 sm:p-5" aria-labelledby="language-heading">
                    <h2 id="language-heading" className="text-sm font-bold">Language</h2>
                    <p className="mt-1 text-xs text-text-2">Applies to the app and messages from Betoch.</p>
                    <div className="mt-4 grid max-w-md gap-2 sm:grid-cols-2">
                        <Choice name="language" value="en" selected={selectedLanguage === 'en'} onChange={setSelectedLanguage}>English</Choice>
                        <Choice name="language" value="am" selected={selectedLanguage === 'am'} onChange={setSelectedLanguage}>አማርኛ</Choice>
                    </div>
                </section>

                <section className="rounded-2xl border border-border bg-surface p-4 sm:p-5" aria-labelledby="notifications-heading">
                    <h2 id="notifications-heading" className="text-sm font-bold">Notifications</h2>
                    <p className="mt-1 text-xs text-text-2">Choose how we keep you updated.</p>
                    <div className="mt-3 divide-y divide-border">
                        <NotificationRow title="Booking updates" description="Confirmations, changes and reminders by SMS." checked={notifications.booking_updates_enabled} onChange={(checked) => setNotifications((current) => ({ ...current, booking_updates_enabled: checked }))} />
                        <NotificationRow title="Host messages" description="When a host replies to you." checked={notifications.host_messages_enabled} onChange={(checked) => setNotifications((current) => ({ ...current, host_messages_enabled: checked }))} />
                        <NotificationRow title="Offers and travel tips" description="Occasional email from Betoch." checked={notifications.offers_enabled} onChange={(checked) => setNotifications((current) => ({ ...current, offers_enabled: checked }))} />
                    </div>
                </section>

                <section className="rounded-2xl border border-border bg-surface p-4 sm:p-5" aria-labelledby="security-heading">
                    <h2 id="security-heading" className="text-sm font-bold">Account security</h2>
                    <p className="mt-1 text-xs text-text-2">Keep your account safe.</p>
                    {user.passwordEnabled
                        ? <button type="button" onClick={() => { setPasswordError(''); setPasswordSuccess(false); setPasswordOpen(true) }} className="mt-3 inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/15"><LockKeyhole size={13} aria-hidden="true" /> Change password</button>
                        : <p className="mt-3 text-xs text-text-2">Your account does not have a password sign-in enabled.</p>}
                </section>

                {saveError && <p role="alert" className="rounded-xl border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger">{saveError}</p>}
                <div className="fixed inset-x-0 bottom-20 z-20 border-t border-border bg-surface/95 px-4 py-3 backdrop-blur md:bottom-0">
                    <div className={`mx-auto flex w-full ${role === 'HOST' ? 'max-w-none' : 'max-w-4xl'} items-center justify-between gap-3`}>
                        <p className="hidden text-xs text-text-2 sm:block">Changes are saved to your account.</p>
                        <div className="ml-auto flex gap-2">
                            <Link to="/profile" className="inline-flex min-h-9 items-center rounded-lg border border-border bg-surface px-4 py-2 text-xs font-semibold text-text">Cancel</Link>
                            <button type="submit" disabled={saving} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-secondary px-4 py-2 text-xs font-bold text-on-secondary disabled:opacity-60">
                                {saving && <LoaderCircle size={13} className="animate-spin" aria-hidden="true" />}
                                {saving ? 'Saving…' : 'Save changes'}
                            </button>
                        </div>
                    </div>
                </div>
            </form>

            {passwordOpen && <PasswordModal
                currentPassword={currentPassword}
                newPassword={newPassword}
                confirmPassword={confirmPassword}
                error={passwordError}
                success={passwordSuccess}
                busy={changingPassword}
                setCurrentPassword={setCurrentPassword}
                setNewPassword={setNewPassword}
                setConfirmPassword={setConfirmPassword}
                onClose={() => setPasswordOpen(false)}
                onSubmit={changePassword}
            />}
        </div>
    )
}

const inputClass = 'min-h-10 w-full rounded-lg border border-border bg-bg px-3 py-2 text-xs text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15'

function Field({ label, id, hint, children }) {
    return <div className="min-w-0">
        <label htmlFor={id} className="mb-1 block text-[0.65rem] font-semibold text-text">{label}</label>
        {children}
        {hint && <p className="mt-1 text-[0.55rem] leading-4 text-text-2">{hint}</p>}
    </div>
}

function Choice({ name, value, selected, onChange, children }) {
    return <label className={`flex min-h-10 cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition ${selected ? 'border-primary bg-primary/5 text-text' : 'border-border text-text-2 hover:border-primary/40'}`}>
        <input type="radio" name={name} value={value} checked={selected} onChange={() => onChange(value)} className="accent-primary" />
        {children}
    </label>
}

function NotificationRow({ title, description, checked, onChange }) {
    return <label className="flex min-h-14 cursor-pointer items-center justify-between gap-4 py-2.5">
        <span><span className="block text-xs font-semibold text-text">{title}</span><span className="mt-0.5 block text-[0.6rem] text-text-2">{description}</span></span>
        <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="size-4 shrink-0 accent-primary" />
    </label>
}

function PasswordModal({ currentPassword, newPassword, confirmPassword, error, success, busy, setCurrentPassword, setNewPassword, setConfirmPassword, onClose, onSubmit }) {
    return <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/50 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) onClose() }}>
        <section role="dialog" aria-modal="true" aria-labelledby="password-modal-title" className="w-full max-w-md rounded-2xl border border-border bg-surface p-5 shadow-2xl sm:p-6">
            <h2 id="password-modal-title" className="text-lg font-bold text-text">Change password</h2>
            <p className="mt-1 text-sm text-text-2">Enter your current password and choose a new one.</p>
            <form className="mt-5 grid gap-3" onSubmit={onSubmit}>
                <Field label="Current password" id="current-password"><input id="current-password" type="password" autoComplete="current-password" required value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} className={inputClass} /></Field>
                <Field label="New password" id="new-password" hint="Use at least 8 characters."><input id="new-password" type="password" autoComplete="new-password" minLength={8} required value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className={inputClass} /></Field>
                <Field label="Confirm new password" id="confirm-password"><input id="confirm-password" type="password" autoComplete="new-password" minLength={8} required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className={inputClass} /></Field>
                {error && <p role="alert" className="text-sm text-danger">{error}</p>}
                {success && <p role="status" className="flex items-center gap-1.5 text-sm font-semibold text-success"><Check size={15} /> Password updated.</p>}
                <div className="mt-2 flex justify-end gap-2">
                    <button type="button" onClick={onClose} disabled={busy} className="min-h-10 rounded-lg border border-border px-4 text-sm font-semibold text-text disabled:opacity-50">{success ? 'Done' : 'Cancel'}</button>
                    {!success && <button type="submit" disabled={busy} className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-semibold text-button-text disabled:opacity-60">{busy && <LoaderCircle size={14} className="animate-spin" />}{busy ? 'Updating…' : 'Update password'}</button>}
                </div>
            </form>
        </section>
    </div>
}

function EditProfileSkeleton({ isHost = false }) {
    return <div role="status" aria-label="Loading edit profile" className={`mx-auto grid w-full ${isHost ? 'max-w-none' : 'max-w-4xl'} gap-4 px-4 pb-24 pt-20 sm:px-6 lg:px-8`}>
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-9 w-52" />
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-36 rounded-2xl" />
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-36 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
        <div className="fixed inset-x-0 bottom-20 h-16 border-t border-border bg-surface md:bottom-0" />
    </div>
}

function getErrorMessage(error, fallback) {
    return error?.errors?.[0]?.longMessage
        || error?.response?.data?.message
        || error?.message
        || fallback
}
