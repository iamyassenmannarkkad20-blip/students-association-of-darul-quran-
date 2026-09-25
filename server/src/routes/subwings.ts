import { Router } from 'express';
import { z } from 'zod';
import { query, getClient } from '../db';
import { requireAuth, RequestWithUser } from '../middleware/auth';
import { ROLES } from '../../../shared/types';

const router = Router();

// Public: Get all sub-wings
router.get('/', async (_req, res) => {
  try {
    const result = await query(`
      SELECT 
        sw.id, sw.code, sw.name, sw.description, sw.status,
        u_c.full_name as chairman_name,
        u_v.full_name as convener_name
      FROM sub_wings sw
      LEFT JOIN student_profiles u_c ON u_c.user_id = sw.chairman_id
      LEFT JOIN student_profiles u_v ON u_v.user_id = sw.convener_id
      WHERE sw.status = 'ACTIVE'
      ORDER BY sw.code ASC
    `);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Fetch subwings error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch sub-wings.' });
  }
});

// Public: Get all active scoring rules
router.get('/rules', async (_req, res) => {
  try {
    const result = await query(
      `SELECT id, name, first_points, second_points, third_points, participation_points
       FROM class_score_rules
       WHERE status = 'ACTIVE'
       ORDER BY created_at ASC`
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Fetch rules error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch scoring rules.' });
  }
});

// Authenticated Routes for Chairman / Convener / Admin
router.use(requireAuth);

// Check if user is authorized for a sub-wing
const isUserAuthorizedForSubWing = async (userId: string, userRole: string, subWingId: string) => {
  if (userRole === ROLES.SUPER_ADMIN || userRole === ROLES.ADMIN) {
    return true;
  }
  const check = await query(
    `SELECT id FROM sub_wings WHERE id = $1 AND (chairman_id = $2 OR convener_id = $2)`,
    [subWingId, userId]
  );
  return check.rows.length > 0;
};

// Get Sub-Wings where current user is Chairman or Convener (or all for Admin)
router.get('/my', async (req: RequestWithUser, res) => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;

    let result;
    if (userRole === ROLES.SUPER_ADMIN || userRole === ROLES.ADMIN) {
      result = await query(`
        SELECT 
          sw.id, sw.code, sw.name, sw.description, sw.status,
          u_c.full_name as chairman_name,
          u_v.full_name as convener_name
        FROM sub_wings sw
        LEFT JOIN student_profiles u_c ON u_c.user_id = sw.chairman_id
        LEFT JOIN student_profiles u_v ON u_v.user_id = sw.convener_id
        WHERE sw.status = 'ACTIVE'
        ORDER BY sw.code ASC
      `);
    } else {
      result = await query(`
        SELECT 
          sw.id, sw.code, sw.name, sw.description, sw.status,
          u_c.full_name as chairman_name,
          u_v.full_name as convener_name
        FROM sub_wings sw
        LEFT JOIN student_profiles u_c ON u_c.user_id = sw.chairman_id
        LEFT JOIN student_profiles u_v ON u_v.user_id = sw.convener_id
        WHERE sw.status = 'ACTIVE' AND (sw.chairman_id = $1 OR sw.convener_id = $1)
        ORDER BY sw.code ASC
      `, [userId]);
    }

    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Fetch my subwings error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch assigned sub-wings.' });
  }
});

// Get Students Directory for quick mark entry selection
router.get('/students-directory', async (_req: RequestWithUser, res) => {
  try {
    const result = await query(
      `SELECT sp.user_id, sp.full_name, sp.class_code, sp.profile_slug, u.username, u.email
       FROM student_profiles sp
       JOIN users u ON u.id = sp.user_id
       WHERE u.is_active = TRUE
       ORDER BY sp.class_code ASC, sp.full_name ASC`
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Fetch students directory error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch students directory.' });
  }
});

// List programs for a specific sub-wing
router.get('/:subWingId/programs', async (req: RequestWithUser, res) => {
  try {
    const { subWingId } = req.params;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const authorized = await isUserAuthorizedForSubWing(userId, userRole, subWingId);
    if (!authorized) {
      return res.status(403).json({ success: false, error: 'You are not authorized to access this Sub-Wing.' });
    }

    const result = await query(
      `SELECT 
        p.*,
        r.name as score_rule_name,
        r.first_points, r.second_points, r.third_points, r.participation_points,
        (SELECT COUNT(*)::int FROM program_results pr WHERE pr.program_id = p.id) as participants_count
       FROM programs p
       LEFT JOIN class_score_rules r ON r.id = p.score_rule_id
       WHERE p.sub_wing_id = $1
       ORDER BY p.program_date DESC, p.created_at DESC`,
      [subWingId]
    );

    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Fetch programs error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch programs.' });
  }
});

// Create a new offline program for a sub-wing
router.post('/:subWingId/programs', async (req: RequestWithUser, res) => {
  try {
    const { subWingId } = req.params;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const authorized = await isUserAuthorizedForSubWing(userId, userRole, subWingId);
    if (!authorized) {
      return res.status(403).json({ success: false, error: 'You are not authorized for this Sub-Wing.' });
    }

    const schema = z.object({
      title: z.string().min(2),
      description: z.string().optional().default(''),
      program_date: z.string().optional().default(new Date().toISOString().split('T')[0]),
      maximum_mark: z.number().positive().default(20),
      score_rule_id: z.string().uuid().optional(),
      winner_poster_url: z.string().optional().default(''),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: parsed.error.issues[0]?.message || 'Invalid input' });
    }

    const d = parsed.data;

    // Pick first score rule if not specified
    let ruleId = d.score_rule_id;
    if (!ruleId) {
      const defaultRule = await query('SELECT id FROM class_score_rules LIMIT 1');
      ruleId = defaultRule.rows[0]?.id;
    }

    const insertRes = await query(
      `INSERT INTO programs (sub_wing_id, title, description, program_date, maximum_mark, score_rule_id, winner_poster_url, created_by, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'DRAFT')
       RETURNING *`,
      [subWingId, d.title, d.description, d.program_date, d.maximum_mark, ruleId, d.winner_poster_url, userId]
    );

    res.json({ success: true, data: insertRes.rows[0], message: 'Program created successfully.' });
  } catch (error) {
    console.error('Create program error:', error);
    res.status(500).json({ success: false, error: 'Failed to create program.' });
  }
});

// Get program details & entered student results
router.get('/programs/:programId', async (req: RequestWithUser, res) => {
  try {
    const { programId } = req.params;
    const progRes = await query(
      `SELECT p.*, sw.name as sub_wing_name, sw.code as sub_wing_code,
              r.first_points, r.second_points, r.third_points, r.participation_points
       FROM programs p
       JOIN sub_wings sw ON sw.id = p.sub_wing_id
       LEFT JOIN class_score_rules r ON r.id = p.score_rule_id
       WHERE p.id = $1`,
      [programId]
    );

    if (progRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Program not found.' });
    }

    const resultsRes = await query(
      `SELECT * FROM program_results WHERE program_id = $1 ORDER BY position ASC, mark DESC`,
      [programId]
    );

    res.json({
      success: true,
      data: {
        program: progRes.rows[0],
        results: resultsRes.rows,
      },
    });
  } catch (error) {
    console.error('Get program details error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch program details.' });
  }
});

// Save / update student marks & auto-compute positions and class points
router.post('/programs/:programId/results', async (req: RequestWithUser, res) => {
  try {
    const { programId } = req.params;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    // Check program and authorization
    const progRes = await query(
      `SELECT p.*, r.first_points, r.second_points, r.third_points, r.participation_points
       FROM programs p
       LEFT JOIN class_score_rules r ON r.id = p.score_rule_id
       WHERE p.id = $1`,
      [programId]
    );

    if (progRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Program not found.' });
    }

    const program = progRes.rows[0];
    const authorized = await isUserAuthorizedForSubWing(userId, userRole, program.sub_wing_id);
    if (!authorized) {
      return res.status(403).json({ success: false, error: 'Not authorized for this Sub-Wing.' });
    }

    const participantSchema = z.object({
      student_name: z.string().min(1),
      student_id: z.string().uuid().optional().nullable(),
      class_code: z.enum(['01', '02', '03', '04', '05', '06', '07', '08']),
      mark: z.number().min(0),
      winner_poster_url: z.string().optional().default(''),
      certificate_url: z.string().optional().default(''),
    });

    const bodySchema = z.object({
      participants: z.array(participantSchema),
      winner_poster_url: z.string().optional(),
    });

    const parsed = bodySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: parsed.error.issues[0]?.message || 'Invalid input' });
    }

    const { participants, winner_poster_url } = parsed.data;

    // 1. Sort participants by mark DESC
    const sorted = [...participants].sort((a, b) => b.mark - a.mark);

    // 2. Assign positions & calculate class points
    const firstPts = program.first_points ?? 10;
    const secondPts = program.second_points ?? 7;
    const thirdPts = program.third_points ?? 5;
    const partPts = program.participation_points ?? 1;

    const calculated = sorted.map((p, idx) => {
      let position = 0;
      let points = partPts;
      if (idx === 0) {
        position = 1;
        points = firstPts;
      } else if (idx === 1) {
        position = 2;
        points = secondPts;
      } else if (idx === 2) {
        position = 3;
        points = thirdPts;
      }
      return { ...p, position, class_points: points };
    });

    // 3. Save into database
    await query('DELETE FROM program_results WHERE program_id = $1', [programId]);

    for (const p of calculated) {
      await query(
        `INSERT INTO program_results (program_id, student_id, student_name, class_code, mark, position, class_points, winner_poster_url, certificate_url, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          programId,
          p.student_id || null,
          p.student_name,
          p.class_code,
          p.mark,
          p.position,
          p.class_points,
          p.winner_poster_url || winner_poster_url || '',
          p.certificate_url || '',
          program.status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT',
        ]
      );
    }

    if (winner_poster_url !== undefined) {
      await query('UPDATE programs SET winner_poster_url = $1 WHERE id = $2', [winner_poster_url, programId]);
    }

    res.json({
      success: true,
      data: calculated,
      message: 'Marks recorded! Positions and class points auto-calculated.',
    });
  } catch (error) {
    console.error('Save results error:', error);
    res.status(500).json({ success: false, error: 'Failed to save student results.' });
  }
});

// PUBLISH PROGRAM RESULTS (Atomic Transaction + Double-Count Protection via Ledger)
router.post('/programs/:programId/publish', async (req: RequestWithUser, res) => {
  const client = await getClient();
  try {
    const { programId } = req.params;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const progRes = await client.query(
      `SELECT p.*, sw.name as sub_wing_name
       FROM programs p
       JOIN sub_wings sw ON sw.id = p.sub_wing_id
       WHERE p.id = $1`,
      [programId]
    );

    if (progRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Program not found.' });
    }

    const program = progRes.rows[0];
    const authorized = await isUserAuthorizedForSubWing(userId, userRole, program.sub_wing_id);
    if (!authorized) {
      return res.status(403).json({ success: false, error: 'Not authorized for this Sub-Wing.' });
    }

    await client.query('BEGIN');

    // 1. Update program status
    await client.query(
      `UPDATE programs 
       SET status = 'PUBLISHED', published_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [programId]
    );

    // 2. Update all program results to PUBLISHED
    await client.query(
      `UPDATE program_results
       SET status = 'PUBLISHED', published_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE program_id = $1`,
      [programId]
    );

    // 3. Clear existing score ledger entries for this program (Double-count protection)
    await client.query(
      `DELETE FROM class_score_ledger 
       WHERE source_type = 'SUB_WING_RESULT' AND source_id = $1`,
      [programId]
    );

    // 4. Insert new entries into class_score_ledger for each winner/participant with points > 0
    const results = await client.query(
      `SELECT * FROM program_results WHERE program_id = $1 AND class_points > 0`,
      [programId]
    );

    for (const r of results.rows) {
      const positionLabel = r.position === 1 ? '1st Place' : r.position === 2 ? '2nd Place' : r.position === 3 ? '3rd Place' : 'Participant';
      const desc = `${program.title} (${program.sub_wing_name}) — ${r.student_name} (${positionLabel})`;

      await client.query(
        `INSERT INTO class_score_ledger (class_code, source_type, source_id, points, description)
         VALUES ($1, 'SUB_WING_RESULT', $2, $3, $4)`,
        [r.class_code, programId, r.class_points, desc]
      );

      // Auto-issue verified certificate record if certificate_url is attached
      if (r.certificate_url && r.certificate_url.trim().length > 0) {
        const certId = r.certificate_id || `SADQ-2026-CERT-${r.id.substring(0, 8).toUpperCase()}`;
        const certTitle = `${program.title} — ${positionLabel}`;
        const issuerName = program.sub_wing_name || 'Darul Quran SADQ';

        await client.query(
          `INSERT INTO certificate_records (certificate_id, recipient_name, recipient_user_id, title, issue_date, issuer, verification_status, external_reference_url, program_id, position, class_code)
           VALUES ($1, $2, $3, $4, CURRENT_DATE, $5, 'VERIFIED', $6, $7, $8, $9)
           ON CONFLICT (certificate_id) DO UPDATE
           SET external_reference_url = EXCLUDED.external_reference_url,
               recipient_user_id = EXCLUDED.recipient_user_id,
               title = EXCLUDED.title`,
          [certId, r.student_name, r.student_id || null, certTitle, issuerName, r.certificate_url, programId, r.position, r.class_code]
        );

        await client.query(
          `UPDATE program_results SET certificate_id = $1 WHERE id = $2`,
          [certId, r.id]
        );
      }
    }

    await client.query('COMMIT');

    res.json({
      success: true,
      message: '✅ Program results published! Class scores and leaderboard updated live.',
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Publish program error:', error);
    res.status(500).json({ success: false, error: 'Failed to publish program results.' });
  } finally {
    client.release();
  }
});

export default router;
