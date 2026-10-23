#!/usr/bin/env python3
"""pipeline-viz citation re-pointer. Python 3 stdlib only.

  repoint.py        re-point every STALE citation in spec/*.js whose quote now sits in exactly one place

check.py's matcher is a +-5-line window test: it says a quote is not near its line, never where it went.
This tool adds the locator. The whole cited file is collapsed with check.collapse (the matcher's own
whitespace rule), the collapsed quote is searched in it, and a single hit's offset maps back to the line
it starts on. One hit -> that src's `line` is rewritten. No hit, or several -> the src is left alone and
listed, for the step that rewrites quotes. Only `line` ever changes. Run it on specs whose only errors
are STALE ones (see `check.py validate`); a citation that passes the window test is never touched.

Specs go back through load_spec/save_spec: wrapper, indent and escape mode are kept, and load_spec
refuses a spec that does not re-serialize byte-identical, so a write changes only what the caller changed.
"""
import argparse
import bisect
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import check  # noqa: E402


# ---- writer ------------------------------------------------------------------
def dump(obj, fmt):
    return (check.WRAP_PREFIX + json.dumps(obj, **fmt) + check.WRAP_SUFFIX).encode('utf-8')


def load_spec(path):
    """(obj, fmt): the spec, and the json.dumps settings that reproduce its bytes exactly.
    Exits when no indent/escape mode does, so nothing is ever rewritten from a lossy parse."""
    obj, err = check.load_view(path)
    if err:
        sys.exit('%s: %s' % (path, err))
    with open(path, 'rb') as f:
        raw = f.read()
    inner = raw.decode('utf-8')[len(check.WRAP_PREFIX):].partition('\n')[2]   # text after the outer "{"
    indent = inner[:len(inner) - len(inner.lstrip(' \t'))]
    for ensure_ascii in (True, False):
        fmt = dict(indent=indent, ensure_ascii=ensure_ascii)
        if dump(obj, fmt) == raw:
            return obj, fmt
    sys.exit('%s: does not re-serialize byte-identical in any indent/escape mode; nothing was written' % path)


def save_spec(path, obj, fmt):
    with open(path, 'wb') as f:
        f.write(dump(obj, fmt))


# ---- citations in a spec -----------------------------------------------------
def walk(node, path=()):
    """Yields (path, list) for every `src` key in the spec. check.py accepts that key only
    where a citation belongs, so no list of places is needed here."""
    if isinstance(node, dict):
        for k, v in node.items():
            if k == 'src':
                yield path + (k,), v
            else:
                yield from walk(v, path + (k,))
    elif isinstance(node, list):
        for i, v in enumerate(node):
            yield from walk(v, path + (i,))


def where(view, path):
    """(ref, field) in check.py's naming: node:<id> / edge:<id> / unplaced:<i>, then the path inside it."""
    top, i = path[0], path[1]
    if top == 'unplaced':
        ref = 'unplaced:%d' % i
    else:
        ref = '%s:%s' % ('node' if top == 'nodes' else 'edge', view[top][i]['id'])
    field = ''
    for p in path[2:]:
        if isinstance(p, int):
            field += '[%d]' % p
        else:
            field += ('.' if field else '') + p
    return ref, field


# ---- locator -----------------------------------------------------------------
_index = {}


def collapsed_file(path):
    """(text, starts, nums): the file collapsed to one whitespace-normalized string, where each
    non-blank line starts at starts[k] in it and is line nums[k]. ' '.join of the per-line
    collapses is check.collapse of the whole file: the same tokens, one space between."""
    if path not in _index:
        # check._lines is the matcher's own cached reader, so both see the same text
        pieces = [(n, check.collapse(line)) for n, line in enumerate(check._lines(path), 1)]
        pieces = [(n, c) for n, c in pieces if c]
        starts, off = [], 0
        for _, c in pieces:
            starts.append(off)
            off += len(c) + 1
        _index[path] = (' '.join(c for _, c in pieces), starts, [n for n, _ in pieces])
    return _index[path]


def locate(src):
    """The 1-based line each occurrence of src's collapsed quote starts on in its whole file (overlaps counted)."""
    text, starts, nums = collapsed_file(os.path.normpath(os.path.expanduser(src['file'])))
    q = check.collapse(src['quote'])
    lines, i = [], text.find(q)
    while i != -1:
        lines.append(nums[bisect.bisect_right(starts, i) - 1])
        i = text.find(q, i + 1)
    return lines


def repoint_view(view, shown):
    """Rewrites `line` on each stale citation of one view that has exactly one hit.
    Returns (citations, stale, log lines of the rewrites, log lines of the citations left for later)."""
    n_src = n_stale = 0
    done, left = [], []
    for path, srcs in walk(view):
        ref, field = where(view, path)
        for j, src in enumerate(srcs):
            n_src += 1
            msg = check.check_citation(src)
            if not (msg and msg.startswith('STALE')):
                continue
            n_stale += 1
            at = '%s → %s → %s → %s[%d]' % (shown, view['id'], ref, field, j)
            old, hits = src['line'], locate(src)
            if len(hits) == 1:
                src['line'] = hits[0]
                if check.check_citation(src) is None:
                    done.append('REPOINT %s: %s:%d → %d' % (at, src['file'], old, hits[0]))
                    continue
                src['line'] = old   # the quote starts there but runs past the +-5 window: not a fix
                why = 'one hit at line %d, but the quote does not fit the ±%d window there' % (hits[0], check.QUOTE_WINDOW)
            elif hits:
                why = '%d hits (lines %s)' % (len(hits), ', '.join(map(str, hits)))
            else:
                why = 'no hit'
            left.append('UNRESOLVED %s: %s in %s (cited line %d): %s'
                        % (at, why, src['file'], old, json.dumps(src['quote'], ensure_ascii=False)))
    return n_src, n_stale, done, left


def main():
    argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter).parse_args()
    paths = [os.path.join(check.SPEC_DIR, v + '.js') for v in check.VIEW_IDS]
    specs = []
    for p in filter(os.path.exists, paths):   # every spec must round-trip before any of them is edited
        obj, fmt = load_spec(p)
        specs.append((p, obj, fmt))
        print('round-trip ok: %s (indent %r, ensure_ascii %s)' % (os.path.relpath(p, check.ROOT), fmt['indent'], fmt['ensure_ascii']))
    n_src = n_stale = n_done = n_left = 0
    for p, view, fmt in specs:
        shown = os.path.relpath(p, check.ROOT)
        s, st, done, left = repoint_view(view, shown)
        for line in done + left:
            print(line)
        if done:
            save_spec(p, view, fmt)
            print('wrote %s (%d lines re-pointed)' % (shown, len(done)))
        n_src, n_stale, n_done, n_left = n_src + s, n_stale + st, n_done + len(done), n_left + len(left)
    print('citations %d · stale %d · repointed %d · unresolved %d' % (n_src, n_stale, n_done, n_left))


if __name__ == '__main__':
    main()
