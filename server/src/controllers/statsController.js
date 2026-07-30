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
  const target = req.query.target || 75;
  const stats = await StatsService.getSubjectStats(target);
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
  const target = req.query.target || 75;
  const overall = await StatsService.getOverallStats(target);
  res.status(200).json({
    status: 'success',
    data: overall,
  });
});

/**
 * @desc    Get combined live attendance statistics (overall + subjects)
 * @route   GET /api/stats/live
 * @access  Public
 */
export const getLiveStats = asyncHandler(async (req, res) => {
  const target = req.query.target || 75;
  const liveStats = await StatsService.getLiveStats(target);
  res.status(200).json({
    status: 'success',
    data: liveStats,
  });
});

/**
 * @desc    Get required lecture prediction metrics
 * @route   GET /api/stats/predictions
 * @access  Public
 */
export const getPredictions = asyncHandler(async (req, res) => {
  const target = req.query.target || 75;
  const subjectId = req.query.subject_id || null;
  const predictions = await StatsService.getPredictions(target, subjectId);
  res.status(200).json({
    status: 'success',
    data: predictions,
  });
});

/**
 * @desc    Get safe skip calculator metrics
 * @route   GET /api/stats/safe-skips
 * @access  Public
 */
export const getSafeSkips = asyncHandler(async (req, res) => {
  const target = req.query.target || 75;
  const subjectId = req.query.subject_id || null;
  const safeSkips = await StatsService.getSafeSkips(target, subjectId);
  res.status(200).json({
    status: 'success',
    data: safeSkips,
  });
});

/**
 * @desc    Get AI recommendations for today's lectures
 * @route   GET /api/stats/recommendations
 * @access  Public
 */
export const getRecommendations = asyncHandler(async (req, res) => {
  const target = req.query.target || 75;
  const recommendations = await StatsService.getTodayRecommendations(target);
  res.status(200).json({
    status: 'success',
    data: recommendations,
  });
});

/**
 * @desc    Get semester progress dashboard calculations
 * @route   GET /api/stats/semester-progress
 * @access  Public
 */
export const getSemesterProgress = asyncHandler(async (req, res) => {
  const progress = await StatsService.getSemesterProgress();
  res.status(200).json({
    status: 'success',
    data: progress,
  });
});
