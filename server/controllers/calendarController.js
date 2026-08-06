import { z } from 'zod';
import { query } from '../config/db.js';

const eventSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  date: z.string().min(1, 'Date is required'),
  type: z.string().min(1, 'Event type is required'),
  status: z.string().optional(),
  description: z.string().optional()
});

export async function getEvents(req, res) {
  try {
    const userId = req.user.id;
    const events = await query(
      'SELECT * FROM calendar_events WHERE user_id = ? ORDER BY date ASC',
      [userId]
    );
    return res.json({ events: events.rows });
  } catch (err) {
    console.error('getEvents error:', err);
    return res.status(500).json({ error: 'Failed to fetch calendar events' });
  }
}

export async function createEvent(req, res) {
  try {
    const parseResult = eventSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.errors[0].message });
    }

    const { title, date, type, status, description } = parseResult.data;
    const userId = req.user.id;

    const result = await query(
      'INSERT INTO calendar_events (user_id, title, date, type, status, description) VALUES (?, ?, ?, ?, ?, ?) RETURNING *',
      [userId, title, date, type, status || 'pending', description || '']
    );

    const newEvent = result.rows[0] || {
      id: result.lastID,
      user_id: userId,
      title,
      date,
      type,
      status: status || 'pending',
      description: description || ''
    };

    return res.status(201).json({ event: newEvent, message: 'Event added to calendar' });
  } catch (err) {
    console.error('createEvent error:', err);
    return res.status(500).json({ error: 'Failed to create calendar event' });
  }
}

export async function updateEvent(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const parseResult = eventSchema.partial().safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.errors[0].message });
    }

    const updates = parseResult.data;
    const existing = await query('SELECT * FROM calendar_events WHERE id = ? AND user_id = ?', [id, userId]);

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Calendar event not found' });
    }

    const current = existing.rows[0];
    const title = updates.title !== undefined ? updates.title : current.title;
    const date = updates.date !== undefined ? updates.date : current.date;
    const type = updates.type !== undefined ? updates.type : current.type;
    const status = updates.status !== undefined ? updates.status : current.status;
    const description = updates.description !== undefined ? updates.description : current.description;

    await query(
      'UPDATE calendar_events SET title = ?, date = ?, type = ?, status = ?, description = ? WHERE id = ? AND user_id = ?',
      [title, date, type, status, description, id, userId]
    );

    return res.json({ message: 'Event updated successfully' });
  } catch (err) {
    console.error('updateEvent error:', err);
    return res.status(500).json({ error: 'Failed to update calendar event' });
  }
}

export async function deleteEvent(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const resDelete = await query('DELETE FROM calendar_events WHERE id = ? AND user_id = ?', [id, userId]);
    if (resDelete.rowCount === 0) {
      return res.status(404).json({ error: 'Calendar event not found' });
    }

    return res.json({ message: 'Event deleted successfully' });
  } catch (err) {
    console.error('deleteEvent error:', err);
    return res.status(500).json({ error: 'Failed to delete calendar event' });
  }
}
