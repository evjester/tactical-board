import { useEffect, useState } from 'react'

export interface ToastMessage {
  id: string
  type: 'success' | 'error' | 'info' | 'undo' | 'redo'
  message: string
  duration?: number
}

interface ToastProps {
  toast: ToastMessage
  onDismiss: (id: string) => void
}

const icons = {
  success: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  error: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  ),
  info: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  ),
  undo: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <path d="M3 7v6h6" />
      <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
    </svg>
  ),
  redo: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <path d="M21 7v6h-6" />
      <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7" />
    </svg>
  ),
}

const colors = {
  success: 'bg-green-500 text-white',
  error: 'bg-red-500 text-white',
  info: 'bg-blue-500 text-white',
  undo: 'bg-amber-500 text-white',
  redo: 'bg-emerald-500 text-white',
}

function Toast({ toast, onDismiss }: ToastProps) {
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    const duration = toast.duration || 2000
    const exitTimer = setTimeout(() => setIsExiting(true), duration - 300)
    const removeTimer = setTimeout(() => onDismiss(toast.id), duration)

    return () => {
      clearTimeout(exitTimer)
      clearTimeout(removeTimer)
    }
  }, [toast, onDismiss])

  return (
    <div
      className={`
        flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg
        transform transition-all duration-300 ease-out
        ${colors[toast.type]}
        ${isExiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}
      `}
    >
      <span className="flex-shrink-0">{icons[toast.type]}</span>
      <span className="text-sm font-medium">{toast.message}</span>
    </div>
  )
}

interface ToastContainerProps {
  toasts: ToastMessage[]
  onDismiss: (id: string) => void
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  )
}

// Hook for managing toasts
import { useCallback } from 'react'

let toastId = 0

export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const addToast = useCallback((type: ToastMessage['type'], message: string, duration?: number) => {
    const id = `toast-${++toastId}`
    setToasts((prev) => [...prev, { id, type, message, duration }])
  }, [])

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const showUndo = useCallback(() => {
    addToast('undo', 'Action undone', 1500)
  }, [addToast])

  const showRedo = useCallback(() => {
    addToast('redo', 'Action redone', 1500)
  }, [addToast])

  const showSuccess = useCallback((message: string) => {
    addToast('success', message)
  }, [addToast])

  const showError = useCallback((message: string) => {
    addToast('error', message)
  }, [addToast])

  const showInfo = useCallback((message: string) => {
    addToast('info', message)
  }, [addToast])

  return {
    toasts,
    dismissToast,
    showUndo,
    showRedo,
    showSuccess,
    showError,
    showInfo,
  }
}
