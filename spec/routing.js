window.PV=window.PV||[];window.PV.push(
{
 "id": "routing",
 "title": "model / effort routing",
 "key": "5",
 "doctrine": {
  "kit_sha": "64b4512",
  "cc_validated": "2.1.309",
  "extracted": "2026-10-23"
 },
 "lanes": [
  {
   "id": "master",
   "label": "MASTER",
   "sub": "pins at spawn"
  },
  {
   "id": "agents",
   "label": "AGENT FILES",
   "sub": "frontmatter"
  },
  {
   "id": "runs",
   "label": "RUNS AS",
   "sub": "model \u00b7 effort"
  },
  {
   "id": "settings",
   "label": "SETTINGS",
   "sub": "settings.json"
  }
 ],
 "cols": 11,
 "nodes": [
  {
   "id": "spawn",
   "lane": "master",
   "col": 0,
   "kind": "input",
   "title": "SPAWN",
   "sub": "one Agent call",
   "produces": "role + pin",
   "card": {
    "actor": "master",
    "model": "opus \u00b7 xhigh (settings model + modelSettings)",
    "does": "Every delegation is an Agent call. The model comes from, in order: 1 the master's explicit pin per role, 2 the agent definition's model:, 3 the CLAUDE_CODE_SUBAGENT_MODEL floor. Spawns are unnamed.",
    "inputs": [],
    "artifacts": [
     "subagent_type",
     "model: pin or none"
    ],
    "gates": [],
    "options": [],
    "metrics": [],
    "gaps": [],
    "src": [
     {
      "file": "~/Dev/claude-code-setup/global/CLAUDE.md",
      "line": 39,
      "quote": "An explicit pin and an agent definition's `model:` both take precedence over `CLAUDE_CODE_SUBAGENT_MODEL`"
     }
    ]
   }
  },
  {
   "id": "pin",
   "lane": "master",
   "col": 5,
   "kind": "decision",
   "title": "1 EXPLICIT PIN",
   "sub": "model: per role",
   "produces": "model: pin",
   "card": {
    "actor": "master",
    "model": "opus \u00b7 xhigh (settings model + modelSettings)",
    "does": "Step 1 of the model path. sonnet for executors, fixers, codex-triage and general-purpose; opus for team-reviewer, and for an executor or a fixer only with a stated reason; no pin for plan-reviewer; never fable. Codebase search goes to explorer, not the built-in Explore.",
    "inputs": [
     "subagent_type",
     "the plan's Opus marks"
    ],
    "artifacts": [
     "model: pin or none"
    ],
    "gates": [
     {
      "rule": "Spawns pin model: per role: sonnet for executors, fixers, codex-triage and general-purpose; opus for team-reviewer.",
      "evidence": "no 'unpinned spawn' or 'pinned X (doctrine Y)' flag in the arc report",
      "enforced_by": "analyze-arcs",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/global/CLAUDE.md",
        "line": 39,
        "quote": "`sonnet` for executors, fixers, `codex-triage` and `general-purpose`"
       },
       {
        "file": "~/Dev/claude-code-setup/skills/analyze-arcs/scripts/analyze.py",
        "line": 12,
        "quote": "'step-executor': 'sonnet', 'team-executor': 'sonnet', 'fixer': 'sonnet'"
       },
       {
        "file": "~/Dev/claude-code-setup/skills/analyze-arcs/scripts/analyze.py",
        "line": 618,
        "quote": "unpinned spawn {s['type']}"
       }
      ]
     },
     {
      "rule": "Spawned with no model: so it inherits the session model.",
      "evidence": "no 'plan-reviewer pinned \u2026 (doctrine: inherit)' flag in the arc report",
      "enforced_by": "analyze-arcs",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
        "line": 20,
        "quote": "spawn `plan-reviewer` (no `model:` \u2014 it inherits the session's model; read-only, one pass)"
       },
       {
        "file": "~/Dev/claude-code-setup/skills/analyze-arcs/scripts/analyze.py",
        "line": 617,
        "quote": "pinned {s['model']} (doctrine: inherit)"
       }
      ]
     },
     {
      "rule": "Opus only for team-reviewer; for an executor when the plan marks the step Opus with a reason; for a fixer when a finding's mechanism survived an earlier fix round, with the reason stated at the spawn.",
      "evidence": "the arc report's 'fixer pinned opus' flag ends in '\u2014 reason stated'",
      "enforced_by": "analyze-arcs",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/global/CLAUDE.md",
        "line": 39,
        "quote": "`opus` for team-reviewer, for an executor only when the plan marks that step Opus with a reason"
       },
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
      "rule": "Never pin fable.",
      "evidence": "none",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/global/CLAUDE.md",
        "line": 39,
        "quote": "**never pin `fable`.**"
       }
      ]
     },
     {
      "rule": "Codebase search goes to the kit's explorer agent, not the built-in Explore (which runs on the session's model capped at Opus).",
      "evidence": "none",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/global/CLAUDE.md",
        "line": 39,
        "quote": "codebase search \u2192 the kit's `explorer` agent (sonnet, medium, read-only)"
       }
      ]
     }
    ],
    "options": [],
    "metrics": [
     {
      "name": "off-tier Opus pins flagged 'no reason' in the window; the one flag's reason held",
      "value": "1, reason held",
      "as_of": "2026-10-12",
      "src": [
       {
        "file": "~/Dev/pipeline-watch/reports/2026-10-12.md",
        "line": 80,
        "quote": "the one \"no reason\" flag does state a reason in the doctrine's category"
       }
      ]
     }
    ],
    "gaps": [
     {
      "text": "Tech debt (Opus-executors arc bundle, item 2): analyze-arcs' pins_for compares the session start with the date 2026-09-23, so sessions that began earlier that day are judged by the new pins.",
      "kind": "tech-debt",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/docs/tech-debt.md",
        "line": 31,
        "quote": "analyze-arcs same-day pin cutover"
       },
       {
        "file": "~/Dev/claude-code-setup/docs/todos/deferred-opus-executors-arc.md",
        "line": 9,
        "quote": "pins_for compares the session start against the date '2026-09-23'"
       }
      ]
     }
    ],
    "src": [
     {
      "file": "~/Dev/claude-code-setup/global/CLAUDE.md",
      "line": 39,
      "quote": "**Spawns pin `model:`**"
     }
    ]
   }
  },
  {
   "id": "stepex",
   "lane": "agents",
   "col": 1,
   "kind": "sub",
   "title": "step-executor",
   "sub": "sequential step",
   "produces": "commit + report",
   "card": {
    "actor": "step-executor",
    "model": "sonnet (file :5) \u00b7 effort ABSENT, runs at the saved modelSettings level (high) \u00b7 maxTurns 200 (file :6)",
    "does": "One sequential step on the session branch, no worktree.",
    "inputs": [
     "plan step"
    ],
    "artifacts": [
     "commit",
     "report"
    ],
    "gates": [
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
    "metrics": [
     {
      "name": "Sonnet 5.5 at high, first 8 step-executor runs: median turns (Opus 5.5 medium baseline: 24)",
      "value": "22.5 turns",
      "as_of": "2026-09-29",
      "src": [
       {
        "file": "~/.claude/projects/-Users-turbokach-Dev-claude-code-setup/memory/sonnet-5-5-review.md",
        "line": 46,
        "quote": "median 22.5 turns;"
       }
      ]
     },
     {
      "name": "share of spend, 172 sessions since 09-29 (input + cache, output excluded)",
      "value": "13%",
      "as_of": "2026-10-08",
      "src": [
       {
        "file": "~/.claude/projects/-Users-turbokach-Dev-claude-code-setup/memory/haiku-5-5-review.md",
        "line": 26,
        "quote": "step-executor 13%"
       }
      ]
     }
    ],
    "gaps": [],
    "src": [
     {
      "file": "~/Dev/claude-code-setup/agents/step-executor.md",
      "line": 5,
      "quote": "model: sonnet maxTurns: 200"
     },
     {
      "file": "~/Dev/claude-code-setup/agents/step-executor.md",
      "line": 4,
      "quote": "tools: Read, Write, Edit, Bash, Glob, Grep"
     }
    ]
   }
  },
  {
   "id": "teamex",
   "lane": "agents",
   "col": 2,
   "kind": "sub",
   "title": "team-executor",
   "sub": "parallel unit",
   "produces": "unit commits",
   "card": {
    "actor": "team-executor",
    "model": "sonnet (file :5) \u00b7 effort ABSENT, runs at the saved modelSettings level (high) \u00b7 maxTurns 200 (:6) \u00b7 background: true (:7) \u00b7 isolation: worktree (:8)",
    "does": "One independent unit in its own worktree; spawns in a stage-4 pair or an agent-teams run.",
    "inputs": [
     "unit scope"
    ],
    "artifacts": [
     "commits in a worktree"
    ],
    "gates": [
     {
      "rule": "isolation: worktree and background: true sit in the agent's own frontmatter.",
      "evidence": "none",
      "enforced_by": "frontmatter",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/agents/team-executor.md",
        "line": 8,
        "quote": "isolation: worktree"
       },
       {
        "file": "~/Dev/claude-code-setup/agents/team-executor.md",
        "line": 7,
        "quote": "background: true"
       }
      ]
     },
     {
      "rule": "Retired at 200 turns; past ~150 the agent commits WIP: and keeps working.",
      "evidence": "none",
      "enforced_by": "frontmatter",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/agents/team-executor.md",
        "line": 6,
        "quote": "maxTurns: 200"
       },
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
        "line": 60,
        "quote": "`step-executor`/`team-executor` cap at 200 turns"
       }
      ]
     }
    ],
    "options": [],
    "metrics": [],
    "gaps": [],
    "src": [
     {
      "file": "~/Dev/claude-code-setup/agents/team-executor.md",
      "line": 5,
      "quote": "model: sonnet maxTurns: 200 background: true isolation: worktree"
     }
    ]
   }
  },
  {
   "id": "fixer",
   "lane": "agents",
   "col": 3,
   "kind": "sub",
   "title": "fixer",
   "sub": "one finding set",
   "produces": "fix commits",
   "card": {
    "actor": "fixer",
    "model": "sonnet (file :5) \u00b7 effort ABSENT, runs at the saved modelSettings level (high) \u00b7 maxTurns 150 (file :6)",
    "does": "One finding set per spawn on the session branch; Opus only for a mechanism that survived a round.",
    "inputs": [
     "finding set"
    ],
    "artifacts": [
     "fix commits"
    ],
    "gates": [
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
     }
    ],
    "options": [],
    "metrics": [
     {
      "name": "Opus 5.5 fixer at high vs medium (22 vs 16 arcs): median rounds 2 and P1 0.4/round in both, cost +20% per run",
      "value": "no gain, +20%",
      "as_of": "2026-09-29",
      "src": [
       {
        "file": "~/.claude/projects/-Users-turbokach-Dev-claude-code-setup/memory/fixer-high-effort-trial.md",
        "line": 36,
        "quote": "22 high-effort arcs vs 16 medium arcs"
       },
       {
        "file": "~/.claude/projects/-Users-turbokach-Dev-claude-code-setup/memory/fixer-high-effort-trial.md",
        "line": 40,
        "quote": "fixer cost: +20% per run;"
       }
      ]
     },
     {
      "name": "share of spend, 172 sessions since 09-29 (input + cache, output excluded)",
      "value": "3%",
      "as_of": "2026-10-08",
      "src": [
       {
        "file": "~/.claude/projects/-Users-turbokach-Dev-claude-code-setup/memory/haiku-5-5-review.md",
        "line": 26,
        "quote": "fixer 3%"
       }
      ]
     }
    ],
    "gaps": [
     {
      "text": "Report C4: four Opus fixers did branch merges and gave 'a data-loss class' as the reason, which is the executor criterion; the fixer pin needs a mechanism that survived a fix round. One ran 410 turns and 53 min before it capped. No agent owns cross-feature merges.",
      "kind": "report",
      "src": [
       {
        "file": "~/Dev/pipeline-watch/reports/2026-10-19.md",
        "line": 51,
        "quote": "Four Opus fixers did branch merges and gave the reason \"a data-loss class\""
       },
       {
        "file": "~/Dev/pipeline-watch/reports/2026-10-19.md",
        "line": 51,
        "quote": "No agent owns cross-feature merges."
       }
      ]
     }
    ],
    "src": [
     {
      "file": "~/Dev/claude-code-setup/agents/fixer.md",
      "line": 5,
      "quote": "model: sonnet maxTurns: 150"
     }
    ]
   }
  },
  {
   "id": "explorer",
   "lane": "agents",
   "col": 4,
   "kind": "sub",
   "title": "explorer",
   "sub": "read-only search",
   "produces": "summary",
   "card": {
    "actor": "explorer",
    "model": "sonnet (file :5) \u00b7 effort medium (file :6) \u00b7 maxTurns 60 (file :7)",
    "does": "Codebase search, pinned to Sonnet at medium regardless of the session effort.",
    "inputs": [
     "question + breadth"
    ],
    "artifacts": [
     "summary with file:line"
    ],
    "gates": [
     {
      "rule": "Pinned to Sonnet at medium and capped at 60 turns by its own frontmatter, whatever the session runs at.",
      "evidence": "none",
      "enforced_by": "frontmatter",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/agents/explorer.md",
        "line": 5,
        "quote": "model: sonnet effort: medium maxTurns: 60"
       }
      ]
     }
    ],
    "options": [],
    "metrics": [
     {
      "name": "share of spend, 172 sessions since 09-29 (input + cache, output excluded)",
      "value": "2.7%",
      "as_of": "2026-10-08",
      "src": [
       {
        "file": "~/.claude/projects/-Users-turbokach-Dev-claude-code-setup/memory/haiku-5-5-review.md",
        "line": 26,
        "quote": "explorer 2.7%"
       }
      ]
     }
    ],
    "gaps": [],
    "src": [
     {
      "file": "~/Dev/claude-code-setup/agents/explorer.md",
      "line": 4,
      "quote": "tools: Read, Glob, Grep, Bash"
     }
    ]
   }
  },
  {
   "id": "triage",
   "lane": "agents",
   "col": 5,
   "kind": "sub",
   "title": "codex-triage",
   "sub": "one round",
   "produces": "verdict \u22642k",
   "card": {
    "actor": "codex-triage",
    "model": "sonnet (file :5) \u00b7 effort medium (file :6) \u00b7 maxTurns 60 (file :7)",
    "does": "Triages one codex round; fresh per round.",
    "inputs": [
     "round file"
    ],
    "artifacts": [
     "triaged verdict"
    ],
    "gates": [
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
    "metrics": [
     {
      "name": "Haiku 5.5 codex-triage replay, 30 rounds: real must-fix misses; 67 must-fix lines vs Sonnet's 42; no role given",
      "value": "3 real misses",
      "as_of": "2026-10-08",
      "src": [
       {
        "file": "~/.claude/projects/-Users-turbokach-Dev-claude-code-setup/memory/haiku-5-5-review.md",
        "line": 30,
        "quote": "H missed 3 real must-fix findings out of 21 rows where both Sonnet runs agreed."
       }
      ]
     },
     {
      "name": "share of spend, 172 sessions since 09-29 (input + cache, output excluded)",
      "value": "1.8%",
      "as_of": "2026-10-08",
      "src": [
       {
        "file": "~/.claude/projects/-Users-turbokach-Dev-claude-code-setup/memory/haiku-5-5-review.md",
        "line": 26,
        "quote": "codex-triage 1.8%"
       }
      ]
     }
    ],
    "gaps": [],
    "src": [
     {
      "file": "~/Dev/claude-code-setup/agents/codex-triage.md",
      "line": 5,
      "quote": "model: sonnet effort: medium maxTurns: 60"
     }
    ]
   }
  },
  {
   "id": "spec",
   "lane": "agents",
   "col": 6,
   "kind": "sub",
   "title": "spec-reviewer",
   "sub": "plan vs diff",
   "produces": "gap list",
   "card": {
    "actor": "spec-reviewer",
    "model": "sonnet (file :5) \u00b7 effort medium (file :6) \u00b7 maxTurns 60 (file :7)",
    "does": "Checks the whole range against the approved plan; read-only, gaps only.",
    "inputs": [
     "plan file",
     "diff range"
    ],
    "artifacts": [
     "gap list"
    ],
    "gates": [
     {
      "rule": "Pinned to Sonnet at medium and capped at 60 turns by its own frontmatter.",
      "evidence": "none",
      "enforced_by": "frontmatter",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/agents/spec-reviewer.md",
        "line": 5,
        "quote": "model: sonnet effort: medium maxTurns: 60"
       }
      ]
     }
    ],
    "options": [],
    "metrics": [
     {
      "name": "share of spend, 172 sessions since 09-29 (input + cache, output excluded)",
      "value": "0.7%",
      "as_of": "2026-10-08",
      "src": [
       {
        "file": "~/.claude/projects/-Users-turbokach-Dev-claude-code-setup/memory/haiku-5-5-review.md",
        "line": 26,
        "quote": "spec-reviewer 0.7%"
       }
      ]
     }
    ],
    "gaps": [],
    "src": [
     {
      "file": "~/Dev/claude-code-setup/agents/spec-reviewer.md",
      "line": 4,
      "quote": "tools: Read, Glob, Grep, Bash"
     }
    ]
   }
  },
  {
   "id": "merger",
   "lane": "agents",
   "col": 7,
   "kind": "sub",
   "title": "team-merger",
   "sub": "lands branches",
   "produces": "merge commits",
   "card": {
    "actor": "team-merger",
    "model": "sonnet (file :5) \u00b7 effort medium (file :6) \u00b7 maxTurns ABSENT (frontmatter ends at :7)",
    "does": "Merges named worktree branches, runs the named build and suites, removes each worktree.",
    "inputs": [
     "branch names"
    ],
    "artifacts": [
     "merge commits"
    ],
    "gates": [
     {
      "rule": "Merges only the units its prompt names; never one a reviewer rejected.",
      "evidence": "per-unit merge commit SHA and \"landed\" / \"blocked: <reason>\"",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/agents/team-merger.md",
        "line": 42,
        "quote": "Never merge a unit your prompt doesn't name"
       },
       {
        "file": "~/Dev/claude-code-setup/agents/team-merger.md",
        "line": 39,
        "quote": "per unit: the merge commit SHA and \"landed\""
       }
      ]
     }
    ],
    "options": [],
    "metrics": [],
    "gaps": [
     {
      "text": "Derived: global CLAUDE.md:39 names no spawn pin for team-merger (agent-teams lists it as sonnet), and analyze.py's PINS has no team-merger entry, so :435 flags any merger spawned without model: as an unpinned spawn with no doctrine tier behind it.",
      "kind": "derived",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/global/CLAUDE.md",
        "line": 39,
        "quote": "`sonnet` for executors, fixers, `codex-triage` and `general-purpose`"
       },
       {
        "file": "~/Dev/claude-code-setup/skills/agent-teams/SKILL.md",
        "line": 137,
        "quote": "4. MERGE (subagent: team-merger, sonnet)"
       },
       {
        "file": "~/Dev/claude-code-setup/skills/analyze-arcs/scripts/analyze.py",
        "line": 13,
        "quote": "'codex-triage': 'sonnet', 'spec-reviewer': 'sonnet', 'explorer': 'sonnet', 'general-purpose': 'sonnet'}"
       },
       {
        "file": "~/Dev/claude-code-setup/skills/analyze-arcs/scripts/analyze.py",
        "line": 618,
        "quote": "unpinned spawn {s['type']}"
       }
      ]
     }
    ],
    "src": [
     {
      "file": "~/Dev/claude-code-setup/agents/team-merger.md",
      "line": 6,
      "quote": "model: sonnet effort: medium ---"
     }
    ]
   }
  },
  {
   "id": "trev",
   "lane": "agents",
   "col": 8,
   "kind": "sub",
   "title": "team-reviewer",
   "sub": "opus, read-only",
   "produces": "unit verdicts",
   "card": {
    "actor": "team-reviewer",
    "model": "opus (file :5) \u00b7 effort medium (file :6) \u00b7 maxTurns ABSENT (frontmatter ends at :7)",
    "does": "Adversarial review of each unit diff before it merges; agent-teams only.",
    "inputs": [
     "unit diffs"
    ],
    "artifacts": [
     "per-unit verdicts"
    ],
    "gates": [
     {
      "rule": "Spawned with model: opus.",
      "evidence": "no 'team-reviewer pinned \u2026 (doctrine opus)' or 'unpinned spawn' flag in the arc report",
      "enforced_by": "analyze-arcs",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/global/CLAUDE.md",
        "line": 39,
        "quote": "`opus` for team-reviewer"
       },
       {
        "file": "~/Dev/claude-code-setup/skills/analyze-arcs/scripts/analyze.py",
        "line": 11,
        "quote": "'team-reviewer': 'opus'"
       }
      ]
     }
    ],
    "options": [],
    "metrics": [],
    "gaps": [],
    "src": [
     {
      "file": "~/Dev/claude-code-setup/agents/team-reviewer.md",
      "line": 6,
      "quote": "model: opus effort: medium ---"
     }
    ]
   }
  },
  {
   "id": "plan",
   "lane": "agents",
   "col": 9,
   "kind": "sub",
   "title": "plan-reviewer",
   "sub": "inherits session",
   "produces": "findings",
   "card": {
    "actor": "plan-reviewer",
    "model": "inherit (file :5) \u00b7 effort ABSENT, inherits the session effort \u00b7 maxTurns 120 (file :6)",
    "does": "Validates the plan against the code, one read-only pass. Spawned with no model: so it runs on the session model and effort.",
    "inputs": [
     "plan file path"
    ],
    "artifacts": [
     "findings"
    ],
    "gates": [
     {
      "rule": "Spawned with no model: so it inherits the session model.",
      "evidence": "no 'plan-reviewer pinned \u2026 (doctrine: inherit)' flag in the arc report",
      "enforced_by": "analyze-arcs",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
        "line": 20,
        "quote": "spawn `plan-reviewer` (no `model:` \u2014 it inherits the session's model; read-only, one pass)"
       },
       {
        "file": "~/Dev/claude-code-setup/skills/analyze-arcs/scripts/analyze.py",
        "line": 617,
        "quote": "pinned {s['model']} (doctrine: inherit)"
       }
      ]
     },
     {
      "rule": "Retired at 120 turns by its own frontmatter.",
      "evidence": "none",
      "enforced_by": "frontmatter",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/agents/plan-reviewer.md",
        "line": 6,
        "quote": "maxTurns: 120"
       }
      ]
     }
    ],
    "options": [],
    "metrics": [
     {
      "name": "share of spend, 172 sessions since 09-29 (input + cache, output excluded)",
      "value": "8.7%",
      "as_of": "2026-10-08",
      "src": [
       {
        "file": "~/.claude/projects/-Users-turbokach-Dev-claude-code-setup/memory/haiku-5-5-review.md",
        "line": 26,
        "quote": "plan-reviewers 8.7%"
       }
      ]
     }
    ],
    "gaps": [],
    "src": [
     {
      "file": "~/Dev/claude-code-setup/agents/plan-reviewer.md",
      "line": 5,
      "quote": "model: inherit maxTurns: 120"
     },
     {
      "file": "~/Dev/claude-code-setup/global/CLAUDE.md",
      "line": 39,
      "quote": "plan-reviewer spawns with no `model:` \u2014 its frontmatter runs it on the session's model and effort"
     }
    ]
   }
  },
  {
   "id": "rshi",
   "lane": "runs",
   "col": 2,
   "kind": "output",
   "title": "SONNET \u00b7 HIGH",
   "sub": "5.5, saved level",
   "produces": "sonnet \u00b7 high",
   "card": {
    "actor": "resolved spawn",
    "model": "claude-sonnet-5-5 \u00b7 effort high (modelSettings)",
    "does": "step-executor, team-executor, fixer, and an unpinned spawn on the floor: no effort key, so the saved Sonnet level applies.",
    "inputs": [],
    "artifacts": [],
    "gates": [],
    "options": [],
    "metrics": [],
    "gaps": [],
    "src": [
     {
      "file": "~/Dev/claude-code-setup/settings.example.json",
      "line": 15,
      "quote": "\"effortLevel\": \"high\""
     }
    ]
   }
  },
  {
   "id": "rox",
   "lane": "runs",
   "col": 3,
   "kind": "output",
   "title": "OPUS \u00b7 XHIGH",
   "sub": "plan-marked, saved",
   "produces": "opus \u00b7 xhigh",
   "card": {
    "actor": "resolved spawn",
    "model": "claude-opus-5-5 \u00b7 effort xhigh (modelSettings, same saved-level rule)",
    "does": "An executor the plan marks Opus with a reason, or a fixer on a surviving mechanism: model opus by the explicit pin, effort from the saved Opus level.",
    "inputs": [],
    "artifacts": [],
    "gates": [],
    "options": [],
    "metrics": [
     {
      "name": "Opus-pinned executors / fixers in the window (10-05 report: 14 / 3)",
      "value": "26 / 3",
      "as_of": "2026-10-12",
      "src": [
       {
        "file": "~/Dev/pipeline-watch/reports/2026-10-12.md",
        "line": 102,
        "quote": "| Opus executors / fixers | 14 / 3 | 26 / 3 |"
       }
      ]
     }
    ],
    "gaps": [],
    "src": [
     {
      "file": "~/Dev/claude-code-setup/settings.example.json",
      "line": 12,
      "quote": "\"effortLevel\": \"xhigh\""
     }
    ]
   }
  },
  {
   "id": "rsmed",
   "lane": "runs",
   "col": 5,
   "kind": "output",
   "title": "SONNET \u00b7 MEDIUM",
   "sub": "frontmatter effort",
   "produces": "sonnet \u00b7 medium",
   "card": {
    "actor": "resolved spawn",
    "model": "claude-sonnet-5-5 \u00b7 effort medium (frontmatter)",
    "does": "explorer, codex-triage, spec-reviewer and team-merger: model and effort both come from the agent file.",
    "inputs": [],
    "artifacts": [],
    "gates": [],
    "options": [],
    "metrics": [],
    "gaps": [],
    "src": [
     {
      "file": "~/Dev/claude-code-setup/agents/explorer.md",
      "line": 6,
      "quote": "effort: medium"
     }
    ]
   }
  },
  {
   "id": "romed",
   "lane": "runs",
   "col": 8,
   "kind": "output",
   "title": "OPUS \u00b7 MEDIUM",
   "sub": "team-reviewer",
   "produces": "opus \u00b7 medium",
   "card": {
    "actor": "resolved spawn",
    "model": "opus \u00b7 effort medium (frontmatter)",
    "does": "team-reviewer: opus by pin and by frontmatter, medium effort from the frontmatter.",
    "inputs": [],
    "artifacts": [],
    "gates": [],
    "options": [],
    "metrics": [],
    "gaps": [],
    "src": [
     {
      "file": "~/Dev/claude-code-setup/agents/team-reviewer.md",
      "line": 6,
      "quote": "effort: medium"
     }
    ]
   }
  },
  {
   "id": "rses",
   "lane": "runs",
   "col": 9,
   "kind": "output",
   "title": "SESSION MODEL",
   "sub": "inherit",
   "produces": "session model",
   "card": {
    "actor": "resolved spawn",
    "model": "the session model and effort (the template: opus \u00b7 xhigh)",
    "does": "plan-reviewer: no pin and model: inherit, so it runs on the session's model and effort.",
    "inputs": [],
    "artifacts": [],
    "gates": [],
    "options": [],
    "metrics": [],
    "gaps": [],
    "src": [
     {
      "file": "~/Dev/claude-code-setup/settings.example.json",
      "line": 9,
      "quote": "\"model\": \"opus\""
     }
    ]
   }
  },
  {
   "id": "rcdx",
   "lane": "runs",
   "col": 10,
   "kind": "output",
   "title": "CODEX RUN",
   "sub": "gpt-6.1-sol \u00b7 medium",
   "produces": "codex model + effort",
   "card": {
    "actor": "resolved spawn",
    "model": "gpt-6.1-sol \u00b7 effort medium (the script defaults)",
    "does": "The codex runner for every challenge round; independent of the Claude model path.",
    "inputs": [],
    "artifacts": [],
    "gates": [],
    "options": [],
    "metrics": [
     {
      "name": "gpt-6.1-sol, first two gate runs on a small kit diff, one on-target finding each; quality vs Astra unmeasured",
      "value": "90 s / 101 s",
      "as_of": "2026-09-30",
      "src": [
       {
        "file": "~/.claude/projects/-Users-turbokach-Dev-claude-code-setup/memory/gpt-6-1-sol-review-model.md",
        "line": 13,
        "quote": "The first two gate runs on it took 90 s and 101 s on a small kit diff"
       }
      ]
     }
    ],
    "gaps": [],
    "src": [
     {
      "file": "~/Dev/claude-code-setup/skills/feature-workflow/scripts/codex-challenge.sh",
      "line": 112,
      "quote": "model=${CODEX_REVIEW_MODEL:-gpt-6.1-sol}"
     }
    ]
   }
  },
  {
   "id": "floor",
   "lane": "settings",
   "col": 1,
   "kind": "decision",
   "title": "3 FLOOR",
   "sub": "SUBAGENT_MODEL",
   "produces": "sonnet",
   "card": {
    "actor": "settings.json env",
    "model": "sonnet",
    "does": "Step 3 of the model path: CLAUDE_CODE_SUBAGENT_MODEL, set to sonnet by the kit. It applies only when neither a pin nor a model: key decides. Every kit agent file carries a model:, so this catches a built-in agent spawned with no pin.",
    "inputs": [
     "spawn with no pin and no model:"
    ],
    "artifacts": [
     "sonnet"
    ],
    "gates": [
     {
      "rule": "CLAUDE_CODE_SUBAGENT_MODEL is sonnet in the kit settings, so an unpinned spawn lands on Sonnet; a pin or a model: key takes precedence.",
      "evidence": "none",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/global/CLAUDE.md",
        "line": 39,
        "quote": "which the kit sets to `sonnet`, so an unpinned spawn lands on Sonnet"
       },
       {
        "file": "~/Dev/claude-code-setup/settings.example.json",
        "line": 4,
        "quote": "\"CLAUDE_CODE_SUBAGENT_MODEL\": \"sonnet\","
       }
      ]
     },
     {
      "rule": "CLAUDE_CODE_SUBAGENT_MODEL_FORCE stays unset: it would flatten every pin to the floor.",
      "evidence": "none",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/global/CLAUDE.md",
        "line": 39,
        "quote": "`CLAUDE_CODE_SUBAGENT_MODEL_FORCE` stays unset \u2014 it would flatten every pin to the floor."
       }
      ]
     }
    ],
    "options": [],
    "metrics": [],
    "gaps": [],
    "src": [
     {
      "file": "~/Dev/claude-code-setup/settings.example.json",
      "line": 4,
      "quote": "\"CLAUDE_CODE_SUBAGENT_MODEL\": \"sonnet\","
     }
    ]
   }
  },
  {
   "id": "msets",
   "lane": "settings",
   "col": 3,
   "kind": "input",
   "title": "modelSettings",
   "sub": "saved effort levels",
   "produces": "effortLevel",
   "card": {
    "actor": "settings.json modelSettings",
    "model": "claude-opus-5-5 xhigh \u00b7 claude-sonnet-5-5 high",
    "does": "Effort is saved per model. A role with no effort: key runs at the saved level of the model it runs on. The levels are read once at session start, so a change reaches running sessions only after a restart.",
    "inputs": [
     "model the subagent runs on"
    ],
    "artifacts": [
     "effortLevel"
    ],
    "gates": [
     {
      "rule": "step-executor, team-executor and fixer carry no effort: key: they run at the level saved for their model under modelSettings.",
      "evidence": "none",
      "enforced_by": "frontmatter",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/skills/agent-teams/SKILL.md",
        "line": 200,
        "quote": "carry no `effort:` line: they run at the level saved for their model under"
       },
       {
        "file": "~/.claude/projects/-Users-turbokach-Dev-claude-code-setup/memory/probe-settings-in-fresh-session.md",
        "line": 17,
        "quote": "a subagent with no `effort:` key runs at the saved `modelSettings` level of the model it actually runs on"
       }
      ]
     }
    ],
    "options": [],
    "metrics": [],
    "gaps": [],
    "src": [
     {
      "file": "~/Dev/claude-code-setup/settings.example.json",
      "line": 10,
      "quote": "\"modelSettings\": {"
     },
     {
      "file": "~/Dev/claude-code-setup/install.sh",
      "line": 339,
      "quote": "a top-level effortLevel does not reach Opus 5.5"
     }
    ]
   }
  },
  {
   "id": "cdxenv",
   "lane": "settings",
   "col": 10,
   "kind": "input",
   "title": "CODEX RUNNER",
   "sub": "env model / effort",
   "produces": "model + effort",
   "card": {
    "actor": "settings.json env, read by codex-challenge.sh",
    "model": "gpt-6.1-sol \u00b7 medium",
    "does": "CODEX_REVIEW_MODEL and CODEX_REVIEW_EFFORT choose the codex model and effort for every round; the script defaults to gpt-6.1-sol and medium.",
    "inputs": [
     "CODEX_REVIEW_MODEL",
     "CODEX_REVIEW_EFFORT"
    ],
    "artifacts": [
     "model + effort per run"
    ],
    "gates": [
     {
      "rule": "The runner takes its model and effort from CODEX_REVIEW_MODEL and CODEX_REVIEW_EFFORT, with gpt-6.1-sol and medium as defaults.",
      "evidence": "the verdict header line: model <model>/<effort>",
      "enforced_by": "script",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/scripts/codex-challenge.sh",
        "line": 112,
        "quote": "model=${CODEX_REVIEW_MODEL:-gpt-6.1-sol}"
       },
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/scripts/codex-challenge.sh",
        "line": 113,
        "quote": "effort=${CODEX_REVIEW_EFFORT:-medium}"
       },
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/scripts/codex-challenge.sh",
        "line": 167,
        "quote": "model $model/$effort"
       }
      ]
     }
    ],
    "options": [],
    "metrics": [],
    "gaps": [
     {
      "text": "Tech debt (review-model-picker arc bundle): the model is pinned while model_provider is inherited, so an Azure, --oss or custom provider gets a model it lacks and burns the retry loop; the bail greps scope to the whole log chunk.",
      "kind": "tech-debt",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/docs/tech-debt.md",
        "line": 27,
        "quote": "Deferred from the review-model-picker arc"
       },
       {
        "file": "~/Dev/claude-code-setup/docs/todos/deferred-review-model-picker-arc.md",
        "line": 14,
        "quote": "model is pinned while model_provider is inherited"
       }
      ]
     }
    ],
    "src": [
     {
      "file": "~/Dev/claude-code-setup/settings.example.json",
      "line": 6,
      "quote": "\"CODEX_REVIEW_MODEL\": \"gpt-6.1-sol\","
     },
     {
      "file": "~/Dev/claude-code-setup/settings.example.json",
      "line": 7,
      "quote": "\"CODEX_REVIEW_EFFORT\": \"medium\""
     }
    ]
   }
  }
 ],
 "edges": [
  {
   "id": "e_spawn_pin",
   "from": "spawn",
   "to": "pin",
   "exit": "r",
   "enter": "l",
   "kind": "flow"
  },
  {
   "id": "e_pin_stepex",
   "from": "pin",
   "to": "stepex",
   "exit": "b",
   "enter": "t",
   "kind": "flow"
  },
  {
   "id": "e_pin_teamex",
   "from": "pin",
   "to": "teamex",
   "exit": "b",
   "enter": "t",
   "kind": "flow"
  },
  {
   "id": "e_pin_fixer",
   "from": "pin",
   "to": "fixer",
   "exit": "b",
   "enter": "t",
   "kind": "flow"
  },
  {
   "id": "e_pin_explorer",
   "from": "pin",
   "to": "explorer",
   "exit": "b",
   "enter": "t",
   "kind": "flow"
  },
  {
   "id": "e_pin_triage",
   "from": "pin",
   "to": "triage",
   "exit": "b",
   "enter": "t",
   "kind": "flow"
  },
  {
   "id": "e_pin_spec",
   "from": "pin",
   "to": "spec",
   "exit": "b",
   "enter": "t",
   "kind": "flow"
  },
  {
   "id": "e_pin_merger",
   "from": "pin",
   "to": "merger",
   "exit": "b",
   "enter": "t",
   "kind": "flow"
  },
  {
   "id": "e_pin_trev",
   "from": "pin",
   "to": "trev",
   "exit": "b",
   "enter": "t",
   "kind": "flow",
   "label": "pin: opus"
  },
  {
   "id": "e_pin_plan",
   "from": "pin",
   "to": "plan",
   "exit": "b",
   "enter": "t",
   "kind": "flow",
   "label": "no pin: inherit"
  },
  {
   "id": "e_pin_floor",
   "from": "pin",
   "to": "floor",
   "exit": "r",
   "enter": "b",
   "kind": "alt",
   "via": [
    [
     9.5,
     0
    ],
    [
     9.5,
     3.5
    ],
    [
     1,
     3.5
    ]
   ],
   "label": "no pin, no model:"
  },
  {
   "id": "e_stepex_rshi",
   "from": "stepex",
   "to": "rshi",
   "exit": "b",
   "enter": "t",
   "kind": "flow"
  },
  {
   "id": "e_stepex_rox",
   "from": "stepex",
   "to": "rox",
   "exit": "b",
   "enter": "t",
   "kind": "alt",
   "label": "plan marks Opus"
  },
  {
   "id": "e_teamex_rshi",
   "from": "teamex",
   "to": "rshi",
   "exit": "b",
   "enter": "t",
   "kind": "flow"
  },
  {
   "id": "e_fixer_rshi",
   "from": "fixer",
   "to": "rshi",
   "exit": "b",
   "enter": "t",
   "kind": "flow"
  },
  {
   "id": "e_fixer_rox",
   "from": "fixer",
   "to": "rox",
   "exit": "b",
   "enter": "t",
   "kind": "alt",
   "label": "mechanism survived"
  },
  {
   "id": "e_explorer_rsmed",
   "from": "explorer",
   "to": "rsmed",
   "exit": "b",
   "enter": "t",
   "kind": "flow"
  },
  {
   "id": "e_triage_rsmed",
   "from": "triage",
   "to": "rsmed",
   "exit": "b",
   "enter": "t",
   "kind": "flow"
  },
  {
   "id": "e_spec_rsmed",
   "from": "spec",
   "to": "rsmed",
   "exit": "b",
   "enter": "t",
   "kind": "flow"
  },
  {
   "id": "e_merger_rsmed",
   "from": "merger",
   "to": "rsmed",
   "exit": "b",
   "enter": "t",
   "kind": "flow"
  },
  {
   "id": "e_trev_romed",
   "from": "trev",
   "to": "romed",
   "exit": "b",
   "enter": "t",
   "kind": "flow"
  },
  {
   "id": "e_plan_rses",
   "from": "plan",
   "to": "rses",
   "exit": "b",
   "enter": "t",
   "kind": "flow",
   "label": "inherit"
  },
  {
   "id": "e_floor_rshi",
   "from": "floor",
   "to": "rshi",
   "exit": "t",
   "enter": "b",
   "kind": "flow",
   "label": "sonnet"
  },
  {
   "id": "e_msets_rshi",
   "from": "msets",
   "to": "rshi",
   "exit": "t",
   "enter": "b",
   "kind": "flow",
   "label": "high"
  },
  {
   "id": "e_msets_rox",
   "from": "msets",
   "to": "rox",
   "exit": "t",
   "enter": "b",
   "kind": "flow",
   "label": "xhigh"
  },
  {
   "id": "e_cdxenv_rcdx",
   "from": "cdxenv",
   "to": "rcdx",
   "exit": "t",
   "enter": "b",
   "kind": "flow"
  }
 ],
 "scenarios": [
  {
   "id": "a",
   "title": "a default executor: sonnet pin, saved effort",
   "steps": [
    {
     "edge": "e_spawn_pin",
     "t": 0.0,
     "d": 0.8,
     "packet": "step-executor",
     "log": "master spawns step-executor, unnamed, model: 'sonnet'"
    },
    {
     "edge": "e_pin_stepex",
     "t": 0.9,
     "d": 0.8,
     "packet": "model: sonnet",
     "log": "step 1: the explicit pin wins over the file and the floor"
    },
    {
     "edge": "e_stepex_rshi",
     "t": 1.9,
     "d": 0.8,
     "packet": "no effort key",
     "log": "the agent file has model: sonnet and maxTurns: 200, no effort: key"
    },
    {
     "edge": "e_msets_rshi",
     "t": 1.9,
     "d": 0.8,
     "packet": "saved: high",
     "log": "effort = the saved level for claude-sonnet-5-5: high"
    }
   ]
  },
  {
   "id": "b",
   "title": "an Opus-marked executor: opus pin, saved Opus effort",
   "steps": [
    {
     "edge": "e_spawn_pin",
     "t": 0.0,
     "d": 0.8,
     "packet": "step-executor",
     "log": "the plan marks this step Opus with a reason: model: 'opus'"
    },
    {
     "edge": "e_pin_stepex",
     "t": 0.9,
     "d": 0.8,
     "packet": "model: opus",
     "log": "step 1: the pin wins; the reason is stated at the spawn"
    },
    {
     "edge": "e_stepex_rox",
     "t": 1.9,
     "d": 0.9,
     "packet": "opus pin",
     "log": "same agent file, still no effort: key"
    },
    {
     "edge": "e_msets_rox",
     "t": 1.9,
     "d": 0.9,
     "packet": "saved: xhigh",
     "log": "effort = the saved level for claude-opus-5-5: xhigh"
    }
   ]
  },
  {
   "id": "c",
   "title": "plan-reviewer: no pin, inherits the session",
   "steps": [
    {
     "edge": "e_spawn_pin",
     "t": 0.0,
     "d": 0.8,
     "packet": "plan-reviewer",
     "log": "master spawns plan-reviewer with no model: pin"
    },
    {
     "edge": "e_pin_plan",
     "t": 0.9,
     "d": 0.8,
     "packet": "no pin",
     "log": "step 1 sets nothing; the file says model: inherit"
    },
    {
     "edge": "e_plan_rses",
     "t": 1.9,
     "d": 0.9,
     "packet": "inherit",
     "log": "it runs on the session's model and effort"
    }
   ]
  },
  {
   "id": "d",
   "title": "a built-in agent with no pin lands on the floor",
   "steps": [
    {
     "edge": "e_spawn_pin",
     "t": 0.0,
     "d": 0.8,
     "packet": "unpinned spawn",
     "log": "a spawn with no pin and no agent-file model:"
    },
    {
     "edge": "e_pin_floor",
     "t": 0.9,
     "d": 0.9,
     "packet": "no pin, no model:",
     "log": "step 3: CLAUDE_CODE_SUBAGENT_MODEL=sonnet"
    },
    {
     "edge": "e_floor_rshi",
     "t": 2.0,
     "d": 0.8,
     "packet": "sonnet",
     "log": "an unpinned spawn lands on Sonnet"
    },
    {
     "edge": "e_msets_rshi",
     "t": 2.0,
     "d": 0.8,
     "packet": "saved: high",
     "log": "effort = the saved Sonnet level"
    }
   ]
  },
  {
   "id": "e",
   "title": "the codex runner takes its model from env",
   "steps": [
    {
     "edge": "e_cdxenv_rcdx",
     "t": 0.0,
     "d": 1.0,
     "packet": "gpt-6.1-sol",
     "log": "CODEX_REVIEW_MODEL / CODEX_REVIEW_EFFORT: gpt-6.1-sol, medium"
    }
   ]
  }
 ]
}
);
