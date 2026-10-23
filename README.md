# pipeline-viz

Animated map of the Claude Code pipeline in [claude-code-setup](https://github.com/TurboKach/claude-code-setup) (stages, actors, gates, evidence, metrics, gaps). Local only, no server, no network, no build.

## Open

`open index.html` (a `file://` page). Classic `<script>` tags only. A view whose `spec/<view>.js` is missing shows a "not built yet" tab; the other views keep working.

## Keys and URL params

| Key | Action |
|---|---|
| `1`..`6` | feature, recovery, one-shot, fan-out, routing, meta |
| `G` | explicit gaps (kind `tech-debt` / `report`): solid red marker with a count |
| `C` | derived candidates: quiet dashed amber marker with a count |
| `M` | metrics overlay (value, or "unmeasured") |
| `Space` | pause |
| click | a node for its card, empty canvas to close it |

`G`, `C` and `M` are independent toggles. The header shows `gaps N · candidates M` for the active view.

Candidates are derived, never stated as fact: a gate enforced by `prose`, evidence `"none"`, a back-edge bound `"none"`, a stage with no metric. The card lists explicit gaps first, then candidates grouped by reason.

The canvas never scales below its drawn size (`MIN_SCALE` in `viz.js`): a view wider than the window scrolls sideways, so node subtitles stay at 9 px or more. In a frozen frame the card panel shows the whole card and the page is as wide as the canvas.

Frozen frame for screenshots: `index.html?view=feature&t=7.8&card=appr&overlay=gaps,candidates&scenario=a`. `t` freezes the scene (wraps modulo the scenario cycle) and turns off every CSS animation; a human stop that is waiting is drawn at full stroke. `view` is an id or a key; `overlay` is a comma list of `gaps`, `candidates`, `metrics`.

## Spec format

One view per file: `spec/{feature,recovery,oneshot,fanout,routing,meta}.js`. The file is exactly

```
window.PV=window.PV||[];window.PV.push(
<one pure JSON object, any indentation>
);
```

The first line is the fixed wrapper line and the last line is `);`, each followed by `\n`. `tools/check.py` strips that exact prefix and suffix and calls `json.loads` on the rest (no regex field extraction); a file that does not match fails. The object shape is the one in `docs/prompts/pipeline-viz-plan.md` (Approach, Spec format), with these decisions where the plan was open:

- A node sits at `col` (0-based) in its lane; a `via` point is `[col, lane index]` (0-based, half-cell numbers allowed, `-0.5` up to `cols-0.5` / `lanes-0.5`).
- Edge routing is automatic: anchors sit on the node side given by `exit` / `enter`; several edge ends on one side are spread along it in `edges[]` order. The first segment leaves outward, the last arrives inward, a gap between two points is filled with an L (or a Z when both axes are the same). Consecutive via points must share a row or column. `viz.js` and `check.py` hold the same routing code and the same node-box constants, each marked as the other's twin.
- Every `src` field is a list, including `metrics[].src`. Metric `as_of` is an ISO date. `gaps[].kind = "derived"` is treated as a candidate, not an explicit gap.
- `log` in a scenario step may be `null`. `scenarios[0]` plays first; the page loops through the view's scenarios.
- Text limits beyond the plan's: produces 20, lane label 12, lane sub 16, edge label and guard 24, packet 20, log 110, scenario title 60, view title 40.

## Sources and the citation rule

`src = {file, line, quote}`. `file` is absolute or `~`-prefixed and must lie under `~/Dev/claude-code-setup`, `~/Dev/pipeline-watch` or `~/.claude`. The quote (at most 120 chars) must appear within +-5 lines of `line`: the window's lines are joined with whitespace collapsed on both sides, so a quote may cross a hard wrap. Otherwise `check.py` reports it as stale (an error).

Limit: this catches an invented quote and a later edit of the cited lines. It does not catch a change of meaning elsewhere in the window.

`"none"` as gate evidence or back-edge bound means doctrine states none; it needs no src. A view marked `draft: true` is exempt from the src-required rules (gates, metrics, gaps, edges with a text bound); citations that are present are still checked.

## Tools

```
python3 tools/check.py validate [spec/feature.js ...]   # exit 0 only with zero errors
python3 tools/check.py shoot --view feature --t 7.8 --card appr --overlay gaps,candidates
python3 tools/check.py shoot --all      # every built view x {plain, gaps, candidates, metrics} + one card
python3 tools/check.py lint             # exit 0 only with zero overlaps, no clipped card, subtitles >= 9 px
```

```
python3 -B tools/repoint.py             # re-point stale citations in spec/*.js
```

`tools/repoint.py` re-points every stale citation whose quote occurs exactly once in the cited file (it rewrites only `line`) and lists the rest as `UNRESOLVED`, for a hand content fix. Run it on specs whose only errors are stale ones, then `check.py validate`. Every spec write goes through its `load_spec` / `save_spec`: `load_spec` aborts unless the file round-trips byte-identical (wrapper, indent and escape mode kept), so a write changes only what the caller changed. Run python with `-B`: `repoint.py` imports `check`, so without it an untracked `tools/__pycache__/` appears.

Errors read `file -> view -> node/edge id -> field: message`. `shoot` drives headless Chrome (temp `--user-data-dir`, fixed `--window-size`, `--virtual-time-budget`) and writes `shots/<view>-<state>.png` (gitignored). The window is as wide as the view's columns need and as tall as the page (the page reports its height in `data-doc-h`), so a frame never clips a card; `--size W,H` overrides both.

`shoot` exits 0 only for a view id from the fixed table (`feature`, `recovery`, `oneshot`, `fanout`, `routing`, `meta`) whose spec is built, and only when the page rendered without error. An unknown or unbuilt `--view` exits 1 and lists the valid views; a `--t` that is not a number, an unknown `--overlay` value, a `--scenario` that is not in the view or a `--card` that is not one of its nodes exits 1 and names the param and the valid values, before Chrome starts. Before each screenshot it dumps the page DOM: `viz.js` writes `<html data-pv-view>` once the view is built and `<html data-pv-error>` for an uncaught error, a `?view=` that is unknown or not built, or (frozen mode only, i.e. with `t`) a `scenario`, `card`, `overlay` or `t` that does not resolve; the live page ignores a bad param. A page error, or a page that rendered another view, is a `FAIL` and writes no PNG; `lint` applies the same page check. `validate` reports a number outside its range (a `via` point off the grid, a scenario `t` or `d` above 60) as an error and never raises.

`lint` opens every view with `?lint=1` in headless Chrome (`--dump-dom`, each run bounded and its process group killed). The page measures its own rendered SVG over every scenario (packets near departure and arrival, every human stop waiting) and writes JSON into `<pre id="pv-lint">`. It reports node text wider than its node box (each scenario is built with the metrics overlay on, then shown with it on and off), edge labels on nodes, labels on labels or lane captions, packet labels on node text, waiting indicators on edges, labels or other nodes, clipped cards, and the smallest subtitle in rendered pixels, at the view's shoot width and at 1440 px. An edge label may cross a foreign wire: its halo keeps it readable, so that is not counted.
