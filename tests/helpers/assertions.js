/**
 * SADQ Platform E2E Test Suite - Assertions Library
 */

class AssertionError extends Error {
  constructor(message, actual, expected) {
    super(message);
    this.name = 'AssertionError';
    this.actual = actual;
    this.expected = expected;
  }
}

function assert(condition, message = 'Assertion failed') {
  if (!condition) {
    throw new AssertionError(message, condition, true);
  }
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    const defaultMsg = `Expected ${JSON.stringify(expected)}, but got ${JSON.stringify(actual)}`;
    throw new AssertionError(message ? `${message} (${defaultMsg})` : defaultMsg, actual, expected);
  }
}

function assertNotEqual(actual, expected, message) {
  if (actual === expected) {
    const defaultMsg = `Expected value NOT to equal ${JSON.stringify(expected)}`;
    throw new AssertionError(message ? `${message} (${defaultMsg})` : defaultMsg, actual, expected);
  }
}

function assertIncludes(haystack, needle, message) {
  if (typeof haystack === 'string') {
    if (!haystack.includes(needle)) {
      const defaultMsg = `String "${haystack.slice(0, 100)}..." does not include "${needle}"`;
      throw new AssertionError(message ? `${message} (${defaultMsg})` : defaultMsg, haystack, needle);
    }
  } else if (Array.isArray(haystack)) {
    if (!haystack.includes(needle)) {
      const defaultMsg = `Array does not include ${JSON.stringify(needle)}`;
      throw new AssertionError(message ? `${message} (${defaultMsg})` : defaultMsg, haystack, needle);
    }
  } else {
    throw new AssertionError(`assertIncludes requires string or array, got ${typeof haystack}`);
  }
}

function assertNotIncludes(haystack, needle, message) {
  if (typeof haystack === 'string') {
    if (haystack.includes(needle)) {
      const defaultMsg = `String contains forbidden "${needle}"`;
      throw new AssertionError(message ? `${message} (${defaultMsg})` : defaultMsg, haystack, needle);
    }
  } else if (Array.isArray(haystack)) {
    if (haystack.includes(needle)) {
      const defaultMsg = `Array contains forbidden ${JSON.stringify(needle)}`;
      throw new AssertionError(message ? `${message} (${defaultMsg})` : defaultMsg, haystack, needle);
    }
  }
}

function assertMatch(text, regex, message) {
  if (!regex.test(text)) {
    const defaultMsg = `Text "${text}" does not match pattern ${regex}`;
    throw new AssertionError(message ? `${message} (${defaultMsg})` : defaultMsg, text, regex.toString());
  }
}

function assertStatus(res, expectedStatus, message) {
  if (res.status !== expectedStatus) {
    const bodySnippet = res.body ? JSON.stringify(res.body).slice(0, 200) : 'No body';
    const defaultMsg = `Expected HTTP ${expectedStatus}, received HTTP ${res.status}. Body: ${bodySnippet}`;
    throw new AssertionError(message ? `${message} (${defaultMsg})` : defaultMsg, res.status, expectedStatus);
  }
}

function assertArrayLength(arr, minLength, message) {
  if (!Array.isArray(arr) || arr.length < minLength) {
    const defaultMsg = `Expected array length >= ${minLength}, got ${Array.isArray(arr) ? arr.length : 'not an array'}`;
    throw new AssertionError(message ? `${message} (${defaultMsg})` : defaultMsg, arr, minLength);
  }
}

function assertObjectHasProps(obj, props, message) {
  if (!obj || typeof obj !== 'object') {
    throw new AssertionError(`Expected object, got ${typeof obj}`);
  }
  for (const prop of props) {
    if (!(prop in obj)) {
      const defaultMsg = `Object missing required property "${prop}"`;
      throw new AssertionError(message ? `${message} (${defaultMsg})` : defaultMsg, Object.keys(obj), prop);
    }
  }
}

module.exports = {
  AssertionError,
  assert,
  assertEqual,
  assertNotEqual,
  assertIncludes,
  assertNotIncludes,
  assertMatch,
  assertStatus,
  assertArrayLength,
  assertObjectHasProps,
};
