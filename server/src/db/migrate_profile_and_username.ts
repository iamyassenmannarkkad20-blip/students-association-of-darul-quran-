import { query } from './index';

async function runMigration() {
  console.log('--- Starting Migration: Username, Social Fields, & Admin Student Link ---');

  // 1. Add username column to users table
  await query(`
    ALTER TABLE users 
    ADD COLUMN IF NOT EXISTS username VARCHAR(100) UNIQUE;
  `);
  console.log('✓ Added username column to users table');

  // 2. Populate usernames for known users
  await query(`
    UPDATE users SET username = 'yaseen' WHERE email = 'foryaseen@gmail.com' AND (username IS NULL OR username = '');
  `);
  await query(`
    UPDATE users SET username = 'yaseen111' WHERE email = 'foryaseen111@gmail.com' AND (username IS NULL OR username = '');
  `);
  await query(`
    UPDATE users SET username = 'sadq_admin' WHERE email = 'admin@sadq.org' AND (username IS NULL OR username = '');
  `);

  // Fill in any remaining null usernames with slug derived from email
  const nullUsers = await query(`SELECT id, email FROM users WHERE username IS NULL OR username = ''`);
  for (const u of nullUsers.rows) {
    const defaultUsername = u.email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '') || `user_${u.id.substring(0, 6)}`;
    await query(`UPDATE users SET username = $1 WHERE id = $2`, [defaultUsername, u.id]);
    console.log(`Assigned username '${defaultUsername}' to user ${u.email}`);
  }

  // 3. Add social contacts & privacy toggles to student_profiles
  await query(`
    ALTER TABLE student_profiles 
    ADD COLUMN IF NOT EXISTS instagram_handle VARCHAR(100),
    ADD COLUMN IF NOT EXISTS phone_number VARCHAR(30),
    ADD COLUMN IF NOT EXISTS website_url TEXT,
    ADD COLUMN IF NOT EXISTS show_instagram BOOLEAN DEFAULT TRUE;
  `);
  console.log('✓ Added social and privacy columns to student_profiles');

  // 4. Ensure all admin users have a student profile so they have full student dashboard access
  const adminsWithoutProfile = await query(`
    SELECT u.id, u.email, u.username 
    FROM users u 
    LEFT JOIN student_profiles sp ON sp.user_id = u.id 
    WHERE sp.id IS NULL AND u.role IN ('SUPER_ADMIN', 'ADMIN')
  `);

  for (const admin of adminsWithoutProfile.rows) {
    const slug = admin.username || admin.email.split('@')[0];
    await query(`
      INSERT INTO student_profiles (user_id, full_name, profile_slug, class_code, is_public)
      VALUES ($1, $2, $3, '08', TRUE)
    `, [admin.id, admin.username || 'SADQ Administrator', slug]);
    console.log(`✓ Created linked student profile for admin: ${admin.email}`);
  }

  console.log('🎉 Migration completed successfully!');
  process.exit(0);
}

runMigration().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
