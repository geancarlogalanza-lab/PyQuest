# PyQuest — Design

A gamified, offline-first Python mastery journey. Real code, real tests, real retention.

---

## 1. Guiding principles

1. **Time-on-keyboard beats time-on-text.** Every lesson ends in code the learner writes and a
   test suite that must pass. Reading is the setup, not the product.
2. **Nothing is "learned" until it is demonstrated.** A concept's mastery score only moves on
   *evidence* — passing an exercise that exercises it, unaided, and again later after a delay.
3. **Difficulty rises, concept load doesn't.** A lesson introduces 1–3 new concepts and then
   drills them hard against previously-mastered material. Hard problems come from *combining*
   known concepts, not from dumping new syntax.
4. **Forgetting is the enemy, not ignorance.** Spaced review is a first-class mode, not a bonus.
5. **Games motivate; they don't grade.** XP is a byproduct of evidence. You cannot buy or grind
   your way past a checkpoint.

---

## 2. Curriculum

Four tiers, 30 modules, each module = 3–6 lessons + a checkpoint ("Boss") + most tiers end in a
project. Every lesson carries a `concepts: []` tag list that drives mastery and review.

### Tier 1 — Beginner (`Can I make the computer do a thing?`)
| # | Module | Core concepts |
|---|--------|---------------|
| 1 | First Steps | running code, `print`, comments, syntax errors, reading tracebacks |
| 2 | Variables & Types | `int` `float` `str` `bool`, assignment, `type()`, casting, `input()` |
| 3 | Operators & Expressions | arithmetic, `//` `%` `**`, comparison, `and/or/not`, precedence |
| 4 | Making Decisions | `if/elif/else`, nesting, truthiness, boolean logic in practice |
| 5 | Loops | `while`, `for`, `range`, accumulators, `break`/`continue`, loop design |
| 6 | Functions I | `def`, parameters, `return`, scope, docstrings, decomposition |
| 7 | Strings I | indexing, slicing, methods, f-strings, immutability |
| 8 | Lists I | creation, indexing, mutation, methods, iteration, `in` |
| ★ | **Tier project:** Command-line Number Detective + Text Toolkit |

### Tier 2 — Intermediate (`Can I model a problem?`)
| # | Module | Core concepts |
|---|--------|---------------|
| 9 | Lists II & Tuples | nesting, `sort`/`sorted`+`key`, unpacking, tuples, aliasing & copies |
| 10 | Dicts & Sets | mapping, iteration, `get`/`setdefault`, counting, set algebra |
| 11 | Comprehensions | list/dict/set comprehensions, conditionals, nesting, when *not* to use |
| 12 | Functions II | defaults, `*args`/`**kwargs`, keyword-only, lambdas, functions as values |
| 13 | Errors & Exceptions | `try/except/else/finally`, `raise`, exception types, custom exceptions, EAFP |
| 14 | Files & Formats | `open`/`with`, text vs binary, `csv`, `json`, `pathlib` |
| 15 | Modules & Ecosystem | `import` forms, `__name__`, stdlib tour, packages, `venv`/`pip` |
| 16 | OOP I | classes, instances, `__init__`, attributes vs methods, `__repr__`, state |
| ★ | **Tier project:** Expense Tracker (files + dicts + classes + errors) |

### Tier 3 — Advanced (`Can I build something real?`)
| # | Module | Core concepts |
|---|--------|---------------|
| 17 | OOP II | inheritance, composition, polymorphism, dunder methods, `@property`, dataclasses, ABCs |
| 18 | Iterators & Generators | iterator protocol, `yield`, lazy pipelines, `itertools` |
| 19 | Closures & Decorators | closures, first-class functions, `@decorator`, `functools.wraps`, parameterised decorators |
| 20 | Testing & Debugging | assertions, `unittest`, pytest style, TDD loop, fixtures, `logging`, bisecting bugs |
| 21 | Algorithms & Complexity | Big-O, linear/binary search, sorting, recursion, memoisation, DP intro, data-structure choice |
| 22 | Regex & Text Processing | patterns, groups, `re` API, parsing logs, cleaning data |
| 23 | Databases | `sqlite3`, SQL CRUD, joins, transactions, parameterised queries, schema design |
| 24 | APIs & The Web | HTTP model, JSON APIs, clients, pagination, retries, rate limits, designing an API |
| ★ | **Tier projects:** Log Analyser, Contacts DB, API-backed CLI |

### Tier 4 — Mastery (`Can I do this professionally?`)
| # | Module | Core concepts |
|---|--------|---------------|
| 25 | Typing & Contracts | annotations, `typing`, generics, protocols, `mypy` thinking, design by contract |
| 26 | Concurrency & Async | threads vs processes vs async, GIL, `asyncio`, queues, race conditions |
| 27 | Performance & Memory | profiling, complexity in practice, caching, generators at scale, `__slots__` |
| 28 | Design & Architecture | SOLID-lite, patterns, refactoring, layering, dependency inversion, packaging |
| 29 | Professional Practice | code review, docs, CI thinking, config & secrets, security basics, error budgets |
| 30 | Capstone | multi-stage system built to spec with tests |

**Pacing rule.** A module unlocks only when the previous module's checkpoint is passed *and* its
prerequisite concepts sit at ≥ 0.55 mastery. Otherwise the app routes you to review first.

---

## 3. Exercise taxonomy

Reading is never more than ~40% of a lesson. Item kinds:

| Kind | What it does |
|------|--------------|
| `code` | Write a function/program from a spec; hidden + visible tests must pass |
| `debug` | Broken code is given; find and fix the defect(s) |
| `predict` | Predict output/behaviour *before* running — catches false confidence |
| `quiz` | Concept check with explanation on both right and wrong answers |
| `refactor` | Working but bad code → make it correct, idiomatic, or faster (constrained tests) |
| `explore` | Guided playground task with open-ended verification |
| `project` | Multi-stage build with per-stage test suites |

Every non-quiz item runs **real CPython** and is graded by a **real test suite**.

---

## 4. Progression & mastery model

### Concept mastery
Each concept keeps `{reps, ease, lapses, dueAt, lastQuality}` and derives a live `strength ∈ [0,1]`:

```
strength = maturity × recency
maturity = min(1, reps / 4) adjusted by ease and lapses
recency  = 0.5 ^ (daysSinceReview / halfLife),  halfLife grows with reps
```

An attempt produces a quality score:

| Outcome | q |
|---|---|
| Passed first try, no hints | 5 |
| Passed, ≤1 hint or ≤2 attempts | 4 |
| Passed eventually | 3 |
| Revealed solution | 2 |
| Failed / abandoned | 1 |

SM-2-style scheduling updates `ease` and `dueAt` per concept. Strength decays with time, so the
map honestly shows what has faded.

### Review engine
`Review` builds a session by ranking concepts on `dueness × (1 − strength) × importance`, then
pulls retrieval items tagged with those concepts (previously solved exercises re-served, plus
short drills). Wrong answers immediately reschedule.

### Gating
- Lesson n+1 needs lesson n complete.
- Module checkpoint = 4–8 mixed items, no hints, ≥ 80% to pass.
- Tier boundary needs the tier project's stages all green.

---

## 5. Gamification (motivational layer, not the grade)

- **XP** — earned only from evidence: `xp = base(difficulty) × firstTryBonus × noHintBonus × streakMult`.
  Re-solving a solved item gives a small "practice" trickle so review is worth doing but not farmable.
- **Levels 1–60** with rank titles: Novice → Apprentice → Coder → Developer → Engineer →
  Architect → Pythonista → Grandmaster. Curve `cumXP(n) = round(45 · n^1.65)`.
- **Streaks** — local-date based, with 2 earnable freezes; streak multiplier caps at ×1.5.
- **Daily quests** — 3 per day, seeded deterministically from the date so they're stable offline.
- **Achievements** — ~45 predicates over the derived state (first program, 10 first-try solves,
  bug-hunter, night owl, comeback, module clears, project ships, concept mastery counts…).
- **Milestones** — module checkpoints and tier projects are the real trophies.
- **Skill map** — a visible concept grid coloured by live strength. It is the honest scoreboard.

---

## 6. Architecture

**Vanilla PWA. No build step, no framework, no server required.**

```
index.html          app shell (single page, hash router)
css/app.css         design system (dark/light, responsive)
js/store.js         IndexedDB kv + localStorage fallback
js/engine.js        event log → derived state; XP, mastery, quests, achievements
js/py-worker.js     Pyodide + grading harness, in a Web Worker
js/runner.js        worker client: run/grade/timeout/terminate-restart
js/editor.js        CodeMirror 5 + mobile key bar + autoindent
js/errors.js        traceback → plain-English explanation
js/ui.js            views + router + rendering
js/sync.js          sync adapters (file export/import, optional Supabase)
js/app.js           bootstrap
content/manifest.js ordered list of content files
content/*.js        curriculum data (registered via PQ.defineModule)
sw.js               offline cache (app shell + content, opt-in Pyodide precache)
```

**Why this stack**
- *Pyodide (CPython → WASM)* gives genuinely real Python — stdlib, tracebacks, exceptions —
  with no server and no account. It is the only way to be both offline and honest about "real code".
- *Web Worker* isolation means an infinite loop is survivable: the main thread times out at 12 s,
  terminates the worker and respawns it.
- *No framework* keeps the whole thing cacheable, inspectable, and hackable — and this app is
  itself a teaching artefact.

**Responsive strategy**
- ≥ 900px: left rail nav, two-pane lesson (prose | editor), keyboard-first, full shortcuts
  (`Ctrl/Cmd+Enter` run, `Ctrl+'` test, `Esc` close).
- < 900px: bottom tab bar, stacked lesson with segmented tabs, sticky key bar above the keyboard
  with `: ( ) [ ] " ' = _ . →indent ←dedent`, larger hit targets, no hover-only affordances.

---

## 7. Persistence

- **Source of truth = an append-only event log.** `{id, t, type, ...payload}`.
  All state (XP, levels, completions, mastery, streaks, achievements) is a pure `fold(events)`.
- **Why event-sourced:** merging two devices is a *set union of events by id* — conflict-free,
  no lost XP, no "which copy wins" dialog. Replay is deterministic, so both devices agree.
- **Stores** (IndexedDB `pyquest`, object store `kv`):
  - `events` — the log (compacted to a snapshot + tail above 6000 events)
  - `drafts` — per-exercise editor code, merged by newest timestamp
  - `settings` — theme, font size, sync config
- **Write policy:** every attempt/completion writes immediately (debounced 400 ms for drafts).
  Nothing lives only in memory.
- **Offline:** service worker precaches app shell + all curriculum on first load. Pyodide
  (~12 MB) is an explicit one-tap "Download Python for offline" so we never surprise a phone plan.

---

## 8. Sync

One merge function, two transports.

```
merge(local, remote) = {
  events: unionById(local.events, remote.events),
  drafts: pickNewestPerKey(local.drafts, remote.drafts)
}
state = fold(merged.events)
```

- **File transport (always available, zero setup):** Export `pyquest-backup.json`, import on the
  other device. Import *merges*, never overwrites — importing an older backup cannot lose progress.
- **Cloud transport (optional):** Supabase adapter, shipped complete but inert until the learner
  pastes a project URL + anon key in Settings. Uses Supabase Auth (real accounts) and an RLS
  policy keyed on `auth.uid()`; `sql/schema.sql` is included. Sync = pull → merge → push, safe to
  run repeatedly and safe to interrupt.
- Offline queues a pending push; the adapter retries on `online`.

No sync is required for the app to work. Losing the network only costs cross-device continuity.

---

## 9. What "finishing" means

The exit bar is not "all lessons green". It is the Capstone: a spec-driven system built from a
blank file, graded by tests the learner has never seen, with no hints available. Everything before
it exists to make that survivable.
