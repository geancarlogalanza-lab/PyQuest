/* Tier 3 · Module 19 — Closures & Decorators */
(function () {
  const L = a => a.join("\n");

  PQ.defineModule({
    id: "m19", tier: 3, order: 19, icon: "🎁",
    title: "Closures & Decorators",
    blurb: "Functions that remember, and functions that wrap other functions.",
    intro: L([
      "You have seen `@dataclass`, `@property`, `@staticmethod` and `@abstractmethod`. This module explains",
      "what that `@` actually does, and gets you writing your own.",
      "",
      "Decorators are how caching, timing, logging, retries, authentication and routing are added to functions",
      "in real Python codebases — without touching the functions themselves."
    ]),
    concepts: [
      { id: "closure", name: "closures", importance: 1.5 },
      { id: "nested-fn", name: "nested functions", importance: 1.3 },
      { id: "decorator-basic", name: "writing a decorator", importance: 1.6 },
      { id: "decorator-syntax", name: "the @ syntax", importance: 1.4 },
      { id: "functools-wraps", name: "functools.wraps", importance: 1.3 },
      { id: "decorator-args", name: "decorators with arguments", importance: 1.3 },
      { id: "lru-cache", name: "caching", importance: 1.3 }
    ],

    lessons: [
      {
        id: "m19l1", title: "Closures: functions that remember", minutes: 11,
        concepts: ["closure", "nested-fn"],
        content: L([
          "## A function defined inside a function",
          "",
          "~~~py",
          "def make_multiplier(factor):",
          "    def multiply(n):",
          "        return n * factor        # uses factor from the enclosing scope",
          "    return multiply",
          "",
          "",
          "double = make_multiplier(2)",
          "triple = make_multiplier(3)",
          "",
          "print(double(5))    # 10",
          "print(triple(5))    # 15",
          "~~~",
          "",
          "`make_multiplier` has finished and returned by the time `double(5)` runs — yet `factor` is still",
          "there. The inner function **captured** it.",
          "",
          "That combination — a function plus the variables it captured from where it was defined — is a",
          "**closure**. Each call to `make_multiplier` creates a fresh one with its own `factor`.",
          "",
          "~~~py",
          "print(double.__closure__[0].cell_contents)     # 2",
          "~~~",
          "",
          "## What closures are for",
          "",
          "**Configuration once, use many times:**",
          "",
          "~~~py",
          "def make_validator(minimum, maximum):",
          "    def validate(value):",
          "        return minimum <= value <= maximum",
          "    return validate",
          "",
          "is_percentage = make_validator(0, 100)",
          "is_grade = make_validator(0, 5)",
          "~~~",
          "",
          "**Keeping private state:**",
          "",
          "~~~py",
          "def make_counter():",
          "    count = 0",
          "    def increment():",
          "        nonlocal count       # without this, count would be treated as local",
          "        count += 1",
          "        return count",
          "    return increment",
          "",
          "c = make_counter()",
          "print(c(), c(), c())     # 1 2 3",
          "~~~",
          "",
          "`nonlocal` says *assign to the variable in the enclosing function, not a new local one*. It is the",
          "closure equivalent of the `global` problem from Module 6 — and here it is the right answer, because",
          "the state is genuinely private to this closure.",
          "",
          ":::trap The late-binding trap",
          "~~~py",
          "funcs = []",
          "for i in range(3):",
          "    funcs.append(lambda: i)",
          "",
          "print([f() for f in funcs])     # [2, 2, 2]  -- not [0, 1, 2]!",
          "~~~",
          "",
          "The closure captures the **variable**, not its value at the time. By the time the lambdas run,",
          "`i` is 2. The fix is to bind it as a default argument, which *is* evaluated immediately:",
          "",
          "~~~py",
          "funcs.append(lambda i=i: i)     # [0, 1, 2]",
          "~~~",
          ":::",
          "",
          "## Closure or class?",
          "",
          "A closure with one function is often a class with one method wearing lighter clothes:",
          "",
          "~~~py",
          "class Multiplier:",
          "    def __init__(self, factor):",
          "        self.factor = factor",
          "    def __call__(self, n):",
          "        return n * self.factor",
          "~~~",
          "",
          "Use a closure for one small behaviour with a little captured state. Use a class when there are several",
          "related operations, or the state needs inspecting."
        ]),
        exercises: [
          {
            kind: "code", title: "Make a multiplier", difficulty: 2,
            concepts: ["closure"],
            prompt: L([
              "Write `make_power(exponent)` returning a function that raises its argument to that power.",
              "",
              "`square = make_power(2)` then `square(5)` → `25`"
            ]),
            starter: "def make_power(exponent):\n    ",
            hints: ["Define an inner function using `exponent`, then return it — without calling it."],
            tests: [
              { name: "square", code: "square = make_power(2)\nassert square(5) == 25" },
              { name: "cube", code: "cube = make_power(3)\nassert cube(2) == 8" },
              { name: "independent closures", code: "a = make_power(2)\nb = make_power(3)\nassert a(2) == 4 and b(2) == 8" },
              { name: "returns a function, not a value", code: "assert callable(make_power(2))" }
            ],
            solution: L([
              "def make_power(exponent):",
              "    def power(n):",
              "        return n ** exponent",
              "    return power"
            ])
          },
          {
            kind: "code", title: "A private counter", difficulty: 3,
            concepts: ["closure"],
            prompt: L([
              "Write `make_accumulator()` returning a function that adds its argument to a running total and",
              "returns the new total.",
              "",
              "~~~py",
              "acc = make_accumulator()",
              "acc(10)   # 10",
              "acc(5)    # 15",
              "~~~",
              "",
              "Two accumulators must not share state, and the total must not be a global."
            ]),
            starter: "def make_accumulator():\n    ",
            forbids: [{ contains: "global", msg: "Use nonlocal, not a global" }],
            hints: ["Start `total = 0` in the outer function.", "The inner function needs `nonlocal total` before adding."],
            tests: [
              { name: "accumulates", code: "acc = make_accumulator()\nassert acc(10) == 10\nassert acc(5) == 15" },
              { name: "independent", code: "a = make_accumulator()\nb = make_accumulator()\na(100)\nassert b(1) == 1" },
              { name: "starts at zero", code: "assert make_accumulator()(0) == 0" },
              { name: "negatives work", code: "acc = make_accumulator()\nacc(10)\nassert acc(-3) == 7" }
            ],
            solution: L([
              "def make_accumulator():",
              "    total = 0",
              "",
              "    def add(amount):",
              "        nonlocal total",
              "        total += amount",
              "        return total",
              "",
              "    return add"
            ])
          },
          {
            kind: "debug", title: "Late binding", difficulty: 4,
            concepts: ["closure"],
            prompt: L([
              "`make_greeters(['a', 'b', 'c'])` should return three functions returning `'hello a'`, `'hello b'`",
              "and `'hello c'`. All three currently return `'hello c'`.",
              "",
              "Fix it."
            ]),
            starter: L([
              "def make_greeters(names):",
              "    greeters = []",
              "    for name in names:",
              "        greeters.append(lambda: f'hello {name}')",
              "    return greeters"
            ]),
            hints: [
              "The lambdas all capture the same `name` variable, which ends up holding the last value.",
              "Bind it immediately with a default argument: `lambda name=name: ...`",
              "Or use a factory function that takes `name` as a parameter."
            ],
            tests: [
              { name: "each greeter has its own name", code: "gs = make_greeters(['a', 'b', 'c'])\nassert [g() for g in gs] == ['hello a', 'hello b', 'hello c']" },
              { name: "single name", code: "gs = make_greeters(['solo'])\nassert gs[0]() == 'hello solo'" },
              { name: "empty list", code: "assert make_greeters([]) == []" }
            ],
            solution: L([
              "def make_greeters(names):",
              "    greeters = []",
              "    for name in names:",
              "        greeters.append(lambda name=name: f'hello {name}')",
              "    return greeters"
            ]),
            takeaway: "Closures capture variables, not values. Any loop that builds functions needs to bind the loop variable explicitly — this bug exists in every language with closures."
          },
          {
            kind: "predict", title: "What is captured", difficulty: 3,
            concepts: ["closure"],
            prompt: L([
              "What is printed?",
              "",
              "~~~py",
              "def outer():",
              "    x = 1",
              "    def inner():",
              "        return x",
              "    x = 99",
              "    return inner",
              "",
              "print(outer()())",
              "~~~"
            ]),
            choices: ["`1`", "`99`", "`None`", "An error"],
            answer: 1,
            explain: "The closure holds a reference to the *variable* `x`, not a snapshot of its value at definition time. By the time `inner` runs, `x` is 99."
          }
        ]
      },

      {
        id: "m19l2", title: "Writing decorators", minutes: 13,
        concepts: ["decorator-basic", "decorator-syntax", "functools-wraps"],
        content: L([
          "## A decorator is a function that wraps a function",
          "",
          "~~~py",
          "def shout(func):",
          "    def wrapper(*args, **kwargs):",
          "        result = func(*args, **kwargs)",
          "        return result.upper()",
          "    return wrapper",
          "",
          "",
          "def greet(name):",
          "    return f'hello {name}'",
          "",
          "greet = shout(greet)          # wrap it",
          "print(greet('ada'))",
          "~~~",
          "~~~out",
          "HELLO ADA",
          "~~~",
          "",
          "## The @ is just that line",
          "",
          "~~~py",
          "@shout",
          "def greet(name):",
          "    return f'hello {name}'",
          "~~~",
          "",
          "is **exactly** `greet = shout(greet)`. That is the whole feature. Everything else is a consequence.",
          "",
          "## The standard shape",
          "",
          "~~~py",
          "import functools",
          "",
          "def my_decorator(func):",
          "    @functools.wraps(func)",
          "    def wrapper(*args, **kwargs):",
          "        # before",
          "        result = func(*args, **kwargs)",
          "        # after",
          "        return result",
          "    return wrapper",
          "~~~",
          "",
          "Memorise this. Four parts:",
          "",
          "1. take `func`",
          "2. define `wrapper` accepting `*args, **kwargs` so it works with any signature",
          "3. call `func(*args, **kwargs)` and **return its result** — forgetting this makes every decorated",
          "   function return `None`",
          "4. return `wrapper`",
          "",
          "## Why functools.wraps",
          "",
          "Without it, the wrapper's identity replaces the original's:",
          "",
          "~~~py",
          "@shout",
          "def greet(name):",
          "    \"\"\"Greet someone.\"\"\"",
          "    return f'hello {name}'",
          "",
          "print(greet.__name__)      # 'wrapper'  -- wrong",
          "print(greet.__doc__)       # None       -- documentation gone",
          "~~~",
          "",
          "`@functools.wraps(func)` copies the name, docstring and other metadata across. It costs one line and",
          "it is why your debugger, `help()` and error messages still make sense. **Always include it.**",
          "",
          "## Practical examples",
          "",
          "~~~py",
          "import functools, time",
          "",
          "def timed(func):",
          "    @functools.wraps(func)",
          "    def wrapper(*args, **kwargs):",
          "        start = time.perf_counter()",
          "        result = func(*args, **kwargs)",
          "        print(f'{func.__name__} took {time.perf_counter() - start:.4f}s')",
          "        return result",
          "    return wrapper",
          "",
          "",
          "def logged(func):",
          "    @functools.wraps(func)",
          "    def wrapper(*args, **kwargs):",
          "        print(f'calling {func.__name__}({args})')",
          "        return func(*args, **kwargs)",
          "    return wrapper",
          "~~~",
          "",
          "## Stacking",
          "",
          "~~~py",
          "@timed",
          "@logged",
          "def work():",
          "    ...",
          "~~~",
          "",
          "This is `work = timed(logged(work))`. The one **closest to the function** wraps first, so `logged` is",
          "on the inside and `timed` on the outside — `timed` measures `logged` plus `work`.",
          "",
          ":::tip Built-in decorators you already use",
          "`@property`, `@staticmethod`, `@classmethod`, `@dataclass`, `@abstractmethod`, `@functools.lru_cache`.",
          "None of them are special syntax — they are all just functions that take a function (or class) and",
          "return a replacement.",
          ":::"
        ]),
        exercises: [
          {
            kind: "code", title: "Your first decorator", difficulty: 3,
            concepts: ["decorator-basic", "functools-wraps"],
            prompt: L([
              "Write a decorator `double_result` that doubles whatever the wrapped function returns.",
              "",
              "It must work with any signature, and must preserve the function's `__name__` using",
              "`functools.wraps`."
            ]),
            starter: "import functools\n\n\ndef double_result(func):\n    ",
            requires: [{ contains: "functools.wraps", msg: "Use @functools.wraps" }],
            hints: [
              "The standard shape: define `wrapper(*args, **kwargs)`, call `func`, transform, return.",
              "Decorate `wrapper` with `@functools.wraps(func)`."
            ],
            tests: [
              { name: "doubles a number", code: "@double_result\ndef three():\n    return 3\nassert three() == 6" },
              { name: "works with arguments", code: "@double_result\ndef add(a, b):\n    return a + b\nassert add(1, 2) == 6" },
              { name: "works with keyword arguments", code: "@double_result\ndef f(a, b=10):\n    return a + b\nassert f(1, b=2) == 6" },
              { name: "preserves the name", code: "@double_result\ndef original():\n    return 1\nassert original.__name__ == 'original', 'use functools.wraps'" },
              { name: "works on strings too", code: "@double_result\ndef word():\n    return 'ab'\nassert word() == 'abab'" }
            ],
            solution: L([
              "import functools",
              "",
              "",
              "def double_result(func):",
              "    @functools.wraps(func)",
              "    def wrapper(*args, **kwargs):",
              "        return func(*args, **kwargs) * 2",
              "    return wrapper"
            ])
          },
          {
            kind: "debug", title: "The decorator that ate the result", difficulty: 3,
            concepts: ["decorator-basic"],
            prompt: L([
              "Every function decorated with `announce` returns `None`. Fix it — and add `functools.wraps` while",
              "you are there.",
              "",
              "The announcement must still be printed **before** the function runs."
            ]),
            starter: L([
              "import functools",
              "",
              "",
              "def announce(func):",
              "    def wrapper(*args, **kwargs):",
              "        print(f'running {func.__name__}')",
              "        func(*args, **kwargs)",
              "    return wrapper"
            ]),
            hints: ["`wrapper` calls `func` but never returns its result.", "Add `@functools.wraps(func)` above `wrapper`."],
            tests: [
              { name: "returns the result", code: "@announce\ndef five():\n    return 5\nassert five() == 5" },
              { name: "still announces", code: "import io, sys\n@announce\ndef go():\n    return 1\nbuf = io.StringIO()\nold = sys.stdout\nsys.stdout = buf\ngo()\nsys.stdout = old\nassert 'running go' in buf.getvalue()" },
              { name: "preserves the name", code: "@announce\ndef named():\n    return 1\nassert named.__name__ == 'named'" }
            ],
            solution: L([
              "import functools",
              "",
              "",
              "def announce(func):",
              "    @functools.wraps(func)",
              "    def wrapper(*args, **kwargs):",
              "        print(f'running {func.__name__}')",
              "        return func(*args, **kwargs)",
              "    return wrapper"
            ]),
            takeaway: "Forgetting `return` in a wrapper is the single most common decorator bug. Everything silently becomes `None`."
          },
          {
            kind: "code", title: "Count the calls", difficulty: 3,
            concepts: ["decorator-basic", "closure"],
            prompt: L([
              "Write a decorator `count_calls` that tracks how many times the function has been called,",
              "exposing it as an attribute `calls` on the wrapped function.",
              "",
              "~~~py",
              "@count_calls",
              "def hello():",
              "    return 'hi'",
              "",
              "hello(); hello()",
              "hello.calls    # 2",
              "~~~"
            ]),
            starter: "import functools\n\n\ndef count_calls(func):\n    ",
            hints: [
              "You can attach attributes to a function object: `wrapper.calls = 0`.",
              "Increment `wrapper.calls` inside the wrapper — no `nonlocal` needed if you use the attribute.",
              "Set it to 0 *after* defining wrapper and before returning it."
            ],
            tests: [
              { name: "counts calls", code: "@count_calls\ndef f():\n    return 1\nf()\nf()\nassert f.calls == 2" },
              { name: "starts at zero", code: "@count_calls\ndef g():\n    return 1\nassert g.calls == 0" },
              { name: "still returns the result", code: "@count_calls\ndef h(a):\n    return a * 2\nassert h(5) == 10" },
              { name: "separate functions count separately", code: "@count_calls\ndef a():\n    pass\n@count_calls\ndef b():\n    pass\na()\nassert a.calls == 1 and b.calls == 0" },
              { name: "preserves the name", code: "@count_calls\ndef named():\n    pass\nassert named.__name__ == 'named'" }
            ],
            solution: L([
              "import functools",
              "",
              "",
              "def count_calls(func):",
              "    @functools.wraps(func)",
              "    def wrapper(*args, **kwargs):",
              "        wrapper.calls += 1",
              "        return func(*args, **kwargs)",
              "",
              "    wrapper.calls = 0",
              "    return wrapper"
            ])
          },
          {
            kind: "predict", title: "Stacking order", difficulty: 4,
            concepts: ["decorator-syntax"],
            prompt: L([
              "Which decorator wraps the function first?",
              "",
              "~~~py",
              "@outer",
              "@inner",
              "def f():",
              "    ...",
              "~~~"
            ]),
            choices: [
              "`outer`, because it is written first",
              "`inner`, because it is closest to the function",
              "They apply simultaneously",
              "Neither — stacking is not allowed"
            ],
            answer: 1,
            explain: "The stack means `f = outer(inner(f))`. Decorators apply bottom-up, so `inner` wraps the original function and `outer` wraps the result. `outer` therefore runs first when the function is *called*."
          }
        ]
      },

      {
        id: "m19l3", title: "Decorators with arguments, and caching", minutes: 12,
        concepts: ["decorator-args", "lru-cache"],
        content: L([
          "## Adding a parameter means one more layer",
          "",
          "You want this:",
          "",
          "~~~py",
          "@repeat(3)",
          "def greet():",
          "    print('hi')",
          "~~~",
          "",
          "`@repeat(3)` means: call `repeat(3)`, and whatever it returns is used as the decorator. So `repeat`",
          "must return a decorator, which returns a wrapper. Three levels:",
          "",
          "~~~py",
          "import functools",
          "",
          "def repeat(times):                       # 1. takes the argument",
          "    def decorator(func):                 # 2. takes the function",
          "        @functools.wraps(func)",
          "        def wrapper(*args, **kwargs):    # 3. takes the call",
          "            for _ in range(times):",
          "                result = func(*args, **kwargs)",
          "            return result",
          "        return wrapper",
          "    return decorator",
          "~~~",
          "",
          "Each level closes over what the level above received. `wrapper` can see `times` because of the",
          "closure chain.",
          "",
          ":::tip Read it inside-out",
          "`@repeat(3)` → `repeat(3)` returns `decorator` → `decorator(greet)` returns `wrapper` →",
          "`greet` now *is* `wrapper`. Trace that once by hand and the pattern stops being confusing.",
          ":::",
          "",
          "## A retry decorator",
          "",
          "~~~py",
          "def retry(attempts):",
          "    def decorator(func):",
          "        @functools.wraps(func)",
          "        def wrapper(*args, **kwargs):",
          "            last_error = None",
          "            for _ in range(attempts):",
          "                try:",
          "                    return func(*args, **kwargs)",
          "                except Exception as error:",
          "                    last_error = error",
          "            raise last_error",
          "        return wrapper",
          "    return decorator",
          "",
          "",
          "@retry(3)",
          "def flaky_request():",
          "    ...",
          "~~~",
          "",
          "Twelve lines that you write once and apply to any function in the codebase. That is what makes",
          "decorators worth the initial confusion.",
          "",
          "## functools.lru_cache",
          "",
          "~~~py",
          "import functools",
          "",
          "@functools.lru_cache(maxsize=None)",
          "def fib(n):",
          "    if n < 2:",
          "        return n",
          "    return fib(n - 1) + fib(n - 2)",
          "",
          "print(fib(35))",
          "~~~",
          "",
          "Without the cache, `fib(35)` makes about 30 million calls. With it, 36. One line took an exponential",
          "algorithm to a linear one, and this is a real technique — memoisation, which you will meet again in",
          "Module 21.",
          "",
          "**Requirements and cautions:**",
          "",
          "- arguments must be **hashable**, so no lists or dicts",
          "- the function must be **pure** — same inputs, same output, no side effects",
          "- caching something that reads a file or a database will happily serve stale data forever",
          "- `maxsize=None` caches without limit; a number keeps only the most recently used",
          "- `fib.cache_clear()` empties it, `fib.cache_info()` shows hits and misses",
          "",
          ":::warn Do not decorate everything",
          "A decorator moves behaviour away from where it is written. One `@retry(3)` is clarity; five stacked",
          "decorators is a function whose behaviour is defined in five other places. Use them for genuinely",
          "cross-cutting concerns — caching, timing, logging, access control — not for ordinary logic.",
          ":::"
        ]),
        exercises: [
          {
            kind: "code", title: "A decorator with an argument", difficulty: 4,
            concepts: ["decorator-args"],
            prompt: L([
              "Write `repeat(times)` — a decorator factory that calls the wrapped function `times` times and",
              "returns the **last** result.",
              "",
              "~~~py",
              "@repeat(3)",
              "def tick():",
              "    return 'tock'",
              "~~~",
              "",
              "`tick()` calls the body three times and returns `'tock'`."
            ]),
            starter: "import functools\n\n\ndef repeat(times):\n    ",
            requires: [{ contains: "functools.wraps", msg: "Use @functools.wraps" }],
            hints: [
              "Three nested functions: `repeat(times)` → `decorator(func)` → `wrapper(*args, **kwargs)`.",
              "Loop `times` times, keeping the result, and return it after the loop.",
              "Remember to return `decorator` from `repeat`."
            ],
            tests: [
              {
                name: "calls the function the right number of times",
                code: "calls = []\n@repeat(3)\ndef go():\n    calls.append(1)\n    return 'done'\nassert go() == 'done'\nassert len(calls) == 3"
              },
              { name: "works with arguments", code: "@repeat(2)\ndef add(a, b):\n    return a + b\nassert add(2, 3) == 5" },
              { name: "once", code: "calls = []\n@repeat(1)\ndef f():\n    calls.append(1)\nf()\nassert len(calls) == 1" },
              { name: "preserves the name", code: "@repeat(2)\ndef named():\n    pass\nassert named.__name__ == 'named'" }
            ],
            solution: L([
              "import functools",
              "",
              "",
              "def repeat(times):",
              "    def decorator(func):",
              "        @functools.wraps(func)",
              "        def wrapper(*args, **kwargs):",
              "            result = None",
              "            for _ in range(times):",
              "                result = func(*args, **kwargs)",
              "            return result",
              "        return wrapper",
              "    return decorator"
            ])
          },
          {
            kind: "code", title: "Cache it yourself", difficulty: 4,
            concepts: ["decorator-basic", "lru-cache"],
            prompt: L([
              "Write a `memoise` decorator that caches results in a dictionary keyed by the arguments.",
              "",
              "- only positional arguments need to be supported",
              "- expose the cache as `wrapper.cache` so it can be inspected",
              "- the wrapped function must be called only once per distinct argument tuple"
            ]),
            starter: "import functools\n\n\ndef memoise(func):\n    ",
            hints: [
              "`cache = {}` in the decorator, captured by the wrapper.",
              "Key on `args` — a tuple is hashable.",
              "`if args not in cache: cache[args] = func(*args)` then return `cache[args]`.",
              "Attach it with `wrapper.cache = cache` before returning."
            ],
            tests: [
              {
                name: "the function runs only once per argument",
                code: "calls = []\n@memoise\ndef slow(n):\n    calls.append(n)\n    return n * 2\nassert slow(5) == 10\nassert slow(5) == 10\nassert calls == [5], f'called with {calls}'"
              },
              { name: "different arguments are computed", code: "calls = []\n@memoise\ndef f(n):\n    calls.append(n)\n    return n\nf(1)\nf(2)\nf(1)\nassert calls == [1, 2]" },
              { name: "cache is inspectable", code: "@memoise\ndef g(n):\n    return n\ng(3)\nassert g.cache == {(3,): 3}" },
              { name: "multiple arguments", code: "@memoise\ndef add(a, b):\n    return a + b\nassert add(1, 2) == 3\nassert add(1, 2) == 3" },
              { name: "preserves the name", code: "@memoise\ndef named(n):\n    return n\nassert named.__name__ == 'named'" }
            ],
            solution: L([
              "import functools",
              "",
              "",
              "def memoise(func):",
              "    cache = {}",
              "",
              "    @functools.wraps(func)",
              "    def wrapper(*args):",
              "        if args not in cache:",
              "            cache[args] = func(*args)",
              "        return cache[args]",
              "",
              "    wrapper.cache = cache",
              "    return wrapper"
            ]),
            takeaway: "That is `functools.lru_cache` in six lines. Knowing what it does under the hood is what tells you when it is safe to use."
          },
          {
            kind: "code", title: "Validate arguments", difficulty: 4,
            concepts: ["decorator-args"],
            prompt: L([
              "Write `require_positive` — a decorator that raises `ValueError` if **any** positional argument is",
              "negative, before calling the function.",
              "",
              "The message must name the offending value."
            ]),
            starter: "import functools\n\n\ndef require_positive(func):\n    ",
            hints: [
              "Loop over `args` in the wrapper and check each one.",
              "Only compare numbers — use `isinstance(a, (int, float))` to skip non-numeric arguments.",
              "Raise before calling `func`."
            ],
            tests: [
              { name: "valid arguments pass through", code: "@require_positive\ndef add(a, b):\n    return a + b\nassert add(1, 2) == 3" },
              { name: "negative raises", code: "@require_positive\ndef f(a):\n    return a\ntry:\n    f(-1)\n    raise AssertionError('should raise')\nexcept ValueError:\n    pass" },
              { name: "the message names the value", code: "@require_positive\ndef f(a):\n    return a\ntry:\n    f(-7)\n    raise AssertionError('should raise')\nexcept ValueError as e:\n    assert '-7' in str(e)" },
              { name: "zero is allowed", code: "@require_positive\ndef f(a):\n    return a\nassert f(0) == 0" },
              { name: "non-numeric arguments are ignored", code: "@require_positive\ndef f(a, b):\n    return b\nassert f(1, 'text') == 'text'" },
              { name: "the function is not called on failure", code: "calls = []\n@require_positive\ndef f(a):\n    calls.append(a)\ntry:\n    f(-1)\nexcept ValueError:\n    pass\nassert calls == [], 'validate before calling'" }
            ],
            solution: L([
              "import functools",
              "",
              "",
              "def require_positive(func):",
              "    @functools.wraps(func)",
              "    def wrapper(*args, **kwargs):",
              "        for value in args:",
              "            if isinstance(value, (int, float)) and not isinstance(value, bool) and value < 0:",
              "                raise ValueError(f'negative argument: {value}')",
              "        return func(*args, **kwargs)",
              "    return wrapper"
            ])
          },
          {
            kind: "quiz", title: "When lru_cache is wrong", difficulty: 3,
            concepts: ["lru-cache"],
            prompt: "Which function is a bad candidate for `@functools.lru_cache`?",
            choices: [
              "`def fib(n)` — pure recursion on an integer",
              "`def read_settings()` — reads a config file from disk",
              "`def distance(a, b)` — geometry on two numbers",
              "`def parse_date(text)` — converts a string to a date"
            ],
            answer: 1,
            explain: "Caching a function that reads external state means it will keep returning the first result forever, even after the file changes. Caches are safe only for pure functions whose output depends solely on their arguments."
          }
        ]
      }
    ],

    checkpoint: {
      id: "m19cp", pass: 0.8,
      title: "Checkpoint: Closures & Decorators",
      items: [
        {
          kind: "code", title: "Closure factory", difficulty: 3, concepts: ["closure"],
          prompt: "Write `make_prefixer(prefix)` returning a function that prepends the prefix to any string it is given.",
          starter: "def make_prefixer(prefix):\n    ",
          tests: [
            { name: "prefixes", code: "p = make_prefixer('>> ')\nassert p('hi') == '>> hi'" },
            { name: "independent", code: "a = make_prefixer('a')\nb = make_prefixer('b')\nassert a('x') == 'ax' and b('x') == 'bx'" }
          ]
        },
        {
          kind: "code", title: "Uppercase decorator", difficulty: 3, concepts: ["decorator-basic"],
          prompt: "Write a decorator `upper` that uppercases the string a function returns, preserving `__name__`.",
          starter: "import functools\n\n\ndef upper(func):\n    ",
          tests: [
            { name: "uppercases", code: "@upper\ndef f():\n    return 'hi'\nassert f() == 'HI'" },
            { name: "passes arguments", code: "@upper\ndef g(a):\n    return a\nassert g('ab') == 'AB'" },
            { name: "preserves the name", code: "@upper\ndef named():\n    return ''\nassert named.__name__ == 'named'" }
          ]
        },
        {
          kind: "predict", title: "What @ means", difficulty: 2, concepts: ["decorator-syntax"],
          prompt: "`@log` above `def f(): ...` is equivalent to what?",
          choices: ["`log(f())`", "`f = log(f)`", "`log = f`", "`f = log()`"],
          answer: 1,
          explain: "The decorator is called with the function object and its return value is bound back to the same name. That is the entire mechanism."
        },
        {
          kind: "debug", title: "Missing return", difficulty: 3, concepts: ["decorator-basic"],
          prompt: "Fix this decorator so the wrapped function's value comes back.",
          starter: "import functools\n\n\ndef trace(func):\n    @functools.wraps(func)\n    def wrapper(*args, **kwargs):\n        func(*args, **kwargs)\n    return wrapper",
          tests: [
            { name: "returns the value", code: "@trace\ndef f():\n    return 42\nassert f() == 42" },
            { name: "with arguments", code: "@trace\ndef g(a, b=1):\n    return a + b\nassert g(1, b=2) == 3" }
          ]
        },
        {
          kind: "code", title: "Decorator with a parameter", difficulty: 4, concepts: ["decorator-args"],
          prompt: "Write `default_on_error(fallback)` — a decorator factory that returns `fallback` if the wrapped function raises any `Exception`.",
          starter: "import functools\n\n\ndef default_on_error(fallback):\n    ",
          tests: [
            { name: "normal result passes through", code: "@default_on_error(0)\ndef f():\n    return 5\nassert f() == 5" },
            { name: "error gives the fallback", code: "@default_on_error(-1)\ndef f():\n    raise ValueError('boom')\nassert f() == -1" },
            { name: "arguments work", code: "@default_on_error('bad')\ndef div(a, b):\n    return a / b\nassert div(1, 0) == 'bad'\nassert div(6, 2) == 3" }
          ]
        }
      ]
    }
  });
})();
