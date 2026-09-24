#!/usr/bin/env node

/**
 * SADQ Platform - Unified E2E Test Suite Runner
 * 
 * Executes all 4 Tiers + Static Audits:
 * - Static Audits: Security, Zero Academic/Payment, Argon2id, 10 Units, Build
 * - Tier 1: Feature Coverage (Health, Auth, Portfolios, Units, Discourse, Media, Moderation)
 * - Tier 2: Boundary & Corner Cases (Class codes, Privacy 403, Skill upserts, Reaction toggle, Empty states, Expiry)
 * - Tier 3: Cross-Feature Combinations (Student lifecycle, Discourse-moderation, Score progression, RBAC)
 * - Tier 4: Real-World Scenarios (Student portfolio, Unit initiative, Community notes, Media opportunity, Admin cycle)
 */

const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const { getSuites, clearSuites } = require('./helpers/test-harness');
const { API_URL } = require('./helpers/config');
const { closeDb, cleanupTestArtifacts } = require('./helpers/test-db');

// ANSI Color Helpers
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

// Test File Registry by Tier
const TEST_TIERS = [
  {
    tier: 'Static Audits',
    title: 'Static Architecture & Forensic Security Audits',
    files: [
      'static-audits/zero-academic-audit.test.js',
      'static-audits/zero-payments-audit.test.js',
      'static-audits/argon2-hashing-audit.test.js',
      'static-audits/units-roles-audit.test.js',
      'static-audits/client-build-audit.test.js',
    ],
  },
  {
    tier: 'Tier 1',
    title: 'Feature Coverage (R1 - R5 Baseline)',
    files: [
      'tier1-feature-coverage/health.test.js',
      'tier1-feature-coverage/auth.test.js',
      'tier1-feature-coverage/portfolios.test.js',
      'tier1-feature-coverage/units.test.js',
      'tier1-feature-coverage/discourse.test.js',
      'tier1-feature-coverage/media.test.js',
      'tier1-feature-coverage/moderation.test.js',
    ],
  },
  {
    tier: 'Tier 2',
    title: 'Boundary & Corner Case Partitions',
    files: [
      'tier2-boundary-corner/class-codes-boundary.test.js',
      'tier2-boundary-corner/portfolio-privacy.test.js',
      'tier2-boundary-corner/skill-upserts.test.js',
      'tier2-boundary-corner/reaction-toggles.test.js',
      'tier2-boundary-corner/empty-states.test.js',
      'tier2-boundary-corner/session-expiry.test.js',
    ],
  },
  {
    tier: 'Tier 3',
    title: 'Cross-Feature Combinations & State Pipelines',
    files: [
      'tier3-combinations/student-lifecycle-combo.test.js',
      'tier3-combinations/discourse-moderation-combo.test.js',
      'tier3-combinations/score-progression-combo.test.js',
      'tier3-combinations/rbac-escalation-combo.test.js',
    ],
  },
  {
    tier: 'Tier 4',
    title: 'Real-World Production Workload Scenarios',
    files: [
      'tier4-real-world/scenario-student-portfolio.test.js',
      'tier4-real-world/scenario-unit-initiative.test.js',
      'tier4-real-world/scenario-community-knowledge.test.js',
      'tier4-real-world/scenario-media-opportunity.test.js',
      'tier4-real-world/scenario-admin-moderation.test.js',
    ],
  },
];

async function isServerHealthy() {
  try {
    const res = await fetch(`${API_URL}/api/v1/health`, { method: 'GET' });
    if (res.status === 200) {
      const data = await res.json();
      return data.status === 'healthy';
    }
  } catch (e) {
    return false;
  }
  return false;
}

async function ensureServerRunning() {
  const alreadyHealthy = await isServerHealthy();
  if (alreadyHealthy) {
    console.log(`${colors.cyan}[INFO] SADQ API Server already active and healthy at ${API_URL}${colors.reset}\n`);
    await new Promise((r) => setTimeout(r, 500));
    return null;
  }

  console.log(`${colors.yellow}[SPAWN] Server not running at ${API_URL}. Launching backend server...${colors.reset}`);
  const serverDir = path.resolve(__dirname, '../server');
  
  // Use cmd /c npx tsx src/index.ts on Windows
  const serverProcess = spawn('cmd.exe', ['/c', 'npx tsx src/index.ts'], {
    cwd: serverDir,
    stdio: 'ignore',
    detached: true,
  });

  serverProcess.unref();

  // Wait for server health
  console.log(`${colors.yellow}[WAIT] Waiting for server healthcheck at ${API_URL}/api/v1/health...${colors.reset}`);
  const startTime = Date.now();
  while (Date.now() - startTime < 20000) {
    await new Promise((r) => setTimeout(r, 1000));
    if (await isServerHealthy()) {
      console.log(`${colors.green}[SUCCESS] Backend server online and healthy!${colors.reset}\n`);
      return serverProcess;
    }
  }

  throw new Error(`Timed out waiting for server to start at ${API_URL}/api/v1/health after 20 seconds.`);
}

async function runTestSuite() {
  const runnerStart = Date.now();
  console.log(`${colors.bold}${colors.blue}========================================================================${colors.reset}`);
  console.log(`${colors.bold}${colors.blue}               SADQ PLATFORM - UNIFIED E2E TEST RUNNER                  ${colors.reset}`);
  console.log(`${colors.bold}${colors.blue}========================================================================${colors.reset}`);
  console.log(`Target URL: ${API_URL}`);
  console.log(`Time: ${new Date().toISOString()}\n`);

  let serverProcess = null;
  try {
    serverProcess = await ensureServerRunning();
  } catch (err) {
    console.error(`${colors.red}[FATAL] Could not connect to or start API server: ${err.message}${colors.reset}`);
    process.exit(1);
  }

  let totalTests = 0;
  let totalPassed = 0;
  let totalFailed = 0;
  const tierReports = [];
  const allFailures = [];

  const reporter = {
    onTestResult(t, suiteName) {
      if (t.status === 'PASS') {
        console.log(`  ${colors.green}✓${colors.reset} ${t.name} ${colors.gray}(${t.durationMs}ms)${colors.reset}`);
      } else {
        console.log(`  ${colors.red}✗ ${t.name}${colors.reset} ${colors.gray}(${t.durationMs}ms)${colors.reset}`);
        console.log(`    ${colors.red}${t.error?.message || 'Failed'}${colors.reset}`);
        allFailures.push({ suite: suiteName, test: t.name, error: t.error });
      }
    },
  };

  for (const tierConfig of TEST_TIERS) {
    console.log(`\n${colors.bold}${colors.cyan}--- [${tierConfig.tier}] ${tierConfig.title} ---${colors.reset}`);
    const tierStart = Date.now();
    let tierPassed = 0;
    let tierFailed = 0;
    let tierTotal = 0;

    for (const testRelPath of tierConfig.files) {
      const fullPath = path.resolve(__dirname, testRelPath);
      if (!fs.existsSync(fullPath)) {
        console.log(`  ${colors.yellow}⚠️ Warning: Test file not found: ${testRelPath}${colors.reset}`);
        continue;
      }

      clearSuites();
      try {
        // Require the test file, which registers describe and test blocks
        require(fullPath);
      } catch (loadErr) {
        console.error(`  ${colors.red}✗ Failed to load test file ${testRelPath}: ${loadErr.message}${colors.reset}`);
        allFailures.push({ suite: testRelPath, test: 'File Load', error: loadErr });
        tierFailed++;
        tierTotal++;
        continue;
      }

      const registeredSuites = getSuites();
      for (const suite of registeredSuites) {
        console.log(`\n  ${colors.bold}${suite.name}${colors.reset}`);
        const suiteResults = await suite.run(reporter);
        tierPassed += suiteResults.passed;
        tierFailed += suiteResults.failed;
        tierTotal += suiteResults.total;
      }
    }

    const tierDuration = Date.now() - tierStart;
    tierReports.push({
      tier: tierConfig.tier,
      title: tierConfig.title,
      passed: tierPassed,
      failed: tierFailed,
      total: tierTotal,
      durationMs: tierDuration,
    });

    totalPassed += tierPassed;
    totalFailed += tierFailed;
    totalTests += tierTotal;
  }

  // Database test artifact cleanup
  console.log(`\n${colors.gray}[CLEANUP] Cleaning up ephemeral test artifacts...${colors.reset}`);
  await cleanupTestArtifacts();
  await closeDb();

  const totalDuration = ((Date.now() - runnerStart) / 1000).toFixed(2);

  // Print Summary Table
  console.log(`\n${colors.bold}========================================================================${colors.reset}`);
  console.log(`${colors.bold}                         E2E TEST RUN SUMMARY                           ${colors.reset}`);
  console.log(`${colors.bold}========================================================================${colors.reset}`);
  console.log(
    `${'Tier'.padEnd(16)} | ${'Passed'.padEnd(8)} | ${'Failed'.padEnd(8)} | ${'Total'.padEnd(8)} | ${'Status'.padEnd(10)} | Duration`
  );
  console.log('------------------------------------------------------------------------');

  for (const tr of tierReports) {
    const statusStr =
      tr.failed === 0
        ? `${colors.green}PASSED${colors.reset}`
        : `${colors.red}FAILED (${tr.failed})${colors.reset}`;
    console.log(
      `${tr.tier.padEnd(16)} | ${String(tr.passed).padEnd(8)} | ${String(tr.failed).padEnd(8)} | ${String(tr.total).padEnd(8)} | ${statusStr.padEnd(19)} | ${(tr.durationMs / 1000).toFixed(2)}s`
    );
  }

  console.log('------------------------------------------------------------------------');
  console.log(
    `${colors.bold}${'TOTAL'.padEnd(16)} | ${String(totalPassed).padEnd(8)} | ${String(totalFailed).padEnd(8)} | ${String(totalTests).padEnd(8)} | ${(totalFailed === 0 ? colors.green + 'ALL PASSED' : colors.red + 'FAILURES').padEnd(19)}${colors.reset} | ${totalDuration}s`
  );
  console.log(`${colors.bold}========================================================================${colors.reset}`);

  if (allFailures.length > 0) {
    console.log(`\n${colors.bold}${colors.red}FAILURE DETAILS (${allFailures.length} total):${colors.reset}`);
    allFailures.forEach((f, idx) => {
      console.log(`\n${idx + 1}) [${f.suite}] -> ${f.test}`);
      console.log(`   ${colors.red}${f.error?.stack || f.error?.message || f.error}${colors.reset}`);
    });
    process.exit(1);
  } else {
    console.log(`\n${colors.bold}${colors.green}✓ ALL ${totalTests} TESTS PASSED SUCCESSFULLY!${colors.reset}\n`);
    process.exit(0);
  }
}

runTestSuite().catch((err) => {
  console.error(`${colors.red}Unhandled Test Runner Failure: ${err.message}${colors.reset}`);
  console.error(err.stack);
  process.exit(1);
});
