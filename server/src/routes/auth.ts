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
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  classCode: z.enum(CLASS_CODES as unknown as [ClassCode, ...ClassCode[]]),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
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

    // Check if user already exists
    const existing = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length > 0) {
      res.status(409).json({ success: false, error: 'An account with this email already exists.' });
      return;
    }

    // Generate unique slug from name
    const baseSlug = fullName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const profileSlug = `${baseSlug}-${randomSuffix}`;

    // Hash password with Argon2id
    const passwordHash = await argon2.hash(password, { type: argon2.argon2id });

    // Begin transaction with dedicated client
    const client = await getClient();
    try {
      await client.query('BEGIN');

      const userRes = await client.query(
        `INSERT INTO users (email, password_hash, role)
         VALUES ($1, $2, $3)
         RETURNING id, email, role, is_active, created_at`,
        [email.toLowerCase(), passwordHash, ROLES.STUDENT]
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

// Login
router.post('/login', async (req, res) => {
  try {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ success: false, error: 'Invalid email or password format.' });
      return;
    }

    const { email, password } = parseResult.data;

    const userRes = await query(
      `SELECT u.id, u.email, u.password_hash, u.role, u.is_active,
              sp.full_name, sp.profile_slug, sp.class_code
       FROM users u
       LEFT JOIN student_profiles sp ON sp.user_id = u.id
       WHERE u.email = $1`,
      [email.toLowerCase()]
    );

    if (userRes.rows.length === 0) {
      res.status(401).json({ success: false, error: 'Invalid credentials.' });
      return;
    }

    const user = userRes.rows[0];

    if (!user.is_active) {
      res.status(403).json({ success: false, error: 'This account has been deactivated.' });
      return;
    }

    const validPassword = await argon2.verify(user.password_hash, password);
    if (!validPassword) {
      res.status(401).json({ success: false, error: 'Invalid credentials.' });
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
          role: user.role,
          fullName: user.full_name || 'Administrator',
          profileSlug: user.profile_slug || '',
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

    res.json({
      success: true,
      data: {
        user,
        profile: profileRes.rows[0] || null,
      },
    });
  } catch (error) {
    console.error('Fetch me error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch user data.' });
  }
});

export default router;
