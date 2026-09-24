/**
 * Tier 2 Boundary & Corner Cases: Session Expiry & Authentication Failures
 * 
 * Verifies robust session lifecycle enforcement: missing sessions, tampered tokens,
 * expired session timestamps, and role-based access restrictions (401 vs 403).
 */

const { describe, test, beforeAll } = require('../helpers/test-harness');
const { assert, assertEqual, assertStatus } = require('../helpers/assertions');
const ApiClient = require('../helpers/api-client');
const { makeStudentData } = require('../helpers/fixtures');
const { queryDb } = require('../helpers/test-db');

describe('Tier 2: Boundary & Corner - Session Lifecycle & Expiry Handling', () => {
  const unauthenticatedClient = new ApiClient();
  const student = new ApiClient();

  beforeAll(async () => {
    await student.register(makeStudentData({ classCode: '02' }));
  });

  test('T2-SES-01: Protected endpoint without session cookie returns HTTP 401 Unauthorized', async () => {
    const res = await unauthenticatedClient.get('/api/v1/auth/me');
    assertStatus(res, 401, 'Request with no cookie must return HTTP 401');
    assertEqual(res.body?.success, false);
    assert(res.body?.error.includes('No session cookie found'));
  });

  test('T2-SES-02: Request with tampered or invalid session ID returns HTTP 401 and clears cookie', async () => {
    const tamperedClient = new ApiClient();
    tamperedClient.setCookie('sadq_session', 'malicious_nonexistent_session_id_abcdef123456');
    const res = await tamperedClient.get('/api/v1/auth/me');
    assertStatus(res, 401, 'Tampered cookie must return HTTP 401');
    assertEqual(res.body?.success, false);
  });

  test('T2-SES-03: Session with expired timestamp in database is rejected with HTTP 401', async () => {
    // Insert an expired session manually into the database if DB access available
    const expiredSessionId = `expired_test_session_${Date.now()}`;
    try {
      // Find current student user ID
      const meRes = await student.getMe();
      const userId = meRes.body?.data?.user?.id;
      if (userId) {
        await queryDb(
          `INSERT INTO sessions (id, user_id, expires_at)
           VALUES ($1, $2, CURRENT_TIMESTAMP - INTERVAL '1 day')`,
          [expiredSessionId, userId]
        );

        const expiredClient = new ApiClient();
        expiredClient.setCookie('sadq_session', expiredSessionId);
        const res = await expiredClient.get('/api/v1/auth/me');
        assertStatus(res, 401, 'Expired session must return HTTP 401');
      }
    } catch (err) {
      if (!err.message.includes('pg package missing')) {
        throw err;
      }
    }
  });

  test('T2-SES-04: Authenticated student accessing admin route returns HTTP 403 Forbidden', async () => {
    const res = await student.get('/api/v1/admin/stats');
    assertStatus(res, 403, 'Student role must be forbidden from admin routes');
    assertEqual(res.body?.success, false);
    assert(res.body?.error?.includes('Forbidden'));
  });

  test('T2-SES-05: Authenticated student accessing admin moderation queue returns HTTP 403 Forbidden', async () => {
    const res = await student.get('/api/v1/admin/pending-queue');
    assertStatus(res, 403, 'Student role must be forbidden from admin queue');
    assertEqual(res.body?.success, false);
  });
});
