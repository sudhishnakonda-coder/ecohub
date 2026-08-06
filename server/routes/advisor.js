import express from 'express';
import { createRecommendation, getRecommendations } from '../controllers/advisorController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticateToken, createRecommendation);
router.get('/', authenticateToken, getRecommendations);

export default router;
