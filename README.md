# pipeline-viz

Animated map of the Claude Code pipeline in [claude-code-setup](https://github.com/TurboKach/claude-code-setup) (stages, actors, gates, evidence, metrics, gaps). No server, no build: the page loads nothing from the network (classic `<script>` tags, no `fetch`), so it also opens from disk. Every citation on the page is a link that opens the cited line in the kit on GitHub, at the commit the map is stamped with.

## Open

`open index.html` (a `file://` page). Classic `<script>` tags only. A view whose `spec/<view>.js` is missing shows a "not built yet" tab; the other views keep working.

## Keys and URL params

| Key | Action |
|---|---|
| `1`..`6` | feature, recovery, one-shot, fan-out, routing, meta |
| `G` | explicit gaps (kind `tech-debt`): solid red marker with a count |
| `C` | derived candidates: quiet dashed amber marker with a count |
| `M` | metrics overlay (the chip shows `N metric(s)` or `no metric`; the card lists each metric's name and source) |
| `Space` | pause |
| click | a node for its card, empty canvas to close it |

`G`, `C` and `M` are independent toggles. The header shows `gaps N · candidates M` for the active view.

Candidates are derived, never stated as fact: a gate enforced by `prose`, evidence `"none"`, a back-edge bound `"none"`, a stage with no metric (a metric is a name and a kit source that defines it, with no value). The card lists explicit gaps first, then candidates grouped by reason.

The canvas never scales below its drawn size (`MIN_SCALE` in `viz.js`): a view wider than the window scrolls sideways, so node subtitles stay at 9 px or more. In a frozen frame the card panel shows the whole card and the page is as wide as the canvas.

Frozen frame for screenshots: `index.html?view=feature&t=7.8&card=appr&overlay=gaps,candidates&scenario=a`. `t` freezes the scene (wraps modulo the scenario cycle) and turns off every CSS animation; a human stop that is waiting is drawn at full stroke. `view` is an id or a key; `overlay` is a comma list of `gaps`, `candidates`, `metrics`.

## Spec format

One view per file: `spec/{feature,recovery,oneshot,fanout,routing,meta}.js`. The file is exactly

```
window.PV=window.PV||[];window.PV.push(
<one pure JSON object, any indentation>
);
```

The first line is the fixed wrapper line and the last line is `);`, each followed by `\n`. `tools/check.py` strips that exact prefix and suffix and calls `json.loads` on the rest (no regex field extraction); a file that does not match fails.

```
view:     {id, title, key, draft?, doctrine:{kit_sha, cc_validated, extracted}, lanes:[{id,label,sub}], cols,
          nodes:[node], edges:[edge], scenarios:[scenario], unplaced?:[{text, reason, src[]}]}
node:     {id, lane, col, kind: input|stage|sub|codex|human|decision|output, title, sub, produces, card}
card:     {actor, model, does, inputs[], artifacts[], gates:[gate], options[] (human stops),
          metrics:[{name, src[]}], gaps:[{text, kind: tech-debt|derived, src[]}], src[]}
gate:     {rule, evidence: text | "none", enforced_by: hook|script|frontmatter|harness|analyze-arcs|prose, src[]}
edge:     {id, from, to, exit, enter: l|r|t|b, via?[[col,lane]], kind: flow|back|alt, label?, guard?,
          bound?: text | "none", src?[]}   # bound required on kind=back; src required when bound is text
scenario: {id, title, steps:[{edge, t, d, packet, log}]}
src:      {file, line, quote}       # file: path relative to the kit root
```

- `doctrine.kit_sha` is the kit commit the whole map is a snapshot of: 7 to 40 lowercase hex characters naming exactly one commit of the kit by object id (a branch or tag with a hex-shaped name, or an ambiguous id prefix, is an error). The header shows it as a link to the kit tree at that commit; `extracted` is the date of the snapshot (ISO date) and `cc_validated` the Claude Code version it was checked against.
- A node sits at `col` (0-based) in its lane; a `via` point is `[col, lane index]` (0-based, half-cell numbers allowed, `-0.5` up to `cols-0.5` / `lanes-0.5`). A view has at most 5 lanes, 16 columns and 4 via points per edge; `(lane, col)` is unique.
- Edge routing is automatic: anchors sit on the node side given by `exit` / `enter`; several edge ends on one side are spread along it in `edges[]` order. The first segment leaves outward, the last arrives inward, a gap between two points is filled with an L (or a Z when both axes are the same). Consecutive via points must share a row or column. `viz.js` and `check.py` hold the same routing code and the same node-box constants, each marked as the other's twin.
- Every `src` field is a list, including `metrics[].src`. A metric is exactly `{name, src}`: what is counted and the kit line that computes it. `gaps[].kind = "derived"` is treated as a candidate, not an explicit gap.
- `"none"` as gate evidence or back-edge bound means the doctrine states none; it needs no src and the page shows it as a candidate. An edge needs a `src` when its `bound` is text. `src[]` must not be empty on gates, metrics, gaps or edges with a text bound, except in a view marked `draft: true`.
- A scenario is a list of steps, each on an edge of the view, at second `t` for `d` seconds, with a `packet` label and a `log` line (`null` allowed). Steps form a connected path: each starts at one of the view's `input` nodes or at a node an earlier step reached; `t` and `d` are seconds, at most 60 each. `scenarios[0]` plays first; the page loops through the view's scenarios.
- Text limits: node title 18, sub 22, produces 20, card text fields 280, lane label 12, lane sub 16, edge label and guard 24, packet 20, log 110, scenario title 60, view title 40.

## Sources and the citation rule

`src = {file, line, quote}`. `file` is a POSIX path relative to the kit root (no leading `/` or `~`, no `..` segment). `check.py` reads the file from the kit at `doctrine.kit_sha` through git (`git show <sha>:<file>`), so uncommitted kit edits are invisible to it, and that is the same text the page link opens: `https://github.com/TurboKach/claude-code-setup/blob/<kit_sha>/<file>#L<line>`. The quote (at most 120 chars) must appear within +-5 lines of `line`: the window's lines are joined with whitespace collapsed on both sides, so a quote may cross a hard wrap. Otherwise `check.py` reports it as stale (an error).

Limit: this catches an invented quote and a later edit of the cited lines. It does not catch a change of meaning elsewhere in the window.

A view marked `draft: true` is exempt from the src-required rules; citations that are present are still checked.

## Tools

```
python3 tools/check.py validate [spec/feature.js ...]   # exit 0 only with zero errors
python3 tools/check.py --kit PATH validate              # read the cited text from a kit checkout at PATH
python3 tools/check.py shoot --view feature --t 7.8 --card appr --overlay gaps,candidates
python3 tools/check.py shoot --all      # every built view x {plain, gaps, candidates, metrics} + one card
python3 tools/check.py lint             # exit 0 only with zero overlaps, no clipped card, subtitles >= 9 px
```

```
python3 -B tools/repoint.py [--kit PATH] # re-point stale or out-of-file lines in spec/*.js
```

`tools/repoint.py` re-points every citation whose `line` is stale or outside the file, when its quote occurs exactly once in the cited file (read at the stamped commit); it rewrites only `line`. It lists every other broken citation as `UNRESOLVED`, for a hand content fix: no hit, several hits, one hit whose quote does not fit the window there, or an error that is not about the line (a missing file, a bad path). Run it on specs whose only errors are line errors, then `check.py validate`. Its last line reads `citations N · broken N · repointed N · unresolved N`. Every spec write goes through its `load_spec` / `save_spec`: `load_spec` aborts unless the file round-trips byte-identical (wrapper, indent and escape mode kept), so a write changes only what the caller changed. Run python with `-B`: `repoint.py` imports `check`, so without it an untracked `tools/__pycache__/` appears.

`validate` and `repoint.py` need a clone of the kit that holds `doctrine.kit_sha`: by default the sibling directory `../claude-code-setup`, or the path given by `--kit` (before the subcommand). A missing kit, commit or file is an error message, not a crash. The page itself needs no kit.

Errors read `file -> view -> node/edge id -> field: message`. `shoot` drives headless Chrome (temp `--user-data-dir`, fixed `--window-size`, `--virtual-time-budget`) and writes `shots/<view>-<state>.png` (gitignored). The window is as wide as the view's columns need and as tall as the page (the page reports its height in `data-doc-h`), so a frame never clips a card; `--size W,H` overrides both.

`shoot` exits 0 only for a view id from the fixed table (`feature`, `recovery`, `oneshot`, `fanout`, `routing`, `meta`) whose spec is built, and only when the page rendered without error. An unknown or unbuilt `--view` exits 1 and lists the valid views; a `--t` that is not a number, an unknown `--overlay` value, a `--scenario` that is not in the view or a `--card` that is not one of its nodes exits 1 and names the param and the valid values, before Chrome starts. Before each screenshot it dumps the page DOM: `viz.js` writes `<html data-pv-view>` once the view is built and `<html data-pv-error>` for an uncaught error, a `?view=` that is unknown or not built, or (frozen mode only, i.e. with `t`) a `scenario`, `card`, `overlay` or `t` that does not resolve; the live page ignores a bad param. A page error, or a page that rendered another view, is a `FAIL` and writes no PNG; `lint` applies the same page check. `validate` reports a number outside its range (a `via` point off the grid, a scenario `t` or `d` above 60) as an error and never raises.

`lint` opens every view with `?lint=1` in headless Chrome (`--dump-dom`, each run bounded and its process group killed). The page measures its own rendered SVG over every scenario (packets near departure and arrival, every human stop waiting) and writes JSON into `<pre id="pv-lint">`. It reports node text wider than its node box (each scenario is built with the metrics overlay on, then shown with it on and off), edge labels on nodes, labels on labels or lane captions, packet labels on node text, waiting indicators on edges, labels or other nodes, clipped cards, and the smallest subtitle in rendered pixels, at the view's shoot width and at 1440 px. An edge label may cross a foreign wire: its halo keeps it readable, so that is not counted.
