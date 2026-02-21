import { useState, useCallback } from 'react';

/**
 * useToast – inline toast notification hook (no browser alerts).
 * Returns [toast, showToast, ToastContainer].
 *
 * Usage:
 *   const [toast, showToast, ToastContainer] = useToast();
 *   showToast('success', 'Saved!');
 *   // render <ToastContainer /> at end of JSX
 */
export function useToast(duration = 4000) {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((type, message) => {
    setToast({ type, message, key: Date.now() });
    setTimeout(() => setToast(null), duration);
  }, [duration]);

  return [toast, showToast];
}
