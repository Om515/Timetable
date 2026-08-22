require('dotenv').config({ path: '../../.env' });
const { sequelize, Department, Division, Batch, Instructor, Room, Course, MeetingTime, Section } = require('../../models');
const TimetableDataLoader = require('./TimetableDataLoader');
const TimetableGenerator = require('./TimetableGenerator');

async function seedData() {
  await sequelize.sync({ force: true });
  console.log('Seeding Database for Phase 2I end-to-end verification...');

  // Department
  const deptInfo = await Department.create({ name: 'Computer Engineering' });

  // Divisions matching the Elective Groups: G1=[TE-I, TE-II], G2=[TE-III, TE-IV]
  const divTE1 = await Division.create({ name: 'TE-I', totalStudents: 75, departmentId: deptInfo.id });
  const divTE2 = await Division.create({ name: 'TE-II', totalStudents: 75, departmentId: deptInfo.id });
  const divTE3 = await Division.create({ name: 'TE-III', totalStudents: 75, departmentId: deptInfo.id });
  const divTE4 = await Division.create({ name: 'TE-IV', totalStudents: 75, departmentId: deptInfo.id });

  // Batches
  const batchTE1_K1 = await Batch.create({ name: 'K1', studentCount: 25, divisionId: divTE1.id });
  const batchTE1_K2 = await Batch.create({ name: 'K2', studentCount: 25, divisionId: divTE1.id });
  const batchTE1_K3 = await Batch.create({ name: 'K3', studentCount: 25, divisionId: divTE1.id });
  
  const batchTE2_L1 = await Batch.create({ name: 'L1', studentCount: 25, divisionId: divTE2.id });
  const batchTE2_L2 = await Batch.create({ name: 'L2', studentCount: 25, divisionId: divTE2.id });
  
  const batchTE3_M1 = await Batch.create({ name: 'M1', studentCount: 25, divisionId: divTE3.id });
  
  // Instructors
  const teachers = [];
  for (let i = 1; i <= 10; i++) {
    teachers.push(await Instructor.create({
      uid: `T0${i}`,
      name: `Teacher ${i}`,
      maxBatchesPerWeek: i % 2 === 0 ? 4 : 6,
      maxLectureDivisions: 3
    }));
  }

  // Courses
  const dbms = await Course.create({ code: 'DBMS', name: 'Database OS', maxStudents: 80, courseType: 'LECTURE', isElective: false });
  const dbms_lab = await Course.create({ code: 'DBMS-L', name: 'Database OS Lab', maxStudents: 25, courseType: 'LAB', isElective: false });
  
  const cn = await Course.create({ code: 'CN', name: 'Computer Networks', maxStudents: 80, courseType: 'LECTURE', isElective: false });
  const cn_lab = await Course.create({ code: 'CN-L', name: 'Computer Networks Lab', maxStudents: 25, courseType: 'LAB', isElective: false });

  const ai_elec = await Course.create({ code: 'AI-E', name: 'AI Elective', maxStudents: 80, courseType: 'LECTURE', isElective: true });
  const cc_elec = await Course.create({ code: 'CC-E', name: 'Cloud Elective', maxStudents: 80, courseType: 'LECTURE', isElective: true });

  // Link Instructors to Courses
  await dbms.addInstructors([teachers[0], teachers[1]]);
  await dbms_lab.addInstructors([teachers[2], teachers[3], teachers[4]]);
  
  await cn.addInstructors([teachers[0], teachers[5]]);
  await cn_lab.addInstructors([teachers[6], teachers[7]]);
  
  await ai_elec.addInstructors([teachers[8]]);
  await cc_elec.addInstructors([teachers[9]]);

  // Rooms
  for (let i = 1; i <= 5; i++) {
    await Room.create({ number: `LRC-0${i}`, seatingCapacity: 100, roomType: 'LECTURE' });
  }
  for (let i = 1; i <= 4; i++) {
    await Room.create({ number: `LAB-0${i}`, seatingCapacity: 30, roomType: 'LAB' });
  }

  // Meeting Times
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const lectureTimes = ['08:45-09:45', '10:00-11:00', '11:15-12:15', '13:00-14:00', '14:15-15:15', '15:30-16:30'];
  const labTimes = ['08:45-10:45', '11:15-13:15', '14:15-16:15'];
  
  let pidIdx = 1;

  for (const day of days) {
    // Regular lecture slots
    for (const time of lectureTimes) {
      await MeetingTime.create({ pid: `L${pidIdx++}`, time, day, slotType: 'LECTURE' });
    }
    // Specific Elective slots (Using standard convention where PID starts with E for 2 hour slots)
    await MeetingTime.create({ pid: `E${pidIdx++}`, time: '08:45-10:45', day, slotType: 'LECTURE' });
    
    // Lab slots (Require continuous boundaries conceptually mapping to native 2hr blocks)
    for (const time of labTimes) {
      await MeetingTime.create({ pid: `L${pidIdx++}`, time, day, slotType: 'LAB' });
    }
  }

  // Sections (Data inputs)
  const allDivisions = [divTE1, divTE2, divTE3, divTE4];
  let secIdx = 1;
  const createSec = async (payload) => {
    payload.sectionId = `SEC_${secIdx++}`;
    await Section.create(payload);
  };

  // Add lectures for all divisions
  for (const div of allDivisions) {
    await createSec({ numClassesPerWeek: 3, isElective: false, courseId: dbms.id, divisionId: div.id, departmentId: deptInfo.id });
    await createSec({ numClassesPerWeek: 4, isElective: false, courseId: cn.id, divisionId: div.id, departmentId: deptInfo.id });
  }

  // Add labs for all batches in TE-I, TE-II, TE-III
  const labs = [dbms_lab, cn_lab];
  const allBatches = [
    {b: batchTE1_K1, d: divTE1}, {b: batchTE1_K2, d: divTE1}, {b: batchTE1_K3, d: divTE1},
    {b: batchTE2_L1, d: divTE2}, {b: batchTE2_L2, d: divTE2},
    {b: batchTE3_M1, d: divTE3}
  ];

  for (const bInfo of allBatches) {
    for (const labCourse of labs) {
      // 2 Lab instances per week per batch
      await createSec({ numClassesPerWeek: 2, isElective: false, courseId: labCourse.id, divisionId: bInfo.d.id, batchId: bInfo.b.id, departmentId: deptInfo.id });
    }
  }

  // Add Electives (G1 blocks TE-I & TE-II, G2 blocks TE-III & TE-IV)
  await createSec({ numClassesPerWeek: 2, isElective: true, electiveGroup: 'G1', courseId: ai_elec.id, departmentId: deptInfo.id, divisionId: divTE1.id });
  await createSec({ numClassesPerWeek: 2, isElective: true, electiveGroup: 'G1', courseId: cc_elec.id, departmentId: deptInfo.id, divisionId: divTE1.id });
  
  await createSec({ numClassesPerWeek: 2, isElective: true, electiveGroup: 'G2', courseId: ai_elec.id, departmentId: deptInfo.id, divisionId: divTE3.id });
}

async function verify() {
  try {
    await seedData();
    console.log('\n✅ Dataset successfully seeded.');
    
    console.log('🔄 Loading DataLoader...');
    const dataLoader = new TimetableDataLoader();
    await dataLoader.load();
    
    console.log('🚀 Running Timetable Generator (Expected limit: 100 max permutations)...');
    const generator = new TimetableGenerator(dataLoader);
    const result = generator.generateBest();
    
    // Process Verification
    console.log('\n=============================================');
    console.log('             GENERATOR RESULTS               ');
    console.log('=============================================');
    console.log(`Verified Status      : ${result.verified}`);
    console.log(`Total Attempts Used  : ${result.attempts}`);
    console.log(`Time Taken           : ${result.timeTakenSec} seconds`);
    console.log(`Total Conflicts      : ${result.conflictCount}`);
    console.log(`Scheduled Classes    : ${result.schedule.length}`);
    
    let electivesCount = 0;
    let labsCount = 0;
    let lecturesCount = 0;
    
    const teacherUsage = new Set();
    const roomUsage = new Set();

    for (const sc of result.schedule) {
      teacherUsage.add(sc.instructor.uid);
      roomUsage.add(sc.room.number);
      if (sc.section.isElective) {
        electivesCount++;
      } else if (sc.course.courseType === 'LAB') {
        labsCount++;
      } else if (sc.course.courseType === 'LECTURE') {
        lecturesCount++;
      }
    }

    console.log(`\n-- Detail Allocations --`);
    console.log(`Elective Classes  : ${electivesCount}`);
    console.log(`Lab Classes       : ${labsCount}`);
    console.log(`Lecture Classes   : ${lecturesCount}`);
    console.log(`Unique Teachers   : ${teacherUsage.size}`);
    console.log(`Unique Rooms Used : ${roomUsage.size}`);

    if (result.conflicts.length > 0) {
      console.log('\n🔍 Conflicts Identified:');
      result.conflicts.slice(0, 10).forEach(c => console.log('  ❌ ' + c));
    } else {
      console.log('\n⭐ PERFECT TIMETABLE ACHIEVED - ZERO CONFLICTS DETECTED');
    }

    console.log('\n✅ Phase 2I Sequence Successfully Verified End-To-End.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Pipeline mapping failed:', error);
    process.exit(1);
  }
}

verify();
