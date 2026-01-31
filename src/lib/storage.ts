import { AppData } from '@/types';
import { STORAGE_KEYS } from './constants';
import { initializeSampleData } from './sampleData';

const getStorage = (): Storage | null => {
  if (typeof window !== 'undefined') {
    return window.localStorage;
  }
  return null;
};

export const loadAppData = (): AppData => {
  const storage = getStorage();

  if (!storage) {
    return getDefaultAppData();
  }

  return {
    subjects: JSON.parse(storage.getItem(STORAGE_KEYS.SUBJECTS) || '[]'),
    timetable: JSON.parse(storage.getItem(STORAGE_KEYS.TIMETABLE) || '[]'),
    attendance: JSON.parse(storage.getItem(STORAGE_KEYS.ATTENDANCE) || '[]'),
    holidays: JSON.parse(storage.getItem(STORAGE_KEYS.HOLIDAYS) || '[]'),
    semester_config: JSON.parse(
      storage.getItem(STORAGE_KEYS.SEMESTER_CONFIG) || '{"start_date":"","end_date":"","last_instruction_date":""}'
    ),
  };
};

export const saveAppData = (data: AppData): void => {
  const storage = getStorage();

  if (!storage) return;

  storage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(data.subjects));
  storage.setItem(STORAGE_KEYS.TIMETABLE, JSON.stringify(data.timetable));
  storage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(data.attendance));
  storage.setItem(STORAGE_KEYS.HOLIDAYS, JSON.stringify(data.holidays));
  storage.setItem(STORAGE_KEYS.SEMESTER_CONFIG, JSON.stringify(data.semester_config));
};

export const exportData = (data: AppData): string => {
  return JSON.stringify(data, null, 2);
};

export const importData = (jsonString: string): AppData => {
  return JSON.parse(jsonString);
};

export const getDefaultAppData = (): AppData => {
  return initializeSampleData();
};
