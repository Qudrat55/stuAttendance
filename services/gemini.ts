import { GoogleGenAI } from "@google/genai";
import { AttendanceRecord, Student } from "../types";

// Helper to safely get the API key
const getApiKey = (): string | undefined => {
  return process.env.API_KEY;
};

export const generateAttendanceReport = async (
  students: Student[],
  attendance: AttendanceRecord[]
): Promise<string> => {
  const apiKey = getApiKey();
  if (!apiKey) return "API Key not configured. Please add your Gemini API Key.";

  const ai = new GoogleGenAI({ apiKey });
  
  // Prepare data summary for AI
  const summary = students.map(s => {
    const records = attendance.filter(a => a.studentId === s.id);
    const present = records.filter(a => a.status === 'PRESENT').length;
    const absent = records.filter(a => a.status === 'ABSENT').length;
    const late = records.filter(a => a.status === 'LATE').length;
    return `${s.name} (${s.grade}): Present ${present}, Absent ${absent}, Late ${late}`;
  }).join('\n');

  const prompt = `
    Analyze the following student attendance data and provide a brief executive summary.
    Identify trends, students at risk of chronic absenteeism, and positive behaviors.
    Keep it professional and concise (max 3 paragraphs).
    
    Data:
    ${summary}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "No analysis generated.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Failed to generate AI report.";
  }
};