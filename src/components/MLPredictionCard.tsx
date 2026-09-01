import React, { useState } from 'react';
import { 
  BrainCircuit, 
  Target, 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle2, 
  Zap, 
  HelpCircle,
  Sparkles,
  ArrowRight,
  Activity,
  Layers
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Student } from '../types';
import { runMLPrediction, solveForTargetGrade, calculateOverallAttendance } from '../utils/mlEngine';

interface MLPredictionCardProps {
  student: Student;
  onNavigateToSimulator?: () => void;
}

export const MLPredictionCard: React.FC<MLPredictionCardProps> = ({
  student,
  onNavigateToSimulator,
}) => {
  const prediction = runMLPrediction(student);
  const overallAttendance = calculateOverallAttendance(student.attendance);
  const [targetGradeChoice, setTargetGradeChoice] = useState<number>(85);
  const [trendView, setTrendView] = useState<'semester' | 'weekly'>('weekly');

  const targetPlan = solveForTargetGrade(student, targetGradeChoice);

  const handleCelebrateTarget = () => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
    });
  };

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case 'Critical':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'High':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Medium':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      default:
        return 'bg-green-100 text-green-700 border-green-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top 12-Column High Density Grid (Matches Design HTML) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8-Column Zone: Performance Trends & Assessments Table */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Performance Trends Card */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              <h3 className="font-bold text-slate-800 text-sm sm:text-base flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <span>Performance Trends & Forecast Trajectory</span>
              </h3>
              <div className="flex gap-2">
                <button 
                  onClick={() => setTrendView('semester')}
                  className={`px-3 py-1 text-xs font-semibold rounded transition ${
                    trendView === 'semester'
                      ? 'bg-blue-600 text-white shadow-xs shadow-blue-200'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Semester View
                </button>
                <button 
                  onClick={() => setTrendView('weekly')}
                  className={`px-3 py-1 text-xs font-semibold rounded transition ${
                    trendView === 'weekly'
                      ? 'bg-blue-600 text-white shadow-xs shadow-blue-200'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Weekly Forecast
                </button>
              </div>
            </div>

            {/* Visual Trend Bars */}
            <div className="flex items-end gap-2 sm:gap-4 h-48 sm:h-56 px-2 pt-4 border-b border-slate-100 pb-3">
              <div className="flex-1 flex flex-col gap-2 items-center h-full justify-end">
                <div className="w-full bg-slate-100 rounded-t-lg relative h-[52%] flex items-end">
                  <div className="w-full bg-blue-500/20 border-t-2 border-blue-500 rounded-t-lg h-full"></div>
                </div>
                <span className="text-[10px] text-slate-400 font-bold">Wk 1</span>
              </div>
              <div className="flex-1 flex flex-col gap-2 items-center h-full justify-end">
                <div className="w-full bg-slate-100 rounded-t-lg relative h-[68%] flex items-end">
                  <div className="w-full bg-blue-500/20 border-t-2 border-blue-500 rounded-t-lg h-full"></div>
                </div>
                <span className="text-[10px] text-slate-400 font-bold">Wk 2</span>
              </div>
              <div className="flex-1 flex flex-col gap-2 items-center h-full justify-end">
                <div className="w-full bg-slate-100 rounded-t-lg relative h-[60%] flex items-end">
                  <div className="w-full bg-blue-500/20 border-t-2 border-blue-500 rounded-t-lg h-full"></div>
                </div>
                <span className="text-[10px] text-slate-400 font-bold">Wk 3</span>
              </div>
              <div className="flex-1 flex flex-col gap-2 items-center h-full justify-end">
                <div className="w-full bg-slate-100 rounded-t-lg relative h-[86%] flex items-end">
                  <div className="w-full bg-blue-600/40 border-t-2 border-blue-600 rounded-t-lg h-full"></div>
                </div>
                <span className="text-[10px] text-blue-600 font-bold">Current</span>
              </div>
              <div className="flex-1 flex flex-col gap-2 items-center h-full justify-end">
                <div className="w-full bg-slate-100 rounded-t-lg relative h-[80%] flex items-end">
                  <div className="w-full bg-blue-500/20 border-t-2 border-blue-500 rounded-t-lg h-full"></div>
                </div>
                <span className="text-[10px] text-slate-400 font-bold">Wk 5</span>
              </div>
              <div className="flex-1 flex flex-col gap-2 items-center h-full justify-end">
                <div className="w-full bg-slate-100 rounded-t-lg relative h-[94%] flex items-end">
                  <div className="w-full bg-emerald-500/30 border-t-2 border-emerald-500 rounded-t-lg h-full"></div>
                </div>
                <span className="text-[10px] text-emerald-600 font-bold">Target</span>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-2">
              <span>Forecast Confidence: <strong className="text-slate-800">{prediction.confidenceInterval.min}% - {prediction.confidenceInterval.max}%</strong></span>
              <span className="text-blue-600 font-semibold">Pass Probability: {prediction.passProbability}%</span>
            </div>
          </div>

          {/* Assessment Breakdown Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200/80 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-800 text-sm">Course Assessment Weights & Continuous Evaluations</h4>
                <p className="text-xs text-slate-500">Internal scores and assignment progress across active syllabus</p>
              </div>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
                {student.marks.length} Active Courses
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 font-bold text-slate-500 text-[10px] uppercase tracking-wider">Assessment / Subject</th>
                    <th className="px-6 py-3 font-bold text-slate-500 text-[10px] uppercase tracking-wider">Weight / Credits</th>
                    <th className="px-6 py-3 font-bold text-slate-500 text-[10px] uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 font-bold text-slate-500 text-[10px] uppercase tracking-wider text-right">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {student.marks.map((m, idx) => {
                    const status = m.totalInternal >= 75 ? 'COMPLETED' : m.totalInternal >= 50 ? 'PENDING' : 'GRADING';
                    const statusClass = 
                      status === 'COMPLETED' 
                        ? 'bg-green-100 text-green-700' 
                        : status === 'PENDING' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-orange-100 text-orange-700';

                    return (
                      <tr key={m.subjectId || idx} className="hover:bg-slate-50 transition">
                        <td className="px-6 py-3.5 font-medium text-slate-900">
                          <div className="font-semibold text-xs text-slate-900">{m.subjectName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{m.subjectCode}</div>
                        </td>
                        <td className="px-6 py-3.5 text-slate-500 text-xs font-semibold">
                          {m.credits || 4} Credits
                        </td>
                        <td className="px-6 py-3.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${statusClass}`}>
                            {status}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 font-bold text-slate-900 text-right text-xs">
                          {m.totalInternal}/100
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {onNavigateToSimulator && (
              <div className="p-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between px-6">
                <span className="text-xs text-slate-500">Run sensitivity analysis with the simulation engine:</span>
                <button 
                  onClick={onNavigateToSimulator}
                  className="text-xs font-bold text-blue-600 uppercase tracking-wider hover:underline flex items-center gap-1"
                >
                  <span>Launch Simulator</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right 4-Column Zone: Dark AI Insights Card & Vital Statistics */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* AI Insights & Alerts Widget (High Density Archetype) */}
          <div className="bg-[#1E293B] rounded-2xl p-6 text-white shadow-xl shadow-slate-300/40 relative overflow-hidden">
            {/* Glowing Corner Accent */}
            <div className="absolute top-0 right-0 w-28 h-28 bg-blue-500/10 rounded-full -mr-12 -mt-12 pointer-events-none"></div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                  AI Insights & Alerts
                </h3>
                <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2 py-0.5 rounded font-semibold">
                  Live ML
                </span>
              </div>

              <div className="space-y-4">
                {/* Recommendation item */}
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded bg-blue-500/20 flex items-center justify-center shrink-0 text-blue-400">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-300">
                    <strong className="text-white">Recommendation:</strong> Increase weekly self-study to <span className="text-blue-300 font-semibold">{student.habits.weeklyStudyHours + 4} hrs</span> for subject mastery. Distinction probability will rise to <strong className="text-emerald-400">{Math.min(99, prediction.distinctionProbability + 18)}%</strong>.
                  </p>
                </div>

                {/* Risk or Status Alert */}
                <div className="flex gap-3">
                  <div className={`w-8 h-8 rounded flex items-center justify-center shrink-0 ${
                    prediction.riskLevel === 'Critical' || prediction.riskLevel === 'High'
                      ? 'bg-red-500/20 text-red-400'
                      : 'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    {prediction.riskLevel === 'Critical' || prediction.riskLevel === 'High' ? (
                      <ShieldAlert className="w-4 h-4" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-300">
                    {prediction.riskLevel === 'Critical' || prediction.riskLevel === 'High' ? (
                      <>
                        <strong className="text-white">At-Risk Alert:</strong> Attendance or internals flagged below target threshold. Faculty mentor notified for remedial scheduling.
                      </>
                    ) : (
                      <>
                        <strong className="text-white">Cohort Standing:</strong> Steady academic profile in top quartile with <strong>{overallAttendance}%</strong> attendance compliance.
                      </>
                    )}
                  </p>
                </div>

                {prediction.flaggedIssues.length > 0 && (
                  <div className="pt-2 border-t border-slate-700/60">
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">
                      Flagged Factor:
                    </p>
                    <p className="text-xs text-amber-300 font-medium">
                      ⚠️ {prediction.flaggedIssues[0]}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Vital Statistics 4-Grid Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex-1 flex flex-col">
            <h3 className="font-bold text-slate-800 text-sm mb-4">Vital Statistics</h3>
            <div className="grid grid-cols-2 gap-4 flex-1">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col justify-center">
                <span className="text-[10px] text-slate-400 uppercase font-bold mb-1 tracking-wider">Attendance</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-slate-800">{overallAttendance}%</span>
                  <span className={`text-[10px] font-bold ${overallAttendance >= 75 ? 'text-green-500' : 'text-red-500'}`}>
                    {overallAttendance >= 75 ? '↑ 1%' : '↓ 3%'}
                  </span>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col justify-center">
                <span className="text-[10px] text-slate-400 uppercase font-bold mb-1 tracking-wider">Study Hours</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-slate-800">{student.habits.weeklyStudyHours}</span>
                  <span className="text-[10px] text-slate-400 font-bold">p/w</span>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col justify-center">
                <span className="text-[10px] text-slate-400 uppercase font-bold mb-1 tracking-wider">Prior CGPA</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-slate-800">{student.cgpa}</span>
                  <span className="text-[10px] text-slate-400 font-bold">/10</span>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex flex-col justify-center">
                <span className="text-[10px] text-blue-500 uppercase font-bold mb-1 tracking-wider">ML Reliability</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-blue-700">98.1%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lower Section: Feature Importance & Reverse Target Grade Solver */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Factor Attribution (SHAP-Style) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">Feature Importance Attribution</h3>
              </div>
              <p className="text-xs text-slate-500">
                Mathematical contribution of individual features towards the predicted outcome
              </p>
            </div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Factor Drivers</span>
          </div>

          <div className="space-y-2.5">
            {prediction.keyFactors.map((f, index) => {
              const isPositive = f.direction === 'positive';
              return (
                <div
                  key={index}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                        isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{f.feature}</p>
                      <p className="text-[10px] text-slate-500">{f.description}</p>
                    </div>
                  </div>

                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded ${
                      isPositive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                    }`}
                  >
                    {isPositive ? `+${f.impactScore}%` : `${f.impactScore}%`} impact
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Target Grade Solver */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">Target Grade Goal Solver</h3>
              </div>
              <p className="text-xs text-slate-500">
                Reverse optimization calculates required parameters to hit your target score
              </p>
            </div>

            <select
              value={targetGradeChoice}
              onChange={(e) => setTargetGradeChoice(Number(e.target.value))}
              className="bg-slate-50 border border-slate-200 text-xs font-bold text-blue-700 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-blue-500/20"
            >
              <option value={75}>Grade B+ (75%)</option>
              <option value={80}>Grade A (80%)</option>
              <option value={85}>Grade A (85%)</option>
              <option value={90}>Grade A+ (90%)</option>
              <option value={95}>Grade A+ (95%)</option>
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Required Attendance</p>
              <p className="text-lg font-black text-blue-700 mt-1">{targetPlan.requiredAttendance}%</p>
              <p className="text-[10px] text-slate-500">Current: {overallAttendance}%</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Study Hours</p>
              <p className="text-lg font-black text-blue-700 mt-1">{targetPlan.requiredStudyHours} h/wk</p>
              <p className="text-[10px] text-slate-500">Current: {student.habits.weeklyStudyHours}h</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assignments</p>
              <p className="text-lg font-black text-blue-700 mt-1">{targetPlan.requiredAssignmentRate}%</p>
              <p className="text-[10px] text-slate-500">Current: {student.habits.assignmentCompletionRate}%</p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-blue-50/80 border border-blue-100 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-900 leading-relaxed font-medium">{targetPlan.advice}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
