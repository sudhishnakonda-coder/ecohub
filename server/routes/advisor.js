import express from 'express';
import { createRecommendation, getRecommendations } from '../controllers/advisorController.js';
import { authenticateToken } from '../middleware/auth.js';
import { chatWithGemini } from '../services/aiService.js';

const router = express.Router();

// Existing recommendation routes
router.post('/', authenticateToken, createRecommendation);
router.get('/', authenticateToken, getRecommendations);

// Chat endpoint - free-form agriculture Q&A
router.post('/chat', authenticateToken, async (req, res) => {
  try {
    const { message, conversationHistory } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const result = await chatWithGemini(message.trim(), conversationHistory || []);

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
