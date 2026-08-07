import express from 'express';
import { createRecommendation, getRecommendations } from '../controllers/advisorController.js';
import { authenticateToken } from '../middleware/auth.js';
import { chatWithGemini } from '../services/aiService.js';
import { query } from '../config/db.js';

const router = express.Router();

// Existing recommendation routes
router.post('/', authenticateToken, createRecommendation);
router.get('/', authenticateToken, getRecommendations);

// Chat endpoint - free-form agriculture Q&A with full user context
router.post('/chat', authenticateToken, async (req, res) => {
  try {
    const { message, conversationHistory } = req.body;
    const userId = req.user.id;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Fetch user's farm data, calendar events, and past recommendations for context
    let userContext = {};

    try {
      // Get user's farms
      const farmsResult = await query('SELECT * FROM farms WHERE user_id = ?', [userId]);
      userContext.farms = farmsResult.rows || [];

      // Get upcoming calendar events
      const today = new Date().toISOString().split('T')[0];
      const calendarResult = await query(
        'SELECT * FROM calendar_events WHERE user_id = ? AND date >= ? ORDER BY date ASC LIMIT 5',
        [userId, today]
      );
      userContext.upcomingEvents = calendarResult.rows || [];

      // Get recent AI recommendations
      const recsResult = await query(
        `SELECT r.ai_response, r.created_at, f.crop, f.location, f.soil_type, f.crop_stage
         FROM recommendations r
         LEFT JOIN farms f ON r.farm_id = f.id
         WHERE r.user_id = ? ORDER BY r.id DESC LIMIT 3`,
        [userId]
      );
      userContext.recentRecommendations = (recsResult.rows || []).map(r => ({
        ...r,
        ai_response: typeof r.ai_response === 'string' ? JSON.parse(r.ai_response) : r.ai_response
      }));

      // Get user's notifications
      const notifResult = await query(
        'SELECT * FROM notifications WHERE user_id = ? ORDER BY id DESC LIMIT 5',
        [userId]
      );
      userContext.recentNotifications = notifResult.rows || [];

    } catch (dbErr) {
      console.warn('[Chat] Could not fetch user context:', dbErr.message);
    }

    const result = await chatWithGemini(message.trim(), conversationHistory || [], userContext);

    return res.json({
      reply: result.reply,
      model: result.model,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('[Chat Error]', err);
    return res.status(500).json({ error: 'Failed to get AI response. Please try again.' });
  }
});

export default router;
