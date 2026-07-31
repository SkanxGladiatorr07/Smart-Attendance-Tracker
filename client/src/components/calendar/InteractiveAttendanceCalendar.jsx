import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  CheckCircle2,
  XCircle,
  Clock,
  BookOpen,
  Info,
  Sparkles,
  RefreshCw,
  User,
  ShieldCheck,
  AlertTriangle,
  Flame,
} from 'lucide-react';
import { Card } from '../common/Card';
import Button from '../common/Button';
import Skeleton from '../common/Skeleton';
import { getCalendarMonth } from '../../api/attendanceApi';
import { useAttendance } from '../../context/AttendanceContext';
import { useToast } from '../../hooks/useToast';

/**
 * Format Date Object to YYYY-MM-DD
 */
function toIsoDate(year, month, day) {
  const y = year;
  const m = String(month).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export default function InteractiveAttendanceCalendar() {
  const { showToast } = useToast();
  const { markLectureStatus, updatingLectureId } = useAttendance();

  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1); // 1-indexed (1-12)
  const [selectedDateStr, setSelectedDateStr] = useState(
    toIsoDate(today.getFullYear(), today.getMonth() + 1, today.getDate())
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [monthData, setMonthData] = useState(null);

  // Fetch month calendar data from backend
  const fetchMonthData = useCallback(async (year, month) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getCalendarMonth(year, month);
      setMonthData(res.data || null);
    } catch (err) {
      console.error('Failed to fetch calendar month data:', err);
      setError(
        err.response?.data?.message ||
          'Failed to load calendar data for the selected month.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMonthData(currentYear, currentMonth);
  }, [currentYear, currentMonth, fetchMonthData]);

  // Handle Month Navigation
  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleToday = () => {
    const t = new Date();
    setCurrentYear(t.getFullYear());
    setCurrentMonth(t.getMonth() + 1);
    setSelectedDateStr(toIsoDate(t.getFullYear(), t.getMonth() + 1, t.getDate()));
  };

  // Month Display Name (e.g., "February 2026")
  const monthName = useMemo(() => {
    const date = new Date(currentYear, currentMonth - 1, 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }, [currentYear, currentMonth]);

  // Construct Calendar Grid Days
  const calendarGrid = useMemo(() => {
    const firstDayOfWeek = new Date(currentYear, currentMonth - 1, 1).getDay(); // 0 = Sun
    const totalDaysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth - 1, 0).getDate();

    // Organize lectures by date map
    const lecturesByDate = new Map();
    (monthData?.lectures || []).forEach((lec) => {
      const dateKey = lec.lecture_date;
      if (!lecturesByDate.has(dateKey)) {
        lecturesByDate.set(dateKey, []);
      }
      lecturesByDate.get(dateKey).push(lec);
    });

    // Organize events by date
    const eventsByDate = new Map();
    (monthData?.events || []).forEach((evt) => {
      const start = new Date(evt.start_date);
      const end = new Date(evt.end_date);
      const curr = new Date(start);
      while (curr <= end) {
        const iso = curr.toISOString().split('T')[0];
        eventsByDate.set(iso, evt);
        curr.setDate(curr.getDate() + 1);
      }
    });

    const grid = [];

    // Previous Month Padding Days
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const pDay = daysInPrevMonth - i;
      const pMonth = currentMonth === 1 ? 12 : currentMonth - 1;
      const pYear = currentMonth === 1 ? currentYear - 1 : currentYear;
      grid.push({
        day: pDay,
        dateStr: toIsoDate(pYear, pMonth, pDay),
        isCurrentMonth: false,
      });
    }

    // Current Month Days
    for (let d = 1; d <= totalDaysInMonth; d++) {
      const dateStr = toIsoDate(currentYear, currentMonth, d);
      const dayObj = new Date(currentYear, currentMonth - 1, d);
      const dayOfWeek = dayObj.getDay(); // 0 = Sun, 6 = Sat

      const dayLectures = lecturesByDate.get(dateStr) || [];
      const event = eventsByDate.get(dateStr);

      const isHoliday = event?.event_type === 'holiday';
      const isExam = event?.event_type === 'exam_period';
      const isWorkingSat = event?.event_type === 'working_saturday';

      let isWeekendOrHoliday = false;
      let holidayReason = null;

      if (isHoliday) {
        isWeekendOrHoliday = true;
        holidayReason = event.event_name;
      } else if (isExam) {
        isWeekendOrHoliday = true;
        holidayReason = event.event_name;
      } else if (dayOfWeek === 0) { // Sunday
        isWeekendOrHoliday = true;
        holidayReason = 'Sunday (Weekend)';
      } else if (dayOfWeek === 6 && !isWorkingSat) { // Non-working Saturday
        isWeekendOrHoliday = true;
        holidayReason = 'Non-working Saturday';
      }

      // Counts
      const totalLecs = dayLectures.length;
      const presentCount = dayLectures.filter((l) => l.attendance_status === 'present').length;
      const absentCount = dayLectures.filter((l) => l.attendance_status === 'absent').length;
      const pendingCount = dayLectures.filter((l) => l.attendance_status === 'pending').length;

      // Color Coding Determination:
      // Green = All conducted lectures attended (presentCount > 0 && absentCount === 0)
      // Red = At least one absence (absentCount >= 1)
      // Blue = Holiday including weekends (isWeekendOrHoliday)
      let colorCategory = 'neutral'; // 'green' | 'red' | 'blue' | 'neutral' | 'pending'

      if (isWeekendOrHoliday) {
        colorCategory = 'blue';
      } else if (absentCount >= 1) {
        colorCategory = 'red';
      } else if (totalLecs > 0 && presentCount === totalLecs) {
        colorCategory = 'green';
      } else if (totalLecs > 0 && presentCount > 0 && absentCount === 0) {
        colorCategory = 'green';
      } else if (totalLecs > 0 && pendingCount === totalLecs) {
        colorCategory = 'pending';
      }

      grid.push({
        day: d,
        dateStr,
        isCurrentMonth: true,
        dayOfWeek,
        isToday: dateStr === toIsoDate(today.getFullYear(), today.getMonth() + 1, today.getDate()),
        isWeekendOrHoliday,
        holidayReason,
        colorCategory,
        totalLecs,
        presentCount,
        absentCount,
        pendingCount,
        lectures: dayLectures,
      });
    }

    // Next Month Padding Days to complete grid row
    const totalCells = grid.length;
    const remainingCells = (7 - (totalCells % 7)) % 7;
    for (let n = 1; n <= remainingCells; n++) {
      const nMonth = currentMonth === 12 ? 1 : currentMonth + 1;
      const nYear = currentMonth === 12 ? currentYear + 1 : currentYear;
      grid.push({
        day: n,
        dateStr: toIsoDate(nYear, nMonth, n),
        isCurrentMonth: false,
      });
    }

    return grid;
  }, [currentYear, currentMonth, monthData, today]);

  // Currently Selected Day Data
  const selectedDayInfo = useMemo(() => {
    if (!selectedDateStr) return null;
    return calendarGrid.find((cell) => cell.dateStr === selectedDateStr) || null;
  }, [calendarGrid, selectedDateStr]);

  // Handle Attendance Status Change from Modal/Drawer
  const handleStatusChange = async (lectureId, newStatus, subjectId) => {
    try {
      await markLectureStatus(lectureId, newStatus, subjectId);

      // Locally update monthData lectures state for instant UI update
      setMonthData((prev) => {
        if (!prev) return prev;
        const updatedLectures = (prev.lectures || []).map((l) =>
          l.lecture_id === lectureId ? { ...l, attendance_status: newStatus } : l
        );
        return { ...prev, lectures: updatedLectures };
      });
    } catch (err) {
      console.error('Failed to change status in calendar:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Navigation */}
      <Card hover={false} className="p-5 border-indigo-500/20 bg-gradient-to-br from-[#0b0f19] via-[#111827] to-[#1e1b4b]/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
              <CalendarIcon size={14} className="text-indigo-400" />
              <span>Interactive Attendance Calendar</span>
            </div>
            <h2 className="font-heading text-2xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <span>{monthName}</span>
            </h2>
            <p className="text-xs text-gray-300">
              Color-coded monthly attendance breakdown with direct interactive status editing.
            </p>
          </div>

          {/* Month Controls & Legend */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleToday}
              leftIcon={<Sparkles size={14} className="text-indigo-400" />}
            >
              Today
            </Button>

            <div className="flex items-center rounded-xl bg-white/5 border border-white/10 p-1">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                title="Previous Month"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="px-3 text-xs font-bold text-gray-200">{monthName}</span>
              <button
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                title="Next Month"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => fetchMonthData(currentYear, currentMonth)}
              isLoading={loading}
              title="Refresh Month Data"
            >
              <RefreshCw size={15} />
            </Button>
          </div>
        </div>

        {/* Color Legend Bar */}
        <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap items-center gap-4 text-xs font-semibold">
          <span className="text-gray-400">Legend:</span>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span>Green = All Attended</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
            <span>Red = 1+ Absent</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-300">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
            <span>Blue = Holiday / Weekend</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span>Yellow = Pending</span>
          </div>
        </div>
      </Card>

      {/* Main Grid & Selected Day Panel Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid (Takes 2 Columns on Large Screens) */}
        <div className="lg:col-span-2 space-y-2">
          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 gap-1 text-center font-heading text-xs font-bold text-gray-400 uppercase tracking-wider pb-1">
            <div className="py-2 text-rose-400">Sun</div>
            <div className="py-2">Mon</div>
            <div className="py-2">Tue</div>
            <div className="py-2">Wed</div>
            <div className="py-2">Thu</div>
            <div className="py-2">Fri</div>
            <div className="py-2 text-indigo-400">Sat</div>
          </div>

          {/* Skeleton Loading State */}
          {loading && !monthData && (
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {Array.from({ length: 35 }).map((_, i) => (
                <Skeleton key={i} height={64} className="rounded-2xl" />
              ))}
            </div>
          )}

          {/* Render Calendar Grid Cells */}
          {(!loading || monthData) && (
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {calendarGrid.map((cell, idx) => {
                if (!cell.isCurrentMonth) {
                  return (
                    <div
                      key={idx}
                      className="h-16 sm:h-20 p-2 rounded-2xl bg-white/[0.02] border border-white/[0.03] text-gray-600 opacity-40 select-none flex flex-col justify-between"
                    >
                      <span className="text-xs font-bold">{cell.day}</span>
                    </div>
                  );
                }

                const isSelected = cell.dateStr === selectedDateStr;

                // Color themes
                let themeClasses = 'bg-white/5 border-white/10 hover:border-white/20 text-gray-200';

                if (cell.colorCategory === 'blue') {
                  themeClasses = 'bg-blue-500/15 border-blue-500/30 text-blue-300 hover:bg-blue-500/25';
                } else if (cell.colorCategory === 'red') {
                  themeClasses = 'bg-rose-500/15 border-rose-500/30 text-rose-300 hover:bg-rose-500/25';
                } else if (cell.colorCategory === 'green') {
                  themeClasses = 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25';
                } else if (cell.colorCategory === 'pending') {
                  themeClasses = 'bg-amber-500/15 border-amber-500/30 text-amber-300 hover:bg-amber-500/25';
                }

                return (
                  <button
                    key={cell.dateStr}
                    onClick={() => setSelectedDateStr(cell.dateStr)}
                    className={`h-16 sm:h-20 p-2 rounded-2xl border transition-all text-left flex flex-col justify-between relative overflow-hidden group ${themeClasses} ${
                      isSelected
                        ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-[#0b0f19] scale-[1.02] z-10 shadow-lg'
                        : ''
                    }`}
                  >
                    {/* Top Row: Date Number & Today Indicator */}
                    <div className="flex items-center justify-between w-full">
                      <span
                        className={`text-xs sm:text-sm font-extrabold font-heading ${
                          cell.isToday
                            ? 'w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-md'
                            : ''
                        }`}
                      >
                        {cell.day}
                      </span>

                      {cell.colorCategory === 'green' && (
                        <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                      )}
                      {cell.colorCategory === 'red' && (
                        <XCircle size={13} className="text-rose-400 shrink-0" />
                      )}
                      {cell.colorCategory === 'blue' && (
                        <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
                      )}
                    </div>

                    {/* Bottom Info Badges */}
                    <div className="truncate w-full text-[10px]">
                      {cell.isWeekendOrHoliday ? (
                        <span className="text-blue-300/80 font-medium truncate block">
                          {cell.holidayReason || 'Holiday'}
                        </span>
                      ) : cell.totalLecs > 0 ? (
                        <div className="flex items-center justify-between font-bold">
                          <span>{cell.totalLecs} Lec{cell.totalLecs > 1 ? 's' : ''}</span>
                          <span className="opacity-80">
                            {cell.presentCount}/{cell.totalLecs}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-500 italic">No Lecs</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Date Details Panel (1 Column) */}
        <div className="space-y-4">
          <Card hover={false} className="p-5 border-indigo-500/30 bg-[#0d121f] space-y-4">
            {/* Header */}
            <div className="pb-3 border-b border-white/10 flex items-center justify-between">
              <div>
                <div className="text-[11px] uppercase font-bold tracking-wider text-indigo-400">
                  Selected Date
                </div>
                <h3 className="font-heading text-lg font-bold text-white">
                  {selectedDayInfo
                    ? new Date(selectedDateStr + 'T00:00:00').toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : selectedDateStr}
                </h3>
              </div>

              {selectedDayInfo?.colorCategory && (
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${
                    selectedDayInfo.colorCategory === 'green'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : selectedDayInfo.colorCategory === 'red'
                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                      : selectedDayInfo.colorCategory === 'blue'
                      ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                      : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                  }`}
                >
                  {selectedDayInfo.colorCategory === 'green'
                    ? 'All Attended'
                    : selectedDayInfo.colorCategory === 'red'
                    ? 'Absence Marked'
                    : selectedDayInfo.colorCategory === 'blue'
                    ? 'Holiday / Weekend'
                    : 'Pending'}
                </span>
              )}
            </div>

            {/* Holiday / Weekend Banner */}
            {selectedDayInfo?.isWeekendOrHoliday && (
              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs flex items-center gap-2.5">
                <Info size={18} className="text-blue-400 shrink-0" />
                <div>
                  <div className="font-bold">Non-Working Day</div>
                  <div className="text-[11px] text-blue-300/80">{selectedDayInfo.holidayReason}</div>
                </div>
              </div>
            )}

            {/* Lectures List for Selected Day */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between text-xs font-bold text-gray-300">
                <span className="flex items-center gap-1.5">
                  <BookOpen size={15} className="text-indigo-400" />
                  <span>Lectures Conducted ({selectedDayInfo?.lectures?.length || 0})</span>
                </span>
              </div>

              {selectedDayInfo?.lectures?.length === 0 ? (
                <div className="p-6 text-center rounded-2xl bg-white/5 border border-white/5 text-gray-400 text-xs space-y-1">
                  <p className="font-semibold text-gray-300">No lectures scheduled for this date.</p>
                  <p className="text-[11px] text-gray-500">Enjoy your free time!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {(selectedDayInfo?.lectures || []).map((lec) => {
                    const isUpdating = updatingLectureId === lec.lecture_id;
                    const status = lec.attendance_status || 'pending';

                    return (
                      <div
                        key={lec.lecture_id}
                        className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all space-y-3"
                      >
                        {/* Subject Title & Time */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span
                                className="w-2.5 h-2.5 rounded-full shrink-0"
                                style={{ backgroundColor: lec.color || '#6366f1' }}
                              />
                              <span className="font-heading text-sm font-bold text-white truncate">
                                {lec.subject_name}
                              </span>
                            </div>
                            {lec.faculty_name && (
                              <p className="text-[11px] text-gray-400 flex items-center gap-1 pl-4">
                                <User size={12} className="text-gray-500" />
                                <span>{lec.faculty_name}</span>
                              </p>
                            )}
                          </div>

                          <div className="text-right shrink-0 text-[11px] font-semibold text-gray-300 flex items-center gap-1">
                            <Clock size={12} className="text-indigo-400" />
                            <span>
                              {lec.startTimeFormatted || lec.lecture_start} - {lec.endTimeFormatted || lec.lecture_end}
                            </span>
                          </div>
                        </div>

                        {/* Interactive Status Toggle Buttons */}
                        <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-2">
                          <span className="text-[11px] text-gray-400 font-semibold">Status:</span>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleStatusChange(lec.lecture_id, 'present', lec.subject_id)}
                              disabled={isUpdating}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                                status === 'present'
                                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                                  : 'bg-white/5 hover:bg-emerald-500/20 text-gray-400 hover:text-emerald-300 border border-white/10'
                              }`}
                            >
                              <CheckCircle2 size={14} />
                              <span>Present</span>
                            </button>

                            <button
                              onClick={() => handleStatusChange(lec.lecture_id, 'absent', lec.subject_id)}
                              disabled={isUpdating}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                                status === 'absent'
                                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                                  : 'bg-white/5 hover:bg-rose-500/20 text-gray-400 hover:text-rose-300 border border-white/10'
                              }`}
                            >
                              <XCircle size={14} />
                              <span>Absent</span>
                            </button>

                            <button
                              onClick={() => handleStatusChange(lec.lecture_id, 'pending', lec.subject_id)}
                              disabled={isUpdating}
                              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                status === 'pending'
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                  : 'bg-white/5 hover:bg-white/10 text-gray-400 border border-white/10'
                              }`}
                              title="Reset to Pending"
                            >
                              Reset
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
