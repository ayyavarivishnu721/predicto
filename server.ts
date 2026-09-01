import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Lazy initialize Gemini client
let genAiClient: GoogleGenAI | null = null;
function getGenAi(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!genAiClient) {
    genAiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return genAiClient;
}

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// AI-powered personalized academic recommendations
app.post("/api/gemini/recommendations", async (req, res) => {
  try {
    const { student, prediction, subjects, attendance, marks } = req.body;
    const ai = getGenAi();

    if (!ai) {
      // Fallback heuristic recommendations if API key not available
      return res.json({
        success: true,
        source: "heuristic",
        summary: `Performance forecast indicates an estimated score of ${prediction?.predictedScore || 75}%. Focus is needed on courses with attendance below 80% and lowest internal test scores.`,
        actionPlan: [
          {
            priority: "High",
            title: "Improve Critical Course Attendance",
            description: "Target 85%+ attendance in subjects currently under 75% to retain eligibility and grasp core concepts.",
            timeline: "Immediate (Weeks 1-2)",
          },
          {
            priority: "Medium",
            title: "Focused Revision Blocks",
            description: "Allocate 90 minutes daily for structured practice in problem areas, especially quizzes and midterm revisions.",
            timeline: "Daily routine",
          },
          {
            priority: "Low",
            title: "Peer Study & Instructor Office Hours",
            description: "Join weekly peer tutoring groups and clarify assignment doubts before deadlines.",
            timeline: "Bi-weekly",
          },
        ],
        subjectSpecificAdvice: (subjects || []).map((sub: any) => ({
          subject: sub.name,
          tip: `Review chapter fundamentals and complete past 3 years' mock papers to boost score from current ${sub.score || 70}%.`,
        })),
        habitsRecommendation: "Establish a 25-minute Pomodoro study rhythm and reduce late-night screen time before exam weeks.",
      });
    }

    const prompt = `You are a Senior Academic Counselor & Educational Data Scientist.
Analyze the following student performance data and return a structured JSON recommendation report.

STUDENT PROFILE:
- Name: ${student?.name} (ID: ${student?.studentId})
- Major: ${student?.department} | Semester: ${student?.semester}
- Current CGPA: ${student?.cgpa} / 10.0
- Overall Attendance: ${student?.attendanceRate}%
- Weekly Study Hours: ${student?.weeklyStudyHours} hrs
- Assignment Completion: ${student?.assignmentCompletionRate}%
- Predicted Final Grade / Score: ${prediction?.predictedScore}% (${prediction?.predictedGrade})
- Risk Level: ${prediction?.riskLevel} (${prediction?.riskScore}% risk score)
- Key Influencing Factors: ${JSON.stringify(prediction?.keyFactors || [])}
- Subject Performance: ${JSON.stringify(subjects || [])}
- Internal Exam Marks: ${JSON.stringify(marks || [])}

Provide practical, empowering, and concrete academic recommendations. Return ONLY valid raw JSON with the following structure:
{
  "summary": "Executive summary string (2-3 sentences)",
  "learningStyleInsight": "Insight into their study pattern and optimal learning tactics",
  "actionPlan": [
    {
      "priority": "High" | "Medium" | "Low",
      "title": "Action title",
      "description": "Concrete step-by-step guidance",
      "timeline": "e.g. Next 14 days / Daily"
    }
  ],
  "subjectSpecificAdvice": [
    {
      "subject": "Subject Name",
      "tip": "Targeted remediation tip based on their marks and attendance"
    }
  ],
  "habitsRecommendation": "Habits, time-blocking, and test-taking strategy",
  "motivationalNote": "An encouraging concluding sentence tailored to their profile"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.7,
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json({ success: true, source: "gemini", ...parsed });
  } catch (error: any) {
    console.error("Gemini recommendations error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to generate recommendations",
    });
  }
});

// AI-powered early warning risk intervention report (for Teachers & Admin)
app.post("/api/gemini/risk-intervention", async (req, res) => {
  try {
    const { student, prediction, flaggedIssues } = req.body;
    const ai = getGenAi();

    if (!ai) {
      return res.json({
        success: true,
        source: "heuristic",
        interventionPlan: {
          severity: prediction?.riskLevel || "Medium",
          rootCauses: [
            "Attendance drop in foundational subjects",
            "Assignment submission delays and low quiz scores",
          ],
          facultyActions: [
            "Schedule 1-on-1 academic mentoring session within 5 business days.",
            "Assign a senior peer tutor for challenging coursework.",
            "Send attendance caution alert to student & academic advisor.",
          ],
          monitoringPeriod: "30-Day Checkpoint",
          counselingNotes: "Explore if external commitments, health, or conceptual gaps are contributing to the performance dip.",
        },
      });
    }

    const prompt = `You are a University Academic Dean and Student Retention Specialist.
Generate an Early Warning Intervention Protocol for an at-risk student.

STUDENT:
Name: ${student?.name} (${student?.studentId})
Department: ${student?.department}, Semester: ${student?.semester}
Attendance: ${student?.attendanceRate}%
CGPA: ${student?.cgpa}
Study Hours: ${student?.weeklyStudyHours} hrs/week
Assignment Rate: ${student?.assignmentCompletionRate}%
Risk Level: ${prediction?.riskLevel} (Risk Index: ${prediction?.riskScore}/100)
Predicted Performance: ${prediction?.predictedScore}% (${prediction?.predictedGrade})
Identified Triggers/Issues: ${JSON.stringify(flaggedIssues || [])}

Return a formal educator-facing intervention blueprint in JSON format:
{
  "severity": "${prediction?.riskLevel || "High"}",
  "rootCauses": ["Root cause 1", "Root cause 2", "Root cause 3"],
  "facultyActions": [
    "Specific administrative or pedagogical action 1",
    "Specific action 2",
    "Specific action 3"
  ],
  "recommendedInterventions": [
    {
      "type": "Mentorship" | "Remedial Classes" | "Attendance Contract" | "Psychological/Stress Support" | "Resource Grant",
      "details": "Actionable description"
    }
  ],
  "monitoringPeriod": "e.g., 2-Week Sprint / Bi-weekly audit",
  "counselingNotes": "Key questions and talking points for the faculty advisor during the 1-on-1 interview."
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.6,
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json({ success: true, source: "gemini", ...parsed });
  } catch (error: any) {
    console.error("Gemini risk-intervention error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to generate risk intervention",
    });
  }
});

// AI-powered "What-If" scenario advisor
app.post("/api/gemini/what-if-insights", async (req, res) => {
  try {
    const { student, baseline, simulated, changes } = req.body;
    const ai = getGenAi();

    if (!ai) {
      const scoreDiff = (simulated.predictedScore - baseline.predictedScore).toFixed(1);
      return res.json({
        success: true,
        source: "heuristic",
        insight: `Increasing attendance and weekly study hours provides a projected +${scoreDiff}% gain in overall score. Consistency over 4 weeks will convert this into grade tier improvement.`,
        feasibility: "High",
        keyMilestone: "Complete upcoming module assignments with 90%+ scores to lock in the projection.",
      });
    }

    const prompt = `You are an AI Academic Analytics Coach.
Analyze the student's "What-If" academic simulation:
Student: ${student?.name}
Baseline: Attendance: ${student?.attendanceRate}%, Study Hours: ${student?.weeklyStudyHours}h/wk, Current Score Projection: ${baseline?.predictedScore}% (${baseline?.predictedGrade})
Simulated Parameters: Attendance: ${changes?.attendance}%, Study Hours: ${changes?.studyHours}h/wk, Assignment Rate: ${changes?.assignments}%
Simulated Outcome: Score: ${simulated?.predictedScore}% (${simulated?.predictedGrade}), Risk Level: ${simulated?.riskLevel}

Provide an insightful, motivating, and mathematically sound breakdown in JSON format:
{
  "insight": "2-3 sentences explaining why these specific adjustments will produce the projected score shift.",
  "feasibility": "High" | "Moderate" | "Challenging",
  "weeklyRoutineShift": "Clear tip on how to realistically schedule these extra study hours.",
  "keyMilestone": "The earliest indicator or test where the student can validate this progress."
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.6,
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json({ success: true, source: "gemini", ...parsed });
  } catch (error: any) {
    console.error("Gemini what-if error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to generate what-if insights",
    });
  }
});

// Vite middleware & Static Serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Student Performance Prediction Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
