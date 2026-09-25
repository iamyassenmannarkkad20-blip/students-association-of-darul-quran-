import { Router } from 'express';
import { z } from 'zod';
import { query } from '../db';
import { requireAuth, requireRoles, RequestWithUser } from '../middleware/auth';
import { ROLES } from '../../../shared/types';

const router = Router();

// Only ADMIN and SUPER_ADMIN allowed
router.use(requireAuth);
router.use(requireRoles([ROLES.ADMIN, ROLES.SUPER_ADMIN]));

// Real Admin Statistics (ZERO fake data)
router.get('/stats', async (_req, res) => {
  try {
    const [usersCount, studentsCount, postsCount, pendingCount, unitsCount] = await Promise.all([
      query('SELECT COUNT(*)::int as count FROM users WHERE is_active = TRUE'),
      query('SELECT COUNT(*)::int as count FROM student_profiles'),
      query('SELECT COUNT(*)::int as count FROM posts'),
      query("SELECT COUNT(*)::int as count FROM posts WHERE status = 'PENDING_REVIEW'"),
      query('SELECT COUNT(*)::int as count FROM organisation_units'),
    ]);

    res.json({
      success: true,
      data: {
        totalUsers: usersCount.rows[0].count,
        totalStudents: studentsCount.rows[0].count,
        totalPosts: postsCount.rows[0].count,
        pendingReviewCount: pendingCount.rows[0].count,
        organisationUnits: unitsCount.rows[0].count,
      },
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ success: false, error: 'Failed to load statistics.' });
  }
});

// Pending Content Queue
router.get('/pending-queue', async (_req, res) => {
  try {
    const [posts, articles, library] = await Promise.all([
      query(
        `SELECT p.id, 'post' as type, p.title, p.category, p.created_at, sp.full_name as author_name
         FROM posts p
         JOIN student_profiles sp ON sp.user_id = p.author_id
         WHERE p.status = 'PENDING_REVIEW'
         ORDER BY p.created_at ASC`
      ),
      query(
        `SELECT a.id, 'article' as type, a.title, a.category, a.created_at, sp.full_name as author_name
         FROM articles a
         JOIN student_profiles sp ON sp.user_id = a.author_id
         WHERE a.status = 'PENDING_REVIEW'
         ORDER BY a.created_at ASC`
      ),
      query(
        `SELECT l.id, 'library' as type, l.title, l.category, l.created_at, l.author as author_name
         FROM library_resources l
         WHERE l.status = 'PENDING_REVIEW'
         ORDER BY l.created_at ASC`
      ),
    ]);

    res.json({
      success: true,
      data: {
        posts: posts.rows,
        articles: articles.rows,
        library: library.rows,
      },
    });
  } catch (error) {
    console.error('Pending queue error:', error);
    res.status(500).json({ success: false, error: 'Failed to load pending queue.' });
  }
});

// Moderate Content (Approve / Reject)
const moderateSchema = z.object({
  entityType: z.enum(['post', 'article', 'library', 'magazine', 'media', 'event']),
  entityId: z.string().uuid(),
  action: z.enum(['APPROVE', 'REJECT', 'ARCHIVE']),
  reason: z.string().optional(),
});

router.post('/moderate', async (req: RequestWithUser, res) => {
  try {
    const parse = moderateSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ success: false, error: parse.error.errors[0].message });
      return;
    }

    const { entityType, entityId, action, reason } = parse.data;
    const moderatorId = req.user!.id;
    const targetStatus =
      action === 'APPROVE' ? 'PUBLISHED' : action === 'REJECT' ? 'REJECTED' : 'ARCHIVED';

    let table = 'posts';
    if (entityType === 'article') table = 'articles';
    if (entityType === 'library') table = 'library_resources';
    if (entityType === 'magazine') table = 'magazines';
    if (entityType === 'media') table = 'media_items';
    if (entityType === 'event') table = 'events';

    await query(`UPDATE ${table} SET status = $1 WHERE id = $2`, [targetStatus, entityId]);

    // Record moderation audit action
    await query(
      `INSERT INTO moderation_actions (entity_type, entity_id, action, reason, moderator_id)
       VALUES ($1, $2, $3, $4, $5)`,
      [entityType, entityId, action, reason || '', moderatorId]
    );

    res.json({ success: true, message: `Item ${action.toLowerCase()}d successfully.` });
  } catch (error) {
    console.error('Moderation error:', error);
    res.status(500).json({ success: false, error: 'Moderation action failed.' });
  }
});

// Create Magazine (Publish official publication with Issuu / Drive link)
const magazineSchema = z.object({
  title: z.string().min(2),
  issue: z.string().min(1),
  description: z.string().optional(),
  coverImageUrl: z.string().url().or(z.literal('')).optional(),
  pdfUrl: z.string().url().or(z.literal('')).optional(),
  issuuUrl: z.string().url().or(z.literal('')).optional(),
  publicationDate: z.string(),
  pageCount: z.number().int().default(0),
});

router.post('/magazines', async (req, res) => {
  try {
    const parse = magazineSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ success: false, error: parse.error.errors[0].message });
      return;
    }
    const d = parse.data;
    const baseSlug = d.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const slug = `${baseSlug}-issue-${d.issue.toLowerCase()}`;

    const result = await query(
      `INSERT INTO magazines (title, slug, issue, description, cover_image_url, pdf_url, issuu_url, publication_date, page_count, status, visibility)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'PUBLISHED', 'PUBLIC')
       RETURNING *`,
      [
        d.title,
        slug,
        d.issue,
        d.description || '',
        d.coverImageUrl || null,
        d.pdfUrl || null,
        d.issuuUrl || null,
        d.publicationDate,
        d.pageCount,
      ]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Create magazine error:', error);
    res.status(500).json({ success: false, error: 'Failed to create magazine entry.' });
  }
});

// Update Public Site Configuration
const configSchema = z.object({
  instagramUrl: z.string().url().optional(),
  youtubeUrl: z.string().url().optional(),
  channelsConfirmed: z.boolean().optional(),
  officialEmail: z.string().email().optional(),
  officialWhatsapp: z.string().optional(),
});

router.patch('/config', async (req, res) => {
  try {
    const parse = configSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ success: false, error: parse.error.errors[0].message });
      return;
    }
    const d = parse.data;
    const result = await query(
      `UPDATE public_site_config
       SET instagram_url = COALESCE($1, instagram_url),
           youtube_url = COALESCE($2, youtube_url),
           channels_confirmed = COALESCE($3, channels_confirmed),
           official_email = COALESCE($4, official_email),
           official_whatsapp = COALESCE($5, official_whatsapp),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = 1
       RETURNING *`,
      [d.instagramUrl, d.youtubeUrl, d.channelsConfirmed, d.officialEmail, d.officialWhatsapp]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update config.' });
  }
});

// User Management: List all users with student profile and unit memberships
router.get('/users', async (_req, res) => {
  try {
    const result = await query(
      `SELECT u.id, u.email, u.role, u.is_active, u.created_at,
              sp.full_name, sp.class_code, sp.profile_slug, sp.profile_photo_url,
              COALESCE(
                (SELECT json_agg(json_build_object('unit_code', om.unit_code, 'role_in_unit', om.role_in_unit, 'position', om.position))
                 FROM organisation_memberships om
                 WHERE om.user_id = u.id AND om.is_active = TRUE),
                '[]'::json
              ) as units
       FROM users u
       LEFT JOIN student_profiles sp ON sp.user_id = u.id
       ORDER BY u.created_at DESC`
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Fetch users error:', error);
    res.status(500).json({ success: false, error: 'Failed to load user directory.' });
  }
});

// Update User Role
const roleSchema = z.object({
  role: z.enum([ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER, ROLES.ORGANISATION_ADMIN, ROLES.STUDENT]),
});

router.patch('/users/:id/role', async (req, res) => {
  try {
    const parse = roleSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ success: false, error: parse.error.errors[0].message });
      return;
    }
    const { role } = parse.data;
    await query('UPDATE users SET role = $1 WHERE id = $2', [role, req.params.id]);
    res.json({ success: true, message: `Role updated to ${role}.` });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update role.' });
  }
});

// Assign Student to Official Unit
const unitAssignSchema = z.object({
  userId: z.string().uuid(),
  unitCode: z.enum(['EB', 'IA', 'MPW', 'MB', 'LB', 'RW', 'CS', 'DW', 'LIB', 'SB']),
  roleInUnit: z.string().default('Member'),
  position: z.string().optional(),
});

router.post('/assign-unit', async (req, res) => {
  try {
    const parse = unitAssignSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ success: false, error: parse.error.errors[0].message });
      return;
    }
    const d = parse.data;

    // Insert or update unit membership
    const result = await query(
      `INSERT INTO organisation_memberships (user_id, unit_code, role_in_unit, position, is_active)
       VALUES ($1, $2, $3, $4, TRUE)
       ON CONFLICT (user_id, unit_code) DO UPDATE
       SET role_in_unit = EXCLUDED.role_in_unit,
           position = EXCLUDED.position,
           is_active = TRUE
       RETURNING *`,
      [d.userId, d.unitCode, d.roleInUnit, d.position || null]
    );

    res.json({ success: true, data: result.rows[0], message: `Assigned to ${d.unitCode} successfully.` });
  } catch (error) {
    console.error('Assign unit error:', error);
    res.status(500).json({ success: false, error: 'Failed to assign unit.' });
  }
});

// Update Official Announcement for Home Page Banner
router.post('/announcement', async (req, res) => {
  try {
    const { announcement } = req.body;
    await query(
      `UPDATE public_site_config SET announcement = $1, updated_at = CURRENT_TIMESTAMP WHERE id = 1`,
      [announcement || '']
    );
    res.json({ success: true, message: 'Announcement updated successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update announcement.' });
  }
});

// --- EXECUTIVE COMMITTEE MANAGEMENT ---
// 1. List all committee members
router.get('/committee', async (_req, res) => {
  try {
    const result = await query(
      `SELECT id, name, designation, photo_url, order_index, bio, phone, email, is_active, created_at, updated_at
       FROM executive_committee
       ORDER BY order_index ASC, created_at ASC`
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Admin get committee error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch committee members.' });
  }
});

// 2. Add new committee member
router.post('/committee', async (req, res) => {
  try {
    const schema = z.object({
      name: z.string().min(2),
      designation: z.string().min(2),
      photo_url: z.string().optional().default(''),
      order_index: z.number().int().optional().default(0),
      bio: z.string().optional().default(''),
      phone: z.string().optional().default(''),
      email: z.string().optional().default(''),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: parsed.error.issues[0]?.message || 'Invalid input' });
    }

    const d = parsed.data;
    const result = await query(
      `INSERT INTO executive_committee (name, designation, photo_url, order_index, bio, phone, email, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE)
       RETURNING *`,
      [d.name, d.designation, d.photo_url, d.order_index, d.bio, d.phone, d.email]
    );

    res.json({ success: true, data: result.rows[0], message: 'Committee member added successfully.' });
  } catch (error) {
    console.error('Admin create committee error:', error);
    res.status(500).json({ success: false, error: 'Failed to add committee member.' });
  }
});

// 3. Update committee member (including photo, order, designation)
router.put('/committee/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const schema = z.object({
      name: z.string().min(2),
      designation: z.string().min(2),
      photo_url: z.string().optional().default(''),
      order_index: z.number().int().optional().default(0),
      bio: z.string().optional().default(''),
      phone: z.string().optional().default(''),
      email: z.string().optional().default(''),
      is_active: z.boolean().optional().default(true),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: parsed.error.issues[0]?.message || 'Invalid input' });
    }

    const d = parsed.data;
    const result = await query(
      `UPDATE executive_committee
       SET name = $1, designation = $2, photo_url = $3, order_index = $4, bio = $5, phone = $6, email = $7, is_active = $8, updated_at = CURRENT_TIMESTAMP
       WHERE id = $9
       RETURNING *`,
      [d.name, d.designation, d.photo_url, d.order_index, d.bio, d.phone, d.email, d.is_active, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Committee member not found.' });
    }

    res.json({ success: true, data: result.rows[0], message: 'Committee member updated successfully.' });
  } catch (error) {
    console.error('Admin update committee error:', error);
    res.status(500).json({ success: false, error: 'Failed to update committee member.' });
  }
});

// 4. Delete committee member
router.delete('/committee/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await query(`DELETE FROM executive_committee WHERE id = $1`, [id]);
    res.json({ success: true, message: 'Committee member deleted successfully.' });
  } catch (error) {
    console.error('Admin delete committee error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete committee member.' });
  }
});

export default router;

