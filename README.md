# RecipeShare

RecipeShare lets visitors browse recipes from around the world, search by title or ingredient, filter by cuisine, category, and dietary tag, and sort by newest or highest rated. Visitors can share recipes, scale ingredient amounts, and leave 1–5 star ratings without an account.

Live app on Vercel [https://recipeshare-chavez.vercel.app](https://recipeshare-chavez.vercel.app)

## Tech stack

- Next.js App Router, React, and JavaScript
- Neon Postgres (Free) through `@neondatabase/serverless`
- Vitest for tests, GitHub Actions for CI, and Vercel Hobby for hosting

## Run locally

Use Node.js 20, as configured in CI.

From the repository root, install dependencies.

```sh
npm install
```

If `.env.local` is missing, create it with `cp .env.example .env.local` or, in Windows PowerShell, `Copy-Item .env.example .env.local`. Set `DATABASE_URL` in `.env.local` to your Neon Postgres connection string, then start the app.

```sh
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). If PowerShell blocks `npm.ps1`, use `npm.cmd` in place of `npm` for each command.

The app creates the database tables on first use and adds two sample recipes when the recipes table is empty.

## Tests and build

```sh
npm test
npm run build
```

`npm test` runs the full Vitest suite. `npm run build` creates a production build. Both commands can run without database credentials.

## Deployment

Pushes to `main` automatically deploy to production on Vercel. GitHub Actions runs the tests and production build on every push and pull request. Set `DATABASE_URL` in the Vercel project's environment variables for runtime database access.

## Environment variables

- `DATABASE_URL`
- `AUTH_SECRET`
- `AUTH_GOOGLE_ID`
- `AUTH_GOOGLE_SECRET`

Google sign-in is enabled when all three auth variables are set. In your Google OAuth web client, register `http://localhost:3000/api/auth/callback/google` for local development and the same path on your deployment origin. [Auth.js Google provider setup](https://authjs.dev/getting-started/providers/google)

## Feature checklist

See the [product specification](docs/spec.md) for acceptance criteria.

**Done** means the acceptance checks passed. **Partly done** means the feature is implemented and deployed acceptance checks are still open. **Not done** means the feature has yet to be implemented.

| ID | Feature | Status |
| --- | --- | --- |
| M1 | Browse recipe cards with photos, cuisine, category, and average rating | Done |
| M2 | Open a recipe and view its details and author | Done |
| M3 | Add a recipe with required-field validation | Partly done |
| M4 | Filter by cuisine and category, clear filters, and see an empty state | Done |
| M5 | Rate a recipe and see its average and count update | Partly done |
| M6 | Persist recipes and ratings in Neon across devices and deployments | Partly done |
| M7 | Provide two live sample recipes with different cuisines and categories | Done |
| S1 | Google sign-in, sign-out, and author profiles | Partly done |
| S2 | Edit and delete your own recipes | Partly done |
| S3 | One rating per signed-in user, with no self-rating | Done |
| S4 | Upload and persist recipe photos | Not done |
| S5 | Search by title or ingredient alongside filters | Done |
| S6 | Sort by newest or highest rated | Done |
| Could | Comments | Not done |
| Could | Favorites on a profile page | Not done |
| Could | Servings scaler | Done |
| Could | Embedded recipe video | Not done |
| Could | Dietary tags and filtering | Done |
| Could | Phone-friendly layout | Done |
| Could | Passport-themed fallback for missing or failed recipe photos | Done |

The passport-themed fallback keeps recipe cards and detail pages readable when a photo is missing or fails to load.

### Open checks on the deployed app

- **M3** — Submit a complete recipe and confirm it appears on the home page. Submit an incomplete recipe and confirm the form identifies the missing field and saves nothing.
- **M5** — Submit a rating and confirm the average and rating count update on both the detail page and the home page card.
- **M6** — Confirm a new recipe and its ratings are visible from a second device and persist after redeployment.
- **S1** — Verify Google sign-in and sign-out, Google authorship and private profile visibility, continued access to visitor features, and the footer privacy link.
- **S2** — Verify authors can edit and delete their own recipes and that the server rejects edits and deletions by another account.

## Built with

RecipeShare was built with AI agents. Claude Opus planned and designed it, Codex built it, and Claude Sonnet reviewed it.
