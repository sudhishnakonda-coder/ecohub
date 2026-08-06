import { query } from '../config/db.js';
import { getWeatherForLocation } from '../services/weatherService.js';

export async function getDashboardData(req, res) {
  try {
    const userId = req.user.id;

    // Primary farm
    const farmRes = await query('SELECT * FROM farms WHERE user_id = ? ORDER BY id DESC LIMIT 1', [userId]);
    const farm = farmRes.rows[0] || {
      crop: 'Wheat',
      location: 'GreenValley Farm',
      soil_type: 'Loamy Soil',
      crop_stage: 'Vegetative Stage'
    };

    // Weather
    const weather = await getWeatherForLocation(farm.location);

    // Upcoming calendar events
    const todayStr = new Date().toISOString().split('T')[0];
    const eventsRes = await query(
      "SELECT * FROM calendar_events WHERE user_id = ? AND date >= ? ORDER BY date ASC LIMIT 5",
      [userId, todayStr]
    );

    // Recent AI recommendations
    const recsRes = await query(
      'SELECT * FROM recommendations WHERE user_id = ? ORDER BY id DESC LIMIT 1',
      [userId]
    );
    let latestRecommendation = null;
    if (recsRes.rows.length > 0) {
      const row = recsRes.rows[0];
      latestRecommendation = typeof row.ai_response === 'string' ? JSON.parse(row.ai_response) : row.ai_response;
    }

    // Active Bookings summary — use single-quoted strings for Supabase compatibility
    const mBookingsRes = await query("SELECT COUNT(*) as count FROM machine_bookings WHERE user_id = ? AND status = 'confirmed'", [userId]);
    const sBookingsRes = await query("SELECT COUNT(*) as count FROM storage_bookings WHERE user_id = ? AND status = 'confirmed'", [userId]);

    // Notifications count unread
    const notifsRes = await query('SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = false', [userId]);

    return res.json({
      farm,
      weather,
      upcomingEvents: eventsRes.rows,
      latestRecommendation,
      activeBookings: {
        machinery: parseInt(mBookingsRes.rows[0]?.count || 0),
        storage: parseInt(sBookingsRes.rows[0]?.count || 0)
      },
      unreadNotificationsCount: parseInt(notifsRes.rows[0]?.count || 0),
      sustainabilityScore: 88
    });
  } catch (err) {
    console.error('getDashboardData error:', err);
    return res.status(500).json({ error: 'Failed to fetch dashboard summary' });
  }
}
