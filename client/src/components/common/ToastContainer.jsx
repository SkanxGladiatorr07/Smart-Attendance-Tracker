import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const TOAST_ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

const TOAST_STYLES = {
  success: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
  error: 'bg-red-500/10 border-red-500/30 text-red-300',
  info: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300',
  warning: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
};

const ICON_COLORS = {
  success: 'text-emerald-400',
  error: 'text-red-400',
  info: 'text-indigo-400',
  warning: 'text-amber-400',
};

export default function ToastContainer({ toasts, onRemove }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none select-none">
      {toasts.map((toast) => {
        const Icon = TOAST_ICONS[toast.type] || TOAST_ICONS.info;
        const style = TOAST_STYLES[toast.type] || TOAST_STYLES.info;
        const iconColor = ICON_COLORS[toast.type] || ICON_COLORS.info;

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-xl border backdrop-blur-xl shadow-2xl flex items-start justify-between gap-3 animate-slideInRight ${style}`}
          >
            <div className="flex items-start gap-2.5">
              <Icon size={18} className={`shrink-0 mt-0.5 ${iconColor}`} />
              <span className="text-xs font-semibold leading-relaxed">{toast.message}</span>
            </div>

            <button
              onClick={() => onRemove(toast.id)}
              className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors shrink-0"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
