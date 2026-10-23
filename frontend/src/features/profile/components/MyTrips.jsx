// features/profile/components/MyTrips.jsx
import { useState } from 'react'
import { MapPin, FileText } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useMyTrips } from '../hooks/useProfile'
import { Spinner } from '../../../components/UI/Spinner'
import { Badge } from '../../../components/UI/Badge'
import { formatDate } from '../../../lib/utils'
import RetryButton from '../../../components/UI/RetryButton'

const tabs = ['Upcoming', 'Past']

export default function MyTrips() {
    const [activeTab, setActiveTab] = useState('Upcoming')
    const { data: trips, isLoading, isError, refetch, isFetching } = useMyTrips()

    const filtered = trips?.filter((t) =>
        activeTab === 'Upcoming'
            ? ['CONFIRMED', 'PENDING'].includes(t.booking_status)
            : ['COMPLETED', 'CANCELLED'].includes(t.booking_status)
    )

    return (
        <div className="bg-surface border border-border rounded-2xl p-5">
            {/* header + tabs */}
            <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-bold text-text">My Trips</h2>
                <div className="flex gap-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-3 py-1 text-sm font-semibold rounded-full
                          transition-colors
                          ${activeTab === tab
                                    ? 'text-primary border-b-2 border-secondary'
                                    : 'text-text-2 hover:text-text'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* content */}
            {isLoading ? (
                <div className="grid min-h-48 place-items-center"><Spinner /></div>
            ) : isError ? (
                <div className="grid min-h-48 content-center justify-items-center gap-3"><p role="alert" className="text-sm text-danger">Could not load trips.</p><RetryButton onRetry={refetch} isRetrying={isFetching}/></div>
            ) : !filtered?.length ? (
                <div className="grid min-h-48 place-items-center">
                    <p className="text-sm text-text-2 text-center">No {activeTab.toLowerCase()} trips</p>
                </div>
            ) : (
                <div className="flex min-h-48 flex-col gap-3">
                    {filtered.map((trip) => (
                        <div
                            key={trip.booking_id}
                            className="flex gap-4 p-3 border border-border
                         rounded-xl hover:bg-neutral transition-colors"
                        >
                            {/* property thumbnail */}
                            <div className="w-24 h-20 rounded-lg overflow-hidden
                              bg-neutral shrink-0">
                                <img
                                    src={trip.property?.propertyImages?.[0]?.image_url}
                                    alt={trip.property?.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            {/* info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                    <p className="font-bold text-text text-sm leading-tight">
                                        {trip.property?.title}
                                    </p>
                                    <Badge
                                        variant={
                                            trip.booking_status === 'CONFIRMED' ? 'verified' : 'pending'
                                        }
                                    >
                                        {trip.booking_status}
                                    </Badge>
                                </div>
                                <p className="text-xs text-text-2 mt-0.5">
                                    {trip.property?.city}, Ethiopia •{' '}
                                    {formatDate(trip.check_in_date)} – {formatDate(trip.check_out_date)}
                                </p>
                                <div className="flex items-center gap-3 mt-2">
                                    <Link
                                        to={`/properties/${trip.property_id}`}
                                        className="flex items-center gap-1 text-xs font-semibold
                               text-primary hover:underline"
                                    >
                                        <MapPin size={11} /> View Directions
                                    </Link>
                                    <Link
                                        to="/my-bookings"
                                        className="flex items-center gap-1 text-xs font-semibold
                               text-primary hover:underline"
                                    >
                                        <FileText size={11} /> Details
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
