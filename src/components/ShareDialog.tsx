"use client";

import { useCallback, useEffect, useState } from "react";

type Role = "viewer" | "editor";
type ShareEntry = { userId: string; name: string; email: string; role: Role };

export default function ShareDialog({
  docId,
  onClose,
}: {
  docId: string;
  onClose: () => void;
}) {
  const [entries, setEntries] = useState<ShareEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("viewer");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/documents/${docId}/shares`);
      if (!res.ok)
        throw new Error((await res.json()).error ?? "Could not load sharing");
      setEntries(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load sharing");
    } finally {
      setLoading(false);
    }
  }, [docId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function grant(targetEmail: string, targetRole: Role) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/documents/${docId}/shares`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: targetEmail, role: targetRole }),
      });
      if (!res.ok)
        throw new Error((await res.json()).error ?? "Could not share");
      await load();
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not share");
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function onAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    if (await grant(email, role)) setEmail("");
  }

  async function remove(userId: string) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/documents/${docId}/shares`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok)
        throw new Error((await res.json()).error ?? "Could not remove access");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not remove access");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal" role="dialog" aria-label="Share document">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2 style={{ margin: 0, fontSize: 18 }}>Share document</h2>
          <button className="btn" onClick={onClose}>
            Close
          </button>
        </div>

        <form
          onSubmit={onAdd}
          style={{ display: "flex", gap: 8, marginTop: 16 }}
        >
          <input
            className="input"
            style={{ flex: 1 }}
            type="email"
            placeholder="Email, e.g. bob@ajaia.test"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <select
            className="input"
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
          >
            <option value="viewer">Viewer</option>
            <option value="editor">Editor</option>
          </select>
          <button className="btn btn-primary" disabled={busy} type="submit">
            Share
          </button>
        </form>

        {error && (
          <p style={{ color: "#d93025", margin: "12px 0 0" }}>{error}</p>
        )}

        <h3
          style={{ fontSize: 14, color: "var(--muted)", margin: "20px 0 8px" }}
        >
          People with access
        </h3>
        {loading ? (
          <p style={{ color: "var(--muted)" }}>Loading...</p>
        ) : entries.length === 0 ? (
          <p style={{ color: "var(--muted)" }}>
            Only you can see this document.
          </p>
        ) : (
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "grid",
              gap: 8,
            }}
          >
            {entries.map((s) => (
              <li
                key={s.userId}
                style={{ display: "flex", alignItems: "center", gap: 8 }}
              >
                <div style={{ flex: 1 }}>
                  <strong>{s.name}</strong>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>
                    {s.email}
                  </div>
                </div>
                <select
                  className="input"
                  value={s.role}
                  disabled={busy}
                  onChange={(e) => grant(s.email, e.target.value as Role)}
                >
                  <option value="viewer">Viewer</option>
                  <option value="editor">Editor</option>
                </select>
                <button
                  className="btn"
                  disabled={busy}
                  onClick={() => remove(s.userId)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
