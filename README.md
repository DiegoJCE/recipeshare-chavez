# RecipeShare

RecipeShare lets visitors browse recipes from around the world, search by title or ingredient, filter by cuisine, category, and dietary tag, and sort by newest or highest rated. Visitors can share recipes and scale ingredient amounts without an account. Leaving a 1–5 star rating requires Google sign-in.

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

## Refresh sample recipes

With the database tables already initialized, run `node scripts/seed-more.mjs` from the repository root. The script uses `DATABASE_URL` from `.env.local`, deletes the recipe titled `Nigiri` and its ratings, adds up to nine sample recipes while skipping existing titles, and prints the resulting recipe titles.

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
- `BLOB_READ_WRITE_TOKEN`
- `AUTH_SECRET`
- `AUTH_GOOGLE_ID`
- `AUTH_GOOGLE_SECRET`

Google sign-in is enabled when all three auth variables are set. In your Google OAuth web client, register `http://localhost:3000/api/auth/callback/google` for local development and the same path on your deployment origin. [Auth.js Google provider setup](https://authjs.dev/getting-started/providers/google)

Photo uploads require a Vercel Blob store and `BLOB_READ_WRITE_TOKEN` in the runtime environment. Recipes can also use an image URL.

Recipe ownership and rating updates use the Google account ID. After deploying this change, users with older sessions need to sign in again. Existing recipes and ratings remain visible. To restore account access to a legacy row, verify the original account ID against a trusted record from before the change, then set `recipes.author_google_subject` or `ratings.rater_google_subject` for the verified row. A matching email alone cannot establish that link. If the verified account has already rated the same recipe after the change, keep its newer rating and remove the verified legacy duplicate in the same transaction.

## Feature checklist

See the [product specification](docs/spec.md) for acceptance criteria.

**Done** means the acceptance checks passed on the deployed app. **Partly done** means implementation exists and acceptance criteria or deployed verification are still open. **Not done** means the feature has yet to be implemented.

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
| S3 | One rating per signed-in user, with no self-rating | Partly done |
| S4 | Upload and persist recipe photos | Partly done |
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

S1 and the Must requirements call for guest ratings. S3 calls for signed-in ratings only, which is the current implementation. The specification needs a decision on guest ratings before both sets of criteria can be satisfied.

### Open checks on the deployed app

- **M3** — Submit a complete recipe and confirm it appears on the home page. Submit an incomplete recipe and confirm the form identifies the missing field and saves nothing.
- **M5** — Submit a rating and confirm the average and rating count update on both the detail page and the home page card.
- **M6** — Confirm a new recipe and its ratings are visible from a second device and persist after redeployment.
- **S1** — Verify Google sign-in and sign-out, Google authorship and private profile visibility, continued access to visitor features, and the footer privacy link.
- **S2** — Verify authors can edit and delete their own recipes and that the server rejects edits and deletions by another account.
- **S3** — Verify the deployed app requires sign-in for ratings, replaces a user's previous rating, and blocks authors from rating their own recipes.
- **S4** — Confirm the production Vercel Blob store is connected, upload a photo, and verify it still displays after redeploying.

## Built with

RecipeShare was built with AI agents. Claude Opus planned and designed it, Codex built it, and Claude Sonnet reviewed it.
