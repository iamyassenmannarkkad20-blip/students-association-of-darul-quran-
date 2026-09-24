/**
 * Tier 1 Feature Coverage: Student Growth & Portfolios
 * 
 * Verifies student dashboard metrics, skills, talents, achievements,
 * collaborative projects, privacy controls, and public portfolio aggregation.
 */

const { describe, test, beforeAll } = require('../helpers/test-harness');
const { assert, assertEqual, assertStatus, assertArrayLength } = require('../helpers/assertions');
const ApiClient = require('../helpers/api-client');
const {
  makeStudentData,
  makeTalentData,
  makeSkillData,
  makeAchievementData,
  makeProjectData,
} = require('../helpers/fixtures');

describe('Tier 1: Feature Coverage - Student Portfolios & Growth', () => {
  const student = new ApiClient();
  const studentData = makeStudentData({ classCode: '05' });
  let profileSlug = '';

  beforeAll(async () => {
    const regRes = await student.register(studentData);
    assertStatus(regRes, 201, 'Student setup registration failed');
    profileSlug = regRes.body.data.user.profileSlug;
  });

  test('T1-POR-01: GET /api/v1/students/dashboard returns student growth overview & counts', async () => {
    const res = await student.get('/api/v1/students/dashboard');
    assertStatus(res, 200);
    assertEqual(res.body?.success, true);
    assert(res.body?.data?.counts !== undefined, 'Dashboard must include item counts');
    assert(typeof res.body.data.completionPercentage === 'number', 'Must include completion percentage');
  });

  test('T1-POR-02: POST /api/v1/students/talents adds a creative talent record', async () => {
    const talentPayload = makeTalentData({ visibility: 'PUBLIC' });
    const res = await student.post('/api/v1/students/talents', talentPayload);
    assertStatus(res, 201, 'Talent creation must return HTTP 201');
    assertEqual(res.body?.success, true);
    assertEqual(res.body?.data?.title, talentPayload.title);
  });

  test('T1-POR-03: POST /api/v1/students/skills adds proficiency-graded skill', async () => {
    const skillPayload = makeSkillData({ proficiency: 'ADVANCED' });
    const res = await student.post('/api/v1/students/skills', skillPayload);
    assertStatus(res, 201, 'Skill creation must return HTTP 201');
    assertEqual(res.body?.success, true);
    assertEqual(res.body?.data?.proficiency, 'ADVANCED');
  });

  test('T1-POR-04: POST /api/v1/students/achievements records verified milestone', async () => {
    const achPayload = makeAchievementData({ visibility: 'PUBLIC' });
    const res = await student.post('/api/v1/students/achievements', achPayload);
    assertStatus(res, 201, 'Achievement creation must return HTTP 201');
    assertEqual(res.body?.success, true);
    assertEqual(res.body?.data?.title, achPayload.title);
  });

  test('T1-POR-05: POST /api/v1/students/projects adds collaborative project', async () => {
    const projPayload = makeProjectData({ visibility: 'PUBLIC' });
    const res = await student.post('/api/v1/students/projects', projPayload);
    assertStatus(res, 201, 'Project creation must return HTTP 201');
    assertEqual(res.body?.success, true);
    assertEqual(res.body?.data?.title, projPayload.title);
  });

  test('T1-POR-06: PATCH /api/v1/students/profile updates bio and privacy flags', async () => {
    const updatePayload = {
      bio: 'Enthusiastic scholar in Islamic calligraphy and research.',
      isPublic: true,
      showTalents: true,
      showSkills: true,
      showAchievements: true,
      showProjects: true,
    };
    const res = await student.patch('/api/v1/students/profile', updatePayload);
    assertStatus(res, 200, 'Profile update must return HTTP 200');
    assertEqual(res.body?.data?.is_public, true);
    assertEqual(res.body?.data?.bio, updatePayload.bio);
  });

  test('T1-POR-07: GET /api/v1/public/portfolio/:slug returns comprehensive public portfolio', async () => {
    const publicClient = new ApiClient();
    const res = await publicClient.get(`/api/v1/public/portfolio/${profileSlug}`);
    assertStatus(res, 200, 'Public portfolio retrieval must return HTTP 200');
    assertEqual(res.body?.success, true);
    assert(res.body?.data?.profile, 'Portfolio must include profile header');
    assertEqual(res.body.data.profile.profileSlug, profileSlug);
    assert(Array.isArray(res.body?.data?.talents), 'Portfolio must include talents array');
    assert(Array.isArray(res.body?.data?.skills), 'Portfolio must include skills array');
    assert(Array.isArray(res.body?.data?.achievements), 'Portfolio must include achievements array');
    assert(Array.isArray(res.body?.data?.projects), 'Portfolio must include projects array');
  });
});
