'use client';

import { useState } from 'react';
import { useAttendanceData } from '@/hooks/useAttendanceData';
import { LeaveSimulator } from '@/components/LeaveSimulator';
import { Subject } from '@/types';

export default function PlannerPage() {
  const { data, updateData, isLoading } = useAttendanceData();
  const [newSubject, setNewSubject] = useState({ code: '', name: '', credits: 3 as 3 | 4 });
  const [semesterEndDate, setSemesterEndDate] = useState(data?.semester_end_date || '');

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!data) {
    return <div className="text-center">No data found</div>;
  }

  const handleAddSubject = () => {
    if (newSubject.code && newSubject.name) {
      const subject: Subject = {
        subject_code: newSubject.code,
        subject_name: newSubject.name,
        credits: newSubject.credits,
      };

      updateData({
        ...data,
        subjects: [...data.subjects, subject],
      });

      setNewSubject({ code: '', name: '', credits: 3 });
    }
  };

  const handleSetSemesterEnd = () => {
    updateData({
      ...data,
      semester_end_date: semesterEndDate,
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-2">Planner & Setup</h1>
        <p className="text-gray-600">Configure your semester details and timetable</p>
      </div>

      {/* Semester Setup */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Semester Configuration</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Semester End Date</label>
            <div className="flex gap-2">
              <input
                type="date"
                value={semesterEndDate}
                onChange={(e) => setSemesterEndDate(e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2"
              />
              <button
                onClick={handleSetSemesterEnd}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Subject Setup */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Add Subjects</h2>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">Subject Code</label>
            <input
              type="text"
              value={newSubject.code}
              onChange={(e) => setNewSubject({ ...newSubject, code: e.target.value })}
              placeholder="e.g., CS101"
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Subject Name</label>
            <input
              type="text"
              value={newSubject.name}
              onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
              placeholder="e.g., Data Structures"
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Credits</label>
            <select
              value={newSubject.credits}
              onChange={(e) =>
                setNewSubject({ ...newSubject, credits: parseInt(e.target.value) as 3 | 4 })
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
            >
              <option value={3}>3</option>
              <option value={4}>4</option>
            </select>
          </div>

          <button
            onClick={handleAddSubject}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
          >
            Add Subject
          </button>
        </div>

        {data.subjects.length > 0 && (
          <div>
            <h3 className="text-lg font-medium mb-3">Added Subjects</h3>
            <div className="space-y-2">
              {data.subjects.map((subject) => (
                <div
                  key={subject.subject_code}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{subject.subject_name}</p>
                    <p className="text-xs text-gray-500">{subject.subject_code}</p>
                  </div>
                  <span className="text-sm text-gray-600">{subject.credits} credits</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Planning Tools */}
      {data.subjects.length > 0 && (
        <LeaveSimulator
          stats={data.subjects.map((s) => ({
            subject_code: s.subject_code,
            subject_name: s.subject_name,
            credits: s.credits,
            total_classes: 35,
            present: 28,
            absent: 5,
            od: 2,
            percentage: 86,
            status: 'safe' as const,
          }))}
        />
      )}
    </div>
  );
}
