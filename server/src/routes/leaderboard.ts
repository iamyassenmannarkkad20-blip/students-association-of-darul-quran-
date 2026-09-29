import { Router } from 'express';
import { query } from '../db';

const router = Router();

// 1. Public Class Leaderboard (Calculated dynamically for all 8 classes)
router.get(['/', '/leaderboard'], async (_req, res) => {
  try {
    const result = await query(`
      WITH class_scores AS (
        SELECT 
          c.code as class_code,
          COALESCE(SUM(l.points), 0)::int as total_points,
          COALESCE(SUM(CASE WHEN l.source_type = 'SUB_WING_RESULT' THEN l.points ELSE 0 END), 0)::int as sub_wing_points,
          COALESCE(SUM(CASE WHEN l.source_type IN ('MAIN_COMMITTEE_TASK', 'MAIN_COMMITTEE_PROGRAM') THEN l.points ELSE 0 END), 0)::int as main_committee_points,
          COUNT(l.id)::int as entries_count
        FROM (VALUES ('01'), ('02'), ('03'), ('04'), ('05'), ('06'), ('07'), ('08')) as c(code)
        LEFT JOIN class_score_ledger l ON l.class_code = c.code
        GROUP BY c.code
      )
      SELECT 
        class_code,
        total_points,
        sub_wing_points,
        main_committee_points,
        entries_count,
        DENSE_RANK() OVER (ORDER BY total_points DESC, class_code ASC) as rank
      FROM class_scores
      ORDER BY rank ASC, class_code ASC;
    `);

    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ success: false, error: 'Failed to compute class leaderboard.' });
  }
});

// 2. Class Detail & Ledger History (/class/:code)
router.get(['/class/:code', '/leaderboard/class/:code'], async (req, res) => {
  try {
    const { code } = req.params;
    if (!['01', '02', '03', '04', '05', '06', '07', '08'].includes(code)) {
      return res.status(400).json({ success: false, error: 'Invalid class code. Must be 01 to 08.' });
    }

    // Get summary & rank
    const summaryRes = await query(
      `WITH class_scores AS (
        SELECT 
          c.code as class_code,
          COALESCE(SUM(l.points), 0)::int as total_points,
          COALESCE(SUM(CASE WHEN l.source_type = 'SUB_WING_RESULT' THEN l.points ELSE 0 END), 0)::int as sub_wing_points,
          COALESCE(SUM(CASE WHEN l.source_type IN ('MAIN_COMMITTEE_TASK', 'MAIN_COMMITTEE_PROGRAM') THEN l.points ELSE 0 END), 0)::int as main_committee_points
        FROM (VALUES ('01'), ('02'), ('03'), ('04'), ('05'), ('06'), ('07'), ('08')) as c(code)
        LEFT JOIN class_score_ledger l ON l.class_code = c.code
        GROUP BY c.code
      ),
      ranked AS (
        SELECT 
          class_code,
          total_points,
          sub_wing_points,
          main_committee_points,
          DENSE_RANK() OVER (ORDER BY total_points DESC, class_code ASC) as rank
        FROM class_scores
      )
      SELECT * FROM ranked WHERE class_code = $1`,
      [code]
    );

    // Get chronological score ledger
    const historyRes = await query(
      `SELECT 
        l.id, l.class_code, l.source_type, l.source_id, l.points, l.description, l.created_at,
        CASE 
          WHEN l.source_type = 'SUB_WING_RESULT' THEN (SELECT winner_poster_url FROM programs WHERE id = l.source_id LIMIT 1)
          WHEN l.source_type = 'MAIN_COMMITTEE_TASK' THEN (SELECT winner_poster_url FROM class_tasks WHERE id = l.source_id LIMIT 1)
          ELSE ''
        END as winner_poster_url
       FROM class_score_ledger l
       WHERE l.class_code = $1
       ORDER BY l.created_at DESC`,
      [code]
    );

    res.json({
      success: true,
      data: {
        summary: summaryRes.rows[0] || { class_code: code, total_points: 0, sub_wing_points: 0, main_committee_points: 0, rank: 8 },
        history: historyRes.rows,
      },
    });
  } catch (error) {
    console.error('Class detail error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch class details.' });
  }
});

// ==================================================
// 2B. Class 360° Comprehensive Dashboard (/class-360/:code)
// ==================================================
router.get(['/class-360/:code', '/leaderboard/class-360/:code'], async (req, res) => {
  try {
    const { code } = req.params;
    if (!['01', '02', '03', '04', '05', '06', '07', '08'].includes(code)) {
      return res.status(400).json({ success: false, error: 'Invalid class code. Must be 01 to 08.' });
    }

    const [summaryRes, activeCycleRes, unionRes, membersRes, contributorsRes, itemsRes, progressionRes, historyRes] = await Promise.all([
      // 1. Overall all-time summary & rank
      query(
        `WITH class_scores AS (
          SELECT 
            c.code as class_code,
            COALESCE(SUM(l.points), 0)::int as total_points,
            COALESCE(SUM(CASE WHEN l.source_type = 'SUB_WING_RESULT' THEN l.points ELSE 0 END), 0)::int as sub_wing_points,
            COALESCE(SUM(CASE WHEN l.source_type IN ('MAIN_COMMITTEE_TASK', 'MAIN_COMMITTEE_PROGRAM') THEN l.points ELSE 0 END), 0)::int as main_committee_points
          FROM (VALUES ('01'), ('02'), ('03'), ('04'), ('05'), ('06'), ('07'), ('08')) as c(code)
          LEFT JOIN class_score_ledger l ON l.class_code = c.code
          GROUP BY c.code
        ),
        ranked AS (
          SELECT 
            class_code, total_points, sub_wing_points, main_committee_points,
            DENSE_RANK() OVER (ORDER BY total_points DESC, class_code ASC) as rank
          FROM class_scores
        )
        SELECT * FROM ranked WHERE class_code = $1`,
        [code]
      ),

      // 2. Active cycle standings for this class
      query(
        `WITH active_scores AS (
          SELECT 
            c.code as class_code,
            COALESCE(SUM(l.points), 0)::int as cycle_points,
            DENSE_RANK() OVER (ORDER BY COALESCE(SUM(l.points), 0) DESC, c.code ASC) as cycle_rank
          FROM (VALUES ('01'), ('02'), ('03'), ('04'), ('05'), ('06'), ('07'), ('08')) as c(code)
          LEFT JOIN class_score_ledger l ON l.class_code = c.code AND l.cycle_id IN (SELECT id FROM academic_cycles WHERE status = 'ACTIVE')
          GROUP BY c.code
        )
        SELECT * FROM active_scores WHERE class_code = $1`,
        [code]
      ),

      // 3. Class Union metadata & leadership
      query(
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
        [code]
      ),

      // 4. Batch Student Members
      query(
        `SELECT 
          u.id as user_id, u.username, sp.full_name, sp.profile_slug, sp.profile_photo_url, sp.bio,
          COALESCE((SELECT SUM(pr.class_points)::int FROM program_results pr WHERE pr.student_id = u.id AND pr.status = 'PUBLISHED'), 0) as student_points,
          (SELECT COUNT(*)::int FROM certificate_records cr WHERE cr.recipient_user_id = u.id) as certificates_count,
          COALESCE(
            (SELECT json_agg(json_build_object('skill_name', ss.skill_name, 'proficiency', ss.proficiency))
             FROM student_skills ss WHERE ss.user_id = u.id),
            '[]'::json
          ) as skills
         FROM users u
         JOIN student_profiles sp ON sp.user_id = u.id
         WHERE sp.class_code = $1 AND u.is_active = TRUE
         ORDER BY sp.full_name ASC`,
        [code]
      ),

      // 5. Top Contributors in this class
      query(
        `SELECT 
          u.id as user_id, u.username, sp.full_name, sp.profile_slug, sp.profile_photo_url,
          COALESCE(SUM(pr.class_points), 0)::int as contributed_points,
          COUNT(CASE WHEN pr.position = 1 THEN 1 END)::int as gold_medals,
          COUNT(pr.id)::int as events_count
         FROM users u
         JOIN student_profiles sp ON sp.user_id = u.id
         JOIN program_results pr ON pr.student_id = u.id AND pr.status = 'PUBLISHED'
         WHERE sp.class_code = $1 AND u.is_active = TRUE
         GROUP BY u.id, u.username, sp.full_name, sp.profile_slug, sp.profile_photo_url
         ORDER BY contributed_points DESC, gold_medals DESC
         LIMIT 5`,
        [code]
      ),

      // 6. Class Union Publications (Magazines, Projects, Videos, Posters)
      query(
        `SELECT id, class_code, title, description, category, item_url, thumbnail_url, created_at
         FROM class_union_items
         WHERE class_code = $1
         ORDER BY created_at DESC`,
        [code]
      ),

      // 7. Cycle Progression History (Trajectory Graph Data)
      query(
        `SELECT 
          ac.id as cycle_id,
          ac.name as cycle_name,
          ac.academic_year,
          ac.start_date,
          ac.closed_at,
          ac.status,
          COALESCE(SUM(l.points), 0)::int as points_earned,
          COUNT(l.id)::int as task_count
         FROM academic_cycles ac
         LEFT JOIN class_score_ledger l ON l.cycle_id = ac.id AND l.class_code = $1
         GROUP BY ac.id, ac.name, ac.academic_year, ac.start_date, ac.closed_at, ac.status, ac.created_at
         ORDER BY ac.created_at ASC`,
        [code]
      ),

      // 8. Recent score ledger history
      query(
        `SELECT l.id, l.class_code, l.source_type, l.source_id, l.points, l.description, l.created_at
         FROM class_score_ledger l
         WHERE l.class_code = $1
         ORDER BY l.created_at DESC
         LIMIT 20`,
        [code]
      ),
    ]);

    res.json({
      success: true,
      data: {
        summary: summaryRes.rows[0] || { class_code: code, total_points: 0, sub_wing_points: 0, main_committee_points: 0, rank: 8 },
        active_cycle_standing: activeCycleRes.rows[0] || { class_code: code, cycle_points: 0, cycle_rank: 8 },
        union: unionRes.rows[0] || null,
        members: membersRes.rows,
        top_contributors: contributorsRes.rows,
        publications: itemsRes.rows,
        cycle_progression: progressionRes.rows,
        history: historyRes.rows,
      },
    });
  } catch (error) {
    console.error('Class 360 error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch Class 360 details.' });
  }
});

// 3. Student Individual Star Achievers Leaderboard (/students and /leaderboard/students)
router.get(['/students', '/leaderboard/students'], async (req, res) => {
  try {
    const classCode = req.query.classCode as string;
    const limit = parseInt(req.query.limit as string) || 50;

    let filterClause = '';
    const params: any[] = [];

    if (classCode && ['01', '02', '03', '04', '05', '06', '07', '08'].includes(classCode)) {
      params.push(classCode);
      filterClause += ` AND sp.class_code = $${params.length}`;
    }

    params.push(limit);

    const result = await query(
      `WITH student_scores AS (
        SELECT 
          u.id as user_id,
          u.username,
          sp.full_name,
          sp.profile_slug,
          sp.class_code,
          sp.profile_photo_url,
          COALESCE(SUM(pr.class_points), 0)::int as total_points,
          COUNT(pr.id)::int as events_count,
          COUNT(CASE WHEN pr.position = 1 THEN 1 END)::int as first_places,
          COUNT(CASE WHEN pr.position = 2 THEN 1 END)::int as second_places,
          COUNT(CASE WHEN pr.position = 3 THEN 1 END)::int as third_places,
          (SELECT COUNT(*)::int FROM certificate_records cr WHERE cr.recipient_user_id = u.id) as certificates_count
        FROM users u
        JOIN student_profiles sp ON sp.user_id = u.id
        LEFT JOIN program_results pr ON pr.student_id = u.id AND pr.status = 'PUBLISHED'
        WHERE u.is_active = TRUE AND u.username != 'sadq_admin' AND u.email != 'admin@sadq.org' ${filterClause}
        GROUP BY u.id, u.username, sp.full_name, sp.profile_slug, sp.class_code, sp.profile_photo_url
      ),
      ranked AS (
        SELECT 
          *,
          DENSE_RANK() OVER (ORDER BY total_points DESC, first_places DESC, second_places DESC, full_name ASC) as rank
        FROM student_scores
        WHERE total_points > 0 OR events_count > 0 OR certificates_count > 0
      )
      SELECT * FROM ranked
      ORDER BY rank ASC, total_points DESC, full_name ASC
      LIMIT $${params.length};`,
      params
    );

    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Fetch student leaderboard error:', error);
    res.status(500).json({ success: false, error: 'Failed to compute student leaderboard.' });
  }
});

// 4. Public Results Portal (/results)
router.get('/results', async (req, res) => {
  try {
    const { type, subwing } = req.query;

    let filterClause = '';
    const params: any[] = [];

    if (type === 'SUB_WING_PROGRAM') {
      filterClause += ` AND event_type = 'SUB_WING_PROGRAM'`;
    } else if (type === 'MAIN_COMMITTEE_TASK' || type === 'MAIN_COMMITTEE_PROGRAM') {
      filterClause += ` AND event_type IN ('MAIN_COMMITTEE_TASK', 'MAIN_COMMITTEE_PROGRAM')`;
    }

    const results = await query(`
      WITH all_results AS (
        -- Sub-Wing & Main Committee Programs
        SELECT 
          pr.id, pr.program_id as source_id, pr.student_name, pr.class_code, pr.mark, pr.position, pr.class_points,
          COALESCE(NULLIF(pr.winner_poster_url, ''), p.winner_poster_url) as winner_poster_url,
          pr.certificate_url,
          pr.certificate_id,
          pr.published_at,
          p.title as event_title, p.description as event_desc, p.program_date as event_date,
          CASE 
            WHEN p.organizer_type = 'MAIN_COMMITTEE' OR p.sub_wing_id IS NULL THEN 'MAIN_COMMITTEE_PROGRAM'
            ELSE 'SUB_WING_PROGRAM'
          END as event_type,
          CASE 
            WHEN p.organizer_type = 'MAIN_COMMITTEE' OR p.sub_wing_id IS NULL THEN 'Main Committee'
            ELSE sw.name
          END as entity_name,
          CASE 
            WHEN p.organizer_type = 'MAIN_COMMITTEE' OR p.sub_wing_id IS NULL THEN 'MC'
            ELSE sw.code
          END as entity_code
        FROM program_results pr
        JOIN programs p ON p.id = pr.program_id
        LEFT JOIN sub_wings sw ON sw.id = p.sub_wing_id
        WHERE pr.status = 'PUBLISHED'

        UNION ALL

        -- Main Committee Tasks
        SELECT 
          ctr.id, ctr.task_id as source_id, 'Class ' || ctr.class_code as student_name, ctr.class_code, ctr.mark,
          0 as position, ctr.class_points,
          COALESCE(NULLIF(ctr.winner_poster_url, ''), ct.winner_poster_url) as winner_poster_url,
          '' as certificate_url,
          NULL as certificate_id,
          ctr.published_at,
          ct.title as event_title, ct.description as event_desc, ct.task_date as event_date,
          'MAIN_COMMITTEE_TASK' as event_type,
          'Main Committee' as entity_name, 'MC' as entity_code
        FROM class_task_results ctr
        JOIN class_tasks ct ON ct.id = ctr.task_id
        WHERE ctr.status = 'PUBLISHED'
      )
      SELECT * FROM all_results
      WHERE 1=1 ${filterClause}
      ORDER BY published_at DESC NULLS LAST, event_date DESC
      LIMIT 100;
    `);

    res.json({ success: true, data: results.rows });
  } catch (error) {
    console.error('Fetch public results error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch published results.' });
  }
});

export default router;
