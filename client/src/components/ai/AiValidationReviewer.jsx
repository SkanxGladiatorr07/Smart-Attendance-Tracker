import { useState, useMemo } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Info,
  Plus,
  Trash2,
} from 'lucide-react';
import { Card } from '../common/Card';
import Button from '../common/Button';
import { validateAiTimetable, validateAiAcademicCalendar, DAYS_OF_WEEK } from '../../utils/aiValidationEngine';

export default function AiValidationReviewer({ type = 'timetable', initialData, onConfirm, onCancel }) {
  const [data, setData] = useState(initialData);
  const [selectedDay, setSelectedDay] = useState('Monday');

  // Run reactive validation on current state
  const validationReport = useMemo(() => {
    if (type === 'timetable') {
      return validateAiTimetable(data);
    } else {
      return validateAiAcademicCalendar(data);
    }
  }, [type, data]);

  // Timetable manual edit handler
  const handleTimetableChange = (day, index, field, value) => {
    setData((prev) => {
      const rawTimetable = prev.timetable || prev;
      const dayList = [...(rawTimetable[day] || [])];
      if (!dayList[index]) return prev;

      dayList[index] = { ...dayList[index], [field]: value };
      const updatedTimetable = { ...rawTimetable, [day]: dayList };

      return prev.timetable ? { ...prev, timetable: updatedTimetable } : updatedTimetable;
    });
  };

  // Timetable slot delete
  const handleDeleteSlot = (day, index) => {
    setData((prev) => {
      const rawTimetable = prev.timetable || prev;
      const dayList = (rawTimetable[day] || []).filter((_, i) => i !== index);
      const updatedTimetable = { ...rawTimetable, [day]: dayList };
      return prev.timetable ? { ...prev, timetable: updatedTimetable } : updatedTimetable;
    });
  };

  // Timetable slot add
  const handleAddSlot = (day) => {
    setData((prev) => {
      const rawTimetable = prev.timetable || prev;
      const dayList = [...(rawTimetable[day] || [])];
      dayList.push({ subject: 'New Subject', startTime: '09:00', endTime: '10:00', type: 'Lecture' });
      const updatedTimetable = { ...rawTimetable, [day]: dayList };
      return prev.timetable ? { ...prev, timetable: updatedTimetable } : updatedTimetable;
    });
  };

  // Calendar manual edit handler
  const handleCalendarChange = (field, value) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const rawTimetableData = data?.timetable || data || {};

  return (
    <Card hover={false} className="p-6 space-y-6 border-indigo-500/30 bg-[#0b0f19] shadow-2xl">
      {/* Header & Overall Validation Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
            <Sparkles size={14} className="text-indigo-400" />
            <span>AI Validation Layer</span>
          </div>
          <h2 className="font-heading text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            AI Data Verification & Manual Correction
          </h2>
          <p className="text-xs text-gray-400">
            Review human-readable validation checks and correct errors before persistence.
          </p>
        </div>

        {/* Validation Status Badge */}
        <div className="shrink-0">
          {validationReport.hasErrors ? (
            <div className="px-3.5 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-extrabold flex items-center gap-2">
              <ShieldAlert size={16} className="text-rose-400" />
              <span>{validationReport.summary.totalErrors} Error(s) Found</span>
            </div>
          ) : validationReport.hasWarnings ? (
            <div className="px-3.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-extrabold flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber-400" />
              <span>Valid ({validationReport.summary.totalWarnings} Warning)</span>
            </div>
          ) : (
            <div className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-extrabold flex items-center gap-2">
              <ShieldCheck size={16} className="text-emerald-400" />
              <span>100% Valid & Verified</span>
            </div>
          )}
        </div>
      </div>

      {/* Validation Issues Breakdown Panel */}
      {validationReport.issues.length > 0 && (
        <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3">
          <span className="text-xs font-bold text-gray-300 flex items-center gap-2">
            <Info size={16} className="text-indigo-400" />
            <span>Human-Readable Validation Diagnostic Log:</span>
          </span>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {validationReport.issues.map((issue) => (
              <div
                key={issue.id}
                className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                  issue.severity === 'ERROR'
                    ? 'bg-rose-950/30 border-rose-500/30 text-rose-200'
                    : 'bg-amber-950/30 border-amber-500/30 text-amber-200'
                }`}
              >
                {issue.severity === 'ERROR' ? (
                  <ShieldAlert size={16} className="text-rose-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />
                )}

                <div className="space-y-0.5 flex-1">
                  <div className="font-bold flex items-center justify-between">
                    <span>{issue.message}</span>
                    <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded bg-black/30">
                      {issue.severity}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Timetable Interactive Editor */}
      {type === 'timetable' && (
        <div className="space-y-4">
          {/* Day Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {DAYS_OF_WEEK.map((day) => {
              const count = (rawTimetableData[day] || []).length;
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => setSelectedDay(day)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                    selectedDay === day
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  <span>{day}</span>
                  <span className="px-1.5 py-0.5 rounded-md bg-black/30 text-[10px]">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Slots Manual Correction List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-gray-300">
              <span>{selectedDay}&apos;s Scheduled Slots:</span>
              <button
                type="button"
                onClick={() => handleAddSlot(selectedDay)}
                className="text-indigo-400 hover:text-indigo-300 text-xs font-bold flex items-center gap-1"
              >
                <Plus size={14} />
                <span>Add Slot</span>
              </button>
            </div>

            {(rawTimetableData[selectedDay] || []).length === 0 ? (
              <div className="p-6 text-center rounded-xl bg-white/5 border border-white/5 text-gray-400 text-xs">
                No lecture slots on {selectedDay}.
              </div>
            ) : (
              (rawTimetableData[selectedDay] || []).map((slot, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-white/5 border border-white/10 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center"
                >
                  {/* Subject Name Input */}
                  <div className="sm:col-span-5 space-y-1">
                    <label className="text-[10px] text-gray-400 font-semibold block">Subject Name:</label>
                    <input
                      type="text"
                      value={slot.subject || ''}
                      onChange={(e) => handleTimetableChange(selectedDay, idx, 'subject', e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-white text-xs font-semibold focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* Start Time Input */}
                  <div className="sm:col-span-3 space-y-1">
                    <label className="text-[10px] text-gray-400 font-semibold block">Start Time (HH:MM):</label>
                    <input
                      type="text"
                      value={slot.startTime || ''}
                      onChange={(e) => handleTimetableChange(selectedDay, idx, 'startTime', e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-white text-xs font-semibold focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* End Time Input */}
                  <div className="sm:col-span-3 space-y-1">
                    <label className="text-[10px] text-gray-400 font-semibold block">End Time (HH:MM):</label>
                    <input
                      type="text"
                      value={slot.endTime || ''}
                      onChange={(e) => handleTimetableChange(selectedDay, idx, 'endTime', e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-white text-xs font-semibold focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* Delete Slot Button */}
                  <div className="sm:col-span-1 flex justify-end pt-3 sm:pt-0">
                    <button
                      type="button"
                      onClick={() => handleDeleteSlot(selectedDay, idx)}
                      className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors"
                      title="Delete Slot"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Calendar Interactive Editor */}
      {type === 'calendar' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-300 block">Semester Start Date (YYYY-MM-DD):</label>
            <input
              type="date"
              value={data.semesterStart || ''}
              onChange={(e) => handleCalendarChange('semesterStart', e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs font-semibold focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-300 block">Semester End Date (YYYY-MM-DD):</label>
            <input
              type="date"
              value={data.semesterEnd || ''}
              onChange={(e) => handleCalendarChange('semesterEnd', e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs font-semibold focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      )}

      {/* Footer Actions */}
      <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
        {onCancel && (
          <Button variant="ghost" size="md" onClick={onCancel}>
            Cancel
          </Button>
        )}

        <Button
          variant="primary"
          size="md"
          disabled={validationReport.hasErrors}
          onClick={() => onConfirm(validationReport.sanitizedData || data)}
          leftIcon={<CheckCircle2 size={16} />}
        >
          Confirm & Save
        </Button>
      </div>
    </Card>
  );
}
