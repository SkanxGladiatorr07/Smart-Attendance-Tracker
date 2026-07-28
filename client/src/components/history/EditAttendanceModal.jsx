import { useState, useEffect } from 'react';
import { X, Check, Clock, User, Calendar, AlertCircle } from 'lucide-react';
import Button from '../common/Button';

export default function EditAttendanceModal({
  isOpen,
  onClose,
  onSubmit,
  record,
  submitting = false,
  error = null,
}) {
  const [selectedStatus, setSelectedStatus] = useState('present');

  useEffect(() => {
    if (record) {
      setSelectedStatus(record.attendance_status || 'present');
    }
  }, [record]);

  if (!isOpen || !record) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(selectedStatus);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div
        className="glass-card w-full max-w-md rounded-3xl border border-white/10 p-6 sm:p-8 space-y-6 shadow-2xl animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <h2 className="font-heading text-xl font-bold text-white">
              Edit Attendance Log
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Update attendance status for this lecture entry
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Lecture Details Context Box */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: record.color || '#6366f1' }}
            />
            <span className="font-heading font-bold text-white text-base">
              {record.subject_name || 'Untitled Subject'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-300">
            {record.faculty_name && (
              <span className="flex items-center gap-1">
                <User size={13} className="text-gray-400" />
                {record.faculty_name}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Calendar size={13} className="text-indigo-400" />
              {record.lecture_date}
            </span>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase text-gray-400 tracking-wider block">
              Select Attendance Status
            </label>

            <div className="grid grid-cols-3 gap-2.5">
              {/* Present Option */}
              <button
                type="button"
                onClick={() => setSelectedStatus('present')}
                className={`p-3 rounded-2xl border flex flex-col items-center gap-2 transition-all duration-200 ${
                  selectedStatus === 'present'
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 ring-2 ring-emerald-500/30'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    selectedStatus === 'present'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-white/5'
                  }`}
                >
                  <Check size={18} />
                </div>
                <span className="text-xs font-bold">Present</span>
              </button>

              {/* Absent Option */}
              <button
                type="button"
                onClick={() => setSelectedStatus('absent')}
                className={`p-3 rounded-2xl border flex flex-col items-center gap-2 transition-all duration-200 ${
                  selectedStatus === 'absent'
                    ? 'bg-rose-500/20 border-rose-500 text-rose-400 ring-2 ring-rose-500/30'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    selectedStatus === 'absent'
                      ? 'bg-rose-500 text-white'
                      : 'bg-white/5'
                  }`}
                >
                  <X size={18} />
                </div>
                <span className="text-xs font-bold">Absent</span>
              </button>

              {/* Pending Option */}
              <button
                type="button"
                onClick={() => setSelectedStatus('pending')}
                className={`p-3 rounded-2xl border flex flex-col items-center gap-2 transition-all duration-200 ${
                  selectedStatus === 'pending'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-400 ring-2 ring-amber-500/30'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    selectedStatus === 'pending'
                      ? 'bg-amber-500 text-white'
                      : 'bg-white/5'
                  }`}
                >
                  <Clock size={18} />
                </div>
                <span className="text-xs font-bold">Pending</span>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="md"
              onClick={onClose}
              isDisabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={submitting}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
