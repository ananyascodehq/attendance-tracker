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
    zero_credit_type: 'library' as 'library' | 'seminar' | 'vac',
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleAdd = () => {
    // For library/seminar, auto-set the name
    const effectiveName = newSubject.credits === 0 && (newSubject.zero_credit_type === 'library' || newSubject.zero_credit_type === 'seminar')
      ? newSubject.zero_credit_type.charAt(0).toUpperCase() + newSubject.zero_credit_type.slice(1)
      : newSubject.subject_name;

    if (!effectiveName) {
      alert('Please fill in subject name');
      return;
    }

    // For non-zero-credit subjects, subject code is required
    if (newSubject.credits !== 0 && !newSubject.subject_code) {
      alert('Subject code is required for non-zero-credit subjects');
      return;
    }

    // For VAC (0-credit), subject code is also required
    if (newSubject.credits === 0 && newSubject.zero_credit_type === 'vac' && !newSubject.subject_code) {
      alert('Subject code is required for VAC (Value Added Course)');
      return;
    }

    // Check for duplicate codes (only if code exists)
    if (newSubject.subject_code && subjects.some(s => s.subject_code === newSubject.subject_code)) {
      alert('Subject code already exists');
      return;
    }

    // For 0-credit library/seminar without code, use subject name as identifier
    const subjectToAdd: Subject = newSubject.credits === 0 && !newSubject.subject_code
      ? { subject_name: effectiveName, subject_code: undefined, credits: 0, zero_credit_type: newSubject.zero_credit_type }
      : { ...newSubject, subject_name: effectiveName, zero_credit_type: newSubject.credits === 0 ? newSubject.zero_credit_type : undefined };

    onUpdate([...subjects, subjectToAdd]);
    setNewSubject({ subject_code: '', subject_name: '', credits: 3, zero_credit_type: 'library' });
  };

  const handleDelete = (identifier: string | undefined) => {
    const subject = subjects.find(s => s.subject_code === identifier);
    const displayName = subject?.subject_name || identifier || 'Subject';
    if (confirm(`Delete subject ${displayName}?`)) {
      onUpdate(subjects.filter(s => s.subject_code !== identifier));
    }
  };

  const handleEdit = (identifier: string | undefined, field: string, value: any) => {
    onUpdate(
      subjects.map(s =>
        s.subject_code === identifier ? { ...s, [field]: value } : s
      )
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Add New Subject</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {newSubject.credits === 0 ? (
            <>
              <select
                value={newSubject.zero_credit_type}
                onChange={(e) =>
                  setNewSubject({ 
                    ...newSubject, 
                    zero_credit_type: e.target.value as 'library' | 'seminar' | 'vac',
                    subject_code: e.target.value === 'vac' ? newSubject.subject_code : ''
                  })
                }
                className="border rounded px-3 py-2 text-sm"
              >
                <option value="library">Library</option>
                <option value="seminar">Seminar</option>
                <option value="vac">VAC</option>
              </select>
              {newSubject.zero_credit_type === 'vac' ? (
                <>
                  <input
                    type="text"
                    placeholder="VAC Code (required)"
                    value={newSubject.subject_code}
                    onChange={(e) =>
                      setNewSubject({ ...newSubject, subject_code: e.target.value.toUpperCase() })
                    }
                    className="border rounded px-3 py-2 font-mono text-sm"
                  />
                  <input
                    type="text"
                    placeholder="VAC Name"
                    value={newSubject.subject_name}
                    onChange={(e) =>
                      setNewSubject({ ...newSubject, subject_name: e.target.value })
                    }
                    className="border rounded px-3 py-2"
                  />
                </>
              ) : (
                <div className="md:col-span-2 text-gray-400 px-3 py-2 text-xs flex items-center italic">
                  (auto-named)
                </div>
              )}
            </>
          ) : (
            <>
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
                className="border rounded px-3 py-2 md:col-span-2"
              />
            </>
          )}
          <select
            value={newSubject.credits}
            onChange={(e) =>
              setNewSubject({ ...newSubject, credits: parseFloat(e.target.value) as 0 | 1.5 | 3 | 4, subject_code: '', zero_credit_type: 'library' })
            }
            className="border rounded px-3 py-2"
          >
            <option value={3}>3 Credits</option>
            <option value={4}>4 Credits</option>
            <option value={1.5}>1.5 Credits (Lab)</option>
            <option value={0}>0 Credits (Library/Seminar/VAC)</option>
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
              <th className="px-6 py-3 text-left text-sm font-semibold">Type</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((subject) => (
              <tr key={subject.subject_code || subject.subject_name} className="border-t hover:bg-gray-50">
                <td className="px-6 py-3 font-mono text-sm">{subject.subject_code || '-'}</td>
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
                    <option value={0}>0</option>
                    <option value={1.5}>1.5</option>
                    <option value={3}>3</option>
                    <option value={4}>4</option>
                  </select>
                </td>
                <td className="px-6 py-3 text-sm">
                  {subject.zero_credit_type ? (
                    <span className="capitalize font-medium">
                      {subject.zero_credit_type === 'vac' ? 'VAC' : subject.zero_credit_type}
                    </span>
                  ) : (
                    '-'
                  )}
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
