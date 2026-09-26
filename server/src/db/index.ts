import { Pool, QueryResult, QueryResultRow } from 'pg';
import dotenv from 'dotenv';

import fs from 'fs';
import path from 'path';

[
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), 'server/.env'),
  path.resolve(__dirname, '../../.env'),
  path.resolve(__dirname, '../../../../.env'),
  path.resolve(__dirname, '../../../../server/.env'),
].forEach((envPath) => {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
  }
});
dotenv.config();

let connectionString =
  process.env.DATABASE_URL ||
  'postgresql://postgres.dkqynklzwhgamtvgvpih:NYZORA%20%40123@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres';

// Automatically upgrade legacy IPv6-only Supabase direct host to IPv4 Pooler for cloud environments
if (connectionString.includes('db.dkqynklzwhgamtvgvpih.supabase.co')) {
  connectionString = connectionString
    .replace('db.dkqynklzwhgamtvgvpih.supabase.co', 'aws-0-ap-northeast-1.pooler.supabase.com')
    .replace('://postgres:', '://postgres.dkqynklzwhgamtvgvpih:');
}

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

pool.on('error', (err) => {
  console.error('Unexpected database pool error:', err);
});

export const query = async <T extends QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> => {
  const start = Date.now();
  const res = await pool.query<T>(text, params);
  const duration = Date.now() - start;
  if (process.env.NODE_ENV === 'development') {
    // Only log query duration if needed
    // console.log('executed query', { text, duration, rows: res.rowCount });
  }
  return res;
};

export const getClient = () => pool.connect();

export default pool;
