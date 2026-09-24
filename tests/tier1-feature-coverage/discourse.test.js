/**
 * Tier 1 Feature Coverage: Community Discourse & Create Center
 * 
 * Verifies discourse feed, post creation, unique reactions (like, insightful, appreciate),
 * threaded comments, and study notes with Google Drive links.
 */

const { describe, test, beforeAll } = require('../helpers/test-harness');
const { assert, assertEqual, assertStatus, assertArrayLength } = require('../helpers/assertions');
const ApiClient = require('../helpers/api-client');
const { makeStudentData, makePostData, makeStudyNoteData } = require('../helpers/fixtures');

describe('Tier 1: Feature Coverage - Community Discourse & Notes', () => {
  const author = new ApiClient();
  const reader = new ApiClient();
  let createdPostId = '';

  beforeAll(async () => {
    await author.register(makeStudentData({ classCode: '06' }));
    await reader.register(makeStudentData({ classCode: '07' }));
  });

  test('T1-DSC-01: GET /api/v1/community/posts returns community feed', async () => {
    const res = await reader.get('/api/v1/community/posts');
    assertStatus(res, 200, 'Feed retrieval must return HTTP 200');
    assertEqual(res.body?.success, true);
    assert(Array.isArray(res.body?.data), 'Posts feed must be an array');
  });

  test('T1-DSC-02: POST /api/v1/community/posts creates community post with PUBLISHED status', async () => {
    const postPayload = makePostData({ visibility: 'COMMUNITY' });
    const res = await author.post('/api/v1/community/posts', postPayload);
    assertStatus(res, 201, 'Post creation must return HTTP 201');
    assertEqual(res.body?.success, true);
    assert(res.body?.data?.id, 'Created post must return ID');
    assertEqual(res.body?.data?.status, 'PUBLISHED');
    createdPostId = res.body.data.id;
  });

  test('T1-DSC-03: POST /api/v1/community/posts/:id/react adds a valid reaction', async () => {
    assert(createdPostId, 'createdPostId required for reaction test');
    const res = await reader.post(`/api/v1/community/posts/${createdPostId}/react`, {
      reactionType: 'insightful',
    });
    assertStatus(res, 200, 'Reaction must return HTTP 200');
    assertEqual(res.body?.success, true);
    assertEqual(res.body?.action, 'added');
    assertEqual(res.body?.reactionType, 'insightful');
  });

  test('T1-DSC-04: POST /api/v1/community/posts/:id/comments adds comment to post', async () => {
    assert(createdPostId, 'createdPostId required for comment test');
    const commentPayload = { body: 'Excellent analysis of classical tafsir hermeneutics.' };
    const res = await reader.post(`/api/v1/community/posts/${createdPostId}/comments`, commentPayload);
    assertStatus(res, 201, 'Comment creation must return HTTP 201');
    assertEqual(res.body?.success, true);
    assertEqual(res.body?.data?.body, commentPayload.body);
  });

  test('T1-DSC-05: GET /api/v1/community/posts/:id/comments retrieves post comments list', async () => {
    assert(createdPostId, 'createdPostId required');
    const res = await reader.get(`/api/v1/community/posts/${createdPostId}/comments`);
    assertStatus(res, 200);
    assertEqual(res.body?.success, true);
    assert(Array.isArray(res.body?.data), 'Comments data must be an array');
    assert(res.body.data.length >= 1, 'Expected at least one comment returned');
  });

  test('T1-DSC-06: POST /api/v1/community/notes submits study note with Google Drive URL', async () => {
    const notePayload = makeStudyNoteData({ visibility: 'COMMUNITY' });
    const res = await author.post('/api/v1/community/notes', notePayload);
    assertStatus(res, 201, 'Study note submission must return HTTP 201');
    assertEqual(res.body?.success, true);
    assertEqual(res.body?.data?.subject_area, notePayload.subjectArea);
    assert(res.body.data.file_url.includes('drive.google.com'), 'Drive link must be preserved');
  });

  test('T1-DSC-07: GET /api/v1/community/notes lists available study resources', async () => {
    const res = await reader.get('/api/v1/community/notes');
    assertStatus(res, 200);
    assertEqual(res.body?.success, true);
    assert(Array.isArray(res.body?.data), 'Notes data must be an array');
  });
});
