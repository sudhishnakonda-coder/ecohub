import { z } from 'zod';
import { query } from '../config/db.js';

const storageSchema = z.object({
  name: z.string().min(1, 'Facility name is required'),
  location: z.string().min(1, 'Location is required'),
  lat: z.number().optional(),
  lng: z.number().optional(),
  capacity: z.number().positive('Capacity must be positive'),
  price: z.number().positive('Price must be positive'),
  image_url: z.string().optional()
});

const bookStorageSchema = z.object({
  storage_id: z.number(),
  booking_date: z.string().min(1, 'Booking date is required'),
  duration_days: z.number().min(1).default(1),
  quantity_tons: z.number().min(0.1).default(1.0)
});

export async function getColdStorages(req, res) {
  try {
    const { location } = req.query;
    let sql = 'SELECT * FROM cold_storages';
    const params = [];

    if (location) {
      sql += ' WHERE location LIKE ?';
      params.push(`%${location}%`);
    }

    sql += ' ORDER BY id DESC';

    const storages = await query(sql, params);
    return res.json({ cold_storages: storages.rows });
  } catch (err) {
    console.error('getColdStorages error:', err);
    return res.status(500).json({ error: 'Failed to fetch cold storages' });
  }
}

export async function createColdStorage(req, res) {
  try {
    const parseResult = storageSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.errors[0].message });
    }

    const { name, location, lat, lng, capacity, price, image_url } = parseResult.data;

    const result = await query(
      `INSERT INTO cold_storages (name, location, lat, lng, capacity, price, available_capacity, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`,
      [name, location, lat || 17.385, lng || 78.4867, capacity, price, capacity, image_url || '']
    );

    return res.status(201).json({
      cold_storage: result.rows[0] || { id: result.lastID, name, location, capacity, price },
      message: 'Cold Storage facility added successfully'
    });
  } catch (err) {
    console.error('createColdStorage error:', err);
    return res.status(500).json({ error: 'Failed to add cold storage facility' });
  }
}

export async function deleteColdStorage(req, res) {
  try {
    const { id } = req.params;
    await query('DELETE FROM cold_storages WHERE id = ?', [id]);
    return res.json({ message: 'Cold storage facility deleted successfully' });
  } catch (err) {
    console.error('deleteColdStorage error:', err);
    return res.status(500).json({ error: 'Failed to delete cold storage facility' });
  }
}

export async function bookColdStorage(req, res) {
  try {
    const parseResult = bookStorageSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.errors[0].message });
    }

    const { storage_id, booking_date, duration_days, quantity_tons } = parseResult.data;
    const userId = req.user.id;

    // Check storage availability
    const sRes = await query('SELECT * FROM cold_storages WHERE id = ?', [storage_id]);
    if (sRes.rows.length === 0) {
      return res.status(404).json({ error: 'Cold storage facility not found' });
    }

    const storage = sRes.rows[0];
    const totalPrice = Number(storage.price) * duration_days * quantity_tons;

    const result = await query(
      `INSERT INTO storage_bookings (user_id, storage_id, booking_date, duration_days, quantity_tons, status, total_price)
       VALUES (?, ?, ?, ?, ?, 'confirmed', ?) RETURNING *`,
      [userId, storage_id, booking_date, duration_days, quantity_tons, totalPrice]
    );

    // Update remaining capacity
    const newCapacity = Math.max(0, Number(storage.available_capacity || storage.capacity) - quantity_tons);
    await query('UPDATE cold_storages SET available_capacity = ? WHERE id = ?', [newCapacity, storage_id]);

    // Create Calendar event automatically for the storage reservation
    await query(
      'INSERT INTO calendar_events (user_id, title, date, type, description) VALUES (?, ?, ?, ?, ?)',
      [userId, `Storage: ${storage.name}`.substring(0, 255), booking_date, 'Cold Storage', `Reserved ${quantity_tons} tons for ${duration_days} days at ${storage.name}`]
    );

    // Create Notification
    await query(
      'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
      [userId, `Reserved: ${storage.name}`.substring(0, 255), `Reserved ${quantity_tons} Tons space starting ${booking_date} for ${duration_days} days.`, 'success']
    );

    return res.status(201).json({
      booking: result.rows[0] || { id: result.lastID, storage_id, booking_date, total_price: totalPrice },
      message: 'Cold Storage booked successfully'
    });
  } catch (err) {
    console.error('bookColdStorage error:', err);
    return res.status(500).json({ error: 'Failed to book cold storage' });
  }
}

export async function getStorageBookings(req, res) {
  try {
    const userId = req.user.id;
    const bookings = await query(
      `SELECT sb.id, sb.booking_date, sb.duration_days, sb.quantity_tons, sb.status, sb.total_price, sb.created_at,
              cs.name AS storage_name, cs.location, cs.price AS price_per_ton_day, cs.image_url
       FROM storage_bookings sb
       JOIN cold_storages cs ON sb.storage_id = cs.id
       WHERE sb.user_id = ? ORDER BY sb.id DESC`,
      [userId]
    );
    return res.json({ bookings: bookings.rows });
  } catch (err) {
    console.error('getStorageBookings error:', err);
    return res.status(500).json({ error: 'Failed to fetch cold storage bookings' });
  }
}
