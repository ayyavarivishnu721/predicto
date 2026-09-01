import React, { useState } from 'react';
import { 
  Users, 
  ShieldAlert, 
  TrendingUp, 
  CalendarCheck, 
  Download, 
  Search, 
  Filter, 
  ArrowUpRight
} from 'lucide-react';
import { Student } from '../types';
import { computeCohortStats, runMLPrediction, calculateOverallAttendance, calculateAverageMarks } from '../utils/mlEngine';

interface AdminDashboardProps {
  students: Student[];
  onSelectStudent: (studentId: string) => void;
  onNavigateToTab: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  students,
  onSelectStudent,
  onNavigateToTab,
}) => {
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const stats = computeCohortStats(students);

  // Filter students
  const filteredStudents = students.filter((s) => {
    const matchesDept = selectedDept === 'All' || s.department === selectedDept;
    const prediction = runMLPrediction(s);
    const matchesRisk = selectedRiskFilter === 'All' || prediction.riskLevel === selectedRiskFilter;
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.department.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesRisk && matchesSearch;
  });

  const departments = ['All', ...Array.from(new Set(students.map((s) => s.department)))];

  const handleExportCSV = () => {
    const headers = ['ID', 'Name', 'Department', 'Semester', 'CGPA', 'Attendance %', 'Predicted Score', 'Predicted Grade', 'Risk Level'];
    const rows = students.map((s) => {
      const pred = runMLPrediction(s);
      const att = calculateOverallAttendance(s.attendance);
      return [
        s.studentId,
        `"${s.name}"`,
        `"${s.department}"`,
        s.semester,
        s.cgpa,
        att,
        pred.predictedScore,
        pred.predictedGrade,
        pred.riskLevel,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `cohort_academic_predictions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                <Users className="w-4 h-4" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">Institutional Faculty & Admin Dashboard</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Cohort-wide academic analytics, early risk mitigation, and performance forecasting
            </p>
          </div>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs self-start sm:self-auto"
          >
            <Download className="w-4 h-4 text-blue-600" />
            <span>Export Cohort CSV</span>
          </button>
        </div>

        {/* 4 Metric KPI Cards (High Density) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center justify-between text-slate-500 text-[10px] uppercase font-bold tracking-wider">
              <span>Total Enrolled</span>
              <Users className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <p className="text-2xl font-black text-slate-900 mt-1">{stats.totalStudents}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Active Academic Profiles</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center justify-between text-slate-500 text-[10px] uppercase font-bold tracking-wider">
              <span>Cohort Avg Score</span>
              <TrendingUp className="w-3.5 h-3.5 text-green-600" />
            </div>
            <p className="text-2xl font-black text-slate-900 mt-1">{stats.averageScore}%</p>
            <p className="text-[10px] text-green-600 mt-0.5 font-semibold">Predicted Cohort Mean</p>
          </div>

          <div className="p-4 rounded-xl bg-red-50/40 border border-red-100">
            <div className="flex items-center justify-between text-red-700 text-[10px] uppercase font-bold tracking-wider">
              <span>At-Risk Flagged</span>
              <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
            </div>
            <p className="text-2xl font-black text-red-700 mt-1">{stats.atRiskCount}</p>
            <p className="text-[10px] text-red-600 mt-0.5 font-semibold">Requires Faculty Support</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center justify-between text-slate-500 text-[10px] uppercase font-bold tracking-wider">
              <span>Avg Attendance</span>
              <CalendarCheck className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <p className="text-2xl font-black text-slate-900 mt-1">{stats.averageAttendance}%</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Compliance Rate</p>
          </div>
        </div>
      </div>

      {/* Roster Controls & Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative max-w-sm w-full">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by student name, ID, or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <Filter className="w-3 h-3" /> Dept:
            </div>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="bg-white border border-slate-200 text-xs rounded-lg px-2.5 py-1 text-slate-700 font-semibold"
            >
              {departments.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold uppercase tracking-wider text-[10px] ml-2">
              Risk:
            </div>
            <select
              value={selectedRiskFilter}
              onChange={(e) => setSelectedRiskFilter(e.target.value)}
              className="bg-white border border-slate-200 text-xs rounded-lg px-2.5 py-1 text-slate-700 font-semibold"
            >
              <option value="All">All Risk Profiles</option>
              <option value="Critical">Critical Risk</option>
              <option value="High">High Risk</option>
              <option value="Medium">Medium Risk</option>
              <option value="Low">Low Risk</option>
            </select>
          </div>
        </div>

        {/* Cohort Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="py-3 px-6 font-bold text-slate-500 text-[10px] uppercase tracking-wider">Student Profile</th>
                <th className="py-3 px-3 font-bold text-slate-500 text-[10px] uppercase tracking-wider">Department</th>
                <th className="py-3 px-3 text-center font-bold text-slate-500 text-[10px] uppercase tracking-wider">CGPA</th>
                <th className="py-3 px-3 text-center font-bold text-slate-500 text-[10px] uppercase tracking-wider">Attendance</th>
                <th className="py-3 px-3 text-center font-bold text-slate-500 text-[10px] uppercase tracking-wider">Avg Marks</th>
                <th className="py-3 px-3 text-center font-bold text-slate-500 text-[10px] uppercase tracking-wider">ML Predicted</th>
                <th className="py-3 px-3 text-center font-bold text-slate-500 text-[10px] uppercase tracking-wider">Risk Level</th>
                <th className="py-3 px-6 text-right font-bold text-slate-500 text-[10px] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((s) => {
                const pred = runMLPrediction(s);
                const att = calculateOverallAttendance(s.attendance);
                const avgM = calculateAverageMarks(s.marks);

                return (
                  <tr key={s.id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={s.avatar}
                          alt={s.name}
                          className="w-7 h-7 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <span className="font-bold text-slate-900 text-xs block">{s.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {s.studentId} • Sem {s.semester}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-3 font-medium text-slate-700 text-xs">{s.department}</td>
                    <td className="py-3.5 px-3 text-center font-bold text-slate-800 text-xs">{s.cgpa}</td>

                    <td className="py-3.5 px-3 text-center text-xs">
                      <span
                        className={`font-semibold ${
                          att < 75 ? 'text-red-600' : att < 85 ? 'text-amber-600' : 'text-green-600'
                        }`}
                      >
                        {att}%
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-center font-medium text-slate-800 text-xs">{avgM} / 100</td>

                    <td className="py-3.5 px-3 text-center text-xs">
                      <div className="font-black text-blue-700">
                        {pred.predictedScore}%
                        <span className="ml-1 text-[10px] text-slate-400 font-normal">({pred.predictedGrade})</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          pred.riskLevel === 'Critical'
                            ? 'bg-red-100 text-red-700'
                            : pred.riskLevel === 'High'
                            ? 'bg-orange-100 text-orange-700'
                            : pred.riskLevel === 'Medium'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {pred.riskLevel}
                      </span>
                    </td>

                    <td className="py-3.5 px-6 text-right">
                      <button
                        onClick={() => {
                          onSelectStudent(s.id);
                          onNavigateToTab('prediction');
                        }}
                        className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-xs font-semibold transition flex items-center gap-1 ml-auto border border-blue-100"
                      >
                        <span>Inspect Profile</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
