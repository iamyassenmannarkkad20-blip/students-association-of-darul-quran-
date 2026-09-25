import { query } from './index';

async function seedResultsSystem() {
  console.log('--- Initializing SADQ Result & Class Performance Tables & Seed ---');

  // 1. Create tables
  await query(`
    -- 1. SUB-WINGS TABLE (13 Sub-Wings)
    CREATE TABLE IF NOT EXISTS sub_wings (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      code VARCHAR(20) UNIQUE NOT NULL,
      name VARCHAR(150) NOT NULL,
      description TEXT DEFAULT '',
      chairman_id UUID REFERENCES users(id) ON DELETE SET NULL,
      convener_id UUID REFERENCES users(id) ON DELETE SET NULL,
      status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    -- 2. CLASS SCORE RULES TABLE (Configurable position-to-points mapping)
    CREATE TABLE IF NOT EXISTS class_score_rules (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(100) NOT NULL,
      first_points INT NOT NULL DEFAULT 10,
      second_points INT NOT NULL DEFAULT 7,
      third_points INT NOT NULL DEFAULT 5,
      participation_points INT NOT NULL DEFAULT 1,
      status VARCHAR(20) DEFAULT 'ACTIVE',
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    -- 3. PROGRAMS TABLE (Offline Sub-Wing competitions/programs)
    CREATE TABLE IF NOT EXISTS programs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      sub_wing_id UUID NOT NULL REFERENCES sub_wings(id) ON DELETE CASCADE,
      title VARCHAR(200) NOT NULL,
      description TEXT DEFAULT '',
      program_date DATE NOT NULL DEFAULT CURRENT_DATE,
      maximum_mark NUMERIC(6, 2) NOT NULL DEFAULT 20.00,
      score_rule_id UUID REFERENCES class_score_rules(id) ON DELETE SET NULL,
      status VARCHAR(20) DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'SUBMITTED', 'PENDING_REVIEW', 'APPROVED', 'PUBLISHED', 'ARCHIVED')),
      winner_poster_url TEXT DEFAULT '',
      created_by UUID REFERENCES users(id) ON DELETE SET NULL,
      published_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    -- 4. PROGRAM RESULTS TABLE (Student marks & calculated positions)
    CREATE TABLE IF NOT EXISTS program_results (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
      student_id UUID REFERENCES users(id) ON DELETE SET NULL,
      student_name VARCHAR(150) NOT NULL,
      class_code VARCHAR(10) NOT NULL CHECK (class_code IN ('01', '02', '03', '04', '05', '06', '07', '08')),
      mark NUMERIC(6, 2) NOT NULL,
      position INT DEFAULT 0, -- 1=1st, 2=2nd, 3=3rd, 0=participant
      class_points INT NOT NULL DEFAULT 0,
      winner_poster_url TEXT DEFAULT '',
      status VARCHAR(20) DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PUBLISHED')),
      published_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_prog_res_prog ON program_results(program_id);
    CREATE INDEX IF NOT EXISTS idx_prog_res_class ON program_results(class_code);
    CREATE INDEX IF NOT EXISTS idx_prog_res_student ON program_results(student_id);

    -- 5. CLASS TASKS TABLE (Offline Main Committee Tasks)
    CREATE TABLE IF NOT EXISTS class_tasks (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title VARCHAR(200) NOT NULL,
      description TEXT DEFAULT '',
      assigned_class VARCHAR(10) CHECK (assigned_class IS NULL OR assigned_class IN ('01', '02', '03', '04', '05', '06', '07', '08')),
      maximum_mark NUMERIC(6, 2) NOT NULL DEFAULT 20.00,
      task_date DATE NOT NULL DEFAULT CURRENT_DATE,
      task_category VARCHAR(100) DEFAULT 'Main Committee Task',
      winner_poster_url TEXT DEFAULT '',
      status VARCHAR(20) DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
      created_by UUID REFERENCES users(id) ON DELETE SET NULL,
      published_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    -- 6. CLASS TASK RESULTS TABLE (Marks assigned to classes for tasks)
    CREATE TABLE IF NOT EXISTS class_task_results (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      task_id UUID NOT NULL REFERENCES class_tasks(id) ON DELETE CASCADE,
      class_code VARCHAR(10) NOT NULL CHECK (class_code IN ('01', '02', '03', '04', '05', '06', '07', '08')),
      mark NUMERIC(6, 2) NOT NULL,
      class_points INT NOT NULL DEFAULT 0,
      winner_poster_url TEXT DEFAULT '',
      status VARCHAR(20) DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PUBLISHED')),
      published_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(task_id, class_code)
    );

    -- 7. CLASS SCORE LEDGER TABLE (Transaction-safe Double-Count Protection)
    CREATE TABLE IF NOT EXISTS class_score_ledger (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      class_code VARCHAR(10) NOT NULL CHECK (class_code IN ('01', '02', '03', '04', '05', '06', '07', '08')),
      source_type VARCHAR(30) NOT NULL CHECK (source_type IN ('SUB_WING_RESULT', 'MAIN_COMMITTEE_TASK')),
      source_id UUID NOT NULL,
      points INT NOT NULL,
      description TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_ledger_class ON class_score_ledger(class_code);
    CREATE INDEX IF NOT EXISTS idx_ledger_source ON class_score_ledger(source_type, source_id);
  `);

  console.log('✅ Database schema created successfully.');

  // 2. Pre-seed Class Score Rules
  const existingRules = await query('SELECT id FROM class_score_rules LIMIT 1');
  if (existingRules.rows.length === 0) {
    await query(`
      INSERT INTO class_score_rules (name, first_points, second_points, third_points, participation_points)
      VALUES 
        ('Standard Competition Rule (10 - 7 - 5)', 10, 7, 5, 1),
        ('Major Championship Fest Rule (20 - 15 - 10)', 20, 15, 10, 2),
        ('Literary & Oratory Rule (15 - 10 - 5)', 15, 10, 5, 0)
    `);
    console.log('✅ Seeded default class score rules.');
  }

  // 3. Pre-seed 13 Sub-Wings (Data-Driven list, editable by Admin)
  const defaultSubWings = [
    { code: 'SW01', name: 'Quranic Hifz & Recitation Wing', description: 'Promoting Quran memorization, tajweed, and tartil competitions.' },
    { code: 'SW02', name: 'Hadith & Sunnah Studies Wing', description: 'Classical hadith memorization, narration, and comprehension.' },
    { code: 'SW03', name: 'Arabic Language & Eloquence Wing', description: 'Arabic rhetoric, public speaking, poetry, and classical grammar.' },
    { code: 'SW04', name: 'English Oratory & Debate Wing', description: 'English debate, extempore speech, essays, and leadership communication.' },
    { code: 'SW05', name: 'Malayalam Literary & Creative Wing', description: 'Malayalam essays, short stories, poetry, and cultural writing.' },
    { code: 'SW06', name: 'Urdu & Multi-lingual Wing', description: 'Multi-lingual oratory, Urdu poetry, and translation crafts.' },
    { code: 'SW07', name: 'Da\'wah & Public Outreach Wing', description: 'Spiritual guidance, public discourse, and ethical community outreach.' },
    { code: 'SW08', name: 'Islamic Arts & Calligraphy Wing', description: 'Traditional Arabic calligraphy, Islamic design, and sacred illumination.' },
    { code: 'SW09', name: 'Media, Design & Tech Wing', description: 'Video editing, poster designing, digital publishing, and tech development.' },
    { code: 'SW10', name: 'Research & Publications Wing', description: 'Scholarly papers, monograph documentation, and academic surveys.' },
    { code: 'SW11', name: 'Community Welfare & Health Wing', description: 'Health awareness, community service, medical aid, and campus hygiene.' },
    { code: 'SW12', name: 'Moral Studies & Ethics Wing', description: 'Tarbiya sessions, ethical discourse, and spiritual reflection circles.' },
    { code: 'SW13', name: 'Creative Innovations & Special Tasks Wing', description: 'Inter-disciplinary student projects and special organizational initiatives.' },
  ];

  for (const sw of defaultSubWings) {
    await query(
      `INSERT INTO sub_wings (code, name, description)
       VALUES ($1, $2, $3)
       ON CONFLICT (code) DO UPDATE
       SET name = EXCLUDED.name, description = EXCLUDED.description`,
      [sw.code, sw.name, sw.description]
    );
  }
  console.log('✅ Seeded 13 official Sub-Wings.');

  console.log('🎉 SADQ Result & Class Performance System initialization complete!');
  process.exit(0);
}

seedResultsSystem().catch((err) => {
  console.error('Error seeding results system:', err);
  process.exit(1);
});
