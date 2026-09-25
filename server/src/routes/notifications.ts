import { Router } from 'express';
import { query } from '../db';
import { requireAuth, requireRoles, RequestWithUser } from '../middleware/auth';
import { createNotification } from '../utils/notifications';

const router = Router();

// Get logged-in user's notifications
router.get('/', requireAuth, async (req: RequestWithUser, res) => {
  try {
    const userId = req.user!.id;
    const notifications = await query(
      `SELECT id, title, message, type, link, is_read, created_at
       FROM notifications
       WHERE user_id = $1 OR user_id IS NULL
       ORDER BY created_at DESC
       LIMIT 50`,
      [userId]
    );

    const unreadCount = await query(
      `SELECT COUNT(*)::int as count
       FROM notifications
       WHERE (user_id = $1 OR user_id IS NULL) AND is_read = FALSE`,
      [userId]
    );

    res.json({
      success: true,
      data: notifications.rows,
      unreadCount: unreadCount.rows[0]?.count || 0,
    });
  } catch (error) {
    console.error('Fetch notifications error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch notifications' });
  }
});

// Mark single notification as read
router.patch('/:id/read', requireAuth, async (req: RequestWithUser, res) => {
  try {
    const { id } = req.params;
    await query(`UPDATE notifications SET is_read = TRUE WHERE id = $1`, [id]);
    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ success: false, error: 'Failed to update notification' });
  }
});

// Mark all as read
router.post('/mark-all-read', requireAuth, async (req: RequestWithUser, res) => {
  try {
    const userId = req.user!.id;
    await query(
      `UPDATE notifications SET is_read = TRUE WHERE user_id = $1 OR user_id IS NULL`,
      [userId]
    );
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all read error:', error);
    res.status(500).json({ success: false, error: 'Failed to mark all as read' });
  }
});

// Admin Broadcast Notification
router.post('/broadcast', requireAuth, requireRoles(['ADMIN', 'SUPER_ADMIN']), async (req: RequestWithUser, res) => {
  try {
    const { title, message, type, link } = req.body;
    if (!title || !message) {
      return res.status(400).json({ success: false, error: 'Title and message are required' });
    }

    const n = await createNotification({
      userId: null,
      title,
      message,
      type: type || 'ANNOUNCEMENT',
      link,
    });

    res.json({
      success: true,
      message: 'Broadcast notification sent successfully to all students!',
      data: n,
    });
  } catch (error) {
    console.error('Broadcast notification error:', error);
    res.status(500).json({ success: false, error: 'Failed to broadcast notification' });
  }
});

export default router;
