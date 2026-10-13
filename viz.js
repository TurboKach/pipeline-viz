// pipeline-viz renderer. Classic script (file:// safe): no modules, no fetch.
// Views come from spec/*.js, which push one view object each onto window.PV.
(function () {
'use strict';

// ---- GRID CONSTANTS -------------------------------------------------------
// TWIN: tools/check.py (section "GRID CONSTANTS") holds NODE_FW, NODE_FH, SPREAD
// and the route() function. Keep them identical: check.py judges the same
// geometry this file draws. The two numbers below are fractions of one grid cell.
const NODE_FW = 0.80;            // node box width  = NODE_FW * one column
const NODE_FH = 0.55;            // node box height = NODE_FH * one lane
// pixel size of a cell. check.py judges the layout in grid units; it holds CW and GUT only to size
// the screenshot window (TWIN: tools/check.py "RENDER SIZE").
// CW is wide enough that a 21-char subtitle (the longest in the specs) fits a node at >= 9 px.
const CW = 156, LH = 140, GUT = 110, TOP = 22, PAD = 34;
// The canvas never scales below this: a view wider than the window scrolls sideways instead.
// 1 keeps every node subtitle at its drawn size, which is the >= 9 px floor lint checks.
const MIN_SCALE = 1;
const TXT_PAD = 8;               // node text is fitted to the box width minus this

// TWIN: tools/check.py VIEW_ORDER.
const VIEW_ORDER = [
  ['feature', '1', 'feature pipeline'], ['recovery', '2', 'recovery & limits'],
  ['oneshot', '3', 'one-shot'], ['fanout', '4', 'parallel fan-out'],
  ['routing', '5', 'model / effort'], ['meta', '6', 'meta loop'],
];

// Every table keyed by a spec id (node, edge, lane, view) is a null-prototype object, so an id such as
// "constructor" or "__proto__" is an ordinary key and never an inherited property.
const dict = () => Object.create(null);

// Page health for tools/check.py shoot and lint: <html data-pv-error> holds the first uncaught error or a
// requested view that is unknown or not built, or (frozen mode only) a URL param that does not resolve;
// <html data-pv-view> names the view once it is rendered.
const root = document.documentElement;
const fail = m => { if (!root.dataset.pvError) root.dataset.pvError = String(m).split('\n')[0].slice(0, 200); };
window.addEventListener('error', ev => fail(ev.message || ev.error));
window.addEventListener('unhandledrejection', ev => fail(ev.reason));

const NS = 'http://www.w3.org/2000/svg';
const COL = { g: '#3dff8f', c: '#56d8ff', a: '#ffb340', v: '#d58cff', r: '#ff5470' };
const $ = id => document.getElementById(id);
const svg = $('svg');

function el(tag, attrs, parent) {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  (parent || svg).appendChild(e);
  return e;
}
function txt(parent, x, y, s, cls, anchor) {
  const t = el('text', { x, y, class: cls || '', 'text-anchor': anchor || 'middle' }, parent);
  t.textContent = s;
  return t;
}
function fit(t, maxW) {  // shrink a text element so it fits maxW user units
  const w = t.getComputedTextLength();
  if (w > maxW && w > 0) t.style.fontSize = (parseFloat(getComputedStyle(t).fontSize) * maxW / w) + 'px';
}
const eq = (a, b) => Math.abs(a - b) < 1e-9;

// ---- routing (TWIN: tools/check.py route()) -------------------------------
const axisOf = s => (s === 'l' || s === 'r') ? 'h' : 'v';
// P: grid points [x,y] = anchor, ...vias, anchor. Returns an orthogonal polyline.
// The first segment follows the exit side's axis, the last the enter side's axis.
function route(P, exitSide, enterSide) {
  const out = [P[0]];
  for (let i = 0; i < P.length - 1; i++) {
    const a = P[i], b = P[i + 1];
    const fa = i === 0 ? axisOf(exitSide) : null;
    const la = i === P.length - 2 ? axisOf(enterSide) : null;
    if (eq(a[0], b[0]) || eq(a[1], b[1])) { out.push(b); continue; }
    if (fa && la && fa === la) {
      if (fa === 'h') { const m = (a[0] + b[0]) / 2; out.push([m, a[1]], [m, b[1]], b); }
      else { const m = (a[1] + b[1]) / 2; out.push([a[0], m], [b[0], m], b); }
    } else if (fa) out.push(fa === 'h' ? [b[0], a[1]] : [a[0], b[1]], b);
    else if (la) out.push(la === 'h' ? [a[0], b[1]] : [b[0], a[1]], b);
    else out.push([b[0], a[1]], b);   // middle pair that is not aligned: check.py errors
  }
  const r = [out[0]];
  for (let i = 1; i < out.length; i++) if (!eq(out[i][0], r[r.length - 1][0]) || !eq(out[i][1], r[r.length - 1][1])) r.push(out[i]);
  return r;
}

// ---- state ----------------------------------------------------------------
const q = new URLSearchParams(location.search);
const LINT = q.has('lint');   // ?lint=1: measure the rendered SVG, write the result into the DOM (check.py lint)
const FROZEN = q.has('t') || LINT;
const FT = FROZEN ? (Number(q.get('t')) || 0) : 0;
if (FROZEN) document.body.classList.add('frozen');
const views = dict();
(window.PV || []).forEach(v => { views[v.id] = v; });

let curId = null, V = null;
// overlays: a set of 'gaps' (explicit), 'candidates' (derived), 'metrics'; URL: overlay=gaps,candidates
const OVERLAYS = ['gaps', 'candidates', 'metrics'];
const overlay = new Set((q.get('overlay') || '').split(',').filter(x => OVERLAYS.includes(x)));
let selected = q.get('card') || null;
let scIdx = 0, clock = 0, paused = false, sched = [], cycle = 0, lastT = -1, stepNo = 0;
let nodeG = dict(), edgeP = dict(), nodeById = dict(), edgeById = dict();
let labelRects = [], nodeObst = [];   // user-unit boxes of the placed edge labels and of the nodes (plus HUMAN tags)

// ---- header / tabs --------------------------------------------------------
function buildTabs() {
  const tabs = $('tabs');
  tabs.textContent = '';
  VIEW_ORDER.forEach(([id, key, title]) => {
    const b = document.createElement('button');
    b.className = 'tab' + (views[id] ? '' : ' missing') + (id === curId ? ' on' : '');
    b.textContent = key + ' ' + (views[id] ? views[id].title : title) + (views[id] ? '' : ' · not built yet');
    b.onclick = () => selectView(id);
    tabs.appendChild(b);
  });
}
function buildHeader() {
  const d = V && V.doctrine;
  $('doctrine').textContent = d ? `kit ${d.kit_sha} · extracted ${d.extracted} · CC ${d.cc_validated}` + (V.draft ? ' · DRAFT' : '') : '';
  const u = $('unplaced');
  u.textContent = '';
  if (V && V.unplaced && V.unplaced.length) {
    u.textContent = 'UNPLACED ' + V.unplaced.length + ': ' + V.unplaced.map(x => x.text + ' (' + x.reason + ')').join(' | ');
  }
  const sc = $('scen');
  sc.textContent = '';
  if (V && V.scenarios.length) {
    sc.append('scenario ');
    V.scenarios.forEach((s, i) => {
      const b = document.createElement('button');
      b.className = 'tab' + (i === scIdx ? ' on' : '');
      b.textContent = s.id;
      b.title = s.title;
      b.onclick = () => selectScenario(i);
      sc.appendChild(b);
    });
    sc.append('  ' + V.scenarios[scIdx].title + '   [space] pause  [g] gaps  [c] candidates  [m] metrics');
  }
}

// ---- gaps: explicit (kind tech-debt|report) and derived candidates -------
// candidate reasons, in card order
const REASONS = ['prose-only gate', 'evidence "none"', 'bound "none"', 'no metric', 'authored as derived'];
const explicitGaps = n => n.card.gaps.filter(g => g.kind !== 'derived');
// returns {nodeId: [{reason, text}]}; derived candidates are never stated as fact
function candidates() {
  const byNode = dict();
  const add = (id, reason, text) => (byNode[id] = byNode[id] || []).push({ reason, text });
  V.nodes.forEach(n => {
    n.card.gates.forEach(g => {
      if (g.enforced_by === 'prose') add(n.id, 'prose-only gate', g.rule);
      if (g.evidence === 'none') add(n.id, 'evidence "none"', g.rule);
    });
    if (n.kind !== 'input' && n.kind !== 'output' && !n.card.metrics.length) add(n.id, 'no metric', 'no metric for this stage');
    n.card.gaps.filter(g => g.kind === 'derived').forEach(g => add(n.id, 'authored as derived', g.text));
  });
  V.edges.forEach(e => { if (e.kind === 'back' && e.bound === 'none') add(e.from, 'bound "none"', 'back edge ' + e.id + ' has no bound in doctrine'); });
  return byNode;
}
function gapTotals() {
  const cand = candidates();
  return {
    gaps: V.nodes.reduce((a, n) => a + explicitGaps(n).length, 0),
    cands: Object.keys(cand).reduce((a, k) => a + cand[k].length, 0),
  };
}

// ---- build a view ---------------------------------------------------------
function clearSvg() { while (svg.firstChild) svg.removeChild(svg.firstChild); }
function defs() {
  const d = el('defs', {});
  const f = el('filter', { id: 'glow', x: '-50%', y: '-50%', width: '200%', height: '200%' }, d);
  el('feGaussianBlur', { stdDeviation: '2.2', result: 'b' }, f);
  const fm = el('feMerge', {}, f); el('feMergeNode', { in: 'b' }, fm); el('feMergeNode', { in: 'SourceGraphic' }, fm);
  for (const k in COL) {
    const m = el('marker', { id: 'arr-' + k, viewBox: '0 0 10 10', refX: '9', refY: '5', markerWidth: '7', markerHeight: '7', orient: 'auto' }, d);
    el('path', { d: 'M0,1 L9,5 L0,9 z', fill: COL[k] }, m);
  }
}
const gx = c => GUT + (c + 0.5) * CW;
const gy = l => TOP + (l + 0.5) * LH;

function edgeColor(e) {
  if (e.kind === 'back') return 'r';
  const k = nodeById[e.to].kind;
  return k === 'sub' ? 'c' : k === 'codex' ? 'v' : k === 'human' ? 'a' : 'g';
}

function build() {
  clearSvg();
  nodeG = dict(); edgeP = dict(); nodeById = dict(); edgeById = dict();
  const msg = $('msg');
  if (!V) {
    msg.hidden = false;
    msg.textContent = (curId || 'this view') + ' is not built yet';
    svg.style.display = 'none';
    $('lines').textContent = '';
    $('card').textContent = '';
    return;
  }
  msg.hidden = true; svg.style.display = '';
  svg.removeAttribute('class');   // fit text with every overlay off: hidden text measures 0 wide. setOverlay() sets the class again
  const laneIdx = dict();
  V.lanes.forEach((l, i) => { laneIdx[l.id] = i; });
  V.nodes.forEach(n => { nodeById[n.id] = n; n.pos = [n.col, laneIdx[n.lane]]; });
  V.edges.forEach(e => { edgeById[e.id] = e; });
  const W = GUT + V.cols * CW + 8, H = TOP + V.lanes.length * LH + PAD;
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.style.minWidth = Math.round(W * MIN_SCALE) + 'px';   // narrower windows scroll #stage sideways
  defs();

  V.lanes.forEach((l, i) => {
    const g = el('g', { class: 'lane' });
    el('rect', { x: 6, y: TOP + i * LH, width: W - 12, height: LH, rx: 4 }, g);
    txt(g, 16, TOP + i * LH + 20, l.label, '', 'start');
    txt(g, 16, TOP + i * LH + 36, l.sub, 'm', 'start');
  });

  // anchors: edges sharing one node side are spread along it, in edge order
  const ends = dict();
  V.edges.forEach(e => {
    [[e.from, e.exit, 'exit'], [e.to, e.enter, 'enter']].forEach(([n, s, role]) => {
      const key = n + '|' + s;
      (ends[key] = ends[key] || []).push(e.id + '|' + role);
    });
  });
  function anchor(nid, side, eid, role) {
    const n = nodeById[nid], list = ends[nid + '|' + side];
    const k = list.indexOf(eid + '|' + role), cnt = list.length;
    const f = (k + 1) / (cnt + 1) - 0.5;
    const [cx, cy] = n.pos, hw = NODE_FW / 2, hh = NODE_FH / 2;
    if (side === 'l') return [cx - hw, cy + f * NODE_FH];
    if (side === 'r') return [cx + hw, cy + f * NODE_FH];
    if (side === 't') return [cx + f * NODE_FW, cy - hh];
    return [cx + f * NODE_FW, cy + hh];
  }
  const px = p => [gx(p[0]), gy(p[1])];

  const labels = el('g', {});
  const wires = V.edges.map(e => {
    const P = [anchor(e.from, e.exit, e.id, 'exit')].concat(e.via || [], [anchor(e.to, e.enter, e.id, 'enter')]);
    const pts = route(P, e.exit, e.enter).map(px);
    const c = edgeColor(e);
    const path = el('path', {
      class: 'wire kind-' + e.kind, d: 'M' + pts.map(p => p.join(',')).join(' L'),
      stroke: COL[c], 'marker-end': `url(#arr-${c})`, 'data-e': e.id,
    });
    edgeP[e.id] = { path, len: path.getTotalLength(), c, e };
    return { e, pts, c };
  });

  // Label placement. Obstacles: node boxes (padded for the HUMAN tag and gap markers), the lane
  // captions, the canvas border and every label already placed. Wires are a soft cost: a label
  // may cross a foreign wire (its halo keeps it readable) but prefers not to.
  const hw = NODE_FW * CW / 2, hh = NODE_FH * LH / 2;
  const hard = V.nodes.map(n => { const [cx, cy] = px(n.pos); return [cx - hw - 2, cy - hh - 15, cx + hw + 2, cy + hh + 2]; });
  svg.querySelectorAll('.lane text').forEach(t => { const b = t.getBBox(); hard.push([b.x - 1, b.y - 1, b.x + b.width + 1, b.y + b.height + 1]); });
  const canvas = [4, 2, W - 4, H - 2];
  const placed = labelRects = [];
  nodeObst = V.nodes.map(n => { const [cx, cy] = px(n.pos); return [cx - hw, cy - hh, cx + hw, cy + hh]; });
  V.nodes.filter(n => n.kind === 'human').forEach(n => { const [cx, cy] = px(n.pos); nodeObst.push([cx + hw - 58, cy - hh - 15, cx + hw, cy - hh]); });   // the ◆ HUMAN tag
  const allSegs = [];
  wires.forEach(w => w.pts.slice(1).forEach((b, i) => allSegs.push([w.pts[i], b])));
  const OFFS = [0, 8, 18, 30, 44];
  function layoutUnit(pts, lw, bw) {
    // candidate positions: along every segment, both sides, a few offsets away from the line
    const segs = pts.slice(1).map((b, i) => { const a = pts[i]; return { a, b, L: Math.abs(b[0] - a[0]) + Math.abs(b[1] - a[1]), h: eq(a[1], b[1]) }; });
    const maxLen = Math.max(...segs.map(x => x.L));
    const both = lw && bw, out = [];
    segs.forEach(sg => {
      if (sg.L < 14 && segs.length > 1) return;
      const lo = Math.min(sg.a[sg.h ? 0 : 1], sg.b[sg.h ? 0 : 1]), hi = Math.max(sg.a[sg.h ? 0 : 1], sg.b[sg.h ? 0 : 1]);
      const ps = [(lo + hi) / 2];
      for (let p = lo + 6; p <= hi - 6; p += 12) ps.push(p);
      OFFS.forEach(o => ps.forEach(p => {
        const cost = o * 0.4 + Math.abs(p - (lo + hi) / 2) * 0.03 + (maxLen - sg.L) * 0.02;
        if (sg.h) {
          const y = sg.a[1];
          [1, -1].forEach(f => {   // f = 1: label above the line, badge below; -1: swapped
            const up = y - 6 - o, dn = y + 13 + o;
            out.push({ cost, lx: p - lw / 2, lby: f === 1 ? up : dn, bx: p - bw / 2, bby: f === 1 ? dn : up });
          });
        } else {
          const x = sg.a[0];
          [1, -1].forEach(f => {   // f = 1: right of the line, -1: left
            out.push({ cost, lx: f === 1 ? x + 6 + o : x - 6 - o - lw, lby: both ? p - 1 : p + 4,
                       bx: f === 1 ? x + 9 + o : x - 9 - o - bw, bby: both ? p + 13 : p + 4 });
          });
        }
      }));
    });
    return out;
  }
  const lRect = (x, by, w) => [x - 1, by - 10, x + w + 1, by + 4];
  const bRect = (x, by, w) => [x - 4, by - 11, x + w + 4, by + 5];
  const hits = (a, b) => a[0] < b[2] && b[0] < a[2] && a[1] < b[3] && b[1] < a[3];
  const segHits = (sg, r) => Math.min(sg[0][0], sg[1][0]) <= r[2] && Math.max(sg[0][0], sg[1][0]) >= r[0] && Math.min(sg[0][1], sg[1][1]) <= r[3] && Math.max(sg[0][1], sg[1][1]) >= r[1];
  function score(rects) {
    let c = 0;
    rects.forEach(r => {
      if (r[0] < canvas[0] || r[1] < canvas[1] || r[2] > canvas[2] || r[3] > canvas[3]) c += 1000;
      hard.forEach(h => { if (hits(r, h)) c += 1000; });
      placed.forEach(h => { if (hits(r, h)) c += 1000; });
      allSegs.forEach(sg => { if (segHits(sg, r)) c += 6; });
    });
    return c;
  }
  wires.forEach(({ e, pts, c }) => {
    const lab = [e.label, e.guard ? '[' + e.guard + ']' : null].filter(Boolean).join(' ');
    const bt = e.kind === 'back' ? '↺ ' + (e.bound === 'none' ? 'bound: none' : e.bound) : '';
    const wlen = (s, cls, host) => { const t = txt(host, 0, 0, s, cls, 'start'); const w = t.getComputedTextLength(); host.removeChild(t); return w; };
    const probe = el('g', { class: 'bound' }, labels);   // the badge font comes from the .bound rule
    const lw = lab ? wlen(lab, 'wl', labels) : 0, bw = bt ? wlen(bt, 'bt', probe) : 0;
    labels.removeChild(probe);
    if (!lw && !bw) return;
    let best = null;
    layoutUnit(pts, lw, bw).forEach(cd => {
      const rects = [];
      if (lw) rects.push(lRect(cd.lx, cd.lby, lw));
      if (bw) rects.push(bRect(cd.bx, cd.bby, bw));
      cd.rects = rects;
      cd.total = cd.cost + score(rects);
      if (!best || cd.total < best.total) best = cd;
    });
    best.rects.forEach(r => placed.push(r));
    if (lab) { const t = txt(labels, best.lx, best.lby, lab, 'wl', 'start'); t.setAttribute('fill', COL[c]); t.setAttribute('data-e', e.id); }
    if (bt) {
      const none = e.bound === 'none';
      const bg = el('g', { class: 'bound' + (none ? ' none' : ''), 'data-e': e.id }, labels);
      const t = txt(bg, best.bx, best.bby, bt, 'bt', 'start');
      const b = t.getBBox();
      const r = el('rect', { x: b.x - 3, y: b.y - 1, width: b.width + 6, height: b.height + 2, rx: 2 }, bg);
      bg.insertBefore(r, t);
      const ti = document.createElementNS(NS, 'title'); ti.textContent = 'bound: ' + e.bound; bg.appendChild(ti);
    }
  });

  const cand = candidates();
  V.nodes.forEach(n => {
    const g = el('g', { class: 'node k-' + n.kind, 'data-n': n.id });
    nodeG[n.id] = g;
    const [cx, cy] = px(n.pos), w = NODE_FW * CW, h = NODE_FH * LH, x0 = cx - w / 2, y0 = cy - h / 2;
    if (n.kind === 'decision') {
      const k = 9;
      el('polygon', { points: [[x0 + k, y0], [x0 + w - k, y0], [x0 + w, y0 + k], [x0 + w, y0 + h - k], [x0 + w - k, y0 + h], [x0 + k, y0 + h], [x0, y0 + h - k], [x0, y0 + k]].map(p => p.join(',')).join(' ') }, g);
    } else {
      el('rect', { x: x0, y: y0, width: w, height: h, rx: (n.kind === 'input' || n.kind === 'output') ? 14 : 3 }, g);
    }
    fit(txt(g, cx, cy - 14, n.title, 't'), w - TXT_PAD);
    fit(txt(g, cx, cy + 2, n.sub, 's'), w - TXT_PAD);
    fit(txt(g, cx, cy + 18, '→ ' + n.produces, 'a'), w - TXT_PAD);
    const ms = n.card.metrics;
    const mt = ms.length ? ms[0].value + (ms.length > 1 ? ' +' + (ms.length - 1) : '') : 'unmeasured';
    const mel = txt(g, cx, cy + 18, mt.length > 17 ? mt.slice(0, 16) + '…' : mt, 'mt' + (ms.length ? '' : ' un'));
    mel.dataset.fitW = w - TXT_PAD;   // fitted when the metrics overlay shows it (hidden text has no width)
    const mtt = document.createElementNS(NS, 'title'); mtt.textContent = ms.length ? ms[0].name + ': ' + mt : mt; mel.appendChild(mtt);
    if (n.kind === 'human') {
      txt(g, x0 + w, y0 - 5, '◆ HUMAN', 'tag', 'end');
      txt(g, cx, cy + 18, 'waiting for owner ▌', 'wt');   // inside the box, in the produces line's place
    }
    // gap markers: solid red + count = explicit gaps (G); muted dashed amber + count = candidates (C)
    const ex = explicitGaps(n).length, cd = (cand[n.id] || []).length;
    if (ex) {
      const bg = el('g', { class: 'gb ex' }, g);
      el('circle', { cx: x0 + 6, cy: y0 + 2, r: 9 }, bg);
      txt(bg, x0 + 6, y0 + 6, String(ex), 'gbt');
    }
    if (cd) {
      const bg = el('g', { class: 'gb cd' }, g);
      el('circle', { cx: x0 + w - 6, cy: y0 + 2, r: 8 }, bg);
      txt(bg, x0 + w - 6, y0 + 5.5, String(cd), 'gbt');
    }
    g.addEventListener('click', ev => { ev.stopPropagation(); select(n.id); });
  });
  svg.appendChild(labels);   // labels above nodes
  buildScenario();
  renderCard();
}

// ---- scenarios ------------------------------------------------------------
function buildScenario() {
  sched = []; cycle = 0; lastT = -1; stepNo = 0; clock = 0;
  $('lines').textContent = '';
  const sc = V.scenarios[scIdx];
  if (!sc) return;
  sc.steps.forEach(s => {
    const ep = edgeP[s.edge], g = el('g', { class: 'pk', style: 'display:none' });
    el('circle', { r: 4, fill: COL[ep.c] }, g);
    const lt = txt(g, 8, -7, s.packet, 'pl', 'start');
    lt.setAttribute('fill', COL[ep.c]);
    sched.push({ t0: s.t, d: s.d, e: ep.e, ep, lab: s.packet, log: s.log, g, lt, lw: 0 });
    cycle = Math.max(cycle, s.t + s.d);
  });
  cycle += 2;
  // human stops wait from the packet's arrival until the node's next departure
  sched.forEach(s => {
    if (nodeById[s.e.to].kind !== 'human') return;
    const arrive = s.t0 + s.d;
    const dep = sched.filter(x => x.e.from === s.e.to && x.t0 >= arrive).sort((a, b) => a.t0 - b.t0)[0];
    s.wait = { id: s.e.to, from: arrive, to: dep ? dep.t0 : cycle };
  });
  addLine('──────── scenario ' + sc.id + ' ────────', 'sep');
}
const lines = $('lines');
function addLine(s, c) {
  const d = document.createElement('div'); d.textContent = s; if (c) d.className = c;
  lines.appendChild(d);
  while (lines.children.length > 8) lines.removeChild(lines.firstChild);   // log <= 8 lines
}
function logUpTo(from, to) {
  sched.filter(s => s.log && s.t0 > from && s.t0 <= to).sort((a, b) => a.t0 - b.t0).forEach(s => {
    stepNo++;
    addLine(`[${String(stepNo).padStart(2, '0')}] ${s.log}`, nodeById[s.e.to].kind === 'human' ? 'gate' : '');
  });
}
// A packet label sits next to its dot but never on a node (its text, its border): the first free spot wins,
// else the cheapest one (farther spots float in the gap between node rows).
const PK_SPOTS = [[8, -7, 'start'], [8, 17, 'start'], [-8, -7, 'end'], [-8, 17, 'end'],
                  [0, -30, 'middle'], [0, 40, 'middle'], [0, -44, 'middle'], [0, 54, 'middle']];
function placePacketLabel(s, x, y) {
  if (!s.lw) s.lw = s.lt.getComputedTextLength();
  let best = null;
  PK_SPOTS.forEach(([dx, dy, a]) => {
    const l = a === 'start' ? x + dx : a === 'end' ? x + dx - s.lw : x - s.lw / 2;
    const r = [l - 1, y + dy - 10, l + s.lw + 1, y + dy + 4];
    let c = (Math.abs(dx) + Math.abs(dy)) * 0.3;
    nodeObst.forEach(b => { if (r[0] < b[2] && b[0] < r[2] && r[1] < b[3] && b[1] < r[3]) c += 1000; });
    labelRects.forEach(b => { if (r[0] < b[2] && b[0] < r[2] && r[1] < b[3] && b[1] < r[3]) c += 30; });
    if (!best || c < best.c) best = { c, dx, dy, a };
  });
  s.lt.setAttribute('x', best.dx); s.lt.setAttribute('y', best.dy); s.lt.setAttribute('text-anchor', best.a);
}
function draw(t) {
  const hot = new Set(), wait = new Set(), live = new Set();
  sched.forEach(s => {
    const u = (t - s.t0) / s.d;
    if (u >= 0 && u <= 1) {
      const p = s.ep.path.getPointAtLength(u * s.ep.len);
      s.g.setAttribute('transform', `translate(${p.x},${p.y})`);
      s.g.style.display = '';
      placePacketLabel(s, p.x, p.y);
      live.add(s.e.id); hot.add(s.e.from);
    } else s.g.style.display = 'none';
    const a = t - (s.t0 + s.d);
    if (a >= 0 && a < 0.9) hot.add(s.e.to);
    if (s.wait && t >= s.wait.from && t < s.wait.to) wait.add(s.wait.id);
  });
  for (const id in nodeG) {
    nodeG[id].classList.toggle('hot', hot.has(id) && !wait.has(id));
    nodeG[id].classList.toggle('wait', wait.has(id));
  }
  for (const id in edgeP) edgeP[id].path.classList.toggle('live', live.has(id));
  if (t < lastT) { lines.textContent = ''; stepNo = 0; addLine('──────── scenario ' + V.scenarios[scIdx].id + ' ────────', 'sep'); lastT = -1; }
  logUpTo(lastT, t); lastT = t;
}

// ---- card panel -----------------------------------------------------------
function srcLine(s) { return `${s.file}:${s.line}  "${s.quote}"`; }
function renderCard() {
  const c = $('card');
  c.textContent = '';
  if (!V) return;
  const h = document.createElement('h2'); h.textContent = 'NODE CARD' + (overlay.size ? ' · ' + [...overlay].join(' + ') : '');
  c.appendChild(h);
  const row = (k, v, cls) => {
    const d = document.createElement('div'); d.className = 'row' + (cls ? ' ' + cls : '');
    const kk = document.createElement('span'); kk.className = 'k'; kk.textContent = k;
    const vv = document.createElement('span'); vv.className = 'v'; vv.textContent = v;
    d.append(kk, vv); c.appendChild(d); return d;
  };
  const srcs = (list) => (list || []).forEach(s => row('', '↳ ' + srcLine(s), 'src'));
  const n = selected && nodeById[selected];
  if (!n) {
    if (!overlay.size) { row('', 'click a node for its card', ''); return; }
    if (overlay.has('gaps')) V.nodes.forEach(x => explicitGaps(x).forEach(g => row(x.title, g.text + ' [' + g.kind + ']', 'gap')));
    if (overlay.has('candidates')) {
      const cand = candidates();
      REASONS.forEach(r => V.nodes.forEach(x => (cand[x.id] || []).filter(k => k.reason === r).forEach(k => row(x.title, 'candidate · ' + r + ': ' + k.text, 'cand'))));
    }
    if (overlay.has('metrics')) V.nodes.forEach(x => {
      if (!x.card.metrics.length) row(x.title, 'unmeasured', 'cand');
      x.card.metrics.forEach(m => row(x.title, `${m.name} = ${m.value}  (as of ${m.as_of})`));
    });
    return;
  }
  const b = document.createElement('b'); b.textContent = n.title + ' — ' + n.sub; c.appendChild(b);
  const cd = n.card;
  row('kind', n.kind); row('actor', cd.actor); row('model', cd.model); row('does', cd.does);
  row('inputs', cd.inputs.join(' · ') || '—'); row('artifacts', cd.artifacts.join(' · ') || '—');
  row('produces', n.produces);
  if (cd.gates.length) cd.gates.forEach((g, i) => {
    row('gate ' + (i + 1), g.rule, g.enforced_by === 'prose' && overlay.has('candidates') ? 'cand' : '');
    row('  evidence', g.evidence); row('  enforced', g.enforced_by); srcs(g.src);
  }); else row('gates', '—');
  if (cd.options.length) row('options', cd.options.join(' / '), 'gate');
  if (cd.metrics.length) cd.metrics.forEach(m => { row('metric', `${m.name} = ${m.value}  (as of ${m.as_of})`); srcs(m.src); });
  else row('metrics', overlay.has('metrics') ? 'unmeasured' : '—', overlay.has('metrics') ? 'cand' : '');
  explicitGaps(n).forEach(g => { row('gap', g.text + ' [' + g.kind + ']', 'gap'); srcs(g.src); });
  if (overlay.has('candidates')) {
    const mine = candidates()[n.id] || [];
    REASONS.forEach(r => mine.filter(k => k.reason === r).forEach(k => row('candidate', r + ': ' + k.text, 'cand')));
  }
  if (cd.src.length) { row('sources', ''); srcs(cd.src); }
}
function select(id) { selected = id; for (const k in nodeG) nodeG[k].classList.toggle('sel', k === id); renderCard(); }

// ---- controls -------------------------------------------------------------
function setOverlay() {
  svg.setAttribute('class', [...overlay].map(o => 'ov-' + o).join(' '));
  if (overlay.has('metrics')) svg.querySelectorAll('.mt').forEach(t => { t.style.fontSize = ''; fit(t, +t.dataset.fitW); });
  if (V) { const t = gapTotals(); $('totals').textContent = `gaps ${t.gaps} · candidates ${t.cands}`; } else $('totals').textContent = '';
  renderCard();
}
function toggle(name) { overlay.has(name) ? overlay.delete(name) : overlay.add(name); setOverlay(); }
function selectView(id, keep) {
  curId = id; V = views[id] || null; scIdx = 0;
  if (!keep) selected = null;
  if (V && q.get('scenario') && FROZEN) { const i = V.scenarios.findIndex(s => s.id === q.get('scenario')); if (i >= 0) scIdx = i; }
  build(); buildTabs(); buildHeader(); setOverlay();
  if (V && selected) select(selected);
  if (V && FROZEN) frozenFrame();
  if (FROZEN) document.documentElement.dataset.docH = document.documentElement.scrollHeight;   // check.py shoot sizes the window from it
}
function selectScenario(i) { scIdx = i; build(); buildHeader(); setOverlay(); if (selected && nodeById[selected]) select(selected); if (FROZEN) frozenFrame(); }
function frozenFrame() { if (cycle > 0) draw(((FT % cycle) + cycle) % cycle); }

document.addEventListener('keydown', ev => {
  if (ev.ctrlKey || ev.metaKey || ev.altKey) return;
  const k = ev.key.toLowerCase();
  const v = VIEW_ORDER.find(x => x[1] === k);
  if (v) selectView(v[0]);
  else if (k === 'g') toggle('gaps');
  else if (k === 'c') toggle('candidates');
  else if (k === 'm') toggle('metrics');
  else if (k === ' ') { ev.preventDefault(); paused = !paused; document.body.classList.toggle('paused', paused); }
});
svg.addEventListener('click', ev => { if (!ev.target.closest('.node')) { selected = null; for (const k in nodeG) nodeG[k].classList.remove('sel'); renderCard(); } });


// ---- lint mode (?lint=1) --------------------------------------------------
// Measures the real rendered SVG (bounding boxes, in user units) over every scenario of the
// loaded view and writes JSON into <pre id="pv-lint">. tools/check.py lint parses it.
function runLint() {
  const res = { view: curId, scale: 0, scenarios: 0, frames: 0, waits: 0, minSubPx: null, overlaps: [], cardsClipped: [] };
  const seen = new Set();
  const add = (kind, a, b) => { const key = kind + '|' + a + '|' + b; if (!seen.has(key)) { seen.add(key); res.overlaps.push({ kind, a, b }); } };
  const scale = () => svg.getScreenCTM().a;
  const ub = e => {   // bounding box in user units
    const r = e.getBoundingClientRect(), s = svg.getBoundingClientRect(), k = scale();
    return [(r.left - s.left) / k, (r.top - s.top) / k, (r.right - s.left) / k, (r.bottom - s.top) / k];
  };
  const hit = (a, b) => a[0] < b[2] - 0.5 && b[0] < a[2] - 0.5 && a[1] < b[3] - 0.5 && b[1] < a[3] - 0.5;
  const shown = e => getComputedStyle(e).display !== 'none';
  res.scale = scale();
  const nid = e => e.dataset.n;

  // A text that is wider than its node box. The produces line is fitted at build time, so each scenario is
  // built with the metrics overlay on (that overlay hides it) and then shown with metrics on and off.
  const wide = tag => svg.querySelectorAll('.node').forEach(g => {
    const b = ub(g.querySelector('rect,polygon'));
    g.querySelectorAll('.t,.s,.a,.mt').forEach(x => {
      const r = shown(x) && ub(x);
      if (r && (r[0] < b[0] - 0.5 || r[2] > b[2] + 0.5)) add('label-escapes-node', 'node ' + g.dataset.n + ' ' + x.getAttribute('class') + ' (' + tag + ')', 'node ' + g.dataset.n);
    });
  });

  V.scenarios.forEach((sc, si) => {
    scIdx = si; overlay.clear(); overlay.add('metrics'); setOverlay(); build(); buildHeader(); setOverlay();
    wide('metrics on');
    overlay.clear(); setOverlay();
    wide('metrics off');
    res.scenarios++;
    const nodes = [...svg.querySelectorAll('.node')].map(g => ({ id: nid(g), g, box: ub(g.querySelector('rect,polygon')) }));
    const labels = [...svg.querySelectorAll('.wl')].map(t => ({ name: 'label ' + t.dataset.e, r: ub(t) }))
      .concat([...svg.querySelectorAll('.bound')].map(g => ({ name: 'badge ' + g.dataset.e, r: ub(g.querySelector('rect')) })));
    const lanes = [...svg.querySelectorAll('.lane text')].map(t => ({ name: 'lane ' + t.textContent, r: ub(t) }));
    const wires = [...svg.querySelectorAll('path.wire')].map(p => {
      const pts = p.getAttribute('d').slice(1).split(' L').map(x => x.split(',').map(Number));
      return { id: p.dataset.e, segs: pts.slice(1).map((b, i) => [pts[i], b]) };
    });
    const segHit = (sg, r) => {
      const x0 = Math.min(sg[0][0], sg[1][0]), x1 = Math.max(sg[0][0], sg[1][0]), y0 = Math.min(sg[0][1], sg[1][1]), y1 = Math.max(sg[0][1], sg[1][1]);
      return x0 < r[2] - 0.5 && x1 > r[0] + 0.5 && y0 < r[3] - 0.5 && y1 > r[1] + 0.5;
    };
    labels.forEach(l => {
      nodes.forEach(n => { if (hit(l.r, n.box)) add('label-node', l.name, 'node ' + n.id); });
      lanes.forEach(n => { if (hit(l.r, n.r)) add('label-lane', l.name, n.name); });
    });
    for (let i = 0; i < labels.length; i++) for (let j = i + 1; j < labels.length; j++) if (hit(labels[i].r, labels[j].r)) add('label-label', labels[i].name, labels[j].name);

    // waiting indicator of every human stop (shown by force: a scenario may never reach it)
    nodes.filter(n => n.g.classList.contains('k-human')).forEach(n => {
      n.g.classList.add('wait');
      const w = n.g.querySelector('.wt');
      if (shown(w)) {
        res.waits++;
        const r = ub(w), nm = 'wait ' + n.id;
        if (!(r[0] >= n.box[0] - 0.5 && r[2] <= n.box[2] + 0.5 && r[1] >= n.box[1] - 0.5 && r[3] <= n.box[3] + 0.5)) add('wait-escapes-node', nm, 'node ' + n.id);
        nodes.forEach(o => { if (o.id !== n.id && hit(r, o.box)) add('wait-node', nm, 'node ' + o.id); });
        wires.forEach(wr => { if (wr.segs.some(sg => segHit(sg, r))) add('wait-edge', nm, 'edge ' + wr.id); });
        labels.forEach(l => { if (hit(r, l.r)) add('wait-label', nm, l.name); });
      } else add('wait-hidden', nm, '-');
      n.g.classList.remove('wait');
    });

    // frames: packets near departure and arrival, and while a human stop waits
    const times = new Set();
    sched.forEach(s => {
      [0, 0.1, 0.3, 0.5, 0.7, 0.9, 1].forEach(f => times.add(+(s.t0 + s.d * f).toFixed(3)));
      if (s.wait) times.add(+(s.wait.from + 0.05).toFixed(3));
    });
    [...times].sort((a, b) => a - b).forEach(t => {
      draw(t);
      res.frames++;
      const texts = [];
      nodes.forEach(n => n.g.querySelectorAll('text').forEach(x => { if (shown(x) && !x.closest('.gb')) texts.push({ name: 'node ' + n.id + ' ' + x.getAttribute('class'), r: ub(x) }); }));
      svg.querySelectorAll('.pk').forEach(g => {
        if (g.style.display === 'none') return;
        const lab = g.querySelector('text'), r = ub(lab);
        texts.forEach(x => { if (hit(r, x.r)) add('packet-text', 'packet "' + lab.textContent + '"', x.name); });
      });
    });
  });

  const k = scale();
  svg.querySelectorAll('.node .s').forEach(s => { const px = parseFloat(getComputedStyle(s).fontSize) * k; if (res.minSubPx === null || px < res.minSubPx) res.minSubPx = px; });

  // card panel in frozen mode: every node card and overlay list must show whole
  const card = $('card');
  const sets = [[], ['gaps'], ['candidates'], ['metrics'], ['gaps', 'candidates', 'metrics']];
  [null].concat(V.nodes.map(n => n.id)).forEach(id => sets.forEach(set => {
    overlay.clear(); set.forEach(o => overlay.add(o)); selected = id; renderCard();
    if (card.scrollHeight > card.clientHeight + 1) res.cardsClipped.push((id || '(none)') + ' + ' + (set.join(',') || 'plain'));
  }));
  res.minSubPx = res.minSubPx === null ? null : +res.minSubPx.toFixed(2);
  return res;
}
function writeLint() {
  let res;
  try { res = runLint(); } catch (err) { res = { view: curId, error: String(err && err.stack || err) }; }
  const pre = document.createElement('pre');
  pre.id = 'pv-lint';
  pre.textContent = JSON.stringify(res);
  document.body.appendChild(pre);
}

// ---- start ----------------------------------------------------------------
const wanted = q.get('view');
const asked = VIEW_ORDER.find(x => x[0] === wanted || x[1] === wanted);
const first = asked || VIEW_ORDER.find(x => views[x[0]]) || VIEW_ORDER[0];
if (wanted && !(asked && views[asked[0]])) fail('requested view "' + wanted + '" is ' + (asked ? 'not built' : 'unknown'));
selectView(first[0], true);
// A frozen frame is a capture: a param that does not resolve is an error, not a silent default. The live page ignores it.
if (FROZEN) {
  const tq = q.get('t');
  if (tq !== null && (tq.trim() === '' || !Number.isFinite(Number(tq)))) fail('t "' + tq + '" is not a number');
  (q.get('overlay') || '').split(',').filter(Boolean).forEach(x => { if (!OVERLAYS.includes(x)) fail('overlay "' + x + '" is unknown (gaps, candidates, metrics)'); });
  if (V && q.get('scenario') && !V.scenarios.some(s => s.id === q.get('scenario'))) fail('scenario "' + q.get('scenario') + '" is not in view ' + curId);
  if (V && selected && !nodeById[selected]) fail('card "' + selected + '" is not a node of view ' + curId);
}
if (LINT) writeLint();
if (V) root.dataset.pvView = curId;
if (!FROZEN) {
  let prev = null;
  const loop = now => {
    const dt = prev === null ? 0 : (now - prev) / 1000; prev = now;
    if (V && cycle > 0 && !paused) {
      clock += dt;
      if (clock >= cycle) {   // next scenario of the view, wrapping
        scIdx = (scIdx + 1) % V.scenarios.length;
        build(); buildHeader(); setOverlay(); if (selected && nodeById[selected]) select(selected);
      }
      draw(clock);
    }
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}
})();
