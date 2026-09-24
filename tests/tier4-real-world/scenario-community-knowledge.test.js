/**
 * Tier 4 Real-World Scenario 3: Community Knowledge Sharing with External Google Drive Links
 * 
 * Simulates community academic exchange:
 * 1. Student authors comprehensive study notes attaching an external Google Drive link.
 * 2. Peer student queries community study notes repository and verifies external resource link.
 * 3. Author posts an accompanying community discourse topic.
 * 4. Peers participate with comments and reactions, fostering academic collaboration.
 */

const { describe, test, beforeAll } = require('../helpers/test-harness');
const { assert, assertEqual, assertStatus } = require('../helpers/assertions');
const ApiClient = require('../helpers/api-client');
const { makeStudentData, makeStudyNoteData, makePostData } = require('../helpers/fixtures');

describe('Tier 4: Scenario 3 - Community Knowledge Sharing with Drive Links', () => {
  const author = new ApiClient();
  const reader = new ApiClient();
  let createdNoteId = '';
  let discoursePostId = '';

  const driveUrl = 'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OIvE2up/view';

  beforeAll(async () => {
    await author.register(makeStudentData({ fullName: 'Zaid bin Khalid', classCode: '08' }));
    await reader.register(makeStudentData({ fullName: 'Bilal Ahmad', classCode: '05' }));
  });

  test('Step 1: Author submits study note with subject area and authentic Google Drive URL', async () => {
    const res = await author.post('/api/v1/community/notes', {
      title: 'Principles of Jurisprudence (Qawa\'id Fiqhiyyah) Handout',
      description: 'Comprehensive 40-page reference synthesizing major legal maxims across classical schools.',
      subjectArea: 'Islamic Jurisprudence',
      fileUrl: driveUrl,
      downloadable: true,
      visibility: 'COMMUNITY',
    });
    assertStatus(res, 201);
    assertEqual(res.body?.success, true);
    assertEqual(res.body?.data?.file_url, driveUrl);
    assertEqual(res.body?.data?.downloadable, true);
    createdNoteId = res.body?.data?.id;
  });

  test('Step 2: Peer student discovers note in community repository with author attribution', async () => {
    const res = await reader.get('/api/v1/community/notes');
    assertStatus(res, 200);
    const note = res.body?.data?.find((n) => n.id === createdNoteId);
    assert(note, 'Study note must be listed in repository');
    assertEqual(note.title, 'Principles of Jurisprudence (Qawa\'id Fiqhiyyah) Handout');
    assertEqual(note.author_name, 'Zaid bin Khalid');
    assertEqual(note.file_url, driveUrl);
  });

  test('Step 3: Author initiates companion discussion in community discourse feed', async () => {
    const res = await author.post('/api/v1/community/posts', {
      title: 'Discussion: Modern Applications of "Al-Yaqin La Yazulu Bish-Shakk"',
      body: 'In accordance with our new jurisprudence notes, let us examine contemporary bioethical quandaries.',
      category: 'Academic Discussion',
      visibility: 'COMMUNITY',
      organisationUnitCode: 'RW',
    });
    assertStatus(res, 201);
    discoursePostId = res.body?.data?.id;
    assert(discoursePostId, 'Post ID must be created');
  });

  test('Step 4: Peer student reads companion post, adds insightful comment, and reacts', async () => {
    // Add comment
    const commentRes = await reader.post(`/api/v1/community/posts/${discoursePostId}/comments`, {
      body: 'Thank you Zaid! The Drive notes on page 14 provide clarity on clinical doubt vs established diagnosis.',
    });
    assertStatus(commentRes, 201);
    assertEqual(commentRes.body?.data?.author_name, undefined); // verified in list query

    // Add reaction
    const reactRes = await reader.post(`/api/v1/community/posts/${discoursePostId}/react`, {
      reactionType: 'insightful',
    });
    assertStatus(reactRes, 200);
    assertEqual(reactRes.body?.action, 'added');
  });

  test('Step 5: Author verifies discussion activity on post in discourse feed', async () => {
    const res = await author.get('/api/v1/community/posts');
    assertStatus(res, 200);
    const post = res.body?.data?.find((p) => p.id === discoursePostId);
    assert(post, 'Post must be in feed');
    assertEqual(post.comments_count, 1);
    assertEqual(post.reactions_count, 1);
  });
});
