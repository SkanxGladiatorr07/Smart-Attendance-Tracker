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
import { offlineQueueService } from '../services/offlineQueueService';
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
  const [pendingOfflineCount, setPendingOfflineCount] = useState(
    () => offlineQueueService.getQueue().length
  );

  /**
   * Fetch all stats and daily schedule from server, with fallback to offline local cache
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
        pwaNotificationService.checkAndTriggerAutomatedReminders(scheduleRes.data);
      }

      // Cache latest live data for offline access
      if (liveRes?.data && scheduleRes?.data) {
        offlineQueueService.cacheTodayData({
          todaySchedule: scheduleRes.data,
          subjectStats: liveRes.data.subjects || [],
          overallStats: liveRes.data.overall || null,
          semesterProgress: liveRes.data.semesterProgress || null,
        });
      }
    } catch (err) {
      console.warn('Failed to load live attendance stats from server. Checking offline cache:', err);

      // Attempt loading from offline local cache
      const cached = offlineQueueService.getCachedTodayData();
      if (cached) {
        setSubjectStats(cached.subjectStats || []);
        setOverallStats(cached.overallStats || null);
        setSemesterProgress(cached.semesterProgress || null);
        setTodaySchedule(cached.todaySchedule || null);
        showToast('Offline Mode: Loaded cached attendance schedule', 'info');
      } else {
        setError(
          err.response?.data?.message ||
            'Failed to connect to backend server for attendance statistics.'
        );
      }
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  /**
   * Background Auto-Sync Engine: Syncs queued offline updates when network connectivity returns
   */
  useEffect(() => {
    const handleOnlineSync = async () => {
      const queue = offlineQueueService.getQueue();
      if (queue.length === 0) return;

      showToast(`Back Online: Syncing ${queue.length} offline attendance updates...`, 'info');

      const result = await offlineQueueService.syncQueue(async (lectureId, status) => {
        try {
          await markAttendance({ lecture_id: lectureId, attendance_status: status });
        } catch (mErr) {
          if (mErr.response?.status === 409) {
            await updateAttendance({ lecture_id: lectureId, attendance_status: status });
          } else {
            throw mErr;
          }
        }
      });

      setPendingOfflineCount(offlineQueueService.getQueue().length);

      if (result.syncedCount > 0) {
        showToast(`Successfully synced ${result.syncedCount} attendance updates with server!`, 'success');
        refreshAll();
      }
    };

    window.addEventListener('online', handleOnlineSync);
    return () => window.removeEventListener('online', handleOnlineSync);
  }, [showToast, refreshAll]);

  /**
   * Derived reactive AI recommendations for today's lectures sorted by priority
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
   * Mark or Update Attendance for a lecture with optimistic UI calculation and offline queueing
   */
  const markLectureStatus = useCallback(async (lectureId, newStatus, subjectId = null) => {
    if (!todaySchedule && !subjectStats.length) return;

    const lectures = todaySchedule?.lectures || [];
    const targetLec = lectures.find((l) => l.lecture_id === lectureId);
    const oldStatus = targetLec ? targetLec.attendance_status : 'pending';
    const effSubjectId = subjectId || targetLec?.subject_id;

    if (oldStatus === newStatus) return;

    // 1. Optimistic Local Recalculations (<1ms)
    let newSubjectStats = subjectStats;
    let newOverallStats = overallStats;
    let newSemProgress = semesterProgress;
    let newTodaySchedule = todaySchedule;

    if (effSubjectId) {
      newSubjectStats = recalculateSubjectStatsOptimistic(subjectStats, effSubjectId, oldStatus, newStatus);
      setSubjectStats(newSubjectStats);
    }

    if (overallStats) {
      newOverallStats = recalculateOverallStatsOptimistic(overallStats, oldStatus, newStatus);
      setOverallStats(newOverallStats);
    }

    if (semesterProgress) {
      let completed = semesterProgress.totalLecturesCompleted || 0;
      let remaining = semesterProgress.remainingLectures || 0;

      if (oldStatus === 'pending' && (newStatus === 'present' || newStatus === 'absent')) {
        completed += 1;
        remaining = Math.max(0, remaining - 1);
      } else if ((oldStatus === 'present' || oldStatus === 'absent') && newStatus === 'pending') {
        completed = Math.max(0, completed - 1);
        remaining += 1;
      }

      newSemProgress = {
        ...semesterProgress,
        totalLecturesCompleted: completed,
        remainingLectures: remaining,
      };
      setSemesterProgress(newSemProgress);
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

      newTodaySchedule = {
        ...todaySchedule,
        summary: newSummary,
        lectures: updatedLectures,
      };
      setTodaySchedule(newTodaySchedule);
    }

    setUpdatingLectureId(lectureId);

    const statusLabel = newStatus === 'present' ? 'Present' : newStatus === 'absent' ? 'Absent' : 'Pending';
    const subName = targetLec?.subject_name ? ` for ${targetLec.subject_name}` : '';

    setLastAction({
      lectureId,
      subjectId: effSubjectId,
      oldStatus,
      newStatus,
      subjectName: targetLec?.subject_name || 'Lecture',
      timestamp: Date.now(),
    });

    // 2. Offline Mode Handling
    if (!navigator.onLine) {
      offlineQueueService.enqueue(lectureId, newStatus, effSubjectId);
      offlineQueueService.cacheTodayData({
        todaySchedule: newTodaySchedule,
        subjectStats: newSubjectStats,
        overallStats: newOverallStats,
        semesterProgress: newSemProgress,
      });
      setPendingOfflineCount(offlineQueueService.getQueue().length);
      showToast(`Offline Mode: Saved ${statusLabel}${subName} locally. Will sync online.`, 'info');
      setUpdatingLectureId(null);
      return;
    }

    // 3. Online API Sync
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

      showToast(`Marked ${statusLabel}${subName}`, newStatus === 'present' ? 'success' : 'info');
    } catch (err) {
      console.warn('Network error while marking attendance. Enqueueing offline:', err);
      // Fallback to offline queue on unexpected network failure
      offlineQueueService.enqueue(lectureId, newStatus, effSubjectId);
      setPendingOfflineCount(offlineQueueService.getQueue().length);
      showToast(`Offline Mode: Enqueued ${statusLabel}${subName} locally.`, 'info');
    } finally {
      setUpdatingLectureId(null);
    }
  }, [todaySchedule, subjectStats, overallStats, semesterProgress, showToast]);

  /**
   * Quick Undo for the most recent attendance status change
   */
  const undoLastAction = useCallback(async () => {
    if (!lastAction) return;
    const actionToUndo = { ...lastAction };
    setLastAction(null);
    await markLectureStatus(actionToUndo.lectureId, actionToUndo.oldStatus, actionToUndo.subjectId);
  }, [lastAction, markLectureStatus]);

  const value = useMemo(() => ({
    subjectStats,
    overallStats,
    semesterProgress,
    todaySchedule,
    recommendations,
    loading,
    error,
    updatingLectureId,
    lastAction,
    pendingOfflineCount,
    undoLastAction,
    markLectureStatus,
    refreshAll,
  }), [
    subjectStats,
    overallStats,
    semesterProgress,
    todaySchedule,
    recommendations,
    loading,
    error,
    updatingLectureId,
    lastAction,
    pendingOfflineCount,
    undoLastAction,
    markLectureStatus,
    refreshAll,
  ]);

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
