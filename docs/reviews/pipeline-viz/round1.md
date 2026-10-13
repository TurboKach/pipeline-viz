# codex challenge — range 555d6ff848adb3ac84c0126fa864875373417fdc..453af345dc88ff1f9207ad8b10078f7f16d672ba — checkout /Users/turbokach/Dev/pipeline-viz — model gpt-6.1-sol/medium — exit 0 — 399s
[tools/check.py:819](/Users/turbokach/Dev/pipeline-viz/tools/check.py:819) — `shoot --view 1` renders the 16-column feature view in a 1100-pixel window because `view_cols("1")` fails; the canvas requires 2650 pixels, so the screenshot silently clips it.

[tools/check.py:806](/Users/turbokach/Dev/pipeline-viz/tools/check.py:806) — Capture success checks only PNG framing; a misspelled view silently captures the fallback view, and a missing spec or renderer exception can produce an incomplete screenshot with exit status 0.

[viz.js:405](/Users/turbokach/Dev/pipeline-viz/viz.js:405) — Packet placement ignores other packets, so simultaneous labels can overlap; fan-out scenario `a` places “branch A” and “branch B” together near merge arrival at `t≈3.699`, and lint never checks packet-versus-packet collisions.

[viz.js:133](/Users/turbokach/Dev/pipeline-viz/viz.js:133) — Rename candidate-bearing node `disc` to `constructor` and update its edges: validation passes, but inherited object properties make `.push()` throw, aborting rendering and playback.

[tools/check.py:479](/Users/turbokach/Dev/pipeline-viz/tools/check.py:479) — Connectivity ignores arrival times: move feature scenario `a`’s first departure to `t=10`, and validation still accepts the next departure at `t=0.9`, animating downstream work before its input exists.

[tools/check.py:193](/Users/turbokach/Dev/pipeline-viz/tools/check.py:193) — Citation containment checks lexical paths while file reads follow symlinks; a link beneath an allowed root can validate unrelated external content or point to `/dev/zero`, causing an unbounded read and memory exhaustion.

[tools/check.py:752](/Users/turbokach/Dev/pipeline-viz/tools/check.py:752) — Unlike `chrome_dom`, screenshot cleanup does not catch `PermissionError` from `killpg`; that failure aborts capture and skips `proc.wait()`, leaving the process unreaped.

[tools/check.py:425](/Users/turbokach/Dev/pipeline-viz/tools/check.py:425) — A JSON via coordinate of `1e308` passes the finite-number check, but doubling it produces infinity and `round()` raises `OverflowError`, crashing validation before it reports the out-of-grid coordinate.