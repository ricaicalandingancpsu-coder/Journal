import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { CheckCircle2, X, XCircle } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);
    const nextId = useRef(0);

    const dismiss = useCallback((id) => setToasts((all) => all.filter((t) => t.id !== id)), []);

    const push = useCallback(
        (message, type = 'success') => {
            const id = nextId.current++;
            setToasts((all) => [...all, { id, message, type }]);
            setTimeout(() => dismiss(id), 4500);
        },
        [dismiss],
    );

    const value = useMemo(
        () => ({
            success: (message) => push(message, 'success'),
            error: (message) => push(message, 'error'),
        }),
        [push],
    );

    return (
        <ToastContext.Provider value={value}>
            {children}
            <div
                aria-live="polite"
                className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4"
            >
                {toasts.map((t) => (
                    <div
                        key={t.id}
                        role={t.type === 'error' ? 'alert' : 'status'}
                        className="card pointer-events-auto flex max-w-md items-start gap-3 px-4 py-3 text-sm shadow-lift"
                    >
                        {t.type === 'error' ? (
                            <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" aria-hidden />
                        ) : (
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-rose-deep" aria-hidden />
                        )}
                        <span className="flex-1">{t.message}</span>
                        <button onClick={() => dismiss(t.id)} aria-label="Dismiss" className="text-ink-soft hover:text-ink">
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export const useToast = () => useContext(ToastContext);
