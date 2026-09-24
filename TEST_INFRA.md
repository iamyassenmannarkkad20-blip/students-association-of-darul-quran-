# SADQ Platform - Test Infrastructure & Methodology (`TEST_INFRA.md`)

## 1. Overview & Philosophy
The SADQ Platform E2E Test Suite is engineered as a standalone, deterministic, opaque-box verification framework. It evaluates the platform's behavior strictly against requirements R1 through R5 and core acceptance criteria without inspecting internal component implementation or coupling tests to private state.

### Core Testing Principles
1. **Opaque-Box Verification**: All operational tests interact with the system via standard HTTP REST endpoints with cookie session jar tracking and strict HTTP status and JSON assertion rules.
2. **Deterministic & Isolated**: Each test suite creates isolated, timestamped student accounts and assets (`e2e_test_*`), avoiding test order dependencies or cross-suite pollution.
3. **Multi-Tiered Coverage Matrix**:
   - **Static Architecture & Security Audits**: Forensic verification of zero academic marks/GPA, zero payment gateways, Argon2id hashing pattern, 10 official units, 5 roles, and client build integrity.
   - **Tier 1 (Feature Coverage)**: Comprehensive baseline validation (>=5 tests per area) across Health, Authentication, Portfolios, 10 Units, Discourse, Media, and Admin Moderation.
   - **Tier 2 (Boundary & Corner Cases)**: Edge value partitioning (>=5 tests per area) covering class code boundaries (01-08), private portfolio 403 enforcement, duplicate skill upserts, reaction toggle state machines, empty state standardization, and session expiry.
   - **Tier 3 (Cross-Feature Combinations)**: Multi-step pairwise state pipelines testing student onboarding to public portfolio, discourse post moderation to community engagement, profile score progression (40% to 100%), and role boundary escalation prevention.
   - **Tier 4 (Real-World Scenarios)**: End-to-end production workload simulations (Student Portfolio lifecycle, Unit initiatives, Drive-linked community notes, Zero-checkout WhatsApp/Email outreach, Admin moderation cycle).

---

## 2. Directory Layout & Architecture

```
tests/
├── helpers/
│   ├── config.js                 # Shared constants (API URL, 10 Units, 5 Roles, Video IDs, Admin creds)
│   ├── assertions.js             # High-precision assertion library (assertEqual, assertStatus, etc.)
│   ├── api-client.js             # Session-aware HTTP client with cookie management and auth helpers
│   ├── test-db.js                # Direct PostgreSQL pool for deep cryptographic and forensic checks
│   ├── fixtures.js               # Randomized data factories for students, talents, skills, posts
│   └── test-harness.js           # Lightweight deterministic test runner (describe, test, beforeAll, afterAll)
│
├── static-audits/
│   ├── zero-academic-audit.test.js    # Verifies ZERO GPA, academic marks, or fee portals
│   ├── zero-payments-audit.test.js    # Verifies ZERO Stripe, Razorpay, PayPal, or checkout logic
│   ├── argon2-hashing-audit.test.js   # Verifies Argon2id password hashing pattern in code & DB
│   ├── units-roles-audit.test.js      # Verifies the 10 official units and 5 roles
│   └── client-build-audit.test.js     # Verifies client build pipeline and entrypoints
│
├── tier1-feature-coverage/
│   ├── health.test.js                 # /api/v1/health API responsiveness & DB heartbeat
│   ├── auth.test.js                   # Registration, login, logout, me, cookies
│   ├── portfolios.test.js             # Student dashboard, talents, skills, achievements, projects
│   ├── units.test.js                  # 10 official units catalog and student affiliations
│   ├── discourse.test.js              # Community feed, post authoring, comments, reactions, notes
│   ├── media.test.js                  # Media spotlights, magazines, library, opportunities, services
│   └── moderation.test.js             # Admin stats, pending queue, moderation actions, config
│
├── tier2-boundary-corner/
│   ├── class-codes-boundary.test.js   # Boundary analysis for class codes (00, 01, 08, 09, 99)
│   ├── portfolio-privacy.test.js      # Private profile 403 notice & selective contact masking
│   ├── skill-upserts.test.js          # ON CONFLICT DO UPDATE proficiency upsert verification
│   ├── reaction-toggles.test.js       # Single reaction toggle state machine (add, remove, update)
│   ├── empty-states.test.js           # "will be published after verification" copy verification
│   └── session-expiry.test.js         # Missing, tampered, and expired session token handling
│
├── tier3-combinations/
│   ├── student-lifecycle-combo.test.js    # Register -> Login -> Talent -> Privacy -> View pipeline
│   ├── discourse-moderation-combo.test.js # Post -> Review Queue -> Approve -> Feed -> Comment -> React
│   ├── score-progression-combo.test.js    # Dynamic profile completion score (40% -> 60% -> 80% -> 100%)
│   └── rbac-escalation-combo.test.js      # Privilege escalation prevention across routes
│
├── tier4-real-world/
│   ├── scenario-student-portfolio.test.js   # Full student onboarding to public portfolio showcase
│   ├── scenario-unit-initiative.test.js     # Official unit initiative & collaborative projects
│   ├── scenario-community-knowledge.test.js # Community knowledge sharing with Google Drive link
│   ├── scenario-media-opportunity.test.js   # Media spotlights & WhatsApp/Email outreach without checkout
│   └── scenario-admin-moderation.test.js    # Institutional moderation cycle & magazine publishing
│
└── run-e2e.js                    # Unified test runner with colorized tier reports & summary table
```

---

## 3. How to Run the Tests

### Single Command Execution
From the project root directory:

```bash
# Via Node.js directly
node tests/run-e2e.js

# Or via npm script
npm test
```

### Self-Managing Server Execution
The test runner `tests/run-e2e.js` includes automated server liveness detection:
1. It queries `http://localhost:5000/api/v1/health`.
2. If the backend is already running, it connects immediately and executes tests.
3. If the backend is not running, it automatically spawns `cmd /c npx tsx src/index.ts` from `server/`, waits for the health endpoint to report healthy status, executes the entire suite, and safely handles cleanup.

---

## 4. Test Tiers & Metrics

| Tier | Category | Files | Total Tests | Pass Rate | Key Verification Focus |
|---|---|---|---|---|---|
| **Static Audits** | Architecture & Forensics | 5 | 25 | 100% | Zero GPA/Marks, Zero Payment Gateways, Argon2id, 10 Units, Build |
| **Tier 1** | Feature Coverage | 7 | 41 | 100% | Health, Auth, Portfolios, Units, Discourse, Media, Admin |
| **Tier 2** | Boundary & Corner | 6 | 33 | 100% | Class codes 01-08, Private 403, Skill upserts, Reaction toggles, Empty states |
| **Tier 3** | Combinations | 4 | 21 | 100% | Student lifecycle, Discourse moderation queue, Profile score, RBAC |
| **Tier 4** | Real-World Workloads | 5 | 24 | 100% | 5 Complete end-to-end multi-role real-world scenarios |
| **Total** | **Full Suite** | **27** | **144** | **100%** | **Complete platform verification across R1 to R5** |

---

## 5. Security & Isolation Guarantee
- **Database Cleanup**: All ephemeral test users match `e2e_test_*@sadq.org` and are automatically deleted during the post-test cleanup hook in `tests/helpers/test-db.js`.
- **Zero Production Disruption**: Tests do not mutate seeded official units or the default Super Admin credentials.
