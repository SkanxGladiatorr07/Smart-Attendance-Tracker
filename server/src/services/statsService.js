import { StatsModel } from '../models/statsModel.js';
import { formatSubjectStatsRow, formatOverallStatsRow } from '../utils/calcUtils.js';

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
    const { rawSubjectStats, rawOverallStats } = await StatsModel.getLiveStats();
    const subjects = rawSubjectStats.map(r => formatSubjectStatsRow(r, target));
    const overall = formatOverallStatsRow(rawOverallStats, target);
    return { overall, subjects };
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
  }
};
