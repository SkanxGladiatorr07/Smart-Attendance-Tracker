import { Router } from 'express';
import {
  getSubjectStats,
  getOverallStats,
  getLiveStats,
  getPredictions,
  getSafeSkips,
  getRecommendations,
  getSemesterProgress,
  getAnalyticsData,
} from '../controllers/statsController.js';

const router = Router();

router.get('/subjects', getSubjectStats);
router.get('/overall', getOverallStats);
router.get('/live', getLiveStats);
router.get('/predictions', getPredictions);
router.get('/safe-skips', getSafeSkips);
router.get('/recommendations', getRecommendations);
router.get('/semester-progress', getSemesterProgress);
router.get('/analytics', getAnalyticsData);

export default router;
