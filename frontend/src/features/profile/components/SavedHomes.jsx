// features/profile/components/SavedHomes.jsx
import { Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useSavedHomes } from '../hooks/useProfile'
import { Spinner } from '../../../components/UI/Spinner'
import { formatETB } from '../../../lib/utils'

export default function SavedHomes() {
    const { data: saved, isLoading } = useSavedHomes()

    return (
        <div className="bg-surface border border-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-bold text-text">Saved Homes</h2>
                <Link
                    to="/wishlist"
                    className="text-sm font-semibold text-primary hover:underline"
                >
                    View all Wishlist
                </Link>
            </div>

            {isLoading ? (
                <Spinner />
            ) : !saved?.length ? (
                <p className="text-sm text-text-2 text-center py-6">
                    No saved homes yet
                </p>
            ) : (
                <div className="grid grid-cols-2 gap-4">
                    {saved.map((property) => (
                        <Link
                            key={property.id}
                            to={`/properties/${property.id}`}
                            className="group border border-border rounded-xl
                         overflow-hidden hover:shadow-md transition-shadow"
                        >
                            {/* image */}
                            <div className="relative h-36 bg-neutral">
                                <img
                                    src={property.images?.[0]?.url}
                                    alt={property.title}
                                    className="w-full h-full object-cover
                             group-hover:scale-105 transition-transform duration-300"
                                />
                                <button
                                    onClick={(e) => e.preventDefault()}
                                    className="absolute top-2 right-2 w-7 h-7 rounded-full
                             bg-white/90 flex items-center justify-center
                             shadow-sm"
                                >
                                    <Heart size={14} className="text-secondary fill-secondary" />
                                </button>
                            </div>

                            {/* info */}
                            <div className="p-3">
                                <p className="text-sm font-bold text-text truncate">
                                    {property.title}
                                </p>
                                <div className="flex items-center gap-1 mt-0.5">
                                    <span className="text-secondary text-xs">★</span>
                                    <span className="text-xs text-text-2">
                                        {property.rating ?? '4.9'} •{' '}
                                        {property._count?.reviews ?? 0} Reviews
                                    </span>
                                </div>
                                <p className="text-sm font-bold text-text mt-1">
                                    {formatETB(property.price_per_night)}
                                    <span className="text-xs font-normal text-text-2"> /night</span>
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}