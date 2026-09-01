import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Plus, 
  Edit2, 
  Check, 
  X, 
  Award, 
  AlertCircle, 
  TrendingUp, 
  TrendingDown,
  Trash2
} from 'lucide-react';
import { Student, SubjectMarks } from '../types';
import { mapScoreToGrade } from '../utils/mlEngine';

interface MarksManagerProps {
  student: Student;
  onUpdateStudent: (updated: Student) => void;
}

export const MarksManager: React.FC<MarksManagerProps> = ({
  student,
  onUpdateStudent,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRow, setEditRow] = useState<SubjectMarks | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newSubject, setNewSubject] = useState<SubjectMarks>({
    subjectId: '',
    subjectName: '',
    subjectCode: '',
    internal1: 25,
    internal2: 25,
    assignmentScore: 16,
    quizScore: 16,
    totalInternal: 82,
    credits: 4,
  });

  const handleStartEdit = (m: SubjectMarks) => {
    setEditingId(m.subjectId);
    setEditRow({ ...m });
  };

  const handleSaveRow = () => {
    if (!editRow) return;
    const totalInternal =
      Number(editRow.internal1 || 0) +
      Number(editRow.internal2 || 0) +
      Number(editRow.assignmentScore || 0) +
      Number(editRow.quizScore || 0);

    const updatedMarks = student.marks.map((m) =>
      m.subjectId === editRow.subjectId ? { ...editRow, totalInternal } : m
    );

    onUpdateStudent({
      ...student,
      marks: updatedMarks,
    });
    setEditingId(null);
    setEditRow(null);
  };

  const handleAddNewSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.subjectName.trim()) return;

    const subjectId = `sub-${Date.now()}`;
    const totalInternal =
      Number(newSubject.internal1 || 0) +
      Number(newSubject.internal2 || 0) +
      Number(newSubject.assignmentScore || 0) +
      Number(newSubject.quizScore || 0);

    const created: SubjectMarks = {
      ...newSubject,
      subjectId,
      totalInternal,
    };

    const newAttendance = {
      subjectId,
      subjectName: created.subjectName,
      subjectCode: created.subjectCode || 'GEN-101',
      totalClasses: 35,
      attendedClasses: 30,
      percentage: 85.7,
      lastUpdated: new Date().toISOString().split('T')[0],
    };

    onUpdateStudent({
      ...student,
      marks: [...student.marks, created],
      attendance: [...student.attendance, newAttendance],
    });

    setIsAddingNew(false);
    setNewSubject({
      subjectId: '',
      subjectName: '',
      subjectCode: '',
      internal1: 25,
      internal2: 25,
      assignmentScore: 16,
      quizScore: 16,
      totalInternal: 82,
      credits: 4,
    });
  };

  const handleDeleteSubject = (subjectId: string) => {
    if (confirm('Remove this course evaluation record?')) {
      onUpdateStudent({
        ...student,
        marks: student.marks.filter((m) => m.subjectId !== subjectId),
        attendance: student.attendance.filter((a) => a.subjectId !== subjectId),
      });
    }
  };

  const avgMarks =
    student.marks.length > 0
      ? Math.round(
          (student.marks.reduce((sum, m) => sum + m.totalInternal, 0) / student.marks.length) * 10
        ) / 10
      : 0;

  const highestScoring = [...student.marks].sort((a, b) => b.totalInternal - a.totalInternal)[0];
  const lowestScoring = [...student.marks].sort((a, b) => a.totalInternal - b.totalInternal)[0];

  return (
    <div className="space-y-6">
      {/* Top Banner & High Density Vital Stats */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">Academic Marks Management</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Subject-wise continuous evaluation tracking: Internal 1 (30), Internal 2 (30), Assignments (20), Quizzes (20)
            </p>
          </div>

          <button
            id="add-subject-marks-btn"
            onClick={() => setIsAddingNew(true)}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-xs shadow-blue-200 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Course Assessment</span>
          </button>
        </div>

        {/* High Density Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Internal Average</p>
              <p className="text-2xl font-black text-slate-800 mt-1">{avgMarks} <span className="text-xs text-slate-400 font-normal">/ 100</span></p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-black text-sm">
              {mapScoreToGrade(avgMarks)}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-green-600 uppercase tracking-wider flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> Top Mastery Course
              </p>
              <p className="text-xs font-bold text-slate-900 mt-1 truncate max-w-[180px]">
                {highestScoring ? highestScoring.subjectName : 'None'}
              </p>
            </div>
            <span className="text-base font-black text-green-600">
              {highestScoring ? `${highestScoring.totalInternal}%` : '-'}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider flex items-center gap-1">
                <TrendingDown className="w-3 h-3" /> Needs Attention
              </p>
              <p className="text-xs font-bold text-slate-900 mt-1 truncate max-w-[180px]">
                {lowestScoring ? lowestScoring.subjectName : 'None'}
              </p>
            </div>
            <span className={`text-base font-black ${lowestScoring && lowestScoring.totalInternal < 50 ? 'text-red-600' : 'text-slate-800'}`}>
              {lowestScoring ? `${lowestScoring.totalInternal}%` : '-'}
            </span>
          </div>
        </div>
      </div>

      {/* Marks Matrix Table (High Density Theme) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Course Evaluation Matrix</h3>
            <p className="text-xs text-slate-500">
              Detailed assessment component breakdown with editable parameters
            </p>
          </div>
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
            {student.marks.length} Courses Enrolled
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="py-3 px-6 font-bold text-slate-500 text-[10px] uppercase tracking-wider">Course Details</th>
                <th className="py-3 px-3 text-center font-bold text-slate-500 text-[10px] uppercase tracking-wider">Int 1 (/30)</th>
                <th className="py-3 px-3 text-center font-bold text-slate-500 text-[10px] uppercase tracking-wider">Int 2 (/30)</th>
                <th className="py-3 px-3 text-center font-bold text-slate-500 text-[10px] uppercase tracking-wider">Assign (/20)</th>
                <th className="py-3 px-3 text-center font-bold text-slate-500 text-[10px] uppercase tracking-wider">Quiz (/20)</th>
                <th className="py-3 px-3 text-center font-bold text-slate-500 text-[10px] uppercase tracking-wider">Total (/100)</th>
                <th className="py-3 px-3 text-center font-bold text-slate-500 text-[10px] uppercase tracking-wider">Grade</th>
                <th className="py-3 px-6 text-right font-bold text-slate-500 text-[10px] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {student.marks.map((m) => {
                const isRowEditing = editingId === m.subjectId;
                const isCritical = m.totalInternal < 50;
                const grade = mapScoreToGrade(m.totalInternal);

                if (isRowEditing && editRow) {
                  return (
                    <tr key={m.subjectId} className="bg-blue-50/40">
                      <td className="py-3 px-6">
                        <input
                          type="text"
                          value={editRow.subjectName}
                          onChange={(e) => setEditRow({ ...editRow, subjectName: e.target.value })}
                          className="w-full px-2 py-1 bg-white border border-blue-300 rounded text-xs font-semibold"
                        />
                        <input
                          type="text"
                          value={editRow.subjectCode}
                          onChange={(e) => setEditRow({ ...editRow, subjectCode: e.target.value })}
                          className="w-24 mt-1 px-2 py-0.5 bg-white border border-blue-200 rounded text-[10px] text-slate-500 font-mono"
                        />
                      </td>
                      <td className="py-3 px-3 text-center">
                        <input
                          type="number"
                          min={0}
                          max={30}
                          value={editRow.internal1}
                          onChange={(e) => setEditRow({ ...editRow, internal1: Number(e.target.value) })}
                          className="w-14 px-1.5 py-1 text-center bg-white border border-blue-300 rounded text-xs font-bold"
                        />
                      </td>
                      <td className="py-3 px-3 text-center">
                        <input
                          type="number"
                          min={0}
                          max={30}
                          value={editRow.internal2}
                          onChange={(e) => setEditRow({ ...editRow, internal2: Number(e.target.value) })}
                          className="w-14 px-1.5 py-1 text-center bg-white border border-blue-300 rounded text-xs font-bold"
                        />
                      </td>
                      <td className="py-3 px-3 text-center">
                        <input
                          type="number"
                          min={0}
                          max={20}
                          value={editRow.assignmentScore}
                          onChange={(e) => setEditRow({ ...editRow, assignmentScore: Number(e.target.value) })}
                          className="w-14 px-1.5 py-1 text-center bg-white border border-blue-300 rounded text-xs font-bold"
                        />
                      </td>
                      <td className="py-3 px-3 text-center">
                        <input
                          type="number"
                          min={0}
                          max={20}
                          value={editRow.quizScore}
                          onChange={(e) => setEditRow({ ...editRow, quizScore: Number(e.target.value) })}
                          className="w-14 px-1.5 py-1 text-center bg-white border border-blue-300 rounded text-xs font-bold"
                        />
                      </td>
                      <td className="py-3 px-3 text-center font-black text-slate-900">
                        {Number(editRow.internal1 || 0) +
                          Number(editRow.internal2 || 0) +
                          Number(editRow.assignmentScore || 0) +
                          Number(editRow.quizScore || 0)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="px-2 py-0.5 rounded font-bold text-blue-700 bg-blue-100 text-[10px]">
                          {mapScoreToGrade(
                            Number(editRow.internal1 || 0) +
                              Number(editRow.internal2 || 0) +
                              Number(editRow.assignmentScore || 0) +
                              Number(editRow.quizScore || 0)
                          )}
                        </span>
                      </td>
                      <td className="py-3 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={handleSaveRow}
                            className="p-1.5 bg-green-600 hover:bg-green-700 text-white rounded transition"
                            title="Save"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingId(null);
                              setEditRow(null);
                            }}
                            className="p-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded transition"
                            title="Cancel"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr
                    key={m.subjectId}
                    className={`hover:bg-slate-50 transition ${isCritical ? 'bg-red-50/20' : ''}`}
                  >
                    <td className="py-3.5 px-6">
                      <div className="font-bold text-slate-900 text-xs">{m.subjectName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {m.subjectCode} • {m.credits} Credits
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-center font-medium text-slate-700">{m.internal1}</td>
                    <td className="py-3.5 px-3 text-center font-medium text-slate-700">{m.internal2}</td>
                    <td className="py-3.5 px-3 text-center font-medium text-slate-700">{m.assignmentScore}</td>
                    <td className="py-3.5 px-3 text-center font-medium text-slate-700">{m.quizScore}</td>
                    <td className="py-3.5 px-3 text-center">
                      <span className={`font-bold ${isCritical ? 'text-red-600' : m.totalInternal >= 80 ? 'text-green-600' : 'text-slate-900'}`}>
                        {m.totalInternal}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          grade === 'A+' || grade === 'A'
                            ? 'bg-green-100 text-green-700'
                            : grade === 'B+' || grade === 'B'
                            ? 'bg-blue-100 text-blue-700'
                            : grade === 'C'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {grade}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleStartEdit(m)}
                          className="p-1 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded transition"
                          title="Edit marks"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteSubject(m.subjectId)}
                          className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                          title="Delete course"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New Subject Modal */}
      {isAddingNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">Add Course Assessment</h3>
              </div>
              <button
                onClick={() => setIsAddingNew(false)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAddNewSubject} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Subject Name</label>
                <input
                  type="text"
                  placeholder="e.g. Distributed Operating Systems"
                  value={newSubject.subjectName}
                  onChange={(e) => setNewSubject({ ...newSubject, subjectName: e.target.value })}
                  required
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Subject Code</label>
                  <input
                    type="text"
                    placeholder="e.g. CS608"
                    value={newSubject.subjectCode}
                    onChange={(e) => setNewSubject({ ...newSubject, subjectCode: e.target.value })}
                    required
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Credits</label>
                  <select
                    value={newSubject.credits}
                    onChange={(e) => setNewSubject({ ...newSubject, credits: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold"
                  >
                    {[1, 2, 3, 4, 5].map((c) => (
                      <option key={c} value={c}>{c} Credits</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Internal 1 (/30)</label>
                  <input
                    type="number"
                    min={0}
                    max={30}
                    value={newSubject.internal1}
                    onChange={(e) => setNewSubject({ ...newSubject, internal1: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Internal 2 (/30)</label>
                  <input
                    type="number"
                    min={0}
                    max={30}
                    value={newSubject.internal2}
                    onChange={(e) => setNewSubject({ ...newSubject, internal2: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Assignment (/20)</label>
                  <input
                    type="number"
                    min={0}
                    max={20}
                    value={newSubject.assignmentScore}
                    onChange={(e) => setNewSubject({ ...newSubject, assignmentScore: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Quiz / Lab (/20)</label>
                  <input
                    type="number"
                    min={0}
                    max={20}
                    value={newSubject.quizScore}
                    onChange={(e) => setNewSubject({ ...newSubject, quizScore: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold"
                  />
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-between text-xs mt-2">
                <span className="text-blue-900 font-medium">Computed Total:</span>
                <span className="font-black text-blue-700 text-sm">
                  {Number(newSubject.internal1 || 0) +
                    Number(newSubject.internal2 || 0) +
                    Number(newSubject.assignmentScore || 0) +
                    Number(newSubject.quizScore || 0)}{' '}
                  / 100
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs shadow-blue-200"
                >
                  Save Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
