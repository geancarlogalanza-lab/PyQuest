/* Tier 3 · Module 21 — Algorithms & Complexity */
(function () {
  const L = a => a.join("\n");

  PQ.defineModule({
    id: "m21", tier: 3, order: 21, icon: "⚡",
    title: "Algorithms & Complexity",
    blurb: "Why one solution takes a second and another takes a week — and how to choose.",
    intro: L([
      "Two programs can produce identical answers and differ by a factor of a million in how long they take.",
      "The difference is almost never how fast you type — it is the shape of the algorithm and the data",
      "structure underneath it.",
      "",
      "This module is about recognising that shape."
    ]),
    concepts: [
      { id: "big-o", name: "Big-O notation", importance: 1.6 },
      { id: "complexity-analysis", name: "analysing complexity", importance: 1.5 },
      { id: "structure-choice", name: "choosing a data structure", importance: 1.6 },
      { id: "linear-search", name: "linear search" },
      { id: "binary-search", name: "binary search", importance: 1.4 },
      { id: "sorting-algos", name: "sorting", importance: 1.3 },
      { id: "recursion", name: "recursion", importance: 1.5 },
      { id: "memoisation", name: "memoisation", importance: 1.4 },
      { id: "dp-intro", name: "dynamic programming", importance: 1.2 }
    ],

    lessons: [
      {
        id: "m21l1", title: "Big-O and why it matters", minutes: 13,
        concepts: ["big-o", "complexity-analysis", "structure-choice"],
        content: L([
          "## Counting operations, not seconds",
          "",
          "Big-O describes how the work grows as the input grows. Constants and small terms are dropped,",
          "because for large `n` only the shape matters.",
          "",
          "| Notation | Name | n = 1,000 | n = 1,000,000 |",
          "|---|---|---|---|",
          "| `O(1)` | constant | 1 | 1 |",
          "| `O(log n)` | logarithmic | 10 | 20 |",
          "| `O(n)` | linear | 1,000 | 1,000,000 |",
          "| `O(n log n)` | linearithmic | 10,000 | 20,000,000 |",
          "| `O(n²)` | quadratic | 1,000,000 | 1,000,000,000,000 |",
          "| `O(2ⁿ)` | exponential | more atoms than the universe has | — |",
          "",
          "The jump from `O(n log n)` to `O(n²)` is the one that ends careers. At a million items, sorting takes",
          "a moment and a nested loop takes weeks.",
          "",
          "## Reading it off the code",
          "",
          "~~~py",
          "def first(items):          # O(1) -- one step regardless of size",
          "    return items[0]",
          "",
          "def total(items):          # O(n) -- one pass",
          "    t = 0",
          "    for x in items:",
          "        t += x",
          "    return t",
          "",
          "def has_duplicate(items):  # O(n^2) -- a loop inside a loop",
          "    for i in range(len(items)):",
          "        for j in range(i + 1, len(items)):",
          "            if items[i] == items[j]:",
          "                return True",
          "    return False",
          "~~~",
          "",
          "**The rule of thumb:** nested loops over the same data multiply. One loop is `n`; a loop inside a loop",
          "is `n²`.",
          "",
          ":::trap The hidden loop",
          "~~~py",
          "for item in items:          # n",
          "    if item in seen_list:   # ...and this scans the whole list: n",
          "        ...                 # total: O(n^2)",
          "~~~",
          "`in` on a **list** is `O(n)`. `in` on a **set** or **dict** is `O(1)`. Changing `seen_list = []` to",
          "`seen = set()` turns quadratic into linear — one word, and the difference between 40 seconds and",
          "0.04 seconds at 100,000 items.",
          ":::",
          "",
          "## Costs of the built-in structures",
          "",
          "| Operation | list | dict / set | deque |",
          "|---|---|---|---|",
          "| index `x[i]` | O(1) | — | O(n) |",
          "| `x[key]` | — | O(1) | — |",
          "| `in` | **O(n)** | **O(1)** | O(n) |",
          "| append | O(1) | O(1) | O(1) |",
          "| insert/pop at front | **O(n)** | — | **O(1)** |",
          "| `sorted()` | O(n log n) | O(n log n) | O(n log n) |",
          "",
          "Most real performance problems are one of these three mistakes:",
          "",
          "1. `in` on a list inside a loop",
          "2. `list.pop(0)` or `insert(0, x)` in a loop (use a `deque`)",
          "3. building a string with `+=` in a loop (use a list and `''.join`)",
          "",
          "## Measuring",
          "",
          "~~~py",
          "import time",
          "",
          "start = time.perf_counter()",
          "do_the_thing()",
          "print(f'{time.perf_counter() - start:.4f}s')",
          "~~~",
          "",
          ":::why Measure before optimising",
          "Programmers are famously bad at guessing where time goes. Profile first (`cProfile`), then optimise",
          "the one function that dominates. Rewriting a function that accounts for 2% of runtime is wasted work",
          "no matter how clever the rewrite.",
          "",
          "But also: no amount of micro-optimisation rescues an `O(n²)` algorithm. Fix the shape first.",
          ":::"
        ]),
        exercises: [
          {
            kind: "quiz", title: "Read the complexity", difficulty: 3,
            concepts: ["complexity-analysis"],
            prompt: L([
              "What is the time complexity?",
              "",
              "~~~py",
              "def f(items):",
              "    result = []",
              "    for a in items:",
              "        for b in items:",
              "            result.append(a * b)",
              "    return result",
              "~~~"
            ]),
            choices: ["`O(n)`", "`O(n log n)`", "`O(n²)`", "`O(2ⁿ)`"],
            answer: 2,
            explain: "Two loops over the same `n` items, one inside the other, gives `n × n` iterations. Doubling the input quadruples the work."
          },
          {
            kind: "refactor", title: "Kill the quadratic", difficulty: 4,
            concepts: ["structure-choice", "big-o"],
            prompt: L([
              "`find_duplicates` is `O(n²)` because `in` on a list scans it. Rewrite it to be `O(n)` while",
              "keeping the same output: the duplicated values in the order they were **first seen to repeat**.",
              "",
              "`find_duplicates([1, 2, 1, 3, 2, 1])` → `[1, 2]`",
              "",
              "The checks include a large input that will time out if it is still quadratic."
            ]),
            starter: L([
              "def find_duplicates(items):",
              "    duplicates = []",
              "    for i, item in enumerate(items):",
              "        if item in items[:i] and item not in duplicates:",
              "            duplicates.append(item)",
              "    return duplicates"
            ]),
            hints: [
              "Keep a `seen` **set** and a `reported` set.",
              "If the item is already in `seen` and not yet reported, append it and mark it reported.",
              "Otherwise add it to `seen`."
            ],
            tests: [
              { name: "finds duplicates in order", call: "find_duplicates([1, 2, 1, 3, 2, 1])", expect: [1, 2] },
              { name: "no duplicates", call: "find_duplicates([1, 2, 3])", expect: [] },
              { name: "empty", call: "find_duplicates([])", expect: [] },
              { name: "all the same", call: "find_duplicates([5, 5, 5])", expect: [5] },
              { name: "works with strings", call: "find_duplicates(['a', 'b', 'a'])", expect: ["a"] },
              {
                name: "fast enough on 60,000 items",
                code: "import time\ndata = list(range(30000)) * 2\nstart = time.perf_counter()\nresult = find_duplicates(data)\nelapsed = time.perf_counter() - start\nassert len(result) == 30000\nassert elapsed < 2.0, f'took {elapsed:.2f}s — still quadratic?'"
              }
            ],
            solution: L([
              "def find_duplicates(items):",
              "    seen = set()",
              "    reported = set()",
              "    duplicates = []",
              "    for item in items:",
              "        if item in seen and item not in reported:",
              "            duplicates.append(item)",
              "            reported.add(item)",
              "        seen.add(item)",
              "    return duplicates"
            ]),
            takeaway: "Same output, same line count, and it went from unusable to instant. Choosing the right structure *is* the optimisation."
          },
          {
            kind: "quiz", title: "Which structure", difficulty: 3,
            concepts: ["structure-choice"],
            prompt: "You repeatedly remove items from the **front** of a collection of 100,000 elements. What should you use?",
            choices: [
              "A list with `.pop(0)`",
              "`collections.deque` with `.popleft()`",
              "A set",
              "A dictionary"
            ],
            answer: 1,
            explain: "`list.pop(0)` shifts every remaining element — `O(n)` per removal, so `O(n²)` overall. A `deque` removes from either end in constant time."
          },
          {
            kind: "code", title: "Fast lookups", difficulty: 3,
            concepts: ["structure-choice"],
            prompt: L([
              "Write `filter_allowed(items, allowed)` returning the items that appear in `allowed`, preserving order.",
              "",
              "`allowed` may be a large list. Your function must be `O(n + m)`, not `O(n × m)` —",
              "the checks include a large input."
            ]),
            starter: "def filter_allowed(items, allowed):\n    ",
            hints: [
              "Convert `allowed` to a set **once**, before the loop.",
              "Doing `set(allowed)` inside the loop would be just as slow as before."
            ],
            tests: [
              { name: "filters correctly", call: "filter_allowed([1, 2, 3, 4], [2, 4])", expect: [2, 4] },
              { name: "preserves order", call: "filter_allowed(['c', 'a', 'b'], ['a', 'b', 'c'])", expect: ["c", "a", "b"] },
              { name: "nothing allowed", call: "filter_allowed([1, 2], [])", expect: [] },
              {
                name: "fast on large input",
                code: "import time\nitems = list(range(50000))\nallowed = list(range(25000, 75000))\nstart = time.perf_counter()\nresult = filter_allowed(items, allowed)\nelapsed = time.perf_counter() - start\nassert len(result) == 25000\nassert elapsed < 2.0, f'took {elapsed:.2f}s — convert allowed to a set once'"
              }
            ],
            solution: L([
              "def filter_allowed(items, allowed):",
              "    allowed_set = set(allowed)",
              "    return [item for item in items if item in allowed_set]"
            ])
          }
        ]
      },

      {
        id: "m21l2", title: "Searching and sorting", minutes: 12,
        concepts: ["linear-search", "binary-search", "sorting-algos"],
        content: L([
          "## Linear search: O(n)",
          "",
          "~~~py",
          "def find(items, target):",
          "    for i, item in enumerate(items):",
          "        if item == target:",
          "            return i",
          "    return -1",
          "~~~",
          "",
          "Works on anything, in any order. On average it looks at half the collection.",
          "",
          "## Binary search: O(log n)",
          "",
          "If the data is **sorted**, you can halve the search space every step:",
          "",
          "~~~py",
          "def binary_search(items, target):",
          "    low, high = 0, len(items) - 1",
          "    while low <= high:",
          "        mid = (low + high) // 2",
          "        if items[mid] == target:",
          "            return mid",
          "        if items[mid] < target:",
          "            low = mid + 1",
          "        else:",
          "            high = mid - 1",
          "    return -1",
          "~~~",
          "",
          "A million sorted items takes at most **20** comparisons.",
          "",
          ":::warn Binary search is famously easy to get wrong",
          "The classic bugs are `low < high` instead of `low <= high` (misses the last element) and forgetting",
          "the `+ 1` / `- 1` (infinite loop). Write it once carefully, then use `bisect` from the standard",
          "library — it is correct and tested.",
          "",
          "~~~py",
          "import bisect",
          "position = bisect.bisect_left(items, target)",
          "~~~",
          ":::",
          "",
          "**The trade-off:** sorting costs `O(n log n)`. Sorting once to search many times is a win; sorting",
          "to do a single search is not.",
          "",
          "## Sorting",
          "",
          "You will not implement a sort in production — `sorted()` uses Timsort, which is `O(n log n)`, stable,",
          "and unusually fast on partly-sorted real data. But knowing the shapes is worth it:",
          "",
          "| Algorithm | Average | Worst | Notes |",
          "|---|---|---|---|",
          "| Bubble sort | O(n²) | O(n²) | teaching only |",
          "| Insertion sort | O(n²) | O(n²) | excellent on tiny or nearly-sorted input |",
          "| Merge sort | O(n log n) | O(n log n) | stable, needs extra memory |",
          "| Quicksort | O(n log n) | O(n²) | in place, fast in practice |",
          "| **Timsort** | O(n log n) | O(n log n) | Python's, hybrid, stable |",
          "",
          "## Selection sort, written out",
          "",
          "~~~py",
          "def selection_sort(items):",
          "    items = list(items)",
          "    for i in range(len(items)):",
          "        smallest = i",
          "        for j in range(i + 1, len(items)):",
          "            if items[j] < items[smallest]:",
          "                smallest = j",
          "        items[i], items[smallest] = items[smallest], items[i]",
          "    return items",
          "~~~",
          "",
          "Two nested loops over the same data: `O(n²)`. Fine for 100 items, hopeless for 100,000.",
          "",
          ":::tip The real skill",
          "It is not implementing quicksort from memory. It is recognising, when your code is slow,",
          "*this is quadratic because of that inner `in`* — and knowing which structure fixes it.",
          ":::"
        ]),
        exercises: [
          {
            kind: "code", title: "Binary search", difficulty: 4,
            concepts: ["binary-search"],
            prompt: L([
              "Implement `binary_search(items, target)` on a **sorted** list, returning the index or `-1`.",
              "",
              "Do not use `.index()`, `in`, or the `bisect` module — the checks forbid them.",
              "It must be `O(log n)`: the checks include a very large list."
            ]),
            starter: "def binary_search(items, target):\n    ",
            forbids: [
              { contains: ".index(", msg: "Implement the search yourself" },
              { contains: "bisect", msg: "Implement the search yourself" }
            ],
            hints: [
              "Track `low` and `high` as indexes. Loop while `low <= high`.",
              "`mid = (low + high) // 2`.",
              "If the middle is too small, search the right half: `low = mid + 1`. Otherwise `high = mid - 1`."
            ],
            tests: [
              { name: "finds a middle value", call: "binary_search([1, 3, 5, 7, 9], 5)", expect: 2 },
              { name: "finds the first", call: "binary_search([1, 3, 5], 1)", expect: 0 },
              { name: "finds the last", call: "binary_search([1, 3, 5], 5)", expect: 2 },
              { name: "missing gives -1", call: "binary_search([1, 3, 5], 4)", expect: -1 },
              { name: "empty list", call: "binary_search([], 1)", expect: -1 },
              { name: "single item found", call: "binary_search([7], 7)", expect: 0 },
              { name: "single item missing", call: "binary_search([7], 1)", expect: -1 },
              {
                name: "logarithmic on ten million items",
                code: "import time\nbig = list(range(10_000_000))\nstart = time.perf_counter()\nassert binary_search(big, 9_999_999) == 9_999_999\nassert binary_search(big, -1) == -1\nelapsed = time.perf_counter() - start\nassert elapsed < 0.5, f'took {elapsed:.3f}s — is it scanning linearly?'"
              }
            ],
            solution: L([
              "def binary_search(items, target):",
              "    low = 0",
              "    high = len(items) - 1",
              "    while low <= high:",
              "        mid = (low + high) // 2",
              "        if items[mid] == target:",
              "            return mid",
              "        if items[mid] < target:",
              "            low = mid + 1",
              "        else:",
              "            high = mid - 1",
              "    return -1"
            ]),
            takeaway: "Ten million items, twenty-four comparisons. Halving the problem each step is one of the most powerful ideas in computing."
          },
          {
            kind: "code", title: "Insertion sort", difficulty: 4,
            concepts: ["sorting-algos"],
            prompt: L([
              "Implement `insertion_sort(items)` returning a **new** sorted list, without using `sorted`,",
              "`.sort()`, `min` or `max`.",
              "",
              "It must be stable: equal items keep their original relative order."
            ]),
            starter: "def insertion_sort(items):\n    ",
            forbids: [
              { contains: "sorted(", msg: "Implement it yourself" },
              { contains: ".sort(", msg: "Implement it yourself" },
              { contains: "min(", msg: "Implement it yourself" },
              { contains: "max(", msg: "Implement it yourself" }
            ],
            hints: [
              "Build a `result` list. For each item, find where it belongs and insert it there.",
              "Scan `result` for the first element **greater than** the item — strictly greater keeps it stable.",
              "`result.insert(position, item)` puts it in place."
            ],
            tests: [
              { name: "sorts numbers", call: "insertion_sort([3, 1, 2])", expect: [1, 2, 3] },
              { name: "already sorted", call: "insertion_sort([1, 2, 3])", expect: [1, 2, 3] },
              { name: "reversed", call: "insertion_sort([3, 2, 1])", expect: [1, 2, 3] },
              { name: "empty", call: "insertion_sort([])", expect: [] },
              { name: "duplicates", call: "insertion_sort([2, 1, 2])", expect: [1, 2, 2] },
              { name: "does not modify the input", code: "data = [3, 1]\ninsertion_sort(data)\nassert data == [3, 1]" },
              {
                name: "stable: equal items keep their original order",
                code: "class Tagged:\n    def __init__(self, value, tag):\n        self.value = value\n        self.tag = tag\n    def __lt__(self, other):\n        return self.value < other.value\n    def __gt__(self, other):\n        return self.value > other.value\nitems = [Tagged(1, 'first'), Tagged(0, 'zero'), Tagged(1, 'second')]\nresult = insertion_sort(items)\nassert [t.tag for t in result] == ['zero', 'first', 'second'], 'equal values must keep their input order'"
              },
              {
                name: "handles a longer list",
                code: "import random\nrandom.seed(7)\ndata = [random.randint(0, 50) for _ in range(200)]\nassert insertion_sort(data) == sorted(data)"
              }
            ],
            solution: L([
              "def insertion_sort(items):",
              "    result = []",
              "    for item in items:",
              "        position = len(result)",
              "        for i, existing in enumerate(result):",
              "            if existing > item:",
              "                position = i",
              "                break",
              "        result.insert(position, item)",
              "    return result"
            ])
          },
          {
            kind: "predict", title: "Sorted then searched", difficulty: 3,
            concepts: ["binary-search", "big-o"],
            prompt: L([
              "You need to check membership **once** in an unsorted list of a million items.",
              "Which is faster: a linear scan, or sorting then binary searching?"
            ]),
            choices: [
              "Sorting then binary searching, because binary search is O(log n)",
              "The linear scan, because sorting alone costs O(n log n)",
              "They are identical",
              "Neither works on unsorted data"
            ],
            answer: 1,
            explain: "The `O(log n)` search is irrelevant when you first pay `O(n log n)` to sort. Sorting pays off only when you will search many times — or if you need the order anyway."
          },
          {
            kind: "quiz", title: "Why Timsort", difficulty: 3,
            concepts: ["sorting-algos"],
            prompt: "Python's `sorted()` is stable. Why does that matter in practice?",
            choices: [
              "It makes sorting faster",
              "Equal items keep their original order, which lets you sort by several keys with successive sorts",
              "It uses less memory",
              "It allows sorting mixed types"
            ],
            answer: 1,
            explain: "Stability is what makes multi-key sorting work: sort by the least significant key first, then by the most significant, and the earlier ordering survives inside each group."
          }
        ]
      },

      {
        id: "m21l3", title: "Recursion and memoisation", minutes: 13,
        concepts: ["recursion", "memoisation", "dp-intro"],
        content: L([
          "## A function that calls itself",
          "",
          "~~~py",
          "def factorial(n):",
          "    if n <= 1:          # base case: stop",
          "        return 1",
          "    return n * factorial(n - 1)      # recursive case: smaller problem",
          "~~~",
          "",
          "Every recursive function needs both:",
          "",
          "1. a **base case** that returns without recursing",
          "2. a **recursive case** that moves *closer* to the base case",
          "",
          "Miss either and you get `RecursionError: maximum recursion depth exceeded` — Python's version of",
          "an infinite loop.",
          "",
          "## Where recursion is genuinely better",
          "",
          "Anything tree-shaped or nested. Compare walking a nested structure iteratively (you would need an",
          "explicit stack) with:",
          "",
          "~~~py",
          "def flatten(items):",
          "    result = []",
          "    for item in items:",
          "        if isinstance(item, list):",
          "            result.extend(flatten(item))     # a list is just a smaller version of the problem",
          "        else:",
          "            result.append(item)",
          "    return result",
          "",
          "print(flatten([1, [2, [3, [4]]], 5]))",
          "~~~",
          "~~~out",
          "[1, 2, 3, 4, 5]",
          "~~~",
          "",
          "Directory trees, JSON documents, HTML, parse trees, file systems — all naturally recursive.",
          "",
          ":::warn Python is not built for deep recursion",
          "The default limit is about 1,000 frames and there is no tail-call optimisation. Recursion depth",
          "should be proportional to the *depth* of your data (a tree), not its *size* (a million-item list).",
          "For linear data, write the loop.",
          ":::",
          "",
          "## When recursion goes exponential",
          "",
          "~~~py",
          "def fib(n):",
          "    if n < 2:",
          "        return n",
          "    return fib(n - 1) + fib(n - 2)",
          "~~~",
          "",
          "`fib(35)` makes about **30 million** calls, because `fib(30)` is recomputed over and over.",
          "The call tree is exponential: `O(2ⁿ)`.",
          "",
          "## Memoisation fixes it",
          "",
          "~~~py",
          "import functools",
          "",
          "@functools.lru_cache(maxsize=None)",
          "def fib(n):",
          "    if n < 2:",
          "        return n",
          "    return fib(n - 1) + fib(n - 2)",
          "~~~",
          "",
          "Now each `n` is computed once: `O(n)`. One decorator, exponential to linear.",
          "",
          "By hand, it is the pattern from Module 19:",
          "",
          "~~~py",
          "def fib(n, cache={}):        # note: a mutable default used deliberately",
          "    if n < 2:",
          "        return n",
          "    if n not in cache:",
          "        cache[n] = fib(n - 1) + fib(n - 2)",
          "    return cache[n]",
          "~~~",
          "",
          "## Dynamic programming",
          "",
          "Memoisation is DP *top-down*. The other direction is *bottom-up*: build the answers up from the",
          "smallest case with a loop, no recursion at all.",
          "",
          "~~~py",
          "def fib(n):",
          "    a, b = 0, 1",
          "    for _ in range(n):",
          "        a, b = b, a + b",
          "    return a",
          "~~~",
          "",
          "`O(n)` time, `O(1)` memory, no recursion limit. Usually the best of the three.",
          "",
          "**A problem is a DP problem when** it can be broken into overlapping sub-problems whose answers you",
          "would otherwise compute repeatedly. Climbing stairs, coin change, edit distance, longest common",
          "subsequence — all the same shape."
        ]),
        exercises: [
          {
            kind: "code", title: "Recursive sum", difficulty: 3,
            concepts: ["recursion"],
            prompt: L([
              "Write `deep_sum(items)` returning the sum of every number in an arbitrarily nested list.",
              "",
              "`deep_sum([1, [2, [3, [4]]], 5])` → `15`",
              "",
              "It must be recursive — the checks forbid `while`."
            ]),
            starter: "def deep_sum(items):\n    ",
            forbids: [{ re: "\\bwhile\\b", msg: "Solve it recursively" }],
            hints: [
              "Loop over the items. If an item is a list, add `deep_sum(item)`; otherwise add the item.",
              "`isinstance(item, list)` is the test.",
              "The base case is implicit: an empty list contributes 0."
            ],
            tests: [
              { name: "nested", call: "deep_sum([1, [2, [3, [4]]], 5])", expect: 15 },
              { name: "flat", call: "deep_sum([1, 2, 3])", expect: 6 },
              { name: "empty", call: "deep_sum([])", expect: 0 },
              { name: "empty nests", call: "deep_sum([[], [[]], 1])", expect: 1 },
              { name: "deeply nested", call: "deep_sum([[[[[5]]]]])", expect: 5 }
            ],
            solution: L([
              "def deep_sum(items):",
              "    total = 0",
              "    for item in items:",
              "        if isinstance(item, list):",
              "            total += deep_sum(item)",
              "        else:",
              "            total += item",
              "    return total"
            ])
          },
          {
            kind: "code", title: "Make it fast", difficulty: 3,
            concepts: ["memoisation"],
            prompt: L([
              "This recursive `fib` is correct but exponentially slow. Make `fib(60)` return instantly,",
              "**keeping the recursive shape** — do not rewrite it as a loop.",
              "",
              "`fib(60)` is `1548008755920`."
            ]),
            starter: L([
              "def fib(n):",
              "    if n < 2:",
              "        return n",
              "    return fib(n - 1) + fib(n - 2)"
            ]),
            requires: [{ re: "cache|lru_cache", msg: "Add memoisation" }],
            forbids: [{ re: "\\bfor\\b|\\bwhile\\b", msg: "Keep it recursive" }],
            hints: [
              "`import functools` and add `@functools.lru_cache(maxsize=None)` above the function.",
              "Or keep a dictionary and check it before recursing."
            ],
            tests: [
              { name: "small values", call: "[fib(0), fib(1), fib(2), fib(10)]", expect: [0, 1, 1, 55] },
              { name: "fib(60) is correct", call: "fib(60)", expect: 1548008755920 },
              {
                name: "and it is fast",
                code: "import time\nstart = time.perf_counter()\nfib(60)\nelapsed = time.perf_counter() - start\nassert elapsed < 0.5, f'took {elapsed:.2f}s — memoisation not working'"
              }
            ],
            solution: L([
              "import functools",
              "",
              "",
              "@functools.lru_cache(maxsize=None)",
              "def fib(n):",
              "    if n < 2:",
              "        return n",
              "    return fib(n - 1) + fib(n - 2)"
            ]),
            takeaway: "One line changed 1.5 quintillion operations into 60. Recognising repeated sub-problems is the single highest-leverage optimisation there is."
          },
          {
            kind: "code", title: "Climbing stairs", difficulty: 4,
            concepts: ["dp-intro"],
            prompt: L([
              "You can climb 1 or 2 steps at a time. Write `ways(n)` returning how many distinct ways there are",
              "to climb `n` steps.",
              "",
              "`ways(1)` = 1, `ways(2)` = 2, `ways(3)` = 3, `ways(4)` = 5",
              "",
              "Solve it **bottom-up** with a loop — the checks forbid recursion and require `ways(500)` to be fast."
            ]),
            starter: "def ways(n):\n    ",
            forbids: [{ re: "ways\\s*\\(\\s*n\\s*-", msg: "Solve it iteratively, not recursively" }],
            hints: [
              "To reach step `n` you came from `n-1` or `n-2`, so `ways(n) = ways(n-1) + ways(n-2)`.",
              "That is Fibonacci shifted by one.",
              "Track two variables and loop upwards. Handle `n = 0` (one way: do nothing)."
            ],
            tests: [
              { name: "small cases", call: "[ways(0), ways(1), ways(2), ways(3), ways(4)]", expect: [1, 1, 2, 3, 5] },
              { name: "ten steps", call: "ways(10)", expect: 89 },
              {
                name: "500 steps, instantly",
                code: "import time\nstart = time.perf_counter()\nresult = ways(500)\nassert result > 10 ** 100\nassert time.perf_counter() - start < 0.5"
              }
            ],
            solution: L([
              "def ways(n):",
              "    a, b = 1, 1",
              "    for _ in range(n):",
              "        a, b = b, a + b",
              "    return a"
            ]),
            takeaway: "The bottom-up version has no recursion limit, no cache, and constant memory. When you can see the order to build answers in, the loop usually wins."
          },
          {
            kind: "debug", title: "Missing base case", difficulty: 3,
            concepts: ["recursion"],
            prompt: L([
              "`countdown(3)` should return `[3, 2, 1]` but raises `RecursionError`. Fix it."
            ]),
            starter: L([
              "def countdown(n):",
              "    return [n] + countdown(n - 1)"
            ]),
            hints: [
              "There is nothing that stops the recursion.",
              "Return an empty list when `n` reaches 0 or below."
            ],
            tests: [
              { name: "counts down", call: "countdown(3)", expect: [3, 2, 1] },
              { name: "zero gives empty", call: "countdown(0)", expect: [] },
              { name: "one", call: "countdown(1)", expect: [1] },
              { name: "negatives are safe", call: "countdown(-5)", expect: [] }
            ],
            solution: L([
              "def countdown(n):",
              "    if n <= 0:",
              "        return []",
              "    return [n] + countdown(n - 1)"
            ]),
            takeaway: "`<= 0` rather than `== 0` matters: a base case that can be stepped over does not stop the recursion at all."
          }
        ]
      }
    ],

    checkpoint: {
      id: "m21cp", pass: 0.8,
      title: "Checkpoint: Algorithms & Complexity",
      items: [
        {
          kind: "quiz", title: "Complexity of in", difficulty: 3, concepts: ["big-o"],
          prompt: "What is the complexity of `x in collection` for a list and for a set?",
          choices: [
            "O(1) for both",
            "O(n) for the list, O(1) for the set",
            "O(log n) for both",
            "O(n) for both"
          ],
          answer: 1,
          explain: "A list has to scan; a set hashes straight to the answer. Swapping one for the other is the most common single-word performance fix in Python."
        },
        {
          kind: "code", title: "Make it linear", difficulty: 4, concepts: ["structure-choice"],
          prompt: "Rewrite `count_shared(a, b)` — how many items of `a` appear in `b` — so it is O(n + m). The check includes large inputs.",
          starter: "def count_shared(a, b):\n    total = 0\n    for x in a:\n        if x in b:\n            total += 1\n    return total",
          tests: [
            { name: "counts", call: "count_shared([1, 2, 3], [2, 3, 4])", expect: 2 },
            { name: "none shared", call: "count_shared([1], [2])", expect: 0 },
            { name: "fast on large input", code: "import time\na = list(range(40000))\nb = list(range(20000, 60000))\nstart = time.perf_counter()\nassert count_shared(a, b) == 20000\nassert time.perf_counter() - start < 2.0, 'still quadratic'" }
          ]
        },
        {
          kind: "code", title: "Recursive depth", difficulty: 3, concepts: ["recursion"],
          prompt: "Write `depth(items)` returning how deeply a list is nested. `depth([1, [2, [3]]])` → `3`, `depth([])` → `1`.",
          starter: "def depth(items):\n    ",
          tests: [
            { name: "nested", call: "depth([1, [2, [3]]])", expect: 3 },
            { name: "flat", call: "depth([1, 2])", expect: 1 },
            { name: "empty", call: "depth([])", expect: 1 },
            { name: "very deep", call: "depth([[[[[]]]]])", expect: 5 }
          ]
        },
        {
          kind: "predict", title: "Doubling the input", difficulty: 3, concepts: ["big-o"],
          prompt: "An O(n²) algorithm takes 4 seconds on 10,000 items. Roughly how long on 20,000?",
          choices: ["8 seconds", "16 seconds", "4 seconds", "40 seconds"],
          answer: 1,
          explain: "Doubling `n` quadruples `n²`, so 4 seconds becomes about 16. That is what makes quadratic algorithms fail suddenly rather than gradually."
        },
        {
          kind: "code", title: "Memoise it", difficulty: 3, concepts: ["memoisation"],
          prompt: "Make this `grid_paths(rows, cols)` — the number of routes from top-left to bottom-right moving only right or down — fast enough for `grid_paths(15, 15)`.",
          starter: "def grid_paths(rows, cols):\n    if rows == 1 or cols == 1:\n        return 1\n    return grid_paths(rows - 1, cols) + grid_paths(rows, cols - 1)",
          tests: [
            { name: "small grids", call: "[grid_paths(1, 5), grid_paths(2, 2), grid_paths(3, 3)]", expect: [1, 2, 6] },
            { name: "15x15 is instant", code: "import time\nstart = time.perf_counter()\nassert grid_paths(15, 15) == 40116600\nassert time.perf_counter() - start < 0.5, 'add memoisation'" }
          ]
        }
      ]
    }
  });
})();
