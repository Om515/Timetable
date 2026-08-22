const assert = require('assert');
const { ElectiveScheduler } = require('./ElectiveScheduler');
const SchedulingState = require('./SchedulingState');

// MOCK minimal framework circumventing DB latency tests solely executing functional mapping.
const createMockData = (hasElectives = true, notEnoughRooms = false) => {
  return {
    lectureRooms: notEnoughRooms ? [{ number: 'R1', roomType: 'LECTURE' }] : [
      { number: 'R1', roomType: 'LECTURE' }, 
      { number: 'R2', roomType: 'LECTURE' }
    ],
    elec2hByDay: {
      'Monday': [{ pid: 'E1', day: 'Monday', time: '08:45-10:45', slotType: 'LECTURE' }]
    },
    elec1hByDay: {
      'Tuesday': [{ pid: 'L1', day: 'Tuesday', time: '11:00-12:00', slotType: 'LECTURE' }]
    },
    divByName: {
      'TE-I': { id: 101, name: 'TE-I' },
      'TE-III': { id: 103, name: 'TE-III' }
    },
    batchesByDivision: {
      101: [{ id: 501, name: 'K1' }],
      103: [{ id: 503, name: 'K3' }]
    },
    eligibleTeachers: {
      'CS_ELEC_1': [{ uid: 'T1', name: 'Prof A' }, { uid: 'T2', name: 'Prof B' }],
      'CS_ELEC_2': [{ uid: 'T3', name: 'Prof C' }]
    },
    electiveSections: hasElectives ? [
      { sectionId: 'S1', Course: { code: 'CS_ELEC_1' }, isElective: true, electiveGroup: 'G1' },
      { sectionId: 'S2', Course: { code: 'CS_ELEC_2' }, isElective: true, electiveGroup: 'G2' }
    ] : []
  };
};


try {
  console.log('Testing Phase 2E: Electives Algorithm...');

  // 1. NO ELECTIVES
  let state = new SchedulingState();
  let data = createMockData(false);
  let scheduler = new ElectiveScheduler(data, state);
  scheduler.assignElectives();
  assert.strictEqual(state.result.length, 0); // No state mutation

  // 2. VALID ELECTIVES MULTIPLE
  state.reset();
  data = createMockData(true);
  scheduler = new ElectiveScheduler(data, state);
  scheduler.assignElectives();

  // Each elective should be mapped correctly to multiple divisions universally triggering replication
  // Expected length = 2 slots over 2 Days * 2 groups * 1 replication (Because G1 has TE-I, G2 has TE-III) = 4 assignments
  assert.strictEqual(state.result.length, 4);

  // 3. CORRECT TRACKING RECORD VALIDATION
  // Assert teacher tracker locked teacher
  assert.ok(state.divLecTeacher['S1_ELECTIVE']);
  // Did teacherLectureLoad correctly increment? 
  // It assigns T1 and T3 both for 2 iterations (since 2 slots are generated per week) -> they should have a load of 1 during evaluating selection
  assert.ok(state.teacherLectureLoad['T1'] > 0 || state.teacherLectureLoad['T2'] > 0);

  // 4. ROOM AVAILABILITY FAILURE
  state.reset();
  data = createMockData(true, true); // Sets notEnoughRooms = true
  scheduler = new ElectiveScheduler(data, state);
  scheduler.assignElectives(); // System should naturally abandon logic, emitting warning but recovering elegantly
  assert.strictEqual(state.result.length, 0);

  console.log('✅ All Phase 2E functional checks passed matching Source Algorithm.');
  process.exit(0);
} catch(e) {
  console.error('❌ Functional execution completely invalid:', e);
  process.exit(1);
}
