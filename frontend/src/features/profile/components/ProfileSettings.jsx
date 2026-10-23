// features/profile/components/ProfileSettings.jsx
import { useProfile } from '../hooks/useProfile'
import RetryButton from '../../../components/UI/RetryButton'

export default function ProfileSettings() {
    const { data, isLoading, isError, refetch, isFetching } = useProfile()
    const user = data?.user

    return (
        <div className="bg-surface border border-border rounded-2xl p-5">
            <h2 className="text-base font-bold text-text mb-4">
                Account Details
            </h2>
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
                </div>
            )}
        </div>
    )
}
