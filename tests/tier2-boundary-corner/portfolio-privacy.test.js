/**
 * Tier 2 Boundary & Corner Cases: Portfolio Privacy Controls & 403 Enforcement
 * 
 * Verifies strict privacy boundaries: unauthenticated 403 on private profiles,
 * and individual field masking for email, whatsapp, talents, and skills.
 */

const { describe, test, beforeAll } = require('../helpers/test-harness');
const { assert, assertEqual, assertStatus } = require('../helpers/assertions');
const ApiClient = require('../helpers/api-client');
const { makeStudentData, makeTalentData } = require('../helpers/fixtures');

describe('Tier 2: Boundary & Corner - Portfolio Privacy & 403 Enforcement', () => {
  const student = new ApiClient();
  const unauthenticatedClient = new ApiClient();
  let studentSlug = '';

  beforeAll(async () => {
    const regRes = await student.register(makeStudentData({ classCode: '07' }));
    assertStatus(regRes, 201);
    studentSlug = regRes.body.data.user.profileSlug;

    // Add a public talent and contacts to profile
    await student.post('/api/v1/students/talents', makeTalentData({ visibility: 'PUBLIC' }));
    await student.patch('/api/v1/students/profile', {
      bio: 'Private testing profile.',
      whatsappNumber: '+919876543210',
      emailContact: 'contact@student.org',
      isPublic: false, // Explicitly private
      showEmail: false,
      showWhatsapp: false,
      showTalents: false,
    });
  });

  test('T2-PRV-01: Unauthenticated request to private portfolio returns HTTP 403 Forbidden', async () => {
    const res = await unauthenticatedClient.get(`/api/v1/public/portfolio/${studentSlug}`);
    assertStatus(res, 403, 'Private portfolio must reject unauthenticated requests with HTTP 403');
    assertEqual(res.body?.success, false);
    assertEqual(
      res.body?.error,
      'This student profile is currently set to private.',
      'Must return verbatim privacy notice'
    );
  });

  test('T2-PRV-02: Public portfolio with showEmail=false masks emailContact to null', async () => {
    // Make profile public but keep showEmail=false
    await student.patch('/api/v1/students/profile', { isPublic: true, showEmail: false });

    const res = await unauthenticatedClient.get(`/api/v1/public/portfolio/${studentSlug}`);
    assertStatus(res, 200);
    assertEqual(
      res.body?.data?.profile?.emailContact,
      null,
      'emailContact must be masked to null when showEmail is false'
    );
  });

  test('T2-PRV-03: Public portfolio with showWhatsapp=false masks whatsappNumber to null', async () => {
    await student.patch('/api/v1/students/profile', { showWhatsapp: false });

    const res = await unauthenticatedClient.get(`/api/v1/public/portfolio/${studentSlug}`);
    assertStatus(res, 200);
    assertEqual(
      res.body?.data?.profile?.whatsappNumber,
      null,
      'whatsappNumber must be masked to null when showWhatsapp is false'
    );
  });

  test('T2-PRV-04: Public portfolio with showTalents=false returns empty talents array', async () => {
    await student.patch('/api/v1/students/profile', { showTalents: false });

    const res = await unauthenticatedClient.get(`/api/v1/public/portfolio/${studentSlug}`);
    assertStatus(res, 200);
    assertEqual(
      res.body?.data?.talents?.length,
      0,
      'Talents must be empty array when showTalents is false'
    );
  });

  test('T2-PRV-05: Requesting nonexistent portfolio slug returns HTTP 404', async () => {
    const res = await unauthenticatedClient.get('/api/v1/public/portfolio/nonexistent-student-slug-99999');
    assertStatus(res, 404, 'Nonexistent slug must return HTTP 404');
    assertEqual(res.body?.success, false);
    assertEqual(res.body?.error, 'Portfolio profile not found.');
  });
});
