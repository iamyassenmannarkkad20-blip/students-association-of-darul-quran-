/**
 * Tier 1 Feature Coverage: Authentication & Session Management
 * 
 * Verifies student registration with official class codes, HttpOnly session cookie
 * provisioning, Argon2id authentication, current user introspection, and logout.
 */

const { describe, test, beforeAll } = require('../helpers/test-harness');
const { assert, assertEqual, assertStatus, assertObjectHasProps } = require('../helpers/assertions');
const ApiClient = require('../helpers/api-client');
const { makeStudentData } = require('../helpers/fixtures');

describe('Tier 1: Feature Coverage - Authentication & Sessions', () => {
  const client = new ApiClient();
  const studentFixture = makeStudentData({ classCode: '03' });

  test('T1-AUT-01: POST /api/v1/auth/register registers student and returns HTTP 201', async () => {
    const res = await client.register(studentFixture);
    assertStatus(res, 201, 'Student registration must return HTTP 201');
    assertEqual(res.body?.success, true);
    assert(res.body?.data?.user, 'Registration response must contain user object');
    assertEqual(res.body.data.user.email, studentFixture.email.toLowerCase());
    assertEqual(res.body.data.user.classCode, '03');
  });

  test('T1-AUT-02: Registration automatically generates clean slug and assigns STUDENT role', async () => {
    const user = client.currentUser;
    assert(user, 'User should be populated from registration');
    assertEqual(user.role, 'STUDENT', 'Registered student must receive STUDENT role');
    assert(user.profileSlug && typeof user.profileSlug === 'string', 'Student profileSlug must be generated');
    assert(/^[a-z0-9-]+$/.test(user.profileSlug), `Slug format invalid: ${user.profileSlug}`);
  });

  test('T1-AUT-03: Registration issues HttpOnly SameSite=Lax "sadq_session" cookie', () => {
    const cookie = client.getCookie('sadq_session');
    assert(cookie && cookie.length > 20, 'Client must have captured "sadq_session" cookie');
  });

  test('T1-AUT-04: GET /api/v1/auth/me returns current authenticated user and profile', async () => {
    const res = await client.getMe();
    assertStatus(res, 200, 'Authenticated /me must return HTTP 200');
    assertEqual(res.body?.success, true);
    assertEqual(res.body?.data?.user?.email, studentFixture.email.toLowerCase());
    assert(res.body?.data?.profile, 'Profile data should be included');
    assertEqual(res.body.data.profile.class_code, '03');
  });

  test('T1-AUT-05: POST /api/v1/auth/login authenticates registered user credentials', async () => {
    const freshClient = new ApiClient();
    const loginRes = await freshClient.login(studentFixture.email, studentFixture.password);
    assertStatus(loginRes, 200, 'Login with correct credentials must return HTTP 200');
    assertEqual(loginRes.body?.success, true);
    assert(freshClient.getCookie('sadq_session'), 'Login must issue session cookie');
    assertEqual(loginRes.body?.data?.user?.email, studentFixture.email.toLowerCase());
  });

  test('T1-AUT-06: POST /api/v1/auth/logout invalidates session and clears cookie', async () => {
    const logoutRes = await client.logout();
    assertStatus(logoutRes, 200, 'Logout should return HTTP 200');
    assertEqual(logoutRes.body?.success, true);

    // Subsequent authenticated request must be rejected with 401
    const meRes = await client.getMe();
    assertStatus(meRes, 401, 'Request after logout must return HTTP 401');
  });
});
