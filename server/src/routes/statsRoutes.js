import { Router } from 'express';
import { getSubjectStats, getOverallStats } from '../controllers/statsController.js';

const router = Router();

router.get('/subjects', getSubjectStats);
router.get('/overall', getOverallStats);

export default router;
