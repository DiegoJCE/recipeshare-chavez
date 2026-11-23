# RecipeShare

RecipeShare lets visitors browse recipes from around the world, filter by cuisine and category, share recipes with a food photo link, and leave 1–5 star ratings. These features are available without an account.

[Open RecipeShare on Vercel](https://recipeshare-chavez.vercel.app/)

## Tech stack

- Next.js App Router, React, and JavaScript
- Neon Postgres (Free) through `@neondatabase/serverless`
- Vitest for tests, GitHub Actions for CI, and Vercel Hobby for hosting

## Run locally

Use Node.js 20, as configured in CI.

1. Run `npm install`.
2. Copy `.env.example` to `.env.local` and set `DATABASE_URL` to your Neon Postgres connection string.
3. Run `npm run dev` and open [http://localhost:3000](http://localhost:3000).

The app creates the database tables on first use and adds two sample recipes when the recipes table is empty.

## Tests and build

- Run `npm test` to run the full Vitest suite.
- Run `npm run build` to create a production build. Tests and the build can run without database credentials.

## Deployment

Pushes to `main` automatically deploy to production on Vercel. GitHub Actions runs the tests and production build on every push and pull request. Set `DATABASE_URL` in the Vercel project's environment variables for runtime database access.

## Environment variables

- `DATABASE_URL`

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
| S4 | Upload and persist recipe photos | Not done |
| S5 | Search by title or ingredient alongside filters | Not done |
| S6 | Sort by newest or highest rated | Not done |
| Could | Comments | Not done |
| Could | Favorites on a profile page | Not done |
| Could | Servings scaler | Not done |
| Could | Embedded recipe video | Not done |
| Could | Dietary tags and filtering | Not done |
| Could | Phone-friendly layout | Done |

Live checks still open are submitting valid and incomplete recipes (M3), submitting a rating and confirming the updated average and count (M5), and checking that new data persists across devices and a redeploy (M6).
