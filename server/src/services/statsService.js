import { StatsModel } from '../models/statsModel.js';
import { DailyScheduleService } from './dailyScheduleService.js';
import { cacheUtils } from '../utils/cacheUtils.js';
import {
  formatSubjectStatsRow,
  formatOverallStatsRow,
  generateLectureRecommendation,
} from '../utils/calcUtils.js';

/**
 * Stats Service - Business logic, calculation layer, and caching engine for attendance statistics
 */
export const StatsService = {
  /**
   * Invalidate cached stats entries
   */
  invalidateCache() {
    cacheUtils.del(/^stats:/);
  },

  /**
   * Get calculated attendance statistics per subject
   * @param {number} [target=75] Target percentage
   * @returns {Promise<Array<Object>>} List of subject attendance statistics
   */
  async getSubjectStats(target = 75) {
    const cacheKey = `stats:subjects:${target}`;
    const cached = cacheUtils.get(cacheKey);
    if (cached) return cached;

    const rawStats = await StatsModel.getSubjectStats();
    const result = rawStats.map(r => formatSubjectStatsRow(r, target));

    cacheUtils.set(cacheKey, result, 5000);
    return result;
  },

  /**
   * Get calculated overall attendance statistics across all subjects
   * @param {number} [target=75] Target percentage
   * @returns {Promise<Object>} Overall attendance metrics summary
   */
  async getOverallStats(target = 75) {
    const cacheKey = `stats:overall:${target}`;
    const cached = cacheUtils.get(cacheKey);
    if (cached) return cached;

    const rawStats = await StatsModel.getOverallStats();
    const result = formatOverallStatsRow(rawStats, target);

    cacheUtils.set(cacheKey, result, 5000);
    return result;
  },

  /**
   * Get complete live attendance statistics (both overall and per subject)
   * @param {number} [target=75] Target percentage
   * @returns {Promise<{ overall: Object, subjects: Array<Object>, semesterProgress: Object }>}
   */
  async getLiveStats(target = 75) {
    const cacheKey = `stats:live:${target}`;
    const cached = cacheUtils.get(cacheKey);
    if (cached) return cached;

    const [subjectRows, overallRow, semesterProgress] = await Promise.all([
      StatsModel.getSubjectStats(),
      StatsModel.getOverallStats(),
      StatsModel.getSemesterProgress(),
    ]);

    const subjects = subjectRows.map(row => formatSubjectStatsRow(row, target));
    const overall = formatOverallStatsRow(overallRow, target);
    const result = { overall, subjects, semesterProgress };

    cacheUtils.set(cacheKey, result, 5000);
    return result;
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

    const formattedSubjects = rawSubjectStats.map(row => formatSubjectStatsRow(row, targetPct));
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

    const formattedSubjects = rawSubjectStats.map(row => formatSubjectStatsRow(row, targetPct));
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
        // Level values match generateLectureRecommendation: MUST_ATTEND | RECOMMENDED | SAFE_TO_SKIP
        mustAttendCount: recommendations.filter(r => r.level === 'MUST_ATTEND').length,
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
    const cacheKey = 'stats:semesterProgress';
    const cached = cacheUtils.get(cacheKey);
    if (cached) return cached;

    const result = await StatsModel.getSemesterProgress();
    cacheUtils.set(cacheKey, result, 10000);
    return result;
  },

  /**
   * Get complete analytics aggregations for Chart.js dashboards
   * @returns {Promise<Object>} Analytics datasets
   */
  async getAnalyticsData() {
    const cacheKey = 'stats:analytics';
    const cached = cacheUtils.get(cacheKey);
    if (cached) return cached;

    const [subjectStats, overallStats, analyticsRaw] = await Promise.all([
      this.getSubjectStats(75),
      this.getOverallStats(75),
      StatsModel.getAnalyticsData(),
    ]);

    const result = {
      subjectComparison: subjectStats,
      overallDistribution: {
        present: overallStats.total_present,
        absent: overallStats.total_absent,
        pending: overallStats.remaining_lectures,
        total: overallStats.total_lectures,
        percentage: overallStats.overall_attendance_percentage,
      },
      monthlyTrend: analyticsRaw.monthlyTrend,
      dailyTrend: analyticsRaw.dailyTrend,
      progression: analyticsRaw.progression,
    };

    cacheUtils.set(cacheKey, result, 5000);
    return result;
  }
};
