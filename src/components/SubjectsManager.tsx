'use client';

import { useState } from 'react';
import { Subject } from '@/types';

interface SubjectsManagerProps {
  subjects: Subject[];
  onUpdate: (subjects: Subject[]) => void;
}

export default function SubjectsManager({ subjects, onUpdate }: SubjectsManagerProps) {
  const [newSubject, setNewSubject] = useState({
    subject_code: '',
    subject_name: '',
    credits: 3 as 0 | 1.5 | 3 | 4,
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleAdd = () => {
    if (!newSubject.subject_code || !newSubject.subject_name) {
      alert('Please fill in all fields');
      return;
    }

    if (subjects.some(s => s.subject_code === newSubject.subject_code)) {
      alert('Subject code already exists');
      return;
    }

    onUpdate([...subjects, newSubject]);
    setNewSubject({ subject_code: '', subject_name: '', credits: 3 });
  };

  const handleDelete = (code: string) => {
    if (confirm(`Delete subject ${code}?`)) {
      onUpdate(subjects.filter(s => s.subject_code !== code));
    }
  };

  const handleEdit = (code: string, field: string, value: any) => {
    onUpdate(
      subjects.map(s =>
        s.subject_code === code ? { ...s, [field]: value } : s
      )
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Add New Subject</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Subject Code (e.g., CS101)"
            value={newSubject.subject_code}
            onChange={(e) =>
              setNewSubject({ ...newSubject, subject_code: e.target.value.toUpperCase() })
            }
            className="border rounded px-3 py-2 font-mono text-sm"
          />
          <input
            type="text"
            placeholder="Subject Name"
            value={newSubject.subject_name}
            onChange={(e) =>
              setNewSubject({ ...newSubject, subject_name: e.target.value })
            }
            className="border rounded px-3 py-2"
          />
          <select
            value={newSubject.credits}
            onChange={(e) =>
              setNewSubject({ ...newSubject, credits: parseFloat(e.target.value) as 0 | 1.5 | 3 | 4 })
            }
            className="border rounded px-3 py-2"
          >
            <option value={0}>0 Credits (Library/Seminar/VAC)</option>
            <option value={1.5}>1.5 Credits (Lab)</option>
            <option value={3}>3 Credits</option>
            <option value={4}>4 Credits</option>
          </select>
          <button
            onClick={handleAdd}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Add Subject
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold">Code</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Credits</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((subject) => (
              <tr key={subject.subject_code} className="border-t hover:bg-gray-50">
                <td className="px-6 py-3 font-mono text-sm">{subject.subject_code}</td>
                <td className="px-6 py-3">
                  <input
                    type="text"
                    value={subject.subject_name}
                    onChange={(e) =>
                      handleEdit(subject.subject_code, 'subject_name', e.target.value)
                    }
                    className="border rounded px-2 py-1 w-full"
                  />
                </td>
                <td className="px-6 py-3">
                  <select
                    value={subject.credits}
                    onChange={(e) =>
                      handleEdit(subject.subject_code, 'credits', parseFloat(e.target.value))
                    }
                    className="border rounded px-2 py-1"
                  >
                    <option value={1.5}>1.5</option>
                    <option value={3}>3</option>
                    <option value={4}>4</option>
                  </select>
                </td>
                <td className="px-6 py-3">
                  <button
                    onClick={() => handleDelete(subject.subject_code)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
