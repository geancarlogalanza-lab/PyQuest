/* Tier 2 · Module 12 — Functions II */
(function () {
  const L = a => a.join("\n");

  PQ.defineModule({
    id: "m12", tier: 2, order: 12, icon: "🔧",
    title: "Functions II",
    blurb: "Flexible signatures, functions as values, and the mutable-default trap that catches everyone.",
    intro: L([
      "You can already write functions. This module makes them flexible and teaches the idea that unlocks",
      "most of intermediate Python: a function is just a value, and values can be passed around."
    ]),
    concepts: [
      { id: "default-args", name: "default arguments", importance: 1.4 },
      { id: "keyword-args", name: "keyword arguments", importance: 1.3 },
      { id: "mutable-default", name: "the mutable default trap", importance: 1.4 },
      { id: "args-kwargs", name: "*args and **kwargs", importance: 1.3 },
      { id: "first-class", name: "functions as values", importance: 1.6 },
      { id: "lambda", name: "lambda", importance: 1.3 },
      { id: "higher-order", name: "higher-order functions", importance: 1.4 },
      { id: "map-filter", name: "map and filter" }
    ],

    lessons: [
      {
        id: "m12l1", title: "Defaults and keywords", minutes: 11,
        concepts: ["default-args", "keyword-args", "mutable-default"],
        content: L([
          "## Default values",
          "",
          "~~~py",
          "def greet(name, greeting='Hello'):",
          "    return f'{greeting}, {name}!'",
          "",
          "print(greet('Ada'))",
          "print(greet('Ada', 'Welcome'))",
          "~~~",
          "~~~out",
          "Hello, Ada!",
          "Welcome, Ada!",
          "~~~",
          "",
          "Parameters with defaults are optional. **They must come after all the required ones** — otherwise",
          "Python cannot tell which argument is which, and refuses with a `SyntaxError`.",
          "",
          "## Calling by keyword",
          "",
          "~~~py",
          "def create_user(name, admin=False, active=True, verified=False):",
          "    return {'name': name, 'admin': admin, 'active': active, 'verified': verified}",
          "",
          "create_user('ada', False, True, True)      # what do these mean?",
          "create_user('ada', verified=True)          # obvious",
          "~~~",
          "",
          "Keyword arguments skip the ones you do not care about and document themselves at the call site.",
          "",
          ":::tip A useful habit",
          "If an argument is a bare `True`, `False`, `None` or a number whose meaning is not obvious from the",
          "function name, pass it by keyword. `resize(image, True)` tells the reader nothing;",
          "`resize(image, keep_ratio=True)` tells them everything.",
          ":::",
          "",
          "## Keyword-only parameters",
          "",
          "A bare `*` in the signature forces everything after it to be passed by name:",
          "",
          "~~~py",
          "def connect(host, *, timeout=30, retries=3):",
          "    ...",
          "",
          "connect('example.com', timeout=5)      # fine",
          "connect('example.com', 5)              # TypeError",
          "~~~",
          "",
          "Use it for options. It stops callers from writing mystery positional arguments, and it lets you",
          "reorder or add options later without breaking anyone.",
          "",
          "## The mutable default trap",
          "",
          "This is one of Python's genuinely surprising behaviours, and it is asked about in interviews forever:",
          "",
          "~~~py",
          "def add_item(item, basket=[]):",
          "    basket.append(item)",
          "    return basket",
          "",
          "print(add_item('apple'))",
          "print(add_item('bread'))",
          "~~~",
          "~~~out",
          "['apple']",
          "['apple', 'bread']",
          "~~~",
          "",
          "The second call was supposed to start fresh. It did not.",
          "",
          "**Why:** the default value is created **once**, when the `def` line runs — not on each call.",
          "Every call that omits the argument shares the same list.",
          "",
          "**The fix**, and it is always the same:",
          "",
          "~~~py",
          "def add_item(item, basket=None):",
          "    if basket is None:",
          "        basket = []",
          "    basket.append(item)",
          "    return basket",
          "~~~",
          "",
          ":::warn The rule",
          "**Never use a mutable value as a default.** No `[]`, `{}`, `set()` or object instances.",
          "Use `None` and create the real value inside. Immutable defaults (`0`, `''`, `False`, `None`, tuples)",
          "are completely safe.",
          ":::"
        ]),
        exercises: [
          {
            kind: "code", title: "Optional greeting", difficulty: 1,
            concepts: ["default-args"],
            prompt: L([
              "Write `greet(name, greeting='Hello', punctuation='!')` returning `'<greeting>, <name><punctuation>'`.",
              "",
              "`greet('Ada')` → `'Hello, Ada!'`",
              "`greet('Ada', 'Hi', '?')` → `'Hi, Ada?'`"
            ]),
            starter: "def greet(name, greeting='Hello', punctuation='!'):\n    ",
            hints: ["One f-string does it."],
            tests: [
              { name: "all defaults", call: "greet('Ada')", expect: "Hello, Ada!" },
              { name: "all overridden", call: "greet('Ada', 'Hi', '?')", expect: "Hi, Ada?" },
              { name: "keyword call", call: "greet('Ada', punctuation='.')", expect: "Hello, Ada." }
            ],
            solution: "def greet(name, greeting='Hello', punctuation='!'):\n    return f'{greeting}, {name}{punctuation}'"
          },
          {
            kind: "debug", title: "The shared basket", difficulty: 3,
            concepts: ["mutable-default"],
            prompt: L([
              "Each call to `add_item` should start with an empty basket unless one is passed in.",
              "Right now the baskets leak into each other. Fix it."
            ]),
            starter: L([
              "def add_item(item, basket=[]):",
              "    basket.append(item)",
              "    return basket",
              "",
              "print(add_item('apple'))",
              "print(add_item('bread'))"
            ]),
            hints: [
              "The default list is created once, when the function is defined.",
              "Use `basket=None` and build a new list inside when it is `None`."
            ],
            tests: [
              { name: "each call starts fresh", code: "assert add_item('a') == ['a']\nassert add_item('b') == ['b'], 'the second call must not see the first item'" },
              { name: "an explicit basket still works", code: "mine = ['x']\nassert add_item('y', mine) == ['x', 'y']" },
              { name: "prints two single-item baskets", out_lines: ["['apple']", "['bread']"] }
            ],
            solution: L([
              "def add_item(item, basket=None):",
              "    if basket is None:",
              "        basket = []",
              "    basket.append(item)",
              "    return basket",
              "",
              "print(add_item('apple'))",
              "print(add_item('bread'))"
            ]),
            takeaway: "Default values are evaluated once at definition time. That is the entire explanation, and it is worth remembering forever."
          },
          {
            kind: "predict", title: "When is the default made?", difficulty: 4,
            concepts: ["mutable-default"],
            prompt: L([
              "What does this print?",
              "",
              "~~~py",
              "def f(x, seen={}):",
              "    seen[x] = True",
              "    return len(seen)",
              "",
              "print(f('a'), f('b'), f('c'))",
              "~~~"
            ]),
            choices: ["`1 1 1`", "`1 2 3`", "`3 3 3`", "An error"],
            answer: 1,
            explain: L([
              "There is only ever **one** `seen` dictionary, made when `def` ran. Each call adds to that same",
              "dictionary, so the length grows: 1, then 2, then 3.",
              "",
              "Note the arguments are all evaluated before `print` runs, left to right."
            ])
          },
          {
            kind: "code", title: "Keyword-only options", difficulty: 3,
            concepts: ["keyword-args"],
            prompt: L([
              "Write `format_price(amount, *, currency='£', decimals=2)` returning a formatted price string.",
              "",
              "`format_price(5)` → `'£5.00'`",
              "`format_price(5, currency='$', decimals=0)` → `'$5'`",
              "",
              "The `*` must be there — the checks verify the options cannot be passed positionally."
            ]),
            starter: "def format_price(amount, *, currency='£', decimals=2):\n    ",
            hints: [
              "`f'{amount:.{decimals}f}'` — a nested format spec, where the precision itself comes from a variable.",
              "Then put the currency symbol in front."
            ],
            tests: [
              { name: "defaults", call: "format_price(5)", expect: "£5.00" },
              { name: "custom currency and precision", call: "format_price(5, currency='$', decimals=0)", expect: "$5" },
              { name: "rounds properly", call: "format_price(2.345, decimals=1)", expect: "£2.3" },
              { name: "options are keyword-only", code: "try:\n    format_price(5, '$')\n    raise AssertionError('currency should be keyword-only')\nexcept TypeError:\n    pass" }
            ],
            solution: "def format_price(amount, *, currency='£', decimals=2):\n    return f'{currency}{amount:.{decimals}f}'"
          }
        ]
      },

      {
        id: "m12l2", title: "*args and **kwargs", minutes: 10,
        concepts: ["args-kwargs", "unpacking"],
        content: L([
          "## Accepting any number of arguments",
          "",
          "~~~py",
          "def total(*numbers):",
          "    return sum(numbers)",
          "",
          "print(total(1, 2))",
          "print(total(1, 2, 3, 4))",
          "print(total())",
          "~~~",
          "~~~out",
          "3",
          "10",
          "0",
          "~~~",
          "",
          "`*numbers` collects every extra positional argument into a **tuple**. The name is up to you;",
          "`*args` is only a convention.",
          "",
          "## Accepting any keyword arguments",
          "",
          "~~~py",
          "def describe(**details):",
          "    for key, value in details.items():",
          "        print(f'{key}: {value}')",
          "",
          "describe(name='ada', age=36)",
          "~~~",
          "~~~out",
          "name: ada",
          "age: 36",
          "~~~",
          "",
          "`**details` collects extra keyword arguments into a **dictionary**.",
          "",
          "## The full signature order",
          "",
          "~~~py",
          "def f(required, optional=1, *args, kw_only=2, **kwargs):",
          "    ...",
          "~~~",
          "",
          "That order is fixed: required, defaults, `*args`, keyword-only, `**kwargs`. You will rarely need all",
          "five in one function — and if you do, that is usually a sign the function is doing too much.",
          "",
          "## Unpacking at the call site",
          "",
          "The same symbols work in the other direction:",
          "",
          "~~~py",
          "def point(x, y):",
          "    return f'({x}, {y})'",
          "",
          "coords = [3, 4]",
          "print(point(*coords))          # spreads the list into positional arguments",
          "",
          "settings = {'x': 1, 'y': 2}",
          "print(point(**settings))       # spreads the dict into keyword arguments",
          "~~~",
          "",
          "This is how you pass a collection you already have into a function that expects separate arguments.",
          "",
          ":::why Where you will actually meet this",
          "Wrapper functions. When you want to add behaviour around an existing function without caring about",
          "its signature:",
          "",
          "~~~py",
          "def logged(func, *args, **kwargs):",
          "    print(f'calling {func.__name__}')",
          "    return func(*args, **kwargs)",
          "~~~",
          "",
          "*Take whatever you were given and pass it straight through.* That pattern is the foundation of",
          "decorators in Module 19.",
          ":::"
        ]),
        exercises: [
          {
            kind: "code", title: "Variable sum", difficulty: 2,
            concepts: ["args-kwargs"],
            prompt: L([
              "Write `biggest(*numbers)` returning the largest argument, or `None` when called with none at all.",
              "",
              "`biggest(3, 9, 2)` → `9`, `biggest()` → `None`"
            ]),
            starter: "def biggest(*numbers):\n    ",
            hints: ["`numbers` is a tuple.", "Guard the empty case before calling `max`."],
            tests: [
              { name: "finds the max", call: "biggest(3, 9, 2)", expect: 9 },
              { name: "single argument", call: "biggest(4)", expect: 4 },
              { name: "no arguments gives None", code: "assert biggest() is None" }
            ],
            solution: "def biggest(*numbers):\n    if not numbers:\n        return None\n    return max(numbers)"
          },
          {
            kind: "code", title: "Build a query string", difficulty: 3,
            concepts: ["args-kwargs", "dict-iterate"],
            prompt: L([
              "Write `query(**params)` returning a URL query string with the parameters in the order given.",
              "",
              "`query(page=2, sort='name')` → `'page=2&sort=name'`",
              "",
              "No parameters returns an empty string."
            ]),
            starter: "def query(**params):\n    ",
            hints: [
              "`params` is a dictionary and keeps the order the arguments were given in.",
              "Build a list of `f'{k}={v}'` strings and `'&'.join(...)` them."
            ],
            tests: [
              { name: "two parameters", call: "query(page=2, sort='name')", expect: "page=2&sort=name" },
              { name: "one parameter", call: "query(q='python')", expect: "q=python" },
              { name: "none at all", call: "query()", expect: "" }
            ],
            solution: L([
              "def query(**params):",
              "    parts = []",
              "    for key, value in params.items():",
              "        parts.append(f'{key}={value}')",
              "    return '&'.join(parts)"
            ])
          },
          {
            kind: "code", title: "Pass it through", difficulty: 3,
            concepts: ["args-kwargs", "first-class"],
            prompt: L([
              "Write `call_twice(func, *args, **kwargs)` that calls `func` twice with the same arguments and",
              "returns a list of both results.",
              "",
              "`call_twice(pow, 2, 3)` → `[8, 8]`"
            ]),
            starter: "def call_twice(func, *args, **kwargs):\n    ",
            hints: ["Call it with `func(*args, **kwargs)`.", "Return a list containing both results."],
            tests: [
              { name: "positional arguments", call: "call_twice(pow, 2, 3)", expect: [8, 8] },
              { name: "no arguments", call: "call_twice(list)", expect: [[], []] },
              { name: "keyword arguments", code: "def f(a, b=1):\n    return a + b\nassert call_twice(f, 1, b=5) == [6, 6]" }
            ],
            solution: L([
              "def call_twice(func, *args, **kwargs):",
              "    return [func(*args, **kwargs), func(*args, **kwargs)]"
            ]),
            takeaway: "`*args, **kwargs` in, `*args, **kwargs` out is the universal wrapper. You now have the core mechanic behind decorators."
          },
          {
            kind: "predict", title: "Star at the call site", difficulty: 3,
            concepts: ["args-kwargs"],
            prompt: L([
              "What does this print?",
              "",
              "~~~py",
              "def f(a, b, c):",
              "    return a + b + c",
              "",
              "values = [1, 2, 3]",
              "print(f(*values))",
              "~~~"
            ]),
            choices: ["`[1, 2, 3]`", "`6`", "A TypeError", "`123`"],
            answer: 1,
            explain: "`*values` at the call site **spreads** the list into three separate arguments. Without the star, `f([1, 2, 3])` would be one argument and raise a `TypeError` for missing `b` and `c`."
          }
        ]
      },

      {
        id: "m12l3", title: "Functions are values", minutes: 12,
        concepts: ["first-class", "lambda", "higher-order", "map-filter"],
        content: L([
          "## A function is just another object",
          "",
          "~~~py",
          "def shout(text):",
          "    return text.upper()",
          "",
          "action = shout            # no parentheses: refer to it",
          "print(action('hello'))    # call it through the new name",
          "print(shout.__name__)",
          "~~~",
          "~~~out",
          "HELLO",
          "shout",
          "~~~",
          "",
          "Functions can be assigned to variables, put in lists and dictionaries, passed to other functions and",
          "returned from them. **Parentheses call; no parentheses refer.**",
          "",
          "## Dispatch tables",
          "",
          "This replaces a long `if/elif` chain:",
          "",
          "~~~py",
          "def add(a, b): return a + b",
          "def sub(a, b): return a - b",
          "",
          "operations = {'+': add, '-': sub}",
          "",
          "print(operations['+'](3, 4))",
          "~~~",
          "~~~out",
          "7",
          "~~~",
          "",
          "Adding an operation is now adding a dictionary entry, not editing a branch. That is a real",
          "architectural improvement, not a trick.",
          "",
          "## Higher-order functions",
          "",
          "A function that takes or returns a function. You have already used one: `sorted(items, key=...)`.",
          "",
          "~~~py",
          "def apply_to_all(func, items):",
          "    return [func(item) for item in items]",
          "",
          "print(apply_to_all(str.upper, ['a', 'b']))",
          "~~~",
          "~~~out",
          "['A', 'B']",
          "~~~",
          "",
          "## lambda: a function with no name",
          "",
          "~~~py",
          "double = lambda n: n * 2      # legal but poor style",
          "",
          "people = [('ada', 36), ('bo', 20)]",
          "print(sorted(people, key=lambda p: p[1]))     # this is the good use",
          "~~~",
          "",
          "A `lambda` is a single expression, and it returns that expression automatically — no `return` allowed",
          "and no statements inside.",
          "",
          ":::warn Do not assign a lambda to a name",
          "`double = lambda n: n * 2` is worse than `def double(n): return n * 2` in every way: worse tracebacks,",
          "no docstring, no clearer. Use `lambda` **only** where a small function is needed inline — a `key=`,",
          "a callback, a dispatch table entry.",
          ":::",
          "",
          "## map and filter",
          "",
          "~~~py",
          "numbers = [1, 2, 3, 4]",
          "print(list(map(lambda n: n * 2, numbers)))",
          "print(list(filter(lambda n: n % 2 == 0, numbers)))",
          "~~~",
          "~~~out",
          "[2, 4, 6, 8]",
          "[2, 4]",
          "~~~",
          "",
          "Both return lazy iterators, hence the `list(...)`.",
          "",
          "In Python, the comprehension is usually preferred:",
          "",
          "~~~py",
          "[n * 2 for n in numbers]              # clearer than map",
          "[n for n in numbers if n % 2 == 0]    # clearer than filter",
          "~~~",
          "",
          "`map` earns its place when you already have a named function: `map(str.strip, lines)` is clean.",
          "Recognise both — you will read plenty of code that uses them."
        ]),
        exercises: [
          {
            kind: "code", title: "Dispatch table", difficulty: 3,
            concepts: ["first-class"],
            prompt: L([
              "Write `calculate(a, op, b)` supporting `'+'`, `'-'`, `'*'` and `'/'` using a **dictionary of",
              "functions** — the checks forbid `if`/`elif` chains.",
              "",
              "An unknown operator returns `None`. Division by zero also returns `None`."
            ]),
            starter: "def add(a, b):\n    return a + b\n\n# define sub, mul and div, then build the table\n\ndef calculate(a, op, b):\n    ",
            forbids: [{ re: "\\belif\\b", msg: "Use a dictionary of functions, not an elif chain" }],
            hints: [
              "Build `OPERATIONS = {'+': add, '-': sub, '*': mul, '/': div}` at module level.",
              "`func = OPERATIONS.get(op)` then `if func is None: return None`.",
              "Guard division by zero inside `div` or before calling."
            ],
            tests: [
              { name: "addition", call: "calculate(3, '+', 4)", expect: 7 },
              { name: "subtraction", call: "calculate(10, '-', 4)", expect: 6 },
              { name: "multiplication", call: "calculate(3, '*', 4)", expect: 12 },
              { name: "division", call: "calculate(10, '/', 4)", expect: 2.5 },
              { name: "unknown operator", code: "assert calculate(1, '^', 2) is None" },
              { name: "division by zero", code: "assert calculate(1, '/', 0) is None" }
            ],
            solution: L([
              "def add(a, b):",
              "    return a + b",
              "",
              "def sub(a, b):",
              "    return a - b",
              "",
              "def mul(a, b):",
              "    return a * b",
              "",
              "def div(a, b):",
              "    if b == 0:",
              "        return None",
              "    return a / b",
              "",
              "OPERATIONS = {'+': add, '-': sub, '*': mul, '/': div}",
              "",
              "def calculate(a, op, b):",
              "    func = OPERATIONS.get(op)",
              "    if func is None:",
              "        return None",
              "    return func(a, b)"
            ]),
            takeaway: "A dispatch table turns *adding a feature* from editing control flow into adding data. That is one of the most valuable refactors you will learn."
          },
          {
            kind: "code", title: "Sort with a lambda", difficulty: 2,
            concepts: ["lambda", "sort-key"],
            prompt: L([
              "`items` is a list of dictionaries with `name` and `price` keys. Write `cheapest_first(items)`",
              "returning them sorted by price ascending.",
              "",
              "Use a `lambda` for the key."
            ]),
            starter: "def cheapest_first(items):\n    ",
            requires: [{ contains: "lambda", msg: "Use a lambda for the sort key" }],
            hints: ["`sorted(items, key=lambda item: item['price'])`"],
            tests: [
              {
                name: "sorts by price",
                call: "[i['name'] for i in cheapest_first([{'name': 'a', 'price': 9}, {'name': 'b', 'price': 2}])]",
                expect: ["b", "a"]
              },
              { name: "empty", call: "cheapest_first([])", expect: [] },
              { name: "original untouched", code: "data = [{'name': 'a', 'price': 9}, {'name': 'b', 'price': 2}]\ncheapest_first(data)\nassert data[0]['name'] == 'a'" }
            ],
            solution: "def cheapest_first(items):\n    return sorted(items, key=lambda item: item['price'])"
          },
          {
            kind: "code", title: "Apply a function to everything", difficulty: 3,
            concepts: ["higher-order"],
            prompt: L([
              "Write `transform(func, items, skip_none=True)` returning `[func(x) for x in items]`, but",
              "**skipping** any item that is `None` when `skip_none` is true.",
              "",
              "`transform(str.upper, ['a', None, 'b'])` → `['A', 'B']`",
              "`transform(str, ['a', None], skip_none=False)` → `['a', 'None']`"
            ]),
            starter: "def transform(func, items, skip_none=True):\n    ",
            hints: [
              "Loop, and `continue` when the item is `None` and skipping is on.",
              "Otherwise append `func(item)`."
            ],
            tests: [
              { name: "skips None by default", call: "transform(str.upper, ['a', None, 'b'])", expect: ["A", "B"] },
              { name: "includes None when told to", call: "transform(str, ['a', None], skip_none=False)", expect: ["a", "None"] },
              { name: "works with any function", call: "transform(len, ['abc', 'de'])", expect: [3, 2] },
              { name: "empty", call: "transform(len, [])", expect: [] }
            ],
            solution: L([
              "def transform(func, items, skip_none=True):",
              "    result = []",
              "    for item in items:",
              "        if item is None and skip_none:",
              "            continue",
              "        result.append(func(item))",
              "    return result"
            ])
          },
          {
            kind: "predict", title: "Call or refer", difficulty: 2,
            concepts: ["first-class"],
            prompt: L([
              "What does this print?",
              "",
              "~~~py",
              "def hello():",
              "    return 'hi'",
              "",
              "x = hello",
              "print(type(x).__name__)",
              "~~~"
            ]),
            choices: ["`str`", "`function`", "`NoneType`", "An error"],
            answer: 1,
            explain: "Without parentheses, `hello` is the function object itself, so `x` is a function. `x = hello()` would have called it and stored the string `'hi'`."
          }
        ]
      }
    ],

    checkpoint: {
      id: "m12cp", pass: 0.8,
      title: "Checkpoint: Functions II",
      items: [
        {
          kind: "code", title: "Safe default", difficulty: 3, concepts: ["mutable-default"],
          prompt: "Write `collect(item, into=None)` that appends `item` to `into` and returns it, creating a fresh list when `into` is not given. Two calls with no list must not share.",
          starter: "def collect(item, into=None):\n    ",
          tests: [
            { name: "fresh list each time", code: "assert collect('a') == ['a']\nassert collect('b') == ['b']" },
            { name: "uses a supplied list", code: "mine = [1]\nassert collect(2, mine) == [1, 2]" }
          ]
        },
        {
          kind: "predict", title: "Default evaluation", difficulty: 3, concepts: ["mutable-default"],
          prompt: "When is the default value in `def f(x=[])` created?",
          choices: [
            "Every time f is called",
            "Once, when the def statement runs",
            "The first time f is called",
            "Never — it is recreated lazily"
          ],
          answer: 1,
          explain: "Defaults are evaluated once at definition time and stored on the function object. That is why a mutable default is shared across every call."
        },
        {
          kind: "code", title: "Flexible join", difficulty: 3, concepts: ["args-kwargs"],
          prompt: "Write `path(*parts, sep='/')` joining the parts with the separator. `path('a', 'b')` → `'a/b'`. No parts gives `''`.",
          starter: "def path(*parts, sep='/'):\n    ",
          tests: [
            { name: "joins", call: "path('a', 'b', 'c')", expect: "a/b/c" },
            { name: "custom separator", call: "path('a', 'b', sep='-')", expect: "a-b" },
            { name: "empty", call: "path()", expect: "" }
          ]
        },
        {
          kind: "code", title: "Sort by last character", difficulty: 3, concepts: ["lambda", "sort-key"],
          prompt: "Write `by_last(words)` sorting words by their final character, ties keeping input order.",
          starter: "def by_last(words):\n    ",
          tests: [
            { name: "sorts by last letter", call: "by_last(['bc', 'ca', 'ab'])", expect: ["ca", "ab", "bc"] },
            { name: "empty", call: "by_last([])", expect: [] }
          ]
        },
        {
          kind: "quiz", title: "Parentheses", difficulty: 2, concepts: ["first-class"],
          prompt: "What is the difference between `sorted(items, key=len)` and `sorted(items, key=len())`?",
          choices: [
            "Nothing",
            "The first passes the function; the second calls len with no arguments and raises a TypeError",
            "The second is faster",
            "The second sorts in reverse"
          ],
          answer: 1,
          explain: "`key` wants a function to call later. `len()` calls it immediately — with no argument — which fails. No parentheses means *refer to the function*."
        }
      ]
    }
  });
})();
