/**
 * Toast Notification Component
 * 
 * A simple, elegant toast notification system
 */
import { useEffect } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface ToastProps {
    id: string
    type: ToastType
    message: string
    duration?: number
    onClose: (id: string) => void
}

const toastStyles: Record<ToastType, { bg: string; border: string; icon: JSX.Element }> = {
    success: {
        bg: 'bg-green-50 dark:bg-green-900/20',
        border: 'border-green-500',
        icon: <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />,
    },
    error: {
        bg: 'bg-red-50 dark:bg-red-900/20',
        border: 'border-red-500',
        icon: <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />,
    },
    info: {
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        border: 'border-blue-500',
        icon: <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />,
    },
    warning: {
        bg: 'bg-yellow-50 dark:bg-yellow-900/20',
        border: 'border-yellow-500',
        icon: <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />,
    },
}

export function Toast({ id, type, message, duration = 5000, onClose }: ToastProps) {
    const style = toastStyles[type]

    useEffect(() => {
        const timer = setTimeout(() => {
            onClose(id)
        }, duration)

        return () => clearTimeout(timer)
    }, [id, duration, onClose])

    return (
        <div
            className={`
                ${style.bg} ${style.border}
                pointer-events-auto mb-4 flex w-full max-w-sm items-start gap-3
                rounded-lg border-l-4 p-4 shadow-lg
                animate-in slide-in-from-right-full
                transition-all duration-300
            `}
        >
            <div className="flex-shrink-0">{style.icon}</div>
            <p className="flex-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                {message}
            </p>
            <button
                onClick={() => onClose(id)}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                aria-label="Close"
            >
                <X className="h-5 w-5" />
            </button>
        </div>
    )
}

export function ToastContainer({ children }: { children: React.ReactNode }) {
    return (
        <div className="pointer-events-none fixed right-0 top-0 z-50 flex flex-col items-end p-6 space-y-4">
            {children}
        </div>
    )
}
