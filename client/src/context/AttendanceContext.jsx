import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { getLiveStats } from '../api/statsApi';
import { getTodaySchedule } from '../api/scheduleApi';
import { markAttendance, updateAttendance } from '../api/attendanceApi';
import {
  recalculateSubjectStatsOptimistic,
  recalculateOverallStatsOptimistic,
  generateLectureRecommendation,
} from '../utils/calcUtils';
import { pwaNotificationService } from '../services/pwaNotificationService';
import { useToast } from '../hooks/useToast';

const AttendanceContext = createContext(null);

export function AttendanceProvider({ children }) {
  const { showToast } = useToast();

  const [subjectStats, setSubjectStats] = useState([]);
  const [overallStats, setOverallStats] = useState(null);
  const [semesterProgress, setSemesterProgress] = useState(null);
  const [todaySchedule, setTodaySchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingLectureId, setUpdatingLectureId] = useState(null);
  const [lastAction, setLastAction] = useState(null);

  /**
   * Fetch all stats and daily schedule from server
   */
  const refreshAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [liveRes, scheduleRes] = await Promise.all([
        getLiveStats(),
        getTodaySchedule()
      ]);

      if (liveRes && liveRes.data) {
        setSubjectStats(liveRes.data.subjects || []);
        setOverallStats(liveRes.data.overall || null);
        if (liveRes.data.semesterProgress) {
          setSemesterProgress(liveRes.data.semesterProgress);
        }
      }

      if (scheduleRes && scheduleRes.data) {
        setTodaySchedule(scheduleRes.data || null);
        // Check and trigger automated morning/evening PWA reminders
        pwaNotificationService.checkAndTriggerAutomatedReminders(scheduleRes.data);
      }
    } catch (err) {
      console.error('Failed to load live attendance stats:', err);
      setError(
        err.response?.data?.message ||
          'Failed to connect to backend server for attendance statistics.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  /**
   * Derived reactive AI recommendations for today's lectures sorted by priority (Critical -> Recommended -> Safe to Skip)
   */
  const recommendations = useMemo(() => {
    const lectures = todaySchedule?.lectures || [];
    const subjectMap = new Map();
    subjectStats.forEach(s => subjectMap.set(String(s.subject_id), s));

    const recs = lectures.map(lec => {
      const sub = subjectMap.get(String(lec.subject_id)) || {
        subject_id: lec.subject_id,
        subject_name: lec.subject_name,
        faculty_name: lec.faculty_name,
        color: lec.color,
        attendance_percentage: 0,
        present: 0,
        absent: 0,
        pending: 0,
        remaining_lectures: 0,
      };
      return generateLectureRecommendation(sub, lec, 75);
    });

    return recs.sort((a, b) => a.priority - b.priority);
  }, [todaySchedule, subjectStats]);

  /**
   * Mark or Update Attendance for a lecture with instant local optimistic calculation
   */
  const markLectureStatus = async (lectureId, newStatus, subjectId = null) => {
    if (!todaySchedule && !subjectStats.length) return;

    const lectures = todaySchedule?.lectures || [];
    const targetLec = lectures.find((l) => l.lecture_id === lectureId);
    const oldStatus = targetLec ? targetLec.attendance_status : 'pending';
    const effSubjectId = subjectId || targetLec?.subject_id;

    if (oldStatus === newStatus) return;

    const prevSubjectStats = [...subjectStats];
    const prevOverallStats = overallStats ? { ...overallStats } : null;
    const prevSemesterProgress = semesterProgress ? { ...semesterProgress } : null;
    const prevTodaySchedule = todaySchedule ? { ...todaySchedule } : null;

    // 1. Optimistic Local Recalculations (<1ms)
    if (effSubjectId) {
      setSubjectStats((prev) =>
        recalculateSubjectStatsOptimistic(prev, effSubjectId, oldStatus, newStatus)
      );
    }

    if (overallStats) {
      setOverallStats((prev) =>
        recalculateOverallStatsOptimistic(prev, oldStatus, newStatus)
      );
    }

    if (semesterProgress) {
      setSemesterProgress((prev) => {
        if (!prev) return prev;
        let completed = prev.totalLecturesCompleted || 0;
        let remaining = prev.remainingLectures || 0;

        if (oldStatus === 'pending' && (newStatus === 'present' || newStatus === 'absent')) {
          completed += 1;
          remaining = Math.max(0, remaining - 1);
        } else if ((oldStatus === 'present' || oldStatus === 'absent') && newStatus === 'pending') {
          completed = Math.max(0, completed - 1);
          remaining += 1;
        }

        return {
          ...prev,
          totalLecturesCompleted: completed,
          remainingLectures: remaining,
        };
      });
    }

    if (todaySchedule && targetLec) {
      const updatedLectures = lectures.map((l) =>
        l.lecture_id === lectureId ? { ...l, attendance_status: newStatus } : l
      );

      const newSummary = { ...todaySchedule.summary };
      if (oldStatus === 'present') newSummary.present = Math.max(0, newSummary.present - 1);
      if (oldStatus === 'absent') newSummary.absent = Math.max(0, newSummary.absent - 1);
      if (oldStatus === 'pending') newSummary.pending = Math.max(0, newSummary.pending - 1);

      if (newStatus === 'present') newSummary.present += 1;
      if (newStatus === 'absent') newSummary.absent += 1;
      if (newStatus === 'pending') newSummary.pending += 1;

      setTodaySchedule((prev) => ({
        ...prev,
        summary: newSummary,
        lectures: updatedLectures,
      }));
    }

    setUpdatingLectureId(lectureId);

    // 2. Perform API Call & Sync Live Recalculated Server Metrics
    try {
      let apiRes;
      const recId = targetLec?.id;

      if (recId) {
        apiRes = await updateAttendance({ id: recId, attendance_status: newStatus });
      } else {
        try {
          apiRes = await markAttendance({ lecture_id: lectureId, attendance_status: newStatus });
        } catch (mErr) {
          if (mErr.response?.status === 409) {
            apiRes = await updateAttendance({ lecture_id: lectureId, attendance_status: newStatus });
          } else {
            throw mErr;
          }
        }
      }

      const serverResult = apiRes?.data;
      if (serverResult?.liveStats) {
        setSubjectStats(serverResult.liveStats.subjects || []);
        setOverallStats(serverResult.liveStats.overall || null);
        if (serverResult.liveStats.semesterProgress) {
          setSemesterProgress(serverResult.liveStats.semesterProgress);
        }
      }

      if (serverResult?.id && todaySchedule) {
        setTodaySchedule((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            lectures: prev.lectures.map((l) =>
              l.lecture_id === lectureId ? { ...l, id: serverResult.id } : l
            ),
          };
        });
      }

    const statusLabel = newStatus === 'present' ? 'Present' : newStatus === 'absent' ? 'Absent' : 'Pending';
      const subName = targetLec?.subject_name ? ` for ${targetLec.subject_name}` : '';

      // Save last action for Quick Undo functionality
      setLastAction({
        lectureId,
        subjectId: effSubjectId,
        oldStatus,
        newStatus,
        subjectName: targetLec?.subject_name || 'Lecture',
        timestamp: Date.now(),
      });

      showToast(`Marked ${statusLabel}${subName}`, newStatus === 'present' ? 'success' : 'info');
    } catch (err) {
      console.error('Failed to mark attendance:', err);
      setSubjectStats(prevSubjectStats);
      setOverallStats(prevOverallStats);
      setSemesterProgress(prevSemesterProgress);
      setTodaySchedule(prevTodaySchedule);

      const msg = err.response?.data?.message || 'Failed to update attendance status';
      showToast(msg, 'error');
    } finally {
      setUpdatingLectureId(null);
    }
  };

  /**
   * Quick Undo for the most recent attendance status change
   */
  const undoLastAction = async () => {
    if (!lastAction) return;
    const actionToUndo = { ...lastAction };
    setLastAction(null);

    await markLectureStatus(actionToUndo.lectureId, actionToUndo.oldStatus, actionToUndo.subjectId);
    showToast(`Undid attendance status change for ${actionToUndo.subjectName}`, 'info');
  };

  const value = {
    subjectStats,
    overallStats,
    semesterProgress,
    todaySchedule,
    recommendations,
    loading,
    error,
    updatingLectureId,
    lastAction,
    undoLastAction,
    markLectureStatus,
    refreshAll,
  };

  return (
    <AttendanceContext.Provider value={value}>
      {children}
    </AttendanceContext.Provider>
  );
}

export function useAttendance() {
  const context = useContext(AttendanceContext);
  if (!context) {
    throw new Error('useAttendance must be used within an AttendanceProvider');
  }
  return context;
}
