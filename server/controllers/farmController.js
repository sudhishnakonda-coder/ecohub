import { z } from 'zod';
import { query } from '../config/db.js';

const farmSchema = z.object({
  crop: z.string().min(1, 'Crop name is required'),
  location: z.string().min(1, 'Location is required'),
  soil_type: z.string().min(1, 'Soil type is required'),
  crop_stage: z.string().min(1, 'Crop stage is required'),
  size_acres: z.number().optional()
});

export async function getFarms(req, res) {
  try {
    const userId = req.user.id;
    const farms = await query('SELECT * FROM farms WHERE user_id = ? ORDER BY id DESC', [userId]);
    return res.json({ farms: farms.rows });
  } catch (err) {
    console.error('getFarms error:', err);
    return res.status(500).json({ error: 'Failed to fetch farms' });
  }
}

export async function createFarm(req, res) {
  try {
    const parseResult = farmSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.errors[0].message });
    }

    const { crop, location, soil_type, crop_stage, size_acres } = parseResult.data;
    const userId = req.user.id;

    const result = await query(
      'INSERT INTO farms (user_id, crop, location, soil_type, crop_stage, size_acres) VALUES (?, ?, ?, ?, ?, ?) RETURNING *',
      [userId, crop, location, soil_type, crop_stage, size_acres || 5.0]
    );

    return res.status(201).json({
      farm: result.rows[0] || { id: result.lastID, user_id: userId, crop, location, soil_type, crop_stage, size_acres: size_acres || 5.0 },
      message: 'Farm created successfully'
    });
  } catch (err) {
    console.error('createFarm error:', err);
    return res.status(500).json({ error: 'Failed to create farm profile' });
  }
}
