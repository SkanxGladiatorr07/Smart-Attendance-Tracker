import { useState, useEffect } from 'react';
import { X, Save, Plus } from 'lucide-react';

const LECTURE_TYPES = ['Lecture', 'Lab', 'Practical', 'Tutorial', 'Seminar'];
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function EditItemModal({
  isOpen,
  onClose,
  onSave,
  modalConfig // { type: 'holiday' | 'workingSaturday' | 'examPeriod' | 'lecture', isEditing: boolean, initialData: Object, targetDay?: string }
}) {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (modalConfig?.initialData) {
      setFormData({ ...modalConfig.initialData });
    } else {
      // Default initial states based on type
      if (modalConfig?.type === 'holiday') {
        setFormData({ name: '', date: new Date().toISOString().split('T')[0] });
      } else if (modalConfig?.type === 'workingSaturday') {
        setFormData({ description: 'Working Saturday (Follows Monday Timetable)', date: new Date().toISOString().split('T')[0] });
      } else if (modalConfig?.type === 'examPeriod') {
        const today = new Date().toISOString().split('T')[0];
        setFormData({ title: 'Mid-Semester Examinations', startDate: today, endDate: today });
      } else if (modalConfig?.type === 'lecture') {
        setFormData({
          subject: '',
          startTime: '09:00',
          endTime: '10:00',
          type: 'Lecture',
          day: modalConfig.targetDay || 'Monday'
        });
      }
    }
  }, [modalConfig]);

  if (!isOpen || !modalConfig) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData, modalConfig);
    onClose();
  };

  const getTypeTitle = () => {
    const isEdit = modalConfig.isEditing;
    switch (modalConfig.type) {
      case 'holiday':
        return isEdit ? 'Edit Holiday' : 'Add New Holiday';
      case 'workingSaturday':
        return isEdit ? 'Edit Working Saturday' : 'Add Working Saturday';
      case 'examPeriod':
        return isEdit ? 'Edit Exam Period' : 'Add Exam Period';
      case 'lecture':
        return isEdit ? 'Edit Lecture' : `Add Lecture for ${modalConfig.targetDay || formData.day || 'Monday'}`;
      default:
        return 'Edit Item';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div 
        className="bg-[#131827] border border-white/15 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0f1422]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              {modalConfig.isEditing ? <Save size={18} /> : <Plus size={18} />}
            </div>
            <h3 className="text-base font-semibold text-white">{getTypeTitle()}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* HOLIDAY FORM */}
          {modalConfig.type === 'holiday' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                  Holiday Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleChange}
                  placeholder="e.g. Independence Day"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date || ''}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
            </>
          )}

          {/* WORKING SATURDAY FORM */}
          {modalConfig.type === 'workingSaturday' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date || ''}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                  Schedule Description
                </label>
                <input
                  type="text"
                  name="description"
                  value={formData.description || ''}
                  onChange={handleChange}
                  placeholder="e.g. Follows Monday Timetable"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
            </>
          )}

          {/* EXAM PERIOD FORM */}
          {modalConfig.type === 'examPeriod' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                  Exam Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title || ''}
                  onChange={handleChange}
                  placeholder="e.g. Mid-Semester Examinations"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate || ''}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                    End Date
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate || ''}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>
            </>
          )}

          {/* LECTURE FORM */}
          {modalConfig.type === 'lecture' && (
            <>
              {!modalConfig.targetDay && (
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                    Day of Week
                  </label>
                  <select
                    name="day"
                    value={formData.day || 'Monday'}
                    onChange={handleChange}
                    className="w-full bg-[#1e2538] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    {DAYS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                  Subject Name
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject || ''}
                  onChange={handleChange}
                  placeholder="e.g. Data Structures & Algorithms"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                    Start Time
                  </label>
                  <input
                    type="time"
                    name="startTime"
                    value={formData.startTime || '09:00'}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                    End Time
                  </label>
                  <input
                    type="time"
                    name="endTime"
                    value={formData.endTime || '10:00'}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                  Lecture Type
                </label>
                <select
                  name="type"
                  value={formData.type || 'Lecture'}
                  onChange={handleChange}
                  className="w-full bg-[#1e2538] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  {LECTURE_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* Modal Footer Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-white/10 text-gray-300 text-sm font-medium hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors flex items-center gap-1.5 shadow-lg shadow-indigo-600/30"
            >
              <Save size={16} />
              <span>{modalConfig.isEditing ? 'Save Changes' : 'Add Item'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
