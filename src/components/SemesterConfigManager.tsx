'use client';

import { SemesterConfig, Holiday, CATExamPeriod } from '@/types';
import { useState } from 'react';

interface SemesterConfigManagerProps {
  config: SemesterConfig;
  holidays: Holiday[];
  onConfigUpdate: (config: SemesterConfig) => void;
  onHolidaysUpdate: (holidays: Holiday[]) => void;
}

export default function SemesterConfigManager({
  config,
  holidays,
  onConfigUpdate,
  onHolidaysUpdate,
}: SemesterConfigManagerProps) {
  const [newHoliday, setNewHoliday] = useState({
    date: '',
    description: '',
  });

  const [newCAT, setNewCAT] = useState({
    name: '',
    start_date: '',
    end_date: '',
  });

  const handleConfigChange = (field: keyof SemesterConfig, value: string) => {
    onConfigUpdate({
      ...config,
      [field]: value,
    });
  };

  const addHoliday = () => {
    if (!newHoliday.date || !newHoliday.description) {
      alert('Please fill in all fields');
      return;
    }

    if (holidays.some((h) => h.date === newHoliday.date)) {
      alert('Holiday already exists on this date');
      return;
    }

    onHolidaysUpdate([...holidays, newHoliday]);
    setNewHoliday({ date: '', description: '' });
  };

  const deleteHoliday = (date: string) => {
    onHolidaysUpdate(holidays.filter((h) => h.date !== date));
  };

  const addCATPeriod = () => {
    if (!newCAT.name || !newCAT.start_date || !newCAT.end_date) {
      alert('Please fill in all CAT fields');
      return;
    }

    if (new Date(newCAT.start_date) > new Date(newCAT.end_date)) {
      alert('Start date must be before end date');
      return;
    }

    const newCATEntry: CATExamPeriod = {
      id: `cat-${Date.now()}`,
      name: newCAT.name,
      start_date: newCAT.start_date,
      end_date: newCAT.end_date,
    };

    onConfigUpdate({
      ...config,
      cat_periods: [...(config.cat_periods || []), newCATEntry],
    });

    setNewCAT({ name: '', start_date: '', end_date: '' });
  };

  const deleteCATPeriod = (id: string) => {
    onConfigUpdate({
      ...config,
      cat_periods: (config.cat_periods || []).filter((cat) => cat.id !== id),
    });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const calculateDays = (startDate: string, endDate: string) => {
    return Math.ceil(
      (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)
    ) + 1;
  };

  return (
    <div className="space-y-6">
      {/* Semester Configuration */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Semester Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">Semester Start Date</label>
            <input
              type="date"
              value={config.start_date}
              onChange={(e) => handleConfigChange('start_date', e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 w-full dark:bg-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">Semester End Date</label>
            <input
              type="date"
              value={config.end_date}
              onChange={(e) => handleConfigChange('end_date', e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 w-full dark:bg-gray-900 dark:text-white"
            />
          </div>
        </div>

        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded text-sm text-blue-800 dark:text-blue-300">
          <strong>Semester Duration:</strong> {formatDate(config.start_date)} to{' '}
          {formatDate(config.end_date)} (
          {Math.ceil(
            (new Date(config.end_date).getTime() - new Date(config.start_date).getTime()) /
              (1000 * 60 * 60 * 24)
          )}{' '}
          days)
        </div>
      </div>

      {/* Holidays Management */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Holidays</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">Date</label>
            <input
              type="date"
              value={newHoliday.date}
              onChange={(e) => setNewHoliday({ ...newHoliday, date: e.target.value })}
              className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 w-full dark:bg-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">Description</label>
            <input
              type="text"
              placeholder="e.g., Republic Day"
              value={newHoliday.description}
              onChange={(e) => setNewHoliday({ ...newHoliday, description: e.target.value })}
              className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 w-full dark:bg-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={addHoliday}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
            >
              Add Holiday
            </button>
          </div>
        </div>

        {holidays.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-sm italic">No holidays added yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {holidays
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .map((holiday) => (
                <div
                  key={holiday.date}
                  className="flex items-center justify-between bg-gray-50 dark:bg-gray-900 p-3 rounded border border-gray-200 dark:border-gray-700"
                >
                  <div>
                    <div className="font-medium text-sm text-gray-900 dark:text-white">{holiday.description}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{formatDate(holiday.date)}</div>
                  </div>
                  <button
                    onClick={() => deleteHoliday(holiday.date)}
                    className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-sm font-medium"
                  >
                    Remove
                  </button>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* CAT Exam Periods */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">📝 CAT Exam Periods</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          Add CAT exam periods to exclude them from attendance calculations (no classes during exams).
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">CAT Name</label>
            <select
              value={newCAT.name}
              onChange={(e) => setNewCAT({ ...newCAT, name: e.target.value })}
              className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 w-full dark:bg-gray-900 dark:text-white"
            >
              <option value="">Select CAT</option>
              <option value="CAT 1">CAT 1</option>
              <option value="CAT 2">CAT 2</option>
              <option value="CAT 3">CAT 3</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">Start Date</label>
            <input
              type="date"
              value={newCAT.start_date}
              onChange={(e) => setNewCAT({ ...newCAT, start_date: e.target.value })}
              className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 w-full dark:bg-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">End Date</label>
            <input
              type="date"
              value={newCAT.end_date}
              onChange={(e) => setNewCAT({ ...newCAT, end_date: e.target.value })}
              className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 w-full dark:bg-gray-900 dark:text-white"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={addCATPeriod}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 w-full"
            >
              Add CAT Period
            </button>
          </div>
        </div>

        {(!config.cat_periods || config.cat_periods.length === 0) ? (
          <p className="text-gray-500 dark:text-gray-400 text-sm italic">No CAT periods added yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {config.cat_periods
              .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
              .map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between bg-purple-50 dark:bg-purple-900/30 p-3 rounded border border-purple-200 dark:border-purple-700"
                >
                  <div>
                    <div className="font-medium text-sm text-purple-900 dark:text-purple-300">{cat.name}</div>
                    <div className="text-xs text-purple-700 dark:text-purple-400">
                      {formatDate(cat.start_date)} - {formatDate(cat.end_date)} ({calculateDays(cat.start_date, cat.end_date)} days)
                    </div>
                  </div>
                  <button
                    onClick={() => deleteCATPeriod(cat.id)}
                    className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-sm font-medium"
                  >
                    Remove
                  </button>
                </div>
              ))}
          </div>
        )}
      </div>

      <div className="bg-amber-50 dark:bg-amber-900/30 rounded-lg p-4 text-sm text-amber-800 dark:text-amber-300">
        ⚠️ <strong>Note:</strong> Holidays and CAT periods exclude those days from the denominator in attendance
        calculations. Sundays are automatically excluded.
      </div>
    </div>
  );
}
