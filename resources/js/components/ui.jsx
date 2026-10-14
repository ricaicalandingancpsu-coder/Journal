import { useEffect, useId, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, X } from 'lucide-react';

export function Spinner({ label = 'Loading' }) {
    return (
        <span role="status" className="inline-flex items-center gap-2 text-ink-soft">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            <span className="sr-only">{label}</span>
        </span>
    );
}

export function PageLoader({ label = 'Loading' }) {
    return (
        <div className="flex min-h-[40vh] items-center justify-center">
            <Spinner label={label} />
        </div>
    );
}

export function Button({ variant = 'primary', loading = false, children, className = '', ...props }) {
    return (
        <button
            className={`btn btn-${variant} ${className}`}
            disabled={loading || props.disabled}
            {...props}
        >
            {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
            {children}
        </button>
    );
}

export function ButtonLink({ variant = 'primary', className = '', ...props }) {
    return <Link className={`btn btn-${variant} ${className}`} {...props} />;
}

export function Field({ label, error, hint, children, className = '' }) {
    const id = useId();
    const describedBy = [error && `${id}-error`, hint && `${id}-hint`].filter(Boolean).join(' ') || undefined;

    return (
        <div className={className}>
            <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
                {label}
            </label>
            {children({ id, 'aria-describedby': describedBy, 'aria-invalid': error ? true : undefined })}
            {hint && !error && (
                <p id={`${id}-hint`} className="mt-1.5 text-xs text-ink-soft">
                    {hint}
                </p>
            )}
            {error && (
                <p id={`${id}-error`} className="mt-1.5 text-sm text-red-700 dark:text-red-400" role="alert">
                    {error}
                </p>
            )}
        </div>
    );
}

export function FormAlert({ children }) {
    if (!children) return null;
    return (
        <div role="alert" className="rounded-xl border border-red-300/60 bg-red-50 px-4 py-3 text-sm text-red-800">
            {children}
        </div>
    );
}

export function EmptyState({ icon: Icon, title, children, action }) {
    return (
        <div className="card flex flex-col items-center px-6 py-14 text-center">
            {Icon && (
                <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blush text-rose-deep">
                    <Icon className="h-5 w-5" aria-hidden />
                </span>
            )}
            <h3 className="text-xl">{title}</h3>
            {children && <p className="mt-2 max-w-sm text-sm text-ink-soft">{children}</p>}
            {action && <div className="mt-6">{action}</div>}
        </div>
    );
}

export function ErrorState({ message, onRetry }) {
    return (
        <div role="alert" className="card flex flex-col items-center px-6 py-12 text-center">
            <p className="text-ink-soft">{message}</p>
            {onRetry && (
                <Button variant="secondary" className="mt-5" onClick={onRetry}>
                    Try again
                </Button>
            )}
        </div>
    );
}

export function Modal({ open, onClose, title, children, wide = false }) {
    const panel = useRef(null);
    const titleId = useId();

    useEffect(() => {
        if (!open) return undefined;
        const previouslyFocused = document.activeElement;
        const onKey = (e) => e.key === 'Escape' && onClose();
        document.addEventListener('keydown', onKey);
        document.body.style.overflow = 'hidden';
        panel.current?.focus();
        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = '';
            previouslyFocused?.focus?.();
        };
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6">
            <div className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]" onClick={onClose} aria-hidden />
            <div
                ref={panel}
                tabIndex={-1}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                className={`card relative max-h-[92vh] w-full overflow-y-auto rounded-b-none p-6 shadow-lift sm:rounded-b-2xl ${wide ? 'max-w-3xl' : 'max-w-md'}`}
            >
                <div className="mb-4 flex items-start justify-between gap-4">
                    <h2 id={titleId} className="text-2xl">
                        {title}
                    </h2>
                    <button onClick={onClose} aria-label="Close" className="btn btn-ghost -mr-2 -mt-1 !p-2">
                        <X className="h-5 w-5" />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}

export function ConfirmDialog({ open, title, message, confirmLabel = 'Delete', loading, onConfirm, onClose }) {
    return (
        <Modal open={open} onClose={onClose} title={title}>
            <p className="text-ink-soft">{message}</p>
            <div className="mt-6 flex justify-end gap-3">
                <Button variant="secondary" onClick={onClose} disabled={loading}>
                    Cancel
                </Button>
                <Button variant="danger" onClick={onConfirm} loading={loading}>
                    {confirmLabel}
                </Button>
            </div>
        </Modal>
    );
}

export function PageHeader({ eyebrow, title, children }) {
    return (
        <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
                {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
                <h1 className="text-3xl sm:text-4xl">{title}</h1>
            </div>
            {children && <div className="flex flex-wrap items-center gap-3">{children}</div>}
        </header>
    );
}
