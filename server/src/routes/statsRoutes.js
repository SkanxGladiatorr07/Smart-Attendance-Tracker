import { Router } from 'express';
import { getSubjectStats, getOverallStats, getLiveStats } from '../controllers/statsController.js';

const router = Router();

router.get('/subjects', getSubjectStats);
router.get('/overall', getOverallStats);
router.get('/live', getLiveStats);

export default router;
