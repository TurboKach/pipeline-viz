# pipeline-viz — animated map of the Claude Code pipeline

## Context

The owner wants to see the whole pipeline as a "software factory": stages, actors, inputs, artifacts, decisions and their criteria, gates, metrics. Seeing it makes the pipeline easier to understand and shows where the gaps are. Today the pipeline exists only as prose spread over CLAUDE.md, two skills, 9 agent files, 3 hooks, one script and a settings template.

Owner decisions (2026-10-12): animated HTML in the terminal style of the sample (`/tmp/claude-pipeline-viz/sample.html`). Switchable views so one screen is not overloaded: feature pipeline, one-shot, parallel fan-out, meta loop, model/effort routing. Kept locally, nothing pushed.

Assumption: the feature pipeline's recovery and limit mechanics get a sixth view, "recovery & limits", so the main flow stays readable. That covers the watchdog, maxTurns resume, API-death respawn, context budget / handoff, codex failure paths and the arc split.

Content model borrowed from stagecraft (swamp-club/swamp-extensions, "The Studio"). We take concepts only, no code and no dependency:
- **Stage:** what is done, who does it, and what it must produce.
- **Artifact, evidence, gate:** the gate is the exit rule; the evidence is the fact that proves the gate passed.
- **Transition:** forward or back.
- **Human stop:** has explicit options (approve / send back / abandon).
- **Bounded loop:** every back edge carries its bound.
- **Scenario:** a saved path that the validator checks against the structure.
- **Design-view findings:** become our gap lens.

## Approach

**Repo.** New local git repo `~/Dev/pipeline-viz`, no remote. Setup is done by the master on approval, before step 1, and is no product code:
1. `mkdir` and `git init`.
2. Copy this plan to `docs/prompts/pipeline-viz-plan.md`.
3. Commit the copy. That commit is the feature base sha.

**Files.**
- `index.html`: markup and CSS, terminal look from the sample.
- `viz.js`: the renderer.
- `spec/{feature,recovery,oneshot,fanout,routing,meta}.js`: one view per file. Keys `1`–`6`.
- `tools/check.py`: stdlib only. `check.py validate` runs the checks; `check.py shoot` takes headless Chrome screenshots.
- `README.md`, `.gitignore` (`shots/`, `.gstack/`).

The page opens over `file://` with no server, no network and no build. It uses classic `<script>` tags only, because ES modules and `fetch` are blocked on `file://`.

**Spec format.** Each view file is a fixed one-line JS wrapper around one pure JSON object. `check.py` strips the wrapper and parses it with `json.loads`; it uses no regex field extraction.

```
view:     {id, title, key, draft?, doctrine:{kit_sha, cc_validated, extracted}, lanes:[{id,label,sub}], cols,
           nodes:[node], edges:[edge], scenarios:[scenario], unplaced?:[{text, reason, src[]}]}
node:     {id, lane, col, kind: input|stage|sub|codex|human|decision|output, title, sub, produces, card}
card:     {actor, model, does, inputs[], artifacts[], gates:[gate], options[] (human stops),
           metrics:[{name, value, as_of, src}], gaps:[{text, kind: tech-debt|report|derived, src[]}], src[]}
gate:     {rule, evidence: text | "none", enforced_by: hook|script|frontmatter|harness|analyze-arcs|prose, src[]}
edge:     {id, from, to, exit, enter: l|r|t|b, via?[[col,lane]], kind: flow|back|alt, label?, guard?,
           bound?: text | "none", src?[]}   # bound required on kind=back; src required when bound is text
scenario: {id, title, steps:[{edge, t, d, packet, log}]}
src:      {file, line, quote}       # file: absolute or ~-prefixed path
```

**Facts that doctrine does not state.** `"none"` means doctrine states no evidence or no bound; examples are the ExitPlanMode "keep planning" loop (SKILL.md:20) and the respawn after a second maxTurns cap (SKILL.md:60). `check.py` accepts `"none"` without a src, and overlay G shows it as a derived candidate. An executor never invents a bound.

**Source roots** (`check.py` rejects any other path):
- the kit repo `~/Dev/claude-code-setup`, gitignored local files included;
- `~/Dev/pipeline-watch`;
- `~/.claude`, which includes the memory dir and `local/cc-drift/`.

Memory files are a valid source for owner rules that live only there, for example "codex is skipped on doctrine-only diffs" (`memory/codex-gate-scope-doubt.md`), whatever taste item 4 decides.

`check.py` reads the working tree. `doctrine.kit_sha` records the kit HEAD at extraction and is shown in the header.

**src rules.**
- `src[]` must not be empty on gates, metrics, gaps, or edges with a text bound, except in a view marked `draft: true`. A gate's src cites its rule; `"none"` evidence needs no citation of its own.
- Only the step-1 fixture is a draft; step 2 removes the flag.

**Layout bounds** (both are checked by `check.py`):
- A view has ≤5 lanes, ≤16 cols and ≤4 via points per edge. Via points may sit on half-cell (gutter) positions, so a back edge can run between nodes.
- The node box is a fixed fraction of a grid cell. `viz.js` and `check.py` hold the same constants, each with a comment that names its twin. `check.py` checks in grid units that no edge segment crosses a node box it does not connect.

**Text limits.** Node title ≤18 chars, sub ≤22, card text fields ≤280 chars. The card panel scrolls (`overflow:auto`).

**Renderer** (extends the sample):
- **Layout:** actor lanes, grid placement (lane, col), orthogonal edges from exit/enter sides plus optional via points.
- **Animation:** scenario playback with packets labelled by artifact. Live wires, hot nodes, and human stops that blink while they wait.
- **Panels:** a log panel (last 8 lines) and a card panel (every card field, with sources). The header shows the doctrine sha, the extraction date, the CC version, and the view's `unplaced[]` items when it has any.
- **Controls:** tabs and keys `1`–`6`; `G` gap overlay; `M` metrics overlay; `Space` pause; click a node for its card.
- **Frozen frames:** `?view=&t=&card=&overlay=` renders a deterministic frame for screenshots. Frozen mode also turns off every CSS animation (march, pulse, blink), and a human stop that is waiting is drawn at full stroke. `check.py shoot` passes a fixed `--window-size` and `--virtual-time-budget`.

**Gap lens (overlay G).**
- **Explicit gaps:** `docs/tech-debt.md` lines and pipeline-watch report findings, mapped to nodes.
- **Derived candidates (overlay C, its own toggle):** a gate whose `enforced_by` is `prose`, an evidence of `"none"`, a back-edge bound of `"none"`, a stage with no metric. These are labelled "candidate", never stated as fact.
- **Two styles** (amendment, 2026-10-12). Explicit gaps show as a solid red marker with a count. Candidates show as a quieter dashed amber marker, so the explicit gaps stand out even when most nodes carry candidates. The header shows `gaps N · candidates M`. `overlay=` takes a comma list (`gaps,candidates,metrics`), and the shoot batch covers {plain, gaps, candidates, metrics}.

**Metrics overlay (M).** Each metric has a value, an `as_of` date and its source line. A stage with no metric shows "unmeasured".

**Sources.** Discovery found no drift between the kit and `~/.claude`, including `global/CLAUDE.md` = `~/.claude/CLAUDE.md`, so citations point to kit paths. `docs/decision-flow.md` in the kit already maps the decision flow; step 2 uses it as a cross-check, not as a source.

## Invariants and bounds

- **Citation:** the quote is ≤120 chars and must be found in the cited file within ±5 lines of `line`. The window's lines are joined, and whitespace is collapsed on both sides, so a quote may cross a hard wrap. Outside that window, `check.py` reports the quote as **stale** (error). This catches both invented quotes and later doctrine drift. It does not catch a change of meaning elsewhere in the window; README states that limit.
- **Scenario:**
  - Every step's edge exists in its view.
  - Steps form a connected path: each step starts at one of the view's input nodes or at a node an earlier step reached. A view may have several input nodes; recovery and fan-out do.
  - Cycle = max(t+d) + 2 s, and each scenario stays ≤60 s.
  - An edge may repeat (fix round 2).
- **Grid:** (lane, col) is unique per view, and `check.py` errors on a collision. Every edge endpoint sits on its node's boundary. The layout bounds and text limits are those in Approach.
- **Runtime:** live packets ≤ steps in the active scenario; log ≤8 lines. Nothing grows over time.

## Steps

Every agent brief in this arc (executors, fixers, codex-triage, spec-reviewer) says:
- Work in `/Users/turbokach/Dev/pipeline-viz`. Use `git -C` there, including for `git show <head>:<path>` and `git diff`. The session cwd is the kit repo.
- The source roots are read-only.
- Commit once per step.

**Step 1: renderer and tooling.** `step-executor` (Sonnet).
- **Files:** `index.html`, `viz.js`, `spec/feature.js` (a `draft: true` fixture ported from the sample into the schema), `tools/check.py`, `README.md` (short: open, keys, params, source rule, the citation limit), `.gitignore`.
- **Acceptance:**
  - The page opens over `file://` and loads all six view tags. A missing view file shows a "not built yet" tab and breaks no other view.
  - Every renderer item above works, including frozen frames with CSS animation turned off.
  - `check.py validate` checks the schema, referential integrity, the scenario-path rules, the citation rule with its roots, the layout bounds (including edge-through-node) and the text limits. It prints its findings and exits 0 only with zero errors.
  - `check.py shoot` uses a temp `--user-data-dir`. It renders one URL state, or batch mode (every built view × {plain, gaps, metrics} plus one card per view) into `shots/`.
  - **Evidence:** a validate run on the fixture (exit 0, counts), plus the feature-view PNGs (plain and one card).

**Step 2: feature and recovery content.** `step-executor`, **Opus**. Reason: content judgment that no test checks. The step classifies how each gate is enforced and what evidence proves it, across CLAUDE.md, the skill, the agents, the hooks and the script.
- **Files:** `spec/feature.js` (replaces the fixture and removes `draft`), `spec/recovery.js`.
- **Feature view covers:**
  - The sizing call; discuss; plan mode with explorer and the no-product-read rule; plan-reviewer (≤2 passes).
  - The taste AskUserQuestion (≤4 questions); ExitPlanMode (approve / keep planning); delegated approval with its two branches (CLAUDE.md:29, SKILL.md:20); the plan copy, base sha and task mirror.
  - Step-executor steps, each with a per-step codex round (`--pin`; the last step gets none), codex-triage, and a fixer before any dependent step. The full-suite task runs after the last step and again after the fix loop.
  - Stage 5:
    - the whole range, with spec-reviewer in parallel;
    - triage classes and P0/P1/P2, and the two-round bound;
    - the same-mechanism Opus fixer and the structural-fix AskUserQuestion (SKILL.md:66);
    - the contract-never-changes-in-fix-loop rule and the P0 question;
    - the fix-or-defer question and the tech-debt index line.
  - Stage 6: push gate → PR → merge + deploy → post-deploy verify (SKILL.md:31).
  - Lanes: OWNER, MASTER, SUBAGENTS, CODEX. Scenarios: (a) a happy path with one fix round, (b) two stage-5 rounds and then defer.
- **Recovery view covers:**
  - The watchdog cron, and a quiet agent → read its transcript → salvage.
  - A maxTurns partial result → WIP commit + SendMessage resume → fresh respawn on a second cap (SKILL.md:60, CLAUDE.md:39).
  - An API-error death → ≤2 respawns → park with a push notification (CLAUDE.md:39).
  - Codex failure paths:
    - Stage 5: 124 → relaunch once → split the range.
    - Per-step round: a second 124 skips that round.
    - Exit 0 in under 60 s with no findings → park.
    - Exit 66 → park.
  - Master context: checkpoint at ~400k, handoff at ~500k, 600k limit (SKILL.md:39-40).
  - The arc split at >5 steps or 40+ files, with a device pass between (SKILL.md:17); the handoff / new master.
- **Acceptance:**
  - `check.py validate` exits 0 with zero stale citations.
  - Every gate has rule, evidence (text or `"none"`), `enforced_by` and src. Every human stop lists its options. Every back edge has a bound (text or `"none"`).
  - PNGs of both views, plain and gaps.

**Step 3: one-shot, fan-out and routing content.** `step-executor` (Sonnet).
- **Files:** `spec/oneshot.js`, `spec/fanout.js`, `spec/routing.js`, `TODOS.md` and `docs/todos/arc-replay.md` (the deferred replay arc).
- **One-shot view:**
  - The path: sizing call → inline or one step-executor → background `codex-challenge.sh --out <scratchpad>/codex-oneshot-round<N>.md` → codex-triage under the stage-5 rules (the master never reads the output).
  - A fixer → re-challenge back edge with the two-round bound → done → push gate (CLAUDE.md:54).
- **Fan-out view:**
  - The stage-4 pair path. Its `Parallel:` criteria are ≤2 writers, no shared or hub file, no consumed output, ≥15 min each, and no exclusive runtime. Its costs are a cold worktree build, `.worktreeinclude` and one merge (SKILL.md:19).
  - Two team-executors in worktrees (`baseRef: head`) → team-merger → a round on the merged range. A stopped-short unit is landed as WIP and finished by a step-executor; a conflict or a red build goes to a fixer.
  - The fixer-pair rule (SKILL.md:65), and the "ask whether to fan out" stop outside a pipeline (SKILL.md:53).
  - The agent-teams flow: the fan-out decision, the mechanism picker (subagents vs Workflows), the plan-only ExitPlanMode gate (agent-teams SKILL.md:156-166), N team-executors, team-reviewer (Opus), team-merger, and the codex gate.
- **Routing view:**
  - A spawn's model path (CLAUDE.md:39):
    1. The master's explicit pin per role: `sonnet` for executors, fixers, codex-triage and general-purpose; `opus` for team-reviewer, for an executor the plan marks Opus with a reason, and for a fixer on a mechanism that survived an earlier round; no pin for plan-reviewer, which inherits the session's model; never `fable`.
    2. The agent-definition `model:`.
    3. The `CLAUDE_CODE_SUBAGENT_MODEL` floor. `_FORCE` stays unset because it would flatten every pin.
  - Effort: frontmatter `effort`, or the `modelSettings` saved level of the running model. The master runs on Opus at xhigh. Codebase search goes to explorer, not the built-in Explore.
  - The codex runner: `CODEX_REVIEW_MODEL` / `CODEX_REVIEW_EFFORT` (`settings.example.json:6-7`).
  - One node per agent (9). Each card shows model, effort and maxTurns; an absent key is shown as absent and cited to the frontmatter.
  - Scenarios: a default executor, an Opus-marked executor, and plan-reviewer.
- **Acceptance:** the same as step 2.

**Step 4: meta loop, metrics and gap mapping.** `step-executor`, **Opus**. Reason: it maps 18 tech-debt lines and the report findings onto the right nodes across all views, and judges which metric measures which stage. No test checks that mapping.
- **Files:** `spec/meta.js`, plus the `metrics` and `gaps` fields only in the other five view files.
- **Meta view:**
  - launchd daily fetch (08:30, 13 sources) → `pending/` → weekly report (Mon 07:00, `claude -p` Opus xhigh) → SessionStart notices → the owner reads the report → an improve ask.
  - The improve ask, step by step:
    1. analyze-arcs, including the version-vs-stamp check.
    2. The line test (kit `.claude/rules/doctrine-style.md:6`) and the provenance pass (memory `pipeline-review-line-test.md`).
    3. A doctrine commit.
    4. The codex gate: skipped on doctrine-only diffs; in mixed ranges its doctrine findings are report-only (memory `codex-gate-scope-doubt.md`).
    5. Push approval.
    6. stack-update / install.sh.
    7. The doctrine stamp at `docs/references.md:6`.
  - The version-drift SessionStart notice comes from `~/.claude/local/cc-drift/drift.sh:22`. It is registered in the kit's gitignored `.claude/settings.local.json`, not in `~/.claude/settings.json`.
- **Metrics:** analyze-arcs definitions (`analyze.py`), and values from `pipeline-watch/reports/2026-10-12.md` section E (lines 95-107).
- **Gaps:**
  - Each of the 18 `docs/tech-debt.md` lines.
  - Report findings A1, C1–C3 and C5. C4 is an observation with no proposal: put it as a `metrics` row (value, `as_of`, src) on its node. From C6 (a "held" list), only "review escapes not examined" is a gap.
- **Acceptance:**
  - `check.py validate` exits 0.
  - Every tech-debt line and every mapped report finding sits on at least one node, or in `meta.js` `unplaced[]` with the reason. The meta view header shows the unplaced items.
  - PNGs of every view with overlay G and with overlay M.

**Step 5: render pass, then the final full run.** `step-executor` (Sonnet).
- **Files:** the six `spec/*.js` files, coordinates and labels only.
- Run `check.py shoot` in batch mode, inspect every PNG, fix the layout, then run `check.py validate`.
- A render bug in `viz.js` or `index.html` goes to one `fixer`, not to this step. The master then runs `check.py shoot` again, and step 5's task completes only after that run is clean.
- **Acceptance:**
  - `check.py validate` exits 0. Its edge-through-node, collision and text-limit checks are the measurable layout rule.
  - Every batch PNG shows no overlapping nodes and no clipped labels.
  - **Evidence:** validator counts and the PNG list.
- After the stage-5 fix loop, the master runs `check.py validate` and `check.py shoot` once more, in the background, as the post-fix full run.

**Final verification:** the master, via `/browse`, on the real page.
- First `cd ~/Dev/pipeline-viz` in the same Bash as the first `$B` call. The browse daemon only opens `file://` paths under its own cwd or /tmp, and its `.gstack/` folder is gitignored.
- Open `index.html`; press `1`–`6`, `G` and `M`; click one node per view; screenshot each state.
- Then show the PNGs and `open` the page for the owner.

`Parallel: none` — team-executor worktrees branch from this session's repo (claude-code-setup), not from `~/Dev/pipeline-viz`.

## Review

- **Per-step:** one round after step 1 only. Its range is `<base>..<step-1 head>`, `--pin`, run from `~/Dev/pipeline-viz`. P0/P1 go to a fixer before step 2.
- **Stage 5:** one `codex-challenge.sh <base>..HEAD` run from `~/Dev/pipeline-viz`, with spec-reviewer against this plan in parallel. Codex findings on doctrine interpretation are report-only (codex has no authority on doctrine). Renderer and validator findings go through the normal two-round loop.
- No ship stage: the repo has no remote. The owner's look at the page is the end of the arc.

## Edge cases

- A missing view file → that tab is disabled, and the other views still work.
- Parallel packets (codex ∥ spec-reviewer) and repeated edges in one scenario.
- A frozen `t` past the cycle wraps modulo the cycle.
- A cited file is deleted → validator error. A quote that appears several times passes if one copy is inside the window.
- The doctrine changes later → the validator flags stale citations, and the header shows which sha the map describes.

## Decisions (owner, 2026-10-12)

1. **Codex depth:** one per-step round after step 1 (`--pin`), then stage 5. Steps 2–4 get no per-step round.
2. **Real-arc replay** (stagecraft's Board and Work-item views): a later arc of its own. Step 3 adds one line to `TODOS.md` with its context in `docs/todos/arc-replay.md`.
3. **Gap lens:** explicit gaps plus derived candidates.
4. **Metric values:** the 10-12 report and analyze-arcs definitions, plus dated memory baselines.
