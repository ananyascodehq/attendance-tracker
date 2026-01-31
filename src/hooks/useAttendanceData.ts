'use client';

import { useState, useEffect } from 'react';
import { AppData } from '@/types';
import { loadAppData, saveAppData } from '@/lib/storage';

export const useAttendanceData = () => {
  const [data, setData] = useState<AppData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadedData = loadAppData();
    setData(loadedData);
    setIsLoading(false);
  }, []);

  const updateData = (newData: AppData) => {
    setData(newData);
    saveAppData(newData);
  };

  return {
    data,
    isLoading,
    updateData,
  };
};
