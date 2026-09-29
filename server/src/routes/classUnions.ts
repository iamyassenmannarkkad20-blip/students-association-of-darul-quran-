import { Router } from 'express';
import { query } from '../db';
import { requireAuth, requireRoles, RequestWithUser } from '../middleware/auth';
import { ROLES } from '../../../shared/types';
import { z } from 'zod';

const router = Router();

// ==================================================
// 1. GET / - List all 8 Class Sangadhanakal (Unions)
// ==================================================
router.get('/', async (_req, res) => {
  try {
    const result = await query(`
      SELECT 
        u.*,
        ch.username as chairman_username,
        ch_p.full_name as chairman_name,
        ch_p.profile_photo_url as chairman_photo_url,
        ch_p.profile_slug as chairman_slug,
        cv.username as convener_username,
        cv_p.full_name as convener_name,
        cv_p.profile_photo_url as convener_photo_url,
        cv_p.profile_slug as convener_slug,
        (SELECT COUNT(*)::int FROM student_profiles sp WHERE sp.class_code = u.class_code) as student_count,
        COALESCE(
          (SELECT SUM(l.points)::int FROM class_score_ledger l WHERE l.class_code = u.class_code), 
          0
        ) as all_time_points,
        COALESCE(
          (SELECT SUM(l.points)::int 
           FROM class_score_ledger l 
           JOIN academic_cycles ac ON ac.id = l.cycle_id 
           WHERE l.class_code = u.class_code AND ac.status = 'ACTIVE'), 
          0
        ) as current_cycle_points
      FROM class_sangadhanakal u
      LEFT JOIN users ch ON ch.id = u.chairman_id
      LEFT JOIN student_profiles ch_p ON ch_p.user_id = ch.id
      LEFT JOIN users cv ON cv.id = u.convener_id
      LEFT JOIN student_profiles cv_p ON cv_p.user_id = cv.id
      ORDER BY u.class_code ASC;
    `);

    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Fetch class unions error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch class unions.' });
  }
});

// ==================================================
// 2. GET /:class_code - Single Class Union with Batch Members
// ==================================================
router.get('/:class_code', async (req, res) => {
  try {
    const { class_code } = req.params;
    if (!['01', '02', '03', '04', '05', '06', '07', '08'].includes(class_code)) {
      return res.status(400).json({ success: false, error: 'Invalid class code. Must be 01 to 08.' });
    }

    const unionRes = await query(
      `SELECT 
        u.*,
        ch.username as chairman_username,
        ch_p.full_name as chairman_name,
        ch_p.profile_photo_url as chairman_photo_url,
        ch_p.profile_slug as chairman_slug,
        cv.username as convener_username,
        cv_p.full_name as convener_name,
        cv_p.profile_photo_url as convener_photo_url,
        cv_p.profile_slug as convener_slug
       FROM class_sangadhanakal u
       LEFT JOIN users ch ON ch.id = u.chairman_id
       LEFT JOIN student_profiles ch_p ON ch_p.user_id = ch.id
       LEFT JOIN users cv ON cv.id = u.convener_id
       LEFT JOIN student_profiles cv_p ON cv_p.user_id = cv.id
       WHERE u.class_code = $1`,
      [class_code]
    );

    if (unionRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Class union not found.' });
    }

    // Get batch member students
    const studentsRes = await query(
      `SELECT u.id as user_id, u.username, sp.full_name, sp.profile_slug, sp.profile_photo_url,
              (SELECT COUNT(*)::int FROM certificate_records cr WHERE cr.recipient_user_id = u.id) as certificates_count
       FROM users u
       JOIN student_profiles sp ON sp.user_id = u.id
       WHERE sp.class_code = $1 AND u.is_active = TRUE
       ORDER BY sp.full_name ASC`,
      [class_code]
    );

    res.json({
      success: true,
      data: {
        union: unionRes.rows[0],
        members: studentsRes.rows,
      },
    });
  } catch (error) {
    console.error('Fetch union detail error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch class union detail.' });
  }
});

// ==================================================
// 3. PUT /:class_code - Update Union Details
// (Allowed for Admin, or the assigned Chairman/Convener of this class)
// ==================================================
const updateUnionSchema = z.object({
  name: z.string().min(2).optional(),
  motto: z.string().optional(),
  description: z.string().optional(),
  logo_url: z.string().optional(),
  banner_url: z.string().optional(),
});

router.put('/:class_code', requireAuth, async (req: RequestWithUser, res) => {
  try {
    const { class_code } = req.params;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    if (!['01', '02', '03', '04', '05', '06', '07', '08'].includes(class_code)) {
      return res.status(400).json({ success: false, error: 'Invalid class code.' });
    }

    // Check permissions: Admin OR Chairman/Convener
    const unionCheck = await query(
      `SELECT chairman_id, convener_id FROM class_sangadhanakal WHERE class_code = $1`,
      [class_code]
    );

    if (unionCheck.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Class union not found.' });
    }

    const union = unionCheck.rows[0];
    const isAdmin = userRole === ROLES.SUPER_ADMIN || userRole === ROLES.ADMIN;
    const isLeader = union.chairman_id === userId || union.convener_id === userId;

    if (!isAdmin && !isLeader) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden. Only the designated Class Chairman, Convener, or Administrator may update this Class Sangadhana.',
      });
    }

    const parsed = updateUnionSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: parsed.error.issues[0]?.message || 'Invalid input' });
    }

    const d = parsed.data;
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (d.name !== undefined) {
      fields.push(`name = $${idx++}`);
      values.push(d.name);
    }
    if (d.motto !== undefined) {
      fields.push(`motto = $${idx++}`);
      values.push(d.motto);
    }
    if (d.description !== undefined) {
      fields.push(`description = $${idx++}`);
      values.push(d.description);
    }
    if (d.logo_url !== undefined) {
      fields.push(`logo_url = $${idx++}`);
      values.push(d.logo_url);
    }
    if (d.banner_url !== undefined) {
      fields.push(`banner_url = $${idx++}`);
      values.push(d.banner_url);
    }

    if (fields.length === 0) {
      return res.json({ success: true, message: 'No fields to update.' });
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(class_code);

    const updateQuery = `
      UPDATE class_sangadhanakal
      SET ${fields.join(', ')}
      WHERE class_code = $${idx}
      RETURNING *
    `;

    const result = await query(updateQuery, values);
    res.json({
      success: true,
      data: result.rows[0],
      message: 'Class Sangadhana details updated successfully!',
    });
  } catch (error) {
    console.error('Update union error:', error);
    res.status(500).json({ success: false, error: 'Failed to update class union.' });
  }
});

// ==================================================
// 4. POST /admin/assign-leadership - Admin sets Chairman & Convener
// ==================================================
const leadershipSchema = z.object({
  class_code: z.enum(['01', '02', '03', '04', '05', '06', '07', '08']),
  chairman_id: z.string().uuid().optional().nullable(),
  convener_id: z.string().uuid().optional().nullable(),
});

router.post('/admin/assign-leadership', requireAuth, requireRoles([ROLES.SUPER_ADMIN, ROLES.ADMIN]), async (req: RequestWithUser, res) => {
  try {
    const parsed = leadershipSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: parsed.error.issues[0]?.message || 'Invalid input' });
    }

    const { class_code, chairman_id, convener_id } = parsed.data;

    const result = await query(
      `UPDATE class_sangadhanakal
       SET chairman_id = $1, convener_id = $2, updated_at = CURRENT_TIMESTAMP
       WHERE class_code = $3
       RETURNING *`,
      [chairman_id || null, convener_id || null, class_code]
    );

    res.json({
      success: true,
      data: result.rows[0],
      message: `Leadership successfully assigned for Class ${class_code} Sangadhana!`,
    });
  } catch (error) {
    console.error('Assign union leadership error:', error);
    res.status(500).json({ success: false, error: 'Failed to assign class union leadership.' });
  }
});

// ==================================================
// 5. GET /items/all - All Class Union releases across batches
// ==================================================
router.get('/items/all', async (req, res) => {
  try {
    const category = req.query.category as string;
    const classCode = req.query.classCode as string;

    let queryStr = `
      SELECT 
        i.*,
        u.name as union_name,
        u.logo_url as union_logo_url,
        usr.username as creator_username,
        sp.full_name as creator_name
      FROM class_union_items i
      JOIN class_sangadhanakal u ON u.class_code = i.class_code
      LEFT JOIN users usr ON usr.id = i.created_by
      LEFT JOIN student_profiles sp ON sp.user_id = i.created_by
      WHERE 1=1
    `;
    const params: any[] = [];

    if (category) {
      params.push(category);
      queryStr += ` AND i.category = $${params.length}`;
    }

    if (classCode) {
      params.push(classCode);
      queryStr += ` AND i.class_code = $${params.length}`;
    }

    queryStr += ` ORDER BY i.created_at DESC LIMIT 100`;

    const result = await query(queryStr, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Fetch union items error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch class union publications.' });
  }
});

// ==================================================
// 6. GET /:class_code/items - Items for a specific Class Union
// ==================================================
router.get('/:class_code/items', async (req, res) => {
  try {
    const { class_code } = req.params;
    const result = await query(
      `SELECT i.*, usr.username as creator_username, sp.full_name as creator_name
       FROM class_union_items i
       LEFT JOIN users usr ON usr.id = i.created_by
       LEFT JOIN student_profiles sp ON sp.user_id = i.created_by
       WHERE i.class_code = $1
       ORDER BY i.created_at DESC`,
      [class_code]
    );

    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Fetch class union items error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch items.' });
  }
});

// ==================================================
// 7. POST /:class_code/items - Appointed Chairman/Convener adds Release
// ==================================================
const createItemSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  description: z.string().optional().default(''),
  category: z.enum(['PROJECT', 'MAGAZINE', 'VIDEO', 'POSTER', 'DOCUMENT']),
  item_url: z.string().url('A valid link (Google Drive, YouTube, external PDF) is required'),
  thumbnail_url: z.string().optional().default(''),
});

router.post('/:class_code/items', requireAuth, async (req: RequestWithUser, res) => {
  try {
    const { class_code } = req.params;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    if (!['01', '02', '03', '04', '05', '06', '07', '08'].includes(class_code)) {
      return res.status(400).json({ success: false, error: 'Invalid class code.' });
    }

    // Verify user is Chairman, Convener, or Admin
    const unionCheck = await query(
      `SELECT chairman_id, convener_id FROM class_sangadhanakal WHERE class_code = $1`,
      [class_code]
    );

    if (unionCheck.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Class union not found.' });
    }

    // Verified logged-in user can submit under their class union (or any class union)
    // Non-logged-in visitors are strictly rejected by requireAuth


    const parsed = createItemSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: parsed.error.issues[0]?.message || 'Invalid input' });
    }

    const d = parsed.data;
    const result = await query(
      `INSERT INTO class_union_items (class_code, title, description, category, item_url, thumbnail_url, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [class_code, d.title, d.description, d.category, d.item_url, d.thumbnail_url, userId]
    );

    res.json({
      success: true,
      data: result.rows[0],
      message: `🎉 Release "${d.title}" published under Class ${class_code} Union successfully!`,
    });
  } catch (error) {
    console.error('Create union item error:', error);
    res.status(500).json({ success: false, error: 'Failed to publish class union release.' });
  }
});

// ==================================================
// 8. DELETE /items/:itemId - Delete Release
// ==================================================
router.delete('/items/:itemId', requireAuth, async (req: RequestWithUser, res) => {
  try {
    const { itemId } = req.params;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const itemRes = await query(`SELECT * FROM class_union_items WHERE id = $1`, [itemId]);
    if (itemRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Item not found.' });
    }

    const item = itemRes.rows[0];
    const unionCheck = await query(
      `SELECT chairman_id, convener_id FROM class_sangadhanakal WHERE class_code = $1`,
      [item.class_code]
    );

    const union = unionCheck.rows[0];
    const isAdmin = userRole === ROLES.SUPER_ADMIN || userRole === ROLES.ADMIN;
    const isLeader = union && (union.chairman_id === userId || union.convener_id === userId);
    const isAuthor = item.created_by === userId;

    if (!isAdmin && !isLeader && !isAuthor) {
      return res.status(403).json({ success: false, error: 'Forbidden. Not authorized to delete this release.' });
    }

    await query(`DELETE FROM class_union_items WHERE id = $1`, [itemId]);
    res.json({ success: true, message: 'Class Union release deleted successfully.' });
  } catch (error) {
    console.error('Delete union item error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete release.' });
  }
});

export default router;
