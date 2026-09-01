import React, { useState } from 'react';
import { 
  CalendarCheck, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Calculator, 
  Plus, 
  Sparkles,
  Info
} from 'lucide-react';
import { Student, SubjectAttendance, AttendanceEntry } from '../types';
import { calculateOverallAttendance } from '../utils/mlEngine';

interface AttendanceTrackerProps {
  student: Student;
  onUpdateStudent: (updated: Student) => void;
}

export const AttendanceTracker: React.FC<AttendanceTrackerProps> = ({
  student,
  onUpdateStudent,
}) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    student.attendance[0]?.subjectId || ''
  );
  const [logStatus, setLogStatus] = useState<'present' | 'absent' | 'excused'>('present');
  const [logNotes, setLogNotes] = useState('');
  const [targetGoal, setTargetGoal] = useState<number>(75);

  const overallAttendance = calculateOverallAttendance(student.attendance);
  const isOverallAtRisk = overallAttendance < 75;

  // Find selected subject
  const currentSubject = student.attendance.find((a) => a.subjectId === selectedSubjectId) || student.attendance[0];

  const handleLogAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSubject) return;

    const isPresent = logStatus === 'present';

    // Update subject attendance counter
    const updatedAttendance = student.attendance.map((a) => {
      if (a.subjectId === currentSubject.subjectId) {
        const newTotal = a.totalClasses + (logStatus === 'excused' ? 0 : 1);
        const newAttended = a.attendedClasses + (isPresent ? 1 : 0);
        const newPercentage = newTotal > 0 ? Math.round((newAttended / newTotal) * 1000) / 10 : 0;
        return {
          ...a,
          totalClasses: newTotal,
          attendedClasses: newAttended,
          percentage: newPercentage,
          lastUpdated: new Date().toISOString().split('T')[0],
        };
      }
      return a;
    });

    const newEntry: AttendanceEntry = {
      id: `att-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      subjectId: currentSubject.subjectId,
      subjectName: currentSubject.subjectName,
      status: logStatus,
      notes: logNotes.trim() || undefined,
    };

    onUpdateStudent({
      ...student,
      attendance: updatedAttendance,
      attendanceHistory: [newEntry, ...(student.attendanceHistory || [])],
    });

    setLogNotes('');
  };

  // Helper to calculate needed classes to reach target %
  const calculateNeededClasses = (attended: number, total: number, target: number): { type: 'need_more' | 'can_skip'; count: number } => {
    const targetDecimal = target / 100;
    const currentRate = total > 0 ? attended / total : 0;

    if (currentRate < targetDecimal) {
      const numerator = targetDecimal * total - attended;
      const denominator = 1 - targetDecimal;
      const count = Math.max(1, Math.ceil(numerator / denominator));
      return { type: 'need_more', count };
    } else {
      const count = Math.max(0, Math.floor((attended - targetDecimal * total) / targetDecimal));
      return { type: 'can_skip', count };
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                <CalendarCheck className="w-4 h-4" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">Attendance & Compliance Tracking</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              University mandatory 75% threshold monitor and lecture participation records
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div
              className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1.5 ${
                isOverallAtRisk
                  ? 'bg-red-100 border-red-200 text-red-700'
                  : overallAttendance < 85
                  ? 'bg-amber-100 border-amber-200 text-amber-800'
                  : 'bg-green-100 border-green-200 text-green-700'
              }`}
            >
              {isOverallAtRisk ? (
                <>
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Below 75% Threshold (Exam Bar Risk)</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Exam Eligible ({overallAttendance}%)</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* High Density Attendance Stats Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cumulative Attendance</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span
                className={`text-2xl font-black ${
                  overallAttendance >= 85
                    ? 'text-green-600'
                    : overallAttendance >= 75
                    ? 'text-blue-600'
                    : 'text-red-600'
                }`}
              >
                {overallAttendance}%
              </span>
              <span className="text-xs text-slate-400 font-medium">
                ({student.attendance.reduce((s, a) => s + a.attendedClasses, 0)} /{' '}
                {student.attendance.reduce((s, a) => s + a.totalClasses, 0)} lectures)
              </span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-2">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  overallAttendance >= 85
                    ? 'bg-green-500'
                    : overallAttendance >= 75
                    ? 'bg-blue-600'
                    : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(100, overallAttendance)}%` }}
              />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Eligible Courses (75%+)</p>
            <p className="text-2xl font-black text-slate-800 mt-1">
              {student.attendance.filter((a) => a.percentage >= 75).length}{' '}
              <span className="text-xs font-normal text-slate-500">/ {student.attendance.length}</span>
            </p>
            <p className="text-[10px] text-slate-500 mt-1">
              {student.attendance.filter((a) => a.percentage < 75).length > 0 ? (
                <span className="text-red-600 font-bold">
                  ⚠️ {student.attendance.filter((a) => a.percentage < 75).length} course(s) below eligibility limit
                </span>
              ) : (
                <span className="text-green-600 font-bold">✓ 100% courses meet threshold</span>
              )}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-100">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1">
                <Calculator className="w-3.5 h-3.5" /> Recovery Solver
              </p>
              <select
                value={targetGoal}
                onChange={(e) => setTargetGoal(Number(e.target.value))}
                className="bg-white border border-blue-200 text-[10px] rounded px-2 py-0.5 font-bold text-blue-700"
              >
                <option value={75}>Goal: 75%</option>
                <option value={80}>Goal: 80%</option>
                <option value={85}>Goal: 85%</option>
                <option value={90}>Goal: 90%</option>
              </select>
            </div>
            <p className="text-xs text-slate-700 mt-1 font-medium">
              {(() => {
                const totalAtt = student.attendance.reduce((s, a) => s + a.attendedClasses, 0);
                const totalCls = student.attendance.reduce((s, a) => s + a.totalClasses, 0);
                const res = calculateNeededClasses(totalAtt, totalCls, targetGoal);
                if (res.type === 'need_more') {
                  return (
                    <span>
                      Must attend next <strong className="text-blue-700 font-bold">{res.count}</strong> lectures consecutively.
                    </span>
                  );
                } else {
                  return (
                    <span className="text-green-700">
                      Can safely miss up to <strong className="font-bold">{res.count}</strong> more classes.
                    </span>
                  );
                }
              })()}
            </p>
          </div>
        </div>
      </div>

      {/* Subject-Wise Attendance Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {student.attendance.map((sub) => {
          const isDanger = sub.percentage < 75;
          const isWarning = sub.percentage >= 75 && sub.percentage < 82;
          const recovery = calculateNeededClasses(sub.attendedClasses, sub.totalClasses, 75);

          return (
            <div
              key={sub.subjectId}
              className={`bg-white rounded-2xl border p-4 shadow-xs transition hover:shadow-sm ${
                isDanger
                  ? 'border-red-200 bg-red-50/10'
                  : isWarning
                  ? 'border-amber-200'
                  : 'border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                    {sub.subjectCode}
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{sub.subjectName}</h4>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                    isDanger
                      ? 'bg-red-100 text-red-700'
                      : isWarning
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-green-100 text-green-700'
                  }`}
                >
                  {sub.percentage}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden my-2.5">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isDanger ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(100, sub.percentage)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                <span>
                  Present: <strong className="text-slate-800 font-semibold">{sub.attendedClasses}</strong> / {sub.totalClasses}
                </span>
                <span className="text-[10px] text-slate-400">
                  Missed: {sub.totalClasses - sub.attendedClasses}
                </span>
              </div>

              {/* Recovery guidance pill */}
              <div className="mt-2.5 p-2 rounded-lg bg-slate-50 text-[10px] text-slate-600 flex items-center gap-1.5 font-medium">
                {isDanger ? (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                    <span>
                      Attend next <strong className="text-red-700 font-bold">{recovery.count}</strong> classes to clear bar
                    </span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                    <span>
                      Eligible • Buffer: <strong className="text-green-700 font-bold">{recovery.count}</strong> absences
                    </span>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Mark Attendance Action & Recent Log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Log Form */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
            <Plus className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-sm">Mark Lecture Attendance</h3>
          </div>

          <form onSubmit={handleLogAttendance} className="space-y-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Select Course</label>
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white font-medium"
              >
                {student.attendance.map((s) => (
                  <option key={s.subjectId} value={s.subjectId}>
                    {s.subjectCode} - {s.subjectName} ({s.percentage}%)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Status</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setLogStatus('present')}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold border flex items-center justify-center gap-1 transition ${
                    logStatus === 'present'
                      ? 'bg-green-100 border-green-300 text-green-700'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Present
                </button>
                <button
                  type="button"
                  onClick={() => setLogStatus('absent')}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold border flex items-center justify-center gap-1 transition ${
                    logStatus === 'absent'
                      ? 'bg-red-100 border-red-300 text-red-700'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <XCircle className="w-3.5 h-3.5" /> Absent
                </button>
                <button
                  type="button"
                  onClick={() => setLogStatus('excused')}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold border flex items-center justify-center gap-1 transition ${
                    logStatus === 'excused'
                      ? 'bg-amber-100 border-amber-300 text-amber-800'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" /> Excused
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Remarks</label>
              <input
                type="text"
                placeholder="e.g. Lab session, Event duty, Medical"
                value={logNotes}
                onChange={(e) => setLogNotes(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition shadow-xs shadow-blue-200 mt-2"
            >
              Record Today's Attendance
            </button>
          </form>
        </div>

        {/* Recent Attendance History Stream */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Recent Lecture Logs & Attendance Feed</h3>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">History</span>
            </div>

            {(!student.attendanceHistory || student.attendanceHistory.length === 0) ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                No recent attendance records logged yet.
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {student.attendanceHistory.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          entry.status === 'present'
                            ? 'bg-green-500'
                            : entry.status === 'absent'
                            ? 'bg-red-500'
                            : 'bg-amber-500'
                        }`}
                      />
                      <div>
                        <p className="font-semibold text-slate-800">{entry.subjectName}</p>
                        <p className="text-[10px] text-slate-500">
                          {entry.date} {entry.notes && `• ${entry.notes}`}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                        entry.status === 'present'
                          ? 'bg-green-100 text-green-700'
                          : entry.status === 'absent'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {entry.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <p className="text-[10px] text-slate-400 mt-3 pt-2 border-t border-slate-100 flex items-center gap-1 font-medium">
            <Info className="w-3.5 h-3.5 text-blue-500" /> Attendance updates automatically refresh logistic regression pass confidence.
          </p>
        </div>
      </div>
    </div>
  );
};
