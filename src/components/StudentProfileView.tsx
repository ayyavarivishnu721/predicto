import React, { useState } from 'react';
import { 
  User, 
  BookOpen, 
  Mail, 
  Calendar, 
  Clock, 
  Moon, 
  Flame, 
  CheckCircle2, 
  Sparkles, 
  Edit3, 
  Building2, 
  AlertTriangle,
  TrendingUp
} from 'lucide-react';
import { Student } from '../types';
import { calculateOverallAttendance, calculateAverageMarks } from '../utils/mlEngine';

interface StudentProfileViewProps {
  student: Student;
  onUpdateStudent: (updated: Student) => void;
}

export const StudentProfileView: React.FC<StudentProfileViewProps> = ({
  student,
  onUpdateStudent,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: student.name,
    department: student.department,
    semester: student.semester,
    advisorName: student.advisorName,
    weeklyStudyHours: student.habits.weeklyStudyHours,
    dailySleepHours: student.habits.dailySleepHours,
    assignmentCompletionRate: student.habits.assignmentCompletionRate,
    stressLevel: student.habits.stressLevel,
    hasPeerStudyGroup: student.habits.hasPeerStudyGroup,
    hasPrivateTutor: student.habits.hasPrivateTutor,
  });

  const overallAttendance = calculateOverallAttendance(student.attendance);
  const avgInternalMarks = calculateAverageMarks(student.marks);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: Student = {
      ...student,
      name: editForm.name,
      department: editForm.department,
      semester: Number(editForm.semester),
      advisorName: editForm.advisorName,
      habits: {
        ...student.habits,
        weeklyStudyHours: Number(editForm.weeklyStudyHours),
        dailySleepHours: Number(editForm.dailySleepHours),
        assignmentCompletionRate: Number(editForm.assignmentCompletionRate),
        stressLevel: editForm.stressLevel as 'Low' | 'Moderate' | 'High',
        hasPeerStudyGroup: editForm.hasPeerStudyGroup,
        hasPrivateTutor: editForm.hasPrivateTutor,
      },
    };
    onUpdateStudent(updated);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Profile Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5">
            <div className="relative">
              <img
                src={student.avatarUrl}
                alt={student.name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border border-slate-200 shadow-xs"
              />
              <span
                className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${
                  student.enrollmentStatus === 'Active' ? 'bg-green-500' : 'bg-amber-500'
                }`}
                title={`Status: ${student.enrollmentStatus}`}
              />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-lg sm:text-xl font-bold text-slate-900">{student.name}</h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 font-mono">
                  {student.studentId}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  Semester {student.semester}
                </span>
                {student.cgpa < 6.0 && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 border border-red-200 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> At Risk
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-600 mt-2">
                <div className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>{student.department}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{student.email}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Advisor: <strong className="font-semibold text-slate-800">{student.advisorName}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Year: {student.academicYear}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="edit-profile-btn"
              onClick={() => {
                setEditForm({
                  name: student.name,
                  department: student.department,
                  semester: student.semester,
                  advisorName: student.advisorName,
                  weeklyStudyHours: student.habits.weeklyStudyHours,
                  dailySleepHours: student.habits.dailySleepHours,
                  assignmentCompletionRate: student.habits.assignmentCompletionRate,
                  stressLevel: student.habits.stressLevel,
                  hasPeerStudyGroup: student.habits.hasPeerStudyGroup,
                  hasPrivateTutor: student.habits.hasPrivateTutor,
                });
                setIsEditing(true);
              }}
              className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition shadow-2xs"
            >
              <Edit3 className="w-3.5 h-3.5 text-slate-500" />
              <span>Edit Profile & Habits</span>
            </button>
          </div>
        </div>

        {/* Quick Snapshot KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-100">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Cumulative GPA</p>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className={`text-xl font-bold ${student.cgpa >= 8 ? 'text-green-600' : student.cgpa >= 6.5 ? 'text-blue-600' : 'text-red-600'}`}>
                {student.cgpa.toFixed(2)}
              </span>
              <span className="text-xs text-slate-400 font-medium">/ 10.0</span>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Overall Attendance</p>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className={`text-xl font-bold ${overallAttendance >= 85 ? 'text-green-600' : overallAttendance >= 75 ? 'text-amber-600' : 'text-red-600'}`}>
                {overallAttendance}%
              </span>
              <span className="text-xs text-slate-400 font-medium">{overallAttendance >= 75 ? 'Eligible' : 'Caution'}</span>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Internal Test Avg</p>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-xl font-bold text-slate-800">{avgInternalMarks}</span>
              <span className="text-xs text-slate-400 font-medium">/ 100</span>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Active Subjects</p>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-xl font-bold text-slate-800">{student.marks.length}</span>
              <span className="text-xs text-slate-400 font-medium">Courses</span>
            </div>
          </div>
        </div>
      </div>

      {/* Academic & Lifestyle Habits Scorecard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Study Habits Card */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                <Clock className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Study Habits & Behavioral Profile</h3>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ML Inputs</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                <Clock className="w-3.5 h-3.5 text-blue-500" />
                <span className="font-medium text-[11px]">Weekly Study Hours</span>
              </div>
              <p className="text-base font-bold text-slate-800">{student.habits.weeklyStudyHours} hrs / wk</p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                {student.habits.weeklyStudyHours >= 15 ? 'Excellent commitment' : student.habits.weeklyStudyHours >= 8 ? 'Moderate pace' : 'Below 12h baseline'}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                <Moon className="w-3.5 h-3.5 text-indigo-500" />
                <span className="font-medium text-[11px]">Daily Sleep</span>
              </div>
              <p className="text-base font-bold text-slate-800">{student.habits.dailySleepHours} hrs / day</p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                {student.habits.dailySleepHours >= 7 ? 'Optimal cognitive rest' : 'Mild sleep deficit'}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                <span className="font-medium text-[11px]">Assignments Done</span>
              </div>
              <p className="text-base font-bold text-slate-800">{student.habits.assignmentCompletionRate}%</p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                {student.habits.assignmentCompletionRate >= 85 ? 'Consistently on-time' : 'Requires reminders'}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                <span className="font-medium text-[11px]">Stress Level</span>
              </div>
              <p className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                {student.habits.stressLevel}
                <span
                  className={`w-2 h-2 rounded-full ${
                    student.habits.stressLevel === 'High'
                      ? 'bg-red-500'
                      : student.habits.stressLevel === 'Moderate'
                      ? 'bg-amber-500'
                      : 'bg-green-500'
                  }`}
                />
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">Self-reported load</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                <Building2 className="w-3.5 h-3.5 text-cyan-500" />
                <span className="font-medium text-[11px]">Library Visits</span>
              </div>
              <p className="text-sm font-bold text-slate-800">{student.habits.libraryVisitsPerMonth} / mo</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Campus resource usage</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                <span className="font-medium text-[11px]">Study Group</span>
              </div>
              <p className="text-sm font-bold text-slate-800">
                {student.habits.hasPeerStudyGroup ? 'Active in Group' : 'Solo Studying'}
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">Peer collaboration</p>
            </div>
          </div>
        </div>

        {/* GPA History Timeline */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center border border-green-100">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">GPA Progression</h3>
              </div>
              <span className="text-xs font-bold text-slate-800">{student.cgpa} Cumulative</span>
            </div>

            <p className="text-xs text-slate-500 mb-4">Historic semester performance records</p>

            <div className="space-y-2">
              {student.gpaHistory.map((g) => (
                <div key={g.semester} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[10px]">
                      S{g.semester}
                    </span>
                    <span className="text-slate-700 font-semibold text-xs">Semester {g.semester}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 text-[10px]">{g.credits} Credits</span>
                    <span className={`font-bold text-xs ${g.gpa >= 8.5 ? 'text-green-600' : g.gpa >= 7 ? 'text-blue-600' : g.gpa >= 5.5 ? 'text-amber-600' : 'text-red-600'}`}>
                      {g.gpa.toFixed(2)} GPA
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Total Credits Earned: {student.gpaHistory.reduce((s, g) => s + g.credits, 0)} pts
            </span>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">Edit Profile & Study Habits</h3>
              </div>
              <button
                onClick={() => setIsEditing(false)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    required
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={editForm.department}
                    onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                    required
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Semester</label>
                  <select
                    value={editForm.semester}
                    onChange={(e) => setEditForm({ ...editForm, semester: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Advisor Name</label>
                  <input
                    type="text"
                    value={editForm.advisorName}
                    onChange={(e) => setEditForm({ ...editForm, advisorName: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Habit & Lifestyle Adjustments
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Weekly Study Hours ({editForm.weeklyStudyHours}h)
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={35}
                      value={editForm.weeklyStudyHours}
                      onChange={(e) => setEditForm({ ...editForm, weeklyStudyHours: Number(e.target.value) })}
                      className="w-full accent-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Daily Sleep Hours ({editForm.dailySleepHours}h)
                    </label>
                    <input
                      type="range"
                      min={4}
                      max={11}
                      step={0.5}
                      value={editForm.dailySleepHours}
                      onChange={(e) => setEditForm({ ...editForm, dailySleepHours: Number(e.target.value) })}
                      className="w-full accent-blue-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Assignment Rate ({editForm.assignmentCompletionRate}%)
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={editForm.assignmentCompletionRate}
                      onChange={(e) => setEditForm({ ...editForm, assignmentCompletionRate: Number(e.target.value) })}
                      className="w-full accent-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Stress Level</label>
                    <select
                      value={editForm.stressLevel}
                      onChange={(e) => setEditForm({ ...editForm, stressLevel: e.target.value as any })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    >
                      <option value="Low">Low Stress</option>
                      <option value="Moderate">Moderate Stress</option>
                      <option value="High">High Stress</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-6 mt-3 pt-2">
                  <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editForm.hasPeerStudyGroup}
                      onChange={(e) => setEditForm({ ...editForm, hasPeerStudyGroup: e.target.checked })}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>Has Study Group</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editForm.hasPrivateTutor}
                      onChange={(e) => setEditForm({ ...editForm, hasPrivateTutor: e.target.checked })}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>Has Private Tutor</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs shadow-blue-200"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
