#!/usr/bin/env python3
"""Tests for check.py (stdlib unittest). Run: python3 -I tools/test_check.py"""
import contextlib
import copy
import io
import json
import pathlib
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
import repoint  # noqa: E402

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


GIT_ENV = dict(os.environ, GIT_CONFIG_GLOBAL=os.devnull, GIT_CONFIG_SYSTEM=os.devnull, GIT_CONFIG_NOSYSTEM='1')


class KitRepo(unittest.TestCase):
    """A temp git repo standing in for the kit: check.KIT points at it, nothing is written outside its temp dir."""
    LINES = ['alpha'] + ['filler %d' % i for i in range(30)] + ['beta quote here'] + ['tail %d' % i for i in range(5)]

    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.repo = os.path.join(self.tmp.name, 'kit')
        os.mkdir(self.repo)
        self.git('init', '-q')
        self.sha1 = self.commit('docs/a.md', self.LINES, 'one')
        patch = mock.patch.object(check, 'KIT', self.repo)
        patch.start()
        self.addCleanup(patch.stop)

    def git(self, *args):
        r = subprocess.run(['git', '-c', 'user.name=t', '-c', 'user.email=t@example.invalid', '-c', 'commit.gpgsign=false',
                            '-C', self.repo] + list(args), capture_output=True, text=True, env=GIT_ENV)
        self.assertEqual(r.returncode, 0, r.stderr)
        return r.stdout.strip()

    def commit(self, rel, lines, msg):
        path = os.path.join(self.repo, rel)
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, 'w') as f:
            f.write('\n'.join(lines) + '\n')
        self.git('add', rel)
        self.git('commit', '-q', '-m', msg)
        return self.git('rev-parse', 'HEAD')[:10]

    def commit_raw(self, rel, text, msg):
        path = os.path.join(self.repo, rel)
        with open(path, 'w', newline='') as f:
            f.write(text)
        self.git('add', rel)
        self.git('commit', '-q', '-m', msg)
        return self.git('rev-parse', 'HEAD')[:10]

    def cite(self, f='docs/a.md', line=32, quote='beta quote here', **kw):
        return check.check_citation({'file': f, 'line': line, 'quote': quote}, kw.get('sha', self.sha1))


class CitationPaths(KitRepo):   # finding 6: a citation is a kit-relative path read at the stamp
    def test_relative_path_is_accepted_and_a_stale_quote_is_not(self):
        self.assertIsNone(self.cite())
        self.assertIsNone(self.cite(line=30))   # inside the +-5 window
        self.assertTrue(self.cite(line=1).startswith('STALE'))
        self.assertIn('outside the file', self.cite(line=999))

    def test_lines_are_counted_as_github_numbers_them(self):
        # a final newline ends the last line and starts no new one; a partial last line still counts; an empty file has none
        cases = [('final newline', 'one\ntwo quote\n', 2), ('no final newline', 'one\ntwo quote', 2),
                 ('crlf', 'one\r\ntwo quote\r\n', 2), ('form feed is no line end', 'one\x0c\ntwo quote\n', 2),
                 ('one blank line', '\n', 1), ('empty', '', 0)]
        for name, text, count in cases:
            with self.subTest(case=name):
                sha = self.commit_raw('docs/a.md', text, name)
                self.assertEqual(len(check.kit_lines(sha, 'docs/a.md')[0]), count)
                msg = self.cite(line=count + 1, quote='quote', sha=sha)
                self.assertIn('outside the file (%d line' % count, msg)
                if count > 1:
                    self.assertIsNone(self.cite(line=count, quote='quote', sha=sha))

    def test_bad_paths_are_errors_and_never_reach_git(self):
        bad = ['/etc/passwd', '/', '~/Dev/claude-code-setup/docs/a.md', '~nonexistent_user_zz/x', '~', '../x', 'docs/../../x',
               'a/..', '..', 'docs//a.md', './docs/a.md', 'docs/./a.md', 'docs/', '', 'docs/a\x00b', '\x00', 'a\ud800b']
        with mock.patch.object(check, '_git') as git:
            for f in bad:
                with self.subTest(file=f):
                    msg = self.cite(f=f)
                    self.assertIsInstance(msg, str)
                    self.assertNotIn('STALE', msg)
            git.assert_not_called()
        self.assertIn('relative to the kit root', self.cite(f='/etc/passwd'))
        self.assertIn('relative to the kit root', self.cite(f='~/x'))
        self.assertIn('".." segment', self.cite(f='docs/../x'))
        self.assertIn('NUL', self.cite(f='docs/a\x00b'))

    def test_file_absent_at_the_stamp(self):
        self.assertIn('does not exist at kit_sha %s' % self.sha1, self.cite(f='docs/missing.md'))
        self.assertIn('does not exist at kit_sha', self.cite(f='docs'))   # a directory is not a cited file
        sha2 = self.commit('docs/b.md', ['new file'], 'two')
        self.assertIsNone(self.cite(f='docs/b.md', line=1, quote='new file', sha=sha2))
        self.assertIn('does not exist at kit_sha', self.cite(f='docs/b.md', line=1, quote='new file', sha=self.sha1))

    def test_the_stamp_decides_not_the_working_tree(self):
        with open(os.path.join(self.repo, 'docs/a.md'), 'w') as f:
            f.write('working tree edit\n')
        self.assertIsNone(self.cite())
        os.remove(os.path.join(self.repo, 'docs/a.md'))
        self.assertIsNone(self.cite())

    def test_unknown_sha_names_it(self):
        msg = self.cite(sha='deadbee')
        self.assertIn('deadbee', msg)
        self.assertIn('not a commit', msg)

    def test_a_ref_name_is_not_a_stamp(self):
        sha2 = self.commit('docs/a.md', ['other text'], 'two')
        self.git('branch', 'deadbee', self.sha1)   # hex-shaped ref names: a moving ref, not an object id
        self.git('tag', 'cafe123', self.sha1)
        self.git('branch', sha2[:7], sha2)         # a ref named like the prefix of the very commit it points at
        for ref in ('deadbee', 'cafe123', sha2[:7]):
            with self.subTest(sha=ref):
                msg = self.cite(sha=ref)
                self.assertIsNotNone(msg)
                self.assertIn(ref, msg)
                self.assertIn('ref', msg)
                self.assertIn(ref, check.kit_problem(ref))
        self.assertIsNone(self.cite(sha=self.sha1))   # the object id itself still works
        self.assertIsNone(self.cite(sha=self.git('rev-parse', self.sha1)))   # full 40-hex too

    def test_an_ambiguous_id_prefix_is_not_a_stamp(self):
        real = check._git

        def two_objects(kit, *args):
            if args[:2] == ('rev-parse', '--disambiguate=' + self.sha1[:7]):
                return 0, b'%s\n%s\n' % (self.git('rev-parse', self.sha1).encode(), b'f' * 40)
            return real(kit, *args)
        with mock.patch.object(check, '_git', side_effect=two_objects):
            msg = check.kit_problem(self.sha1[:7])
        self.assertIn(self.sha1[:7], msg)
        self.assertIn('ambiguous', msg)

    def test_a_ref_name_stamp_in_a_view_is_one_error_and_selects_no_text(self):
        self.git('branch', 'deadbee', self.sha1)
        obj = fixture()
        obj['doctrine']['kit_sha'] = 'deadbee'
        errs = validate(obj)
        self.assertEqual(len([e for e in errs if 'doctrine.kit_sha' in e and 'deadbee' in e]), 1, errs)
        self.assertFalse([e for e in errs if '.file' in e or 'STALE' in e], errs)

    def test_bad_sha_values_never_reach_git(self):
        with mock.patch.object(check, '_git') as git:
            for sha in ([], {}, None, 5, '', 'xyz', 'ABCDEF1', '64b451', '--upload-pack=x', self.sha1 + '\n', 'a' * 41, ['abcdef1']):
                with self.subTest(sha=sha):
                    self.assertIn('kit_sha must be', self.cite(sha=sha))
            git.assert_not_called()

    def test_one_git_read_per_sha_and_file(self):
        real = check._git
        with mock.patch.object(check, '_git', side_effect=real) as git:
            for _ in range(5):
                self.assertIsNone(self.cite())
                self.assertIn('does not exist', self.cite(f='docs/missing.md'))
            blobs = [c for c in git.call_args_list if c.args[1] == 'cat-file']
            self.assertEqual(len(blobs), 2)

    def test_missing_kit_and_non_repo_kit_are_messages_naming_the_kit_and_flag(self):
        for path, word in ((os.path.join(self.tmp.name, 'nope'), 'not found'), (self.tmp.name, 'not a git repository')):
            with self.subTest(path=path), mock.patch.object(check, 'KIT', path):
                msg = check.kit_problem()
                self.assertIn(path, msg)
                self.assertIn(word, msg)
                self.assertIn('--kit', msg)
                self.assertIn(path, self.cite())

    def test_validate_view_reports_a_kit_or_sha_problem_once_not_per_citation(self):
        obj = fixture()   # the real spec, stamped 64b4512, read from the real kit
        obj['doctrine']['kit_sha'] = 'deadbee'
        errs = validate(obj)
        self.assertEqual(len([e for e in errs if 'doctrine.kit_sha' in e and 'not a commit' in e]), 1, errs)
        self.assertFalse([e for e in errs if '.file' in e or 'STALE' in e], errs)
        with mock.patch.object(check, 'KIT', os.path.join(self.tmp.name, 'nope')):
            errs = validate(fixture())
            self.assertEqual(len([e for e in errs if 'doctrine.kit_sha' in e and 'not found' in e]), 1, errs)
            self.assertFalse([e for e in errs if '.file' in e or 'STALE' in e], errs)

    def test_junk_kit_sha_in_a_view_is_an_error_and_never_reaches_git(self):
        real = check._git
        with mock.patch.object(check, '_git', side_effect=real) as git:
            for sha in ([], {}, None, 5, '', 'xyz', 'ABCDEF1', '--upload-pack=x', '64b4512\n', 'a' * 41, True):
                with self.subTest(sha=sha):
                    obj = fixture()
                    obj['doctrine']['kit_sha'] = sha
                    errs = validate(obj)
                    self.assertTrue([e for e in errs if 'doctrine.kit_sha' in e], errs)
            for c in git.call_args_list:
                for a in c.args[1:]:
                    self.assertFalse(isinstance(a, str) and ('upload-pack' in a or 'xyz' in a), c)

    def test_citation_error_reaches_a_finding(self):
        obj = fixture()
        s = obj['nodes'][0]['card']['src']
        s.append({'file': '~nonexistent_user_zz/x', 'line': 1, 'quote': 'q'})
        s.append({'file': '../x', 'line': 1, 'quote': 'q'})
        errs = validate(obj)
        self.assertTrue(any('relative to the kit root' in e for e in errs), errs)
        self.assertTrue(any('".." segment' in e for e in errs), errs)

    def test_validate_cli_with_a_missing_kit_is_one_line_exit_1(self):
        r = subprocess.run([sys.executable, '-B', os.path.join(check.ROOT, 'tools', 'check.py'), '--kit', '/nonexistent/kit', 'validate'],
                           capture_output=True, text=True)
        self.assertEqual(r.returncode, 1)
        out = (r.stdout + r.stderr).strip()
        self.assertEqual(len(out.splitlines()), 1, out)
        self.assertIn('/nonexistent/kit', out)
        self.assertIn('--kit', out)
        self.assertNotIn('Traceback', out)


class RepointAtTheStamp(KitRepo):   # repoint.py moves a quote to its line at the view's kit_sha
    def spec(self, sha, line):
        return {'id': 'feature', 'doctrine': {'kit_sha': sha}, 'edges': [], 'unplaced': [],
                'nodes': [{'id': 'n', 'card': {'src': [{'file': 'docs/a.md', 'line': line, 'quote': 'beta quote here'}]}}]}

    def moved(self):
        return self.commit('docs/a.md', ['new line %d' % i for i in range(12)] + self.LINES, 'moved')

    def test_a_moved_quote_is_repointed_at_the_new_sha(self):
        sha2 = self.moved()
        view = self.spec(sha2, 32)
        self.assertTrue(check.check_citation(view['nodes'][0]['card']['src'][0], sha2).startswith('STALE'))
        n_src, n_stale, done, left = repoint.repoint_view(view, 'spec/feature.js')
        self.assertEqual((n_src, n_stale, len(done), left), (1, 1, 1, []))
        self.assertEqual(view['nodes'][0]['card']['src'][0]['line'], 44)
        self.assertIsNone(check.check_citation(view['nodes'][0]['card']['src'][0], sha2))
        old = self.spec(self.sha1, 32)   # at the old stamp nothing is stale, nothing moves
        self.assertEqual(repoint.repoint_view(old, 'spec/feature.js')[1:], (0, [], []))

    def test_a_phantom_line_after_the_final_newline_is_repointed(self):
        sha2 = self.commit_raw('docs/a.md', 'one\nbeta quote here\n', 'two lines')
        view = self.spec(sha2, 3)   # line 3 is what split('\n') invents after the final newline
        src = view['nodes'][0]['card']['src'][0]
        self.assertIn('outside the file', check.check_citation(src, sha2))
        self.assertEqual(repoint.repoint_view(view, 'spec/feature.js')[:2], (1, 1))
        self.assertEqual(src['line'], 2)
        self.assertIsNone(check.check_citation(src, sha2))

    def test_a_line_outside_the_file_is_repointed_like_a_stale_one(self):
        sha2 = self.moved()   # the quote sits on line 44 of a 49-line file
        for old in (200, 0, -3):
            with self.subTest(line=old):
                view = self.spec(sha2, old)
                src = view['nodes'][0]['card']['src'][0]
                self.assertIn('outside the file', check.check_citation(src, sha2))
                n_src, n_broken, done, left = repoint.repoint_view(view, 'spec/feature.js')
                self.assertEqual((n_src, n_broken, len(done), left), (1, 1, 1, []))
                self.assertEqual(src['line'], 44)
                self.assertIsNone(check.check_citation(src, sha2))
        sha3 = self.commit('docs/a.md', ['beta quote here'], 'shorter')   # shorter than the cited line
        view = self.spec(sha3, 32)
        n_src, n_broken, done, left = repoint.repoint_view(view, 'spec/feature.js')
        self.assertEqual((n_src, n_broken, len(done), left), (1, 1, 1, []))
        self.assertEqual(view['nodes'][0]['card']['src'][0]['line'], 1)

    def test_every_other_broken_citation_is_listed_unresolved(self):
        sha2 = self.commit('docs/a.md', self.LINES + ['beta quote here'], 'twice')
        for kw, word in ((dict(line=999), '2 hits'), (dict(line=33, quote='gone for good'), 'no hit'),
                         (dict(file='docs/missing.md'), 'does not exist'), (dict(file='../x'), '".." segment'),
                         (dict(quote='x' * 121), 'limit')):
            with self.subTest(**kw):
                view = self.spec(sha2, 32)
                src = view['nodes'][0]['card']['src'][0]
                src.update(kw)
                before = dict(src)
                n_src, n_broken, done, left = repoint.repoint_view(view, 'spec/feature.js')
                self.assertEqual((n_src, n_broken, done), (1, 1, []))
                self.assertEqual(len(left), 1, left)
                self.assertTrue(left[0].startswith('UNRESOLVED'), left)
                self.assertIn(word, left[0])
                self.assertEqual(src, before)

    def test_main_rewrites_a_spec_and_refuses_a_stamp_that_is_not_a_commit(self):
        sha2 = self.moved()
        spec_dir = os.path.join(self.tmp.name, 'spec')
        os.mkdir(spec_dir)
        path = os.path.join(spec_dir, 'feature.js')
        fmt = dict(indent=' ', ensure_ascii=True)

        def write(view):
            with open(path, 'wb') as f:
                f.write(repoint.dump(view, fmt))
        write(self.spec(sha2, 32))
        argv = ['repoint.py', '--kit', self.repo]
        with mock.patch.object(check, 'SPEC_DIR', spec_dir), mock.patch.object(sys, 'argv', argv), \
                contextlib.redirect_stdout(io.StringIO()):
            repoint.main()
            self.assertEqual(repoint.load_spec(path)[0]['nodes'][0]['card']['src'][0]['line'], 44)
            write(self.spec('deadbee', 32))
            with self.assertRaises(SystemExit) as ctx:
                repoint.main()
            self.assertIn('deadbee', str(ctx.exception))


class MetricsAreDefinitions(unittest.TestCase):   # a metric is exactly {name, src}; no gap of kind report
    def card_of_metric_node(self, obj):
        return next(n['card'] for n in obj['nodes'] if n['card']['metrics'])

    def test_clean_fixture_has_no_metric_error(self):
        self.assertFalse([e for e in validate(fixture()) if 'metrics[' in e])

    def test_value_and_as_of_are_unknown_fields(self):
        for key, val in (('value', '3'), ('as_of', '2026-01-01')):
            with self.subTest(key=key):
                obj = fixture()
                self.card_of_metric_node(obj)['metrics'][0][key] = val
                self.assertTrue(any('card.metrics[0]' in e and key in e for e in validate(obj)), validate(obj))

    def test_gap_kind_report_is_an_error(self):
        obj = fixture()
        card = self.card_of_metric_node(obj)
        card['gaps'].append({'text': 'x', 'kind': 'report', 'src': []})
        self.assertTrue(any('card.gaps[' in e and '.kind' in e and 'must be one of' in e for e in validate(obj)), validate(obj))


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


@unittest.skipUnless(os.environ.get('PV_REAL_CHROME') == '1',
                     'launches real Chrome; run it as: PV_REAL_CHROME=1 python3 -B tools/test_check.py CitationLinkForm')
class CitationLinkForm(unittest.TestCase):
    """A citation link opens GitHub's code view at the stamped commit with the cited line addressed: ?plain=1 before
    #L<line> (without it a .md file opens rendered and the anchor does nothing), for every file type."""
    BASE = 'https://github.com/TurboKach/claude-code-setup/blob/'

    @staticmethod
    def blob_links(dom):
        import html.parser

        class P(html.parser.HTMLParser):
            hrefs = []

            def handle_starttag(self, tag, attrs):
                h = dict(attrs).get('href')
                if tag == 'a' and h and '/blob/' in h:
                    self.hrefs.append(h)
        p = P()
        p.hrefs = []
        p.feed(dom)
        return p.hrefs

    def test_real_card_links_are_code_view_links(self):
        dom = check.chrome_dom(check.page_url([('view', 'feature'), ('t', '7.8'), ('card', 'clean')]), '1400,900', 4000)
        links = self.blob_links(dom)
        self.assertEqual(len(links), 8, links)
        for h in links:
            self.assertRegex(h, r'^%s64b4512/[^?#]+\?plain=1#L\d+$' % self.BASE)

    def test_every_file_type_gets_the_same_form(self):
        exts = ('skills/x/SKILL.md', 'skills/x/scripts/a.py', 'hooks/b.sh', 'settings.example.json')
        with tempfile.TemporaryDirectory() as d:
            for rel in ('index.html', 'viz.js'):
                with open(os.path.join(check.ROOT, rel), 'rb') as src, open(os.path.join(d, rel), 'wb') as dst:
                    dst.write(src.read())
            obj = fixture()
            seen = []

            def walk(x):
                if isinstance(x, dict):
                    if {'file', 'line', 'quote'} <= set(x):
                        x['file'] = exts[len(seen) % len(exts)]
                        seen.append((x['file'], x['line']))
                    for v in x.values():
                        walk(v)
                elif isinstance(x, list):
                    for v in x:
                        walk(v)
            walk([n for n in obj['nodes'] if n['id'] == 'clean'][0]['card'])
            os.makedirs(os.path.join(d, 'spec'))
            with open(os.path.join(d, 'spec', 'feature.js'), 'w') as f:
                f.write(check.WRAP_PREFIX + json.dumps(obj, indent=1) + check.WRAP_SUFFIX)
            url = pathlib.Path(d, 'index.html').as_uri() + '?view=feature&t=7.8&card=clean'
            links = self.blob_links(check.chrome_dom(url, '1400,900', 4000))
        self.assertEqual(sorted(links), sorted('%s64b4512/%s?plain=1#L%d' % (self.BASE, f, ln) for f, ln in seen))
        self.assertEqual({l.split('?')[0].rsplit('.', 1)[1] for l in links}, {'md', 'py', 'sh', 'json'})


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
