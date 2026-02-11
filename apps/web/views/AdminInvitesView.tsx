import React, { useEffect, useState } from "react";
import { apiFetch } from "../services/apiClient";

type Invite = {
  id: string;
  email: string;
  role: string;
  status: "pending" | "accepted" | "revoked" | "expired";
  token: string;
  expiresAt: string;
  customer_id: string | null;
  createdAt: string;
};
export const AdminInvitesView: React.FC = () => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("user");
  const [customerId, setCustomerId] = useState("");
  const [expiresInDays, setExpiresInDays] = useState("7");
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInvites = async () => {
    setLoading(true);
    setError(null);
    try {
      const url =
        statusFilter && statusFilter.length > 0
          ? `/invites?status=${encodeURIComponent(statusFilter)}`
          : "/invites";
      const json = await apiFetch<{ data: Invite[] }>(url, { method: "GET" });
      setInvites(json.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load invites.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchInvites();
  }, [statusFilter]);

  const handleCreateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInviteUrl(null);

    if (!email) {
      setError("Email is required.");
      return;
    }

    const payload: Record<string, unknown> = {
      email,
      role,
      expiresInDays: Number(expiresInDays) || 7,
    };
    if (customerId.trim()) {
      payload.customerId = customerId.trim();
    }

    try {
      const json = await apiFetch<{ inviteUrl?: string }>("/invites", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setInviteUrl(json.inviteUrl || null);
      setEmail("");
      setCustomerId("");
      await fetchInvites();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create invite.");
    }
  };

  const handleRevoke = async (inviteId: string) => {
    setError(null);
    try {
      await apiFetch(`/invites/${inviteId}/revoke`, {
        method: "POST",
      });
      await fetchInvites();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to revoke invite.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">Invites</h2>
        <p className="text-sm text-slate-500">
          Create and manage access invites for your tenant.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
        <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleCreateInvite}>
          <div>
            <label className="block text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              placeholder="user@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              <option value="user">user</option>
              <option value="customer_admin">customer_admin</option>
              <option value="superadmin">superadmin</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Customer ID (superadmin only)
            </label>
            <input
              type="text"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              placeholder="uuid (optional)"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Expires In Days</label>
            <input
              type="number"
              min={1}
              max={30}
              value={expiresInDays}
              onChange={(e) => setExpiresInDays(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="w-full rounded-lg bg-slate-900 text-white py-2 text-sm font-semibold hover:bg-slate-800"
            >
              Create Invite
            </button>
          </div>
        </form>

        {inviteUrl && (
          <div className="rounded-lg bg-emerald-50 text-emerald-800 px-3 py-2 text-sm">
            Invite created: <span className="font-medium break-all">{inviteUrl}</span>
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-rose-50 text-rose-700 px-3 py-2 text-sm">{error}</div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h3 className="text-lg font-bold text-slate-900">Invite List</h3>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              <option value="">All statuses</option>
              <option value="pending">pending</option>
              <option value="accepted">accepted</option>
              <option value="revoked">revoked</option>
              <option value="expired">expired</option>
            </select>
            <button
              onClick={fetchInvites}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              disabled={loading}
            >
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500">
                <th className="py-2 pr-4">Email</th>
                <th className="py-2 pr-4">Role</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Expires</th>
                <th className="py-2 pr-4">Customer</th>
                <th className="py-2 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invites.length === 0 ? (
                <tr>
                  <td className="py-3 text-slate-500" colSpan={6}>
                    No invites found.
                  </td>
                </tr>
              ) : (
                invites.map((invite) => (
                  <tr key={invite.id} className="border-t border-slate-100">
                    <td className="py-3 pr-4 text-slate-900">{invite.email}</td>
                    <td className="py-3 pr-4 text-slate-700">{invite.role}</td>
                    <td className="py-3 pr-4 text-slate-700">{invite.status}</td>
                    <td className="py-3 pr-4 text-slate-700">
                      {new Date(invite.expiresAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 pr-4 text-slate-500">{invite.customer_id || "—"}</td>
                    <td className="py-3 pr-4">
                      {invite.status === "pending" ? (
                        <button
                          onClick={() => handleRevoke(invite.id)}
                          className="text-rose-600 font-semibold hover:underline"
                        >
                          Revoke
                        </button>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
