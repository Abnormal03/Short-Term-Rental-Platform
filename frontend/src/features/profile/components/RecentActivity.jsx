// features/profile/components/RecentActivity.jsx
import { Star, Calendar } from 'lucide-react'
import { Link } from 'react-router-dom'

// in real usage this would come from a hook
const mockActivity = [
    {
        id: 1,
        icon: Star,
        text: 'Reviewed',
        link: 'Bole Highrise Suite',
        linkTo: '/properties/bole-highrise',
        time: '2 days ago',
    },
    {
        id: 2,
        icon: Calendar,
        text: 'Booking confirmed:',
        link: 'Lalibela Eco Lodge',
        linkTo: '/bookings/lalibela-eco',
        time: '1 week ago',
    },
]

export default function RecentActivity() {
    return (
        <div className="bg-surface border border-border rounded-2xl p-5">
            <h2 className="text-xs font-bold text-text-2 uppercase
                     tracking-widest mb-4">
                Recent Activity
            </h2>
            <div className="flex flex-col gap-3">
                {mockActivity.map(({ id, icon: Icon, text, link, linkTo, time }) => (
                    <div key={id} className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-secondary/10 flex
                            items-center justify-center shrink-0 mt-0.5">
                            <Icon size={14} className="text-secondary" />
                        </div>
                        <div>
                            <p className="text-sm text-text">
                                {text}{' '}
                                <Link
                                    to={linkTo}
                                    className="text-primary font-semibold hover:underline"
                                >
                                    {link}
                                </Link>
                            </p>
                            <p className="text-xs text-text-2 mt-0.5">{time}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}