import { CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-react';

const styles = {
  success: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
  error: 'bg-rose-500/10 border-rose-500/30 text-rose-300',
  info: 'bg-sky-500/10 border-sky-500/30 text-sky-300',
  warning: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
};

const icons = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};

export default function Toast({ toast }) {
  if (!toast) return null;
  const Icon = icons[toast.type] || Info;

  return (
    <div className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl border animate-fade-in-up ${styles[toast.type] || styles.info}`}>
      <Icon className="w-5 h-5 shrink-0" />
      <span className="text-sm font-medium">{toast.message}</span>
    </div>
  );
}
