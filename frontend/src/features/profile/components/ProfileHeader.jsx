// features/profile/components/ProfileHeader.jsx
import { Mail, CheckCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Button from '../../../components/UI/Botton'
import useUserStore from '../../../store/useUser'
import { useProfile } from '../hooks/useProfile'
import RetryButton from '../../../components/UI/RetryButton'

export default function ProfileHeader({ title = 'Your profile', actionLabel = 'Browse stays', actionTo = '/listings' }) {
    const clerkUser = useUserStore((state) => state.user)
    const role = useUserStore((state) => state.role)
    const { data, isLoading, isError, refetch, isFetching } = useProfile()
    const profile = data?.user
    const name = profile?.name || clerkUser?.fullName || 'Your profile'
    const email = profile?.email || clerkUser?.primaryEmailAddress?.emailAddress || ''
    const imageUrl = clerkUser?.imageUrl
    const navigate = useNavigate()

    return (
        <div className="flex items-start justify-between py-6 px-6
                    border-b border-border flex-wrap gap-4">
            {/* LEFT — avatar + info */}
            <div className="flex items-center gap-5">
                {/* avatar */}
                <div className="relative shrink-0">
                    {imageUrl ? (
                        <img
                            src={imageUrl}
                            alt={name}
                            className="w-20 h-20 rounded-full object-cover border-2 border-border"
                        />
                    ) : (
                        <div className="w-20 h-20 rounded-full bg-primary text-button-text
                            flex items-center justify-center text-xl font-bold">
                            {name.slice(0, 2).toUpperCase()}
                        </div>
                    )}
                    {/* verified tick on avatar */}
                    {profile?.is_verified_host && <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center border-2 border-surface"><CheckCircle size={12} className="text-button-text" /></div>}
                </div>

                {/* name + email + badges */}
                <div>
                    <h1 className="text-2xl font-bold text-text">
                        {title}: {isLoading ? 'Loading profile…' : name}
                    </h1>
                    <p className="flex items-center gap-1.5 text-sm text-text-2 mt-0.5">
                        <Mail size={13} />
                        {email}
                    </p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <span className="flex items-center gap-1 text-xs font-semibold
                             text-primary bg-primary/10 border border-primary/20
                             px-2.5 py-0.5 rounded-full">
                            <CheckCircle size={11} /> {role || profile?.Role || 'GUEST'}
                        </span>
                        {role === 'HOST' && <span className="text-xs font-semibold text-secondary
                             bg-secondary/10 border border-secondary/20
                             px-2.5 py-0.5 rounded-full">
                            {profile?.is_verified_host ? 'Verified host' : 'Host verification pending'}
                        </span>}
                    </div>
                    {isError && <div className="mt-2 flex items-center gap-2"><span role="alert" className="text-sm text-danger">Could not load profile.</span><RetryButton onRetry={refetch} isRetrying={isFetching} /></div>}
                </div>
            </div>

            {/* RIGHT — action buttons */}
            <div className="flex items-center gap-3">
                <Button onClick={() => navigate(actionTo)}>{actionLabel}</Button>
            </div>
        </div>
    )
}
