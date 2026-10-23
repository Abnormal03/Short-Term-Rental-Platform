import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { PageSpinner } from '../components/UI/Spinner'
import PageShell from '../components/layout/PageShell'
import { ExplorePageSkeleton } from '../pages/ExplorePage'
import useUserStore from '../store/useUser'

export function ProfileCompletionGate() {
    const profileStatus = useUserStore((state) => state.profileStatus)
    const location = useLocation()

    if (profileStatus === 'loading') {
        if (location.pathname === '/explore') return <PageShell><ExplorePageSkeleton /></PageShell>
        return <PageSpinner />
    }
    if (profileStatus === 'error') return <AuthProfileError />
    if (profileStatus === 'incomplete') {
        return <Navigate to="/complete-profile" replace state={{ from: location.pathname }} />
    }

    return <Outlet />
}

export function CompleteProfileRoute({ children }) {
    const profileStatus = useUserStore((state) => state.profileStatus)

    if (profileStatus === 'loading') return <PageSpinner />
    if (profileStatus === 'error') return <AuthProfileError />
    if (profileStatus === 'complete') return <Navigate to="/" replace />

    return children
}

function AuthProfileError() {
    return (
        <main className="grid min-h-screen place-items-center bg-bg-2 px-5 py-12 text-center">
            <section className="max-w-md rounded-2xl border border-border bg-bg p-8 shadow-sm">
                <h1 className="text-xl font-semibold text-text">We couldn’t load your account</h1>
                <p className="mt-3 text-sm leading-relaxed text-text-2">
                    Your sign-in succeeded, but we couldn’t retrieve your account role and profile. Try again to continue.
                </p>
                <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="mt-6 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-button-text transition-colors hover:bg-primary/90"
                >
                    Retry account sync
                </button>
            </section>
        </main>
    )
}
