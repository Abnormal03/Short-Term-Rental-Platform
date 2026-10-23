// features/bookings/components/CompletedBookingCard.jsx
import { useNavigate } from 'react-router-dom'
import { formatDate } from '../../../lib/utils'
import Button from '../../../components/UI/Botton'

export default function CompletedBookingCard({ booking }) {
    const navigate = useNavigate()

    const nights = Math.round(
        (new Date(booking.check_out_date) - new Date(booking.check_in_date))
        / (1000 * 60 * 60 * 24)
    )

    return (
        <div className="flex gap-5 p-4 bg-surface border border-border
                    rounded-2xl hover:shadow-sm transition-shadow">
            {/* image */}
            <div className="w-36 h-28 rounded-xl overflow-hidden
                      bg-neutral shrink-0">
                <img
                    src={booking.property?.propertyImages?.[0]?.image_url}
                    alt={booking.property?.title}
                    className="w-full h-full object-cover"
                />
            </div>

            {/* details */}
            <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                    <p className="text-xs text-text-2 uppercase tracking-wide
                        font-semibold mb-1">
                        Trip completed {formatDate(booking.check_out_date)}
                    </p>
                    <h3 className="font-bold text-xl text-text leading-tight">
                        {booking.property?.title}
                    </h3>
                    <p className="text-sm text-text-2 mt-0.5">
                        {booking.property?.city}, Ethiopia • {nights} Night{nights !== 1 ? 's' : ''}
                    </p>
                </div>

                {/* actions */}
                <div className="flex flex-wrap items-center gap-3 mt-3">
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={() => navigate(`/my-bookings/${booking.booking_id}`)}
                    >
                        Booking details
                    </Button>
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => navigate(`/bookings/${booking.id}/review`)}
                    >
                        Write a Review
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/properties/${booking.property_id}`)}
                    >
                        Rebook
                    </Button>
                </div>
            </div>
        </div>
    )
}
