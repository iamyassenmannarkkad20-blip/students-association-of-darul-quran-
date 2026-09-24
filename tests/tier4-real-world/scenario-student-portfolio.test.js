/**
 * Tier 4 Real-World Scenario 1: Student Growth & Portfolio Lifecycle
 * 
 * Simulates the complete end-to-end student journey:
 * 1. Student registers with official class code (06).
 * 2. Enriches profile with bio, interests, and profile photo.
 * 3. Records creative talents, graded skills (Beginner -> Advanced), achievements, and projects.
 * 4. Configures selective privacy preferences.
 * 5. Unauthenticated public visitor discovers and verifies the aggregated portfolio at /portfolio/:slug.
 */

const { describe, test } = require('../helpers/test-harness');
const { assert, assertEqual, assertStatus } = require('../helpers/assertions');
const ApiClient = require('../helpers/api-client');
const {
  makeStudentData,
  makeTalentData,
  makeSkillData,
  makeAchievementData,
  makeProjectData,
} = require('../helpers/fixtures');

describe('Tier 4: Scenario 1 - Comprehensive Student Portfolio Lifecycle', () => {
  const student = new ApiClient();
  const visitor = new ApiClient();
  const studentInfo = makeStudentData({ fullName: 'Ahmad Al-Mansoor', classCode: '06' });
  let slug = '';

  test('Step 1: Student registers and receives active session and unique slug', async () => {
    const regRes = await student.register(studentInfo);
    assertStatus(regRes, 201);
    assertEqual(regRes.body?.success, true);
    slug = regRes.body?.data?.user?.profileSlug;
    assert(slug.includes('ahmad-al-mansoor'), `Slug should be derived from name: ${slug}`);
  });

  test('Step 2: Student completes profile details and verifies 100% completion in workspace', async () => {
    const updateRes = await student.patch('/api/v1/students/profile', {
      bio: 'Third-year student specializing in Hadith sciences and Islamic manuscript preservation.',
      interests: ['Hadith Studies', 'Manuscript Conservation', 'Oratory'],
      profilePhotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      whatsappNumber: '+919876501234',
      emailContact: 'ahmad.mansoor@darulquran.edu',
      isPublic: true,
      showEmail: false,
      showWhatsapp: true,
      showTalents: true,
      showSkills: true,
      showAchievements: true,
      showProjects: true,
    });
    assertStatus(updateRes, 200);

    const dashRes = await student.get('/api/v1/students/dashboard');
    assertStatus(dashRes, 200);
    assertEqual(dashRes.body?.data?.completionPercentage, 100, 'Profile should reach 100% completion');
  });

  test('Step 3: Student adds talents, proficiency skills, and honors', async () => {
    // Add Creative Talent
    const tRes = await student.post(
      '/api/v1/students/talents',
      makeTalentData({
        title: 'Classical Naskh Calligraphy',
        category: 'Islamic Arts',
        visibility: 'PUBLIC',
      })
    );
    assertStatus(tRes, 201);

    // Add Skills with varying proficiencies
    const s1 = await student.post('/api/v1/students/skills', {
      skillName: 'Arabic Paleography',
      proficiency: 'ADVANCED',
    });
    assertStatus(s1, 201);

    const s2 = await student.post('/api/v1/students/skills', {
      skillName: 'Digital Archiving',
      proficiency: 'INTERMEDIATE',
    });
    assertStatus(s2, 201);

    // Add Verified Achievement
    const aRes = await student.post(
      '/api/v1/students/achievements',
      makeAchievementData({
        title: 'Excellence in Classical Manuscript Transcription',
        category: 'Academic Honor',
        visibility: 'PUBLIC',
      })
    );
    assertStatus(aRes, 201);

    // Add Collaborative Project
    const pRes = await student.post(
      '/api/v1/students/projects',
      makeProjectData({
        title: 'Qur\'anic Codex Restoration Project',
        description: 'Collaborative initiative under the Library Board preserving early printings.',
        unitCode: 'LIB',
        visibility: 'PUBLIC',
      })
    );
    assertStatus(pRes, 201);
  });

  test('Step 4: Public visitor verifies full portfolio rendering and privacy enforcement', async () => {
    const portfolioRes = await visitor.get(`/api/v1/public/portfolio/${slug}`);
    assertStatus(portfolioRes, 200);
    const d = portfolioRes.body?.data;

    // Verify Identity
    assertEqual(d.profile.fullName, 'Ahmad Al-Mansoor');
    assertEqual(d.profile.classCode, '06');

    // Verify Privacy: Email masked, WhatsApp visible
    assertEqual(d.profile.emailContact, null, 'Email should be masked per student toggle');
    assertEqual(d.profile.whatsappNumber, '+919876501234');

    // Verify Relational Items
    assert(d.talents.some((t) => t.title === 'Classical Naskh Calligraphy'));
    assert(d.skills.some((s) => s.skill_name === 'Arabic Paleography' && s.proficiency === 'ADVANCED'));
    assert(d.achievements.some((a) => a.title === 'Excellence in Classical Manuscript Transcription'));
    assert(d.projects.some((p) => p.title === 'Qur\'anic Codex Restoration Project'));
  });

  test('Step 5: When student toggles is_public to false, public visitor is barred with HTTP 403', async () => {
    const toggleRes = await student.patch('/api/v1/students/profile', { isPublic: false });
    assertStatus(toggleRes, 200);
    assertEqual(toggleRes.body?.data?.is_public, false);

    const privateRes = await visitor.get(`/api/v1/public/portfolio/${slug}`);
    assertStatus(privateRes, 403);
    assertEqual(privateRes.body?.error, 'This student profile is currently set to private.');
  });
});
