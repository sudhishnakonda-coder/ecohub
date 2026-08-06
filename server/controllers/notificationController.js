import { query } from '../config/db.js';

export async function getNotifications(req, res) {
  try {
    const userId = req.user.id;
    const notifs = await query(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY id DESC LIMIT 50',
      [userId]
    );
    return res.json({ notifications: notifs.rows });
  } catch (err) {
    console.error('getNotifications error:', err);
    return res.status(500).json({ error: 'Failed to fetch notifications' });
  }
}

export async function markAsRead(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (id === 'all') {
      await query('UPDATE notifications SET is_read = true WHERE user_id = ?', [userId]);
      return res.json({ message: 'All notifications marked as read' });
    }

    await query('UPDATE notifications SET is_read = true WHERE id = ? AND user_id = ?', [id, userId]);
    return res.json({ message: 'Notification marked as read' });
  } catch (err) {
    console.error('markAsRead error:', err);
    return res.status(500).json({ error: 'Failed to update notification' });
  }
}
