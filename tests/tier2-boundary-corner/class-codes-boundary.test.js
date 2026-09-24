/**
 * Tier 2 Boundary & Corner Cases: Class Code Partitioning & Registration Boundaries
 * 
 * Verifies strict validation of official class codes (01 to 08), rejecting out-of-range,
 * non-numeric, or malformed values with HTTP 400.
 */

const { describe, test } = require('../helpers/test-harness');
const { assert, assertEqual, assertStatus } = require('../helpers/assertions');
const ApiClient = require('../helpers/api-client');
const { makeStudentData } = require('../helpers/fixtures');

describe('Tier 2: Boundary & Corner - Class Code Validation & Bounds', () => {
  const client = new ApiClient();

  test('T2-CLS-01: Rejects lower boundary violation classCode "00" with HTTP 400', async () => {
    const payload = makeStudentData({ classCode: '00' });
    const res = await client.register(payload);
    assertStatus(res, 400, 'Class code 00 must be rejected');
    assertEqual(res.body?.success, false);
  });

  test('T2-CLS-02: Rejects upper boundary violation classCode "09" with HTTP 400', async () => {
    const payload = makeStudentData({ classCode: '09' });
    const res = await client.register(payload);
    assertStatus(res, 400, 'Class code 09 must be rejected');
    assertEqual(res.body?.success, false);
  });

  test('T2-CLS-03: Rejects arbitrary out-of-range classCode "99" with HTTP 400', async () => {
    const payload = makeStudentData({ classCode: '99' });
    const res = await client.register(payload);
    assertStatus(res, 400, 'Class code 99 must be rejected');
    assertEqual(res.body?.success, false);
  });

  test('T2-CLS-04: Rejects empty or non-numeric class codes ("", "CLASS1", "ab") with HTTP 400', async () => {
    const invalidCodes = ['', 'CLASS1', 'ab'];
    for (const code of invalidCodes) {
      const payload = makeStudentData({ classCode: code });
      const res = await client.register(payload);
      assertStatus(res, 400, `Class code "${code}" must be rejected`);
      assertEqual(res.body?.success, false);
    }
  });

  test('T2-CLS-05: Rejects password below minimum length boundary (< 8 chars) with HTTP 400', async () => {
    const payload = makeStudentData({ classCode: '04', password: 'short' });
    const res = await client.register(payload);
    assertStatus(res, 400, 'Password with 5 chars must be rejected');
    assertEqual(res.body?.success, false);
  });

  test('T2-CLS-06: Accepts valid lower bound "01" and upper bound "08" class codes', async () => {
    const lowerStudent = makeStudentData({ classCode: '01' });
    const upperStudent = makeStudentData({ classCode: '08' });

    const res1 = await client.register(lowerStudent);
    assertStatus(res1, 201, 'Class code 01 must be accepted');

    const res2 = await client.register(upperStudent);
    assertStatus(res2, 201, 'Class code 08 must be accepted');
  });
});
