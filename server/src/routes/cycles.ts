import { Router } from 'express';
import { query, getClient } from '../db';
import { requireAuth, requireRoles, RequestWithUser } from '../middleware/auth';
import { ROLES } from '../../../shared/types';
import { z } from 'zod';

const router = Router();

// ==================================================
// 1. GET /active - Currently running academic cycle
// ==================================================
router.get('/active', async (_req, res) => {
  try {
    const cycleRes = await query(
      `SELECT * FROM academic_cycles WHERE status = 'ACTIVE' ORDER BY created_at DESC LIMIT 1`
    );

    if (cycleRes.rows.length === 0) {
      return res.json({ success: true, data: null, message: 'No active academic cycle currently running.' });
    }

    const cycle = cycleRes.rows[0];

    // Compute live class standings for this active cycle
    const scoresRes = await query(
      `WITH cycle_scores AS (
        SELECT 
          c.code as class_code,
          COALESCE(SUM(l.points), 0)::int as total_points,
          COUNT(l.id)::int as entries_count
        FROM (VALUES ('01'), ('02'), ('03'), ('04'), ('05'), ('06'), ('07'), ('08')) as c(code)
        LEFT JOIN class_score_ledger l ON l.class_code = c.code AND l.cycle_id = $1
        GROUP BY c.code
      )
      SELECT 
        cs.*,
        u.name as union_name,
        u.motto as union_motto,
        DENSE_RANK() OVER (ORDER BY cs.total_points DESC, cs.class_code ASC) as rank
      FROM cycle_scores cs
      LEFT JOIN class_sangadhanakal u ON u.class_code = cs.class_code
      ORDER BY rank ASC, class_code ASC;`,
      [cycle.id]
    );

    const leader = scoresRes.rows.length > 0 && scoresRes.rows[0].total_points > 0 ? scoresRes.rows[0] : null;

    res.json({
      success: true,
      data: {
        cycle,
        standings: scoresRes.rows,
        current_leader: leader,
      },
    });
  } catch (error) {
    console.error('Fetch active cycle error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch active academic cycle.' });
  }
});

// ==================================================
// 2. GET /defending-champion - Most recently closed cycle's Best Class
// ==================================================
router.get('/defending-champion', async (_req, res) => {
  try {
    const closedRes = await query(
      `SELECT ac.*, 
              u.name as union_name, 
              u.motto as union_motto,
              u.logo_url as union_logo_url,
              ch.username as chairman_username,
              ch_p.full_name as chairman_name,
              ch_p.profile_photo_url as chairman_photo_url,
              cv.username as convener_username,
              cv_p.full_name as convener_name
       FROM academic_cycles ac
       LEFT JOIN class_sangadhanakal u ON u.class_code = ac.best_class_code
       LEFT JOIN users ch ON ch.id = u.chairman_id
       LEFT JOIN student_profiles ch_p ON ch_p.user_id = ch.id
       LEFT JOIN users cv ON cv.id = u.convener_id
       LEFT JOIN student_profiles cv_p ON cv_p.user_id = cv.id
       WHERE ac.status = 'CLOSED' AND ac.best_class_code IS NOT NULL
       ORDER BY ac.closed_at DESC, ac.created_at DESC
       LIMIT 1`
    );

    if (closedRes.rows.length === 0) {
      return res.json({ success: true, data: null, message: 'No closed academic cycles on record yet.' });
    }

    res.json({
      success: true,
      data: closedRes.rows[0],
    });
  } catch (error) {
    console.error('Fetch defending champion error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch defending champion.' });
  }
});

// ==================================================
// 3. GET /history - All past cycles with final rankings
// ==================================================
router.get('/history', async (_req, res) => {
  try {
    const cyclesRes = await query(
      `SELECT ac.*, u.name as best_class_union_name, u.motto as best_class_motto
       FROM academic_cycles ac
       LEFT JOIN class_sangadhanakal u ON u.class_code = ac.best_class_code
       ORDER BY ac.created_at DESC`
    );

    res.json({ success: true, data: cyclesRes.rows });
  } catch (error) {
    console.error('Fetch cycle history error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch cycle history.' });
  }
});

// ==================================================
// 4. POST /admin/start - Start a new academic cycle
// ==================================================
const startCycleSchema = z.object({
  name: z.string().min(3, 'Cycle name is required (e.g. Shawwal - Dhul Qa\'dah Cycle)'),
  academic_year: z.string().default('2026-2027'),
  start_date: z.string().optional().default(new Date().toISOString().split('T')[0]),
  target_leave_date: z.string().optional().nullable(),
  notes: z.string().optional().default(''),
  auto_close_active: z.boolean().optional().default(true),
});

router.post('/admin/start', requireAuth, requireRoles([ROLES.SUPER_ADMIN, ROLES.ADMIN]), async (req: RequestWithUser, res) => {
  const client = await getClient();
  try {
    const parsed = startCycleSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: parsed.error.issues[0]?.message || 'Invalid input' });
    }

    const d = parsed.data;

    await client.query('BEGIN');

    // Check if an active cycle already exists
    const activeRes = await client.query(
      `SELECT id, name FROM academic_cycles WHERE status = 'ACTIVE' LIMIT 1`
    );

    if (activeRes.rows.length > 0) {
      if (!d.auto_close_active) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          error: `An active cycle "${activeRes.rows[0].name}" is already running. Please close it first or check "Auto-close existing cycle".`,
        });
      }

      // Auto-close active cycle: calculate top class and update
      const activeId = activeRes.rows[0].id;
      const topClassRes = await client.query(
        `SELECT class_code, COALESCE(SUM(points), 0)::int as total_points, COUNT(id)::int as task_count
         FROM class_score_ledger
         WHERE cycle_id = $1
         GROUP BY class_code
         ORDER BY total_points DESC, task_count DESC, class_code ASC
         LIMIT 1`,
        [activeId]
      );

      const top = topClassRes.rows[0];
      await client.query(
        `UPDATE academic_cycles
         SET status = 'CLOSED',
             closed_at = CURRENT_TIMESTAMP,
             best_class_code = $1,
             best_class_points = $2,
             best_class_task_count = $3,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $4`,
        [top?.class_code || null, top?.total_points || 0, top?.task_count || 0, activeId]
      );
    }

    // Insert new active cycle
    const newCycle = await client.query(
      `INSERT INTO academic_cycles (name, academic_year, start_date, target_leave_date, status, notes)
       VALUES ($1, $2, $3, $4, 'ACTIVE', $5)
       RETURNING *`,
      [d.name, d.academic_year, d.start_date, d.target_leave_date || null, d.notes]
    );

    await client.query('COMMIT');

    res.json({
      success: true,
      data: newCycle.rows[0],
      message: `🎉 New Academic Cycle "${d.name}" started successfully! Scores are now tracking for this cycle.`,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Start cycle error:', error);
    res.status(500).json({ success: false, error: 'Failed to start academic cycle.' });
  } finally {
    client.release();
  }
});

// ==================================================
// 5. POST /admin/:id/close - Close active cycle & award Best Class
// ==================================================
router.post('/admin/:id/close', requireAuth, requireRoles([ROLES.SUPER_ADMIN, ROLES.ADMIN]), async (req: RequestWithUser, res) => {
  const client = await getClient();
  try {
    const { id } = req.params;
    const notes = req.body.notes || '';

    await client.query('BEGIN');

    const cycleRes = await client.query(`SELECT * FROM academic_cycles WHERE id = $1`, [id]);
    if (cycleRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, error: 'Cycle not found.' });
    }

    const cycle = cycleRes.rows[0];
    if (cycle.status === 'CLOSED') {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, error: 'This cycle is already closed.' });
    }

    // Determine top class
    const topClassRes = await client.query(
      `SELECT class_code, COALESCE(SUM(points), 0)::int as total_points, COUNT(id)::int as task_count
       FROM class_score_ledger
       WHERE cycle_id = $1
       GROUP BY class_code
       ORDER BY total_points DESC, task_count DESC, class_code ASC
       LIMIT 1`,
      [id]
    );

    const top = topClassRes.rows[0];
    const bestClassCode = top?.class_code || '01';
    const bestClassPoints = top?.total_points || 0;
    const bestClassTaskCount = top?.task_count || 0;

    await client.query(
      `UPDATE academic_cycles
       SET status = 'CLOSED',
           closed_at = CURRENT_TIMESTAMP,
           best_class_code = $1,
           best_class_points = $2,
           best_class_task_count = $3,
           notes = CASE WHEN $4 != '' THEN $4 ELSE notes END,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5`,
      [bestClassCode, bestClassPoints, bestClassTaskCount, notes, id]
    );

    // Fetch winning union info
    const unionRes = await client.query(
      `SELECT * FROM class_sangadhanakal WHERE class_code = $1`,
      [bestClassCode]
    );

    await client.query('COMMIT');

    res.json({
      success: true,
      message: `🏆 Cycle "${cycle.name}" closed! Best Class Award presented to Class ${bestClassCode} (${unionRes.rows[0]?.name || 'Batch Union'}) with ${bestClassPoints} points!`,
      data: {
        cycle_id: id,
        best_class_code: bestClassCode,
        best_class_points: bestClassPoints,
        winning_union: unionRes.rows[0] || null,
      },
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Close cycle error:', error);
    res.status(500).json({ success: false, error: 'Failed to close academic cycle.' });
  } finally {
    client.release();
  }
});

export default router;
