"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewDocumentButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function create() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!res.ok)
        throw new Error(
          (await res.json()).error ?? "Could not create document",
        );
      const doc = await res.json();
      router.push(`/documents/${doc.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create document");
      setLoading(false);
    }
  }

  return (
    <div>
      <button className="btn btn-primary" onClick={create} disabled={loading}>
        {loading ? "Creating..." : "+ New document"}
      </button>
      {error && (
        <span style={{ color: "#d93025", marginLeft: 12 }}>{error}</span>
      )}
    </div>
  );
}
