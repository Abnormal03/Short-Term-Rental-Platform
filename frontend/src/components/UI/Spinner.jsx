import { cn } from '../../lib/utils';

const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-7 h-7 border-2',
    lg: 'w-10 h-10 border-[3px]',
};

export function Spinner({ size = 'md', className }) {
    return (
        <div className={cn(
            'rounded-full border-gray-200 border-t-primary animate-spin',
            sizes[size],
            className
        )} />
    );
}

// full page loading overlay
export function PageSpinner() {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3">
                <Spinner size="lg" />
                <span className="text-sm font-500 text-text-2">Loading...</span>
            </div>
        </div>
    );
}