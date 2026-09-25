import { Router, Response } from 'express';
import crypto from 'crypto';
import argon2 from 'argon2';
import { z } from 'zod';
import { query, getClient } from '../db';
import { requireAuth, RequestWithUser } from '../middleware/auth';
import { CLASS_CODES, ClassCode, ROLES } from '../../../shared/types';

const router = Router();

// 30 days session
const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000;

const registerSchema = z.object({
  fullName: z.string().min(2).max(100),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
    .optional(),
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  classCode: z.enum(CLASS_CODES as unknown as [ClassCode, ...ClassCode[]]),
});

const loginSchema = z.object({
  identifier: z.string().min(1, 'Username or Email is required').optional(),
  email: z.string().optional(),
  password: z.string().min(1, 'Password is required'),
});

function createSessionCookie(res: Response, sessionId: string) {
  res.cookie('sadq_session', sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION_MS,
    path: '/',
  });
}

// Check Username Availability
router.get('/check-username/:username', async (req, res) => {
  try {
    const rawUsername = req.params.username.toLowerCase().trim();
    if (!/^[a-zA-Z0-9_]{3,30}$/.test(rawUsername)) {
      res.json({ success: true, data: { available: false, message: 'Invalid format (3-30 letters, numbers, underscores)' } });
      return;
    }
    const existing = await query('SELECT id FROM users WHERE LOWER(username) = $1', [rawUsername]);
    res.json({ success: true, data: { available: existing.rows.length === 0 } });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to check username availability' });
  }
});

// Student Registration
router.post('/register', async (req, res) => {
  try {
    const parseResult = registerSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        error: parseResult.error.errors.map((e) => e.message).join(', '),
      });
      return;
    }

    const { fullName, email, password, classCode } = parseResult.data;
    let username = parseResult.data.username?.toLowerCase().trim();

    // Check if email already exists
    const existingEmail = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existingEmail.rows.length > 0) {
      res.status(409).json({ success: false, error: 'An account with this email already exists.' });
      return;
    }

    // Determine or generate unique username
    if (!username) {
      const baseUser = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '') || 'student';
      username = `${baseUser}_${Math.floor(100 + Math.random() * 900)}`;
    }

    const existingUsername = await query('SELECT id FROM users WHERE LOWER(username) = $1', [username]);
    if (existingUsername.rows.length > 0) {
      res.status(409).json({ success: false, error: 'This username is already taken. Please pick another.' });
      return;
    }

    // Profile slug matches username
    const profileSlug = username;

    // Hash password with Argon2id
    const passwordHash = await argon2.hash(password, { type: argon2.argon2id });

    // Begin transaction with dedicated client
    const client = await getClient();
    try {
      await client.query('BEGIN');

      const userRes = await client.query(
        `INSERT INTO users (email, username, password_hash, role)
         VALUES ($1, $2, $3, $4)
         RETURNING id, email, username, role, is_active, created_at`,
        [email.toLowerCase(), username, passwordHash, ROLES.STUDENT]
      );
      const user = userRes.rows[0];

      await client.query(
        `INSERT INTO student_profiles (user_id, full_name, profile_slug, class_code)
         VALUES ($1, $2, $3, $4)`,
        [user.id, fullName, profileSlug, classCode]
      );

      // Create session
      const sessionId = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
      await client.query(
        `INSERT INTO sessions (id, user_id, expires_at)
         VALUES ($1, $2, $3)`,
        [sessionId, user.id, expiresAt]
      );

      await client.query('COMMIT');

      createSessionCookie(res, sessionId);

      res.status(201).json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            role: user.role,
            fullName,
            profileSlug,
            classCode,
          },
        },
      });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, error: 'Registration failed. Please try again.' });
  }
});

// Login (Supports Email OR Username)
router.post('/login', async (req, res) => {
  try {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ success: false, error: 'Invalid login details.' });
      return;
    }

    const loginId = (parseResult.data.identifier || parseResult.data.email || '').toLowerCase().trim();
    const { password } = parseResult.data;

    if (!loginId) {
      res.status(400).json({ success: false, error: 'Please enter your username or email address.' });
      return;
    }

    const userRes = await query(
      `SELECT u.id, u.email, u.username, u.password_hash, u.role, u.is_active,
              sp.full_name, sp.profile_slug, sp.class_code
       FROM users u
       LEFT JOIN student_profiles sp ON sp.user_id = u.id
       WHERE LOWER(u.email) = $1 OR LOWER(u.username) = $1`,
      [loginId]
    );

    if (userRes.rows.length === 0) {
      res.status(401).json({ success: false, error: 'Invalid credentials. User not found.' });
      return;
    }

    const user = userRes.rows[0];

    if (!user.is_active) {
      res.status(403).json({ success: false, error: 'This account has been deactivated.' });
      return;
    }

    const validPassword = await argon2.verify(user.password_hash, password);
    if (!validPassword) {
      res.status(401).json({ success: false, error: 'Invalid credentials. Incorrect password.' });
      return;
    }

    // Create session
    const sessionId = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
    await query(
      `INSERT INTO sessions (id, user_id, expires_at)
       VALUES ($1, $2, $3)`,
      [sessionId, user.id, expiresAt]
    );

    createSessionCookie(res, sessionId);

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
          fullName: user.full_name || 'Administrator',
          profileSlug: user.profile_slug || user.username || '',
          classCode: user.class_code,
        },
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: 'Login failed. Please try again.' });
  }
});

// Logout
router.post('/logout', async (req: RequestWithUser, res) => {
  const sessionId = req.cookies?.sadq_session;
  if (sessionId) {
    await query('DELETE FROM sessions WHERE id = $1', [sessionId]);
  }
  res.clearCookie('sadq_session');
  res.json({ success: true, message: 'Logged out successfully.' });
});

// Get Current User Profile
router.get('/me', requireAuth, async (req: RequestWithUser, res) => {
  try {
    const user = req.user!;
    const profileRes = await query(
      `SELECT * FROM student_profiles WHERE user_id = $1`,
      [user.id]
    );

    // Fetch any sub-wings where user is Chairman or Convener (or all if admin)
    let assignedWings = [];
    if (user.role === ROLES.SUPER_ADMIN || user.role === ROLES.ADMIN) {
      const allWings = await query(
        `SELECT sw.id, sw.code, sw.name, 'Admin Overseer' as leadership_role
         FROM sub_wings sw
         WHERE sw.status = 'ACTIVE'
         ORDER BY sw.code ASC`
      );
      assignedWings = allWings.rows;
    } else {
      const userWings = await query(
        `SELECT sw.id, sw.code, sw.name,
                CASE WHEN sw.chairman_id = $1 THEN 'Chairman'
                     WHEN sw.convener_id = $1 THEN 'Convener'
                     ELSE 'Executive' END as leadership_role
         FROM sub_wings sw
         WHERE sw.status = 'ACTIVE' AND (sw.chairman_id = $1 OR sw.convener_id = $1)
         ORDER BY sw.code ASC`,
        [user.id]
      );
      assignedWings = userWings.rows;
    }

    // Fetch any Class Union where user is Chairman or Convener
    let assignedUnion = null;
    const userUnionRes = await query(
      `SELECT u.*,
              CASE WHEN u.chairman_id = $1 THEN 'Chairman'
                   WHEN u.convener_id = $1 THEN 'Convener'
                   ELSE 'Executive' END as leadership_role
       FROM class_sangadhanakal u
       WHERE u.chairman_id = $1 OR u.convener_id = $1
       LIMIT 1`,
      [user.id]
    );
    if (userUnionRes.rows.length > 0) {
      assignedUnion = userUnionRes.rows[0];
    }

    res.json({
      success: true,
      data: {
        user: {
          ...user,
          assignedSubWings: assignedWings,
          assignedClassUnion: assignedUnion,
        },
        profile: profileRes.rows[0] || null,
        assignedSubWings: assignedWings,
        assignedClassUnion: assignedUnion,
      },
    });
  } catch (error) {
    console.error('Fetch me error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch user data.' });
  }
});

export default router;
