// features/profile/components/ProfileSettings.jsx
import { useClerk } from '@clerk/clerk-react'
import { LogOut } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useProfile } from '../hooks/useProfile'
import RetryButton from '../../../components/UI/RetryButton'

export default function ProfileSettings({ showLogout = true, showLanguage = false }) {
    const { signOut } = useClerk()
    const { data, isLoading, isError, refetch, isFetching } = useProfile()
    const user = data?.user

    return (
        <div className="bg-surface border border-border rounded-2xl p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-base font-bold text-text">Account Details</h2>
                <Link to="/edit-profile" className="text-xs font-semibold text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                    Edit
                </Link>
            </div>
            {isLoading ? (
                <p role="status" className="min-h-24 text-sm text-text-2">Loading account details…</p>
            ) : isError ? (
                <div className="grid min-h-24 content-start justify-items-start gap-2 text-sm">
                    <p role="alert" className="text-danger">Could not load account details.</p>
                    <RetryButton onRetry={refetch} isRetrying={isFetching} />
                </div>
            ) : (
                <div className="grid min-h-24 content-start gap-3 text-sm text-text">
                    <p><span className="font-semibold">Phone:</span> {user?.phone_number || 'Not added'}</p>
                    <p><span className="font-semibold">Role:</span> {user?.Role || 'GUEST'}</p>
                    <p><span className="font-semibold">Payment preference:</span> {user?.payment_preference || 'TELEBIRR'}</p>
                    {showLanguage && <p><span className="font-semibold">Language:</span> {user?.languagePreference?.language_code === 'am' ? 'Amharic' : 'English'}</p>}
                </div>
            )}
            {showLogout && <div className="mt-5 border-t border-border pt-4">
                <button
                    type="button"
                    onClick={() => signOut({ redirectUrl: '/' })}
                    className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-semibold text-text transition-colors hover:bg-bg-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                    <LogOut size={16} aria-hidden="true" />
                    Log out
                </button>
            </div>}
        </div>
    )
}
