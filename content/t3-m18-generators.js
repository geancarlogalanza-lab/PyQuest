/* Tier 3 · Module 18 — Iterators & Generators */
(function () {
  const L = a => a.join("\n");

  PQ.defineModule({
    id: "m18", tier: 3, order: 18, icon: "🌀",
    title: "Iterators & Generators",
    blurb: "How for loops really work, and how to produce values lazily instead of building lists.",
    intro: L([
      "Every `for` loop you have written used a protocol you have not seen yet. Learning it explains why some",
      "things can only be looped once, why `range(10**9)` uses no memory, and how to write functions that",
      "produce results as they go instead of returning a finished list."
    ]),
    concepts: [
      { id: "iterator-protocol", name: "the iterator protocol", importance: 1.4 },
      { id: "iter-next", name: "iter() and next()", importance: 1.3 },
      { id: "generator-fn", name: "generator functions", importance: 1.6 },
      { id: "yield", name: "yield", importance: 1.6 },
      { id: "lazy-eval", name: "laziness", importance: 1.4 },
      { id: "gen-expr", name: "generator expressions", importance: 1.3 },
      { id: "itertools-use", name: "itertools", importance: 1.2 },
      { id: "exhaustion", name: "one-shot iterators", importance: 1.3 }
    ],

    lessons: [
      {
        id: "m18l1", title: "What a for loop really does", minutes: 12,
        concepts: ["iterator-protocol", "iter-next", "exhaustion"],
        content: L([
          "## The protocol",
          "",
          "Two methods define everything:",
          "",
          "- `__iter__()` returns an **iterator**",
          "- `__next__()` returns the next value, or raises `StopIteration` when there are none left",
          "",
          "~~~py",
          "numbers = [1, 2, 3]",
          "it = iter(numbers)",
          "print(next(it))     # 1",
          "print(next(it))     # 2",
          "print(next(it))     # 3",
          "print(next(it))     # StopIteration",
          "~~~",
          "",
          "And this:",
          "",
          "~~~py",
          "for x in numbers:",
          "    print(x)",
          "~~~",
          "",
          "is exactly this:",
          "",
          "~~~py",
          "it = iter(numbers)",
          "while True:",
          "    try:",
          "        x = next(it)",
          "    except StopIteration:",
          "        break",
          "    print(x)",
          "~~~",
          "",
          "There is no magic. `for` is sugar over `iter` and `next`.",
          "",
          "## Iterable vs iterator",
          "",
          "| | Iterable | Iterator |",
          "|---|---|---|",
          "| Has | `__iter__` | `__iter__` **and** `__next__` |",
          "| Example | `list`, `str`, `dict` | the thing `iter(list)` gives you |",
          "| Can be looped | many times | **once** |",
          "",
          "A list is an iterable: each `for` asks it for a fresh iterator, so you can loop it repeatedly.",
          "An iterator is consumed as it goes and does not reset.",
          "",
          ":::trap The exhaustion bug",
          "~~~py",
          "squares = (n * n for n in range(5))",
          "print(sum(squares))      # 30",
          "print(sum(squares))      # 0  -- already used up!",
          "~~~",
          "",
          "The same applies to `map`, `filter`, `zip`, `enumerate` and file objects. If you need the values",
          "twice, materialise them: `squares = list(squares)`.",
          ":::",
          "",
          "## Writing an iterator class",
          "",
          "~~~py",
          "class Countdown:",
          "    def __init__(self, start):",
          "        self.current = start",
          "",
          "    def __iter__(self):",
          "        return self",
          "",
          "    def __next__(self):",
          "        if self.current <= 0:",
          "            raise StopIteration",
          "        self.current -= 1",
          "        return self.current + 1",
          "",
          "",
          "for n in Countdown(3):",
          "    print(n)",
          "~~~",
          "~~~out",
          "3",
          "2",
          "1",
          "~~~",
          "",
          "That is a lot of machinery for three lines of behaviour. The next lesson removes almost all of it.",
          "",
          ":::tip next() with a default",
          "`next(it, None)` returns `None` instead of raising when the iterator is empty — handy for",
          "*give me the first match if there is one*:",
          "",
          "~~~py",
          "first_error = next((line for line in lines if 'ERROR' in line), None)",
          "~~~",
          "",
          "This stops reading as soon as it finds one, even in a million-line file.",
          ":::"
        ]),
        exercises: [
          {
            kind: "predict", title: "Used up", difficulty: 3,
            concepts: ["exhaustion"],
            prompt: L([
              "What does this print?",
              "",
              "~~~py",
              "values = map(str, [1, 2, 3])",
              "print(len(list(values)), len(list(values)))",
              "~~~"
            ]),
            choices: ["`3 3`", "`3 0`", "`0 0`", "An error"],
            answer: 1,
            explain: "`map` returns a one-shot iterator. The first `list()` consumes it entirely; the second finds nothing left. This is why `list(...)` around a `map` or `filter` is so common."
          },
          {
            kind: "code", title: "Manual iteration", difficulty: 3,
            concepts: ["iter-next"],
            prompt: L([
              "Write `first_matching(items, predicate)` returning the first item for which `predicate(item)` is",
              "true, or `None` if there is none.",
              "",
              "Use `next()` with a generator expression and a default — the checks forbid `for` statements.",
              "It must stop as soon as it finds a match."
            ]),
            starter: "def first_matching(items, predicate):\n    ",
            forbids: [{ re: "\\n\\s+for\\s", msg: "Use next() with a generator expression" }],
            hints: ["`next((x for x in items if predicate(x)), None)`"],
            tests: [
              { name: "finds a match", call: "first_matching([1, 2, 3, 4], lambda n: n > 2)", expect: 3 },
              { name: "no match gives None", code: "assert first_matching([1, 2], lambda n: n > 9) is None" },
              { name: "empty list", code: "assert first_matching([], lambda n: True) is None" },
              {
                name: "stops at the first match",
                code: "seen = []\ndef p(n):\n    seen.append(n)\n    return n == 2\nfirst_matching([1, 2, 3, 4, 5], p)\nassert seen == [1, 2], f'should stop after finding it, checked {seen}'"
              }
            ],
            solution: "def first_matching(items, predicate):\n    return next((item for item in items if predicate(item)), None)",
            takeaway: "Short-circuiting matters. On a huge list, or an infinite one, stopping early is the difference between a fast answer and no answer."
          },
          {
            kind: "code", title: "An iterator class", difficulty: 3,
            concepts: ["iterator-protocol"],
            prompt: L([
              "Write a `Repeater` class that yields a value a fixed number of times using the iterator protocol.",
              "",
              "- `Repeater('x', 3)` used in a `for` loop produces `'x'` three times",
              "- implement `__iter__` and `__next__` yourself — no `yield` in this exercise",
              "- `list(Repeater('a', 0))` is `[]`"
            ]),
            starter: "class Repeater:\n    def __init__(self, value, times):\n        ",
            forbids: [{ contains: "yield", msg: "Implement the protocol by hand here" }],
            hints: [
              "Track how many remain in `self.remaining`.",
              "`__iter__` returns `self`.",
              "`__next__` raises `StopIteration` when nothing remains, otherwise decrements and returns the value."
            ],
            tests: [
              { name: "repeats correctly", code: "assert list(Repeater('x', 3)) == ['x', 'x', 'x']" },
              { name: "zero times", code: "assert list(Repeater('a', 0)) == []" },
              { name: "works in a for loop", code: "out = []\nfor v in Repeater(7, 2):\n    out.append(v)\nassert out == [7, 7]" },
              { name: "raises StopIteration when done", code: "r = Repeater('a', 1)\nnext(r)\ntry:\n    next(r)\n    raise AssertionError('should raise StopIteration')\nexcept StopIteration:\n    pass" }
            ],
            solution: L([
              "class Repeater:",
              "    def __init__(self, value, times):",
              "        self.value = value",
              "        self.remaining = times",
              "",
              "    def __iter__(self):",
              "        return self",
              "",
              "    def __next__(self):",
              "        if self.remaining <= 0:",
              "            raise StopIteration",
              "        self.remaining -= 1",
              "        return self.value"
            ])
          },
          {
            kind: "debug", title: "Consumed twice", difficulty: 3,
            concepts: ["exhaustion"],
            prompt: L([
              "`summarise` returns `(0, 0)` for the count because the iterator was already used up by `sum`.",
              "Fix it so it returns `(6, 3)` for `[1, 2, 3]`, still accepting any iterable.",
              "",
              "Do not call the argument twice — the caller may hand you a one-shot iterator."
            ]),
            starter: L([
              "def summarise(values):",
              "    total = sum(values)",
              "    count = sum(1 for _ in values)",
              "    return total, count"
            ]),
            hints: [
              "Materialise the input once: `values = list(values)`.",
              "Then both operations work on a real list."
            ],
            tests: [
              { name: "works on a list", call: "summarise([1, 2, 3])", expect: [6, 3] },
              { name: "works on a generator", code: "assert summarise(n for n in [1, 2, 3]) == (6, 3)" },
              { name: "works on map", code: "assert summarise(map(int, ['1', '2'])) == (3, 2)" },
              { name: "empty", code: "assert summarise([]) == (0, 0)" }
            ],
            solution: L([
              "def summarise(values):",
              "    values = list(values)",
              "    total = sum(values)",
              "    count = len(values)",
              "    return total, count"
            ]),
            takeaway: "A function that needs its input more than once must materialise it. Accepting any iterable and then consuming it twice is a bug that only shows up with generators."
          }
        ]
      },

      {
        id: "m18l2", title: "Generators: yield", minutes: 13,
        concepts: ["generator-fn", "yield", "lazy-eval"],
        content: L([
          "## A function that pauses",
          "",
          "~~~py",
          "def countdown(start):",
          "    while start > 0:",
          "        yield start",
          "        start -= 1",
          "",
          "for n in countdown(3):",
          "    print(n)",
          "~~~",
          "~~~out",
          "3",
          "2",
          "1",
          "~~~",
          "",
          "Four lines replace the whole `Countdown` class. Any function containing `yield` is a **generator",
          "function**, and calling it does not run the body at all — it returns a generator object.",
          "",
          "~~~py",
          "gen = countdown(3)",
          "print(gen)              # <generator object countdown at 0x...>",
          "print(next(gen))        # 3   -- NOW the body starts running",
          "print(next(gen))        # 2   -- resumes right after the yield",
          "~~~",
          "",
          "**`yield` hands a value out and freezes the function**, keeping every local variable exactly where it",
          "was. The next `next()` resumes on the following line. When the function ends, `StopIteration` is raised",
          "automatically.",
          "",
          "## return vs yield",
          "",
          "~~~py",
          "def get_squares(n):            # builds the whole list first",
          "    result = []",
          "    for i in range(n):",
          "        result.append(i * i)",
          "    return result",
          "",
          "def gen_squares(n):            # produces them one at a time",
          "    for i in range(n):",
          "        yield i * i",
          "~~~",
          "",
          "| | list version | generator version |",
          "|---|---|---|",
          "| Memory | all `n` values | one value |",
          "| First result | after all work | immediately |",
          "| Can be infinite | no | yes |",
          "| Reusable | yes | **no**, one shot |",
          "| `len()` works | yes | no |",
          "",
          "## Why laziness matters",
          "",
          "~~~py",
          "def read_lines(path):",
          "    with open(path, encoding='utf-8') as f:",
          "        for line in f:",
          "            yield line.rstrip()",
          "",
          "for line in read_lines('huge.log'):",
          "    if 'ERROR' in line:",
          "        print(line)",
          "        break",
          "~~~",
          "",
          "This reads one line at a time and stops at the first error — even if the file is 50 GB. The list",
          "version would need 50 GB of memory before printing anything.",
          "",
          "## Infinite generators",
          "",
          "~~~py",
          "def naturals():",
          "    n = 0",
          "    while True:",
          "        yield n",
          "        n += 1",
          "",
          "for n in naturals():",
          "    if n > 5:",
          "        break",
          "    print(n)",
          "~~~",
          "",
          "Perfectly safe: nothing is computed until asked for. An infinite *list* is impossible; an infinite",
          "*sequence* is routine.",
          "",
          "## yield from",
          "",
          "~~~py",
          "def chain(*iterables):",
          "    for it in iterables:",
          "        yield from it",
          "",
          "print(list(chain([1, 2], 'ab')))",
          "~~~",
          "~~~out",
          "[1, 2, 'a', 'b']",
          "~~~",
          "",
          "`yield from x` yields every item of `x` — the same as a loop with a `yield` inside, but clearer.",
          "",
          ":::warn Debugging generators",
          "Printing a generator shows `<generator object ...>`, not its contents — and consuming it to look",
          "inside **uses it up**. When debugging, wrap it: `print(list(gen))`, and remember you have now",
          "exhausted it.",
          ":::"
        ]),
        exercises: [
          {
            kind: "code", title: "Your first generator", difficulty: 2,
            concepts: ["yield", "generator-fn"],
            prompt: L([
              "Write `evens_up_to(n)` as a generator yielding the even numbers from 0 to `n` inclusive.",
              "",
              "`list(evens_up_to(6))` → `[0, 2, 4, 6]`"
            ]),
            starter: "def evens_up_to(n):\n    ",
            requires: [{ contains: "yield", msg: "Use yield" }],
            forbids: [{ contains: "return [", msg: "Yield the values, do not build a list" }],
            hints: ["Loop over `range(0, n + 1, 2)` and `yield` each value."],
            tests: [
              { name: "yields evens", code: "assert list(evens_up_to(6)) == [0, 2, 4, 6]" },
              { name: "odd limit", code: "assert list(evens_up_to(5)) == [0, 2, 4]" },
              { name: "it really is a generator", code: "import types\nassert isinstance(evens_up_to(4), types.GeneratorType), 'must be a generator, not a list'" },
              { name: "nothing runs before the first next", code: "g = evens_up_to(10)\nassert next(g) == 0" }
            ],
            solution: L([
              "def evens_up_to(n):",
              "    for value in range(0, n + 1, 2):",
              "        yield value"
            ])
          },
          {
            kind: "code", title: "Infinite Fibonacci", difficulty: 3,
            concepts: ["generator-fn", "lazy-eval"],
            prompt: L([
              "Write `fibonacci()` as an **infinite** generator yielding 0, 1, 1, 2, 3, 5, 8, …",
              "",
              "Then write `first_n(gen, n)` returning the first `n` values from any generator as a list.",
              "",
              "`first_n(fibonacci(), 7)` → `[0, 1, 1, 2, 3, 5, 8]`"
            ]),
            starter: "def fibonacci():\n    \n\ndef first_n(gen, n):\n    ",
            hints: [
              "`a, b = 0, 1` then loop forever: `yield a` and `a, b = b, a + b`.",
              "`first_n` can loop `n` times calling `next(gen)`, or use `itertools.islice`.",
              "Do not try to loop over the whole infinite generator."
            ],
            tests: [
              { name: "first seven", code: "assert first_n(fibonacci(), 7) == [0, 1, 1, 2, 3, 5, 8]" },
              { name: "zero values", code: "assert first_n(fibonacci(), 0) == []" },
              { name: "it is genuinely infinite", code: "g = fibonacci()\nvals = first_n(g, 100)\nassert len(vals) == 100 and vals[-1] > 10 ** 19" },
              { name: "first_n works with any generator", code: "def counter():\n    i = 0\n    while True:\n        yield i\n        i += 1\nassert first_n(counter(), 3) == [0, 1, 2]" }
            ],
            solution: L([
              "def fibonacci():",
              "    a, b = 0, 1",
              "    while True:",
              "        yield a",
              "        a, b = b, a + b",
              "",
              "",
              "def first_n(gen, n):",
              "    result = []",
              "    for _ in range(n):",
              "        result.append(next(gen))",
              "    return result"
            ]),
            takeaway: "The generator describes the whole infinite sequence; the consumer decides how much of it to want. Separating those two is a genuinely powerful idea."
          },
          {
            kind: "code", title: "A lazy pipeline", difficulty: 4,
            concepts: ["generator-fn", "lazy-eval"],
            prompt: L([
              "Write three generators that can be chained:",
              "",
              "- `read(lines)` — yields each line with whitespace stripped",
              "- `keep_errors(lines)` — yields only lines containing `'ERROR'`",
              "- `extract_messages(lines)` — yields the text after `'ERROR '` for each line",
              "",
              "Chained together they should turn raw log lines into just the error messages.",
              "",
              "Each must be a generator — nothing may build a full list."
            ]),
            starter: "def read(lines):\n    \n\ndef keep_errors(lines):\n    \n\ndef extract_messages(lines):\n    ",
            requires: [{ contains: "yield", msg: "All three must use yield" }],
            forbids: [{ re: "return\\s*\\[", msg: "No list building" }],
            hints: [
              "Each one is `for item in lines:` with a `yield` inside.",
              "`keep_errors` yields only when the condition holds.",
              "`line.split('ERROR ', 1)[1]` gives everything after the marker."
            ],
            tests: [
              {
                name: "the pipeline works",
                code: "raw = ['  INFO started  ', 'ERROR disk full', '  ERROR out of memory ']\nresult = list(extract_messages(keep_errors(read(raw))))\nassert result == ['disk full', 'out of memory'], result"
              },
              { name: "read strips", code: "assert list(read(['  a  '])) == ['a']" },
              { name: "keep_errors filters", code: "assert list(keep_errors(['a', 'ERROR b'])) == ['ERROR b']" },
              { name: "all three are generators", code: "import types\nassert isinstance(read([]), types.GeneratorType)\nassert isinstance(keep_errors([]), types.GeneratorType)\nassert isinstance(extract_messages([]), types.GeneratorType)" },
              {
                name: "it stays lazy end to end",
                code: "def endless():\n    i = 0\n    while True:\n        yield f'ERROR issue {i}'\n        i += 1\npipeline = extract_messages(keep_errors(read(endless())))\nassert next(pipeline) == 'issue 0', 'the pipeline must not consume everything up front'"
              }
            ],
            solution: L([
              "def read(lines):",
              "    for line in lines:",
              "        yield line.strip()",
              "",
              "",
              "def keep_errors(lines):",
              "    for line in lines:",
              "        if 'ERROR' in line:",
              "            yield line",
              "",
              "",
              "def extract_messages(lines):",
              "    for line in lines:",
              "        yield line.split('ERROR ', 1)[1]"
            ]),
            takeaway: "Each stage handles one line at a time, so the whole pipeline runs in constant memory — and works on an infinite source. This is how real log processing is built."
          },
          {
            kind: "predict", title: "When does the body run?", difficulty: 3,
            concepts: ["generator-fn"],
            prompt: L([
              "What is printed?",
              "",
              "~~~py",
              "def gen():",
              "    print('starting')",
              "    yield 1",
              "",
              "g = gen()",
              "print('created')",
              "next(g)",
              "~~~"
            ]),
            choices: [
              "`starting` then `created`",
              "`created` then `starting`",
              "`created` only",
              "`starting` only"
            ],
            answer: 1,
            explain: "Calling a generator function runs **none** of its body — it just builds the generator object. The body starts at the first `next()`, which is why `created` prints first."
          }
        ]
      },

      {
        id: "m18l3", title: "Generator expressions and itertools", minutes: 10,
        concepts: ["gen-expr", "itertools-use"],
        content: L([
          "## Generator expressions",
          "",
          "~~~py",
          "squares_list = [n * n for n in range(1000000)]     # 40 MB",
          "squares_gen  = (n * n for n in range(1000000))     # a few hundred bytes",
          "~~~",
          "",
          "Round brackets instead of square. Everything else is identical.",
          "",
          "When a generator expression is the only argument to a function, the brackets can be dropped:",
          "",
          "~~~py",
          "total = sum(n * n for n in range(100))",
          "longest = max((len(w) for w in words), default=0)",
          "joined = ', '.join(str(n) for n in numbers)",
          "~~~",
          "",
          "**Use a generator expression when** you feed straight into `sum`, `max`, `any`, `all`, `join` or a",
          "`for` loop. **Use a list comprehension when** you need the result more than once, need `len()`, or",
          "want to index it.",
          "",
          "## itertools",
          "",
          "~~~py",
          "from itertools import islice, chain, groupby, count, cycle, combinations, takewhile",
          "",
          "list(islice(naturals(), 5))            # [0, 1, 2, 3, 4]  -- slice a generator",
          "list(chain([1, 2], [3]))               # [1, 2, 3]",
          "list(takewhile(lambda n: n < 4, [1, 3, 5, 1]))   # [1, 3]  -- stops at the first failure",
          "list(combinations('abc', 2))           # [('a','b'), ('a','c'), ('b','c')]",
          "~~~",
          "",
          "You cannot slice a generator with `[:5]` — `islice` is how you do it.",
          "",
          "### groupby needs sorted input",
          "",
          "~~~py",
          "from itertools import groupby",
          "",
          "rows = [('a', 1), ('a', 2), ('b', 3)]",
          "for key, group in groupby(rows, key=lambda r: r[0]):",
          "    print(key, [r[1] for r in group])",
          "~~~",
          "~~~out",
          "a [1, 2]",
          "b [3]",
          "~~~",
          "",
          ":::warn groupby only groups adjacent items",
          "Unsorted input gives you the same key several times. **Sort by the same key first**, or use a",
          "dictionary — which is usually simpler anyway.",
          ":::",
          "",
          "## Choosing",
          "",
          "| Situation | Use |",
          "|---|---|",
          "| Small collection you need again | list comprehension |",
          "| Feeding straight into `sum`/`any`/`join` | generator expression |",
          "| Multi-step transformation of a large source | generator functions |",
          "| Infinite or unknown-length source | generator functions |",
          "| Slicing or combining lazily | `itertools` |",
          "",
          ":::tip Do not over-lazy",
          "Generators cost readability, cannot be reused, and make debugging harder. For a list of 50 items,",
          "just build the list. Reach for laziness when the data is big, slow, infinite, or you want to stop early.",
          ":::"
        ]),
        exercises: [
          {
            kind: "code", title: "Slice a generator", difficulty: 2,
            concepts: ["itertools-use"],
            prompt: L([
              "Write `take(gen, n)` returning the first `n` items of any iterable as a list, using",
              "`itertools.islice`.",
              "",
              "It must work on an infinite generator."
            ]),
            starter: "from itertools import islice\n\n\ndef take(gen, n):\n    ",
            requires: [{ contains: "islice", msg: "Use itertools.islice" }],
            hints: ["`list(islice(gen, n))`"],
            tests: [
              { name: "takes from a list", call: "take([1, 2, 3, 4], 2)", expect: [1, 2] },
              { name: "n larger than the source", call: "take([1], 5)", expect: [1] },
              { name: "works on an infinite generator", code: "from itertools import count\nassert take(count(), 3) == [0, 1, 2]" },
              { name: "zero items", call: "take([1, 2], 0)", expect: [] }
            ],
            solution: "from itertools import islice\n\n\ndef take(gen, n):\n    return list(islice(gen, n))"
          },
          {
            kind: "code", title: "Running totals", difficulty: 3,
            concepts: ["generator-fn"],
            prompt: L([
              "Write `running_total(numbers)` as a generator yielding the cumulative sum at each step.",
              "",
              "`list(running_total([1, 2, 3]))` → `[1, 3, 6]`"
            ]),
            starter: "def running_total(numbers):\n    ",
            requires: [{ contains: "yield", msg: "Use yield" }],
            hints: ["Keep a `total` and `yield` it after adding each number."],
            tests: [
              { name: "cumulative sums", code: "assert list(running_total([1, 2, 3])) == [1, 3, 6]" },
              { name: "empty input", code: "assert list(running_total([])) == []" },
              { name: "negatives", code: "assert list(running_total([5, -2, 1])) == [5, 3, 4]" },
              { name: "lazy — yields before consuming everything", code: "def endless():\n    while True:\n        yield 1\ng = running_total(endless())\nassert next(g) == 1 and next(g) == 2" }
            ],
            solution: L([
              "def running_total(numbers):",
              "    total = 0",
              "    for number in numbers:",
              "        total += number",
              "        yield total"
            ])
          },
          {
            kind: "code", title: "Batch it up", difficulty: 4,
            concepts: ["generator-fn", "lazy-eval"],
            prompt: L([
              "Write `batched(items, size)` as a generator yielding lists of at most `size` items.",
              "",
              "`list(batched([1, 2, 3, 4, 5], 2))` → `[[1, 2], [3, 4], [5]]`",
              "",
              "It must work on any iterable, including a generator, and must not read everything up front.",
              "A `size` of zero or less raises `ValueError`."
            ]),
            starter: "def batched(items, size):\n    ",
            hints: [
              "Accumulate into a `batch` list; when it reaches `size`, `yield` it and start a new one.",
              "After the loop, yield whatever is left over — but only if it is non-empty.",
              "Validate `size` before the loop. Since this is a generator, validation only runs on the first `next()` — so raise from a plain wrapper function, or accept that behaviour and check it in the test."
            ],
            tests: [
              { name: "even batches", code: "assert list(batched([1, 2, 3, 4], 2)) == [[1, 2], [3, 4]]" },
              { name: "final partial batch", code: "assert list(batched([1, 2, 3, 4, 5], 2)) == [[1, 2], [3, 4], [5]]" },
              { name: "batch bigger than input", code: "assert list(batched([1], 10)) == [[1]]" },
              { name: "empty input yields nothing", code: "assert list(batched([], 3)) == []" },
              { name: "works on a generator", code: "assert list(batched((n for n in range(5)), 2)) == [[0, 1], [2, 3], [4]]" },
              { name: "invalid size raises", code: "try:\n    list(batched([1], 0))\n    raise AssertionError('should raise')\nexcept ValueError:\n    pass" },
              {
                name: "stays lazy",
                code: "def endless():\n    i = 0\n    while True:\n        yield i\n        i += 1\ng = batched(endless(), 3)\nassert next(g) == [0, 1, 2]"
              }
            ],
            solution: L([
              "def batched(items, size):",
              "    if size <= 0:",
              "        raise ValueError('size must be positive')",
              "",
              "    def generate():",
              "        batch = []",
              "        for item in items:",
              "            batch.append(item)",
              "            if len(batch) == size:",
              "                yield batch",
              "                batch = []",
              "        if batch:",
              "            yield batch",
              "",
              "    return generate()"
            ]),
            solutionNote: "Validating in an outer plain function and returning an inner generator means the `ValueError` is raised when `batched()` is *called*, not on the first `next()`. That is the standard pattern for a generator that needs eager validation.",
            takeaway: "Batching is how you send 10,000 records to an API 100 at a time without loading all of them into memory."
          },
          {
            kind: "refactor", title: "List to generator", difficulty: 3,
            concepts: ["gen-expr", "lazy-eval"],
            prompt: L([
              "This builds two full lists just to compute one number. Rewrite `total_long_word_lengths` to use",
              "generator expressions and no intermediate lists.",
              "",
              "The checks forbid square-bracket comprehensions."
            ]),
            starter: L([
              "def total_long_word_lengths(words, minimum):",
              "    long_words = [w for w in words if len(w) >= minimum]",
              "    lengths = [len(w) for w in long_words]",
              "    return sum(lengths)"
            ]),
            forbids: [{ re: "\\[\\s*\\w+\\s+for\\s", msg: "No list comprehensions — use generator expressions" }],
            hints: ["`sum(len(w) for w in words if len(w) >= minimum)` does the whole thing."],
            tests: [
              { name: "sums the right lengths", call: "total_long_word_lengths(['ab', 'abcd', 'abcdef'], 4)", expect: 10 },
              { name: "nothing qualifies", call: "total_long_word_lengths(['a'], 5)", expect: 0 },
              { name: "empty input", call: "total_long_word_lengths([], 1)", expect: 0 },
              { name: "boundary is inclusive", call: "total_long_word_lengths(['abcd'], 4)", expect: 4 }
            ],
            solution: L([
              "def total_long_word_lengths(words, minimum):",
              "    return sum(len(w) for w in words if len(w) >= minimum)"
            ])
          }
        ]
      }
    ],

    checkpoint: {
      id: "m18cp", pass: 0.8,
      title: "Checkpoint: Iterators & Generators",
      items: [
        {
          kind: "code", title: "Generator of squares", difficulty: 2, concepts: ["yield"],
          prompt: "Write `squares(n)` as a generator yielding the squares of 1 to n.",
          starter: "def squares(n):\n    ",
          tests: [
            { name: "yields squares", code: "assert list(squares(3)) == [1, 4, 9]" },
            { name: "is a generator", code: "import types\nassert isinstance(squares(1), types.GeneratorType)" },
            { name: "zero", code: "assert list(squares(0)) == []" }
          ]
        },
        {
          kind: "predict", title: "Exhaustion", difficulty: 3, concepts: ["exhaustion"],
          prompt: "What is printed?\n\n~~~py\ng = (n for n in [1, 2, 3])\nprint(sum(g), sum(g))\n~~~",
          choices: ["`6 6`", "`6 0`", "`0 0`", "An error"],
          answer: 1,
          explain: "A generator is a one-shot iterator. The first `sum` consumes it completely, so the second sees an empty sequence and returns 0."
        },
        {
          kind: "code", title: "Unique lazily", difficulty: 4, concepts: ["generator-fn"],
          prompt: "Write `unique(items)` as a generator yielding each value the first time it is seen, preserving order. It must work on an infinite source.",
          starter: "def unique(items):\n    ",
          tests: [
            { name: "removes duplicates", code: "assert list(unique([1, 2, 1, 3, 2])) == [1, 2, 3]" },
            { name: "empty", code: "assert list(unique([])) == []" },
            { name: "lazy", code: "def endless():\n    i = 0\n    while True:\n        yield i % 3\n        i += 1\ng = unique(endless())\nassert [next(g), next(g), next(g)] == [0, 1, 2]" }
          ]
        },
        {
          kind: "quiz", title: "Brackets", difficulty: 2, concepts: ["gen-expr"],
          prompt: "What is the difference between `(x for x in items)` and `[x for x in items]`?",
          choices: [
            "None",
            "The first produces values lazily one at a time; the second builds the whole list in memory",
            "The first is a tuple",
            "The second cannot be iterated"
          ],
          answer: 1,
          explain: "Round brackets give a generator expression — lazy, one-shot, constant memory. Square brackets build an actual list."
        },
        {
          kind: "code", title: "Take while", difficulty: 3, concepts: ["generator-fn"],
          prompt: "Write `until(items, stop_value)` as a generator yielding items until it meets `stop_value` (which is not yielded), then stopping.",
          starter: "def until(items, stop_value):\n    ",
          tests: [
            { name: "stops at the value", code: "assert list(until([1, 2, 3, 4], 3)) == [1, 2]" },
            { name: "value absent yields all", code: "assert list(until([1, 2], 9)) == [1, 2]" },
            { name: "stops immediately", code: "assert list(until([5, 1], 5)) == []" }
          ]
        }
      ]
    }
  });
})();
