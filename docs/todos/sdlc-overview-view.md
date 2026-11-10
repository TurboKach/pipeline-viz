### Top-level SDLC overview view

**What.** A seventh view that shows the whole software-development life cycle on one canvas: the seven phase names the `phases` band already uses, with the six existing views hanging off the phase they detail.

**Why.** Each view maps one flow. A reader who wants the whole arc (intake to ship) has to stitch the views together by hand. Deferred at the arc-2 plan gate: the six detail views and the per-view phase band came first.

**Context.** The band labels are in `spec/*.js` (`phases`). The new view would need an entry in `VIEW_ORDER` (`tools/check.py`, twin `viz.js`), a key, and a spec file; `FLOW.md` and `drift` pick it up from the table.
