import { query } from '../db';

export type NotificationType =
  | 'RESULT_PUBLISHED'
  | 'CERTIFICATE_ISSUED'
  | 'SCORE_CHANGED'
  | 'ANNOUNCEMENT'
  | 'LEADERSHIP_ASSIGNED'
  | 'GENERAL';

export interface CreateNotificationParams {
  userId?: string | null; // null for broadcast
  title: string;
  message: string;
  type: NotificationType;
  link?: string;
}

export async function createNotification(params: CreateNotificationParams) {
  try {
    const res = await query(
      `INSERT INTO notifications (user_id, title, message, type, link)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [params.userId || null, params.title, params.message, params.type, params.link || null]
    );
    return res.rows[0];
  } catch (error) {
    console.error('Failed to create notification:', error);
    return null;
  }
}
