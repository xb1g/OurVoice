import { GoogleGenAI, Type } from "@google/genai";
import { CommunityInfo } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface Contractor {
  name: string;
  specialty: string;
  website: string;
  phone: string;
  note: string;
}

export interface AiSuggestion {
  analysis: string;
  contractors: Contractor[];
  estimatedBudget: string;
  sources: { uri: string; title: string }[];
}

export const generateSolutionSuggestion = async (
  title: string,
  description: string,
  community: CommunityInfo
): Promise<AiSuggestion> => {
  try {
    const prompt = `
      You are an expert property manager assistant for "${community.name}", a condo building with ${community.units} units located at ${community.address}, ${community.city}, ${community.state} ${community.zipCode}.

      Issue: "${title}"
      Description: "${description}"

      Task:
      1. **Analyze**: Briefly validate the problem and create a step-by-step action plan in Markdown format. Be concise.
      2. **Search**: Use Google Search to find 2-3 specific, highly-rated local contractors in ${community.city}, ${community.state} relevant to this issue. Focus on businesses that actually serve this zip code.
      3. **Structure**: Return the result as JSON.
         - For contractors, include Name, Phone, Website, Specialty, and a short note (1-2 sentences) about their suitability.
         - Include an estimated budget range for the whole project.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            analysis: {
              type: Type.STRING,
              description: "Markdown text with validation of the problem and a step-by-step action plan."
            },
            contractors: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  specialty: { type: Type.STRING },
                  website: { type: Type.STRING },
                  phone: { type: Type.STRING },
                  note: { type: Type.STRING, description: "Suitability note." },
                },
                required: ["name", "specialty"]
              }
            },
            estimatedBudget: {
              type: Type.STRING,
              description: "Estimated cost range for the project."
            }
          }
        }
      },
    });

    const jsonText = response.text || "{}";
    const parsed = JSON.parse(jsonText);
    
    // Extract unique sources from grounding chunks
    const rawSources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = rawSources
      .map((chunk: any) => chunk.web)
      .filter((web: any) => web && web.uri && web.title);

    // Deduplicate based on URI
    const uniqueSources = Array.from(new Map(sources.map((s: any) => [s.uri, s])).values()) as { uri: string; title: string }[];

    return {
      analysis: parsed.analysis || "No analysis generated.",
      contractors: parsed.contractors || [],
      estimatedBudget: parsed.estimatedBudget || "Unknown",
      sources: uniqueSources
    };
  } catch (error) {
    console.error("AI Service Error:", error);
    return {
        analysis: "Failed to generate structured data. Please try again.",
        contractors: [],
        estimatedBudget: "",
        sources: []
    };
  }
};