import { query } from './index';

async function migrateClassUnionItems() {
  console.log('--- Migrating Class Union Items, Cleaning Fake Data & Fixing Score Types ---');

  // 1. Fix class_score_ledger source_type check constraint
  try {
    await query(`
      ALTER TABLE class_score_ledger DROP CONSTRAINT IF EXISTS class_score_ledger_source_type_check;
      ALTER TABLE class_score_ledger ADD CONSTRAINT class_score_ledger_source_type_check
        CHECK (source_type IN ('SUB_WING_RESULT', 'MAIN_COMMITTEE_TASK', 'MAIN_COMMITTEE_PROGRAM'));
    `);
    console.log('✅ Updated class_score_ledger source_type constraint.');
  } catch (err) {
    console.error('Constraint update warning:', err);
  }

  // 2. Remove fake names & fake mottos from class_sangadhanakal (Reset to clean defaults: "Class 01 Union", etc.)
  const classes = ['01', '02', '03', '04', '05', '06', '07', '08'];
  for (const c of classes) {
    await query(
      `UPDATE class_sangadhanakal
       SET name = $1,
           motto = '',
           description = '',
           logo_url = '',
           banner_url = ''
       WHERE class_code = $2 AND (name LIKE '%Sangadhana%' OR motto != '')`,
      [`Class ${c} Union`, c]
    );
  }
  console.log('✅ Removed fake names/mottos. Clean default names set: Class 01 Union - Class 08 Union.');

  // 3. Create class_union_items table
  await query(`
    CREATE TABLE IF NOT EXISTS class_union_items (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      class_code VARCHAR(10) NOT NULL CHECK (class_code IN ('01', '02', '03', '04', '05', '06', '07', '08')),
      title VARCHAR(200) NOT NULL,
      description TEXT DEFAULT '',
      category VARCHAR(50) NOT NULL CHECK (category IN ('PROJECT', 'MAGAZINE', 'VIDEO', 'POSTER', 'DOCUMENT')),
      item_url TEXT NOT NULL,
      thumbnail_url TEXT DEFAULT '',
      created_by UUID REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_cui_class ON class_union_items(class_code);
    CREATE INDEX IF NOT EXISTS idx_cui_cat ON class_union_items(category);
    CREATE INDEX IF NOT EXISTS idx_cui_created ON class_union_items(created_at DESC);
  `);
  console.log('✅ Created class_union_items table.');

  console.log('🎉 Migration successful!');
  process.exit(0);
}

migrateClassUnionItems().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
