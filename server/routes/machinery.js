import express from 'express';
import { getMachines, createMachine, bookMachine, getBookings, cancelBooking } from '../controllers/machineryController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/machines', authenticateToken, getMachines);
router.post('/machines', authenticateToken, createMachine);
router.post('/machines/book', authenticateToken, bookMachine);
router.get('/machines/bookings', authenticateToken, getBookings);
router.delete('/machines/book/:id', authenticateToken, cancelBooking);

export default router;
