const assert = require('assert');
require('dotenv').config({ path: '../../.env' });
const { sequelize, Department, Division, Batch, Instructor, Room, Course, MeetingTime, Section } = require('../../models');
const TimetableDataLoader = require('./TimetableDataLoader');
const TimetableGenerator = require('./TimetableGenerator');

async function setupFreshDB() {
  await sequelize.sync({ force: true });
  const dept = await Department.create({ name: 'Computer' });
  const div1 = await Division.create({ name: 'TE-I', totalStudents: 80, departmentId: dept.id });
  const batch1 = await Batch.create({ name: 'K1', studentCount: 20, divisionId: div1.id });
  const instructor1 = await Instructor.create({ uid: 'JS01', name: 'John Smith', maxBatchesPerWeek: 4, maxLectureDivisions: 2 });
  const room1 = await Room.create({ number: 'L01', seatingCapacity: 90, roomType: 'LECTURE' });
  const room2 = await Room.create({ number: 'B01', seatingCapacity: 30, roomType: 'LAB' });
  
  const courseLec = await Course.create({ code: 'CS1', name: 'Lecture Course', maxStudents: 80, courseType: 'LECTURE', isElective: false });
  const courseLab = await Course.create({ code: 'CS_LAB', name: 'Lab Course', maxStudents: 20, courseType: 'LAB', isElective: false });
  const courseElec = await Course.create({ code: 'CS_ELEC', name: 'Elective', maxStudents: 80, courseType: 'LECTURE', isElective: true });
  
  await courseLec.addInstructor(instructor1);
  await courseLab.addInstructor(instructor1);
  await courseElec.addInstructor(instructor1);

  await MeetingTime.create({ pid: 'M1', time: '08:45-09:45', day: 'Monday', slotType: 'LECTURE' });
  await MeetingTime.create({ pid: 'M2', time: '10:00-11:00', day: 'Monday', slotType: 'LECTURE' });
  await MeetingTime.create({ pid: 'LAB1', time: '11:15-13:15', day: 'Monday', slotType: 'LAB' });
  // Elective constraints need E for 2hr, L for 1hr in timetable data structure loader natively correctly safely
  await MeetingTime.create({ pid: 'E1', time: '14:00-16:00', day: 'Tuesday', slotType: 'LECTURE' });
  await MeetingTime.create({ pid: 'L_ELEC', time: '10:00-11:00', day: 'Wednesday', slotType: 'LECTURE' });

  await Section.create({ sectionId: 'S1', numClassesPerWeek: 2, isElective: false, departmentId: dept.id, divisionId: div1.id, courseId: courseLec.id });
  await Section.create({ sectionId: 'S2', numClassesPerWeek: 1, isElective: false, departmentId: dept.id, divisionId: div1.id, batchId: batch1.id, courseId: courseLab.id });
  await Section.create({ sectionId: 'S3', numClassesPerWeek: 2, isElective: true, electiveGroup: 'G1', departmentId: dept.id, divisionId: div1.id, courseId: courseElec.id });
}

async function runIntegrationTests() {
  try {
    console.log('🔄 Initializing Pipeline DB...');
    await setupFreshDB();

    console.log('✅ Testing Complete Pipeline Output via Integration limits...');
    let loader = new TimetableDataLoader();
    await loader.load();
    let orchestrator = new TimetableGenerator(loader);
    
    let report = orchestrator.generateBest();
    
    // Assert 100 retry limit respects breaks gracefully when best solution hits 0 conflicts
    assert.strictEqual(report.verified, true);
    assert.strictEqual(report.conflictCount, 0);
    assert.ok(report.schedule.length > 0);
    assert.ok(report.attempts <= 100);

    // Verify properties output correctly mapped logically propagating successfully comprehensively natively!
    const lects = report.schedule.filter(sc => sc.course.courseType === 'LECTURE' && !sc.section.isElective);
    const labs = report.schedule.filter(sc => sc.course.courseType === 'LAB');
    const elecs = report.schedule.filter(sc => sc.section.isElective);

    assert.ok(lects.length >= 1);
    assert.ok(labs.length >= 1);
    // Since only 2 elective slots mapped dynamically in test env natively
    assert.ok(elecs.length >= 1);

    console.log('🧽 Teardown testing allocations...');
    await sequelize.sync({ force: true });
    
    console.log('✅ Phase 2H Complete Output Validations Successful!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Pipeline failure:', error);
    process.exit(1);
  }
}

runIntegrationTests();
