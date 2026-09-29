import { Router } from 'express';
import { query } from '../db';

const router = Router();

// Public Site Config (Socials, channels_confirmed = false)
router.get('/config', async (_req, res) => {
  try {
    const result = await query('SELECT * FROM public_site_config WHERE id = 1');
    const config = result.rows[0] || {
      instagram_url: 'https://www.instagram.com/sadq__official/',
      youtube_url: 'https://www.youtube.com/@sadqofficialmedia',
      channels_confirmed: false,
      official_email: 'sadqofficial@gmail.com',
      official_whatsapp: '',
    };
    res.json({ success: true, data: config });
  } catch (error) {
    console.error('Fetch config error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch public configuration.' });
  }
});

// Official 10 Units
router.get('/units', async (_req, res) => {
  try {
    const result = await query(
      `SELECT code, name, description FROM organisation_units ORDER BY code ASC`
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Fetch units error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch organisation units.' });
  }
});

// All Enrolled Students Directory (with points, medals, talents & class filters)
router.get('/students', async (req, res) => {
  try {
    const classCode = req.query.class_code ? String(req.query.class_code).trim() : null;
    const search = req.query.search ? String(req.query.search).toLowerCase().trim() : null;

    let conditions = ["u.is_active = TRUE", "sp.is_public = TRUE"];
    const params: any[] = [];

    if (classCode && classCode !== 'ALL') {
      params.push(classCode);
      conditions.push(`sp.class_code = $${params.length}`);
    }

    if (search) {
      params.push(`%${search}%`);
      const pIdx = params.length;
      conditions.push(
        `(LOWER(sp.full_name) LIKE $${pIdx} OR LOWER(u.username) LIKE $${pIdx} OR EXISTS (SELECT 1 FROM student_talents st WHERE st.user_id = u.id AND LOWER(st.title) LIKE $${pIdx}))`
      );
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const sql = `
      SELECT 
        u.id as user_id,
        u.username,
        sp.full_name,
        sp.profile_slug,
        sp.class_code,
        sp.bio,
        sp.profile_photo_url,
        COALESCE(SUM(pr.class_points), 0)::int as total_points,
        COUNT(CASE WHEN pr.position = 1 THEN 1 END)::int as gold_medals,
        COUNT(CASE WHEN pr.position = 2 THEN 1 END)::int as silver_medals,
        COUNT(CASE WHEN pr.position = 3 THEN 1 END)::int as bronze_medals,
        (SELECT COUNT(*)::int FROM certificate_records cr WHERE cr.recipient_user_id = u.id AND cr.verification_status = 'VERIFIED') as verified_certs,
        (SELECT om.designation FROM organisation_memberships om WHERE om.user_id = u.id AND om.is_leadership = TRUE AND om.is_active = TRUE LIMIT 1) as leadership_role,
        (SELECT COALESCE(json_agg(json_build_object('title', st.title, 'category', st.category)), '[]'::json) FROM student_talents st WHERE st.user_id = u.id AND st.status = 'PUBLISHED') as talents
      FROM users u
      JOIN student_profiles sp ON sp.user_id = u.id
      LEFT JOIN program_results pr ON pr.student_id = u.id AND pr.status = 'PUBLISHED'
      ${whereClause}
      GROUP BY u.id, u.username, sp.full_name, sp.profile_slug, sp.class_code, sp.bio, sp.profile_photo_url
      ORDER BY total_points DESC, sp.class_code ASC, sp.full_name ASC
    `;

    const result = await query(sql, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Fetch students directory error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch students directory.' });
  }
});

// Official SADQ Executive Committee (Apex Leaders)
router.get('/committee', async (_req, res) => {
  try {
    const result = await query(
      `SELECT id, name, designation, photo_url, order_index, bio, phone, email
       FROM executive_committee
       WHERE is_active = TRUE
       ORDER BY order_index ASC, created_at ASC`
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Fetch committee error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch executive committee.' });
  }
});

// Public Magazines
router.get('/magazines', async (_req, res) => {
  try {
    const result = await query(
      `SELECT id, title, slug, issue, description, cover_image_url, pdf_url, issuu_url,
              publication_date, page_count
       FROM magazines
       WHERE status = 'PUBLISHED' AND visibility = 'PUBLIC'
       ORDER BY publication_date DESC, created_at DESC`
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Fetch magazines error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch magazines.' });
  }
});

// Public Library Resources
router.get('/library', async (_req, res) => {
  try {
    const result = await query(
      `SELECT id, title, author, publisher, category, resource_type, external_url, downloadable
       FROM library_resources
       WHERE status = 'PUBLISHED'
       ORDER BY created_at DESC`
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Fetch library error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch library resources.' });
  }
});

// Public Media Items
router.get('/media', async (_req, res) => {
  try {
    const result = await query(
      `SELECT id, title, description, media_type, media_url, category, created_at
       FROM media_items
       WHERE status = 'PUBLISHED'
       ORDER BY created_at DESC`
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Fetch media error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch media items.' });
  }
});

// Public Events
router.get('/events', async (_req, res) => {
  try {
    const result = await query(
      `SELECT id, title, description, event_date, event_time, venue, is_online, category
       FROM events
       WHERE status = 'PUBLISHED' AND visibility = 'PUBLIC'
       ORDER BY event_date ASC`
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Fetch events error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch events.' });
  }
});

// Opportunities (Jobs/Internships)
router.get('/opportunities', async (_req, res) => {
  try {
    const result = await query(
      `SELECT id, title, provider, description, category, contact_email, contact_whatsapp,
              external_link, created_at
       FROM opportunities
       WHERE status = 'PUBLISHED' AND visibility = 'PUBLIC'
       ORDER BY created_at DESC`
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Fetch opportunities error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch opportunities.' });
  }
});

// Services
router.get('/services', async (_req, res) => {
  try {
    const result = await query(
      `SELECT s.id, s.title, s.description, s.category, s.contact_whatsapp, s.contact_email,
              s.external_link, p.full_name as provider_name
       FROM service_listings s
       JOIN student_profiles p ON p.user_id = s.provider_id
       WHERE s.status = 'PUBLISHED'
       ORDER BY s.created_at DESC`
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Fetch services error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch services.' });
  }
});

// Marketplace (Discovery + Contact)
router.get('/marketplace', async (_req, res) => {
  try {
    const result = await query(
      `SELECT m.id, m.title, m.description, m.category, m.image_url, m.contact_whatsapp,
              m.contact_email, p.full_name as seller_name
       FROM marketplace_items m
       JOIN student_profiles p ON p.user_id = m.seller_id
       WHERE m.status = 'PUBLISHED'
       ORDER BY m.created_at DESC`
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Fetch marketplace error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch marketplace items.' });
  }
});

// Certificate Verification
router.get('/certificates/:id', async (req, res) => {
  try {
    const result = await query(
      `SELECT certificate_id, recipient_name, title, issue_date, issuer, verification_status,
              external_reference_url
       FROM certificate_records
       WHERE certificate_id = $1`,
      [req.params.id.trim()]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Certificate record not found.' });
      return;
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Fetch certificate error:', error);
    res.status(500).json({ success: false, error: 'Certificate verification failed.' });
  }
});

// Student Public Portfolio & 360° Profile (/portfolio/:slug & /student-360/:slug)
router.get(['/portfolio/:slug', '/student-360/:slug'], async (req, res) => {
  try {
    const slug = req.params.slug.trim().toLowerCase();
    const profileRes = await query(
      `SELECT user_id, full_name, profile_slug, bio, class_code, interests,
              profile_photo_url, cover_photo_url, whatsapp_number, email_contact,
              instagram_handle, phone_number, website_url,
              is_public, show_email, show_whatsapp, show_instagram, show_talents, show_skills,
              show_achievements, show_projects, show_organisation
       FROM student_profiles
       WHERE LOWER(profile_slug) = $1`,
      [slug]
    );

    if (profileRes.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Portfolio profile not found.' });
      return;
    }

    const p = profileRes.rows[0];

    // Privacy Check: if not public, check owner or admin session
    let isOwnerView = false;
    if (!p.is_public) {
      const sessionId = req.cookies?.sadq_session;
      if (sessionId) {
        try {
          const sessionRes = await query(
            `SELECT s.id, u.id as user_id, u.role
             FROM sessions s
             JOIN users u ON s.user_id = u.id
             WHERE s.id = $1 AND s.expires_at > CURRENT_TIMESTAMP AND u.is_active = TRUE`,
            [sessionId]
          );
          if (sessionRes.rows.length > 0) {
            const sessionUser = sessionRes.rows[0];
            if (
              sessionUser.user_id === p.user_id ||
              sessionUser.role === 'ADMIN' ||
              sessionUser.role === 'SUPER_ADMIN'
            ) {
              isOwnerView = true;
            }
          }
        } catch (err) {
          console.error('Session validation error in portfolio preview:', err);
        }
      }

      if (!isOwnerView) {
        res.status(403).json({
          success: false,
          error: 'This student profile is currently set to private.',
        });
        return;
      }
    }

    const userId = p.user_id;

    // Conditionally query related items based on student privacy preferences
    let talents: any[] = [];
    if (p.show_talents) {
      const tRes = await query(
        `SELECT id, title, category, description FROM student_talents
         WHERE user_id = $1 AND status = 'PUBLISHED' AND visibility = 'PUBLIC'`,
        [userId]
      );
      talents = tRes.rows;
    }

    let skills: any[] = [];
    if (p.show_skills) {
      const sRes = await query(
        `SELECT id, skill_name, proficiency FROM student_skills WHERE user_id = $1`,
        [userId]
      );
      skills = sRes.rows;
    }

    let achievements: any[] = [];
    if (p.show_achievements) {
      const aRes = await query(
        `SELECT id, title, description, category, achievement_date, issuer FROM student_achievements
         WHERE user_id = $1 AND visibility = 'PUBLIC'`,
        [userId]
      );
      achievements = aRes.rows;
    }

    let projects: any[] = [];
    if (p.show_projects) {
      const prRes = await query(
        `SELECT p.id, p.title, p.description, p.category, p.status, p.project_url, p.unit_code
         FROM projects p
         WHERE (p.owner_id = $1 OR p.id IN (SELECT project_id FROM project_members WHERE user_id = $1))
           AND p.visibility = 'PUBLIC'`,
        [userId]
      );
      projects = prRes.rows;
    }

    let organisation: any[] = [];
    if (p.show_organisation) {
      const orgRes = await query(
        `SELECT m.designation, m.is_leadership, m.joined_date, u.name as unit_name, u.code as unit_code
         FROM organisation_memberships m
         JOIN organisation_units u ON u.code = m.unit_code
         WHERE m.user_id = $1 AND m.is_active = TRUE`,
        [userId]
      );
      organisation = orgRes.rows;
    }

    // Score, Honors & Verified Certificates
    const [scoreRes, honorsRes, certsRes] = await Promise.all([
      query(
        `WITH all_scores AS (
          SELECT 
            u.id as user_id,
            COALESCE(SUM(pr.class_points), 0)::int as total_points,
            COUNT(pr.id)::int as events_count,
            COUNT(CASE WHEN pr.position = 1 THEN 1 END)::int as first_places,
            COUNT(CASE WHEN pr.position = 2 THEN 1 END)::int as second_places,
            COUNT(CASE WHEN pr.position = 3 THEN 1 END)::int as third_places,
            DENSE_RANK() OVER (ORDER BY COALESCE(SUM(pr.class_points), 0) DESC, COUNT(CASE WHEN pr.position = 1 THEN 1 END) DESC) as rank
          FROM users u
          LEFT JOIN program_results pr ON pr.student_id = u.id AND pr.status = 'PUBLISHED'
          WHERE u.is_active = TRUE
          GROUP BY u.id
        )
        SELECT * FROM all_scores WHERE user_id = $1`,
        [userId]
      ),
      query(
        `SELECT pr.id, pr.mark, pr.position, pr.class_points, pr.winner_poster_url, pr.published_at,
                p.title as event_title, p.program_date,
                CASE WHEN p.organizer_type = 'MAIN_COMMITTEE' OR p.sub_wing_id IS NULL THEN 'Main Committee' ELSE sw.name END as organizer_name
         FROM program_results pr
         JOIN programs p ON p.id = pr.program_id
         LEFT JOIN sub_wings sw ON sw.id = p.sub_wing_id
         WHERE pr.student_id = $1 AND pr.status = 'PUBLISHED'
         ORDER BY pr.published_at DESC, p.program_date DESC`,
        [userId]
      ),
      query(
        `SELECT certificate_id, title, issue_date, issuer, verification_status, external_reference_url, position
         FROM certificate_records
         WHERE recipient_user_id = $1
         ORDER BY issue_date DESC, created_at DESC`,
        [userId]
      ),
    ]);

    // Fetch Leadership roles in Sub-Wings, Class Unions, & Historic Leadership
    const [wingLeadershipRes, unionLeadershipRes, postsRes, leadHistoryRes] = await Promise.all([
      query(
        `SELECT sw.code, sw.name, sw.created_at,
                CASE WHEN sw.chairman_id = $1 THEN 'Chairman'
                     WHEN sw.convener_id = $1 THEN 'Convener'
                     ELSE 'Member' END as role
         FROM sub_wings sw
         WHERE sw.chairman_id = $1 OR sw.convener_id = $1`,
        [userId]
      ),
      query(
        `SELECT u.class_code, u.name, u.created_at,
                CASE WHEN u.chairman_id = $1 THEN 'Chairman'
                     WHEN u.convener_id = $1 THEN 'Convener'
                     ELSE 'Leader' END as role
         FROM class_sangadhanakal u
         WHERE u.chairman_id = $1 OR u.convener_id = $1`,
        [userId]
      ),
      query(
        `SELECT id, title, created_at
         FROM community_posts
         WHERE author_id = $1 AND status = 'PUBLISHED'
         ORDER BY created_at DESC`,
        [userId]
      ),
      query(
        `SELECT id, role_title, entity_type, entity_name, term_year, is_current, citation, created_at
         FROM leadership_history
         WHERE user_id = $1
         ORDER BY term_year DESC, created_at DESC`,
        [userId]
      ),
    ]);

    // Synthesize Chronological Student Growth Timeline
    type TimelineEvent = {
      id: string;
      type: 'ENROLLMENT' | 'LEADERSHIP' | 'COMPETITION' | 'CERTIFICATE' | 'PROJECT' | 'ARTICLE' | 'ACHIEVEMENT';
      title: string;
      description?: string;
      date: string;
      badge?: string;
      link?: string;
      points?: number;
    };

    const timelineEvents: TimelineEvent[] = [];

    // 1. Enrollment
    if (p.created_at) {
      timelineEvents.push({
        id: `enrollment-${userId}`,
        type: 'ENROLLMENT',
        title: 'Joined SADQ Student Academy',
        description: `Enrolled in Class ${p.class_code || 'General'}`,
        date: new Date(p.created_at).toISOString(),
        badge: p.class_code === 'ALUMNI' ? 'Graduated Alumni' : `Class ${p.class_code}`,
      });
    }

    // 2. Class Union Appointments
    unionLeadershipRes.rows.forEach((ul: any) => {
      timelineEvents.push({
        id: `union-${ul.class_code}`,
        type: 'LEADERSHIP',
        title: `Appointed ${ul.role} of ${ul.name}`,
        description: `Official batch representation and leadership for Class ${ul.class_code}`,
        date: new Date(ul.created_at || p.created_at || Date.now()).toISOString(),
        badge: `Class ${ul.class_code} Union`,
      });
    });

    // 3. Sub-Wing Appointments
    wingLeadershipRes.rows.forEach((wl: any) => {
      timelineEvents.push({
        id: `wing-${wl.code}`,
        type: 'LEADERSHIP',
        title: `Appointed ${wl.role} of ${wl.name}`,
        description: `Institutional leadership for official unit (${wl.code})`,
        date: new Date(wl.created_at || p.created_at || Date.now()).toISOString(),
        badge: `${wl.code} Wing`,
      });
    });

    // 4. Competition Results
    honorsRes.rows.forEach((h: any) => {
      const posLabel = h.position === 1 ? '🥇 1st Place Champion' : h.position === 2 ? '🥈 2nd Place Runner-Up' : h.position === 3 ? '🥉 3rd Place Honor' : 'Participant';
      timelineEvents.push({
        id: `honor-${h.id}`,
        type: 'COMPETITION',
        title: `${posLabel}: ${h.event_title}`,
        description: `Awarded ${h.class_points} points for Class ${p.class_code} by ${h.organizer_name}`,
        date: new Date(h.published_at || h.program_date || Date.now()).toISOString(),
        badge: `+${h.class_points} pts`,
        points: h.class_points,
      });
    });

    // 5. Verified Certificates
    certsRes.rows.forEach((c: any) => {
      timelineEvents.push({
        id: `cert-${c.certificate_id}`,
        type: 'CERTIFICATE',
        title: `Issued Verified Certificate: ${c.title}`,
        description: `Officially certified by ${c.issuer} (${c.certificate_id})`,
        date: new Date(c.issue_date || Date.now()).toISOString(),
        badge: 'Verified Credential',
        link: c.external_reference_url,
      });
    });

    // 6. Projects
    projects.forEach((proj: any) => {
      timelineEvents.push({
        id: `proj-${proj.id}`,
        type: 'PROJECT',
        title: `Launched Project: ${proj.title}`,
        description: proj.description?.slice(0, 120),
        date: new Date(proj.created_at || Date.now()).toISOString(),
        badge: proj.category || 'Initiative',
        link: proj.project_url,
      });
    });

    // 7. Community Articles
    postsRes.rows.forEach((post: any) => {
      timelineEvents.push({
        id: `post-${post.id}`,
        type: 'ARTICLE',
        title: `Published Article: ${post.title}`,
        description: 'Published in SADQ Community Discourse',
        date: new Date(post.created_at).toISOString(),
        badge: 'Editorial',
      });
    });

    // 8. Achievements
    achievements.forEach((ach: any) => {
      timelineEvents.push({
        id: `ach-${ach.id}`,
        type: 'ACHIEVEMENT',
        title: ach.title,
        description: ach.description || ach.issuer,
        date: new Date(ach.achievement_date || ach.created_at || Date.now()).toISOString(),
        badge: ach.category || 'Achievement',
      });
    });

    // 9. Official Leadership Journey Milestones
    leadHistoryRes.rows.forEach((lh: any) => {
      timelineEvents.push({
        id: `lh-${lh.id}`,
        type: 'LEADERSHIP',
        title: `${lh.role_title} (${lh.entity_name})`,
        description: lh.citation || `Academic Term: ${lh.term_year || 'Active'}`,
        date: new Date(lh.created_at).toISOString(),
        badge: lh.entity_type.replace('_', ' '),
      });
    });

    // Sort timeline descending (most recent first)
    timelineEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Filter contact info based on privacy toggles
    const sanitizedProfile = {
      fullName: p.full_name,
      profileSlug: p.profile_slug,
      bio: p.bio,
      classCode: p.class_code,
      interests: p.interests,
      profilePhotoUrl: p.profile_photo_url,
      coverPhotoUrl: p.cover_photo_url,
      emailContact: p.show_email ? p.email_contact : null,
      whatsappNumber: p.show_whatsapp ? p.whatsapp_number : null,
      instagramHandle: p.show_instagram ? p.instagram_handle : null,
      graduationYear: p.graduation_year,
      leadershipRoles: [
        ...unionLeadershipRes.rows.map((ul: any) => ({
          type: 'CLASS_UNION',
          role: ul.role,
          title: `${ul.role} - ${ul.name}`,
          classCode: ul.class_code,
        })),
        ...wingLeadershipRes.rows.map((wl: any) => ({
          type: 'SUB_WING',
          role: wl.role,
          title: `${wl.role} - ${wl.name}`,
          wingCode: wl.code,
        })),
        ...leadHistoryRes.rows.map((lh: any) => ({
          type: lh.entity_type,
          role: lh.role_title,
          title: `${lh.role_title} - ${lh.entity_name} (${lh.term_year})`,
          isCurrent: lh.is_current,
        })),
      ],
    };

    res.json({
      success: true,
      is_owner_view: isOwnerView,
      data: {
        profile: sanitizedProfile,
        score: scoreRes.rows[0] || { total_points: 0, events_count: 0, first_places: 0, second_places: 0, third_places: 0, rank: 0 },
        honors: honorsRes.rows,
        certificates: certsRes.rows,
        talents,
        skills,
        achievements,
        projects,
        organisation,
        growth_timeline: timelineEvents,
        leadership_history: leadHistoryRes.rows,
        is_owner_view: isOwnerView,
      },
    });
  } catch (error) {
    console.error('Fetch portfolio error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch student portfolio.' });
  }
});

// Public Students Directory for Talent Discovery (/explore)
router.get('/students', async (req, res) => {
  try {
    const talent = req.query.talent as string;
    const classCode = req.query.classCode as string;
    const search = req.query.search as string;

    let queryStr = `
      SELECT sp.id, sp.user_id, sp.full_name, sp.profile_slug, sp.class_code,
             sp.bio, sp.profile_photo_url, sp.interests,
             u.username,
             sp.show_whatsapp,
             sp.show_email,
             sp.show_instagram,
             CASE WHEN sp.show_whatsapp THEN sp.whatsapp_number ELSE NULL END as whatsapp_number,
             CASE WHEN sp.show_email THEN sp.email_contact ELSE NULL END as email_contact,
             CASE WHEN sp.show_instagram THEN sp.instagram_handle ELSE NULL END as instagram_handle,
             CASE WHEN sp.show_talents THEN
               COALESCE(
                 (SELECT json_agg(json_build_object('id', st.id, 'title', st.title, 'category', st.category))
                  FROM student_talents st
                  WHERE st.user_id = sp.user_id AND st.visibility IN ('COMMUNITY', 'PUBLIC')),
                 '[]'::json
               )
             ELSE '[]'::json END as talents,
             CASE WHEN sp.show_skills THEN
               COALESCE(
                 (SELECT json_agg(json_build_object('id', ss.id, 'name', ss.skill_name, 'skill_name', ss.skill_name, 'proficiency', ss.proficiency))
                  FROM student_skills ss
                  WHERE ss.user_id = sp.user_id),
                 '[]'::json
               )
             ELSE '[]'::json END as skills,
             COALESCE(
               (SELECT json_agg(json_build_object('unit_code', om.unit_code, 'unit_name', ou.name, 'designation', om.designation, 'is_leadership', om.is_leadership))
                FROM organisation_memberships om
                JOIN organisation_units ou ON ou.code = om.unit_code
                WHERE om.user_id = sp.user_id AND om.is_active = TRUE),
               '[]'::json
             ) as units,
             COALESCE(
               (SELECT json_agg(json_build_object('code', sw.code, 'name', sw.name, 'role',
                  CASE WHEN sw.chairman_id = sp.user_id THEN 'Chairman'
                       WHEN sw.convener_id = sp.user_id THEN 'Convener'
                       ELSE 'Leader' END))
                FROM sub_wings sw
                WHERE sw.chairman_id = sp.user_id OR sw.convener_id = sp.user_id),
               '[]'::json
             ) as sub_wings_leadership
      FROM student_profiles sp
      JOIN users u ON u.id = sp.user_id
      WHERE sp.is_public = TRUE AND u.is_active = TRUE
    `;
    const params: any[] = [];

    if (classCode) {
      params.push(classCode);
      queryStr += ` AND sp.class_code = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      queryStr += ` AND (sp.full_name ILIKE $${params.length} OR sp.bio ILIKE $${params.length} OR u.username ILIKE $${params.length})`;
    }

    queryStr += ` ORDER BY sp.full_name ASC LIMIT 50`;

    const result = await query(queryStr, params);

    let rows = result.rows;
    if (talent) {
      const q = talent.toLowerCase();
      rows = rows.filter((s: any) =>
        (s.talents &&
          s.talents.some(
            (t: any) =>
              t.title.toLowerCase().includes(q) ||
              (t.category && t.category.toLowerCase().includes(q))
          )) ||
        (s.skills &&
          s.skills.some(
            (sk: any) =>
              sk.name.toLowerCase().includes(q) ||
              (sk.category && sk.category.toLowerCase().includes(q))
          ))
      );
    }

    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Fetch public students error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch student directory.' });
  }
});

// ==================================================
// Public Alumni Directory (Graduated Scholars)
// ==================================================
router.get('/alumni', async (_req, res) => {
  try {
    const result = await query(`
      SELECT 
        u.id as user_id,
        u.username,
        sp.full_name,
        sp.profile_slug,
        sp.profile_photo_url,
        sp.graduation_year,
        sp.bio,
        COALESCE(
          (SELECT json_agg(json_build_object('skill_name', sk.skill_name, 'proficiency', sk.proficiency))
           FROM student_skills sk
           WHERE sk.user_id = u.id),
          '[]'::json
        ) as skills,
        COALESCE(
          (SELECT json_agg(json_build_object('title', t.title, 'category', t.category))
           FROM student_talents t
           WHERE t.user_id = u.id),
          '[]'::json
        ) as talents,
        (SELECT COUNT(*)::int FROM certificate_records cr WHERE cr.recipient_user_id = u.id) as certificates_count,
        COALESCE(
          (SELECT SUM(pr.class_points)::int FROM program_results pr WHERE pr.student_id = u.id AND pr.status = 'PUBLISHED'),
          0
        ) as lifetime_points
      FROM users u
      JOIN student_profiles sp ON sp.user_id = u.id
      WHERE sp.class_code = 'ALUMNI' AND u.is_active = TRUE
      ORDER BY sp.graduation_year DESC NULLS LAST, sp.full_name ASC;
    `);

    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Fetch alumni directory error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch alumni directory.' });
  }
});

// ==================================================
// Data-Driven SADQ Homepage Pulse (/home-pulse)
// ==================================================
router.get('/home-pulse', async (_req, res) => {
  try {
    const [cycleRes, championRes, resultsRes, publicationsRes, starRes] = await Promise.all([
      // Active cycle
      query(
        `SELECT id, name, academic_year, start_date, target_leave_date, status, notes
         FROM academic_cycles
         WHERE status = 'ACTIVE'
         ORDER BY created_at DESC LIMIT 1`
      ),
      // Defending champion from most recently closed cycle
      query(
        `SELECT ac.id, ac.name as cycle_name, ac.best_class_code, ac.best_class_points, ac.closed_at,
                u.name as union_name, u.motto as union_motto, u.logo_url as union_logo_url
         FROM academic_cycles ac
         LEFT JOIN class_sangadhanakal u ON u.class_code = ac.best_class_code
         WHERE ac.status = 'CLOSED' AND ac.best_class_code IS NOT NULL
         ORDER BY ac.closed_at DESC LIMIT 1`
      ),
      // Latest 3 published program results
      query(
        `SELECT pr.id, pr.student_name, pr.class_code, pr.mark, pr.position, pr.class_points,
                pr.published_at, p.title as event_title,
                CASE WHEN p.organizer_type = 'MAIN_COMMITTEE' OR p.sub_wing_id IS NULL THEN 'Main Committee' ELSE sw.name END as organizer_name
         FROM program_results pr
         JOIN programs p ON p.id = pr.program_id
         LEFT JOIN sub_wings sw ON sw.id = p.sub_wing_id
         WHERE pr.status = 'PUBLISHED'
         ORDER BY pr.published_at DESC NULLS LAST
         LIMIT 3`
      ),
      // Latest 2 publications from class unions
      query(
        `SELECT i.id, i.title, i.category, i.item_url, i.thumbnail_url, i.class_code, i.created_at,
                u.name as union_name
         FROM class_union_items i
         LEFT JOIN class_sangadhanakal u ON u.class_code = i.class_code
         ORDER BY i.created_at DESC
         LIMIT 2`
      ),
      // Featured star achiever
      query(
        `WITH star AS (
          SELECT 
            u.id as user_id,
            sp.full_name,
            sp.profile_slug,
            sp.class_code,
            sp.profile_photo_url,
            COALESCE(SUM(pr.class_points), 0)::int as total_points,
            COUNT(CASE WHEN pr.position = 1 THEN 1 END)::int as gold_medals,
            COUNT(pr.id)::int as events_count
          FROM users u
          JOIN student_profiles sp ON sp.user_id = u.id
          LEFT JOIN program_results pr ON pr.student_id = u.id AND pr.status = 'PUBLISHED'
          WHERE u.is_active = TRUE
          GROUP BY u.id, sp.full_name, sp.profile_slug, sp.class_code, sp.profile_photo_url
          HAVING COALESCE(SUM(pr.class_points), 0) > 0
          ORDER BY total_points DESC, gold_medals DESC
          LIMIT 1
        )
        SELECT * FROM star`
      ),
    ]);

    res.json({
      success: true,
      data: {
        active_cycle: cycleRes.rows[0] || null,
        defending_champion: championRes.rows[0] || null,
        latest_results: resultsRes.rows,
        latest_publications: publicationsRes.rows,
        featured_star: starRes.rows[0] || null,
      },
    });
  } catch (error) {
    console.error('Fetch home pulse error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch homepage live pulse.' });
  }
});

export default router;

