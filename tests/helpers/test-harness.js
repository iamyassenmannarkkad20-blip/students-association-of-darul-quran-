/**
 * SADQ Platform E2E Test Suite - Lightweight Deterministic Test Harness
 */

class TestSuiteContext {
  constructor(name) {
    this.name = name;
    this.tests = [];
    this.beforeAllHooks = [];
    this.afterAllHooks = [];
    this.beforeEachHooks = [];
    this.afterEachHooks = [];
  }

  addTest(name, fn) {
    this.tests.push({ name, fn, status: 'PENDING', durationMs: 0, error: null });
  }

  addBeforeAll(fn) {
    this.beforeAllHooks.push(fn);
  }

  addAfterAll(fn) {
    this.afterAllHooks.push(fn);
  }

  addBeforeEach(fn) {
    this.beforeEachHooks.push(fn);
  }

  addAfterEach(fn) {
    this.afterEachHooks.push(fn);
  }

  async run(reporter) {
    const results = {
      name: this.name,
      total: this.tests.length,
      passed: 0,
      failed: 0,
      tests: [],
      durationMs: 0,
    };

    const suiteStart = Date.now();

    try {
      for (const hook of this.beforeAllHooks) {
        await hook();
      }
    } catch (err) {
      // If beforeAll fails, fail all tests in suite
      for (const t of this.tests) {
        t.status = 'FAIL';
        t.error = new Error(`beforeAll hook failed: ${err.message}`);
        results.failed++;
        results.tests.push(t);
        if (reporter && reporter.onTestResult) reporter.onTestResult(t, this.name);
      }
      results.durationMs = Date.now() - suiteStart;
      return results;
    }

    for (const testCase of this.tests) {
      const testStart = Date.now();
      try {
        for (const hook of this.beforeEachHooks) {
          await hook();
        }

        await testCase.fn();

        for (const hook of this.afterEachHooks) {
          await hook();
        }

        testCase.status = 'PASS';
        testCase.durationMs = Date.now() - testStart;
        results.passed++;
      } catch (err) {
        testCase.status = 'FAIL';
        testCase.error = err;
        testCase.durationMs = Date.now() - testStart;
        results.failed++;
      }

      results.tests.push(testCase);
      if (reporter && reporter.onTestResult) {
        reporter.onTestResult(testCase, this.name);
      }
    }

    try {
      for (const hook of this.afterAllHooks) {
        await hook();
      }
    } catch (err) {
      console.error(`Warning: afterAll hook error in suite "${this.name}":`, err.message);
    }

    results.durationMs = Date.now() - suiteStart;
    return results;
  }
}

let activeSuite = null;
const suites = [];

function describe(suiteName, fn) {
  const previousSuite = activeSuite;
  const suite = new TestSuiteContext(suiteName);
  activeSuite = suite;
  suites.push(suite);

  try {
    fn();
  } finally {
    activeSuite = previousSuite;
  }
  return suite;
}

function test(testName, fn) {
  if (!activeSuite) {
    throw new Error(`test("${testName}") must be defined inside a describe(...) block.`);
  }
  activeSuite.addTest(testName, fn);
}

const it = test;

function beforeAll(fn) {
  if (!activeSuite) throw new Error('beforeAll must be defined inside describe block');
  activeSuite.addBeforeAll(fn);
}

function afterAll(fn) {
  if (!activeSuite) throw new Error('afterAll must be defined inside describe block');
  activeSuite.addAfterAll(fn);
}

function beforeEach(fn) {
  if (!activeSuite) throw new Error('beforeEach must be defined inside describe block');
  activeSuite.addBeforeEach(fn);
}

function afterEach(fn) {
  if (!activeSuite) throw new Error('afterEach must be defined inside describe block');
  activeSuite.addAfterEach(fn);
}

function getSuites() {
  return suites;
}

function clearSuites() {
  suites.length = 0;
  activeSuite = null;
}

module.exports = {
  describe,
  test,
  it,
  beforeAll,
  afterAll,
  beforeEach,
  afterEach,
  getSuites,
  clearSuites,
  TestSuiteContext,
};
