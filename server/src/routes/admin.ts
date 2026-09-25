import { Router } from 'express';
import { z } from 'zod';
import { query, getClient } from '../db';
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

// Delete Magazine
router.delete('/magazines/:id', async (req: RequestWithUser, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM magazines WHERE id = $1', [id]);
    res.json({ success: true, message: 'Magazine deleted successfully.' });
  } catch (error) {
    console.error('Delete magazine error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete magazine.' });
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
                (SELECT json_agg(json_build_object('unit_code', om.unit_code, 'role_in_unit', om.designation, 'position', om.designation, 'is_leadership', om.is_leadership))
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

// --- MAIN COMMITTEE CLASS TASKS ---
// 1. List all class tasks
router.get('/class-tasks', async (_req, res) => {
  try {
    const tasksRes = await query(`
      SELECT 
        ct.*,
        (SELECT COUNT(*)::int FROM class_task_results ctr WHERE ctr.task_id = ct.id) as classes_marked_count
      FROM class_tasks ct
      ORDER BY ct.task_date DESC, ct.created_at DESC
    `);

    res.json({ success: true, data: tasksRes.rows });
  } catch (error) {
    console.error('Fetch class tasks error:', error);
    res.status(500).json({ success: false, error: 'Failed to load class tasks.' });
  }
});

// 2. Create class task
router.post('/class-tasks', async (req: RequestWithUser, res) => {
  try {
    const userId = req.user!.id;
    const schema = z.object({
      title: z.string().min(2),
      description: z.string().optional().default(''),
      assigned_class: z.enum(['01', '02', '03', '04', '05', '06', '07', '08']).optional().nullable(),
      maximum_mark: z.number().positive().default(20),
      task_date: z.string().optional().default(new Date().toISOString().split('T')[0]),
      task_category: z.string().optional().default('Main Committee Task'),
      winner_poster_url: z.string().optional().default(''),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: parsed.error.issues[0]?.message || 'Invalid input' });
    }

    const d = parsed.data;
    const result = await query(
      `INSERT INTO class_tasks (title, description, assigned_class, maximum_mark, task_date, task_category, winner_poster_url, created_by, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'DRAFT')
       RETURNING *`,
      [d.title, d.description, d.assigned_class || null, d.maximum_mark, d.task_date, d.task_category, d.winner_poster_url, userId]
    );

    res.json({ success: true, data: result.rows[0], message: 'Class task created successfully.' });
  } catch (error) {
    console.error('Create class task error:', error);
    res.status(500).json({ success: false, error: 'Failed to create class task.' });
  }
});

// 3. Get specific task and results
router.get('/class-tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const taskRes = await query('SELECT * FROM class_tasks WHERE id = $1', [id]);
    if (taskRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Task not found.' });
    }

    const resultsRes = await query('SELECT * FROM class_task_results WHERE task_id = $1 ORDER BY class_code ASC', [id]);

    res.json({
      success: true,
      data: {
        task: taskRes.rows[0],
        results: resultsRes.rows,
      },
    });
  } catch (error) {
    console.error('Get task details error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch task details.' });
  }
});

// 4. Save marks and Publish Class Task (Atomic Transaction + Double-Count Protection)
router.post('/class-tasks/:id/results', async (req, res) => {
  const client = await getClient();
  try {
    const { id } = req.params;
    const taskRes = await client.query('SELECT * FROM class_tasks WHERE id = $1', [id]);
    if (taskRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Task not found.' });
    }
    const task = taskRes.rows[0];

    const markEntrySchema = z.object({
      class_code: z.enum(['01', '02', '03', '04', '05', '06', '07', '08']),
      mark: z.number().min(0),
      winner_poster_url: z.string().optional().default(''),
    });

    const bodySchema = z.object({
      class_results: z.array(markEntrySchema),
      winner_poster_url: z.string().optional(),
      publish_now: z.boolean().optional().default(true),
    });

    const parsed = bodySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: parsed.error.issues[0]?.message || 'Invalid input' });
    }

    const { class_results, winner_poster_url, publish_now } = parsed.data;

    await client.query('BEGIN');

    // 1. Delete existing task results
    await client.query('DELETE FROM class_task_results WHERE task_id = $1', [id]);

    // 2. Insert class results
    for (const cr of class_results) {
      // In Main Committee Tasks, mark directly represents class points
      const classPoints = Math.round(cr.mark);
      await client.query(
        `INSERT INTO class_task_results (task_id, class_code, mark, class_points, winner_poster_url, status, published_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          id,
          cr.class_code,
          cr.mark,
          classPoints,
          cr.winner_poster_url || winner_poster_url || '',
          publish_now ? 'PUBLISHED' : 'DRAFT',
          publish_now ? new Date() : null,
        ]
      );
    }

    if (winner_poster_url !== undefined) {
      await client.query('UPDATE class_tasks SET winner_poster_url = $1 WHERE id = $2', [winner_poster_url, id]);
    }

    if (publish_now) {
      // 3. Mark task as PUBLISHED
      await client.query(
        `UPDATE class_tasks 
         SET status = 'PUBLISHED', published_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [id]
      );

      // 4. Double-count protection: clear previous ledger entries for this task
      await client.query(
        `DELETE FROM class_score_ledger 
         WHERE source_type = 'MAIN_COMMITTEE_TASK' AND source_id = $1`,
        [id]
      );

      // 5. Insert ledger records
      for (const cr of class_results) {
        const points = Math.round(cr.mark);
        if (points > 0) {
          const desc = `${task.title} (Main Committee) — Class ${cr.class_code} (${cr.mark} Marks)`;
          await client.query(
            `INSERT INTO class_score_ledger (class_code, source_type, source_id, points, description)
             VALUES ($1, 'MAIN_COMMITTEE_TASK', $2, $3, $4)`,
            [cr.class_code, id, points, desc]
          );
        }
      }
    }

    await client.query('COMMIT');

    res.json({
      success: true,
      message: publish_now
        ? '✅ Class task results published! Class scores and leaderboard updated live.'
        : 'Class task results saved as draft.',
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Save task results error:', error);
    res.status(500).json({ success: false, error: 'Failed to record task results.' });
  } finally {
    client.release();
  }
});

// 5. Delete task & clean ledger
router.delete('/class-tasks/:id', async (req, res) => {
  const client = await getClient();
  try {
    const { id } = req.params;
    await client.query('BEGIN');
    await client.query('DELETE FROM class_score_ledger WHERE source_type = \'MAIN_COMMITTEE_TASK\' AND source_id = $1', [id]);
    await client.query('DELETE FROM class_tasks WHERE id = $1', [id]);
    await client.query('COMMIT');
    res.json({ success: true, message: 'Class task deleted successfully.' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Delete task error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete class task.' });
  } finally {
    client.release();
  }
});

// --- SUB-WINGS LEADERSHIP MANAGEMENT ---
// List sub-wings with leadership
router.get('/subwings', async (_req, res) => {
  try {
    const result = await query(`
      SELECT 
        sw.id, sw.code, sw.name, sw.description, sw.status,
        sw.chairman_id, sw.convener_id,
        u_c.full_name as chairman_name,
        u_v.full_name as convener_name,
        (SELECT COUNT(*)::int FROM programs p WHERE p.sub_wing_id = sw.id) as programs_count
      FROM sub_wings sw
      LEFT JOIN student_profiles u_c ON u_c.user_id = sw.chairman_id
      LEFT JOIN student_profiles u_v ON u_v.user_id = sw.convener_id
      ORDER BY sw.code ASC
    `);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Admin subwings error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch sub-wings.' });
  }
});

// Assign Chairman & Convener to a Sub-Wing
router.patch('/subwings/:id/leadership', async (req, res) => {
  try {
    const { id } = req.params;
    const schema = z.object({
      chairman_id: z.string().uuid().optional().nullable(),
      convener_id: z.string().uuid().optional().nullable(),
      name: z.string().optional(),
      description: z.string().optional(),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: parsed.error.issues[0]?.message || 'Invalid input' });
    }

    const d = parsed.data;
    const updates: string[] = ['updated_at = CURRENT_TIMESTAMP'];
    const values: any[] = [];
    let idx = 1;

    if (d.chairman_id !== undefined) {
      updates.push(`chairman_id = $${idx++}`);
      values.push(d.chairman_id);
    }
    if (d.convener_id !== undefined) {
      updates.push(`convener_id = $${idx++}`);
      values.push(d.convener_id);
    }
    if (d.name !== undefined) {
      updates.push(`name = $${idx++}`);
      values.push(d.name);
    }
    if (d.description !== undefined) {
      updates.push(`description = $${idx++}`);
      values.push(d.description);
    }

    values.push(id);
    const result = await query(
      `UPDATE sub_wings
       SET ${updates.join(', ')}
       WHERE id = $${idx}
       RETURNING *`,
      values
    );

    res.json({ success: true, data: result.rows[0], message: 'Sub-Wing leadership assigned successfully.' });
  } catch (error) {
    console.error('Update subwing error:', error);
    res.status(500).json({ success: false, error: 'Failed to update Sub-Wing.' });
  }
});

// --- MEDIA & YOUTUBE BROADCAST MANAGEMENT ---
// 1. Get all media items for admin
router.get('/media', async (_req, res) => {
  try {
    const result = await query(
      `SELECT id, title, description, media_type, media_url, category, status, created_at
       FROM media_items
       ORDER BY created_at DESC`
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Fetch admin media error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch media items.' });
  }
});

// 2. Create new media item (YouTube video / broadcast)
router.post('/media', async (req: RequestWithUser, res) => {
  try {
    const schema = z.object({
      title: z.string().min(2, 'Title is required'),
      description: z.string().optional().default(''),
      media_url: z.string().url('A valid URL is required'),
      category: z.string().optional().default('Broadcast'),
      media_type: z.enum(['youtube', 'video', 'audio', 'vimeo', 'image']).default('youtube'),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: parsed.error.issues[0]?.message || 'Invalid input' });
    }

    const d = parsed.data;
    const result = await query(
      `INSERT INTO media_items (title, description, media_type, media_url, category, status)
       VALUES ($1, $2, $3, $4, $5, 'PUBLISHED')
       RETURNING *`,
      [d.title, d.description, d.media_type, d.media_url, d.category]
    );

    res.json({ success: true, data: result.rows[0], message: 'Media item published successfully!' });
  } catch (error) {
    console.error('Create media error:', error);
    res.status(500).json({ success: false, error: 'Failed to add media item.' });
  }
});

// 3. Update media item
router.put('/media/:id', async (req: RequestWithUser, res) => {
  try {
    const { id } = req.params;
    const schema = z.object({
      title: z.string().min(2).optional(),
      description: z.string().optional(),
      media_url: z.string().url().optional(),
      category: z.string().optional(),
      media_type: z.enum(['youtube', 'video', 'audio', 'vimeo', 'image']).optional(),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: parsed.error.issues[0]?.message || 'Invalid input' });
    }

    const d = parsed.data;
    const result = await query(
      `UPDATE media_items
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           media_url = COALESCE($3, media_url),
           category = COALESCE($4, category),
           media_type = COALESCE($5, media_type)
       WHERE id = $6
       RETURNING *`,
      [d.title, d.description, d.media_url, d.category, d.media_type, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Media item not found.' });
    }

    res.json({ success: true, data: result.rows[0], message: 'Media item updated successfully.' });
  } catch (error) {
    console.error('Update media error:', error);
    res.status(500).json({ success: false, error: 'Failed to update media item.' });
  }
});

// 4. Delete media item
router.delete('/media/:id', async (req: RequestWithUser, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM media_items WHERE id = $1', [id]);
    res.json({ success: true, message: 'Media item deleted successfully.' });
  } catch (error) {
    console.error('Delete media error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete media item.' });
  }
});

export default router;

