import { useState, useEffect } from 'react';
import { X, Check, AlertCircle, Palette } from 'lucide-react';
import Button from '../common/Button';

const PRESET_COLORS = [
  '#6366f1', // Indigo
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ef4444', // Rose/Red
  '#a855f7', // Purple
  '#06b6d4', // Cyan
  '#ec4899', // Pink
  '#3b82f6', // Blue
];

export default function SubjectModal({ isOpen, onClose, onSubmit, editingSubject, submitting, error }) {
  const [formData, setFormData] = useState({
    subject_name: '',
    faculty_name: '',
    color: '#6366f1',
  });

  useEffect(() => {
    if (editingSubject) {
      setFormData({
        subject_name: editingSubject.subject_name || '',
        faculty_name: editingSubject.faculty_name || '',
        color: editingSubject.color || '#6366f1',
      });
    } else {
      setFormData({
        subject_name: '',
        faculty_name: '',
        color: '#6366f1',
      });
    }
  }, [editingSubject, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div
        className="glass-card w-full max-w-md rounded-2xl border border-white/10 shadow-2xl overflow-hidden text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
          <h2 className="font-heading text-xl font-bold tracking-tight">
            {editingSubject ? 'Edit Subject' : 'Add New Subject'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm flex items-start gap-2.5">
              <AlertCircle size={18} className="shrink-0 text-red-400 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Subject Name Input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
              Subject Name <span className="text-indigo-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Artificial Intelligence"
              value={formData.subject_name}
              onChange={(e) => setFormData({ ...formData, subject_name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm transition-all"
            />
          </div>

          {/* Faculty Input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
              Faculty Name <span className="text-gray-500 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g., Dr. Alan Turing"
              value={formData.faculty_name}
              onChange={(e) => setFormData({ ...formData, faculty_name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm transition-all"
            />
          </div>

          {/* Color Picker */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Palette size={14} className="text-indigo-400" /> Color Tag
              </span>
              <span className="text-gray-400 font-mono text-[11px]">{formData.color}</span>
            </label>

            <div className="flex items-center gap-2 flex-wrap">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setFormData({ ...formData, color: c })}
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110 relative"
                  style={{ backgroundColor: c, boxShadow: `0 0 10px ${c}50` }}
                >
                  {formData.color.toLowerCase() === c.toLowerCase() && (
                    <Check size={14} className="text-white drop-shadow-md" />
                  )}
                </button>
              ))}

              <div className="relative w-8 h-8 rounded-full overflow-hidden border border-white/20 hover:scale-110 transition-transform">
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer bg-transparent border-0"
                  title="Choose custom color"
                />
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
            <Button variant="ghost" size="md" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md" isLoading={submitting}>
              {editingSubject ? 'Save Changes' : 'Create Subject'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
