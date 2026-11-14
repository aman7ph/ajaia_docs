# AI Workflow Note

## Tools used

- **Claude (chat)** as a pair programmer for planning, code generation, debugging and documentation drafts.
- CONFIRM: list any other tools (Cursor, Copilot, v0, etc.) or write "No other AI tools."

## How I worked

I did not ask for the whole app in one shot. I split it into small steps (foundation, session, document API, dashboard, editor, sharing, import, export), and after every step I ran the type checker and tests and exercised the feature myself before moving on. I committed after each working step so every change is easy to review. I also asked for the plan and the scope cuts before any code was written.

## Where AI materially sped me up

- **Scaffolding and boilerplate:** project config, Drizzle schema, Zod validation, route handlers and the TipTap toolbar, which would have taken most of the timebox by hand.
- **Design alternatives:** choosing Postgres over SQLite because of Vercel's non-persistent filesystem, and TipTap over building an editor.
- **Test drafting:** the permission, import and export test cases, which I then ran and checked.
- **Debugging:** the unhelpful drizzle-kit error ("reading 'value'") led back to an empty config file.

## What I changed, rejected or caught

- **Project structure:** the first files came out loosely organized. I reorganized into `src/app`, `src/components`, `src/db` and `src/lib`, and moved the seed script into `src/db`.
- **Empty files from copy-paste:** several files (`db/index.ts`, `drizzle.config.ts`) ended up empty when I pasted them. I checked file sizes and fixed them. The AI's first check only covered `src/`, so it missed the root files until I pointed it out.
- **Missing content:** the AI told me to "check" `tsconfig.json` without providing it. I asked for the content.
- **Route folder bug:** `/documents/[id]` returned 404 after creating a document. I traced it to my `page.tsx` sitting in the wrong folder, and fixed it myself.
- **Process:** I asked the AI to keep answers in chat, work one step at a time, and not generate files.
- CONFIRM / ADD: anything you rejected or rewrote that I don't know about, such as styling, wording or code you changed.

## How I verified correctness

- **Static checks:** `tsc --noEmit` after every step, plus a production `next build` before deploying.
- **Automated tests:** 23 Vitest tests covering permissions, import conversion and export conversion.
- **API checks by hand:** I called the endpoints from the browser console and confirmed the exact status codes: 201 on create, 400 on invalid input, 404 for users with no access, 403 for a non-owner managing shares.
- **Security check:** I saved `<script>alert(1)</script>` in a document and confirmed it was stripped on read.
- **Role testing in the browser:** I logged in as Alice, Bob and Carol to confirm owner, editor and view-only behavior.
- **Round-trip and format checks:** exported Markdown and re-imported it, and tested real `.docx` and `.md` uploads.
- **Deployment check:** I tested the live URL in an incognito window against the same flows.

## What I would not trust AI output on without checking

Access control, input handling and anything touching stored HTML. I read those parts line by line, which is why permission logic lives in a small pure module with its own tests.
