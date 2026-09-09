/* PyQuest — Python worker.
 * Runs real CPython (Pyodide/WASM) off the main thread so an infinite loop is
 * survivable: the page terminates and respawns this worker on timeout.
 */
/* eslint-env worker */

const PYODIDE_VERSION = '0.26.4';
const PYODIDE_BASE = 'https://cdn.jsdelivr.net/pyodide/v' + PYODIDE_VERSION + '/full/';

let pyodide = null;
let booting = null;

const HARNESS = String.raw`
import sys, io, json, math, traceback, re, os, linecache

FNAME = "your_code.py"

def _register_source(src):
    """Put the learner's source where traceback can find it, so error lines are shown."""
    lines = src.splitlines(True)
    linecache.cache[FNAME] = (len(src), None, lines, FNAME)

def _short(v, n=160):
    try:
        r = repr(v)
    except Exception:
        r = "<unrepresentable>"
    return r if len(r) <= n else r[:n] + "…"

def _fmt_exc(e):
    try:
        te = traceback.TracebackException(type(e), e, e.__traceback__, lookup_lines=True)
        te.stack = traceback.StackSummary.from_list(
            [f for f in te.stack if f.filename == FNAME])
        return "".join(te.format()).rstrip()
    except Exception:
        return "%s: %s" % (type(e).__name__, e)

def _eq(a, b, strict=False):
    if strict:
        if type(a) is not type(b):
            return False
    if isinstance(a, bool) or isinstance(b, bool):
        return a is b if isinstance(a, bool) and isinstance(b, bool) else a == b
    if isinstance(a, float) or isinstance(b, float):
        try:
            return math.isclose(float(a), float(b), rel_tol=1e-9, abs_tol=1e-9)
        except (TypeError, ValueError):
            return a == b
    if isinstance(a, (list, tuple)) and isinstance(b, (list, tuple)):
        return len(a) == len(b) and all(_eq(x, y, strict) for x, y in zip(a, b))
    if isinstance(a, dict) and isinstance(b, dict):
        if set(a.keys()) == set(b.keys()):
            return all(_eq(a[k], b[k], strict) for k in a)
        # Expected values arrive as JSON, which can only have string keys.
        # Retry with keys compared as text so {1: 'a'} matches {"1": 'a'}.
        sa = {str(k): v for k, v in a.items()}
        sb = {str(k): v for k, v in b.items()}
        if len(sa) == len(a) and len(sb) == len(b) and set(sa.keys()) == set(sb.keys()):
            return all(_eq(sa[k], sb[k], strict) for k in sa)
        return False
    if isinstance(a, set) and isinstance(b, (set, list, tuple)):
        return a == set(b)
    return a == b

def _make_input(lines, buf):
    it = iter(lines)
    def _input(prompt=""):
        if prompt:
            buf.write(str(prompt))
        try:
            v = next(it)
        except StopIteration:
            raise EOFError("Your program asked for more input than this exercise supplies.")
        # Real input() does not echo into stdout — the terminal does that.
        # Keeping stdout clean is what lets exercises check exact output.
        return str(v)
    return _input

def _exec_program(src, stdin_lines):
    """Run the learner's program. Returns (globals, stdout, error_text, error_type)."""
    buf = io.StringIO()
    g = {"__name__": "__main__"}
    g["input"] = _make_input(list(stdin_lines or []), buf)
    _register_source(src)
    old = sys.stdout
    sys.stdout = buf
    err = None
    etype = None
    try:
        exec(compile(src, FNAME, "exec"), g)
    except SystemExit:
        pass
    except BaseException as e:
        err = _fmt_exc(e)
        etype = type(e).__name__
    finally:
        sys.stdout = old
    return g, buf.getvalue(), err, etype

def _write_files(files):
    for name, content in (files or {}).items():
        d = os.path.dirname(name)
        if d and not os.path.isdir(d):
            os.makedirs(d, exist_ok=True)
        with open(name, "w", encoding="utf-8") as f:
            f.write(content)

def _run_test(t, src, g, out, stdin_lines):
    """Return (passed, message)."""
    name = t.get("name", "test")
    msg_hint = t.get("msg")

    # tests that re-run the whole program with different input
    if "stdin" in t:
        g2, out2, err2, _ = _exec_program(src, t["stdin"])
        if err2:
            return False, "Your program crashed on input %s\n%s" % (_short(t["stdin"]), err2)
        return _check_output(t, out2, "with input " + _short(t["stdin"]))

    if "call" in t:
        try:
            if t.get("raises"):
                try:
                    val = eval(t["call"], g)
                except BaseException as e:
                    names = [c.__name__ for c in type(e).__mro__]
                    if t["raises"] in names:
                        if "message" in t and t["message"] not in str(e):
                            return False, "Right exception type, but the message should mention %s (yours: %s)" % (_short(t["message"]), _short(str(e)))
                        return True, ""
                    return False, "Expected %s to raise %s, but it raised %s: %s" % (t["call"], t["raises"], type(e).__name__, e)
                return False, "Expected %s to raise %s, but it returned %s" % (t["call"], t["raises"], _short(val))
            val = eval(t["call"], g)
        except BaseException as e:
            return False, "%s raised an error:\n%s" % (t["call"], _fmt_exc(e))
        if "expect" in t:
            if _eq(val, t["expect"], t.get("strict", False)):
                return True, ""
            return False, msg_hint or ("%s\n  expected: %s\n  you gave:  %s" % (t["call"], _short(t["expect"]), _short(val)))
        if val:
            return True, ""
        return False, msg_hint or ("%s was not true (got %s)" % (t["call"], _short(val)))

    if "code" in t:
        ns = dict(g)
        ns["_OUT"] = out
        ns["_SRC"] = src
        ns["_eq"] = _eq
        buf = io.StringIO()
        old = sys.stdout
        sys.stdout = buf
        try:
            exec(compile(t["code"], "<check>", "exec"), ns)
            return True, ""
        except AssertionError as e:
            return False, msg_hint or (str(e) or "Assertion failed")
        except BaseException as e:
            return False, "Check failed:\n" + _fmt_exc(e)
        finally:
            sys.stdout = old

    return _check_output(t, out, None)

def _check_output(t, out, ctx):
    prefix = (ctx + ": ") if ctx else ""
    if "out" in t:
        if t["out"] in out:
            return True, ""
        return False, t.get("msg") or (prefix + "Expected the output to contain %s\n  your output: %s" % (_short(t["out"]), _short(out.strip() or "(nothing)")))
    if "out_not" in t:
        if t["out_not"] not in out:
            return True, ""
        return False, t.get("msg") or (prefix + "Output should not contain %s" % _short(t["out_not"]))
    if "out_exact" in t:
        if out.strip() == str(t["out_exact"]).strip():
            return True, ""
        return False, t.get("msg") or (prefix + "Expected exactly:\n%s\nbut got:\n%s" % (t["out_exact"], out.strip() or "(nothing)"))
    if "out_re" in t:
        if re.search(t["out_re"], out, re.M):
            return True, ""
        return False, t.get("msg") or (prefix + "Output did not match the expected pattern.\n  your output: %s" % _short(out.strip() or "(nothing)"))
    if "out_lines" in t:
        got = [l for l in out.strip().split("\n") if l.strip() != ""]
        want = [str(x) for x in t["out_lines"]]
        if [l.strip() for l in got] == [w.strip() for w in want]:
            return True, ""
        return False, t.get("msg") or (prefix + "Expected these lines:\n%s\ngot:\n%s" % ("\n".join(want), "\n".join(got) or "(nothing)"))
    return True, ""

def pq_grade(payload_json):
    payload = json.loads(payload_json)
    src = payload.get("code", "")
    stdin_lines = payload.get("stdin") or []
    tests = payload.get("tests") or []
    _write_files(payload.get("files"))

    g, out, err, etype = _exec_program(src, stdin_lines)
    res = {"stdout": out, "error": err, "errorType": etype, "tests": [], "ok": False}

    if err:
        res["tests"] = [{"name": t.get("name", "test"), "ok": False,
                         "msg": "Not run — your program stopped with an error.",
                         "hidden": bool(t.get("hidden"))} for t in tests]
        return json.dumps(res)

    all_ok = True
    for t in tests:
        try:
            ok, msg = _run_test(t, src, g, out, stdin_lines)
        except BaseException as e:
            ok, msg = False, "Checker error: " + _fmt_exc(e)
        if not ok:
            all_ok = False
        res["tests"].append({"name": t.get("name", "test"), "ok": bool(ok), "msg": msg,
                             "hidden": bool(t.get("hidden"))})
    res["ok"] = all_ok
    return json.dumps(res)

def pq_exec(payload_json):
    payload = json.loads(payload_json)
    _write_files(payload.get("files"))
    g, out, err, etype = _exec_program(payload.get("code", ""), payload.get("stdin") or [])
    return json.dumps({"stdout": out, "error": err, "errorType": etype, "tests": [], "ok": err is None})
`;

async function boot() {
  if (pyodide) return pyodide;
  if (booting) return booting;
  booting = (async () => {
    self.postMessage({ type: 'status', stage: 'download', msg: 'Downloading Python…' });
    importScripts(PYODIDE_BASE + 'pyodide.js');
    self.postMessage({ type: 'status', stage: 'init', msg: 'Starting Python…' });
    pyodide = await self.loadPyodide({ indexURL: PYODIDE_BASE });
    pyodide.setStdout({ batched: () => {} });
    pyodide.setStderr({ batched: () => {} });
    await pyodide.runPythonAsync(HARNESS);
    const v = pyodide.runPython('import sys; sys.version.split()[0]');
    self.postMessage({ type: 'ready', version: v });
    return pyodide;
  })();
  return booting;
}

/* Some standard-library modules (sqlite3, ssl, lzma …) ship as separate
   Pyodide packages. Scan everything that is about to run — the learner's code,
   the graders, and any provided files — and load what it needs. */
const loadedPackages = new Set();

async function ensurePackages(payload) {
  let source = String(payload.code || '');
  (payload.tests || []).forEach(t => {
    if (t.code) source += '\n' + t.code;
  });
  Object.values(payload.files || {}).forEach(content => { source += '\n' + content; });
  if (!source.trim()) return;

  const key = (source.match(/^\s*(?:import|from)\s+[\w., ]+/gm) || []).join('|');
  if (loadedPackages.has(key)) return;
  loadedPackages.add(key);

  try {
    await pyodide.loadPackagesFromImports(source, { messageCallback: () => {}, errorCallback: () => {} });
  } catch (err) {
    // Offline, or the package does not exist. The import will fail normally
    // with a message the learner can read, which is the right outcome.
    console.warn('[py-worker] package load skipped', err);
  }
}

self.onmessage = async (e) => {
  const msg = e.data || {};
  try {
    if (msg.type === 'init') { await boot(); return; }

    if (msg.type === 'run' || msg.type === 'grade') {
      await boot();
      await ensurePackages(msg.payload || {});
      const fn = pyodide.globals.get(msg.type === 'grade' ? 'pq_grade' : 'pq_exec');
      let json;
      try { json = fn(JSON.stringify(msg.payload || {})); }
      finally { if (fn && fn.destroy) fn.destroy(); }
      self.postMessage({ type: 'result', id: msg.id, result: JSON.parse(json) });
      return;
    }

    if (msg.type === 'ping') { self.postMessage({ type: 'pong', id: msg.id, booted: !!pyodide }); return; }
  } catch (err) {
    self.postMessage({
      type: 'result', id: msg.id,
      result: { ok: false, stdout: '', tests: [], error: String((err && err.message) || err), errorType: 'RuntimeError' }
    });
  }
};
