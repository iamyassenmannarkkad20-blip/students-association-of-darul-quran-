/**
 * Tier 2 Boundary & Corner Cases: Empty State Standardization & Zero Fake Data
 * 
 * Verifies that when catalogs (Library, Magazines) have no published records,
 * the platform adheres strictly to the Zero Fake Data policy and renders
 * the standardized notice "will be published after verification".
 */

const fs = require('fs');
const path = require('path');
const { describe, test } = require('../helpers/test-harness');
const { assert, assertEqual, assertStatus } = require('../helpers/assertions');
const ApiClient = require('../helpers/api-client');
const { VERIFIED_EMPTY_STATE_STRING } = require('../helpers/config');

describe('Tier 2: Boundary & Corner - Empty States & Zero Fake Data Policy', () => {
  const client = new ApiClient();
  const rootDir = path.resolve(__dirname, '../..');

  test('T2-EMP-01: Magazines.tsx contains verbatim empty state string "will be published after verification"', () => {
    const magPagePath = path.join(rootDir, 'client', 'src', 'pages', 'public', 'Magazines.tsx');
    assert(fs.existsSync(magPagePath), 'Magazines.tsx must exist');
    const content = fs.readFileSync(magPagePath, 'utf8');
    assert(
      content.toLowerCase().includes(VERIFIED_EMPTY_STATE_STRING.toLowerCase()),
      `Magazines.tsx must contain verbatim notice "${VERIFIED_EMPTY_STATE_STRING}"`
    );
  });

  test('T2-EMP-02: Library.tsx contains verbatim empty state string "will be published after verification"', () => {
    const libPagePath = path.join(rootDir, 'client', 'src', 'pages', 'public', 'Library.tsx');
    assert(fs.existsSync(libPagePath), 'Library.tsx must exist');
    const content = fs.readFileSync(libPagePath, 'utf8');
    assert(
      content.toLowerCase().includes(VERIFIED_EMPTY_STATE_STRING.toLowerCase()),
      `Library.tsx must contain verbatim notice "${VERIFIED_EMPTY_STATE_STRING}"`
    );
  });

  test('T2-EMP-03: Empty catalog API responses return clean empty array [] with HTTP 200', async () => {
    const res = await client.get('/api/v1/community/posts?category=NonExistentCategory999');
    assertStatus(res, 200);
    assertEqual(res.body?.success, true);
    assert(Array.isArray(res.body?.data), 'Response data must be an array');
    assertEqual(res.body?.data?.length, 0, 'Must return empty array for non-matching category');
  });

  test('T2-EMP-04: Certificates endpoint returns clean 404 when certificate ID not found', async () => {
    const res = await client.get('/api/v1/public/certificates/CERT-NONEXISTENT-999');
    assertStatus(res, 404);
    assertEqual(res.body?.success, false);
    assertEqual(res.body?.error, 'Certificate record not found.');
  });

  test('T2-EMP-05: Absence of placeholder/fake strings ("Lorem Ipsum", "dummy data") in API responses', async () => {
    const unitsRes = await client.get('/api/v1/public/units');
    assertStatus(unitsRes, 200);
    const bodyStr = JSON.stringify(unitsRes.body).toLowerCase();
    assert(!bodyStr.includes('lorem ipsum'), 'Zero Lorem Ipsum in official units');
    assert(!bodyStr.includes('dummy'), 'Zero dummy data in official units');
  });
});
