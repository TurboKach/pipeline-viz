window.PV=window.PV||[];window.PV.push(
{
 "id": "recovery",
 "title": "recovery & limits",
 "key": "2",
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
   "id": "harness",
   "label": "HARNESS",
   "sub": "Claude Code"
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
 "cols": 15,
 "nodes": [
  {
   "id": "cron",
   "lane": "harness",
   "col": 0,
   "kind": "input",
   "title": "WATCHDOG CRON",
   "sub": "7,22,37,52 * * * *",
   "produces": "idle check",
   "card": {
    "actor": "harness cron job, created by the master",
    "model": "—",
    "does": "At the arc's first spawn the master creates one recurring session-only cron job on an off-minute quarter-hour. It fires only while the REPL is idle, the state of a master waiting on a notification.",
    "inputs": [
     "first spawn of the arc"
    ],
    "artifacts": [
     "cron prompt in the master"
    ],
    "gates": [
     {
      "rule": "One recurring session-only CronCreate job at the arc's first spawn; CronDelete at the no-live-agents checkpoint.",
      "evidence": "none",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
        "line": 36,
        "quote": "at the arc's first spawn, `CronCreate` one recurring session-only job on an off-minute quarter-hour"
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
    "gaps": [
     {
      "text": "Report C5: fbbdd8d3's master blocked 28 min in two foreground poll loops on its executor's transcript (both exit 124). CLAUDE.md:40 already says to end the turn while work is in flight. Hypothesis: the coordinator host reads a turn end as done.",
      "kind": "report",
      "src": [
       {
        "file": "~/Dev/pipeline-watch/reports/2026-10-12.md",
        "line": 75,
        "quote": "fbbdd8d3 blocked for 28 minutes in foreground poll loops"
       }
      ]
     }
    ],
    "src": [
     {
      "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
      "line": 36,
      "quote": "Cron fires only while the REPL is idle"
     }
    ]
   }
  },
  {
   "id": "quiet",
   "lane": "master",
   "col": 0,
   "kind": "decision",
   "title": "QUIET AGENT?",
   "sub": "10 min, no write",
   "produces": "stop + read",
   "card": {
    "actor": "master (cron prompt)",
    "model": "opus · xhigh (settings model + modelSettings)",
    "does": "Lists this session's subagents/*.jsonl by mtime. An agent with no write for 10 min, or whose last commands repeat a pgrep/sleep wait, is read, stopped (TaskStop) and respawned for the remainder.",
    "inputs": [
     "subagents/*.jsonl mtimes"
    ],
    "artifacts": [
     "TaskStop"
    ],
    "gates": [
     {
      "rule": "No transcript write for 10 min, or a repeating pgrep/sleep wait: read, stop (TaskStop), respawn for the remainder.",
      "evidence": "the transcript mtime in subagents/*.jsonl",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
        "line": 36,
        "quote": "an agent with no write for 10 min, or whose last commands repeat a `pgrep`/`sleep` wait"
       }
      ]
     },
     {
      "rule": "The window is measured from the agent's spawn timestamp and last transcript write, never from how long the master has waited.",
      "evidence": "none",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/global/CLAUDE.md",
        "line": 39,
        "quote": "measure the window from the agent's own spawn timestamp and last transcript write"
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
   "id": "apierr",
   "lane": "harness",
   "col": 1,
   "kind": "input",
   "title": "API ERROR",
   "sub": "agent ends early",
   "produces": "no report",
   "card": {
    "actor": "harness",
    "model": "—",
    "does": "An API error that ends a subagent early is never delivered as its result: the master gets nothing. If the owner's own harness retry was cancelled (Esc) or exhausted, the path stays manual and the master says so.",
    "inputs": [],
    "artifacts": [
     "no report"
    ],
    "gates": [
     {
      "rule": "A missing report is a read-the-transcript signal, never a wait.",
      "evidence": "none",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
        "line": 36,
        "quote": "A missing report is a read-the-transcript signal, never a wait."
       },
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
        "line": 36,
        "quote": "An API error that ends a subagent early is never delivered as its result — the master gets nothing."
       }
      ]
     }
    ],
    "options": [],
    "metrics": [
     {
      "name": "subagents that died on an API error before doing work, in the window",
      "value": "0 died",
      "as_of": "2026-10-12",
      "src": [
       {
        "file": "~/Dev/pipeline-watch/reports/2026-10-12.md",
        "line": 23,
        "quote": "No subagent died or capped"
       },
       {
        "file": "~/Dev/claude-code-setup/skills/analyze-arcs/scripts/analyze.py",
        "line": 645,
        "quote": "subagent(s) died on an API error before doing work"
       }
      ]
     }
    ],
    "gaps": [],
    "src": [
     {
      "file": "~/Dev/claude-code-setup/global/CLAUDE.md",
      "line": 39,
      "quote": "if my own harness retry was cancelled (Esc) or exhausted, that path stays manual and you say so"
     },
     {
      "file": "~/Dev/claude-code-setup/skills/analyze-arcs/scripts/analyze.py",
      "line": 645,
      "quote": "subagent(s) died on an API error before doing work"
     }
    ]
   }
  },
  {
   "id": "trans",
   "lane": "master",
   "col": 1,
   "kind": "stage",
   "title": "READ TRANSCRIPT",
   "sub": "subagents/*.jsonl",
   "produces": "salvage + rest",
   "card": {
    "actor": "master",
    "model": "opus · xhigh (settings model + modelSettings)",
    "does": "Reads the agent's transcript under the session's subagents/ dir; the work is often already complete. Salvages what finished and briefs a fresh agent for only the remainder.",
    "inputs": [
     "transcript"
    ],
    "artifacts": [
     "salvaged work",
     "remainder brief"
    ],
    "gates": [
     {
      "rule": "Read the transcript, salvage what finished, respawn a fresh agent for only the remainder.",
      "evidence": "none",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
        "line": 36,
        "quote": "If a delegate goes quiet past its expected window, read its transcript under the session's `subagents/` dir"
       },
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
        "line": 36,
        "quote": "Salvage it, and respawn a fresh agent for only the remainder."
       }
      ]
     },
     {
      "rule": "API-error death: up to 2 respawns, then park with a push notification.",
      "evidence": "none",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/global/CLAUDE.md",
        "line": 39,
        "quote": "up to 2 respawns for an API-error death, then park with a push notification"
       }
      ]
     },
     {
      "rule": "Second maxTurns cap: the master commits any WIP: itself and respawns fresh for the remainder; it never raises the cap.",
      "evidence": "the WIP: commit, then a fresh spawn for the remainder",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
        "line": 60,
        "quote": "only if the resumed agent caps again does the master read its transcript under `subagents/`"
       },
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
        "line": 60,
        "quote": "it never raises the cap"
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
   "id": "respawn",
   "lane": "sub",
   "col": 1,
   "kind": "sub",
   "title": "FRESH AGENT",
   "sub": "remainder only",
   "produces": "commits",
   "card": {
    "actor": "a fresh agent of the same type",
    "model": "the role's pin",
    "does": "A new spawn briefed with only the remainder; finished work is not redone.",
    "inputs": [
     "remainder brief"
    ],
    "artifacts": [
     "commits"
    ],
    "gates": [
     {
      "rule": "The respawn covers only the remainder; finished work is never redone.",
      "evidence": "none",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/global/CLAUDE.md",
        "line": 38,
        "quote": "commit to the delegation — never redo its work"
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
   "id": "park",
   "lane": "owner",
   "col": 3,
   "kind": "output",
   "title": "PARK",
   "sub": "notify, end turn",
   "produces": "owner decides",
   "card": {
    "actor": "master ends its turn; the owner is notified",
    "model": "—",
    "does": "The master sends a push notification and ends its turn: no relaunch, no retry. The run waits for the owner.",
    "inputs": [
     "respawns used up",
     "codex failure"
    ],
    "artifacts": [
     "push notification"
    ],
    "gates": [
     {
      "rule": "Park = push-notify and end the turn; no relaunch, no unpinned retry.",
      "evidence": "the push notification",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
        "line": 28,
        "quote": "park: push-notify, end the turn, no relaunch"
       },
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
        "line": 28,
        "quote": "no unpinned retry"
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
   "id": "cap",
   "lane": "harness",
   "col": 2,
   "kind": "input",
   "title": "maxTurns CAP",
   "sub": "result partial",
   "produces": "partial result",
   "card": {
    "actor": "harness, from the agent frontmatter",
    "model": "—",
    "does": "maxTurns in the agent frontmatter stops the agent outright: executors 200, fixer 150, codex-triage 60. Its result comes back marked partial.",
    "inputs": [],
    "artifacts": [
     "partial result"
    ],
    "gates": [
     {
      "rule": "Retirement is mechanical: maxTurns in the frontmatter, never a prose budget.",
      "evidence": "the result marked partial",
      "enforced_by": "frontmatter",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
        "line": 60,
        "quote": "Retirement is mechanical: `maxTurns` in the agent frontmatter, not a prose budget."
       },
       {
        "file": "~/Dev/claude-code-setup/agents/step-executor.md",
        "line": 6,
        "quote": "maxTurns: 200"
       },
       {
        "file": "~/Dev/claude-code-setup/agents/fixer.md",
        "line": 6,
        "quote": "maxTurns: 150"
       },
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
      "name": "subagents stopped at their maxTurns cap in the window",
      "value": "0 capped",
      "as_of": "2026-10-12",
      "src": [
       {
        "file": "~/Dev/pipeline-watch/reports/2026-10-12.md",
        "line": 23,
        "quote": "No subagent died or capped"
       },
       {
        "file": "~/Dev/claude-code-setup/skills/analyze-arcs/scripts/analyze.py",
        "line": 646,
        "quote": "flags += cap_flags(subs, r['caps'])"
       }
      ]
     },
     {
      "name": "executor caps in one iOS app arc (steps 5 and 6), each a WIP commit and respawn",
      "value": "2, ≈55 min",
      "as_of": "2026-09-15",
      "src": [
       {
        "file": "~/.claude/projects/-Users-turbokach-Dev-claude-code-setup/memory/ios-app-arc-duration-baseline.md",
        "line": 13,
        "quote": "Step 5 and Step 6 hit maxTurns 200 mid-work"
       }
      ]
     }
    ],
    "gaps": [
     {
      "text": "Report C5: when 6ea7f098's fixer hit its cap, the master ran git commit --no-verify -m \"WIP: …\" and auto mode denied it as a safety-bypass flag. The --no-verify came from the master, not the doctrine; one case.",
      "kind": "report",
      "src": [
       {
        "file": "~/Dev/pipeline-watch/reports/2026-10-19.md",
        "line": 56,
        "quote": "The WIP commit was denied."
       },
       {
        "file": "~/Dev/pipeline-watch/reports/2026-10-19.md",
        "line": 56,
        "quote": "The `--no-verify` came from the master, not the doctrine."
       }
      ]
     }
    ],
    "src": [
     {
      "file": "~/Dev/claude-code-setup/skills/analyze-arcs/scripts/analyze.py",
      "line": 412,
      "quote": "{s['file'][:14]} hit its turn cap{n_x(s['capped'])}"
     }
    ]
   }
  },
  {
   "id": "wip",
   "lane": "master",
   "col": 2,
   "kind": "stage",
   "title": "WIP + RESUME",
   "sub": "SendMessage",
   "produces": "WIP: commit",
   "card": {
    "actor": "master",
    "model": "opus · xhigh (settings model + modelSettings)",
    "does": "A partial result is not an ingested output: the unit stays open. A dirty tree is committed as WIP: and the same agent is resumed with SendMessage, full history intact.",
    "inputs": [
     "partial result",
     "working tree"
    ],
    "artifacts": [
     "WIP: commit",
     "resume message"
    ],
    "gates": [
     {
      "rule": "A dirty tree is committed as WIP: first, and the resume message names that commit.",
      "evidence": "the WIP: commit sha named in the SendMessage",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/global/CLAUDE.md",
        "line": 39,
        "quote": "commit its `WIP:` yourself first and name that commit in the resume message"
       }
      ]
     },
     {
      "rule": "A partial result is resumed, never replaced.",
      "evidence": "none",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
        "line": 52,
        "quote": "A result marked partial at `maxTurns` is not an ingested output"
       },
       {
        "file": "~/Dev/claude-code-setup/global/CLAUDE.md",
        "line": 39,
        "quote": "resume it with `SendMessage` — it keeps its full history"
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
   "id": "resumed",
   "lane": "sub",
   "col": 2,
   "kind": "sub",
   "title": "RESUMED AGENT",
   "sub": "full history",
   "produces": "commits",
   "card": {
    "actor": "the same agent, resumed",
    "model": "unchanged",
    "does": "Continues with its full history and no ramp-up. Past about three-quarters of its cap it commits WIP: and keeps working.",
    "inputs": [
     "resume message"
    ],
    "artifacts": [
     "commits"
    ],
    "gates": [
     {
      "rule": "The agent amends the WIP: commit only while HEAD is still that commit.",
      "evidence": "none",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/global/CLAUDE.md",
        "line": 39,
        "quote": "the agent amends it only while HEAD is still that commit"
       }
      ]
     },
     {
      "rule": "Past about three-quarters of the cap the agent commits WIP: and keeps working.",
      "evidence": "a WIP: commit on the branch",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/agents/step-executor.md",
        "line": 32,
        "quote": "Past ~150 turns, commit `WIP:` and keep working"
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
   "id": "launch",
   "lane": "master",
   "col": 3,
   "kind": "input",
   "title": "CODEX LAUNCH",
   "sub": "background Bash",
   "produces": "verdict path",
   "card": {
    "actor": "master",
    "model": "opus · xhigh (settings model + modelSettings)",
    "does": "codex-challenge.sh <range> [--pin] --trace --out <scratchpad>/...-round<N>.md as one run_in_background Bash. The master ends its turn or does work that does not depend on the verdict.",
    "inputs": [
     "range"
    ],
    "artifacts": [
     "background task"
    ],
    "gates": [
     {
      "rule": "Every long background run passes timeout: 7200000; without it an unattended session stops it at 30 min.",
      "evidence": "none",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
        "line": 62,
        "quote": "Every such call — the codex run included — passes `timeout: 7200000`, the harness maximum"
       },
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
        "line": 62,
        "quote": "a background call without its own `timeout` is stopped at 30 min"
       }
      ]
     }
    ],
    "options": [],
    "metrics": [
     {
      "name": "codex-challenge launches per arc, 310 in the window (10-05 report: 5.1)",
      "value": "4.9 / arc",
      "as_of": "2026-10-12",
      "src": [
       {
        "file": "~/Dev/pipeline-watch/reports/2026-10-12.md",
        "line": 103,
        "quote": "| codex launches per arc | 5.1 | 4.9 (310) |"
       }
      ]
     }
    ],
    "gaps": [],
    "src": []
   }
  },
  {
   "id": "run",
   "lane": "codex",
   "col": 3,
   "kind": "codex",
   "title": "CODEX RUN",
   "sub": "3 tries, 15-min cap",
   "produces": "exit + seconds",
   "card": {
    "actor": "codex-challenge.sh",
    "model": "gpt-6.1-sol · medium (CODEX_REVIEW_MODEL / _EFFORT)",
    "does": "Each attempt runs under gtimeout -k 60 900. Exit 124/137 is a stall and is not retried; a capacity or HTTP 400 error bails at once; other failures retry, 3 attempts 300 s apart. The header line records range, exit and seconds.",
    "inputs": [
     "range",
     "flags"
    ],
    "artifacts": [
     "--out file with header line",
     "exit code"
    ],
    "gates": [
     {
      "rule": "Each attempt stops at 15 min; a stall (124/137) is not retried.",
      "evidence": "exit 124 and 'codex-challenge: exit 124 after …' on stderr",
      "enforced_by": "script",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/scripts/codex-challenge.sh",
        "line": 119,
        "quote": "\"$to\" -k 60 900 \"$codex_bin\" exec"
       },
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/scripts/codex-challenge.sh",
        "line": 123,
        "quote": "124/137 = 15-min stall"
       }
      ]
     },
     {
      "rule": "Other failures retry: 3 attempts, 300 s apart; capacity and HTTP 400 errors bail at once.",
      "evidence": "the exit code and elapsed seconds on stderr",
      "enforced_by": "script",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/scripts/codex-challenge.sh",
        "line": 115,
        "quote": "for attempt in 1 2 3; do"
       },
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/scripts/codex-challenge.sh",
        "line": 163,
        "quote": "[ \"$attempt\" -lt 3 ] && sleep 300"
       },
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/scripts/codex-challenge.sh",
        "line": 155,
        "quote": "is at capacity on attempt $attempt — not retrying"
       },
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/scripts/codex-challenge.sh",
        "line": 159,
        "quote": "permanent API error on attempt $attempt"
       }
      ]
     },
     {
      "rule": "--pin refuses under 2 GB free on the scratch volume: exit 66.",
      "evidence": "exit 66 and 'refusing to pin' on stderr",
      "enforced_by": "script",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/scripts/codex-challenge.sh",
        "line": 64,
        "quote": "under 2 GB free on $scratch; refusing to pin"
       }
      ]
     },
     {
      "rule": "The base must be an ancestor of head: a history rewrite past the base is exit 65.",
      "evidence": "exit 65 on stderr",
      "enforced_by": "script",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/scripts/codex-challenge.sh",
        "line": 29,
        "quote": "base is not an ancestor of head (history rewritten past the feature base?)"
       }
      ]
     }
    ],
    "options": [],
    "metrics": [
     {
      "name": "dead codex launches: 0 found in sampled runs, not counted (10-05 report: 0 found)",
      "value": "not counted",
      "as_of": "2026-10-12",
      "src": [
       {
        "file": "~/Dev/pipeline-watch/reports/2026-10-12.md",
        "line": 105,
        "quote": "| dead launches | 0 found | 0 found in sampled runs; not counted |"
       }
      ]
     },
     {
      "name": "dead codex launches in the framed-slot arc (usage limits, a broken config.toml), ~10 min each",
      "value": "7 of 19",
      "as_of": "2026-09-16",
      "src": [
       {
        "file": "~/.claude/projects/-Users-turbokach-Dev-claude-code-setup/memory/ios-app-arc-2026-09-15.md",
        "line": 10,
        "quote": "Dead codex launches: 7 of 19, 10 min each"
       }
      ]
     }
    ],
    "gaps": [
     {
      "text": "Tech debt (codex-challenge arc bundle): 17 deferred findings, most in codex-challenge.sh, e.g. pin liveness keyed on the wrapper PID (PID reuse still open), no committed self-test, no check that codex read the range diff.",
      "kind": "tech-debt",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/docs/tech-debt.md",
        "line": 25,
        "quote": "Deferred from the codex-challenge arc"
       },
       {
        "file": "~/Dev/claude-code-setup/docs/todos/deferred-codex-challenge-arc.md",
        "line": 9,
        "quote": "pin liveness is keyed on the wrapper shell PID ($$)"
       }
      ]
     }
    ],
    "src": [
     {
      "file": "~/Dev/claude-code-setup/skills/feature-workflow/scripts/codex-challenge.sh",
      "line": 176,
      "quote": "codex-challenge: exit %s after %dm%02ds (%ss)"
     }
    ]
   }
  },
  {
   "id": "exitq",
   "lane": "master",
   "col": 4,
   "kind": "decision",
   "title": "EXIT CODE?",
   "sub": "+ elapsed secs",
   "produces": "route",
   "card": {
    "actor": "master",
    "model": "opus · xhigh (settings model + modelSettings)",
    "does": "Reads the exit code and elapsed time the background Bash shows on completion. The master never reads the verdict file itself.",
    "inputs": [
     "exit code",
     "elapsed seconds"
    ],
    "artifacts": [
     "route"
    ],
    "gates": [
     {
      "rule": "Exit 124: relaunch once with the same arguments under a different --out name (-r2).",
      "evidence": "a second run under an -r2 --out name",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
        "line": 28,
        "quote": "Exit 124 → relaunch once with the same arguments, under a different `--out` name (e.g. a `-r2` suffix)."
       }
      ]
     },
     {
      "rule": "A second 124: at stage 5 split the range; in a per-step round skip that round and note it in the cost checkpoint.",
      "evidence": "none",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
        "line": 28,
        "quote": "A second 124 → the range is too big: split it (above)"
       },
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
        "line": 28,
        "quote": "when this fires inside a stage-4 per-step round, skip that round and note it in the cost checkpoint"
       }
      ]
     },
     {
      "rule": "Non-zero after three attempts, or exit 66: park; no relaunch and no unpinned retry.",
      "evidence": "none",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
        "line": 28,
        "quote": "Non-zero after the script's three attempts"
       },
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
        "line": 28,
        "quote": "Exit 66 (pin refused, under the free-space threshold) → park like the other failures"
       }
      ]
     }
    ],
    "options": [],
    "metrics": [],
    "gaps": [
     {
      "text": "Tech debt: the elapsed line is missing on every setup exit (64–67), and for a pinned run it excludes the cleanup the EXIT trap runs after it.",
      "kind": "tech-debt",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/docs/tech-debt.md",
        "line": 29,
        "quote": "elapsed-line accuracy gaps"
       }
      ]
     }
    ],
    "src": []
   }
  },
  {
   "id": "relaunch",
   "lane": "master",
   "col": 5,
   "kind": "stage",
   "title": "RELAUNCH ONCE",
   "sub": "on 124, -r2 --out",
   "produces": "second run",
   "card": {
    "actor": "master",
    "model": "opus · xhigh (settings model + modelSettings)",
    "does": "Same arguments, new --out name, so the first file survives. A single commit too large to split is also relaunched once unsplit; if it stalls again, review by path (--paths) is a deferred script addition.",
    "inputs": [
     "first run: exit 124"
    ],
    "artifacts": [
     "-r2 verdict file"
    ],
    "gates": [
     {
      "rule": "A single commit too large to review alone is relaunched once unsplit; a second stall defers review by path to tech-debt.",
      "evidence": "none",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
        "line": 26,
        "quote": "A single commit too large to review on its own can't be split into sub-ranges — relaunch once unsplit"
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
   "id": "skip",
   "lane": "master",
   "col": 6,
   "kind": "output",
   "title": "ROUND SKIPPED",
   "sub": "per-step, 2nd 124",
   "produces": "checkpoint note",
   "card": {
    "actor": "master",
    "model": "opus · xhigh (settings model + modelSettings)",
    "does": "The per-step round is skipped and noted in the cost checkpoint; stage 5 still covers the skipped range.",
    "inputs": [
     "second 124 in a per-step round"
    ],
    "artifacts": [
     "cost-checkpoint note"
    ],
    "gates": [
     {
      "rule": "A skipped per-step round is noted in the cost checkpoint; stage 5 covers its range.",
      "evidence": "the note in the cost checkpoint",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
        "line": 28,
        "quote": "stage 5 still covers the skipped range"
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
   "id": "split",
   "lane": "master",
   "col": 7,
   "kind": "stage",
   "title": "SPLIT RANGE",
   "sub": "stage 5, 2nd 124",
   "produces": "contiguous slices",
   "card": {
    "actor": "master",
    "model": "opus · xhigh (settings model + modelSettings)",
    "does": "Contiguous commit sub-ranges that jointly cover the whole range with no gap; one codex-challenge.sh call per slice, concurrent and unpinned. The slices are still one gate.",
    "inputs": [
     "second 124 at stage 5"
    ],
    "artifacts": [
     "slice ranges"
    ],
    "gates": [
     {
      "rule": "Slices jointly cover the whole range with no gap; overlap is fine, a gap is a failed gate.",
      "evidence": "each slice file's header line records its range",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
        "line": 26,
        "quote": "Split into contiguous commit sub-ranges so the slices **jointly cover the whole range with no gap**"
       },
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
        "line": 26,
        "quote": "overlapping slices are fine, a gap is a failed gate"
       }
      ]
     },
     {
      "rule": "Slices run concurrent and unpinned: no writer at stage 5, and the runner traces the final tree.",
      "evidence": "none",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
        "line": 26,
        "quote": "run one `codex-challenge.sh` call per slice, concurrent, **unpinned**"
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
   "id": "slices",
   "lane": "codex",
   "col": 7,
   "kind": "codex",
   "title": "SLICES",
   "sub": "concurrent, no pin",
   "produces": "file per slice",
   "card": {
    "actor": "codex-challenge.sh, one call per slice",
    "model": "gpt-6.1-sol · medium (CODEX_REVIEW_MODEL / _EFFORT)",
    "does": "One run per slice, each with its own --out file and its own header line.",
    "inputs": [
     "slice ranges"
    ],
    "artifacts": [
     "one file per slice"
    ],
    "gates": [],
    "options": [],
    "metrics": [],
    "gaps": [],
    "src": [
     {
      "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
      "line": 26,
      "quote": "each slice's range is recorded in its own header line"
     }
    ]
   }
  },
  {
   "id": "triage",
   "lane": "sub",
   "col": 8,
   "kind": "sub",
   "title": "codex-triage",
   "sub": "all files, 1 spawn",
   "produces": "verdict/verbatim",
   "card": {
    "actor": "codex-triage (fresh per round)",
    "model": "sonnet · medium (frontmatter)",
    "does": "One spawn reads every file of the round, merges and dedupes slices by mechanism into one verdict. A file with a non-zero exit, or exit 0 in under 60 s with no findings text, is reported verbatim and triage stops.",
    "inputs": [
     "round file(s)",
     "range",
     "head sha"
    ],
    "artifacts": [
     "one verdict, or the failure verbatim"
    ],
    "gates": [
     {
      "rule": "All slice files go to one codex-triage spawn that merges and dedupes them; the master never triages slices separately.",
      "evidence": "one triaged verdict for the whole range",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
        "line": 26,
        "quote": "hand ALL slice output files to a single `codex-triage` spawn"
       }
      ]
     },
     {
      "rule": "Exit 0 in under 60 s with no findings text is an auth or usage-limit failure: reported verbatim, then stop.",
      "evidence": "the triage report quoting the file verbatim",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/agents/codex-triage.md",
        "line": 21,
        "quote": "exit 0 in under 60s with no findings text in the verdict body (a usage limit or auth error, not a review)"
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
   "id": "plansz",
   "lane": "master",
   "col": 9,
   "kind": "input",
   "title": "PLAN DRAFT",
   "sub": "steps · files",
   "produces": "size facts",
   "card": {
    "actor": "master (stage 2)",
    "model": "opus · xhigh (settings model + modelSettings)",
    "does": "The plan's execution-step count and the files its steps touch.",
    "inputs": [],
    "artifacts": [
     "step count",
     "file count"
    ],
    "gates": [],
    "options": [],
    "metrics": [],
    "gaps": [],
    "src": []
   }
  },
  {
   "id": "arcq",
   "lane": "master",
   "col": 10,
   "kind": "decision",
   "title": "ARC SPLIT?",
   "sub": ">5 steps/40+ files",
   "produces": "1 or 2 arcs",
   "card": {
    "actor": "master; plan-reviewer blocks",
    "model": "opus · xhigh (settings model + modelSettings)",
    "does": "More than 5 execution steps, or steps that together touch 40+ files, is two arcs: split along feature blocks, each with its own session and stage 5, a device/client pass between. The plan names the checkpoint.",
    "inputs": [
     "step count",
     "file count"
    ],
    "artifacts": [
     "arc boundary in the plan"
    ],
    "gates": [
     {
      "rule": "More than 5 steps or 40+ files is two arcs, each with its own session and stage 5, a device/client pass between.",
      "evidence": "plan-reviewer reports blocking=0",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
        "line": 17,
        "quote": "more than 5 execution steps, or steps that together touch 40+ files, is two arcs"
       },
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
        "line": 17,
        "quote": "each with its own session, its own stage 5 and a device/client pass between"
       },
       {
        "file": "~/Dev/claude-code-setup/agents/plan-reviewer.md",
        "line": 19,
        "quote": "a plan with more than 5 execution steps, or whose steps together touch 40+ files, is blocking until split into arcs"
       }
      ]
     }
    ],
    "options": [],
    "metrics": [
     {
      "name": "median master session span, one arc per session (10-05 report: 185 min)",
      "value": "145 min",
      "as_of": "2026-10-12",
      "src": [
       {
        "file": "~/Dev/pipeline-watch/reports/2026-10-12.md",
        "line": 100,
        "quote": "| median session span | 185 min | 145 min |"
       }
      ]
     }
    ],
    "gaps": [],
    "src": []
   }
  },
  {
   "id": "device",
   "lane": "owner",
   "col": 10,
   "kind": "stage",
   "title": "DEVICE PASS",
   "sub": "between the arcs",
   "produces": "arc 1 checked",
   "card": {
    "actor": "owner on a device, or a client pass",
    "model": "—",
    "does": "After arc 1's stage 5: the device or client pass at the checkpoint the plan names, before arc 2 starts.",
    "inputs": [
     "arc 1 landed"
    ],
    "artifacts": [
     "pass result"
    ],
    "gates": [
     {
      "rule": "The plan names the checkpoint between the arcs.",
      "evidence": "none",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
        "line": 17,
        "quote": "the plan names the checkpoint"
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
   "id": "ctx",
   "lane": "harness",
   "col": 11,
   "kind": "input",
   "title": "CONTEXT SIZE",
   "sub": "master tokens",
   "produces": "measured size",
   "card": {
    "actor": "harness",
    "model": "—",
    "does": "The master's own context size, posted in its cost checkpoints.",
    "inputs": [],
    "artifacts": [
     "measured context size"
    ],
    "gates": [],
    "options": [],
    "metrics": [
     {
      "name": "master peak context, median / max (10-05 report: 341k / 610k)",
      "value": "389k / 570k",
      "as_of": "2026-10-12",
      "src": [
       {
        "file": "~/Dev/pipeline-watch/reports/2026-10-12.md",
        "line": 98,
        "quote": "| median / max master peak | 341k / 610k | 389k / 570k |"
       },
       {
        "file": "~/Dev/claude-code-setup/skills/analyze-arcs/scripts/analyze.py",
        "line": 323,
        "quote": "r['peak'] = max(r['peak'], tot)"
       }
      ]
     }
    ],
    "gaps": [],
    "src": []
   }
  },
  {
   "id": "ctxq",
   "lane": "master",
   "col": 11,
   "kind": "decision",
   "title": "CONTEXT?",
   "sub": "400k · 500k · 600k",
   "produces": "route",
   "card": {
    "actor": "master",
    "model": "opus · xhigh (settings model + modelSettings)",
    "does": "A normal arc finishes under ~400k with no compression. Crossing ~400k mid-arc is a defect signal. Near ~500k (600k absolute max) the master hands off.",
    "inputs": [
     "measured context size"
    ],
    "artifacts": [
     "route"
    ],
    "gates": [
     {
      "rule": "A normal feature arc finishes under ~400k with no compression machinery.",
      "evidence": "the measured context size in the cost checkpoints",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
        "line": 40,
        "quote": "a normal feature arc finishes under ~400k with no compression machinery"
       }
      ]
     },
     {
      "rule": "Near the ceiling (~500k; 600k absolute max) hand off; never silently push past it.",
      "evidence": "the handoff brief file",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
        "line": 39,
        "quote": "the master approaches the context ceiling mid-arc (~500k tokens; 600k absolute max) — never silently push past it"
       }
      ]
     }
    ],
    "options": [],
    "metrics": [
     {
      "name": "arcs at or above 450k / 500k master context, of 63 (10-05 report: 6 at ≥450k)",
      "value": "19 / 14 of 63",
      "as_of": "2026-10-12",
      "src": [
       {
        "file": "~/Dev/pipeline-watch/reports/2026-10-12.md",
        "line": 99,
        "quote": "| arcs ≥450k / ≥500k | 6 / — | 19 / 14 |"
       }
      ]
     }
    ],
    "gaps": [],
    "src": []
   }
  },
  {
   "id": "ckpt",
   "lane": "master",
   "col": 12,
   "kind": "stage",
   "title": "COST CHECKPOINT",
   "sub": "~400k: defect",
   "produces": "flood named",
   "card": {
    "actor": "master",
    "model": "opus · xhigh (settings model + modelSettings)",
    "does": "Stops and posts the cost checkpoint naming what floods the context, so the flow gets fixed; no compression, no handoff. In the unattended tail a one-line checkpoint follows every step boundary.",
    "inputs": [
     "context past ~400k"
    ],
    "artifacts": [
     "cost checkpoint"
    ],
    "gates": [
     {
      "rule": "Crossing ~400k mid-arc: stop, post the cost checkpoint, name what floods the context.",
      "evidence": "the posted checkpoint naming the flood",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
        "line": 40,
        "quote": "Crossing ~400k mid-arc is a *defect signal*, not a reason to compress or hand off"
       },
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
        "line": 40,
        "quote": "stop, post the cost checkpoint, and name what's flooding the context so the flow gets fixed"
       }
      ]
     },
     {
      "rule": "Unattended tail: a one-line cost checkpoint at every step boundary (elapsed time, and the context size read from the last assistant usage in the session transcript, never estimated).",
      "evidence": "the checkpoint lines, each with a measured context size",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
        "line": 40,
        "quote": "post a one-line cost checkpoint at every step boundary"
       },
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
        "line": 40,
        "quote": "input + cache-read + cache-creation tokens, never estimated"
       }
      ]
     }
    ],
    "options": [],
    "metrics": [
     {
      "name": "checkpoint context figures checked against the transcript's cache_read_input_tokens, 1.7–2.5× too low",
      "value": "3 of 4 low",
      "as_of": "2026-10-12",
      "src": [
       {
        "file": "~/Dev/pipeline-watch/reports/2026-10-12.md",
        "line": 61,
        "quote": "3 of the 4 checked checkpoints were 1.7–2.5× too low"
       }
      ]
     }
    ],
    "gaps": [],
    "src": []
   }
  },
  {
   "id": "handoff",
   "lane": "master",
   "col": 13,
   "kind": "stage",
   "title": "HANDOFF BRIEF",
   "sub": "scratchpad/handoff",
   "produces": "brief file",
   "card": {
    "actor": "master",
    "model": "opus · xhigh (settings model + modelSettings)",
    "does": "A new arc gets a new master. The brief: goal, plan path and next arc, feature-base sha, what landed and what was deferred, the owner's standing instructions verbatim, linked sibling sessions, never push.",
    "inputs": [
     "next arc queued, or the context ceiling"
    ],
    "artifacts": [
     "<scratchpad>/handoff-<feature>.md"
    ],
    "gates": [
     {
      "rule": "The brief goes to <scratchpad>/handoff-<feature>.md with the owner's standing instructions verbatim.",
      "evidence": "the brief file",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
        "line": 39,
        "quote": "the master writes the next arc's brief to `<scratchpad>/handoff-<feature>.md`"
       },
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
        "line": 39,
        "quote": "the owner's standing instructions verbatim"
       }
      ]
     },
     {
      "rule": "Attended: end the turn with the brief path and the owner's steps; never offer to start the next arc here.",
      "evidence": "none",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
        "line": 39,
        "quote": "Attended: the turn ends with the brief's path and the owner's steps"
       },
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
        "line": 39,
        "quote": "never an offer to start the next arc in this session"
       }
      ]
     },
     {
      "rule": "Unattended, under delegated approval: launch claude --bg with this session's name, then end this session.",
      "evidence": "none",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
        "line": 39,
        "quote": "Unattended, under delegated approval: launch it"
       },
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
        "line": 39,
        "quote": "then end this session"
       }
      ]
     }
    ],
    "options": [],
    "metrics": [],
    "gaps": [
     {
      "text": "Report C2 (remainder): a coordinator gave one master many tickets (41d1045b ran 7 in 11 h), which defeats 'a new arc gets a new master'; 14 masters peaked at 600k or more and 3 auto-compacted near 967k. The coordinator's design is the owner's call.",
      "kind": "report",
      "src": [
       {
        "file": "~/Dev/pipeline-watch/reports/2026-10-19.md",
        "line": 32,
        "quote": "14 masters peaked at ≥600k; last week none did."
       },
       {
        "file": "~/Dev/pipeline-watch/reports/2026-10-19.md",
        "line": 34,
        "quote": "The coordinator gives one master many tickets"
       },
       {
        "file": "~/Dev/pipeline-watch/reports/2026-10-19.md",
        "line": 33,
        "quote": "Three masters auto-compacted at about 967k"
       }
      ]
     }
    ],
    "src": [
     {
      "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
      "line": 39,
      "quote": "A new arc gets a new master."
     }
    ]
   }
  },
  {
   "id": "paste",
   "lane": "owner",
   "col": 14,
   "kind": "stage",
   "title": "NEW SESSION",
   "sub": "owner pastes brief",
   "produces": "next master",
   "card": {
    "actor": "owner",
    "model": "—",
    "does": "Attended path: the owner pastes the brief into a new session.",
    "inputs": [
     "brief path",
     "owner's steps"
    ],
    "artifacts": [
     "new session"
    ],
    "gates": [],
    "options": [],
    "metrics": [],
    "gaps": [],
    "src": []
   }
  },
  {
   "id": "bg",
   "lane": "harness",
   "col": 14,
   "kind": "stage",
   "title": "--bg SESSION",
   "sub": "same name, auto",
   "produces": "next master",
   "card": {
    "actor": "harness: a background Claude Code session",
    "model": "—",
    "does": "A --bg session is a full session that outlives its launcher; reusing this session's name keeps linked sibling addresses valid.",
    "inputs": [
     "brief"
    ],
    "artifacts": [
     "background session"
    ],
    "gates": [
     {
      "rule": "An AskUserQuestion inside a --bg session parks it under \"Needs input\" until someone attaches.",
      "evidence": "none",
      "enforced_by": "harness",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
        "line": 39,
        "quote": "an `AskUserQuestion` inside it parks the session under \"Needs input\" until someone attaches"
       }
      ]
     },
     {
      "rule": "The brief carries the delegation that makes gates self-resolving.",
      "evidence": "none",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
        "line": 39,
        "quote": "so the brief must carry the delegation that makes gates self-resolving"
       }
      ]
     }
    ],
    "options": [],
    "metrics": [],
    "gaps": [
     {
      "text": "Report C3: a --bg master that enters a worktree stops at a permission prompt (436d8030 launched 1c52cb90). Proposal: launch from the checkout it will work in. That every --bg EnterWorktree prompts is a hypothesis from one case.",
      "kind": "report",
      "src": [
       {
        "file": "~/Dev/pipeline-watch/reports/2026-10-12.md",
        "line": 64,
        "quote": "A `--bg` master that enters a worktree stops at a permission prompt."
       },
       {
        "file": "~/Dev/pipeline-watch/reports/2026-10-12.md",
        "line": 70,
        "quote": "the checkout it will work in"
       }
      ]
     },
     {
      "text": "Tech debt: the unattended claude --bg handoff may be refused by the auto-mode classifier; a same-shape launch was denied as 'Create Unsafe Agents'. Unverified under delegated approval.",
      "kind": "tech-debt",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/docs/tech-debt.md",
        "line": 23,
        "quote": "unattended `claude --bg` handoff may be refused by the auto-mode classifier"
       }
      ]
     }
    ],
    "src": [
     {
      "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
      "line": 39,
      "quote": "`cd <repo> && claude --bg --name \"<this session's name>\" --permission-mode auto"
     }
    ]
   }
  },
  {
   "id": "newm",
   "lane": "master",
   "col": 14,
   "kind": "output",
   "title": "NEW MASTER",
   "sub": "next arc",
   "produces": "arc continues",
   "card": {
    "actor": "the new master session",
    "model": "opus · xhigh (settings model + modelSettings)",
    "does": "Starts from the brief; on start it messages every linked sibling session with its own address.",
    "inputs": [
     "brief"
    ],
    "artifacts": [
     "next arc"
    ],
    "gates": [],
    "options": [],
    "metrics": [],
    "gaps": [],
    "src": [
     {
      "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
      "line": 39,
      "quote": "the sibling-repo sessions linked to the feature (the new master messages each on start with its own address)"
     }
    ]
   }
  }
 ],
 "edges": [
  {
   "id": "r_cron_quiet",
   "from": "cron",
   "to": "quiet",
   "exit": "b",
   "enter": "t",
   "kind": "flow"
  },
  {
   "id": "r_quiet_trans",
   "from": "quiet",
   "to": "trans",
   "exit": "r",
   "enter": "l",
   "kind": "flow"
  },
  {
   "id": "r_respawn_trans",
   "from": "respawn",
   "to": "trans",
   "exit": "l",
   "enter": "l",
   "kind": "back",
   "via": [
    [
     0.5,
     3
    ]
   ],
   "label": "dies again",
   "bound": "≤2 respawns",
   "src": [
    {
     "file": "~/Dev/claude-code-setup/global/CLAUDE.md",
     "line": 39,
     "quote": "up to 2 respawns for an API-error death, then park with a push notification"
    }
   ]
  },
  {
   "id": "r_apierr_trans",
   "from": "apierr",
   "to": "trans",
   "exit": "b",
   "enter": "t",
   "kind": "flow"
  },
  {
   "id": "r_trans_respawn",
   "from": "trans",
   "to": "respawn",
   "exit": "b",
   "enter": "t",
   "kind": "flow"
  },
  {
   "id": "r_trans_park",
   "from": "trans",
   "to": "park",
   "exit": "r",
   "enter": "b",
   "kind": "flow",
   "via": [
    [
     1.5,
     1.5
    ],
    [
     2.5,
     1.5
    ],
    [
     2.5,
     0.5
    ]
   ],
   "label": "after 2 respawns"
  },
  {
   "id": "r_resumed_trans",
   "from": "resumed",
   "to": "trans",
   "exit": "l",
   "enter": "r",
   "kind": "back",
   "label": "caps again",
   "bound": "none"
  },
  {
   "id": "r_cap_wip",
   "from": "cap",
   "to": "wip",
   "exit": "b",
   "enter": "t",
   "kind": "flow"
  },
  {
   "id": "r_wip_resumed",
   "from": "wip",
   "to": "resumed",
   "exit": "b",
   "enter": "t",
   "kind": "flow",
   "label": "SendMessage"
  },
  {
   "id": "r_launch_run",
   "from": "launch",
   "to": "run",
   "exit": "b",
   "enter": "t",
   "kind": "flow"
  },
  {
   "id": "r_run_exitq",
   "from": "run",
   "to": "exitq",
   "exit": "r",
   "enter": "b",
   "kind": "flow"
  },
  {
   "id": "r_exitq_park",
   "from": "exitq",
   "to": "park",
   "exit": "t",
   "enter": "b",
   "kind": "flow",
   "via": [
    [
     3.5,
     0.5
    ]
   ],
   "label": "66 / fail ×3"
  },
  {
   "id": "r_exitq_split",
   "from": "exitq",
   "to": "split",
   "exit": "t",
   "enter": "t",
   "kind": "flow",
   "via": [
    [
     4.5,
     0.5
    ]
   ],
   "label": "124 again · stage 5"
  },
  {
   "id": "r_exitq_skip",
   "from": "exitq",
   "to": "skip",
   "exit": "t",
   "enter": "t",
   "kind": "flow",
   "via": [
    [
     4.5,
     1.5
    ]
   ],
   "label": "124 again · per-step"
  },
  {
   "id": "r_exitq_relaunch",
   "from": "exitq",
   "to": "relaunch",
   "exit": "r",
   "enter": "l",
   "kind": "flow"
  },
  {
   "id": "r_relaunch_run",
   "from": "relaunch",
   "to": "run",
   "exit": "b",
   "enter": "b",
   "kind": "back",
   "via": [
    [
     5,
     4.5
    ]
   ],
   "label": "same args",
   "bound": "once",
   "src": [
    {
     "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
     "line": 28,
     "quote": "Exit 124 → relaunch once with the same arguments"
    }
   ]
  },
  {
   "id": "r_exitq_triage",
   "from": "exitq",
   "to": "triage",
   "exit": "b",
   "enter": "t",
   "kind": "flow",
   "label": "exit 0"
  },
  {
   "id": "r_split_slices",
   "from": "split",
   "to": "slices",
   "exit": "b",
   "enter": "t",
   "kind": "flow"
  },
  {
   "id": "r_slices_triage",
   "from": "slices",
   "to": "triage",
   "exit": "r",
   "enter": "b",
   "kind": "flow"
  },
  {
   "id": "r_triage_park",
   "from": "triage",
   "to": "park",
   "exit": "t",
   "enter": "t",
   "kind": "flow",
   "via": [
    [
     8,
     -0.5
    ]
   ],
   "label": "exit 0 <60s, no findings"
  },
  {
   "id": "r_plansz_arcq",
   "from": "plansz",
   "to": "arcq",
   "exit": "r",
   "enter": "l",
   "kind": "flow"
  },
  {
   "id": "r_arcq_device",
   "from": "arcq",
   "to": "device",
   "exit": "t",
   "enter": "b",
   "kind": "flow",
   "label": "two arcs"
  },
  {
   "id": "r_device_handoff",
   "from": "device",
   "to": "handoff",
   "exit": "r",
   "enter": "l",
   "kind": "flow",
   "via": [
    [
     10.5,
     0.5
    ],
    [
     12.5,
     0.5
    ]
   ],
   "label": "arc 2 next"
  },
  {
   "id": "r_ctx_ctxq",
   "from": "ctx",
   "to": "ctxq",
   "exit": "b",
   "enter": "t",
   "kind": "flow"
  },
  {
   "id": "r_ctxq_ckpt",
   "from": "ctxq",
   "to": "ckpt",
   "exit": "r",
   "enter": "l",
   "kind": "flow"
  },
  {
   "id": "r_ctxq_handoff",
   "from": "ctxq",
   "to": "handoff",
   "exit": "b",
   "enter": "b",
   "kind": "flow",
   "via": [
    [
     11.5,
     2.5
    ]
   ],
   "label": "~500k: hand off"
  },
  {
   "id": "r_handoff_paste",
   "from": "handoff",
   "to": "paste",
   "exit": "t",
   "enter": "l",
   "kind": "flow",
   "label": "attended"
  },
  {
   "id": "r_handoff_bg",
   "from": "handoff",
   "to": "bg",
   "exit": "t",
   "enter": "l",
   "kind": "flow",
   "label": "unattended"
  },
  {
   "id": "r_bg_newm",
   "from": "bg",
   "to": "newm",
   "exit": "b",
   "enter": "t",
   "kind": "flow"
  },
  {
   "id": "r_paste_newm",
   "from": "paste",
   "to": "newm",
   "exit": "r",
   "enter": "r",
   "kind": "flow",
   "via": [
    [
     14.5,
     1
    ]
   ]
  }
 ],
 "scenarios": [
  {
   "id": "quiet",
   "title": "watchdog: a quiet agent is read and respawned",
   "steps": [
    {
     "edge": "r_cron_quiet",
     "t": 0.0,
     "d": 1.0,
     "packet": "cron :22",
     "log": "cron fires while the master waits idle: list subagents/*.jsonl by mtime"
    },
    {
     "edge": "r_quiet_trans",
     "t": 1.2,
     "d": 0.8,
     "packet": "quiet agent",
     "log": "an executor wrote nothing for 10 min -> TaskStop, read its transcript"
    },
    {
     "edge": "r_trans_respawn",
     "t": 2.2,
     "d": 1.0,
     "packet": "remainder",
     "log": "most of the step is done: salvage it, fresh agent for the remainder only"
    }
   ]
  },
  {
   "id": "cap",
   "title": "maxTurns cap: resume, then a fresh agent on the second cap",
   "steps": [
    {
     "edge": "r_cap_wip",
     "t": 0.0,
     "d": 1.0,
     "packet": "partial",
     "log": "step-executor stops at maxTurns 200: its result is marked partial"
    },
    {
     "edge": "r_wip_resumed",
     "t": 1.2,
     "d": 1.0,
     "packet": "WIP: commit",
     "log": "dirty tree -> master commits WIP:, the SendMessage resume names it"
    },
    {
     "edge": "r_resumed_trans",
     "t": 2.4,
     "d": 1.2,
     "packet": "caps again",
     "log": "the resumed agent caps again -> read its transcript, commit any WIP:"
    },
    {
     "edge": "r_trans_respawn",
     "t": 3.8,
     "d": 1.0,
     "packet": "remainder",
     "log": "a fresh agent for the remainder; the cap is never raised"
    }
   ]
  },
  {
   "id": "api",
   "title": "API-error death: two respawns, then park",
   "steps": [
    {
     "edge": "r_apierr_trans",
     "t": 0.0,
     "d": 1.0,
     "packet": "no report",
     "log": "a fixer ends on an API error: nothing is delivered -> read its transcript"
    },
    {
     "edge": "r_trans_respawn",
     "t": 1.2,
     "d": 0.9,
     "packet": "respawn 1",
     "log": "salvage, then respawn 1 of 2 for the remainder"
    },
    {
     "edge": "r_respawn_trans",
     "t": 2.3,
     "d": 1.0,
     "packet": "API error",
     "log": "respawn 1 dies on an API error too"
    },
    {
     "edge": "r_trans_respawn",
     "t": 3.5,
     "d": 0.9,
     "packet": "respawn 2",
     "log": "respawn 2 of 2"
    },
    {
     "edge": "r_respawn_trans",
     "t": 4.6,
     "d": 1.0,
     "packet": "API error",
     "log": "respawn 2 dies as well"
    },
    {
     "edge": "r_trans_park",
     "t": 5.8,
     "d": 1.4,
     "packet": "notification",
     "log": "2 respawns used -> park: push notification, end the turn"
    }
   ]
  },
  {
   "id": "124",
   "title": "stage 5: exit 124, relaunch once, then split the range",
   "steps": [
    {
     "edge": "r_launch_run",
     "t": 0.0,
     "d": 0.9,
     "packet": "base..HEAD",
     "log": "stage 5: codex-challenge.sh base..HEAD as a background Bash"
    },
    {
     "edge": "r_run_exitq",
     "t": 1.1,
     "d": 1.0,
     "packet": "exit 124",
     "log": "the attempt stalls at 15 min: exit 124, not retried by the script"
    },
    {
     "edge": "r_exitq_relaunch",
     "t": 2.3,
     "d": 0.5,
     "packet": "124",
     "log": "exit 124 -> relaunch once, same arguments, an -r2 --out name"
    },
    {
     "edge": "r_relaunch_run",
     "t": 3.0,
     "d": 1.4,
     "packet": "same args",
     "log": null
    },
    {
     "edge": "r_run_exitq",
     "t": 4.6,
     "d": 1.0,
     "packet": "exit 124",
     "log": "the relaunch stalls too: a second 124"
    },
    {
     "edge": "r_exitq_split",
     "t": 5.8,
     "d": 1.2,
     "packet": "range",
     "log": "stage 5: the range is too big -> split into contiguous slices"
    },
    {
     "edge": "r_split_slices",
     "t": 7.2,
     "d": 0.8,
     "packet": "3 slices",
     "log": "3 slices with no gap, concurrent, unpinned"
    },
    {
     "edge": "r_slices_triage",
     "t": 8.2,
     "d": 0.9,
     "packet": "3 files",
     "log": "one codex-triage spawn merges and dedupes all slice files"
    }
   ]
  },
  {
   "id": "skip",
   "title": "per-step round: a second 124 skips the round",
   "steps": [
    {
     "edge": "r_launch_run",
     "t": 0.0,
     "d": 0.9,
     "packet": "prev..HEAD",
     "log": "per-step round 3 with --pin"
    },
    {
     "edge": "r_run_exitq",
     "t": 1.1,
     "d": 1.0,
     "packet": "exit 124",
     "log": "exit 124 -> relaunch once under an -r2 --out name"
    },
    {
     "edge": "r_exitq_relaunch",
     "t": 2.3,
     "d": 0.5,
     "packet": "124",
     "log": null
    },
    {
     "edge": "r_relaunch_run",
     "t": 3.0,
     "d": 1.4,
     "packet": "same args",
     "log": null
    },
    {
     "edge": "r_run_exitq",
     "t": 4.6,
     "d": 1.0,
     "packet": "exit 124",
     "log": "a second 124 in a per-step round"
    },
    {
     "edge": "r_exitq_skip",
     "t": 5.8,
     "d": 1.0,
     "packet": "skip",
     "log": "skip the round, note it in the cost checkpoint; stage 5 covers the range"
    }
   ]
  },
  {
   "id": "0s",
   "title": "exit 0 in under 60 s: triage reports it, park",
   "steps": [
    {
     "edge": "r_launch_run",
     "t": 0.0,
     "d": 0.9,
     "packet": "base..HEAD",
     "log": "stage 5 launch"
    },
    {
     "edge": "r_run_exitq",
     "t": 1.1,
     "d": 1.0,
     "packet": "exit 0, 41 s",
     "log": "exit 0 after 41 s: too fast for a real review"
    },
    {
     "edge": "r_exitq_triage",
     "t": 2.3,
     "d": 1.2,
     "packet": "round1.md",
     "log": "codex-triage reads the file; the master never does"
    },
    {
     "edge": "r_triage_park",
     "t": 3.7,
     "d": 1.5,
     "packet": "verbatim",
     "log": "no findings text: a usage-limit error, quoted verbatim -> park"
    }
   ]
  },
  {
   "id": "66",
   "title": "exit 66 or failure after 3 attempts: park",
   "steps": [
    {
     "edge": "r_launch_run",
     "t": 0.0,
     "d": 0.9,
     "packet": "--pin",
     "log": "per-step round with --pin"
    },
    {
     "edge": "r_run_exitq",
     "t": 1.1,
     "d": 1.0,
     "packet": "exit 66",
     "log": "under 2 GB free on the scratch volume: refusing to pin, exit 66"
    },
    {
     "edge": "r_exitq_park",
     "t": 2.3,
     "d": 1.4,
     "packet": "notification",
     "log": "park: push-notify, end the turn, no unpinned retry"
    }
   ]
  },
  {
   "id": "400k",
   "title": "context past ~400k: stop and post the cost checkpoint",
   "steps": [
    {
     "edge": "r_ctx_ctxq",
     "t": 0.0,
     "d": 1.0,
     "packet": "~410k",
     "log": "the master's context passes ~400k mid-arc"
    },
    {
     "edge": "r_ctxq_ckpt",
     "t": 1.2,
     "d": 1.0,
     "packet": "defect",
     "log": "a defect signal, not a reason to compress: stop, post the checkpoint, name the flood"
    }
   ]
  },
  {
   "id": "500k",
   "title": "context near ~500k: handoff, the owner starts a new session",
   "steps": [
    {
     "edge": "r_ctx_ctxq",
     "t": 0.0,
     "d": 1.0,
     "packet": "~500k",
     "log": "the master nears ~500k (600k is the absolute max)"
    },
    {
     "edge": "r_ctxq_handoff",
     "t": 1.2,
     "d": 1.2,
     "packet": "hand off",
     "log": "never push past it: write the handoff brief"
    },
    {
     "edge": "r_handoff_paste",
     "t": 2.6,
     "d": 1.0,
     "packet": "brief path",
     "log": "attended: the turn ends with the brief path and the owner's steps"
    },
    {
     "edge": "r_paste_newm",
     "t": 3.8,
     "d": 1.2,
     "packet": "brief",
     "log": "the owner pastes the brief into a new session; the new master takes over"
    }
   ]
  },
  {
   "id": "arcs",
   "title": "arc split: device pass, then a --bg master for arc 2",
   "steps": [
    {
     "edge": "r_plansz_arcq",
     "t": 0.0,
     "d": 0.8,
     "packet": "7 steps",
     "log": "plan draft: 7 execution steps -> plan-reviewer blocks until split"
    },
    {
     "edge": "r_arcq_device",
     "t": 1.0,
     "d": 1.0,
     "packet": "arc 1",
     "log": "two arcs: arc 1 runs here with its own stage 5"
    },
    {
     "edge": "r_device_handoff",
     "t": 2.2,
     "d": 1.4,
     "packet": "arc 2 next",
     "log": "device pass at the checkpoint the plan names -> handoff brief for arc 2"
    },
    {
     "edge": "r_handoff_bg",
     "t": 3.8,
     "d": 1.0,
     "packet": "brief",
     "log": "unattended, delegated: claude --bg --name <same name> --permission-mode auto"
    },
    {
     "edge": "r_bg_newm",
     "t": 5.0,
     "d": 1.0,
     "packet": "arc 2",
     "log": "this session ends; the --bg master runs arc 2"
    }
   ]
  }
 ]
}
);
