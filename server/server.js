import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase } from './config/db.js';
import { seedDatabase } from './database/seed.js';

// Route imports
import authRoutes from './routes/auth.js';
import advisorRoutes from './routes/advisor.js';
import calendarRoutes from './routes/calendar.js';
import machineryRoutes from './routes/machinery.js';
import storageRoutes from './routes/storage.js';
import notificationRoutes from './routes/notifications.js';
import sustainabilityRoutes from './routes/sustainability.js';
import farmRoutes from './routes/farm.js';
import weatherRoutes from './routes/weather.js';
import dashboardRoutes from './routes/dashboard.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
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

// Root & Healthcheck
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'EcoHub AI Sustainable Farm Platform', timestamp: new Date() });
});

// Initialize database and start server
async function startServer() {
  try {
    await initDatabase();
    await seedDatabase();

    app.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(`🌱 EcoHub Server running on http://localhost:${PORT}`);
      console.log(`🌱 API Health check available at http://localhost:${PORT}/api/health`);
      console.log(`=======================================================`);
    });
  } catch (err) {
    console.error('Failed to initialize server:', err);
    process.exit(1);
  }
}

startServer();
