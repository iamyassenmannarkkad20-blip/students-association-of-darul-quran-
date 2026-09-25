import { query } from './index';

async function migrateCyclesAndUnions() {
  console.log('--- Migrating Academic Cycles, Class Sangadhanakal & Alumni Support ---');

  // 1. Create academic_cycles table
  await query(`
    CREATE TABLE IF NOT EXISTS academic_cycles (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(150) NOT NULL,
      academic_year VARCHAR(20) DEFAULT '2026-2027',
      start_date DATE NOT NULL DEFAULT CURRENT_DATE,
      target_leave_date DATE,
      status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'CLOSED')),
      best_class_code VARCHAR(10),
      best_class_points INT DEFAULT 0,
      best_class_task_count INT DEFAULT 0,
      closed_at TIMESTAMPTZ,
      notes TEXT DEFAULT '',
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('✅ Created academic_cycles table.');

  // 2. Add cycle_id to class_score_ledger
  await query(`
    ALTER TABLE class_score_ledger 
      ADD COLUMN IF NOT EXISTS cycle_id UUID REFERENCES academic_cycles(id) ON DELETE SET NULL;
    CREATE INDEX IF NOT EXISTS idx_ledger_cycle ON class_score_ledger(cycle_id);
  `);
  console.log('✅ Updated class_score_ledger with cycle_id column.');

  // 3. Update student_profiles to support 'ALUMNI' and graduation_year
  await query(`
    ALTER TABLE student_profiles DROP CONSTRAINT IF EXISTS student_profiles_class_code_check;
    ALTER TABLE student_profiles ADD CONSTRAINT student_profiles_class_code_check 
      CHECK (class_code IN ('01', '02', '03', '04', '05', '06', '07', '08', 'ALUMNI'));
    ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS graduation_year VARCHAR(10);
  `);
  console.log('✅ Enhanced student_profiles with ALUMNI and graduation_year support.');

  // 4. Create class_sangadhanakal table (8 Class Unions)
  await query(`
    CREATE TABLE IF NOT EXISTS class_sangadhanakal (
      class_code VARCHAR(10) PRIMARY KEY CHECK (class_code IN ('01', '02', '03', '04', '05', '06', '07', '08')),
      name VARCHAR(150) NOT NULL,
      motto VARCHAR(255) DEFAULT '',
      description TEXT DEFAULT '',
      logo_url TEXT DEFAULT '',
      banner_url TEXT DEFAULT '',
      chairman_id UUID REFERENCES users(id) ON DELETE SET NULL,
      convener_id UUID REFERENCES users(id) ON DELETE SET NULL,
      academic_year VARCHAR(20) DEFAULT '2026-2027',
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('✅ Created class_sangadhanakal table.');

  // 5. Seed default 8 Class Sangadhanakal
  const defaultUnions = [
    { code: '01', name: 'Al-Huda Sangadhana', motto: 'Foundation of Wisdom & Faith' },
    { code: '02', name: 'Al-Furqan Sangadhana', motto: 'Discerning Truth with Knowledge' },
    { code: '03', name: 'Al-Noor Sangadhana', motto: 'Illuminating Minds & Hearts' },
    { code: '04', name: 'An-Najm Sangadhana', motto: 'Guided by the Stars of Righteousness' },
    { code: '05', name: 'Ash-Shams Sangadhana', motto: 'Radiance of Erudition & Character' },
    { code: '06', name: 'Al-Bayan Sangadhana', motto: 'Eloquence, Integrity & Action' },
    { code: '07', name: 'Al-Bukhari Sangadhana', motto: 'Traditions of Authentic Scholarship' },
    { code: '08', name: 'Al-Farooq Sangadhana', motto: 'Vanguard of Moral Leadership & Distinction' },
  ];

  for (const u of defaultUnions) {
    await query(
      `INSERT INTO class_sangadhanakal (class_code, name, motto)
       VALUES ($1, $2, $3)
       ON CONFLICT (class_code) DO UPDATE
       SET name = EXCLUDED.name, motto = EXCLUDED.motto`,
      [u.code, u.name, u.motto]
    );
  }
  console.log('✅ Seeded 8 Class Sangadhanakal (Batch Unions).');

  // 6. Ensure at least one active cycle exists, and link orphaned ledger rows
  const activeCycle = await query(`SELECT id FROM academic_cycles WHERE status = 'ACTIVE' LIMIT 1`);
  let cycleId: string;
  if (activeCycle.rows.length === 0) {
    const newCycle = await query(`
      INSERT INTO academic_cycles (name, academic_year, start_date, notes)
      VALUES ('Inaugural Academic Cycle (Shawwal - Dhul Qa''dah)', '2026-2027', CURRENT_DATE, 'Initial academic cycle between college leaves')
      RETURNING id
    `);
    cycleId = newCycle.rows[0].id;
    console.log(`✅ Created initial active cycle: ${cycleId}`);
  } else {
    cycleId = activeCycle.rows[0].id;
    console.log(`ℹ️ Existing active cycle detected: ${cycleId}`);
  }

  // Link any unassigned ledger rows to the active cycle
  await query(`UPDATE class_score_ledger SET cycle_id = $1 WHERE cycle_id IS NULL`, [cycleId]);
  console.log('✅ Linked all class score ledger rows to the active cycle.');

  console.log('🎉 Migration completed successfully!');
  process.exit(0);
}

migrateCyclesAndUnions().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
