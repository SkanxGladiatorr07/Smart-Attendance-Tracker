import { StatsModel } from '../models/statsModel.js';
import { formatSubjectStatsRow, formatOverallStatsRow } from '../utils/calcUtils.js';

/**
 * Stats Service - Business logic and calculation layer for attendance statistics
 */
export const StatsService = {
  /**
   * Get calculated attendance statistics per subject
   * @returns {Promise<Array<Object>>} List of subject attendance statistics
   */
  async getSubjectStats() {
    const rawStats = await StatsModel.getSubjectStats();
    return rawStats.map(formatSubjectStatsRow);
  },

  /**
   * Get calculated overall attendance statistics across all subjects
   * @returns {Promise<Object>} Overall attendance metrics summary
   */
  async getOverallStats() {
    const rawStats = await StatsModel.getOverallStats();
    return formatOverallStatsRow(rawStats);
  },

  /**
   * Get complete live attendance statistics (both overall and per subject)
   * @returns {Promise<{ overall: Object, subjects: Array<Object> }>}
   */
  async getLiveStats() {
    const { rawSubjectStats, rawOverallStats } = await StatsModel.getLiveStats();
    const subjects = rawSubjectStats.map(formatSubjectStatsRow);
    const overall = formatOverallStatsRow(rawOverallStats);
    return { overall, subjects };
  },
};
