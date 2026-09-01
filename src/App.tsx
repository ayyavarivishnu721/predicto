import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BrainCircuit, 
  RotateCcw, 
  CheckCircle2,
  CalendarCheck,
  ShieldAlert,
  GraduationCap
} from 'lucide-react';

import { Student, UserRole } from './types';
import { loadStudents, saveStudents, resetToInitialData, getActiveStudentId, setActiveStudentId } from './utils/storage';
import { runMLPrediction, calculateOverallAttendance, calculateAverageMarks } from './utils/mlEngine';

import { Navbar } from './components/Navbar';
import { MLPredictionCard } from './components/MLPredictionCard';
import { MarksManager } from './components/MarksManager';
import { AttendanceTracker } from './components/AttendanceTracker';
import { PerformanceGraphs } from './components/PerformanceGraphs';
import { WhatIfSimulator } from './components/WhatIfSimulator';
import { AtRiskDetector } from './components/AtRiskDetector';
import { PersonalizedRecommendations } from './components/PersonalizedRecommendations';
import { AdminDashboard } from './components/AdminDashboard';
import { StudentProfileView } from './components/StudentProfileView';
import { StudentLoginModal } from './components/StudentLoginModal';

export default function App() {
  const [students, setStudents] = useState<Student[]>([]);
  const [currentStudentId, setCurrentStudentId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('prediction');
  const [role, setRole] = useState<UserRole>('student');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initialize data on mount
  useEffect(() => {
    const loaded = loadStudents();
    setStudents(loaded);

    const savedActiveId = getActiveStudentId();
    if (savedActiveId && loaded.some((s) => s.id === savedActiveId)) {
      setCurrentStudentId(savedActiveId);
    } else if (loaded.length > 0) {
      setCurrentStudentId(loaded[0].id);
      setActiveStudentId(loaded[0].id);
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const currentStudent = students.find((s) => s.id === currentStudentId) || students[0];

  const handleSelectStudent = (id: string) => {
    setCurrentStudentId(id);
    setActiveStudentId(id);
    showToast(`Active profile switched: ${students.find((s) => s.id === id)?.name}`);
  };

  const handleUpdateStudent = (updated: Student) => {
    const nextStudents = students.map((s) => (s.id === updated.id ? updated : s));
    setStudents(nextStudents);
    saveStudents(nextStudents);
    showToast(`Updated academic records for ${updated.name}`);
  };

  const handleResetData = () => {
    if (confirm('Reset student records and predictions to default initial state?')) {
      const initial = resetToInitialData();
      setStudents(initial);
      if (initial.length > 0) {
        setCurrentStudentId(initial[0].id);
        setActiveStudentId(initial[0].id);
      }
      showToast('Database reset to baseline student cohort.');
    }
  };

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    if (newRole === 'admin') {
      setActiveTab('admin');
      showToast('Switched to Institutional Admin Dashboard');
    } else if (newRole === 'faculty') {
      setActiveTab('at-risk');
      showToast('Switched to Faculty Early Warning Mode');
    } else {
      setActiveTab('prediction');
      showToast('Switched to Student Portal');
    }
  };

  if (!currentStudent) {
    return (
      <div className="min-h-screen bg-[#F1F5F9] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center mx-auto mb-3 animate-spin shadow-md shadow-blue-500/30">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Loading EduPredict High Density Suite...</p>
        </div>
      </div>
    );
  }

  const prediction = runMLPrediction(currentStudent);
  const overallAttendance = calculateOverallAttendance(currentStudent.attendance);
  const avgMarks = calculateAverageMarks(currentStudent.marks);

  return (
    <div className="flex min-h-screen bg-[#F1F5F9] text-[#0F172A] font-sans antialiased overflow-x-hidden selection:bg-blue-600 selection:text-white">
      {/* High Density Layout: Left Sidebar + Main Area */}
      <Navbar
        currentStudent={currentStudent}
        allStudents={students}
        activeTab={activeTab}
        role={role}
        predictedScore={prediction.predictedScore}
        predictedGrade={prediction.predictedGrade}
        riskLevel={prediction.riskLevel}
        onSelectStudent={handleSelectStudent}
        onTabChange={setActiveTab}
        onRoleChange={handleRoleChange}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onResetData={handleResetData}
        onOpenAddStudentModal={() => setActiveTab('profile')}
      />

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-y-auto">
        {/* Dynamic Context Header Bar */}
        <div className="bg-white border-b border-slate-200/90 px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">{currentStudent.name}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold uppercase">
                  {currentStudent.studentId}
                </span>
                <span className="text-[10px] text-slate-500 font-medium hidden sm:inline">
                  • {currentStudent.department} (Sem {currentStudent.semester})
                </span>
              </div>
            </div>
          </div>

          {/* Quick High-Density Status Indicators */}
          <div className="flex items-center gap-2 sm:gap-4 text-xs font-semibold">
            <div className="px-2.5 py-1 rounded-md bg-blue-50/80 border border-blue-200/80 text-blue-800 flex items-center gap-1.5 text-[11px]">
              <BrainCircuit className="w-3.5 h-3.5 text-blue-600" />
              <span>Forecast: <strong>{prediction.predictedScore}%</strong> (Grade {prediction.predictedGrade})</span>
            </div>

            <div
              className={`px-2.5 py-1 rounded-md border flex items-center gap-1.5 text-[11px] ${
                overallAttendance < 75
                  ? 'bg-red-50 border-red-200 text-red-700'
                  : 'bg-green-50 border-green-200 text-green-700'
              }`}
            >
              <CalendarCheck className="w-3.5 h-3.5" />
              <span>Att: <strong>{overallAttendance}%</strong></span>
            </div>

            <div
              className={`hidden md:flex px-2.5 py-1 rounded-md border items-center gap-1.5 text-[11px] ${
                prediction.riskLevel === 'Critical' || prediction.riskLevel === 'High'
                  ? 'bg-red-50 border-red-200 text-red-700'
                  : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Risk: <strong>{prediction.riskLevel}</strong></span>
            </div>
          </div>
        </div>

        {/* View Main Content Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab + currentStudent.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.12 }}
            >
              {activeTab === 'prediction' && (
                <MLPredictionCard
                  student={currentStudent}
                  onNavigateToSimulator={() => setActiveTab('simulator')}
                />
              )}

              {activeTab === 'marks' && (
                <MarksManager
                  student={currentStudent}
                  onUpdateStudent={handleUpdateStudent}
                />
              )}

              {activeTab === 'attendance' && (
                <AttendanceTracker
                  student={currentStudent}
                  onUpdateStudent={handleUpdateStudent}
                />
              )}

              {activeTab === 'graphs' && (
                <PerformanceGraphs
                  student={currentStudent}
                  allStudents={students}
                />
              )}

              {activeTab === 'simulator' && (
                <WhatIfSimulator student={currentStudent} />
              )}

              {activeTab === 'at-risk' && (
                <AtRiskDetector
                  student={currentStudent}
                  onUpdateStudent={handleUpdateStudent}
                />
              )}

              {activeTab === 'recommendations' && (
                <PersonalizedRecommendations student={currentStudent} />
              )}

              {activeTab === 'admin' && (
                <AdminDashboard
                  students={students}
                  onSelectStudent={handleSelectStudent}
                  onNavigateToTab={setActiveTab}
                />
              )}

              {activeTab === 'profile' && (
                <StudentProfileView
                  student={currentStudent}
                  onUpdateStudent={handleUpdateStudent}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* High Density Footer */}
        <footer className="mt-auto bg-white border-t border-slate-200/80 py-3.5 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800 flex items-center gap-1">
                <BrainCircuit className="w-3.5 h-3.5 text-blue-600" />
                PREDICTO Edu-Analytics Platform
              </span>
              <span>• Ensemble Machine Learning & Gemini Intelligence</span>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={handleResetData}
                className="text-slate-400 hover:text-slate-700 flex items-center gap-1 text-[11px] font-medium transition"
                title="Reset mock dataset to initial baseline"
              >
                <RotateCcw className="w-3 h-3" /> Reset Dataset
              </button>
              <span className="text-slate-200">|</span>
              <span className="text-slate-400">Institutional High Density Edition</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Student Login Modal */}
      <StudentLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        students={students}
        onLoginSuccess={(loggedStudent) => {
          handleSelectStudent(loggedStudent.id);
          setActiveTab('prediction');
          setRole('student');
        }}
      />

      {/* Interactive Toast Notifications */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#1E293B] text-white text-xs px-3.5 py-2.5 rounded-lg shadow-xl border border-slate-700 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
