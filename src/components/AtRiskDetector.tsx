import React, { useState } from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  UserCheck, 
  Plus
} from 'lucide-react';
import { Student, RiskInterventionReport, InterventionRecord } from '../types';
import { runMLPrediction, calculateOverallAttendance } from '../utils/mlEngine';

interface AtRiskDetectorProps {
  student: Student;
  onUpdateStudent: (updated: Student) => void;
}

export const AtRiskDetector: React.FC<AtRiskDetectorProps> = ({
  student,
  onUpdateStudent,
}) => {
  const prediction = runMLPrediction(student);
  const overallAttendance = calculateOverallAttendance(student.attendance);

  const [aiReport, setAiReport] = useState<RiskInterventionReport | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [isLoggingIntervention, setIsLoggingIntervention] = useState(false);
  const [newIntervention, setNewIntervention] = useState<{
    educatorName: string;
    type: 'Counseling' | 'Remedial Class' | 'Attendance Warning' | 'Parent Meeting' | 'Peer Tutor Assigned';
    notes: string;
  }>({
    educatorName: student.advisorName || 'Dr. Robert Langdon',
    type: 'Counseling',
    notes: '',
  });

  const isAtRisk = prediction.riskLevel === 'High' || prediction.riskLevel === 'Critical';

  const fetchInterventionReport = async () => {
    setLoadingAi(true);
    try {
      const response = await fetch('/api/gemini/risk-intervention', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student,
          prediction,
          flaggedIssues: prediction.flaggedIssues,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setAiReport(data);
      }
    } catch (e) {
      console.error('Failed to get risk intervention blueprint', e);
    } finally {
      setLoadingAi(false);
    }
  };

  const handleSaveIntervention = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIntervention.notes.trim()) return;

    const created: InterventionRecord = {
      id: `int-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      educatorName: newIntervention.educatorName,
      type: newIntervention.type,
      notes: newIntervention.notes,
      status: 'In Progress',
    };

    onUpdateStudent({
      ...student,
      interventions: [created, ...(student.interventions || [])],
    });

    setIsLoggingIntervention(false);
    setNewIntervention({
      educatorName: student.advisorName || 'Dr. Robert Langdon',
      type: 'Counseling',
      notes: '',
    });
  };

  return (
    <div className="space-y-6">
      {/* Risk Alert Hero */}
      <div
        className={`rounded-2xl border p-5 sm:p-6 shadow-xs relative overflow-hidden ${
          prediction.riskLevel === 'Critical'
            ? 'bg-red-50 border-red-200 text-red-950'
            : prediction.riskLevel === 'High'
            ? 'bg-orange-50 border-orange-200 text-orange-950'
            : prediction.riskLevel === 'Medium'
            ? 'bg-amber-50 border-amber-200 text-amber-950'
            : 'bg-green-50 border-green-200 text-green-950'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                isAtRisk
                  ? 'bg-red-600 text-white shadow-xs shadow-red-200'
                  : prediction.riskLevel === 'Medium'
                  ? 'bg-amber-600 text-white shadow-xs shadow-amber-200'
                  : 'bg-green-600 text-white shadow-xs shadow-green-200'
              }`}
            >
              <ShieldAlert className="w-5 h-5" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold tracking-tight">
                  {prediction.riskLevel === 'Critical'
                    ? 'Critical Academic Risk Alert'
                    : prediction.riskLevel === 'High'
                    ? 'High Academic Risk Warning'
                    : prediction.riskLevel === 'Medium'
                    ? 'Moderate Academic Risk Alert'
                    : 'Low Risk — Academic Performance On-Track'}
                </h2>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    isAtRisk ? 'bg-red-200 text-red-900' : 'bg-green-200 text-green-900'
                  }`}
                >
                  Risk Score: {prediction.riskScore} / 100
                </span>
              </div>
              <p className="text-xs opacity-80 mt-0.5">
                {isAtRisk
                  ? 'Early Warning System triggered by attendance deficit, test underperformance, or declining trajectories.'
                  : 'Student is meeting institutional benchmarks across attendance, tests, and assignment submissions.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              id="generate-intervention-btn"
              onClick={fetchInterventionReport}
              disabled={loadingAi}
              className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-2xs disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>{loadingAi ? 'Synthesizing with Gemini...' : 'Generate AI Intervention Plan'}</span>
            </button>
          </div>
        </div>

        {/* Triggered Warning Flags */}
        <div className="mt-5 pt-4 border-t border-black/5">
          <p className="text-[10px] font-bold uppercase tracking-wider mb-2 opacity-80">
            Detected Warning Triggers & Risk Factors ({prediction.flaggedIssues.length})
          </p>

          {prediction.flaggedIssues.length === 0 ? (
            <div className="p-3 rounded-xl bg-white/80 border border-green-200 text-xs font-medium text-green-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span>Zero critical risk triggers detected. All criteria within safe parameters.</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {prediction.flaggedIssues.map((issue, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-white/90 border border-red-200 text-xs text-red-900 flex items-start gap-2 shadow-2xs"
                >
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span className="font-medium">{issue}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* AI Risk Intervention Report (if generated) */}
      {aiReport && (
        <div className="bg-white rounded-2xl border border-blue-200 p-6 shadow-md animate-in fade-in space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                AI Early Warning Intervention Protocol & Faculty Guide
              </h3>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider">
              {aiReport.monitoringPeriod || '30-Day Checkpoint'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Root Causes */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                Primary Root Causes Identified
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {aiReport.rootCauses?.map((cause, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                    <span>{cause}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Faculty Action Steps */}
            <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100">
              <h4 className="text-[10px] font-bold text-blue-900 uppercase tracking-wider mb-2">
                Recommended Faculty Actions
              </h4>
              <ul className="space-y-1.5 text-xs text-blue-900 font-medium">
                {aiReport.facultyActions?.map((action, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 mt-0.5 shrink-0" />
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Counseling Notes & Talking Points */}
          {aiReport.counselingNotes && (
            <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200">
              <h4 className="text-[10px] font-bold text-amber-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-amber-700" /> Advisor 1-on-1 Counseling Talking Points
              </h4>
              <p className="text-xs text-amber-900 leading-relaxed font-medium">{aiReport.counselingNotes}</p>
            </div>
          )}
        </div>
      )}

      {/* Intervention Action Logger & History */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Faculty & Advisor Intervention Logs</h3>
            <p className="text-xs text-slate-500">
              Document mentorship sessions, remedial assignments, and parent communications
            </p>
          </div>

          <button
            onClick={() => setIsLoggingIntervention(!isLoggingIntervention)}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-xs shadow-blue-200"
          >
            <Plus className="w-3.5 h-3.5" /> Log Action
          </button>
        </div>

        {/* Log Form */}
        {isLoggingIntervention && (
          <form onSubmit={handleSaveIntervention} className="p-4 rounded-xl bg-slate-50 border border-slate-200 mb-4 space-y-3 animate-in fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Educator Name</label>
                <input
                  type="text"
                  value={newIntervention.educatorName}
                  onChange={(e) => setNewIntervention({ ...newIntervention, educatorName: e.target.value })}
                  required
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Intervention Type</label>
                <select
                  value={newIntervention.type}
                  onChange={(e) => setNewIntervention({ ...newIntervention, type: e.target.value as any })}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500/20 font-medium"
                >
                  <option value="Counseling">Academic 1-on-1 Counseling</option>
                  <option value="Remedial Class">Remedial Tutoring Assigned</option>
                  <option value="Attendance Warning">Official Attendance Caution</option>
                  <option value="Parent Meeting">Parent-Advisor Conference</option>
                  <option value="Peer Tutor Assigned">Peer Mentor Matched</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Session Notes & Action Items</label>
              <textarea
                rows={2}
                placeholder="Detail the discussion, goals set, and review dates..."
                value={newIntervention.notes}
                onChange={(e) => setNewIntervention({ ...newIntervention, notes: e.target.value })}
                required
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsLoggingIntervention(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs shadow-blue-200"
              >
                Save Intervention Entry
              </button>
            </div>
          </form>
        )}

        {/* Existing Intervention Log List */}
        {(!student.interventions || student.interventions.length === 0) ? (
          <div className="text-center py-6 text-slate-400 text-xs">
            No formal interventions recorded for this student yet.
          </div>
        ) : (
          <div className="space-y-2.5">
            {student.interventions.map((record) => (
              <div
                key={record.id}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-slate-900">{record.type}</span>
                    <span className="text-[10px] text-slate-400 font-mono">• {record.date}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                      {record.status}
                    </span>
                  </div>
                  <p className="text-slate-600 leading-relaxed font-medium">{record.notes}</p>
                </div>
                <div className="text-slate-400 text-[10px] shrink-0 sm:text-right">
                  Logged by <strong className="text-slate-700">{record.educatorName}</strong>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
