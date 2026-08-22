const assert = require('assert');
const SchedulingState = require('./SchedulingState');

try {
  console.log('Testing SchedulingState...');
  let state = new SchedulingState();
  
  // 1. Fresh state starts empty.
  // 2. All required trackers are initialized.
  assert.deepStrictEqual(state.result, []);
  assert.deepStrictEqual(state.roomBusy, {});
  assert.deepStrictEqual(state.teacherBusy, {});
  assert.deepStrictEqual(state.divBusy, {});
  assert.deepStrictEqual(state.batchBusy, {});
  assert.deepStrictEqual(state.teacherLectureLoad, {});

  // 3 & 4 & 5 & 6. State can record occupied entities
  const mockMeetingTime = { time: '08:45 - 09:45', day: 'Monday' };
  
  // Ensure endpoints initially report free
  assert.strictEqual(state.roomFree(mockMeetingTime, 'L01'), true);
  assert.strictEqual(state.teacherFree(mockMeetingTime, 'T01'), true);
  
  state.mark(mockMeetingTime, 'L01', 'T01', 10, 20);

  // Entities must now report busy
  assert.strictEqual(state.roomFree(mockMeetingTime, 'L01'), false);
  assert.strictEqual(state.teacherFree(mockMeetingTime, 'T01'), false);
  assert.strictEqual(state.divFree(mockMeetingTime, 10), false);
  assert.strictEqual(state.batchFree(mockMeetingTime, 20), false);

  // But free at different times (10:00 - 11:00)
  assert.strictEqual(state.roomFree({ time: '10:00 - 11:00', day: 'Monday' }, 'L01'), true);

  // 7 & 8. Teacher load and counts work dynamically
  state.teacherBatchCount['T01'] = (state.teacherBatchCount['T01'] || 0) + 1;
  state.teacherLectureLoad['T01'] = (state.teacherLectureLoad['T01'] || 0) + 1;
  assert.strictEqual(state.teacherBatchCount['T01'], 1);
  assert.strictEqual(state.teacherLectureLoad['T01'], 1);

  // 9. A new instance resets correctly
  state.reset();
  assert.deepStrictEqual(state.roomBusy, {});
  assert.strictEqual(state.teacherBatchCount['T01'], undefined);
  
  // 10. Source key behavior translates tuples transparently
  const key1 = state.getCompositeKey(5, 'CS101');
  assert.strictEqual(key1, '5_CS101');

  console.log('✅ All Phase 2D runtime state tests successfully passed!');
  process.exit(0);

} catch (error) {
  console.error('❌ Test failed execution: ', error);
  process.exit(1);
}
