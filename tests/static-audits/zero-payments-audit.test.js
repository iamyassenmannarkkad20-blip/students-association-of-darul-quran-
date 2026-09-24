/**
 * Static Audit Test: Zero Payment Gateways & Zero Checkout
 * 
 * Verifies that zero payment gateways, checkouts, or internal financial
 * transactions exist anywhere in the SADQ platform per R4 and Acceptance Criteria.
 */

const fs = require('fs');
const path = require('path');
const { describe, test } = require('../helpers/test-harness');
const { assert } = require('../helpers/assertions');

describe('Static Security Audit: Zero Payment Gateways & Zero Checkout', () => {
  const rootDir = path.resolve(__dirname, '../..');
  const packageJsonFiles = [
    path.join(rootDir, 'package.json'),
    path.join(rootDir, 'server', 'package.json'),
    path.join(rootDir, 'client', 'package.json'),
  ];

  const codeDirs = [
    path.join(rootDir, 'server', 'src'),
    path.join(rootDir, 'client', 'src'),
    path.join(rootDir, 'shared'),
  ];

  function getAllCodeFiles(dir) {
    let files = [];
    if (!fs.existsSync(dir)) return files;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        files = files.concat(getAllCodeFiles(fullPath));
      } else if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) {
        files.push(fullPath);
      }
    }
    return files;
  }

  const allCodeFiles = codeDirs.flatMap(getAllCodeFiles);

  test('SA-PAY-01: Zero payment gateway packages in package.json files', () => {
    const forbiddenPackages = [
      'stripe',
      '@stripe/stripe-js',
      '@stripe/react-stripe-js',
      'razorpay',
      'paypal-rest-sdk',
      '@paypal/react-paypal-js',
      'square',
      'braintree',
      'paddle-sdk',
    ];

    for (const pkgPath of packageJsonFiles) {
      if (fs.existsSync(pkgPath)) {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
        const allDeps = {
          ...(pkg.dependencies || {}),
          ...(pkg.devDependencies || {}),
        };

        for (const forbidden of forbiddenPackages) {
          assert(
            !(forbidden in allDeps),
            `Forbidden payment dependency "${forbidden}" found in ${path.relative(rootDir, pkgPath)}`
          );
        }
      }
    }
  });

  test('SA-PAY-02: Zero payment intent or checkout session tokens in source code', () => {
    const forbiddenPatterns = [
      /\bpayment_intent\b/i,
      /\bcheckout_session\b/i,
      /\bclient_secret_pay\b/i,
      /\brazorpay_order_id\b/i,
      /\bstripe_publishable_key\b/i,
    ];

    for (const filePath of allCodeFiles) {
      const content = fs.readFileSync(filePath, 'utf8');
      for (const pattern of forbiddenPatterns) {
        const match = content.match(pattern);
        assert(
          !match,
          `Forbidden payment token pattern detected in ${path.relative(rootDir, filePath)}: "${match?.[0]}"`
        );
      }
    }
  });

  test('SA-PAY-03: Zero payment or checkout routes in server routing', () => {
    const serverRoutesDir = path.join(rootDir, 'server', 'src', 'routes');
    if (fs.existsSync(serverRoutesDir)) {
      const routeFiles = fs.readdirSync(serverRoutesDir);
      for (const f of routeFiles) {
        assert(
          !/checkout|payment|billing|invoice|cart/i.test(f),
          `Server has forbidden payment route file: ${f}`
        );
      }
    }
  });

  test('SA-PAY-04: Marketplace and Opportunity schemas use direct WhatsApp and Email contact columns', () => {
    const schemaPath = path.join(rootDir, 'server', 'src', 'db', 'migrations', '001_initial_schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, 'utf8');
      assert(
        schema.includes('contact_whatsapp') && schema.includes('contact_email'),
        'Opportunities and Marketplace must provide direct contact_whatsapp and contact_email'
      );
      assert(
        !schema.includes('price_cents') && !schema.includes('payment_status'),
        'Schema must not contain payment transaction fields'
      );
    }
  });

  test('SA-PAY-05: Opportunities route strictly returns contact buttons rather than purchase flows', () => {
    const publicRoutesPath = path.join(rootDir, 'server', 'src', 'routes', 'public.ts');
    if (fs.existsSync(publicRoutesPath)) {
      const content = fs.readFileSync(publicRoutesPath, 'utf8');
      assert(
        content.includes('contact_whatsapp') && content.includes('contact_email'),
        'public.ts must expose contact_whatsapp and contact_email for opportunities/services'
      );
    }
  });
});
