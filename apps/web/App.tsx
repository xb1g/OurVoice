import React, { useEffect, useMemo, useState } from "react";
import { Issue, User, UserRole } from "./types";
import { BoardView } from "./views/Dashboard";
import { IssueDetail } from "./views/IssueDetail";
import { CondoView } from "./views/CondoView";
import { HistoryView } from "./views/HistoryView";
import { ProfileView } from "./views/ProfileView";
import { InviteAcceptView } from "./views/InviteAcceptView";
import { AdminInvitesView } from "./views/AdminInvitesView";
import { LoginView } from "./views/LoginView";
import { Sidebar, BottomNav } from "./components/Navigation";
import { ApiError, apiFetch, getApiBaseUrl } from "./services/apiClient";
import { getSession, onAuthStateChange, signInWithPassword, signOut } from "./services/authService";
import {
  addIssueComment,
  addIssueSolution,
  createIssue,
  listIssues,
  patchIssue,
  supportIssue,
  voteIssue,
  voteIssueSolution,
} from "./services/issuesApi";

const apiBaseUrl = getApiBaseUrl();

const mapBackendRoleToAppRole = (role?: string): UserRole => {
  if (role === "customer_admin" || role === "superadmin") {
    return UserRole.ADMIN;
  }
  return UserRole.RESIDENT;
};

const buildCurrentUser = (profile: any): User => {
  const claims = profile.claims ?? {};
  const user = profile.user ?? {};

  return {
    id: user.id,
    name:
      user.user_metadata?.name ||
      user.email?.split("@")[0] ||
      "Resident",
    role: mapBackendRoleToAppRole(claims.role),
    skills: [],
    avatarUrl: `https://picsum.photos/seed/${user.id ?? "hive"}/100/100`,
  };
};

const App: React.FC = () => {
  const inviteToken =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("token")
      : null;
  const isInviteRoute =
    typeof window !== "undefined" && window.location.pathname.startsWith("/invite");

  if (isInviteRoute) {
    return <InviteAcceptView token={inviteToken} apiBaseUrl={apiBaseUrl} />;
  }

  const [session, setSession] = useState<{ access_token: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);

  const [activeTab, setActiveTab] = useState("board");
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);

  const loadBootstrapData = async () => {
    const profile = await apiFetch<{ user: unknown; claims: unknown }>("/auth/profile", {
      method: "GET",
    });

    setCurrentUser(buildCurrentUser(profile));

    const fetchedIssues = await listIssues();
    setIssues(fetchedIssues);
  };

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      try {
        const currentSession = getSession();
        if (!mounted) return;

        setSession(currentSession);

        if (currentSession) {
          await loadBootstrapData();
        }
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "Failed to load app");
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void initialize();

    const unsubscribe = onAuthStateChange(async (nextSession) => {
      setSession(nextSession);
      setError(null);

      if (!nextSession) {
        setCurrentUser(null);
        setIssues([]);
        return;
      }

      try {
        await loadBootstrapData();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load profile");
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (currentUser && currentUser.role !== UserRole.ADMIN && activeTab === "invites") {
      setActiveTab("board");
    }
  }, [activeTab, currentUser]);

  const handleLogin = async (email: string, password: string) => {
    setAuthLoading(true);
    setError(null);
    try {
      await signInWithPassword(email, password);
    } catch (error) {
      setAuthLoading(false);
      throw error;
    }
    setAuthLoading(false);
  };

  const handleLogout = async () => {
    await signOut();
    setCurrentUser(null);
    setIssues([]);
  };

  const replaceIssue = (nextIssue: Issue) => {
    setIssues((prev) => prev.map((issue) => (issue.id === nextIssue.id ? nextIssue : issue)));
  };

  const handleCreateIssue = async (
    title: string,
    description: string,
    category: Issue["category"]
  ) => {
    try {
      const created = await createIssue({ title, description, category });
      setIssues((prev) => [created, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create issue");
    }
  };

  const handleUpdateUser = (updatedUser: User) => {
    setCurrentUser(updatedUser);
  };

  const handleVote = async (issueId: string, type: "up" | "down") => {
    try {
      const updated = await voteIssue(issueId, type);
      replaceIssue(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to vote");
    }
  };

  const handleUpdateIssue = async (updatedIssue: Issue) => {
    const previous = issues.find((issue) => issue.id === updatedIssue.id);
    if (!previous || !currentUser) {
      return;
    }

    try {
      const nowSupported = updatedIssue.supporters.includes(currentUser.id);
      const wasSupported = previous.supporters.includes(currentUser.id);
      if (nowSupported && !wasSupported) {
        replaceIssue(await supportIssue(updatedIssue.id));
        return;
      }

      const previousCommentCount = previous.comments?.length ?? 0;
      const nextCommentCount = updatedIssue.comments?.length ?? 0;
      if (nextCommentCount > previousCommentCount) {
        const latestComment = updatedIssue.comments[nextCommentCount - 1];
        if (latestComment?.text) {
          replaceIssue(await addIssueComment(updatedIssue.id, latestComment.text));
          return;
        }
      }

      const previousSolutionCount = previous.solutions?.length ?? 0;
      const nextSolutionCount = updatedIssue.solutions?.length ?? 0;
      if (nextSolutionCount > previousSolutionCount) {
        const latestSolution = updatedIssue.solutions[nextSolutionCount - 1];
        replaceIssue(
          await addIssueSolution(updatedIssue.id, {
            description: latestSolution.description,
            estimatedCost: latestSolution.estimatedCost,
          })
        );
        return;
      }

      const nowUpvoted = updatedIssue.upvotes.includes(currentUser.id);
      const nowDownvoted = updatedIssue.downvotes.includes(currentUser.id);
      const wasUpvoted = previous.upvotes.includes(currentUser.id);
      const wasDownvoted = previous.downvotes.includes(currentUser.id);
      if (nowUpvoted !== wasUpvoted || nowDownvoted !== wasDownvoted) {
        if (nowUpvoted) {
          replaceIssue(await voteIssue(updatedIssue.id, "up"));
          return;
        }
        if (nowDownvoted) {
          replaceIssue(await voteIssue(updatedIssue.id, "down"));
          return;
        }
      }

      const votedSolution = updatedIssue.solutions.find((solution) => {
        const previousSolution = previous.solutions.find((row) => row.id === solution.id);
        const nowVoted = solution.votes.includes(currentUser.id);
        const wasVoted = previousSolution?.votes.includes(currentUser.id) ?? false;
        return nowVoted && !wasVoted;
      });

      if (votedSolution) {
        replaceIssue(await voteIssueSolution(updatedIssue.id, votedSolution.id));
        return;
      }

      if (
        previous.stage !== updatedIssue.stage ||
        previous.rating !== updatedIssue.rating
      ) {
        const next = await patchIssue(updatedIssue.id, {
          stage: updatedIssue.stage,
          rating: updatedIssue.rating,
        });
        replaceIssue(next);
        return;
      }

      replaceIssue(updatedIssue);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Failed to update issue";
      setError(message);
    }
  };

  const handleNavigate = (view: string, id?: string) => {
    if (view === "issue" && id) {
      setSelectedIssueId(id);
      setActiveTab("issue");
    } else {
      setActiveTab(view);
      setSelectedIssueId(null);
    }
  };

  const selectedIssue = useMemo(
    () => issues.find((issue) => issue.id === selectedIssueId) ?? null,
    [issues, selectedIssueId]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center">
        <p className="text-sm text-slate-500">Loading...</p>
      </div>
    );
  }

  if (!session || !currentUser) {
    return <LoginView onLogin={handleLogin} loading={authLoading} />;
  }

  const renderContent = () => {
    if (activeTab === "issue" && selectedIssue) {
      return (
        <IssueDetail
          issue={selectedIssue}
          currentUser={currentUser}
          onBack={() => setActiveTab("board")}
          onUpdateIssue={handleUpdateIssue}
        />
      );
    }

    switch (activeTab) {
      case "board":
        return (
          <BoardView
            issues={issues}
            currentUserId={currentUser.id}
            onNavigate={handleNavigate}
            onCreateIssue={handleCreateIssue}
            onVote={handleVote}
          />
        );
      case "history":
        return (
          <HistoryView
            issues={issues}
            currentUserId={currentUser.id}
            onNavigate={handleNavigate}
          />
        );
      case "condo":
        return <CondoView />;
      case "invites":
        return <AdminInvitesView />;
      case "profile":
        return (
          <ProfileView
            user={currentUser}
            onUpdateUser={handleUpdateUser}
          />
        );
      default:
        return (
          <BoardView
            issues={issues}
            currentUserId={currentUser.id}
            onNavigate={handleNavigate}
            onCreateIssue={handleCreateIssue}
            onVote={handleVote}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex">
      <Sidebar
        activeTab={activeTab === "issue" ? "board" : activeTab}
        onTabChange={setActiveTab}
        currentUser={currentUser}
      />

      <main className="flex-1 min-w-0">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 lg:pb-8">
          <div className="flex justify-end mb-4">
            <button
              onClick={handleLogout}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Sign out
            </button>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-rose-50 text-rose-700 px-3 py-2 text-sm">
              {error}
            </div>
          )}

          {renderContent()}
        </div>
      </main>

      <BottomNav
        activeTab={activeTab === "issue" ? "board" : activeTab}
        onTabChange={setActiveTab}
        currentUser={currentUser}
      />
    </div>
  );
};

export default App;
