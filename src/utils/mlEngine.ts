import { Student, MLPredictionResult, RiskLevel, FeatureImpact, SubjectMarks } from '../types';

export function calculateAverageMarks(marks: SubjectMarks[]): number {
  if (!marks || marks.length === 0) return 0;
  const total = marks.reduce((sum, m) => sum + (m.totalInternal || 0), 0);
  return Math.round((total / marks.length) * 10) / 10;
}

export function calculateOverallAttendance(attendance: { totalClasses: number; attendedClasses: number }[]): number {
  if (!attendance || attendance.length === 0) return 0;
  const totalClasses = attendance.reduce((sum, a) => sum + a.totalClasses, 0);
  const attendedClasses = attendance.reduce((sum, a) => sum + a.attendedClasses, 0);
  if (totalClasses === 0) return 0;
  return Math.round((attendedClasses / totalClasses) * 1000) / 10;
}

export function mapScoreToGrade(score: number): 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D' | 'F' {
  if (score >= 90) return 'A+';
  if (score >= 80) return 'A';
  if (score >= 70) return 'B+';
  if (score >= 60) return 'B';
  if (score >= 50) return 'C';
  if (score >= 40) return 'D';
  return 'F';
}

/**
 * Predicts final academic score & grade based on multi-variate educational data
 */
export function runMLPrediction(student: Student, simulatedOverrides?: {
  attendanceRate?: number;
  weeklyStudyHours?: number;
  assignmentCompletionRate?: number;
  dailySleepHours?: number;
}): MLPredictionResult {
  const avgMarks = calculateAverageMarks(student.marks);
  const realAttendance = calculateOverallAttendance(student.attendance);
  const attendanceRate = simulatedOverrides?.attendanceRate ?? realAttendance;
  const studyHours = simulatedOverrides?.weeklyStudyHours ?? student.habits.weeklyStudyHours;
  const assignmentRate = simulatedOverrides?.assignmentCompletionRate ?? student.habits.assignmentCompletionRate;
  const sleepHours = simulatedOverrides?.dailySleepHours ?? student.habits.dailySleepHours;
  const cgpaPercentage = (student.cgpa / 10) * 100;

  // Study hours diminishing return curve (optimal at 20-25 hrs/week)
  const studyHoursNormalized = Math.min(100, (studyHours / 22) * 100);

  // Sleep optimal curve (7-8 hours optimal, penalty for <5 or >10)
  let sleepFactor = 100;
  if (sleepHours < 6) {
    sleepFactor = 70 + (sleepHours / 6) * 30;
  } else if (sleepHours > 9) {
    sleepFactor = Math.max(70, 100 - (sleepHours - 9) * 10);
  }

  // Habits booster
  let habitBonus = 0;
  if (student.habits.hasPeerStudyGroup) habitBonus += 3;
  if (student.habits.hasPrivateTutor) habitBonus += 4;
  if (student.habits.stressLevel === 'High') habitBonus -= 5;
  if (student.habits.stressLevel === 'Low') habitBonus += 2;
  if (student.habits.internetAccessQuality === 'High') habitBonus += 2;

  // Multi-variate Linear Regression Weights:
  // Internal Marks: 0.38
  // Attendance: 0.22
  // Assignment: 0.16
  // Study Hours: 0.12
  // Past CGPA: 0.08
  // Sleep & Habits: 0.04
  const rawScore =
    avgMarks * 0.38 +
    attendanceRate * 0.22 +
    assignmentRate * 0.16 +
    studyHoursNormalized * 0.12 +
    cgpaPercentage * 0.08 +
    (sleepFactor / 100) * 4 +
    habitBonus;

  const predictedScore = Math.max(0, Math.min(99.5, Math.round(rawScore * 10) / 10));
  const predictedGrade = mapScoreToGrade(predictedScore);

  // Calculate Variance & Confidence Interval
  const markScores = student.marks.map((m) => m.totalInternal);
  const markVariance =
    markScores.length > 1
      ? Math.sqrt(
          markScores.reduce((acc, val) => acc + Math.pow(val - avgMarks, 2), 0) /
            (markScores.length - 1)
        )
      : 5;
  const marginOfError = Math.max(2.5, Math.min(6.5, Math.round((markVariance * 0.45) * 10) / 10));

  const confidenceInterval = {
    min: Math.max(0, Math.round((predictedScore - marginOfError) * 10) / 10),
    max: Math.min(100, Math.round((predictedScore + marginOfError) * 10) / 10),
  };

  // Logistic function for Pass Probability (>45 threshold)
  const passZ = (predictedScore - 45) / 10;
  const passProbability = Math.round((1 / (1 + Math.exp(-passZ * 1.6))) * 100);

  // Distinction Probability (>75 threshold)
  const distZ = (predictedScore - 75) / 10;
  const distinctionProbability = Math.round((1 / (1 + Math.exp(-distZ * 1.5))) * 100);

  // Risk Assessment Calculation
  const flaggedIssues: string[] = [];
  let riskScoreCalc = 0;

  if (attendanceRate < 70) {
    riskScoreCalc += 35;
    flaggedIssues.push(`Critically low overall attendance (${attendanceRate}%) — Below university 75% threshold`);
  } else if (attendanceRate < 78) {
    riskScoreCalc += 18;
    flaggedIssues.push(`Borderline attendance (${attendanceRate}%) in current term`);
  }

  // Check subject-specific attendance
  const lowAttendanceSubjects = student.attendance.filter((a) => a.percentage < 75);
  if (lowAttendanceSubjects.length > 0) {
    riskScoreCalc += lowAttendanceSubjects.length * 8;
    flaggedIssues.push(
      `Attendance shortfall in ${lowAttendanceSubjects.length} subject(s): ${lowAttendanceSubjects.map((s) => s.subjectName).join(', ')}`
    );
  }

  // Check failed internals or poor assignments
  const failingSubjects = student.marks.filter((m) => m.totalInternal < 50);
  if (failingSubjects.length > 0) {
    riskScoreCalc += failingSubjects.length * 15;
    flaggedIssues.push(
      `Failing or critical score (<50) in ${failingSubjects.length} course(s): ${failingSubjects.map((s) => s.subjectName).join(', ')}`
    );
  }

  // Test trend check (Internal 2 vs Internal 1 drop)
  const droppingSubjects = student.marks.filter((m) => m.internal1 > 0 && m.internal2 < m.internal1 - 5);
  if (droppingSubjects.length > 0) {
    riskScoreCalc += 10;
    flaggedIssues.push(`Performance decline noted between Internal Exam 1 and 2 in ${droppingSubjects.length} subject(s)`);
  }

  if (assignmentRate < 60) {
    riskScoreCalc += 15;
    flaggedIssues.push(`Low assignment submission rate (${assignmentRate}%)`);
  }

  if (studyHours < 6) {
    riskScoreCalc += 12;
    flaggedIssues.push(`Insufficient weekly self-study time (${studyHours} hrs/week)`);
  }

  if (student.habits.stressLevel === 'High') {
    riskScoreCalc += 8;
    flaggedIssues.push(`Reported high academic stress level affecting study consistency`);
  }

  if (predictedScore < 50) {
    riskScoreCalc += 25;
  }

  const finalRiskScore = Math.min(100, Math.max(5, riskScoreCalc));

  let riskLevel: RiskLevel = 'Low';
  if (finalRiskScore >= 65 || predictedScore < 45 || attendanceRate < 65) {
    riskLevel = 'Critical';
  } else if (finalRiskScore >= 45 || predictedScore < 60) {
    riskLevel = 'High';
  } else if (finalRiskScore >= 25 || attendanceRate < 80) {
    riskLevel = 'Medium';
  } else {
    riskLevel = 'Low';
  }

  // Feature Impact Analysis (SHAP-style attribution)
  const keyFactors: FeatureImpact[] = [
    {
      feature: 'Internal Assessments',
      impactScore: Math.round((avgMarks - 70) * 0.38 * 10) / 10,
      description: `Current internal test average is ${avgMarks}%`,
      direction: avgMarks >= 70 ? 'positive' : 'negative',
    },
    {
      feature: 'Class Attendance',
      impactScore: Math.round((attendanceRate - 75) * 0.28 * 10) / 10,
      description: `Attendance of ${attendanceRate}% ${attendanceRate >= 75 ? 'supports concept retention' : 'creates learning gaps'}`,
      direction: attendanceRate >= 75 ? 'positive' : 'negative',
    },
    {
      feature: 'Assignment Consistency',
      impactScore: Math.round((assignmentRate - 75) * 0.20 * 10) / 10,
      description: `${assignmentRate}% coursework submitted on time`,
      direction: assignmentRate >= 75 ? 'positive' : 'negative',
    },
    {
      feature: 'Study Routine',
      impactScore: Math.round((studyHours - 12) * 0.6 * 10) / 10,
      description: `${studyHours} hours of independent study per week`,
      direction: studyHours >= 12 ? 'positive' : 'negative',
    },
    {
      feature: 'Prior Academic Record (CGPA)',
      impactScore: Math.round((student.cgpa - 7.0) * 3.5 * 10) / 10,
      description: `Cumulative GPA baseline of ${student.cgpa} / 10.0`,
      direction: student.cgpa >= 7.0 ? 'positive' : 'negative',
    },
  ];

  return {
    predictedScore,
    predictedGrade,
    confidenceInterval,
    passProbability,
    distinctionProbability,
    riskLevel,
    riskScore: finalRiskScore,
    flaggedIssues,
    keyFactors: keyFactors.sort((a, b) => Math.abs(b.impactScore) - Math.abs(a.impactScore)),
    calculatedAt: new Date().toISOString(),
  };
}

/**
 * Reverse Solver: Calculates what changes are needed to achieve a target grade
 */
export function solveForTargetGrade(
  student: Student,
  targetScore: number
): {
  feasible: boolean;
  requiredAttendance: number;
  requiredStudyHours: number;
  requiredAssignmentRate: number;
  advice: string;
} {
  const currentPred = runMLPrediction(student);
  const scoreGap = targetScore - currentPred.predictedScore;

  if (scoreGap <= 0) {
    return {
      feasible: true,
      requiredAttendance: calculateOverallAttendance(student.attendance),
      requiredStudyHours: student.habits.weeklyStudyHours,
      requiredAssignmentRate: student.habits.assignmentCompletionRate,
      advice: 'You are currently on track to reach or exceed this grade target! Maintain your current routine.',
    };
  }

  // Calculate proportional adjustments
  const currentAtt = calculateOverallAttendance(student.attendance);
  const currentHours = student.habits.weeklyStudyHours;
  const currentAssign = student.habits.assignmentCompletionRate;

  // Add study hours (+0.6% per hour) & Attendance (+0.25% per %) & Assignments (+0.2% per %)
  const targetAttendance = Math.min(98, Math.max(currentAtt, Math.round(currentAtt + scoreGap * 0.8)));
  const targetStudyHours = Math.min(28, Math.max(currentHours, Math.round(currentHours + scoreGap * 0.6)));
  const targetAssignments = Math.min(100, Math.max(currentAssign, Math.round(currentAssign + scoreGap * 0.7)));

  // Test simulation
  const testSim = runMLPrediction(student, {
    attendanceRate: targetAttendance,
    weeklyStudyHours: targetStudyHours,
    assignmentCompletionRate: targetAssignments,
  });

  const feasible = testSim.predictedScore >= targetScore - 2;

  return {
    feasible,
    requiredAttendance: targetAttendance,
    requiredStudyHours: targetStudyHours,
    requiredAssignmentRate: targetAssignments,
    advice: feasible
      ? `Achievable by increasing study to ${targetStudyHours}h/week, lifting attendance to ${targetAttendance}%, and submitting all assignments.`
      : `Reaching this score is ambitious within the remaining term. Focus first on high-weight internal tests and scoring 85%+ in final submissions.`,
  };
}

/**
 * Calculates cohort stats for admin comparison
 */
export function calculateCohortStatistics(students: Student[]) {
  if (!students || students.length === 0) {
    return {
      totalStudents: 0,
      averageCGPA: 0,
      averageAttendance: 0,
      averagePredictedScore: 0,
      atRiskCount: 0,
      criticalCount: 0,
      gradeDistribution: { 'A+': 0, 'A': 0, 'B+': 0, 'B': 0, 'C': 0, 'D': 0, 'F': 0 },
      riskDistribution: { Low: 0, Medium: 0, High: 0, Critical: 0 },
    };
  }

  let totalCgpa = 0;
  let totalAtt = 0;
  let totalPredScore = 0;
  let atRiskCount = 0;
  let criticalCount = 0;

  const gradeDistribution: Record<string, number> = {
    'A+': 0,
    A: 0,
    'B+': 0,
    B: 0,
    C: 0,
    D: 0,
    F: 0,
  };

  const riskDistribution: Record<RiskLevel, number> = {
    Low: 0,
    Medium: 0,
    High: 0,
    Critical: 0,
  };

  students.forEach((st) => {
    totalCgpa += st.cgpa;
    const att = calculateOverallAttendance(st.attendance);
    totalAtt += att;

    const pred = runMLPrediction(st);
    totalPredScore += pred.predictedScore;
    gradeDistribution[pred.predictedGrade] = (gradeDistribution[pred.predictedGrade] || 0) + 1;
    riskDistribution[pred.riskLevel] = (riskDistribution[pred.riskLevel] || 0) + 1;

    if (pred.riskLevel === 'Critical') {
      criticalCount++;
      atRiskCount++;
    } else if (pred.riskLevel === 'High' || pred.riskLevel === 'Medium') {
      atRiskCount++;
    }
  });

  return {
    totalStudents: students.length,
    averageScore: Math.round((totalPredScore / (students.length || 1)) * 10) / 10,
    averageCGPA: Math.round((totalCgpa / (students.length || 1)) * 100) / 100,
    averageAttendance: Math.round((totalAtt / (students.length || 1)) * 10) / 10,
    averagePredictedScore: Math.round((totalPredScore / (students.length || 1)) * 10) / 10,
    atRiskCount,
    criticalCount,
    gradeDistribution,
    riskDistribution,
  };
}

export const computeCohortStats = calculateCohortStatistics;
