import { Router } from 'express';
import { z } from 'zod';
import { query } from '../db';
import { requireAuth, requireRoles, RequestWithUser } from '../middleware/auth';
import { ROLES, SKILL_PROFICIENCIES, SkillProficiency } from '../../../shared/types';

const router = Router();

// Ensure only authenticated students (or admins) access student workspace
router.use(requireAuth);
router.use(requireRoles([ROLES.STUDENT, ROLES.ADMIN, ROLES.SUPER_ADMIN]));

// 1. Student Dashboard Overview
router.get('/dashboard', async (req: RequestWithUser, res) => {
  try {
    const userId = req.user!.id;

    const [profileRes, talentsRes, skillsRes, achievementsRes, projectsRes, orgRes] =
      await Promise.all([
        query('SELECT * FROM student_profiles WHERE user_id = $1', [userId]),
        query('SELECT * FROM student_talents WHERE user_id = $1 ORDER BY created_at DESC', [userId]),
        query('SELECT * FROM student_skills WHERE user_id = $1 ORDER BY created_at DESC', [userId]),
        query(
          'SELECT * FROM student_achievements WHERE user_id = $1 ORDER BY achievement_date DESC NULLS LAST',
          [userId]
        ),
        query(
          `SELECT p.* FROM projects p
           WHERE p.owner_id = $1 OR p.id IN (SELECT project_id FROM project_members WHERE user_id = $1)
           ORDER BY p.updated_at DESC`,
          [userId]
        ),
        query(
          `SELECT m.*, u.name as unit_name, u.description as unit_description
           FROM organisation_memberships m
           JOIN organisation_units u ON u.code = m.unit_code
           WHERE m.user_id = $1 AND m.is_active = TRUE`,
          [userId]
        ),
      ]);

    const profile = profileRes.rows[0];

    // Calculate profile completion percentage
    let completion = 0;
    if (profile) {
      if (profile.full_name) completion += 20;
      if (profile.bio) completion += 20;
      if (profile.class_code) completion += 20;
      if (profile.interests && profile.interests.length > 0) completion += 20;
      if (profile.profile_photo_url) completion += 20;
    }

    res.json({
      success: true,
      data: {
        profile,
        completionPercentage: completion,
        counts: {
          talents: talentsRes.rowCount,
          skills: skillsRes.rowCount,
          achievements: achievementsRes.rowCount,
          projects: projectsRes.rowCount,
          activeUnits: orgRes.rowCount,
        },
        recentTalents: talentsRes.rows.slice(0, 5),
        recentSkills: skillsRes.rows.slice(0, 8),
        recentAchievements: achievementsRes.rows.slice(0, 5),
        recentProjects: projectsRes.rows.slice(0, 5),
        organisationUnits: orgRes.rows,
      },
    });
  } catch (error) {
    console.error('Student dashboard error:', error);
    res.status(500).json({ success: false, error: 'Failed to load dashboard data.' });
  }
});

// 2. Profile Update & Privacy Controls
const profileUpdateSchema = z.object({
  bio: z.string().max(1000).optional(),
  interests: z.array(z.string()).max(20).optional(),
  profilePhotoUrl: z.string().url().or(z.literal('')).optional(),
  coverPhotoUrl: z.string().url().or(z.literal('')).optional(),
  whatsappNumber: z.string().max(30).optional(),
  emailContact: z.string().email().or(z.literal('')).optional(),
  isPublic: z.boolean().optional(),
  showEmail: z.boolean().optional(),
  showWhatsapp: z.boolean().optional(),
  showTalents: z.boolean().optional(),
  showSkills: z.boolean().optional(),
  showAchievements: z.boolean().optional(),
  showProjects: z.boolean().optional(),
  showOrganisation: z.boolean().optional(),
});

router.patch('/profile', async (req: RequestWithUser, res) => {
  try {
    const parse = profileUpdateSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ success: false, error: parse.error.errors[0].message });
      return;
    }

    const d = parse.data;
    const userId = req.user!.id;

    const updateRes = await query(
      `UPDATE student_profiles
       SET bio = COALESCE($1, bio),
           interests = COALESCE($2, interests),
           profile_photo_url = COALESCE($3, profile_photo_url),
           cover_photo_url = COALESCE($4, cover_photo_url),
           whatsapp_number = COALESCE($5, whatsapp_number),
           email_contact = COALESCE($6, email_contact),
           is_public = COALESCE($7, is_public),
           show_email = COALESCE($8, show_email),
           show_whatsapp = COALESCE($9, show_whatsapp),
           show_talents = COALESCE($10, show_talents),
           show_skills = COALESCE($11, show_skills),
           show_achievements = COALESCE($12, show_achievements),
           show_projects = COALESCE($13, show_projects),
           show_organisation = COALESCE($14, show_organisation),
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $15
       RETURNING *`,
      [
        d.bio,
        d.interests,
        d.profilePhotoUrl,
        d.coverPhotoUrl,
        d.whatsappNumber,
        d.emailContact,
        d.isPublic,
        d.showEmail,
        d.showWhatsapp,
        d.showTalents,
        d.showSkills,
        d.showAchievements,
        d.showProjects,
        d.showOrganisation,
        userId,
      ]
    );

    res.json({ success: true, data: updateRes.rows[0] });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, error: 'Failed to update profile.' });
  }
});

// 3. Talents CRUD (Ownership Enforced)
const talentSchema = z.object({
  title: z.string().min(2).max(150),
  category: z.string().min(2).max(100),
  description: z.string().max(1000).optional(),
  visibility: z.enum(['PRIVATE', 'COMMUNITY', 'PUBLIC']).default('COMMUNITY'),
});

router.get('/talents', async (req: RequestWithUser, res) => {
  const result = await query(
    'SELECT * FROM student_talents WHERE user_id = $1 ORDER BY created_at DESC',
    [req.user!.id]
  );
  res.json({ success: true, data: result.rows });
});

router.post('/talents', async (req: RequestWithUser, res) => {
  try {
    const parse = talentSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ success: false, error: parse.error.errors[0].message });
      return;
    }
    const { title, category, description, visibility } = parse.data;
    const result = await query(
      `INSERT INTO student_talents (user_id, title, category, description, visibility)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [req.user!.id, title, category, description || '', visibility]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to add talent.' });
  }
});

router.delete('/talents/:id', async (req: RequestWithUser, res) => {
  const result = await query(
    'DELETE FROM student_talents WHERE id = $1 AND user_id = $2 RETURNING id',
    [req.params.id, req.user!.id]
  );
  if (result.rowCount === 0) {
    res.status(404).json({ success: false, error: 'Talent not found or not owned by you.' });
    return;
  }
  res.json({ success: true, message: 'Talent deleted.' });
});

// 4. Skills CRUD (Proficiency & Duplicate Prevention)
const skillSchema = z.object({
  skillName: z.string().min(2).max(100),
  proficiency: z.enum(SKILL_PROFICIENCIES as unknown as [SkillProficiency, ...SkillProficiency[]]),
});

router.get('/skills', async (req: RequestWithUser, res) => {
  const result = await query(
    'SELECT * FROM student_skills WHERE user_id = $1 ORDER BY created_at DESC',
    [req.user!.id]
  );
  res.json({ success: true, data: result.rows });
});

router.post('/skills', async (req: RequestWithUser, res) => {
  try {
    const parse = skillSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ success: false, error: parse.error.errors[0].message });
      return;
    }
    const { skillName, proficiency } = parse.data;
    const result = await query(
      `INSERT INTO student_skills (user_id, skill_name, proficiency)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, skill_name) DO UPDATE
       SET proficiency = EXCLUDED.proficiency
       RETURNING *`,
      [req.user!.id, skillName.trim(), proficiency]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to add skill.' });
  }
});

router.delete('/skills/:id', async (req: RequestWithUser, res) => {
  const result = await query(
    'DELETE FROM student_skills WHERE id = $1 AND user_id = $2 RETURNING id',
    [req.params.id, req.user!.id]
  );
  if (result.rowCount === 0) {
    res.status(404).json({ success: false, error: 'Skill not found or not owned by you.' });
    return;
  }
  res.json({ success: true, message: 'Skill deleted.' });
});

// 5. Achievements CRUD
const achievementSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().optional(),
  category: z.string().optional(),
  achievementDate: z.string().optional(),
  issuer: z.string().optional(),
  visibility: z.enum(['PRIVATE', 'COMMUNITY', 'PUBLIC']).default('COMMUNITY'),
});

router.get('/achievements', async (req: RequestWithUser, res) => {
  const result = await query(
    'SELECT * FROM student_achievements WHERE user_id = $1 ORDER BY achievement_date DESC NULLS LAST',
    [req.user!.id]
  );
  res.json({ success: true, data: result.rows });
});

router.post('/achievements', async (req: RequestWithUser, res) => {
  try {
    const parse = achievementSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ success: false, error: parse.error.errors[0].message });
      return;
    }
    const d = parse.data;
    const result = await query(
      `INSERT INTO student_achievements (user_id, title, description, category, achievement_date, issuer, visibility)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        req.user!.id,
        d.title,
        d.description || '',
        d.category || '',
        d.achievementDate || null,
        d.issuer || '',
        d.visibility,
      ]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to add achievement.' });
  }
});

router.delete('/achievements/:id', async (req: RequestWithUser, res) => {
  const result = await query(
    'DELETE FROM student_achievements WHERE id = $1 AND user_id = $2 RETURNING id',
    [req.params.id, req.user!.id]
  );
  if (result.rowCount === 0) {
    res.status(404).json({ success: false, error: 'Achievement not found or not owned by you.' });
    return;
  }
  res.json({ success: true, message: 'Achievement deleted.' });
});

// 6. Projects CRUD
const projectSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().min(5),
  category: z.string().optional(),
  unitCode: z.string().optional(),
  status: z.enum(['PLANNING', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD']).default('IN_PROGRESS'),
  visibility: z.enum(['PRIVATE', 'COMMUNITY', 'PUBLIC']).default('COMMUNITY'),
  projectUrl: z.string().url().or(z.literal('')).optional(),
});

router.get('/projects', async (req: RequestWithUser, res) => {
  const result = await query(
    `SELECT p.*, u.name as unit_name
     FROM projects p
     LEFT JOIN organisation_units u ON u.code = p.unit_code
     WHERE p.owner_id = $1 OR p.id IN (SELECT project_id FROM project_members WHERE user_id = $1)
     ORDER BY p.updated_at DESC`,
    [req.user!.id]
  );
  res.json({ success: true, data: result.rows });
});

router.post('/projects', async (req: RequestWithUser, res) => {
  try {
    const parse = projectSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ success: false, error: parse.error.errors[0].message });
      return;
    }
    const d = parse.data;
    const result = await query(
      `INSERT INTO projects (owner_id, title, description, category, unit_code, status, visibility, project_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        req.user!.id,
        d.title,
        d.description,
        d.category || '',
        d.unitCode || null,
        d.status,
        d.visibility,
        d.projectUrl || null,
      ]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create project.' });
  }
});

// 7. Organisation units for student
router.get('/organisation', async (req: RequestWithUser, res) => {
  const result = await query(
    `SELECT m.*, u.name as unit_name, u.description as unit_description
     FROM organisation_memberships m
     JOIN organisation_units u ON u.code = m.unit_code
     WHERE m.user_id = $1
     ORDER BY m.is_leadership DESC, m.joined_date ASC`,
    [req.user!.id]
  );
  res.json({ success: true, data: result.rows });
});

export default router;
