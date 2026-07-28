import { StatsService } from '../services/statsService.js';

/**
 * Controller handlers for Attendance Statistics endpoints
 */

/**
 * @desc    Get attendance statistics per subject
 * @route   GET /api/stats/subjects
 * @access  Public
 */
export const getSubjectStats = async (req, res, next) => {
  try {
    const stats = await StatsService.getSubjectStats();
    res.status(200).json({
      status: 'success',
      results: stats.length,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get overall attendance statistics across all subjects
 * @route   GET /api/stats/overall
 * @access  Public
 */
export const getOverallStats = async (req, res, next) => {
  try {
    const overall = await StatsService.getOverallStats();
    res.status(200).json({
      status: 'success',
      data: overall,
    });
  } catch (error) {
    next(error);
  }
};
