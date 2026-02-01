import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface AiSuggestion {
  text: string;
  sources: { uri: string; title: string }[];
}

export const generateSolutionSuggestion = async (
  title: string,
  description: string
): Promise<AiSuggestion> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a helpful expert assistant for a condo community.
      
      Community Issue: "${title}"
      Context: "${description}"
      
      Please suggest a concrete, professional solution.
      Include:
      1. A clear action plan.
      2. An estimated cost range (e.g., "$500 - $1,000").
      3. Reasoning based on industry standards or similar projects.
      
      Use Google Search to validate costs and find relevant local regulations or examples if applicable.`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "No suggestion generated.";
    
    // Extract unique sources from grounding chunks
    const rawSources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = rawSources
      .map((chunk: any) => chunk.web)
      .filter((web: any) => web && web.uri && web.title);

    // Deduplicate based on URI
    const uniqueSources = Array.from(new Map(sources.map((s: any) => [s.uri, s])).values()) as { uri: string; title: string }[];

    return {
      text,
      sources: uniqueSources
    };
  } catch (error) {
    console.error("AI Service Error:", error);
    throw new Error("Failed to generate suggestion. Please check your connection and try again.");
  }
};