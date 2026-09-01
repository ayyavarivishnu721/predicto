export type UserRole = 'student' | 'admin' | 'faculty';

export interface SubjectMarks {
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  internal1: number; // Max 30
  internal2: number; // Max 30
  assignmentScore: number; // Max 20
  quizScore: number; // Max 20
  totalInternal: number; // Max 100
  credits: number;
}

export interface SubjectAttendance {
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  totalClasses: number;
  attendedClasses: number;
  percentage: number;
  lastUpdated: string;
}

export interface AttendanceEntry {
  id: string;
  date: string;
  subjectId: string;
  subjectName: string;
  status: 'present' | 'absent' | 'excused';
  notes?: string;
}

export interface SemesterGPA {
  semester: number;
  gpa: number;
  credits: number;
}

export interface StudyHabits {
  weeklyStudyHours: number; // e.g. 12
  dailySleepHours: number; // e.g. 7
  extracurricularHours: number; // e.g. 4
  assignmentCompletionRate: number; // 0 - 100%
  libraryVisitsPerMonth: number;
  commuteTimeMinutes: number;
  internetAccessQuality: 'High' | 'Medium' | 'Low';
  hasPeerStudyGroup: boolean;
  hasPrivateTutor: boolean;
  stressLevel: 'Low' | 'Moderate' | 'High';
}

export interface Student {
  id: string;
  studentId: string; // e.g. "STU-2024-042"
  name: string;
  email: string;
  avatarUrl: string;
  department: string;
  semester: number;
  academicYear: string;
  advisorName: string;
  cgpa: number;
  gpaHistory: SemesterGPA[];
  habits: StudyHabits;
  marks: SubjectMarks[];
  attendance: SubjectAttendance[];
  attendanceHistory: AttendanceEntry[];
  enrollmentStatus: 'Active' | 'On Leave' | 'Graduated';
  interventions: InterventionRecord[];
}

export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export interface FeatureImpact {
  feature: string;
  impactScore: number; // positive or negative contribution
  description: string;
  direction: 'positive' | 'negative' | 'neutral';
}

export interface MLPredictionResult {
  predictedScore: number; // 0 - 100%
  predictedGrade: 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D' | 'F';
  confidenceInterval: {
    min: number;
    max: number;
  };
  passProbability: number; // 0 - 100%
  distinctionProbability: number; // 0 - 100%
  riskLevel: RiskLevel;
  riskScore: number; // 0 - 100 (higher = riskier)
  flaggedIssues: string[];
  keyFactors: FeatureImpact[];
  calculatedAt: string;
}

export interface ActionPlanItem {
  priority: 'High' | 'Medium' | 'Low';
  title: string;
  description: string;
  timeline: string;
}

export interface SubjectAdvice {
  subject: string;
  tip: string;
}

export interface AIRecommendation {
  summary: string;
  learningStyleInsight?: string;
  actionPlan: ActionPlanItem[];
  subjectSpecificAdvice: SubjectAdvice[];
  habitsRecommendation: string;
  motivationalNote?: string;
  source: 'gemini' | 'heuristic';
  generatedAt: string;
}

export interface InterventionRecord {
  id: string;
  date: string;
  educatorName: string;
  type: 'Counseling' | 'Remedial Class' | 'Attendance Warning' | 'Parent Meeting' | 'Peer Tutor Assigned';
  notes: string;
  status: 'Open' | 'In Progress' | 'Resolved';
}

export interface RiskInterventionReport {
  severity: string;
  rootCauses: string[];
  facultyActions: string[];
  recommendedInterventions: {
    type: string;
    details: string;
  }[];
  monitoringPeriod: string;
  counselingNotes: string;
}

export interface WhatIfSimulation {
  attendanceRate: number;
  weeklyStudyHours: number;
  assignmentCompletionRate: number;
  dailySleepHours: number;
  simulatedScore: number;
  simulatedGrade: string;
  simulatedRisk: RiskLevel;
  scoreDifference: number;
  aiInsight?: string;
}
