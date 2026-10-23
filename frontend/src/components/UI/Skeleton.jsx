export default function Skeleton({ className = '' }) {
    return <span aria-hidden="true" className={`block animate-pulse rounded-md bg-primary/10 ${className}`} />
}
