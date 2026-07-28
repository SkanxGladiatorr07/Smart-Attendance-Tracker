import { Trash2, AlertTriangle } from 'lucide-react';
import Button from '../common/Button';

export default function DeleteAttendanceModal({
  isOpen,
  onClose,
  onConfirm,
  record,
  deleting = false,
}) {
  if (!isOpen || !record) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div
        className="glass-card w-full max-w-md rounded-3xl border border-white/10 p-6 sm:p-8 space-y-6 shadow-2xl animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 mx-auto flex items-center justify-center">
          <AlertTriangle size={28} />
        </div>

        <div className="text-center space-y-2">
          <h2 className="font-heading text-xl font-bold text-white">
            Delete Attendance Log?
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            Are you sure you want to remove the attendance log for{' '}
            <strong className="text-white">
              {record.subject_name || 'this lecture'}
            </strong>{' '}
            on <span className="text-indigo-300">{record.lecture_date}</span>?
          </p>
          <p className="text-xs text-rose-400 font-medium pt-1">
            This action cannot be undone.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <Button
            variant="ghost"
            size="md"
            onClick={onClose}
            isDisabled={deleting}
          >
            Cancel
          </Button>

          <Button
            variant="danger"
            size="md"
            onClick={onConfirm}
            isLoading={deleting}
            leftIcon={<Trash2 size={16} />}
          >
            Delete Record
          </Button>
        </div>
      </div>
    </div>
  );
}
