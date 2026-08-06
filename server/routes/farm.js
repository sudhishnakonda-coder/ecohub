import express from 'express';
import { getFarms, createFarm, deleteFarm } from '../controllers/farmController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, getFarms);
router.post('/', authenticateToken, createFarm);
router.delete('/:id', authenticateToken, deleteFarm);

export default router;
