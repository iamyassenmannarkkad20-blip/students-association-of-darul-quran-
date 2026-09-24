/**
 * SADQ Platform E2E Test Suite - Test Data Fixtures & Factories
 */

const crypto = require('crypto');

function randomId(prefix = 't') {
  return `${prefix}_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
}

function makeStudentData(overrides = {}) {
  const id = randomId();
  return {
    fullName: `Test Student ${id.slice(-6)}`,
    email: `e2e_test_${id}@sadq.org`,
    password: `P@ssword123_${id.slice(-4)}`,
    classCode: '04',
    ...overrides,
  };
}

function makeTalentData(overrides = {}) {
  const id = randomId();
  return {
    title: `Talent ${id.slice(-4)}: Arabic Calligraphy & Kufic Script`,
    category: 'Islamic Arts',
    description: 'Specialized in ornate Thuluth and geometric Kufic script compositions.',
    visibility: 'PUBLIC',
    ...overrides,
  };
}

function makeSkillData(overrides = {}) {
  const id = randomId();
  return {
    skillName: `Skill_${id.slice(-4)}`,
    proficiency: 'INTERMEDIATE',
    ...overrides,
  };
}

function makeAchievementData(overrides = {}) {
  const id = randomId();
  return {
    title: `National Qira'at Excellence Award ${id.slice(-4)}`,
    description: 'First prize in state-level Tajweed and recitation competition.',
    category: 'Excellence',
    achievementDate: '2025-11-15',
    issuer: 'Darul Quran Academic Council',
    visibility: 'PUBLIC',
    ...overrides,
  };
}

function makeProjectData(overrides = {}) {
  const id = randomId();
  return {
    title: `Darul Quran Digital Archive ${id.slice(-4)}`,
    description: 'A collaborative digitization initiative preserving historic manuscripts and student journals.',
    category: 'Research & Archiving',
    unitCode: 'LIB',
    status: 'IN_PROGRESS',
    visibility: 'PUBLIC',
    projectUrl: `https://drive.google.com/drive/folders/sample_${id}`,
    ...overrides,
  };
}

function makePostData(overrides = {}) {
  const id = randomId();
  return {
    title: `Exploration of Classical Tafsir Methodologies #${id.slice(-4)}`,
    body: 'A comparative synthesis between classical exegetical literature and contemporary hermeneutical principles.',
    category: 'Academic Discussion',
    visibility: 'COMMUNITY',
    organisationUnitCode: 'RW',
    ...overrides,
  };
}

function makeStudyNoteData(overrides = {}) {
  const id = randomId();
  return {
    title: `Comprehensive Notes on Usul al-Fiqh #${id.slice(-4)}`,
    description: 'Concise lecture notes summarizing legal maxims and linguistic derivations with diagrams.',
    subjectArea: 'Islamic Jurisprudence',
    fileUrl: `https://drive.google.com/file/d/sample_note_${id}/view?usp=sharing`,
    downloadable: true,
    visibility: 'COMMUNITY',
    ...overrides,
  };
}

module.exports = {
  randomId,
  makeStudentData,
  makeTalentData,
  makeSkillData,
  makeAchievementData,
  makeProjectData,
  makePostData,
  makeStudyNoteData,
};
