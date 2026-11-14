"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Toolbar from "./Toolbar";
import ShareDialog from "./ShareDialog";

type Props = {
  id: string;
  initialTitle: string;
  initialContent: string;
  role: "owner" | "editor" | "viewer";
};

type SaveState = "saved" | "saving" | "unsaved" | "error";

const AUTOSAVE_MS = 800;

async function patchDocument(
  id: string,
  body: { title?: string; content?: string },
) {
  const res = await fetch(`/api/documents/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? "Save failed");
  }
}

export default function DocumentEditor({
  id,
  initialTitle,
  initialContent,
  role,
}: Props) {
  const canEdit = role !== "viewer";
  const [title, setTitle] = useState(initialTitle);
  const [status, setStatus] = useState<SaveState>("saved");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [shareOpen, setShareOpen] = useState(false);

  const savedTitle = useRef(initialTitle);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingHtml = useRef<string | null>(null);

  const saveContent = useCallback(
    async (html: string) => {
      setStatus("saving");
      try {
        await patchDocument(id, { content: html });
        // Only mark saved if nothing newer is waiting
        if (pendingHtml.current === null) setStatus("saved");
        setErrorMsg(null);
      } catch (e) {
        setStatus("error");
        setErrorMsg(e instanceof Error ? e.message : "Save failed");
      }
    },
    [id],
  );

  const scheduleSave = useCallback(
    (html: string) => {
      pendingHtml.current = html;
      setStatus("unsaved");
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        const latest = pendingHtml.current;
        pendingHtml.current = null;
        timer.current = null;
        if (latest !== null) void saveContent(latest);
      }, AUTOSAVE_MS);
    },
    [saveContent],
  );

  const editor = useEditor({
    extensions: [StarterKit, Underline],
    content: initialContent,
    editable: canEdit,
    immediatelyRender: false, // avoids SSR hydration mismatch in Next.js
    onUpdate: ({ editor }) => scheduleSave(editor.getHTML()),
  });

  // Flush unsaved changes if the user navigates away, and warn on tab close
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (pendingHtml.current !== null) e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => {
      window.removeEventListener("beforeunload", warn);
      if (timer.current) clearTimeout(timer.current);
      if (pendingHtml.current !== null) {
        void fetch(`/api/documents/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: pendingHtml.current }),
          keepalive: true,
        });
      }
    };
  }, [id]);

  async function commitTitle() {
    const next = title.trim();
    if (next === savedTitle.current) return;
    if (!next) {
      setTitle(savedTitle.current); // empty titles aren't allowed, revert
      return;
    }
    setStatus("saving");
    try {
      await patchDocument(id, { title: next });
      savedTitle.current = next;
      setTitle(next);
      setStatus("saved");
      setErrorMsg(null);
    } catch (e) {
      setStatus("error");
      setErrorMsg(e instanceof Error ? e.message : "Rename failed");
    }
  }

  const statusText = {
    saved: "All changes saved",
    saving: "Saving...",
    unsaved: "Unsaved changes",
    error: errorMsg ?? "Save failed",
  }[status];

  return (
    <main style={{ maxWidth: 860, margin: "24px auto", padding: 16 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <Link href="/" className="btn" style={{ textDecoration: "none" }}>
          ← Documents
        </Link>
        <input
          value={title}
          readOnly={!canEdit}
          maxLength={200}
          aria-label="Document title"
          onChange={(e) => setTitle(e.target.value)}
          onBlur={commitTitle}
          onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
          style={{
            flex: 1,
            fontSize: 20,
            fontWeight: 600,
            border: "1px solid transparent",
            borderRadius: 6,
            padding: "6px 10px",
            background: "transparent",
          }}
        />
        <span
          style={{
            fontSize: 13,
            color: status === "error" ? "#d93025" : "var(--muted)",
          }}
        >
          {canEdit ? statusText : "View only"}
        </span>
        {role === "owner" && (
          <button
            className="btn btn-primary"
            onClick={() => setShareOpen(true)}
          >
            Share
          </button>
        )}
      </div>

      {canEdit && editor && <Toolbar editor={editor} />}
      <div className={`editor-surface ${canEdit ? "" : "readonly"}`}>
        <EditorContent editor={editor} />
      </div>

      {shareOpen && (
        <ShareDialog docId={id} onClose={() => setShareOpen(false)} />
      )}
    </main>
  );
}
