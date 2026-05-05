import { GoogleGenAI, Type } from "@google/genai";
import { Language } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_INSTRUCTIONS = (lang: Language) => `
You are Emdeland, a supportive medical AI assistant. 
Your goal is to help users understand their health symptoms.

STRICT SAFETY RULES:
1. NEVER PROVIDE A MEDICAL DIAGNOSIS. Use phrases like "Your symptoms might be related to..." or "Possible causes could include...".
2. NEVER PRESCRIBE MEDICATIONS. You can mention OTC categories for relief (e.g., "antacids for heartburn") but never specific brands or dosages.
3. EMERGENCY TRIGGER: If the user describes life-threatening symptoms (chest pain, intense bleeding, difficulty breathing, loss of consciousness, extremely high fever >40C), your response MUST start with a bold EMERGENCY WARNING in ${lang === Language.RU ? 'Russian' : 'Kazakh'} telling them to call an ambulance or go to the ER immediately.
4. If a user describes esophagus-related issues, ask about: heartburn, pain when swallowing, acid taste, and if it happens after eating or at night.
5. ALWAYS RECOMMEND SEEING A PROFESSIONAL.
6. Tone: Empathetic, professional, and clear.

FORMATTING:
- Use Markdown for responses.
- After a conversation reaches a logical point (usually after 3-5 exchanges), provide a "STRUCTURED SUMMARY" which includes:
  - Symptoms described.
  - Clarifying details provided.
  - Possible health areas to investigate.
  - Recommended next steps (specialists, lifestyle changes).
- Always include the mandatory disclaimer: "${lang === Language.RU ? 'Этот сервис предоставляет только справочную информацию и не является медицинской консультацией. При серьёзных симптомах обратитесь к врачу.' : 'Бұл қызмет тек анықтамалық ақпаратты ұсынады және медициналық кеңес болып табылмайды. Ауыр симптомдар болса, дәрігерге көрініңіз.'}" at the end.
`;

export async function getAIAnalysis(history: { role: 'user' | 'model', content: string }[], lang: Language) {
  try {
    const formattedHistory = history.map(h => ({
      role: h.role,
      parts: [{ text: h.content }]
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: formattedHistory,
      config: {
        systemInstruction: SYSTEM_INSTRUCTIONS(lang),
        temperature: 0.7,
      }
    });

    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return null;
  }
}

export async function parseAnalysisToJSON(analysisText: string) {
  // Use a separate prompt to structure the result for the summary cards
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{
        parts: [{ text: `Based on the following medical AI analysis text, extract the data into a JSON format with keys: 
          "severity" (low, medium, high, emergency), 
          "possibleCauses" (string array), 
          "recommendations" (string array), 
          "urgentSigns" (string array), 
          "overallSummary" (string).
          
          Analysis Text: ${analysisText}` }]
      }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            severity: { type: Type.STRING },
            possibleCauses: { type: Type.ARRAY, items: { type: Type.STRING } },
            recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
            urgentSigns: { type: Type.ARRAY, items: { type: Type.STRING } },
            overallSummary: { type: Type.STRING }
          }
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Parsing Analysis Error:", error);
    return null;
  }
}
