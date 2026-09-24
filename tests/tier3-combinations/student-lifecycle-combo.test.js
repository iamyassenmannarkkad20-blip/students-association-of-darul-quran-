/**
 * Tier 3 Cross-Feature Combination: Student Onboarding to Public Portfolio Pipeline
 * 
 * Verifies pairwise chain:
 * Registration -> Login -> Add Talents & Skills -> Update Privacy Toggles -> Public Portfolio Aggregation
 */

const { describe, test } = require('../helpers/test-harness');
const { assert, assertEqual, assertStatus } = require('../helpers/assertions');
const ApiClient = require('../helpers/api-client');
const { makeStudentData, makeTalentData, makeSkillData } = require('../helpers/fixtures');

describe('Tier 3: Combination - Student Onboarding to Public Portfolio Pipeline', () => {
  const studentClient = new ApiClient();
  const sessionLoginClient = new ApiClient();
  const publicVisitor = new ApiClient();

  const studentData = makeStudentData({ classCode: '05' });
  let assignedSlug = '';

  test('T3-SLF-01: Chain Step 1 - Student registers successfully with class code 05', async () => {
    const res = await studentClient.register(studentData);
    assertStatus(res, 201);
    assertEqual(res.body?.success, true);
    assignedSlug = res.body?.data?.user?.profileSlug;
    assert(assignedSlug, 'Assigned slug must exist');
  });

  test('T3-SLF-02: Chain Step 2 - Fresh client logs in with the registered credentials', async () => {
    const loginRes = await sessionLoginClient.login(studentData.email, studentData.password);
    assertStatus(loginRes, 200);
    assertEqual(sessionLoginClient.currentUser?.email, studentData.email.toLowerCase());
  });

  test('T3-SLF-03: Chain Step 3 - Student creates creative talent and proficiency skills', async () => {
    const talentRes = await sessionLoginClient.post(
      '/api/v1/students/talents',
      makeTalentData({ title: 'Quranic Recitation & Tajweed', category: 'Spiritual Arts', visibility: 'PUBLIC' })
    );
    assertStatus(talentRes, 201);

    const skillRes = await sessionLoginClient.post('/api/v1/students/skills', {
      skillName: 'Classical Arabic Grammar',
      proficiency: 'EXPERT',
    });
    assertStatus(skillRes, 201);
  });

  test('T3-SLF-04: Chain Step 4 - Student updates privacy flags (public=true, showEmail=false)', async () => {
    const updateRes = await sessionLoginClient.patch('/api/v1/students/profile', {
      bio: 'Dedicated scholar of classical Arabic grammar and Quranic tajweed sciences.',
      emailContact: 'scholar.contact@darulquran.edu',
      whatsappNumber: '+919988776655',
      isPublic: true,
      showEmail: false, // masked
      showWhatsapp: true, // visible
      showTalents: true,
      showSkills: true,
    });
    assertStatus(updateRes, 200);
    assertEqual(updateRes.body?.data?.is_public, true);
    assertEqual(updateRes.body?.data?.show_email, false);
  });

  test('T3-SLF-05: Chain Step 5 - Public visitor inspects portfolio and verifies aggregated items & masked email', async () => {
    const res = await publicVisitor.get(`/api/v1/public/portfolio/${assignedSlug}`);
    assertStatus(res, 200);
    assertEqual(res.body?.success, true);

    const data = res.body.data;
    assertEqual(data.profile.profileSlug, assignedSlug);
    assertEqual(data.profile.emailContact, null, 'Email must remain masked for public visitors');
    assertEqual(data.profile.whatsappNumber, '+919988776655', 'WhatsApp must be visible per toggle');

    // Verify talents and skills populated
    assert(data.talents.length >= 1, 'Expected at least 1 talent in public portfolio');
    assertEqual(data.talents[0].title, 'Quranic Recitation & Tajweed');

    assert(data.skills.length >= 1, 'Expected at least 1 skill in public portfolio');
    assertEqual(data.skills[0].skill_name, 'Classical Arabic Grammar');
    assertEqual(data.skills[0].proficiency, 'EXPERT');
  });
});
