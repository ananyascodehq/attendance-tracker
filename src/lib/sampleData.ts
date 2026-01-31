import { AppData, Subject, TimetableSlot, SemesterConfig } from '@/types';

export const SAMPLE_SEMESTER_CONFIG: SemesterConfig = {
  start_date: '2026-01-05',
  end_date: '2026-05-30',
  last_instruction_date: '2026-05-15',
};

export const SAMPLE_SUBJECTS: Subject[] = [
  {
    subject_code: 'CS101',
    subject_name: 'Data Structures',
    credits: 4,
  },
  {
    subject_code: 'CS102',
    subject_name: 'Web Development',
    credits: 4,
  },
  {
    subject_code: 'CS103',
    subject_name: 'Database Systems',
    credits: 3,
  },
  {
    subject_code: 'CS104',
    subject_name: 'Operating Systems',
    credits: 4,
  },
];

export const SAMPLE_TIMETABLE: TimetableSlot[] = [
  // Monday
  { id: 'mon-1-cs101', day_of_week: 'Monday', period_number: 1, subject_code: 'CS101', start_time: '09:00', end_time: '10:00', duration_hours: 1 },
  { id: 'mon-3-cs102', day_of_week: 'Monday', period_number: 3, subject_code: 'CS102', start_time: '11:00', end_time: '12:00', duration_hours: 1 },

  // Tuesday
  { id: 'tue-2-cs103', day_of_week: 'Tuesday', period_number: 2, subject_code: 'CS103', start_time: '10:00', end_time: '11:00', duration_hours: 1 },
  { id: 'tue-4-cs104', day_of_week: 'Tuesday', period_number: 4, subject_code: 'CS104', start_time: '12:00', end_time: '13:00', duration_hours: 1 },

  // Wednesday
  { id: 'wed-1-cs102', day_of_week: 'Wednesday', period_number: 1, subject_code: 'CS102', start_time: '09:00', end_time: '10:00', duration_hours: 1 },
  { id: 'wed-3-cs101', day_of_week: 'Wednesday', period_number: 3, subject_code: 'CS101', start_time: '11:00', end_time: '12:00', duration_hours: 1 },

  // Thursday
  { id: 'thu-2-cs104', day_of_week: 'Thursday', period_number: 2, subject_code: 'CS104', start_time: '10:00', end_time: '11:00', duration_hours: 1 },
  { id: 'thu-5-cs103', day_of_week: 'Thursday', period_number: 5, subject_code: 'CS103', start_time: '13:00', end_time: '14:00', duration_hours: 1 },

  // Friday
  { id: 'fri-1-cs103', day_of_week: 'Friday', period_number: 1, subject_code: 'CS103', start_time: '09:00', end_time: '10:00', duration_hours: 1 },
  { id: 'fri-3-cs104', day_of_week: 'Friday', period_number: 3, subject_code: 'CS104', start_time: '11:00', end_time: '12:00', duration_hours: 1 },
  { id: 'fri-4-cs102', day_of_week: 'Friday', period_number: 4, subject_code: 'CS102', start_time: '12:00', end_time: '13:00', duration_hours: 1 },
];

export const initializeSampleData = (): AppData => {
  return {
    subjects: SAMPLE_SUBJECTS,
    timetable: SAMPLE_TIMETABLE,
    attendance: [],
    holidays: [
      { date: '2026-01-26', description: 'Republic Day' },
      { date: '2026-03-08', description: 'Maha Shivaratri' },
      { date: '2026-03-25', description: 'Holi' },
      { date: '2026-04-14', description: 'Ambedkar Jayanti' },
    ],
    semester_config: SAMPLE_SEMESTER_CONFIG,
  };
};
