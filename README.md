# PyQuest

A gamified journey from absolute beginner to professional Python. Runs **real CPython** in your
browser, works **offline**, and keeps your progress on your phone and your laptop.

### ▶ [Open PyQuest](https://geancarlogalanza-lab.github.io/PyQuest/)

No server, no account, nothing to sign up for.

## Install it on your phone

PyQuest is a **progressive web app**, so it installs straight from the browser — a real icon on your
home screen, a full-screen window with no address bar, and it keeps working with no connection.
There is no app store and nothing to download separately.

**Android (Chrome, Edge, Samsung Internet)**
1. Open [the app](https://geancarlogalanza-lab.github.io/PyQuest/)
2. Go to **Settings → Install as an app → Install PyQuest**, or tap the browser's **⋮** menu and choose **Install app**

**iPhone and iPad**
1. Open [the app](https://geancarlogalanza-lab.github.io/PyQuest/) **in Safari** — other iOS browsers cannot install web apps
2. Tap **Share**, then **Add to Home Screen**

**Laptop (Chrome, Edge)**
Click the install icon in the address bar, or use **Settings → Install as an app**.

Once installed, open Settings → Offline → **Download Python for offline use** while you still have a
connection. After that it runs with the network off — on a plane, on the underground, anywhere.

> Want a real `.apk` for sideloading or the Play Store? Point
> [PWABuilder](https://www.pwabuilder.com/) at the URL above — the manifest and service worker are
> already set up for it, so it will package a signed Android app without any code changes.

<details>
<summary><b>Running it locally instead</b></summary>

```bash
node serve.js
```

Then open **http://localhost:8080**. The terminal also prints a `http://192.168.x.x:8080` address —
open that on your phone (same Wi-Fi) to use it there.

</details>

---

## What it is

30 modules across four tiers, 125 units, **505 exercises**, 7 projects and a capstone.

| Tier | Modules | Goal |
|---|---|---|
| **1 · Beginner** | 8 | Make the computer do a thing |
| **2 · Intermediate** | 8 | Model a problem |
| **3 · Advanced** | 8 | Build something real |
| **4 · Mastery** | 6 | Work like a professional |

Every non-quiz exercise runs your actual code against an actual test suite. Nothing is graded by
pattern-matching your answer.

### The exercises are not quizzes

| Kind | What you do |
|---|---|
| `code` | Write a function from a spec; hidden and visible tests must pass |
| `debug` | Broken code is given; find and fix it |
| `predict` | Say what the output will be *before* running — catches false confidence |
| `refactor` | Working but poor code → make it correct, idiomatic or fast |
| `quiz` | Concept check, with an explanation either way |
| `project` | Multi-stage build with per-stage test suites |

Roughly 80% of the exercises require you to write and run Python.

---

## How progress works

**Nothing is "learned" until you demonstrate it.** Every exercise is tagged with concepts. Solving
one unaided raises that concept's mastery; needing hints raises it less; failing lowers it. Mastery
**decays with time**, so the skill map stays honest about what has faded.

- **Review** builds retrieval sessions from your weakest and most-overdue concepts using
  SM-2 style spaced repetition.
- **Checkpoints** end every module: no hints, no solutions, 80% to pass. Fail and you are told
  exactly which ideas to revisit.
- **Skill map** shows all 239 tracked concepts coloured by live strength.
- **XP** comes only from evidence. Re-solving something gives a small practice trickle, so review is
  worth doing but cannot be farmed. Levels run 1–60, and finishing the journey lands you at about 60.
- **Streaks, quests and 45 achievements** exist to get you to open it tomorrow. They cannot buy you
  past a checkpoint.

---

## Your progress is safe

Progress is stored as an **append-only event log** in IndexedDB. Everything visible — XP, level,
streak, mastery, achievements, unlocks — is a pure fold over that log.

That design is why syncing is safe: **merging two devices is a set union of events by id.** There is
no "which copy wins" question, and no way to lose XP by importing an old backup.

- Works fully offline once loaded (see below).
- Every attempt is written the moment it happens — never only in memory.
- Saved on tab close and on backgrounding.
- Editor drafts are kept per exercise, so you never lose half-written code.

### Offline

- **App + all 30 curriculum files** are precached by the service worker on first load.
- **Python itself (~12 MB)** is cached the first time it runs. There is a one-tap
  *Download Python for offline use* in Settings so you can do it deliberately on Wi-Fi.
- Settings shows whether the offline cache is active.

> Service workers require `https` or `localhost` and are blocked by some embedded browsers. In
> Chrome, Firefox or Safari on `localhost` it will register normally. Your progress is saved
> locally either way — the service worker only affects whether the app *loads* without a network.

### Cross-device sync

Two transports, one merge rule.

**Backup file — no account, works everywhere.** Settings → *Export backup*, then *Import backup* on
the other device. Import **merges**; importing an older file can only ever add progress.

**Cloud sync — optional.** Point PyQuest at your own free Supabase project (URL + anon key in
Settings) and it syncs automatically. Run [`sql/schema.sql`](sql/schema.sql) once in the Supabase SQL
editor first; it uses real accounts and row-level security keyed to your user id. Nothing leaves your
device unless you set this up.

---

## Phone and laptop

The same app, adapted rather than shrunk.

**Laptop** — left rail navigation, wide two-pane reading, and keyboard-first coding:

| Shortcut | Does |
|---|---|
| `Ctrl`/`Cmd` + `Enter` | run your code |
| `Shift` + `Enter` | check it against the tests |
| `Ctrl`/`Cmd` + `/` | toggle a comment |
| `Tab` / `Shift`+`Tab` | indent / dedent |

**Phone** — bottom tab bar, single-column reading, and a **sticky symbol bar above the keyboard**
with `: ( ) [ ] { } " ' = == _ . , + - * % # < > f" {}` plus indent, dedent, undo and redo — because
typing a colon on a phone keyboard is otherwise three taps.

It installs as a real app on both — see [Install it on your phone](#install-it-on-your-phone).

---

## Running it

Requires **Node** (only to serve static files — the app itself has no build step and no backend).

```bash
node serve.js        # http://localhost:8080
node serve.js 3000   # a different port
```

Any static file server works. To use it from your phone, keep the laptop server running and open the
LAN address it prints.

### First run needs a connection

Python (Pyodide), the code editor and the fonts come from a CDN the first time. After that
everything is cached and it runs with the network off.

---

## Project layout

```text
index.html                 app shell
qa.html                    content QA harness — runs every reference solution against its own tests
serve.js                   static server, prints the LAN address for your phone
sw.js                      service worker: offline caching
DESIGN.md                  why it is built this way
sql/schema.sql             optional Supabase table + RLS policies
tools/logo.js              the logo, as polygons — the one source for every icon size
tools/make-icons.js        regenerates the icons and the in-app mark (node tools/make-icons.js)

css/app.css                design system (dark + light, responsive)
js/
  util.js                  DOM helpers, markdown renderer, dates
  icons.js                 the stroke icon set
  store.js                 IndexedDB with a localStorage fallback
  content.js               curriculum registry and navigation
  engine.js                event log → derived state; XP, mastery, quests, achievements
  errors.js                Python tracebacks → plain English
  runner.js                worker client: run, grade, time out, restart
  py-worker.js             Pyodide + the grading harness, in a Web Worker
  editor.js                CodeMirror + the mobile key bar
  sync.js                  file and cloud sync adapters
  ui.js                    router, shell, shared components
  views/                   one file per screen
content/
  manifest.js              the load order
  t1-*.js … t4-*.js        30 curriculum modules
```

### Why a Web Worker

Beginners write infinite loops. Python runs off the main thread, so the page stays responsive; after
12 seconds the worker is terminated, respawned, and you get a message explaining what an infinite
loop is instead of a frozen tab.

---

## Adding your own content

Curriculum files are plain data. Copy any module in `content/` and add the filename to
`content/manifest.js`.

```js
PQ.defineModule({
  id: 'm31', tier: 4, order: 31, icon: '🧩',
  title: 'My Module',
  blurb: 'One line shown on the card.',
  concepts: [{ id: 'my-concept', name: 'my concept' }],
  lessons: [{
    id: 'm31l1', title: 'A lesson', minutes: 10,
    concepts: ['my-concept'],
    content: L([ '## Heading', '', 'Prose with `inline code`.', '', '~~~py', "print('hi')", '~~~' ]),
    exercises: [{
      kind: 'code', title: 'Do a thing', difficulty: 2,
      prompt: 'Write `double(n)` returning twice `n`.',
      starter: 'def double(n):\n    ',
      hints: ['Multiply by two.'],
      tests: [{ name: 'doubles', call: 'double(4)', expect: 8 }],
      solution: 'def double(n):\n    return n * 2'
    }]
  }],
  checkpoint: { id: 'm31cp', pass: 0.8, items: [ /* exercises, no hints shown */ ] }
});
```

Content uses `~~~` fences and lives in plain JS strings, so nothing needs escaping.

### Test forms

| Form | Checks |
|---|---|
| `{name, call, expect}` | evaluate an expression, compare the result |
| `{name, call, raises, message}` | it must raise that exception |
| `{name, code}` | arbitrary Python; an `AssertionError` message becomes the failure text |
| `{name, out}` / `out_exact` / `out_lines` / `out_re` / `out_not` | check printed output |
| `{name, stdin: [...], out}` | re-run the whole program with different input |
| `requires` / `forbids` | source must (or must not) contain a string or pattern |

Inside a `code` test you also get `_OUT` (the program's stdout) and `_SRC` (the learner's source).
Exercises can declare `files: {'data.csv': '...'}` to give the program a real filesystem, and
`stdin: [...]` to feed `input()`.

### Verify what you write

Open [**/qa.html**](https://geancarlogalanza-lab.github.io/PyQuest/qa.html) (or
`http://localhost:8080/qa.html`). It runs every reference solution against its own test suite plus
structural checks, and reports anything broken.

The shipped curriculum passes **282/282**.

---

## Design notes

[`DESIGN.md`](DESIGN.md) covers the curriculum map, the mastery model, the XP formula, the
event-sourced storage and the sync strategy, and why each was chosen.
