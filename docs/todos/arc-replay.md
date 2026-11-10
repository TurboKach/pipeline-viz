# Real-arc replay: Board and Work-item views

## What

A later arc that adds stagecraft-style **Board** and **Work-item** views to this map. Real pipeline arcs show up as work items. The Work-item view shows one arc:

- the path it took through the existing views, node by node;
- time spent in each stage;
- gate waits (ExitPlanMode, AskUserQuestion, push approval);
- codex rounds and fix loops.

The Board view lists all arcs by stage, so one screen shows where work waits.

Idea source: swamp-club/swamp-extensions, the stagecraft README, section "The Studio".

## Why

The six views describe the pipeline as designed. The replay shows what happened in a real arc, so the owner can compare the designed path with the real one and see where time and loops go. Gaps then rest on evidence instead of reading.

## Context

Data sources, all read-only:

- `analyze-arcs` output (`skills/analyze-arcs/scripts/analyze.py` in the kit): per-session spans, the spawn table, the codex table and gate waits.
- `timeline.py`, for per-arc event order.
- Later, the kit backlog item "verified-head record" (a git note per verified commit). It would make the per-round verdicts durable, so a replay can show each codex round's result after the scratchpad is gone.

## Depends

This repo's spec, with the node ids as the join keys that map transcript events to nodes (for example a `codex-challenge.sh` launch to the node `scodex` or `wcodex`, an ExitPlanMode wait to `appr`). The spec must be stable first: steps 1-5 of the pipeline-viz plan shipped.

## Effort

One pipeline arc.
