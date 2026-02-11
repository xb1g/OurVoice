import { aiSuggestionSchema } from "../../../../packages/shared/src/index";

type CommunityContext = {
  name: string;
  units: number;
  address: string;
  city: string;
  state: string;
  zipCode: string;
};

const extractText = (response: any) => {
  const parts = response?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) return "{}";
  const textPart = parts.find((part: any) => typeof part?.text === "string");
  return textPart?.text ?? "{}";
};

const extractSources = (response: any) => {
  const chunks = response?.candidates?.[0]?.groundingMetadata?.groundingChunks;
  if (!Array.isArray(chunks)) return [];

  return Array.from(
    new Map(
      chunks
        .map((chunk: any) => chunk?.web)
        .filter((web: any) => web?.uri && web?.title)
        .map((web: any) => [web.uri, { uri: web.uri, title: web.title }])
    ).values()
  );
};

export const generateIssueAiSuggestion = async (
  apiKey: string,
  title: string,
  description: string,
  community: CommunityContext
) => {
  const prompt = `
You are an expert property manager assistant for "${community.name}", a condo building with ${community.units} units located at ${community.address}, ${community.city}, ${community.state} ${community.zipCode}.

Issue: "${title}"
Description: "${description}"

Task:
1. Analyze the issue and provide a concise step-by-step action plan in Markdown.
2. Suggest 2-3 local contractor options with name, phone, website, specialty, and suitability note.
3. Provide an estimated budget range.
Return JSON with fields: analysis, contractors, estimatedBudget.
`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(
      apiKey
    )}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        tools: [{ googleSearch: {} }],
        generationConfig: {
          responseMimeType: "application/json",
        },
      }),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`AI upstream error: ${res.status} ${text}`);
  }

  const payload = await res.json();
  const parsed = JSON.parse(extractText(payload) || "{}");

  return aiSuggestionSchema.parse({
    analysis: parsed.analysis ?? "No analysis generated.",
    contractors: parsed.contractors ?? [],
    estimatedBudget: parsed.estimatedBudget ?? "Unknown",
    sources: extractSources(payload),
  });
};
