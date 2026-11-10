window.PV=window.PV||[];window.PV.push(
{
 "id": "meta",
 "title": "update & measure",
 "key": "6",
 "doctrine": {
  "kit_sha": "299e7d3",
  "cc_validated": "2.1.321",
  "extracted": "2026-11-10"
 },
 "lanes": [
  {
   "id": "owner",
   "label": "OWNER",
   "sub": "you"
  },
  {
   "id": "hooks",
   "label": "SESSIONSTART",
   "sub": "notices"
  },
  {
   "id": "master",
   "label": "MASTER",
   "sub": "runs the skill"
  }
 ],
 "cols": 10,
 "nodes": [
  {
   "id": "start",
   "lane": "hooks",
   "col": 0,
   "kind": "input",
   "title": "SESSION START",
   "sub": "update-check hook",
   "produces": "session start",
   "card": {
    "actor": "Claude Code, at the start of a session",
    "model": "— (no model)",
    "does": "A session opens and Claude Code runs the SessionStart hooks that install.sh registered, among them the kit update check. The input of the update path.",
    "inputs": [
     "a new session"
    ],
    "artifacts": [
     "SessionStart event"
    ],
    "gates": [
     {
      "rule": "The check prints nothing when the install stamp is missing or corrupt, or when a disabled file exists.",
      "evidence": "none",
      "enforced_by": "hook",
      "src": [
       {
        "file": "hooks/stack-update-check.sh",
        "line": 43,
        "quote": "not installed via install.sh, or corrupt stamp — opt out"
       },
       {
        "file": "hooks/stack-update-check.sh",
        "line": 44,
        "quote": "explicitly turned off"
       }
      ]
     }
    ],
    "options": [],
    "metrics": [],
    "gaps": [],
    "src": [
     {
      "file": "hooks/stack-update-check.sh",
      "line": 2,
      "quote": "SessionStart hook: notice-only check for a newer claude-code-setup on the"
     }
    ]
   }
  },
  {
   "id": "kitnote",
   "lane": "hooks",
   "col": 1,
   "kind": "stage",
   "title": "KIT UPDATE",
   "sub": "stack-update-check",
   "produces": "update notice",
   "card": {
    "actor": "kit hooks/stack-update-check.sh (SessionStart, registered by install.sh)",
    "model": "— (no model)",
    "does": "At most once a day polls GitHub for the kit's master SHA. When it differs from the installed stamp, every session start shows 'N new changes (installed → remote) — run /stack-update' until the update is installed.",
    "inputs": [
     ".claude-code-setup/installed",
     "GitHub commits/master"
    ],
    "artifacts": [
     "update notice (systemMessage)"
    ],
    "gates": [
     {
      "rule": "Polls at most once per 24 h; a known update is replayed at each session start while it was measured against this install.",
      "evidence": ".claude-code-setup/remote: <installed> <remote> <count>",
      "enforced_by": "hook",
      "src": [
       {
        "file": "hooks/stack-update-check.sh",
        "line": 74,
        "quote": "Replay the last successful poll"
       },
       {
        "file": "hooks/stack-update-check.sh",
        "line": 56,
        "quote": "if [ $((now - 10#$last_check)) -ge 86400 ]"
       }
      ]
     },
     {
      "rule": "Never breaks or slows a session start: exit 0 always, network timeouts sum to 5 s under the 10 s hook timeout.",
      "evidence": "none",
      "enforced_by": "hook",
      "src": [
       {
        "file": "hooks/stack-update-check.sh",
        "line": 5,
        "quote": "it must never break or slow a"
       },
       {
        "file": "hooks/stack-update-check.sh",
        "line": 8,
        "quote": "The steps' timeouts sum to 3 + 2 = 5s"
       }
      ]
     }
    ],
    "options": [],
    "metrics": [],
    "gaps": [],
    "src": [
     {
      "file": "hooks/stack-update-check.sh",
      "line": 59,
      "quote": "https://api.github.com/repos/TurboKach/claude-code-setup/commits/master"
     },
     {
      "file": "install.sh",
      "line": 494,
      "quote": "(\"SessionStart update-check hook\", \"SessionStart\", \"\", hook_path, 10),"
     }
    ]
   }
  },
  {
   "id": "stack",
   "lane": "master",
   "col": 2,
   "kind": "stage",
   "title": "1 STACK-UPDATE",
   "sub": "summary, then gates",
   "produces": "what's new",
   "card": {
    "actor": "master, running /stack-update",
    "model": "opus · xhigh (settings model + modelSettings)",
    "does": "Reads the installed SHA, clones the kit into the scratchpad with full history, and summarizes what changed since <installed>, grouped by surface in user-facing terms. Nothing outside the clone is written before gate #1.",
    "inputs": [
     "update notice",
     ".claude-code-setup/installed"
    ],
    "artifacts": [
     "what's-new summary by surface"
    ],
    "gates": [
     {
      "rule": "Steps 1–3 are read-only: nothing outside the scratchpad clone and no state file is written until gate #1 passes.",
      "evidence": "none",
      "enforced_by": "prose",
      "src": [
       {
        "file": "skills/stack-update/SKILL.md",
        "line": 32,
        "quote": "Steps 1–3 are read-only reconnaissance"
       },
       {
        "file": "skills/stack-update/SKILL.md",
        "line": 33,
        "quote": "no state-dir file is written, until the approval gate in step 4 passes"
       }
      ]
     }
    ],
    "options": [],
    "metrics": [],
    "gaps": [],
    "src": [
     {
      "file": "skills/stack-update/SKILL.md",
      "line": 11,
      "quote": "`CLAUDE.md`, which `install.sh`'s default (\"auto\") mode never overwrites once it exists"
     }
    ]
   }
  },
  {
   "id": "apply",
   "lane": "owner",
   "col": 3,
   "kind": "human",
   "title": "APPLY UPDATE?",
   "sub": "2 AskUserQuestions",
   "produces": "answers",
   "card": {
    "actor": "owner",
    "model": "—",
    "does": "Gate #1: apply the update at all, with the summary in the question. Gate #2, separate: rewrite ~/.claude/CLAUDE.md from a three-way diff, since install.sh never overwrites it. Then the master-model question, when settings differ from the recommendation.",
    "inputs": [
     "what's-new summary",
     "CLAUDE.md diff"
    ],
    "artifacts": [
     "answers"
    ],
    "gates": [
     {
      "rule": "Gate #1 is one AskUserQuestion that opens with the summary; Cancel writes nothing; silence is not approval.",
      "evidence": "the owner's answer",
      "enforced_by": "prose",
      "src": [
       {
        "file": "skills/stack-update/SKILL.md",
        "line": 70,
        "quote": "**Approval gate #1 — apply the update at all?**"
       },
       {
        "file": "skills/stack-update/SKILL.md",
        "line": 80,
        "quote": "Silence, or the question going unanswered, is not approval"
       }
      ]
     },
     {
      "rule": "Gate #2 is a separate AskUserQuestion before ~/.claude/CLAUDE.md is rewritten; the diff base is claude-md-installed, never installed.",
      "evidence": "the owner's answer",
      "enforced_by": "prose",
      "src": [
       {
        "file": "skills/stack-update/SKILL.md",
        "line": 120,
        "quote": "**Never** rewrite"
       },
       {
        "file": "skills/stack-update/SKILL.md",
        "line": 90,
        "quote": "Use `claude-md-installed` as the base for this diff, not `installed`"
       }
      ]
     },
     {
      "rule": "The master-model question comes only when settings.json differs from the recommendation and master-dont-ask is absent or stale.",
      "evidence": "the owner's answer, passed as --master=",
      "enforced_by": "prose",
      "src": [
       {
        "file": "skills/stack-update/SKILL.md",
        "line": 123,
        "quote": "First, the master-model question — asked on every update unless the user"
       }
      ]
     },
     {
      "rule": "When the owner's messages reach the session as <wake>/<relay> turns from a project thread, AskUserQuestion never reaches the owner: the question goes in the thread reply and the turn ends.",
      "evidence": "the question sits in the thread reply and the turn has ended",
      "enforced_by": "prose",
      "src": [
       {
        "file": "global/CLAUDE.md",
        "line": 29,
        "quote": "When my messages reach you as `<wake>`/`<relay>` turns from a project thread"
       },
       {
        "file": "global/CLAUDE.md",
        "line": 29,
        "quote": "AskUserQuestion never reaches me: put the question in your thread reply and end the turn."
       }
      ]
     },
     {
      "rule": "A note the coordinator session wrote is not the owner's word: it can assign work, but only the owner's own message quoted in the turn approves a gate or waives a rule.",
      "evidence": "the owner's own message, quoted in the turn",
      "enforced_by": "prose",
      "src": [
       {
        "file": "global/CLAUDE.md",
        "line": 29,
        "quote": "A note the coordinator session wrote is not my word: it can assign work"
       },
       {
        "file": "global/CLAUDE.md",
        "line": 29,
        "quote": "only my own message quoted in the turn approves a gate or waives a rule"
       }
      ]
     }
    ],
    "options": [
     "Apply",
     "Show the full diff first",
     "Cancel",
     "CLAUDE.md: apply hunks / decide by hand / skip"
    ],
    "metrics": [],
    "gaps": [],
    "src": [
     {
      "file": "skills/stack-update/SKILL.md",
      "line": 75,
      "quote": "*Show the full diff first* → show it, then re-ask this same question; it is not itself an answer."
     }
    ]
   }
  },
  {
   "id": "inst",
   "lane": "master",
   "col": 4,
   "kind": "stage",
   "title": "2 INSTALL.SH",
   "sub": "copy into ~/.claude",
   "produces": "installed SHA",
   "card": {
    "actor": "master, running ./install.sh from the clone",
    "model": "opus · xhigh (settings model + modelSettings)",
    "does": "install.sh backs up and copies skills, agents, rules and hooks, merges settings.json keys, registers the hooks and stamps .claude-code-setup/installed. An existing ~/.claude/CLAUDE.md is never overwritten in the default mode. Nothing applied is live until a restart.",
    "inputs": [
     "clone at the new HEAD",
     "--master flag if chosen"
    ],
    "artifacts": [
     "~/.claude updated",
     ".claude-code-setup/installed",
     ".backup-<stamp>"
    ],
    "gates": [
     {
      "rule": "A non-zero exit stops the run: no state file is written; the report says what was applied and where the backups are.",
      "evidence": "install.sh exit status; installed unchanged",
      "enforced_by": "prose",
      "src": [
       {
        "file": "skills/stack-update/SKILL.md",
        "line": 142,
        "quote": "**If it exits non-zero:** stop — do not write `installed` or `claude-md-installed`"
       }
      ]
     },
     {
      "rule": "State is written only after a zero-exit install; claude-md-installed only when gate #2 applied the hunks.",
      "evidence": ".claude-code-setup/installed and claude-md-installed",
      "enforced_by": "prose",
      "src": [
       {
        "file": "skills/stack-update/SKILL.md",
        "line": 150,
        "quote": "**Update state.** Only now write to the state dir, and only on a zero-exit install"
       }
      ]
     },
     {
      "rule": "The default (auto) mode never overwrites an existing ~/.claude/CLAUDE.md.",
      "evidence": "'CLAUDE.md exists — left untouched' in the install output",
      "enforced_by": "script",
      "src": [
       {
        "file": "install.sh",
        "line": 164,
        "quote": "CLAUDE.md — mode defaults to \"auto\": copy if absent, else leave untouched"
       },
       {
        "file": "install.sh",
        "line": 205,
        "quote": "exists — left untouched."
       }
      ]
     },
     {
      "rule": "Restart Claude Code: skills, agents, hooks and settings env are read at session start.",
      "evidence": "none",
      "enforced_by": "harness",
      "src": [
       {
        "file": "skills/stack-update/SKILL.md",
        "line": 171,
        "quote": "Skills, agents, hooks, and settings `env` are all read at session start"
       }
      ]
     }
    ],
    "options": [],
    "metrics": [],
    "gaps": [
     {
      "text": "Tech debt: RETIRED_AGENTS entries are not checked to be plain basenames; a future ../ entry would delete a file elsewhere under ~/.claude.",
      "kind": "tech-debt",
      "src": [
       {
        "file": "docs/tech-debt.md",
        "line": 15,
        "quote": "`RETIRED_AGENTS` entries aren't validated as plain basenames"
       }
      ]
     },
     {
      "text": "Tech debt: no disjointness check between shipped and retired agents; a name on both lists loses the user's copy and leaves the agent missing.",
      "kind": "tech-debt",
      "src": [
       {
        "file": "docs/tech-debt.md",
        "line": 16,
        "quote": "no disjointness check between shipped and retired agents"
       }
      ]
     },
     {
      "text": "Tech debt: the --claude-md=append idempotency check needs the exact \"## Feature workflow\" heading; a variant heading appends a duplicate section.",
      "kind": "tech-debt",
      "src": [
       {
        "file": "docs/tech-debt.md",
        "line": 17,
        "quote": "append idempotency check requires an exact `## Feature workflow` heading"
       }
      ]
     },
     {
      "text": "Tech debt: the append branch misreads a missing CLAUDE.md as \"heading not found\", and its scan, backup and append are not atomic.",
      "kind": "tech-debt",
      "src": [
       {
        "file": "docs/tech-debt.md",
        "line": 18,
        "quote": "misreads a missing file as \"not found,\" and the scan/backup/append aren't atomic"
       }
      ]
     },
     {
      "text": "Tech debt: INSTALL.md's Step 0 detection checks ~/.claude while install.sh honours CLAUDE_HOME, so the wizard can ask about a different install.",
      "kind": "tech-debt",
      "src": [
       {
        "file": "docs/tech-debt.md",
        "line": 19,
        "quote": "Step 0 detection hardcodes `~/.claude`, not `CLAUDE_HOME`"
       }
      ]
     },
     {
      "text": "Tech debt: register_hook stores hook command paths unquoted; a CLAUDE_HOME with a space splits every kit hook command and it silently no-ops.",
      "kind": "tech-debt",
      "src": [
       {
        "file": "docs/tech-debt.md",
        "line": 22,
        "quote": "`register_hook` stores hook command paths unquoted"
       }
      ]
     },
     {
      "text": "Tech debt (Opus-executors arc bundle, item 1): --master splits MODEL_ID:EFFORT at the first colon, so a Bedrock model ID that contains a colon fails with a misleading error.",
      "kind": "tech-debt",
      "src": [
       {
        "file": "docs/tech-debt.md",
        "line": 31,
        "quote": "`--master` colon split on Bedrock IDs"
       },
       {
        "file": "docs/todos/deferred-opus-executors-arc.md",
        "line": 8,
        "quote": "MODEL_ID:EFFORT is split at the first colon"
       }
      ]
     }
    ],
    "src": [
     {
      "file": "install.sh",
      "line": 285,
      "quote": "echo \"$INSTALLED_SHA\" > \"$DEST/.claude-code-setup/installed\""
     }
    ]
   }
  },
  {
   "id": "ask",
   "lane": "owner",
   "col": 6,
   "kind": "input",
   "title": "ANALYZE ASK",
   "sub": "/analyze-arcs <since>",
   "produces": "/analyze-arcs",
   "card": {
    "actor": "owner",
    "model": "—",
    "does": "Asks for the numbers on the pipeline sessions since a date: \"/analyze-arcs <since-date>\", or \"how did the last arcs go\". The input of the measure path.",
    "inputs": [
     "a start date"
    ],
    "artifacts": [
     "/analyze-arcs request"
    ],
    "gates": [
     {
      "rule": "The measurement scripts are read-only.",
      "evidence": "none",
      "enforced_by": "prose",
      "src": [
       {
        "file": "skills/analyze-arcs/SKILL.md",
        "line": 8,
        "quote": "The scripts are read-only."
       }
      ]
     }
    ],
    "options": [],
    "metrics": [],
    "gaps": [],
    "src": [
     {
      "file": "skills/analyze-arcs/SKILL.md",
      "line": 3,
      "quote": "Invoke on \"analyze the sessions\", \"how did the last arcs go\", \"evaluate the pipeline\", \"/analyze-arcs <since-date>\""
     }
    ]
   }
  },
  {
   "id": "analyze",
   "lane": "master",
   "col": 7,
   "kind": "stage",
   "title": "1 ANALYZE-ARCS",
   "sub": "version diff first",
   "produces": "numbers + flags",
   "card": {
    "actor": "master, running /analyze-arcs",
    "model": "opus · xhigh (settings model + modelSettings)",
    "does": "First claude --version against the stamp; a moved version means reading the changelog between them. Then analyze.py over the window: per-session numbers and mechanical flags, the timeline at each flag, and the judgment checks the script cannot make.",
    "inputs": [
     "transcripts since <date>"
    ],
    "artifacts": [
     "arcs report",
     "changelog diff"
    ],
    "gates": [
     {
      "rule": "Version diff first: claude --version against the stamp in docs/references.md; if they differ, read the changelog between them before blaming the doctrine.",
      "evidence": "none",
      "enforced_by": "prose",
      "src": [
       {
        "file": "skills/analyze-arcs/SKILL.md",
        "line": 16,
        "quote": "**Version diff first.** `claude --version`"
       },
       {
        "file": "skills/analyze-arcs/SKILL.md",
        "line": 17,
        "quote": "if they differ, read the changelog between them before blaming the doctrine for a harness change"
       }
      ]
     },
     {
      "rule": "A flag is a place to look, not a verdict: read the timeline at the flagged time; review escapes and negative-only verification are checked by hand.",
      "evidence": "none",
      "enforced_by": "prose",
      "src": [
       {
        "file": "skills/analyze-arcs/SKILL.md",
        "line": 97,
        "quote": "A flag is a place to look, not a verdict"
       },
       {
        "file": "skills/analyze-arcs/SKILL.md",
        "line": 105,
        "quote": "a review escape (what codex rounds missed and why)"
       }
      ]
     }
    ],
    "options": [],
    "metrics": [
     {
      "name": "Flag lines for a master write to a product file inside a pipeline",
      "src": [
       {
        "file": "skills/analyze-arcs/scripts/analyze.py",
        "line": 629,
        "quote": "on product file inside pipeline"
       }
      ]
     }
    ],
    "gaps": [
     {
      "text": "Tech debt (pipeline-gaps arc bundle, items 7 and 10): the analyzer's Bash-write flag still counts writes by other sessions in the same checkout (false flags), and a shell-expanded option ($(…), $VAR) passes its read-only allowlist (a real write goes unflagged).",
      "kind": "tech-debt",
      "src": [
       {
        "file": "docs/tech-debt.md",
        "line": 34,
        "quote": "Analyzer blind spots and limits"
       },
       {
        "file": "docs/todos/deferred-pipeline-gaps-arc.md",
        "line": 40,
        "quote": "Writes by other sessions in the same checkout stay counted."
       },
       {
        "file": "docs/todos/deferred-pipeline-gaps-arc.md",
        "line": 64,
        "quote": "Analyzer: a shell-expanded option passes `cannot_write`"
       }
      ]
     },
     {
      "text": "Tech debt: no escape-rate metric. analyze-arcs does not count stage-5 real P0/P1 that slipped past their per-step round, per arc or as a trend.",
      "kind": "tech-debt",
      "src": [
       {
        "file": "docs/tech-debt.md",
        "line": 33,
        "quote": "no escape-rate metric for per-step codex rounds"
       },
       {
        "file": "docs/todos/escape-rate-metric.md",
        "line": 5,
        "quote": "Report both numbers per arc and as a trend in the weekly report."
       }
      ]
     },
     {
      "text": "Tech debt (pipeline-gaps arc bundle, item 5): sessions that run codex-challenge.sh without loading feature-workflow are never checked for master writes, because that flag needs the skill load.",
      "kind": "tech-debt",
      "src": [
       {
        "file": "docs/tech-debt.md",
        "line": 34,
        "quote": "Analyzer blind spots and limits"
       },
       {
        "file": "docs/todos/deferred-pipeline-gaps-arc.md",
        "line": 34,
        "quote": "Sessions that run `codex-challenge.sh` under a project skill without loading `feature-workflow`"
       }
      ]
     },
     {
      "text": "Tech debt (pipeline-gaps arc bundle, item 13): about 500 nested $(…) in one command make cannot_write raise RecursionError, and no caller catches it, so one such transcript aborts the whole report; 0 of 210,376 real commands fuzzed trigger it.",
      "kind": "tech-debt",
      "src": [
       {
        "file": "docs/tech-debt.md",
        "line": 34,
        "quote": "Analyzer blind spots and limits"
       },
       {
        "file": "docs/todos/deferred-pipeline-gaps-arc.md",
        "line": 99,
        "quote": "Analyzer: deeply nested `$(…)` makes `cannot_write` raise `RecursionError`"
       },
       {
        "file": "docs/todos/deferred-pipeline-gaps-arc.md",
        "line": 103,
        "quote": "so one such transcript aborts the whole report"
       }
      ]
     }
    ],
    "src": [
     {
      "file": "skills/analyze-arcs/scripts/analyze.py",
      "line": 2,
      "quote": "Measure Claude Code pipeline sessions since a date and flag mechanical doctrine violations."
     }
    ]
   }
  },
  {
   "id": "nums",
   "lane": "owner",
   "col": 8,
   "kind": "human",
   "title": "READ NUMBERS",
   "sub": "held vs failed",
   "produces": "decision",
   "card": {
    "actor": "owner",
    "model": "—",
    "does": "Reads the report: the numbers held vs failed, ranked by cost, and the flags. A flag marks a place to look, not a verdict. What to change, if anything, is the owner's call.",
    "inputs": [
     "arcs report",
     "flags with timelines"
    ],
    "artifacts": [
     "decision"
    ],
    "gates": [
     {
      "rule": "The report gives the numbers, held vs failed, ranked by cost.",
      "evidence": "the arcs report",
      "enforced_by": "prose",
      "src": [
       {
        "file": "skills/analyze-arcs/SKILL.md",
        "line": 108,
        "quote": "**Report with the numbers**, held vs failed, ranked by cost."
       }
      ]
     }
    ],
    "options": [
     "act on a flag",
     "no change"
    ],
    "metrics": [],
    "gaps": [],
    "src": [
     {
      "file": "skills/analyze-arcs/SKILL.md",
      "line": 97,
      "quote": "A flag is a place to look, not a verdict"
     }
    ]
   }
  }
 ],
 "edges": [
  {
   "id": "e_start_kitnote",
   "from": "start",
   "to": "kitnote",
   "exit": "r",
   "enter": "l",
   "kind": "flow"
  },
  {
   "id": "e_kitnote_stack",
   "from": "kitnote",
   "to": "stack",
   "exit": "b",
   "enter": "t",
   "kind": "flow",
   "label": "/stack-update"
  },
  {
   "id": "e_stack_apply",
   "from": "stack",
   "to": "apply",
   "exit": "r",
   "enter": "b",
   "kind": "flow",
   "label": "summary"
  },
  {
   "id": "e_apply_stack",
   "from": "apply",
   "to": "stack",
   "exit": "l",
   "enter": "t",
   "kind": "back",
   "label": "show full diff",
   "bound": "none"
  },
  {
   "id": "e_apply_inst",
   "from": "apply",
   "to": "inst",
   "exit": "r",
   "enter": "t",
   "kind": "flow",
   "label": "Apply"
  },
  {
   "id": "e_ask_analyze",
   "from": "ask",
   "to": "analyze",
   "exit": "r",
   "enter": "t",
   "kind": "flow",
   "label": "/analyze-arcs"
  },
  {
   "id": "e_analyze_nums",
   "from": "analyze",
   "to": "nums",
   "exit": "r",
   "enter": "b",
   "kind": "flow",
   "label": "numbers + flags"
  }
 ],
 "scenarios": [
  {
   "id": "a",
   "title": "update notice -> /stack-update -> 2 questions -> install.sh",
   "steps": [
    {
     "edge": "e_start_kitnote",
     "t": 0.0,
     "d": 0.7,
     "packet": "session start",
     "log": "SessionStart: stack-update-check.sh runs; it polls GitHub at most once a day"
    },
    {
     "edge": "e_kitnote_stack",
     "t": 0.8,
     "d": 0.8,
     "packet": "2 new changes",
     "log": "next session shows: 'claude-code-setup: 2 new changes - run /stack-update'"
    },
    {
     "edge": "e_stack_apply",
     "t": 1.7,
     "d": 0.8,
     "packet": "what's new",
     "log": "clone + summary by surface -> gate #1: Apply / Show the full diff first / Cancel"
    },
    {
     "edge": "e_apply_stack",
     "t": 3.5,
     "d": 1.0,
     "packet": "show diff",
     "log": "owner: show the full diff first -> diff shown, the same question again"
    },
    {
     "edge": "e_stack_apply",
     "t": 4.6,
     "d": 0.8,
     "packet": "what's new",
     "log": null
    },
    {
     "edge": "e_apply_inst",
     "t": 6.4,
     "d": 0.7,
     "packet": "Apply",
     "log": "owner: Apply; CLAUDE.md three-way diff -> gate #2 answered"
    }
   ]
  },
  {
   "id": "b",
   "title": "/analyze-arcs <since> -> numbers and flags -> owner reads",
   "steps": [
    {
     "edge": "e_ask_analyze",
     "t": 0.0,
     "d": 0.8,
     "packet": "/analyze-arcs",
     "log": "owner asks for the numbers since a date"
    },
    {
     "edge": "e_analyze_nums",
     "t": 1.0,
     "d": 0.9,
     "packet": "numbers + flags",
     "log": "version diff first; analyze.py over the window; timelines read at each flag"
    }
   ]
  }
 ]
}
);
