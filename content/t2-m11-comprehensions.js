/* Tier 2 · Module 11 — Comprehensions */
(function () {
  const L = a => a.join("\n");

  PQ.defineModule({
    id: "m11", tier: 2, order: 11, icon: "✨",
    title: "Comprehensions",
    blurb: "Say what you want instead of how to accumulate it — and know when not to.",
    intro: L([
      "A comprehension is a loop that builds a collection, written as a single expression. Used well it makes",
      "intent obvious. Used badly it produces the least readable line in the file. This module covers both."
    ]),
    concepts: [
      { id: "list-comp", name: "list comprehensions", importance: 1.6 },
      { id: "comp-filter", name: "filtering in comprehensions", importance: 1.4 },
      { id: "dict-comp", name: "dict comprehensions", importance: 1.3 },
      { id: "set-comp", name: "set comprehensions" },
      { id: "nested-comp", name: "nested comprehensions" },
      { id: "comp-readability", name: "when not to comprehend", importance: 1.3 },
      { id: "any-all", name: "any() and all()", importance: 1.2 }
    ],

    lessons: [
      {
        id: "m11l1", title: "The list comprehension", minutes: 11,
        concepts: ["list-comp", "comp-filter"],
        content: L([
          "## From loop to comprehension",
          "",
          "You have written this shape many times:",
          "",
          "~~~py",
          "squares = []",
          "for n in range(5):",
          "    squares.append(n * n)",
          "~~~",
          "",
          "The comprehension is the same thing in one line:",
          "",
          "~~~py",
          "squares = [n * n for n in range(5)]",
          "print(squares)",
          "~~~",
          "~~~out",
          "[0, 1, 4, 9, 16]",
          "~~~",
          "",
          "Read it in this order: **for n in range(5)** … **n * n** … collect into a list.",
          "The expression comes first because that is the *result*, which is what you care about.",
          "",
          "## Adding a filter",
          "",
          "~~~py",
          "evens = [n for n in range(10) if n % 2 == 0]",
          "print(evens)",
          "~~~",
          "~~~out",
          "[0, 2, 4, 6, 8]",
          "~~~",
          "",
          "The `if` at the end **selects** which items get through. Same as:",
          "",
          "~~~py",
          "evens = []",
          "for n in range(10):",
          "    if n % 2 == 0:",
          "        evens.append(n)",
          "~~~",
          "",
          "## Transform and filter together",
          "",
          "~~~py",
          "words = ['ant', 'bee', 'crocodile', 'dog']",
          "long_upper = [w.upper() for w in words if len(w) > 3]",
          "print(long_upper)",
          "~~~",
          "~~~out",
          "['CROCODILE']",
          "~~~",
          "",
          "The filter runs first, then the expression. Order in the source is expression → for → if;",
          "order of execution is for → if → expression.",
          "",
          ":::warn if before for means something else",
          "~~~py",
          "[n if n > 0 else 0 for n in values]",
          "~~~",
          "That is a **conditional expression** (a ternary) choosing what value to produce — it keeps every item.",
          "The trailing `if` **removes** items. Both are useful; they are not the same thing.",
          ":::",
          "",
          "## Comprehensions over anything iterable",
          "",
          "~~~py",
          "print([c for c in 'hello' if c not in 'aeiou'])   # ['h', 'l', 'l']",
          "print([len(line) for line in text.splitlines()])",
          "print([row[0] for row in grid])                    # first column",
          "~~~",
          "",
          "That last one is a genuinely nice use: extracting one field from a list of records reads much better",
          "as a comprehension than as four lines of loop."
        ]),
        exercises: [
          {
            kind: "code", title: "Squares", difficulty: 1,
            concepts: ["list-comp"],
            prompt: L([
              "Write `squares(n)` returning a list of the squares of `1` to `n` inclusive, using a comprehension.",
              "",
              "`squares(4)` → `[1, 4, 9, 16]`"
            ]),
            starter: "def squares(n):\n    ",
            requires: [{ re: "\\[.*for.*in.*\\]", msg: "Use a list comprehension" }],
            hints: ["`[i * i for i in range(1, n + 1)]`"],
            tests: [
              { name: "four squares", call: "squares(4)", expect: [1, 4, 9, 16] },
              { name: "one", call: "squares(1)", expect: [1] },
              { name: "zero gives empty", call: "squares(0)", expect: [] }
            ],
            solution: "def squares(n):\n    return [i * i for i in range(1, n + 1)]"
          },
          {
            kind: "refactor", title: "Loop to comprehension", difficulty: 2,
            concepts: ["list-comp", "comp-filter"],
            prompt: L([
              "Rewrite this function body as a **single** comprehension. Behaviour must not change.",
              "",
              "The checks require that no `for` statement appears on its own line."
            ]),
            starter: L([
              "def long_words(words, n):",
              "    result = []",
              "    for word in words:",
              "        if len(word) > n:",
              "            result.append(word.lower())",
              "    return result"
            ]),
            forbids: [{ re: "\\n\\s+for\\s", msg: "Use a comprehension, not a for statement" }],
            hints: ["Expression: `word.lower()`. Source: `for word in words`. Filter: `if len(word) > n`."],
            tests: [
              { name: "filters and lowercases", call: "long_words(['Ant', 'Crocodile', 'Bee'], 3)", expect: ["crocodile"] },
              { name: "strictly longer", call: "long_words(['abcd'], 4)", expect: [] },
              { name: "empty input", call: "long_words([], 1)", expect: [] }
            ],
            solution: "def long_words(words, n):\n    return [word.lower() for word in words if len(word) > n]"
          },
          {
            kind: "predict", title: "Filter or choose", difficulty: 3,
            concepts: ["comp-filter"],
            prompt: L([
              "What are the lengths of these two lists?",
              "",
              "~~~py",
              "values = [-2, 3, -4, 5]",
              "a = [n for n in values if n > 0]",
              "b = [n if n > 0 else 0 for n in values]",
              "print(len(a), len(b))",
              "~~~"
            ]),
            choices: ["`2 2`", "`2 4`", "`4 4`", "`4 2`"],
            answer: 1,
            explain: L([
              "The trailing `if` in `a` **removes** items, leaving 2.",
              "",
              "In `b` the `if/else` sits in the *expression* position and only decides what value to produce,",
              "so all 4 items survive: `[0, 3, 0, 5]`."
            ])
          },
          {
            kind: "code", title: "Extract a column", difficulty: 2,
            concepts: ["list-comp"],
            prompt: L([
              "`rows` is a list of `(name, score)` tuples. Write `names_of(rows, threshold)` returning the names",
              "of everyone scoring at least `threshold`, in order.",
              "",
              "One comprehension."
            ]),
            starter: "def names_of(rows, threshold):\n    ",
            requires: [{ re: "\\[.*for.*in.*\\]", msg: "Use a list comprehension" }],
            hints: ["Unpacking works in a comprehension: `for name, score in rows`."],
            tests: [
              { name: "filters by score", call: "names_of([('a', 90), ('b', 40), ('c', 70)], 70)", expect: ["a", "c"] },
              { name: "threshold inclusive", call: "names_of([('a', 50)], 50)", expect: ["a"] },
              { name: "none qualify", call: "names_of([('a', 1)], 99)", expect: [] }
            ],
            solution: "def names_of(rows, threshold):\n    return [name for name, score in rows if score >= threshold]"
          }
        ]
      },

      {
        id: "m11l2", title: "Dicts, sets and nesting", minutes: 11,
        concepts: ["dict-comp", "set-comp", "nested-comp", "any-all"],
        content: L([
          "## Dict comprehensions",
          "",
          "~~~py",
          "words = ['ant', 'bee', 'crocodile']",
          "lengths = {w: len(w) for w in words}",
          "print(lengths)",
          "~~~",
          "~~~out",
          "{'ant': 3, 'bee': 3, 'crocodile': 9}",
          "~~~",
          "",
          "The only difference is `key: value` instead of a single expression, and braces instead of brackets.",
          "",
          "Common uses:",
          "",
          "~~~py",
          "# invert a dictionary",
          "{v: k for k, v in original.items()}",
          "",
          "# keep only some keys",
          "{k: v for k, v in settings.items() if v is not None}",
          "",
          "# index records by id",
          "{user['id']: user for user in users}",
          "~~~",
          "",
          "That last one is worth remembering: turning a list of records into a lookup table by id is a",
          "one-liner and turns an O(n) search into an instant lookup.",
          "",
          "## Set comprehensions",
          "",
          "~~~py",
          "initials = {name[0] for name in ['ada', 'alan', 'bo']}",
          "print(initials)      # {'a', 'b'}",
          "~~~",
          "",
          "Braces with no colon. Duplicates disappear automatically.",
          "",
          "## Nested loops in a comprehension",
          "",
          "~~~py",
          "grid = [[1, 2], [3, 4]]",
          "flat = [value for row in grid for value in row]",
          "print(flat)      # [1, 2, 3, 4]",
          "~~~",
          "",
          "The `for` clauses read **left to right, outer to inner** — the same order you would write them as",
          "nested statements. This is the one comprehension form people consistently get backwards, so read it",
          "slowly: *for each row, for each value in that row, take value*.",
          "",
          "## any() and all()",
          "",
          "Comprehensions pair naturally with two built-ins:",
          "",
          "~~~py",
          "scores = [80, 45, 90]",
          "",
          "print(any(s < 50 for s in scores))     # True  -- at least one failed",
          "print(all(s >= 50 for s in scores))    # False -- not everyone passed",
          "~~~",
          "",
          "Note there are no brackets inside — that is a **generator expression**, which stops as soon as the",
          "answer is known instead of building a whole list. `any()` on a million items can finish on the first one.",
          "",
          "This replaces the flag-and-break loop you wrote in Module 5:",
          "",
          "~~~py",
          "is_prime = all(n % d != 0 for d in range(2, n))",
          "~~~",
          "",
          ":::tip Empty cases",
          "`any([])` is `False` and `all([])` is `True`. \"All zero of these are valid\" is vacuously true —",
          "surprising the first time, and mathematically correct.",
          ":::"
        ]),
        exercises: [
          {
            kind: "code", title: "Index by id", difficulty: 2,
            concepts: ["dict-comp"],
            prompt: L([
              "`users` is a list of dictionaries each with an `id` key. Write `by_id(users)` returning a dictionary",
              "mapping each id to its whole record.",
              "",
              "Use a dict comprehension."
            ]),
            starter: "def by_id(users):\n    ",
            requires: [{ re: "\\{.*:.*for.*in.*\\}", msg: "Use a dict comprehension" }],
            hints: ["`{u['id']: u for u in users}`"],
            tests: [
              { name: "indexes correctly", call: "by_id([{'id': 7, 'name': 'ada'}])[7]['name']", expect: "ada" },
              { name: "two records", call: "sorted(by_id([{'id': 1}, {'id': 2}]).keys())", expect: [1, 2] },
              { name: "empty", call: "by_id([])", expect: {} }
            ],
            solution: "def by_id(users):\n    return {user['id']: user for user in users}"
          },
          {
            kind: "code", title: "Drop the empties", difficulty: 2,
            concepts: ["dict-comp", "comp-filter"],
            prompt: L([
              "Write `clean(settings)` returning a new dictionary with every key whose value is `None` removed.",
              "",
              "`clean({'a': 1, 'b': None})` → `{'a': 1}`. Note that `0` and `''` must be **kept** — only `None` goes."
            ]),
            starter: "def clean(settings):\n    ",
            hints: ["`if v is not None` — use `is not`, not `!=`.", "`0` is falsy but is not `None`, so a truthiness test would wrongly drop it."],
            tests: [
              { name: "removes None", call: "clean({'a': 1, 'b': None})", expect: { a: 1 } },
              { name: "keeps zero and empty string", call: "clean({'a': 0, 'b': '', 'c': None})", expect: { a: 0, b: "" } },
              { name: "nothing to remove", call: "clean({'a': 1})", expect: { a: 1 } },
              { name: "empty", call: "clean({})", expect: {} }
            ],
            solution: "def clean(settings):\n    return {k: v for k, v in settings.items() if v is not None}",
            takeaway: "`if v` and `if v is not None` differ on `0`, `''`, `[]` and `False`. Choosing the wrong one is a real and common data bug."
          },
          {
            kind: "code", title: "Flatten with a comprehension", difficulty: 3,
            concepts: ["nested-comp"],
            prompt: L([
              "Write `flatten(grid)` turning `[[1, 2], [3]]` into `[1, 2, 3]` with a single nested comprehension.",
              "",
              "The clause order is the same as the nested loops would be."
            ]),
            starter: "def flatten(grid):\n    ",
            forbids: [{ re: "\\n\\s+for\\s", msg: "One comprehension, no for statements" }],
            hints: ["`[value for row in grid for value in row]`", "Outer loop first, inner loop second — left to right."],
            tests: [
              { name: "flattens", call: "flatten([[1, 2], [3]])", expect: [1, 2, 3] },
              { name: "empty rows disappear", call: "flatten([[], [1], []])", expect: [1] },
              { name: "empty grid", call: "flatten([])", expect: [] }
            ],
            solution: "def flatten(grid):\n    return [value for row in grid for value in row]"
          },
          {
            kind: "code", title: "Validate with all()", difficulty: 3,
            concepts: ["any-all"],
            prompt: L([
              "Write two functions:",
              "",
              "- `all_passed(scores)` — `True` when every score is 50 or more (and `True` for an empty list)",
              "- `has_perfect(scores)` — `True` when at least one score is exactly 100",
              "",
              "Use `all()` and `any()` — the checks forbid `for` statements."
            ]),
            starter: "def all_passed(scores):\n    \n\ndef has_perfect(scores):\n    ",
            forbids: [{ re: "\\n\\s+for\\s", msg: "Use any()/all() with a generator expression" }],
            hints: ["`all(s >= 50 for s in scores)`", "`any(s == 100 for s in scores)`"],
            tests: [
              { name: "all passed", call: "all_passed([50, 90])", expect: true },
              { name: "one failure", call: "all_passed([50, 20])", expect: false },
              { name: "empty is vacuously true", call: "all_passed([])", expect: true },
              { name: "finds a perfect score", call: "has_perfect([1, 100])", expect: true },
              { name: "no perfect score", call: "has_perfect([99])", expect: false },
              { name: "empty has none", call: "has_perfect([])", expect: false }
            ],
            solution: L([
              "def all_passed(scores):",
              "    return all(s >= 50 for s in scores)",
              "",
              "def has_perfect(scores):",
              "    return any(s == 100 for s in scores)"
            ])
          }
        ]
      },

      {
        id: "m11l3", title: "When not to use one", minutes: 9,
        concepts: ["comp-readability", "list-comp"],
        content: L([
          "## Comprehensions are for building collections",
          "",
          "That is the whole rule. If the result is a list, dict or set, a comprehension is a good candidate.",
          "If you are doing something *else* — printing, saving, calling an API — use a loop.",
          "",
          "~~~py",
          "[print(x) for x in items]      # WRONG: builds a list of None just to throw it away",
          "",
          "for x in items:                 # right",
          "    print(x)",
          "~~~",
          "",
          "A comprehension used for side effects tells the reader *this produces a collection*, and then lies.",
          "",
          "## Length and nesting limits",
          "",
          "This is technically one expression and practically unreadable:",
          "",
          "~~~py",
          "result = [transform(x) for sub in data for x in sub if x.valid and x.score > threshold and x.name not in seen]",
          "~~~",
          "",
          "Rules of thumb that hold up in real code review:",
          "",
          "- **one** `for` clause, optionally **one** `if` — fine",
          "- **two** `for` clauses — only for flattening, and only if it fits on one line",
          "- three or more, or a condition needing brackets to understand — write the loop",
          "",
          ":::why Readability is a real engineering property",
          "The loop version has more lines and less cleverness, and can be debugged with a print statement",
          "inside it. The comprehension cannot. When in doubt, the version you can step through wins.",
          ":::",
          "",
          "## Generator expressions: same syntax, no list",
          "",
          "~~~py",
          "total = sum(x * x for x in range(1_000_000))",
          "~~~",
          "",
          "No brackets means nothing is stored — values are produced one at a time and thrown away after use.",
          "For a million items that is the difference between a few bytes and tens of megabytes.",
          "",
          "Use a generator expression when you are feeding straight into `sum`, `max`, `any`, `all`, `join`",
          "or a `for` loop. Use a list comprehension when you actually need the list afterwards.",
          "",
          "~~~py",
          "', '.join(str(n) for n in numbers)      # generator: perfect",
          "results = [f(x) for x in items]         # list: you need it later",
          "~~~",
          "",
          "Module 18 goes much deeper into what a generator really is."
        ]),
        exercises: [
          {
            kind: "refactor", title: "Undo the cleverness", difficulty: 3,
            concepts: ["comp-readability"],
            prompt: L([
              "This comprehension is doing too much. Rewrite `report` as a readable loop that produces the same list.",
              "",
              "The checks forbid comprehensions here — the point is recognising when the loop is better."
            ]),
            starter: L([
              "def report(rows):",
              "    return [f\"{n.title()}: {s}\" for n, s in rows if s >= 50 and n and not n.startswith('_')]"
            ]),
            forbids: [{ re: "for[^\\n]*\\]", msg: "Write it as a loop, not a comprehension" }],
            hints: [
              "Start with `result = []` and a `for n, s in rows:` loop.",
              "Turn the compound condition into a guard: `if s < 50: continue` and so on.",
              "Append the formatted string and return the list."
            ],
            tests: [
              { name: "formats and filters", call: "report([('ada', 90), ('bo', 10), ('_x', 99)])", expect: ["Ada: 90"] },
              { name: "empty names skipped", call: "report([('', 90)])", expect: [] },
              { name: "boundary is inclusive", call: "report([('cy', 50)])", expect: ["Cy: 50"] },
              { name: "empty input", call: "report([])", expect: [] }
            ],
            solution: L([
              "def report(rows):",
              "    result = []",
              "    for name, score in rows:",
              "        if not name:",
              "            continue",
              "        if name.startswith('_'):",
              "            continue",
              "        if score < 50:",
              "            continue",
              "        result.append(f'{name.title()}: {score}')",
              "    return result"
            ]),
            takeaway: "Guard clauses inside a loop are usually clearer than a compound `and` condition — and each rejection reason is now visible on its own line."
          },
          {
            kind: "quiz", title: "Side effects", difficulty: 2,
            concepts: ["comp-readability"],
            prompt: "Why is `[print(x) for x in items]` considered bad style?",
            choices: [
              "It is slower than a for loop",
              "It builds and discards a list of None values, and misleads the reader about what the line produces",
              "print cannot be used inside a comprehension",
              "It only prints the first item"
            ],
            answer: 1,
            explain: "It works, but it constructs a throwaway list and signals *this expression produces a collection* when it does not. Comprehensions are for building things; loops are for doing things."
          },
          {
            kind: "code", title: "Generator, not list", difficulty: 2,
            concepts: ["comp-readability"],
            prompt: L([
              "Write `total_length(words)` returning the combined length of all the words, using `sum()` with a",
              "**generator expression** — no square brackets."
            ]),
            starter: "def total_length(words):\n    ",
            forbids: [{ re: "sum\\(\\[", msg: "Use a generator expression, not a list comprehension" }],
            hints: ["`sum(len(w) for w in words)`"],
            tests: [
              { name: "adds up lengths", call: "total_length(['ab', 'cde'])", expect: 5 },
              { name: "empty is zero", call: "total_length([])", expect: 0 }
            ],
            solution: "def total_length(words):\n    return sum(len(w) for w in words)"
          },
          {
            kind: "code", title: "Word frequency report", difficulty: 4,
            concepts: ["list-comp", "dict-count", "sort-key"],
            prompt: L([
              "Write `top_words(text, n)` returning the `n` most frequent words as a list of `(word, count)` tuples,",
              "highest count first. Ties are broken alphabetically.",
              "",
              "Words are lowercased and split on whitespace.",
              "",
              "`top_words('the cat the dog the cat', 2)` → `[('the', 3), ('cat', 2)]`"
            ]),
            starter: "def top_words(text, n):\n    ",
            hints: [
              "Count into a dictionary first.",
              "Sort `counts.items()` with a key that returns `(-count, word)` — negative count sorts descending while the word sorts ascending.",
              "Slice the first `n` with `[:n]`."
            ],
            tests: [
              { name: "top two", call: "top_words('the cat the dog the cat', 2)", expect: [["the", 3], ["cat", 2]] },
              { name: "alphabetical tie-break", call: "top_words('b a', 2)", expect: [["a", 1], ["b", 1]] },
              { name: "n larger than vocabulary", call: "top_words('one', 5)", expect: [["one", 1]] },
              { name: "empty text", call: "top_words('', 3)", expect: [] },
              { name: "case-insensitive", call: "top_words('A a B', 1)", expect: [["a", 2]] }
            ],
            solution: L([
              "def top_words(text, n):",
              "    counts = {}",
              "    for word in text.lower().split():",
              "        counts[word] = counts.get(word, 0) + 1",
              "",
              "    def rank(pair):",
              "        return (-pair[1], pair[0])",
              "",
              "    return sorted(counts.items(), key=rank)[:n]"
            ]),
            takeaway: "A key function returning a **tuple** sorts by several fields at once, and negating a number flips just that field's direction."
          }
        ]
      }
    ],

    checkpoint: {
      id: "m11cp", pass: 0.8,
      title: "Checkpoint: Comprehensions",
      items: [
        {
          kind: "code", title: "Even squares", difficulty: 2, concepts: ["list-comp", "comp-filter"],
          prompt: "Write `even_squares(n)` returning the squares of the even numbers from 1 to n inclusive. `even_squares(6)` → `[4, 16, 36]`. One comprehension.",
          starter: "def even_squares(n):\n    ",
          tests: [
            { name: "up to 6", call: "even_squares(6)", expect: [4, 16, 36] },
            { name: "odd limit", call: "even_squares(5)", expect: [4, 16] },
            { name: "zero", call: "even_squares(0)", expect: [] }
          ]
        },
        {
          kind: "predict", title: "Nested order", difficulty: 3, concepts: ["nested-comp"],
          prompt: "What does this produce?\n\n~~~py\nprint([a + b for a in 'xy' for b in '12'])\n~~~",
          choices: [
            "`['x1', 'x2', 'y1', 'y2']`",
            "`['x1', 'y1', 'x2', 'y2']`",
            "`['xy', '12']`",
            "An error"
          ],
          answer: 0,
          explain: "Clauses read left to right as outer-to-inner loops: for each `a`, loop every `b`. So `x` pairs with `1` then `2`, then `y` does the same."
        },
        {
          kind: "code", title: "Uppercase keys", difficulty: 3, concepts: ["dict-comp"],
          prompt: "Write `upper_keys(d)` returning a new dictionary with every string key uppercased, values unchanged.",
          starter: "def upper_keys(d):\n    ",
          tests: [
            { name: "uppercases", call: "upper_keys({'a': 1, 'b': 2})", expect: { A: 1, B: 2 } },
            { name: "empty", call: "upper_keys({})", expect: {} }
          ]
        },
        {
          kind: "code", title: "Any negative", difficulty: 2, concepts: ["any-all"],
          prompt: "Write `has_negative(numbers)` returning whether any value is below zero. Use `any()`.",
          starter: "def has_negative(numbers):\n    ",
          tests: [
            { name: "finds one", call: "has_negative([1, -2])", expect: true },
            { name: "none", call: "has_negative([1, 2])", expect: false },
            { name: "empty is False", call: "has_negative([])", expect: false }
          ]
        },
        {
          kind: "quiz", title: "Brackets or not", difficulty: 3, concepts: ["comp-readability"],
          prompt: "What is the practical difference between `sum([x for x in big])` and `sum(x for x in big)`?",
          choices: [
            "None at all",
            "The first builds the whole list in memory; the second produces values one at a time",
            "The second is invalid syntax",
            "The first is lazy, the second is eager"
          ],
          answer: 1,
          explain: "The bracketed form materialises every value before summing. The generator expression yields them one at a time, so memory stays constant regardless of size."
        }
      ]
    }
  });
})();
