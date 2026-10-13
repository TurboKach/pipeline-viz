### pipeline-viz arc close-out — deferred review leftovers

**What.** The findings left open when the arc's review gate closed clean (stage 5 round 2,
`555d6ff..8ebcbdb`, 0 P0/P1). All real P2s from the codex rounds were fixed (`8ebcbdb`,
`611fc8f`). What stays open is below, copied verbatim from the triaged verdicts. The raw codex
outputs are in `docs/reviews/pipeline-viz/{step1,round1,round2}.md`.

**Why.** None of them blocks use. Each is either theoretical, reachable only through a
hand-edited or hostile spec, or a cost/cosmetic issue. They were deferred by the owner's
standing instruction for this arc: "pick all the recommended options".

**Context.**

Spec-review (real, cosmetic):
- [P2 conf:0.4] `spec/*.js` metrics — no metric `src` cites `analyze.py`. Every metric cites
  the 10-12 report or a memory baseline, and `analyze.py` is cited only from gates and gaps
  (plan Step 4: "analyze-arcs definitions (analyze.py), and values from report E").

Codex theoretical (deduped across step-1, round 1 and round 2):
- [conf:0.5] `tools/check.py:193` — citation containment is lexical and reads follow symlinks
  (/dev/zero, FIFO risk). No such links exist; single-user local tool. Rounds: step 1, 1, 2.
- [conf:0.5] `tools/check.py:481` — connectivity validation ignores arrival times, so downstream
  work can start before its input exists. Needs a hand-edited scenario. Rounds: 1, 2.
- [conf:0.5] `viz.js:423` — packet labels are placed without checking other packets, and lint
  has no packet-vs-packet comparison. Rounds: 1, 2.
- [conf:0.5] `tools/check.py:752` — `killpg` in the `finally` block catches only
  ProcessLookupError, so a PermissionError would skip `proc.wait()`. Practically unreachable.
  Round 1 (line at `453af34`).

Observation (not a review finding):
- `tools/test_check.py` takes about 390 s, and `UnhashableIds.test_fuzz_every_field_never_raises`
  is about 345 s of it (CPU-bound fuzzing, reported by the render fixer). A seeded, smaller
  sample would keep the guarantee and cut the suite to under a minute.

**Depends.** Nothing.

**Effort.** One small session for all of it. The metric citations are a spec-only edit, and
each of the rest is a few lines in `check.py` or `viz.js` plus a test.
