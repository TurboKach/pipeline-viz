window.PV=window.PV||[];window.PV.push(
{
 "id": "feature",
 "title": "feature pipeline",
 "key": "1",
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
   "sub": "opus · xhigh"
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
 "cols": 16,
 "nodes": [
  {
   "id": "req",
   "lane": "owner",
   "col": 0,
   "kind": "input",
   "title": "REQUEST",
   "sub": "feature ask",
   "produces": "request",
   "card": {
    "actor": "owner",
    "model": "—",
    "does": "Asks for a change.",
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
   "sub": "which path?",
   "produces": "call line",
   "card": {
    "actor": "master",
    "model": "opus · xhigh (settings model + modelSettings)",
    "does": "States one-shot or pipeline in one line with the sizing facts, before the first edit and before loading feature-workflow. Pipeline = a design/product/UI/architectural choice, irreversible, a plan file, a multi-step arc or a fan-out. In doubt, ask in one line.",
    "inputs": [
     "request",
     "exploration facts"
    ],
    "artifacts": [
     "one call line"
    ],
    "gates": [
     {
      "rule": "One call line with its sizing facts before the first edit, including before feature-workflow loads.",
      "evidence": "the call line in the transcript, before the first edit and the feature-workflow load",
      "enforced_by": "analyze-arcs",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/global/CLAUDE.md",
        "line": 52,
        "quote": "state the call in one line before the first edit, always, including before loading `feature-workflow`"
       },
       {
        "file": "~/Dev/claude-code-setup/skills/analyze-arcs/scripts/analyze.py",
        "line": 427,
        "quote": "no one-shot/pipeline call line before feature-workflow loaded"
       }
      ]
     }
    ],
    "options": [],
    "metrics": [
     {
      "name": "feature-workflow sessions with a call line before the load (looser regex, the 09-12 analyzer fix)",
      "value": "17 of 22",
      "as_of": "2026-09-12",
      "src": [
       {
        "file": "~/.claude/projects/-Users-turbokach-Dev-claude-code-setup/memory/post-update-arcs-2026-09-12.md",
        "line": 47,
        "quote": "a looser regex finds a call line before the load in 17 of 22 FW sessions"
       },
       {
        "file": "~/Dev/claude-code-setup/skills/analyze-arcs/scripts/analyze.py",
        "line": 427,
        "quote": "no one-shot/pipeline call line before feature-workflow loaded"
       }
      ]
     }
    ],
    "gaps": [],
    "src": [
     {
      "file": "~/Dev/claude-code-setup/global/CLAUDE.md",
      "line": 55,
      "quote": "a design/product/UI/architectural choice, irreversible, a plan file, a real multi-step arc, or a parallel fan-out"
     },
     {
      "file": "~/Dev/claude-code-setup/global/CLAUDE.md",
      "line": 57,
      "quote": "In doubt between the two, ask in one line rather than defaulting to the heavier path."
     }
    ]
   }
  },
  {
   "id": "one",
   "lane": "sub",
   "col": 1,
   "kind": "output",
   "title": "ONE-SHOT",
   "sub": "see view 3",
   "produces": "diff + codex",
   "card": {
    "actor": "master inline, or one step-executor",
    "model": "sonnet when delegated",
    "does": "No plan mode and no plan-reviewer; the codex cross-review still runs on the diff. Mapped in view 3.",
    "inputs": [
     "call line: one-shot"
    ],
    "artifacts": [
     "commits",
     "codex-oneshot-round<N>.md"
    ],
    "gates": [],
    "options": [],
    "metrics": [],
    "gaps": [],
    "src": [
     {
      "file": "~/Dev/claude-code-setup/global/CLAUDE.md",
      "line": 54,
      "quote": "Do it inline if trivial, else one `step-executor` spawn with acceptance criteria + tests."
     }
    ]
   }
  },
  {
   "id": "disc",
   "lane": "owner",
   "col": 1,
   "kind": "human",
   "title": "1 DISCUSS",
   "sub": "2-3 options",
   "produces": "owner pick",
   "card": {
    "actor": "owner + master",
    "model": "opus · xhigh (settings model + modelSettings)",
    "does": "Master explores the problem space and constraints, brings one combined research summary, and presents 2-3 options with tradeoffs and a recommendation. The owner decides what is worth building. No code.",
    "inputs": [
     "sized request",
     "research summary"
    ],
    "artifacts": [
     "owner pick"
    ],
    "gates": [
     {
      "rule": "Big decisions are discussed first: 2-3 options with tradeoffs and a recommendation, never picked silently.",
      "evidence": "the owner's answer to the option-pick",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/global/CLAUDE.md",
        "line": 4,
        "quote": "Present 2–3 options with tradeoffs and a recommendation; don't pick silently."
       },
       {
        "file": "~/Dev/claude-code-setup/global/CLAUDE.md",
        "line": 29,
        "quote": "Taste/approval gates go through a real blocking primitive — AskUserQuestion or plan approval"
       }
      ]
     },
     {
      "rule": "Earn the gate: corner cases enumerated, the platform-convention option included, every named surface kept or explicitly deferred.",
      "evidence": "none",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/global/CLAUDE.md",
        "line": 43,
        "quote": "Before surfacing an option-pick or scope lock-in, do the homework"
       }
      ]
     }
    ],
    "options": [
     "pick one option",
     "push back / ask for more research",
     "not worth building"
    ],
    "metrics": [],
    "gaps": [],
    "src": [
     {
      "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
      "line": 14,
      "quote": "Explore the problem space, surface constraints, decide what's worth building. No code."
     },
     {
      "file": "~/Dev/claude-code-setup/global/CLAUDE.md",
      "line": 5,
      "quote": "bring me one combined summary of all threads and discuss before any decision gate, plan, or code"
     }
    ]
   }
  },
  {
   "id": "plan",
   "lane": "master",
   "col": 2,
   "kind": "stage",
   "title": "2 PLAN",
   "sub": "plan mode",
   "produces": "plan file",
   "card": {
    "actor": "master (authors the plan itself)",
    "model": "opus · xhigh (settings model + modelSettings)",
    "does": "EnterPlanMode, then the master writes the plan file once and edits it by section. Steps name their executor, are sized to ~100 tool calls, carry acceptance criteria; the plan holds the Parallel: line, an invariant and bound per new mechanism, Opus reasons and a taste list.",
    "inputs": [
     "owner pick",
     "explorer summaries"
    ],
    "artifacts": [
     "plan file"
    ],
    "gates": [
     {
      "rule": "In plan mode the master writes only the plan file named in the plan-mode system message.",
      "evidence": "none",
      "enforced_by": "harness",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
        "line": 15,
        "quote": "writing directly into the plan file named in the plan-mode system message"
       }
      ]
     },
     {
      "rule": "In plan mode the master reads no product file; discovery goes to explorer.",
      "evidence": "no 'master read N product file(s) in plan mode' flag in the arc report",
      "enforced_by": "analyze-arcs",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/global/CLAUDE.md",
        "line": 32,
        "quote": "Discovery goes to the kit's `explorer` (read-only, returns summaries)"
       },
       {
        "file": "~/Dev/claude-code-setup/skills/analyze-arcs/scripts/analyze.py",
        "line": 451,
        "quote": "master read {n} product file(s) in plan mode"
       }
      ]
     },
     {
      "rule": "Every execution step names the subagent that executes it, never the master.",
      "evidence": "plan-reviewer reports blocking=0",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/global/CLAUDE.md",
        "line": 33,
        "quote": "each execution step names the subagent it's delegated to"
       },
       {
        "file": "~/Dev/claude-code-setup/agents/plan-reviewer.md",
        "line": 15,
        "quote": "every execution step names its executor"
       }
      ]
     },
     {
      "rule": "Steps sized to roughly 100 tool calls: a step that edits or creates 7+ files is over it and is split.",
      "evidence": "plan-reviewer reports blocking=0",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
        "line": 17,
        "quote": "steps sized so an executor finishes in roughly ≤100 tool calls — a step that edits or creates 7+ files"
       }
      ]
     }
    ],
    "options": [],
    "metrics": [
     {
      "name": "plan-mode product reads flagged (10-05 report: 1; 65091608 and dcee3673 name product paths)",
      "value": "not re-checked",
      "as_of": "2026-10-12",
      "src": [
       {
        "file": "~/Dev/pipeline-watch/reports/2026-10-12.md",
        "line": 107,
        "quote": "| plan-mode reads | 1 | not re-checked (65091608, dcee3673 name product paths) |"
       },
       {
        "file": "~/Dev/claude-code-setup/skills/analyze-arcs/scripts/analyze.py",
        "line": 451,
        "quote": "master read {n} product file(s) in plan mode"
       }
      ]
     },
     {
      "name": "tool calls per executor step in two iOS app arcs, against the plan's ≤100-call sizing",
      "value": "150–240",
      "as_of": "2026-09-15",
      "src": [
       {
        "file": "~/.claude/projects/-Users-turbokach-Dev-claude-code-setup/memory/ios-app-arc-duration-baseline.md",
        "line": 13,
        "quote": "Every executor ran 150–240 tool calls against the plan's ≤100 sizing"
       }
      ]
     }
    ],
    "gaps": [
     {
      "text": "Tech debt: the analyzer's plan-mode read flag misses or misreads nine Bash shapes (LC_ALL=C cat, cat<file, # comments, rg --files, a heredoc apostrophe…), so this gate's evidence has known holes.",
      "kind": "tech-debt",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/docs/tech-debt.md",
        "line": 28,
        "quote": "plan-mode read flag tokenizer/window edges"
       }
      ]
     }
    ],
    "src": [
     {
      "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
      "line": 17,
      "quote": "more than 5 execution steps, or steps that together touch 40+ files, is two arcs"
     }
    ]
   }
  },
  {
   "id": "expl",
   "lane": "sub",
   "col": 2,
   "kind": "sub",
   "title": "explorer",
   "sub": "read-only search",
   "produces": "summary",
   "card": {
    "actor": "explorer",
    "model": "sonnet · medium (frontmatter)",
    "does": "Locates files, symbols and call sites; returns the conclusion first, then file:line with a one-line note. No file dumps.",
    "inputs": [
     "question + breadth"
    ],
    "artifacts": [
     "summary with file:line"
    ],
    "gates": [
     {
      "rule": "No Write or Edit tool in the agent definition.",
      "evidence": "none",
      "enforced_by": "frontmatter",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/agents/explorer.md",
        "line": 4,
        "quote": "tools: Read, Glob, Grep, Bash"
       }
      ]
     },
     {
      "rule": "Bash only for read-only commands.",
      "evidence": "none",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/agents/explorer.md",
        "line": 13,
        "quote": "Bash is for read-only commands"
       },
       {
        "file": "~/Dev/claude-code-setup/agents/explorer.md",
        "line": 20,
        "quote": "Read-only. Never Write, Edit, or run a state-changing command."
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
      "line": 39,
      "quote": "codebase search → the kit's `explorer` agent (sonnet, medium, read-only)"
     }
    ]
   }
  },
  {
   "id": "prev",
   "lane": "sub",
   "col": 3,
   "kind": "sub",
   "title": "3 VALIDATE",
   "sub": "plan-reviewer",
   "produces": "findings",
   "card": {
    "actor": "plan-reviewer",
    "model": "inherits the session model and effort (model: inherit)",
    "does": "Checks the plan file against the code, one read-only pass: names, executors, step and arc size, Parallel: line, call-site lists, invariants with bounds, test rules, Opus reasons. Returns blocking / advisory.",
    "inputs": [
     "plan file path",
     "feature request"
    ],
    "artifacts": [
     "findings: blocking / advisory"
    ],
    "gates": [
     {
      "rule": "Blocking findings go back into the master's own revision; re-review only after a material revision, never more than two passes.",
      "evidence": "the reviewer states blocking=0 explicitly",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
        "line": 20,
        "quote": "never more than two review passes"
       },
       {
        "file": "~/Dev/claude-code-setup/agents/plan-reviewer.md",
        "line": 54,
        "quote": "If nothing is blocking, say `blocking=0` explicitly."
       }
      ]
     },
     {
      "rule": "Advisory findings are reported to the owner at the gate, never looped on.",
      "evidence": "none",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
        "line": 20,
        "quote": "Advisory → reported to the user at the gate, never looped on."
       }
      ]
     },
     {
      "rule": "Spawned with no model: so it inherits the session model.",
      "evidence": "no 'plan-reviewer pinned … (doctrine: inherit)' flag in the arc report",
      "enforced_by": "analyze-arcs",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
        "line": 20,
        "quote": "spawn `plan-reviewer` (no `model:` — it inherits the session's model; read-only, one pass)"
       },
       {
        "file": "~/Dev/claude-code-setup/skills/analyze-arcs/scripts/analyze.py",
        "line": 434,
        "quote": "pinned {s['model']} (doctrine: inherit)"
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
   "id": "deleg",
   "lane": "master",
   "col": 3,
   "kind": "decision",
   "title": "DELEGATED?",
   "sub": "self-approval?",
   "produces": "approval path",
   "card": {
    "actor": "master",
    "model": "opus · xhigh (settings model + modelSettings)",
    "does": "Did the owner say 'approve the plan yourself'? Said before plan mode: no EnterPlanMode, plan-reviewer still runs, taste items take the simplest option, plan straight to docs/prompts/. Said inside plan mode: the owner must still approve ExitPlanMode.",
    "inputs": [
     "reviewed plan",
     "owner instruction"
    ],
    "artifacts": [
     "approval path"
    ],
    "gates": [
     {
      "rule": "Delegated before plan mode: plan-reviewer still runs, taste items take the simplest option, the delegation is recorded in the plan.",
      "evidence": "the delegation recorded in the plan file",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/global/CLAUDE.md",
        "line": 29,
        "quote": "plan-reviewer still runs, the plan file goes straight to `docs/prompts/`, taste items take the simplest option"
       },
       {
        "file": "~/Dev/claude-code-setup/global/CLAUDE.md",
        "line": 29,
        "quote": "the delegation is recorded in the plan"
       }
      ]
     },
     {
      "rule": "Delegated inside plan mode: nothing auto-approves ExitPlanMode; say in one line, before anything else, that only the owner's click or Shift+Tab leaves plan mode.",
      "evidence": "the owner's ExitPlanMode approval",
      "enforced_by": "harness",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/global/CLAUDE.md",
        "line": 29,
        "quote": "nothing auto-approves `ExitPlanMode` and only I can leave plan mode (Shift+Tab)"
       },
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
        "line": 20,
        "quote": "already in plan mode → say in one line that only the owner's click or Shift+Tab leaves plan mode"
       }
      ]
     }
    ],
    "options": [],
    "metrics": [
     {
      "name": "delegated approvals that blocked on ExitPlanMode, in the 25 arcs after the 09-04 fix",
      "value": "0 blocked",
      "as_of": "2026-09-12",
      "src": [
       {
        "file": "~/.claude/projects/-Users-turbokach-Dev-claude-code-setup/memory/post-update-arcs-2026-09-12.md",
        "line": 19,
        "quote": "delegated approval never blocked on ExitPlanMode"
       }
      ]
     },
     {
      "name": "unattended arcs blocked at ExitPlanMode after 'approve plan yourself', before the fix",
      "value": "2 × ~9 h",
      "as_of": "2026-09-04",
      "src": [
       {
        "file": "~/.claude/projects/-Users-turbokach-Dev-claude-code-setup/memory/post-update-arcs-2026-09-03.md",
        "line": 16,
        "quote": "ExitPlanMode blocked two unattended arcs ~9 h each"
       }
      ]
     }
    ],
    "gaps": [],
    "src": []
   }
  },
  {
   "id": "taste",
   "lane": "owner",
   "col": 3,
   "kind": "human",
   "title": "TASTE Q",
   "sub": "≤4 questions",
   "produces": "answers in plan",
   "card": {
    "actor": "owner",
    "model": "—",
    "does": "One AskUserQuestion with only the materially divergent taste items. Every item offers the recommended option and the simplest one (often remove it / do nothing). The answers are edited into the plan.",
    "inputs": [
     "taste / open-decisions list"
    ],
    "artifacts": [
     "answers edited into the plan"
    ],
    "gates": [
     {
      "rule": "Taste items go through one AskUserQuestion; it holds at most 4 questions.",
      "evidence": "the owner's AskUserQuestion answers, edited into the plan file",
      "enforced_by": "harness",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/global/CLAUDE.md",
        "line": 63,
        "quote": "surface only the materially-divergent taste items in one AskUserQuestion (it holds at most 4 questions)"
       },
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
        "line": 20,
        "quote": "edit the answers in"
       }
      ]
     },
     {
      "rule": "Every surfaced item's options include the simplest choice; no item is decided silently.",
      "evidence": "none",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/global/CLAUDE.md",
        "line": 63,
        "quote": "every surfaced item's options include the simplest choice"
       }
      ]
     }
    ],
    "options": [
     "the recommended option",
     "the simplest option (remove it / do nothing)"
    ],
    "metrics": [],
    "gaps": [],
    "src": []
   }
  },
  {
   "id": "appr",
   "lane": "owner",
   "col": 4,
   "kind": "human",
   "title": "3 APPROVE",
   "sub": "ExitPlanMode",
   "produces": "approved plan",
   "card": {
    "actor": "owner",
    "model": "—",
    "does": "Claude's native approval gate. The owner approves, or sends feedback; feedback goes back into the master's own revision of the plan file and through ExitPlanMode again.",
    "inputs": [
     "plan file",
     "advisory findings"
    ],
    "artifacts": [
     "approved plan"
    ],
    "gates": [
     {
      "rule": "Plan approval goes through ExitPlanMode, a real blocking primitive; silence, a default or a recommended option is never approval.",
      "evidence": "the owner's ExitPlanMode approval",
      "enforced_by": "harness",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
        "line": 20,
        "quote": "call `ExitPlanMode` — Claude's native approval gate"
       },
       {
        "file": "~/Dev/claude-code-setup/global/CLAUDE.md",
        "line": 29,
        "quote": "No answer → end the turn and wait (push-notify if I may be away)."
       }
      ]
     },
     {
      "rule": "Interactive gates run in the master: subagents cannot call AskUserQuestion or ExitPlanMode.",
      "evidence": "none",
      "enforced_by": "harness",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
        "line": 37,
        "quote": "Subagents are headless — they cannot call `AskUserQuestion` or `ExitPlanMode`"
       }
      ]
     },
     {
      "rule": "While a gate is open, no speculative work and nothing the answer could invalidate.",
      "evidence": "none",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/global/CLAUDE.md",
        "line": 30,
        "quote": "While a gate is open, never manufacture speculative work"
       }
      ]
     }
    ],
    "options": [
     "approve",
     "keep planning (feedback)"
    ],
    "metrics": [
     {
      "name": "gate waits >60 min over all ExitPlanMode and AskUserQuestion gates (10-05 report: 7); the one was a device-run go",
      "value": "1 wait >60 min",
      "as_of": "2026-10-12",
      "src": [
       {
        "file": "~/Dev/pipeline-watch/reports/2026-10-12.md",
        "line": 106,
        "quote": "| gate waits >60 min | 7 | 1 |"
       },
       {
        "file": "~/Dev/pipeline-watch/reports/2026-10-12.md",
        "line": 78,
        "quote": "92cf26e4 waited 150 minutes for the owner's camera run"
       },
       {
        "file": "~/Dev/claude-code-setup/skills/analyze-arcs/scripts/analyze.py",
        "line": 455,
        "quote": "ExitPlanMode waited {w} min for approval"
       }
      ]
     }
    ],
    "gaps": [
     {
      "text": "Tech debt: the ExitPlanMode wait flag pairs each exit with the next approval by time, not call id: a rejected exit is credited with a later approval's wait and never reported as rejected.",
      "kind": "tech-debt",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/docs/tech-debt.md",
        "line": 30,
        "quote": "ExitPlanMode wait-time flag pairs by time, not call id"
       }
      ]
     }
    ],
    "src": [
     {
      "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
      "line": 20,
      "quote": "\"No, keep planning\" feedback goes back to the master's own revision of the plan file"
     }
    ]
   }
  },
  {
   "id": "copy",
   "lane": "master",
   "col": 4,
   "kind": "stage",
   "title": "PLAN → REPO",
   "sub": "sha · task list",
   "produces": "plan commit",
   "card": {
    "actor": "master",
    "model": "opus · xhigh (settings model + modelSettings)",
    "does": "Copies the plan to docs/prompts/<feature>-plan.md and commits it, records the feature-base sha, mirrors the plan into the task list (one task per step plus the fixed tail, chained with addBlockedBy), then starts stage 4 unprompted.",
    "inputs": [
     "approved plan"
    ],
    "artifacts": [
     "docs/prompts/<feature>-plan.md",
     "feature-base sha",
     "task list"
    ],
    "gates": [
     {
      "rule": "Plan copied to docs/prompts/ and committed; the feature-base sha is recorded for the stage-5 range.",
      "evidence": "the plan-copy commit and the recorded base sha",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
        "line": 20,
        "quote": "on approval the master copies the plan file to `docs/prompts/<feature>-plan.md`"
       },
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
        "line": 20,
        "quote": "records the feature-base sha (`git rev-parse HEAD`) for the stage-5 range"
       }
      ]
     },
     {
      "rule": "The task list mirrors the plan: one task per step plus the fixed tail (codex clean, fix-or-defer, suite exits 0, handoff, no live agents).",
      "evidence": "the final TaskList in the closing report",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
        "line": 20,
        "quote": "mirrors the plan into the native **task list** (`TaskCreate`)"
       },
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
        "line": 21,
        "quote": "the closing report shows the final `TaskList`"
       }
      ]
     },
     {
      "rule": "Plan approval is the trigger: the first executor spawns in the same turn.",
      "evidence": "none",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
        "line": 38,
        "quote": "spawn the first executor in the same turn"
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
   "id": "exec",
   "lane": "sub",
   "col": 5,
   "kind": "sub",
   "title": "4 EXECUTE",
   "sub": "step-executor ×N",
   "produces": "commit per step",
   "card": {
    "actor": "step-executor (unnamed)",
    "model": "sonnet · high (pinned); opus when the plan marks the step with a reason",
    "does": "One step per spawn on the session branch, no worktree, the only writer in flight. Runs the build and the targeted suites its criteria name, commits, reports.",
    "inputs": [
     "plan step + acceptance criteria"
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
      "rule": "A step task completes only when its commit lands and its criteria are shown.",
      "evidence": "TaskUpdate completed after the commit and the shown criteria",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
        "line": 21,
        "quote": "never completed with failing tests or a partial fix"
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
      "rule": "No run_in_background inside a subagent.",
      "evidence": "none",
      "enforced_by": "hook",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/hooks/subagent-no-background.sh",
        "line": 6,
        "quote": "run_in_background:true inside a subagent (hook input carries agent_id"
       }
      ]
     },
     {
      "rule": "A bare pgrep/ps wait loop or an .output.done poll is denied; a wait runs once under the timeout command.",
      "evidence": "none",
      "enforced_by": "hook",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/hooks/subagent-no-background.sh",
        "line": 21,
        "quote": "a bare wait on a process — an until/while loop whose head tests"
       },
       {
        "file": "~/Dev/claude-code-setup/hooks/subagent-no-background.sh",
        "line": 13,
        "quote": "a poll loop on a <task>.output.done marker is denied everywhere"
       }
      ]
     }
    ],
    "options": [],
    "metrics": [
     {
      "name": "executor minutes (spawns), every executor spawn in the window (10-05 report: 2,437 (279))",
      "value": "1,615 (269)",
      "as_of": "2026-10-12",
      "src": [
       {
        "file": "~/Dev/pipeline-watch/reports/2026-10-12.md",
        "line": 101,
        "quote": "| executor vs fixer minutes (spawns) | 2,437 (279) vs 866 (135) | 1,615 (269) vs 350 (93) |"
       },
       {
        "file": "~/Dev/claude-code-setup/skills/analyze-arcs/scripts/analyze.py",
        "line": 469,
        "quote": "{mins(sub['first'], sub['last'])}"
       }
      ]
     }
    ],
    "gaps": [
     {
      "text": "Tech debt (subagent no-background arc bundle): the hook's rule A is bypassed by shell &, nohup, setsid and disown; rule B misses marker indirection and a loop inside bash -c; the deny text's pgrep -f wait matches same-named processes system-wide.",
      "kind": "tech-debt",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/docs/tech-debt.md",
        "line": 26,
        "quote": "Deferred from the subagent no-background arc"
       },
       {
        "file": "~/Dev/claude-code-setup/docs/todos/deferred-subagent-no-background-arc.md",
        "line": 11,
        "quote": "rule A is bypassed by shell &, nohup, setsid, disown"
       }
      ]
     }
    ],
    "src": []
   }
  },
  {
   "id": "scodex",
   "lane": "codex",
   "col": 6,
   "kind": "codex",
   "title": "STEP ROUND",
   "sub": "codex --pin",
   "produces": "codex-step<N>.md",
   "card": {
    "actor": "codex-challenge.sh, one background Bash in the master",
    "model": "gpt-6.1-sol · medium (CODEX_REVIEW_MODEL / _EFFORT)",
    "does": "Round N launches in the turn step N lands, on <previous round head>..HEAD, always --pin (a later executor may be writing). The last step gets no round. Correctness and requirement gaps only; bug-catching, not the gate.",
    "inputs": [
     "range <prev head>..<head>"
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
        "quote": "# codex challenge — range $base..$head"
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
    "gaps": [
     {
      "text": "Tech debt: no escape-rate metric. Nobody counts stage-5 real P0/P1 in code that already passed its per-step round, so per-step rounds cannot be judged on value against their wall time and codex quota.",
      "kind": "tech-debt",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/docs/tech-debt.md",
        "line": 33,
        "quote": "no escape-rate metric for per-step codex rounds"
       },
       {
        "file": "~/Dev/claude-code-setup/docs/todos/escape-rate-metric.md",
        "line": 7,
        "quote": "Per-step rounds cost wall time and codex quota"
       }
      ]
     }
    ],
    "src": [
     {
      "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
      "line": 21,
      "quote": "the last step gets no per-step round, stage 5 covers it"
     },
     {
      "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
      "line": 21,
      "quote": "Per-step rounds flag correctness and requirement gaps only — no style, no speculative hardening"
     }
    ]
   }
  },
  {
   "id": "stri",
   "lane": "sub",
   "col": 6,
   "kind": "sub",
   "title": "codex-triage",
   "sub": "step verdict",
   "produces": "verdict ≤2k",
   "card": {
    "actor": "codex-triage (fresh per round)",
    "model": "sonnet · medium (frontmatter)",
    "does": "Reads the round file, checks each finding against git show <head>:<path>, returns the verdict with counts per class.",
    "inputs": [
     "codex-step<N>.md",
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
     }
    ],
    "options": [],
    "metrics": [],
    "gaps": [],
    "src": []
   }
  },
  {
   "id": "sdec",
   "lane": "master",
   "col": 6,
   "kind": "decision",
   "title": "STEP P0/P1?",
   "sub": "fix before next",
   "produces": "spawn or fix",
   "card": {
    "actor": "master",
    "model": "opus · xhigh (settings model + modelSettings)",
    "does": "P0/P1 in a step verdict go to one fixer before the next executor that depends on the reviewed step. A step blocked by nothing pending spawns as soon as the writer in flight lands.",
    "inputs": [
     "step verdict",
     "task list (addBlockedBy)"
    ],
    "artifacts": [
     "next spawn"
    ],
    "gates": [
     {
      "rule": "An executor spawns only when every step it is blocked by has its verdict in and its P0/P1 fixed.",
      "evidence": "the blocking steps' verdicts with zero open P0/P1, or the fixer's red-then-green report",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
        "line": 21,
        "quote": "an executor spawns only when every step it is blocked by has its per-step verdict in and its P0/P1 fixed"
       }
      ]
     }
    ],
    "options": [],
    "metrics": [],
    "gaps": [
     {
      "text": "Tech debt: the stage-3 chain can unblock a dependent and an independent step at once; that no step-executor runs beside a team-executor rests on 'the only writer in flight', a derived precondition. Declined; the fix if it bites is one clause in stage 4.",
      "kind": "tech-debt",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/docs/tech-debt.md",
        "line": 20,
        "quote": "mixed dependency graph relies on a derived precondition"
       }
      ]
     }
    ],
    "src": []
   }
  },
  {
   "id": "sfix",
   "lane": "sub",
   "col": 7,
   "kind": "sub",
   "title": "fixer",
   "sub": "step P0/P1",
   "produces": "fix commit",
   "card": {
    "actor": "fixer (unnamed)",
    "model": "sonnet · high (pinned); opus when a mechanism survived an earlier round",
    "does": "Fixes the step verdict's P0/P1 on the session branch before the dependent executor spawns; its commit falls into the next round's range.",
    "inputs": [
     "plan section",
     "diff range",
     "P0/P1 finding set"
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
    "src": []
   }
  },
  {
   "id": "suite",
   "lane": "master",
   "col": 7,
   "kind": "stage",
   "title": "FULL SUITE",
   "sub": "after last step",
   "produces": "run counts",
   "card": {
    "actor": "master (one background Bash)",
    "model": "opus · xhigh (settings model + modelSettings)",
    "does": "The final execution task: the whole test suite as one run_in_background Bash with gtimeout 3600 and timeout 7200000. Never per step.",
    "inputs": [
     "last step landed"
    ],
    "artifacts": [
     "suite counts"
    ],
    "gates": [
     {
      "rule": "The whole suite runs once after the last step lands, never per step.",
      "evidence": "the runner's executed/skipped/failed counts",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
        "line": 21,
        "quote": "the whole test suite runs once after the last step lands"
       }
      ]
     },
     {
      "rule": "Long runs are backgrounded with an explicit gtimeout, never unbounded.",
      "evidence": "none",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
        "line": 62,
        "quote": "A full test suite runs as one `run_in_background` Bash with `gtimeout 3600` ahead of the command."
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
   "id": "wcodex",
   "lane": "codex",
   "col": 8,
   "kind": "codex",
   "title": "5 CHALLENGE",
   "sub": "whole range",
   "produces": "round<N>.md",
   "card": {
    "actor": "codex-challenge.sh, one background Bash in the master",
    "model": "gpt-6.1-sol · medium (CODEX_REVIEW_MODEL / _EFFORT)",
    "does": "ONE challenge on <feature-base-sha>..HEAD, no --pin (nothing writes during the gate). Each round writes its own --out file. The runner traces out of the diff into the state it perturbs.",
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
        "quote": "# codex challenge — range $base..$head"
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
    "metrics": [
     {
      "name": "whole-range rounds per feature, median (22 high- and 16 medium-effort fixer arcs)",
      "value": "median 2",
      "as_of": "2026-09-29",
      "src": [
       {
        "file": "~/.claude/projects/-Users-turbokach-Dev-claude-code-setup/memory/fixer-high-effort-trial.md",
        "line": 38,
        "quote": "median rounds: 2 in both;"
       }
      ]
     },
     {
      "name": "whole-range rounds in the free-canvas arc, before the two-round cap (findings 17/15/12/11)",
      "value": "4, unconverged",
      "as_of": "2026-09-15",
      "src": [
       {
        "file": "~/.claude/projects/-Users-turbokach-Dev-claude-code-setup/memory/ios-app-arc-2026-09-14.md",
        "line": 13,
        "quote": "rounds returned 17/15/12/11 findings; never converged"
       }
      ]
     }
    ],
    "gaps": [
     {
      "text": "Tech debt: nothing records the HEAD the gate verified, so the whole-range-at-one-HEAD rule is kept in mind only; commits after the clean verdict ship under a review that never saw them. Proposed: a git note per verified commit.",
      "kind": "tech-debt",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/docs/tech-debt.md",
        "line": 32,
        "quote": "no record of the verified HEAD, nothing checks it at push"
       },
       {
        "file": "~/Dev/claude-code-setup/docs/todos/verified-head-record.md",
        "line": 8,
        "quote": "is a rule the master keeps in mind; nothing enforces it"
       }
      ]
     }
    ],
    "src": [
     {
      "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
      "line": 22,
      "quote": "no `--pin` (nothing writes during the gate"
     }
    ]
   }
  },
  {
   "id": "spec",
   "lane": "sub",
   "col": 8,
   "kind": "sub",
   "title": "spec-reviewer",
   "sub": "plan vs diff",
   "produces": "gap list",
   "card": {
    "actor": "spec-reviewer (parallel to codex)",
    "model": "sonnet · medium (frontmatter)",
    "does": "Reads the approved plan and <feature-base-sha>...HEAD; reports missing-requirement, scope-creep and wrong-logic lines only. No style, no fixes.",
    "inputs": [
     "plan file",
     "feature range"
    ],
    "artifacts": [
     "tagged gap lines"
    ],
    "gates": [
     {
      "rule": "Gaps only. A missing requirement routes into the P0/P1 lane; scope creep is reported at the gate.",
      "evidence": "tagged gap lines, or one line saying the range satisfies the plan",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
        "line": 22,
        "quote": "A missing requirement routes into the P0/P1 lane; scope creep is reported at the gate."
       },
       {
        "file": "~/Dev/claude-code-setup/agents/spec-reviewer.md",
        "line": 29,
        "quote": "If the range fully satisfies the plan, say so in one line"
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
   "id": "tri",
   "lane": "sub",
   "col": 9,
   "kind": "sub",
   "title": "codex-triage",
   "sub": "P0 / P1 / P2",
   "produces": "verdict ≤2k",
   "card": {
    "actor": "codex-triage (fresh per round)",
    "model": "sonnet · medium (frontmatter)",
    "does": "Classes each verified finding real / regression / test-gap / theoretical; real and regression lines get P0/P1/P2, every line a confidence. One line per finding, ≤2,000 chars, counts on the first line.",
    "inputs": [
     "round file(s)",
     "range",
     "head sha"
    ],
    "artifacts": [
     "triaged verdict"
    ],
    "gates": [
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
     }
    ],
    "options": [],
    "metrics": [
     {
      "name": "P1 findings per whole-range round (22 high- and 16 medium-effort fixer arcs)",
      "value": "0.4 / round",
      "as_of": "2026-09-29",
      "src": [
       {
        "file": "~/.claude/projects/-Users-turbokach-Dev-claude-code-setup/memory/fixer-high-effort-trial.md",
        "line": 39,
        "quote": "P1 rate: 0.4 per round in both;"
       }
      ]
     },
     {
      "name": "codex-triage spawns / minutes in one arc (framed-slot, 3 sub-arcs)",
      "value": "19 / ~15 min",
      "as_of": "2026-09-16",
      "src": [
       {
        "file": "~/.claude/projects/-Users-turbokach-Dev-claude-code-setup/memory/ios-app-arc-2026-09-15.md",
        "line": 10,
        "quote": "triage 19 / ~15 min"
       }
      ]
     }
    ],
    "gaps": [
     {
      "text": "Tech debt: two Sonnet 5.5 runs of the same recorded round disagreed on 32–50% of must-fix lines (confounded). Measure the variance, then decide whether P1/P2 need tighter boundaries.",
      "kind": "tech-debt",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/docs/tech-debt.md",
        "line": 14,
        "quote": "must-fix calls vary between two runs of the same round"
       }
      ]
     },
     {
      "text": "Tech debt: no fallback when the real and regression lines alone exceed the 2,000-char verdict cap. Declined: it needs ~22+ real findings, and such a verdict is not clean anyway.",
      "kind": "tech-debt",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/docs/tech-debt.md",
        "line": 21,
        "quote": "no fallback if real+regression lines alone exceed the cap"
       }
      ]
     }
    ],
    "src": []
   }
  },
  {
   "id": "clean",
   "lane": "master",
   "col": 9,
   "kind": "decision",
   "title": "P0 / P1 ?",
   "sub": "clean = 0 P0/P1",
   "produces": "route",
   "card": {
    "actor": "master",
    "model": "opus · xhigh (settings model + modelSettings)",
    "does": "Recomputes the counts from the finding lines. Round 1 P0/P1 go to fixers, one per finding set plus adjacent P2s. Round 2 is final: open P1 deferred, open P0 or a contract change to the owner. Same mechanism twice: a mechanism fixer.",
    "inputs": [
     "triaged verdict",
     "spec-reviewer gaps"
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
     },
     {
      "rule": "Same mechanism twice: stop patching paths; the mechanism becomes the fixer's brief.",
      "evidence": "the round's report names the mechanism",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
        "line": 66,
        "quote": "Same mechanism twice = stop patching paths."
       },
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
        "line": 66,
        "quote": "Say so in the round's report, and make the mechanism the fixer's brief"
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
      "quote": "one fresh fixer per finding set → re-challenge"
     }
    ]
   }
  },
  {
   "id": "fix",
   "lane": "sub",
   "col": 10,
   "kind": "sub",
   "title": "fixer",
   "sub": "one finding set",
   "produces": "fix commits",
   "card": {
    "actor": "fixer (fresh per finding set)",
    "model": "sonnet · high (pinned); opus when a mechanism survived an earlier round",
    "does": "Briefed with the plan section, the diff range and one finding set: the defect and the invariant, never the patch. A same-mechanism set goes to one mechanism-fixer that also removes the now-redundant per-path patches.",
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
      "evidence": "the arc report's 'fixer pinned opus' flag ends in '— reason stated'",
      "enforced_by": "analyze-arcs",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
        "line": 66,
        "quote": "The fixer runs on Opus here, with a one-line reason stated at the spawn."
       },
       {
        "file": "~/Dev/claude-code-setup/skills/analyze-arcs/scripts/analyze.py",
        "line": 438,
        "quote": "pinned {s['model']} (doctrine {want})"
       },
       {
        "file": "~/Dev/claude-code-setup/skills/analyze-arcs/scripts/analyze.py",
        "line": 361,
        "quote": "' — reason stated' if reason else ' — no reason in prompt'"
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
     }
    ],
    "options": [],
    "metrics": [
     {
      "name": "fixer minutes (spawns), every fixer spawn, step and stage 5 (10-05 report: 866 (135))",
      "value": "350 (93)",
      "as_of": "2026-10-12",
      "src": [
       {
        "file": "~/Dev/pipeline-watch/reports/2026-10-12.md",
        "line": 101,
        "quote": "| executor vs fixer minutes (spawns) | 2,437 (279) vs 866 (135) | 1,615 (269) vs 350 (93) |"
       },
       {
        "file": "~/Dev/claude-code-setup/skills/analyze-arcs/scripts/analyze.py",
        "line": 469,
        "quote": "{mins(sub['first'], sub['last'])}"
       }
      ]
     },
     {
      "name": "fixer vs executor minutes in the non-convergent free-canvas arc (14 vs 11 spawns)",
      "value": "471 vs 343 min",
      "as_of": "2026-09-15",
      "src": [
       {
        "file": "~/.claude/projects/-Users-turbokach-Dev-claude-code-setup/memory/ios-app-arc-2026-09-14.md",
        "line": 13,
        "quote": "fixers 471 min vs executors 343 min"
       }
      ]
     }
    ],
    "gaps": [],
    "src": []
   }
  },
  {
   "id": "struct",
   "lane": "owner",
   "col": 10,
   "kind": "human",
   "title": "STRUCTURAL?",
   "sub": "fix > the plan",
   "produces": "fix scope",
   "card": {
    "actor": "owner",
    "model": "—",
    "does": "Raised when the same-mechanism fix is materially larger than the plan's design contract anticipated: the owner decides the scope, not the master.",
    "inputs": [
     "mechanism finding set"
    ],
    "artifacts": [
     "fix scope"
    ],
    "gates": [
     {
      "rule": "A structural fix materially larger than the plan's design contract is an AskUserQuestion, not a judgment call.",
      "evidence": "the owner's answer",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
        "line": 66,
        "quote": "that is an AskUserQuestion (structural fix / patch this path and carry the rest), not a judgment call"
       }
      ]
     }
    ],
    "options": [
     "structural fix",
     "patch this path and carry the rest"
    ],
    "metrics": [],
    "gaps": [],
    "src": []
   }
  },
  {
   "id": "contract",
   "lane": "owner",
   "col": 11,
   "kind": "human",
   "title": "CONTRACT / P0",
   "sub": "not in fix loop",
   "produces": "defer or ship",
   "card": {
    "actor": "owner",
    "model": "—",
    "does": "A contract the plan did not change (wire schema, API field, persisted model) never changes in the fix loop. After round 2 an open P0 also comes here: a P0 never ships.",
    "inputs": [
     "contract-touching finding",
     "open P0 after round 2"
    ],
    "artifacts": [
     "decision"
    ],
    "gates": [
     {
      "rule": "A contract the plan did not change never changes from the fix loop: defer to its own arc or ship as-is, never fix here.",
      "evidence": "the owner's answer",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
        "line": 22,
        "quote": "**A contract the plan did not change never changes from the fix loop**"
       },
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
        "line": 22,
        "quote": "That gate's options are *defer to its own arc*"
       }
      ]
     },
     {
      "rule": "After round 2 an open P0 goes to one AskUserQuestion; a P0 never ships.",
      "evidence": "the owner's answer",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
        "line": 22,
        "quote": "an open P0 goes to one AskUserQuestion (structural fix in its own arc, or defer — a P0 never ships)"
       }
      ]
     }
    ],
    "options": [
     "contract: defer to its own arc",
     "contract: ship as-is",
     "open P0: structural fix in its own arc",
     "open P0: defer (it never ships)"
    ],
    "metrics": [],
    "gaps": [],
    "src": []
   }
  },
  {
   "id": "fod",
   "lane": "owner",
   "col": 12,
   "kind": "human",
   "title": "FIX OR DEFER",
   "sub": "standalone list",
   "produces": "decision",
   "card": {
    "actor": "owner",
    "model": "—",
    "does": "Once the verdict is clean or stopped: ONE AskUserQuestion listing the union of standalone P2, test-gap and theoretical findings across every round's verdict file.",
    "inputs": [
     "every round's verdict file"
    ],
    "artifacts": [
     "decision"
    ],
    "gates": [
     {
      "rule": "Standalone P2 / test-gap / theoretical findings are never looped on; one question lists the union across all rounds.",
      "evidence": "the owner's answer",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
        "line": 22,
        "quote": "Standalone P2, test-gap and theoretical findings are never looped on"
       }
      ]
     }
    ],
    "options": [
     "fix now (one fixer for the set)",
     "defer to the tech-debt file",
     "let me pick"
    ],
    "metrics": [],
    "gaps": [],
    "src": [
     {
      "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
      "line": 22,
      "quote": "*fix now* (one fixer spawn for the set) / *defer to the project's tech-debt file* / *let me pick*"
     }
    ]
   }
  },
  {
   "id": "index",
   "lane": "master",
   "col": 12,
   "kind": "stage",
   "title": "INDEX LINE",
   "sub": "→ docs/reviews",
   "produces": "TODOS.md line",
   "card": {
    "actor": "master",
    "model": "opus · xhigh (settings model + modelSettings)",
    "does": "Copies the round's verdict file to docs/reviews/<feature>/<round>.md and writes one index line per deferred finding to TODOS.md (or docs/tech-debt.md), committed with the feature.",
    "inputs": [
     "deferred findings",
     "round verdict file"
    ],
    "artifacts": [
     "index line(s)",
     "docs/reviews/<feature>/<round>.md"
    ],
    "gates": [
     {
      "rule": "One index line per deferred finding, pointing at the committed verdict file.",
      "evidence": "the commit with the index line(s) and the verdict file",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
        "line": 22,
        "quote": "writes one **index line** per deferred finding"
       },
       {
        "file": "~/Dev/claude-code-setup/global/CLAUDE.md",
        "line": 46,
        "quote": "gets ONE line in the project's `TODOS.md` (or `docs/tech-debt.md` if it has none)"
       }
      ]
     },
     {
      "rule": "After round 2 an open P1 is deferred with an index line and named at the push gate.",
      "evidence": "the P1 index line; the push-gate report names it",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
        "line": 22,
        "quote": "After round 2, an open P1 is deferred with an index line (the tech-debt path below) and named at the push gate"
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
   "id": "close",
   "lane": "master",
   "col": 13,
   "kind": "stage",
   "title": "CLOSE-OUT",
   "sub": "suite again",
   "produces": "tail tasks done",
   "card": {
    "actor": "master",
    "model": "opus · xhigh (settings model + modelSettings)",
    "does": "The fixed tail: the whole suite again after the fix loop, handoff written, no live agents and no executor worktrees, watchdog cron deleted. The arc is complete when no task is open.",
    "inputs": [
     "clean or final verdict"
    ],
    "artifacts": [
     "suite counts",
     "final TaskList"
    ],
    "gates": [
     {
      "rule": "The suite runs again after the fix loop and exits 0 with its output shown.",
      "evidence": "the runner's executed/skipped/failed counts, exit 0",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
        "line": 21,
        "quote": "and again after the fix loop — never per step"
       },
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
        "line": 20,
        "quote": "test suite exits 0 with output shown"
       }
      ]
     },
     {
      "rule": "Zero live agents before the arc is declared complete.",
      "evidence": "ListAgents shows no running subagent and git worktree list shows no executor worktree",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
        "line": 52,
        "quote": "Before declaring an arc complete, enumerate live agents and confirm zero remain"
       },
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
        "line": 36,
        "quote": "`CronDelete` it at the no-live-agents checkpoint"
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
   "id": "push",
   "lane": "owner",
   "col": 14,
   "kind": "human",
   "title": "6 PUSH",
   "sub": "owner approval",
   "produces": "approved push",
   "card": {
    "actor": "owner",
    "model": "—",
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
        "quote": "`git push` — any remote, any branch — only after my explicit approval in the session."
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
     }
    ],
    "options": [
     "push",
     "hold: the work stays local"
    ],
    "metrics": [],
    "gaps": [
     {
      "text": "Tech debt: at push nothing compares HEAD with the verified head; on 10-12, 3 of 6 masters pushed past the gated head. Proposed: a PreToolUse hook on git push that denies a push whose HEAD differs from the newest clean record.",
      "kind": "tech-debt",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/docs/tech-debt.md",
        "line": 32,
        "quote": "git-note record per verified commit (verdict, test counts, doctrine fingerprint) + a `git push` hook"
       },
       {
        "file": "~/Dev/claude-code-setup/docs/todos/verified-head-record.md",
        "line": 12,
        "quote": "and 3 pushed past the gated head"
       }
      ]
     },
     {
      "text": "Report C1: after the final verdict, 3 masters re-ran codex on a docs-only delta and 3 pushed past the gated head as 'docs only'. Proposal: a commit touching only docs/reviews/, docs/todos/, the index or handoff docs does not reopen the gate; the push gate shows the diff stat.",
      "kind": "report",
      "src": [
       {
        "file": "~/Dev/pipeline-watch/reports/2026-10-12.md",
        "line": 37,
        "quote": "Masters split 3–3 on docs-only commits made after the final verdict."
       },
       {
        "file": "~/Dev/pipeline-watch/reports/2026-10-12.md",
        "line": 45,
        "quote": "show `git diff --stat <gated-head>..HEAD` at the push gate"
       }
      ]
     },
     {
      "text": "Tech debt (codex-challenge arc bundle, item 15): the push-approval gate is prose only, with no PreToolUse hook. Considered and rejected while no push-without-approval incident is recorded.",
      "kind": "tech-debt",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/docs/todos/deferred-codex-challenge-arc.md",
        "line": 23,
        "quote": "push-approval gate is prose-only, no PreToolUse hook"
       }
      ]
     }
    ],
    "src": [
     {
      "file": "~/Dev/claude-code-setup/global/CLAUDE.md",
      "line": 26,
      "quote": "never as an obligation to ask when I've said the work stays local"
     }
    ]
   }
  },
  {
   "id": "ship",
   "lane": "master",
   "col": 14,
   "kind": "stage",
   "title": "PR → MERGE",
   "sub": "+ deploy",
   "produces": "merged, deployed",
   "card": {
    "actor": "master",
    "model": "opus · xhigh (settings model + modelSettings)",
    "does": "After the approved push: PR, then merge and deploy.",
    "inputs": [
     "pushed branch"
    ],
    "artifacts": [
     "PR",
     "deploy"
    ],
    "gates": [],
    "options": [],
    "metrics": [],
    "gaps": [],
    "src": [
     {
      "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
      "line": 31,
      "quote": "**Ship** → push (owner-approved) → PR → merge + deploy → post-deploy verify."
     }
    ]
   }
  },
  {
   "id": "verify",
   "lane": "master",
   "col": 15,
   "kind": "output",
   "title": "VERIFY",
   "sub": "post-deploy",
   "produces": "flow evidence",
   "card": {
    "actor": "master",
    "model": "opus · xhigh (settings model + modelSettings)",
    "does": "Post-deploy verify: drives the real user-facing flow end to end and shows the evidence.",
    "inputs": [
     "deployed build"
    ],
    "artifacts": [
     "real-flow evidence"
    ],
    "gates": [
     {
      "rule": "Green unit tests are not done: exercise the real flow end-to-end and show the evidence, or name the manual test.",
      "evidence": "the shown real-flow evidence (/browse, device or simulator render)",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/global/CLAUDE.md",
        "line": 20,
        "quote": "exercise the real user-facing flow end-to-end and show the evidence"
       },
       {
        "file": "~/Dev/claude-code-setup/global/CLAUDE.md",
        "line": 20,
        "quote": "If you cannot exercise the flow yourself, say so and name the manual test needed"
       }
      ]
     }
    ],
    "options": [],
    "metrics": [],
    "gaps": [],
    "src": []
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
   "id": "e_size_disc",
   "from": "size",
   "to": "disc",
   "exit": "t",
   "enter": "b",
   "kind": "flow",
   "label": "pipeline"
  },
  {
   "id": "e_size_one",
   "from": "size",
   "to": "one",
   "exit": "b",
   "enter": "t",
   "kind": "alt",
   "label": "one-shot"
  },
  {
   "id": "e_disc_plan",
   "from": "disc",
   "to": "plan",
   "exit": "r",
   "enter": "t",
   "kind": "flow",
   "label": "pick"
  },
  {
   "id": "e_plan_expl",
   "from": "plan",
   "to": "expl",
   "exit": "b",
   "enter": "t",
   "kind": "flow"
  },
  {
   "id": "e_expl_plan",
   "from": "expl",
   "to": "plan",
   "exit": "t",
   "enter": "b",
   "kind": "flow"
  },
  {
   "id": "e_plan_prev",
   "from": "plan",
   "to": "prev",
   "exit": "r",
   "enter": "l",
   "kind": "flow"
  },
  {
   "id": "e_prev_plan",
   "from": "prev",
   "to": "plan",
   "exit": "b",
   "enter": "l",
   "kind": "back",
   "via": [
    [
     1.5,
     2.5
    ],
    [
     1.5,
     1.5
    ]
   ],
   "label": "blocking: revise",
   "bound": "≤2 review passes",
   "src": [
    {
     "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
     "line": 20,
     "quote": "never more than two review passes"
    }
   ]
  },
  {
   "id": "e_prev_deleg",
   "from": "prev",
   "to": "deleg",
   "exit": "t",
   "enter": "b",
   "kind": "flow"
  },
  {
   "id": "e_deleg_taste",
   "from": "deleg",
   "to": "taste",
   "exit": "t",
   "enter": "b",
   "kind": "flow",
   "label": "no"
  },
  {
   "id": "e_deleg_copy",
   "from": "deleg",
   "to": "copy",
   "exit": "r",
   "enter": "l",
   "kind": "alt"
  },
  {
   "id": "e_taste_appr",
   "from": "taste",
   "to": "appr",
   "exit": "r",
   "enter": "l",
   "kind": "flow"
  },
  {
   "id": "e_appr_plan",
   "from": "appr",
   "to": "plan",
   "exit": "t",
   "enter": "t",
   "kind": "back",
   "via": [
    [
     4,
     -0.5
    ]
   ],
   "label": "keep planning",
   "bound": "none"
  },
  {
   "id": "e_appr_copy",
   "from": "appr",
   "to": "copy",
   "exit": "b",
   "enter": "t",
   "kind": "flow",
   "label": "approve"
  },
  {
   "id": "e_copy_exec",
   "from": "copy",
   "to": "exec",
   "exit": "r",
   "enter": "t",
   "kind": "flow"
  },
  {
   "id": "e_exec_suite",
   "from": "exec",
   "to": "suite",
   "exit": "t",
   "enter": "t",
   "kind": "flow",
   "via": [
    [
     5.5,
     0.5
    ]
   ],
   "label": "last step: no round"
  },
  {
   "id": "e_sdec_exec",
   "from": "sdec",
   "to": "exec",
   "exit": "l",
   "enter": "t",
   "kind": "back",
   "label": "next step",
   "bound": "≤5 steps per arc",
   "src": [
    {
     "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
     "line": 17,
     "quote": "more than 5 execution steps, or steps that together touch 40+ files, is two arcs"
    }
   ]
  },
  {
   "id": "e_exec_scodex",
   "from": "exec",
   "to": "scodex",
   "exit": "b",
   "enter": "l",
   "kind": "flow",
   "label": "--pin"
  },
  {
   "id": "e_scodex_stri",
   "from": "scodex",
   "to": "stri",
   "exit": "t",
   "enter": "b",
   "kind": "flow"
  },
  {
   "id": "e_stri_sdec",
   "from": "stri",
   "to": "sdec",
   "exit": "t",
   "enter": "b",
   "kind": "flow"
  },
  {
   "id": "e_sdec_sfix",
   "from": "sdec",
   "to": "sfix",
   "exit": "b",
   "enter": "t",
   "kind": "flow",
   "label": "P0/P1"
  },
  {
   "id": "e_sfix_exec",
   "from": "sfix",
   "to": "exec",
   "exit": "b",
   "enter": "b",
   "kind": "back",
   "via": [
    [
     7,
     2.5
    ]
   ],
   "label": "then next step",
   "bound": "≤5 steps per arc",
   "src": [
    {
     "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
     "line": 17,
     "quote": "more than 5 execution steps, or steps that together touch 40+ files, is two arcs"
    }
   ]
  },
  {
   "id": "e_suite_spec",
   "from": "suite",
   "to": "spec",
   "exit": "r",
   "enter": "t",
   "kind": "flow"
  },
  {
   "id": "e_suite_wcodex",
   "from": "suite",
   "to": "wcodex",
   "exit": "r",
   "enter": "l",
   "kind": "flow"
  },
  {
   "id": "e_spec_clean",
   "from": "spec",
   "to": "clean",
   "exit": "t",
   "enter": "l",
   "kind": "flow"
  },
  {
   "id": "e_wcodex_tri",
   "from": "wcodex",
   "to": "tri",
   "exit": "r",
   "enter": "b",
   "kind": "flow"
  },
  {
   "id": "e_tri_clean",
   "from": "tri",
   "to": "clean",
   "exit": "t",
   "enter": "b",
   "kind": "flow"
  },
  {
   "id": "e_clean_fod",
   "from": "clean",
   "to": "fod",
   "exit": "t",
   "enter": "t",
   "kind": "flow",
   "via": [
    [
     9.5,
     -0.5
    ]
   ],
   "label": "clean / round 2 final"
  },
  {
   "id": "e_clean_contract",
   "from": "clean",
   "to": "contract",
   "exit": "t",
   "enter": "b",
   "kind": "flow",
   "label": "contract / open P0"
  },
  {
   "id": "e_clean_struct",
   "from": "clean",
   "to": "struct",
   "exit": "r",
   "enter": "l",
   "kind": "flow"
  },
  {
   "id": "e_clean_index",
   "from": "clean",
   "to": "index",
   "exit": "r",
   "enter": "l",
   "kind": "flow",
   "label": "round 2: open P1"
  },
  {
   "id": "e_clean_fix",
   "from": "clean",
   "to": "fix",
   "exit": "r",
   "enter": "l",
   "kind": "flow",
   "label": "round 1 P0/P1"
  },
  {
   "id": "e_struct_fix",
   "from": "struct",
   "to": "fix",
   "exit": "b",
   "enter": "t",
   "kind": "flow"
  },
  {
   "id": "e_fix_wcodex",
   "from": "fix",
   "to": "wcodex",
   "exit": "b",
   "enter": "b",
   "kind": "back",
   "via": [
    [
     10,
     3.5
    ]
   ],
   "label": "re-challenge",
   "bound": "2 rounds, round 2 final",
   "src": [
    {
     "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
     "line": 22,
     "quote": "round 2 re-challenges the resulting HEAD and its verdict is final"
    }
   ]
  },
  {
   "id": "e_contract_fod",
   "from": "contract",
   "to": "fod",
   "exit": "r",
   "enter": "l",
   "kind": "flow"
  },
  {
   "id": "e_contract_index",
   "from": "contract",
   "to": "index",
   "exit": "b",
   "enter": "t",
   "kind": "flow",
   "label": "defer to own arc"
  },
  {
   "id": "e_fod_index",
   "from": "fod",
   "to": "index",
   "exit": "b",
   "enter": "t",
   "kind": "flow"
  },
  {
   "id": "e_fod_close",
   "from": "fod",
   "to": "close",
   "exit": "r",
   "enter": "t",
   "kind": "flow",
   "label": "fix now / none",
   "via": [
    [
     13,
     0.5
    ]
   ]
  },
  {
   "id": "e_index_close",
   "from": "index",
   "to": "close",
   "exit": "r",
   "enter": "l",
   "kind": "flow"
  },
  {
   "id": "e_close_push",
   "from": "close",
   "to": "push",
   "exit": "r",
   "enter": "l",
   "kind": "flow"
  },
  {
   "id": "e_push_ship",
   "from": "push",
   "to": "ship",
   "exit": "b",
   "enter": "t",
   "kind": "flow",
   "label": "approved"
  },
  {
   "id": "e_ship_verify",
   "from": "ship",
   "to": "verify",
   "exit": "r",
   "enter": "l",
   "kind": "flow"
  }
 ],
 "scenarios": [
  {
   "id": "a",
   "title": "happy path, one stage-5 fix round",
   "steps": [
    {
     "edge": "e_req_size",
     "t": 0.0,
     "d": 0.8,
     "packet": "request",
     "log": "owner> asks for a feature"
    },
    {
     "edge": "e_size_disc",
     "t": 0.9,
     "d": 0.7,
     "packet": "call line",
     "log": "master: 'pipeline: a UI choice + a multi-step arc'"
    },
    {
     "edge": "e_disc_plan",
     "t": 2.8,
     "d": 0.8,
     "packet": "owner pick",
     "log": "stage 1: 3 options with tradeoffs and a recommendation; owner picks one"
    },
    {
     "edge": "e_plan_expl",
     "t": 3.7,
     "d": 0.5,
     "packet": "question",
     "log": "stage 2: plan mode; the master reads no product file, explorer searches"
    },
    {
     "edge": "e_expl_plan",
     "t": 4.3,
     "d": 0.5,
     "packet": "summary",
     "log": "explorer: conclusion + file:line list, no file dumps"
    },
    {
     "edge": "e_plan_prev",
     "t": 4.9,
     "d": 0.7,
     "packet": "plan file",
     "log": "plan file written once -> plan-reviewer, spawned with no model: pin"
    },
    {
     "edge": "e_prev_deleg",
     "t": 5.7,
     "d": 0.6,
     "packet": "blocking=0",
     "log": "plan-reviewer: blocking=0, two advisory findings for the gate"
    },
    {
     "edge": "e_deleg_taste",
     "t": 6.4,
     "d": 0.6,
     "packet": "taste items",
     "log": "approval not delegated -> one AskUserQuestion with 2 taste items"
    },
    {
     "edge": "e_taste_appr",
     "t": 8.2,
     "d": 0.5,
     "packet": "answers",
     "log": "owner answers; the answers are edited into the plan -> ExitPlanMode"
    },
    {
     "edge": "e_appr_copy",
     "t": 10.0,
     "d": 0.6,
     "packet": "approved plan",
     "log": "owner approves -> plan copied to docs/prompts/, base sha recorded"
    },
    {
     "edge": "e_copy_exec",
     "t": 10.7,
     "d": 0.7,
     "packet": "step 1",
     "log": "task list mirrored; step-executor for step 1 spawned in the same turn"
    },
    {
     "edge": "e_exec_scodex",
     "t": 11.5,
     "d": 0.7,
     "packet": "base..HEAD",
     "log": "step 1 committed -> per-step round 1 with --pin, background Bash"
    },
    {
     "edge": "e_scodex_stri",
     "t": 12.3,
     "d": 0.5,
     "packet": "step1.md",
     "log": "codex-triage reads the round file; the master never does"
    },
    {
     "edge": "e_stri_sdec",
     "t": 12.9,
     "d": 0.5,
     "packet": "verdict",
     "log": "step verdict: zero P0/P1"
    },
    {
     "edge": "e_sdec_exec",
     "t": 13.5,
     "d": 0.6,
     "packet": "step 2",
     "log": "nothing to fix -> step-executor for step 2"
    },
    {
     "edge": "e_exec_suite",
     "t": 14.2,
     "d": 1.0,
     "packet": "last step",
     "log": "step 2 is the last step: no per-step round -> full suite"
    },
    {
     "edge": "e_suite_spec",
     "t": 15.3,
     "d": 0.6,
     "packet": "plan + range",
     "log": "suite counts shown -> stage 5: spec-reviewer in parallel"
    },
    {
     "edge": "e_suite_wcodex",
     "t": 15.3,
     "d": 1.0,
     "packet": "base..HEAD",
     "log": "codex-challenge.sh base..HEAD, no --pin, round 1"
    },
    {
     "edge": "e_spec_clean",
     "t": 15.9,
     "d": 0.9,
     "packet": "gaps",
     "log": "spec-reviewer: the range satisfies the plan"
    },
    {
     "edge": "e_wcodex_tri",
     "t": 16.4,
     "d": 0.6,
     "packet": "round1.md",
     "log": "codex-triage: 1 real P1, 1 test-gap"
    },
    {
     "edge": "e_tri_clean",
     "t": 17.1,
     "d": 0.5,
     "packet": "verdict",
     "log": "master recomputes the counts: 1 P1 -> not clean"
    },
    {
     "edge": "e_clean_fix",
     "t": 17.7,
     "d": 0.7,
     "packet": "P1 set",
     "log": "round 1: one fresh fixer for the P1 set"
    },
    {
     "edge": "e_fix_wcodex",
     "t": 18.5,
     "d": 1.2,
     "packet": "fix commit",
     "log": "fixer: red run, fix, green run -> re-challenge on the new HEAD"
    },
    {
     "edge": "e_wcodex_tri",
     "t": 19.8,
     "d": 0.6,
     "packet": "round2.md",
     "log": "codex-triage round 2: zero P0/P1, 1 standalone P2"
    },
    {
     "edge": "e_tri_clean",
     "t": 20.5,
     "d": 0.5,
     "packet": "verdict",
     "log": "clean = zero P0/P1"
    },
    {
     "edge": "e_clean_fod",
     "t": 21.1,
     "d": 1.0,
     "packet": "P2 + test-gap",
     "log": "one AskUserQuestion: the standalone findings of every round"
    },
    {
     "edge": "e_fod_close",
     "t": 23.3,
     "d": 0.8,
     "packet": "fix now",
     "log": "owner: fix now -> one fixer for the set, no re-challenge"
    },
    {
     "edge": "e_close_push",
     "t": 24.2,
     "d": 0.8,
     "packet": "N commits",
     "log": "suite again: exit 0, counts shown; no live agents -> push gate"
    },
    {
     "edge": "e_push_ship",
     "t": 26.3,
     "d": 0.6,
     "packet": "push",
     "log": "owner approves the push -> PR -> merge + deploy"
    },
    {
     "edge": "e_ship_verify",
     "t": 27.0,
     "d": 0.7,
     "packet": "deployed",
     "log": "post-deploy verify: the real user flow driven, evidence shown"
    }
   ]
  },
  {
   "id": "b",
   "title": "delegated approval, two stage-5 rounds, then defer",
   "steps": [
    {
     "edge": "e_req_size",
     "t": 0.0,
     "d": 0.8,
     "packet": "request",
     "log": "owner> asks for a feature: 'approve the plan yourself'"
    },
    {
     "edge": "e_size_disc",
     "t": 0.9,
     "d": 0.7,
     "packet": "call line",
     "log": "master: 'pipeline: an irreversible migration + 2 steps'"
    },
    {
     "edge": "e_disc_plan",
     "t": 2.6,
     "d": 0.8,
     "packet": "owner pick",
     "log": "owner picks an option; delegation given before plan mode"
    },
    {
     "edge": "e_plan_prev",
     "t": 3.5,
     "d": 0.8,
     "packet": "plan file",
     "log": "no EnterPlanMode: the plan file is written directly -> plan-reviewer"
    },
    {
     "edge": "e_prev_plan",
     "t": 4.4,
     "d": 1.2,
     "packet": "blocking=1",
     "log": "plan-reviewer pass 1: one blocking finding -> master revises the plan"
    },
    {
     "edge": "e_plan_prev",
     "t": 5.7,
     "d": 0.8,
     "packet": "plan file",
     "log": "material revision -> plan-reviewer pass 2 (the last one)"
    },
    {
     "edge": "e_prev_deleg",
     "t": 6.6,
     "d": 0.6,
     "packet": "blocking=0",
     "log": "pass 2: blocking=0"
    },
    {
     "edge": "e_deleg_copy",
     "t": 7.3,
     "d": 0.7,
     "packet": "plan",
     "log": "delegated: taste items take the simplest option, delegation recorded"
    },
    {
     "edge": "e_copy_exec",
     "t": 8.1,
     "d": 0.7,
     "packet": "step 1",
     "log": "plan to docs/prompts/, base sha, task list -> step-executor"
    },
    {
     "edge": "e_exec_scodex",
     "t": 8.9,
     "d": 0.7,
     "packet": "base..HEAD",
     "log": "step 1 committed -> per-step round 1 with --pin"
    },
    {
     "edge": "e_scodex_stri",
     "t": 9.7,
     "d": 0.5,
     "packet": "step1.md",
     "log": null
    },
    {
     "edge": "e_stri_sdec",
     "t": 10.3,
     "d": 0.5,
     "packet": "verdict",
     "log": "step verdict: 1 P1, and step 2 depends on step 1"
    },
    {
     "edge": "e_sdec_sfix",
     "t": 10.9,
     "d": 0.6,
     "packet": "P1 set",
     "log": "the fixer goes first: both are single-writer"
    },
    {
     "edge": "e_sfix_exec",
     "t": 11.6,
     "d": 1.0,
     "packet": "fix commit",
     "log": "fix lands red-then-green -> step-executor for step 2"
    },
    {
     "edge": "e_exec_suite",
     "t": 12.7,
     "d": 1.0,
     "packet": "last step",
     "log": "last step: no per-step round -> full suite"
    },
    {
     "edge": "e_suite_wcodex",
     "t": 13.8,
     "d": 1.0,
     "packet": "base..HEAD",
     "log": "stage 5 round 1 on the whole range"
    },
    {
     "edge": "e_suite_spec",
     "t": 13.8,
     "d": 0.6,
     "packet": "plan + range",
     "log": "spec-reviewer in parallel"
    },
    {
     "edge": "e_spec_clean",
     "t": 14.5,
     "d": 0.9,
     "packet": "gaps",
     "log": null
    },
    {
     "edge": "e_wcodex_tri",
     "t": 14.9,
     "d": 0.6,
     "packet": "round1.md",
     "log": "codex-triage: 3 P1, all instances of one mechanism"
    },
    {
     "edge": "e_tri_clean",
     "t": 15.6,
     "d": 0.5,
     "packet": "verdict",
     "log": "same mechanism; the structural fix is bigger than the plan's design"
    },
    {
     "edge": "e_clean_struct",
     "t": 16.2,
     "d": 0.7,
     "packet": "question",
     "log": "AskUserQuestion: structural fix, or patch this path and carry the rest"
    },
    {
     "edge": "e_struct_fix",
     "t": 18.2,
     "d": 0.7,
     "packet": "patch + carry",
     "log": "owner: patch this path and carry the rest -> fixer"
    },
    {
     "edge": "e_fix_wcodex",
     "t": 19.0,
     "d": 1.2,
     "packet": "fix commit",
     "log": "fix committed -> re-challenge, round 2"
    },
    {
     "edge": "e_wcodex_tri",
     "t": 20.3,
     "d": 0.6,
     "packet": "round2.md",
     "log": "round 2: 1 P1 left, 2 standalone P2"
    },
    {
     "edge": "e_tri_clean",
     "t": 21.0,
     "d": 0.5,
     "packet": "verdict",
     "log": "two rounds, then stop: there is no round 3"
    },
    {
     "edge": "e_clean_index",
     "t": 21.6,
     "d": 1.0,
     "packet": "open P1",
     "log": "the open P1 is deferred with an index line"
    },
    {
     "edge": "e_clean_fod",
     "t": 21.6,
     "d": 1.0,
     "packet": "2 x P2",
     "log": "one AskUserQuestion for the standalone findings"
    },
    {
     "edge": "e_fod_index",
     "t": 23.8,
     "d": 0.6,
     "packet": "defer",
     "log": "owner: defer -> verdict files to docs/reviews/, one index line each"
    },
    {
     "edge": "e_index_close",
     "t": 24.5,
     "d": 0.6,
     "packet": "index lines",
     "log": "index lines and verdict files committed with the feature"
    },
    {
     "edge": "e_close_push",
     "t": 25.2,
     "d": 0.8,
     "packet": "N commits",
     "log": "suite again, exit 0; no live agents -> push gate names the open P1"
    },
    {
     "edge": "e_push_ship",
     "t": 27.3,
     "d": 0.6,
     "packet": "push",
     "log": "owner approves the push -> PR -> merge + deploy"
    },
    {
     "edge": "e_ship_verify",
     "t": 28.0,
     "d": 0.7,
     "packet": "deployed",
     "log": "post-deploy verify on the real flow"
    }
   ]
  }
 ]
}
);
