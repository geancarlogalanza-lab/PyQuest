/* Tier 4 · Module 27 — Performance & Memory */
(function () {
  const L = a => a.join("\n");

  PQ.defineModule({
    id: "m27", tier: 4, order: 27, icon: "🚀",
    title: "Performance & Memory",
    blurb: "Measure first, fix the shape, then micro-optimise — and stop building lists you do not need.",
    intro: L([
      "Almost every performance discussion goes wrong in the same way: someone guesses where the time goes,",
      "optimises that, and the program is no faster.",
      "",
      "This module is about the discipline: measure, find the real cost, fix the algorithm before the",
      "constant factor, and know where memory actually goes."
    ]),
    concepts: [
      { id: "measuring", name: "measuring performance", importance: 1.6 },
      { id: "profiling", name: "profiling", importance: 1.4 },
      { id: "premature-opt", name: "premature optimisation", importance: 1.4 },
      { id: "builtin-speed", name: "using built-ins", importance: 1.3 },
      { id: "string-building", name: "building strings", importance: 1.3 },
      { id: "caching", name: "caching", importance: 1.3 },
      { id: "memory-model", name: "memory and references", importance: 1.4 },
      { id: "slots", name: "__slots__" },
      { id: "lazy-memory", name: "streaming instead of loading", importance: 1.4 }
    ],

    lessons: [
      {
        id: "m27l1", title: "Measure before you touch anything", minutes: 12,
        concepts: ["measuring", "profiling", "premature-opt"],
        content: L([
          "## The rule",
          "",
          "> Programmers waste enormous amounts of time thinking about the speed of noncritical parts of their",
          "> programs. Premature optimisation is the root of all evil.",
          "",
          "Knuth's full point is usually cut short. The rest of it is: *we should not pass up our opportunities",
          "in that critical 3%*. Optimisation is not bad — **unmeasured** optimisation is.",
          "",
          "## Timing a snippet",
          "",
          "~~~py",
          "import timeit",
          "",
          "print(timeit.timeit('\"-\".join(str(n) for n in range(100))', number=10000))",
          "print(timeit.timeit('\"-\".join([str(n) for n in range(100)])', number=10000))",
          "~~~",
          "",
          "`timeit` runs the code many times and reports the total, which smooths out the noise a single run",
          "would give you.",
          "",
          "For a block in your own program:",
          "",
          "~~~py",
          "import time",
          "",
          "start = time.perf_counter()",
          "do_the_thing()",
          "print(f'{time.perf_counter() - start:.4f}s')",
          "~~~",
          "",
          "Use `perf_counter`, not `time.time()` — it is monotonic and has much higher resolution.",
          "",
          "## Profiling: where does the time actually go",
          "",
          "~~~text",
          "python -m cProfile -s cumtime myscript.py",
          "~~~",
          "",
          "~~~text",
          "   ncalls  tottime  cumtime  filename:lineno(function)",
          "        1    0.001    8.421  main.py:40(process_all)",
          "     1000    0.012    8.390  main.py:22(load_row)",
          "     1000    8.301    8.301  {method 'execute' of 'Cursor'}",
          "~~~",
          "",
          "- **tottime** — time in that function, excluding what it called",
          "- **cumtime** — including what it called",
          "",
          "Read `cumtime` to find the expensive path, then `tottime` to find the line actually doing the work.",
          "Here it is obvious: 8.3 of 8.4 seconds is database calls, so rewriting the Python is pointless —",
          "the fix is fewer queries.",
          "",
          ":::why This is the whole skill",
          "Nine times out of ten the answer is *stop doing the expensive thing so often* — fewer queries, fewer",
          "requests, fewer passes over the data — not *make the expensive thing faster*.",
          ":::",
          "",
          "## The order to work in",
          "",
          "1. **Is it actually too slow?** If nobody is waiting, stop here.",
          "2. **Measure.** Profile the real workload, not a guess.",
          "3. **Fix the complexity.** `O(n²)` → `O(n)` beats every micro-optimisation combined.",
          "4. **Do less work.** Cache, batch, avoid recomputing.",
          "5. **Then** micro-optimise the hot loop.",
          "6. **Measure again** to confirm it helped.",
          "",
          "Steps 3 and 4 are where nearly all real wins live. Step 5 typically buys 10–30%; step 3 can buy",
          "a factor of a thousand.",
          "",
          ":::warn Optimised code costs something",
          "It is usually longer, harder to read and easier to break. That is a fair trade in the 3% that matters",
          "and a bad one everywhere else. Readable code you can still change in a year is worth more than code",
          "that saves 4 milliseconds nobody notices.",
          ":::"
        ]),
        exercises: [
          {
            kind: "code", title: "Time two approaches", difficulty: 3,
            concepts: ["measuring"],
            prompt: L([
              "Write `compare(n)` that times two ways of building the same string of numbers joined by `-`:",
              "",
              "- repeated `+=` concatenation in a loop",
              "- a list plus `''.join(...)`",
              "",
              "Return `(concat_seconds, join_seconds)` using `time.perf_counter`.",
              "",
              "Both must produce identical output — the checks verify that."
            ]),
            starter: "import time\n\n\ndef build_concat(n):\n    \n\ndef build_join(n):\n    \n\ndef compare(n):\n    ",
            hints: [
              "`build_concat`: start with `''` and `result += str(i) + '-'` in a loop, then strip the trailing `-`.",
              "`build_join`: build a list of `str(i)` and `'-'.join(parts)`.",
              "In `compare`, time each with `perf_counter` around the call."
            ],
            tests: [
              { name: "both build the same string", code: "assert build_concat(50) == build_join(50)" },
              { name: "the format is right", code: "assert build_join(4) == '0-1-2-3'" },
              { name: "compare returns two timings", code: "a, b = compare(200)\nassert isinstance(a, float) and isinstance(b, float) and a >= 0 and b >= 0" },
              { name: "zero", code: "assert build_join(0) == '' and build_concat(0) == ''" },
              {
                name: "join is not slower on a large input",
                code: "c, j = compare(20000)\nassert j <= c * 2, f'join {j:.4f}s vs concat {c:.4f}s — check your join implementation'"
              }
            ],
            solution: L([
              "import time",
              "",
              "",
              "def build_concat(n):",
              "    result = ''",
              "    for i in range(n):",
              "        result += str(i) + '-'",
              "    return result[:-1] if result else ''",
              "",
              "",
              "def build_join(n):",
              "    return '-'.join(str(i) for i in range(n))",
              "",
              "",
              "def compare(n):",
              "    start = time.perf_counter()",
              "    build_concat(n)",
              "    concat_seconds = time.perf_counter() - start",
              "",
              "    start = time.perf_counter()",
              "    build_join(n)",
              "    join_seconds = time.perf_counter() - start",
              "",
              "    return concat_seconds, join_seconds"
            ]),
            takeaway: "Strings are immutable, so `+=` in a loop builds a brand-new string every iteration — quadratic work. `join` allocates once."
          },
          {
            kind: "quiz", title: "Reading a profile", difficulty: 3,
            concepts: ["profiling"],
            prompt: L([
              "A profile shows `parse_row` with `cumtime` 9.8s and `tottime` 0.1s, and `json.loads` with",
              "`tottime` 9.5s. Where is the time?"
            ]),
            choices: [
              "In `parse_row`'s own code",
              "In `json.loads`, which `parse_row` calls — so the fix is to call it less or parse less data",
              "In the profiler overhead",
              "It cannot be determined"
            ],
            answer: 1,
            explain: "`tottime` excludes callees, so `parse_row` itself does almost nothing. Rewriting its loops would gain 0.1s at best; parsing less JSON, or parsing it once instead of repeatedly, is where the 9.5s is."
          },
          {
            kind: "quiz", title: "What to fix first", difficulty: 3,
            concepts: ["premature-opt"],
            prompt: "A report takes 40 seconds. Profiling shows 38s in a nested loop that is O(n²) and 1.5s in string formatting. What do you do?",
            choices: [
              "Optimise the string formatting first — it is easier",
              "Replace the nested loop with a dictionary lookup to make it linear",
              "Rewrite the whole thing in C",
              "Add threads"
            ],
            answer: 1,
            explain: "Even making the formatting infinitely fast saves 1.5 of 40 seconds. Changing the complexity of the dominant loop is where the entire win is — and it is usually a small code change."
          },
          {
            kind: "quiz", title: "perf_counter", difficulty: 2,
            concepts: ["measuring"],
            prompt: "Why prefer `time.perf_counter()` over `time.time()` for measuring durations?",
            choices: [
              "It returns milliseconds",
              "It is monotonic and higher resolution, so clock adjustments cannot corrupt the measurement",
              "It is the only one that works on Windows",
              "There is no difference"
            ],
            answer: 1,
            explain: "`time.time()` follows the wall clock, which can jump backwards when the system syncs time — producing negative durations. `perf_counter` only ever moves forward and has the finest resolution available."
          }
        ]
      },

      {
        id: "m27l2", title: "Making Python faster", minutes: 12,
        concepts: ["builtin-speed", "string-building", "caching"],
        content: L([
          "## Let C do the loop",
          "",
          "Python's built-ins and standard library are implemented in C. A loop that stays inside them is far",
          "faster than the equivalent written in Python.",
          "",
          "~~~py",
          "total = 0",
          "for n in numbers:          # the loop runs in Python",
          "    total += n",
          "",
          "total = sum(numbers)       # the loop runs in C",
          "~~~",
          "",
          "| Instead of | Use |",
          "|---|---|",
          "| a loop adding up | `sum()` |",
          "| a loop finding the biggest | `max()` / `min()` |",
          "| a loop building a list | a comprehension |",
          "| a loop counting | `collections.Counter` |",
          "| a loop concatenating strings | `''.join()` |",
          "| a loop checking membership | a `set` |",
          "| your own sort | `sorted()` |",
          "",
          "This is not only about speed — the built-in version is usually shorter and less likely to be wrong.",
          "",
          "## String building",
          "",
          "~~~py",
          "result = ''",
          "for word in words:",
          "    result += word          # a new string every time: O(n^2)",
          "",
          "result = ''.join(words)     # one allocation: O(n)",
          "~~~",
          "",
          "For 100 words the difference is invisible. For 100,000 it is the difference between instant and",
          "a coffee break. **Build a list, join once.**",
          "",
          "## Cache what does not change",
          "",
          "~~~py",
          "import functools",
          "",
          "@functools.lru_cache(maxsize=1024)",
          "def expensive(n: int) -> int:",
          "    ...",
          "~~~",
          "",
          "Free, as long as the function is pure. Also cache *outside* functions:",
          "",
          "~~~py",
          "for row in rows:",
          "    config = load_config()          # reloaded every iteration",
          "",
          "config = load_config()              # once",
          "for row in rows:",
          "    ...",
          "~~~",
          "",
          "**Loop-invariant work** — anything inside a loop whose result never changes — is one of the most",
          "common and most easily fixed sources of slowness.",
          "",
          "## Do not recompute what you can look up",
          "",
          "~~~py",
          "for order in orders:                          # n",
          "    customer = find_customer(customers, order.customer_id)   # scans: n",
          "~~~",
          "",
          "~~~py",
          "by_id = {c.id: c for c in customers}          # once",
          "for order in orders:",
          "    customer = by_id[order.customer_id]       # instant",
          "~~~",
          "",
          "Building an index once and reusing it is the same idea as a database index, and it turns up",
          "constantly in ordinary application code.",
          "",
          "## Micro-optimisations worth knowing",
          "",
          "~~~py",
          "append = result.append        # attribute lookup hoisted out of the loop",
          "for item in items:",
          "    append(item)",
          "~~~",
          "",
          "Local variable access is faster than attribute lookup. This is a real technique in a genuinely hot",
          "loop and pointless noise anywhere else.",
          "",
          ":::warn Do not do these by default",
          "Every micro-optimisation makes the code slightly worse to read. Apply them **after** profiling",
          "identifies the hot loop, and confirm each one actually helped. Applying them everywhere makes a",
          "codebase unpleasant and measurably no faster.",
          ":::"
        ]),
        exercises: [
          {
            kind: "refactor", title: "Use the built-ins", difficulty: 3,
            concepts: ["builtin-speed"],
            prompt: L([
              "Rewrite all four functions using built-ins or comprehensions instead of manual loops.",
              "",
              "Behaviour must be identical. The checks forbid `for` statements."
            ]),
            starter: L([
              "def total(numbers):",
              "    result = 0",
              "    for n in numbers:",
              "        result += n",
              "    return result",
              "",
              "",
              "def largest(numbers):",
              "    best = numbers[0]",
              "    for n in numbers:",
              "        if n > best:",
              "            best = n",
              "    return best",
              "",
              "",
              "def doubled(numbers):",
              "    result = []",
              "    for n in numbers:",
              "        result.append(n * 2)",
              "    return result",
              "",
              "",
              "def joined(words):",
              "    text = ''",
              "    for word in words:",
              "        text += word + ','",
              "    return text[:-1] if text else ''"
            ]),
            forbids: [{ re: "\\n\\s+for\\s", msg: "No for statements — use built-ins and comprehensions" }],
            hints: [
              "`sum`, `max`, a list comprehension, and `','.join(words)`.",
              "`joined([])` must still return `''` — `join` does that naturally."
            ],
            tests: [
              { name: "total", call: "total([1, 2, 3])", expect: 6 },
              { name: "largest", call: "largest([3, 9, 2])", expect: 9 },
              { name: "doubled", call: "doubled([1, 2])", expect: [2, 4] },
              { name: "joined", call: "joined(['a', 'b', 'c'])", expect: "a,b,c" },
              { name: "joined handles empty", call: "joined([])", expect: "" },
              { name: "doubled handles empty", call: "doubled([])", expect: [] },
              { name: "negatives still work", call: "largest([-5, -2])", expect: -2 }
            ],
            solution: L([
              "def total(numbers):",
              "    return sum(numbers)",
              "",
              "",
              "def largest(numbers):",
              "    return max(numbers)",
              "",
              "",
              "def doubled(numbers):",
              "    return [n * 2 for n in numbers]",
              "",
              "",
              "def joined(words):",
              "    return ','.join(words)"
            ])
          },
          {
            kind: "refactor", title: "Hoist the invariant", difficulty: 3,
            concepts: ["caching"],
            prompt: L([
              "`summarise` recomputes the same expensive lookup on every iteration. Move the work that does not",
              "depend on the loop variable outside the loop.",
              "",
              "The result must be identical, and `build_index` must be called exactly **once**."
            ]),
            starter: L([
              "def build_index(people):",
              "    return {p['id']: p['name'] for p in people}",
              "",
              "",
              "def summarise(orders, people):",
              "    lines = []",
              "    for order in orders:",
              "        index = build_index(people)",
              "        lines.append(f\"{index[order['person_id']]}: {order['total']}\")",
              "    return lines"
            ]),
            hints: ["`build_index(people)` does not depend on `order`.", "Call it once before the loop."],
            tests: [
              {
                name: "same output",
                code: "people = [{'id': 1, 'name': 'ada'}, {'id': 2, 'name': 'bo'}]\norders = [{'person_id': 1, 'total': 10}, {'person_id': 2, 'total': 5}]\nassert summarise(orders, people) == ['ada: 10', 'bo: 5']"
              },
              {
                name: "build_index is called once",
                code: "calls = []\noriginal = build_index\ndef counting(people):\n    calls.append(1)\n    return original(people)\nimport builtins\ng = summarise.__globals__\ng['build_index'] = counting\ntry:\n    summarise([{'person_id': 1, 'total': 1}] * 5, [{'id': 1, 'name': 'a'}])\nfinally:\n    g['build_index'] = original\nassert len(calls) == 1, f'called {len(calls)} times — hoist it out of the loop'"
              },
              {
                name: "no orders",
                code: "assert summarise([], [{'id': 1, 'name': 'a'}]) == []"
              }
            ],
            solution: L([
              "def build_index(people):",
              "    return {p['id']: p['name'] for p in people}",
              "",
              "",
              "def summarise(orders, people):",
              "    index = build_index(people)",
              "    lines = []",
              "    for order in orders:",
              "        lines.append(f\"{index[order['person_id']]}: {order['total']}\")",
              "    return lines"
            ]),
            takeaway: "Loop-invariant work is invisible in code review and obvious in a profile. It is one of the most common easy wins in real codebases."
          },
          {
            kind: "code", title: "Index instead of scanning", difficulty: 4,
            concepts: ["builtin-speed", "caching"],
            prompt: L([
              "Write `enrich(orders, customers)` returning a list of `'<customer name>: <total>'` strings.",
              "",
              "Each order has `customer_id` and `total`; each customer has `id` and `name`. An order whose",
              "customer is missing is skipped.",
              "",
              "It must be `O(n + m)` — the checks include a large input that will time out if you scan the",
              "customer list per order."
            ]),
            starter: "def enrich(orders, customers):\n    ",
            hints: [
              "Build `{c['id']: c['name'] for c in customers}` once.",
              "Then each order is a single dictionary lookup.",
              "Use `.get()` so a missing customer is skipped rather than raising."
            ],
            tests: [
              {
                name: "enriches",
                call: "enrich([{'customer_id': 1, 'total': 10}], [{'id': 1, 'name': 'ada'}])",
                expect: ["ada: 10"]
              },
              {
                name: "skips unknown customers",
                call: "enrich([{'customer_id': 9, 'total': 10}], [{'id': 1, 'name': 'ada'}])",
                expect: []
              },
              { name: "empty inputs", call: "enrich([], [])", expect: [] },
              {
                name: "fast on large input",
                code: "import time\ncustomers = [{'id': i, 'name': f'c{i}'} for i in range(5000)]\norders = [{'customer_id': i % 5000, 'total': i} for i in range(20000)]\nstart = time.perf_counter()\nresult = enrich(orders, customers)\nelapsed = time.perf_counter() - start\nassert len(result) == 20000\nassert elapsed < 2.0, f'took {elapsed:.2f}s — build an index once'"
              }
            ],
            solution: L([
              "def enrich(orders, customers):",
              "    names = {c['id']: c['name'] for c in customers}",
              "    lines = []",
              "    for order in orders:",
              "        name = names.get(order['customer_id'])",
              "        if name is not None:",
              "            lines.append(f\"{name}: {order['total']}\")",
              "    return lines"
            ])
          },
          {
            kind: "quiz", title: "String concatenation", difficulty: 2,
            concepts: ["string-building"],
            prompt: "Why is `result += word` inside a loop slow for large inputs?",
            choices: [
              "Python strings have a length limit",
              "Strings are immutable, so each `+=` allocates and copies an entirely new string — making the loop quadratic",
              "The garbage collector runs each time",
              "It is not slow; this is a myth"
            ],
            answer: 1,
            explain: "Each concatenation copies everything accumulated so far. Total work grows with the square of the number of pieces. `''.join(parts)` computes the final size once and copies each piece exactly once."
          }
        ]
      },

      {
        id: "m27l3", title: "Memory", minutes: 12,
        concepts: ["memory-model", "slots", "lazy-memory"],
        content: L([
          "## Names point at objects",
          "",
          "~~~py",
          "a = [1, 2, 3]",
          "b = a              # a second name for the SAME list",
          "b.append(4)",
          "print(len(a))      # 4",
          "~~~",
          "",
          "You met this in Module 8. Underneath, every Python value is an object with a **reference count**.",
          "When the last name pointing at it goes away, the memory is freed.",
          "",
          "~~~py",
          "import sys",
          "",
          "data = [1, 2, 3]",
          "print(sys.getrefcount(data))       # 2: the name, plus the argument",
          "~~~",
          "",
          "This is why holding a reference in a global, a cache or a long-lived list keeps everything it points",
          "at alive. **Most Python memory leaks are accidental references**, not the garbage collector failing.",
          "",
          "## The size of things",
          "",
          "~~~py",
          "import sys",
          "",
          "print(sys.getsizeof(0))            # ~28 bytes for a small int",
          "print(sys.getsizeof([]))           # ~56 for an empty list",
          "print(sys.getsizeof('a' * 1000))   # ~1049",
          "~~~",
          "",
          "Python objects carry overhead: a type pointer, a reference count, and for lists spare capacity to",
          "grow. A million-element list of small integers is tens of megabytes, not four.",
          "",
          ":::warn getsizeof is shallow",
          "`sys.getsizeof(list_of_lists)` measures only the outer list's own array of pointers, not what they",
          "point at. For a real total you must walk the structure.",
          ":::",
          "",
          "## Streaming instead of loading",
          "",
          "~~~py",
          "lines = open('huge.log').readlines()    # the whole file in memory",
          "",
          "with open('huge.log') as f:              # one line at a time",
          "    for line in f:",
          "        process(line)",
          "~~~",
          "",
          "The same choice appears everywhere: `list(...)` versus a generator, `fetchall()` versus iterating a",
          "cursor, downloading a whole response versus streaming it.",
          "",
          "**Ask: do I need all of it at once?** Usually the answer is no, and the streaming version uses",
          "constant memory regardless of input size.",
          "",
          "~~~py",
          "total = sum(int(line) for line in open('numbers.txt'))    # constant memory",
          "~~~",
          "",
          "## __slots__",
          "",
          "Every ordinary instance carries a `__dict__` to hold its attributes — flexible, and about 50 bytes",
          "of overhead each.",
          "",
          "~~~py",
          "class Point:",
          "    __slots__ = ('x', 'y')",
          "",
          "    def __init__(self, x, y):",
          "        self.x = x",
          "        self.y = y",
          "~~~",
          "",
          "`__slots__` replaces the dictionary with a fixed array: substantially smaller and slightly faster",
          "attribute access. The cost is that you can no longer add attributes that were not declared.",
          "",
          "Worth it when you have **millions** of instances of a small class. Pointless for the fifty objects",
          "in a normal program.",
          "",
          "## Where memory actually goes wrong",
          "",
          "1. **Loading a whole file or query result** that could be streamed",
          "2. **An unbounded cache** — `lru_cache(maxsize=None)` on a function called with millions of distinct",
          "   arguments grows forever",
          "3. **Accumulating in a global** — appending to a module-level list that is never cleared",
          "4. **Keeping the whole object** when you only needed one field of it",
          "",
          ":::tip Diagnosing",
          "`tracemalloc` is in the standard library and shows which lines allocated the memory that is still",
          "live — the memory equivalent of `cProfile`.",
          "",
          "~~~py",
          "import tracemalloc",
          "tracemalloc.start()",
          "run_the_thing()",
          "for stat in tracemalloc.take_snapshot().statistics('lineno')[:5]:",
          "    print(stat)",
          "~~~",
          ":::"
        ]),
        exercises: [
          {
            kind: "refactor", title: "Stop loading everything", difficulty: 3,
            concepts: ["lazy-memory"],
            prompt: L([
              "`count_errors` loads an entire file into memory to count matching lines. Rewrite it to stream,",
              "using constant memory.",
              "",
              "The checks forbid `readlines` and `.read()`."
            ]),
            files: { "big.log": "INFO ok\nERROR disk\nINFO fine\nERROR memory\nWARN slow\n" },
            starter: L([
              "def count_errors(path):",
              "    with open(path, encoding='utf-8') as f:",
              "        lines = f.readlines()",
              "    return len([line for line in lines if 'ERROR' in line])"
            ]),
            forbids: [
              { contains: "readlines", msg: "Stream the file instead" },
              { contains: ".read()", msg: "Stream the file instead" }
            ],
            hints: [
              "`for line in f:` reads one line at a time.",
              "Or `sum(1 for line in f if 'ERROR' in line)` — a generator expression, so nothing is stored."
            ],
            tests: [
              { name: "counts errors", call: "count_errors('big.log')", expect: 2 },
              {
                name: "handles a large file with constant memory",
                code: "with open('gen.log', 'w', encoding='utf-8') as f:\n    for i in range(50000):\n        f.write('ERROR x\\n' if i % 10 == 0 else 'INFO ok\\n')\nassert count_errors('gen.log') == 5000"
              },
              { name: "empty file", code: "open('empty.log', 'w').close()\nassert count_errors('empty.log') == 0" }
            ],
            solution: L([
              "def count_errors(path):",
              "    with open(path, encoding='utf-8') as f:",
              "        return sum(1 for line in f if 'ERROR' in line)"
            ])
          },
          {
            kind: "code", title: "Slots", difficulty: 3,
            concepts: ["slots"],
            prompt: L([
              "Write two classes storing `x` and `y`: `Plain` (ordinary) and `Slotted` (using `__slots__`).",
              "",
              "Both need an `__init__(self, x, y)`. The checks verify that `Slotted` really has no `__dict__`",
              "and rejects undeclared attributes."
            ]),
            starter: "class Plain:\n    def __init__(self, x, y):\n        self.x = x\n        self.y = y\n\n\nclass Slotted:\n    ",
            requires: [{ contains: "__slots__", msg: "Use __slots__" }],
            hints: [
              "`__slots__ = ('x', 'y')` in the class body, before `__init__`.",
              "`__init__` is written exactly as usual."
            ],
            tests: [
              { name: "both store their values", code: "assert Plain(1, 2).x == 1 and Slotted(1, 2).y == 2" },
              { name: "Plain has a __dict__", code: "assert hasattr(Plain(1, 2), '__dict__')" },
              { name: "Slotted has no __dict__", code: "assert not hasattr(Slotted(1, 2), '__dict__'), '__slots__ should remove the instance dict'" },
              {
                name: "Slotted rejects new attributes",
                code: "s = Slotted(1, 2)\ntry:\n    s.z = 3\n    raise AssertionError('should raise AttributeError')\nexcept AttributeError:\n    pass"
              },
              {
                name: "Slotted instances are smaller",
                code: "import sys\np = Plain(1, 2)\ns = Slotted(1, 2)\nplain_total = sys.getsizeof(p) + sys.getsizeof(p.__dict__)\nassert sys.getsizeof(s) < plain_total, 'slots should use less memory overall'"
              }
            ],
            solution: L([
              "class Plain:",
              "    def __init__(self, x, y):",
              "        self.x = x",
              "        self.y = y",
              "",
              "",
              "class Slotted:",
              "    __slots__ = ('x', 'y')",
              "",
              "    def __init__(self, x, y):",
              "        self.x = x",
              "        self.y = y"
            ])
          },
          {
            kind: "quiz", title: "Where the leak is", difficulty: 3,
            concepts: ["memory-model"],
            prompt: "A long-running service grows to 8 GB over a week. Which is the most likely cause?",
            choices: [
              "Python's garbage collector is broken",
              "Something is holding references — an unbounded cache or a module-level list that is appended to and never cleared",
              "Too many function calls",
              "The GIL"
            ],
            answer: 1,
            explain: "Python frees objects as soon as the last reference goes. Steady growth almost always means something is *keeping* references — most often a global collection or a cache with no maximum size."
          },
          {
            kind: "quiz", title: "When to use __slots__", difficulty: 3,
            concepts: ["slots"],
            prompt: "When is `__slots__` genuinely worth adding?",
            choices: [
              "On every class, as a matter of style",
              "On a small class you create millions of instances of",
              "On classes with many methods",
              "Whenever a class has more than five attributes"
            ],
            answer: 1,
            explain: "It saves roughly the size of a dict per instance. That is meaningless for a handful of objects and significant for millions — at the cost of losing dynamic attributes."
          }
        ]
      }
    ],

    checkpoint: {
      id: "m27cp", pass: 0.8,
      title: "Checkpoint: Performance & Memory",
      items: [
        {
          kind: "code", title: "Join, do not concatenate", difficulty: 2, concepts: ["string-building"],
          prompt: "Write `render(rows)` turning a list of strings into one string separated by newlines, without `+=`.",
          starter: "def render(rows):\n    ",
          forbids: [{ contains: "+=", msg: "Use join" }],
          tests: [
            { name: "joins", call: "render(['a', 'b'])", expect: "a\nb" },
            { name: "empty", call: "render([])", expect: "" },
            { name: "single", call: "render(['x'])", expect: "x" }
          ]
        },
        {
          kind: "quiz", title: "Optimisation order", difficulty: 3, concepts: ["premature-opt"],
          prompt: "What should you do before optimising anything?",
          choices: [
            "Rewrite the hot loop in C",
            "Measure, so you know where the time actually goes",
            "Add caching everywhere",
            "Switch to a faster Python version"
          ],
          answer: 1,
          explain: "Optimising without measuring usually means optimising code that was never the bottleneck. A profile takes a minute and redirects the entire effort."
        },
        {
          kind: "code", title: "Constant memory sum", difficulty: 3, concepts: ["lazy-memory"],
          prompt: "Write `total_from(path)` summing one integer per line, without loading the file into memory.",
          files: { "nums.txt": "1\n2\n3\n4\n" },
          starter: "def total_from(path):\n    ",
          forbids: [{ contains: "readlines", msg: "Stream it" }],
          tests: [
            { name: "sums", call: "total_from('nums.txt')", expect: 10 },
            { name: "works on a big file", code: "with open('big_nums.txt', 'w') as f:\n    for i in range(20000):\n        f.write('1\\n')\nassert total_from('big_nums.txt') == 20000" }
          ]
        },
        {
          kind: "quiz", title: "getsizeof", difficulty: 3, concepts: ["memory-model"],
          prompt: "`sys.getsizeof([[0] * 1000, [0] * 1000])` returns about 72 bytes. Why so small?",
          choices: [
            "The lists are compressed",
            "It measures only the outer list's own storage — two pointers — not the objects they refer to",
            "It is a bug",
            "Empty integers take no space"
          ],
          answer: 1,
          explain: "`getsizeof` is shallow. The outer list holds two references; the 2,000 integers and the two inner lists are separate objects with their own sizes."
        },
        {
          kind: "code", title: "Avoid the rescan", difficulty: 4, concepts: ["caching"],
          prompt: "Write `lookup_all(ids, records)` returning the names for the given ids in order, skipping unknown ones. Must be O(n + m); the check includes a large input.",
          starter: "def lookup_all(ids, records):\n    ",
          tests: [
            { name: "looks up", call: "lookup_all([1, 2], [{'id': 1, 'name': 'a'}, {'id': 2, 'name': 'b'}])", expect: ["a", "b"] },
            { name: "skips unknown", call: "lookup_all([9], [{'id': 1, 'name': 'a'}])", expect: [] },
            {
              name: "fast on large input",
              code: "import time\nrecords = [{'id': i, 'name': f'n{i}'} for i in range(20000)]\nids = list(range(20000))\nstart = time.perf_counter()\nassert len(lookup_all(ids, records)) == 20000\nassert time.perf_counter() - start < 2.0, 'build an index'"
            }
          ]
        }
      ]
    }
  });
})();
