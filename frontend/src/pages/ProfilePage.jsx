// pages/ProfilePage.jsx
import PageShell from '../components/layout/PageShell'
import ProfileHeader from '../features/profile/components/ProfileHeader'
import ProfileSettings from '../features/profile/components/ProfileSettings'
import MyTrips from '../features/profile/components/MyTrips'

export default function ProfilePage() {
    return (
        <PageShell>
            <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-16">
                {/* header — full width */}
                <ProfileHeader />

                {/* two column layout */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-[280px_1fr] gap-5">

                    {/* LEFT column */}
                    <div className="flex flex-col gap-5">
                        <ProfileSettings />
                    </div>

                    {/* RIGHT column */}
                    <div className="flex flex-col gap-5">
                        <MyTrips />
                    </div>

                </div>
            </div>
        </PageShell>
    )
}
