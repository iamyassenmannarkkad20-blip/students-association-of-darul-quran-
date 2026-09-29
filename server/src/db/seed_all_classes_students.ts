import { query } from './index';
import argon2 from 'argon2';

interface StudentSeed {
  name: string;
  username: string;
  email: string;
  classCode: string;
  bio: string;
  talents: { title: string; category: string }[];
  skills: { name: string; level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT'; category: string }[];
  leadershipRole?: { unitCode: string; designation: string };
  points: number;
  medals: { gold: number; silver: number; bronze: number };
}

const STUDENTS_DATA: StudentSeed[] = [
  // Class 01
  {
    name: 'Ahmad Farhan',
    username: 'farhan01',
    email: 'farhan01@sadq.org',
    classCode: '01',
    bio: 'Class 01 student passionate about Qur\'an tajweed and creative calligraphy.',
    talents: [
      { title: 'Qur\'an Recitation', category: 'Recitation' },
      { title: 'Arabic Calligraphy', category: 'Arts' },
    ],
    skills: [
      { name: 'Tajweed Rules', level: 'ADVANCED', category: 'Islamic Studies' },
      { name: 'Arabic Diacritics', level: 'INTERMEDIATE', category: 'Linguistics' },
    ],
    leadershipRole: { unitCode: 'IA', designation: 'Tajweed Wing Member' },
    points: 45,
    medals: { gold: 1, silver: 1, bronze: 0 },
  },
  {
    name: 'Zayd Ali',
    username: 'zayd01',
    email: 'zayd01@sadq.org',
    classCode: '01',
    bio: 'Enthusiastic beginner in public recitation and moral studies.',
    talents: [{ title: 'Adhan Recitation', category: 'Spiritual' }],
    skills: [{ name: 'Vocal Control', level: 'INTERMEDIATE', category: 'Arts' }],
    points: 30,
    medals: { gold: 0, silver: 1, bronze: 1 },
  },

  // Class 02
  {
    name: 'Bilal Hussain',
    username: 'bilal02',
    email: 'bilal02@sadq.org',
    classCode: '02',
    bio: 'Class 02 Union Convener with interest in nasheed composition and vocal arts.',
    talents: [
      { title: 'Nasheed & Harmonics', category: 'Music' },
      { title: 'Malayalam Elocution', category: 'Public Speaking' },
    ],
    skills: [
      { name: 'Microphone Delivery', level: 'ADVANCED', category: 'Public Speaking' },
      { name: 'Poem Recitation', level: 'EXPERT', category: 'Arts' },
    ],
    leadershipRole: { unitCode: 'CS', designation: 'Cultural Society Member' },
    points: 75,
    medals: { gold: 2, silver: 1, bronze: 0 },
  },
  {
    name: 'Adil Ameen',
    username: 'adil02',
    email: 'adil02@sadq.org',
    classCode: '02',
    bio: 'Active participant in sports and personality growth programs.',
    talents: [{ title: 'Sprint & Athletics', category: 'Sports' }],
    skills: [{ name: 'Speed & Agility', level: 'ADVANCED', category: 'Athletics' }],
    points: 40,
    medals: { gold: 1, silver: 0, bronze: 1 },
  },

  // Class 03
  {
    name: 'Salman Al-Faris',
    username: 'salman03',
    email: 'salman03@sadq.org',
    classCode: '03',
    bio: 'Digital explorer, web enthusiast, and design lead in class 03.',
    talents: [
      { title: 'Graphic Design', category: 'Digital Media' },
      { title: 'Web Development', category: 'Technology' },
    ],
    skills: [
      { name: 'Poster Design', level: 'EXPERT', category: 'Design' },
      { name: 'Frontend Code', level: 'ADVANCED', category: 'Technology' },
    ],
    leadershipRole: { unitCode: 'MB', designation: 'Media Board Designer' },
    points: 90,
    medals: { gold: 2, silver: 2, bronze: 1 },
  },
  {
    name: 'Tariq Mansoor',
    username: 'tariq03',
    email: 'tariq03@sadq.org',
    classCode: '03',
    bio: 'Dedicated reader and creative short story writer.',
    talents: [{ title: 'Creative Story Writing', category: 'Literature' }],
    skills: [{ name: 'Malayalam Prose', level: 'ADVANCED', category: 'Writing' }],
    points: 55,
    medals: { gold: 1, silver: 1, bronze: 0 },
  },

  // Class 04
  {
    name: 'Zayan Kabeer',
    username: 'zayan04',
    email: 'zayan04@sadq.org',
    classCode: '04',
    bio: 'Literary Board member, bilingual speech competitor and researcher.',
    talents: [
      { title: 'English Elocution', category: 'Public Speaking' },
      { title: 'Book Reviewing', category: 'Literary' },
    ],
    skills: [
      { name: 'English Essay', level: 'EXPERT', category: 'Language' },
      { name: 'Debate Strategy', level: 'ADVANCED', category: 'Speech' },
    ],
    leadershipRole: { unitCode: 'LB', designation: 'Literary Board Joint Convener' },
    points: 110,
    medals: { gold: 2, silver: 3, bronze: 0 },
  },
  {
    name: 'Rayan Ashiq',
    username: 'rayan04',
    email: 'rayan04@sadq.org',
    classCode: '04',
    bio: 'Sports enthusiast and Class 04 football squad captain.',
    talents: [{ title: 'Football & Team Captaincy', category: 'Sports' }],
    skills: [{ name: 'Team Leadership', level: 'EXPERT', category: 'Sports' }],
    points: 65,
    medals: { gold: 1, silver: 2, bronze: 1 },
  },

  // Class 05
  {
    name: 'Nabeel Rayan',
    username: 'nabeel05',
    email: 'nabeel05@sadq.org',
    classCode: '05',
    bio: 'Class 05 Union Chairman, parliamentary debater and Islamic history researcher.',
    talents: [
      { title: 'Parliamentary Debate', category: 'Public Speaking' },
      { title: 'Research Methodology', category: 'Academic' },
    ],
    skills: [
      { name: 'Speech Argumentation', level: 'EXPERT', category: 'Debate' },
      { name: 'Manuscript Analysis', level: 'ADVANCED', category: 'Research' },
    ],
    leadershipRole: { unitCode: 'RW', designation: 'Research Wing Contributor' },
    points: 130,
    medals: { gold: 3, silver: 2, bronze: 1 },
  },
  {
    name: 'Anas Shamil',
    username: 'anas05',
    email: 'anas05@sadq.org',
    classCode: '05',
    bio: 'Campus magazine editor and cultural program coordinator.',
    talents: [{ title: 'Editorial Writing', category: 'Journalism' }],
    skills: [{ name: 'Proofreading', level: 'ADVANCED', category: 'Editorial' }],
    points: 70,
    medals: { gold: 1, silver: 1, bronze: 2 },
  },

  // Class 06 (MUHAMMED YASIN + Ihsan Basheer)
  {
    name: 'MUHAMMED YASIN',
    username: 'yasin',
    email: 'iamyassemannarkkad2.0@gmail.com',
    classCode: '06',
    bio: 'Cultural Convener of Class 06 Union. Passionate about stage oration, Arabic script, and event leadership.',
    talents: [
      { title: 'Arabic Oration & Khutbah', category: 'Public Speaking' },
      { title: 'Thuluth Calligraphy', category: 'Fine Arts' },
      { title: 'Nasheed Vocalist', category: 'Music' },
    ],
    skills: [
      { name: 'Public Speaking & Stage Presence', level: 'EXPERT', category: 'Communication' },
      { name: 'Arabic Calligraphic Art', level: 'EXPERT', category: 'Arts' },
      { name: 'Classical Tajweed', level: 'ADVANCED', category: 'Islamic Arts' },
    ],
    leadershipRole: { unitCode: 'CS', designation: 'Cultural Society Executive' },
    points: 165,
    medals: { gold: 4, silver: 2, bronze: 1 },
  },
  {
    name: 'Ihsan Basheer',
    username: 'ihsan06',
    email: 'ihsan06@sadq.org',
    classCode: '06',
    bio: 'Class 06 academic coordinator with focus on community publications and study circles.',
    talents: [{ title: 'Academic Lecturing', category: 'Teaching' }],
    skills: [{ name: 'Curriculum Summaries', level: 'ADVANCED', category: 'Education' }],
    points: 85,
    medals: { gold: 2, silver: 1, bronze: 1 },
  },

  // Class 07
  {
    name: 'Hamza Basheer',
    username: 'hamza07',
    email: 'hamza07@sadq.org',
    classCode: '07',
    bio: 'Media Board Convener, documentary filmmaker, and official campus videographer.',
    talents: [
      { title: 'Video Production & Direction', category: 'Film' },
      { title: 'Live Broadcast Control', category: 'Broadcast' },
    ],
    skills: [
      { name: 'Adobe Premiere & Color Grading', level: 'EXPERT', category: 'Multimedia' },
      { name: 'Multi-cam Direction', level: 'ADVANCED', category: 'Broadcasting' },
    ],
    leadershipRole: { unitCode: 'MB', designation: 'Media Board Convener' },
    points: 155,
    medals: { gold: 3, silver: 3, bronze: 1 },
  },
  {
    name: 'Hashim Razi',
    username: 'hashim07',
    email: 'hashim07@sadq.org',
    classCode: '07',
    bio: 'Research scholar in Da\'wah literature and comparative philosophy.',
    talents: [{ title: 'Interfaith Dialogue', category: 'Da\'wah' }],
    skills: [{ name: 'Comparative Theology', level: 'ADVANCED', category: 'Philosophy' }],
    points: 95,
    medals: { gold: 2, silver: 1, bronze: 0 },
  },

  // Class 08
  {
    name: 'Yaseen Mannarkkad',
    username: 'yaseen111',
    email: 'foryaseen111@gmail.com',
    classCode: '08',
    bio: 'Class 08 Union Chairman and Senior Academy Leader. Dedicated to institutional excellence, youth mentoring, and campus innovation.',
    talents: [
      { title: 'Campus Leadership & Governance', category: 'Leadership' },
      { title: 'Keynote Public Speaking', category: 'Oration' },
      { title: 'Creative Directing & Strategy', category: 'Strategic' },
    ],
    skills: [
      { name: 'Student Union Leadership', level: 'EXPERT', category: 'Governance' },
      { name: 'Strategic Vision & Management', level: 'EXPERT', category: 'Administration' },
      { name: 'Bilingual Public Oratory', level: 'EXPERT', category: 'Oration' },
    ],
    leadershipRole: { unitCode: 'EB', designation: 'Education Board Senior Advisor' },
    points: 210,
    medals: { gold: 5, silver: 2, bronze: 1 },
  },
  {
    name: 'Irfan Habib',
    username: 'irfan08',
    email: 'irfan08@sadq.org',
    classCode: '08',
    bio: 'Senior Batch Convener and Class 08 Championship Team Lead.',
    talents: [
      { title: 'Event Production & Staging', category: 'Events' },
      { title: 'Quiz Mastery', category: 'Academic' },
    ],
    skills: [
      { name: 'Large Event Logistics', level: 'EXPERT', category: 'Operations' },
      { name: 'General Knowledge Research', level: 'ADVANCED', category: 'Quiz' },
    ],
    points: 140,
    medals: { gold: 3, silver: 2, bronze: 2 },
  },
];

export async function seedAllClassesStudents() {
  console.log('--- Seeding Comprehensive Student Dashboards across All 8 Classes ---');

  // 1. First, ensure ALL student profiles in the database are public
  await query(`UPDATE student_profiles SET is_public = TRUE;`);
  console.log('[OK] All student profiles updated to is_public = TRUE.');

  // Default password for newly seeded students
  const defaultPasswordHash = await argon2.hash('SadqStudent@2026', { type: argon2.argon2id });

  // Get or create a sample program to attach competition results
  let programRes = await query(`SELECT id FROM programs LIMIT 1;`);
  let programId: string;
  if (programRes.rows.length === 0) {
    const swRes = await query(`SELECT id FROM sub_wings LIMIT 1;`);
    const swId = swRes.rows.length > 0 ? swRes.rows[0].id : null;
    const newProg = await query(
      `INSERT INTO programs (sub_wing_id, title, description, program_date, maximum_mark, status)
       VALUES ($1, 'Annual Academy Grand Cultural & Literary Fest', 'Comprehensive campus competition festival', CURRENT_DATE, 20.00, 'PUBLISHED')
       RETURNING id`,
      [swId]
    );
    programId = newProg.rows[0].id;
  } else {
    programId = programRes.rows[0].id;
  }

  for (const st of STUDENTS_DATA) {
    // Check if user already exists
    let userRes = await query(`SELECT id FROM users WHERE email = $1 OR LOWER(username) = $2`, [
      st.email.toLowerCase(),
      st.username.toLowerCase(),
    ]);

    let userId: string;

    if (userRes.rows.length === 0) {
      // Create user
      const newUser = await query(
        `INSERT INTO users (email, username, password_hash, role, is_active)
         VALUES ($1, $2, $3, 'STUDENT', TRUE)
         RETURNING id`,
        [st.email.toLowerCase(), st.username.toLowerCase(), defaultPasswordHash]
      );
      userId = newUser.rows[0].id;

      // Create student profile with is_public = TRUE
      await query(
        `INSERT INTO student_profiles (user_id, full_name, profile_slug, bio, class_code, is_public)
         VALUES ($1, $2, $3, $4, $5, TRUE)
         ON CONFLICT (user_id) DO UPDATE
         SET full_name = EXCLUDED.full_name,
             profile_slug = EXCLUDED.profile_slug,
             bio = EXCLUDED.bio,
             class_code = EXCLUDED.class_code,
             is_public = TRUE`,
        [userId, st.name, st.username, st.bio, st.classCode]
      );
      console.log(`[CREATED] Enrolled student: ${st.name} (Class ${st.classCode}, @${st.username})`);
    } else {
      userId = userRes.rows[0].id;
      // Ensure profile is public and updated
      await query(
        `UPDATE student_profiles
         SET is_public = TRUE,
             full_name = $1,
             bio = $2,
             class_code = $3
         WHERE user_id = $4`,
        [st.name, st.bio, st.classCode, userId]
      );
      console.log(`[UPDATED] Existing student profile made public: ${st.name} (@${st.username})`);
    }

    // Insert Talents
    for (const t of st.talents) {
      await query(
        `INSERT INTO student_talents (user_id, title, category, description, visibility, status)
         VALUES ($1, $2, $3, $4, 'PUBLIC', 'PUBLISHED')
         ON CONFLICT DO NOTHING`,
        [userId, t.title, t.category, `Proficient in ${t.title}`]
      );
    }

    // Insert Skills
    for (const sk of st.skills) {
      await query(
        `INSERT INTO student_skills (user_id, skill_name, proficiency)
         VALUES ($1, $2, $3)
         ON CONFLICT (user_id, skill_name) DO UPDATE SET proficiency = EXCLUDED.proficiency`,
        [userId, sk.name, sk.level]
      );
    }

    // Insert Verified Certificate
    const certCode = `SADQ-${st.classCode}-${st.username.toUpperCase()}-2026`;
    await query(
      `INSERT INTO certificate_records (certificate_id, recipient_name, recipient_user_id, title, issue_date, issuer, verification_status, external_reference_url)
       VALUES ($1, $2, $3, $4, CURRENT_DATE - INTERVAL '15 days', 'Students Association of Darul Quran', 'VERIFIED', 'https://sadq.org/verify')
       ON CONFLICT (certificate_id) DO UPDATE SET verification_status = 'VERIFIED'`,
      [certCode, st.name, userId, `Academic & Excellence Certificate (${st.classCode})`]
    );

    // Insert Leadership Role if specified
    if (st.leadershipRole) {
      await query(
        `INSERT INTO organisation_memberships (unit_code, user_id, designation, is_leadership, is_active)
         VALUES ($1, $2, $3, TRUE, TRUE)
         ON CONFLICT (unit_code, user_id) DO UPDATE SET designation = EXCLUDED.designation, is_leadership = TRUE`,
        [st.leadershipRole.unitCode, userId, st.leadershipRole.designation]
      );
    }

    // Insert Program Result / Points contribution
    const existingResult = await query(
      `SELECT id FROM program_results WHERE student_id = $1 AND program_id = $2`,
      [userId, programId]
    );

    if (existingResult.rows.length === 0) {
      await query(
        `INSERT INTO program_results (program_id, student_id, student_name, class_code, mark, position, class_points, status, published_at)
         VALUES ($1, $2, $3, $4, 18.5, $5, $6, 'PUBLISHED', CURRENT_TIMESTAMP)`,
        [programId, userId, st.name, st.classCode, st.medals.gold > 0 ? 1 : st.medals.silver > 0 ? 2 : 3, st.points]
      );
    }
  }

  console.log('[SUCCESS] All 8 classes seeded with rich student growth profiles and dashboards!');
}

if (require.main === module) {
  seedAllClassesStudents()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Seed error:', err);
      process.exit(1);
    });
}
