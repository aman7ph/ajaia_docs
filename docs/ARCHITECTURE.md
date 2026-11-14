# Architecture Note

## Goal

Ship the strongest working slice of a collaborative document editor within a 4-6 hour timebox: create, edit, import, share and persist documents, with server-enforced access control, tests and a live deployment. I optimized for depth in the core flows over breadth of features.

## Stack and why

| Choice                               | Reason                                                                                                                                 |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| Next.js 14 (App Router) + TypeScript | One repo and one deploy for UI and API. Server components load data and check the session before rendering                             |
| TipTap                               | Provides bold, italic, underline, headings and lists out of the box, so the time went into product logic instead of building an editor |
| Postgres (Neon) + Drizzle            | SQLite files don't persist on Vercel's serverless filesystem. Neon has a free tier and Drizzle keeps the schema typed and small        |
| Zod                                  | One place to validate all API input                                                                                                    |
| Vercel                               | Free, fast to deploy, and reviewers need nothing installed                                                                             |

## Data model

- `users`: id, name, email (unique)
- `documents`: id, owner, title, content (HTML), timestamps
- `shares`: document, user, role (`viewer` | `editor`), unique per (document, user)

Content is stored as sanitized HTML, which TipTap reads and writes natively. It preserves formatting, is easy to inspect, and exports cleanly. The tradeoff is that HTML is harder to diff or merge than a structured format, which matters if real-time collaboration is added later.

## Access control

All authorization happens on the server, never in the UI.

- `src/lib/permissions.ts` is a pure module with no database imports. `resolveRole` turns a document plus the user's shares into `owner | editor | viewer | null`, and a permission matrix maps roles to actions (read, edit, rename, share, delete). Keeping it pure made it trivial to unit test.
- Every API route authenticates, loads the document with the caller's role, then checks the specific action.
- **404 vs 403:** a document you can't access returns 404, identical to one that doesn't exist, so the API never reveals that a private document exists. A document you can see but can't perform an action on returns 403.
- Only the owner can share, change roles, remove access or delete. Editors can edit and rename.

## Security decisions

- **Sanitization:** because content is HTML shared between users, a malicious document could run a script in a collaborator's browser. All content is sanitized with DOMPurify on every save and on every import, so `.md` files containing raw HTML are covered too.
- **Input validation:** Zod schemas on every route, ids checked as UUIDs, content capped at 500k characters, uploads capped at 2 MB with an extension allowlist.
- **Session cookie:** httpOnly, SameSite=Lax, Secure in production. The cookie value is validated as a UUID before it reaches the database.

## Mocked authentication (deliberate cut)

Login is a picker over three seeded users that sets an httpOnly cookie holding the user's id. There are no passwords, and the cookie is not signed, so anyone who knows a user id could impersonate them. That is acceptable for a demo where the assignment permits mocked auth, and I stated it in the UI and README. A real build would use a managed provider or signed sessions.

## Editing experience

- Debounced autosave (800 ms) with a visible status: unsaved, saving, saved or error.
- Pending edits are flushed when navigating away, and the browser warns before closing the tab with unsaved changes.
- Viewers get the same page in a read-only mode with no toolbar.
- Known limitation: two editors on the same document use last-write-wins. There is no merge and no conflict indicator.

## File import and export

- Import accepts `.txt`, `.md` and `.docx` (2 MB max) and creates a new document owned by the uploader. Conversion lives in a pure module (`src/lib/import.ts`): text becomes paragraphs, markdown goes through `marked`, and `.docx` goes through `mammoth`. Images inside `.docx` files are dropped, because the editor has no image support.
- Export (stretch) converts the saved HTML to Markdown with `turndown`. Any user who can read a document can export it. Underline is kept as inline `<u>` since Markdown has no syntax for it.

## Testing

23 unit tests with Vitest, aimed at logic where mistakes would hurt most:

- **Permissions:** every role and action combination, including the owner taking priority over any share entry
- **Import:** conversion for each file type, HTML escaping, and rejection of unsupported or corrupted files
- **Export:** formatting conversion and safe filenames

I did not write browser end-to-end tests. I verified the UI flows by hand, including the role-based behavior, as Alice, Bob and Carol.

## What I prioritized and deprioritized

**Prioritized:** correct, server-side access control; persistence; a coherent editor and sharing flow; a live deployment that works for reviewers.

**Deprioritized, on purpose:** real authentication, real-time collaboration, comments, version history, image support, a delete button in the UI (the API supports it), pagination, and end-to-end tests.

## With another 2-4 hours

In order of priority:

1. **Real authentication.** The mocked login is the biggest gap: the session cookie is unsigned, so it isn't safe beyond a demo. I would use a managed provider or signed sessions, and add sign-up and invite-by-email for people who don't have an account yet.
2. **Safe concurrent editing.** Two editors on the same document currently overwrite each other (last write wins). The cheapest fix is an `updatedAt` check on save that warns the user about a conflict. Real-time collaboration with a CRDT such as Yjs, which TipTap supports, would be the longer-term answer, and it would also push me to revisit storing content as HTML.
3. **Version history.** Store a snapshot on each significant save so owners can review and restore earlier versions.
4. **End-to-end tests.** Playwright tests for the Alice, Bob and Carol sharing flow, since I currently verify those UI flows by hand.
5. **Smaller polish.** A delete button in the UI (the API already supports it), image support in the editor and `.docx` import, and pagination on the dashboard.
