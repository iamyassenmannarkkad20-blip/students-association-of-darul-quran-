// ===============================================================
// SADQ PLATFORM - MASTER TYPES & ENUMS (SOURCE OF TRUTH)
// ===============================================================

export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  TEACHER: 'TEACHER',
  ORGANISATION_ADMIN: 'ORGANISATION_ADMIN',
  STUDENT: 'STUDENT',
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];

// 10 Official Units ONLY
export const ORGANISATION_UNITS = [
  { id: 'EB', code: 'EB', name: 'Excellence Bureau', description: 'Academic excellence, strategic coordination, and guidance.' },
  { id: 'IA', code: 'IA', name: 'Islamic Arts', description: 'Traditional Islamic calligraphy, design, and cultural arts.' },
  { id: 'MPW', code: 'MPW', name: 'Media & Publishing Wing', description: 'Publications, magazines, photography, and video media.' },
  { id: 'MB', code: 'MB', name: 'Medical Board', description: 'Health awareness, medical welfare, first-aid coordination.' },
  { id: 'LB', code: 'LB', name: 'Literary Board', description: 'Literature, debate, oratory, essays, and creative writing.' },
  { id: 'RW', code: 'RW', name: 'Research Wing', description: 'Academic research, Islamic studies analysis, and documentation.' },
  { id: 'CS', code: 'CS', name: 'Campus Squad', description: 'Discipline, event volunteer corps, and campus coordination.' },
  { id: 'DW', code: 'DW', name: 'Da\'wah Wing', description: 'Islamic outreach, spiritual development, and community ethics.' },
  { id: 'LIB', code: 'LIB', name: 'Library Board', description: 'Digital resource management, reading promotion, and archiving.' },
  { id: 'SB', code: 'SB', name: 'Samajam Board', description: 'Student assemblies, union sessions, and public speaking gatherings.' },
] as const;

export type UnitCode = (typeof ORGANISATION_UNITS)[number]['code'];

// Official Class codes 01 to 08
export const CLASS_CODES = ['01', '02', '03', '04', '05', '06', '07', '08'] as const;
export type ClassCode = (typeof CLASS_CODES)[number];

// Skill proficiencies
export const SKILL_PROFICIENCIES = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'] as const;
export type SkillProficiency = (typeof SKILL_PROFICIENCIES)[number];

// Visibility levels
export const VISIBILITY = {
  PRIVATE: 'PRIVATE',
  COMMUNITY: 'COMMUNITY',
  PUBLIC: 'PUBLIC',
} as const;
export type VisibilityLevel = (typeof VISIBILITY)[keyof typeof VISIBILITY];

// Content Statuses
export const CONTENT_STATUS = {
  DRAFT: 'DRAFT',
  PENDING_REVIEW: 'PENDING_REVIEW',
  PUBLISHED: 'PUBLISHED',
  REJECTED: 'REJECTED',
  ARCHIVED: 'ARCHIVED',
} as const;
export type ContentStatus = (typeof CONTENT_STATUS)[keyof typeof CONTENT_STATUS];

// Allowed Reactions
export const REACTION_TYPES = ['like', 'insightful', 'appreciate'] as const;
export type ReactionType = (typeof REACTION_TYPES)[number];

// User Session
export interface AuthUser {
  id: string;
  email: string;
  username?: string;
  role: UserRole;
  fullName: string;
  profileSlug: string;
  classCode?: ClassCode | null;
  profilePhotoUrl?: string | null;
  isActive: boolean;
}

// Student Profile
export interface StudentProfile {
  id: string;
  userId: string;
  fullName: string;
  profileSlug: string;
  bio: string;
  classCode: ClassCode;
  interests: string[];
  profilePhotoUrl?: string | null;
  coverPhotoUrl?: string | null;
  whatsappNumber?: string | null;
  emailContact?: string | null;
  instagramHandle?: string | null;
  phoneNumber?: string | null;
  websiteUrl?: string | null;
  // Privacy Controls
  isPublic: boolean;
  showEmail: boolean;
  showWhatsapp: boolean;
  showInstagram?: boolean;
  showTalents: boolean;
  showSkills: boolean;
  showAchievements: boolean;
  showProjects: boolean;
  showOrganisation: boolean;
  createdAt: string;
  updatedAt: string;
}

// Official Social configuration
export interface SocialConfig {
  instagramUrl: string;
  youtubeUrl: string;
  channelsConfirmed: boolean;
}
