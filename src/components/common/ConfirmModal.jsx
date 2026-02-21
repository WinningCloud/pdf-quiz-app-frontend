import { AlertTriangle, Loader2 } from 'lucide-react';
import { createPortal } from 'react-dom';

/**
 * ConfirmModal – replaces window.confirm() with styled inline modal.
 *
 * Props:
 *   open        – boolean
 *   title       – heading text
 *   message     – body text
 *   confirmText – button label (default "Confirm")
 *   confirmColor – tailwind bg class (default "bg-teal-500 hover:bg-teal-400")
 *   loading     – show spinner on confirm button
 *   onConfirm   – callback
 *   onCancel    – callback
 */
export default function ConfirmModal({
  open, title, message, confirmText = 'Confirm',
  confirmColor = 'bg-teal-500 hover:bg-teal-400',
  danger = false, loading = false,
  onConfirm, onCancel,
}) {
  if (!open) return null;

  const btnColor = danger
    ? 'bg-rose-500 hover:bg-rose-400'
    : confirmColor;

  return createPortal(
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4" onClick={onCancel}>
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl animate-fade-in" onClick={e => e.stopPropagation()}>
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${danger ? 'bg-rose-500/10' : 'bg-amber-500/10'}`}>
              <AlertTriangle className={`w-5 h-5 ${danger ? 'text-rose-400' : 'text-amber-400'}`} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100">{title}</h3>
              <p className="text-sm text-slate-400 mt-1 leading-relaxed">{message}</p>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={onCancel}
              disabled={loading}
              className="flex-1 py-2.5 border border-slate-700 text-slate-300 rounded-xl hover:bg-slate-800 transition font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className={`flex-1 py-2.5 ${btnColor} text-slate-900 font-bold rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2`}
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
