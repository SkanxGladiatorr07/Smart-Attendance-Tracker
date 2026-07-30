import { Router } from 'express';
import { getSubjectStats, getOverallStats, getLiveStats, getPredictions, getSafeSkips, getRecommendations } from '../controllers/statsController.js';

const router = Router();

router.get('/subjects', getSubjectStats);
router.get('/overall', getOverallStats);
router.get('/live', getLiveStats);
router.get('/predictions', getPredictions);
router.get('/safe-skips', getSafeSkips);
router.get('/recommendations', getRecommendations);

export default router;
