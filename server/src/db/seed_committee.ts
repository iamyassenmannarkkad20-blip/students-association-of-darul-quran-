import { query } from './index';

async function seedCommittee() {
  console.log('--- Initializing Executive Committee Table & Seed ---');

  // 1. Create table if not exists
  await query(`
    CREATE TABLE IF NOT EXISTS executive_committee (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(150) NOT NULL,
      designation VARCHAR(100) NOT NULL,
      photo_url TEXT DEFAULT '',
      order_index INT DEFAULT 0,
      bio TEXT DEFAULT '',
      phone VARCHAR(30) DEFAULT '',
      email VARCHAR(100) DEFAULT '',
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log('✅ executive_committee table ready.');

  // 2. Default 7 Apex Leaders provided by user
  const leaders = [
    {
      name: 'Hafiz Rishad Omanoor',
      designation: 'President',
      order_index: 1,
      bio: 'Leading the Students Association of Darul Quran with vision and dedication.',
    },
    {
      name: 'Hafiz Yaseen Mannarkkad',
      designation: 'Secretary',
      order_index: 2,
      bio: 'Coordinating student welfare, academic progress, and organizational initiatives.',
    },
    {
      name: 'Hafiz Jiyad Cheruppa',
      designation: 'Treasurer',
      order_index: 3,
      bio: 'Overseeing financial stewardship and resource allocation.',
    },
    {
      name: 'Hafiz Nusair Kasaragod',
      designation: 'Vice President',
      order_index: 4,
      bio: 'Guiding regional coordination and student activities.',
    },
    {
      name: 'Hafiz Afnan Kunnamangalam',
      designation: 'Vice President',
      order_index: 5,
      bio: 'Fostering academic excellence and campus programs.',
    },
    {
      name: 'Hafiz Misbah Wayanad',
      designation: 'J. Secretary',
      order_index: 6,
      bio: 'Assisting secretariat administration and digital communication.',
    },
    {
      name: 'Hafiz Dilshan Moothedam',
      designation: 'J. Secretary',
      order_index: 7,
      bio: 'Supporting documentation, archives, and membership outreach.',
    },
  ];

  for (const leader of leaders) {
    const existing = await query(
      'SELECT id FROM executive_committee WHERE name = $1 AND designation = $2',
      [leader.name, leader.designation]
    );

    if (existing.rows.length === 0) {
      await query(
        `INSERT INTO executive_committee (name, designation, order_index, bio, photo_url, is_active)
         VALUES ($1, $2, $3, $4, '', TRUE)`,
        [leader.name, leader.designation, leader.order_index, leader.bio]
      );
      console.log(`Inserted leader: ${leader.designation} - ${leader.name}`);
    } else {
      await query(
        `UPDATE executive_committee 
         SET order_index = $1, bio = $2, is_active = TRUE
         WHERE id = $3`,
        [leader.order_index, leader.bio, existing.rows[0].id]
      );
      console.log(`Updated leader: ${leader.designation} - ${leader.name}`);
    }
  }

  console.log('✅ Committee seed completed successfully.');
  process.exit(0);
}

seedCommittee().catch((err) => {
  console.error('Failed to seed committee:', err);
  process.exit(1);
});
