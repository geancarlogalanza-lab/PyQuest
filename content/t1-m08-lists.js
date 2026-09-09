/* Tier 1 · Module 8 — Lists I + Tier 1 project */
(function () {
  const L = a => a.join("\n");

  PQ.defineModule({
    id: "m08", tier: 1, order: 8, icon: "📋",
    title: "Lists I",
    blurb: "Hold many things at once, change them, and loop over them. Then build your first real program.",
    intro: L([
      "A variable holds one thing. A list holds a sequence of things, in order, and lets you add and remove.",
      "Lists plus loops plus functions is enough to build genuinely useful software — which is exactly what",
      "you will do at the end of this module."
    ]),
    concepts: [
      { id: "list-create", name: "creating lists", importance: 1.5 },
      { id: "list-index", name: "indexing lists", importance: 1.4 },
      { id: "list-mutate", name: "changing lists", importance: 1.5 },
      { id: "list-methods", name: "list methods", importance: 1.4 },
      { id: "list-iterate", name: "looping over lists", importance: 1.6 },
      { id: "list-aggregate", name: "len, sum, min, max", importance: 1.3 },
      { id: "mutability", name: "mutability", importance: 1.4 },
      { id: "list-build", name: "building a list in a loop", importance: 1.5 }
    ],

    lessons: [
      {
        id: "m08l1", title: "Making and reading lists", minutes: 10,
        concepts: ["list-create", "list-index", "list-aggregate"],
        content: L([
          "## A list holds many values in order",
          "",
          "~~~py",
          "scores = [72, 85, 91, 64]",
          "names = ['ada', 'grace', 'alan']",
          "mixed = [1, 'two', 3.0, True]     # legal, but usually a design smell",
          "empty = []",
          "",
          "print(scores)",
          "print(len(scores))",
          "~~~",
          "~~~out",
          "[72, 85, 91, 64]",
          "4",
          "~~~",
          "",
          "Square brackets, comma separated. A list can hold anything, including other lists — but in practice",
          "a list should hold *one kind of thing*, because you are going to loop over it and treat every item the same way.",
          "",
          "## Indexing and slicing — exactly like strings",
          "",
          "~~~py",
          "scores = [72, 85, 91, 64]",
          "print(scores[0])     # 72",
          "print(scores[-1])    # 64",
          "print(scores[1:3])   # [85, 91]",
          "print(scores[:2])    # [72, 85]",
          "~~~",
          "",
          "Everything you learned about string slicing transfers directly. The difference: a slice of a list is",
          "a **list**, and a slice of a string is a **string**.",
          "",
          "## The aggregate functions",
          "",
          "~~~py",
          "scores = [72, 85, 91, 64]",
          "print(len(scores))          # 4",
          "print(sum(scores))          # 312",
          "print(min(scores))          # 64",
          "print(max(scores))          # 91",
          "print(sum(scores) / len(scores))   # 78.0  -- the average",
          "~~~",
          "",
          ":::trap Empty lists bite",
          "`sum([]) / len([])` is a `ZeroDivisionError`, and `max([])` is a `ValueError`.",
          "Any function that averages or finds a maximum needs to decide what to do with no data —",
          "and *decide* is the operative word. Crashing is a decision you did not make on purpose.",
          ":::",
          "",
          "## Membership and position",
          "",
          "~~~py",
          "names = ['ada', 'grace', 'alan']",
          "print('ada' in names)        # True",
          "print('bob' in names)        # False",
          "print(names.index('grace'))  # 1",
          "~~~",
          "",
          "`.index()` raises `ValueError` when the item is absent, so guard it with `in` first."
        ]),
        exercises: [
          {
            kind: "code", title: "Basic statistics", difficulty: 1,
            concepts: ["list-aggregate"],
            prompt: L([
              "Write `stats(numbers)` returning a formatted line:",
              "",
              "~~~text",
              "count 4, total 312, average 78.0",
              "~~~",
              "",
              "Round the average to one decimal place."
            ]),
            starter: "def stats(numbers):\n    ",
            hints: ["`len`, `sum`, and `sum / len` for the average.", "`round(average, 1)` then build an f-string."],
            tests: [
              { name: "the example works", call: "stats([72, 85, 91, 64])", expect: "count 4, total 312, average 78.0" },
              { name: "single value", call: "stats([10])", expect: "count 1, total 10, average 10.0" },
              { name: "rounds to one place", call: "stats([1, 2])", expect: "count 2, total 3, average 1.5" }
            ],
            solution: L([
              "def stats(numbers):",
              "    count = len(numbers)",
              "    total = sum(numbers)",
              "    average = round(total / count, 1)",
              "    return f'count {count}, total {total}, average {average}'"
            ])
          },
          {
            kind: "code", title: "Safe average", difficulty: 3,
            concepts: ["list-aggregate", "condition-design"],
            prompt: L([
              "Write `average(numbers)` returning the mean as a float, or `0.0` when the list is empty.",
              "",
              "Use a guard clause — handle the empty case first and return early."
            ]),
            starter: "def average(numbers):\n    ",
            hints: ["`if not numbers:` is the idiomatic empty check.", "Return `0.0` from that branch, then compute normally."],
            tests: [
              { name: "normal case", call: "average([2, 4, 6])", expect: 4.0 },
              { name: "empty list returns 0.0", call: "average([])", expect: 0.0 },
              { name: "single item", call: "average([7])", expect: 7.0 },
              { name: "negatives work", call: "average([-2, 2])", expect: 0.0 }
            ],
            solution: "def average(numbers):\n    if not numbers:\n        return 0.0\n    return sum(numbers) / len(numbers)",
            takeaway: "Empty input is not an edge case you can ignore — it is the case that happens on day one in production, when there is no data yet."
          },
          {
            kind: "predict", title: "Slices of lists", difficulty: 2,
            concepts: ["list-index"],
            prompt: "What is printed?\n\n~~~py\nitems = ['a', 'b', 'c', 'd', 'e']\nprint(items[1:-1])\n~~~",
            choices: ["`['b', 'c', 'd']`", "`['b', 'c', 'd', 'e']`", "`['a', 'b', 'c', 'd']`", "`['b', 'd']`"],
            answer: 0,
            explain: "Start at index 1 (`b`) and stop **before** index -1 (`e`). That leaves `b`, `c`, `d` — a common idiom for *everything except the first and last*."
          },
          {
            kind: "debug", title: "Index out of range", difficulty: 2,
            concepts: ["list-index"],
            prompt: "`last_item([1, 2, 3])` should return `3` but crashes. Fix it so it also returns `None` for an empty list.",
            starter: "def last_item(items):\n    return items[len(items)]\n\nprint(last_item([1, 2, 3]))",
            hints: ["Valid indexes stop at `len(items) - 1`.", "`items[-1]` is cleaner.", "Guard the empty case first with `if not items: return None`."],
            tests: [
              { name: "returns the last item", call: "last_item([1, 2, 3])", expect: 3 },
              { name: "empty gives None", code: "assert last_item([]) is None, 'an empty list should give None'" },
              { name: "single item", call: "last_item(['only'])", expect: "only" }
            ],
            solution: "def last_item(items):\n    if not items:\n        return None\n    return items[-1]\n\nprint(last_item([1, 2, 3]))"
          }
        ]
      },

      {
        id: "m08l2", title: "Changing lists", minutes: 11,
        concepts: ["list-mutate", "list-methods", "mutability"],
        content: L([
          "## Lists are mutable — unlike strings",
          "",
          "~~~py",
          "items = ['a', 'b', 'c']",
          "items[1] = 'B'",
          "print(items)",
          "~~~",
          "~~~out",
          "['a', 'B', 'c']",
          "~~~",
          "",
          "The same line on a string raises `TypeError`. Lists can be edited in place, and that changes how you",
          "have to think about them.",
          "",
          "## The methods you will use",
          "",
          "| Method | Does | Returns |",
          "|---|---|---|",
          "| `.append(x)` | add to the end | `None` |",
          "| `.insert(i, x)` | add at position `i` | `None` |",
          "| `.remove(x)` | delete the first matching value | `None` |",
          "| `.pop()` | remove and give back the last item | the item |",
          "| `.pop(i)` | remove and give back item `i` | the item |",
          "| `.sort()` | sort **in place** | `None` |",
          "| `.reverse()` | reverse **in place** | `None` |",
          "| `.clear()` | empty it | `None` |",
          "",
          ":::trap The None trap",
          "~~~py",
          "items = [3, 1, 2]",
          "items = items.sort()      # WRONG",
          "print(items)              # None",
          "~~~",
          "",
          "`.sort()` sorts the list and returns `None`. Assigning that back destroys your data.",
          "Either call `items.sort()` on its own line, or use `sorted(items)` which returns a **new** list.",
          "",
          "The rule: **methods that modify a list in place return `None`.**",
          ":::",
          "",
          "~~~py",
          "items = [3, 1, 2]",
          "items.sort()              # in place",
          "print(items)              # [1, 2, 3]",
          "",
          "original = [3, 1, 2]",
          "ordered = sorted(original)   # new list",
          "print(original, ordered)     # [3, 1, 2] [1, 2, 3]",
          "~~~",
          "",
          "## Two names, one list",
          "",
          "This surprises everyone once:",
          "",
          "~~~py",
          "a = [1, 2, 3]",
          "b = a",
          "b.append(4)",
          "print(a)",
          "~~~",
          "~~~out",
          "[1, 2, 3, 4]",
          "~~~",
          "",
          "`b = a` does **not** copy the list. It gives the same list a second name. Both names see every change.",
          "",
          "To actually copy:",
          "",
          "~~~py",
          "b = a.copy()      # or a[:]  or list(a)",
          "~~~",
          "",
          ":::why This matters more than it looks",
          "Passing a list into a function passes the *same list*. If the function appends to it, the caller's list",
          "changes too. That is sometimes what you want and is very often a bug — one that shows up far away from",
          "the line that caused it.",
          ":::"
        ]),
        exercises: [
          {
            kind: "debug", title: "sort returns None", difficulty: 2,
            concepts: ["list-methods"],
            prompt: "This should print `[1, 2, 3]` but prints `None`. Fix it, keeping the sort in place.",
            starter: "numbers = [3, 1, 2]\nnumbers = numbers.sort()\nprint(numbers)",
            hints: ["`.sort()` returns `None` — it changes the list itself.", "Call it on its own line without assigning."],
            tests: [
              { name: "prints the sorted list", out_exact: "[1, 2, 3]" },
              { name: "numbers is a real list", code: "assert numbers == [1, 2, 3]" }
            ],
            solution: "numbers = [3, 1, 2]\nnumbers.sort()\nprint(numbers)"
          },
          {
            kind: "code", title: "Queue operations", difficulty: 2,
            concepts: ["list-mutate", "list-methods"],
            prompt: L([
              "Starting from `queue = ['ada', 'grace']`:",
              "",
              "1. add `'alan'` to the end",
              "2. add `'katherine'` at the very front",
              "3. remove and store the person now at the front in `served`",
              "",
              "Then print the remaining queue and who was served."
            ]),
            starter: "queue = ['ada', 'grace']\n\n",
            hints: ["`.append()` adds to the end.", "`.insert(0, name)` adds to the front.", "`.pop(0)` removes and returns the first item."],
            tests: [
              { name: "katherine was served", call: "served", expect: "katherine" },
              { name: "queue is correct after", call: "queue", expect: ["ada", "grace", "alan"] }
            ],
            solution: L([
              "queue = ['ada', 'grace']",
              "",
              "queue.append('alan')",
              "queue.insert(0, 'katherine')",
              "served = queue.pop(0)",
              "",
              "print(queue)",
              "print(served)"
            ])
          },
          {
            kind: "predict", title: "Shared list", difficulty: 3,
            concepts: ["mutability"],
            prompt: L([
              "What is printed?",
              "",
              "~~~py",
              "original = [1, 2]",
              "copy = original",
              "copy.append(3)",
              "print(len(original))",
              "~~~"
            ]),
            choices: ["`2`", "`3`", "`0`", "An error"],
            answer: 1,
            explain: L([
              "`copy = original` creates a second **name** for the same list, not a second list.",
              "Appending through one name is visible through the other, so the length is `3`.",
              "",
              "Use `original.copy()` when you actually want an independent list."
            ])
          },
          {
            kind: "code", title: "Copy, do not clobber", difficulty: 3,
            concepts: ["mutability", "list-methods"],
            prompt: L([
              "Write `with_extra(items, new_item)` that returns a **new** list with `new_item` added at the end,",
              "leaving the original untouched.",
              "",
              "The checks verify that the caller's list did not change."
            ]),
            starter: "def with_extra(items, new_item):\n    ",
            hints: [
              "`items.append(x)` would modify the caller's list — you do not want that.",
              "Make a copy first with `items.copy()`, append to the copy, return it.",
              "Or return `items + [new_item]`, which builds a new list."
            ],
            tests: [
              { name: "returns the extended list", call: "with_extra([1, 2], 3)", expect: [1, 2, 3] },
              { name: "the original is untouched", code: "base = [1, 2]\nresult = with_extra(base, 3)\nassert base == [1, 2], 'the original list must not change'\nassert result == [1, 2, 3]" },
              { name: "works on an empty list", call: "with_extra([], 'a')", expect: ["a"] }
            ],
            solution: "def with_extra(items, new_item):\n    return items + [new_item]",
            solutionNote: "`items + [new_item]` builds a new list and never touches the input. Functions that avoid modifying their arguments are far easier to reason about.",
            takeaway: "A function that quietly mutates what it was given is a landmine. Prefer returning something new unless changing in place is the explicit purpose."
          }
        ]
      },

      {
        id: "m08l3", title: "Looping over lists", minutes: 11,
        concepts: ["list-iterate", "list-build", "loop-patterns"],
        content: L([
          "## for gives you the items",
          "",
          "~~~py",
          "for name in ['ada', 'grace', 'alan']:",
          "    print(name.capitalize())",
          "~~~",
          "",
          "You almost never need indexes. If you catch yourself writing `for i in range(len(items))` and then",
          "only using `items[i]`, loop over the items directly instead.",
          "",
          "## When you do need the index: enumerate",
          "",
          "~~~py",
          "for position, name in enumerate(['ada', 'grace'], start=1):",
          "    print(f'{position}. {name}')",
          "~~~",
          "~~~out",
          "1. ada",
          "2. grace",
          "~~~",
          "",
          "`enumerate` hands you both, and `start=1` makes it human-friendly. This is the idiomatic Python for",
          "numbered output.",
          "",
          "## Building a list in a loop",
          "",
          "The accumulator pattern again, with `[]` as the empty starting value:",
          "",
          "~~~py",
          "prices = [10, 25, 5]",
          "",
          "with_tax = []",
          "for price in prices:",
          "    with_tax.append(price * 1.2)",
          "",
          "print(with_tax)",
          "~~~",
          "~~~out",
          "[12.0, 30.0, 6.0]",
          "~~~",
          "",
          "Three steps: empty list, append inside the loop, use it after. Tier 2 will show you how to write this",
          "in one line with a comprehension — but the loop is what the comprehension *means*, so learn it first.",
          "",
          "## Filtering",
          "",
          "~~~py",
          "scores = [72, 45, 91, 30, 88]",
          "",
          "passing = []",
          "for score in scores:",
          "    if score >= 50:",
          "        passing.append(score)",
          "",
          "print(passing)",
          "~~~",
          "~~~out",
          "[72, 91, 88]",
          "~~~",
          "",
          ":::trap Never modify a list while looping over it",
          "~~~py",
          "for score in scores:",
          "    if score < 50:",
          "        scores.remove(score)    # skips items!",
          "~~~",
          "Removing shifts everything left while the loop counter moves right, so items get skipped silently.",
          "**Build a new list instead** — it is safer and reads better.",
          ":::",
          "",
          "## Sorting with a key",
          "",
          "~~~py",
          "words = ['banana', 'fig', 'cherry']",
          "print(sorted(words))                 # alphabetical",
          "print(sorted(words, key=len))        # by length",
          "print(sorted(words, reverse=True))   # Z to A",
          "~~~",
          "~~~out",
          "['banana', 'cherry', 'fig']",
          "['fig', 'banana', 'cherry']",
          "['cherry', 'banana', 'fig']",
          "~~~",
          "",
          "`key=` takes a *function* and sorts by what it returns for each item. That idea — passing a function",
          "as an argument — is a large part of Tier 2."
        ]),
        exercises: [
          {
            kind: "code", title: "Numbered list", difficulty: 2,
            concepts: ["list-iterate"],
            prompt: L([
              "Write `numbered(items)` that returns a single string with each item on its own line, numbered from 1:",
              "",
              "~~~text",
              "1. milk",
              "2. eggs",
              "3. bread",
              "~~~",
              "",
              "Use `enumerate` — the checks require it."
            ]),
            starter: "def numbered(items):\n    ",
            requires: [{ contains: "enumerate", msg: "Use enumerate" }],
            hints: [
              "`enumerate(items, start=1)` gives position and item.",
              "Collect the lines in a list, then join with `'\\n'`."
            ],
            tests: [
              { name: "three items", call: "numbered(['milk', 'eggs', 'bread'])", expect: "1. milk\n2. eggs\n3. bread" },
              { name: "one item", call: "numbered(['only'])", expect: "1. only" },
              { name: "empty gives empty string", call: "numbered([])", expect: "" }
            ],
            solution: L([
              "def numbered(items):",
              "    lines = []",
              "    for position, item in enumerate(items, start=1):",
              "        lines.append(f'{position}. {item}')",
              "    return '\\n'.join(lines)"
            ])
          },
          {
            kind: "code", title: "Filter the passing scores", difficulty: 2,
            concepts: ["list-build"],
            prompt: L([
              "Write `passing(scores, threshold)` returning a new list of the scores that are greater than or",
              "equal to `threshold`, in the original order."
            ]),
            starter: "def passing(scores, threshold):\n    ",
            hints: ["Start with an empty list.", "Append only the ones that pass the test.", "Return the new list at the end."],
            tests: [
              { name: "filters correctly", call: "passing([72, 45, 91, 30, 88], 50)", expect: [72, 91, 88] },
              { name: "threshold is inclusive", call: "passing([50, 49], 50)", expect: [50] },
              { name: "none pass", call: "passing([1, 2], 100)", expect: [] },
              { name: "does not modify the input", code: "data = [1, 100]\npassing(data, 50)\nassert data == [1, 100], 'do not modify the list you were given'" }
            ],
            solution: L([
              "def passing(scores, threshold):",
              "    result = []",
              "    for score in scores:",
              "        if score >= threshold:",
              "            result.append(score)",
              "    return result"
            ])
          },
          {
            kind: "debug", title: "Skipped items", difficulty: 4,
            concepts: ["list-iterate", "mutability"],
            prompt: L([
              "This should remove every negative number, leaving `[3, 8]`. It leaves `[3, -2, 8]` instead.",
              "",
              "Fix it by building a new list rather than removing while looping. `clean` must end up as the filtered list."
            ]),
            starter: L([
              "numbers = [3, -1, -2, 8]",
              "clean = numbers",
              "for n in clean:",
              "    if n < 0:",
              "        clean.remove(n)",
              "print(clean)"
            ]),
            hints: [
              "Removing during iteration shifts the remaining items and the loop skips one.",
              "Loop over `numbers` and append the non-negative ones to a fresh `clean = []`."
            ],
            tests: [
              { name: "clean is [3, 8]", call: "clean", expect: [3, 8] },
              { name: "prints [3, 8]", out_exact: "[3, 8]" }
            ],
            solution: L([
              "numbers = [3, -1, -2, 8]",
              "clean = []",
              "for n in numbers:",
              "    if n >= 0:",
              "        clean.append(n)",
              "print(clean)"
            ]),
            takeaway: "Mutating a list while iterating it is a silent, data-dependent bug — it can even look correct for some inputs. Build a new list."
          },
          {
            kind: "code", title: "Longest word", difficulty: 3,
            concepts: ["loop-patterns", "list-iterate"],
            prompt: L([
              "Write `longest_word(sentence)` returning the longest word. On a tie, return the first one.",
              "Return `''` for an empty sentence.",
              "",
              "The checks forbid `max` and `sorted` — use the *best so far* pattern."
            ]),
            starter: "def longest_word(sentence):\n    ",
            forbids: [
              { contains: "max(", msg: "Use the best-so-far pattern" },
              { contains: "sorted(", msg: "Use the best-so-far pattern" }
            ],
            hints: [
              "Split into words, start with `best = ''`.",
              "Replace `best` only when a word is **strictly** longer — that keeps the first on a tie."
            ],
            tests: [
              { name: "finds the longest", call: "longest_word('the quick brown fox')", expect: "quick" },
              { name: "first wins a tie", call: "longest_word('aa bb cc')", expect: "aa" },
              { name: "empty gives empty", call: "longest_word('')", expect: "" },
              { name: "single word", call: "longest_word('hello')", expect: "hello" }
            ],
            solution: L([
              "def longest_word(sentence):",
              "    best = ''",
              "    for word in sentence.split():",
              "        if len(word) > len(best):",
              "            best = word",
              "    return best"
            ]),
            takeaway: "`>` keeps the first winner, `>=` keeps the last. Which one you want is a real decision, not a detail."
          }
        ]
      }
    ],

    checkpoint: {
      id: "m08cp", pass: 0.8,
      title: "Checkpoint: Lists I",
      items: [
        {
          kind: "code", title: "Double every number", difficulty: 2, concepts: ["list-build"],
          prompt: "Write `doubled(numbers)` returning a new list with every value doubled.",
          starter: "def doubled(numbers):\n    ",
          tests: [
            { name: "doubles", call: "doubled([1, 2, 3])", expect: [2, 4, 6] },
            { name: "empty stays empty", call: "doubled([])", expect: [] },
            { name: "input untouched", code: "d = [1, 2]\ndoubled(d)\nassert d == [1, 2]" }
          ]
        },
        {
          kind: "predict", title: "Aliasing", difficulty: 3, concepts: ["mutability"],
          prompt: "What is printed?\n\n~~~py\na = [1, 2]\nb = a\nb[0] = 99\nprint(a[0])\n~~~",
          choices: ["`1`", "`99`", "`[99, 2]`", "An error"],
          answer: 1,
          explain: "`b = a` binds a second name to the same list object, so changes through either name are visible through both."
        },
        {
          kind: "debug", title: "Wrong average", difficulty: 3, concepts: ["list-aggregate"],
          prompt: "`mean([])` should return `0` but crashes. Fix it without breaking the normal case.",
          starter: "def mean(values):\n    return sum(values) / len(values)",
          tests: [
            { name: "normal case", call: "mean([2, 4])", expect: 3.0 },
            { name: "empty returns 0", call: "mean([])", expect: 0 }
          ]
        },
        {
          kind: "code", title: "Count the long words", difficulty: 3, concepts: ["list-iterate", "loop-patterns"],
          prompt: "Write `count_long(words, n)` returning how many words are longer than `n` characters.",
          starter: "def count_long(words, n):\n    ",
          tests: [
            { name: "counts correctly", call: "count_long(['a', 'abc', 'abcde'], 2)", expect: 2 },
            { name: "strictly longer", call: "count_long(['abc'], 3)", expect: 0 },
            { name: "empty list", call: "count_long([], 1)", expect: 0 }
          ]
        },
        {
          kind: "quiz", title: "In-place methods", difficulty: 2, concepts: ["list-methods"],
          prompt: "What does `[3, 1, 2].sort()` evaluate to?",
          choices: ["`[1, 2, 3]`", "`None`", "`[3, 1, 2]`", "A TypeError"],
          answer: 1,
          explain: "`.sort()` rearranges the list in place and returns `None`. Use `sorted(...)` when you want the sorted list as a value."
        }
      ]
    },

    project: {
      id: "m08proj",
      title: "Project: Grade Book",
      xp: 320,
      filename: "gradebook.py",
      concepts: ["def-function", "return-value", "list-iterate", "list-build", "str-split-join", "elif", "list-aggregate"],
      brief: L([
        "Your first real program. It takes raw text, turns it into data, analyses it and produces a report —",
        "which is the shape of an enormous amount of professional software.",
        "",
        "You are building a small grade book. Work through the stages in order; each one has its own checks,",
        "and the final stage runs all of them together.",
        "",
        "**Everything must be functions that return values.** No printing inside the functions except where a",
        "stage explicitly asks for it.",
        "",
        ":::tip How to work",
        "Write one function, press **Check current stage**, and only move on when it is green. Do not try to",
        "write all five at once — that is how you end up with five bugs at the same time.",
        ":::"
      ]),
      starter: L([
        "# Grade Book",
        "# Work through the stages one at a time.",
        "",
        "",
        "def parse_scores(text):",
        "    \"\"\"Turn 'ada:80, grace:91' into [('ada', 80), ('grace', 91)].\"\"\"",
        "    ",
        "",
        "def average(scores):",
        "    \"\"\"Return the mean of a list of numbers, or 0.0 if empty.\"\"\"",
        "    ",
        "",
        "def grade(score):",
        "    \"\"\"Return A/B/C/D/F for a score.\"\"\"",
        "    ",
        "",
        "def report(text):",
        "    \"\"\"Return the full multi-line report.\"\"\"",
        "    ",
        "",
        "def top_student(text):",
        "    \"\"\"Return the name of the highest scorer.\"\"\"",
        "    "
      ]),
      solution: L([
        "def parse_scores(text):",
        "    pairs = []",
        "    for chunk in text.split(','):",
        "        chunk = chunk.strip()",
        "        if not chunk:",
        "            continue",
        "        parts = chunk.split(':')",
        "        pairs.append((parts[0].strip(), int(parts[1].strip())))",
        "    return pairs",
        "",
        "",
        "def average(scores):",
        "    if not scores:",
        "        return 0.0",
        "    return sum(scores) / len(scores)",
        "",
        "",
        "def grade(score):",
        "    if score >= 90:",
        "        return 'A'",
        "    if score >= 80:",
        "        return 'B'",
        "    if score >= 70:",
        "        return 'C'",
        "    if score >= 60:",
        "        return 'D'",
        "    return 'F'",
        "",
        "",
        "def report(text):",
        "    pairs = parse_scores(text)",
        "    if not pairs:",
        "        return 'No scores'",
        "    lines = []",
        "    scores = []",
        "    for name, score in pairs:",
        "        lines.append(f'{name:<8}{score:>3}  {grade(score)}')",
        "        scores.append(score)",
        "    lines.append('---')",
        "    lines.append(f'Average: {average(scores):.1f}')",
        "    return '\\n'.join(lines)",
        "",
        "",
        "def top_student(text):",
        "    pairs = parse_scores(text)",
        "    if not pairs:",
        "        return None",
        "    best_name = pairs[0][0]",
        "    best_score = pairs[0][1]",
        "    for name, score in pairs:",
        "        if score > best_score:",
        "            best_name = name",
        "            best_score = score",
        "    return best_name",
        "",
        "",
        "DATA = 'ada:80, grace:91, alan:64, katherine:97, mary:58'",
        "print(report(DATA))",
        "print(f'Top: {top_student(DATA)}')"
      ]),
      outro: L([
        "You have written a program that parses input, transforms it, aggregates it and formats a report —",
        "with every piece independently tested. That is not a toy: it is the same structure as a payroll run,",
        "a log analyser or a sales dashboard.",
        "",
        "**Tier 1 is complete.** You can now make a computer store, decide, repeat and organise. Tier 2 is about",
        "modelling problems properly — richer data structures, cleaner functions, and handling things going wrong."
      ]),
      stages: [
        {
          title: "Parse the input",
          xp: 60,
          spec: L([
            "Write `parse_scores(text)`.",
            "",
            "Input looks like `'ada:80, grace:91, alan:64'` — pairs separated by commas, name and score separated",
            "by a colon. There may be extra spaces anywhere.",
            "",
            "Return a **list of tuples**: `[('ada', 80), ('grace', 91), ('alan', 64)]`. Scores must be whole numbers,",
            "not strings. An empty input returns an empty list.",
            "",
            "*A tuple is written with parentheses — `('ada', 80)` — and for now behaves like a list you cannot change.*"
          ]),
          tests: [
            { name: "parses three students", call: "parse_scores('ada:80, grace:91, alan:64')", expect: [["ada", 80], ["grace", 91], ["alan", 64]] },
            { name: "scores are integers", code: "pairs = parse_scores('ada:80')\nassert isinstance(pairs[0][1], int), 'the score must be an int, not a string'" },
            { name: "handles messy spacing", call: "parse_scores('  ada : 80 ,grace:91  ')", expect: [["ada", 80], ["grace", 91]] },
            { name: "empty input gives an empty list", call: "parse_scores('')", expect: [] },
            { name: "single student", call: "parse_scores('solo:100')", expect: [["solo", 100]] }
          ]
        },
        {
          title: "Average and grade",
          xp: 60,
          spec: L([
            "Write `average(scores)` — the mean of a list of numbers as a float, or `0.0` when the list is empty.",
            "",
            "Write `grade(score)` returning a single letter:",
            "",
            "| Score | Grade |",
            "|---|---|",
            "| 90+ | A |",
            "| 80–89 | B |",
            "| 70–79 | C |",
            "| 60–69 | D |",
            "| below 60 | F |"
          ]),
          tests: [
            { name: "average of three", call: "average([80, 91, 64])", expect: 78.33333333333333 },
            { name: "empty average is 0.0", call: "average([])", expect: 0.0 },
            { name: "grade boundaries", call: "[grade(90), grade(89), grade(80), grade(70), grade(60), grade(59)]", expect: ["A", "B", "B", "C", "D", "F"] },
            { name: "perfect score", call: "grade(100)", expect: "A" },
            { name: "zero", call: "grade(0)", expect: "F" }
          ]
        },
        {
          title: "The report",
          xp: 80,
          spec: L([
            "Write `report(text)` returning a multi-line string built from the parsed input.",
            "",
            "For `'ada:80, grace:91, alan:64'` it returns exactly:",
            "",
            "~~~text",
            "ada      80  B",
            "grace    91  A",
            "alan     64  D",
            "---",
            "Average: 78.3",
            "~~~",
            "",
            "Rules:",
            "",
            "- names are left-aligned in a field **8 characters** wide (`f'{name:<8}'`)",
            "- scores are right-aligned in a field **3 characters** wide (`f'{score:>3}'`)",
            "- two spaces between the score and the grade letter",
            "- then a line containing exactly `---`",
            "- then `Average: ` and the average rounded to **one** decimal place",
            "- there is no trailing newline at the end",
            "",
            "For empty input, return exactly `No scores`."
          ]),
          tests: [
            { name: "the standard report", call: "report('ada:80, grace:91, alan:64')", expect: "ada      80  B\ngrace    91  A\nalan     64  D\n---\nAverage: 78.3" },
            { name: "single student", call: "report('solo:100')", expect: "solo    100  A\n---\nAverage: 100.0" },
            { name: "empty input", call: "report('')", expect: "No scores" },
            { name: "rounding to one place", call: "report('a:80, b:81')", expect: "a        80  B\nb        81  B\n---\nAverage: 80.5" }
          ]
        },
        {
          title: "Top student",
          xp: 60,
          spec: L([
            "Write `top_student(text)` returning the name of the highest scorer.",
            "",
            "On a tie, return the one that appears **first** in the input. For empty input return `None`.",
            "",
            "Use the best-so-far pattern rather than sorting."
          ]),
          tests: [
            { name: "finds the top scorer", call: "top_student('ada:80, grace:91, alan:64')", expect: "grace" },
            { name: "first wins a tie", call: "top_student('ada:91, grace:91')", expect: "ada" },
            { name: "single student", call: "top_student('solo:12')", expect: "solo" },
            { name: "empty gives None", code: "assert top_student('') is None" }
          ]
        },
        {
          title: "Ship it",
          xp: 60,
          spec: L([
            "Add a final section at the bottom of the file (not inside any function) that prints the report for",
            "this data, followed by a line naming the top student:",
            "",
            "~~~py",
            "DATA = 'ada:80, grace:91, alan:64, katherine:97, mary:58'",
            "~~~",
            "",
            "Expected output:",
            "",
            "~~~text",
            "ada      80  B",
            "grace    91  A",
            "alan     64  D",
            "katherine 97  A",
            "mary     58  F",
            "---",
            "Average: 78.0",
            "Top: katherine",
            "~~~",
            "",
            "Note that `katherine` is longer than 8 characters, so the field simply grows — that is what `:<8` does,",
            "and handling it correctly is part of the exercise.",
            "",
            "All earlier stages must still pass."
          ]),
          tests: [
            { name: "prints the report", out: "ada      80  B" },
            { name: "long name is not truncated", out: "katherine 97  A" },
            { name: "average line", out: "Average: 78.0" },
            { name: "top line", out: "Top: katherine" },
            { name: "report function still correct", call: "report('ada:80, grace:91, alan:64')", expect: "ada      80  B\ngrace    91  A\nalan     64  D\n---\nAverage: 78.3" },
            { name: "parse still correct", call: "parse_scores('a:1')", expect: [["a", 1]] }
          ]
        }
      ]
    }
  });
})();
