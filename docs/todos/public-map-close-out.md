### public-map arc close-out — deferred review leftovers

**What.** The findings left open when the arc's review gate closed (whole range
`93be9ed..543ba76`, 0 P0/P1). Every real P2 from the codex rounds was fixed (`543ba76`,
`a8132f4`). What stays open is below, copied verbatim from the triaged verdicts.

**Why.** Neither blocks use. Both are theoretical: each needs an odd or deliberately tampered
environment around the kit clone that `check.py` reads. The owner deferred them at the
fix-or-defer question.

**Context.**

- `[conf:0.3] tools/check.py:184` — An inherited `GIT_DIR` env var overrides `git -C`. A `--kit`
  pointing at a subdirectory still resolves paths from the repository root. This needs a hostile
  or odd environment.
- `[conf:0.2] tools/check.py:263` — git replace refs (`refs/replace`) can swap the stamped kit
  commit or blob, so `check.py` and `repoint.py` read different files than the GitHub link opens.
  This needs a deliberately tampered kit repo.

Both sit in the git reader that step 4 of the arc added: `check.py` runs `git -C <kit> …` and
reads `git cat-file blob <kit_sha>:<file>`.

Arc 2 (whole range `a6d9a60..6083dcc`, 0 P0/P1 after 3 rounds) left one more, deferred by the
owner at its fix-or-defer question:

- `[P2 conf:0.3] tools/check.py:1359` — `drift_report` resolves the kit HEAD separately in
  `rev-parse`, `merge-base --is-ancestor`, `rev-list` and `log`. A kit checkout to an ancestor
  between the ancestry check and the count makes the count 0, so `drift` exits 0 and skips the
  not-an-ancestor error. This needs a concurrent kit checkout inside a sub-second run.

**Depends.** Nothing.

**Effort.** Small: clear `GIT_DIR` and its sibling variables in the environment of every git
call, and pass `--no-replace-objects`; in `drift_report`, resolve HEAD to a full sha once and
pass that sha to every later call; one test each on the temp git repo fixture
(`KitRepo` in `tools/test_check.py`).
