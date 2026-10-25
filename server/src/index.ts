import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import publicRoutes from './routes/public';
import studentRoutes from './routes/student';
import communityRoutes from './routes/community';
import adminRoutes from './routes/admin';
import leaderboardRoutes from './routes/leaderboard';
import subwingRoutes from './routes/subwings';
import cyclesRoutes from './routes/cycles';
import classUnionRoutes from './routes/classUnions';
import notificationsRoutes from './routes/notifications';
import { query } from './db';
import argon2 from 'argon2';
import { ROLES } from '../../shared/types';

import path from 'path';
import fs from 'fs';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);

// Ensure uploads/avatars directory exists
const uploadsDir = path.join(__dirname, '../uploads/avatars');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Security & Parsing Middlewares
app.use(
  helmet({
    contentSecurityPolicy: false, // allow rich previews and media embeds
    crossOriginEmbedderPolicy: false,
  })
);

app.use(
  cors({
    origin: (origin, callback) => {
      // Permit non-browser requests and only explicitly configured browser origins.
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Origin is not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));


// Health Check
app.get('/api/v1/health', async (_req, res) => {
  try {
    const dbTest = await query('SELECT NOW() as now');
    res.json({
      status: 'healthy',
      time: dbTest.rows[0].now,
      service: 'SADQ Platform API',
    });
  } catch (err: any) {
    res.status(500).json({ status: 'unhealthy', error: err.message });
  }
});

// Mount Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/public', publicRoutes);
app.use('/api/v1/students', studentRoutes);
app.use('/api/v1/community', communityRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/leaderboard', leaderboardRoutes);
app.use('/api/v1/subwings', subwingRoutes);
app.use('/api/v1/cycles', cyclesRoutes);
app.use('/api/v1/class-unions', classUnionRoutes);
app.use('/api/v1/notifications', notificationsRoutes);

// Serve Client SPA for all non-API web routes
const candidateDistPaths = [
  path.resolve(process.cwd(), '../client/dist'),
  path.resolve(process.cwd(), 'client/dist'),
  path.resolve(__dirname, '../../../../client/dist'),
  path.resolve(__dirname, '../../client/dist'),
];
const clientDistPath = candidateDistPaths.find((p) => fs.existsSync(p)) || candidateDistPaths[0];

if (fs.existsSync(clientDistPath)) {
  console.log(`[PRODUCTION] Serving client SPA from: ${clientDistPath}`);
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Error handling middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    success: false,
    error: 'An unexpected server error occurred.',
  });
});

// Seed default Super Admin if none exists
async function ensureSuperAdmin() {
  try {
    const adminCheck = await query(
      `SELECT id FROM users WHERE role = $1`,
      [ROLES.SUPER_ADMIN]
    );

    if (adminCheck.rows.length === 0) {
      console.log('--- Initializing default Super Admin account ---');
      const defaultEmail = process.env.INITIAL_SUPER_ADMIN_EMAIL;
      const defaultPassword = process.env.INITIAL_SUPER_ADMIN_PASSWORD;
      if (!defaultEmail || !defaultPassword) {
        console.warn('No Super Admin exists. Set INITIAL_SUPER_ADMIN_EMAIL and INITIAL_SUPER_ADMIN_PASSWORD in the hosting environment to create one securely.');
        return;
      }
      const passwordHash = await argon2.hash(defaultPassword, { type: argon2.argon2id });

      await query(
        `INSERT INTO users (email, password_hash, role)
         VALUES ($1, $2, $3)`,
        [defaultEmail, passwordHash, ROLES.SUPER_ADMIN]
      );
      console.log(`[INFO] Initial Super Admin account created for ${defaultEmail}. Set a unique strong password and remove the initial admin environment variables after deployment.`);
    }
  } catch (error) {
    console.error('Super admin setup check error:', error);
  }
}

app.listen(Number(PORT), '0.0.0.0', async () => {
  console.log(`=================================================`);
  console.log(` SADQ API Server running on port ${PORT}`);
  console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(` Allowed client origins: ${allowedOrigins.join(', ')}`);
  console.log(`=================================================`);
  await ensureSuperAdmin();
});
