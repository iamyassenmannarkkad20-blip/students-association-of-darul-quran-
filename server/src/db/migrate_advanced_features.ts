import { query } from './index';

async function migrateAdvancedFeatures() {
  console.log('Starting migration for advanced SADQ features...');
  try {
    // 1. Result Correction & Audit History Table
    await query(`
      CREATE TABLE IF NOT EXISTS result_audit_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        entity_type VARCHAR(50) NOT NULL,
        entity_id VARCHAR(100),
        old_score INTEGER,
        new_score INTEGER,
        reason TEXT NOT NULL,
        changed_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        changed_by_name VARCHAR(150),
        action_type VARCHAR(50) DEFAULT 'CORRECTION',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Created result_audit_history table');

    // 2. Add Lock & Reopen status to program_results
    await query(`
      ALTER TABLE program_results 
      ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT TRUE,
      ADD COLUMN IF NOT EXISTS reopen_reason TEXT;
    `);
    console.log('✅ Added is_locked and reopen_reason to program_results');

    // 3. Leadership History Table
    await query(`
      CREATE TABLE IF NOT EXISTS leadership_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        role_title VARCHAR(150) NOT NULL,
        entity_type VARCHAR(50) NOT NULL,
        entity_name VARCHAR(150) NOT NULL,
        term_year VARCHAR(50),
        is_current BOOLEAN DEFAULT FALSE,
        citation TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Created leadership_history table');

    // 4. Smart Notifications Table
    await query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(200) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(50) NOT NULL,
        link VARCHAR(255),
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Created notifications table');

    // 5. Populate some leadership history from current organisation_memberships and class union leaders if empty
    const leadCount = await query(`SELECT COUNT(*)::int as count FROM leadership_history`);
    if (leadCount.rows[0].count === 0) {
      await query(`
        INSERT INTO leadership_history (user_id, role_title, entity_type, entity_name, term_year, is_current)
        SELECT om.user_id, COALESCE(om.designation, 'Executive Member'), 'OFFICIAL_UNIT', ou.name, '2025-2026', TRUE
        FROM organisation_memberships om
        JOIN organisation_units ou ON ou.code = om.unit_code
        WHERE om.is_active = TRUE
        LIMIT 20;
      `);
      console.log('✅ Initialized leadership history from existing active memberships');
    }

    console.log('🎉 Advanced features migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    process.exit(0);
  }
}

migrateAdvancedFeatures();
