import { query } from './index';
import argon2 from 'argon2';
import { ROLES } from '../../../shared/types';

async function seedAdmins() {
  console.log('--- Setting up Admin Credentials ---');

  const admins = [
    {
      email: 'foryaseen@gmail.com',
      password: '12345678',
      fullName: 'Yaseen Mannarkkad',
      role: ROLES.SUPER_ADMIN,
    },
    {
      email: 'admin@sadq.org',
      password: 'SadqAdmin@2026',
      fullName: 'SADQ Super Admin',
      role: ROLES.SUPER_ADMIN,
    },
  ];

  for (const admin of admins) {
    const passwordHash = await argon2.hash(admin.password, { type: argon2.argon2id });

    // Check if user exists
    const check = await query('SELECT id FROM users WHERE email = $1', [admin.email]);

    let userId: string;
    if (check.rows.length > 0) {
      userId = check.rows[0].id;
      await query(
        `UPDATE users SET password_hash = $1, role = $2, is_active = TRUE WHERE id = $3`,
        [passwordHash, admin.role, userId]
      );
      console.log(`Updated admin account: ${admin.email}`);
    } else {
      const inserted = await query(
        `INSERT INTO users (email, password_hash, role, is_active)
         VALUES ($1, $2, $3, TRUE)
         RETURNING id`,
        [admin.email, passwordHash, admin.role]
      );
      userId = inserted.rows[0].id;
      console.log(`Created new admin account: ${admin.email}`);
    }

    // Ensure profile exists in student_profiles
    const profileCheck = await query('SELECT id FROM student_profiles WHERE user_id = $1', [userId]);
    if (profileCheck.rows.length === 0) {
      const slug = admin.email.split('@')[0] + '-' + Math.random().toString(36).substring(2, 6);
      await query(
        `INSERT INTO student_profiles (user_id, full_name, profile_slug, class_code, is_public)
         VALUES ($1, $2, $3, '08', TRUE)`,
        [userId, admin.fullName, slug]
      );
      console.log(`Created profile for: ${admin.fullName}`);
    }
  }

  console.log('✅ Admin accounts verified successfully in Supabase PostgreSQL!');
  process.exit(0);
}

seedAdmins().catch((err) => {
  console.error('Error seeding admin accounts:', err);
  process.exit(1);
});
