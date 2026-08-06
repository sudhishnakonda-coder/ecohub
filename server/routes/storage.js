import express from 'express';
import { getColdStorages, createColdStorage, bookColdStorage, getStorageBookings } from '../controllers/storageController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/cold-storage', authenticateToken, getColdStorages);
router.post('/cold-storage', authenticateToken, createColdStorage);
router.post('/cold-storage/book', authenticateToken, bookColdStorage);
router.get('/cold-storage/bookings', authenticateToken, getStorageBookings);

export default router;
