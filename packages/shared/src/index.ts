import { z } from "zod";

export const roleSchema = z.enum(["user", "customer_admin", "superadmin"]);

export const authClaimsSchema = z
  .object({
    sub: z.string().optional(),
    role: roleSchema.optional(),
    customer_id: z.string().uuid().nullable().optional(),
  })
  .passthrough();

export type AuthClaims = z.infer<typeof authClaimsSchema>;

export const apiErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  requestId: z.string(),
  details: z.unknown().optional(),
});

export type ApiError = z.infer<typeof apiErrorSchema>;

export const issueStageSchema = z.enum([
  "RAISE",
  "VALIDATE",
  "IDEATE",
  "VOTE",
  "ONGOING",
  "CLOSED",
]);

export const issueCategorySchema = z.enum([
  "Maintenance & Facilities",
  "Noise & Disturbances",
  "Cleanliness & Hygiene",
  "Parking & Traffic",
  "Safety & Security",
  "Rules & Policy Proposals",
  "Community & Improvements",
  "General / Other",
]);

export type IssueStage = z.infer<typeof issueStageSchema>;
export type IssueCategory = z.infer<typeof issueCategorySchema>;

export const issueVoteKindSchema = z.enum(["up", "down"]);
export type IssueVoteKind = z.infer<typeof issueVoteKindSchema>;

export const aiSourceSchema = z.object({
  uri: z.string().url(),
  title: z.string(),
});

export const aiContractorSchema = z.object({
  name: z.string(),
  specialty: z.string(),
  website: z.string().optional().default(""),
  phone: z.string().optional().default(""),
  note: z.string().optional().default(""),
});

export const aiSuggestionSchema = z.object({
  analysis: z.string(),
  contractors: z.array(aiContractorSchema),
  estimatedBudget: z.string(),
  sources: z.array(aiSourceSchema).default([]),
});

export type AiSuggestion = z.infer<typeof aiSuggestionSchema>;

export const issueCommentSchema = z.object({
  id: z.string().uuid(),
  issueId: z.string().uuid(),
  authorId: z.string().uuid(),
  authorName: z.string(),
  authorSkills: z.array(z.string()).optional().default([]),
  text: z.string().min(1),
  createdAt: z.string(),
});

export const issueSolutionSchema = z.object({
  id: z.string().uuid(),
  issueId: z.string().uuid(),
  authorId: z.string().uuid(),
  authorName: z.string(),
  authorSkills: z.array(z.string()).optional().default([]),
  description: z.string().min(1),
  estimatedCost: z.number().nonnegative(),
  votes: z.array(z.string().uuid()).default([]),
  createdAt: z.string(),
});

export const issueSummarySchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string(),
  category: issueCategorySchema,
  stage: issueStageSchema,
  authorId: z.string().uuid(),
  authorName: z.string(),
  createdAt: z.string(),
  supporters: z.array(z.string().uuid()).default([]),
  upvotes: z.array(z.string().uuid()).default([]),
  downvotes: z.array(z.string().uuid()).default([]),
  views: z.number().int().nonnegative().default(0),
  rating: z.number().optional(),
});

export const issueSchema = issueSummarySchema.extend({
  comments: z.array(issueCommentSchema),
  solutions: z.array(issueSolutionSchema),
  aiAnalysis: z.string().optional(),
  aiContractors: z.array(aiContractorSchema).optional(),
  aiBudget: z.string().optional(),
  aiSources: z.array(aiSourceSchema).optional(),
  aiLastSearched: z.string().optional(),
});

export type IssueSummary = z.infer<typeof issueSummarySchema>;
export type IssueComment = z.infer<typeof issueCommentSchema>;
export type IssueSolution = z.infer<typeof issueSolutionSchema>;
export type Issue = z.infer<typeof issueSchema>;

export const createIssueSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  category: issueCategorySchema,
});

export const patchIssueSchema = z.object({
  stage: issueStageSchema.optional(),
  rating: z.number().min(0).max(5).optional(),
});

export const supportIssueSchema = z.object({});

export const voteIssueSchema = z.object({
  kind: issueVoteKindSchema,
});

export const createIssueCommentSchema = z.object({
  text: z.string().min(1),
});

export const createIssueSolutionSchema = z.object({
  description: z.string().min(1),
  estimatedCost: z.number().nonnegative(),
});

export const voteIssueSolutionSchema = z.object({});
