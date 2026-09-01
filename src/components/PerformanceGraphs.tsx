import React, { useState } from 'react';
import { 
  BarChart2, 
  TrendingUp, 
  Layers
} from 'lucide-react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { Student } from '../types';
import { runMLPrediction, calculateAverageMarks, calculateOverallAttendance } from '../utils/mlEngine';

interface PerformanceGraphsProps {
  student: Student;
  allStudents: Student[];
}

export const PerformanceGraphs: React.FC<PerformanceGraphsProps> = ({
  student,
  allStudents,
}) => {
  const [activeTab, setActiveTab] = useState<'radar' | 'trend' | 'correlation' | 'cohort'>('radar');

  const prediction = runMLPrediction(student);
  const avgInternalMarks = calculateAverageMarks(student.marks);
  const overallAttendance = calculateOverallAttendance(student.attendance);

  // 1. Radar Chart Data: Subjects with Score vs Attendance
  const radarData = student.marks.map((m) => {
    const att = student.attendance.find((a) => a.subjectId === m.subjectId);
    return {
      subject: m.subjectCode || m.subjectName.split(' ')[0],
      fullName: m.subjectName,
      Marks: m.totalInternal,
      Attendance: att ? att.percentage : 80,
    };
  });

  // 2. Score Progression Across Test Categories
  const progressionData = student.marks.map((m) => ({
    subject: m.subjectCode,
    fullName: m.subjectName,
    'Internal 1 (scaled 100)': Math.round((m.internal1 / 30) * 100),
    'Internal 2 (scaled 100)': Math.round((m.internal2 / 30) * 100),
    'Assignments (scaled 100)': Math.round((m.assignmentScore / 20) * 100),
    'Quizzes (scaled 100)': Math.round((m.quizScore / 20) * 100),
    'Total Score': m.totalInternal,
  }));

  // 3. Correlation Data: Attendance % vs Final Internal Marks
  const correlationData = student.marks.map((m) => {
    const att = student.attendance.find((a) => a.subjectId === m.subjectId);
    return {
      name: m.subjectCode,
      attendance: att ? att.percentage : 0,
      marks: m.totalInternal,
      status: m.totalInternal >= 80 ? 'Distinction' : m.totalInternal >= 50 ? 'Pass' : 'Critical',
    };
  });

  // 4. Cohort Distribution Comparison
  const cohortScores = allStudents.map((s) => {
    const p = runMLPrediction(s);
    return {
      name: s.name,
      studentId: s.studentId,
      score: p.predictedScore,
      cgpa: s.cgpa * 10,
      isCurrentStudent: s.id === student.id,
    };
  }).sort((a, b) => a.score - b.score);

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                <BarChart2 className="w-4 h-4" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">Academic Analytics & Visual Insights</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Multi-axial competencies, test trajectory, attendance correlation, and cohort benchmark
            </p>
          </div>

          {/* Graph View Selector (High Density buttons) */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 overflow-x-auto">
            <button
              onClick={() => setActiveTab('radar')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition ${
                activeTab === 'radar'
                  ? 'bg-white text-blue-600 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Competency Radar
            </button>
            <button
              onClick={() => setActiveTab('trend')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition ${
                activeTab === 'trend'
                  ? 'bg-white text-blue-600 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Test Trajectory
            </button>
            <button
              onClick={() => setActiveTab('correlation')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition ${
                activeTab === 'correlation'
                  ? 'bg-white text-blue-600 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Attendance Impact
            </button>
            <button
              onClick={() => setActiveTab('cohort')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition ${
                activeTab === 'cohort'
                  ? 'bg-white text-blue-600 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Cohort Standings
            </button>
          </div>
        </div>

        {/* Dynamic Chart Container */}
        <div className="mt-5">
          {activeTab === 'radar' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Subject Competency Radar</h3>
                  <p className="text-xs text-slate-500">
                    Dual-axis comparison of Total Marks vs Class Attendance % per subject
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1.5 font-bold text-blue-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" /> Internal Marks
                  </span>
                  <span className="flex items-center gap-1.5 font-bold text-green-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" /> Attendance %
                  </span>
                </div>
              </div>

              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 10, fontWeight: 700 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#cbd5e1" />
                    <Radar
                      name="Internal Marks"
                      dataKey="Marks"
                      stroke="#2563eb"
                      fill="#3b82f6"
                      fillOpacity={0.35}
                    />
                    <Radar
                      name="Attendance"
                      dataKey="Attendance"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.2}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', borderRadius: '10px', borderColor: '#e2e8f0', fontSize: '11px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {activeTab === 'trend' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Test Component Progression</h3>
                  <p className="text-xs text-slate-500">
                    Normalized performance across Internal Exam 1, Exam 2, Assignments, and Quizzes
                  </p>
                </div>
              </div>

              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={progressionData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 10, fontWeight: 700 }} />
                    <YAxis domain={[0, 100]} tick={{ fill: '#475569', fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', borderRadius: '10px', borderColor: '#e2e8f0', fontSize: '11px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    <Line type="monotone" dataKey="Internal 1 (scaled 100)" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="Internal 2 (scaled 100)" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="Assignments (scaled 100)" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="Total Score" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {activeTab === 'correlation' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Attendance vs Subject Marks Correlation</h3>
                  <p className="text-xs text-slate-500">
                    Direct visual comparison illustrating how class presence drives internal test mastery
                  </p>
                </div>
              </div>

              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={correlationData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 10, fontWeight: 700 }} />
                    <YAxis domain={[0, 100]} tick={{ fill: '#475569', fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', borderRadius: '10px', borderColor: '#e2e8f0', fontSize: '11px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    <Bar dataKey="attendance" name="Attendance %" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="marks" name="Internal Marks (/100)" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {activeTab === 'cohort' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Class Cohort Benchmark Standings</h3>
                  <p className="text-xs text-slate-500">
                    Comparative predicted score distribution across all students in the database
                  </p>
                </div>
                <div className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
                  {student.name}: {prediction.predictedScore}% (Grade {prediction.predictedGrade})
                </div>
              </div>

              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cohortScores} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 10 }} interval={0} angle={-25} textAnchor="end" />
                    <YAxis domain={[0, 100]} tick={{ fill: '#475569', fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', borderRadius: '10px', borderColor: '#e2e8f0', fontSize: '11px' }}
                    />
                    <Bar dataKey="score" name="Predicted Score %" radius={[4, 4, 0, 0]}>
                      {cohortScores.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.isCurrentStudent ? '#2563eb' : entry.score < 55 ? '#ef4444' : '#94a3b8'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
