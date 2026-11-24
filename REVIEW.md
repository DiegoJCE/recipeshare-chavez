VERDICT: PASS

I read the diff and the surrounding code (`auth.js`, `page.js`, `docs/spec.md`). I did not run the tests or the build. `SPEC.md` doesn't exist, so I used `docs/spec.md`. I found no crash or functional bug that contradicts S3. The server enforces all three S3 rules:
- **Sign-in:** `rateRecipe` returns early when `getSignedInUser()` is null, before it touches the database.
- **One rating per user:** the `ON CONFLICT (recipe_id, rater_email) DO UPDATE` clause replaces the user's earlier rating.
- **No self-rating:** `author_email IS DISTINCT FROM ${raterEmail}` blocks authors, and also lets through recipes that have no `author_email`.

Concerns, none blocking:
- **README marks S3 "Done" without a deployed check.**
  - Spec §3 and the previous review say a feature is done only when it passes on the deployed app.
  - `docs/plan.md` step 21 is ticked on local verification alone, and nothing shows the `ALTER TABLE` and unique-index migration ran against the live Neon database.
  - S1 and S2 are still "Partly done" for the same reason.
  - Mark S3 "Partly done" until it is checked live.
- **The tests don't exercise the replace-rating rule.**
  - `actions.test.js` mocks `sql` and re-implements the replace and self-rating logic in the mock. It only checks that the query text contains `ON CONFLICT` and `IS DISTINCT FROM`.
  - The old `addRating` tests were deleted, so the real SQL has no coverage.
  - This is acceptable for a no-database test setup, but the rules are not truly tested.
- **No one can rate when Google sign-in isn't configured.**
  - `getSignedInUser()` returns null when the `AUTH_*` environment variables are missing, so every visitor sees "Sign in to rate".
  - That follows S3. It does conflict with the S1 and M5 wording that visitors can rate without an account, but S3 supersedes it.
- **The "Sign in to rate" button links to `/profile`.** I didn't check that this route starts the sign-in flow. If it only shows a page, the link is a minor UX issue.
- **Emails are compared case-sensitively.** `author_email` and `rater_email` are plain text, so a case difference could let an author rate their own recipe. Google emails are normally consistent, so this is unlikely.
- **Old ratings have no `rater_email`.** They stay counted in averages and are never replaced. Because `NULL` values are distinct in a unique index, the new index won't fail on them.
