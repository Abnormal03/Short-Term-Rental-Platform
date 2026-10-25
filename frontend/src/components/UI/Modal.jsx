import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
};

export function Modal({ isOpen, onClose, title, description, children, size = 'md', className, bodyClassName }) {
    const overlayRef = useRef(null);

    // close on Escape key
    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape') onClose(); };
        if (isOpen) document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [isOpen, onClose]);

    // lock body scroll when open
    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div
            ref={overlayRef}
            onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
        >
            <div className={cn(
                'relative flex w-full flex-col bg-bg rounded-2xl shadow-xl border border-border',
                'animate-in zoom-in-95 duration-200',
                sizes[size],
                className
            )}>
                {/* HEADER */}
                {title && (
                    <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-3.5">
                        <div>
                            <h2 className="text-lg font-bold text-app-text">{title}</h2>
                            {description && <p className="mt-0.5 text-xs text-text-2">{description}</p>}
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            aria-label="Close dialog"
                            className="grid size-8 shrink-0 place-items-center rounded-full border border-border text-text-2 transition-colors hover:bg-neutral"
                        >
                            <X size={15} />
                        </button>
                    </div>
                )}

                {/* BODY */}
                <div className={cn('min-h-0 flex-1 px-5 py-4', bodyClassName)}>{children}</div>
            </div>
        </div>
    );
}

// Footer slot for action buttons inside modal
Modal.Footer = function ModalFooter({ children }) {
    return (
        <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-2 -mt-2">
            {children}
        </div>
    );
};
