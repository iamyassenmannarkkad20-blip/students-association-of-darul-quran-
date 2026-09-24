/**
 * Tier 2 Boundary & Corner Cases: Single Reaction System & Toggle Logic
 * 
 * Verifies single-reaction constraint per user: adding a reaction, toggling it off
 * on identical click, and smoothly transitioning between allowed types (like, insightful, appreciate).
 */

const { describe, test, beforeAll } = require('../helpers/test-harness');
const { assert, assertEqual, assertStatus } = require('../helpers/assertions');
const ApiClient = require('../helpers/api-client');
const { makeStudentData, makePostData } = require('../helpers/fixtures');

describe('Tier 2: Boundary & Corner - Reaction Toggle & Single-Reaction Constraint', () => {
  const author = new ApiClient();
  const voter = new ApiClient();
  const guest = new ApiClient();
  let postId = '';

  beforeAll(async () => {
    await author.register(makeStudentData({ classCode: '03' }));
    await voter.register(makeStudentData({ classCode: '04' }));

    const postRes = await author.post(
      '/api/v1/community/posts',
      makePostData({ visibility: 'COMMUNITY' })
    );
    assertStatus(postRes, 201);
    postId = postRes.body?.data?.id;
  });

  test('T2-RCT-01: Reacting with "like" adds reaction (action: "added")', async () => {
    const res = await voter.post(`/api/v1/community/posts/${postId}/react`, {
      reactionType: 'like',
    });
    assertStatus(res, 200);
    assertEqual(res.body?.success, true);
    assertEqual(res.body?.action, 'added');
    assertEqual(res.body?.reactionType, 'like');
  });

  test('T2-RCT-02: Reacting again with identical "like" toggles it OFF (action: "removed")', async () => {
    const res = await voter.post(`/api/v1/community/posts/${postId}/react`, {
      reactionType: 'like',
    });
    assertStatus(res, 200);
    assertEqual(res.body?.success, true);
    assertEqual(res.body?.action, 'removed');
  });

  test('T2-RCT-03: Reacting with "insightful" re-adds a reaction', async () => {
    const res = await voter.post(`/api/v1/community/posts/${postId}/react`, {
      reactionType: 'insightful',
    });
    assertStatus(res, 200);
    assertEqual(res.body?.action, 'added');
    assertEqual(res.body?.reactionType, 'insightful');
  });

  test('T2-RCT-04: Changing reaction from "insightful" to "appreciate" updates without duplicating', async () => {
    const res = await voter.post(`/api/v1/community/posts/${postId}/react`, {
      reactionType: 'appreciate',
    });
    assertStatus(res, 200);
    assertEqual(res.body?.action, 'updated');
    assertEqual(res.body?.reactionType, 'appreciate');
  });

  test('T2-RCT-05: Rejects unsupported reaction types (e.g. "dislike", "heart", "smile") with HTTP 400', async () => {
    const invalidTypes = ['dislike', 'heart', 'smile', 'angry'];
    for (const rType of invalidTypes) {
      const res = await voter.post(`/api/v1/community/posts/${postId}/react`, {
        reactionType: rType,
      });
      assertStatus(res, 400, `Reaction type "${rType}" must be rejected`);
      assertEqual(res.body?.success, false);
    }
  });

  test('T2-RCT-06: Unauthenticated user reaction request is rejected with HTTP 401', async () => {
    const res = await guest.post(`/api/v1/community/posts/${postId}/react`, {
      reactionType: 'like',
    });
    assertStatus(res, 401, 'Guest reaction attempt must return HTTP 401');
  });
});
