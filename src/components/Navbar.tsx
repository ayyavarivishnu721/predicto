import React, { useState } from 'react';
import { 
  BrainCircuit, 
  FileSpreadsheet, 
  CalendarCheck, 
  BarChart2, 
  Sliders, 
  ShieldAlert, 
  Sparkles, 
  Users, 
  User, 
  Plus, 
  ChevronDown, 
  Search, 
  RefreshCw, 
  Menu, 
  X,
  Activity,
  CheckCircle2
} from 'lucide-react';
import { Student, UserRole } from '../types';

interface NavbarProps {
  currentStudent: Student;
  allStudents: Student[];
  activeTab: string;
  role: UserRole;
  predictedScore: number;
  predictedGrade: string;
  riskLevel: string;
  onSelectStudent: (id: string) => void;
  onTabChange: (tab: string) => void;
  onRoleChange: (role: UserRole) => void;
  onOpenLoginModal: () => void;
  onResetData: () => void;
  onOpenAddStudentModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentStudent,
  allStudents,
  activeTab,
  role,
  predictedScore,
  predictedGrade,
  riskLevel,
  onSelectStudent,
  onTabChange,
  onRoleChange,
  onOpenLoginModal,
  onResetData,
  onOpenAddStudentModal,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const filteredStudents = allStudents.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const mainNavItems = [
    { id: 'prediction', label: 'Performance Hub', icon: BrainCircuit },
    { id: 'marks', label: 'Gradebook & Marks', icon: FileSpreadsheet },
    { id: 'attendance', label: 'Attendance Tracker', icon: CalendarCheck },
    { id: 'graphs', label: 'Analytics & Trends', icon: BarChart2 },
    { id: 'simulator', label: 'What-If Simulator', icon: Sliders },
  ];

  const advisoryNavItems = [
    { id: 'at-risk', label: 'Early Warning / Risk', icon: ShieldAlert },
    { id: 'recommendations', label: 'AI Study Plan', icon: Sparkles },
    { id: 'profile', label: 'Student Profile', icon: User },
    { id: 'admin', label: 'Cohort Overview', icon: Users },
  ];

  const isAtRisk = riskLevel === 'Critical' || riskLevel === 'High';

  const getStatusBadge = () => {
    if (riskLevel === 'Critical') {
      return <span className="bg-red-100 text-red-700 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider">Critical</span>;
    }
    if (riskLevel === 'High') {
      return <span className="bg-orange-100 text-orange-700 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider">At Risk</span>;
    }
    if (riskLevel === 'Medium') {
      return <span className="bg-amber-100 text-amber-700 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider">Moderate</span>;
    }
    return <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider">Stable</span>;
  };

  const activeTitleMap: Record<string, string> = {
    prediction: 'Student Performance Analysis',
    marks: 'Continuous Evaluation & Gradebook',
    attendance: 'Attendance Compliance Monitor',
    graphs: 'Cohort & Competency Analytics',
    simulator: 'Interactive What-If Simulator',
    'at-risk': 'Early Warning & Remedial Intervention',
    recommendations: 'Personalized AI Academic Advisory',
    profile: 'Student Demographics & Habits',
    admin: 'Institutional Admin Dashboard',
  };

  return (
    <>
      {/* High Density Desktop Sidebar */}
      <aside className="w-60 lg:w-64 bg-[#1E293B] text-slate-300 border-r border-slate-800 shrink-0 hidden md:flex flex-col h-screen sticky top-0 z-40 overflow-y-auto">
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-700/60 bg-[#0F172A]/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-lg shadow-sm shadow-blue-500/30">
              Σ
            </div>
            <div className="flex flex-col">
              <span className="text-white font-bold tracking-tight text-base leading-tight">PREDICTO</span>
              <span className="text-slate-400 text-[10px] uppercase font-semibold tracking-wider">Edu-Analytics v2.4</span>
            </div>
          </div>
        </div>

        {/* Navigation Groups */}
        <div className="flex-1 p-3.5 space-y-6">
          {/* Main Menu */}
          <div>
            <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider px-2.5 mb-2">
              Main Menu
            </div>
            <nav className="space-y-1">
              {mainNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    id={`nav-btn-${item.id}`}
                    onClick={() => onTabChange(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-all text-left ${
                      isActive
                        ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 font-semibold'
                        : 'text-slate-300 hover:bg-slate-800/80 hover:text-white border border-transparent'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Advisory & Management */}
          <div>
            <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider px-2.5 mb-2">
              Advisory & Roster
            </div>
            <nav className="space-y-1">
              {advisoryNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    id={`nav-btn-${item.id}`}
                    onClick={() => {
                      if (item.id === 'admin') {
                        onRoleChange('admin');
                      }
                      onTabChange(item.id);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-all text-left ${
                      isActive
                        ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 font-semibold'
                        : 'text-slate-300 hover:bg-slate-800/80 hover:text-white border border-transparent'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Status Widget & Actions in Sidebar Bottom */}
        <div className="p-3.5 border-t border-slate-800 space-y-2 bg-[#0F172A]/40">
          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
            <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1.5 flex items-center justify-between">
              <span>System Status</span>
              <span className="text-[10px] text-blue-400 font-semibold">v2.4 ML</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-xs text-white font-medium">Systems Operational</span>
            </div>
          </div>

          <div className="flex items-center justify-between px-1 text-[11px] text-slate-400">
            <button
              onClick={onResetData}
              className="hover:text-slate-200 flex items-center gap-1 py-1 transition"
              title="Reset mock dataset to initial baseline"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset Cohort</span>
            </button>

            {onOpenAddStudentModal && (
              <button
                onClick={onOpenAddStudentModal}
                className="hover:text-blue-300 text-blue-400 flex items-center gap-1 py-1 font-semibold transition"
              >
                <Plus className="w-3 h-3" />
                <span>Add Record</span>
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Top High Density Header */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-30 shrink-0">
        {/* Mobile Menu Toggle & Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex flex-col">
            <h1 className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 leading-tight">
              {activeTitleMap[activeTab] || 'Student Performance Analysis'}
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-500 truncate max-w-[200px] sm:max-w-none">
              Monitoring: <strong className="text-slate-700">{currentStudent.name}</strong> (Batch 2024-C • {currentStudent.studentId})
            </p>
          </div>
        </div>

        {/* High Density Metric & Controls */}
        <div className="flex items-center gap-3 sm:gap-6">
          {/* Predicted Outcome Highlight */}
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-[10px] text-slate-400 uppercase font-bold leading-none tracking-wider">
              Predicted Outcome
            </span>
            <span className="text-base lg:text-lg font-black text-blue-600 leading-tight tracking-tight">
              {predictedScore}% ({predictedGrade})
            </span>
          </div>

          <div className="hidden sm:block w-px h-8 bg-slate-200"></div>

          {/* Status Badge & Profile Dropdown */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden xs:block">
              {getStatusBadge()}
            </div>

            {/* Student Selector Dropdown */}
            <div className="relative">
              <button
                id="student-switcher-btn"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 transition text-left"
              >
                <img
                  src={currentStudent.avatarUrl}
                  alt={currentStudent.name}
                  className="w-7 h-7 rounded-full object-cover border border-slate-200 shadow-2xs"
                />
                <div className="hidden lg:block text-left">
                  <div className="text-xs font-bold text-slate-800 leading-none truncate max-w-[100px]">
                    {currentStudent.name.split(' ')[0]}
                  </div>
                  <div className="text-[10px] text-slate-500">{currentStudent.studentId}</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {dropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="p-2 border-b border-slate-100 mb-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Switch Student Profile</span>
                        <span className="text-[10px] text-blue-600 font-semibold">{filteredStudents.length} Students</span>
                      </div>
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Search student or department..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div className="max-h-60 overflow-y-auto space-y-1 py-1">
                      {filteredStudents.map((s) => {
                        const isSelected = s.id === currentStudent.id;
                        const atRiskFlag = s.cgpa < 6.0;
                        return (
                          <button
                            key={s.id}
                            id={`select-student-${s.id}`}
                            onClick={() => {
                              onSelectStudent(s.id);
                              setDropdownOpen(false);
                            }}
                            className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition ${
                              isSelected
                                ? 'bg-blue-50 text-blue-900 border border-blue-200/60 font-semibold'
                                : 'hover:bg-slate-50 text-slate-700 border border-transparent'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <img
                                src={s.avatarUrl}
                                alt={s.name}
                                className="w-7 h-7 rounded-full object-cover border border-slate-200"
                              />
                              <div>
                                <p className="text-xs font-bold text-slate-900">{s.name}</p>
                                <p className="text-[10px] text-slate-500">
                                  {s.studentId} • Sem {s.semester}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-bold text-slate-800">{s.cgpa} GPA</span>
                              {atRiskFlag ? (
                                <span className="block text-[9px] font-bold text-red-600 bg-red-50 px-1 rounded uppercase">
                                  At Risk
                                </span>
                              ) : (
                                <span className="block text-[9px] font-bold text-green-600 bg-green-50 px-1 rounded uppercase">
                                  Stable
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="pt-2 border-t border-slate-100 mt-1 flex items-center justify-between px-1">
                      {onOpenAddStudentModal && (
                        <button
                          onClick={() => {
                            setDropdownOpen(false);
                            onOpenAddStudentModal();
                          }}
                          className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 py-1"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add Student
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          onResetData();
                        }}
                        title="Reset sample dataset"
                        className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1 py-1"
                      >
                        <RefreshCw className="w-3 h-3" /> Reset Data
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-64 bg-[#1E293B] text-slate-300 flex flex-col h-full z-50 p-4 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-base">
                  Σ
                </div>
                <div>
                  <span className="text-white font-bold tracking-tight text-sm">PREDICTO</span>
                  <span className="block text-slate-400 text-[9px] uppercase font-semibold">Edu-Analytics v2.4</span>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4">
              <div>
                <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider px-2 mb-2">Main Menu</div>
                <div className="space-y-1">
                  {mainNavItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          onTabChange(item.id);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium text-left ${
                          isActive
                            ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 font-bold'
                            : 'text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider px-2 mb-2">Advisory & Cohort</div>
                <div className="space-y-1">
                  {advisoryNavItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          if (item.id === 'admin') onRoleChange('admin');
                          onTabChange(item.id);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium text-left ${
                          isActive
                            ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 font-bold'
                            : 'text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
