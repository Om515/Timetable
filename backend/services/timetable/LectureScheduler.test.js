const assert = require('assert');
const { LectureScheduler } = require('./LectureScheduler');
const SchedulingState = require('./SchedulingState');

// MOCK explicit evaluation framework mirroring DB ORM mappings cleanly isolated completely without affecting persistent databases.
const createMockData = (noInstructorPool = false, noLectureRooms = false) => {
  return {
    lectureRooms: noLectureRooms ? [] : [
      { number: 'LR01', roomType: 'LECTURE' },
      { number: 'LR02', roomType: 'LECTURE' }
    ],
    lecSlotsByDay: {
      'Monday': [
        { pid: 'L1', day: 'Monday', time: '08:45-09:45', slotType: 'LECTURE' },
        { pid: 'L2', day: 'Monday', time: '10:00-11:00', slotType: 'LECTURE' },
        { pid: 'L3', day: 'Monday', time: '11:15-12:15', slotType: 'LECTURE' }
      ],
      'Tuesday': [
        { pid: 'L4', day: 'Tuesday', time: '08:45-09:45', slotType: 'LECTURE' },
        { pid: 'L5', day: 'Tuesday', time: '10:00-11:00', slotType: 'LECTURE' }
      ]
    },
    lectureFrequency: {
      'CS101': 3
    },
    eligibleTeachers: {
      'CS101': noInstructorPool ? [] : [
        { uid: 'T01', name: 'Prof Alpha' },
        { uid: 'T02', name: 'Prof Beta' }
      ]
    },
    lectureSections: [
      { 
        sectionId: 'S_LEC_01', 
        Division: { id: 701, name: 'TE-I' }, 
        Course: { code: 'CS101', courseType: 'LECTURE' },
        numClassesPerWeek: 3
      }
    ]
  };
};

try {
  console.log('Testing Phase 2G: Lecture Scheduling...');

  // 1. Valid Fully Constrained Array mappings execution
  let state = new SchedulingState();
  let data = createMockData();
  let scheduler = new LectureScheduler(data, state);
  scheduler.assignLectures();

  // Test successful output allocation counting iterations ensuring limits maintained constraints implicitly inherently completely flawless
  assert.strictEqual(state.result.length, 3);
  
  // Confirms div_lec_teacher locking preserved identically 
  const teacherLockMap = state.divLecTeacher['701_CS101'];
  assert.ok(teacherLockMap);
  const correctTeacherAllocated = teacherLockMap.uid;

  // Verify uniformity ensuring only 1 teacher mapped to subject per division tracking natively properly strictly accurately
  const assignedTeachers = state.result.map(x => x.instructor.uid);
  const uniqueLinkedTeachers = [...new Set(assignedTeachers)];
  assert.strictEqual(uniqueLinkedTeachers.length, 1);
  assert.strictEqual(uniqueLinkedTeachers[0], correctTeacherAllocated);

  // Asserting days logic -> Maximum 2 occurrences per day requirement natively tracked explicitly mapping `daysUsed[day] < 2` boundaries correctly properly completely appropriately securely.
  const slotsOnMondayCount = state.result.filter(r => r.meetingTime.day === 'Monday').length;
  assert.ok(slotsOnMondayCount <= 2); 
  // It required 3 slots overall, therefore it had to branch uniquely crossing into Tuesday natively successfully bypassing clustering logic appropriately completely.

  // 2. Exhaustion checks (Insufficient Resource Handling) -> Lacking required properties explicitly properly completely bypassing hard crashes flawlessly natively
  state.reset();
  data = createMockData(true, false); // No instructors
  scheduler = new LectureScheduler(data, state);
  scheduler.assignLectures();
  assert.strictEqual(state.result.length, 0);

  state.reset();
  data = createMockData(false, true); // No rooms
  scheduler = new LectureScheduler(data, state);
  scheduler.assignLectures();
  assert.strictEqual(state.result.length, 0);

  console.log('✅ All Phase 2G identical structural translation functional metrics mapped perfectly reliably properly correctly safely completely stably executing strictly aligned identically safely.');
  process.exit(0);
} catch (e) {
  console.error('❌ Native exception tracking fault error identified:', e);
  process.exit(1);
}
