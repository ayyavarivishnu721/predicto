import React, { useState } from 'react';
import { LogIn, User, Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import { Student } from '../types';

interface StudentLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  onLoginSuccess: (student: Student) => void;
}

export const StudentLoginModal: React.FC<StudentLoginModalProps> = ({
  isOpen,
  onClose,
  students,
  onLoginSuccess,
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [password, setPassword] = useState<string>('student123');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const student = students.find((s) => s.id === selectedStudentId);
    if (!student) {
      setError('Student record not found');
      return;
    }
    setError(null);
    onLoginSuccess(student);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-5 sm:p-6 relative overflow-hidden">
        {/* Header decoration */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold border border-blue-100">
              <LogIn className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">Student Portal Authentication</h3>
              <p className="text-xs text-slate-500">Sign in to your university academic portal</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-sm font-semibold transition"
          >
            &times;
          </button>
        </div>

        {/* Quick Demo Selector */}
        <div className="my-4">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Select Student Account:</p>
          <div className="space-y-2">
            {students.slice(0, 3).map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSelectedStudentId(s.id)}
                className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition ${
                  selectedStudentId === s.id
                    ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-500/30'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <img src={s.avatar} alt={s.name} className="w-7 h-7 rounded-full object-cover border border-slate-200" />
                  <div>
                    <p className="text-xs font-bold text-slate-900">{s.name}</p>
                    <p className="text-[10px] text-slate-500 font-mono">{s.studentId} • {s.department}</p>
                  </div>
                </div>
                {selectedStudentId === s.id && (
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Student ID / Email</label>
            <div className="relative">
              <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                disabled
                value={students.find((s) => s.id === selectedStudentId)?.email || ''}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 rounded-lg border border-slate-200 text-slate-600 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-9 pr-16 py-2 text-xs bg-white rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold uppercase tracking-wider text-blue-600 hover:text-blue-800"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-1.5 font-medium">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition shadow-md shadow-blue-500/20 flex items-center justify-center gap-1.5"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In to Student Dashboard</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
