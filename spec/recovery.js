window.PV=window.PV||[];window.PV.push(
{
 "id": "recovery",
 "title": "recovery & limits",
 "key": "2",
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
   "produces": "silence check",
   "card": {
    "actor": "harness cron job, created by the master",
    "model": "—",
    "does": "At a session's first background spawn of an executor, fixer, merger or general-purpose agent, pipeline or not, the master creates one recurring session-only watchdog on an off-minute quarter-hour. With no agent live, it deletes itself.",
    "inputs": [
     "first background executor, fixer, merger or general-purpose spawn"
    ],
    "artifacts": [
     "cron prompt in the master"
    ],
    "gates": [
     {
      "rule": "One recurring session-only CronCreate watchdog at the first background spawn of an executor, fixer, merger or general-purpose agent, pipeline or not; with no agent live, the job runs CronDelete on itself.",
      "evidence": "none",
      "enforced_by": "prose",
      "src": [
       {
        "file": "global/CLAUDE.md",
        "line": 39,
        "quote": "At a session's first background spawn of an executor, fixer, merger or `general-purpose` agent — pipeline or not"
       },
       {
        "file": "global/CLAUDE.md",
        "line": 39,
        "quote": "if no agent is live, `CronDelete` this job"
       }
      ]
     }
    ],
    "options": [],
    "metrics": [],
    "gaps": [],
    "src": [
     {
      "file": "global/CLAUDE.md",
      "line": 39,
      "quote": "`CronCreate` one recurring session-only watchdog on an off-minute quarter-hour (`7,22,37,52 * * * *`)"
     },
     {
      "file": "skills/feature-workflow/SKILL.md",
      "line": 80,
      "quote": "The watchdog cron in global CLAUDE.md makes this check mechanical."
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
    "does": "Lists this session's subagents/*.jsonl by mtime. An agent with no write for 10 min is read, stopped (TaskStop) and respawned for the remainder.",
    "inputs": [
     "subagents/*.jsonl mtimes"
    ],
    "artifacts": [
     "TaskStop"
    ],
    "gates": [
     {
      "rule": "No transcript write for 10 min: read, stop (TaskStop), respawn for the remainder.",
      "evidence": "the transcript mtime in subagents/*.jsonl",
      "enforced_by": "prose",
      "src": [
       {
        "file": "global/CLAUDE.md",
        "line": 39,
        "quote": "read, stop (`TaskStop`) and respawn for the remainder any agent with no write for 10 min"
       }
      ]
     },
     {
      "rule": "The window is measured from the agent's spawn timestamp and last transcript write, never from how long the master has waited.",
      "evidence": "none",
      "enforced_by": "prose",
      "src": [
       {
        "file": "global/CLAUDE.md",
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
        "file": "skills/feature-workflow/SKILL.md",
        "line": 80,
        "quote": "A missing report is a read-the-transcript signal, never a wait."
       },
       {
        "file": "skills/feature-workflow/SKILL.md",
        "line": 80,
        "quote": "An API error that ends a subagent early is never delivered as its result — the master gets nothing."
       }
      ]
     }
    ],
    "options": [],
    "metrics": [
     {
      "name": "subagents that died on an API error before doing work (flag)",
      "src": [
       {
        "file": "skills/analyze-arcs/scripts/analyze.py",
        "line": 645,
        "quote": "subagent(s) died on an API error before doing work"
       }
      ]
     }
    ],
    "gaps": [],
    "src": [
     {
      "file": "global/CLAUDE.md",
      "line": 39,
      "quote": "if my own harness retry was cancelled (Esc) or exhausted, that path stays manual and you say so"
     },
     {
      "file": "skills/analyze-arcs/scripts/analyze.py",
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
        "file": "skills/feature-workflow/SKILL.md",
        "line": 80,
        "quote": "If a delegate goes quiet past its expected window, read its transcript under the session's `subagents/` dir"
       },
       {
        "file": "skills/feature-workflow/SKILL.md",
        "line": 80,
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
        "file": "global/CLAUDE.md",
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
        "file": "skills/feature-workflow/SKILL.md",
        "line": 103,
        "quote": "only if the resumed agent caps again does the master read its transcript under `subagents/`"
       },
       {
        "file": "skills/feature-workflow/SKILL.md",
        "line": 103,
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
        "file": "global/CLAUDE.md",
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
    "does": "The master sends a push notification and ends its turn; the run waits for the owner. At stage 5, an error that names a reset time gets one relaunch at that time; nothing else relaunches.",
    "inputs": [
     "respawns used up",
     "codex failure"
    ],
    "artifacts": [
     "push notification"
    ],
    "gates": [
     {
      "rule": "Park = push-notify and end the turn. At stage 5, one relaunch at the reset time when the error names one (a one-shot CronCreate), none otherwise; exit 66 gets no unpinned retry.",
      "evidence": "the push notification",
      "enforced_by": "prose",
      "src": [
       {
        "file": "skills/feature-workflow/SKILL.md",
        "line": 72,
        "quote": "in stage 5, park: push-notify and end the turn"
       },
       {
        "file": "skills/feature-workflow/SKILL.md",
        "line": 72,
        "quote": "with one relaunch at the reset time when the error names one (a one-shot `CronCreate`), and none otherwise"
       },
       {
        "file": "skills/feature-workflow/SKILL.md",
        "line": 72,
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
        "file": "skills/feature-workflow/SKILL.md",
        "line": 103,
        "quote": "Retirement is mechanical: `maxTurns` in the agent frontmatter, not a prose budget."
       },
       {
        "file": "agents/step-executor.md",
        "line": 6,
        "quote": "maxTurns: 200"
       },
       {
        "file": "agents/fixer.md",
        "line": 6,
        "quote": "maxTurns: 150"
       },
       {
        "file": "agents/codex-triage.md",
        "line": 7,
        "quote": "maxTurns: 60"
       }
      ]
     }
    ],
    "options": [],
    "metrics": [
     {
      "name": "subagents stopped at their maxTurns cap (flag)",
      "src": [
       {
        "file": "skills/analyze-arcs/scripts/analyze.py",
        "line": 646,
        "quote": "flags += cap_flags(subs, r['caps'])"
       }
      ]
     }
    ],
    "gaps": [],
    "src": [
     {
      "file": "skills/analyze-arcs/scripts/analyze.py",
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
        "file": "global/CLAUDE.md",
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
        "file": "skills/feature-workflow/SKILL.md",
        "line": 95,
        "quote": "A result marked partial at `maxTurns` is not an ingested output"
       },
       {
        "file": "global/CLAUDE.md",
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
        "file": "global/CLAUDE.md",
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
        "file": "agents/step-executor.md",
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
        "file": "skills/feature-workflow/SKILL.md",
        "line": 105,
        "quote": "Every such call — the codex run included — passes `timeout: 7200000`, the harness maximum"
       },
       {
        "file": "skills/feature-workflow/SKILL.md",
        "line": 105,
        "quote": "a background call without its own `timeout` is stopped at 30 min"
       }
      ]
     }
    ],
    "options": [],
    "metrics": [
     {
      "name": "codex-challenge launches per session",
      "src": [
       {
        "file": "skills/analyze-arcs/scripts/analyze.py",
        "line": 607,
        "quote": "codex launches {len(r['codex'])}"
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
        "file": "skills/feature-workflow/scripts/codex-challenge.sh",
        "line": 119,
        "quote": "\"$to\" -k 60 900 \"$codex_bin\" exec"
       },
       {
        "file": "skills/feature-workflow/scripts/codex-challenge.sh",
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
        "file": "skills/feature-workflow/scripts/codex-challenge.sh",
        "line": 115,
        "quote": "for attempt in 1 2 3; do"
       },
       {
        "file": "skills/feature-workflow/scripts/codex-challenge.sh",
        "line": 163,
        "quote": "[ \"$attempt\" -lt 3 ] && sleep 300"
       },
       {
        "file": "skills/feature-workflow/scripts/codex-challenge.sh",
        "line": 155,
        "quote": "is at capacity on attempt $attempt — not retrying"
       },
       {
        "file": "skills/feature-workflow/scripts/codex-challenge.sh",
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
        "file": "skills/feature-workflow/scripts/codex-challenge.sh",
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
        "file": "skills/feature-workflow/scripts/codex-challenge.sh",
        "line": 29,
        "quote": "base is not an ancestor of head (history rewritten past the feature base?)"
       }
      ]
     }
    ],
    "options": [],
    "metrics": [],
    "gaps": [
     {
      "text": "Tech debt (codex-challenge arc bundle): 17 deferred findings, most in codex-challenge.sh, e.g. pin liveness keyed on the wrapper PID (PID reuse still open), no committed self-test, no check that codex read the range diff.",
      "kind": "tech-debt",
      "src": [
       {
        "file": "docs/tech-debt.md",
        "line": 25,
        "quote": "Deferred from the codex-challenge arc"
       },
       {
        "file": "docs/todos/deferred-codex-challenge-arc.md",
        "line": 9,
        "quote": "pin liveness is keyed on the wrapper shell PID ($$)"
       }
      ]
     }
    ],
    "src": [
     {
      "file": "skills/feature-workflow/scripts/codex-challenge.sh",
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
        "file": "skills/feature-workflow/SKILL.md",
        "line": 72,
        "quote": "Exit 124 → relaunch once with the same arguments, under a different `--out` name (e.g. a `-r2` suffix)."
       }
      ]
     },
     {
      "rule": "A second 124: at stage 5 split the range; in a per-step round skip that round and say so in the next status note.",
      "evidence": "none",
      "enforced_by": "prose",
      "src": [
       {
        "file": "skills/feature-workflow/SKILL.md",
        "line": 72,
        "quote": "A second 124 → the range is too big: split it (above)"
       },
       {
        "file": "skills/feature-workflow/SKILL.md",
        "line": 72,
        "quote": "skip that round and say so in your next status note"
       }
      ]
     },
     {
      "rule": "Non-zero after three attempts: a per-step round is skipped and no other reviewer stands in; stage 5 parks. Exit 66: park, no unpinned retry.",
      "evidence": "none",
      "enforced_by": "prose",
      "src": [
       {
        "file": "skills/feature-workflow/SKILL.md",
        "line": 72,
        "quote": "Non-zero after the script's three attempts"
       },
       {
        "file": "skills/feature-workflow/SKILL.md",
        "line": 72,
        "quote": "inside a stage-4 per-step round, skip that round the same way, and no other reviewer stands in"
       },
       {
        "file": "skills/feature-workflow/SKILL.md",
        "line": 72,
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
        "file": "docs/tech-debt.md",
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
        "file": "skills/feature-workflow/SKILL.md",
        "line": 70,
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
   "sub": "step: 2nd 124 / fail",
   "produces": "status note",
   "card": {
    "actor": "master",
    "model": "opus · xhigh (settings model + modelSettings)",
    "does": "The per-step round is skipped and the next status note says so; no other reviewer stands in. Stage 5 still covers the skipped range.",
    "inputs": [
     "second 124 in a per-step round",
     "codex failure in a per-step round"
    ],
    "artifacts": [
     "status note"
    ],
    "gates": [
     {
      "rule": "A skipped per-step round is named in the next status note and no other reviewer stands in; stage 5 covers its range.",
      "evidence": "the status note naming the skipped round",
      "enforced_by": "prose",
      "src": [
       {
        "file": "skills/feature-workflow/SKILL.md",
        "line": 72,
        "quote": "stage 5 still covers the skipped range"
       },
       {
        "file": "skills/feature-workflow/SKILL.md",
        "line": 72,
        "quote": "and no other reviewer stands in"
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
        "file": "skills/feature-workflow/SKILL.md",
        "line": 70,
        "quote": "Split into contiguous commit sub-ranges so the slices **jointly cover the whole range with no gap**"
       },
       {
        "file": "skills/feature-workflow/SKILL.md",
        "line": 70,
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
        "file": "skills/feature-workflow/SKILL.md",
        "line": 70,
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
      "file": "skills/feature-workflow/SKILL.md",
      "line": 70,
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
        "file": "skills/feature-workflow/SKILL.md",
        "line": 70,
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
        "file": "agents/codex-triage.md",
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
        "file": "skills/feature-workflow/SKILL.md",
        "line": 17,
        "quote": "more than 5 execution steps, or steps that together touch 40+ files, is two arcs"
       },
       {
        "file": "skills/feature-workflow/SKILL.md",
        "line": 17,
        "quote": "each with its own session, its own stage 5 and a device/client pass between"
       },
       {
        "file": "agents/plan-reviewer.md",
        "line": 19,
        "quote": "a plan with more than 5 execution steps, or whose steps together touch 40+ files, is blocking until split into arcs"
       }
      ]
     }
    ],
    "options": [],
    "metrics": [
     {
      "name": "master session span, first to last record, per session",
      "src": [
       {
        "file": "skills/analyze-arcs/scripts/analyze.py",
        "line": 605,
        "quote": "{r['first']} → {r['last']}, user turns {r['user_turns']}"
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
        "file": "skills/feature-workflow/SKILL.md",
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
    "does": "The master's own context size. Near the ceiling (~500k; 600k absolute max) the master hands off.",
    "inputs": [],
    "artifacts": [
     "measured context size"
    ],
    "gates": [],
    "options": [],
    "metrics": [
     {
      "name": "master peak context per session (input + cache read + cache creation tokens)",
      "src": [
       {
        "file": "skills/analyze-arcs/scripts/analyze.py",
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
   "id": "compact",
   "lane": "harness",
   "col": 12,
   "kind": "input",
   "title": "COMPACTION",
   "sub": "auto or manual",
   "produces": "hook reminder",
   "card": {
    "actor": "harness",
    "model": "—",
    "does": "The master's context is compacted. Compaction can drop an invoked skill's text entirely.",
    "inputs": [],
    "artifacts": [
     "SessionStart event, source compact"
    ],
    "gates": [
     {
      "rule": "A SessionStart hook (matcher compact) prints one reminder line when the transcript shows feature-workflow was loaded, and nothing otherwise.",
      "evidence": "the reminder line in the session context",
      "enforced_by": "hook",
      "src": [
       {
        "file": "hooks/skill-reload-after-compact.sh",
        "line": 2,
        "quote": "SessionStart hook (matcher \"compact\"): after a compaction, reminds the session"
       },
       {
        "file": "settings.example.json",
        "line": 41,
        "quote": "\"matcher\": \"compact\","
       }
      ]
     }
    ],
    "options": [],
    "metrics": [],
    "gaps": [],
    "src": [
     {
      "file": "hooks/skill-reload-after-compact.sh",
      "line": 4,
      "quote": "compaction can drop an invoked skill's text entirely"
     }
    ]
   }
  },
  {
   "id": "reload",
   "lane": "master",
   "col": 12,
   "kind": "stage",
   "title": "RELOAD SKILL",
   "sub": "feature-workflow",
   "produces": "skill text back",
   "card": {
    "actor": "master",
    "model": "opus · xhigh (settings model + modelSettings)",
    "does": "Invokes feature-workflow again before the next pipeline step, so the stage rules are back in context.",
    "inputs": [
     "hook reminder"
    ],
    "artifacts": [
     "Skill call: feature-workflow"
    ],
    "gates": [
     {
      "rule": "After a compaction, invoke feature-workflow again before the next step.",
      "evidence": "a feature-workflow Skill call after the compaction, before the next step",
      "enforced_by": "prose",
      "src": [
       {
        "file": "global/CLAUDE.md",
        "line": 55,
        "quote": "After a compaction, invoke it again before the next step — compaction can drop the skill's text."
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
        "file": "skills/feature-workflow/SKILL.md",
        "line": 83,
        "quote": "the master writes the next arc's brief to `<scratchpad>/handoff-<feature>.md`"
       },
       {
        "file": "skills/feature-workflow/SKILL.md",
        "line": 83,
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
        "file": "skills/feature-workflow/SKILL.md",
        "line": 83,
        "quote": "Attended: the turn ends with the brief's path and the owner's steps"
       },
       {
        "file": "skills/feature-workflow/SKILL.md",
        "line": 83,
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
        "file": "skills/feature-workflow/SKILL.md",
        "line": 83,
        "quote": "Unattended, under delegated approval: launch it"
       },
       {
        "file": "skills/feature-workflow/SKILL.md",
        "line": 83,
        "quote": "then end this session"
       }
      ]
     },
     {
      "rule": "Near the ceiling (~500k; 600k absolute max) hand off; never silently push past it.",
      "evidence": "the handoff brief file",
      "enforced_by": "prose",
      "src": [
       {
        "file": "skills/feature-workflow/SKILL.md",
        "line": 83,
        "quote": "the master approaches the context ceiling mid-arc (~500k tokens; 600k absolute max) — never silently push past it"
       }
      ]
     }
    ],
    "options": [],
    "metrics": [],
    "gaps": [],
    "src": [
     {
      "file": "skills/feature-workflow/SKILL.md",
      "line": 83,
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
        "file": "skills/feature-workflow/SKILL.md",
        "line": 83,
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
        "file": "skills/feature-workflow/SKILL.md",
        "line": 83,
        "quote": "so the brief must carry the delegation that makes gates self-resolving"
       }
      ]
     }
    ],
    "options": [],
    "metrics": [],
    "gaps": [
     {
      "text": "Tech debt: the unattended claude --bg handoff may be refused by the auto-mode classifier; a same-shape launch was denied as 'Create Unsafe Agents'. Unverified under delegated approval.",
      "kind": "tech-debt",
      "src": [
       {
        "file": "docs/tech-debt.md",
        "line": 23,
        "quote": "unattended `claude --bg` handoff may be refused by the auto-mode classifier"
       }
      ]
     }
    ],
    "src": [
     {
      "file": "skills/feature-workflow/SKILL.md",
      "line": 83,
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
      "file": "skills/feature-workflow/SKILL.md",
      "line": 83,
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
     "file": "global/CLAUDE.md",
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
   "label": "66 · stage 5 fail ×3"
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
   "label": "step: 2nd 124 · fail ×3"
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
     "file": "skills/feature-workflow/SKILL.md",
     "line": 72,
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
   "label": "stage 5: <60 s, empty"
  },
  {
   "id": "r_triage_skip",
   "from": "triage",
   "to": "skip",
   "exit": "l",
   "enter": "b",
   "kind": "flow",
   "label": "per-step: <60 s, empty"
  },
  {
   "id": "r_park_launch",
   "from": "park",
   "to": "launch",
   "exit": "b",
   "enter": "t",
   "kind": "back",
   "label": "reset time named",
   "bound": "one relaunch",
   "src": [
    {
     "file": "skills/feature-workflow/SKILL.md",
     "line": 72,
     "quote": "with one relaunch at the reset time when the error names one"
    }
   ]
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
   "id": "r_ctx_handoff",
   "from": "ctx",
   "to": "handoff",
   "exit": "b",
   "enter": "b",
   "kind": "flow",
   "via": [
    [
     11,
     2.5
    ]
   ],
   "label": "~500k: hand off"
  },
  {
   "id": "r_compact_reload",
   "from": "compact",
   "to": "reload",
   "exit": "b",
   "enter": "t",
   "kind": "flow"
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
     "log": "the watchdog fires with agents live: list subagents/*.jsonl by mtime"
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
     "log": "skip the round, say so in the next status note; stage 5 covers the range"
    }
   ]
  },
  {
   "id": "0s",
   "title": "stage 5, exit 0 in under 60 s: park, relaunch at the reset",
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
     "log": "no findings text: a usage-limit error, quoted verbatim -> park, push-notify"
    },
    {
     "edge": "r_park_launch",
     "t": 5.4,
     "d": 1.4,
     "packet": "reset time",
     "log": "the error names a reset time: a one-shot CronCreate relaunches then, once"
    }
   ]
  },
  {
   "id": "66",
   "title": "exit 66: park, no unpinned retry",
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
   "id": "limit",
   "title": "per-step round, usage limit: skip the round",
   "steps": [
    {
     "edge": "r_launch_run",
     "t": 0.0,
     "d": 0.9,
     "packet": "--pin",
     "log": "per-step round 2 with --pin"
    },
    {
     "edge": "r_run_exitq",
     "t": 1.1,
     "d": 1.0,
     "packet": "exit 0, 38 s",
     "log": "exit 0 after 38 s: too fast for a real review"
    },
    {
     "edge": "r_exitq_triage",
     "t": 2.3,
     "d": 1.2,
     "packet": "step2.md",
     "log": "codex-triage reads the file and quotes the usage-limit error"
    },
    {
     "edge": "r_triage_skip",
     "t": 3.7,
     "d": 1.3,
     "packet": "skip",
     "log": "per-step: skip the round, no other reviewer stands in; stage 5 covers the range"
    }
   ]
  },
  {
   "id": "500k",
   "title": "context near ~500k: handoff, the owner starts a new session",
   "steps": [
    {
     "edge": "r_ctx_handoff",
     "t": 0.0,
     "d": 1.4,
     "packet": "~500k",
     "log": "the master nears ~500k (600k is the absolute max): never push past it, write the handoff brief"
    },
    {
     "edge": "r_handoff_paste",
     "t": 1.6,
     "d": 1.0,
     "packet": "brief path",
     "log": "attended: the turn ends with the brief path and the owner's steps"
    },
    {
     "edge": "r_paste_newm",
     "t": 2.8,
     "d": 1.2,
     "packet": "brief",
     "log": "the owner pastes the brief into a new session; the new master takes over"
    }
   ]
  },
  {
   "id": "compact",
   "title": "compaction: the hook reminds, the master reloads the skill",
   "steps": [
    {
     "edge": "r_compact_reload",
     "t": 0.0,
     "d": 1.2,
     "packet": "reminder",
     "log": "after a compaction the hook finds the feature-workflow load in the transcript: invoke it again"
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
