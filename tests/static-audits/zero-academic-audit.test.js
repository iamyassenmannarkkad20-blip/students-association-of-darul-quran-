/**
 * Static Audit Test: Zero Academic Marks, GPA, or Fee Portals
 * 
 * Verifies that academic ERP features (marks, GPA, fee portals) remain
 * permanently excluded from the codebase per requirement R1 and Acceptance Criteria.
 */

const fs = require('fs');
const path = require('path');
const { describe, test } = require('../helpers/test-harness');
const { assert, assertNotIncludes } = require('../helpers/assertions');

describe('Static Security Audit: Zero Academic Marks, GPA & Fee Portals', () => {
  const rootDir = path.resolve(__dirname, '../..');
  const targetDirs = [
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
      } else if (/\.(ts|tsx|js|jsx|sql)$/.test(entry.name)) {
        files.push(fullPath);
      }
    }
    return files;
  }

  const allFiles = targetDirs.flatMap(getAllCodeFiles);

  test('SA-ACAD-01: Scans code files across client, server, and shared directories', () => {
    assert(allFiles.length > 0, `Expected code files to be found, found: ${allFiles.length}`);
  });

  test('SA-ACAD-02: Zero occurrence of GPA / CGPA variables or columns in database & code', () => {
    const forbiddenPatterns = [/\bgpa\b/i, /\bcgpa\b/i, /\bgrade_point_average\b/i];
    for (const filePath of allFiles) {
      const content = fs.readFileSync(filePath, 'utf8');
      for (const pattern of forbiddenPatterns) {
        const match = content.match(pattern);
        assert(
          !match,
          `Forbidden GPA keyword detected in ${path.relative(rootDir, filePath)}: "${match?.[0]}"`
        );
      }
    }
  });

  test('SA-ACAD-03: Zero occurrence of fee portal, tuition fees, or fee collections', () => {
    const forbiddenPatterns = [
      /\bfee_portal\b/i,
      /\bfee_payment\b/i,
      /\btuition_fee\b/i,
      /\bpayment_gateway\b/i,
      /\bschool_fees\b/i,
    ];
    for (const filePath of allFiles) {
      const content = fs.readFileSync(filePath, 'utf8');
      for (const pattern of forbiddenPatterns) {
        const match = content.match(pattern);
        assert(
          !match,
          `Forbidden Fee Portal keyword detected in ${path.relative(rootDir, filePath)}: "${match?.[0]}"`
        );
      }
    }
  });

  test('SA-ACAD-04: Zero occurrence of exam marks or report cards in database schema', () => {
    const schemaPath = path.join(rootDir, 'server', 'src', 'db', 'migrations', '001_initial_schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, 'utf8');
      const forbiddenInSchema = ['marks', 'gpa', 'cgpa', 'fee', 'tuition', 'report_card'];
      for (const word of forbiddenInSchema) {
        const regex = new RegExp(`\\b${word}\\b`, 'i');
        assert(
          !regex.test(schema),
          `Forbidden academic ERP term "${word}" found in initial schema: ${schemaPath}`
        );
      }
    }
  });

  test('SA-ACAD-05: Database migration contains only student growth, talents, and community tables', () => {
    const schemaPath = path.join(rootDir, 'server', 'src', 'db', 'migrations', '001_initial_schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, 'utf8');
      assert(schema.includes('student_talents'), 'Schema must define student_talents');
      assert(schema.includes('student_skills'), 'Schema must define student_skills');
      assert(schema.includes('student_achievements'), 'Schema must define student_achievements');
      assert(schema.includes('projects'), 'Schema must define projects');
    }
  });
});
