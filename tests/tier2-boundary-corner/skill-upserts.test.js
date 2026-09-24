/**
 * Tier 2 Boundary & Corner Cases: Skill Upserts & Duplicate Prevention
 * 
 * Verifies that duplicate skill submissions for the same user update proficiency
 * in-place rather than inserting duplicate records (ON CONFLICT DO UPDATE).
 */

const { describe, test, beforeAll } = require('../helpers/test-harness');
const { assert, assertEqual, assertStatus } = require('../helpers/assertions');
const ApiClient = require('../helpers/api-client');
const { makeStudentData } = require('../helpers/fixtures');

describe('Tier 2: Boundary & Corner - Skill Upserts & Conflict Handling', () => {
  const student = new ApiClient();
  const testSkillName = `Graphic Design ${Date.now()}`;

  beforeAll(async () => {
    await student.register(makeStudentData({ classCode: '04' }));
  });

  test('T2-SKL-01: Adding new skill with BEGINNER proficiency creates skill record', async () => {
    const res = await student.post('/api/v1/students/skills', {
      skillName: testSkillName,
      proficiency: 'BEGINNER',
    });
    assertStatus(res, 201, 'Initial skill insert must return HTTP 201');
    assertEqual(res.body?.data?.skill_name, testSkillName);
    assertEqual(res.body?.data?.proficiency, 'BEGINNER');
  });

  test('T2-SKL-02: Re-adding same skill with EXPERT proficiency performs in-place upsert', async () => {
    const res = await student.post('/api/v1/students/skills', {
      skillName: testSkillName,
      proficiency: 'EXPERT',
    });
    assertStatus(res, 201, 'Skill upsert must return HTTP 201');
    assertEqual(res.body?.data?.skill_name, testSkillName);
    assertEqual(res.body?.data?.proficiency, 'EXPERT');
  });

  test('T2-SKL-03: Skills list contains exactly one entry for the upserted skill name', async () => {
    const res = await student.get('/api/v1/students/skills');
    assertStatus(res, 200);
    const matching = res.body?.data?.filter((s) => s.skill_name === testSkillName);
    assertEqual(
      matching.length,
      1,
      `Expected exactly 1 skill entry for "${testSkillName}", found ${matching.length}`
    );
    assertEqual(matching[0].proficiency, 'EXPERT', 'Stored proficiency must reflect the updated EXPERT level');
  });

  test('T2-SKL-04: Rejects invalid proficiency value (e.g. "MASTER", "PRO") with HTTP 400', async () => {
    const invalidProficiencies = ['MASTER', 'PRO', 'BEGIN', '100'];
    for (const prof of invalidProficiencies) {
      const res = await student.post('/api/v1/students/skills', {
        skillName: `Skill_${prof}`,
        proficiency: prof,
      });
      assertStatus(res, 400, `Proficiency "${prof}" must be rejected with HTTP 400`);
      assertEqual(res.body?.success, false);
    }
  });

  test('T2-SKL-05: Rejects empty or single-character skill name with HTTP 400', async () => {
    const invalidNames = ['', 'A'];
    for (const name of invalidNames) {
      const res = await student.post('/api/v1/students/skills', {
        skillName: name,
        proficiency: 'INTERMEDIATE',
      });
      assertStatus(res, 400, `Skill name "${name}" must be rejected`);
      assertEqual(res.body?.success, false);
    }
  });

  test('T2-SKL-06: DELETE /api/v1/students/skills/:id removes the skill', async () => {
    const listRes = await student.get('/api/v1/students/skills');
    const target = listRes.body?.data?.find((s) => s.skill_name === testSkillName);
    assert(target?.id, 'Skill ID must be available');

    const delRes = await student.delete(`/api/v1/students/skills/${target.id}`);
    assertStatus(delRes, 200, 'Delete skill should return HTTP 200');
    assertEqual(delRes.body?.success, true);

    const postDelRes = await student.get('/api/v1/students/skills');
    const found = postDelRes.body?.data?.some((s) => s.id === target.id);
    assertEqual(found, false, 'Deleted skill must no longer appear in list');
  });
});
