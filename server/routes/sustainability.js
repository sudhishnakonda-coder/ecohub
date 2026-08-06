import express from 'express';
import { getSustainabilityMetrics } from '../controllers/sustainabilityController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, getSustainabilityMetrics);

export default router;
