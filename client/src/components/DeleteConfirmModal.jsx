import { AlertTriangle, X } from 'lucide-react';

export default function DeleteConfirmModal({ isOpen, onClose, onConfirm, subjectName, deleting }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div
        className="glass-card w-full max-w-md rounded-2xl border border-red-500/20 shadow-2xl overflow-hidden text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-red-400">
            <AlertTriangle size={20} />
            <h3 className="font-heading text-lg font-bold">Confirm Deletion</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-gray-300 text-sm leading-relaxed">
            Are you sure you want to delete the subject{' '}
            <strong className="text-white font-semibold">{subjectName}</strong>? This action cannot be undone.
          </p>

          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              disabled={deleting}
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white transition-all"
            >
              Cancel
            </button>

            <button
              onClick={onConfirm}
              disabled={deleting}
              className="px-5 py-2 rounded-xl text-sm font-semibold bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/30 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {deleting && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              <span>Delete Subject</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
