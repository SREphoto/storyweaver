
import React, { useEffect, useRef } from 'react';
import { XIcon } from '../icons';
import { createPortal } from 'react-dom';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | 'full';
    showCloseButton?: boolean;
}

const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
    maxWidth = '2xl',
    showCloseButton = true
}) => {
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden'; // Prevent scrolling
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const maxWidthClass = {
        'sm': 'max-w-sm',
        'md': 'max-w-md',
        'lg': 'max-w-lg',
        'xl': 'max-w-xl',
        '2xl': 'max-w-2xl',
        '3xl': 'max-w-3xl',
        '4xl': 'max-w-4xl',
        'full': 'max-w-full m-4',
    }[maxWidth];

    return createPortal(
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? "modal-title" : undefined}
        >
            <div
                className={`glass-panel bg-brand-surface/95 rounded-xl shadow-2xl w-full ${maxWidthClass} max-h-[90vh] flex flex-col border border-white/10 animate-in zoom-in-95 duration-200`}
                onClick={(e) => e.stopPropagation()}
                ref={modalRef}
            >
                {/* Header */}
                {(title || showCloseButton) && (
                    <div className="flex items-center justify-between p-5 border-b border-white/10 shrink-0">
                        {title ? (
                            <h2 id="modal-title" className="text-xl font-bold text-brand-secondary font-serif flex items-center gap-2 truncate pr-4">
                                {title}
                            </h2>
                        ) : <div></div>}

                        {showCloseButton && (
                            <button
                                onClick={onClose}
                                className="text-brand-text-muted hover:text-white transition p-1 rounded-lg hover:bg-white/5"
                                aria-label="Close modal"
                            >
                                <XIcon className="w-6 h-6" />
                            </button>
                        )}
                    </div>
                )}

                {children}
            </div>
        </div>,
        document.body
    );
};

export default Modal;
