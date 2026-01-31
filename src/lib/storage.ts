import { AppData } from '@/types';
import { STORAGE_KEYS } from './constants';

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
    od_logs: JSON.parse(storage.getItem(STORAGE_KEYS.OD_LOGS) || '[]'),
    semester_end_date: storage.getItem(STORAGE_KEYS.SEMESTER_END_DATE) || '',
  };
};

export const saveAppData = (data: AppData): void => {
  const storage = getStorage();

  if (!storage) return;

  storage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(data.subjects));
  storage.setItem(STORAGE_KEYS.TIMETABLE, JSON.stringify(data.timetable));
  storage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(data.attendance));
  storage.setItem(STORAGE_KEYS.HOLIDAYS, JSON.stringify(data.holidays));
  storage.setItem(STORAGE_KEYS.OD_LOGS, JSON.stringify(data.od_logs));
  storage.setItem(STORAGE_KEYS.SEMESTER_END_DATE, data.semester_end_date);
};

export const exportData = (data: AppData): string => {
  return JSON.stringify(data, null, 2);
};

export const importData = (jsonString: string): AppData => {
  return JSON.parse(jsonString);
};

export const getDefaultAppData = (): AppData => {
  return {
    subjects: [],
    timetable: [],
    attendance: [],
    holidays: [],
    od_logs: [],
    semester_end_date: '',
  };
};
