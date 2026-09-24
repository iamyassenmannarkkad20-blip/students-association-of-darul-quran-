/**
 * SADQ Platform E2E Test Suite - Direct Database Helper
 */

const path = require('path');
const { DATABASE_URL } = require('./config');

let Pool;
try {
  // Resolve pg from server node_modules
  const pgPath = path.resolve(__dirname, '../../server/node_modules/pg');
  Pool = require(pgPath).Pool;
} catch (e) {
  try {
    Pool = require('pg').Pool;
  } catch (err) {
    console.warn('PostgreSQL client library not found, DB direct checks will be limited.');
  }
}

let poolInstance = null;

function getPool() {
  if (!Pool) return null;
  if (!poolInstance) {
    poolInstance = new Pool({
      connectionString: DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
      max: 5,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 10000,
    });
    poolInstance.on('error', (err) => {
      console.error('Test DB pool error:', err.message);
    });
  }
  return poolInstance;
}

async function queryDb(sql, params = []) {
  const pool = getPool();
  if (!pool) {
    throw new Error('Database pool not initialized (pg package missing).');
  }
  return pool.query(sql, params);
}

async function closeDb() {
  if (poolInstance) {
    await poolInstance.end();
    poolInstance = null;
  }
}

async function cleanupTestArtifacts() {
  const pool = getPool();
  if (!pool) return;
  try {
    // Delete test users matching our test email pattern e2e_test_%
    await queryDb("DELETE FROM users WHERE email LIKE 'e2e_test_%'");
  } catch (e) {
    // Non-fatal cleanup warning
  }
}

module.exports = {
  getPool,
  queryDb,
  closeDb,
  cleanupTestArtifacts,
};
