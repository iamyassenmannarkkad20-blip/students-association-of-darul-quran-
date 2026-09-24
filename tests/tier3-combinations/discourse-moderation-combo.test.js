/**
 * Tier 3 Cross-Feature Combination: Post Creation -> Moderation Review -> Community Engagement
 * 
 * Verifies pairwise chain:
 * Public Post Submission -> Status PENDING_REVIEW -> Moderation Queue -> Admin Approval ->
 * Appearance in Feed -> Threaded Comments -> Post Reaction Metrics
 */

const { describe, test, beforeAll } = require('../helpers/test-harness');
const { assert, assertEqual, assertStatus } = require('../helpers/assertions');
const ApiClient = require('../helpers/api-client');
const { SUPER_ADMIN_CREDENTIALS } = require('../helpers/config');
const { makeStudentData, makePostData } = require('../helpers/fixtures');

describe('Tier 3: Combination - Discourse Moderation & Community Engagement Pipeline', () => {
  const authorStudent = new ApiClient();
  const commenterStudent = new ApiClient();
  const adminClient = new ApiClient();
  const publicVisitor = new ApiClient();

  let targetPostId = '';
  const postTitle = `Cross-Milestone Synthesis on Hadith Methodologies #${Date.now()}`;

  beforeAll(async () => {
    await authorStudent.register(makeStudentData({ classCode: '08' }));
    await commenterStudent.register(makeStudentData({ classCode: '06' }));
    await adminClient.login(SUPER_ADMIN_CREDENTIALS.email, SUPER_ADMIN_CREDENTIALS.password);
  });

  test('T3-DSC-01: Step 1 - Student creates public post; flagged as PENDING_REVIEW', async () => {
    const res = await authorStudent.post('/api/v1/community/posts', {
      title: postTitle,
      body: 'Comprehensive analysis of Isnād critical methodology in early compilation treatises.',
      category: 'Research & Studies',
      visibility: 'PUBLIC',
      organisationUnitCode: 'RW',
    });
    assertStatus(res, 201);
    assertEqual(res.body?.data?.status, 'PENDING_REVIEW');
    targetPostId = res.body?.data?.id;
    assert(targetPostId, 'Post ID must be created');
  });

  test('T3-DSC-02: Step 2 - Public visitor feed omits pending review post', async () => {
    const res = await publicVisitor.get('/api/v1/community/posts');
    assertStatus(res, 200);
    const found = res.body?.data?.some((p) => p.id === targetPostId);
    assertEqual(found, false, 'Pending review post must NOT be visible to public before approval');
  });

  test('T3-DSC-03: Step 3 - Admin finds the post in GET /api/v1/admin/pending-queue', async () => {
    const res = await adminClient.get('/api/v1/admin/pending-queue');
    assertStatus(res, 200);
    const postInQueue = res.body?.data?.posts?.find((p) => p.id === targetPostId);
    assert(postInQueue, 'Pending post must appear in admin moderation queue');
    assertEqual(postInQueue.title, postTitle);
  });

  test('T3-DSC-04: Step 4 - Admin approves post via POST /api/v1/admin/moderate', async () => {
    const res = await adminClient.post('/api/v1/admin/moderate', {
      entityType: 'post',
      entityId: targetPostId,
      action: 'APPROVE',
      reason: 'Approved for public publishing after academic verification.',
    });
    assertStatus(res, 200);
    assertEqual(res.body?.success, true);
  });

  test('T3-DSC-05: Step 5 - Approved post appears in public community feed', async () => {
    const res = await publicVisitor.get('/api/v1/community/posts');
    assertStatus(res, 200);
    const foundPost = res.body?.data?.find((p) => p.id === targetPostId);
    assert(foundPost, 'Approved post must now appear in public community feed');
    assertEqual(foundPost.title, postTitle);
  });

  test('T3-DSC-06: Step 6 - Peer student comments on post and adds reaction', async () => {
    // Add comment
    const commentRes = await commenterStudent.post(`/api/v1/community/posts/${targetPostId}/comments`, {
      body: 'Pioneering analysis. Would love to see additional commentary on modern application.',
    });
    assertStatus(commentRes, 201);

    // Add reaction
    const reactRes = await commenterStudent.post(`/api/v1/community/posts/${targetPostId}/react`, {
      reactionType: 'appreciate',
    });
    assertStatus(reactRes, 200);
    assertEqual(reactRes.body?.action, 'added');

    // Verify counters updated
    const feedRes = await publicVisitor.get('/api/v1/community/posts');
    const updatedPost = feedRes.body?.data?.find((p) => p.id === targetPostId);
    assert(updatedPost, 'Post found in feed');
    assert(updatedPost.comments_count >= 1, 'Comments count must be >= 1');
    assert(updatedPost.reactions_count >= 1, 'Reactions count must be >= 1');
  });
});
