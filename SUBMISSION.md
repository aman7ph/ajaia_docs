# Submission

**Candidate:** Amanuel Dereje
**Project:** Ajaia Docs, a lightweight collaborative document editor

## Links

- **Live product:** https://ajaia-docs-beryl-six.vercel.app/
- **Walkthrough video (Loom):** https://www.loom.com/share/9d7894d72bb747869931e83869237988
- **Submission folder (Google Drive):** https://drive.google.com/drive/folders/1L_FkYAwZ9OZ1eX0F8esL8Osa-x0PRzYR?usp=sharing
- **Source repository:** https://github.com/aman7ph/ajaia_docs

## Test accounts

Authentication is mocked on purpose. The login page lists the seeded users and one click signs you in, with no passwords.

| User         | Email            | Use it to see                           |
| ------------ | ---------------- | --------------------------------------- |
| Alice Owner  | alice@ajaia.test | Creating, sharing, uploading, exporting |
| Bob Editor   | bob@ajaia.test   | Editing a shared document               |
| Carol Viewer | carol@ajaia.test | Read-only access to a shared document   |

Suggested review path: log in as Alice, create a document and use **Share** to give Bob Editor and Carol Viewer access. Then log in as Bob and as Carol to compare what each can do. Using a second browser window or incognito makes switching users easier.

## What is included in this folder

| Item                    | Description                                                   |
| ----------------------- | ------------------------------------------------------------- |
| `ajaia_docs_source.zip` | Full source code (without `node_modules`, `.next` or `.env`)  |
| `README.md`             | Local setup, scripts, test accounts and a guided sharing flow |
| `ARCHITECTURE.md`       | Architecture note: what was prioritized and why               |
| `AI_WORKFLOW.md`        | AI workflow note                                              |
| `SUBMISSION.md`         | This file                                                     |
| `walkthrough-video.txt` | The walkthrough video URL                                     |

The same README, architecture note, AI workflow note and this file are also inside the zip, under the project root and `docs/`.

## What works end to end

- Create, rename, edit, autosave and reopen documents
- Rich text: bold, italic, underline, H1/H2, bulleted and numbered lists
- Upload `.txt`, `.md` and `.docx` (max 2 MB) into a new editable document. Supported types are stated in the UI
- Sharing by email as Viewer or Editor, with role changes and removal. The dashboard separates "My documents" from "Shared with me" with role badges
- Persistence in Postgres (Neon), with formatting kept as sanitized HTML
- Server-side access control on every API route
- Stretch: export a document as Markdown
- 27 automated tests (permissions, sanitization, import conversion, export conversion)

## What is incomplete or intentionally not built

- Real authentication (login is mocked, and the session cookie is unsigned)
- Real-time collaboration. Simultaneous edits are last-write-wins
- Comments, suggestion mode and version history
- Images in the editor and in `.docx` imports
- A delete button in the UI. The API supports delete, but there is no button yet
- End-to-end browser tests. UI flows were verified by hand

## With another 2-4 hours

1. Real authentication and signed sessions
2. Conflict detection for simultaneous edits
3. Version history
4. Playwright end-to-end tests for the sharing flow
5. Delete button, image support and dashboard pagination

## Running locally

See `README.md`. In short: `npm install`, copy `.env.example` to `.env` and add a Postgres `DATABASE_URL`, then `npm run db:push`, `npm run db:seed` and `npm run dev`.
