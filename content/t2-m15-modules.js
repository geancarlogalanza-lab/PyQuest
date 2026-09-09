/* Tier 2 · Module 15 — Modules & the Ecosystem */
(function () {
  const L = a => a.join("\n");

  PQ.defineModule({
    id: "m15", tier: 2, order: 15, icon: "📦",
    title: "Modules & the Ecosystem",
    blurb: "Split code across files, use the standard library well, and understand venv and pip.",
    intro: L([
      "Every program bigger than a script lives in several files, and almost every problem you have has",
      "already been solved in the standard library. This module is about not writing code you do not have to."
    ]),
    concepts: [
      { id: "import-forms", name: "import statements", importance: 1.4 },
      { id: "module-main", name: "__name__ == '__main__'", importance: 1.3 },
      { id: "stdlib-datetime", name: "datetime", importance: 1.2 },
      { id: "stdlib-random", name: "random" },
      { id: "stdlib-collections", name: "collections", importance: 1.3 },
      { id: "stdlib-itertools", name: "itertools" },
      { id: "stdlib-math", name: "math and statistics" },
      { id: "packages", name: "packages and layout", importance: 1.2 },
      { id: "venv-pip", name: "venv and pip", importance: 1.3 }
    ],

    lessons: [
      {
        id: "m15l1", title: "import and module structure", minutes: 11,
        concepts: ["import-forms", "module-main", "packages"],
        content: L([
          "## The forms of import",
          "",
          "~~~py",
          "import math                       # the whole module",
          "print(math.sqrt(16))",
          "",
          "from math import sqrt             # one name straight into your file",
          "print(sqrt(16))",
          "",
          "from math import sqrt, pi         # several",
          "import numpy as np                # a shorter alias",
          "from collections import Counter   # a class from a module",
          "~~~",
          "",
          "**Which to use:** prefer `import module` when you want the module name visible at the call site",
          "(`math.sqrt` says where it came from), and `from module import thing` for names you use constantly",
          "or that read naturally alone (`Counter`, `Path`, `dataclass`).",
          "",
          ":::warn Never do this",
          "~~~py",
          "from math import *",
          "~~~",
          "It dumps every name into your file, silently shadowing your own variables and making it impossible",
          "to tell where anything came from. Linters flag it; reviewers reject it.",
          ":::",
          "",
          "## Your own modules",
          "",
          "A module *is* a `.py` file. Given `helpers.py`:",
          "",
          "~~~py",
          "# helpers.py",
          "def shout(text):",
          "    return text.upper()",
          "~~~",
          "",
          "another file next to it can do:",
          "",
          "~~~py",
          "import helpers",
          "print(helpers.shout('hi'))",
          "~~~",
          "",
          ":::trap Do not name a file after a standard module",
          "Creating `random.py` or `json.py` in your project breaks `import random` everywhere, because Python",
          "finds yours first. The resulting errors are baffling — `module 'random' has no attribute 'randint'`.",
          ":::",
          "",
          "## The import side effect",
          "",
          "Importing a module **runs it, top to bottom**, once. Code at the top level of a module executes on",
          "first import.",
          "",
          "~~~py",
          "# helpers.py",
          "print('loading helpers')     # runs when imported -- almost never what you want",
          "~~~",
          "",
          "Which is why every script ends with:",
          "",
          "~~~py",
          "def main():",
          "    print('doing the work')",
          "",
          "if __name__ == '__main__':",
          "    main()",
          "~~~",
          "",
          "`__name__` is `'__main__'` when the file is **run directly**, and the module's name when it is",
          "**imported**. So the guard means *only do this when I am the program being run, not when someone",
          "imports me*.",
          "",
          "Without it, importing your script to reuse one function would run the entire program.",
          "",
          "## Packages",
          "",
          "A package is a directory of modules:",
          "",
          "```text",
          "myapp/",
          "    __init__.py       marks it as a package (can be empty)",
          "    main.py",
          "    models.py",
          "    utils/",
          "        __init__.py",
          "        text.py",
          "```",
          "",
          "~~~py",
          "from myapp.utils.text import clean",
          "~~~",
          "",
          "Dots follow directories. `__init__.py` runs when the package is first imported, and is a good place",
          "to re-export the handful of names you want users of the package to see.",
          "",
          "A sensible small-project layout:",
          "",
          "```text",
          "project/",
          "    src/myapp/        the code",
          "    tests/            the tests",
          "    README.md",
          "    pyproject.toml    dependencies and metadata",
          "```"
        ]),
        exercises: [
          {
            kind: "code", title: "Use the right import", difficulty: 2,
            concepts: ["import-forms"],
            prompt: L([
              "Write `hypotenuse(a, b)` returning the length of the hypotenuse, using `math.sqrt`.",
              "",
              "Import the module (not the function) so the call site reads `math.sqrt(...)`."
            ]),
            starter: "import math\n\n\ndef hypotenuse(a, b):\n    ",
            requires: [{ contains: "math.sqrt", msg: "Call it as math.sqrt(...)" }],
            hints: ["`math.sqrt(a * a + b * b)`"],
            tests: [
              { name: "3, 4, 5 triangle", call: "hypotenuse(3, 4)", expect: 5.0 },
              { name: "another triangle", call: "hypotenuse(5, 12)", expect: 13.0 },
              { name: "zero", call: "hypotenuse(0, 0)", expect: 0.0 }
            ],
            solution: "import math\n\n\ndef hypotenuse(a, b):\n    return math.sqrt(a * a + b * b)"
          },
          {
            kind: "code", title: "The main guard", difficulty: 2,
            concepts: ["module-main"],
            prompt: L([
              "Write a `main()` function that prints `running`, and guard it so it only runs when the file is",
              "executed directly.",
              "",
              "Since this file *is* being run directly, `running` should appear in the output."
            ]),
            starter: "def main():\n    \n\n",
            requires: [{ re: "if\\s+__name__\\s*==\\s*['\\\"]__main__['\\\"]", msg: "Add the __name__ guard" }],
            hints: ["`if __name__ == '__main__':` then `main()` indented under it."],
            tests: [
              { name: "prints running", out_exact: "running" },
              { name: "main is a function", code: "assert callable(main)" },
              { name: "main does not run on import", code: "assert '__main__' in _SRC" }
            ],
            solution: "def main():\n    print('running')\n\n\nif __name__ == '__main__':\n    main()"
          },
          {
            kind: "quiz", title: "What does __name__ hold?", difficulty: 3,
            concepts: ["module-main"],
            prompt: "You run `python app.py`, and `app.py` contains `import helpers`. What is `__name__` inside `helpers.py` while it loads?",
            choices: ["`'__main__'`", "`'helpers'`", "`'app'`", "`None`"],
            answer: 1,
            explain: "`__name__` is `'__main__'` only in the file you actually ran. An imported module gets its own module name — here `'helpers'` — which is exactly what makes the guard work."
          },
          {
            kind: "quiz", title: "Star imports", difficulty: 2,
            concepts: ["import-forms"],
            prompt: "Why is `from module import *` discouraged?",
            choices: [
              "It is slower at runtime",
              "It brings in unknown names that can silently shadow your own variables, and hides where names came from",
              "It only works for standard library modules",
              "It fails if the module has more than 20 names"
            ],
            answer: 1,
            explain: "You lose the ability to tell where a name came from, and an update to the module can suddenly shadow one of your variables — a bug with no obvious cause."
          }
        ]
      },

      {
        id: "m15l2", title: "The standard library you will actually use", minutes: 13,
        concepts: ["stdlib-collections", "stdlib-datetime", "stdlib-random", "stdlib-math", "stdlib-itertools"],
        content: L([
          "## Python comes with a lot",
          "",
          "Before writing a helper, check whether it already exists. It usually does.",
          "",
          "## collections",
          "",
          "~~~py",
          "from collections import Counter, defaultdict, deque",
          "",
          "Counter('mississippi').most_common(2)     # [('i', 4), ('s', 4)]",
          "",
          "groups = defaultdict(list)                # no more setdefault",
          "groups['a'].append(1)                     # the empty list appears automatically",
          "",
          "queue = deque([1, 2, 3])",
          "queue.appendleft(0)                       # fast at BOTH ends, unlike a list",
          "queue.popleft()",
          "~~~",
          "",
          "`list.pop(0)` has to shift every remaining element; `deque.popleft()` does not. For a queue of any",
          "size, that matters.",
          "",
          "## datetime",
          "",
          "~~~py",
          "from datetime import date, datetime, timedelta",
          "",
          "today = date(2024, 3, 11)",
          "print(today.isoformat())                  # 2024-03-11",
          "print(today + timedelta(days=30))         # 2024-04-10",
          "",
          "d = date.fromisoformat('2024-12-25')",
          "print((d - today).days)                   # 289",
          "~~~",
          "",
          "Subtracting two dates gives a `timedelta`; `.days` is the number you usually want.",
          "`.strftime('%d %B %Y')` formats for humans; `.isoformat()` formats for machines.",
          "",
          ":::warn Never do date maths yourself",
          "Leap years, month lengths, daylight saving and time zones make hand-rolled date arithmetic wrong",
          "in ways that only show up in production, in February.",
          ":::",
          "",
          "## random",
          "",
          "~~~py",
          "import random",
          "",
          "random.randint(1, 6)                       # 1 to 6, both included",
          "random.choice(['a', 'b', 'c'])",
          "random.sample(range(50), 6)                # 6 distinct values",
          "random.shuffle(my_list)                    # in place, returns None",
          "random.seed(42)                            # reproducible sequences",
          "~~~",
          "",
          "`random.seed(n)` makes the sequence repeatable — essential for tests, and for debugging anything",
          "that involves randomness.",
          "",
          "## math and statistics",
          "",
          "~~~py",
          "import math, statistics",
          "",
          "math.ceil(4.1)      # 5      math.floor(4.9)  # 4",
          "math.isclose(0.1 + 0.2, 0.3)                # True",
          "math.inf                                     # bigger than any number",
          "",
          "statistics.mean([1, 2, 3])       # 2",
          "statistics.median([1, 2, 100])   # 2   -- resistant to outliers",
          "statistics.stdev([1, 2, 3, 4])",
          "~~~",
          "",
          "## itertools",
          "",
          "~~~py",
          "from itertools import chain, combinations, groupby, count",
          "",
          "list(chain([1, 2], [3]))                    # [1, 2, 3]",
          "list(combinations('abc', 2))                # [('a','b'), ('a','c'), ('b','c')]",
          "~~~",
          "",
          "## How to find things",
          "",
          "~~~py",
          "import statistics",
          "print(dir(statistics))          # what is in here?",
          "help(statistics.median)         # what does this do?",
          "~~~",
          "",
          "`dir()` and `help()` work offline, in any Python, on any object. They are the fastest way to answer",
          "*what can this thing do?* without opening a browser."
        ]),
        exercises: [
          {
            kind: "code", title: "Counter to the rescue", difficulty: 2,
            concepts: ["stdlib-collections"],
            prompt: L([
              "Write `top_letters(text, n)` returning the `n` most common characters as a list of",
              "`(character, count)` tuples, using `collections.Counter`.",
              "",
              "`top_letters('mississippi', 2)` → `[('i', 4), ('s', 4)]`"
            ]),
            starter: "from collections import Counter\n\n\ndef top_letters(text, n):\n    ",
            requires: [{ contains: "Counter", msg: "Use collections.Counter" }],
            hints: ["`Counter(text).most_common(n)` does all of it."],
            tests: [
              { name: "two most common", call: "top_letters('mississippi', 2)", expect: [["i", 4], ["s", 4]] },
              { name: "single most common", call: "top_letters('aaab', 1)", expect: [["a", 3]] },
              { name: "empty text", call: "top_letters('', 3)", expect: [] }
            ],
            solution: "from collections import Counter\n\n\ndef top_letters(text, n):\n    return Counter(text).most_common(n)"
          },
          {
            kind: "code", title: "Days until", difficulty: 3,
            concepts: ["stdlib-datetime"],
            prompt: L([
              "Write `days_between(a, b)` where both arguments are ISO date strings like `'2024-03-11'`,",
              "returning how many days from `a` to `b` (negative if `b` is earlier).",
              "",
              "`days_between('2024-03-11', '2024-12-25')` → `289`"
            ]),
            starter: "from datetime import date\n\n\ndef days_between(a, b):\n    ",
            hints: [
              "`date.fromisoformat('2024-03-11')` parses the string.",
              "Subtracting two dates gives a `timedelta`; take `.days`."
            ],
            tests: [
              { name: "forwards", call: "days_between('2024-03-11', '2024-12-25')", expect: 289 },
              { name: "backwards is negative", call: "days_between('2024-12-25', '2024-03-11')", expect: -289 },
              { name: "same day is zero", call: "days_between('2024-01-01', '2024-01-01')", expect: 0 },
              { name: "leap day is counted", call: "days_between('2024-02-28', '2024-03-01')", expect: 2 }
            ],
            solution: L([
              "from datetime import date",
              "",
              "",
              "def days_between(a, b):",
              "    return (date.fromisoformat(b) - date.fromisoformat(a)).days"
            ]),
            takeaway: "2024 is a leap year, so 28 Feb to 1 Mar is two days, not one. This is exactly the kind of thing you do not want to hand-code."
          },
          {
            kind: "code", title: "Reproducible randomness", difficulty: 3,
            concepts: ["stdlib-random"],
            prompt: L([
              "Write `roll_dice(n, seed)` returning a list of `n` dice rolls (1–6), made reproducible by seeding",
              "the generator with `seed` first.",
              "",
              "Calling it twice with the same seed must give identical results."
            ]),
            starter: "import random\n\n\ndef roll_dice(n, seed):\n    ",
            hints: ["`random.seed(seed)` before rolling.", "`random.randint(1, 6)` includes both ends."],
            tests: [
              { name: "returns n rolls", code: "assert len(roll_dice(5, 1)) == 5" },
              { name: "all in range", code: "assert all(1 <= r <= 6 for r in roll_dice(50, 3))" },
              { name: "same seed, same rolls", code: "assert roll_dice(10, 42) == roll_dice(10, 42), 'seeding must make it reproducible'" },
              { name: "different seeds differ", code: "assert roll_dice(20, 1) != roll_dice(20, 2)" },
              { name: "zero rolls", code: "assert roll_dice(0, 1) == []" }
            ],
            solution: L([
              "import random",
              "",
              "",
              "def roll_dice(n, seed):",
              "    random.seed(seed)",
              "    return [random.randint(1, 6) for _ in range(n)]"
            ]),
            takeaway: "Untestable randomness is a real problem. Seeding turns a random program into a deterministic one you can write assertions about."
          },
          {
            kind: "refactor", title: "Replace the hand-rolled version", difficulty: 3,
            concepts: ["stdlib-collections", "stdlib-math"],
            prompt: L([
              "Rewrite these two functions using the standard library instead of manual loops.",
              "",
              "- `counts(items)` → use `collections.Counter` (return a plain `dict`)",
              "- `middle(numbers)` → use `statistics.median`",
              "",
              "Behaviour must not change. The checks forbid `for` loops."
            ]),
            starter: L([
              "def counts(items):",
              "    result = {}",
              "    for item in items:",
              "        result[item] = result.get(item, 0) + 1",
              "    return result",
              "",
              "",
              "def middle(numbers):",
              "    ordered = sorted(numbers)",
              "    n = len(ordered)",
              "    if n % 2 == 1:",
              "        return ordered[n // 2]",
              "    return (ordered[n // 2 - 1] + ordered[n // 2]) / 2"
            ]),
            forbids: [{ re: "\\n\\s+for\\s", msg: "No loops — use the standard library" }],
            hints: [
              "`dict(Counter(items))` gives a plain dictionary.",
              "`statistics.median(numbers)` handles both odd and even lengths."
            ],
            tests: [
              { name: "counts still work", call: "counts(['a', 'b', 'a'])", expect: { a: 2, b: 1 } },
              { name: "counts returns a dict", code: "assert type(counts(['a'])) is dict" },
              { name: "median of odd length", call: "middle([3, 1, 2])", expect: 2 },
              { name: "median of even length", call: "middle([1, 2, 3, 4])", expect: 2.5 },
              { name: "empty counts", call: "counts([])", expect: {} }
            ],
            solution: L([
              "from collections import Counter",
              "import statistics",
              "",
              "",
              "def counts(items):",
              "    return dict(Counter(items))",
              "",
              "",
              "def middle(numbers):",
              "    return statistics.median(numbers)"
            ]),
            takeaway: "Ten lines became two, and the standard library version is better tested than anything you will write this afternoon."
          }
        ]
      },

      {
        id: "m15l3", title: "Environments and dependencies", minutes: 10,
        concepts: ["venv-pip", "packages"],
        content: L([
          "## The problem virtual environments solve",
          "",
          "Project A needs version 1 of a library. Project B needs version 2. Installing packages globally means",
          "one of them is always broken.",
          "",
          "A **virtual environment** is a private folder holding its own Python and its own packages.",
          "",
          "~~~text",
          "python -m venv .venv          # create it",
          "",
          "source .venv/bin/activate     # macOS / Linux",
          ".venv\\Scripts\\activate       # Windows",
          "",
          "pip install requests          # goes into .venv, not your system",
          "deactivate                    # leave it",
          "~~~",
          "",
          "**Rule: one virtual environment per project, always.** Never `pip install` into your system Python.",
          "Add `.venv/` to `.gitignore` — it is rebuilt from your dependency list, never committed.",
          "",
          "## Recording dependencies",
          "",
          "~~~text",
          "pip freeze > requirements.txt      # what is installed, exactly",
          "pip install -r requirements.txt    # reproduce it elsewhere",
          "~~~",
          "",
          "Modern projects declare dependencies in `pyproject.toml` instead:",
          "",
          "~~~text",
          "[project]",
          "name = \"myapp\"",
          "version = \"0.1.0\"",
          "dependencies = [\"requests>=2.31\", \"rich\"]",
          "~~~",
          "",
          ":::why Pinning versions",
          "`requests` means *any version*, and a library that changes its behaviour will break your project on a",
          "random Tuesday. `requests>=2.31,<3` says which changes you are prepared to accept. Reproducible builds",
          "are the difference between \"works on my machine\" and \"works\".",
          ":::",
          "",
          "## Finding packages",
          "",
          "Packages live on **PyPI** (pypi.org). Before adding one, ask:",
          "",
          "- is it maintained? (last release, open issues)",
          "- how many other things does it drag in?",
          "- could the standard library do this?",
          "",
          "Every dependency is code you did not write, cannot easily audit, and now have to keep updated.",
          "Popular ones are usually worth it; a package that saves you four lines is usually not.",
          "",
          "## Ones worth knowing",
          "",
          "| Package | For |",
          "|---|---|",
          "| `requests` | HTTP, far nicer than the standard library |",
          "| `pytest` | testing (Module 20) |",
          "| `rich` | colourful terminal output |",
          "| `pydantic` | validating structured data |",
          "| `pandas` | tabular data analysis |",
          "| `fastapi` / `flask` | building web APIs |",
          "",
          ":::tip In PyQuest",
          "Only the standard library is available here, deliberately: it works offline, it never changes under",
          "you, and it is more than enough to become genuinely good at Python. Everything you learn transfers",
          "directly to a project with dependencies.",
          ":::"
        ]),
        exercises: [
          {
            kind: "quiz", title: "Why a virtual environment", difficulty: 2,
            concepts: ["venv-pip"],
            prompt: "What problem does `python -m venv .venv` primarily solve?",
            choices: [
              "It makes Python run faster",
              "It gives each project its own isolated package versions, so projects cannot break each other",
              "It compiles your code",
              "It uploads your project to PyPI"
            ],
            answer: 1,
            explain: "Two projects needing different versions of the same library cannot both work with a single global install. A virtual environment gives each its own private set of packages."
          },
          {
            kind: "quiz", title: "Committing dependencies", difficulty: 3,
            concepts: ["venv-pip"],
            prompt: "Which of these belongs in version control?",
            choices: [
              "The `.venv/` directory",
              "`requirements.txt` or `pyproject.toml`",
              "Both",
              "Neither"
            ],
            answer: 1,
            explain: "The dependency *list* is the source of truth and belongs in the repository. The `.venv/` folder is large, machine-specific and fully reproducible from that list — it goes in `.gitignore`."
          },
          {
            kind: "code", title: "Build a small module", difficulty: 3,
            concepts: ["packages", "module-main"],
            prompt: L([
              "Write a small text-utilities module in this file:",
              "",
              "- `slugify(text)` → lowercase, spaces to hyphens, surrounding whitespace removed",
              "- `truncate(text, limit)` → if longer than `limit`, cut to `limit` characters and append `'...'`",
              "- a `main()` that prints `slugify('  Hello World  ')`, guarded by `if __name__ == '__main__':`",
              "",
              "Expected output when run: `hello-world`"
            ]),
            starter: "def slugify(text):\n    \n\ndef truncate(text, limit):\n    \n\ndef main():\n    \n\n",
            requires: [{ re: "if\\s+__name__\\s*==", msg: "Guard main() with the __name__ check" }],
            hints: [
              "`text.strip().lower().replace(' ', '-')`",
              "`truncate`: return the text unchanged when `len(text) <= limit`.",
              "The suffix `'...'` is added *after* cutting, so the result is `limit + 3` characters."
            ],
            tests: [
              { name: "slugify works", call: "slugify('  Hello World  ')", expect: "hello-world" },
              { name: "slugify leaves clean text alone", call: "slugify('python')", expect: "python" },
              { name: "truncate cuts long text", call: "truncate('abcdefgh', 3)", expect: "abc..." },
              { name: "truncate leaves short text alone", call: "truncate('ab', 5)", expect: "ab" },
              { name: "truncate at exactly the limit", call: "truncate('abc', 3)", expect: "abc" },
              { name: "main runs when executed directly", out_exact: "hello-world" }
            ],
            solution: L([
              "def slugify(text):",
              "    return text.strip().lower().replace(' ', '-')",
              "",
              "",
              "def truncate(text, limit):",
              "    if len(text) <= limit:",
              "        return text",
              "    return text[:limit] + '...'",
              "",
              "",
              "def main():",
              "    print(slugify('  Hello World  '))",
              "",
              "",
              "if __name__ == '__main__':",
              "    main()"
            ]),
            takeaway: "Reusable functions at the top, a `main()` that uses them, a guard at the bottom. That is the standard shape of a Python file that is both a script and a module."
          },
          {
            kind: "code", title: "Pick the right tool", difficulty: 3,
            concepts: ["stdlib-collections", "stdlib-math"],
            prompt: L([
              "Write `summarise(numbers)` returning a dictionary with keys `count`, `mean`, `median` and `mode`.",
              "",
              "Use the `statistics` module for all three statistics. An empty list returns",
              "`{'count': 0, 'mean': None, 'median': None, 'mode': None}`.",
              "",
              "`mean` and `median` should be rounded to 2 decimal places."
            ]),
            starter: "import statistics\n\n\ndef summarise(numbers):\n    ",
            hints: [
              "Guard the empty case first.",
              "`statistics.mean`, `statistics.median`, `statistics.mode`.",
              "`mode` returns the most common value; for a tie it returns the first encountered."
            ],
            tests: [
              { name: "normal case", call: "summarise([1, 2, 2, 3])", expect: { count: 4, mean: 2.0, median: 2.0, mode: 2 } },
              { name: "empty list", code: "assert summarise([]) == {'count': 0, 'mean': None, 'median': None, 'mode': None}" },
              { name: "rounds the mean", call: "summarise([1, 2, 2])['mean']", expect: 1.67 },
              { name: "single value", call: "summarise([5])", expect: { count: 1, mean: 5.0, median: 5.0, mode: 5 } }
            ],
            solution: L([
              "import statistics",
              "",
              "",
              "def summarise(numbers):",
              "    if not numbers:",
              "        return {'count': 0, 'mean': None, 'median': None, 'mode': None}",
              "    return {",
              "        'count': len(numbers),",
              "        'mean': round(statistics.mean(numbers), 2),",
              "        'median': round(statistics.median(numbers), 2),",
              "        'mode': statistics.mode(numbers),",
              "    }"
            ])
          }
        ]
      }
    ],

    checkpoint: {
      id: "m15cp", pass: 0.8,
      title: "Checkpoint: Modules & the Ecosystem",
      items: [
        {
          kind: "quiz", title: "The guard", difficulty: 2, concepts: ["module-main"],
          prompt: "What does `if __name__ == '__main__':` prevent?",
          choices: [
            "The file from being imported at all",
            "The script's top-level work from running when the file is imported by something else",
            "Syntax errors in the module",
            "Circular imports"
          ],
          answer: 1,
          explain: "Importing a module runs it. The guard separates *definitions* (always wanted) from *the program* (only wanted when run directly)."
        },
        {
          kind: "code", title: "Group with defaultdict", difficulty: 3, concepts: ["stdlib-collections"],
          prompt: "Write `group_by_length(words)` returning a plain `dict` mapping word length to the list of words of that length. Use `collections.defaultdict`.",
          starter: "from collections import defaultdict\n\n\ndef group_by_length(words):\n    ",
          tests: [
            { name: "groups", call: "group_by_length(['a', 'bb', 'cc'])", expect: { 1: ["a"], 2: ["bb", "cc"] } },
            { name: "returns a plain dict", code: "from collections import defaultdict\nassert type(group_by_length(['a'])) is dict" },
            { name: "empty", call: "group_by_length([])", expect: {} }
          ]
        },
        {
          kind: "code", title: "Date arithmetic", difficulty: 3, concepts: ["stdlib-datetime"],
          prompt: "Write `add_days(iso_date, n)` returning the ISO string `n` days later. `add_days('2024-02-28', 2)` → `'2024-03-01'`.",
          starter: "from datetime import date, timedelta\n\n\ndef add_days(iso_date, n):\n    ",
          tests: [
            { name: "crosses a leap day", call: "add_days('2024-02-28', 2)", expect: "2024-03-01" },
            { name: "crosses a year", call: "add_days('2023-12-31', 1)", expect: "2024-01-01" },
            { name: "negative goes back", call: "add_days('2024-01-01', -1)", expect: "2023-12-31" }
          ]
        },
        {
          kind: "quiz", title: "Naming a file", difficulty: 3, concepts: ["import-forms"],
          prompt: "You create `random.py` in your project folder, then `import random` fails oddly elsewhere. Why?",
          choices: [
            "Python reserves that filename",
            "Your file shadows the standard library module, and Python finds yours first",
            "The file needs an __init__.py",
            "Modules cannot be lowercase"
          ],
          answer: 1,
          explain: "The current directory comes early in Python's module search path, so your file wins. The errors are confusing because the import succeeds — it just imports the wrong thing."
        },
        {
          kind: "code", title: "Chain the lists", difficulty: 3, concepts: ["stdlib-itertools"],
          prompt: "Write `merge_all(lists)` returning one flat list from a list of lists, using `itertools.chain`.",
          starter: "from itertools import chain\n\n\ndef merge_all(lists):\n    ",
          tests: [
            { name: "merges", call: "merge_all([[1, 2], [3], []])", expect: [1, 2, 3] },
            { name: "empty input", call: "merge_all([])", expect: [] }
          ]
        }
      ]
    }
  });
})();
