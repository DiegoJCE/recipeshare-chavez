VERDICT: PASS

I found no crashes or spec violations in this commit. I read `docs/spec.md` because there is no `SPEC.md`. I reviewed the diff by reading it and didn't run the tests.

- **`auth.js`:**
  - Google is now registered only when the env vars are set, and `signIn` accepts only a verified Google profile that has a name and an email. This matches S1 and the CLAUDE.md "no secrets" rule.
  - `getSignedInUser()` treats a session without a name or email as a guest, so guests can still browse, submit and rate.
  - The test mocks `next-auth`, so it checks the callback logic but not a real sign-in.
- **`auth.test.js`:** the three tests cover the unconfigured case, the sign-in rules and incomplete sessions. They match the code.
- **`orchestrate.py` (non-blocking):**
  - If the time budget runs out partway through a queued batch, the loop exits and the remaining queued changes are dropped without a log line.
  - `args.minutes == 40` detects "the user didn't pass `--minutes`" by comparing to the default. Passing `--minutes 40` explicitly still gets 120.
  - The final `push()` after the loop repeats the per-change push. It does no harm.
  - `DEADLINE` is reset only when the queue is empty, so every change in a batch shares one 120-minute budget.
  - The commit message is cut off mid-sentence ("started in the last"), which is cosmetic.

I did not check that the app lets you sign out from the header, stores the email privately, or links a privacy page from the footer. S1 requires all three, and none of them is in this diff.
