# RecipeShare

RecipeShare lets visitors browse recipes from around the world, search by title or ingredient, filter by cuisine, category, and dietary tag, and sort by newest or highest rated. Visitors can share recipes, scale ingredient amounts, and leave 1–5 star ratings without an account.

[Open RecipeShare on Vercel](https://recipeshare-chavez.vercel.app/)

## Tech stack

- Next.js App Router, React, and JavaScript
- Neon Postgres (Free) through `@neondatabase/serverless`
- Vitest for tests, GitHub Actions for CI, and Vercel Hobby for hosting

## Run locally

Use Node.js 20, as configured in CI.

From the repository root, install dependencies and create your local environment file.

```sh
npm install
cp .env.example .env.local
```

If `.env.local` already exists, skip the copy. Set `DATABASE_URL` in `.env.local` to your Neon Postgres connection string, then start the app.

```sh
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). On Windows PowerShell, use `Copy-Item .env.example .env.local` to copy the file. If PowerShell blocks `npm.ps1`, use `npm.cmd` in place of `npm` for each command.

The app creates the database tables on first use and adds two sample recipes when the recipes table is empty.

To enable file uploads, connect a public Vercel Blob store to the project and set `BLOB_READ_WRITE_TOKEN` in `.env.local` for local development. Photos can be JPEG, PNG, or WebP up to 3 MB. Recipe authors can also provide an image URL.

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
- `BLOB_READ_WRITE_TOKEN` (for Blob uploads outside Vercel or projects using token-based Blob authentication)

## Feature checklist

See the [product specification](docs/spec.md) for acceptance criteria. For Must features, **Partly done** means the feature is implemented and a live acceptance check remains.

| ID | Feature | Status |
| --- | --- | --- |
| M1 | Browse recipe cards with photos, cuisine, category, and average rating | Done |
| M2 | Open a recipe and view its details and author | Done |
| M3 | Add a recipe with required-field validation | Partly done |
| M4 | Filter by cuisine and category, clear filters, and see an empty state | Done |
| M5 | Rate a recipe and see its average and count update | Partly done |
| M6 | Persist recipes and ratings in Neon across devices and deployments | Partly done |
| M7 | Provide two live sample recipes with different cuisines and categories | Done |
| S1 | Google sign-in, sign-out, and author profiles | Not done |
| S2 | Edit and delete your own recipes | Not done |
| S3 | One rating per signed-in user, with no self-rating | Not done |
| S4 | Upload and persist recipe photos | Partly done |
| S5 | Search by title or ingredient alongside filters | Done |
| S6 | Sort by newest or highest rated | Done |
| Could | Comments | Not done |
| Could | Favorites on a profile page | Not done |
| Could | Servings scaler | Done |
| Could | Embedded recipe video | Not done |
| Could | Dietary tags and filtering | Done |
| Could | Phone-friendly layout | Done |
| Could | Additional ideas | Not done |

Live checks still open are submitting valid and incomplete recipes (M3), submitting a rating and confirming the updated average and count (M5), and checking that new data persists across devices and a redeploy (M6).

S4 has upload code and automated coverage. Uploading to a connected Blob store and confirming the photo survives a redeploy remain to be verified.

## Built with

RecipeShare was built with AI agents. Claude Opus planned and designed it, Codex built it, and Claude Sonnet reviewed it.
