/**
 * Tier 1 Feature Coverage: Security, Sessions & Admin Moderation
 * 
 * Verifies admin dashboard statistics, pending moderation queue retrieval,
 * content moderation actions (APPROVE, REJECT), and config updates.
 */

const { describe, test, beforeAll } = require('../helpers/test-harness');
const { assert, assertEqual, assertStatus } = require('../helpers/assertions');
const ApiClient = require('../helpers/api-client');
const { SUPER_ADMIN_CREDENTIALS } = require('../helpers/config');
const { makePostData, makeStudentData } = require('../helpers/fixtures');

describe('Tier 1: Feature Coverage - Admin Moderation & Control', () => {
  const admin = new ApiClient();
  const student = new ApiClient();
  let pendingPostId = '';

  beforeAll(async () => {
    // Login as default seeded Super Admin
    const loginRes = await admin.login(
      SUPER_ADMIN_CREDENTIALS.email,
      SUPER_ADMIN_CREDENTIALS.password
    );
    assertStatus(loginRes, 200, 'Super admin login failed');

    // Create a student and submit a public post that triggers PENDING_REVIEW
    await student.register(makeStudentData({ classCode: '04' }));
    const postRes = await student.post(
      '/api/v1/community/posts',
      makePostData({ visibility: 'PUBLIC' })
    );
    assertStatus(postRes, 201, 'Student post creation failed');
    pendingPostId = postRes.body?.data?.id;
  });

  test('T1-MOD-01: GET /api/v1/admin/stats returns real counts of users, students, posts, units', async () => {
    const res = await admin.get('/api/v1/admin/stats');
    assertStatus(res, 200, 'Admin stats must return HTTP 200');
    assertEqual(res.body?.success, true);
    const stats = res.body?.data;
    assert(typeof stats.totalUsers === 'number', 'totalUsers must be a number');
    assert(typeof stats.totalStudents === 'number', 'totalStudents must be a number');
    assert(typeof stats.totalPosts === 'number', 'totalPosts must be a number');
    assert(typeof stats.pendingReviewCount === 'number', 'pendingReviewCount must be a number');
    assertEqual(stats.organisationUnits, 10, 'Expected 10 organisation units in live stats');
  });

  test('T1-MOD-02: GET /api/v1/admin/pending-queue returns pending submissions', async () => {
    const res = await admin.get('/api/v1/admin/pending-queue');
    assertStatus(res, 200, 'Pending queue must return HTTP 200');
    assertEqual(res.body?.success, true);
    assert(Array.isArray(res.body?.data?.posts), 'posts must be an array');
    assert(Array.isArray(res.body?.data?.articles), 'articles must be an array');
    assert(Array.isArray(res.body?.data?.library), 'library must be an array');
  });

  test('T1-MOD-03: POST /api/v1/admin/moderate approves pending post', async () => {
    assert(pendingPostId, 'pendingPostId required for moderation approval');
    const res = await admin.post('/api/v1/admin/moderate', {
      entityType: 'post',
      entityId: pendingPostId,
      action: 'APPROVE',
      reason: 'Meets academic quality standards and community guidelines.',
    });
    assertStatus(res, 200, 'Moderation approve must return HTTP 200');
    assertEqual(res.body?.success, true);
  });

  test('T1-MOD-04: POST /api/v1/admin/moderate rejects content when reason provided', async () => {
    // Create another post to reject
    const postRes = await student.post(
      '/api/v1/community/posts',
      makePostData({ visibility: 'PUBLIC' })
    );
    const postIdToReject = postRes.body?.data?.id;
    assert(postIdToReject, 'Post to reject created');

    const res = await admin.post('/api/v1/admin/moderate', {
      entityType: 'post',
      entityId: postIdToReject,
      action: 'REJECT',
      reason: 'Requires further revision and citation details.',
    });
    assertStatus(res, 200, 'Moderation reject must return HTTP 200');
    assertEqual(res.body?.success, true);
  });

  test('T1-MOD-05: PATCH /api/v1/admin/config updates public site configuration', async () => {
    const res = await admin.patch('/api/v1/admin/config', {
      officialEmail: 'contact@sadq.org',
      channelsConfirmed: true,
    });
    assertStatus(res, 200, 'Config update must return HTTP 200');
    assertEqual(res.body?.success, true);
    assertEqual(res.body?.data?.official_email, 'contact@sadq.org');
    assertEqual(res.body?.data?.channels_confirmed, true);
  });
});
