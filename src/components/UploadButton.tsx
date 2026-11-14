"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

const MAX_BYTES = 2 * 1024 * 1024;

export default function UploadButton() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // lets the user pick the same file again later
    if (!file) return;

    setError(null);
    if (file.size > MAX_BYTES) {
      setError("File is too large (max 2 MB)");
      return;
    }

    setLoading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/documents/import", {
        method: "POST",
        body,
      });
      if (!res.ok)
        throw new Error(
          (await res.json().catch(() => ({}))).error ?? "Upload failed",
        );
      const doc = await res.json();
      router.push(`/documents/${doc.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <input
        ref={inputRef}
        type="file"
        accept=".txt,.md,.docx"
        onChange={onFile}
        style={{ display: "none" }}
      />
      <button
        className="btn"
        disabled={loading}
        onClick={() => inputRef.current?.click()}
      >
        {loading ? "Importing..." : "Upload file"}
      </button>
      {error && <span style={{ color: "#d93025", fontSize: 13 }}>{error}</span>}
    </div>
  );
}
