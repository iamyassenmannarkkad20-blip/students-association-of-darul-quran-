/**
 * Tier 1 Feature Coverage: Media, Publications & Opportunity Discovery
 * 
 * Verifies public endpoints for media spotlights, digital library, magazines,
 * opportunity listings, services, and public site configuration.
 */

const { describe, test } = require('../helpers/test-harness');
const { assert, assertEqual, assertStatus } = require('../helpers/assertions');
const ApiClient = require('../helpers/api-client');

describe('Tier 1: Feature Coverage - Media, Publications & Opportunities', () => {
  const client = new ApiClient();

  test('T1-MED-01: GET /api/v1/public/config returns official social media configuration', async () => {
    const res = await client.get('/api/v1/public/config');
    assertStatus(res, 200, 'Public config must return HTTP 200');
    assertEqual(res.body?.success, true);
    assert(res.body?.data?.instagram_url !== undefined, 'Config must include instagram_url');
    assert(res.body?.data?.youtube_url !== undefined, 'Config must include youtube_url');
  });

  test('T1-MED-02: GET /api/v1/public/media returns media spotlights list', async () => {
    const res = await client.get('/api/v1/public/media');
    assertStatus(res, 200, 'Media catalog must return HTTP 200');
    assertEqual(res.body?.success, true);
    assert(Array.isArray(res.body?.data), 'Media data must be an array');
  });

  test('T1-MED-03: GET /api/v1/public/magazines returns published periodicals', async () => {
    const res = await client.get('/api/v1/public/magazines');
    assertStatus(res, 200, 'Magazines catalog must return HTTP 200');
    assertEqual(res.body?.success, true);
    assert(Array.isArray(res.body?.data), 'Magazines data must be an array');
  });

  test('T1-MED-04: GET /api/v1/public/library returns digital library resources', async () => {
    const res = await client.get('/api/v1/public/library');
    assertStatus(res, 200, 'Library catalog must return HTTP 200');
    assertEqual(res.body?.success, true);
    assert(Array.isArray(res.body?.data), 'Library data must be an array');
  });

  test('T1-MED-05: GET /api/v1/public/opportunities returns opportunity listings with contacts', async () => {
    const res = await client.get('/api/v1/public/opportunities');
    assertStatus(res, 200, 'Opportunities catalog must return HTTP 200');
    assertEqual(res.body?.success, true);
    assert(Array.isArray(res.body?.data), 'Opportunities data must be an array');
  });

  test('T1-MED-06: GET /api/v1/public/services returns student service listings', async () => {
    const res = await client.get('/api/v1/public/services');
    assertStatus(res, 200, 'Services catalog must return HTTP 200');
    assertEqual(res.body?.success, true);
    assert(Array.isArray(res.body?.data), 'Services data must be an array');
  });
});
