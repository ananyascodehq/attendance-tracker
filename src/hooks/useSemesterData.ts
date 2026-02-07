'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { createClient } from '@/lib/supabase/client';
import * as db from '@/lib/supabase/database';
import type { SemesterData, Semester } from '@/types/database';

interface UseSemesterDataResult {
  data: SemesterData | null;
  semesters: Semester[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  setActiveSemester: (semesterId: string) => Promise<void>;
}

export function useSemesterData(): UseSemesterDataResult {
  const { user } = useAuth();
  const [data, setData] = useState<SemesterData | null>(null);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadData = useCallback(async () => {
    if (!user) {
      setData(null);
      setSemesters([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Load all semesters and active semester data in parallel
      const [allSemesters, activeData] = await Promise.all([
        db.getSemesters(),
        db.getActiveSemesterData(),
      ]);

      setSemesters(allSemesters);
      setData(activeData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load data'));
    } finally {
      setLoading(false);
    }
  }, [user]);

  const setActiveSemester = useCallback(async (semesterId: string) => {
    try {
      await db.updateSemester(semesterId, { is_active: true });
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to switch semester'));
    }
  }, [loadData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user || !data?.semester?.id) return;

    const supabase = createClient();
    const semesterId = data.semester.id;

    // Subscribe to changes in relevant tables
    const channel = supabase
      .channel(`semester-${semesterId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'subjects', filter: `semester_id=eq.${semesterId}` },
        () => loadData()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'timetable_slots', filter: `semester_id=eq.${semesterId}` },
        () => loadData()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'attendance_logs', filter: `semester_id=eq.${semesterId}` },
        () => loadData()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'holidays', filter: `semester_id=eq.${semesterId}` },
        () => loadData()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'cat_periods', filter: `semester_id=eq.${semesterId}` },
        () => loadData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, data?.semester?.id, loadData]);

  return {
    data,
    semesters,
    loading,
    error,
    refresh: loadData,
    setActiveSemester,
  };
}

// Hook for just listing semesters (lighter weight)
export function useSemesters() {
  const { user } = useAuth();
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadSemesters = useCallback(async () => {
    if (!user) {
      setSemesters([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await db.getSemesters();
      setSemesters(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load semesters'));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadSemesters();
  }, [loadSemesters]);

  return { semesters, loading, error, refresh: loadSemesters };
}
