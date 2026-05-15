import { GoogleGenAI, Type } from "@google/genai";

let aiInstance: GoogleGenAI | null = null;

function getAi() {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is missing. Please check your environment variables.");
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

export async function breakdownTask(taskTitle: string, lang: 'es' | 'en' = 'en') {
  try {
    const ai = getAi();
    const languageName = lang === 'es' ? 'Spanish' : 'English';
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `I have a task for an ADHD brain: "${taskTitle}". 
      Break it down into 3-5 very small, non-overwhelming, actionable steps.
      Each step should be clear and take less than 15-30 minutes.
      The output MUST be in ${languageName}.
      Return the steps as an array of strings in JSON format.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            steps: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["steps"]
        }
      }
    });

    const data = JSON.parse(response.text || '{"steps": []}');
    return data.steps as string[];
  } catch (error) {
    console.error("Gemini Error:", error);
    return [];
  }
}

export async function summarizeBrainDump(text: string, lang: 'es' | 'en' = 'en') {
  try {
    const ai = getAi();
    const languageName = lang === 'es' ? 'Spanish' : 'English';
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze this messy "Brain Dump": "${text}".
      Identify the main theme and extract any actionable tasks.
      The textual output (summary and tasks) MUST be in ${languageName}.
      Return a JSON object with:
      1. a "summary" (one punchy sentence)
      2. "tasks" (array of strings)
      3. "category" (one of: trabajo, personal, urgente, idea, compra)
      
      Category mapping guide:
      - trabajo: work, professional, career
      - personal: home, family, health, private
      - urgente: immediate action required, time-sensitive
      - idea: creative thoughts, projects for future, inspiration
      - compra: shopping list, items to buy`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            tasks: { type: Type.ARRAY, items: { type: Type.STRING } },
            category: { 
              type: Type.STRING, 
              enum: ["trabajo", "personal", "urgente", "idea", "compra"] 
            }
          },
          required: ["summary", "tasks", "category"]
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Gemini Error:", error);
    return null;
  }
}
