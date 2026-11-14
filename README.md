# Ajaia Docs

A lightweight collaborative document editor inspired by Google Docs, built for the Ajaia AI-Native Full Stack Developer assignment.

**Live demo:** https://ajaia-docs-beryl-six.vercel.app/
**Walkthrough video:** see `walkthrough-video.txt` in the submission folder

## Features

- **Documents:** create, rename, edit, autosave and reopen
- **Rich text:** bold, italic, underline, H1/H2 headings, bulleted and numbered lists
- **File import:** upload `.txt`, `.md` or `.docx` and get a new editable document (max 2 MB; images inside `.docx` files are not imported)
- **Sharing:** the owner shares by email as Viewer or Editor. The dashboard separates "My documents" from "Shared with me" with role badges
- **Persistence:** documents and shares are stored in Postgres, and formatting is preserved as sanitized HTML
- **Export (stretch):** download any document you can read as Markdown

## Tech stack

Next.js 14 (App Router) and TypeScript, TipTap editor, Postgres (Neon) with Drizzle ORM, Zod validation, sanitize-html for content sanitization, mammoth and marked for import, turndown for export, Vitest for tests.

## Run locally

Requires Node.js 18.17 or newer and a free Postgres database (for example [Neon](https://neon.tech)).

```bash
npm install
cp .env.example .env      # on Windows, copy the file and rename it to .env
```

Edit `.env` and set `DATABASE_URL` to your Postgres connection string (with Neon, use the pooled one). Then:

```bash
npm run db:push           # creates the tables
npm run db:seed           # creates the three demo users
npm run dev               # http://localhost:3000
```

### Scripts

| Command                       | What it does                           |
| ----------------------------- | -------------------------------------- |
| `npm run dev`                 | Start the dev server                   |
| `npm run build` / `npm start` | Production build and server            |
| `npm test`                    | Run the unit tests                     |
| `npm run db:push`             | Sync the schema to the database        |
| `npm run db:seed`             | Insert the demo users (safe to re-run) |

## Test accounts

Authentication is mocked on purpose: the login page lists seeded users and one click signs you in. There are no passwords.

| User         | Email            |
| ------------ | ---------------- |
| Alice Owner  | alice@ajaia.test |
| Bob Editor   | bob@ajaia.test   |
| Carol Viewer | carol@ajaia.test |

## Try the sharing flow

1. Log in as **Alice**, click **New document**, and type some text.
2. Click **Share**, add `bob@ajaia.test` as **Editor** and `carol@ajaia.test` as **Viewer**.
3. Log out and log in as **Bob**. The document appears under "Shared with me" with a "Can edit" badge, and your edits autosave.
4. Log in as **Carol**. The document is read-only, with no toolbar and a "View only" badge.
5. Back as Alice, change a role or remove access in the Share dialog.

## Tests

```bash
npm test
```

27 tests cover:

- **Access control:** owner, editor, viewer and no-access roles, and which actions each can perform
- **Sanitization:** script removal, event-handler stripping, `javascript:` links, and preservation of editor formatting
- **File import:** text, Markdown and `.docx` conversion, escaping, and rejection of unsupported or corrupted files
- **Markdown export:** formatting conversion and safe filenames

## Project structure

```
src/
  app/          Pages and API routes (login, dashboard, editor, documents API)
  components/   UI: editor, toolbar, share dialog, upload and list components
  db/           Drizzle schema, connection and seed script
  lib/          Business logic: permissions, validation, import, export, sessions
docs/           Architecture note and AI workflow note
```

## Documentation

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md): what was built, why, and the tradeoffs
- [`docs/AI_WORKFLOW.md`](docs/AI_WORKFLOW.md): how AI tools were used and verified

## Status

**Working end to end:** everything listed under Features.

**Intentionally not built:** real authentication, real-time collaboration, comments, version history, images in documents, fine-grained permissions beyond Viewer/Editor.

**With another 2-4 hours:**

1. replace the mocked login with real authentication and signed sessions
2. add conflict detection for simultaneous edits, since saves are currently last-write-wins,
3. add document version history, and
4. add Playwright end-to-end tests for the sharing flow.
