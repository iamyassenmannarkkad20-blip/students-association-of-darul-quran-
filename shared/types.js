"use strict";
// ===============================================================
// SADQ PLATFORM - MASTER TYPES & ENUMS (SOURCE OF TRUTH)
// ===============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.REACTION_TYPES = exports.CONTENT_STATUS = exports.VISIBILITY = exports.SKILL_PROFICIENCIES = exports.CLASS_CODES = exports.ORGANISATION_UNITS = exports.ROLES = void 0;
exports.ROLES = {
    SUPER_ADMIN: 'SUPER_ADMIN',
    ADMIN: 'ADMIN',
    TEACHER: 'TEACHER',
    ORGANISATION_ADMIN: 'ORGANISATION_ADMIN',
    STUDENT: 'STUDENT',
};
// 10 Official Units ONLY
exports.ORGANISATION_UNITS = [
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
];
// Official Class codes 01 to 08
exports.CLASS_CODES = ['01', '02', '03', '04', '05', '06', '07', '08'];
// Skill proficiencies
exports.SKILL_PROFICIENCIES = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'];
// Visibility levels
exports.VISIBILITY = {
    PRIVATE: 'PRIVATE',
    COMMUNITY: 'COMMUNITY',
    PUBLIC: 'PUBLIC',
};
// Content Statuses
exports.CONTENT_STATUS = {
    DRAFT: 'DRAFT',
    PENDING_REVIEW: 'PENDING_REVIEW',
    PUBLISHED: 'PUBLISHED',
    REJECTED: 'REJECTED',
    ARCHIVED: 'ARCHIVED',
};
// Allowed Reactions
exports.REACTION_TYPES = ['like', 'insightful', 'appreciate'];
