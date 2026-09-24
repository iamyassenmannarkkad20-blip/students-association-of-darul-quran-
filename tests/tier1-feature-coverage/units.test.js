/**
 * Tier 1 Feature Coverage: Official Units & Leadership
 * 
 * Verifies the 10 official organisation units catalog, unit details,
 * and student unit affiliations.
 */

const { describe, test, beforeAll } = require('../helpers/test-harness');
const { assert, assertEqual, assertStatus, assertArrayLength } = require('../helpers/assertions');
const ApiClient = require('../helpers/api-client');
const { OFFICIAL_UNIT_CODES } = require('../helpers/config');
const { makeStudentData } = require('../helpers/fixtures');

describe('Tier 1: Feature Coverage - Official Organisation Units', () => {
  const client = new ApiClient();

  test('T1-UNT-01: GET /api/v1/public/units returns HTTP 200 with list of units', async () => {
    const res = await client.get('/api/v1/public/units');
    assertStatus(res, 200, 'Public units catalog must return HTTP 200');
    assertEqual(res.body?.success, true);
    assert(Array.isArray(res.body?.data), 'Response data must be an array');
  });

  test('T1-UNT-02: Public units catalog contains exactly the 10 official units', async () => {
    const res = await client.get('/api/v1/public/units');
    assertStatus(res, 200);
    const units = res.body.data;
    assertEqual(units.length, 10, 'Expected exactly 10 official units in catalog');
    const returnedCodes = units.map((u) => u.code);
    for (const code of OFFICIAL_UNIT_CODES) {
      assert(
        returnedCodes.includes(code),
        `Catalog missing official unit code: ${code}`
      );
    }
  });

  test('T1-UNT-03: Each organisation unit contains code, name, and description', async () => {
    const res = await client.get('/api/v1/public/units');
    assertStatus(res, 200);
    for (const unit of res.body.data) {
      assert(unit.code && typeof unit.code === 'string', 'Unit code missing');
      assert(unit.name && typeof unit.name === 'string', 'Unit name missing');
      assert(unit.description && typeof unit.description === 'string', 'Unit description missing');
    }
  });

  test('T1-UNT-04: Units list is sorted in ascending alphabetical order by code', async () => {
    const res = await client.get('/api/v1/public/units');
    assertStatus(res, 200);
    const codes = res.body.data.map((u) => u.code);
    const sortedCodes = [...codes].sort();
    for (let i = 0; i < codes.length; i++) {
      assertEqual(codes[i], sortedCodes[i], `Units should be sorted by code ascending at index ${i}`);
    }
  });

  test('T1-UNT-05: Authenticated student can query unit affiliations at /api/v1/students/organisation', async () => {
    const student = new ApiClient();
    await student.register(makeStudentData({ classCode: '02' }));
    const res = await student.get('/api/v1/students/organisation');
    assertStatus(res, 200, 'Student organisation endpoint should return HTTP 200');
    assertEqual(res.body?.success, true);
    assert(Array.isArray(res.body?.data), 'Affiliations data must be an array');
  });
});
