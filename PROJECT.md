# Project: SADQ Platform

## Architecture
The SADQ Platform is a modern, mobile-first student ecosystem engineered with:
- **Client**: React 18 + Vite 6 + Tailwind CSS (Navy `#0A192F` and Gold `#D4AF37` palette) + React Router v6.
- **Server**: Node.js + Express 4 + TypeScript with Helmet security, CORS credentials, and cookie-based sessions.
- **Database**: Supabase PostgreSQL with 26 relational tables, `pgcrypto` UUIDs, and foreign key integrity.
- **Security**: Argon2id password hashing, server-side session management stored in PostgreSQL and delivered via `HttpOnly; SameSite=Lax; Path=/` cookies (`sadq_session`), 5 official roles (`SUPER_ADMIN`, `ADMIN`, `TEACHER`, `ORGANISATION_ADMIN`, `STUDENT`).
- **Core Principles**:
  - Growth & Talent focus (skills, talents, achievements, collaborative projects).
  - Permanent exclusion of academic marks, grades, GPA, and fee portals.
  - Zero payment gateways, checkouts, or transaction fees (direct WhatsApp and Email communication only).
  - Strict Zero Fake Data policy: verified empty states ("will be published after verification").

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Server TS Build Config | Adjust `server/tsconfig.json` rootDir to allow importing `shared/types.ts` | M1 | Survey 1 |
| 2 | Server Auth Transaction Fix | Acquire dedicated client from `pool.connect()` for atomic registration | M1 | Survey 1 |
| 3 | Client Entry Points | Author `client/src/main.tsx` and `client/src/App.tsx` | M1 | Survey 1 & 2 |
| 4 | Lucide Brand Icon Fix | Replace missing `Instagram` and `Youtube` imports in `Footer.tsx` and `Media.tsx` with clean SVG components | M1 | Survey 1 |
| 5 | Empty State Text Standardization | Align `Magazines.tsx` empty state to include verbatim "will be published after verification" | M1 | Survey 1 & 2 |
| 6 | API Healthcheck Endpoint | Verified `/api/v1/health` responding with status healthy and DB timestamp | M1 | Acceptance Criteria |
| 7 | Student Registration & Argon2id | Register student with class code (01-08), hash password with Argon2id, create profile slug | M1 | R1, R5 |
| 8 | HttpOnly Session Management | Set 30-day HttpOnly SameSite=Lax `sadq_session` cookie; session authentication middleware | M1 | R5 |
| 9 | Student Workspace Dashboard | UI at `/student` displaying profile stats, completion bar, and quick navigation | M2 | R1 |
| 10 | Profile & Privacy Toggles Editor | UI to update bio, contacts, and 8 privacy toggles (`is_public`, `show_email`, `show_whatsapp`, etc.) | M2 | R1 |
| 11 | Proficiency-Graded Skills Manager | Add/edit/delete skills with 4 proficiencies: `BEGINNER`, `INTERMEDIATE`, `ADVANCED`, `EXPERT` (upsert on duplicate) | M2 | R1 |
| 12 | Creative Talents Showcase | Add/manage student talents with category, description, and visibility | M2 | R1 |
| 13 | Verified Achievements & Milestones | Add/manage student milestones with title, issuer, date, and category | M2 | R1 |
| 14 | Collaborative Projects Manager | Add/manage student projects with unit affiliation and collaborator roster | M2 | R1 |
| 15 | Public Portfolio Route | Public view at `/portfolio/:slug` governed strictly by privacy toggles; 403 on private for unauthenticated | M2 | R1, Acceptance Criteria |
| 16 | Portfolio Owner/Admin Preview | Allow authenticated portfolio owner or admin to preview portfolio even when `is_public = FALSE` | M2 | R1, Survey 2 & 3 |
| 17 | 10 Official Units Catalog | List and display details of all 10 units: EB, IA, MPW, MB, LB, RW, CS, DW, LIB, SB | M2 | R2 |
| 18 | Institutional Leadership & Memberships | Student wing memberships, leadership designations, and wing-specific initiatives | M2 | R2 |
| 19 | Community Discourse Feed | Feed at `/community` with category filters, search, pinned posts, author info, and timestamps | M3 | R3 |
| 20 | Unique Reactions System | Reaction widget on posts with single-reaction constraint (`like`, `insightful`, `appreciate`) and toggle-off | M3 | R3 |
| 21 | Threaded Comments Hierarchy | Recursive comment tree supporting parent comments and nested replies (`parent_id`) | M3 | R3 |
| 22 | Student Create Center | Creation workflow at `/student/create` with Draft → Pending Review → Published lifecycle | M3 | R3 |
| 23 | Study Notes Sharing with Google Drive | Share study notes attaching external Google Drive URLs with subject and download toggle | M3 | R3 |
| 24 | Media Spotlights & 3 Official Videos | Embed 3 official YouTube spotlights (`loBBhKjIQZM`, `WhdDqjPkxD8`, `3oKM3MJ012I`) on Home & Media | M4 | R4, Acceptance Criteria |
| 25 | Digital Library Catalog & Verification | Digital catalog with categories and strict empty state ("will be published after verification") | M4 | R4, Acceptance Criteria |
| 26 | Magazines & Periodicals | Magazine catalog with Issuu / Drive reader links and verified empty state | M4 | R4, Acceptance Criteria |
| 27 | Opportunity & Service Discovery | Listings with direct WhatsApp (`https://wa.me/...`) and Email (`mailto:...`) triggers; zero payment | M4 | R4, Acceptance Criteria |
| 28 | Admin Moderation Queue | Dedicated UI at `/admin` to inspect pending posts, articles, and study notes | M4 | R5 |
| 29 | Moderation Actions & Audit Trail | Approve, Reject, Archive content with required reason; write to `moderation_actions` audit log | M4 | R5 |
| 30 | Admin Live Statistics | Real counts of users, students, posts, pending reviews, and units (zero fake data) | M4 | R5 |
| 31 | Full E2E Test Suite (Tiers 1-4) | Comprehensive requirement-driven opaque-box test suite published in `TEST_READY.md` | E2E Track | Acceptance Criteria |
| 32 | Adversarial Hardening & Verification | White-box stress testing (Tier 5), static audit for zero GPA/payments, clean client build | M5 | Acceptance Criteria |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| E2E | E2E Testing Track | Design test runner and test cases across Tiers 1-4, publish `TEST_INFRA.md` & `TEST_READY.md` | none | DONE |
| M1 | Core Infrastructure & Build Stabilization | Server TS config, client SVG brand icons, empty state text, `main.tsx`, `App.tsx`, build verification | none | DONE |
| M2 | Student Growth, Portfolio & Units Integration | Student workspace (`/student`), privacy controls, skills/talents/achievements/projects CRUD, portfolio view, 10 units | M1 | IN_PROGRESS |
| M3 | Community Discourse & Create Center | Discourse feed (`/community`), threaded comments (`parent_id`), unique reactions, Create Center (`/student/create`) | M1 | PLANNED |
| M4 | Media, Publications & Admin Moderation | Admin moderation queue, audit log, real stats, media spotlights, library/magazines, WhatsApp/Email triggers | M1 | PLANNED |
| M5 | Final E2E Test Pass & Adversarial Hardening | 100% pass of Tiers 1-4 E2E tests, Tier 5 adversarial tests, forensic audit, build verification | E2E, M2, M3, M4 | PLANNED |

## Interface Contracts

### Client ↔ Server Authentication Contract
- `POST /api/v1/auth/register`: `{ fullName, email, password, classCode: '01'..'08' }` -> `201 { success: true, data: { user, profile } }` + `Set-Cookie: sadq_session=...; HttpOnly; SameSite=Lax`
- `POST /api/v1/auth/login`: `{ email, password }` -> `200 { success: true, data: { user } }` + `Set-Cookie: sadq_session=...; HttpOnly; SameSite=Lax`
- `POST /api/v1/auth/logout`: `POST` with cookie -> `200 { success: true }` + Clear cookie
- `GET /api/v1/auth/me`: Cookie -> `200 { success: true, data: { user, profile } }` | `401`

### Client ↔ Server Portfolio Privacy Contract
- `GET /api/v1/public/portfolio/:slug`:
  - If `is_public = FALSE` and request is unauthenticated or not owner/admin: `403 { success: false, error: "This student profile is currently set to private." }`
  - If `is_public = TRUE` or authenticated owner/admin: `200 { success: true, data: { profile, talents, skills, achievements, projects, organisation } }`
  - Privacy filters: If `show_email = FALSE`, `emailContact = null`. If `show_whatsapp = FALSE`, `whatsappNumber = null`. If `show_talents = FALSE`, `talents = []`.

### Client ↔ Server Discourse & Reactions Contract
- `GET /api/v1/community/posts`: `200 { success: true, data: Post[] }`
- `POST /api/v1/community/posts/:id/react`: `{ reactionType: 'like' | 'insightful' | 'appreciate' }` -> `200 { success: true, action: 'added' | 'removed' | 'updated' }`
- `GET /api/v1/community/posts/:id/comments`: `200 { success: true, data: CommentTree[] }`
- `POST /api/v1/community/posts/:id/comments`: `{ body, parentId? }` -> `201 { success: true, data: Comment }`
- `POST /api/v1/community/notes`: `{ title, description?, subjectArea, fileUrl, downloadable?, visibility }` -> `201 { success: true, data: Note }`

### Client ↔ Server Admin Moderation Contract
- `GET /api/v1/admin/pending-queue`: Cookie (`ADMIN` or `SUPER_ADMIN`) -> `200 { success: true, data: { posts, articles, library } }`
- `POST /api/v1/admin/moderate`: `{ entityType, entityId, action: 'APPROVE' | 'REJECT' | 'ARCHIVE', reason? }` -> `200 { success: true }`
- `GET /api/v1/admin/stats`: `200 { success: true, data: { totalUsers, totalStudents, totalPosts, pendingReviewCount, organisationUnits } }`

## Code Layout
- `shared/types.ts`: Master enums, roles, units, and interfaces.
- `server/src/`:
  - `index.ts`: Server entry point and middleware assembly.
  - `db/`: Database pool, migrations, and seed scripts.
  - `middleware/auth.ts`: Session cookie authentication and role gating.
  - `routes/auth.ts`: Authentication, registration, password hashing.
  - `routes/public.ts`: Public catalogs, units, media, portfolio retrieval.
  - `routes/student.ts`: Authenticated student workspace, profile, and portfolio items.
  - `routes/community.ts`: Discourse feed, reactions, threaded comments, notes.
  - `routes/admin.ts`: Admin moderation queue, audit log, stats, config.
- `client/src/`:
  - `main.tsx` & `App.tsx`: Client root entry point and route hierarchy.
  - `components/`: Reusable UI (`Navbar`, `Footer`, `CrestEmblem`, `EmptyState`, etc.).
  - `context/AuthContext.tsx`: Authentication and user session state.
  - `pages/public/`: Public pages (`Home`, `About`, `Organisation`, `PortfolioView`, `Library`, `Magazines`, `Media`, `Opportunities`, `ServicesMarketplace`, `Certificates`, `Login`, `Register`).
  - `pages/student/`: Protected student pages (`StudentDashboard`, `CreateCenter`).
  - `pages/admin/`: Protected admin pages (`AdminDashboard`).
  - `services/api.ts`: API client functions with credentials and cookie handling.
