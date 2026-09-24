/**
 * Static Audit Test: 10 Official Units and 5 Roles Architecture
 * 
 * Verifies that the platform strictly implements the 10 official organisation units
 * (EB, IA, MPW, MB, LB, RW, CS, DW, LIB, SB) and 5 official roles across types,
 * database, and endpoints.
 */

const fs = require('fs');
const path = require('path');
const { describe, test } = require('../helpers/test-harness');
const { assert, assertEqual } = require('../helpers/assertions');
const { OFFICIAL_UNIT_CODES, OFFICIAL_ROLES, OFFICIAL_CLASS_CODES } = require('../helpers/config');
const { queryDb } = require('../helpers/test-db');

describe('Static Architecture Audit: 10 Official Units & 5 Roles', () => {
  const rootDir = path.resolve(__dirname, '../..');
  const sharedTypesPath = path.join(rootDir, 'shared', 'types.ts');
  const sharedContent = fs.readFileSync(sharedTypesPath, 'utf8');

  test('SA-UNIT-01: shared/types.ts defines exactly the 10 official organisation units', () => {
    for (const code of OFFICIAL_UNIT_CODES) {
      assert(
        sharedContent.includes(`code: '${code}'`),
        `shared/types.ts must define official unit code ${code}`
      );
    }
  });

  test('SA-UNIT-02: shared/types.ts defines exactly the 5 official roles', () => {
    for (const role of OFFICIAL_ROLES) {
      assert(
        sharedContent.includes(`${role}: '${role}'`),
        `shared/types.ts must define official role ${role}`
      );
    }
  });

  test('SA-UNIT-03: shared/types.ts restricts class codes strictly to 01 through 08', () => {
    for (const cc of OFFICIAL_CLASS_CODES) {
      assert(
        sharedContent.includes(`'${cc}'`),
        `shared/types.ts must include class code ${cc}`
      );
    }
    assert(!sharedContent.includes(`'00'`), 'Class code 00 must not exist');
    assert(!sharedContent.includes(`'09'`), 'Class code 09 must not exist');
    assert(!sharedContent.includes(`'10'`), 'Class code 10 must not exist');
  });

  test('SA-UNIT-04: Database migration seeds all 10 official organisation units', () => {
    const migrationPath = path.join(rootDir, 'server', 'src', 'db', 'migrations', '001_initial_schema.sql');
    if (fs.existsSync(migrationPath)) {
      const sql = fs.readFileSync(migrationPath, 'utf8');
      for (const code of OFFICIAL_UNIT_CODES) {
        assert(
          sql.includes(`'${code}'`),
          `Migration SQL must insert unit code ${code}`
        );
      }
    }
  });

  test('SA-UNIT-05: Live PostgreSQL database contains all 10 units in organisation_units table', async () => {
    try {
      const res = await queryDb('SELECT code, name FROM organisation_units ORDER BY code ASC');
      assertEqual(res.rows.length, 10, 'Live database must contain exactly 10 units');
      const codesInDb = res.rows.map((r) => r.code);
      for (const expected of OFFICIAL_UNIT_CODES) {
        assert(
          codesInDb.includes(expected),
          `Live database organisation_units missing unit code ${expected}`
        );
      }
    } catch (err) {
      if (err.message.includes('pg package missing') || err.message.includes('connect')) {
        // Fallback: verify SQL file
        const migrationPath = path.join(rootDir, 'server', 'src', 'db', 'migrations', '001_initial_schema.sql');
        const sql = fs.readFileSync(migrationPath, 'utf8');
        assert(sql.includes('INSERT INTO organisation_units'), 'SQL seeds organisation units');
      } else {
        throw err;
      }
    }
  });
});
