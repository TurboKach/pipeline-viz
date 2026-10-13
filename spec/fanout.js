window.PV=window.PV||[];window.PV.push(
{
 "id": "fanout",
 "title": "parallel fan-out",
 "key": "4",
 "doctrine": {
  "kit_sha": "29fc19a",
  "cc_validated": "2.1.294",
  "extracted": "2026-10-12"
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
   "id": "wt",
   "label": "WORKTREES",
   "sub": "team-executor"
  },
  {
   "id": "codex",
   "label": "CODEX",
   "sub": "gpt-6.1-sol"
  }
 ],
 "cols": 14,
 "nodes": [
  {
   "id": "tsk",
   "lane": "owner",
   "col": 0,
   "kind": "input",
   "title": "TASK",
   "sub": "outside a pipeline",
   "produces": "parallel parts?",
   "card": {
    "actor": "owner",
    "model": "\u2014",
    "does": "A task with independent parallel parts, outside an active pipeline.",
    "inputs": [],
    "artifacts": [
     "task"
    ],
    "gates": [],
    "options": [],
    "metrics": [],
    "gaps": [],
    "src": []
   }
  },
  {
   "id": "askf",
   "lane": "owner",
   "col": 1,
   "kind": "human",
   "title": "ASK: FAN OUT?",
   "sub": "outside a pipeline",
   "produces": "owner answer",
   "card": {
    "actor": "owner + master",
    "model": "opus \u00b7 xhigh (settings model + modelSettings)",
    "does": "Raised when the task has independent parallel parts AND the owner has not specified the approach AND the project's CLAUDE.md sets no preference. Inside a pipeline the plan's parallel decision settles it and plan approval approves it, so no separate question.",
    "inputs": [
     "task with parallel parts"
    ],
    "artifacts": [
     "fan-out answer"
    ],
    "gates": [
     {
      "rule": "Ask whether to fan out before starting, when the parts are independent, the approach is unspecified and the project's CLAUDE.md has no preference.",
      "evidence": "the owner's answer to the fan-out question",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
        "line": 53,
        "quote": "ask whether to fan out before starting"
       }
      ]
     }
    ],
    "options": [
     "fan out in parallel",
     "no: one agent, sequential"
    ],
    "metrics": [
     {
      "name": "large arcs whose master asked the owner about fan-out (the 15 largest since 08-26)",
      "value": "0 of 15",
      "as_of": "2026-09-25",
      "src": [
       {
        "file": "~/.claude/projects/-Users-turbokach-Dev-claude-code-setup/memory/parallel-execution-measured.md",
        "line": 14,
        "quote": "0/15 arcs asked the owner about fan-out"
       }
      ]
     }
    ],
    "gaps": [],
    "src": [
     {
      "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
      "line": 53,
      "quote": "the plan's parallel decision settles it and plan approval approves it \u2014 no separate question"
     }
    ]
   }
  },
  {
   "id": "gate",
   "lane": "owner",
   "col": 3,
   "kind": "human",
   "title": "PLAN ONLY",
   "sub": "ExitPlanMode",
   "produces": "approved plan",
   "card": {
    "actor": "owner",
    "model": "\u2014",
    "does": "The only gate of an agent-teams run. The lead resolves the open taste decisions with one AskUserQuestion, presents the plan, and waits for the owner's approval through ExitPlanMode before any fan-out.",
    "inputs": [
     "plan file",
     "plan-reviewer findings"
    ],
    "artifacts": [
     "approved plan"
    ],
    "gates": [
     {
      "rule": "The lead gets the user's approval on the plan before any fan-out, through native ExitPlanMode in the lead.",
      "evidence": "the owner's ExitPlanMode approval; the plan file copied to docs/prompts/<feature>-plan.md and committed",
      "enforced_by": "harness",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/skills/agent-teams/SKILL.md",
        "line": 158,
        "quote": "The lead must get the **user's** approval on the plan (step 1) before any"
       },
       {
        "file": "~/Dev/claude-code-setup/skills/agent-teams/SKILL.md",
        "line": 124,
        "quote": "copy the plan file to docs/prompts/<feature>-plan.md, commit"
       }
      ]
     },
     {
      "rule": "ExitPlanMode and AskUserQuestion are unavailable to a subagent, so an interactive gate never goes to one.",
      "evidence": "none",
      "enforced_by": "harness",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/skills/agent-teams/SKILL.md",
        "line": 150,
        "quote": "`ExitPlanMode` and `AskUserQuestion` are unavailable to a subagent"
       }
      ]
     },
     {
      "rule": "Open taste decisions are resolved with one AskUserQuestion first, then the plan is presented and the lead waits.",
      "evidence": "the owner's answers, edited into the plan",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/skills/agent-teams/SKILL.md",
        "line": 160,
        "quote": "Resolve the open taste-decisions with"
       }
      ]
     },
     {
      "rule": "Delegated approval follows the AFK gate's two branches: skip plan mode if not yet in it, otherwise the owner's click or Shift+Tab.",
      "evidence": "none",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/skills/agent-teams/SKILL.md",
        "line": 162,
        "quote": "Delegated approval"
       }
      ]
     }
    ],
    "options": [
     "approve",
     "keep planning (feedback)"
    ],
    "metrics": [],
    "gaps": [],
    "src": [
     {
      "file": "~/Dev/claude-code-setup/skills/agent-teams/SKILL.md",
      "line": 156,
      "quote": "## Approval gate: PLAN ONLY"
     }
    ]
   }
  },
  {
   "id": "pln",
   "lane": "master",
   "col": 0,
   "kind": "input",
   "title": "PLAN",
   "sub": "Parallel: line",
   "produces": "Parallel: line",
   "card": {
    "actor": "master",
    "model": "opus \u00b7 xhigh (settings model + modelSettings)",
    "does": "The approved plan states the parallel decision in one line: 'Parallel: none \u2014 <reason>' or 'Parallel: Steps <a> + <b> \u2014 <gain; costs>'.",
    "inputs": [],
    "artifacts": [
     "Parallel: line"
    ],
    "gates": [
     {
      "rule": "The plan carries one Parallel: line; sequential is the default.",
      "evidence": "plan-reviewer reports blocking=0",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
        "line": 19,
        "quote": "write the result as one line in the plan"
       },
       {
        "file": "~/Dev/claude-code-setup/agents/plan-reviewer.md",
        "line": 23,
        "quote": "the plan carries its `Parallel:`"
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
      "line": 19,
      "quote": "Sequential is the default."
     }
    ]
   }
  },
  {
   "id": "par",
   "lane": "master",
   "col": 1,
   "kind": "decision",
   "title": "PARALLEL?",
   "sub": "at most two writers",
   "produces": "pair or none",
   "card": {
    "actor": "master (plan stage)",
    "model": "opus \u00b7 xhigh (settings model + modelSettings)",
    "does": "Weighs whether two plan steps should run at the same time. Sequential is the default; a pair needs disjoint files, no consumed output, long steps and no exclusive runtime. The costs go in the Parallel: line.",
    "inputs": [
     "drafted steps",
     "explorer's runtime facts"
    ],
    "artifacts": [
     "Parallel: line"
    ],
    "gates": [
     {
      "rule": "Sequential is the default. At most two executors at once unless the owner asks for more.",
      "evidence": "the plan's Parallel: line",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
        "line": 19,
        "quote": "Sequential is the default. Hard limits: at most two executors at once unless the owner asks for more"
       }
      ]
     },
     {
      "rule": "The pair shares no file, hub files included (registry, router, barrel export, project file, entrypoint).",
      "evidence": "plan-reviewer reports blocking=0",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
        "line": 19,
        "quote": "the pair shares no file, hub files included"
       },
       {
        "file": "~/Dev/claude-code-setup/agents/plan-reviewer.md",
        "line": 23,
        "quote": "a pair holds against the code and the project's build/test runtime"
       }
      ]
     },
     {
      "rule": "Neither step consumes the other's output (a type, API, schema or migration the other creates).",
      "evidence": "plan-reviewer reports blocking=0",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
        "line": 19,
        "quote": "neither step consumes the other's output"
       }
      ]
     },
     {
      "rule": "Worth it only when both steps are long, roughly 15+ minutes each.",
      "evidence": "none",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
        "line": 19,
        "quote": "worth it only when both steps are long, roughly 15+ minutes each"
       }
      ]
     },
     {
      "rule": "No exclusive runtime: one device or simulator, one container stack, fixed ports or a shared local database make the steps queue or corrupt state.",
      "evidence": "explorer's runtime facts, or the project's CLAUDE.md record",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
        "line": 19,
        "quote": "makes them queue or corrupt each other's state"
       },
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
        "line": 19,
        "quote": "The discovery brief asks explorer for those runtime facts"
       }
      ]
     },
     {
      "rule": "Costs are weighed in the line: a cold first build per worktree (no build cache or gitignored files unless .worktreeinclude copies them) and one merge.",
      "evidence": "the costs named in the Parallel: line",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
        "line": 19,
        "quote": "each worktree is a fresh checkout, so its first build is cold"
       },
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
        "line": 19,
        "quote": "the pair adds one merge"
       }
      ]
     }
    ],
    "options": [],
    "metrics": [
     {
      "name": "August team-executor batches that collided, width 2 vs width 3+",
      "value": "1/6 vs 5/7",
      "as_of": "2026-09-25",
      "src": [
       {
        "file": "~/.claude/projects/-Users-turbokach-Dev-claude-code-setup/memory/parallel-execution-measured.md",
        "line": 15,
        "quote": "width-2 collided 1/6, width 3+ collided 5/7"
       }
      ]
     },
     {
      "name": "estimated saving over 15 arcs, at most 2 at once, only steps \u226515 min (file-overlap heuristic)",
      "value": "~394 min",
      "as_of": "2026-09-25",
      "src": [
       {
        "file": "~/.claude/projects/-Users-turbokach-Dev-claude-code-setup/memory/parallel-execution-measured.md",
        "line": 13,
        "quote": "2 at once with only steps \u226515 min run concurrently, 394 min"
       }
      ]
     }
    ],
    "gaps": [],
    "src": [
     {
      "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
      "line": 19,
      "quote": "**Parallel decision.**"
     }
    ]
   }
  },
  {
   "id": "seq",
   "lane": "sub",
   "col": 0,
   "kind": "output",
   "title": "SEQUENTIAL",
   "sub": "step-executor",
   "produces": "one writer",
   "card": {
    "actor": "step-executor (unnamed)",
    "model": "sonnet \u00b7 high (pinned; no effort key, saved modelSettings level)",
    "does": "Parallel: none, the default. Sequential steps go to step-executor on the session branch, no worktree. Mapped in view 1.",
    "inputs": [
     "Parallel: none"
    ],
    "artifacts": [
     "commit per step"
    ],
    "gates": [],
    "options": [],
    "metrics": [],
    "gaps": [],
    "src": [
     {
      "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
      "line": 21,
      "quote": "Sequential steps go to `step-executor`"
     }
    ]
   }
  },
  {
   "id": "mech",
   "lane": "master",
   "col": 2,
   "kind": "decision",
   "title": "MECHANISM",
   "sub": "subagents/Workflows",
   "produces": "mechanism",
   "card": {
    "actor": "master (lead)",
    "model": "opus \u00b7 xhigh (settings model + modelSettings)",
    "does": "Picks the mechanism: background subagents by default; Workflows when the fan-out is large (10s+) and needs deterministic, repeatable, resumable orchestration with cross-checking.",
    "inputs": [
     "fan-out answer"
    ],
    "artifacts": [
     "mechanism"
    ],
    "gates": [
     {
      "rule": "Default to background subagents (Agent tool, no name). Workflows only for a large or repeatable, resumable fan-out.",
      "evidence": "none",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/skills/agent-teams/SKILL.md",
        "line": 34,
        "quote": "Default to **background subagents**"
       },
       {
        "file": "~/Dev/claude-code-setup/skills/agent-teams/SKILL.md",
        "line": 43,
        "quote": "Reach for **Workflows** when the fan-out is large"
       }
      ]
     }
    ],
    "options": [],
    "metrics": [],
    "gaps": [],
    "src": [
     {
      "file": "~/Dev/claude-code-setup/skills/agent-teams/SKILL.md",
      "line": 29,
      "quote": "| **Background subagents** *(DEFAULT)*"
     }
    ]
   }
  },
  {
   "id": "wfl",
   "lane": "sub",
   "col": 2,
   "kind": "output",
   "title": "WORKFLOWS",
   "sub": "script fan-out",
   "produces": "workflow run",
   "card": {
    "actor": "lead runs a Workflow script",
    "model": "opus \u00b7 xhigh (settings model + modelSettings)",
    "does": "A deterministic script (plan, fan-out, review, merge) that scales to many units, cross-checks results and resumes if interrupted. In this kit only the lead runs Workflows.",
    "inputs": [
     "mechanism: Workflows"
    ],
    "artifacts": [
     "workflow run"
    ],
    "gates": [],
    "options": [],
    "metrics": [],
    "gaps": [],
    "src": [
     {
      "file": "~/Dev/claude-code-setup/skills/agent-teams/SKILL.md",
      "line": 264,
      "quote": "a deterministic script (plan \u2192 fan-out \u2192 review \u2192 merge)"
     }
    ]
   }
  },
  {
   "id": "spawn",
   "lane": "master",
   "col": 4,
   "kind": "stage",
   "title": "SPAWN",
   "sub": "unnamed, one turn",
   "produces": "executor spawns",
   "card": {
    "actor": "master (lead)",
    "model": "opus \u00b7 xhigh (settings model + modelSettings)",
    "does": "Stage 4: a pair spawns as two team-executors in one turn, no other writer runs until it lands. Agent-teams: one team-executor per independent unit. worktree.baseRef is \"head\" so worktrees branch from the session HEAD.",
    "inputs": [
     "Parallel: Steps a + b",
     "approved plan"
    ],
    "artifacts": [
     "two or N spawns"
    ],
    "gates": [
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
        "line": 439,
        "quote": "named spawn {s['type']} name={s['name']}"
       },
       {
        "file": "~/Dev/claude-code-setup/skills/analyze-arcs/scripts/analyze.py",
        "line": 435,
        "quote": "unpinned spawn {s['type']}"
       }
      ]
     },
     {
      "rule": "worktree.baseRef is \"head\" before the first fan-out; the default branches worktrees from the remote default branch, which lacks the plan file and the session commits.",
      "evidence": "none",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/skills/agent-teams/SKILL.md",
        "line": 71,
        "quote": "**Set `worktree.baseRef` to `\"head\"` before the first fan-out.**"
       },
       {
        "file": "~/Dev/claude-code-setup/settings.example.json",
        "line": 19,
        "quote": "\"baseRef\": \"head\""
       }
      ]
     },
     {
      "rule": "A worktree is a fresh checkout: gitignored files do not come along, so add a .worktreeinclude when executors need .env or similar.",
      "evidence": "none",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/skills/agent-teams/SKILL.md",
        "line": 79,
        "quote": "add a `.worktreeinclude` if executors need `.env` or similar to run tests"
       }
      ]
     },
     {
      "rule": "Never more than 20 agents in parallel unless the owner asks.",
      "evidence": "none",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/global/CLAUDE.md",
        "line": 38,
        "quote": "never more than 20 parallel unless I explicitly ask"
       }
      ]
     },
     {
      "rule": "A single writer is not a fan-out run: stop and hand the work to the sequential delegated execute.",
      "evidence": "none",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/skills/agent-teams/SKILL.md",
        "line": 66,
        "quote": "**If you get here with only one writer, that's not an agent-teams run.**"
       }
      ]
     }
    ],
    "options": [],
    "metrics": [
     {
      "name": "team-executor spawns in the arcs since 08-26 (84 arcs with \u22653 step-executors)",
      "value": "0 spawns",
      "as_of": "2026-09-25",
      "src": [
       {
        "file": "~/.claude/projects/-Users-turbokach-Dev-claude-code-setup/memory/parallel-execution-measured.md",
        "line": 13,
        "quote": "0 team-executor spawns; 84 arcs with \u22653 step-executors"
       }
      ]
     },
     {
      "name": "August team-executor units that never overlapped a sibling (used as a sequential executor)",
      "value": "58%",
      "as_of": "2026-09-25",
      "src": [
       {
        "file": "~/.claude/projects/-Users-turbokach-Dev-claude-code-setup/memory/parallel-execution-measured.md",
        "line": 15,
        "quote": "58% of team-executor units never overlapped a sibling"
       }
      ]
     }
    ],
    "gaps": [],
    "src": [
     {
      "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
      "line": 21,
      "quote": "A pair from the plan's `Parallel:` line spawns as two `team-executor`s in one turn"
     }
    ]
   }
  },
  {
   "id": "exA",
   "lane": "wt",
   "col": 4,
   "kind": "sub",
   "title": "team-executor A",
   "sub": "own worktree",
   "produces": "unit commits",
   "card": {
    "actor": "team-executor (background, unnamed)",
    "model": "sonnet (file :5) \u00b7 effort ABSENT, runs at the saved modelSettings level (high) \u00b7 maxTurns 200 (file :6) \u00b7 background: true (:7) \u00b7 isolation: worktree (:8)",
    "does": "One independent unit in its own worktree, branched from the session HEAD. The same agent file serves a stage-4 pair (two units) and an agent-teams run (N units). It commits in the worktree and never merges.",
    "inputs": [
     "unit scope + owned files",
     "cross-unit contract"
    ],
    "artifacts": [
     "commits in the worktree",
     "report: branch, worktree path"
    ],
    "gates": [
     {
      "rule": "isolation: worktree and background: true sit in the agent's own frontmatter: every executor gets a worktree and runs in the background whether or not the spawn prompt asks.",
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
       },
       {
        "file": "~/Dev/claude-code-setup/skills/agent-teams/SKILL.md",
        "line": 60,
        "quote": "`team-executor` carries `isolation:"
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
     },
     {
      "rule": "The tools list omits Agent and Workflow, so a worker cannot fan out on its own.",
      "evidence": "none",
      "enforced_by": "frontmatter",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/agents/team-executor.md",
        "line": 4,
        "quote": "tools: Read, Write, Edit, Bash, Glob, Grep"
       },
       {
        "file": "~/Dev/claude-code-setup/skills/agent-teams/SKILL.md",
        "line": 45,
        "quote": "the worker roles' `tools` lists deliberately omit"
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
      "quote": "model: sonnet"
     },
     {
      "file": "~/Dev/claude-code-setup/agents/team-executor.md",
      "line": 5,
      "quote": "model: sonnet maxTurns: 200 background: true isolation: worktree"
     }
    ]
   }
  },
  {
   "id": "exB",
   "lane": "wt",
   "col": 5,
   "kind": "sub",
   "title": "team-executor B",
   "sub": "own worktree",
   "produces": "unit commits",
   "card": {
    "actor": "team-executor (background, unnamed)",
    "model": "sonnet (file :5) \u00b7 effort ABSENT, runs at the saved modelSettings level (high) \u00b7 maxTurns 200 (file :6) \u00b7 background: true (:7) \u00b7 isolation: worktree (:8)",
    "does": "One independent unit in its own worktree, branched from the session HEAD. The same agent file serves a stage-4 pair (two units) and an agent-teams run (N units). It commits in the worktree and never merges.",
    "inputs": [
     "unit scope + owned files",
     "cross-unit contract"
    ],
    "artifacts": [
     "commits in the worktree",
     "report: branch, worktree path"
    ],
    "gates": [
     {
      "rule": "isolation: worktree and background: true sit in the agent's own frontmatter: every executor gets a worktree and runs in the background whether or not the spawn prompt asks.",
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
       },
       {
        "file": "~/Dev/claude-code-setup/skills/agent-teams/SKILL.md",
        "line": 60,
        "quote": "`team-executor` carries `isolation:"
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
     },
     {
      "rule": "The tools list omits Agent and Workflow, so a worker cannot fan out on its own.",
      "evidence": "none",
      "enforced_by": "frontmatter",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/agents/team-executor.md",
        "line": 4,
        "quote": "tools: Read, Write, Edit, Bash, Glob, Grep"
       },
       {
        "file": "~/Dev/claude-code-setup/skills/agent-teams/SKILL.md",
        "line": 45,
        "quote": "the worker roles' `tools` lists deliberately omit"
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
      "quote": "model: sonnet"
     },
     {
      "file": "~/Dev/claude-code-setup/agents/team-executor.md",
      "line": 5,
      "quote": "model: sonnet maxTurns: 200 background: true isolation: worktree"
     }
    ]
   }
  },
  {
   "id": "trev",
   "lane": "sub",
   "col": 6,
   "kind": "sub",
   "title": "team-reviewer",
   "sub": "agent-teams only",
   "produces": "per-unit verdicts",
   "card": {
    "actor": "team-reviewer (read-only, no worktree)",
    "model": "opus (file :5) \u00b7 effort medium (:6) \u00b7 maxTurns ABSENT (frontmatter ends at :7)",
    "does": "Adversarially verifies each unit's diff before it merges. A stage-4 pair has no team-reviewer: the per-step codex round on the merged range stands in for it.",
    "inputs": [
     "unit diffs",
     "approved plan"
    ],
    "artifacts": [
     "per-unit APPROVE / CHANGES-NEEDED",
     "one-line roll-up"
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
     },
     {
      "rule": "Verifies and never implements: no Write or Edit tool in the agent definition.",
      "evidence": "none",
      "enforced_by": "frontmatter",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/agents/team-reviewer.md",
        "line": 4,
        "quote": "tools: Read, Bash, Glob, Grep"
       }
      ]
     },
     {
      "rule": "Returns a structured per-unit verdict, <unit>: APPROVE or CHANGES-NEEDED, and a roll-up line; only approved units go to the merger.",
      "evidence": "structured per-unit verdicts",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/agents/team-reviewer.md",
        "line": 27,
        "quote": "on its own line: `<unit>: APPROVE` or"
       },
       {
        "file": "~/Dev/claude-code-setup/agents/team-reviewer.md",
        "line": 23,
        "quote": "Only units you approve should go to the merger."
       }
      ]
     }
    ],
    "options": [],
    "metrics": [
     {
      "name": "team-reviewer spawns in the 14 real August batches",
      "value": "0 spawns",
      "as_of": "2026-09-25",
      "src": [
       {
        "file": "~/.claude/projects/-Users-turbokach-Dev-claude-code-setup/memory/parallel-execution-measured.md",
        "line": 15,
        "quote": "team-reviewer/team-merger never spawned"
       }
      ]
     }
    ],
    "gaps": [],
    "src": [
     {
      "file": "~/Dev/claude-code-setup/agents/team-reviewer.md",
      "line": 5,
      "quote": "model: opus"
     },
     {
      "file": "~/Dev/claude-code-setup/agents/team-reviewer.md",
      "line": 6,
      "quote": "effort: medium ---"
     }
    ]
   }
  },
  {
   "id": "merge",
   "lane": "sub",
   "col": 7,
   "kind": "sub",
   "title": "team-merger",
   "sub": "lands the branches",
   "produces": "merge commits",
   "card": {
    "actor": "team-merger",
    "model": "sonnet (file :5) \u00b7 effort medium (:6) \u00b7 maxTurns ABSENT (frontmatter ends at :7)",
    "does": "Merges the named branches into the session branch in turn (a stage-4 pair after both executors report; agent-teams units after review), runs the build and targeted suites its prompt names, removes each worktree and branch.",
    "inputs": [
     "branch names + worktree paths",
     "build + targeted suites"
    ],
    "artifacts": [
     "per-unit merge SHA: landed / blocked",
     "git status + git worktree list"
    ],
    "gates": [
     {
      "rule": "Commits a stopped-short unit's uncommitted edits as WIP: before merging; never merges a unit its prompt does not name or a reviewer rejected.",
      "evidence": "per-unit merge commit SHA and \"landed\" / \"blocked: <reason>\"",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/agents/team-merger.md",
        "line": 14,
        "quote": "them there as `WIP:` first"
       },
       {
        "file": "~/Dev/claude-code-setup/agents/team-merger.md",
        "line": 42,
        "quote": "Never merge a unit your prompt doesn't name"
       }
      ]
     },
     {
      "rule": "After each successful merge removes that unit's worktree and deletes the merged branch; nothing else ever reclaims an executor worktree.",
      "evidence": "`git worktree list` shows no feature worktrees; `git status` is clean",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/agents/team-merger.md",
        "line": 24,
        "quote": "After each successful merge, remove that unit's worktree"
       },
       {
        "file": "~/Dev/claude-code-setup/skills/agent-teams/SKILL.md",
        "line": 99,
        "quote": "**neither platform cleanup path ever reclaims an executor"
       }
      ]
     }
    ],
    "options": [],
    "metrics": [
     {
      "name": "team-merger spawns in the 14 real August batches; the master merged and removed worktrees itself",
      "value": "0 spawns",
      "as_of": "2026-09-25",
      "src": [
       {
        "file": "~/.claude/projects/-Users-turbokach-Dev-claude-code-setup/memory/parallel-execution-measured.md",
        "line": 15,
        "quote": "the master ran `git merge --no-ff` + worktree removal itself"
       }
      ]
     }
    ],
    "gaps": [],
    "src": [
     {
      "file": "~/Dev/claude-code-setup/agents/team-merger.md",
      "line": 5,
      "quote": "model: sonnet"
     },
     {
      "file": "~/Dev/claude-code-setup/agents/team-merger.md",
      "line": 6,
      "quote": "effort: medium ---"
     }
    ]
   }
  },
  {
   "id": "okq",
   "lane": "master",
   "col": 7,
   "kind": "decision",
   "title": "LANDED CLEAN?",
   "sub": "stage-4 pair",
   "produces": "route",
   "card": {
    "actor": "master",
    "model": "opus \u00b7 xhigh (settings model + modelSettings)",
    "does": "After the merger reports: a unit that stopped short is finished by a step-executor; a conflict or a red build or suite goes to one fixer; otherwise the per-step round launches.",
    "inputs": [
     "merger report"
    ],
    "artifacts": [
     "route"
    ],
    "gates": [
     {
      "rule": "A unit that stops short (a blocker, an API death, a second cap) is landed as it stands, as a WIP: commit, and a step-executor finishes it on the session branch before the round launches.",
      "evidence": "a WIP: commit on the session branch",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
        "line": 21,
        "quote": "A unit that stops short (a blocker, an API death, a second cap) is landed as it stands"
       }
      ]
     },
     {
      "rule": "A conflict the merger doesn't resolve, or a red build or suite after the merge, goes to one fixer before the round launches.",
      "evidence": "the merger's build and suite counts (executed/skipped/failed), green",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
        "line": 21,
        "quote": "A conflict the merger doesn't resolve, or a red build or suite after the merge"
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
      "line": 21,
      "quote": "each step's task completes when the merger reports it landed"
     }
    ]
   }
  },
  {
   "id": "fin",
   "lane": "sub",
   "col": 8,
   "kind": "sub",
   "title": "step-executor",
   "sub": "finishes the unit",
   "produces": "finished unit",
   "card": {
    "actor": "step-executor (unnamed)",
    "model": "sonnet \u00b7 high (pinned; no effort key, saved modelSettings level)",
    "does": "Finishes the stopped-short unit on the session branch, from the WIP: commit, before the round launches. One writer in flight.",
    "inputs": [
     "WIP: commit",
     "the unit's plan step"
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
     }
    ],
    "options": [],
    "metrics": [],
    "gaps": [],
    "src": [
     {
      "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
      "line": 21,
      "quote": "a `step-executor` finishes it on the session branch before the round launches"
     }
    ]
   }
  },
  {
   "id": "fixm",
   "lane": "sub",
   "col": 9,
   "kind": "sub",
   "title": "fixer",
   "sub": "conflict / red build",
   "produces": "fix commit",
   "card": {
    "actor": "fixer (unnamed)",
    "model": "sonnet \u00b7 high (pinned); opus when a mechanism survived an earlier round",
    "does": "Repairs a merge conflict or a red build or suite on the session branch before the round launches. One concern per spawn.",
    "inputs": [
     "merger report",
     "failing build or suite"
    ],
    "artifacts": [
     "fix commit",
     "red + green runs"
    ],
    "gates": [
     {
      "rule": "Red-then-green, test-first: one red run, then the fix, one green run, both shown.",
      "evidence": "a red and a green run, each with executed/skipped/failed counts",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
        "line": 21,
        "quote": "one red run, then the fix, one green run, both shown"
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
      "line": 21,
      "quote": "goes to one `fixer` before the round launches"
     }
    ]
   }
  },
  {
   "id": "rnd",
   "lane": "codex",
   "col": 10,
   "kind": "codex",
   "title": "STEP ROUND",
   "sub": "merged range, --pin",
   "produces": "codex-step<N>.md",
   "card": {
    "actor": "codex-challenge.sh, one background Bash in the master",
    "model": "gpt-6.1-sol \u00b7 medium (CODEX_REVIEW_MODEL / _EFFORT)",
    "does": "The per-step round launches on the merged range as for one step: always --pin, range <previous round head>..<HEAD now>. For a pair it stands in for team-reviewer.",
    "inputs": [
     "<previous round head>..<HEAD>"
    ],
    "artifacts": [
     "codex-step<N>.md"
    ],
    "gates": [
     {
      "rule": "Rounds are contiguous: <previous round head>..<HEAD now>; round 1 starts at the feature base.",
      "evidence": "each verdict header line records its range",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
        "line": 21,
        "quote": "range `<previous round's head>..<HEAD now>` (round 1's base = the feature base)"
       },
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/scripts/codex-challenge.sh",
        "line": 167,
        "quote": "# codex challenge \u2014 range $base..$head"
       }
      ]
     },
     {
      "rule": "Always --pin: the script adds its own detached worktree and removes it on exit.",
      "evidence": "none",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
        "line": 21,
        "quote": "Always `--pin` (a later executor may be writing)"
       }
      ]
     },
     {
      "rule": "No team-reviewer for a pair: the per-step round on the merged range stands in for it.",
      "evidence": "the round's verdict for the merged range",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/skills/agent-teams/SKILL.md",
        "line": 274,
        "quote": "the per-step codex round on the merged range stands in for `team-reviewer`"
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
      "line": 21,
      "quote": "no `team-reviewer`"
     }
    ]
   }
  },
  {
   "id": "trg",
   "lane": "sub",
   "col": 11,
   "kind": "sub",
   "title": "codex-triage",
   "sub": "verdict",
   "produces": "verdict \u22642k",
   "card": {
    "actor": "codex-triage (fresh per round)",
    "model": "sonnet \u00b7 medium (frontmatter)",
    "does": "One spawn per round on the round file: verifies each finding against git show <head>:<path>, classes it, gives P0/P1/P2. Serves the per-step round and the agent-teams codex gate.",
    "inputs": [
     "round file",
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
       }
      ]
     }
    ],
    "options": [],
    "metrics": [],
    "gaps": [],
    "src": []
   }
  },
  {
   "id": "fpair",
   "lane": "master",
   "col": 11,
   "kind": "decision",
   "title": "SETS DISJOINT?",
   "sub": "fixer pair rule",
   "produces": "serial or pair",
   "card": {
    "actor": "master",
    "model": "opus \u00b7 xhigh (settings model + modelSettings)",
    "does": "Fixers stay serial by default. Finding sets that touch non-intersecting files are a pair under stage 4's rules, never wider; an intersection is a hard no.",
    "inputs": [
     "finding sets"
    ],
    "artifacts": [
     "route"
    ],
    "gates": [
     {
      "rule": "Fixers stay serial by default; sets on non-intersecting files are a pair under stage 4's rules, never wider.",
      "evidence": "none",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
        "line": 65,
        "quote": "that is a pair under stage 4's rules, never wider"
       }
      ]
     },
     {
      "rule": "Disjoint file lists are the entry condition, not the proof: treat an intersection as a hard no and look at what each fix has to change.",
      "evidence": "none",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
        "line": 65,
        "quote": "treat an intersection as a hard no"
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
      "line": 65,
      "quote": "**Fixers stay serial by default.**"
     }
    ]
   }
  },
  {
   "id": "fixs",
   "lane": "sub",
   "col": 12,
   "kind": "sub",
   "title": "fixer",
   "sub": "serial (default)",
   "produces": "fix commits",
   "card": {
    "actor": "fixer (unnamed)",
    "model": "sonnet \u00b7 high (pinned); opus when a mechanism survived an earlier round",
    "does": "One fixer per finding set on the session branch, single writer, no worktree.",
    "inputs": [
     "plan section",
     "diff range",
     "finding set"
    ],
    "artifacts": [
     "fix commits",
     "red + green runs"
    ],
    "gates": [
     {
      "rule": "Red-then-green, test-first: one red run, then the fix, one green run, both shown.",
      "evidence": "a red and a green run, each with executed/skipped/failed counts",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
        "line": 21,
        "quote": "one red run, then the fix, one green run, both shown"
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
      "line": 65,
      "quote": "`fixer` is single-writer by definition"
     }
    ]
   }
  },
  {
   "id": "gcdx",
   "lane": "codex",
   "col": 13,
   "kind": "codex",
   "title": "CODEX GATE",
   "sub": "merged feature diff",
   "produces": "whole-round<N>.md",
   "card": {
    "actor": "codex-challenge.sh, one background Bash in the lead",
    "model": "gpt-6.1-sol \u00b7 medium (CODEX_REVIEW_MODEL / _EFFORT)",
    "does": "Agent-teams step 5: ONE codex-challenge.sh <feature-base-sha>..HEAD on the merged feature diff. The fix loop, its stop rule and the standalone-finding question are feature-workflow stage 5, verbatim (view 1).",
    "inputs": [
     "<feature-base-sha>..HEAD"
    ],
    "artifacts": [
     "codex-whole-round<N>.md"
    ],
    "gates": [
     {
      "rule": "No ship (push, PR) until codex-challenge.sh ran once on the whole range and the codex-triage verdict is shown; internal reviewers do not count.",
      "evidence": "the codex-triage verdict for <feature-base-sha>..HEAD, shown",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/global/CLAUDE.md",
        "line": 27,
        "quote": "has run once on the whole range as one background Bash in the master and the `codex-triage` verdict is shown"
       },
       {
        "file": "~/Dev/claude-code-setup/global/CLAUDE.md",
        "line": 27,
        "quote": "Internal reviewer subagents do NOT satisfy this gate."
       }
      ]
     },
     {
      "rule": "Per-step rounds and fixer-commit deltas never satisfy the gate: the whole range at a single HEAD.",
      "evidence": "the verdict header line: range <feature-base>..<head>",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
        "line": 22,
        "quote": "Stage-4 per-step rounds and fixer-commit deltas never satisfy this gate"
       },
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/scripts/codex-challenge.sh",
        "line": 167,
        "quote": "# codex challenge \u2014 range $base..$head"
       }
      ]
     },
     {
      "rule": "Launch only when no per-step round is in flight and no fixer is pending.",
      "evidence": "none",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
        "line": 21,
        "quote": "Stage 5 launches only when no per-step round is in flight and no fixer is pending"
       }
      ]
     },
     {
      "rule": "The run is a background Bash in the master; subagents cannot background it.",
      "evidence": "no 'codex-challenge run in the foreground' flag in the arc report",
      "enforced_by": "analyze-arcs",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/skills/analyze-arcs/scripts/analyze.py",
        "line": 441,
        "quote": "codex-challenge run in the foreground"
       },
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
        "line": 61,
        "quote": "the kit's PreToolUse hook `hooks/subagent-no-background.sh` denies `run_in_background` inside any subagent"
       }
      ]
     }
    ],
    "options": [],
    "metrics": [],
    "gaps": [],
    "src": [
     {
      "file": "~/Dev/claude-code-setup/skills/agent-teams/SKILL.md",
      "line": 169,
      "quote": "ONE `~/.claude/skills/feature-workflow/scripts/codex-challenge.sh <feature-base-sha>..HEAD`"
     }
    ]
   }
  }
 ],
 "edges": [
  {
   "id": "e_tsk_askf",
   "from": "tsk",
   "to": "askf",
   "exit": "r",
   "enter": "l",
   "kind": "flow"
  },
  {
   "id": "e_askf_mech",
   "from": "askf",
   "to": "mech",
   "exit": "r",
   "enter": "t",
   "kind": "flow",
   "label": "fan out"
  },
  {
   "id": "e_mech_wfl",
   "from": "mech",
   "to": "wfl",
   "exit": "b",
   "enter": "t",
   "kind": "alt",
   "label": "Workflows"
  },
  {
   "id": "e_mech_gate",
   "from": "mech",
   "to": "gate",
   "exit": "r",
   "enter": "b",
   "kind": "flow",
   "label": "subagents"
  },
  {
   "id": "e_gate_spawn",
   "from": "gate",
   "to": "spawn",
   "exit": "r",
   "enter": "t",
   "kind": "flow",
   "label": "approved"
  },
  {
   "id": "e_pln_par",
   "from": "pln",
   "to": "par",
   "exit": "r",
   "enter": "l",
   "kind": "flow"
  },
  {
   "id": "e_par_seq",
   "from": "par",
   "to": "seq",
   "exit": "b",
   "enter": "t",
   "kind": "alt",
   "label": "none"
  },
  {
   "id": "e_par_spawn",
   "from": "par",
   "to": "spawn",
   "exit": "b",
   "enter": "b",
   "kind": "flow",
   "via": [
    [
     1,
     1.5
    ],
    [
     4,
     1.5
    ]
   ]
  },
  {
   "id": "e_spawn_exA",
   "from": "spawn",
   "to": "exA",
   "exit": "b",
   "enter": "t",
   "kind": "flow"
  },
  {
   "id": "e_spawn_exB",
   "from": "spawn",
   "to": "exB",
   "exit": "r",
   "enter": "t",
   "kind": "flow"
  },
  {
   "id": "e_exA_trev",
   "from": "exA",
   "to": "trev",
   "exit": "b",
   "enter": "b",
   "kind": "alt",
   "via": [
    [
     4,
     3.5
    ],
    [
     6,
     3.5
    ]
   ],
   "label": "agent-teams"
  },
  {
   "id": "e_exB_trev",
   "from": "exB",
   "to": "trev",
   "exit": "r",
   "enter": "b",
   "kind": "alt"
  },
  {
   "id": "e_exA_merge",
   "from": "exA",
   "to": "merge",
   "exit": "b",
   "enter": "b",
   "kind": "flow",
   "via": [
    [
     4,
     4.5
    ],
    [
     7,
     4.5
    ]
   ],
   "label": "pair: no reviewer"
  },
  {
   "id": "e_exB_merge",
   "from": "exB",
   "to": "merge",
   "exit": "r",
   "enter": "b",
   "kind": "flow"
  },
  {
   "id": "e_trev_merge",
   "from": "trev",
   "to": "merge",
   "exit": "r",
   "enter": "l",
   "kind": "alt"
  },
  {
   "id": "e_merge_okq",
   "from": "merge",
   "to": "okq",
   "exit": "t",
   "enter": "b",
   "kind": "flow",
   "label": "pair"
  },
  {
   "id": "e_merge_gcdx",
   "from": "merge",
   "to": "gcdx",
   "exit": "b",
   "enter": "l",
   "kind": "alt",
   "via": [
    [
     7,
     2.5
    ],
    [
     12,
     2.5
    ],
    [
     12,
     4
    ]
   ],
   "label": "agent-teams: all landed"
  },
  {
   "id": "e_okq_fin",
   "from": "okq",
   "to": "fin",
   "exit": "r",
   "enter": "t",
   "kind": "alt",
   "label": "stopped short"
  },
  {
   "id": "e_okq_fixm",
   "from": "okq",
   "to": "fixm",
   "exit": "r",
   "enter": "t",
   "kind": "alt",
   "label": "conflict / red"
  },
  {
   "id": "e_okq_rnd",
   "from": "okq",
   "to": "rnd",
   "exit": "r",
   "enter": "t",
   "kind": "flow"
  },
  {
   "id": "e_fin_rnd",
   "from": "fin",
   "to": "rnd",
   "exit": "b",
   "enter": "l",
   "kind": "flow"
  },
  {
   "id": "e_fixm_rnd",
   "from": "fixm",
   "to": "rnd",
   "exit": "b",
   "enter": "l",
   "kind": "flow"
  },
  {
   "id": "e_rnd_trg",
   "from": "rnd",
   "to": "trg",
   "exit": "r",
   "enter": "b",
   "kind": "flow"
  },
  {
   "id": "e_gcdx_trg",
   "from": "gcdx",
   "to": "trg",
   "exit": "t",
   "enter": "b",
   "kind": "flow"
  },
  {
   "id": "e_trg_fpair",
   "from": "trg",
   "to": "fpair",
   "exit": "t",
   "enter": "b",
   "kind": "flow",
   "label": "P0/P1 sets"
  },
  {
   "id": "e_fpair_fixs",
   "from": "fpair",
   "to": "fixs",
   "exit": "r",
   "enter": "t",
   "kind": "flow",
   "label": "serial (default)"
  },
  {
   "id": "e_fpair_par",
   "from": "fpair",
   "to": "par",
   "exit": "t",
   "enter": "t",
   "kind": "back",
   "via": [
    [
     11,
     0.5
    ],
    [
     1,
     0.5
    ]
   ],
   "label": "disjoint: a pair",
   "bound": "a pair at most, never wider",
   "src": [
    {
     "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
     "line": 65,
     "quote": "that is a pair under stage 4's rules, never wider"
    }
   ]
  }
 ],
 "scenarios": [
  {
   "id": "a",
   "title": "stage-4 pair, clean merge, then a serial fixer",
   "steps": [
    {
     "edge": "e_pln_par",
     "t": 0.0,
     "d": 0.7,
     "packet": "Parallel: line",
     "log": "plan: Parallel: Steps 2 + 3 \u2014 both long, disjoint files, no shared runtime; costs named"
    },
    {
     "edge": "e_par_spawn",
     "t": 0.8,
     "d": 0.8,
     "packet": "pair",
     "log": "master spawns two team-executors in one turn, unnamed, model pinned sonnet"
    },
    {
     "edge": "e_spawn_exA",
     "t": 1.7,
     "d": 0.8,
     "packet": "unit A",
     "log": "team-executor A: own worktree from the session HEAD (baseRef head)"
    },
    {
     "edge": "e_spawn_exB",
     "t": 1.7,
     "d": 0.8,
     "packet": "unit B",
     "log": "team-executor B: own worktree; no other writer runs until the pair lands"
    },
    {
     "edge": "e_exA_merge",
     "t": 2.8,
     "d": 0.9,
     "packet": "branch A",
     "log": "A reports done: branch name, worktree path, cold-build minutes"
    },
    {
     "edge": "e_exB_merge",
     "t": 2.8,
     "d": 0.9,
     "packet": "branch B",
     "log": "B reports done; one team-merger takes both branches"
    },
    {
     "edge": "e_merge_okq",
     "t": 3.9,
     "d": 0.8,
     "packet": "merge report",
     "log": "merger: build + targeted suites, git worktree list clean"
    },
    {
     "edge": "e_okq_rnd",
     "t": 4.8,
     "d": 0.8,
     "packet": "clean",
     "log": "both units landed clean; no team-reviewer"
    },
    {
     "edge": "e_rnd_trg",
     "t": 5.7,
     "d": 0.8,
     "packet": "codex-step<N>",
     "log": "per-step round on the merged range, --pin"
    },
    {
     "edge": "e_trg_fpair",
     "t": 6.7,
     "d": 0.8,
     "packet": "P1 verdict",
     "log": "codex-triage: one finding set"
    },
    {
     "edge": "e_fpair_fixs",
     "t": 7.6,
     "d": 0.8,
     "packet": "finding set",
     "log": "one set, or intersecting files: a serial fixer"
    }
   ]
  },
  {
   "id": "b",
   "title": "stage-4 pair: a unit stops short, a step-executor finishes",
   "steps": [
    {
     "edge": "e_pln_par",
     "t": 0.0,
     "d": 0.7,
     "packet": "Parallel: line",
     "log": "plan: Parallel: Steps 2 + 3 \u2014 both long, disjoint files, no shared runtime; costs named"
    },
    {
     "edge": "e_par_spawn",
     "t": 0.8,
     "d": 0.8,
     "packet": "pair",
     "log": "master spawns two team-executors in one turn, unnamed, model pinned sonnet"
    },
    {
     "edge": "e_spawn_exA",
     "t": 1.7,
     "d": 0.8,
     "packet": "unit A",
     "log": "team-executor A: own worktree from the session HEAD (baseRef head)"
    },
    {
     "edge": "e_spawn_exB",
     "t": 1.7,
     "d": 0.8,
     "packet": "unit B",
     "log": "team-executor B: own worktree; no other writer runs until the pair lands"
    },
    {
     "edge": "e_exA_merge",
     "t": 2.8,
     "d": 0.9,
     "packet": "branch A",
     "log": "A reports done: branch name, worktree path, cold-build minutes"
    },
    {
     "edge": "e_exB_merge",
     "t": 2.8,
     "d": 0.9,
     "packet": "branch B",
     "log": "B reports done; one team-merger takes both branches"
    },
    {
     "edge": "e_merge_okq",
     "t": 3.9,
     "d": 0.8,
     "packet": "merge report",
     "log": "merger: build + targeted suites, git worktree list clean"
    },
    {
     "edge": "e_okq_fin",
     "t": 4.8,
     "d": 0.9,
     "packet": "WIP: commit",
     "log": "unit B hit its cap: landed as a WIP: commit by the merger"
    },
    {
     "edge": "e_fin_rnd",
     "t": 5.8,
     "d": 0.8,
     "packet": "finished unit",
     "log": "step-executor finishes it on the session branch"
    },
    {
     "edge": "e_rnd_trg",
     "t": 6.7,
     "d": 0.8,
     "packet": "codex-step<N>",
     "log": "the round launches only after the unit is finished"
    }
   ]
  },
  {
   "id": "c",
   "title": "stage-4 pair: a red build goes to one fixer",
   "steps": [
    {
     "edge": "e_pln_par",
     "t": 0.0,
     "d": 0.7,
     "packet": "Parallel: line",
     "log": "plan: Parallel: Steps 2 + 3 \u2014 both long, disjoint files, no shared runtime; costs named"
    },
    {
     "edge": "e_par_spawn",
     "t": 0.8,
     "d": 0.8,
     "packet": "pair",
     "log": "master spawns two team-executors in one turn, unnamed, model pinned sonnet"
    },
    {
     "edge": "e_spawn_exA",
     "t": 1.7,
     "d": 0.8,
     "packet": "unit A",
     "log": "team-executor A: own worktree from the session HEAD (baseRef head)"
    },
    {
     "edge": "e_spawn_exB",
     "t": 1.7,
     "d": 0.8,
     "packet": "unit B",
     "log": "team-executor B: own worktree; no other writer runs until the pair lands"
    },
    {
     "edge": "e_exA_merge",
     "t": 2.8,
     "d": 0.9,
     "packet": "branch A",
     "log": "A reports done: branch name, worktree path, cold-build minutes"
    },
    {
     "edge": "e_exB_merge",
     "t": 2.8,
     "d": 0.9,
     "packet": "branch B",
     "log": "B reports done; one team-merger takes both branches"
    },
    {
     "edge": "e_merge_okq",
     "t": 3.9,
     "d": 0.8,
     "packet": "merge report",
     "log": "merger: build + targeted suites, git worktree list clean"
    },
    {
     "edge": "e_okq_fixm",
     "t": 4.8,
     "d": 0.9,
     "packet": "red build",
     "log": "conflict or red suite after the merge"
    },
    {
     "edge": "e_fixm_rnd",
     "t": 5.8,
     "d": 0.8,
     "packet": "fix commit",
     "log": "one fixer repairs it, red then green"
    },
    {
     "edge": "e_rnd_trg",
     "t": 6.7,
     "d": 0.8,
     "packet": "codex-step<N>",
     "log": "then the round on the merged range"
    }
   ]
  },
  {
   "id": "d",
   "title": "agent-teams: ask, plan gate, N units, review, merge, codex",
   "steps": [
    {
     "edge": "e_tsk_askf",
     "t": 0.0,
     "d": 0.7,
     "packet": "task",
     "log": "independent parts, no stated approach, no project preference"
    },
    {
     "edge": "e_askf_mech",
     "t": 0.8,
     "d": 0.8,
     "packet": "fan out",
     "log": "owner> 'fan out in parallel'"
    },
    {
     "edge": "e_mech_gate",
     "t": 1.7,
     "d": 0.8,
     "packet": "subagents",
     "log": "default mechanism: background subagents; the lead authors the plan"
    },
    {
     "edge": "e_gate_spawn",
     "t": 2.6,
     "d": 0.9,
     "packet": "approved plan",
     "log": "ExitPlanMode approved: the only gate; plan committed to docs/prompts/"
    },
    {
     "edge": "e_spawn_exA",
     "t": 3.6,
     "d": 0.8,
     "packet": "unit A",
     "log": "one background team-executor per unit, each in its own worktree"
    },
    {
     "edge": "e_spawn_exB",
     "t": 3.6,
     "d": 0.8,
     "packet": "unit B",
     "log": "contracts are pre-specified in each prompt; units never talk"
    },
    {
     "edge": "e_exA_trev",
     "t": 4.7,
     "d": 0.9,
     "packet": "diff A",
     "log": "team-reviewer (opus) verifies each unit diff"
    },
    {
     "edge": "e_exB_trev",
     "t": 4.7,
     "d": 0.9,
     "packet": "diff B",
     "log": "read-only, no worktree"
    },
    {
     "edge": "e_trev_merge",
     "t": 5.8,
     "d": 0.8,
     "packet": "APPROVE",
     "log": "only approved units go to team-merger"
    },
    {
     "edge": "e_merge_gcdx",
     "t": 6.8,
     "d": 0.9,
     "packet": "merged",
     "log": "merger removes each worktree and branch as it lands"
    },
    {
     "edge": "e_gcdx_trg",
     "t": 7.9,
     "d": 0.8,
     "packet": "whole-round<N>",
     "log": "ONE codex-challenge.sh <base>..HEAD on the merged diff"
    }
   ]
  },
  {
   "id": "e",
   "title": "fixer pair: disjoint finding sets run as a stage-4 pair",
   "steps": [
    {
     "edge": "e_pln_par",
     "t": 0.0,
     "d": 0.7,
     "packet": "Parallel: line",
     "log": "plan: Parallel: Steps 2 + 3 \u2014 both long, disjoint files, no shared runtime; costs named"
    },
    {
     "edge": "e_par_spawn",
     "t": 0.8,
     "d": 0.8,
     "packet": "pair",
     "log": "master spawns two team-executors in one turn, unnamed, model pinned sonnet"
    },
    {
     "edge": "e_spawn_exA",
     "t": 1.7,
     "d": 0.8,
     "packet": "unit A",
     "log": "team-executor A: own worktree from the session HEAD (baseRef head)"
    },
    {
     "edge": "e_spawn_exB",
     "t": 1.7,
     "d": 0.8,
     "packet": "unit B",
     "log": "team-executor B: own worktree; no other writer runs until the pair lands"
    },
    {
     "edge": "e_exA_merge",
     "t": 2.8,
     "d": 0.9,
     "packet": "branch A",
     "log": "A reports done: branch name, worktree path, cold-build minutes"
    },
    {
     "edge": "e_exB_merge",
     "t": 2.8,
     "d": 0.9,
     "packet": "branch B",
     "log": "B reports done; one team-merger takes both branches"
    },
    {
     "edge": "e_merge_okq",
     "t": 3.9,
     "d": 0.8,
     "packet": "merge report",
     "log": "merger: build + targeted suites, git worktree list clean"
    },
    {
     "edge": "e_okq_rnd",
     "t": 4.8,
     "d": 0.8,
     "packet": "clean",
     "log": "merged clean"
    },
    {
     "edge": "e_rnd_trg",
     "t": 5.7,
     "d": 0.8,
     "packet": "codex-step<N>",
     "log": "per-step round"
    },
    {
     "edge": "e_trg_fpair",
     "t": 6.7,
     "d": 0.8,
     "packet": "two P1 sets",
     "log": "codex-triage: two finding sets"
    },
    {
     "edge": "e_fpair_par",
     "t": 7.7,
     "d": 0.9,
     "packet": "disjoint",
     "log": "files do not intersect, a second look agrees: a pair under stage 4's rules, never wider"
    },
    {
     "edge": "e_par_spawn",
     "t": 8.8,
     "d": 0.8,
     "packet": "pair",
     "log": "back to the stage-4 rules: two writers, worktrees, one merge"
    }
   ]
  }
 ]
}
);
