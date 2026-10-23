window.PV=window.PV||[];window.PV.push(
{
 "id": "oneshot",
 "title": "one-shot path",
 "key": "3",
 "doctrine": {
  "kit_sha": "64b4512",
  "cc_validated": "2.1.309",
  "extracted": "2026-10-23"
 },
 "lanes": [
  {
   "id": "owner",
   "label": "OWNER",
   "sub": "you"
  },
  {
   "id": "master",
   "label": "MASTER",
   "sub": "opus \u00b7 xhigh"
  },
  {
   "id": "sub",
   "label": "SUBAGENTS",
   "sub": "sonnet default"
  },
  {
   "id": "codex",
   "label": "CODEX",
   "sub": "gpt-6.1-sol"
  }
 ],
 "cols": 11,
 "nodes": [
  {
   "id": "req",
   "lane": "owner",
   "col": 0,
   "kind": "input",
   "title": "REQUEST",
   "sub": "small, clear ask",
   "produces": "request",
   "card": {
    "actor": "owner",
    "model": "\u2014",
    "does": "Asks for a small change with a clear scope.",
    "inputs": [],
    "artifacts": [
     "request"
    ],
    "gates": [],
    "options": [],
    "metrics": [],
    "gaps": [],
    "src": []
   }
  },
  {
   "id": "size",
   "lane": "master",
   "col": 1,
   "kind": "decision",
   "title": "SIZE CALL",
   "sub": "one-shot?",
   "produces": "call line",
   "card": {
    "actor": "master",
    "model": "opus \u00b7 xhigh (settings model + modelSettings)",
    "does": "States 'one-shot' or 'pipeline' in one line with the sizing facts, before the first edit. One-shot = clear scope, no product/design or UI choice, nothing irreversible, no plan needed. File count is a fact in the line, not a gate.",
    "inputs": [
     "request",
     "exploration facts"
    ],
    "artifacts": [
     "one call line"
    ],
    "gates": [
     {
      "rule": "State the path call in one line before the first edit; the line carries the sizing facts the call rests on.",
      "evidence": "no 'product edits without a one-shot/pipeline call line' flag in the arc report",
      "enforced_by": "analyze-arcs",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/global/CLAUDE.md",
        "line": 52,
        "quote": "state the call in one line before the first edit, always, including before loading `feature-workflow`"
       },
       {
        "file": "~/Dev/claude-code-setup/skills/analyze-arcs/scripts/analyze.py",
        "line": 611,
        "quote": "product edits without a one-shot/pipeline call line"
       }
      ]
     },
     {
      "rule": "One-shot only for clear scope with no product, design or UI choice, nothing irreversible and no plan needed; file count is a fact in the line, not a gate.",
      "evidence": "the call line names the sizing facts",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/global/CLAUDE.md",
        "line": 54,
        "quote": "file count is a fact in the call line, not a gate"
       },
       {
        "file": "~/Dev/claude-code-setup/global/CLAUDE.md",
        "line": 52,
        "quote": "the line carries the sizing facts the call rests on"
       }
      ]
     }
    ],
    "options": [],
    "metrics": [],
    "gaps": [
     {
      "text": "Report C5: 41d1045b's call line read 'one-shot \u2026 UI built to a given spec, about 8 files \u2026 open picks take the recommended default'; the master then wrote five product files itself. CLAUDE.md:54 excludes UI choices from one-shots and allows inline work only for trivial changes.",
      "kind": "report",
      "src": [
       {
        "file": "~/Dev/pipeline-watch/reports/2026-10-19.md",
        "line": 55,
        "quote": "The master wrote product code inline."
       },
       {
        "file": "~/Dev/pipeline-watch/reports/2026-10-19.md",
        "line": 55,
        "quote": "CLAUDE.md:54 excludes UI choices from one-shots, and allows inline work only for trivial changes."
       }
      ]
     }
    ],
    "src": [
     {
      "file": "~/Dev/claude-code-setup/global/CLAUDE.md",
      "line": 54,
      "quote": "**One-shot** \u2014 clear scope, **no product/design or UI choice, nothing irreversible, no plan needed**"
     }
    ]
   }
  },
  {
   "id": "ask",
   "lane": "owner",
   "col": 1,
   "kind": "human",
   "title": "ASK: ONE LINE",
   "sub": "path in doubt",
   "produces": "path answer",
   "card": {
    "actor": "owner + master",
    "model": "opus \u00b7 xhigh (settings model + modelSettings)",
    "does": "When one-shot and pipeline both fit, the master asks in one line instead of defaulting to the heavier path. The owner never asks for the pipeline by name.",
    "inputs": [
     "call line in doubt"
    ],
    "artifacts": [
     "path answer"
    ],
    "gates": [
     {
      "rule": "In doubt between the two paths, ask in one line rather than defaulting to the heavier path.",
      "evidence": "the owner's answer to the one-line question",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/global/CLAUDE.md",
        "line": 57,
        "quote": "In doubt between the two, ask in one line rather than defaulting to the heavier path."
       }
      ]
     }
    ],
    "options": [
     "one-shot",
     "pipeline"
    ],
    "metrics": [],
    "gaps": [],
    "src": [
     {
      "file": "~/Dev/claude-code-setup/global/CLAUDE.md",
      "line": 57,
      "quote": "I never ask for the pipeline by name; recognizing which path the work is on is your job."
     }
    ]
   }
  },
  {
   "id": "pipe",
   "lane": "sub",
   "col": 1,
   "kind": "output",
   "title": "PIPELINE",
   "sub": "see view 1",
   "produces": "plan + stages",
   "card": {
    "actor": "master + feature-workflow",
    "model": "opus \u00b7 xhigh (settings model + modelSettings)",
    "does": "Anything that is not a one-shot: loads feature-workflow before the first edit and runs the six stages. Mapped in view 1.",
    "inputs": [
     "call line: pipeline"
    ],
    "artifacts": [
     "plan file",
     "commits"
    ],
    "gates": [],
    "options": [],
    "metrics": [],
    "gaps": [],
    "src": [
     {
      "file": "~/Dev/claude-code-setup/global/CLAUDE.md",
      "line": 55,
      "quote": "Load `feature-workflow` before the first edit."
     }
    ]
   }
  },
  {
   "id": "how",
   "lane": "master",
   "col": 2,
   "kind": "decision",
   "title": "TRIVIAL?",
   "sub": "inline or spawn",
   "produces": "who edits",
   "card": {
    "actor": "master",
    "model": "opus \u00b7 xhigh (settings model + modelSettings)",
    "does": "Trivial work is done inline by the master; anything else goes to one step-executor spawn.",
    "inputs": [
     "call line: one-shot"
    ],
    "artifacts": [
     "inline edit or one spawn"
    ],
    "gates": [
     {
      "rule": "Do it inline if trivial, else one step-executor spawn with acceptance criteria and tests.",
      "evidence": "none",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/global/CLAUDE.md",
        "line": 54,
        "quote": "Do it inline if trivial, else one `step-executor` spawn with acceptance criteria + tests."
       }
      ]
     }
    ],
    "options": [],
    "metrics": [],
    "gaps": [],
    "src": [
     {
      "file": "~/Dev/claude-code-setup/global/CLAUDE.md",
      "line": 54,
      "quote": "no plan mode, no plan-reviewer"
     }
    ]
   }
  },
  {
   "id": "inl",
   "lane": "master",
   "col": 3,
   "kind": "stage",
   "title": "INLINE EDIT",
   "sub": "master, trivial",
   "produces": "commit",
   "card": {
    "actor": "master",
    "model": "opus \u00b7 xhigh (settings model + modelSettings)",
    "does": "The master edits directly. Allowed only on the one-shot path: once a plan file exists or feature-workflow has loaded, every product-file change goes to a subagent.",
    "inputs": [
     "trivial change"
    ],
    "artifacts": [
     "commit"
    ],
    "gates": [
     {
      "rule": "The master writes product code only on the one-shot path; inside a pipeline every product change goes to a subagent.",
      "evidence": "no 'master <tool> on product file inside pipeline' flag in the arc report",
      "enforced_by": "analyze-arcs",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/global/CLAUDE.md",
        "line": 31,
        "quote": "The one-shot path (see Feature workflow) covers standalone small requests only"
       },
       {
        "file": "~/Dev/claude-code-setup/skills/analyze-arcs/scripts/analyze.py",
        "line": 629,
        "quote": "on product file inside pipeline"
       }
      ]
     }
    ],
    "options": [],
    "metrics": [],
    "gaps": [
     {
      "text": "Tech debt (pipeline-gaps arc bundle, items 7 and 10): the analyzer's Bash-write flag still counts writes by other sessions in the same checkout (false flags), and a shell-expanded option ($(\u2026), $VAR) passes its read-only allowlist (a real write goes unflagged).",
      "kind": "tech-debt",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/docs/tech-debt.md",
        "line": 34,
        "quote": "Analyzer blind spots and limits"
       },
       {
        "file": "~/Dev/claude-code-setup/docs/todos/deferred-pipeline-gaps-arc.md",
        "line": 40,
        "quote": "Writes by other sessions in the same checkout stay counted."
       },
       {
        "file": "~/Dev/claude-code-setup/docs/todos/deferred-pipeline-gaps-arc.md",
        "line": 64,
        "quote": "Analyzer: a shell-expanded option passes `cannot_write`"
       }
      ]
     }
    ],
    "src": [
     {
      "file": "~/Dev/claude-code-setup/global/CLAUDE.md",
      "line": 54,
      "quote": "Do it inline if trivial"
     }
    ]
   }
  },
  {
   "id": "exec",
   "lane": "sub",
   "col": 3,
   "kind": "sub",
   "title": "step-executor",
   "sub": "one spawn",
   "produces": "commit + report",
   "card": {
    "actor": "step-executor (unnamed)",
    "model": "sonnet \u00b7 high (pinned; no effort key, saved modelSettings level)",
    "does": "One spawn on the session branch, no worktree, the only writer in flight. Runs the build and the targeted suites its acceptance criteria name, commits, reports.",
    "inputs": [
     "acceptance criteria + tests"
    ],
    "artifacts": [
     "commit",
     "report with test counts"
    ],
    "gates": [
     {
      "rule": "Test evidence is the runner's executed/skipped/failed counts, never only the absence of failures.",
      "evidence": "executed/skipped/failed counts in the report",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
        "line": 21,
        "quote": "is the runner's executed/skipped/failed counts, never just the absence of failures"
       }
      ]
     },
     {
      "rule": "Retired at 200 turns; past ~150 the agent commits WIP: and keeps working.",
      "evidence": "none",
      "enforced_by": "frontmatter",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/agents/step-executor.md",
        "line": 6,
        "quote": "maxTurns: 200"
       },
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
        "line": 60,
        "quote": "`step-executor`/`team-executor` cap at 200 turns, `fixer` at 150, `codex-triage` at 60"
       }
      ]
     },
     {
      "rule": "Spawned unnamed and with a model: pin.",
      "evidence": "no 'named spawn' / 'unpinned spawn' flag in the arc report",
      "enforced_by": "analyze-arcs",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
        "line": 21,
        "quote": "Spawn executors **unnamed**"
       },
       {
        "file": "~/Dev/claude-code-setup/skills/analyze-arcs/scripts/analyze.py",
        "line": 622,
        "quote": "named spawn {s['type']} name={s['name']}"
       },
       {
        "file": "~/Dev/claude-code-setup/skills/analyze-arcs/scripts/analyze.py",
        "line": 618,
        "quote": "unpinned spawn {s['type']}"
       }
      ]
     }
    ],
    "options": [],
    "metrics": [],
    "gaps": [],
    "src": [
     {
      "file": "~/Dev/claude-code-setup/global/CLAUDE.md",
      "line": 54,
      "quote": "else one `step-executor` spawn with acceptance criteria + tests"
     }
    ]
   }
  },
  {
   "id": "launch",
   "lane": "master",
   "col": 4,
   "kind": "stage",
   "title": "LAUNCH CODEX",
   "sub": "background Bash",
   "produces": "--out file",
   "card": {
    "actor": "master",
    "model": "opus \u00b7 xhigh (settings model + modelSettings)",
    "does": "Runs codex-challenge.sh <pre-change-sha>..HEAD --out <scratchpad>/codex-oneshot-round<N>.md as one run_in_background Bash on the one-shot diff.",
    "inputs": [
     "pre-change sha",
     "committed change"
    ],
    "artifacts": [
     "codex-oneshot-round<N>.md path"
    ],
    "gates": [
     {
      "rule": "The run is a run_in_background Bash.",
      "evidence": "no 'codex-challenge run in the foreground' flag in the arc report",
      "enforced_by": "analyze-arcs",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/global/CLAUDE.md",
        "line": 54,
        "quote": "as a `run_in_background` Bash"
       },
       {
        "file": "~/Dev/claude-code-setup/skills/analyze-arcs/scripts/analyze.py",
        "line": 624,
        "quote": "codex-challenge run in the foreground"
       }
      ]
     },
     {
      "rule": "Full output goes to codex-oneshot-round<N>.md under the session scratchpad, never a bare /tmp/codex-*.md.",
      "evidence": "no '--out outside scratchpad/docs/reviews' flag in the arc report",
      "enforced_by": "analyze-arcs",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/global/CLAUDE.md",
        "line": 54,
        "quote": "--out <scratchpad>/codex-oneshot-round<N>.md"
       },
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
        "line": 67,
        "quote": "never a bare `/tmp/codex-*.md`"
       },
       {
        "file": "~/Dev/claude-code-setup/skills/analyze-arcs/scripts/analyze.py",
        "line": 625,
        "quote": "--out outside scratchpad/docs/reviews"
       }
      ]
     },
     {
      "rule": "The range is <pre-change-sha>..HEAD: the one-shot diff, not the whole branch.",
      "evidence": "the verdict header line records the range",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/global/CLAUDE.md",
        "line": 54,
        "quote": "one `codex-challenge.sh <pre-change-sha>..HEAD --out"
       },
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/scripts/codex-challenge.sh",
        "line": 167,
        "quote": "# codex challenge \u2014 range $base..$head"
       }
      ]
     }
    ],
    "options": [],
    "metrics": [],
    "gaps": [
     {
      "text": "Tech debt (codex-challenge arc bundle, item 12): the one-shot path does not say to commit before gating; an uncommitted one-shot collapses <pre-change-sha>..HEAD and the script exits 64 (loud, not silent).",
      "kind": "tech-debt",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/docs/todos/deferred-codex-challenge-arc.md",
        "line": 20,
        "quote": "the one-shot path does not say to commit before gating"
       }
      ]
     }
    ],
    "src": [
     {
      "file": "~/Dev/claude-code-setup/global/CLAUDE.md",
      "line": 54,
      "quote": "**Cross-review still always runs**"
     }
    ]
   }
  },
  {
   "id": "cdx",
   "lane": "codex",
   "col": 5,
   "kind": "codex",
   "title": "ONE-SHOT ROUND",
   "sub": "codex-challenge.sh",
   "produces": "oneshot-round<N>.md",
   "card": {
    "actor": "codex-challenge.sh, one background Bash in the master",
    "model": "gpt-6.1-sol \u00b7 medium (CODEX_REVIEW_MODEL / _EFFORT)",
    "does": "Adversarial cross-model review of the one-shot's diff. The doctrine's one-shot call carries no --pin. Failure paths (exit 124, a quiet exit 0, exit 66) are mapped in view 2.",
    "inputs": [
     "<pre-change-sha>..HEAD"
    ],
    "artifacts": [
     "codex-oneshot-round<N>.md"
    ],
    "gates": [
     {
      "rule": "Each attempt stops at 15 min (gtimeout 900); other failures retry, 3 attempts 300 s apart.",
      "evidence": "the stderr line 'codex-challenge: exit RC after XmYs'",
      "enforced_by": "script",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/scripts/codex-challenge.sh",
        "line": 119,
        "quote": "\"$to\" -k 60 900 \"$codex_bin\" exec"
       },
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/scripts/codex-challenge.sh",
        "line": 115,
        "quote": "for attempt in 1 2 3; do"
       },
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/scripts/codex-challenge.sh",
        "line": 176,
        "quote": "codex-challenge: exit %s after %dm%02ds (%ss)"
       }
      ]
     }
    ],
    "options": [],
    "metrics": [],
    "gaps": [],
    "src": [
     {
      "file": "~/Dev/claude-code-setup/global/CLAUDE.md",
      "line": 54,
      "quote": "one `codex-challenge.sh <pre-change-sha>..HEAD --out <scratchpad>/codex-oneshot-round<N>.md` run on its diff"
     }
    ]
   }
  },
  {
   "id": "tri",
   "lane": "sub",
   "col": 6,
   "kind": "sub",
   "title": "codex-triage",
   "sub": "one spawn on the file",
   "produces": "verdict \u22642k",
   "card": {
    "actor": "codex-triage (fresh)",
    "model": "sonnet \u00b7 medium (frontmatter)",
    "does": "One codex-triage spawn on the round file under the stage-5 rules: verifies each finding against git show <head>:<path>, classes it, gives P0/P1/P2 and a confidence. The master reads only this verdict.",
    "inputs": [
     "codex-oneshot-round<N>.md",
     "range",
     "head sha"
    ],
    "artifacts": [
     "triaged verdict"
    ],
    "gates": [
     {
      "rule": "Each finding is checked against git show <head>:<path> and git diff before it is classed.",
      "evidence": "the triaged verdict lines",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/agents/codex-triage.md",
        "line": 24,
        "quote": "Check each finding against `git show <head>:<path>` and"
       }
      ]
     },
     {
      "rule": "P0 = crash, data loss, security, core-flow regression; P1 = wrong behavior in normal use; P2 = only through unusual input. Test-gap and theoretical carry no priority.",
      "evidence": "verdict lines tagged [P0 conf:x] / [P1 conf:x] / [P2 conf:x], grouped by class",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
        "line": 22,
        "quote": "**P0** = crash, data loss, security, or a regression breaking a core flow"
       },
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
        "line": 22,
        "quote": "test-gap and theoretical carry no priority"
       }
      ]
     },
     {
      "rule": "The master never reads challenge-output files (nor .log / .msg); the triage report is the only channel.",
      "evidence": "none",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
        "line": 67,
        "quote": "The master NEVER reads challenge-output files"
       },
       {
        "file": "~/Dev/claude-code-setup/global/CLAUDE.md",
        "line": 54,
        "quote": "the master never reads the output itself"
       }
      ]
     },
     {
      "rule": "To fit the cap only test-gap / theoretical lines are dropped, and the counts line says so.",
      "evidence": "the counts line, e.g. 'test-gap: 7 (2 dropped)'",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
        "line": 67,
        "quote": "drop only test-gap and theoretical lines and say so inline on the counts line"
       }
      ]
     },
     {
      "rule": "Retired at 60 turns.",
      "evidence": "none",
      "enforced_by": "frontmatter",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/agents/codex-triage.md",
        "line": 7,
        "quote": "maxTurns: 60"
       }
      ]
     }
    ],
    "options": [],
    "metrics": [],
    "gaps": [],
    "src": [
     {
      "file": "~/Dev/claude-code-setup/global/CLAUDE.md",
      "line": 54,
      "quote": "then one `codex-triage` spawn on that file under stage-5 rules"
     }
    ]
   }
  },
  {
   "id": "clean",
   "lane": "master",
   "col": 7,
   "kind": "decision",
   "title": "P0 / P1 ?",
   "sub": "clean = 0 P0/P1",
   "produces": "route",
   "card": {
    "actor": "master",
    "model": "opus \u00b7 xhigh (settings model + modelSettings)",
    "does": "Recomputes the counts from the verdict lines. Each round's P0/P1 go to a fixer and the next round re-challenges the new HEAD until clean: no round cap, and the stage-5 owner check-in at round 5 and every fifth round after it.",
    "inputs": [
     "triaged verdict"
    ],
    "artifacts": [
     "route"
    ],
    "gates": [
     {
      "rule": "Clean = zero P0/P1.",
      "evidence": "a triaged verdict with zero P0/P1 lines, counts recomputed by the master",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
        "line": 22,
        "quote": "**Clean = zero P0/P1.**"
       }
      ]
     },
     {
      "rule": "The master recomputes the per-class counts from the finding lines; a disagreeing first line is reported.",
      "evidence": "the master's recomputed counts",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
        "line": 67,
        "quote": "The master **recomputes the per-class counts from the finding lines** and uses its own numbers"
       }
      ]
     }
    ],
    "options": [],
    "metrics": [
     {
      "name": "sessions that ran a round 3 or later (2311444a is a one-shot session; 051c082e not opened)",
      "value": "2311444a \u00d72",
      "as_of": "2026-10-12",
      "src": [
       {
        "file": "~/Dev/pipeline-watch/reports/2026-10-12.md",
        "line": 104,
        "quote": "| runs past round 2 | \u2014 | 2311444a \u00d72; 051c082e not opened |"
       },
       {
        "file": "~/Dev/pipeline-watch/reports/2026-10-12.md",
        "line": 41,
        "quote": "That is a third one-shot round"
       }
      ]
     },
     {
      "name": "whole-range codex runs in one inline session on a moving HEAD (b1be7002), before the bound",
      "value": "6 runs",
      "as_of": "2026-09-16",
      "src": [
       {
        "file": "~/.claude/projects/-Users-turbokach-Dev-claude-code-setup/memory/ios-app-arc-2026-09-15.md",
        "line": 16,
        "quote": "6 whole-range codex runs on a moving HEAD (--out in /tmp)"
       }
      ]
     }
    ],
    "gaps": [],
    "src": [
     {
      "file": "~/Dev/claude-code-setup/global/CLAUDE.md",
      "line": 54,
      "quote": "under stage-5 rules"
     }
    ]
   }
  },
  {
   "id": "fix",
   "lane": "sub",
   "col": 8,
   "kind": "sub",
   "title": "fixer",
   "sub": "each round's P0/P1",
   "produces": "fix commits",
   "card": {
    "actor": "fixer (fresh per finding set)",
    "model": "sonnet \u00b7 high (pinned); opus when a mechanism survived an earlier round",
    "does": "Briefed with the diff range and one finding set: the defect and the invariant, never the patch. A same-mechanism set goes to one mechanism-fixer.",
    "inputs": [
     "diff range",
     "finding set"
    ],
    "artifacts": [
     "fix commits",
     "red + green runs"
    ],
    "gates": [
     {
      "rule": "Same mechanism: the brief names the invariant to establish and the per-path patches to remove.",
      "evidence": "none",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
        "line": 66,
        "quote": "its spawn prompt names the invariant to establish and the now-redundant per-path patches to remove"
       }
      ]
     },
     {
      "rule": "The mechanism-fixer runs on Opus with a one-line reason stated at the spawn.",
      "evidence": "the arc report's 'fixer pinned opus' flag ends in '\u2014 reason stated'",
      "enforced_by": "analyze-arcs",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
        "line": 66,
        "quote": "The fixer runs on Opus here, with a one-line reason stated at the spawn."
       },
       {
        "file": "~/Dev/claude-code-setup/skills/analyze-arcs/scripts/analyze.py",
        "line": 621,
        "quote": "pinned {s['model']} (doctrine {want})"
       },
       {
        "file": "~/Dev/claude-code-setup/skills/analyze-arcs/scripts/analyze.py",
        "line": 528,
        "quote": "' \u2014 reason stated' if reason else ' \u2014 no reason in prompt'"
       }
      ]
     },
     {
      "rule": "A fix to reported-broken behavior lands with a test seen red before the fix.",
      "evidence": "a red and a green run, each with executed/skipped/failed counts",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/agents/fixer.md",
        "line": 18,
        "quote": "A fix to reported-broken behavior lands with a test that was seen red before the fix"
       }
      ]
     },
     {
      "rule": "Retired at 150 turns.",
      "evidence": "none",
      "enforced_by": "frontmatter",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/agents/fixer.md",
        "line": 6,
        "quote": "maxTurns: 150"
       }
      ]
     }
    ],
    "options": [],
    "metrics": [],
    "gaps": [],
    "src": [
     {
      "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
      "line": 22,
      "quote": "each round's P0/P1 go to fixers"
     }
    ]
   }
  },
  {
   "id": "done",
   "lane": "master",
   "col": 9,
   "kind": "stage",
   "title": "DONE",
   "sub": "cross-review ran",
   "produces": "change counts done",
   "card": {
    "actor": "master",
    "model": "opus \u00b7 xhigh (settings model + modelSettings)",
    "does": "The change counts as done only after the codex run and its triage verdict. A one-shot skips ceremony, never review.",
    "inputs": [
     "clean verdict, or P0/P1 taken out by the owner"
    ],
    "artifacts": [
     "verdict shown"
    ],
    "gates": [
     {
      "rule": "The codex run and its codex-triage verdict come before the change counts as done and before any push; otherwise the master says \"unreviewed, not merging\".",
      "evidence": "the codex-triage verdict for <pre-change-sha>..HEAD, shown",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/global/CLAUDE.md",
        "line": 54,
        "quote": "before the change counts as done (and before any push)"
       },
       {
        "file": "~/Dev/claude-code-setup/global/CLAUDE.md",
        "line": 27,
        "quote": "If it hasn't run, say \"unreviewed, not merging\"."
       }
      ]
     }
    ],
    "options": [],
    "metrics": [],
    "gaps": [],
    "src": [
     {
      "file": "~/Dev/claude-code-setup/global/CLAUDE.md",
      "line": 54,
      "quote": "a one-shot skips ceremony, never review"
     }
    ]
   }
  },
  {
   "id": "push",
   "lane": "owner",
   "col": 10,
   "kind": "human",
   "title": "6 PUSH",
   "sub": "owner approval",
   "produces": "approved push",
   "card": {
    "actor": "owner",
    "model": "\u2014",
    "does": "The master reports the arc complete and names the unpushed-commit count as a reason to push now; the owner decides.",
    "inputs": [
     "clean verdict",
     "unpushed-commit count",
     "deferred P1 names"
    ],
    "artifacts": [
     "push approval"
    ],
    "gates": [
     {
      "rule": "git push, any remote and any branch, only after the owner's explicit approval in the session.",
      "evidence": "the owner's explicit approval in the session",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/global/CLAUDE.md",
        "line": 26,
        "quote": "`git push` \u2014 any remote, any branch \u2014 only after my explicit approval in the session."
       },
       {
        "file": "~/Dev/claude-code-setup/global/CLAUDE.md",
        "line": 26,
        "quote": "name the unpushed-commit count as a reason to push now"
       }
      ]
     },
     {
      "rule": "No push or PR without the codex gate; otherwise the master says \"unreviewed, not merging\".",
      "evidence": "the shown codex-triage verdict",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/global/CLAUDE.md",
        "line": 27,
        "quote": "If it hasn't run, say \"unreviewed, not merging\"."
       }
      ]
     },
     {
      "rule": "A commit after the clean verdict that touches only docs/reviews/, docs/todos/, the TODO index or handoff docs does not reopen the codex gate or a one-shot's review; the push ask shows git diff --stat <reviewed-head>..HEAD.",
      "evidence": "git diff --stat <reviewed-head>..HEAD, shown in the push ask",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/global/CLAUDE.md",
        "line": 27,
        "quote": "A commit after the clean verdict that touches only `docs/reviews/`, `docs/todos/`"
       },
       {
        "file": "~/Dev/claude-code-setup/global/CLAUDE.md",
        "line": 27,
        "quote": "does not reopen this gate or a one-shot's review; the push ask shows `git diff --stat <reviewed-head>..HEAD`"
       }
      ]
     }
    ],
    "options": [
     "push",
     "hold: the work stays local"
    ],
    "metrics": [],
    "gaps": [],
    "src": [
     {
      "file": "~/Dev/claude-code-setup/global/CLAUDE.md",
      "line": 26,
      "quote": "never as an obligation to ask when I've said the work stays local"
     }
    ]
   }
  }
 ],
 "edges": [
  {
   "id": "e_req_size",
   "from": "req",
   "to": "size",
   "exit": "b",
   "enter": "l",
   "kind": "flow"
  },
  {
   "id": "e_size_ask",
   "from": "size",
   "to": "ask",
   "exit": "t",
   "enter": "b",
   "kind": "alt",
   "label": "in doubt"
  },
  {
   "id": "e_size_pipe",
   "from": "size",
   "to": "pipe",
   "exit": "b",
   "enter": "t",
   "kind": "alt",
   "label": "pipeline"
  },
  {
   "id": "e_ask_pipe",
   "from": "ask",
   "to": "pipe",
   "exit": "r",
   "enter": "r",
   "kind": "alt",
   "via": [
    [
     1.5,
     0
    ],
    [
     1.5,
     2
    ]
   ]
  },
  {
   "id": "e_ask_how",
   "from": "ask",
   "to": "how",
   "exit": "r",
   "enter": "t",
   "kind": "flow",
   "label": "one-shot"
  },
  {
   "id": "e_size_how",
   "from": "size",
   "to": "how",
   "exit": "r",
   "enter": "l",
   "kind": "flow"
  },
  {
   "id": "e_how_inl",
   "from": "how",
   "to": "inl",
   "exit": "r",
   "enter": "l",
   "kind": "flow"
  },
  {
   "id": "e_how_exec",
   "from": "how",
   "to": "exec",
   "exit": "b",
   "enter": "l",
   "kind": "flow",
   "label": "else"
  },
  {
   "id": "e_inl_launch",
   "from": "inl",
   "to": "launch",
   "exit": "r",
   "enter": "l",
   "kind": "flow"
  },
  {
   "id": "e_exec_launch",
   "from": "exec",
   "to": "launch",
   "exit": "r",
   "enter": "b",
   "kind": "flow"
  },
  {
   "id": "e_launch_cdx",
   "from": "launch",
   "to": "cdx",
   "exit": "r",
   "enter": "t",
   "kind": "flow",
   "label": "sha..HEAD"
  },
  {
   "id": "e_cdx_tri",
   "from": "cdx",
   "to": "tri",
   "exit": "r",
   "enter": "b",
   "kind": "flow"
  },
  {
   "id": "e_tri_clean",
   "from": "tri",
   "to": "clean",
   "exit": "r",
   "enter": "b",
   "kind": "flow"
  },
  {
   "id": "e_clean_fix",
   "from": "clean",
   "to": "fix",
   "exit": "b",
   "enter": "t",
   "kind": "flow",
   "label": "each round's P0/P1"
  },
  {
   "id": "e_fix_cdx",
   "from": "fix",
   "to": "cdx",
   "exit": "b",
   "enter": "b",
   "kind": "back",
   "via": [
    [
     8,
     3.5
    ],
    [
     5,
     3.5
    ]
   ],
   "label": "re-challenge",
   "bound": "owner check-in at round 5 and every fifth round after it",
   "src": [
    {
     "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
     "line": 22,
     "quote": "When round 5 \u2014 and every fifth round after it \u2014 still has P0/P1 in the loop, ask ONE AskUserQuestion"
    },
    {
     "file": "~/Dev/claude-code-setup/global/CLAUDE.md",
     "line": 54,
     "quote": "then one `codex-triage` spawn on that file under stage-5 rules"
    }
   ]
  },
  {
   "id": "e_clean_done",
   "from": "clean",
   "to": "done",
   "exit": "r",
   "enter": "l",
   "kind": "flow",
   "label": "clean"
  },
  {
   "id": "e_done_push",
   "from": "done",
   "to": "push",
   "exit": "r",
   "enter": "b",
   "kind": "flow"
  }
 ],
 "scenarios": [
  {
   "id": "a",
   "title": "a delegated one-shot, clean on the first round",
   "steps": [
    {
     "edge": "e_req_size",
     "t": 0.0,
     "d": 0.8,
     "packet": "request",
     "log": "owner> asks for a small, clear change"
    },
    {
     "edge": "e_size_how",
     "t": 0.9,
     "d": 0.7,
     "packet": "call line",
     "log": "master: 'one-shot: bug fix, 3 files, no design choice, reversible'"
    },
    {
     "edge": "e_how_exec",
     "t": 1.7,
     "d": 0.7,
     "packet": "not trivial",
     "log": "one step-executor spawn with acceptance criteria + tests"
    },
    {
     "edge": "e_exec_launch",
     "t": 2.6,
     "d": 0.8,
     "packet": "commit",
     "log": "step-executor commits, reports the executed/skipped/failed counts"
    },
    {
     "edge": "e_launch_cdx",
     "t": 3.5,
     "d": 0.9,
     "packet": "sha..HEAD",
     "log": "codex-challenge.sh <pre-change-sha>..HEAD --out <scratchpad>/codex-oneshot-round1.md, background"
    },
    {
     "edge": "e_cdx_tri",
     "t": 4.6,
     "d": 0.8,
     "packet": "round1.md",
     "log": "master ends its turn; codex runs"
    },
    {
     "edge": "e_tri_clean",
     "t": 5.6,
     "d": 0.8,
     "packet": "verdict",
     "log": "codex-triage verdict: zero P0/P1; the master never reads the file"
    },
    {
     "edge": "e_clean_done",
     "t": 6.6,
     "d": 0.8,
     "packet": "clean",
     "log": "master recomputes the counts: clean"
    },
    {
     "edge": "e_done_push",
     "t": 7.6,
     "d": 0.8,
     "packet": "verdict shown",
     "log": "cross-review ran; the verdict is shown before any push"
    }
   ]
  },
  {
   "id": "b",
   "title": "an inline edit, one fix round, then done",
   "steps": [
    {
     "edge": "e_req_size",
     "t": 0.0,
     "d": 0.8,
     "packet": "request",
     "log": "owner> asks for a small change"
    },
    {
     "edge": "e_size_how",
     "t": 0.9,
     "d": 0.7,
     "packet": "call line",
     "log": "master: 'one-shot: one-file fix, reversible'"
    },
    {
     "edge": "e_how_inl",
     "t": 1.7,
     "d": 0.7,
     "packet": "trivial",
     "log": "trivial: the master edits inline and commits"
    },
    {
     "edge": "e_inl_launch",
     "t": 2.6,
     "d": 0.7,
     "packet": "commit",
     "log": "pre-change sha recorded; one background codex run"
    },
    {
     "edge": "e_launch_cdx",
     "t": 3.4,
     "d": 0.8,
     "packet": "sha..HEAD",
     "log": "codex-challenge.sh --out <scratchpad>/codex-oneshot-round1.md"
    },
    {
     "edge": "e_cdx_tri",
     "t": 4.4,
     "d": 0.8,
     "packet": "round1.md",
     "log": "codex runs in the background"
    },
    {
     "edge": "e_tri_clean",
     "t": 5.4,
     "d": 0.8,
     "packet": "verdict",
     "log": "codex-triage: one P1 reachable in normal use"
    },
    {
     "edge": "e_clean_fix",
     "t": 6.4,
     "d": 0.8,
     "packet": "P1 set",
     "log": "round 1: the P1 goes to one fixer, red then green"
    },
    {
     "edge": "e_fix_cdx",
     "t": 7.4,
     "d": 0.9,
     "packet": "fix commit",
     "log": "re-challenge on the new HEAD under its own --out name; the loop runs until clean"
    },
    {
     "edge": "e_cdx_tri",
     "t": 8.5,
     "d": 0.8,
     "packet": "round2.md",
     "log": "codex round 2 completes"
    },
    {
     "edge": "e_tri_clean",
     "t": 9.5,
     "d": 0.8,
     "packet": "verdict",
     "log": "codex-triage verdict for round 2: the P1 is no longer reported, zero P0/P1"
    },
    {
     "edge": "e_clean_done",
     "t": 10.5,
     "d": 0.8,
     "packet": "clean",
     "log": "clean"
    },
    {
     "edge": "e_done_push",
     "t": 11.5,
     "d": 0.8,
     "packet": "verdict shown",
     "log": "verdict shown; push waits for the owner"
    }
   ]
  },
  {
   "id": "c",
   "title": "in doubt: the master asks in one line",
   "steps": [
    {
     "edge": "e_req_size",
     "t": 0.0,
     "d": 0.8,
     "packet": "request",
     "log": "owner> asks for a change that might need a design choice"
    },
    {
     "edge": "e_size_ask",
     "t": 0.9,
     "d": 0.8,
     "packet": "in doubt",
     "log": "master asks in one line: one-shot or pipeline?"
    },
    {
     "edge": "e_ask_how",
     "t": 2.5,
     "d": 0.8,
     "packet": "one-shot",
     "log": "owner> 'one-shot'; the path continues as in scenario a"
    }
   ]
  }
 ],
 "unplaced": [
  {
   "text": "Whether stage 5's fix-or-defer question, its contract gate and its round-5 check-in apply to a one-shot.",
   "reason": "CLAUDE.md says triage runs 'under stage-5 rules' without listing which, and a one-shot never loads the skill that states them. The view maps triage, the fix loop and the push gate only.",
   "src": [
    {
     "file": "~/Dev/claude-code-setup/global/CLAUDE.md",
     "line": 54,
     "quote": "then one `codex-triage` spawn on that file under stage-5 rules"
    },
    {
     "file": "~/Dev/claude-code-setup/docs/todos/deferred-pipeline-gaps-arc.md",
     "line": 23,
     "quote": "One-shot sessions never load the skill."
    }
   ]
  }
 ]
}
);
