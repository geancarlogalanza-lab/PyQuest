/* Tier 2 · Module 9 — Lists II & Tuples */
(function () {
  const L = a => a.join("\n");

  PQ.defineModule({
    id: "m09", tier: 2, order: 9, icon: "🗂️",
    title: "Lists II & Tuples",
    blurb: "Nested data, sorting by anything, and the fixed-size cousin of the list.",
    intro: L([
      "Tier 2 is about modelling problems, and modelling starts with picking the right shape for your data.",
      "This module adds two dimensions to lists, teaches you to sort by any rule you like, and introduces",
      "tuples — which unlock returning several values at once."
    ]),
    concepts: [
      { id: "nested-list", name: "nested lists", importance: 1.3 },
      { id: "sort-key", name: "sorting with a key", importance: 1.5 },
      { id: "sort-stability", name: "sort stability" },
      { id: "tuple-type", name: "tuples", importance: 1.4 },
      { id: "unpacking", name: "unpacking", importance: 1.5 },
      { id: "multi-return", name: "returning several values", importance: 1.3 },
      { id: "list-copy", name: "copying vs aliasing", importance: 1.4 }
    ],

    lessons: [
      {
        id: "m09l1", title: "Lists inside lists", minutes: 11,
        concepts: ["nested-list", "list-iterate"],
        content: L([
          "## A grid is a list of rows",
          "",
          "~~~py",
          "grid = [",
          "    [1, 2, 3],",
          "    [4, 5, 6],",
          "    [7, 8, 9],",
          "]",
          "",
          "print(grid[0])        # [1, 2, 3]   -- the first row",
          "print(grid[0][2])     # 3           -- row 0, column 2",
          "print(len(grid))      # 3 rows",
          "print(len(grid[0]))   # 3 columns",
          "~~~",
          "",
          "`grid[row][col]` — outer index first. That order trips people up for about a week and then never again.",
          "",
          "The trailing comma after the last row is legal and encouraged: adding a row later is a one-line diff.",
          "",
          "## Walking a grid",
          "",
          "~~~py",
          "for row in grid:",
          "    for value in row:",
          "        print(value, end=' ')",
          "    print()",
          "~~~",
          "",
          "Outer loop takes each row; inner loop takes each value in that row. If you need coordinates:",
          "",
          "~~~py",
          "for r, row in enumerate(grid):",
          "    for c, value in enumerate(row):",
          "        if value == 5:",
          "            print(f'found 5 at row {r}, column {c}')",
          "~~~",
          "",
          "## Records as lists of lists",
          "",
          "Nested lists are not only grids. This is a very common shape for tabular data:",
          "",
          "~~~py",
          "people = [",
          "    ['ada', 36, 'london'],",
          "    ['grace', 45, 'new york'],",
          "]",
          "",
          "for person in people:",
          "    print(f'{person[0]} is {person[1]}')",
          "~~~",
          "",
          ":::warn person[0] is not readable",
          "`person[0]` tells the reader nothing. For records like this, a **dictionary** (next module) or a",
          "**named tuple** is almost always better. Reach for nested lists when the data really is a grid.",
          ":::",
          "",
          "## The multiplication trap",
          "",
          "~~~py",
          "grid = [[0] * 3] * 3      # looks fine",
          "grid[0][0] = 9",
          "print(grid)",
          "~~~",
          "~~~out",
          "[[9, 0, 0], [9, 0, 0], [9, 0, 0]]",
          "~~~",
          "",
          "`* 3` copies the **reference** three times, so all three rows are the *same list*. Build rows separately:",
          "",
          "~~~py",
          "grid = []",
          "for _ in range(3):",
          "    grid.append([0] * 3)      # a fresh list each time",
          "~~~",
          "",
          "`[0] * 3` is fine for a flat list of numbers — numbers are immutable, so sharing them is harmless.",
          "The problem is only ever with **mutable** items."
        ]),
        exercises: [
          {
            kind: "code", title: "Row sums", difficulty: 2,
            concepts: ["nested-list"],
            prompt: L([
              "Write `row_totals(grid)` returning a list with the sum of each row.",
              "",
              "`row_totals([[1, 2], [3, 4]])` → `[3, 7]`"
            ]),
            starter: "def row_totals(grid):\n    ",
            hints: ["Loop over the rows and `sum()` each one.", "Append each total to a result list."],
            tests: [
              { name: "two rows", call: "row_totals([[1, 2], [3, 4]])", expect: [3, 7] },
              { name: "uneven rows", call: "row_totals([[1], [2, 3, 4]])", expect: [1, 9] },
              { name: "empty grid", call: "row_totals([])", expect: [] },
              { name: "empty row sums to zero", call: "row_totals([[], [5]])", expect: [0, 5] }
            ],
            solution: "def row_totals(grid):\n    totals = []\n    for row in grid:\n        totals.append(sum(row))\n    return totals"
          },
          {
            kind: "code", title: "Column sum", difficulty: 3,
            concepts: ["nested-list"],
            prompt: L([
              "Write `column_total(grid, index)` returning the sum of one column.",
              "",
              "`column_total([[1, 2], [3, 4], [5, 6]], 1)` → `12`",
              "",
              "Assume every row is long enough."
            ]),
            starter: "def column_total(grid, index):\n    ",
            hints: ["Loop over rows and take `row[index]` from each."],
            tests: [
              { name: "second column", call: "column_total([[1, 2], [3, 4], [5, 6]], 1)", expect: 12 },
              { name: "first column", call: "column_total([[1, 2], [3, 4], [5, 6]], 0)", expect: 9 },
              { name: "single row", call: "column_total([[7, 8]], 0)", expect: 7 }
            ],
            solution: "def column_total(grid, index):\n    total = 0\n    for row in grid:\n        total += row[index]\n    return total"
          },
          {
            kind: "debug", title: "All rows change together", difficulty: 4,
            concepts: ["nested-list", "list-copy"],
            prompt: L([
              "`make_grid(2, 3)` should build a 2×3 grid of zeros where each row is independent.",
              "Setting one cell currently changes a whole column. Fix it."
            ]),
            starter: L([
              "def make_grid(rows, cols):",
              "    return [[0] * cols] * rows",
              "",
              "g = make_grid(2, 3)",
              "g[0][0] = 9",
              "print(g)"
            ]),
            hints: [
              "`* rows` repeats the same inner list object.",
              "Build the rows in a loop so each `[0] * cols` is a fresh list."
            ],
            tests: [
              { name: "rows are independent", code: "g = make_grid(2, 3)\ng[0][0] = 9\nassert g == [[9, 0, 0], [0, 0, 0]], 'changing one cell must not change other rows'" },
              { name: "right dimensions", code: "g = make_grid(4, 2)\nassert len(g) == 4 and all(len(r) == 2 for r in g)" },
              { name: "starts all zero", code: "assert make_grid(2, 2) == [[0, 0], [0, 0]]" }
            ],
            solution: L([
              "def make_grid(rows, cols):",
              "    grid = []",
              "    for _ in range(rows):",
              "        grid.append([0] * cols)",
              "    return grid",
              "",
              "g = make_grid(2, 3)",
              "g[0][0] = 9",
              "print(g)"
            ]),
            takeaway: "`[[0] * n] * m` is one of the most-reported Python bugs on the internet. Repetition copies references, not objects."
          },
          {
            kind: "code", title: "Find in a grid", difficulty: 3,
            concepts: ["nested-list", "loop-patterns"],
            prompt: L([
              "Write `find(grid, target)` returning `[row, column]` for the first occurrence, scanning row by row.",
              "Return `None` if it is not there."
            ]),
            starter: "def find(grid, target):\n    ",
            hints: ["Use `enumerate` on both loops to get the indexes.", "`return [r, c]` as soon as you find it."],
            tests: [
              { name: "finds a value", call: "find([[1, 2], [3, 4]], 4)", expect: [1, 1] },
              { name: "first row first", call: "find([[5, 5], [5, 5]], 5)", expect: [0, 0] },
              { name: "missing gives None", code: "assert find([[1]], 9) is None" },
              { name: "empty grid gives None", code: "assert find([], 1) is None" }
            ],
            solution: L([
              "def find(grid, target):",
              "    for r, row in enumerate(grid):",
              "        for c, value in enumerate(row):",
              "            if value == target:",
              "                return [r, c]",
              "    return None"
            ]),
            solutionNote: "A `return` inside nested loops exits **both** — that is why the search stops at the first hit."
          }
        ]
      },

      {
        id: "m09l2", title: "Sorting by anything", minutes: 11,
        concepts: ["sort-key", "sort-stability"],
        content: L([
          "## sorted() vs .sort()",
          "",
          "~~~py",
          "names = ['grace', 'ada', 'katherine']",
          "",
          "print(sorted(names))    # new list, original untouched",
          "names.sort()            # changes names, returns None",
          "~~~",
          "",
          "Use `sorted()` by default. Use `.sort()` when you specifically want to reorder in place and do not",
          "need the original.",
          "",
          "## key= sorts by a computed value",
          "",
          "~~~py",
          "words = ['banana', 'fig', 'cherry']",
          "print(sorted(words, key=len))",
          "~~~",
          "~~~out",
          "['fig', 'banana', 'cherry']",
          "~~~",
          "",
          "`key` takes a **function**. Python calls it once per item and sorts by whatever comes back.",
          "Note you write `key=len`, not `key=len()` — you are handing over the function itself, not calling it.",
          "",
          "### Sorting records",
          "",
          "~~~py",
          "people = [['ada', 36], ['grace', 45], ['alan', 41]]",
          "",
          "def get_age(person):",
          "    return person[1]",
          "",
          "print(sorted(people, key=get_age))",
          "~~~",
          "~~~out",
          "[['ada', 36], ['alan', 41], ['grace', 45]]",
          "~~~",
          "",
          "You will meet `lambda` in Module 12, which lets you write `key=lambda p: p[1]` inline. Until then,",
          "a named function is perfectly good — and often clearer.",
          "",
          "## reverse=",
          "",
          "~~~py",
          "print(sorted([3, 1, 2], reverse=True))       # [3, 2, 1]",
          "print(sorted(people, key=get_age, reverse=True))",
          "~~~",
          "",
          ":::tip Descending by number without reverse",
          "`key` can return a *transformed* value: `sorted(people, key=lambda p: -p[1])` sorts by age descending.",
          "Useful when you want descending on one field and ascending on another.",
          ":::",
          "",
          "## Stability",
          "",
          "Python's sort is **stable**: items that compare equal keep their original relative order.",
          "",
          "~~~py",
          "def get_second(record):",
          "    return record[1]",
          "",
          "records = [['b', 2], ['a', 1], ['c', 2]]",
          "print(sorted(records, key=get_second))",
          "~~~",
          "~~~out",
          "[['a', 1], ['b', 2], ['c', 2]]",
          "~~~",
          "",
          "`b` still comes before `c` because they tied and that was their original order.",
          "",
          ":::why Stability gives you multi-key sorting free",
          "To sort by department, then by name within each department: **sort by name first, then by department**.",
          "The stable second sort preserves the name ordering inside each group. Sort by the least significant",
          "key first and work up.",
          ":::",
          "",
          "## Sorting tuples and lists compares element by element",
          "",
          "~~~py",
          "print(sorted([[2, 'b'], [1, 'z'], [2, 'a']]))",
          "~~~",
          "~~~out",
          "[[1, 'z'], [2, 'a'], [2, 'b']]",
          "~~~",
          "",
          "First elements are compared; ties fall through to the second. That makes `key` functions returning a",
          "tuple a neat way to sort by several fields at once: `key=lambda p: (p[1], p[0])`."
        ]),
        exercises: [
          {
            kind: "code", title: "Sort by length", difficulty: 2,
            concepts: ["sort-key"],
            prompt: L([
              "Write `by_length(words)` returning a new list sorted shortest first.",
              "Words of equal length keep their original order.",
              "",
              "The original list must not change."
            ]),
            starter: "def by_length(words):\n    ",
            hints: ["`sorted(words, key=len)` does everything, including keeping ties stable."],
            tests: [
              { name: "sorts by length", call: "by_length(['banana', 'fig', 'cherry'])", expect: ["fig", "banana", "cherry"] },
              { name: "ties keep order", call: "by_length(['bb', 'aa', 'c'])", expect: ["c", "bb", "aa"] },
              { name: "original untouched", code: "w = ['bbb', 'a']\nby_length(w)\nassert w == ['bbb', 'a']" }
            ],
            solution: "def by_length(words):\n    return sorted(words, key=len)"
          },
          {
            kind: "code", title: "Leaderboard", difficulty: 3,
            concepts: ["sort-key", "nested-list"],
            prompt: L([
              "`scores` is a list of `[name, points]`. Write `leaderboard(scores)` returning the names only,",
              "ordered from highest points to lowest. Ties keep their original order.",
              "",
              "`leaderboard([['ada', 30], ['bo', 50], ['cy', 30]])` → `['bo', 'ada', 'cy']`"
            ]),
            starter: "def get_points(entry):\n    \n\ndef leaderboard(scores):\n    ",
            hints: [
              "Write `get_points` to return `entry[1]`.",
              "`sorted(scores, key=get_points, reverse=True)` sorts descending.",
              "Then build a list of just the names."
            ],
            tests: [
              { name: "orders by points", call: "leaderboard([['ada', 30], ['bo', 50], ['cy', 30]])", expect: ["bo", "ada", "cy"] },
              { name: "already ordered", call: "leaderboard([['a', 9], ['b', 1]])", expect: ["a", "b"] },
              { name: "empty", call: "leaderboard([])", expect: [] }
            ],
            solution: L([
              "def get_points(entry):",
              "    return entry[1]",
              "",
              "def leaderboard(scores):",
              "    ordered = sorted(scores, key=get_points, reverse=True)",
              "    names = []",
              "    for entry in ordered:",
              "        names.append(entry[0])",
              "    return names"
            ]),
            takeaway: "`reverse=True` keeps the sort stable, so equal scores stay in input order. Sorting by `-points` instead would do the same thing."
          },
          {
            kind: "predict", title: "Stable sort", difficulty: 3,
            concepts: ["sort-stability"],
            prompt: L([
              "What does this print?",
              "",
              "~~~py",
              "def first_letter(word):",
              "    return word[0]",
              "",
              "words = ['pear', 'plum', 'apple', 'peach']",
              "print(sorted(words, key=first_letter))",
              "~~~"
            ]),
            choices: [
              "`['apple', 'peach', 'pear', 'plum']`",
              "`['apple', 'pear', 'plum', 'peach']`",
              "`['apple', 'plum', 'pear', 'peach']`",
              "`['pear', 'plum', 'peach', 'apple']`"
            ],
            answer: 1,
            explain: L([
              "The key is only the **first letter**, so `pear`, `plum` and `peach` all tie on `p`.",
              "A stable sort leaves tied items in their original relative order: `pear`, `plum`, `peach`.",
              "",
              "If you wanted full alphabetical order you would sort with no key at all."
            ])
          },
          {
            kind: "code", title: "Two-key sort", difficulty: 4,
            concepts: ["sort-key", "sort-stability"],
            prompt: L([
              "`records` is a list of `[department, name]`. Write `organise(records)` returning them sorted by",
              "department alphabetically, and by name alphabetically within each department.",
              "",
              "Do it with **two stable sorts** — least significant key first. The checks forbid tuple keys",
              "so you practise the technique."
            ]),
            starter: "def get_name(r):\n    return r[1]\n\ndef get_dept(r):\n    return r[0]\n\ndef organise(records):\n    ",
            forbids: [{ re: "key=lambda", msg: "Use two sorts with the named key functions" }],
            hints: [
              "Sort by name first.",
              "Then sort that result by department — stability preserves the name order inside each department."
            ],
            tests: [
              {
                name: "sorts by department then name",
                call: "organise([['sales', 'zoe'], ['eng', 'bob'], ['sales', 'amy'], ['eng', 'al']])",
                expect: [["eng", "al"], ["eng", "bob"], ["sales", "amy"], ["sales", "zoe"]]
              },
              { name: "single record", call: "organise([['a', 'b']])", expect: [["a", "b"]] },
              { name: "original untouched", code: "r = [['b', 'z'], ['a', 'y']]\norganise(r)\nassert r == [['b', 'z'], ['a', 'y']]" }
            ],
            solution: L([
              "def get_name(r):",
              "    return r[1]",
              "",
              "def get_dept(r):",
              "    return r[0]",
              "",
              "def organise(records):",
              "    by_name = sorted(records, key=get_name)",
              "    return sorted(by_name, key=get_dept)"
            ]),
            takeaway: "Multi-key sorting via successive stable sorts works in every language with a stable sort. It is worth understanding even where tuple keys are available."
          }
        ]
      },

      {
        id: "m09l3", title: "Tuples and unpacking", minutes: 11,
        concepts: ["tuple-type", "unpacking", "multi-return"],
        content: L([
          "## A tuple is a list that cannot change",
          "",
          "~~~py",
          "point = (3, 4)",
          "print(point[0])      # 3",
          "print(len(point))    # 2",
          "point[0] = 9         # TypeError: 'tuple' object does not support item assignment",
          "~~~",
          "",
          "Everything you can *read* from a list works on a tuple. Nothing that *modifies* does.",
          "",
          "### When to use which",
          "",
          "| Use a **list** when | Use a **tuple** when |",
          "|---|---|",
          "| the collection grows or shrinks | the size is fixed by meaning |",
          "| all items are the same kind of thing | positions mean different things |",
          "| `scores`, `users`, `lines` | `(x, y)`, `(name, age)`, `(r, g, b)` |",
          "",
          "A tuple also works as a dictionary key or set member, because it is immutable and therefore hashable.",
          "A list cannot.",
          "",
          ":::warn The one-element gotcha",
          "`(5)` is just the number 5 in brackets. A one-element tuple needs a trailing comma: `(5,)`.",
          ":::",
          "",
          "## Unpacking",
          "",
          "~~~py",
          "point = (3, 4)",
          "x, y = point",
          "print(x, y)",
          "~~~",
          "~~~out",
          "3 4",
          "~~~",
          "",
          "The names on the left must match the number of values on the right, or you get",
          "`ValueError: not enough values to unpack`.",
          "",
          "### Swapping",
          "",
          "~~~py",
          "a, b = 1, 2",
          "a, b = b, a",
          "print(a, b)     # 2 1",
          "~~~",
          "",
          "No temporary variable. The right-hand side is fully evaluated first, then assigned.",
          "",
          "### Unpacking in a loop",
          "",
          "~~~py",
          "people = [('ada', 36), ('grace', 45)]",
          "for name, age in people:",
          "    print(f'{name} is {age}')",
          "~~~",
          "",
          "This is far better than `person[0]` and `person[1]`. `enumerate()` works because it yields tuples —",
          "`for i, item in enumerate(x)` is unpacking, and you have been doing it since Module 8.",
          "",
          "### Star unpacking",
          "",
          "~~~py",
          "first, *rest = [1, 2, 3, 4]",
          "print(first, rest)      # 1 [2, 3, 4]",
          "",
          "*body, last = [1, 2, 3, 4]",
          "print(body, last)       # [1, 2, 3] 4",
          "~~~",
          "",
          "The starred name collects everything left over, always as a list.",
          "",
          "## Returning several values",
          "",
          "~~~py",
          "def min_and_max(numbers):",
          "    return min(numbers), max(numbers)",
          "",
          "low, high = min_and_max([4, 9, 1])",
          "print(low, high)     # 1 9",
          "~~~",
          "",
          "There is no special syntax — the function returns one tuple and the caller unpacks it. This is the",
          "normal Python way to return more than one thing.",
          "",
          ":::tip When a tuple is not enough",
          "Returning `(True, None, 'error message')` from a function is a sign it is doing too much, or that you",
          "want a dictionary or a small class (Module 16). Two or three closely related values: tuple. More than",
          "that: name them.",
          ":::"
        ]),
        exercises: [
          {
            kind: "code", title: "Return two values", difficulty: 2,
            concepts: ["multi-return", "tuple-type"],
            prompt: L([
              "Write `stats(numbers)` returning `(smallest, largest, average)` as a tuple.",
              "",
              "For an empty list return `(None, None, 0.0)`."
            ]),
            starter: "def stats(numbers):\n    ",
            hints: ["`return a, b, c` builds a tuple automatically.", "Guard the empty case first."],
            tests: [
              { name: "normal case", call: "stats([4, 9, 2])", expect: [2, 9, 5.0] },
              { name: "returns a tuple", code: "assert isinstance(stats([1]), tuple), 'return a tuple'" },
              { name: "empty case", code: "assert stats([]) == (None, None, 0.0)" },
              { name: "unpacks cleanly", code: "low, high, avg = stats([1, 3])\nassert (low, high, avg) == (1, 3, 2.0)" }
            ],
            solution: L([
              "def stats(numbers):",
              "    if not numbers:",
              "        return None, None, 0.0",
              "    return min(numbers), max(numbers), sum(numbers) / len(numbers)"
            ])
          },
          {
            kind: "code", title: "Split a full name", difficulty: 2,
            concepts: ["unpacking"],
            prompt: L([
              "Write `split_name(full)` that takes `'Ada Byron Lovelace'` and returns a tuple of",
              "`(first, last)` — the first word and the **last** word, ignoring anything in between.",
              "",
              "Use star unpacking. A name with only one word returns that word twice."
            ]),
            starter: "def split_name(full):\n    ",
            hints: [
              "`parts = full.split()`",
              "`first, *middle, last = parts` fails for a single word — handle that case first.",
              "Simpler: `parts[0]` and `parts[-1]`."
            ],
            tests: [
              { name: "three names", call: "split_name('Ada Byron Lovelace')", expect: ["Ada", "Lovelace"] },
              { name: "two names", call: "split_name('Grace Hopper')", expect: ["Grace", "Hopper"] },
              { name: "one name", call: "split_name('Prince')", expect: ["Prince", "Prince"] }
            ],
            solution: "def split_name(full):\n    parts = full.split()\n    return parts[0], parts[-1]"
          },
          {
            kind: "debug", title: "Unpacking mismatch", difficulty: 2,
            concepts: ["unpacking"],
            prompt: L([
              "This raises `ValueError: too many values to unpack`. Fix the loop so it prints each name and city,",
              "ignoring the middle value.",
              "",
              "Expected output: `ada lives in london` then `grace lives in new york`."
            ]),
            starter: L([
              "people = [('ada', 36, 'london'), ('grace', 45, 'new york')]",
              "",
              "for name, city in people:",
              "    print(f'{name} lives in {city}')"
            ]),
            hints: [
              "Each tuple has three values but you gave two names.",
              "Use three names — `for name, age, city in people:`.",
              "`_` is the convention for a value you do not care about."
            ],
            tests: [
              { name: "prints both lines", out_lines: ["ada lives in london", "grace lives in new york"] }
            ],
            solution: L([
              "people = [('ada', 36, 'london'), ('grace', 45, 'new york')]",
              "",
              "for name, _, city in people:",
              "    print(f'{name} lives in {city}')"
            ])
          },
          {
            kind: "code", title: "Pair up neighbours", difficulty: 4,
            concepts: ["tuple-type", "list-build"],
            prompt: L([
              "Write `pairs(items)` returning a list of tuples of each consecutive pair.",
              "",
              "`pairs([1, 2, 3, 4])` → `[(1, 2), (2, 3), (3, 4)]`",
              "",
              "Fewer than two items gives an empty list."
            ]),
            starter: "def pairs(items):\n    ",
            hints: [
              "There are `len(items) - 1` pairs.",
              "Loop `i` over `range(len(items) - 1)` and take `items[i]` and `items[i + 1]`.",
              "`range` of a negative number is empty, which handles the short cases for free."
            ],
            tests: [
              { name: "four items give three pairs", call: "pairs([1, 2, 3, 4])", expect: [[1, 2], [2, 3], [3, 4]] },
              { name: "two items give one pair", call: "pairs(['a', 'b'])", expect: [["a", "b"]] },
              { name: "one item gives none", call: "pairs([1])", expect: [] },
              { name: "empty gives none", call: "pairs([])", expect: [] },
              { name: "items are tuples", code: "assert isinstance(pairs([1, 2])[0], tuple)" }
            ],
            solution: L([
              "def pairs(items):",
              "    result = []",
              "    for i in range(len(items) - 1):",
              "        result.append((items[i], items[i + 1]))",
              "    return result"
            ]),
            takeaway: "Sliding a window over a sequence is a standard move — comparing each day to the previous, each frame to the last, each reading to the one before."
          }
        ]
      }
    ],

    checkpoint: {
      id: "m09cp", pass: 0.8,
      title: "Checkpoint: Lists II & Tuples",
      items: [
        {
          kind: "code", title: "Flatten a grid", difficulty: 3, concepts: ["nested-list"],
          prompt: "Write `flatten(grid)` turning `[[1, 2], [3], [4, 5]]` into `[1, 2, 3, 4, 5]`.",
          starter: "def flatten(grid):\n    ",
          tests: [
            { name: "flattens", call: "flatten([[1, 2], [3], [4, 5]])", expect: [1, 2, 3, 4, 5] },
            { name: "empty rows skipped", call: "flatten([[], [1], []])", expect: [1] },
            { name: "empty grid", call: "flatten([])", expect: [] }
          ]
        },
        {
          kind: "predict", title: "Repetition trap", difficulty: 3, concepts: ["list-copy"],
          prompt: "What is printed?\n\n~~~py\nrows = [[1]] * 2\nrows[0].append(9)\nprint(rows)\n~~~",
          choices: ["`[[1, 9], [1]]`", "`[[1, 9], [1, 9]]`", "`[[1], [1]]`", "An error"],
          answer: 1,
          explain: "`* 2` repeats the same inner list object twice, so both entries are the same list and both show the append."
        },
        {
          kind: "code", title: "Sort by second value", difficulty: 3, concepts: ["sort-key"],
          prompt: "Write `by_score(pairs)` sorting a list of `(name, score)` tuples by score, highest first, ties keeping input order.",
          starter: "def by_score(pairs):\n    ",
          tests: [
            { name: "sorts descending", call: "by_score([('a', 1), ('b', 3), ('c', 2)])", expect: [["b", 3], ["c", 2], ["a", 1]] },
            { name: "ties stable", call: "by_score([('a', 5), ('b', 5)])", expect: [["a", 5], ["b", 5]] }
          ]
        },
        {
          kind: "code", title: "Swap without a temp", difficulty: 2, concepts: ["unpacking"],
          prompt: "Write `swap(pair)` taking a two-element tuple and returning it reversed. `swap((1, 2))` → `(2, 1)`.",
          starter: "def swap(pair):\n    ",
          tests: [
            { name: "swaps", call: "swap((1, 2))", expect: [2, 1] },
            { name: "works with strings", call: "swap(('a', 'b'))", expect: ["b", "a"] },
            { name: "returns a tuple", code: "assert isinstance(swap((1, 2)), tuple)" }
          ]
        },
        {
          kind: "quiz", title: "Tuple or list", difficulty: 2, concepts: ["tuple-type"],
          prompt: "Which of these is the best reason to choose a tuple over a list?",
          choices: [
            "Tuples are faster to type",
            "The number of items is fixed and each position means something different",
            "Tuples can hold more items",
            "Lists cannot hold strings"
          ],
          answer: 1,
          explain: "Tuples signal *fixed structure* — `(x, y)`, `(name, age)`. Lists signal *a variable number of similar things*. The immutability is a consequence of that intent, and it is what makes tuples usable as dict keys."
        }
      ]
    }
  });
})();
