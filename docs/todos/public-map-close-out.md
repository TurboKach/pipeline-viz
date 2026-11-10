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

**Depends.** Nothing.

**Effort.** Small: clear `GIT_DIR` and its sibling variables in the environment of every git
call, and pass `--no-replace-objects`; one test each on the temp git repo fixture
(`KitRepo` in `tools/test_check.py`).
