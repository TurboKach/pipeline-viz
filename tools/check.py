#!/usr/bin/env python3
"""pipeline-viz checker and screenshot tool. Python 3 stdlib only.

  check.py validate [spec/feature.js ...]   schema, citations, scenarios, layout
  check.py shoot --view feature --t 7 [--card appr] [--overlay gaps,candidates]
  check.py shoot --all                      every built view x {plain,gaps,candidates,metrics} + one card
  check.py lint                             measure overlaps and text size in the rendered page (exit 0 = clean)

Spec files are one fixed JS wrapper around one pure JSON object (see README).
No regex field extraction: the wrapper is stripped by exact prefix/suffix and
the rest goes to json.loads.
"""
import argparse
import datetime
import glob
import html.parser
import json
import math
import os
import pathlib
import select
import signal
import subprocess
import sys
import tempfile
import time
import urllib.parse

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SPEC_DIR = os.path.join(ROOT, 'spec')
CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

# ---- wrapper -----------------------------------------------------------------
WRAP_PREFIX = 'window.PV=window.PV||[];window.PV.push(\n'
WRAP_SUFFIX = '\n);\n'

# ---- GRID CONSTANTS ----------------------------------------------------------
# TWIN: viz.js (section "GRID CONSTANTS") holds NODE_FW, NODE_FH, the anchor
# spread rule (anchor()) and route(). Keep them identical: this file judges the
# same geometry viz.js draws. Units here are grid cells: node (lane, col) has its
# centre at (col, lane index); the box is NODE_FW wide, NODE_FH tall.
NODE_FW = 0.80   # node box width  as a fraction of one column
NODE_FH = 0.55   # node box height as a fraction of one lane
EPS = 1e-9

# TWIN: viz.js VIEW_ORDER.
VIEW_ORDER = [
    ('feature', '1', 'feature pipeline'), ('recovery', '2', 'recovery & limits'),
    ('oneshot', '3', 'one-shot'), ('fanout', '4', 'parallel fan-out'),
    ('routing', '5', 'model / effort'), ('meta', '6', 'meta loop'),
]
VIEW_IDS = [v[0] for v in VIEW_ORDER]

# ---- bounds and text limits --------------------------------------------------
MAX_LANES, MAX_COLS, MAX_VIA = 5, 16, 4
LIM_TITLE, LIM_SUB, LIM_CARD = 18, 22, 280      # from the plan
LIM_PRODUCES, LIM_LANE_LABEL, LIM_LANE_SUB = 20, 12, 16    # step-1 decisions
LIM_EDGE_LABEL, LIM_PACKET, LIM_LOG, LIM_SC_TITLE, LIM_VIEW_TITLE = 24, 20, 110, 60, 40
MAX_CYCLE = 60.0
QUOTE_MAX, QUOTE_WINDOW = 120, 5

NODE_KINDS = ('input', 'stage', 'sub', 'codex', 'human', 'decision', 'output')
ENFORCED = ('hook', 'script', 'frontmatter', 'harness', 'analyze-arcs', 'prose')
GAP_KINDS = ('tech-debt', 'report', 'derived')
EDGE_KINDS = ('flow', 'back', 'alt')
SIDES = ('l', 'r', 't', 'b')

SOURCE_ROOTS = [os.path.expanduser(p) for p in ('~/Dev/claude-code-setup', '~/Dev/pipeline-watch', '~/.claude')]


# ---- routing (TWIN: viz.js route()) -----------------------------------------
def axis_of(side):
    return 'h' if side in ('l', 'r') else 'v'


def _eq(a, b):
    return abs(a - b) < EPS


def route(P, exit_side, enter_side):
    """P: grid points [x, y] = anchor, vias..., anchor. Orthogonal polyline.
    First segment follows the exit side's axis, the last the enter side's axis."""
    out = [P[0]]
    for i in range(len(P) - 1):
        a, b = P[i], P[i + 1]
        fa = axis_of(exit_side) if i == 0 else None
        la = axis_of(enter_side) if i == len(P) - 2 else None
        if _eq(a[0], b[0]) or _eq(a[1], b[1]):
            out.append(b)
            continue
        if fa and la and fa == la:
            if fa == 'h':
                m = (a[0] + b[0]) / 2
                out += [[m, a[1]], [m, b[1]], b]
            else:
                m = (a[1] + b[1]) / 2
                out += [[a[0], m], [b[0], m], b]
        elif fa:
            out += [[b[0], a[1]] if fa == 'h' else [a[0], b[1]], b]
        elif la:
            out += [[a[0], b[1]] if la == 'h' else [b[0], a[1]], b]
        else:
            out += [[b[0], a[1]], b]   # middle pair not aligned: reported by the layout check
    r = [out[0]]
    for p in out[1:]:
        if not (_eq(p[0], r[-1][0]) and _eq(p[1], r[-1][1])):
            r.append(p)
    return r


def anchor(node_pos, side, k, cnt):
    """k-th of cnt edge ends on one node side, spread evenly along it (TWIN: viz.js anchor())."""
    f = (k + 1) / (cnt + 1) - 0.5
    cx, cy = node_pos
    hw, hh = NODE_FW / 2, NODE_FH / 2
    if side == 'l':
        return [cx - hw, cy + f * NODE_FH]
    if side == 'r':
        return [cx + hw, cy + f * NODE_FH]
    if side == 't':
        return [cx + f * NODE_FW, cy - hh]
    return [cx + f * NODE_FW, cy + hh]


NORMAL = {'l': (-1, 0), 'r': (1, 0), 't': (0, -1), 'b': (0, 1)}

# ---- RENDER SIZE -------------------------------------------------------------
# TWIN: viz.js (CW, GUT, MIN_SCALE) and index.html (.wrap padding). Used only to size the
# screenshot window so a frame shows the whole canvas at the renderer's minimum scale.
CELL_W, GUTTER_W, CANVAS_PAD, WRAP_PAD = 156, 110, 8, 36
MIN_SHOT_WIDTH = 1100


# ---- findings ----------------------------------------------------------------
class Report:
    def __init__(self):
        self.errors = []
        self.counts = dict(views=0, nodes=0, edges=0, scenarios=0, steps=0, gates=0, metrics=0,
                           gaps=0, src=0, stale=0, notes=0)

    def err(self, file, view, ref, field, msg):
        self.errors.append('ERROR %s → %s → %s → %s: %s' % (file, view or '-', ref or '-', field or '-', msg))


# ---- wrapper loading ---------------------------------------------------------
def load_view(path):
    """Returns (obj, error string or None)."""
    try:
        with open(path, encoding='utf-8') as f:
            text = f.read()
    except OSError as e:
        return None, 'cannot read: %s' % e
    if not text.startswith(WRAP_PREFIX):
        return None, 'file must start with exactly %r' % WRAP_PREFIX
    if not text.endswith(WRAP_SUFFIX):
        return None, 'file must end with exactly %r' % WRAP_SUFFIX
    body = text[len(WRAP_PREFIX):len(text) - len(WRAP_SUFFIX)]
    try:
        obj = json.loads(body)
    except (ValueError, RecursionError) as e:
        return None, 'body is not pure JSON: %s' % e
    if not isinstance(obj, dict):
        return None, 'body must be one JSON object'
    return obj, None


# ---- citations ---------------------------------------------------------------
_file_cache = {}


def _lines(path):
    if path not in _file_cache:
        try:
            with open(path, encoding='utf-8', errors='replace') as f:
                _file_cache[path] = f.read().split('\n')
        except (OSError, ValueError):   # ValueError: embedded NUL in the path
            _file_cache[path] = None
    return _file_cache[path]


def collapse(s):
    return ' '.join(s.split())


def check_citation(src):
    """Returns an error string or None. src was already type-checked."""
    f = src['file']
    if not (f.startswith('/') or f.startswith('~')):
        return 'file must be an absolute or ~-prefixed path'
    p = os.path.normpath(os.path.expanduser(f))
    if not os.path.isabs(p):   # e.g. ~unknown_user/x stays relative
        return 'file does not resolve to an absolute path: ' + f
    if not any(os.path.commonpath([p, r]) == r for r in SOURCE_ROOTS):
        return 'file is outside the three source roots (kit repo, pipeline-watch, ~/.claude)'
    lines = _lines(p)
    if lines is None:
        return 'cited file does not exist or is unreadable: ' + f
    q = src['quote']
    if not q.strip():
        return 'quote is empty'
    if len(q) > QUOTE_MAX:
        return 'quote is %d chars, limit %d' % (len(q), QUOTE_MAX)
    n = src['line']
    if n < 1 or n > len(lines):
        return 'line %d is outside the file (%d lines)' % (n, len(lines))
    window = collapse(' '.join(lines[max(0, n - 1 - QUOTE_WINDOW):n + QUOTE_WINDOW]))
    if collapse(q) not in window:
        return 'STALE quote: not found within ±%d lines of %s:%d' % (QUOTE_WINDOW, f, n)
    return None


# ---- schema helpers ----------------------------------------------------------
def is_num(x):
    if not isinstance(x, (int, float)) or isinstance(x, bool):
        return False
    try:
        return math.isfinite(x)
    except OverflowError:   # an int too large for a float
        return False


def known(k, coll):
    """k is a string key of coll. A JSON list or object is unhashable, so it never reaches `in`."""
    return isinstance(k, str) and k in coll


def good_id(x):
    return isinstance(x, str) and bool(x.strip())


class Checker:
    def __init__(self, rep, file, view):
        self.rep, self.file, self.view = rep, file, view

    def e(self, ref, field, msg):
        self.rep.err(self.file, self.view, ref, field, msg)

    def keys(self, obj, ref, field, required, optional=()):
        if not isinstance(obj, dict):
            self.e(ref, field, 'must be an object')
            return False
        for k in required:
            if k not in obj:
                self.e(ref, field + '.' + k if field else k, 'missing required field')
        for k in obj:
            if k not in required and k not in optional:
                self.e(ref, field + '.' + k if field else k, 'unknown field')
        return True

    def text(self, v, ref, field, limit, allow_empty=False):
        if not isinstance(v, str):
            self.e(ref, field, 'must be a string')
            return False
        if not allow_empty and not v.strip():
            self.e(ref, field, 'must not be empty')
            return False
        if len(v) > limit:
            self.e(ref, field, 'is %d chars, limit %d' % (len(v), limit))
        return True

    def src_list(self, v, ref, field, required, draft):
        if not isinstance(v, list):
            self.e(ref, field, 'must be a list')
            return
        if required and not v and not draft:
            self.e(ref, field, 'src[] must not be empty (only a draft view is exempt)')
        for i, s in enumerate(v):
            f = '%s[%d]' % (field, i)
            if not self.keys(s, ref, f, ('file', 'line', 'quote')):
                continue
            ok = True
            if not isinstance(s.get('file'), str):
                self.e(ref, f + '.file', 'must be a string'); ok = False
            if not (isinstance(s.get('line'), int) and not isinstance(s.get('line'), bool)):
                self.e(ref, f + '.line', 'must be an integer'); ok = False
            if not isinstance(s.get('quote'), str):
                self.e(ref, f + '.quote', 'must be a string'); ok = False
            if ok and all(k in s for k in ('file', 'line', 'quote')):
                self.rep.counts['src'] += 1
                msg = check_citation(s)
                if msg:
                    if msg.startswith('STALE'):
                        self.rep.counts['stale'] += 1
                    self.e(ref, f + '.quote' if 'quote' in msg or 'STALE' in msg else f + '.file', msg)


# ---- one view ----------------------------------------------------------------
def validate_view(rep, file, stem, v):
    c = Checker(rep, file, stem)
    if not c.keys(v, '', '', ('id', 'title', 'key', 'doctrine', 'lanes', 'cols', 'nodes', 'edges', 'scenarios'),
                  ('draft', 'unplaced')):
        return
    rep.counts['views'] += 1
    draft = v.get('draft', False)
    if draft is not True and draft is not False:
        c.e('', 'draft', 'must be true or false')
        draft = False
    if v.get('id') != stem:
        c.e('', 'id', 'must equal the file name %r (got %r)' % (stem, v.get('id')))
    want = [x for x in VIEW_ORDER if x[0] == stem]
    if want and v.get('key') != want[0][1]:
        c.e('', 'key', 'must be %r for view %r (got %r)' % (want[0][1], stem, v.get('key')))
    c.text(v.get('title'), '', 'title', LIM_VIEW_TITLE)
    d = v.get('doctrine')
    if c.keys(d, '', 'doctrine', ('kit_sha', 'cc_validated', 'extracted')):
        for k in ('kit_sha', 'cc_validated', 'extracted'):
            c.text(d.get(k), '', 'doctrine.' + k, 40)
        sha = d.get('kit_sha')
        if isinstance(sha, str) and not (7 <= len(sha) <= 40 and all(ch in '0123456789abcdef' for ch in sha)):
            c.e('', 'doctrine.kit_sha', 'must be 7-40 lowercase hex chars')
        try:
            datetime.date.fromisoformat(d.get('extracted'))
        except (TypeError, ValueError):
            c.e('', 'doctrine.extracted', 'must be an ISO date YYYY-MM-DD')

    # lanes
    lanes = v.get('lanes')
    lane_idx = {}
    if not isinstance(lanes, list) or not lanes:
        c.e('', 'lanes', 'must be a non-empty list')
        lanes = []
    elif len(lanes) > MAX_LANES:
        c.e('', 'lanes', '%d lanes, limit %d' % (len(lanes), MAX_LANES))
    for i, ln in enumerate(lanes):
        ref = 'lane:%s' % (ln.get('id') if isinstance(ln, dict) else i)
        if not c.keys(ln, ref, '', ('id', 'label', 'sub')):
            continue
        c.text(ln.get('id'), ref, 'id', 40)
        c.text(ln.get('label'), ref, 'label', LIM_LANE_LABEL)
        c.text(ln.get('sub'), ref, 'sub', LIM_LANE_SUB, allow_empty=True)
        if known(ln.get('id'), lane_idx):
            c.e(ref, 'id', 'duplicate lane id')
        elif good_id(ln.get('id')):
            lane_idx[ln['id']] = i
    cols = v.get('cols')
    if not (isinstance(cols, int) and not isinstance(cols, bool)) or cols < 1:
        c.e('', 'cols', 'must be a positive integer')
        cols = 1
    elif cols > MAX_COLS:
        c.e('', 'cols', '%d cols, limit %d' % (cols, MAX_COLS))
        cols = MAX_COLS

    # nodes
    nodes = {}
    pos_seen = {}
    nlist = v.get('nodes')
    if not isinstance(nlist, list):
        c.e('', 'nodes', 'must be a list')
        nlist = []
    for i, n in enumerate(nlist):
        nid = n.get('id') if isinstance(n, dict) else None
        ref = 'node:%s' % (nid if good_id(nid) else i)
        if not c.keys(n, ref, '', ('id', 'lane', 'col', 'kind', 'title', 'sub', 'produces', 'card')):
            continue
        rep.counts['nodes'] += 1
        n.pop('_pos', None)   # c.keys() already reported it as an unknown field; never trust it as a position
        c.text(nid, ref, 'id', 40)
        if known(nid, nodes):
            c.e(ref, 'id', 'duplicate node id')
        c.text(n.get('title'), ref, 'title', LIM_TITLE)
        c.text(n.get('sub'), ref, 'sub', LIM_SUB, allow_empty=True)
        c.text(n.get('produces'), ref, 'produces', LIM_PRODUCES)
        if n.get('kind') not in NODE_KINDS:
            c.e(ref, 'kind', 'must be one of %s' % ', '.join(NODE_KINDS))
        lane_ok = known(n.get('lane'), lane_idx)
        if not lane_ok:
            c.e(ref, 'lane', 'unknown lane %r' % (n.get('lane'),))
        col = n.get('col')
        col_ok = isinstance(col, int) and not isinstance(col, bool) and 0 <= col <= cols - 1
        if not col_ok:
            c.e(ref, 'col', 'must be an integer in 0..%d' % (cols - 1))
        if lane_ok and col_ok:
            key = (n['lane'], col)
            if key in pos_seen:
                c.e(ref, 'lane/col', 'grid collision with node %r at (lane %s, col %d)' % (pos_seen[key], n['lane'], col))
            else:
                pos_seen[key] = nid
            n['_pos'] = [col, lane_idx[n['lane']]]
        if good_id(nid):
            nodes[nid] = n
        validate_card(c, rep, n, ref, draft)

    # edges
    edges = {}
    elist = v.get('edges')
    if not isinstance(elist, list):
        c.e('', 'edges', 'must be a list')
        elist = []
    for i, e in enumerate(elist):
        eid = e.get('id') if isinstance(e, dict) else None
        ref = 'edge:%s' % (eid if good_id(eid) else i)
        if not c.keys(e, ref, '', ('id', 'from', 'to', 'exit', 'enter', 'kind'), ('via', 'label', 'guard', 'bound', 'src')):
            continue
        rep.counts['edges'] += 1
        c.text(eid, ref, 'id', 40)
        if known(eid, edges):
            c.e(ref, 'id', 'duplicate edge id')
        if good_id(eid):
            edges[eid] = e
        for k in ('from', 'to'):
            if not known(e.get(k), nodes):
                c.e(ref, k, 'unknown node id %r' % (e.get(k),))
        for k in ('exit', 'enter'):
            if e.get(k) not in SIDES:
                c.e(ref, k, 'must be one of l, r, t, b')
        if e.get('kind') not in EDGE_KINDS:
            c.e(ref, 'kind', 'must be one of %s' % ', '.join(EDGE_KINDS))
        for k in ('label', 'guard'):
            if k in e:
                c.text(e[k], ref, k, LIM_EDGE_LABEL)
        if 'bound' in e:
            c.text(e['bound'], ref, 'bound', LIM_CARD)
        elif e.get('kind') == 'back':
            c.e(ref, 'bound', 'required on a back edge (text, or "none" when doctrine states no bound)')
        has_text_bound = isinstance(e.get('bound'), str) and e['bound'] != 'none'
        if 'src' in e or has_text_bound:
            c.src_list(e.get('src', []), ref, 'src', has_text_bound, draft)
        via = e.get('via', [])
        if not isinstance(via, list) or len(via) > MAX_VIA:
            c.e(ref, 'via', 'must be a list of at most %d [col, lane] points' % MAX_VIA)
            e['_via_ok'] = False
        else:
            e['_via_ok'] = True
            for j, p in enumerate(via):
                if not (isinstance(p, list) and len(p) == 2 and all(is_num(x) for x in p)):
                    c.e(ref, 'via[%d]' % j, 'must be [col, lane] with whole or half-cell numbers')
                    e['_via_ok'] = False
                elif not (-0.5 <= p[0] <= cols - 0.5 and -0.5 <= p[1] <= len(lanes) - 0.5):   # range first: no arithmetic on an unbounded number
                    c.e(ref, 'via[%d]' % j, 'point %s is outside the grid (col -0.5..%s, lane -0.5..%s)' % (p, cols - 0.5, len(lanes) - 0.5))
                    e['_via_ok'] = False
                elif not all(abs(x * 2 - round(x * 2)) < EPS for x in p):
                    c.e(ref, 'via[%d]' % j, 'must be [col, lane] with whole or half-cell numbers')
                    e['_via_ok'] = False

    check_layout(c, nodes, edges)

    # scenarios
    scs = v.get('scenarios')
    if not isinstance(scs, list):
        c.e('', 'scenarios', 'must be a list')
        scs = []
    seen_sc = set()
    inputs = [nid for nid, n in nodes.items() if n.get('kind') == 'input']
    for i, sc in enumerate(scs):
        sid = sc.get('id') if isinstance(sc, dict) else None
        ref = 'scenario:%s' % (sid if good_id(sid) else i)
        if not c.keys(sc, ref, '', ('id', 'title', 'steps')):
            continue
        rep.counts['scenarios'] += 1
        c.text(sid, ref, 'id', 40)
        if known(sid, seen_sc):
            c.e(ref, 'id', 'duplicate scenario id')
        if isinstance(sid, str):
            seen_sc.add(sid)
        c.text(sc.get('title'), ref, 'title', LIM_SC_TITLE)
        steps = sc.get('steps')
        if not isinstance(steps, list) or not steps:
            c.e(ref, 'steps', 'must be a non-empty list')
            continue
        reached = set(inputs)
        end = 0.0
        for j, s in enumerate(steps):
            sref = '%s step %d' % (ref, j + 1)
            if not c.keys(s, sref, '', ('edge', 't', 'd', 'packet', 'log')):
                continue
            rep.counts['steps'] += 1
            ok = True
            if not (is_num(s.get('t')) and 0 <= s['t'] <= MAX_CYCLE):   # bounded before any arithmetic on it
                c.e(sref, 't', 'must be a number in 0..%d' % MAX_CYCLE); ok = False
            if not (is_num(s.get('d')) and 0 < s['d'] <= MAX_CYCLE):
                c.e(sref, 'd', 'must be a number in (0, %d]' % MAX_CYCLE); ok = False
            if ok:
                end = max(end, s['t'] + s['d'])
            c.text(s.get('packet'), sref, 'packet', LIM_PACKET)
            if s.get('log') is not None:
                c.text(s['log'], sref, 'log', LIM_LOG)
            e = edges.get(s.get('edge')) if isinstance(s.get('edge'), str) else None
            if e is None:
                c.e(sref, 'edge', 'unknown edge id %r' % (s.get('edge'),))
                continue
            if not known(e.get('from'), reached):
                c.e(sref, 'edge', 'path is not connected: edge %r starts at %r, which no input node or earlier step reached'
                    % (e['id'], e.get('from')))
            if isinstance(e.get('to'), str):
                reached.add(e['to'])
        if end + 2 > MAX_CYCLE:
            c.e(ref, 'steps', 'cycle is %.1f s (max t+d plus 2 s), limit %d s' % (end + 2, MAX_CYCLE))

    # unplaced
    up = v.get('unplaced', [])
    if not isinstance(up, list):
        c.e('', 'unplaced', 'must be a list')
        up = []
    for i, u in enumerate(up):
        ref = 'unplaced:%d' % i
        if c.keys(u, ref, '', ('text', 'reason', 'src')):
            c.text(u.get('text'), ref, 'text', LIM_CARD)
            c.text(u.get('reason'), ref, 'reason', LIM_CARD)
            c.src_list(u.get('src'), ref, 'src', False, draft)


def validate_card(c, rep, n, ref, draft):
    card = n.get('card')
    if not c.keys(card, ref, 'card', ('actor', 'model', 'does', 'inputs', 'artifacts', 'gates', 'options', 'metrics', 'gaps', 'src')):
        return
    for k in ('actor', 'model', 'does'):
        c.text(card.get(k), ref, 'card.' + k, LIM_CARD)
    for k in ('inputs', 'artifacts', 'options'):
        v = card.get(k)
        if not isinstance(v, list):
            c.e(ref, 'card.' + k, 'must be a list')
            continue
        for i, item in enumerate(v):
            c.text(item, ref, 'card.%s[%d]' % (k, i), LIM_CARD)
    if n.get('kind') == 'human' and not card.get('options'):
        c.e(ref, 'card.options', 'a human stop must list its options')
    gates = card.get('gates')
    if not isinstance(gates, list):
        c.e(ref, 'card.gates', 'must be a list')
        gates = []
    for i, g in enumerate(gates):
        f = 'card.gates[%d]' % i
        if not c.keys(g, ref, f, ('rule', 'evidence', 'enforced_by', 'src')):
            continue
        rep.counts['gates'] += 1
        c.text(g.get('rule'), ref, f + '.rule', LIM_CARD)
        c.text(g.get('evidence'), ref, f + '.evidence', LIM_CARD)
        if g.get('enforced_by') not in ENFORCED:
            c.e(ref, f + '.enforced_by', 'must be one of %s' % ', '.join(ENFORCED))
        c.src_list(g.get('src'), ref, f + '.src', True, draft)
    metrics = card.get('metrics')
    if not isinstance(metrics, list):
        c.e(ref, 'card.metrics', 'must be a list')
        metrics = []
    for i, m in enumerate(metrics):
        f = 'card.metrics[%d]' % i
        if not c.keys(m, ref, f, ('name', 'value', 'as_of', 'src')):
            continue
        rep.counts['metrics'] += 1
        for k in ('name', 'value'):
            c.text(m.get(k), ref, f + '.' + k, LIM_CARD)
        try:
            datetime.date.fromisoformat(m.get('as_of'))
        except (TypeError, ValueError):
            c.e(ref, f + '.as_of', 'must be an ISO date YYYY-MM-DD')
        c.src_list(m.get('src'), ref, f + '.src', True, draft)
    gaps = card.get('gaps')
    if not isinstance(gaps, list):
        c.e(ref, 'card.gaps', 'must be a list')
        gaps = []
    for i, g in enumerate(gaps):
        f = 'card.gaps[%d]' % i
        if not c.keys(g, ref, f, ('text', 'kind', 'src')):
            continue
        rep.counts['gaps'] += 1
        c.text(g.get('text'), ref, f + '.text', LIM_CARD)
        if g.get('kind') not in GAP_KINDS:
            c.e(ref, f + '.kind', 'must be one of %s' % ', '.join(GAP_KINDS))
        c.src_list(g.get('src'), ref, f + '.src', True, draft)
    c.src_list(card.get('src'), ref, 'card.src', False, draft)


# ---- layout ------------------------------------------------------------------
def box(n):
    cx, cy = n['_pos']
    return (cx - NODE_FW / 2, cy - NODE_FH / 2, cx + NODE_FW / 2, cy + NODE_FH / 2)


def seg_hits_box(a, b, bx):
    """Does the open segment a-b pass through the open interior of the box?"""
    x0, y0, x1, y1 = bx
    if _eq(a[1], b[1]):   # horizontal
        return y0 + EPS < a[1] < y1 - EPS and max(a[0], b[0]) > x0 + EPS and min(a[0], b[0]) < x1 - EPS
    if _eq(a[0], b[0]):   # vertical
        return x0 + EPS < a[0] < x1 - EPS and max(a[1], b[1]) > y0 + EPS and min(a[1], b[1]) < y1 - EPS
    return True           # not orthogonal: reported separately


def on_boundary(p, bx):
    x0, y0, x1, y1 = bx
    inside = x0 - EPS <= p[0] <= x1 + EPS and y0 - EPS <= p[1] <= y1 + EPS
    edge = _eq(p[0], x0) or _eq(p[0], x1) or _eq(p[1], y0) or _eq(p[1], y1)
    return inside and edge


def check_layout(c, nodes, edges):
    ends = {}
    good = []
    for eid, e in edges.items():
        if not (known(e.get('from'), nodes) and known(e.get('to'), nodes) and e.get('exit') in SIDES
                and e.get('enter') in SIDES and e.get('_via_ok')):
            continue
        if '_pos' not in nodes[e['from']] or '_pos' not in nodes[e['to']]:
            continue
        good.append(e)
        ends.setdefault((e['from'], e['exit']), []).append(eid + '|exit')
        ends.setdefault((e['to'], e['enter']), []).append(eid + '|enter')
    for e in good:
        ref = 'edge:%s' % e['id']
        fn, tn = nodes[e['from']], nodes[e['to']]

        def anc(n, nid, side, role):
            lst = ends[(nid, side)]
            return anchor(n['_pos'], side, lst.index(e['id'] + '|' + role), len(lst))
        a0 = anc(fn, e['from'], e['exit'], 'exit')
        a1 = anc(tn, e['to'], e['enter'], 'enter')
        if not on_boundary(a0, box(fn)):
            c.e(ref, 'exit', 'start point is not on the boundary of node %r' % e['from'])
        if not on_boundary(a1, box(tn)):
            c.e(ref, 'enter', 'end point is not on the boundary of node %r' % e['to'])
        P = [a0] + [list(p) for p in e.get('via', [])] + [a1]
        for i in range(1, len(P) - 2):   # middle pairs must be aligned
            if not (_eq(P[i][0], P[i + 1][0]) or _eq(P[i][1], P[i + 1][1])):
                c.e(ref, 'via', 'via points %d and %d are not on one row or column' % (i, i + 1))
        pts = route(P, e['exit'], e['enter'])
        if len(pts) < 2:
            c.e(ref, 'exit/enter', 'edge has zero length')
            continue
        d0 = (pts[1][0] - pts[0][0], pts[1][1] - pts[0][1])
        nx = NORMAL[e['exit']]
        if not (d0[0] * nx[0] + d0[1] * nx[1] > EPS and abs(d0[0] * nx[1]) + abs(d0[1] * nx[0]) < EPS):
            c.e(ref, 'exit', 'first segment must leave node %r outward through its %r side' % (e['from'], e['exit']))
        d1 = (pts[-1][0] - pts[-2][0], pts[-1][1] - pts[-2][1])
        nx = NORMAL[e['enter']]
        if not (d1[0] * -nx[0] + d1[1] * -nx[1] > EPS and abs(d1[0] * nx[1]) + abs(d1[1] * nx[0]) < EPS):
            c.e(ref, 'enter', 'last segment must arrive at node %r inward through its %r side' % (e['to'], e['enter']))
        for i in range(len(pts) - 1):
            for nid, n in nodes.items():
                if '_pos' in n and seg_hits_box(pts[i], pts[i + 1], box(n)):
                    own = nid in (e['from'], e['to'])
                    c.e(ref, 'via' if e.get('via') else 'exit/enter',
                        'segment %d %s%s passes through %snode %r' % (
                            i + 1, [round(x, 3) for x in pts[i]], [round(x, 3) for x in pts[i + 1]],
                            'its own ' if own else 'the ', nid))


# ---- validate command --------------------------------------------------------
def cmd_validate(args):
    rep = Report()
    files = args.files
    if not files:
        files = [os.path.join(SPEC_DIR, v + '.js') for v in VIEW_IDS if os.path.exists(os.path.join(SPEC_DIR, v + '.js'))]
        for p in sorted(glob.glob(os.path.join(SPEC_DIR, '*.js'))):
            if os.path.splitext(os.path.basename(p))[0] not in VIEW_IDS:
                rep.err(os.path.relpath(p, ROOT), '-', '-', '-', 'not a known view file (expected one of %s)' % ', '.join(VIEW_IDS))
    if not files:
        rep.err('spec/', '-', '-', '-', 'no view files found')
    drafts = []
    for p in files:
        shown = os.path.relpath(p, os.getcwd()) if not os.path.isabs(p) or p.startswith(os.getcwd()) else p
        stem = os.path.splitext(os.path.basename(p))[0]
        obj, msg = load_view(p)
        if msg:
            rep.err(shown, stem, '-', 'wrapper', msg)
            continue
        if obj.get('draft') is True:
            drafts.append(stem)
        validate_view(rep, shown, stem, obj)
    for line in rep.errors:
        print(line)
    c = rep.counts
    print('views %d (draft: %s) · nodes %d · edges %d · scenarios %d · steps %d · gates %d · metrics %d · gaps %d'
          % (c['views'], ', '.join(drafts) or 'none', c['nodes'], c['edges'], c['scenarios'], c['steps'], c['gates'], c['metrics'], c['gaps']))
    print('citations checked %d · stale %d · errors %d' % (c['src'], c['stale'], len(rep.errors)))
    if drafts:
        print('note: draft views are exempt from the src-required rules; citations present are still checked')
    return 1 if rep.errors else 0


# ---- shoot command -----------------------------------------------------------
PNG_SIG, PNG_IEND = b'\x89PNG\r\n\x1a\n', b'\x00\x00\x00\x00IEND\xaeB`\x82'


def shot_problem(out, rc):
    """None when the capture counts as written, else the reason it does not.
    rc: Chrome's exit status, or None when we stopped it ourselves after the file was stable."""
    if rc not in (None, 0):
        return 'Chrome exited with status %d' % rc
    try:
        with open(out, 'rb') as f:
            data = f.read()
    except OSError:
        return 'no screenshot was written'
    if not data:
        return 'screenshot file is empty'
    if not data.startswith(PNG_SIG):
        return 'screenshot is not a PNG (bad signature)'
    if not data.endswith(PNG_IEND):
        return 'screenshot PNG is truncated (no IEND chunk)'
    return None


def chrome_cmd(udd, size, budget_ms):
    return [CHROME, '--headless=new', '--user-data-dir=' + udd, '--window-size=%s' % size,
            '--virtual-time-budget=%d' % budget_ms, '--hide-scrollbars', '--force-device-scale-factor=1']


def chrome_dom(url, size, budget_ms, timeout=60):
    """Loads url in headless Chrome and returns the serialized DOM (--dump-dom), or None when it
    never arrives. Chrome often keeps running after it printed the DOM, so the read ends at the
    closing </html>, at exit, or at the deadline, and the process group is then killed and reaped."""
    buf = b''
    with tempfile.TemporaryDirectory(prefix='pv-chrome-') as udd:
        proc = subprocess.Popen(chrome_cmd(udd, size, budget_ms) + ['--dump-dom', url], stdout=subprocess.PIPE,
                                stderr=subprocess.DEVNULL, start_new_session=True)
        try:
            deadline = time.time() + timeout
            fd = proc.stdout.fileno()
            while time.time() < deadline:
                ready, _, _ = select.select([fd], [], [], 0.5)
                if ready:
                    chunk = os.read(fd, 1 << 16)
                    if not chunk:
                        break
                    buf += chunk
                    if buf.rstrip().endswith(b'</html>'):
                        break
        finally:   # also on Ctrl-C and exceptions: the group never outlives this call
            try:
                os.killpg(proc.pid, signal.SIGKILL)
            except (ProcessLookupError, PermissionError):   # already gone (an exited leader can read as EPERM)
                pass
            proc.wait()
            proc.stdout.close()
    text = buf.decode('utf-8', errors='replace')
    return text if text.rstrip().endswith('</html>') else None


def chrome_shot(url, out, size, budget_ms):
    os.makedirs(os.path.dirname(out) or '.', exist_ok=True)
    if os.path.exists(out):
        os.remove(out)
    rc = None
    with tempfile.TemporaryDirectory(prefix='pv-chrome-') as udd:
        cmd = chrome_cmd(udd, size, budget_ms) + ['--screenshot=' + out, url]
        # headless Chrome often keeps running after it wrote the PNG: wait for a stable
        # file, then stop the whole process group instead of waiting for it to exit.
        proc = subprocess.Popen(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, start_new_session=True)
        stable = False
        try:
            deadline, last = time.time() + 120, -1
            while time.time() < deadline:
                time.sleep(0.5)
                size_now = os.path.getsize(out) if os.path.exists(out) else -1
                rc = proc.poll()
                if rc is not None:
                    break
                if size_now > 0 and size_now == last:
                    stable = True
                    break
                last = size_now
        finally:   # also on Ctrl-C and exceptions: the group never outlives this call
            try:
                os.killpg(proc.pid, signal.SIGKILL)
            except ProcessLookupError:
                pass
            proc.wait()
    problem = shot_problem(out, rc) if (rc is not None or stable) else 'Chrome timed out without a stable screenshot'
    if problem:
        print('FAIL (%s) %s' % (problem, url))
        return False
    print('wrote ' + out)
    return True


def shoot_width(cols):
    """Window width that shows a view of `cols` columns whole at scale 1 (viz.js MIN_SCALE)."""
    return max(MIN_SHOT_WIDTH, GUTTER_W + cols * CELL_W + CANVAS_PAD + WRAP_PAD)


class _HtmlAttrs(html.parser.HTMLParser):
    def __init__(self):
        super().__init__()
        self.attrs = None

    def handle_starttag(self, tag, attrs):
        if tag == 'html' and self.attrs is None:
            self.attrs = dict(attrs)


def html_attrs(dom):
    """The attributes of the dumped page's <html> element ({} when there is none). Never raises."""
    if not isinstance(dom, str):
        return {}
    p = _HtmlAttrs()
    try:
        p.feed(dom)
    except Exception:
        return {}
    return p.attrs or {}


def doc_height(dom):
    """The page's scrollHeight that frozen mode wrote on <html data-doc-h>, or None."""
    try:
        h = int(html_attrs(dom).get('data-doc-h'))
    except (TypeError, ValueError):
        return None
    return h if 0 < h < 20000 else None


def page_problem(dom, vid, need_height):
    """None when the dumped page rendered view `vid` without error, else the reason it did not.
    viz.js writes <html data-pv-view> once the view is built and data-pv-error for an uncaught error
    or a requested view that is unknown or not built."""
    if dom is None:
        return 'Chrome dumped no page'
    a = html_attrs(dom)
    if a.get('data-pv-error'):
        return 'page error: %s' % a['data-pv-error']
    if a.get('data-pv-view') != vid:
        return 'page rendered view %r, not %r' % (a.get('data-pv-view'), vid)
    if need_height and doc_height(dom) is None:
        return 'page reported no height (data-doc-h)'
    return None


def page_url(params):
    q = urllib.parse.urlencode([(k, v) for k, v in params if v not in (None, '')], quote_via=urllib.parse.quote)
    return pathlib.Path(ROOT, 'index.html').as_uri() + ('?' + q if q else '')


def shoot_one(url, out, vid, cols, args):
    """Probes the page first (--dump-dom): a view that errored or did not render is a FAIL and no PNG is written."""
    width = shoot_width(cols)
    dom = chrome_dom(url, '%d,400' % width, args.budget)
    problem = page_problem(dom, vid, not args.size)
    if problem:
        if os.path.exists(out):
            os.remove(out)   # a shot from an earlier run must not pass for this one
        print('FAIL (%s) %s' % (problem, url))
        return False
    return chrome_shot(url, out, args.size or '%d,%d' % (width, doc_height(dom) + 2), args.budget)


def built_view(vid):
    """(cols, None) for a view in the fixed table whose spec file loads, else (None, reason)."""
    if vid not in VIEW_IDS:
        return None, 'unknown view %r' % (vid,)
    path = os.path.join(SPEC_DIR, vid + '.js')
    if not os.path.exists(path):
        return None, 'view %r is not built yet (no spec/%s.js)' % (vid, vid)
    obj, msg = load_view(path)
    if msg:
        return None, 'view %r does not load: %s' % (vid, msg)
    cols = obj.get('cols')
    if not (isinstance(cols, int) and not isinstance(cols, bool) and 1 <= cols <= MAX_COLS):
        return None, 'view %r has no usable cols (1..%d)' % (vid, MAX_COLS)
    return cols, None


OVERLAYS = ('gaps', 'candidates', 'metrics')   # TWIN: viz.js OVERLAYS


def param_problem(vid, args):
    """None when --t, --overlay, --scenario and --card of a single shot all resolve in view `vid`, else
    the reason one does not (the page checks the same in frozen mode; this fails before Chrome starts)."""
    try:
        if not math.isfinite(float(args.t)):
            raise ValueError
    except (TypeError, ValueError):
        return '--t %r is not a number' % (args.t,)
    for o in (args.overlay or '').split(','):
        if o and o not in OVERLAYS:
            return 'unknown --overlay %r. Valid: %s' % (o, ', '.join(OVERLAYS))
    obj, _ = load_view(os.path.join(SPEC_DIR, vid + '.js'))
    scenarios = [s.get('id') for s in obj.get('scenarios') or [] if isinstance(s, dict)]
    nodes = [n.get('id') for n in obj.get('nodes') or [] if isinstance(n, dict)]
    if args.scenario and args.scenario not in scenarios:
        return 'unknown --scenario %r in view %s. Valid: %s' % (args.scenario, vid, ', '.join(map(str, scenarios)))
    if args.card and args.card not in nodes:
        return 'unknown --card %r in view %s. Valid: %s' % (args.card, vid, ', '.join(map(str, nodes)))
    return None


def cmd_shoot(args):
    shots = os.path.join(ROOT, 'shots')
    ok = True
    if not args.all:
        v = 'feature' if args.view is None else args.view
        cols, why = built_view(v)
        if why:
            print('FAIL (%s). Valid views: %s' % (why, ', '.join(VIEW_IDS)))
            return 1
        name = v + ('-' + args.overlay.replace(',', '+') if args.overlay else '') + ('-card-' + args.card if args.card else '')
        out = args.out or os.path.join(shots, name + '.png')
        why = param_problem(v, args)
        if why:
            if os.path.exists(out):
                os.remove(out)   # a shot from an earlier run must not pass for this one
            print('FAIL (%s)' % why)
            return 1
        url = page_url([('view', v), ('t', args.t), ('card', args.card), ('overlay', args.overlay), ('scenario', args.scenario)])
        return 0 if shoot_one(url, out, v, cols, args) else 1
    built = 0
    for vid in VIEW_IDS:
        p = os.path.join(SPEC_DIR, vid + '.js')
        if not os.path.exists(p):
            print('skip %s (not built yet)' % vid)
            continue
        cols, msg = built_view(vid)
        if msg:
            print('skip %s (%s)' % (vid, msg))
            ok = False
            continue
        obj, _ = load_view(p)
        built += 1
        steps = (obj.get('scenarios') or [{}])[0].get('steps') or [{'t': 0, 'd': 1}]
        cyc = max(s['t'] + s['d'] for s in steps) + 2
        t = '%.1f' % (cyc * 0.45)
        nodes = obj.get('nodes') or []
        pick = next((n for n in nodes if n.get('kind') == 'human'), nodes[0] if nodes else None)
        runs = [('plain', None, None), ('gaps', 'gaps', None), ('candidates', 'candidates', None), ('metrics', 'metrics', None)]
        if pick:
            runs.append(('card', None, pick['id']))
        for label, ov, card in runs:
            url = page_url([('view', vid), ('t', t), ('card', card), ('overlay', ov)])
            ok = shoot_one(url, os.path.join(shots, '%s-%s.png' % (vid, label)), vid, cols, args) and ok
    print('batch: %d built views' % built)
    return 0 if ok and built else 1


# ---- lint command ------------------------------------------------------------
LINT_WIDTHS = (1440,)         # extra window widths besides the view's default shoot width (a laptop browser)
LINT_HEIGHT = 900
MIN_SUB_PX = 9.0              # smallest node subtitle, in rendered pixels
LINT_NEED = ('view', 'scale', 'scenarios', 'frames', 'waits', 'minSubPx', 'overlaps', 'cardsClipped')


class _PreText(html.parser.HTMLParser):
    """Collects the text of the first element whose id is `want`."""
    def __init__(self, want):
        super().__init__(convert_charrefs=True)
        self.want, self.depth, self.parts, self.found = want, 0, [], False

    def handle_starttag(self, tag, attrs):
        if self.depth:
            self.depth += 1
        elif dict(attrs).get('id') == self.want and not self.found:
            self.depth, self.found = 1, True

    def handle_endtag(self, tag):
        if self.depth:
            self.depth -= 1

    def handle_data(self, data):
        if self.depth:
            self.parts.append(data)


def parse_lint(dom):
    """Returns (result dict, None) from a dumped DOM, or (None, reason). Never raises."""
    if not isinstance(dom, str):
        return None, 'no DOM was dumped'
    p = _PreText('pv-lint')
    try:
        p.feed(dom)
        p.close()
    except Exception as e:   # html.parser is lenient; stay total anyway
        return None, 'DOM did not parse: %s' % e
    if not p.found:
        return None, 'page wrote no lint result (script error or lint mode missing)'
    try:
        res = json.loads(''.join(p.parts))
    except ValueError as e:
        return None, 'lint result is not JSON: %s' % e
    if not isinstance(res, dict):
        return None, 'lint result is not an object'
    if 'error' in res:
        return None, 'page script failed: %s' % str(res['error']).split('\n')[0]
    missing = [k for k in LINT_NEED if k not in res]
    if missing:
        return None, 'lint result lacks %s' % ', '.join(missing)
    return res, None


def lint_problems(res, min_px=MIN_SUB_PX):
    """Every reason a parsed lint result is not clean: list of strings (empty = clean)."""
    out = ['%s: %s / %s' % (o.get('kind'), o.get('a'), o.get('b')) for o in res['overlaps']]
    out += ['card clipped: %s' % c for c in res['cardsClipped']]
    px = res['minSubPx']
    if not isinstance(px, (int, float)) or isinstance(px, bool) or not px >= min_px:   # NaN fails too
        out.append('subtitle font %s px, minimum %.1f' % (px, min_px))
    return out


def cmd_lint(args):
    bad, ran = 0, 0
    for vid in VIEW_IDS:
        if not os.path.exists(os.path.join(SPEC_DIR, vid + '.js')):
            print('skip %s (not built yet)' % vid)
            continue
        cols, why = built_view(vid)
        if why:
            ran += 1
            bad += 1
            print('%-8s FAIL %s' % (vid, why))
            continue
        widths = [int(w) for w in args.widths.split(',')] if args.widths else \
            sorted(set([shoot_width(cols)] + list(LINT_WIDTHS)))
        for w in widths:
            ran += 1
            url = page_url([('view', vid), ('lint', '1')])
            dom = chrome_dom(url, '%d,%d' % (w, LINT_HEIGHT), args.budget)
            res, why = parse_lint(dom)
            if res is not None:
                why = page_problem(dom, vid, False)
                res = res if why is None else None
            if res is None:
                print('%-8s width %4d  FAIL %s' % (vid, w, why))
                bad += 1
                continue
            probs = lint_problems(res)
            kinds = {}
            for o in res['overlaps']:
                kinds[o['kind']] = kinds.get(o['kind'], 0) + 1
            print('%-8s width %4d  scale %.2f  min subtitle %s px  frames %d  waits %d  overlaps %d%s  cards clipped %d'
                  % (vid, w, res['scale'], res['minSubPx'], res['frames'], res['waits'], len(res['overlaps']),
                     ' (%s)' % ', '.join('%s %d' % kv for kv in sorted(kinds.items())) if kinds else '',
                     len(res['cardsClipped'])))
            for line in probs:
                print('    ' + line)
            if probs:
                bad += 1
    print('lint: %d runs, %d with problems' % (ran, bad))
    return 1 if bad or not ran else 0


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest='cmd', required=True)
    v = sub.add_parser('validate')
    v.add_argument('files', nargs='*')
    s = sub.add_parser('shoot')
    s.add_argument('--all', action='store_true', help='batch mode')
    s.add_argument('--view')
    s.add_argument('--t', default='7')
    s.add_argument('--card')
    s.add_argument('--overlay', help='comma list of gaps, candidates, metrics')
    s.add_argument('--scenario')
    s.add_argument('--out')
    s.add_argument('--size', help='window size W,H (default: wide enough for the view\'s columns, tall enough for the page)')
    s.add_argument('--budget', type=int, default=4000, help='--virtual-time-budget in ms')
    li = sub.add_parser('lint')
    li.add_argument('--widths', help='comma list of window widths (default: the view\'s shoot width and 1440)')
    li.add_argument('--budget', type=int, default=4000, help='--virtual-time-budget in ms')
    args = ap.parse_args()
    sys.exit({'validate': cmd_validate, 'shoot': cmd_shoot, 'lint': cmd_lint}[args.cmd](args))


if __name__ == '__main__':
    main()
