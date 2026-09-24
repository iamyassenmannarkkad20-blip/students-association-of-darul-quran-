-- ===============================================================
-- SADQ PLATFORM: MASTER INITIAL RELATIONAL SCHEMA
-- Free-Tier PostgreSQL Schema (No ORM, Pure Relational Design)
-- ===============================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(32) NOT NULL CHECK (role IN ('SUPER_ADMIN', 'ADMIN', 'TEACHER', 'ORGANISATION_ADMIN', 'STUDENT')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. SESSIONS TABLE (Server-side HttpOnly session tokens)
CREATE TABLE IF NOT EXISTS sessions (
  id VARCHAR(128) PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);

-- 3. OFFICIAL ORGANISATION UNITS (Exact 10 official units only)
CREATE TABLE IF NOT EXISTS organisation_units (
  code VARCHAR(10) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Pre-populate official 10 units
INSERT INTO organisation_units (code, name, description)
VALUES 
  ('EB', 'Excellence Bureau', 'Academic excellence, strategic coordination, and guidance.'),
  ('IA', 'Islamic Arts', 'Traditional Islamic calligraphy, design, and cultural arts.'),
  ('MPW', 'Media & Publishing Wing', 'Publications, magazines, photography, and video media.'),
  ('MB', 'Medical Board', 'Health awareness, medical welfare, and first-aid coordination.'),
  ('LB', 'Literary Board', 'Literature, debate, oratory, essays, and creative writing.'),
  ('RW', 'Research Wing', 'Academic research, Islamic studies analysis, and documentation.'),
  ('CS', 'Campus Squad', 'Discipline, event volunteer corps, and campus coordination.'),
  ('DW', 'Da''wah Wing', 'Islamic outreach, spiritual development, and community ethics.'),
  ('LIB', 'Library Board', 'Digital resource management, reading promotion, and archiving.'),
  ('SB', 'Samajam Board', 'Student assemblies, union sessions, and public speaking gatherings.')
ON CONFLICT (code) DO UPDATE 
SET name = EXCLUDED.name, description = EXCLUDED.description;

-- 4. STUDENT PROFILES
CREATE TABLE IF NOT EXISTS student_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  full_name VARCHAR(150) NOT NULL,
  profile_slug VARCHAR(100) UNIQUE NOT NULL,
  bio TEXT DEFAULT '',
  class_code VARCHAR(10) NOT NULL CHECK (class_code IN ('01', '02', '03', '04', '05', '06', '07', '08')),
  interests TEXT[] DEFAULT '{}',
  profile_photo_url TEXT,
  cover_photo_url TEXT,
  whatsapp_number VARCHAR(30),
  email_contact VARCHAR(255),
  -- Strict Privacy Controls (Defaults protect student privacy)
  is_public BOOLEAN DEFAULT FALSE,
  show_email BOOLEAN DEFAULT FALSE,
  show_whatsapp BOOLEAN DEFAULT FALSE,
  show_talents BOOLEAN DEFAULT TRUE,
  show_skills BOOLEAN DEFAULT TRUE,
  show_achievements BOOLEAN DEFAULT TRUE,
  show_projects BOOLEAN DEFAULT TRUE,
  show_organisation BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_student_profiles_slug ON student_profiles(profile_slug);
CREATE INDEX IF NOT EXISTS idx_student_profiles_class ON student_profiles(class_code);

-- 5. TEACHER PROFILES
CREATE TABLE IF NOT EXISTS teacher_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  full_name VARCHAR(150) NOT NULL,
  department VARCHAR(100) DEFAULT '',
  bio TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 6. ORGANISATION MEMBERSHIPS
CREATE TABLE IF NOT EXISTS organisation_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_code VARCHAR(10) NOT NULL REFERENCES organisation_units(code) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  designation VARCHAR(100) NOT NULL,
  is_leadership BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  joined_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(unit_code, user_id)
);

CREATE INDEX IF NOT EXISTS idx_org_mem_unit ON organisation_memberships(unit_code);
CREATE INDEX IF NOT EXISTS idx_org_mem_user ON organisation_memberships(user_id);

-- 7. STUDENT TALENTS
CREATE TABLE IF NOT EXISTS student_talents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(150) NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT DEFAULT '',
  visibility VARCHAR(20) DEFAULT 'COMMUNITY' CHECK (visibility IN ('PRIVATE', 'COMMUNITY', 'PUBLIC')),
  status VARCHAR(20) DEFAULT 'PUBLISHED' CHECK (status IN ('DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'ARCHIVED')),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_talents_user ON student_talents(user_id);

-- 8. STUDENT SKILLS
CREATE TABLE IF NOT EXISTS student_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  skill_name VARCHAR(100) NOT NULL,
  proficiency VARCHAR(20) NOT NULL CHECK (proficiency IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT')),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, skill_name)
);

CREATE INDEX IF NOT EXISTS idx_skills_user ON student_skills(user_id);

-- 9. STUDENT ACHIEVEMENTS
CREATE TABLE IF NOT EXISTS student_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT DEFAULT '',
  category VARCHAR(100) DEFAULT '',
  achievement_date DATE,
  issuer VARCHAR(150) DEFAULT '',
  visibility VARCHAR(20) DEFAULT 'COMMUNITY' CHECK (visibility IN ('PRIVATE', 'COMMUNITY', 'PUBLIC')),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_achievements_user ON student_achievements(user_id);

-- 10. PROJECTS & MEMBERS
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100) DEFAULT '',
  unit_code VARCHAR(10) REFERENCES organisation_units(code),
  status VARCHAR(20) DEFAULT 'IN_PROGRESS' CHECK (status IN ('PLANNING', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD')),
  visibility VARCHAR(20) DEFAULT 'COMMUNITY' CHECK (visibility IN ('PRIVATE', 'COMMUNITY', 'PUBLIC')),
  project_url TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS project_members (
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_in_project VARCHAR(100) DEFAULT 'Contributor',
  joined_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (project_id, user_id)
);

-- 11. POSTS (COMMUNITY)
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  visibility VARCHAR(20) DEFAULT 'COMMUNITY' CHECK (visibility IN ('PRIVATE', 'COMMUNITY', 'PUBLIC')),
  status VARCHAR(20) DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'REJECTED', 'ARCHIVED')),
  organisation_unit_code VARCHAR(10) REFERENCES organisation_units(code),
  pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_posts_visibility_status ON posts(visibility, status);
CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author_id);

-- 12. COMMENTS
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_id);

-- 13. REACTIONS (One reaction per user per post)
CREATE TABLE IF NOT EXISTS reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reaction_type VARCHAR(20) NOT NULL CHECK (reaction_type IN ('like', 'insightful', 'appreciate')),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(post_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_reactions_post ON reactions(post_id);

-- 14. ARTICLES
CREATE TABLE IF NOT EXISTS articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  body TEXT NOT NULL,
  summary TEXT,
  cover_image_url TEXT,
  category VARCHAR(100) NOT NULL,
  visibility VARCHAR(20) DEFAULT 'COMMUNITY' CHECK (visibility IN ('PRIVATE', 'COMMUNITY', 'PUBLIC')),
  status VARCHAR(20) DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'REJECTED', 'ARCHIVED')),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status, visibility);

-- 15. STUDY NOTES (External Drive URL storage)
CREATE TABLE IF NOT EXISTS study_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  subject_area VARCHAR(100) NOT NULL,
  file_url TEXT NOT NULL,
  downloadable BOOLEAN DEFAULT TRUE,
  visibility VARCHAR(20) DEFAULT 'COMMUNITY' CHECK (visibility IN ('PRIVATE', 'COMMUNITY', 'PUBLIC')),
  status VARCHAR(20) DEFAULT 'PUBLISHED' CHECK (status IN ('DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'ARCHIVED')),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 16. DIGITAL LIBRARY RESOURCES
CREATE TABLE IF NOT EXISTS library_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  author VARCHAR(150),
  publisher VARCHAR(150),
  category VARCHAR(100),
  resource_type VARCHAR(50) DEFAULT 'BOOK',
  external_url TEXT NOT NULL,
  downloadable BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) DEFAULT 'PENDING_REVIEW' CHECK (status IN ('PENDING_REVIEW', 'PUBLISHED', 'ARCHIVED')),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 17. MAGAZINES & PUBLICATIONS
CREATE TABLE IF NOT EXISTS magazines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  issue VARCHAR(50) NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  pdf_url TEXT,
  issuu_url TEXT,
  publication_date DATE,
  page_count INT DEFAULT 0,
  visibility VARCHAR(20) DEFAULT 'PUBLIC' CHECK (visibility IN ('PRIVATE', 'COMMUNITY', 'PUBLIC')),
  status VARCHAR(20) DEFAULT 'PUBLISHED' CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 18. MEDIA ITEMS (YouTube, Vimeo, External Media links)
CREATE TABLE IF NOT EXISTS media_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  media_type VARCHAR(20) NOT NULL CHECK (media_type IN ('video', 'audio', 'youtube', 'vimeo', 'image')),
  media_url TEXT NOT NULL,
  category VARCHAR(100),
  status VARCHAR(20) DEFAULT 'PUBLISHED' CHECK (status IN ('PENDING_REVIEW', 'PUBLISHED', 'ARCHIVED')),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 19. EVENTS
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  event_time VARCHAR(50),
  venue VARCHAR(255),
  is_online BOOLEAN DEFAULT FALSE,
  category VARCHAR(100),
  visibility VARCHAR(20) DEFAULT 'PUBLIC' CHECK (visibility IN ('PRIVATE', 'COMMUNITY', 'PUBLIC')),
  status VARCHAR(20) DEFAULT 'PUBLISHED' CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 20. JOBS & OPPORTUNITIES
CREATE TABLE IF NOT EXISTS opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  provider VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100),
  contact_email VARCHAR(255),
  contact_whatsapp VARCHAR(50),
  external_link TEXT,
  visibility VARCHAR(20) DEFAULT 'PUBLIC' CHECK (visibility IN ('COMMUNITY', 'PUBLIC')),
  status VARCHAR(20) DEFAULT 'PUBLISHED' CHECK (status IN ('PENDING_REVIEW', 'PUBLISHED', 'ARCHIVED')),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 21. SERVICE LISTINGS (Contact via WhatsApp / Gmail)
CREATE TABLE IF NOT EXISTS service_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  provider_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  category VARCHAR(100),
  contact_whatsapp VARCHAR(50),
  contact_email VARCHAR(255),
  external_link TEXT,
  status VARCHAR(20) DEFAULT 'PUBLISHED' CHECK (status IN ('PENDING_REVIEW', 'PUBLISHED', 'ARCHIVED')),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 22. MARKETPLACE ITEMS (Discovery + Direct WhatsApp/Email Contact)
CREATE TABLE IF NOT EXISTS marketplace_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  category VARCHAR(100),
  image_url TEXT,
  contact_whatsapp VARCHAR(50),
  contact_email VARCHAR(255),
  status VARCHAR(20) DEFAULT 'PUBLISHED' CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 23. CERTIFICATE VERIFICATION RECORDS
CREATE TABLE IF NOT EXISTS certificate_records (
  certificate_id VARCHAR(100) PRIMARY KEY,
  recipient_name VARCHAR(150) NOT NULL,
  recipient_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  issue_date DATE NOT NULL,
  issuer VARCHAR(150) NOT NULL,
  verification_status VARCHAR(50) DEFAULT 'VERIFIED',
  external_reference_url TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 24. MODERATION ACTIONS AUDIT
CREATE TABLE IF NOT EXISTS moderation_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  action VARCHAR(50) NOT NULL,
  reason TEXT,
  moderator_id UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 25. PUBLIC SITE CONFIGURATION
CREATE TABLE IF NOT EXISTS public_site_config (
  id INT PRIMARY KEY DEFAULT 1,
  instagram_url VARCHAR(255) DEFAULT 'https://www.instagram.com/sadq__official/',
  youtube_url VARCHAR(255) DEFAULT 'https://www.youtube.com/@sadqofficialmedia',
  channels_confirmed BOOLEAN DEFAULT FALSE,
  official_email VARCHAR(255) DEFAULT 'sadqofficial@gmail.com',
  official_whatsapp VARCHAR(50) DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO public_site_config (id, instagram_url, youtube_url, channels_confirmed, official_email, official_whatsapp)
VALUES (1, 'https://www.instagram.com/sadq__official/', 'https://www.youtube.com/@sadqofficialmedia', FALSE, 'sadqofficial@gmail.com', '')
ON CONFLICT (id) DO NOTHING;
