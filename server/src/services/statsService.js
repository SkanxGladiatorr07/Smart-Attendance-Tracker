import { StatsModel } from '../models/statsModel.js';
import { DailyScheduleService } from './dailyScheduleService.js';
import {
  formatSubjectStatsRow,
  formatOverallStatsRow,
  generateLectureRecommendation,
} from '../utils/calcUtils.js';

/**
 * Stats Service - Business logic and calculation layer for attendance statistics
 */
export const StatsService = {
  /**
   * Get calculated attendance statistics per subject
   * @param {number} [target=75] Target percentage
   * @returns {Promise<Array<Object>>} List of subject attendance statistics
   */
  async getSubjectStats(target = 75) {
    const rawStats = await StatsModel.getSubjectStats();
    return rawStats.map(r => formatSubjectStatsRow(r, target));
  },

  /**
   * Get calculated overall attendance statistics across all subjects
   * @param {number} [target=75] Target percentage
   * @returns {Promise<Object>} Overall attendance metrics summary
   */
  async getOverallStats(target = 75) {
    const rawStats = await StatsModel.getOverallStats();
    return formatOverallStatsRow(rawStats, target);
  },

  /**
   * Get complete live attendance statistics (both overall and per subject)
   * @param {number} [target=75] Target percentage
   * @returns {Promise<{ overall: Object, subjects: Array<Object> }>}
   */
  async getLiveStats(target = 75) {
    const [rawSubjectStats, rawOverallStats, semesterProgress] = await Promise.all([
      StatsModel.getSubjectStats(),
      StatsModel.getOverallStats(),
      StatsModel.getSemesterProgress(),
    ]);

    const subjects = rawSubjectStats.map(r => formatSubjectStatsRow(r, target));
    const overall = formatOverallStatsRow(rawOverallStats, target);

    return { overall, subjects, semesterProgress };
  },

  /**
   * Get required lecture predictions for all subjects or a single subject
   * @param {number} [target=75] Target percentage
   * @param {number|string|null} [subjectId=null] Optional subject filter
   * @returns {Promise<Object>} Prediction data
   */
  async getPredictions(target = 75, subjectId = null) {
    const targetPct = Number(target) || 75;
    const { rawSubjectStats, rawOverallStats } = await StatsModel.getLiveStats();

    const formattedSubjects = rawSubjectStats.map(r => formatSubjectStatsRow(r, targetPct));
    const formattedOverall = formatOverallStatsRow(rawOverallStats, targetPct);

    if (subjectId) {
      const match = formattedSubjects.find(s => String(s.subject_id) === String(subjectId));
      if (!match) {
        return {
          targetPercentage: targetPct,
          found: false,
          message: `Subject ID ${subjectId} not found.`
        };
      }
      return {
        targetPercentage: targetPct,
        subject: match,
        prediction: match.prediction
      };
    }

    return {
      targetPercentage: targetPct,
      overallPrediction: formattedOverall.prediction,
      subjects: formattedSubjects.map(s => ({
        subject_id: s.subject_id,
        subject_name: s.subject_name,
        color: s.color,
        attendance_percentage: s.attendance_percentage,
        prediction: s.prediction
      }))
    };
  },

  /**
   * Get maximum safe skips metrics for all subjects or a single subject
   * @param {number} [target=75] Target percentage
   * @param {number|string|null} [subjectId=null] Optional subject filter
   * @returns {Promise<Object>} Safe skip metrics
   */
  async getSafeSkips(target = 75, subjectId = null) {
    const targetPct = Number(target) || 75;
    const { rawSubjectStats, rawOverallStats } = await StatsModel.getLiveStats();

    const formattedSubjects = rawSubjectStats.map(r => formatSubjectStatsRow(r, targetPct));
    const formattedOverall = formatOverallStatsRow(rawOverallStats, targetPct);

    if (subjectId) {
      const match = formattedSubjects.find(s => String(s.subject_id) === String(subjectId));
      if (!match) {
        return {
          targetPercentage: targetPct,
          found: false,
          message: `Subject ID ${subjectId} not found.`
        };
      }
      return {
        targetPercentage: targetPct,
        subject: match,
        safeSkips: match.safeSkips
      };
    }

    return {
      targetPercentage: targetPct,
      overallSafeSkips: formattedOverall.safeSkips,
      subjects: formattedSubjects.map(s => ({
        subject_id: s.subject_id,
        subject_name: s.subject_name,
        color: s.color,
        attendance_percentage: s.attendance_percentage,
        remaining_lectures: s.remaining_lectures,
        safeSkips: s.safeSkips
      }))
    };
  },

  /**
   * Get AI recommendations for today's lectures (Critical, Recommended, Safe to Skip)
   * @param {number} [target=75] Target percentage
   * @returns {Promise<Object>} Structured recommendation engine result
   */
  async getTodayRecommendations(target = 75) {
    const targetPct = Number(target) || 75;
    const [subjectStatsList, scheduleData] = await Promise.all([
      this.getSubjectStats(targetPct),
      DailyScheduleService.getDailySchedule(),
    ]);

    const subjectMap = new Map();
    subjectStatsList.forEach(s => {
      subjectMap.set(String(s.subject_id), s);
    });

    const recommendations = (scheduleData.lectures || []).map(lec => {
      const subStats = subjectMap.get(String(lec.subject_id)) || {
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

      return generateLectureRecommendation(subStats, lec, targetPct);
    });

    recommendations.sort((a, b) => a.priority - b.priority);

    return {
      date: scheduleData.date,
      formattedDate: scheduleData.formattedDate,
      isWorkingDay: scheduleData.isWorkingDay,
      holidayReason: scheduleData.reason,
      targetPercentage: targetPct,
      summary: {
        totalRecommendations: recommendations.length,
        criticalCount: recommendations.filter(r => r.level === 'CRITICAL').length,
        recommendedCount: recommendations.filter(r => r.level === 'RECOMMENDED').length,
        safeToSkipCount: recommendations.filter(r => r.level === 'SAFE_TO_SKIP').length,
      },
      recommendations,
    };
  },

  /**
   * Get semester progress calculation summary
   * @returns {Promise<Object>} Semester progress calculations
   */
  async getSemesterProgress() {
    return StatsModel.getSemesterProgress();
  }
};
