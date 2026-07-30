import { Router } from 'express';
import { getSubjectStats, getOverallStats, getLiveStats, getPredictions } from '../controllers/statsController.js';

const router = Router();

router.get('/subjects', getSubjectStats);
router.get('/overall', getOverallStats);
router.get('/live', getLiveStats);
router.get('/predictions', getPredictions);

export default router;
