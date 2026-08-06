import { z } from 'zod';
import { query } from '../config/db.js';
import { generateCropRecommendation } from '../services/aiService.js';
import { getWeatherForLocation } from '../services/weatherService.js';

const advisorSchema = z.object({
  crop: z.string().min(1, 'Crop is required'),
  location: z.string().min(1, 'Location is required'),
  soil_type: z.string().min(1, 'Soil type is required'),
  crop_stage: z.string().min(1, 'Crop stage is required'),
  auto_schedule: z.boolean().optional()
});

export async function getRecommendations(req, res) {
  try {
    const userId = req.user.id;
    const recs = await query(
      `SELECT r.id, r.ai_response, r.created_at, f.crop, f.location, f.soil_type, f.crop_stage
       FROM recommendations r
       LEFT JOIN farms f ON r.farm_id = f.id
       WHERE r.user_id = ? ORDER BY r.id DESC LIMIT 10`,
      [userId]
    );

    const parsedRows = recs.rows.map(r => ({
      ...r,
      ai_response: typeof r.ai_response === 'string' ? JSON.parse(r.ai_response) : r.ai_response
    }));

    return res.json({ recommendations: parsedRows });
  } catch (err) {
    console.error('getRecommendations error:', err);
    return res.status(500).json({ error: 'Failed to fetch recommendation history' });
  }
}

export async function createRecommendation(req, res) {
  try {
    const parseResult = advisorSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.errors[0].message });
    }

    const { crop, location, soil_type, crop_stage, auto_schedule } = parseResult.data;
    const userId = req.user.id;

    // Check if farm exists or create/update primary farm
    let farmId;
    const existingFarm = await query('SELECT id FROM farms WHERE user_id = ? AND crop = ?', [userId, crop]);
    if (existingFarm.rows.length > 0) {
      farmId = existingFarm.rows[0].id;
      await query(
        'UPDATE farms SET location = ?, soil_type = ?, crop_stage = ? WHERE id = ?',
        [location, soil_type, crop_stage, farmId]
      );
    } else {
      const newFarm = await query(
        'INSERT INTO farms (user_id, crop, location, soil_type, crop_stage) VALUES (?, ?, ?, ?, ?) RETURNING id',
        [userId, crop, location, soil_type, crop_stage]
      );
      farmId = newFarm.rows[0]?.id || newFarm.lastID;
    }

    // Get live weather for location
    const weather = await getWeatherForLocation(location);

    // Generate AI recommendation
    const aiOutput = await generateCropRecommendation({ crop, location, soil_type, crop_stage, weather });

    // Save to DB
    const recRes = await query(
      'INSERT INTO recommendations (farm_id, user_id, ai_response) VALUES (?, ?, ?) RETURNING id',
      [farmId, userId, JSON.stringify(aiOutput)]
    );
    const recId = recRes.rows[0]?.id || recRes.lastID;

    // Optional auto-schedule smart calendar events
    if (auto_schedule !== false) {
      const today = new Date();
      const formatDaysOut = (days) => {
        const d = new Date(today);
        d.setDate(d.getDate() + days);
        return d.toISOString().split('T')[0];
      };

      // Create calendar entries based on advice
      await query(
        'INSERT INTO calendar_events (user_id, title, date, type, description) VALUES (?, ?, ?, ?, ?)',
        [userId, `Irrigation: ${crop}`, formatDaysOut(1), 'Irrigation', aiOutput.irrigation]
      );

      await query(
        'INSERT INTO calendar_events (user_id, title, date, type, description) VALUES (?, ?, ?, ?, ?)',
        [userId, `Fertilizer Application: ${crop}`, formatDaysOut(3), 'Fertilizer', aiOutput.fertilizer]
      );

      await query(
        'INSERT INTO calendar_events (user_id, title, date, type, description) VALUES (?, ?, ?, ?, ?)',
        [userId, `Pest Inspection: ${crop}`, formatDaysOut(7), 'Pest Inspection', aiOutput.pest_control]
      );

      await query(
        'INSERT INTO calendar_events (user_id, title, date, type, description) VALUES (?, ?, ?, ?, ?)',
        [userId, `Target Harvest Window: ${crop}`, formatDaysOut(30), 'Harvest', aiOutput.harvest]
      );

      // Create Notification
      await query(
        'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
        [userId, `AI Crop Strategy Generated for ${crop}`, `Smart irrigation, fertilizer, and pest control tasks added to your Smart Calendar.`, 'success']
      );
    }

    return res.status(201).json({
      id: recId,
      farm_id: farmId,
      crop,
      location,
      soil_type,
      crop_stage,
      weather,
      ai_response: aiOutput,
      message: 'AI Crop Recommendation generated successfully'
    });
  } catch (err) {
    console.error('createRecommendation error:', err);
    return res.status(500).json({ error: 'Failed to generate AI advice' });
  }
}
