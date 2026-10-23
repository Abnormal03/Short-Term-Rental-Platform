import { RotateCw } from 'lucide-react'

export default function RetryButton({ onRetry, isRetrying = false, label = 'Try again' }) {
    return (
        <button type="button" onClick={onRetry} disabled={isRetrying} className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-semibold text-primary hover:bg-bg-2 disabled:opacity-60">
            <RotateCw size={16} className={isRetrying ? 'animate-spin' : ''} />
            {isRetrying ? 'Retrying...' : label}
        </button>
    )
}
