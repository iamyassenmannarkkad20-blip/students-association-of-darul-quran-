import { Router } from 'express';
import { z } from 'zod';
import { query } from '../db';
import { requireAuth, RequestWithUser } from '../middleware/auth';

const router = Router();

// Public / Community Feed (visible to authenticated members or public depending on visibility)
router.get('/posts', async (req: RequestWithUser, res) => {
  try {
    const category = req.query.category as string;
    const sessionId = req.cookies?.sadq_session;

    // Check if user is logged in
    let isAuthenticated = false;
    let currentUserId: string | null = null;
    if (sessionId) {
      const sRes = await query(
        `SELECT user_id FROM sessions WHERE id = $1 AND expires_at > CURRENT_TIMESTAMP`,
        [sessionId]
      );
      if (sRes.rows.length > 0) {
        isAuthenticated = true;
        currentUserId = sRes.rows[0].user_id;
      }
    }

    let filterQuery = `WHERE p.status = 'PUBLISHED'`;
    const params: any[] = [];

    if (!isAuthenticated) {
      filterQuery += ` AND p.visibility = 'PUBLIC'`;
    } else {
      filterQuery += ` AND p.visibility IN ('PUBLIC', 'COMMUNITY')`;
    }

    if (category) {
      params.push(category);
      filterQuery += ` AND p.category = $${params.length}`;
    }

    const postsRes = await query(
      `SELECT p.id, p.title, p.body, p.category, p.visibility, p.pinned, p.created_at,
              u.role as author_role, sp.full_name as author_name, sp.profile_slug,
              sp.profile_photo_url,
              (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id)::int as comments_count,
              (SELECT COUNT(*) FROM reactions r WHERE r.post_id = p.id)::int as reactions_count,
              (SELECT reaction_type FROM reactions r WHERE r.post_id = p.id AND r.user_id = $${params.length + 1}) as user_reaction
       FROM posts p
       JOIN users u ON u.id = p.author_id
       LEFT JOIN student_profiles sp ON sp.user_id = p.author_id
       ${filterQuery}
       ORDER BY p.pinned DESC, p.created_at DESC
       LIMIT 50`,
      [...params, currentUserId]
    );

    res.json({ success: true, data: postsRes.rows });
  } catch (error) {
    console.error('Fetch posts error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch posts.' });
  }
});

// Create Post (Authenticated Students)
const postSchema = z.object({
  title: z.string().min(2).max(255),
  body: z.string().min(5),
  category: z.string().min(2).max(100),
  visibility: z.enum(['PRIVATE', 'COMMUNITY', 'PUBLIC']).default('COMMUNITY'),
  organisationUnitCode: z.string().optional(),
});

router.post('/posts', requireAuth, async (req: RequestWithUser, res) => {
  try {
    const parse = postSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ success: false, error: parse.error.errors[0].message });
      return;
    }

    const { title, body, category, visibility, organisationUnitCode } = parse.data;

    // Normal student posts default to PUBLISHED for community or PENDING_REVIEW if public
    const status = visibility === 'PUBLIC' ? 'PENDING_REVIEW' : 'PUBLISHED';

    const result = await query(
      `INSERT INTO posts (author_id, title, body, category, visibility, status, organisation_unit_code)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        req.user!.id,
        title,
        body,
        category,
        visibility,
        status,
        organisationUnitCode || null,
      ]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message:
        visibility === 'PUBLIC'
          ? 'Post submitted for moderation before public display.'
          : 'Post published to student community.',
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ success: false, error: 'Failed to create post.' });
  }
});

// React to Post (One reaction per user)
const reactSchema = z.object({
  reactionType: z.enum(['like', 'insightful', 'appreciate']),
});

router.post('/posts/:id/react', requireAuth, async (req: RequestWithUser, res) => {
  try {
    const parse = reactSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ success: false, error: 'Invalid reaction type.' });
      return;
    }

    const postId = req.params.id;
    const userId = req.user!.id;
    const { reactionType } = parse.data;

    // Check if already reacted with the same type (toggle off)
    const existing = await query(
      'SELECT id, reaction_type FROM reactions WHERE post_id = $1 AND user_id = $2',
      [postId, userId]
    );

    if (existing.rows.length > 0) {
      if (existing.rows[0].reaction_type === reactionType) {
        await query('DELETE FROM reactions WHERE id = $1', [existing.rows[0].id]);
        res.json({ success: true, action: 'removed' });
        return;
      } else {
        await query('UPDATE reactions SET reaction_type = $1 WHERE id = $2', [
          reactionType,
          existing.rows[0].id,
        ]);
        res.json({ success: true, action: 'updated', reactionType });
        return;
      }
    }

    await query(
      'INSERT INTO reactions (post_id, user_id, reaction_type) VALUES ($1, $2, $3)',
      [postId, userId, reactionType]
    );
    res.json({ success: true, action: 'added', reactionType });
  } catch (error) {
    console.error('React error:', error);
    res.status(500).json({ success: false, error: 'Failed to process reaction.' });
  }
});

// Comments on Post
router.get('/posts/:id/comments', async (req, res) => {
  try {
    const comments = await query(
      `SELECT c.id, c.body, c.created_at, sp.full_name as author_name,
              sp.profile_slug, sp.profile_photo_url, u.role as author_role
       FROM comments c
       JOIN users u ON u.id = c.author_id
       LEFT JOIN student_profiles sp ON sp.user_id = c.author_id
       WHERE c.post_id = $1
       ORDER BY c.created_at ASC`,
      [req.params.id]
    );
    res.json({ success: true, data: comments.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch comments.' });
  }
});

router.post('/posts/:id/comments', requireAuth, async (req: RequestWithUser, res) => {
  try {
    const { body } = req.body;
    if (!body || typeof body !== 'string' || body.trim().length === 0) {
      res.status(400).json({ success: false, error: 'Comment body cannot be empty.' });
      return;
    }

    const result = await query(
      `INSERT INTO comments (post_id, author_id, body)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [req.params.id, req.user!.id, body.trim()]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to post comment.' });
  }
});

// Study Notes Creation (Drive link)
const studyNoteSchema = z.object({
  title: z.string().min(2).max(255),
  description: z.string().optional(),
  subjectArea: z.string().min(2).max(100),
  fileUrl: z.string().url('Must be a valid Google Drive or public file URL'),
  downloadable: z.boolean().default(true),
  visibility: z.enum(['PRIVATE', 'COMMUNITY', 'PUBLIC']).default('COMMUNITY'),
});

router.post('/notes', requireAuth, async (req: RequestWithUser, res) => {
  try {
    const parse = studyNoteSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ success: false, error: parse.error.errors[0].message });
      return;
    }

    const d = parse.data;
    const result = await query(
      `INSERT INTO study_notes (author_id, title, description, subject_area, file_url, downloadable, visibility)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [req.user!.id, d.title, d.description || '', d.subjectArea, d.fileUrl, d.downloadable, d.visibility]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create study note.' });
  }
});

router.get('/notes', async (req, res) => {
  const result = await query(
    `SELECT n.*, sp.full_name as author_name
     FROM study_notes n
     JOIN student_profiles sp ON sp.user_id = n.author_id
     WHERE n.visibility IN ('COMMUNITY', 'PUBLIC') AND n.status = 'PUBLISHED'
     ORDER BY n.created_at DESC`
  );
  res.json({ success: true, data: result.rows });
});

// Articles Submission (Draft / Review)
const articleSchema = z.object({
  title: z.string().min(2).max(255),
  summary: z.string().optional(),
  content: z.string().min(10),
  category: z.string().min(2).max(100),
  coverImageUrl: z.string().optional(),
  visibility: z.enum(['PRIVATE', 'COMMUNITY', 'PUBLIC']).default('COMMUNITY'),
});

router.post('/articles', requireAuth, async (req: RequestWithUser, res) => {
  try {
    const parse = articleSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ success: false, error: parse.error.errors[0].message });
      return;
    }

    const d = parse.data;
    const baseSlug = d.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const slug = `${baseSlug}-${Date.now().toString(36)}`;

    const result = await query(
      `INSERT INTO articles (author_id, title, slug, summary, content, category, cover_image_url, visibility, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'PENDING_REVIEW')
       RETURNING *`,
      [req.user!.id, d.title, slug, d.summary || '', d.content, d.category, d.coverImageUrl || null, d.visibility]
    );

    res.status(201).json({ success: true, data: result.rows[0], message: 'Article submitted for review.' });
  } catch (error) {
    console.error('Create article error:', error);
    res.status(500).json({ success: false, error: 'Failed to submit article.' });
  }
});

router.get('/articles', async (_req, res) => {
  try {
    const result = await query(
      `SELECT a.*, sp.full_name as author_name, sp.profile_slug
       FROM articles a
       JOIN student_profiles sp ON sp.user_id = a.author_id
       WHERE a.status = 'PUBLISHED' AND a.visibility IN ('COMMUNITY', 'PUBLIC')
       ORDER BY a.created_at DESC`
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch articles.' });
  }
});

export default router;

