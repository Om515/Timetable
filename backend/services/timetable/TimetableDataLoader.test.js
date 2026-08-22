const assert = require('assert');
require('dotenv').config({ path: '../../.env' });
const { sequelize, Department, Division, Batch, Instructor, Room, Course, MeetingTime, Section } = require('../../models');
const TimetableDataLoader = require('./TimetableDataLoader');

async function runTests() {
  try {
    console.log('🔄 Syncing database tables dynamically via isolated test session...');
    // We are resetting to empty baseline safely preventing dev DB contamination logically
    await sequelize.sync({ force: true });

    console.log('✅ Testing empty database load...');
    let loader = new TimetableDataLoader();
    await loader.load();
    assert.deepStrictEqual(loader.divisions, []);
    assert.deepStrictEqual(loader.sections, []);
    assert.deepStrictEqual(loader.electiveSections, []);

    console.log('🔄 Injecting integration data mimics strictly checking dependencies...');
    
    // Core structure
    const dept = await Department.create({ name: 'Computer' });
    const div1 = await Division.create({ name: 'TE-I', totalStudents: 80, departmentId: dept.id });
    const batch1 = await Batch.create({ name: 'K1', studentCount: 20, divisionId: div1.id });
    
    const instructor1 = await Instructor.create({ uid: 'JS01', name: 'John Smith', maxBatchesPerWeek: 4, maxLectureDivisions: 2 });
    const room1 = await Room.create({ number: 'L01', seatingCapacity: 90, roomType: 'LECTURE' });
    const room2 = await Room.create({ number: 'B01', seatingCapacity: 30, roomType: 'LAB' });
    
    const course1 = await Course.create({ code: 'CS101', name: 'Intro', maxStudents: 80, courseType: 'LECTURE', isElective: false });
    const mt1 = await MeetingTime.create({ pid: 'M1', time: '08:45-09:45', day: 'Monday', slotType: 'LECTURE' });
    
    // Inject relationship manually 
    await course1.addInstructor(instructor1);

    const section1 = await Section.create({
      sectionId: 'SEC01',
      numClassesPerWeek: 3,
      isElective: false,
      departmentId: dept.id,
      divisionId: div1.id,
      batchId: null, // nullable batch check
      courseId: course1.id
    });

    console.log('🔄 Re-hydrating Loader against populated nodes...');
    loader = new TimetableDataLoader();
    await loader.load();

    // Verification Tests on Populated Structures
    console.log('🧪 Testing mappings and properties...');
    assert.strictEqual(loader.divisions.length, 1);
    assert.strictEqual(loader.rooms.length, 2);
    
    // Arrays correctly isolated and mapped?
    assert.strictEqual(loader.lectureRooms.length, 1);
    assert.strictEqual(loader.labRooms.length, 1);
    assert.strictEqual(loader.lectureRooms[0].number, 'L01');

    // Slot pools tests
    assert.strictEqual(loader.lecSlotsByDay['Monday'][0].pid, 'M1');
    assert.deepStrictEqual(loader.elec2hByDay['Monday'], []);


    // Eager loading and explicit Many-to-Many hydration 
    assert.ok(loader.eligibleTeachers['CS101']);
    assert.strictEqual(loader.eligibleTeachers['CS101'][0].uid, 'JS01');

    // Sections logic separation evaluated appropriately
    assert.strictEqual(loader.sections.length, 1);
    assert.ok(loader.sections[0].Course);
    assert.strictEqual(loader.sections[0].Course.code, 'CS101');
    assert.strictEqual(loader.regularSections.length, 1);
    assert.strictEqual(loader.electiveSections.length, 0);

    // Max frequency checks dynamically mapped strictly matching source code logic
    assert.strictEqual(loader.lectureFrequency['CS101'], 3);

    console.log('🧽 Cleaning isolated test records...');
    await sequelize.sync({ force: true });
    
    console.log('✅ All Phase 2C integration tests successfully passed!');
    process.exit(0);

  } catch (err) {
    console.error('❌ Test failed execution: ', err);
    process.exit(1);
  }
}

runTests();
