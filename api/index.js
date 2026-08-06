import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase } from '../server/config/db.js';

// Route imports
import authRoutes from '../server/routes/auth.js';
import advisorRoutes from '../server/routes/advisor.js';
import calendarRoutes from '../server/routes/calendar.js';
import machineryRoutes from '../server/routes/machinery.js';
import storageRoutes from '../server/routes/storage.js';
import notificationRoutes from '../server/routes/notifications.js';
import sustainabilityRoutes from '../server/routes/sustainability.js';
import farmRoutes from '../server/routes/farm.js';
import weatherRoutes from '../server/routes/weather.js';
import dashboardRoutes from '../server/routes/dashboard.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Initialize Database connection on first request (must be before routes)
let initialized = false;
app.use(async (req, res, next) => {
  if (!initialized) {
    try {
      await initDatabase();
      initialized = true;
    } catch (e) {
      console.error('[Vercel DB Init Error]', e);
    }
  }
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/advisor', advisorRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api', machineryRoutes);
app.use('/api', storageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/sustainability', sustainabilityRoutes);
app.use('/api/farms', farmRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'EcoHub AI Sustainable Farm Platform', timestamp: new Date() });
});

export default app;
