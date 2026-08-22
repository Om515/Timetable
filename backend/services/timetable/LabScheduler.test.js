const assert = require('assert');
const { LabScheduler } = require('./LabScheduler');
const SchedulingState = require('./SchedulingState');

// MOCK data providing constrained simulated ORM configurations
const createMockData = (insufficientRooms = false, teacherLimit = false) => {
  return {
    divisions: [{ id: 701, name: 'TE-I' }],
    labRooms: insufficientRooms ? [] : [
      { number: 'LAB01', roomType: 'LAB' },
      { number: 'LAB02', roomType: 'LAB' }
    ],
    labSlotsByDay: {
      'Monday': [
        { pid: 'LAB-M1', day: 'Monday', time: '08:45-10:45', slotType: 'LAB' }, // Valid slot 1
        { pid: 'LAB-M2', day: 'Monday', time: '10:45-12:45', slotType: 'LAB' }, // Consecutive string bound
        { pid: 'LAB-M3', day: 'Monday', time: '13:45-15:45', slotType: 'LAB' }  // Disconnected slot
      ],
      'Tuesday': [{ pid: 'LAB-M4', day: 'Tuesday', time: '13:45-15:45', slotType: 'LAB' }]
    },
    labFrequency: {
      'CS101': 2 // Requires exactly 2 schedules per course per div 
    },
    eligibleTeachers: {
      'CS101': teacherLimit ? [] : [
        { uid: 'T1', name: 'Prof A' },
        { uid: 'T2', name: 'Prof B' }
      ]
    },
    divLabGroups: {
      '701_CS101': [
        { sectionId: 'S101', Batch: { id: 801, divisionId: 701 }, Course: { code: 'CS101' } },
        { sectionId: 'S102', Batch: { id: 802, divisionId: 701 }, Course: { code: 'CS101' } }
      ]
    },
    batchesByDivision: {
      701: [{ id: 801 }, { id: 802 }]
    }
  };
};

try {
  console.log('Testing Phase 2F: Lab Scheduling...');

  // 1. Fully Valid Integration Assignment mimicking perfect conditions
  let state = new SchedulingState();
  let data = createMockData();
  let scheduler = new LabScheduler(data, state);
  scheduler.assignLabs();
  
  // 2 sections across 2 sessions (frequency requirement) -> 4 results expected array blocks
  assert.strictEqual(state.result.length, 4);

  // Asserting mapping persistence logic successfully locked relationships securely
  // We can query internal cache trackers manually enforcing exact structure mappings natively 
  assert.ok(state.batchLabRoom['801_CS101']);
  assert.ok(state.batchLabTeacher['801_CS101']);
  assert.ok(state.batchLabTeacher['802_CS101']);
  
  // Enforcing separate teacher validation assignments successfully mapped cleanly 
  const teachersUsedCount = Object.keys(state.teacherBatchCount).length;
  // Two separate batches mean algorithm selected either 1 or 2 distinct instructors dynamically mapping natively
  assert.ok(teachersUsedCount >= 1 && teachersUsedCount <= 2);

  // Checking MAX_LAB_PER_DAY limitation
  const daysUsed = state.divDayLabs['701_Monday'] ? state.divDayLabs['701_Monday'].length : 0;
  assert.ok(daysUsed <= 2);

  // 2. Insufficient Rooms failure handling tests
  state.reset();
  data = createMockData(true, false);
  scheduler = new LabScheduler(data, state);
  scheduler.assignLabs();
  assert.strictEqual(state.result.length, 0); // No scheduled objects created

  // 3. Teacher constraints lacking failure mechanisms properly bypassed preventing hard exceptions dynamically
  state.reset();
  data = createMockData(false, true);
  scheduler = new LabScheduler(data, state);
  scheduler.assignLabs();
  assert.strictEqual(state.result.length, 0);

  // Check state wasn't partially mutated resulting in catastrophic data bleeds
  assert.deepStrictEqual(state.batchLabRoom, {});

  console.log('✅ All Phase 2F explicit functional translation tests safely executed representing Python dependencies structure natively.');
  process.exit(0);
} catch (e) {
  console.error('❌ Errors isolated during validation!', e);
  process.exit(1);
}
