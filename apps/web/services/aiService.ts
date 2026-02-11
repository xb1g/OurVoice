import { CommunityInfo, Issue } from "../types";
import { generateIssueAiSuggestion } from "./issuesApi";

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
  issueId: string,
  community: CommunityInfo
): Promise<Issue> => {
  return generateIssueAiSuggestion(issueId, community);
};
