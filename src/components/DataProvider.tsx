'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useSyncedData } from '@/hooks/useSyncedData';
import type {
  AppData,
  Subject,
  TimetableSlot,
  AttendanceLog,
  Holiday,
  SemesterConfig,
  OverallStats,
  AttendanceStats,
} from '@/types';
import type { Semester, SemesterData } from '@/types/database';

// Get the return type of useSyncedData
type UseSyncedDataResult = ReturnType<typeof useSyncedData>;

const DataContext = createContext<UseSyncedDataResult | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const syncedData = useSyncedData();

  return (
    <DataContext.Provider value={syncedData}>
      {children}
    </DataContext.Provider>
  );
}

export function useData(): UseSyncedDataResult {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}

// Backwards compatibility export
export { useData as useAttendanceData };
