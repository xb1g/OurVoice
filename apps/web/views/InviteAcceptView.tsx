import React, { useState } from "react";

type InviteAcceptViewProps = {
  token: string | null;
  apiBaseUrl: string;
};

export const InviteAcceptView: React.FC<InviteAcceptViewProps> = ({
  token,
  apiBaseUrl,
}) => {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{
    userId: string;
    role: string;
    customerId: string | null;
    requiresLogin: boolean;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("Missing invite token.");
      return;
    }
    if (!password || password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${apiBaseUrl}/invites/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          password,
          name: name.trim() || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json?.error || "Failed to accept invite");
        return;
      }

      setSuccess({
        userId: json.userId,
        role: json.role,
        customerId: json.customerId ?? null,
        requiresLogin: Boolean(json.requiresLogin),
      });
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-slate-900">Accept Invite</h1>
        <p className="text-slate-500 mt-1">
          Set a password to activate your account.
        </p>

        {!token && (
          <div className="mt-4 rounded-lg bg-amber-50 text-amber-800 px-3 py-2 text-sm">
            Missing invite token. Please use the invite link you received.
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-lg bg-rose-50 text-rose-700 px-3 py-2 text-sm">
            {error}
          </div>
        )}

        {success ? (
          <div className="mt-6 space-y-3">
            <div className="rounded-lg bg-emerald-50 text-emerald-800 px-3 py-2 text-sm">
              Invite accepted. Your account is ready.
            </div>
            <div className="text-sm text-slate-600">
              Role: <span className="font-medium">{success.role}</span>
            </div>
            {success.customerId && (
              <div className="text-sm text-slate-600">
                Customer ID:{" "}
                <span className="font-medium">{success.customerId}</span>
              </div>
            )}
            {success.requiresLogin && (
              <div className="text-sm text-slate-600">
                Please log in with your new password.
              </div>
            )}
          </div>
        ) : (
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Name (optional)
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                placeholder="At least 8 characters"
                required
              />
            </div>
            <button
              type="submit"
              disabled={submitting || !token}
              className="w-full rounded-lg bg-slate-900 text-white py-2 text-sm font-semibold hover:bg-slate-800 disabled:opacity-60"
            >
              {submitting ? "Submitting..." : "Accept Invite"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
