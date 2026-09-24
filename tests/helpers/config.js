/**
 * SADQ Platform E2E Test Suite - Configuration & Constants
 */

const path = require('path');
const fs = require('fs');

// Read server/.env if available
let envConfig = {};
const serverEnvPath = path.resolve(__dirname, '../../server/.env');
if (fs.existsSync(serverEnvPath)) {
  const content = fs.readFileSync(serverEnvPath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim();
        envConfig[key] = val;
      }
    }
  }
}

module.exports = {
  API_URL: process.env.API_URL || 'http://localhost:5000',
  DATABASE_URL:
    process.env.DATABASE_URL ||
    envConfig.DATABASE_URL ||
    'postgresql://postgres:NYZORA%20%40123@db.dkqynklzwhgamtvgvpih.supabase.co:5432/postgres',
  
  SUPER_ADMIN_CREDENTIALS: {
    email: 'admin@sadq.org',
    password: 'SadqAdmin@2026',
  },

  OFFICIAL_UNITS: [
    { code: 'EB', name: 'Excellence Bureau' },
    { code: 'IA', name: 'Islamic Arts' },
    { code: 'MPW', name: 'Media & Publishing Wing' },
    { code: 'MB', name: 'Medical Board' },
    { code: 'LB', name: 'Literary Board' },
    { code: 'RW', name: 'Research Wing' },
    { code: 'CS', name: 'Campus Squad' },
    { code: 'DW', name: 'Da\'wah Wing' },
    { code: 'LIB', name: 'Library Board' },
    { code: 'SB', name: 'Samajam Board' },
  ],

  OFFICIAL_UNIT_CODES: ['EB', 'IA', 'MPW', 'MB', 'LB', 'RW', 'CS', 'DW', 'LIB', 'SB'],

  OFFICIAL_ROLES: ['SUPER_ADMIN', 'ADMIN', 'TEACHER', 'ORGANISATION_ADMIN', 'STUDENT'],

  OFFICIAL_CLASS_CODES: ['01', '02', '03', '04', '05', '06', '07', '08'],

  OFFICIAL_YOUTUBE_VIDEOS: ['loBBhKjIQZM', 'WhdDqjPkxD8', '3oKM3MJ012I'],

  SKILL_PROFICIENCIES: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'],

  REACTION_TYPES: ['like', 'insightful', 'appreciate'],

  VERIFIED_EMPTY_STATE_STRING: 'will be published after verification',
};
