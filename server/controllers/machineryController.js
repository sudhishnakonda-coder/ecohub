import { z } from 'zod';
import { query } from '../config/db.js';

const machineSchema = z.object({
  owner: z.string().min(1, 'Owner name is required'),
  machine_name: z.string().min(1, 'Machine name is required'),
  type: z.string().min(1, 'Machine type is required'),
  location: z.string().min(1, 'Location is required'),
  lat: z.number().optional(),
  lng: z.number().optional(),
  rent: z.number().positive('Rent must be a positive number'),
  image_url: z.string().optional(),
  description: z.string().optional()
});

const bookMachineSchema = z.object({
  machine_id: z.number(),
  booking_date: z.string().min(1, 'Booking date is required'),
  end_date: z.string().optional(),
  total_price: z.number().optional()
});

export async function getMachines(req, res) {
  try {
    const { type, location } = req.query;
    let sql = 'SELECT * FROM machinery WHERE availability = true';
    const params = [];

    if (type && type !== 'All') {
      sql += ' AND type = ?';
      params.push(type);
    }
    if (location) {
      sql += ' AND location LIKE ?';
      params.push(`%${location}%`);
    }

    sql += ' ORDER BY id DESC';

    const machines = await query(sql, params);
    return res.json({ machines: machines.rows });
  } catch (err) {
    console.error('getMachines error:', err);
    return res.status(500).json({ error: 'Failed to fetch machinery listings' });
  }
}

export async function createMachine(req, res) {
  try {
    const parseResult = machineSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.errors[0].message });
    }

    const { owner, machine_name, type, location, lat, lng, rent, image_url, description } = parseResult.data;

    const result = await query(
      `INSERT INTO machinery (owner, machine_name, type, location, lat, lng, rent, image_url, description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`,
      [owner, machine_name, type, location, lat || 17.385, lng || 78.4867, rent, image_url || '', description || '']
    );

    return res.status(201).json({
      machine: result.rows[0] || { id: result.lastID, owner, machine_name, type, location, rent },
      message: 'Machinery listed successfully'
    });
  } catch (err) {
    console.error('createMachine error:', err);
    return res.status(500).json({ error: 'Failed to create machinery listing' });
  }
}

export async function bookMachine(req, res) {
  try {
    const parseResult = bookMachineSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.errors[0].message });
    }

    const { machine_id, booking_date, end_date, total_price } = parseResult.data;
    const userId = req.user.id;

    // Check machine existence
    const mRes = await query('SELECT * FROM machinery WHERE id = ?', [machine_id]);
    if (mRes.rows.length === 0) {
      return res.status(404).json({ error: 'Machinery not found' });
    }
    const machine = mRes.rows[0];

    const price = total_price || machine.rent;

    const result = await query(
      `INSERT INTO machine_bookings (user_id, machine_id, booking_date, end_date, status, total_price)
       VALUES (?, ?, ?, ?, 'confirmed', ?) RETURNING *`,
      [userId, machine_id, booking_date, end_date || booking_date, price]
    );

    // Create Calendar event automatically for the booking
    await query(
      'INSERT INTO calendar_events (user_id, title, date, type, description) VALUES (?, ?, ?, ?, ?)',
      [userId, `Machinery: ${machine.machine_name}`, booking_date, 'Machinery Booking', `Booked ${machine.machine_name} from ${machine.owner} at $${price}/day`]
    );

    // Create Notification
    await query(
      'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
      [userId, `Booking Confirmed: ${machine.machine_name}`, `Your reservation for ${machine.machine_name} on ${booking_date} is confirmed!`, 'success']
    );

    return res.status(201).json({
      booking: result.rows[0] || { id: result.lastID, machine_id, booking_date, total_price: price },
      message: 'Machinery booked successfully'
    });
  } catch (err) {
    console.error('bookMachine error:', err);
    return res.status(500).json({ error: 'Failed to book machinery' });
  }
}

export async function getBookings(req, res) {
  try {
    const userId = req.user.id;
    const bookings = await query(
      `SELECT mb.id, mb.booking_date, mb.end_date, mb.status, mb.total_price, mb.created_at,
              m.machine_name, m.owner, m.type, m.location, m.image_url, m.rent
       FROM machine_bookings mb
       JOIN machinery m ON mb.machine_id = m.id
       WHERE mb.user_id = ? ORDER BY mb.id DESC`,
      [userId]
    );
    return res.json({ bookings: bookings.rows });
  } catch (err) {
    console.error('getBookings error:', err);
    return res.status(500).json({ error: 'Failed to fetch machinery bookings' });
  }
}

export async function cancelBooking(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await query(
      "UPDATE machine_bookings SET status = 'cancelled' WHERE id = ? AND user_id = ?",
      [id, userId]
    );

    return res.json({ message: 'Machinery booking cancelled successfully' });
  } catch (err) {
    console.error('cancelBooking error:', err);
    return res.status(500).json({ error: 'Failed to cancel booking' });
  }
}
