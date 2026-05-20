import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
};

export function Modal({ isOpen, onClose, title, children, size = 'md', className }) {
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
                'relative w-full bg-bg rounded-2xl shadow-xl border border-border',
                'animate-in zoom-in-95 duration-200',
                sizes[size],
                className
            )}>
                {/* HEADER */}
                {title && (
                    <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                        <h2 className="text-base font-700 text-app-text">{title}</h2>
                        <button
                            onClick={onClose}
                            className="w-7 h-7 flex items-center justify-center rounded-full text-text-2 hover:bg-neutral transition-colors"
                        >
                            <X size={15} />
                        </button>
                    </div>
                )}

                {/* BODY */}
                <div className="px-6 py-5">{children}</div>
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