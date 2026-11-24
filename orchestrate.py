#!/usr/bin/env python3
"""
Multi-agent app builder.

  0. BRAINSTORM  you dump messy ideas -> Opus cleans them into SPEC.md + suggestions
  1. PLAN        Opus turns SPEC.md into PLAN.md (4-6 small tasks)
  2. BUILD       builder does one task at a time (Codex by default; Sonnet if Codex fails)
  3. REVIEW      a different model family reviews each commit; FAIL -> fix -> (Opus rescue)
     DESIGN      the last task is always a design polish pass, done by Opus (--designer)
  4. WRAP UP     README, commit, optional push to GitHub
  Later: --edit  change things after it's built (each change is built, reviewed, committed, pushed)

Checkpoints pause for you:  [Enter] continue | f <what to change> | q stop

Typical use (run inside an EMPTY project folder; no SPEC.md -> brainstorm starts automatically):
    python orchestrate.py --minutes 40 --push --repo my-app                  # Codex builds, Sonnet reviews
    python orchestrate.py --minutes 40 --push --repo my-app --net            # + internet for npm installs
    python orchestrate.py --minutes 40 --push --repo my-app --builder sonnet # Sonnet builds, Codex reviews
    python orchestrate.py --spec-only        # just brainstorm a SPEC.md, don't build
    python orchestrate.py --edit             # make changes to an app that's already built
Other flags: --brainstorm (redo spec even if SPEC.md exists), --auto (no checkpoints)
"""
import argparse, re, shutil, subprocess, sys, time
from pathlib import Path

ap = argparse.ArgumentParser()
ap.add_argument("--minutes", type=float, default=40, help="time budget")
ap.add_argument("--push", action="store_true", help="create GitHub repo and push at the end")
ap.add_argument("--repo", default=None, help="GitHub repo name (default: folder name)")
ap.add_argument("--auto", action="store_true", help="skip checkpoints (no pauses)")
ap.add_argument("--brainstorm", action="store_true", help="brainstorm SPEC.md even if one exists")
ap.add_argument("--spec-only", action="store_true", help="stop after the brainstorm")
ap.add_argument("--edit", action="store_true", help="change an already-built app")
ap.add_argument("--planner", default="opus")
ap.add_argument("--builder", default="codex", help="codex (default), sonnet, or opus")
ap.add_argument("--designer", default="opus", help="Claude model for the DESIGN polish task")
ap.add_argument("--reviewer-model", default="sonnet", help="Claude model used when Claude reviews")
ap.add_argument("--net", action="store_true", help="let the Codex builder use the internet (npm install etc.)")
args = ap.parse_args()

# Commands Claude may run without asking. Everything else is blocked in headless mode.
ALLOWED_TOOLS = [
    "Read", "Edit", "Write", "Glob", "Grep",
    "Bash(npm:*)", "Bash(npx:*)", "Bash(node:*)",
    "Bash(python:*)", "Bash(py:*)", "Bash(pip:*)",
    "Bash(ls:*)", "Bash(cat:*)", "Bash(mkdir:*)",
    "Bash(git status:*)", "Bash(git diff:*)", "Bash(git log:*)", "Bash(git show:*)",
]
READONLY_TOOLS = ["Read", "Glob", "Grep", "Bash(git show:*)", "Bash(git diff:*)", "Bash(git log:*)"]
SPEC_TOOLS = ["Read", "Write", "Edit"]

SPEC_OUTLINE = """# SPEC
## App idea
(1-2 sentences)
## Must-have features
(3-5 concrete, testable features)
## Nice-to-have (only if time)
(1-3 items)
## Look & feel
(1-2 lines: vibe, colors, layout)
## Constraints
- Runs locally with ONE command; simple web UI that looks good in a demo
- No accounts/login, no database unless the idea truly needs one
- Any API key is read from a .env file and never committed"""

SPEC, PLAN = "docs/spec.md", "docs/plan.md"
START = time.time()
DEADLINE = START + args.minutes * 60
ROOT = Path.cwd()
LOG = ROOT / "agent_log.md"

def exe(name):
    return shutil.which(name)  # resolves claude.cmd / codex.cmd on Windows

CLAUDE, CODEX, GIT, GH = exe("claude"), exe("codex"), exe("git"), exe("gh")
if not CLAUDE or not GIT:
    sys.exit("Need both `claude` and `git` on PATH.")

def left():
    return DEADLINE - time.time()

def log(msg):
    stamp = f"[{(time.time()-START)/60:5.1f} min]"
    print(stamp, msg, flush=True)
    with LOG.open("a", encoding="utf-8") as f:
        f.write(f"{stamp} {msg}\n")

def run(cmd, timeout=None):
    t = max(30, min(timeout or left(), max(left(), 30)))
    try:
        r = subprocess.run(cmd, cwd=ROOT, capture_output=True, text=True,
                           encoding="utf-8", errors="replace", timeout=t)
        return r.returncode, (r.stdout or "") + (r.stderr or "")
    except subprocess.TimeoutExpired:
        return 124, "TIMEOUT"

def claude(prompt, model, max_turns=40, readonly=False, tools=None):
    mode = "default" if readonly else "acceptEdits"
    tools = tools or (READONLY_TOOLS if readonly else ALLOWED_TOOLS)
    code, out = run([CLAUDE, "-p", prompt, "--model", model,
                     "--permission-mode", mode,
                     "--max-turns", str(max_turns),
                     "--allowedTools", *tools])
    if code != 0:
        log(f"claude ({model}) exited {code}: {out.strip()[-500:]}")
    return code, out

builder = args.builder

def build(prompt, max_turns=40):
    """Run the builder (Codex or a Claude model). Falls back to Sonnet if Codex breaks."""
    global builder
    if builder == "codex":
        cmd = [CODEX, "exec", "--sandbox", "workspace-write"]
        if args.net:
            cmd += ["-c", "sandbox_workspace_write.network_access=true"]
        code, out = run(cmd + [prompt])
        if code == 0:
            return code, out
        log(f"codex builder failed ({out.strip()[-200:]}) -> switching builder to sonnet")
        builder = "sonnet"
    return claude(prompt, builder, max_turns)

def git(*a):
    return run([GIT, *a], timeout=60)

def commit(msg):
    git("add", "-A", "--", ".", ":(exclude,top)REVIEW.md", ":(exclude,top)agent_log.md")
    code, _ = git("commit", "-m", msg)
    if code == 0:
        log(f"committed: {msg}")

def checkpoint(summary, force=False):
    """Pause for the user. Returns 'go', 'quit', or the change text."""
    if args.auto and not force:
        return "go"
    print("\n" + "=" * 60)
    print(summary.strip())
    print(f"--- {left()/60:.1f} min left. [Enter] continue | f <what to change> | q stop")
    ans = input("> ").strip()
    print("=" * 60 + "\n")
    if ans.lower() == "q":
        log("you pressed q")
        return "quit"
    if ans.lower().startswith("f "):
        return ans[2:].strip()
    return "go"

def read(name):
    p = ROOT / name
    return p.read_text(encoding="utf-8") if p.exists() else ""

def ask_multiline(prompt):
    print(prompt)
    print("(type as much as you want; press Enter on an EMPTY line when done)")
    lines = []
    while True:
        line = input()
        if not line.strip():
            break
        lines.append(line)
    return " ".join(lines)

# ---------- setup ----------
(ROOT / "docs").mkdir(exist_ok=True)
if not (ROOT / ".git").exists():
    git("init", "-b", "main")
    (ROOT / ".gitignore").write_text(
        "node_modules/\n.env\n.env*.local\n.vercel/\n.next/\n__pycache__/\ndist/\n.venv/\nClaude outputs/\n", encoding="utf-8")
    git("add", "-A"); git("commit", "-m", "initial commit", "--allow-empty")

if builder == "codex" and not CODEX:
    print("codex not found -> builder is sonnet")
    builder = "sonnet"
codex_ok = bool(CODEX) and builder != "codex"  # reviewer is always a different family

# ---------- review (shared by build + edit) ----------
def review():
    # Reviewer runs `git show HEAD` itself (Windows caps command-line length).
    prompt = ("You are a code reviewer. Run: git show HEAD  to see the latest commit, and read "
              "SPEC.md. Review that commit for bugs, crashes, and things that contradict the spec. "
              "Do NOT edit files. First line of your reply must be exactly "
              "'VERDICT: PASS' or 'VERDICT: FAIL', then a short list of concrete problems.")
    global codex_ok
    if codex_ok:
        code, out = run([CODEX, "exec", "--sandbox", "read-only", prompt], timeout=300)
        m = re.search(r"^VERDICT: (PASS|FAIL)", out, re.M)  # line-start only; ignores echoed prompt
        if code == 0 and m:
            return "codex", out[m.start():]
        log(f"codex failed ({out.strip()[-200:]}) -> switching reviewer to fresh claude session")
        codex_ok = False
    _, out = claude(prompt, args.reviewer_model, max_turns=8, readonly=True)
    return "claude", out

def review_and_fix():
    """Review HEAD; on FAIL fix with builder, then Opus. Returns last verdict text."""
    verdict = "(no review: out of time)"
    for attempt in range(2):
        if left() < 120:
            break
        who, verdict = review()
        (ROOT / "REVIEW.md").write_text(verdict, encoding="utf-8")
        m = re.search(r"^VERDICT: (PASS|FAIL)", verdict, re.M)
        if m and m.group(1) == "PASS":
            log(f"review ({who}): PASS")
            break
        fix_prompt = ("Read REVIEW.md and fix the real problems it lists (ignore pure style nits). "
                      "Run the app to confirm it still works. Do not run git commit.")
        if attempt == 0:
            log(f"review ({who}): FAIL -> fixing with {builder}")
            build(fix_prompt)
            commit(f"fix after review ({builder})")
        else:
            log(f"review ({who}): FAIL again -> fixing with {args.planner}")
            claude(fix_prompt, args.planner)
            commit(f"fix after review ({args.planner})")
    return verdict

def push():
    _, remotes = git("remote")
    if "origin" in remotes:
        code, out = git("push", "-u", "origin", "HEAD")
        log("pushed to GitHub" if code == 0 else f"push failed: {out[-300:]}")
    elif args.push:
        if not GH:
            log("gh CLI not found; push manually")
            return
        name = args.repo or ROOT.name
        code, out = run([GH, "repo", "create", name, "--public", "--source", ".", "--push"], timeout=120)
        log("created repo + pushed to GitHub" if code == 0 else f"push failed: {out[-300:]}")
    elif not getattr(push, "warned", False):
        push.warned = True
        log("not pushed (no --push). To push: gh repo create <name> --public --source . --push")

# ======================= EDIT MODE =======================
if args.edit:
    if args.minutes == 40:
        args.minutes = 120  # edit mode: plenty of time per batch
    log(f"edit mode. builder: {builder}. reviewer: {'codex' if codex_ok else 'claude ' + args.reviewer_model}")
    queue = []
    while left() > 60:
        if not queue:
            print("\nWhat do you want to change? ONE change per line; each line is built, reviewed,")
            print("committed and pushed separately, in order. Empty line = start / finish.")
            while True:
                line = input().strip()
                if not line:
                    break
                queue.append(line)
            if not queue:
                break
            DEADLINE = time.time() + args.minutes * 60  # timer starts after you type, not before
        change = queue.pop(0)
        log(f"change ({len(queue)} more queued): {change}")
        build(f"Make this change to the app: {change}. Keep everything else working and keep the "
              "existing visual design. NEVER modify docs/spec.md (it is the instructor's spec). "
              "If the change is a feature, add a test for it and run ALL tests. "
              "Run the app to confirm it works. Do not run git commit.")
        commit(f"change: {change[:60]}")
        verdict = review_and_fix()
        push()
        print(f"\nReview: {verdict[:600]}")
    push()
    log("done")
    sys.exit()

# ======================= 0. BRAINSTORM =======================
if args.brainstorm or args.spec_only or not (ROOT / SPEC).exists():
    ideas = ask_multiline("\nBRAINSTORM: what's the app? Dump everything: the prof's idea, "
                          "features, vibe, half-ideas. Messy is fine.")
    log("brainstorming spec with " + args.planner)
    BRAIN = ("You are a product brainstorm partner. The user's raw ideas: <<<{ideas}>>>\n"
             "Write docs/spec.md using exactly this outline:\n" + SPEC_OUTLINE + "\n"
             "Clean up and sharpen the ideas, keep the user's intent, and keep the scope small "
             "enough for AI agents to build in about 30 minutes. Do not write any app code. "
             "Fill Look & feel from the user's ideas, or with your best creative pick if they gave none. "
             "Then, in your reply (not in the file), give: "
             "(a) 3 VISUAL DIRECTIONS the app could take, numbered, each one line with a name, "
             "color palette, font style, and vibe (make them genuinely different and not generic); "
             "(b) 3 short feature suggestions that would make it better or more impressive in a demo; "
             "(c) any questions where the ideas were unclear (say what you assumed). "
             "The user can reply e.g. 'use visual direction 2'.")
    _, out = claude(BRAIN.replace("{ideas}", ideas), args.planner, max_turns=6, tools=SPEC_TOOLS)
    while True:
        ans = checkpoint("SPEC.md:\n" + read(SPEC) + "\n\nSUGGESTIONS / QUESTIONS:\n"
                         + out.strip()[-1500:] + "\n\n(f <changes> to edit the spec, e.g. "
                         "'f use visual direction 2, add suggestion 1')", force=True)
        if ans == "quit":
            sys.exit("Stopped at brainstorm.")
        if ans == "go":
            break
        ideas += " | User's follow-up: " + ans
        log(f"spec change: {ans}")
        _, out = claude("Update docs/spec.md (same outline) with this feedback from the user: "
                        f"{ans}. Keep the scope small. Then briefly give any new suggestions or "
                        "questions in your reply.", args.planner, max_turns=6, tools=SPEC_TOOLS)
    commit("spec")
    if args.spec_only:
        log("spec ready. Run again without --spec-only to build.")
        sys.exit()

# Timer for the build starts now (brainstorm time doesn't count against it).
SPEC, PLAN = "docs/spec.md", "docs/plan.md"
START = time.time()
DEADLINE = START + args.minutes * 60
log(f"start build. budget {args.minutes} min. builder: {builder}. "
    f"reviewer: {'codex' if codex_ok else 'claude ' + args.reviewer_model}")

# ======================= 1. PLAN =======================
resuming = bool(re.findall(r"- \[ \] \d+\.", read(PLAN)))
if resuming:
    log("PLAN.md has unfinished tasks -> resuming, skipping planning")
    ans = "go"
else:
  log("planning with " + args.planner)
  claude("Read docs/spec.md and CLAUDE.md. Write docs/plan.md: small, ordered steps to build the "
         "Must features M1 to M7 with an EARLY deployment, then: review tests (at least 3), a GitHub "
         "Actions CI workflow, and the README. Each step is ONE line formatted exactly as "
         "'- [ ] 1. <step> (files: ...; test: ...)'. Aim for 8-14 steps. Step 1 must produce "
         "something runnable. Steps that only a human can do in a web dashboard (importing the repo "
         "into Vercel, creating the free Neon database in Vercel's Storage tab, copying env vars "
         "into a local .env.local) must start with 'MANUAL:' and say exactly what to click. "
         "The LAST step must start with 'DESIGN:' and be a visual polish pass. "
         "Do not write any app code yet.",
         args.planner, max_turns=10)
  if not (ROOT / PLAN).exists():
      sys.exit("Planner didn't create PLAN.md -- see the error above. Stopping.")

  while True:
      ans = checkpoint("PLAN.md:\n" + read(PLAN))
      if ans in ("go", "quit"):
          break
      log(f"replanning: {ans}")
      claude(f"Update docs/plan.md based on this feedback, keeping the same format: {ans}",
             args.planner, max_turns=10)
  commit("plan")
stop = ans == "quit"

DESIGN_PROMPT = ("Read docs/spec.md (especially Look & feel) and the current app. Implement ONLY this "
    "task: {task}. You are a senior product designer who codes. Make the app look distinctive "
    "and polished, not like a generic template: a cohesive color palette (CSS variables), "
    "characterful but readable fonts (Google Fonts is fine), clear visual hierarchy, generous "
    "spacing, consistent rounded corners/shadows, smooth hover/focus states, and one or two "
    "tasteful micro-animations (e.g. results animating in). It must look good on desktop and "
    "mobile widths. Do NOT break or change any functionality. Run the app to confirm it still "
    "works. Do not run git commit. Then tick it off in docs/plan.md by changing "
    "'- [ ] {task}' to '- [x] {task}'.")

def tasks():
    return re.findall(r"- \[ \] (\d+\..*)", read(PLAN))

# ======================= 2-3. BUILD + REVIEW =======================
while not stop and left() > 300:
    todo = tasks()
    if not todo:
        log("all tasks done")
        break
    design = [t for t in todo if "DESIGN:" in t]
    # Running low on time? Jump to the design pass so the demo still looks good.
    jump_at = max(360, min(600, 0.3 * args.minutes * 60))  # 10 min left in a 40-min run
    task = design[0] if (design and left() < jump_at) else todo[0]
    if "MANUAL:" in task:
        log(f"manual step for you: {task}")
        push()  # Vercel/DB setup needs the repo on GitHub
        print("\n" + "#" * 60 + "\nYOUR TURN (do this yourself in the browser):\n" + task +
              "\n" + "#" * 60)
        ans = input("Press Enter when done (or q to stop): ").strip().lower()
        (ROOT / PLAN).write_text(read(PLAN).replace(f"- [ ] {task}", f"- [x] {task}"), encoding="utf-8")
        commit(f"done manual step: {task[:50]}")
        if ans == "q":
            break
        continue
    if "DESIGN:" in task:
        log(f"designing with {args.designer}: {task}")
        claude(DESIGN_PROMPT.replace("{task}", task), args.designer)
    else:
        log(f"building: {task}")
        build(f"Read docs/spec.md, CLAUDE.md and docs/plan.md. Implement ONLY this task: {task}. "
              "Run the app/tests to confirm it works and fix any errors. Once it works, add a test "
              "for it if it is testable, then run ALL tests. Do not run git commit. "
              f"Then tick it off in docs/plan.md by changing '- [ ] {task}' to '- [x] {task}'.")
    commit(f"build: {task[:60]}")
    verdict = review_and_fix()
    push()  # push every finished step: commit history + auto-deploy

    if tasks() and tasks()[0] == task:  # builder never ticked it off -> don't loop forever
        log(f"task didn't complete, skipping: {task}")
        (ROOT / PLAN).write_text(read(PLAN).replace(f"- [ ] {task}", f"- [~] {task}"),
                                      encoding="utf-8")

    while True:  # checkpoint: you look at the app, then decide
        ans = checkpoint(f"Finished: {task}\nLast review:\n{verdict[:800]}\n\n"
                         "Open/run the app now and check it.")
        if ans == "quit":
            stop = True
            break
        if ans == "go":
            break
        log(f"your change: {ans}")
        build(f"Make this change requested by the user: {ans}. Run the app to confirm it "
              "still works. Keep the existing visual design. Never modify docs/spec.md. "
              "Do not run git commit.")
        commit(f"user change: {ans[:50]}")
    if "DESIGN:" in task and tasks():
        log("design pass done -> skipping remaining tasks: " + "; ".join(t[:30] for t in tasks()))
        break

# ======================= 4. WRAP UP =======================
log("writing README")
DEADLINE = time.time() + 240  # give the wrap-up its own few minutes
credits = (f"planned by Claude {args.planner}, designed by Claude {args.designer}, built by "
           f"{'Codex' if builder == 'codex' else 'Claude ' + builder}, "
           f"reviewed by {'Codex' if codex_ok else 'Claude ' + args.reviewer_model}")
build("Write README.md: what the app does, the live Vercel URL if known (else a placeholder), "
      "how to run the app and the tests (exact commands), a checklist of every M, S and Could "
      "feature from docs/spec.md marked done / partly done / not done, and a short "
      f"'Built with' section saying it was built with AI agents: {credits}. "
      "Make sure the run command actually works. Do not run git commit.", max_turns=10)
commit("readme")
push()
log("done. To change things later: python orchestrate.py --edit")
