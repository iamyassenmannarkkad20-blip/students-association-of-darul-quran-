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

// Student Public Portfolio (/portfolio/:slug)
router.get('/portfolio/:slug', async (req, res) => {
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
    };

    res.json({
      success: true,
      is_owner_view: isOwnerView,
      data: {
        profile: sanitizedProfile,
        talents,
        skills,
        achievements,
        projects,
        organisation,
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

export default router;

