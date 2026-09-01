import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  RotateCcw, 
  Zap, 
  Lightbulb
} from 'lucide-react';
import { Student } from '../types';
import { runMLPrediction, calculateOverallAttendance } from '../utils/mlEngine';

interface WhatIfSimulatorProps {
  student: Student;
}

export const WhatIfSimulator: React.FC<WhatIfSimulatorProps> = ({ student }) => {
  const currentAttendance = calculateOverallAttendance(student.attendance);

  const [simAttendance, setSimAttendance] = useState<number>(currentAttendance);
  const [simStudyHours, setSimStudyHours] = useState<number>(student.habits.weeklyStudyHours);
  const [simAssignments, setSimAssignments] = useState<number>(student.habits.assignmentCompletionRate);
  const [simSleep, setSimSleep] = useState<number>(student.habits.dailySleepHours);

  const [aiInsight, setAiInsight] = useState<any | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  // Sync state if student changes
  useEffect(() => {
    setSimAttendance(currentAttendance);
    setSimStudyHours(student.habits.weeklyStudyHours);
    setSimAssignments(student.habits.assignmentCompletionRate);
    setSimSleep(student.habits.dailySleepHours);
    setAiInsight(null);
  }, [student.id, currentAttendance, student.habits]);

  const baselinePred = runMLPrediction(student);
  const simulatedPred = runMLPrediction(student, {
    attendanceRate: simAttendance,
    weeklyStudyHours: simStudyHours,
    assignmentCompletionRate: simAssignments,
    dailySleepHours: simSleep,
  });

  const scoreDiff = Math.round((simulatedPred.predictedScore - baselinePred.predictedScore) * 10) / 10;
  const isPositive = scoreDiff >= 0;

  const handleReset = () => {
    setSimAttendance(currentAttendance);
    setSimStudyHours(student.habits.weeklyStudyHours);
    setSimAssignments(student.habits.assignmentCompletionRate);
    setSimSleep(student.habits.dailySleepHours);
    setAiInsight(null);
  };

  const applyPreset = (att: number, hours: number, assign: number, sleep: number) => {
    setSimAttendance(att);
    setSimStudyHours(hours);
    setSimAssignments(assign);
    setSimSleep(sleep);
  };

  const fetchAiScenarioAnalysis = async () => {
    setLoadingAi(true);
    try {
      const response = await fetch('/api/gemini/what-if-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student,
          baseline: baselinePred,
          simulated: simulatedPred,
          changes: {
            attendance: simAttendance,
            studyHours: simStudyHours,
            assignments: simAssignments,
            sleep: simSleep,
          },
        }),
      });
      const data = await response.json();
      if (data.success) {
        setAiInsight(data);
      }
    } catch (e) {
      console.error('Failed to get AI scenario insights', e);
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                <Sliders className="w-4 h-4" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">Interactive "What-If" Scenario Simulator</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Experiment with study hours, attendance rates, and assignment focus to see immediate projected grade outcomes
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-600 flex items-center gap-1.5 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset to Actuals
            </button>
          </div>
        </div>

        {/* High Density Preset Buttons */}
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">Presets:</span>
          <button
            onClick={() => applyPreset(95, 20, 100, 8)}
            className="px-2.5 py-1 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold transition border border-blue-200"
          >
            🚀 Exam Sprint Mode (+20h study, 95% att)
          </button>
          <button
            onClick={() => applyPreset(88, 14, 90, 7.5)}
            className="px-2.5 py-1 rounded-md bg-green-50 hover:bg-green-100 text-green-700 text-xs font-semibold transition border border-green-200"
          >
            ⚖️ Balanced Routine (14h study, 7.5h sleep)
          </button>
          <button
            onClick={() => applyPreset(60, 4, 50, 5)}
            className="px-2.5 py-1 rounded-md bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold transition border border-red-200"
          >
            ⚠️ Low Effort Worst-Case (60% att, 4h study)
          </button>
        </div>
      </div>

      {/* Main Simulation Sandbox Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sliders Control Panel (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
          <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100">
            Adjust Simulated Parameters
          </h3>

          {/* Attendance Slider */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-bold text-slate-800">
                Simulated Attendance Rate
              </span>
              <span className={`font-black ${simAttendance >= 75 ? 'text-blue-600' : 'text-red-600'}`}>
                {simAttendance}% {simAttendance !== currentAttendance && `(Baseline: ${currentAttendance}%)`}
              </span>
            </div>
            <input
              type="range"
              min={40}
              max={100}
              value={simAttendance}
              onChange={(e) => setSimAttendance(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-medium">
              <span>40% (Danger)</span>
              <span className="text-amber-600 font-bold">75% Threshold</span>
              <span>100% (Perfect)</span>
            </div>
          </div>

          {/* Study Hours Slider */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-bold text-slate-800">
                Weekly Independent Study
              </span>
              <span className="font-black text-blue-600">
                {simStudyHours} hrs / week {simStudyHours !== student.habits.weeklyStudyHours && `(Baseline: ${student.habits.weeklyStudyHours}h)`}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={35}
              value={simStudyHours}
              onChange={(e) => setSimStudyHours(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-medium">
              <span>0h (Minimal)</span>
              <span className="text-blue-600 font-bold">15h (Recommended)</span>
              <span>35h (Intensive)</span>
            </div>
          </div>

          {/* Assignment Rate Slider */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-bold text-slate-800">
                Assignment & Homework Submission
              </span>
              <span className="font-black text-blue-600">
                {simAssignments}% {simAssignments !== student.habits.assignmentCompletionRate && `(Baseline: ${student.habits.assignmentCompletionRate}%)`}
              </span>
            </div>
            <input
              type="range"
              min={20}
              max={100}
              value={simAssignments}
              onChange={(e) => setSimAssignments(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-medium">
              <span>20% (Missed tests)</span>
              <span>60% (Passing)</span>
              <span>100% (Full Marks)</span>
            </div>
          </div>

          {/* Sleep Hours Slider */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-bold text-slate-800">
                Daily Sleep Routine
              </span>
              <span className="font-black text-blue-600">
                {simSleep} hrs / day
              </span>
            </div>
            <input
              type="range"
              min={4}
              max={11}
              step={0.5}
              value={simSleep}
              onChange={(e) => setSimSleep(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-medium">
              <span>4h (Sleep deprived)</span>
              <span className="text-green-600 font-bold">7.5h (Optimal)</span>
              <span>11h</span>
            </div>
          </div>
        </div>

        {/* High Density Dark Forecast Card (5 cols - matches archetype) */}
        <div className="lg:col-span-5 bg-[#1E293B] rounded-2xl p-6 text-white shadow-xl shadow-slate-300/40 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-28 h-28 bg-blue-500/10 rounded-full -mr-12 -mt-12 pointer-events-none"></div>

          <div className="relative z-10">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/60">
              <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" /> Simulated Outcome
              </h3>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  isPositive ? 'bg-green-500/20 text-green-300 border border-green-400/30' : 'bg-red-500/20 text-red-300 border border-red-400/30'
                }`}
              >
                {isPositive ? `+${scoreDiff}%` : `${scoreDiff}%`} Shift
              </span>
            </div>

            {/* Score Comparison Display */}
            <div className="grid grid-cols-2 gap-3 my-4">
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 text-center">
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Baseline</p>
                <p className="text-2xl font-bold text-slate-300 mt-1">{baselinePred.predictedScore}%</p>
                <p className="text-[10px] font-bold text-slate-400 mt-0.5">Grade {baselinePred.predictedGrade}</p>
              </div>

              <div className="bg-blue-600/30 p-3 rounded-xl border border-blue-400/40 text-center">
                <p className="text-[10px] text-blue-300 uppercase font-bold tracking-wider">Simulated</p>
                <p className="text-3xl font-black text-white mt-1">{simulatedPred.predictedScore}%</p>
                <p className="text-xs font-bold text-blue-300 mt-0.5">Grade {simulatedPred.predictedGrade}</p>
              </div>
            </div>

            {/* Risk & Metric Indicators */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/60 border border-slate-700/60">
                <span className="text-slate-300 text-xs">Risk Profile:</span>
                <span
                  className={`font-bold ${
                    simulatedPred.riskLevel === 'Low'
                      ? 'text-green-400'
                      : simulatedPred.riskLevel === 'Medium'
                      ? 'text-amber-400'
                      : 'text-red-400'
                  }`}
                >
                  {simulatedPred.riskLevel} Risk ({simulatedPred.riskScore}/100)
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/60 border border-slate-700/60">
                <span className="text-slate-300 text-xs">Pass Probability:</span>
                <span className="font-bold text-white">{simulatedPred.passProbability}%</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/60 border border-slate-700/60">
                <span className="text-slate-300 text-xs">Distinction Probability:</span>
                <span className="font-bold text-white">{simulatedPred.distinctionProbability}%</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-700/60 relative z-10">
            <button
              onClick={fetchAiScenarioAnalysis}
              disabled={loadingAi}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/20 disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{loadingAi ? 'Analyzing Scenario with Gemini...' : 'Get AI Scenario Insights'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* AI Scenario Insight Card (if loaded) */}
      {aiInsight && (
        <div className="bg-blue-50/80 rounded-2xl border border-blue-200 p-5 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-blue-200/60">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <h4 className="font-bold text-blue-950 text-sm">AI Scenario Evaluation Report</h4>
            <span className="ml-auto text-[10px] font-bold bg-blue-200 text-blue-800 px-2 py-0.5 rounded uppercase tracking-wider">
              Feasibility: {aiInsight.feasibility || 'High'}
            </span>
          </div>

          <p className="text-xs text-blue-900 leading-relaxed font-medium">{aiInsight.insight}</p>

          {aiInsight.weeklyRoutineShift && (
            <div className="mt-3 p-2.5 rounded-xl bg-white border border-blue-200 text-xs">
              <span className="font-bold text-slate-900 block mb-0.5">Recommended Routine Adjustment:</span>
              <span className="text-slate-600">{aiInsight.weeklyRoutineShift}</span>
            </div>
          )}

          {aiInsight.keyMilestone && (
            <div className="mt-2 text-xs text-blue-800 flex items-center gap-1.5 font-medium">
              <Lightbulb className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span><strong>Next Milestone:</strong> {aiInsight.keyMilestone}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
