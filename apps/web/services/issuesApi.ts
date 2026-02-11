import type { Issue } from "../types";
import type { CommunityInfo } from "../types";
import { apiFetch } from "./apiClient";

type ApiIssueResponse = { data: Issue };
type ApiIssuesResponse = { data: Issue[] };

export const listIssues = async () => {
  const res = await apiFetch<ApiIssuesResponse>("/v1/issues", { method: "GET" });
  return res.data;
};

export const createIssue = async (payload: {
  title: string;
  description: string;
  category: Issue["category"];
}) => {
  const res = await apiFetch<ApiIssueResponse>("/v1/issues", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res.data;
};

export const patchIssue = async (
  issueId: string,
  payload: { stage?: Issue["stage"]; rating?: number }
) => {
  const res = await apiFetch<ApiIssueResponse>(`/v1/issues/${issueId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return res.data;
};

export const supportIssue = async (issueId: string) => {
  const res = await apiFetch<ApiIssueResponse>(`/v1/issues/${issueId}/support`, {
    method: "POST",
  });
  return res.data;
};

export const voteIssue = async (issueId: string, kind: "up" | "down") => {
  const res = await apiFetch<ApiIssueResponse>(`/v1/issues/${issueId}/vote`, {
    method: "POST",
    body: JSON.stringify({ kind }),
  });
  return res.data;
};

export const addIssueComment = async (issueId: string, text: string) => {
  const res = await apiFetch<ApiIssueResponse>(`/v1/issues/${issueId}/comments`, {
    method: "POST",
    body: JSON.stringify({ text }),
  });
  return res.data;
};

export const addIssueSolution = async (
  issueId: string,
  payload: { description: string; estimatedCost: number }
) => {
  const res = await apiFetch<ApiIssueResponse>(`/v1/issues/${issueId}/solutions`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res.data;
};

export const voteIssueSolution = async (issueId: string, solutionId: string) => {
  const res = await apiFetch<ApiIssueResponse>(
    `/v1/issues/${issueId}/solutions/${solutionId}/vote`,
    { method: "POST" }
  );
  return res.data;
};

export const generateIssueAiSuggestion = async (
  issueId: string,
  community: CommunityInfo
) => {
  const res = await apiFetch<{ data: Issue }>(`/v1/issues/${issueId}/ai-suggestions`, {
    method: "POST",
    body: JSON.stringify({
      community: {
        name: community.name,
        units: community.units,
        address: community.address,
        city: community.city,
        state: community.state,
        zipCode: community.zipCode,
      },
    }),
  });

  return res.data;
};
