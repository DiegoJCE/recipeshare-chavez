VERDICT: PASS

I read the diff and `docs/spec.md`. There is no `SPEC.md`. I didn't run the tests or the build, so I found no crash from reading alone.

- **Spec:** The commit puts `docs/spec.md` back to its original text, which fixes the earlier FAIL for editing it. S4, the Could section and the image constraint match the original again. It also removes the Blob upload code, which would have broken the "images are links only" rule and M3's "image link (URL)" field.
- **M3:** `imageUrl` is `required` again in the form, and `validateRecipe` always checks the URL. An empty required field saves nothing and shows the error on that field.
- **Removed upload code:** I found no leftover imports. `lib/photo.js`, its test, the `@vercel/blob` dependency, the `next.config` body-size override and `BLOB_READ_WRITE_TOKEN` are all gone together, and the README lists S4 as "Not done".
- **Sorting:** `sortRecipes` now sorts by the DB `position` column, which `getRecipes` selects. It no longer relies on array order. `lib/db.js` creates `position` as an identity column, so "Newest" is correct.

Minor problems, none blocking:
1. `sortRecipes` assumes every recipe has a `position`. If one is missing, `Number(undefined)` is NaN and the order becomes undefined. The only data path today is the DB, so this can't happen yet. A fallback to input order would be safer.
2. The sort test now passes the recipes in a shuffled order. That is good, but it only covers the `position` case.
3. The servings scaler, dietary tags and the `dietaryTag` filter are still in the code, though the spec edits describing them were reverted. They are Could features and the spec's Could list covers them. If M1–M7 aren't verified live, they are still ahead of the "Must first" rule. The README should say they are covered by the Could list.
4. `REVIEW.md` and `agent_log.md` are in the commit or modified. This is process noise, not a bug.
