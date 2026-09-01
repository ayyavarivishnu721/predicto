import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  BookOpen, 
  Clock, 
  Printer, 
  Zap, 
  BrainCircuit, 
  Award,
  RefreshCw
} from 'lucide-react';
import { Student, AIRecommendation } from '../types';
import { runMLPrediction } from '../utils/mlEngine';

interface PersonalizedRecommendationsProps {
  student: Student;
}

export const PersonalizedRecommendations: React.FC<PersonalizedRecommendationsProps> = ({
  student,
}) => {
  const prediction = runMLPrediction(student);
  const [recommendations, setRecommendations] = useState<AIRecommendation | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/gemini/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student,
          prediction,
          subjects: student.marks.map((m) => ({
            name: m.subjectName,
            score: m.totalInternal,
            credits: m.credits,
          })),
          attendance: student.attendance,
          marks: student.marks,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setRecommendations({
          summary: data.summary,
          learningStyleInsight: data.learningStyleInsight,
          actionPlan: data.actionPlan || [],
          subjectSpecificAdvice: data.subjectSpecificAdvice || [],
          habitsRecommendation: data.habitsRecommendation,
          motivationalNote: data.motivationalNote,
          source: data.source || 'gemini',
          generatedAt: new Date().toISOString(),
        });
      }
    } catch (e) {
      console.error('Failed to generate recommendations', e);
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch recommendations on first load or student change if not loaded
  useEffect(() => {
    fetchRecommendations();
  }, [student.id]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                <Sparkles className="w-4 h-4" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">Personalized AI Academic Advisory</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Custom-tailored study roadmaps, weak-topic remediation, and habit optimization
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition"
            >
              <Printer className="w-3.5 h-3.5" /> Print Plan
            </button>
            <button
              onClick={fetchRecommendations}
              disabled={loading}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-xs shadow-blue-200 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Synthesizing...' : 'Regenerate'}</span>
            </button>
          </div>
        </div>

        {/* AI Model Badge */}
        <div className="flex items-center justify-between mt-3 text-xs text-slate-500">
          <span>
            Target Student: <strong className="text-slate-800">{student.name}</strong> ({student.studentId})
          </span>
          <span className="flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 uppercase tracking-wider">
            <BrainCircuit className="w-3 h-3 text-blue-600" />
            {recommendations?.source === 'gemini' ? 'Gemini 3.7 Flash Intelligence' : 'Heuristic Rules Engine'}
          </span>
        </div>
      </div>

      {loading && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3 animate-pulse border border-blue-100">
            <BrainCircuit className="w-5 h-5 animate-spin" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">Generating Personalized Academic Roadmap...</h3>
          <p className="text-xs text-slate-500 mt-1">Analyzing internal scores, attendance deficit, and habit metrics</p>
        </div>
      )}

      {recommendations && !loading && (
        <div className="space-y-6 animate-in fade-in">
          {/* Executive Summary Card (High Density Dark Theme) */}
          <div className="bg-[#1E293B] rounded-2xl p-6 text-white shadow-xl shadow-slate-300/40 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-28 h-28 bg-blue-500/10 rounded-full -mr-12 -mt-12 pointer-events-none"></div>

            <div className="relative z-10">
              <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Executive Academic Diagnosis
              </div>
              <p className="text-sm leading-relaxed text-slate-200 font-medium">
                {recommendations.summary}
              </p>

              {recommendations.learningStyleInsight && (
                <div className="mt-4 pt-3 border-t border-slate-700/60 text-xs text-slate-300 flex items-start gap-2">
                  <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">Learning Profile Insight:</strong> {recommendations.learningStyleInsight}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Action Plan Section */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">Prioritized Action Blueprint</h3>
                <p className="text-xs text-slate-500">Step-by-step interventions to guarantee grade improvement</p>
              </div>
            </div>

            <div className="space-y-3">
              {recommendations.actionPlan.map((item, index) => {
                const isHigh = item.priority === 'High';
                const isMed = item.priority === 'Medium';
                return (
                  <div
                    key={index}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider shrink-0 mt-0.5 ${
                          isHigh
                            ? 'bg-red-100 text-red-800 border border-red-200'
                            : isMed
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-green-100 text-green-800 border border-green-200'
                        }`}
                      >
                        {item.priority} Priority
                      </span>
                      <div>
                        <h4 className="font-bold text-slate-900 text-xs sm:text-sm mb-0.5">{item.title}</h4>
                        <p className="text-slate-600 leading-relaxed font-medium">{item.description}</p>
                      </div>
                    </div>

                    <div className="text-slate-400 font-bold shrink-0 sm:text-right text-[10px] uppercase tracking-wider flex items-center sm:justify-end gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{item.timeline}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Subject Specific Remediation & Habits Guidance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-3">
                <BookOpen className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">Subject-Specific Weakness Interventions</h3>
              </div>

              <div className="space-y-2.5">
                {recommendations.subjectSpecificAdvice.map((sub, i) => (
                  <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                    <p className="font-bold text-slate-900 mb-1">{sub.subject}</p>
                    <p className="text-slate-600 leading-relaxed font-medium">{sub.tip}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Habit & Time-Blocking Advice */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-3">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <h3 className="font-bold text-slate-900 text-sm">Study Habits & Schedule Guidance</h3>
                </div>

                <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 text-xs leading-relaxed text-blue-950 font-medium mb-4">
                  {recommendations.habitsRecommendation}
                </div>

                {recommendations.motivationalNote && (
                  <div className="p-3.5 rounded-xl bg-green-50 border border-green-200 text-xs text-green-950 flex items-start gap-2 font-medium">
                    <Award className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                    <span>{recommendations.motivationalNote}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-400 text-center font-bold uppercase tracking-wider">
                Review this action plan weekly with academic advisor ({student.advisorName})
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
