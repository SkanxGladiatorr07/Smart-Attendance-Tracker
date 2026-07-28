import { StatsModel } from '../models/statsModel.js';

/**
 * Stats Service - Handles business logic and percentage calculations for attendance statistics
 */
export const StatsService = {
  /**
   * Get calculated attendance statistics per subject
   */
  async getSubjectStats() {
    const rawStats = await StatsModel.getSubjectStats();

    return rawStats.map((row) => {
      const totalLectures = Number(row.total_lectures) || 0;
      const present = Number(row.present) || 0;
      const absent = Number(row.absent) || 0;
      const pending = Number(row.pending) || 0;
      const marked = present + absent;

      const attendancePercentage =
        marked > 0 ? Number(((present / marked) * 100).toFixed(2)) : 0;

      return {
        subject_id: row.subject_id,
        subject_name: row.subject_name,
        faculty_name: row.faculty_name,
        color: row.color,
        total_lectures: totalLectures,
        present,
        absent,
        pending,
        attendance_percentage: attendancePercentage,
      };
    });
  },

  /**
   * Get calculated overall attendance statistics across all subjects
   */
  async getOverallStats() {
    const rawStats = await StatsModel.getOverallStats();

    const totalLectures = Number(rawStats.total_lectures) || 0;
    const totalPresent = Number(rawStats.total_present) || 0;
    const totalAbsent = Number(rawStats.total_absent) || 0;
    const totalPending = Number(rawStats.total_pending) || 0;
    const totalMarked = totalPresent + totalAbsent;

    const overallAttendancePercentage =
      totalMarked > 0 ? Number(((totalPresent / totalMarked) * 100).toFixed(2)) : 0;

    return {
      total_lectures: totalLectures,
      total_present: totalPresent,
      total_absent: totalAbsent,
      total_pending: totalPending,
      overall_attendance_percentage: overallAttendancePercentage,
    };
  },
};
