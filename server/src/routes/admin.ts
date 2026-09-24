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

export default router;
