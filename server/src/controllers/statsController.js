import { StatsService } from '../services/statsService.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';

/**
 * Controller handlers for Attendance Statistics endpoints
 */

/**
 * @desc    Get attendance statistics per subject
 * @route   GET /api/stats/subjects
 * @access  Public
 */
export const getSubjectStats = asyncHandler(async (req, res) => {
  const stats = await StatsService.getSubjectStats();
  res.status(200).json({
    status: 'success',
    results: stats.length,
    data: stats,
  });
});

/**
 * @desc    Get overall attendance statistics across all subjects
 * @route   GET /api/stats/overall
 * @access  Public
 */
export const getOverallStats = asyncHandler(async (req, res) => {
  const overall = await StatsService.getOverallStats();
  res.status(200).json({
    status: 'success',
    data: overall,
  });
});
