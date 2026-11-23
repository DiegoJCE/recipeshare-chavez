# RecipeShare: agent instructions

## Source of truth
- `docs/spec.md` is the source of truth for requirements. Do not change it.
- `docs/plan.md` is the build plan. Do one step at a time and tick it off when done.
- Build Must features M1-M7 first. Do not start Should features until M1-M7 work on the live app.

## Stack
- Next.js (App Router, JavaScript), deployed on Vercel (free Hobby plan), auto-deploy on push to `main`.
- Database: free Neon Postgres added from the Vercel project's Storage tab. Connection string in env var `DATABASE_URL`.
  Use `@neondatabase/serverless`. Create tables if missing. If the recipes table is empty, insert at least 2 sample
  recipes with different cuisines and categories (M7).
- Until the database is connected, keep recipes in in-memory sample data behind one data module (`lib/data.js`),
  so switching to the database changes only that module.
- Tests: Vitest. Put pure logic (filtering, average rating, required-field validation) in `lib/` so it can be
  tested without a database. `npm test` runs all tests.
- Never touch the database at build time (`next build` must pass in CI without `DATABASE_URL`): use dynamic rendering for pages that read data.

## Commands
- Install: `npm install`
- Run locally: `npm run dev` (http://localhost:3000)
- Test: `npm test`
- Build: `npm run build`

## Rules
- Cuisine and category are drop-downs from the fixed lists in the spec, never free text.
- After a feature works, add a test for it and run ALL tests.
- No secrets in the repo. Secrets live in `.env.local` (git-ignored) and in Vercel env vars. `.env.example` lists names only.
- Keep code simple and readable; small components; no unnecessary dependencies.
- Images are URLs only (no uploads) for Must features.
- Do not run `git commit` or `git push`; the orchestrator commits and pushes.
