import { getWeatherForLocation } from '../services/weatherService.js';

export async function getWeather(req, res) {
  try {
    const location = req.query.location || 'GreenValley Farm';
    const weather = await getWeatherForLocation(location);
    return res.json(weather);
  } catch (err) {
    console.error('getWeather error:', err);
    return res.status(500).json({ error: 'Failed to fetch weather data' });
  }
}
