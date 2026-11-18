### Citation line drift inside the ±5 window

**What.** 24 citations pass `validate` but their `line` is not the line the quote starts on at the
stamped kit commit (`1b02006`): `skills/feature-workflow/SKILL.md` 7, `skills/agent-teams/SKILL.md` 5,
`install.sh` 4, `hooks/subagent-no-background.sh` 3, `agents/team-reviewer.md` 2,
`agents/team-merger.md` 2, `agents/plan-reviewer.md` 1. The offsets are 1 to 3 lines.

**Why.** `check_citation` accepts a quote anywhere within ±5 lines of `line`, and `repoint.py` never
touches a citation that passes that test. So a kit edit that moves a quote by 1 to 5 lines leaves the
citation valid for the checker while its page link (`#L<line>`) highlights a neighbouring line. One
inserted line in `global/CLAUDE.md` moved 93 citations this way; those were corrected by hand with
`repoint.locate`.

**Context.** Two parts. (1) Decide per citation whether `line` should be the quote's start line (some
may point at the first line of a wrapped rule on purpose), then move the ones that should. (2) Make the
drift visible: a `validate` note or a `repoint.py` mode that reports a single-hit quote whose start line
differs from `line`.

**Effort.** Small: the locator exists; the per-citation decision is the work.
