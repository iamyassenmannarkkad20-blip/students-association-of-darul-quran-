import { query } from './index';

async function migrateManualPoints() {
  console.log('--- Updating class_score_ledger to allow MANUAL_ADJUSTMENT ---');
  try {
    await query(`
      ALTER TABLE class_score_ledger DROP CONSTRAINT IF EXISTS class_score_ledger_source_type_check;
      ALTER TABLE class_score_ledger ADD CONSTRAINT class_score_ledger_source_type_check
        CHECK (source_type IN ('SUB_WING_RESULT', 'MAIN_COMMITTEE_TASK', 'MAIN_COMMITTEE_PROGRAM', 'MANUAL_ADJUSTMENT'));
    `);
    console.log('✅ Updated class_score_ledger constraint successfully to support MANUAL_ADJUSTMENT.');
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
}

migrateManualPoints();
