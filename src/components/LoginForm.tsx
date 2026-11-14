"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type UserOption = { id: string; name: string; email: string };

export default function LoginForm({ users }: { users: UserOption[] }) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function login(userId: string) {
    setPendingId(userId);
    setError(null);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Login failed");
      router.push("/");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Login failed");
      setPendingId(null);
    }
  }

  return (
    <div style={{ display: "grid", gap: 10 }}>
      {users.map((u) => (
        <button
          key={u.id}
          className="btn"
          disabled={pendingId !== null}
          onClick={() => login(u.id)}
          style={{ textAlign: "left" }}
        >
          <strong>{u.name}</strong>
          <div style={{ color: "var(--muted)", fontSize: 12 }}>{u.email}</div>
        </button>
      ))}
      {error && <p style={{ color: "#d93025", margin: 0 }}>{error}</p>}
    </div>
  );
}
