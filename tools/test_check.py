#!/usr/bin/env python3
"""Tests for check.py (stdlib unittest). Run: python3 -I tools/test_check.py"""
import copy
import os
import stat
import struct
import subprocess
import sys
import tempfile
import time
import unittest
import urllib.parse
import urllib.request
import zlib
from unittest import mock

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import check  # noqa: E402

FIXTURE = os.path.join(check.SPEC_DIR, 'feature.js')


def png_bytes(w=1, h=1):
    def chunk(tag, data):
        return struct.pack('>I', len(data)) + tag + data + struct.pack('>I', zlib.crc32(tag + data) & 0xffffffff)
    raw = b''.join(b'\x00' + b'\x00\x00\x00' * w for _ in range(h))
    return (b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('>IIBBBBB', w, h, 8, 2, 0, 0, 0))
            + chunk(b'IDAT', zlib.compress(raw)) + chunk(b'IEND', b''))


def fixture():
    obj, msg = check.load_view(FIXTURE)
    assert msg is None, msg
    return obj


def validate(obj, stem='feature'):
    rep = check.Report()
    check.validate_view(rep, 'spec/%s.js' % stem, stem, obj)
    return rep.errors


class NonListContainers(unittest.TestCase):   # finding 1
    def test_non_list_nodes_edges_scenarios_are_errors(self):
        for field in ('nodes', 'edges', 'scenarios', 'lanes'):
            for junk in (None, {}, 'x', 5, True):
                with self.subTest(field=field, junk=junk):
                    obj = fixture()
                    obj[field] = junk
                    errs = validate(obj)
                    self.assertTrue(any(('→ %s:' % field) in e and 'must be a list' in e or
                                        ('→ %s:' % field) in e and 'non-empty list' in e for e in errs), errs)


class UnhashableIds(unittest.TestCase):   # finding 4
    def test_list_id_is_a_finding_not_a_crash(self):
        obj = fixture()
        obj['nodes'][0]['id'] = []
        errs = validate(obj)
        self.assertTrue(any('node:' in e and '→ id:' in e for e in errs), errs)

    def test_non_string_ids_everywhere(self):
        for where in (lambda o: o['lanes'][0], lambda o: o['nodes'][1], lambda o: o['edges'][0],
                      lambda o: o['scenarios'][0]):
            for junk in ([], {}, None, 5, ''):
                with self.subTest(junk=junk):
                    obj = fixture()
                    where(obj)['id'] = junk
                    self.assertTrue(validate(obj))
        for key, path in (('lane', lambda o: o['nodes'][0]), ('from', lambda o: o['edges'][0]),
                          ('to', lambda o: o['edges'][0]), ('edge', lambda o: o['scenarios'][0]['steps'][0])):
            with self.subTest(ref=key):
                obj = fixture()
                path(obj)[key] = []
                self.assertTrue(validate(obj))

    def test_fuzz_every_field_never_raises(self):
        base = fixture()
        junk = [[], {}, None, '', 'x', 5, -1, True, 1.5, float('nan'), float('inf'), 10 ** 400, ['a'], {'a': 1}]

        def paths(o, p=()):
            yield p
            if isinstance(o, dict):
                for k in o:
                    yield from paths(o[k], p + (k,))
            elif isinstance(o, list):
                for i, v in enumerate(o):
                    yield from paths(v, p + (i,))
        failures = []
        for p in paths(base):
            if not p:
                continue
            variants = [('set', j) for j in junk] + ([('del', None)] if isinstance(p[-1], str) else [])
            for how, j in variants:
                obj = copy.deepcopy(base)
                parent = obj
                for k in p[:-1]:
                    parent = parent[k]
                if how == 'del':
                    del parent[p[-1]]
                else:
                    parent[p[-1]] = copy.deepcopy(j)
                try:
                    validate(obj)
                except Exception as e:   # noqa: BLE001 - the point of the test
                    failures.append('%s %s %r -> %s: %s' % (how, '/'.join(map(str, p)), j, type(e).__name__, e))
        self.assertEqual(failures[:15], [], '%d crashes' % len(failures))


class NumericBounds(unittest.TestCase):   # stage-5 P2: validate never raises on a number
    HUGE = [1e308, -1e308, 1e300, 10 ** 308, -10 ** 308, 2 ** 1023, 1e-320, 0.25, -0.5000001, 1e15, -1e15]

    def test_via_out_of_grid_is_an_error_not_a_crash(self):
        for pt in ([1e308, 0], [0, 1e308], [-1e308, 0], [10 ** 308, 0], [0, -10 ** 308], [1e300, 1e300], [2 ** 1023, 0]):
            with self.subTest(via=pt):
                obj = fixture()
                obj['edges'][0]['via'] = [pt]
                errs = validate(obj)
                self.assertTrue(any('via[0]' in e and 'outside the grid' in e for e in errs), errs)

    def test_every_numeric_leaf_takes_huge_values_without_raising(self):
        base = fixture()
        base['edges'][0]['via'] = [[0, 0]]   # make sure a via point is among the numeric leaves

        def leaves(o, p=()):
            if isinstance(o, dict):
                for k in o:
                    yield from leaves(o[k], p + (k,))
            elif isinstance(o, list):
                for i, v in enumerate(o):
                    yield from leaves(v, p + (i,))
            elif isinstance(o, (int, float)) and not isinstance(o, bool):
                yield p
        paths = list(leaves(base))
        failures = []
        for p in paths:
            for j in self.HUGE:
                obj = copy.deepcopy(base)
                parent = obj
                for k in p[:-1]:
                    parent = parent[k]
                parent[p[-1]] = j
                try:
                    validate(obj)
                except Exception as e:   # noqa: BLE001 - the point of the test
                    failures.append('%s = %r -> %s: %s' % ('/'.join(map(str, p)), j, type(e).__name__, e))
        self.assertEqual(failures[:15], [], '%d crashes' % len(failures))

    def test_scenario_times_out_of_range_are_errors(self):
        for t, d in ((1e308, 1e308), (10 ** 308, 10 ** 308), (0, 1e308), (61, 1)):
            with self.subTest(t=t, d=d):
                obj = fixture()
                st = obj['scenarios'][0]['steps'][0]
                st['t'], st['d'] = t, d
                self.assertTrue(validate(obj))

    def test_user_supplied_private_key_is_not_trusted(self):
        obj = fixture()
        obj['nodes'][0]['_pos'] = 'x'
        obj['nodes'][0]['lane'] = 'no-such-lane'
        self.assertTrue(any('_pos' in e for e in validate(obj)))


class CitationPaths(unittest.TestCase):   # finding 6
    def test_unresolvable_tilde_user_is_an_error(self):
        for f in ('~nonexistent_user_zz/x', '~nonexistent_user_zz', '~/../../etc/passwd', '/etc/passwd',
                  '~/Dev/claude-code-setup/a\x00b'):
            with self.subTest(file=f):
                msg = check.check_citation({'file': f, 'line': 1, 'quote': 'x'})
                self.assertIsInstance(msg, str)

    def test_citation_error_reaches_a_finding(self):
        obj = fixture()
        s = obj['nodes'][0]['card']['src']
        s.append({'file': '~nonexistent_user_zz/x', 'line': 1, 'quote': 'q'})
        self.assertTrue(any('outside the three source roots' in e or 'absolute' in e for e in validate(obj)))


class PageUrl(unittest.TestCase):   # finding 2
    def test_round_trip_for_hostile_ids_and_checkout_path(self):
        ids = ['a&b', 'a+b', 'a#b', 'a b', 'a%26b', 'ü=1&x', 'q?z', 'a,b']
        with tempfile.TemporaryDirectory() as d:
            root = os.path.join(d, 'we ird#dir?x%20&y+z')
            for i in ids:
                with self.subTest(id=i), mock.patch.object(check, 'ROOT', root):
                    url = check.page_url([('view', 'feature'), ('t', '7.5'), ('card', i), ('overlay', 'gaps,metrics'),
                                          ('scenario', i), ('skipped', None), ('empty', '')])
                    u = urllib.parse.urlsplit(url)
                    self.assertEqual(u.scheme, 'file')
                    self.assertEqual(urllib.request.url2pathname(u.path), os.path.join(root, 'index.html'))
                    # same decoding as URLSearchParams: '+' is a space, so it must be encoded
                    q = dict(urllib.parse.parse_qsl(u.query, keep_blank_values=True))
                    self.assertEqual(q, {'view': 'feature', 't': '7.5', 'card': i, 'overlay': 'gaps,metrics',
                                         'scenario': i})
                    self.assertEqual(u.fragment, '')


class ShotSuccess(unittest.TestCase):   # finding 3
    def setUp(self):
        self.dir = tempfile.TemporaryDirectory()
        self.addCleanup(self.dir.cleanup)
        self.out = os.path.join(self.dir.name, 'o.png')

    def write(self, data):
        with open(self.out, 'wb') as f:
            f.write(data)

    def test_helper(self):
        self.assertIsNotNone(check.shot_problem(self.out, 0))          # missing
        self.write(b'')
        self.assertIsNotNone(check.shot_problem(self.out, 0))          # empty
        self.write(b'not a png at all, but not empty')
        self.assertIsNotNone(check.shot_problem(self.out, 0))          # bad signature
        self.write(png_bytes(8, 8)[:-20])
        self.assertIsNotNone(check.shot_problem(self.out, 0))          # truncated
        self.write(png_bytes(8, 8))
        self.assertIsNone(check.shot_problem(self.out, 0))             # exited 0
        self.assertIsNone(check.shot_problem(self.out, None))          # we stopped it after the file was stable
        self.assertIsNotNone(check.shot_problem(self.out, 3))          # Chrome failed

    def fake_chrome(self, mode):
        path = os.path.join(self.dir.name, 'chrome-' + mode)
        with open(path, 'w') as f:
            f.write('''#!%s
import sys, time
out = [a.split('=', 1)[1] for a in sys.argv if a.startswith('--screenshot=')][0]
png = %r
mode = %r
if mode == 'truncated':
    open(out, 'wb').write(png[:-20]); sys.exit(0)
if mode == 'empty':
    open(out, 'wb').write(b''); sys.exit(0)
open(out, 'wb').write(png)
if mode == 'fail':
    sys.exit(3)
if mode == 'hang':
    time.sleep(300)
''' % (sys.executable, png_bytes(8, 8), mode))
        os.chmod(path, os.stat(path).st_mode | stat.S_IXUSR)
        return path

    def shoot(self, mode, out=None):
        with mock.patch.object(check, 'CHROME', self.fake_chrome(mode)):
            return check.chrome_shot('file:///x', out or self.out, '10,10', 100)

    def test_chrome_shot_outcomes(self):
        self.assertFalse(self.shoot('truncated'))
        self.assertFalse(self.shoot('empty'))
        self.assertFalse(self.shoot('fail'))
        self.assertTrue(self.shoot('hang'))      # stays alive after writing: stopped by us, file is good

    def test_bare_out_file_name(self):   # finding 5
        old = os.getcwd()
        os.chdir(self.dir.name)
        try:
            self.assertTrue(self.shoot('hang', out='frame.png'))
            self.assertTrue(os.path.exists('frame.png'))
        finally:
            os.chdir(old)


class ShootChecksThePage(unittest.TestCase):   # stage-5 P2: a shot needs a known, built view and an error-free page
    GOOD = '<html data-pv-view="%s" data-doc-h="700"><body></body></html>'

    def setUp(self):
        self.dir = tempfile.TemporaryDirectory()
        self.addCleanup(self.dir.cleanup)
        self.out = os.path.join(self.dir.name, 'o.png')
        self.log = os.path.join(self.dir.name, 'calls')

    def fake_chrome(self, dom):
        path = os.path.join(self.dir.name, 'chrome')
        with open(path, 'w') as f:
            f.write('''#!%s
import sys
open(%r, 'a').write(' '.join(sys.argv[1:]) + '\\n')
if '--dump-dom' in sys.argv:
    sys.stdout.write(%r)
    sys.exit(0)
out = [a.split('=', 1)[1] for a in sys.argv if a.startswith('--screenshot=')][0]
open(out, 'wb').write(%r)
''' % (sys.executable, self.log, dom, png_bytes(8, 8)))
        os.chmod(path, os.stat(path).st_mode | stat.S_IXUSR)
        return path

    def args(self, **kw):
        a = dict(all=False, view='feature', t='7', card=None, overlay=None, scenario=None, out=self.out, size=None, budget=100)
        a.update(kw)
        return type('A', (), a)()

    def shoot(self, dom, spec_dir=None, **kw):
        with mock.patch.object(check, 'CHROME', self.fake_chrome(dom)), \
                mock.patch.object(check, 'SPEC_DIR', spec_dir or check.SPEC_DIR), \
                mock.patch('sys.stdout') as so:
            rc = check.cmd_shoot(self.args(**kw))
        return rc, ''.join(c.args[0] for c in so.write.call_args_list)

    def calls(self):
        return open(self.log).read() if os.path.exists(self.log) else ''

    def test_good_page_writes_the_png(self):
        rc, _ = self.shoot(self.GOOD % 'feature')
        self.assertEqual(rc, 0)
        self.assertIsNone(check.shot_problem(self.out, 0))
        self.assertIn('--window-size=%d,702' % check.shoot_width(check.built_view('feature')[0]), self.calls())

    def test_size_override_still_probes_the_page(self):
        rc, _ = self.shoot('<html data-pv-error="boom"></html>', size='900,500')
        self.assertEqual(rc, 1)
        self.assertFalse(os.path.exists(self.out))

    def test_unknown_view_exits_nonzero_and_lists_the_views_without_launching_chrome(self):
        for bad in ('featur', 'constructor', '../feature', '2', ''):
            with self.subTest(view=bad):
                rc, out = self.shoot(self.GOOD % 'feature', view=bad)
                self.assertNotEqual(rc, 0)
                for vid in check.VIEW_IDS:
                    self.assertIn(vid, out)
                self.assertEqual(self.calls(), '')
                self.assertFalse(os.path.exists(self.out))

    def test_unbuilt_view_exits_nonzero(self):
        empty = os.path.join(self.dir.name, 'spec')
        os.mkdir(empty)
        rc, out = self.shoot(self.GOOD % 'feature', spec_dir=empty)
        self.assertNotEqual(rc, 0)
        self.assertIn('not built', out)
        self.assertEqual(self.calls(), '')

    def test_page_error_fails_and_leaves_no_stale_png(self):
        with open(self.out, 'wb') as f:
            f.write(png_bytes(2, 2))     # a shot from an earlier run must not pass for this one
        rc, out = self.shoot('<html data-pv-view="feature" data-doc-h="700" data-pv-error="TypeError: x is undefined"></html>')
        self.assertEqual(rc, 1)
        self.assertIn('TypeError', out)
        self.assertFalse(os.path.exists(self.out))
        self.assertNotIn('--screenshot', self.calls())

    def test_page_that_rendered_another_view_or_none_fails(self):
        for dom in (self.GOOD % 'meta', '<html data-doc-h="700"></html>', ''):
            with self.subTest(dom=dom):
                rc, _ = self.shoot(dom)
                self.assertEqual(rc, 1)
                self.assertFalse(os.path.exists(self.out))

    def test_batch_fails_when_a_page_errors(self):
        spec = os.path.join(self.dir.name, 'spec')
        os.mkdir(spec)
        with open(FIXTURE) as src, open(os.path.join(spec, 'feature.js'), 'w') as dst:
            dst.write(src.read())
        with mock.patch.object(check, 'ROOT', self.dir.name):
            rc, _ = self.shoot('<html data-pv-error="boom" data-doc-h="700"></html>', spec_dir=spec, all=True)
        self.assertEqual(rc, 1)
        self.assertEqual([f for f in os.listdir(os.path.join(self.dir.name, 'shots'))] if os.path.isdir(os.path.join(self.dir.name, 'shots')) else [], [])

    def test_bad_params_exit_nonzero_name_the_param_and_launch_no_chrome(self):   # round-2 P2: no silent fallback
        obj, _ = check.load_view(os.path.join(check.SPEC_DIR, 'feature.js'))
        for param, bad, kw in (('scenario', 'nonexistent', {'scenario': 'nonexistent'}),
                               ('scenario', 'constructor', {'scenario': 'constructor'}),
                               ('card', 'nonexistent', {'card': 'nonexistent'}),
                               ('card', '__proto__', {'card': '__proto__'}),
                               ('overlay', 'gapz', {'overlay': 'gapz'}),
                               ('overlay', 'frob', {'overlay': 'gaps,frob'}),
                               ('t', 'soon', {'t': 'soon'}), ('t', 'nan', {'t': 'nan'})):
            with self.subTest(param=param, bad=bad):
                with open(self.out, 'wb') as f:
                    f.write(png_bytes(2, 2))     # a shot from an earlier run must not pass for this one
                rc, out = self.shoot(self.GOOD % 'feature', **kw)
                self.assertEqual(rc, 1)
                self.assertIn('--' + param, out)
                self.assertIn(bad, out)
                self.assertEqual(self.calls(), '')
                self.assertFalse(os.path.exists(self.out))

    def test_good_params_still_shoot(self):
        obj, _ = check.load_view(os.path.join(check.SPEC_DIR, 'feature.js'))
        rc, out = self.shoot(self.GOOD % 'feature', scenario=obj['scenarios'][-1]['id'], card=obj['nodes'][-1]['id'],
                             overlay='gaps,candidates,metrics', t='7.8')
        self.assertEqual(rc, 0, out)
        self.assertIsNone(check.shot_problem(self.out, 0))

    def test_page_problem_helper(self):
        self.assertIsNone(check.page_problem(self.GOOD % 'feature', 'feature', True))
        self.assertIsNone(check.page_problem('<html data-pv-view="feature"></html>', 'feature', False))
        self.assertIn('height', check.page_problem('<html data-pv-view="feature"></html>', 'feature', True))
        self.assertIn('boom', check.page_problem('<html data-pv-error="boom"></html>', 'feature', False))
        self.assertTrue(check.page_problem(None, 'feature', False))


@unittest.skipUnless(os.environ.get('PV_REAL_CHROME') == '1',
                     'launches real Chrome; run it as: PV_REAL_CHROME=1 python3 -I -m unittest discover -s tools -p test_check.py -k InheritedPropertyIds')
class InheritedPropertyIds(unittest.TestCase):
    """A node, edge or lane id that is also an Object.prototype property must render with no page error."""
    IDS = ('constructor', '__proto__', 'hasOwnProperty', 'toString', 'valueOf')

    def test_renders_in_real_chrome(self):
        with tempfile.TemporaryDirectory() as d:
            for rel in ('index.html', 'viz.js', 'tools/check.py'):
                os.makedirs(os.path.dirname(os.path.join(d, rel)), exist_ok=True)
                with open(os.path.join(check.ROOT, rel), 'rb') as src, open(os.path.join(d, rel), 'wb') as dst:
                    dst.write(src.read())
            obj = fixture()
            ren = {obj['nodes'][i]['id']: self.IDS[i] for i in range(3)}
            ren[obj['edges'][0]['id']] = self.IDS[3]
            ren[obj['lanes'][0]['id']] = self.IDS[4]
            for n in obj['nodes']:
                n['id'] = ren.get(n['id'], n['id'])
                n['lane'] = ren.get(n['lane'], n['lane'])
            for e in obj['edges']:
                e['id'], e['from'], e['to'] = (ren.get(e[k], e[k]) for k in ('id', 'from', 'to'))
            for ln in obj['lanes']:
                ln['id'] = ren.get(ln['id'], ln['id'])
            for sc in obj['scenarios']:
                for st in sc['steps']:
                    st['edge'] = ren.get(st['edge'], st['edge'])
            os.makedirs(os.path.join(d, 'spec'))
            import json
            with open(os.path.join(d, 'spec', 'feature.js'), 'w') as f:
                f.write(check.WRAP_PREFIX + json.dumps(obj, indent=1) + check.WRAP_SUFFIX)
            tool = os.path.join(d, 'tools', 'check.py')
            lint = subprocess.run([sys.executable, '-I', tool, 'lint'], capture_output=True, text=True, timeout=300)
            self.assertEqual(lint.returncode, 0, lint.stdout + lint.stderr)
            self.assertIn('lint: 2 runs, 0 with problems', lint.stdout)
            out = os.path.join(d, 'o.png')
            shot = subprocess.run([sys.executable, '-I', tool, 'shoot', '--view', 'feature', '--card', self.IDS[0], '--out', out],
                                  capture_output=True, text=True, timeout=300)
            self.assertEqual(shot.returncode, 0, shot.stdout + shot.stderr)
            self.assertIsNone(check.shot_problem(out, 0))


@unittest.skipUnless(os.environ.get('PV_REAL_CHROME') == '1',
                     'launches real Chrome; run it as: PV_REAL_CHROME=1 python3 -I -m unittest discover -s tools -p test_check.py -k FrozenParamsInRealChrome')
class FrozenParamsInRealChrome(unittest.TestCase):
    """round-2 P2: in frozen mode a URL param that does not resolve sets data-pv-error naming it; the live page ignores it."""
    def dom(self, **params):
        return check.chrome_dom(check.page_url([('view', 'feature')] + list(params.items())), '1400,500', 4000)

    def test_bad_params_set_a_named_error(self):
        for param, bad in (('scenario', 'nonexistent'), ('card', 'nonexistent'), ('overlay', 'gaps,gapz'), ('t', 'soon')):
            with self.subTest(param=param):
                err = check.html_attrs(self.dom(**{'t': '7', param: bad})).get('data-pv-error', '')
                self.assertIn(param, err)
                self.assertIn(bad.split(',')[-1], err)

    def test_good_params_and_the_live_page_have_no_error(self):
        self.assertIsNone(check.html_attrs(self.dom(t='7', card='appr', overlay='gaps,metrics', scenario='a')).get('data-pv-error'))
        a = check.html_attrs(self.dom(scenario='nonexistent', card='nonexistent', overlay='gapz'))   # no t: live page
        self.assertIsNone(a.get('data-pv-error'))
        self.assertEqual(a.get('data-pv-view'), 'feature')


class ChromeAlwaysReaped(unittest.TestCase):   # finding 7
    def run_interrupted(self, exc):
        d = tempfile.TemporaryDirectory()
        self.addCleanup(d.cleanup)
        pidfile = os.path.join(d.name, 'pid')
        script = os.path.join(d.name, 'chrome')
        with open(script, 'w') as f:
            f.write('#!/bin/sh\nsleep 300 &\necho $! > "%s"\nwait\n' % pidfile)
        os.chmod(script, 0o755)
        real_sleep = time.sleep

        def interrupt(_s):
            for _ in range(100):             # let the child write its pid first
                if os.path.exists(pidfile) and os.path.getsize(pidfile):
                    break
                real_sleep(0.05)
            raise exc

        def alive(pid):
            try:
                os.kill(pid, 0)
                return True
            except ProcessLookupError:
                return False
        with mock.patch.object(check, 'CHROME', script), mock.patch.object(check.time, 'sleep', interrupt):
            with self.assertRaises(type(exc)):
                check.chrome_shot('file:///x', os.path.join(d.name, 'o.png'), '10,10', 100)
        pid = int(open(pidfile).read())
        for _ in range(60):
            if not alive(pid):
                break
            real_sleep(0.05)
        still = alive(pid)
        if still:
            os.kill(pid, 9)                  # do not leak the test's own sleeper
        self.assertFalse(still, 'Chrome process group survived')

    def test_ctrl_c(self):
        self.run_interrupted(KeyboardInterrupt())

    def test_exception(self):
        self.run_interrupted(RuntimeError('boom'))


class LintResult(unittest.TestCase):   # lint-mode parsing and the pass rule
    GOOD = {'view': 'feature', 'scale': 1.0, 'scenarios': 2, 'frames': 9, 'waits': 3, 'minSubPx': 9.5,
            'overlaps': [], 'cardsClipped': []}

    def dom(self, payload, id_='pv-lint', pre=''):
        import json
        return ('<html data-doc-h="700"><body>%s<pre id="%s">%s</pre><pre id="other">x</pre></body></html>'
                % (pre, id_, json.dumps(payload).replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')))

    def test_parses_a_dumped_dom(self):
        res, why = check.parse_lint(self.dom(self.GOOD))
        self.assertIsNone(why)
        self.assertEqual(res['view'], 'feature')
        self.assertEqual(check.lint_problems(res), [])

    def test_escaped_text_survives(self):
        bad = dict(self.GOOD, overlaps=[{'kind': 'packet-text', 'a': 'packet "a<b & c>"', 'b': 'node x t'}])
        res, why = check.parse_lint(self.dom(bad))
        self.assertIsNone(why)
        self.assertEqual(res['overlaps'][0]['a'], 'packet "a<b & c>"')

    def test_problems_are_reported(self):
        bad = dict(self.GOOD, minSubPx=7.26, cardsClipped=['appr + gaps'],
                   overlaps=[{'kind': 'wait-edge', 'a': 'wait appr', 'b': 'edge e1'}])
        probs = check.lint_problems(bad)
        self.assertEqual(len(probs), 3, probs)
        self.assertTrue(any('wait-edge' in p for p in probs))
        self.assertTrue(any('card clipped' in p for p in probs))
        self.assertTrue(any('7.26' in p for p in probs))
        for junk in (None, 'x', True, float('nan')):   # a missing or non-numeric font size never passes
            self.assertTrue(check.lint_problems(dict(self.GOOD, minSubPx=junk)), junk)

    def test_unusable_dumps_are_failures_not_crashes(self):
        for dom in (None, '', '<html></html>', '<pre id="pv-lint">not json</pre>', '<pre id="pv-lint">[1]</pre>',
                    '<pre id="pv-lint">{"error": "boom\\nstack"}</pre>', self.dom({'view': 'x'}),
                    '<pre id="pv-lint"><b>', 5):
            with self.subTest(dom=dom):
                res, why = check.parse_lint(dom)
                self.assertIsNone(res)
                self.assertTrue(why)

    def test_first_element_with_the_id_wins_and_nested_markup_is_ignored(self):
        import json
        dom = '<pre id="pv-lint">%s</pre><pre id="pv-lint">{}</pre>' % json.dumps(self.GOOD)
        self.assertIsNotNone(check.parse_lint(dom)[0])

    def test_doc_height_and_shoot_width(self):
        self.assertEqual(check.doc_height(self.dom(self.GOOD)), 700)
        for dom in (None, '<html></html>', '<html data-doc-h="x">', '<html data-doc-h="0">', '<html data-doc-h="99999999">'):
            self.assertIsNone(check.doc_height(dom), dom)
        self.assertGreater(check.shoot_width(16), check.shoot_width(11))
        self.assertGreaterEqual(check.shoot_width(1), check.MIN_SHOT_WIDTH)
        self.assertEqual(check.shoot_width(16), check.GUTTER_W + 16 * check.CELL_W + check.CANVAS_PAD + check.WRAP_PAD)


class ChromeDomBounded(unittest.TestCase):   # a Chrome that never exits is a failure, not a hang
    def run_fake(self, body, timeout):
        d = tempfile.TemporaryDirectory()
        self.addCleanup(d.cleanup)
        script = os.path.join(d.name, 'chrome')
        with open(script, 'w') as f:
            f.write('#!/bin/sh\n' + body)
        os.chmod(script, 0o755)
        with mock.patch.object(check, 'CHROME', script):
            t0 = time.time()
            out = check.chrome_dom('file:///x', '10,10', 100, timeout=timeout)
            return out, time.time() - t0

    def test_prints_dom_then_lingers(self):
        out, took = self.run_fake('echo "<html></html>"\nsleep 300\n', 30)
        self.assertEqual(out.strip(), '<html></html>')
        self.assertLess(took, 10)

    def test_never_prints(self):
        out, took = self.run_fake('sleep 300\n', 2)
        self.assertIsNone(out)
        self.assertLess(took, 10)

    def test_exits_without_a_dom(self):
        out, _ = self.run_fake('echo partial\n', 30)
        self.assertIsNone(out)


if __name__ == '__main__':
    unittest.main()
