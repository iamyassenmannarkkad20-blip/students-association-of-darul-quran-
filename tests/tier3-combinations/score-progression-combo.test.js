/**
 * Tier 3 Cross-Feature Combination: Profile Completion & Growth Metrics Progression
 * 
 * Verifies that sequential student profile enrichment accurately drives completion percentage
 * from base (40%) to maximum (100%) and updates dashboard item counters.
 */

const { describe, test, beforeAll } = require('../helpers/test-harness');
const { assert, assertEqual, assertStatus } = require('../helpers/assertions');
const ApiClient = require('../helpers/api-client');
const {
  makeStudentData,
  makeTalentData,
  makeSkillData,
  makeAchievementData,
  makeProjectData,
} = require('../helpers/fixtures');

describe('Tier 3: Combination - Profile Completion & Dashboard Progression', () => {
  const student = new ApiClient();

  beforeAll(async () => {
    await student.register(makeStudentData({ classCode: '03' }));
  });

  test('T3-SCR-01: Baseline profile completion begins at 40% (fullName + classCode)', async () => {
    const res = await student.get('/api/v1/students/dashboard');
    assertStatus(res, 200);
    assertEqual(
      res.body?.data?.completionPercentage,
      40,
      'Initial profile should have 40% completion (full_name and class_code present)'
    );
  });

  test('T3-SCR-02: Adding bio increments completion percentage to 60%', async () => {
    await student.patch('/api/v1/students/profile', {
      bio: 'Lifelong learner engaged in community growth and creative expression.',
    });
    const res = await student.get('/api/v1/students/dashboard');
    assertStatus(res, 200);
    assertEqual(res.body?.data?.completionPercentage, 60);
  });

  test('T3-SCR-03: Adding interests array increments completion percentage to 80%', async () => {
    await student.patch('/api/v1/students/profile', {
      interests: ['Arabic Calligraphy', 'Public Oratory', 'Manuscript Digitization'],
    });
    const res = await student.get('/api/v1/students/dashboard');
    assertStatus(res, 200);
    assertEqual(res.body?.data?.completionPercentage, 80);
  });

  test('T3-SCR-04: Adding profile photo URL achieves 100% profile completion', async () => {
    await student.patch('/api/v1/students/profile', {
      profilePhotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
    });
    const res = await student.get('/api/v1/students/dashboard');
    assertStatus(res, 200);
    assertEqual(
      res.body?.data?.completionPercentage,
      100,
      'Profile with all 5 core elements must achieve 100% completion'
    );
  });

  test('T3-SCR-05: Adding portfolio artifacts dynamically increments dashboard item counts', async () => {
    // Add 1 talent, 1 skill, 1 achievement, 1 project
    await student.post('/api/v1/students/talents', makeTalentData());
    await student.post('/api/v1/students/skills', makeSkillData());
    await student.post('/api/v1/students/achievements', makeAchievementData());
    await student.post('/api/v1/students/projects', makeProjectData());

    const res = await student.get('/api/v1/students/dashboard');
    assertStatus(res, 200);
    const counts = res.body?.data?.counts;
    assert(counts.talents >= 1, 'Talents count must be >= 1');
    assert(counts.skills >= 1, 'Skills count must be >= 1');
    assert(counts.achievements >= 1, 'Achievements count must be >= 1');
    assert(counts.projects >= 1, 'Projects count must be >= 1');
  });
});
