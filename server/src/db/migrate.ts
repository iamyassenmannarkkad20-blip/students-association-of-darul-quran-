import fs from 'fs';
import path from 'path';
import pool from './index';

async function runMigrations() {
  console.log('--- Running SADQ Database Migrations ---');
  const migrationPath = path.join(__dirname, 'migrations', '001_initial_schema.sql');
  const sql = fs.readFileSync(migrationPath, 'utf8');

  const client = await pool.connect();
  try {
    console.log('Connected to Supabase PostgreSQL. Executing schema...');
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
    console.log('SUCCESS: All SADQ database tables and constraints created successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations();
