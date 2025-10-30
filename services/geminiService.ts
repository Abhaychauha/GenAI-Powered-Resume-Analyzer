import { GoogleGenAI, Type } from "@google/genai";
import type { AnalysisResult } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    score: {
      type: Type.NUMBER,
      description: "A score from 0 to 100 representing how well the resume matches the job description. 100 is a perfect match."
    },
    summary: {
      type: Type.STRING,
      description: "A concise, one-paragraph summary of the candidate's fit for the role, highlighting key strengths and weaknesses."
    },
    matchingSkills: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "A list of skills from the resume that directly match the requirements in the job description."
    },
    missingSkills: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "A list of key skills mentioned in the job description that are missing from the resume."
    },
    experienceSummary: {
      type: Type.STRING,
      description: "A brief summary analyzing the candidate's work experience in relation to the job requirements."
    },
  },
  required: ["score", "summary", "matchingSkills", "missingSkills", "experienceSummary"]
};

export const analyzeResume = async (resumeText: string, jobDescriptionText: string): Promise<AnalysisResult> => {
  const prompt = `
    Analyze the following resume against the provided job description.
    You are an expert technical recruiter with 20 years of experience.
    Provide a detailed analysis in the requested JSON format.

    **Resume:**
    ---
    ${resumeText}
    ---

    **Job Description:**
    ---
    ${jobDescriptionText}
    ---
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.2,
      },
    });

    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText);

    // Basic validation to ensure the parsed object matches the expected structure
    if (
        typeof result.score !== 'number' ||
        typeof result.summary !== 'string' ||
        !Array.isArray(result.matchingSkills) ||
        !Array.isArray(result.missingSkills) ||
        typeof result.experienceSummary !== 'string'
    ) {
        throw new Error("API response does not match the expected format.");
    }
    
    return result as AnalysisResult;

  } catch (error) {
    console.error("Error analyzing resume with Gemini API:", error);
    throw new Error("Failed to get analysis from the AI. Please check the console for more details.");
  }
};

export const rewriteResume = async (resumeText: string, jobDescriptionText: string): Promise<string> => {
  const prompt = `
    You are a world-class professional resume writer and career coach with decades of experience.
    Your task is to rewrite the provided resume to be perfectly tailored for the given job description.
    Follow these instructions carefully:
    1.  Analyze the job description to identify the most critical keywords, skills, and qualifications.
    2.  Restructure the resume to highlight the candidate's most relevant experiences and skills first.
    3.  Rephrase bullet points in the experience section using action verbs and quantifiable achievements that directly align with the job requirements.
    4.  Refine the professional summary to be a compelling pitch for this specific role.
    5.  Ensure the skills section includes keywords from the job description that the candidate possesses.
    6.  The final output must be only the full text of the rewritten resume, formatted cleanly. Do not include any introductory phrases, explanations, or comments like "Here is the rewritten resume:".

    **Original Resume:**
    ---
    ${resumeText}
    ---

    **Target Job Description:**
    ---
    ${jobDescriptionText}
    ---
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro", // Using pro for a higher quality rewrite
      contents: prompt,
      config: {
        temperature: 0.5, // Allow for some creativity in rewriting
      },
    });

    return response.text.trim();

  } catch (error) {
    console.error("Error rewriting resume with Gemini API:", error);
    throw new Error("Failed to get rewritten resume from the AI. Please check the console for more details.");
  }
};
