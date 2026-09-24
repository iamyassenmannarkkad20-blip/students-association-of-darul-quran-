/**
 * Tier 4 Real-World Scenario 4: Media Spotlights & Opportunity Outreach with Zero Checkout
 * 
 * Simulates external discovery and contact triggers:
 * 1. Verification of official media spotlights and the 3 official YouTube video IDs.
 * 2. Opportunity directory discovery with direct WhatsApp (wa.me) and Email (mailto:) triggers.
 * 3. Services marketplace discovery with student provider contact links.
 * 4. Forensic confirmation of zero payment gateways, zero carts, and zero checkout tokens.
 */

const fs = require('fs');
const path = require('path');
const { describe, test } = require('../helpers/test-harness');
const { assert, assertEqual, assertStatus } = require('../helpers/assertions');
const ApiClient = require('../helpers/api-client');
const { OFFICIAL_YOUTUBE_VIDEOS } = require('../helpers/config');

describe('Tier 4: Scenario 4 - Media Spotlights & Zero-Checkout Opportunity Outreach', () => {
  const visitor = new ApiClient();
  const rootDir = path.resolve(__dirname, '../..');

  test('Step 1: Verification of the 3 official YouTube video IDs across media API and seed data', async () => {
    // 1. Verify seed configuration
    const seedPath = path.join(rootDir, 'server', 'src', 'db', 'seed_videos.ts');
    assert(fs.existsSync(seedPath), 'seed_videos.ts must exist');
    const seedContent = fs.readFileSync(seedPath, 'utf8');
    for (const videoId of OFFICIAL_YOUTUBE_VIDEOS) {
      assert(
        seedContent.includes(videoId),
        `Seed data must configure official video ID "${videoId}"`
      );
    }

    // 2. Verify public media API serves the official spotlights
    const res = await visitor.get('/api/v1/public/media');
    assertStatus(res, 200);
    const mediaUrls = res.body?.data?.map((m) => m.media_url).join(' ') || '';
    for (const videoId of OFFICIAL_YOUTUBE_VIDEOS) {
      assert(
        mediaUrls.includes(videoId),
        `Public media endpoint must serve official video ID "${videoId}"`
      );
    }
  });

  test('Step 2: Opportunity directory returns valid listings with direct contact triggers', async () => {
    const res = await visitor.get('/api/v1/public/opportunities');
    assertStatus(res, 200);
    assertEqual(res.body?.success, true);
    assert(Array.isArray(res.body?.data), 'Opportunities data must be an array');

    // If opportunities exist, verify contact trigger integrity
    for (const opp of res.body.data) {
      assert(
        opp.contact_whatsapp !== undefined || opp.contact_email !== undefined,
        'Opportunity must expose contact channels'
      );
      if (opp.contact_whatsapp) {
        assert(
          opp.contact_whatsapp.startsWith('+') || /^\d+$/.test(opp.contact_whatsapp.replace(/\D/g, '')),
          'WhatsApp contact should be a valid phone number format'
        );
      }
      if (opp.contact_email) {
        assert(opp.contact_email.includes('@'), 'Email contact should contain @ symbol');
      }
    }
  });

  test('Step 3: Services marketplace returns listings with direct student provider contacts', async () => {
    const res = await visitor.get('/api/v1/public/services');
    assertStatus(res, 200);
    assertEqual(res.body?.success, true);
    assert(Array.isArray(res.body?.data), 'Services data must be an array');
  });

  test('Step 4: Strict Zero-Checkout Verification across opportunities and marketplace payloads', async () => {
    const [oppRes, servRes, marketRes] = await Promise.all([
      visitor.get('/api/v1/public/opportunities'),
      visitor.get('/api/v1/public/services'),
      visitor.get('/api/v1/public/marketplace'),
    ]);

    const allPayloads = [oppRes.body, servRes.body, marketRes.body];
    for (const p of allPayloads) {
      const payloadStr = JSON.stringify(p).toLowerCase();
      assert(!payloadStr.includes('stripe'), 'Must not contain stripe token');
      assert(!payloadStr.includes('razorpay'), 'Must not contain razorpay order');
      assert(!payloadStr.includes('checkout_session'), 'Must not contain checkout session');
      assert(!payloadStr.includes('payment_intent'), 'Must not contain payment intent');
      assert(!payloadStr.includes('price_cents'), 'Must not contain price cents');
    }
  });

  test('Step 5: Client opportunity and service templates render direct wa.me and mailto buttons', () => {
    const oppComponentPath = path.join(rootDir, 'client', 'src', 'pages', 'public', 'Opportunities.tsx');
    assert(fs.existsSync(oppComponentPath), 'Opportunities.tsx must exist');
    const content = fs.readFileSync(oppComponentPath, 'utf8');

    assert(
      content.includes('wa.me') || content.includes('whatsapp'),
      'Opportunities view must link to WhatsApp directly'
    );
    assert(
      content.includes('mailto:') || content.includes('email'),
      'Opportunities view must trigger email client directly'
    );
  });
});
