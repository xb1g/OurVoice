import { Hono } from "hono";
import {
  createIssueCommentSchema,
  createIssueSchema,
  createIssueSolutionSchema,
  patchIssueSchema,
  voteIssueSchema,
} from "../../../../packages/shared/src/index";
import { requireAuth } from "../middleware/auth";
import { createSupabaseClientForUser } from "../lib/supabase";
import { rateLimit } from "../middleware/rate-limit";
import { generateIssueAiSuggestion } from "../services/ai";
import type { Env } from "../types/env";

export const issueRoutes = new Hono<Env>();

const getAuth = (c: any) =>
  c.get("auth") as { role?: string; customer_id?: string; sub?: string };

const isAdminRole = (role?: string) => role === "customer_admin" || role === "superadmin";

const getActor = async (c: any) => {
  const auth = getAuth(c);
  if (!auth.sub) {
    return { error: c.json({ error: "Unauthorized" }, 401) };
  }

  const supabase = createSupabaseClientForUser(c.env, c.get("accessToken"));
  const { data, error } = await supabase
    .from("users")
    .select("id, name, role, customer_id")
    .eq("auth_user_id", auth.sub)
    .single();

  if (error || !data) {
    return { error: c.json({ error: "User profile not found" }, 401) };
  }

  return { actor: data };
};

const hydrateIssue = async (c: any, issue: any) => {
  const supabase = createSupabaseClientForUser(c.env, c.get("accessToken"));

  const [supportsRes, votesRes, commentsRes, solutionsRes, aiRes] = await Promise.all([
    supabase.from("issue_supports").select("user_id").eq("issue_id", issue.id),
    supabase.from("issue_votes").select("user_id, kind").eq("issue_id", issue.id),
    supabase
      .from("issue_comments")
      .select("id, issue_id, author_id, author_name, author_skills, text, created_at")
      .eq("issue_id", issue.id)
      .order("created_at", { ascending: true }),
    supabase
      .from("issue_solutions")
      .select("id, issue_id, author_id, author_name, author_skills, description, estimated_cost, created_at")
      .eq("issue_id", issue.id)
      .order("created_at", { ascending: true }),
    supabase
      .from("issue_ai_snapshots")
      .select("analysis, contractors, estimated_budget, sources, created_at")
      .eq("issue_id", issue.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const solutions = solutionsRes.data ?? [];
  const solutionIds = solutions.map((s) => s.id);
  const solutionVotesRes =
    solutionIds.length > 0
      ? await supabase
          .from("issue_solution_votes")
          .select("solution_id, user_id")
          .in("solution_id", solutionIds)
      : { data: [] as { solution_id: string; user_id: string }[] };

  const votes = votesRes.data ?? [];
  const upvotes = votes.filter((v) => v.kind === "up").map((v) => v.user_id);
  const downvotes = votes.filter((v) => v.kind === "down").map((v) => v.user_id);

  const groupedSolutionVotes = (solutionVotesRes.data ?? []).reduce(
    (acc: Record<string, string[]>, row: { solution_id: string; user_id: string }) => {
      acc[row.solution_id] ||= [];
      acc[row.solution_id].push(row.user_id);
      return acc;
    },
    {}
  );

  const latestAi = aiRes.data;

  return {
    id: issue.id,
    title: issue.title,
    description: issue.description,
    category: issue.category,
    stage: issue.stage,
    authorId: issue.author_id,
    authorName: issue.author_name,
    createdAt: issue.created_at,
    supporters: (supportsRes.data ?? []).map((s) => s.user_id),
    upvotes,
    downvotes,
    comments: (commentsRes.data ?? []).map((comment) => ({
      id: comment.id,
      issueId: comment.issue_id,
      authorId: comment.author_id,
      authorName: comment.author_name,
      authorSkills: Array.isArray(comment.author_skills) ? comment.author_skills : [],
      text: comment.text,
      createdAt: comment.created_at,
    })),
    solutions: solutions.map((solution) => ({
      id: solution.id,
      issueId: solution.issue_id,
      authorId: solution.author_id,
      authorName: solution.author_name,
      authorSkills: Array.isArray(solution.author_skills) ? solution.author_skills : [],
      description: solution.description,
      estimatedCost: solution.estimated_cost,
      votes: groupedSolutionVotes[solution.id] ?? [],
      createdAt: solution.created_at,
    })),
    views: issue.views ?? 0,
    rating: issue.rating ?? undefined,
    aiAnalysis: latestAi?.analysis ?? undefined,
    aiContractors: Array.isArray(latestAi?.contractors) ? latestAi.contractors : undefined,
    aiBudget: latestAi?.estimated_budget ?? undefined,
    aiSources: Array.isArray(latestAi?.sources) ? latestAi.sources : undefined,
    aiLastSearched: latestAi?.created_at ?? undefined,
  };
};

issueRoutes.get("/v1/issues", requireAuth, async (c) => {
  const auth = getAuth(c);
  if (!auth.customer_id && auth.role !== "superadmin") {
    return c.json({ error: "Missing tenant" }, 400);
  }

  const supabase = createSupabaseClientForUser(c.env, c.get("accessToken"));

  let query = supabase
    .from("issues")
    .select("id, title, description, category, stage, author_id, author_name, created_at, views, rating")
    .order("created_at", { ascending: false });

  const stage = c.req.query("stage");
  const category = c.req.query("category");
  if (stage) query = query.eq("stage", stage);
  if (category) query = query.eq("category", category);
  if (auth.role !== "superadmin") query = query.eq("customer_id", auth.customer_id);

  const { data, error } = await query;
  if (error) return c.json({ error: error.message }, 400);

  const hydrated = await Promise.all((data ?? []).map((issue) => hydrateIssue(c, issue)));
  return c.json({ data: hydrated });
});

issueRoutes.post("/v1/issues", requireAuth, async (c) => {
  const payload = createIssueSchema.safeParse(await c.req.json().catch(() => ({})));
  if (!payload.success) {
    return c.json({ error: "Invalid payload", details: payload.error.flatten() }, 400);
  }

  const auth = getAuth(c);
  if (!auth.customer_id && auth.role !== "superadmin") {
    return c.json({ error: "Missing tenant" }, 400);
  }

  const actorResult = await getActor(c);
  if (actorResult.error) return actorResult.error;
  const actor = actorResult.actor!;

  const supabase = createSupabaseClientForUser(c.env, c.get("accessToken"));
  const { data, error } = await supabase
    .from("issues")
    .insert({
      customer_id: actor.customer_id,
      author_id: actor.id,
      author_name: actor.name ?? "Resident",
      title: payload.data.title,
      description: payload.data.description,
      category: payload.data.category,
      stage: "VALIDATE",
    })
    .select("*")
    .single();

  if (error || !data) return c.json({ error: error?.message || "Failed to create issue" }, 400);

  const hydrated = await hydrateIssue(c, data);
  return c.json({ data: hydrated }, 201);
});

issueRoutes.get("/v1/issues/:issueId", requireAuth, async (c) => {
  const issueId = c.req.param("issueId");
  const supabase = createSupabaseClientForUser(c.env, c.get("accessToken"));

  const { data, error } = await supabase.from("issues").select("*").eq("id", issueId).single();
  if (error || !data) return c.json({ error: "Issue not found" }, 404);

  await supabase
    .from("issues")
    .update({ views: (data.views ?? 0) + 1 })
    .eq("id", issueId);

  const hydrated = await hydrateIssue(c, { ...data, views: (data.views ?? 0) + 1 });
  return c.json({ data: hydrated });
});

issueRoutes.patch("/v1/issues/:issueId", requireAuth, async (c) => {
  const auth = getAuth(c);
  if (!isAdminRole(auth.role)) return c.json({ error: "Forbidden" }, 403);

  const payload = patchIssueSchema.safeParse(await c.req.json().catch(() => ({})));
  if (!payload.success) {
    return c.json({ error: "Invalid payload", details: payload.error.flatten() }, 400);
  }

  const issueId = c.req.param("issueId");
  const supabase = createSupabaseClientForUser(c.env, c.get("accessToken"));
  const { data, error } = await supabase
    .from("issues")
    .update({
      stage: payload.data.stage,
      rating: payload.data.rating,
    })
    .eq("id", issueId)
    .select("*")
    .single();

  if (error || !data) return c.json({ error: error?.message || "Issue not found" }, 404);

  return c.json({ data: await hydrateIssue(c, data) });
});

issueRoutes.post("/v1/issues/:issueId/support", requireAuth, async (c) => {
  const issueId = c.req.param("issueId");
  const actorResult = await getActor(c);
  if (actorResult.error) return actorResult.error;

  const supabase = createSupabaseClientForUser(c.env, c.get("accessToken"));
  const { error } = await supabase
    .from("issue_supports")
    .upsert({ issue_id: issueId, user_id: actorResult.actor!.id }, { onConflict: "issue_id,user_id" });

  if (error) return c.json({ error: error.message }, 400);

  const issue = await supabase.from("issues").select("*").eq("id", issueId).single();
  if (issue.error || !issue.data) return c.json({ error: "Issue not found" }, 404);

  return c.json({ data: await hydrateIssue(c, issue.data) });
});

issueRoutes.post("/v1/issues/:issueId/vote", requireAuth, async (c) => {
  const issueId = c.req.param("issueId");
  const payload = voteIssueSchema.safeParse(await c.req.json().catch(() => ({})));
  if (!payload.success) {
    return c.json({ error: "Invalid payload", details: payload.error.flatten() }, 400);
  }

  const actorResult = await getActor(c);
  if (actorResult.error) return actorResult.error;

  const supabase = createSupabaseClientForUser(c.env, c.get("accessToken"));
  const { error } = await supabase.from("issue_votes").upsert(
    {
      issue_id: issueId,
      user_id: actorResult.actor!.id,
      kind: payload.data.kind,
    },
    { onConflict: "issue_id,user_id" }
  );

  if (error) return c.json({ error: error.message }, 400);

  const issue = await supabase.from("issues").select("*").eq("id", issueId).single();
  if (issue.error || !issue.data) return c.json({ error: "Issue not found" }, 404);

  return c.json({ data: await hydrateIssue(c, issue.data) });
});

issueRoutes.post("/v1/issues/:issueId/comments", requireAuth, async (c) => {
  const issueId = c.req.param("issueId");
  const payload = createIssueCommentSchema.safeParse(await c.req.json().catch(() => ({})));
  if (!payload.success) {
    return c.json({ error: "Invalid payload", details: payload.error.flatten() }, 400);
  }

  const actorResult = await getActor(c);
  if (actorResult.error) return actorResult.error;

  const supabase = createSupabaseClientForUser(c.env, c.get("accessToken"));
  const { error } = await supabase.from("issue_comments").insert({
    issue_id: issueId,
    author_id: actorResult.actor!.id,
    author_name: actorResult.actor!.name ?? "Resident",
    author_skills: [],
    text: payload.data.text,
  });

  if (error) return c.json({ error: error.message }, 400);

  const issue = await supabase.from("issues").select("*").eq("id", issueId).single();
  if (issue.error || !issue.data) return c.json({ error: "Issue not found" }, 404);

  return c.json({ data: await hydrateIssue(c, issue.data) }, 201);
});

issueRoutes.post("/v1/issues/:issueId/solutions", requireAuth, async (c) => {
  const issueId = c.req.param("issueId");
  const payload = createIssueSolutionSchema.safeParse(await c.req.json().catch(() => ({})));
  if (!payload.success) {
    return c.json({ error: "Invalid payload", details: payload.error.flatten() }, 400);
  }

  const actorResult = await getActor(c);
  if (actorResult.error) return actorResult.error;

  const supabase = createSupabaseClientForUser(c.env, c.get("accessToken"));
  const { error } = await supabase.from("issue_solutions").insert({
    issue_id: issueId,
    author_id: actorResult.actor!.id,
    author_name: actorResult.actor!.name ?? "Resident",
    author_skills: [],
    description: payload.data.description,
    estimated_cost: payload.data.estimatedCost,
  });

  if (error) return c.json({ error: error.message }, 400);

  const issue = await supabase.from("issues").select("*").eq("id", issueId).single();
  if (issue.error || !issue.data) return c.json({ error: "Issue not found" }, 404);

  return c.json({ data: await hydrateIssue(c, issue.data) }, 201);
});

issueRoutes.post("/v1/issues/:issueId/solutions/:solutionId/vote", requireAuth, async (c) => {
  const solutionId = c.req.param("solutionId");
  const actorResult = await getActor(c);
  if (actorResult.error) return actorResult.error;

  const supabase = createSupabaseClientForUser(c.env, c.get("accessToken"));
  const { error } = await supabase.from("issue_solution_votes").upsert(
    {
      solution_id: solutionId,
      user_id: actorResult.actor!.id,
    },
    { onConflict: "solution_id,user_id" }
  );

  if (error) return c.json({ error: error.message }, 400);

  const solution = await supabase
    .from("issue_solutions")
    .select("issue_id")
    .eq("id", solutionId)
    .single();

  if (solution.error || !solution.data) return c.json({ error: "Solution not found" }, 404);

  const issue = await supabase
    .from("issues")
    .select("*")
    .eq("id", solution.data.issue_id)
    .single();

  if (issue.error || !issue.data) return c.json({ error: "Issue not found" }, 404);

  return c.json({ data: await hydrateIssue(c, issue.data) });
});

issueRoutes.post(
  "/v1/issues/:issueId/ai-suggestions",
  requireAuth,
  rateLimit("issue_ai", 5, 60_000),
  async (c) => {
  if (!c.env.GEMINI_API_KEY) {
    return c.json({ error: "AI is not configured" }, 500);
  }

  const issueId = c.req.param("issueId");
  const body = (await c.req.json().catch(() => ({}))) as {
    community?: {
      name?: string;
      units?: number;
      address?: string;
      city?: string;
      state?: string;
      zipCode?: string;
    };
  };

  const actorResult = await getActor(c);
  if (actorResult.error) return actorResult.error;

  const supabase = createSupabaseClientForUser(c.env, c.get("accessToken"));
  const issueResult = await supabase.from("issues").select("*").eq("id", issueId).single();

  if (issueResult.error || !issueResult.data) {
    return c.json({ error: "Issue not found" }, 404);
  }

  const issue = issueResult.data;
  const community = {
    name: body.community?.name ?? "Condo Community",
    units: body.community?.units ?? 100,
    address: body.community?.address ?? "Unknown Address",
    city: body.community?.city ?? "Unknown City",
    state: body.community?.state ?? "Unknown State",
    zipCode: body.community?.zipCode ?? "00000",
  };

  const suggestion = await generateIssueAiSuggestion(
    c.env.GEMINI_API_KEY,
    issue.title,
    issue.description,
    community
  );

  const insert = await supabase.from("issue_ai_snapshots").insert({
    issue_id: issueId,
    requested_by_id: actorResult.actor!.id,
    analysis: suggestion.analysis,
    contractors: suggestion.contractors,
    estimated_budget: suggestion.estimatedBudget,
    sources: suggestion.sources,
  });

  if (insert.error) return c.json({ error: insert.error.message }, 400);

  await createSupabaseClientForUser(c.env, c.get("accessToken"))
    .from("audit_logs")
    .insert({
      action: "project_updated",
      entityType: "issue",
      entityId: issueId,
      customerId: issue.customer_id,
      actorId: actorResult.actor!.id,
      data: { event: "ai_suggestion_generated" },
    });

  const hydrated = await hydrateIssue(c, issue);
  return c.json({ data: hydrated, suggestion });
  }
);
