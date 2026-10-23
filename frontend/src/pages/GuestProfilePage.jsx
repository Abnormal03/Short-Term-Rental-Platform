import PageShell from '../components/layout/PageShell'
import ProfileHeader from '../features/profile/components/ProfileHeader'
import ProfileSettings from '../features/profile/components/ProfileSettings'
import MyTrips from '../features/profile/components/MyTrips'

export default function GuestProfilePage() {
    return (
        <PageShell>
            <section className="mx-auto w-full max-w-5xl px-4 pb-16 sm:px-6" aria-labelledby="guest-profile-title">
                <ProfileHeader title="Guest profile" actionLabel="Browse stays" actionTo="/listings" />
                <div className="mt-6 grid gap-5 md:grid-cols-[280px_1fr]">
                    <ProfileSettings />
                    <MyTrips />
                </div>
            </section>
        </PageShell>
    )
}
