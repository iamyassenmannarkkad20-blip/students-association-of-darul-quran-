import { Request, Response, NextFunction } from 'express';
import { query } from '../db';
import { UserRole } from '../../../shared/types';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
  fullName: string;
  profileSlug: string;
  classCode?: string | null;
  isActive: boolean;
}

export interface RequestWithUser extends Request {
  user?: AuthenticatedUser;
}

export const requireAuth = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const sessionId = req.cookies?.sadq_session;

  if (!sessionId) {
    res.status(401).json({
      success: false,
      error: 'Authentication required. No session cookie found.',
    });
    return;
  }

  try {
    const sessionRes = await query(
      `SELECT s.id, s.expires_at, u.id as user_id, u.email, u.role, u.is_active,
              p.full_name, p.profile_slug, p.class_code
       FROM sessions s
       JOIN users u ON s.user_id = u.id
       LEFT JOIN student_profiles p ON p.user_id = u.id
       WHERE s.id = $1 AND s.expires_at > CURRENT_TIMESTAMP AND u.is_active = TRUE`,
      [sessionId]
    );

    if (sessionRes.rows.length === 0) {
      res.clearCookie('sadq_session');
      res.status(401).json({
        success: false,
        error: 'Session expired or invalid.',
      });
      return;
    }

    const row = sessionRes.rows[0];
    req.user = {
      id: row.user_id,
      email: row.email,
      role: row.role as UserRole,
      fullName: row.full_name || 'Member',
      profileSlug: row.profile_slug || '',
      classCode: row.class_code,
      isActive: row.is_active,
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ success: false, error: 'Internal authentication error.' });
  }
};

export const requireRoles = (allowedRoles: UserRole[]) => {
  return (req: RequestWithUser, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Unauthorized.' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: `Forbidden. Requires one of roles: ${allowedRoles.join(', ')}`,
      });
      return;
    }

    next();
  };
};
