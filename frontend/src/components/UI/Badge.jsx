import { cn } from '../../lib/utils';

const variants = {
    verified: 'bg-secondary text-text border border-secondary',
    new: 'bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
    top: 'bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
    hot: 'bg-red-50 text-red-500 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
    pending: 'bg-neutral text-text-2 border border-border dark:bg-neutral dark:text-text-2 dark:border-border',
};

export function Badge({ variant = 'top', children, className }) {
    return (
        <span className={cn(
            'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-600',
            variants[variant],
            className
        )}>
            {children}
        </span>
    );
}