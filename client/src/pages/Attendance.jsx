import { useState, useEffect, useCallback } from 'react';
import {
  UserCheck,
  Calendar,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Filter,
  TrendingUp,
} from 'lucide-react';
import {
  getTodayAttendance,
  markAttendance,
  updateAttendance,
} from '../api/attendanceApi';
import AttendanceCard from '../components/attendance/AttendanceCard';
import Button from '../components/common/Button';
import { Card } from '../components/common/Card';
import Skeleton from '../components/common/Skeleton';
import { useToast } from '../hooks/useToast';

export default function Attendance() {
  const { showToast } = useToast();
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  // Today's Date String
  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  // Fetch today's attendance schedule
  const fetchTodayLectures = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getTodayAttendance();
      setLectures(response.data || []);
    } catch (err) {
      console.error('Failed to fetch today attendance:', err);
      const msg =
        err.response?.data?.message ||
        'Failed to connect to attendance server. Please verify database backend.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTodayLectures();
  }, [fetchTodayLectures]);

  // Mark / Update Attendance Handler with Optimistic UI updates
  const handleMarkAttendance = async (lectureId, newStatus) => {
    // Save previous state for rollback on API failure
    const previousLectures = [...lectures];
    const targetIndex = lectures.findIndex((l) => l.lecture_id === lectureId);
    if (targetIndex === -1) return;

    const targetLecture = lectures[targetIndex];
    // If clicking same status again, skip
    if (targetLecture.attendance_status === newStatus) return;

    // 1. Optimistic local update
    const updatedLectures = [...lectures];
    updatedLectures[targetIndex] = {
      ...targetLecture,
      attendance_status: newStatus,
    };
    setLectures(updatedLectures);
    setUpdatingId(lectureId);

    try {
      let resultData;
      // If record ID already exists, update. Otherwise mark or upsert.
      if (targetLecture.id) {
        const response = await updateAttendance({
          id: targetLecture.id,
          attendance_status: newStatus,
        });
        resultData = response.data;
      } else {
        try {
          const response = await markAttendance({
            lecture_id: lectureId,
            attendance_status: newStatus,
          });
          resultData = response.data;
        } catch (markErr) {
          // If 409 conflict, fallback to update with lecture_id
          if (markErr.response?.status === 409) {
            const response = await updateAttendance({
              lecture_id: lectureId,
              attendance_status: newStatus,
            });
            resultData = response.data;
          } else {
            throw markErr;
          }
        }
      }

      // Update state with server response data (includes updated_at & record ID)
      if (resultData) {
        setLectures((prev) =>
          prev.map((l) =>
            l.lecture_id === lectureId
              ? {
                  ...l,
                  id: resultData.id || l.id,
                  attendance_status: resultData.attendance_status || newStatus,
                }
              : l
          )
        );
      }

      const statusLabel = newStatus === 'present' ? 'Present' : 'Absent';
      showToast(
        `Marked ${statusLabel} for ${targetLecture.subject_name}`,
        newStatus === 'present' ? 'success' : 'info'
      );
    } catch (err) {
      console.error('Failed to update attendance:', err);
      // Rollback optimistic state change
      setLectures(previousLectures);
      const errMsg =
        err.response?.data?.message || 'Failed to update attendance. Please try again.';
      showToast(errMsg, 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  // Metrics Calculations
  const totalLectures = lectures.length;
  const presentCount = lectures.filter((l) => l.attendance_status === 'present').length;
  const absentCount = lectures.filter((l) => l.attendance_status === 'absent').length;
  const pendingCount = lectures.filter((l) => l.attendance_status === 'pending').length;

  const markedCount = presentCount + absentCount;
  const attendanceRate = markedCount > 0 ? Math.round((presentCount / markedCount) * 100) : 0;

  // Filtering
  const filteredLectures = lectures.filter((lecture) => {
    if (statusFilter === 'all') return true;
    return lecture.attendance_status === statusFilter;
  });

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <UserCheck className="text-emerald-400" size={28} />
              <span>{"Today's Attendance"}</span>
            </h1>
          </div>

          <p className="text-gray-400 text-xs sm:text-sm mt-1 flex items-center gap-2">
            <Calendar size={14} className="text-indigo-400 shrink-0" />
            <span className="font-medium text-gray-300">{todayFormatted}</span>
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="secondary"
            size="md"
            onClick={fetchTodayLectures}
            isLoading={loading}
            leftIcon={<RefreshCw size={16} />}
            className="hover:scale-105"
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Metrics Row - Touch Optimized */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card hover={false} className="p-3.5 sm:p-4 flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
            <Calendar size={20} className="sm:w-6 sm:h-6" />
          </div>
          <div>
            <span className="text-[10px] sm:text-xs uppercase font-semibold text-gray-400 tracking-wider">
              Total Lectures
            </span>
            <div className="text-xl sm:text-2xl font-bold text-white font-heading">
              {totalLectures}
            </div>
          </div>
        </Card>

        <Card hover={false} className="p-3.5 sm:p-4 flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 size={20} className="sm:w-6 sm:h-6" />
          </div>
          <div>
            <span className="text-[10px] sm:text-xs uppercase font-semibold text-gray-400 tracking-wider">
              Present
            </span>
            <div className="text-xl sm:text-2xl font-bold text-emerald-400 font-heading">
              {presentCount}
            </div>
          </div>
        </Card>

        <Card hover={false} className="p-3.5 sm:p-4 flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
            <XCircle size={20} className="sm:w-6 sm:h-6" />
          </div>
          <div>
            <span className="text-[10px] sm:text-xs uppercase font-semibold text-gray-400 tracking-wider">
              Absent
            </span>
            <div className="text-xl sm:text-2xl font-bold text-rose-400 font-heading">
              {absentCount}
            </div>
          </div>
        </Card>

        <Card hover={false} className="p-3.5 sm:p-4 flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <Clock size={20} className="sm:w-6 sm:h-6" />
          </div>
          <div>
            <span className="text-[10px] sm:text-xs uppercase font-semibold text-gray-400 tracking-wider">
              Pending
            </span>
            <div className="text-xl sm:text-2xl font-bold text-amber-400 font-heading">
              {pendingCount}
            </div>
          </div>
        </Card>
      </div>

      {/* Progress Bar / Attendance Rate */}
      {totalLectures > 0 && (
        <Card hover={false} className="p-4 bg-white/[0.02]">
          <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-gray-300 mb-2">
            <span className="flex items-center gap-1.5">
              <TrendingUp size={16} className="text-emerald-400" />
              {"Today's Attendance Rate"}
            </span>
            <span className="font-bold text-white text-base">{attendanceRate}%</span>
          </div>

          <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden flex">
            {markedCount > 0 ? (
              <>
                <div
                  className="h-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${(presentCount / totalLectures) * 100}%` }}
                />
                <div
                  className="h-full bg-rose-500 transition-all duration-500"
                  style={{ width: `${(absentCount / totalLectures) * 100}%` }}
                />
              </>
            ) : null}
          </div>
        </Card>
      )}

      {/* Quick Status Filter Pills - One Handed Mobile UX */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-xs text-gray-400 font-semibold flex items-center gap-1 shrink-0 mr-1">
          <Filter size={14} /> Filter:
        </span>

        {[
          { key: 'all', label: `All (${totalLectures})` },
          { key: 'pending', label: `Pending (${pendingCount})` },
          { key: 'present', label: `Present (${presentCount})` },
          { key: 'absent', label: `Absent (${absentCount})` },
        ].map((item) => (
          <button
            key={item.key}
            onClick={() => setStatusFilter(item.key)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
              statusFilter === item.key
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/5'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Error Alert */}
      {error && (
        <Card
          hover={false}
          className="p-4 border-rose-500/30 bg-rose-500/10 text-rose-300 text-sm flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
          <Button variant="danger" size="sm" onClick={fetchTodayLectures}>
            Retry
          </Button>
        </Card>
      )}

      {/* Loading Skeletons */}
      {loading && lectures.length === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {[1, 2].map((n) => (
            <Card key={n} hover={false} className="p-6 space-y-4">
              <Skeleton height={24} width="60%" />
              <Skeleton height={16} width="40%" />
              <Skeleton height={20} width="80%" className="mt-2" />
              <div className="grid grid-cols-2 gap-3 pt-4">
                <Skeleton height={48} className="rounded-2xl" />
                <Skeleton height={48} className="rounded-2xl" />
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Lectures List */}
      {!loading && filteredLectures.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {filteredLectures.map((lecture) => (
            <AttendanceCard
              key={lecture.lecture_id}
              lecture={lecture}
              onMarkAttendance={handleMarkAttendance}
              isUpdating={updatingId === lecture.lecture_id}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredLectures.length === 0 && !error && (
        <Card hover={false} className="p-10 sm:p-14 text-center max-w-lg mx-auto border-white/10">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mx-auto flex items-center justify-center mb-4">
            <Clock size={32} />
          </div>

          <h3 className="font-heading text-xl font-bold text-white mb-2">
            {statusFilter === 'all'
              ? 'No Lectures Scheduled Today'
              : `No ${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)} Lectures`}
          </h3>

          <p className="text-gray-400 text-sm mb-6 leading-relaxed">
            {statusFilter === 'all'
              ? 'There are no lectures scheduled in your database timetable for today.'
              : `None of today's scheduled lectures match the selected "${statusFilter}" filter.`}
          </p>

          <Button
            variant="secondary"
            size="md"
            onClick={fetchTodayLectures}
            leftIcon={<RefreshCw size={16} />}
          >
            Check Schedule Again
          </Button>
        </Card>
      )}
    </div>
  );
}
