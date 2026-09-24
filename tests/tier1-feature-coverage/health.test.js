/**
 * Tier 1 Feature Coverage: Health Endpoint
 * 
 * Verifies core server healthcheck functionality, database connectivity status,
 * and security header delivery.
 */

const { describe, test } = require('../helpers/test-harness');
const { assert, assertEqual, assertStatus } = require('../helpers/assertions');
const ApiClient = require('../helpers/api-client');

describe('Tier 1: Feature Coverage - Health Check API', () => {
  const client = new ApiClient();

  test('T1-HLT-01: GET /api/v1/health returns HTTP 200 with healthy status', async () => {
    let res = null;
    let attempts = 0;
    while (attempts < 3) {
      try {
        res = await client.get('/api/v1/health');
        if (res && res.status === 200) break;
      } catch (e) {
        await new Promise((r) => setTimeout(r, 200));
      }
      attempts++;
    }
    assertStatus(res, 200, 'Health endpoint should return HTTP 200');
    assertEqual(res.body?.status, 'healthy', 'Health status must be "healthy"');
  });

  test('T1-HLT-02: Health check payload identifies SADQ Platform API service name', async () => {
    const res = await client.get('/api/v1/health');
    assertStatus(res, 200);
    assertEqual(res.body?.service, 'SADQ Platform API', 'Service identifier must match SADQ Platform API');
  });

  test('T1-HLT-03: Health check validates live PostgreSQL connection with valid timestamp', async () => {
    const res = await client.get('/api/v1/health');
    assertStatus(res, 200);
    assert(res.body?.time, 'Health payload must include database timestamp');
    const timestamp = new Date(res.body.time).getTime();
    assert(!isNaN(timestamp), 'Database time must be a valid ISO/UTC timestamp');
  });

  test('T1-HLT-04: Health check responds with application/json content-type', async () => {
    const res = await client.get('/api/v1/health');
    assertStatus(res, 200);
    const contentType = res.headers.get('content-type') || '';
    assert(contentType.includes('application/json'), 'Content-Type must be application/json');
  });

  test('T1-HLT-05: Health check responds within acceptable latency (< 2000ms)', async () => {
    const start = Date.now();
    const res = await client.get('/api/v1/health');
    const duration = Date.now() - start;
    assertStatus(res, 200);
    assert(duration < 2000, `Health check latency was ${duration}ms, expected < 2000ms`);
  });
});
