VERDICT: PASS

I reviewed `git show HEAD` and read `docs/spec.md`. The spec file is `docs/spec.md`, not `SPEC.md`. I couldn't run `npm test` or `npm run build` here because the shell denied the commands, so my verdict comes from reading the code.

The commit implements plan step 3 (M1), and I found no bugs or crashes in it. It matches the M1 criterion in the spec.

- **`averageRating`:** it returns 0 for an empty list and rounds to one decimal. `[5,4,4]` gives 43.33, which rounds to 4.3, so the test expectations are correct.
- **`RecipeCard`:** it shows the photo, title, cuisine, category, average rating and rating count. It reads `ratings.length` safely, because the sample data and `addRecipe` both always set `ratings` to an array.
- **`app/page.js`:** it keeps `force-dynamic`, so the page doesn't read data at build time.
- **`docs/plan.md`:** step 3 is ticked, and `docs/spec.md` is untouched.

Minor issues, none blocking:
1. A recipe with no ratings shows "0.0 / 5 (0 ratings)". That could read as a real score, so "No ratings yet" would be clearer.
2. The card isn't a link yet. That belongs to plan step 4 (M2), so it isn't a defect.
3. The plain `<img>` will trigger Next's `@next/next/no-img-element` lint warning if linting is enabled. The plan asks for a plain img, so this is expected.
4. The sample image URLs have no size parameters, so the browser downloads full-size Unsplash photos for each card.
5. The tests only cover `averageRating`. That matches the plan, but nothing tests the card.

`REVIEW.md` contains an older "VERDICT: PASS" review of the step 1 scaffold. It doesn't cover this commit, and I didn't rely on it.
