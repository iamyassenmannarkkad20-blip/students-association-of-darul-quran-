/**
 * Tier 4 Real-World Scenario 2: Official Unit Initiative & Institutional Collaboration
 * 
 * Simulates unit discovery and collaborative project affiliation:
 * 1. Verification of the 10 official units across public directory.
 * 2. Student creates collaborative initiatives linked to official unit codes (e.g. MPW, RW).
 * 3. Project queries join unit metadata (unit name, description).
 * 4. Collaborative project is highlighted in the student's public portfolio.
 */

const { describe, test, beforeAll } = require('../helpers/test-harness');
const { assert, assertEqual, assertStatus } = require('../helpers/assertions');
const ApiClient = require('../helpers/api-client');
const { OFFICIAL_UNIT_CODES } = require('../helpers/config');
const { makeStudentData, makeProjectData } = require('../helpers/fixtures');

describe('Tier 4: Scenario 2 - Official Unit Initiative & Collaboration Showcase', () => {
  const student = new ApiClient();
  const visitor = new ApiClient();
  let studentSlug = '';

  beforeAll(async () => {
    const regRes = await student.register(makeStudentData({ classCode: '07' }));
    assertStatus(regRes, 201);
    studentSlug = regRes.body.data.user.profileSlug;

    await student.patch('/api/v1/students/profile', {
      isPublic: true,
      showProjects: true,
      showOrganisation: true,
    });
  });

  test('Step 1: Public visitor discovers all 10 official units and their mandate', async () => {
    const res = await visitor.get('/api/v1/public/units');
    assertStatus(res, 200);
    assertEqual(res.body?.data?.length, 10, 'All 10 units must be listed');

    const expectedUnits = {
      EB: 'Excellence Bureau',
      IA: 'Islamic Arts',
      MPW: 'Media & Publishing Wing',
      MB: 'Medical Board',
      LB: 'Literary Board',
      RW: 'Research Wing',
      CS: 'Campus Squad',
      DW: 'Da\'wah Wing',
      LIB: 'Library Board',
      SB: 'Samajam Board',
    };

    for (const [code, expectedName] of Object.entries(expectedUnits)) {
      const u = res.body.data.find((item) => item.code === code);
      assert(u, `Unit ${code} must be present`);
      assertEqual(u.name, expectedName, `Unit ${code} name must match official title`);
    }
  });

  test('Step 2: Student creates collaborative initiative under Media & Publishing Wing (MPW)', async () => {
    const projectRes = await student.post(
      '/api/v1/students/projects',
      makeProjectData({
        title: 'DAR Media Student Documentary Series',
        description: 'Multi-part video documentary highlighting academy history and alumni journeys.',
        category: 'Media Production',
        unitCode: 'MPW',
        status: 'IN_PROGRESS',
        visibility: 'PUBLIC',
      })
    );
    assertStatus(projectRes, 201);
    assertEqual(projectRes.body?.data?.unit_code, 'MPW');
  });

  test('Step 3: Student queries workspace projects and verifies unit name joined in database', async () => {
    const res = await student.get('/api/v1/students/projects');
    assertStatus(res, 200);
    const initiative = res.body?.data?.find(
      (p) => p.title === 'DAR Media Student Documentary Series'
    );
    assert(initiative, 'Project must be listed');
    assertEqual(initiative.unit_code, 'MPW');
    assertEqual(initiative.unit_name, 'Media & Publishing Wing');
  });

  test('Step 4: Public visitor verifies the unit initiative featured in public portfolio', async () => {
    const res = await visitor.get(`/api/v1/public/portfolio/${studentSlug}`);
    assertStatus(res, 200);
    const projects = res.body?.data?.projects;
    assert(projects && projects.length >= 1, 'Projects list must contain the initiative');
    const featured = projects.find((p) => p.title === 'DAR Media Student Documentary Series');
    assert(featured, 'Initiative must appear on public portfolio');
    assertEqual(featured.unit_code, 'MPW');
  });
});
