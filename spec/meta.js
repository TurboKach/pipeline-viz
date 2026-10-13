window.PV=window.PV||[];window.PV.push(
{
 "id": "meta",
 "title": "meta loop",
 "key": "6",
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
   "id": "hooks",
   "label": "SESSIONSTART",
   "sub": "notices"
  },
  {
   "id": "jobs",
   "label": "LAUNCHD",
   "sub": "pipeline-watch"
  },
  {
   "id": "master",
   "label": "MASTER",
   "sub": "improve ask"
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
   "id": "ld",
   "lane": "jobs",
   "col": 0,
   "kind": "input",
   "title": "LAUNCHD",
   "sub": "08:30 · Mon 07:00",
   "produces": "job fire",
   "card": {
    "actor": "launchd: two LaunchAgents rendered by pipeline-watch bin/install.sh",
    "model": "— (no model)",
    "does": "Two calendar jobs from one plist template: daily 08:30 runs bin/fetch.sh, weekly Monday 07:00 runs bin/weekly.sh. A slot missed while the Mac sleeps runs on the next wake; RunAtLoad is off, so installing starts nothing.",
    "inputs": [],
    "artifacts": [
     "com.turbokach.pipeline-watch.daily",
     "com.turbokach.pipeline-watch.weekly"
    ],
    "gates": [],
    "options": [],
    "metrics": [],
    "gaps": [],
    "src": [
     {
      "file": "~/Dev/pipeline-watch/bin/install.sh",
      "line": 178,
      "quote": "render daily bin/fetch.sh '' 8 30"
     },
     {
      "file": "~/Dev/pipeline-watch/bin/install.sh",
      "line": 179,
      "quote": "render weekly bin/weekly.sh 1 7 0"
     },
     {
      "file": "~/Dev/pipeline-watch/launchd/pipeline-watch.plist.tmpl",
      "line": 4,
      "quote": "launchd runs a slot missed while asleep on the next wake; RunAtLoad is off so installing starts nothing."
     }
    ]
   }
  },
  {
   "id": "fetch",
   "lane": "jobs",
   "col": 1,
   "kind": "stage",
   "title": "DAILY FETCH",
   "sub": "13 sources · bash",
   "produces": "pending/<date>.md",
   "card": {
    "actor": "bin/fetch.sh (bash 3.2, zero tokens)",
    "model": "— (no model)",
    "does": "Fetches each source's change signal (ETag, or sha1 of the parsed list), compares it with state/<source>, and on change appends a section to pending/<today>.md. Changed llms.txt pages are fetched last, under a time budget. A source's first run only seeds its state.",
    "inputs": [
     "13 sources: CHANGELOG, releases, 2 llms.txt indexes, 4 prompting guides, whats-new, 2 sitemaps, 2 commit feeds"
    ],
    "artifacts": [
     "pending/<date>.md",
     "pending/<date>/ changed pages",
     "state/<source>"
    ],
    "gates": [
     {
      "rule": "The whole run is capped at 300 s; a run that ignores SIGTERM is killed 10 s later.",
      "evidence": "'run ended with status 124' in work/fetch.log",
      "enforced_by": "script",
      "src": [
       {
        "file": "~/Dev/pipeline-watch/bin/fetch.sh",
        "line": 30,
        "quote": "The whole run under a 300 s wall cap when coreutils' gtimeout is present"
       },
       {
        "file": "~/Dev/pipeline-watch/bin/fetch.sh",
        "line": 35,
        "quote": "run ended with status $rc (124 = 300 s cap hit)"
       }
      ]
     },
     {
      "rule": "Skipped while a weekly run holds work/weekly.lock, so pending/ is never archived mid-fetch.",
      "evidence": "'weekly run holds work/weekly.lock, fetch skipped' in work/fetch.log",
      "enforced_by": "script",
      "src": [
       {
        "file": "~/Dev/pipeline-watch/bin/fetch.sh",
        "line": 26,
        "quote": "weekly run holds work/weekly.lock, fetch skipped"
       }
      ]
     },
     {
      "rule": "A 304 or any fetch or parse error leaves the source's state untouched; the run always exits 0.",
      "evidence": "the error line in work/fetch.log",
      "enforced_by": "script",
      "src": [
       {
        "file": "~/Dev/pipeline-watch/bin/fetch.sh",
        "line": 12,
        "quote": "A 304 or any fetch/parse error leaves both untouched."
       }
      ]
     }
    ],
    "options": [],
    "metrics": [],
    "gaps": [],
    "src": [
     {
      "file": "~/Dev/pipeline-watch/bin/fetch.sh",
      "line": 182,
      "quote": "check changelog changelog"
     },
     {
      "file": "~/Dev/pipeline-watch/bin/fetch.sh",
      "line": 194,
      "quote": "check skills atom https://github.com/anthropics/skills/commits/main.atom"
     }
    ]
   }
  },
  {
   "id": "weekly",
   "lane": "jobs",
   "col": 2,
   "kind": "stage",
   "title": "WEEKLY REPORT",
   "sub": "-p · opus xhigh",
   "produces": "reports/<date>.md",
   "card": {
    "actor": "bin/weekly.sh, then one headless claude -p",
    "model": "opus · xhigh (--model opus --effort xhigh, 120 turns, 40-min gtimeout)",
    "does": "Runs only when pending/ is non-empty or the window holds a pipeline arc. Pre-computes analyze.py since the last report, one timeline per session and the kit git log; then one claude -p writes the report in buckets A–E. Committed locally, never pushed; a macOS notification.",
    "inputs": [
     "pending/ (archived to work/<date>/pending)",
     "analyze.py --since <last report>",
     "timelines",
     "kit git log",
     "previous report"
    ],
    "artifacts": [
     "reports/<date>.md",
     "state/last-report",
     "macOS notification"
    ],
    "gates": [
     {
      "rule": "At most one ok run per 6 days unless --force; with nothing pending and no pipeline arc the run is skipped.",
      "evidence": "state/last-run: ok, skipped or failed",
      "enforced_by": "script",
      "src": [
       {
        "file": "~/Dev/pipeline-watch/bin/weekly.sh",
        "line": 122,
        "quote": "At most one successful run per 6 days unless --force."
       },
       {
        "file": "~/Dev/pipeline-watch/bin/weekly.sh",
        "line": 164,
        "quote": "nothing pending and no pipeline arc since $SINCE, skipped"
       }
      ]
     },
     {
      "rule": "The run reads untrusted fetched pages, so it gets no Bash and no write tool: Read, Glob and Grep only, no settings, no MCP.",
      "evidence": "the argv in claude_cmd (bin/weekly.sh --dry-run prints it)",
      "enforced_by": "script",
      "src": [
       {
        "file": "~/Dev/pipeline-watch/bin/weekly.sh",
        "line": 53,
        "quote": "reads untrusted fetched pages, so it gets no Bash at all"
       },
       {
        "file": "~/Dev/pipeline-watch/bin/weekly.sh",
        "line": 61,
        "quote": "--allowedTools 'Read' 'Glob' 'Grep')"
       }
      ]
     },
     {
      "rule": "Every statement cites a file:line or a transcript line; anything uncited is labeled hypothesis; at most 6 arcs in depth.",
      "evidence": "none",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/pipeline-watch/prompts/weekly.md",
        "line": 33,
        "quote": "Every statement in the report cites a `file:line` or a transcript line"
       },
       {
        "file": "~/Dev/pipeline-watch/prompts/weekly.md",
        "line": 56,
        "quote": "at most 6 arcs examined in depth"
       }
      ]
     },
     {
      "rule": "A proposal needs a doc or release cite and a session cite, before/after text and the line test; 'the docs say X' alone goes to bucket B.",
      "evidence": "none",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/pipeline-watch/prompts/weekly.md",
        "line": 77,
        "quote": "A proposal is only a proposal when it is confirmed against our sessions"
       }
      ]
     }
    ],
    "options": [],
    "metrics": [
     {
      "name": "arcs in the 10-12 window that loaded feature-workflow / examined in depth",
      "value": "63 / 6 deep",
      "as_of": "2026-10-12",
      "src": [
       {
        "file": "~/Dev/pipeline-watch/reports/2026-10-12.md",
        "line": 2,
        "quote": "63 sessions loaded feature-workflow from 10-05 to 10-11"
       }
      ]
     },
     {
      "name": "first live run: turns used of the 120-turn cap (54 arcs, 867 s)",
      "value": "114 / 120",
      "as_of": "2026-09-26",
      "src": [
       {
        "file": "~/.claude/projects/-Users-turbokach-Dev-claude-code-setup/memory/pipeline-watch-owner-loop.md",
        "line": 35,
        "quote": "First live run 2026-09-26: 54 arcs, 114/120 turns, 867 s"
       }
      ]
     }
    ],
    "gaps": [
     {
      "text": "Report C6: review escapes were not examined this week, though the weekly prompt lists them among the hand checks of step 3.",
      "kind": "report",
      "src": [
       {
        "file": "~/Dev/pipeline-watch/reports/2026-10-12.md",
        "line": 82,
        "quote": "review escapes were not examined this week."
       },
       {
        "file": "~/Dev/pipeline-watch/prompts/weekly.md",
        "line": 53,
        "quote": "review escapes (what codex rounds missed and why)"
       }
      ]
     }
    ],
    "src": [
     {
      "file": "~/Dev/pipeline-watch/bin/weekly.sh",
      "line": 58,
      "quote": "--model opus --effort xhigh --max-turns 120"
     },
     {
      "file": "~/Dev/pipeline-watch/bin/weekly.sh",
      "line": 157,
      "quote": "--since \"$SINCE\" --out \"$WD/arcs.md\""
     },
     {
      "file": "~/Dev/pipeline-watch/bin/weekly.sh",
      "line": 247,
      "quote": "Commit the report in the repo that holds it; never push."
     }
    ]
   }
  },
  {
   "id": "pwnote",
   "lane": "hooks",
   "col": 3,
   "kind": "stage",
   "title": "PW NOTICE",
   "sub": "session-notice.sh",
   "produces": "unread notice",
   "card": {
    "actor": "pipeline-watch hooks/session-notice.sh (SessionStart, global settings.json)",
    "model": "— (no model)",
    "does": "At every session start: one line when the newest report is unread, the weekly run failed or is overdue, or daily changes wait in pending/. Silent otherwise. Shown to the owner and to Claude.",
    "inputs": [
     "state/last-report",
     "state/last-run",
     "state/acked",
     "pending/"
    ],
    "artifacts": [
     "systemMessage + additionalContext line"
    ],
    "gates": [
     {
      "rule": "The unread-report notice stays until bin/ack writes state/acked newer than the report.",
      "evidence": "state/acked",
      "enforced_by": "hook",
      "src": [
       {
        "file": "~/Dev/pipeline-watch/hooks/session-notice.sh",
        "line": 33,
        "quote": "add \"report $rep_d unread — $rep_v\""
       },
       {
        "file": "~/Dev/pipeline-watch/bin/ack",
        "line": 2,
        "quote": "Marks the newest report read"
       }
      ]
     },
     {
      "rule": "A failed weekly run, or one more than 9 days old, is named in the notice.",
      "evidence": "state/last-run status and date",
      "enforced_by": "hook",
      "src": [
       {
        "file": "~/Dev/pipeline-watch/hooks/session-notice.sh",
        "line": 37,
        "quote": "add \"weekly run overdue (last $run_d)\""
       }
      ]
     }
    ],
    "options": [],
    "metrics": [],
    "gaps": [],
    "src": [
     {
      "file": "~/Dev/pipeline-watch/bin/install.sh",
      "line": 3,
      "quote": "the SessionStart notice hook in ~/.claude/settings.json."
     },
     {
      "file": "~/Dev/pipeline-watch/hooks/session-notice.sh",
      "line": 56,
      "quote": "\"systemMessage\":\"%s\",\"hookSpecificOutput\""
     }
    ]
   }
  },
  {
   "id": "drift",
   "lane": "hooks",
   "col": 6,
   "kind": "input",
   "title": "VERSION DRIFT",
   "sub": "cc-drift · kit repo",
   "produces": "context line",
   "card": {
    "actor": "owner-local ~/.claude/local/cc-drift/drift.sh (SessionStart)",
    "model": "— (no model)",
    "does": "Registered only in the kit repo's gitignored .claude/settings.local.json, so it fires only in kit sessions. One context line when the running Claude Code differs from the version docs/references.md says the doctrine was validated against. Plain stdout: Claude's context only.",
    "inputs": [
     "running version (CLAUDE_CODE_EXECPATH or claude --version)",
     "the docs/references.md stamp"
    ],
    "artifacts": [
     "one context line"
    ],
    "gates": [],
    "options": [],
    "metrics": [
     {
      "name": "Claude Code version, coordinator-launched sessions vs direct ones (since 10-10 02:53Z; 8 arcs miss 2.1.290–2.1.296)",
      "value": "2.1.289 / 2.1.296",
      "as_of": "2026-10-12",
      "src": [
       {
        "file": "~/Dev/pipeline-watch/reports/2026-10-12.md",
        "line": 73,
        "quote": "Since 10-10 02:53Z, every coordinator-launched session reports 2.1.289"
       },
       {
        "file": "~/Dev/pipeline-watch/reports/2026-10-12.md",
        "line": 73,
        "quote": "Direct sessions report 2.1.296"
       }
      ]
     }
    ],
    "gaps": [],
    "src": [
     {
      "file": "~/.claude/local/cc-drift/drift.sh",
      "line": 2,
      "quote": "registered only in the kit repo's"
     },
     {
      "file": "~/.claude/local/cc-drift/drift.sh",
      "line": 22,
      "quote": "diff the changelog $validated → $running before the next pipeline change"
     },
     {
      "file": "~/Dev/claude-code-setup/.claude/settings.local.json",
      "line": 14,
      "quote": "\"command\": \"~/.claude/local/cc-drift/drift.sh\","
     },
     {
      "file": "~/Dev/claude-code-setup/hooks/stack-update-check.sh",
      "line": 3,
      "quote": "Plain stdout reaches only Claude's context"
     }
    ]
   }
  },
  {
   "id": "kitnote",
   "lane": "hooks",
   "col": 10,
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
        "file": "~/Dev/claude-code-setup/hooks/stack-update-check.sh",
        "line": 74,
        "quote": "Replay the last successful poll"
       },
       {
        "file": "~/Dev/claude-code-setup/hooks/stack-update-check.sh",
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
        "file": "~/Dev/claude-code-setup/hooks/stack-update-check.sh",
        "line": 5,
        "quote": "it must never break or slow a"
       },
       {
        "file": "~/Dev/claude-code-setup/hooks/stack-update-check.sh",
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
      "file": "~/Dev/claude-code-setup/hooks/stack-update-check.sh",
      "line": 59,
      "quote": "https://api.github.com/repos/TurboKach/claude-code-setup/commits/master"
     },
     {
      "file": "~/Dev/claude-code-setup/install.sh",
      "line": 457,
      "quote": "(\"SessionStart update-check hook\", \"SessionStart\", \"\", hook_path, 10),"
     }
    ]
   }
  },
  {
   "id": "read",
   "lane": "owner",
   "col": 4,
   "kind": "human",
   "title": "READ REPORT",
   "sub": "improve ask?",
   "produces": "improve ask",
   "card": {
    "actor": "owner",
    "model": "—",
    "does": "Reads the newest report after the macOS notification or the SessionStart notice. An improve ask starts a change; bin/ack only marks the report read. The weekly reviewer never edits the kit.",
    "inputs": [
     "reports/<date>.md",
     "notice line"
    ],
    "artifacts": [
     "improve ask",
     "state/acked"
    ],
    "gates": [
     {
      "rule": "Report-only: the reviewer never applies a change; the owner acts through his own pipeline-improve ask.",
      "evidence": "the owner's improve ask in a kit session",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/pipeline-watch/prompts/weekly.md",
        "line": 4,
        "quote": "the owner acts on your report through his own pipeline-improve ask."
       }
      ]
     }
    ],
    "options": [
     "improve ask: change the pipeline",
     "bin/ack: read, no change"
    ],
    "metrics": [],
    "gaps": [],
    "src": [
     {
      "file": "~/.claude/projects/-Users-turbokach-Dev-claude-code-setup/memory/pipeline-watch-owner-loop.md",
      "line": 30,
      "quote": "Report-only: it never edits the kit."
     }
    ]
   }
  },
  {
   "id": "analyze",
   "lane": "master",
   "col": 5,
   "kind": "stage",
   "title": "1 ANALYZE-ARCS",
   "sub": "version diff first",
   "produces": "numbers + flags",
   "card": {
    "actor": "master (improve-ask session in the kit repo)",
    "model": "opus · xhigh (settings model + modelSettings)",
    "does": "First claude --version against the stamp; a moved version means reading the changelog between them. Then analyze.py over the window: per-session numbers and mechanical flags, the timeline at each flag, and the judgment checks the script cannot make.",
    "inputs": [
     "newest weekly report",
     "drift line",
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
        "file": "~/Dev/claude-code-setup/skills/analyze-arcs/SKILL.md",
        "line": 16,
        "quote": "**Version diff first.** `claude --version`"
       },
       {
        "file": "~/Dev/claude-code-setup/skills/analyze-arcs/SKILL.md",
        "line": 17,
        "quote": "if they differ, read the changelog between them before blaming the doctrine for a harness change"
       },
       {
        "file": "~/.claude/projects/-Users-turbokach-Dev-claude-code-setup/memory/optimize-starts-with-version-diff.md",
        "line": 14,
        "quote": "discuss with the user what changed and how it affects our pipeline"
       }
      ]
     },
     {
      "rule": "Before an improve ask, read the newest pipeline-watch report instead of re-running analyze-arcs from scratch.",
      "evidence": "none",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/.claude/projects/-Users-turbokach-Dev-claude-code-setup/memory/pipeline-watch-owner-loop.md",
        "line": 32,
        "quote": "before any \"improve the pipeline\" ask, read the newest"
       }
      ]
     },
     {
      "rule": "A flag is a place to look, not a verdict: read the timeline at the flagged time; review escapes and negative-only verification are checked by hand.",
      "evidence": "none",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/skills/analyze-arcs/SKILL.md",
        "line": 67,
        "quote": "A flag is a place to look, not a verdict"
       },
       {
        "file": "~/Dev/claude-code-setup/skills/analyze-arcs/SKILL.md",
        "line": 75,
        "quote": "a review escape (what codex rounds missed and why)"
       }
      ]
     },
     {
      "rule": "Every proposed doctrine change goes as before/after through the line test, and the measured evidence goes into a memory note as the next baseline.",
      "evidence": "the memory note",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/skills/analyze-arcs/SKILL.md",
        "line": 80,
        "quote": "measured evidence goes into a memory note so the next run has a baseline"
       }
      ]
     }
    ],
    "options": [],
    "metrics": [
     {
      "name": "Bash-write flag lines judged false in the 10-12 window (A1), out of the ~270 opened",
      "value": "252 of ~270",
      "as_of": "2026-10-12",
      "src": [
       {
        "file": "~/Dev/pipeline-watch/reports/2026-10-12.md",
        "line": 14,
        "quote": "252 of about 270 flag lines are false; none was real."
       },
       {
        "file": "~/Dev/claude-code-setup/skills/analyze-arcs/scripts/analyze.py",
        "line": 445,
        "quote": "on product file inside pipeline"
       }
      ]
     }
    ],
    "gaps": [
     {
      "text": "Report A1: the Bash changed-files record over-reports: it lists files other processes changed while the command ran (2.1.293) and files a git merge/switch/checkout/rebase moved. Proposal: SKILL.md names both, and analyze.py skips them.",
      "kind": "report",
      "src": [
       {
        "file": "~/Dev/pipeline-watch/reports/2026-10-12.md",
        "line": 7,
        "quote": "analyze-arcs: the Bash changed-files record over-reports."
       },
       {
        "file": "~/Dev/pipeline-watch/reports/2026-10-12.md",
        "line": 16,
        "quote": "Neither is a master write; the flag skips both."
       }
      ]
     },
     {
      "text": "Tech debt: no escape-rate metric. analyze-arcs does not count stage-5 real P0/P1 that slipped past their per-step round, per arc or as a weekly trend.",
      "kind": "tech-debt",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/docs/tech-debt.md",
        "line": 33,
        "quote": "no escape-rate metric for per-step codex rounds"
       },
       {
        "file": "~/Dev/claude-code-setup/docs/todos/escape-rate-metric.md",
        "line": 5,
        "quote": "Report both numbers per arc and as a trend in the weekly report."
       }
      ]
     }
    ],
    "src": [
     {
      "file": "~/Dev/claude-code-setup/skills/analyze-arcs/scripts/analyze.py",
      "line": 2,
      "quote": "Measure Claude Code pipeline sessions since a date and flag mechanical doctrine violations."
     }
    ]
   }
  },
  {
   "id": "line",
   "lane": "master",
   "col": 6,
   "kind": "stage",
   "title": "2 LINE TEST",
   "sub": "+ provenance pass",
   "produces": "doctrine diff",
   "card": {
    "actor": "master",
    "model": "opus · xhigh (settings model + modelSettings)",
    "does": "Every line of CLAUDE.md, rules, SKILL.md files and agents goes through 'would removing this cause a mistake?'. The provenance pass cuts incident recaps, version stamps, status notes, doc citations used as justification and measurement tails; the story goes to the commit message.",
    "inputs": [
     "proposals with evidence",
     "doctrine files"
    ],
    "artifacts": [
     "uncommitted doctrine diff (the before/after)"
    ],
    "gates": [
     {
      "rule": "Test every sentence: would removing it cause a mistake? If not, cut it.",
      "evidence": "the git diff as the before/after",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/.claude/rules/doctrine-style.md",
        "line": 15,
        "quote": "Test every sentence: would removing it cause a mistake? If not, cut it."
       },
       {
        "file": "~/.claude/projects/-Users-turbokach-Dev-claude-code-setup/memory/pipeline-review-line-test.md",
        "line": 8,
        "quote": "Whenever the user asks to improve, review or update the pipeline/kit, run every"
       }
      ]
     },
     {
      "rule": "Provenance pass: no incident stories, dates, session names, measured counts, version stamps or doc citations as justification in doctrine.",
      "evidence": "none",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/.claude/rules/doctrine-style.md",
        "line": 16,
        "quote": "No incident stories, dates, session names, measured counts or hours, version stamps"
       },
       {
        "file": "~/.claude/projects/-Users-turbokach-Dev-claude-code-setup/memory/pipeline-review-line-test.md",
        "line": 20,
        "quote": "These sentence shapes fail the test on sight"
       }
      ]
     }
    ],
    "options": [],
    "metrics": [
     {
      "name": "the 09-13 pass: sentences and bytes cut from always-loaded doctrine (b625526)",
      "value": "43 · 8.6 KB",
      "as_of": "2026-09-13",
      "src": [
       {
        "file": "~/.claude/projects/-Users-turbokach-Dev-claude-code-setup/memory/pipeline-review-line-test.md",
        "line": 18,
        "quote": "cut 43 sentences / 8.6 KB from always-loaded doctrine (commit b625526)"
       }
      ]
     }
    ],
    "gaps": [
     {
      "text": "Tech debt: the CLAUDE.md:12 simplicity mnemonic was cut and its salience cue not replaced. Classed theoretical (conf 0.3); recorded so a later pass does not re-litigate it.",
      "kind": "tech-debt",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/docs/tech-debt.md",
        "line": 24,
        "quote": "simplicity mnemonic cut, salience not replaced"
       }
      ]
     }
    ],
    "src": [
     {
      "file": "~/Dev/claude-code-setup/.claude/rules/doctrine-style.md",
      "line": 4,
      "quote": "- \"skills/**/SKILL.md\""
     }
    ]
   }
  },
  {
   "id": "commit",
   "lane": "master",
   "col": 7,
   "kind": "stage",
   "title": "3 COMMIT",
   "sub": "doctrine edit",
   "produces": "kit commit",
   "card": {
    "actor": "master, or a subagent inside a pipeline (inline only on the owner's waiver)",
    "model": "opus · xhigh (settings model + modelSettings)",
    "does": "The approved diff lands as a kit commit; the story behind it goes in the commit message, not in the doctrine.",
    "inputs": [
     "uncommitted doctrine diff"
    ],
    "artifacts": [
     "kit commit"
    ],
    "gates": [
     {
      "rule": "Commit only after one AskUserQuestion on the uncommitted diff (commit / install / push).",
      "evidence": "the owner's answer",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/.claude/projects/-Users-turbokach-Dev-claude-code-setup/memory/pipeline-review-line-test.md",
        "line": 13,
        "quote": "then one AskUserQuestion to commit/install/push."
       }
      ]
     },
     {
      "rule": "Inside a pipeline the master writes no product file; for a small kit arc the owner may waive that on request, never assumed.",
      "evidence": "the waiver recorded in the plan header",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/global/CLAUDE.md",
        "line": 31,
        "quote": "Inside a pipeline, the master session writes zero product code."
       },
       {
        "file": "~/.claude/projects/-Users-turbokach-Dev-claude-code-setup/memory/small-kit-diffs-master-inline.md",
        "line": 15,
        "quote": "do not assume the waiver"
       }
      ]
     }
    ],
    "options": [],
    "metrics": [],
    "gaps": [],
    "src": [
     {
      "file": "~/Dev/claude-code-setup/.claude/rules/doctrine-style.md",
      "line": 18,
      "quote": "goes in the file; the story stays in the commit message or the owner's local"
     }
    ]
   }
  },
  {
   "id": "scope",
   "lane": "master",
   "col": 8,
   "kind": "decision",
   "title": "4 CODEX?",
   "sub": "doctrine-only diff?",
   "produces": "run or skip",
   "card": {
    "actor": "master",
    "model": "opus · xhigh (settings model + modelSettings)",
    "does": "Codex has no authority on Claude Code doctrine. A doctrine-only diff, or kit code that only encodes Claude Code semantics (hooks, install stamps, transcript analyzers), skips the gate. The skip lives in owner memory; global CLAUDE.md:27 states the gate without it.",
    "inputs": [
     "kit range",
     "files touched"
    ],
    "artifacts": [
     "run or skip"
    ],
    "gates": [
     {
      "rule": "Skip codex on doctrine-only kit diffs and on kit code whose correctness depends on Claude Code semantics; a live test is the evidence instead.",
      "evidence": "the live test (hook run on both branches, analyzer run against real sessions)",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/.claude/projects/-Users-turbokach-Dev-claude-code-setup/memory/codex-gate-scope-doubt.md",
        "line": 3,
        "quote": "skip the gate on doctrine-only kit diffs and on kit code that only encodes Claude Code semantics"
       },
       {
        "file": "~/.claude/projects/-Users-turbokach-Dev-claude-code-setup/memory/codex-gate-scope-doubt.md",
        "line": 32,
        "quote": "evidence is a live test instead"
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
      "line": 27,
      "quote": "Never ship (push, PR) a pipeline's work until"
     }
    ]
   }
  },
  {
   "id": "cdx",
   "lane": "codex",
   "col": 8,
   "kind": "codex",
   "title": "CODEX GATE",
   "sub": "mixed range only",
   "produces": "verdict",
   "card": {
    "actor": "codex-challenge.sh, one background Bash in the master; then codex-triage",
    "model": "gpt-6.1-sol · medium (CODEX_REVIEW_MODEL / _EFFORT)",
    "does": "One whole-range run on a mixed kit range. Findings on doctrine prose (CLAUDE.md, SKILL.md, agents) are report-only, triaged against Anthropic docs and the owner's rules; the fix loop runs only for the shell surface (codex-challenge.sh, install.sh, hooks).",
    "inputs": [
     "<base>..HEAD"
    ],
    "artifacts": [
     "codex-whole-round<N>.md",
     "triaged verdict"
    ],
    "gates": [
     {
      "rule": "Doctrine-prose findings are report-only, never looped on; the fix loop runs only for shell-surface findings.",
      "evidence": "the triaged verdict with doctrine lines marked report-only",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/.claude/projects/-Users-turbokach-Dev-claude-code-setup/memory/codex-gate-scope-doubt.md",
        "line": 22,
        "quote": "codex findings on doctrine prose (CLAUDE.md, SKILL.md, agents/*.md) are report-only"
       },
       {
        "file": "~/.claude/projects/-Users-turbokach-Dev-claude-code-setup/memory/codex-gate-scope-doubt.md",
        "line": 24,
        "quote": "the fix loop runs only for findings on the shell surface"
       }
      ]
     },
     {
      "rule": "A diff to a read-only measurement or reporting script gets one round; its P2s are pointers, never a fix loop.",
      "evidence": "none",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/.claude/projects/-Users-turbokach-Dev-claude-code-setup/memory/codex-gate-scope-doubt.md",
        "line": 40,
        "quote": "a diff to a read-only measurement or reporting script gets one round"
       }
      ]
     }
    ],
    "options": [],
    "metrics": [
     {
      "name": "codex rounds at xhigh on analyze-arcs' parsing regexes: 1 P1 per round plus 8–10 P2 each, no convergence",
      "value": "4 rounds",
      "as_of": "2026-09-12",
      "src": [
       {
        "file": "~/.claude/projects/-Users-turbokach-Dev-claude-code-setup/memory/codex-gate-scope-doubt.md",
        "line": 37,
        "quote": "four codex rounds at xhigh on analyze-arcs' command-parsing regexes produced 1 P1 per round"
       }
      ]
     }
    ],
    "gaps": [
     {
      "text": "Tech debt (review-model-picker arc bundle, item 4): the stage-4/5 call strings name the installed codex-challenge.sh, so when the repo under review is the kit, every gate reviews the new code with the old script, model and effort.",
      "kind": "tech-debt",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/docs/todos/deferred-review-model-picker-arc.md",
        "line": 15,
        "quote": "the INSTALLED copy; when the repo under review IS the kit"
       }
      ]
     }
    ],
    "src": [
     {
      "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
      "line": 22,
      "quote": "round 2 re-challenges the resulting HEAD and its verdict is final"
     }
    ]
   }
  },
  {
   "id": "push",
   "lane": "owner",
   "col": 9,
   "kind": "human",
   "title": "5 PUSH",
   "sub": "owner approval",
   "produces": "approved push",
   "card": {
    "actor": "owner",
    "model": "—",
    "does": "Kit commits go to origin/master only on the owner's explicit approval in the session. The remote is what every install's update check polls.",
    "inputs": [
     "kit commits",
     "verdict or skip reason"
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
      "file": "~/Dev/claude-code-setup/hooks/stack-update-check.sh",
      "line": 59,
      "quote": "https://api.github.com/repos/TurboKach/claude-code-setup/commits/master"
     }
    ]
   }
  },
  {
   "id": "stack",
   "lane": "master",
   "col": 11,
   "kind": "stage",
   "title": "6 STACK-UPDATE",
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
        "file": "~/Dev/claude-code-setup/skills/stack-update/SKILL.md",
        "line": 32,
        "quote": "Steps 1–3 are read-only reconnaissance"
       },
       {
        "file": "~/Dev/claude-code-setup/skills/stack-update/SKILL.md",
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
      "file": "~/Dev/claude-code-setup/skills/stack-update/SKILL.md",
      "line": 11,
      "quote": "`CLAUDE.md`, which `install.sh`'s default (\"auto\") mode never overwrites once it exists"
     }
    ]
   }
  },
  {
   "id": "apply",
   "lane": "owner",
   "col": 12,
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
        "file": "~/Dev/claude-code-setup/skills/stack-update/SKILL.md",
        "line": 70,
        "quote": "**Approval gate #1 — apply the update at all?**"
       },
       {
        "file": "~/Dev/claude-code-setup/skills/stack-update/SKILL.md",
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
        "file": "~/Dev/claude-code-setup/skills/stack-update/SKILL.md",
        "line": 120,
        "quote": "**Never** rewrite"
       },
       {
        "file": "~/Dev/claude-code-setup/skills/stack-update/SKILL.md",
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
        "file": "~/Dev/claude-code-setup/skills/stack-update/SKILL.md",
        "line": 123,
        "quote": "First, the master-model question — asked on every update unless the user"
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
      "file": "~/Dev/claude-code-setup/skills/stack-update/SKILL.md",
      "line": 75,
      "quote": "*Show the full diff first* → show it, then re-ask this same question; it is not itself an answer."
     }
    ]
   }
  },
  {
   "id": "inst",
   "lane": "master",
   "col": 13,
   "kind": "stage",
   "title": "INSTALL.SH",
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
        "file": "~/Dev/claude-code-setup/skills/stack-update/SKILL.md",
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
        "file": "~/Dev/claude-code-setup/skills/stack-update/SKILL.md",
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
        "file": "~/Dev/claude-code-setup/install.sh",
        "line": 164,
        "quote": "CLAUDE.md — mode defaults to \"auto\": copy if absent, else leave untouched"
       },
       {
        "file": "~/Dev/claude-code-setup/install.sh",
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
        "file": "~/Dev/claude-code-setup/skills/stack-update/SKILL.md",
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
        "file": "~/Dev/claude-code-setup/docs/tech-debt.md",
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
        "file": "~/Dev/claude-code-setup/docs/tech-debt.md",
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
        "file": "~/Dev/claude-code-setup/docs/tech-debt.md",
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
        "file": "~/Dev/claude-code-setup/docs/tech-debt.md",
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
        "file": "~/Dev/claude-code-setup/docs/tech-debt.md",
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
        "file": "~/Dev/claude-code-setup/docs/tech-debt.md",
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
        "file": "~/Dev/claude-code-setup/docs/tech-debt.md",
        "line": 31,
        "quote": "`--master` colon split on Bedrock IDs"
       },
       {
        "file": "~/Dev/claude-code-setup/docs/todos/deferred-opus-executors-arc.md",
        "line": 8,
        "quote": "MODEL_ID:EFFORT is split at the first colon"
       }
      ]
     }
    ],
    "src": [
     {
      "file": "~/Dev/claude-code-setup/install.sh",
      "line": 285,
      "quote": "echo \"$INSTALLED_SHA\" > \"$DEST/.claude-code-setup/installed\""
     }
    ]
   }
  },
  {
   "id": "stamp",
   "lane": "master",
   "col": 14,
   "kind": "output",
   "title": "7 STAMP",
   "sub": "references.md:6",
   "produces": "validated v2.1.N",
   "card": {
    "actor": "master",
    "model": "opus · xhigh (settings model + modelSettings)",
    "does": "Once the changelog from the stamped version to claude --version is read and its pipeline impact decided, the line 'Doctrine validated against Claude Code vX — date' is re-stamped. drift.sh and analyze-arcs step 1 compare against it.",
    "inputs": [
     "changelog diff",
     "claude --version"
    ],
    "artifacts": [
     "docs/references.md:6 stamp"
    ],
    "gates": [
     {
      "rule": "Re-stamp only after reading the changelog from the stamped version forward and deciding what it means for the pipeline.",
      "evidence": "the stamp commit",
      "enforced_by": "prose",
      "src": [
       {
        "file": "~/Dev/claude-code-setup/docs/references.md",
        "line": 8,
        "quote": "version forward, decide what it means for the pipeline, then re-stamp this line."
       }
      ]
     }
    ],
    "options": [],
    "metrics": [],
    "gaps": [],
    "src": [
     {
      "file": "~/Dev/claude-code-setup/docs/references.md",
      "line": 6,
      "quote": "Doctrine validated against Claude Code v2.1.294 — 2026-10-08."
     },
     {
      "file": "~/.claude/local/cc-drift/drift.sh",
      "line": 8,
      "quote": "validated against Claude Code v"
     }
    ]
   }
  }
 ],
 "edges": [
  {
   "id": "e_ld_fetch",
   "from": "ld",
   "to": "fetch",
   "exit": "r",
   "enter": "l",
   "kind": "flow"
  },
  {
   "id": "e_ld_weekly",
   "from": "ld",
   "to": "weekly",
   "exit": "t",
   "enter": "t",
   "kind": "flow",
   "via": [
    [
     0,
     1.5
    ],
    [
     2,
     1.5
    ]
   ],
   "label": "Mon 07:00"
  },
  {
   "id": "e_fetch_weekly",
   "from": "fetch",
   "to": "weekly",
   "exit": "r",
   "enter": "l",
   "kind": "flow"
  },
  {
   "id": "e_weekly_pwnote",
   "from": "weekly",
   "to": "pwnote",
   "exit": "r",
   "enter": "b",
   "kind": "flow",
   "label": "report"
  },
  {
   "id": "e_weekly_analyze",
   "from": "weekly",
   "to": "analyze",
   "exit": "b",
   "enter": "l",
   "kind": "flow",
   "label": "read first"
  },
  {
   "id": "e_pwnote_read",
   "from": "pwnote",
   "to": "read",
   "exit": "t",
   "enter": "l",
   "kind": "flow",
   "label": "unread"
  },
  {
   "id": "e_read_analyze",
   "from": "read",
   "to": "analyze",
   "exit": "r",
   "enter": "t",
   "kind": "flow",
   "label": "improve ask"
  },
  {
   "id": "e_drift_analyze",
   "from": "drift",
   "to": "analyze",
   "exit": "b",
   "enter": "t",
   "kind": "flow",
   "label": "version ≠ stamp"
  },
  {
   "id": "e_analyze_line",
   "from": "analyze",
   "to": "line",
   "exit": "r",
   "enter": "l",
   "kind": "flow"
  },
  {
   "id": "e_line_commit",
   "from": "line",
   "to": "commit",
   "exit": "r",
   "enter": "l",
   "kind": "flow"
  },
  {
   "id": "e_commit_scope",
   "from": "commit",
   "to": "scope",
   "exit": "r",
   "enter": "l",
   "kind": "flow"
  },
  {
   "id": "e_cdx_commit",
   "from": "cdx",
   "to": "commit",
   "exit": "t",
   "enter": "b",
   "kind": "back",
   "label": "shell P0/P1: fix",
   "bound": "2 rounds; a read-only script: 1",
   "src": [
    {
     "file": "~/Dev/claude-code-setup/skills/feature-workflow/SKILL.md",
     "line": 22,
     "quote": "round 2 re-challenges the resulting HEAD and its verdict is final"
    },
    {
     "file": "~/.claude/projects/-Users-turbokach-Dev-claude-code-setup/memory/codex-gate-scope-doubt.md",
     "line": 40,
     "quote": "a diff to a read-only measurement or reporting script gets one round"
    }
   ]
  },
  {
   "id": "e_scope_cdx",
   "from": "scope",
   "to": "cdx",
   "exit": "b",
   "enter": "t",
   "kind": "flow",
   "label": "mixed range"
  },
  {
   "id": "e_scope_push",
   "from": "scope",
   "to": "push",
   "exit": "t",
   "enter": "l",
   "kind": "flow",
   "label": "doctrine-only: skip"
  },
  {
   "id": "e_cdx_push",
   "from": "cdx",
   "to": "push",
   "exit": "r",
   "enter": "b",
   "kind": "flow",
   "label": "verdict shown"
  },
  {
   "id": "e_push_kitnote",
   "from": "push",
   "to": "kitnote",
   "exit": "r",
   "enter": "t",
   "kind": "flow",
   "label": "pushed"
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
   "id": "e_inst_stamp",
   "from": "inst",
   "to": "stamp",
   "exit": "r",
   "enter": "l",
   "kind": "flow"
  },
  {
   "id": "e_stamp_ld",
   "from": "stamp",
   "to": "ld",
   "exit": "t",
   "enter": "b",
   "kind": "back",
   "via": [
    [
     14,
     2.5
    ],
    [
     0,
     2.5
    ]
   ],
   "label": "next cycle",
   "bound": "one ok weekly run per 6 days (--force overrides)",
   "src": [
    {
     "file": "~/Dev/pipeline-watch/bin/weekly.sh",
     "line": 122,
     "quote": "At most one successful run per 6 days unless --force."
    }
   ]
  }
 ],
 "scenarios": [
  {
   "id": "a",
   "title": "weekly report -> doctrine-only improve ask, codex skipped",
   "steps": [
    {
     "edge": "e_ld_fetch",
     "t": 0.0,
     "d": 0.8,
     "packet": "13 sources",
     "log": "launchd 08:30: fetch.sh, bash only, zero tokens -> pending/<date>.md"
    },
    {
     "edge": "e_ld_weekly",
     "t": 1.0,
     "d": 0.8,
     "packet": "Mon 07:00",
     "log": "launchd Monday 07:00: weekly.sh; the last ok run is 6+ days old"
    },
    {
     "edge": "e_fetch_weekly",
     "t": 1.9,
     "d": 0.6,
     "packet": "pending/",
     "log": "pending/ archived; analyze.py, timelines and the kit log pre-computed"
    },
    {
     "edge": "e_weekly_pwnote",
     "t": 2.6,
     "d": 0.8,
     "packet": "reports/10-12.md",
     "log": "claude -p, opus xhigh, Read/Glob/Grep only -> report A-E, committed locally"
    },
    {
     "edge": "e_pwnote_read",
     "t": 3.5,
     "d": 0.6,
     "packet": "report unread",
     "log": "SessionStart: 'pipeline-watch: report 2026-10-12 unread'"
    },
    {
     "edge": "e_read_analyze",
     "t": 5.3,
     "d": 0.8,
     "packet": "improve ask",
     "log": "owner reads A1 and C1-C5 -> 'improve the pipeline'"
    },
    {
     "edge": "e_weekly_analyze",
     "t": 5.3,
     "d": 0.8,
     "packet": "report 10-12",
     "log": "master reads the newest report, not a fresh analyze-arcs run"
    },
    {
     "edge": "e_drift_analyze",
     "t": 5.3,
     "d": 0.8,
     "packet": "2.1.296 ≠ 2.1.294",
     "log": "drift.sh: Claude Code 2.1.296 running, doctrine validated against 2.1.294"
    },
    {
     "edge": "e_analyze_line",
     "t": 6.3,
     "d": 0.7,
     "packet": "proposal A1",
     "log": "changelog 2.1.294 -> 2.1.296 read; A1 confirmed at the flagged timelines"
    },
    {
     "edge": "e_line_commit",
     "t": 7.1,
     "d": 0.7,
     "packet": "before/after",
     "log": "line test: without it ~250 false flags a week -> keep; no provenance in the text"
    },
    {
     "edge": "e_commit_scope",
     "t": 7.9,
     "d": 0.6,
     "packet": "kit commit",
     "log": "owner answers the one commit/install/push question; committed"
    },
    {
     "edge": "e_scope_push",
     "t": 8.6,
     "d": 0.9,
     "packet": "skip codex",
     "log": "SKILL.md + analyze.py: a transcript analyzer, codex skipped; a live run is the evidence"
    },
    {
     "edge": "e_push_kitnote",
     "t": 10.6,
     "d": 0.7,
     "packet": "pushed",
     "log": "owner approves the push -> origin/master"
    },
    {
     "edge": "e_kitnote_stack",
     "t": 11.4,
     "d": 0.8,
     "packet": "1 new change",
     "log": "next session: 'claude-code-setup: 1 new change - run /stack-update'"
    },
    {
     "edge": "e_stack_apply",
     "t": 12.3,
     "d": 0.8,
     "packet": "what's new",
     "log": "clone + summary by surface -> AskUserQuestion: Apply / Show diff / Cancel"
    },
    {
     "edge": "e_apply_inst",
     "t": 14.2,
     "d": 0.7,
     "packet": "Apply",
     "log": "owner: Apply; CLAUDE.md three-way diff -> gate #2 answered"
    },
    {
     "edge": "e_inst_stamp",
     "t": 15.0,
     "d": 0.7,
     "packet": "installed",
     "log": "install.sh exit 0; installed = the new HEAD; restart Claude Code"
    },
    {
     "edge": "e_stamp_ld",
     "t": 15.8,
     "d": 1.5,
     "packet": "v2.1.296",
     "log": "references.md:6 re-stamped after the changelog read; next weekly cycle"
    }
   ]
  },
  {
   "id": "b",
   "title": "mixed kit range: codex on the shell part, one fix round",
   "steps": [
    {
     "edge": "e_ld_weekly",
     "t": 0.0,
     "d": 0.8,
     "packet": "Mon 07:00",
     "log": "launchd Monday 07:00: weekly.sh; pipeline arcs in the window"
    },
    {
     "edge": "e_weekly_pwnote",
     "t": 0.9,
     "d": 0.8,
     "packet": "reports/<date>.md",
     "log": "report C1: codex-challenge.sh should bail on a usage limit"
    },
    {
     "edge": "e_pwnote_read",
     "t": 1.8,
     "d": 0.6,
     "packet": "report unread",
     "log": "SessionStart: 'pipeline-watch: report unread'"
    },
    {
     "edge": "e_read_analyze",
     "t": 3.4,
     "d": 0.8,
     "packet": "improve ask",
     "log": "owner: apply C1"
    },
    {
     "edge": "e_analyze_line",
     "t": 4.3,
     "d": 0.7,
     "packet": "C1",
     "log": "stamp equals claude --version: no changelog to read; dead launches confirmed"
    },
    {
     "edge": "e_line_commit",
     "t": 5.1,
     "d": 0.7,
     "packet": "script + 1 line",
     "log": "the doctrine line passes the line test; the script change is shell"
    },
    {
     "edge": "e_commit_scope",
     "t": 5.9,
     "d": 0.6,
     "packet": "kit commit",
     "log": null
    },
    {
     "edge": "e_scope_cdx",
     "t": 6.6,
     "d": 0.8,
     "packet": "base..HEAD",
     "log": "mixed range: codex runs; its doctrine findings are report-only"
    },
    {
     "edge": "e_cdx_commit",
     "t": 7.5,
     "d": 1.2,
     "packet": "shell P1",
     "log": "round 1: one P1 in the shell bail, two doctrine-wording lines report-only -> fix"
    },
    {
     "edge": "e_commit_scope",
     "t": 8.8,
     "d": 0.6,
     "packet": "fix commit",
     "log": "fix lands red-then-green -> round 2 on the new HEAD"
    },
    {
     "edge": "e_scope_cdx",
     "t": 9.5,
     "d": 0.8,
     "packet": "base..HEAD",
     "log": null
    },
    {
     "edge": "e_cdx_push",
     "t": 10.4,
     "d": 1.0,
     "packet": "clean verdict",
     "log": "round 2: zero P0/P1; verdict shown -> push gate"
    },
    {
     "edge": "e_push_kitnote",
     "t": 12.5,
     "d": 0.7,
     "packet": "pushed",
     "log": "owner approves the push"
    },
    {
     "edge": "e_kitnote_stack",
     "t": 13.3,
     "d": 0.8,
     "packet": "2 new changes",
     "log": "next session: 'claude-code-setup: 2 new changes - run /stack-update'"
    },
    {
     "edge": "e_stack_apply",
     "t": 14.2,
     "d": 0.8,
     "packet": "what's new",
     "log": "AskUserQuestion: Apply / Show the full diff first / Cancel"
    },
    {
     "edge": "e_apply_stack",
     "t": 16.0,
     "d": 1.0,
     "packet": "show diff",
     "log": "owner: show the full diff first -> diff shown, the same question again"
    },
    {
     "edge": "e_stack_apply",
     "t": 17.1,
     "d": 0.8,
     "packet": "what's new",
     "log": null
    },
    {
     "edge": "e_apply_inst",
     "t": 18.9,
     "d": 0.7,
     "packet": "Apply",
     "log": "owner: Apply -> install.sh from the clone"
    },
    {
     "edge": "e_inst_stamp",
     "t": 19.7,
     "d": 0.7,
     "packet": "installed",
     "log": "install.sh exit 0; state written; restart Claude Code"
    },
    {
     "edge": "e_stamp_ld",
     "t": 20.5,
     "d": 1.5,
     "packet": "stamp kept",
     "log": "stamp already equals claude --version: kept; next weekly cycle"
    }
   ]
  }
 ]
}
);
