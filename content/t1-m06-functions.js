/* Tier 1 · Module 6 — Functions I */
(function () {
  const L = a => a.join("\n");

  PQ.defineModule({
    id: "m06", tier: 1, order: 6, icon: "⚙️",
    title: "Functions I",
    blurb: "Name a piece of work, hand it inputs, get a value back. The unit of all real programs.",
    intro: L([
      "A function is a named, reusable piece of behaviour. Everything you build from here on is functions",
      "calling functions. The one idea that separates people who *use* functions from people who *think* in",
      "functions is the difference between `return` and `print` — and this module hammers it."
    ]),
    concepts: [
      { id: "def-function", name: "defining functions", importance: 1.6 },
      { id: "parameters", name: "parameters and arguments", importance: 1.5 },
      { id: "return-value", name: "return values", importance: 1.7 },
      { id: "return-vs-print", name: "return vs print", importance: 1.6 },
      { id: "scope-basics", name: "local scope", importance: 1.3 },
      { id: "none-value", name: "None" },
      { id: "docstrings", name: "docstrings" },
      { id: "decomposition", name: "breaking problems down", importance: 1.4 }
    ],

    lessons: [
      {
        id: "m06l1", title: "Defining and calling", minutes: 10,
        concepts: ["def-function", "parameters", "docstrings"],
        content: L([
          "## Making your own tool",
          "",
          "~~~py",
          "def greet():",
          "    print('Hello!')",
          "",
          "greet()",
          "greet()",
          "~~~",
          "~~~out",
          "Hello!",
          "Hello!",
          "~~~",
          "",
          "Two separate things are happening:",
          "",
          "- **Defining** (`def greet(): ...`) writes the recipe down. Nothing runs.",
          "- **Calling** (`greet()`) actually does it.",
          "",
          "Define once, call as often as you like. Forgetting the `()` is a classic slip:",
          "",
          "~~~py",
          "greet     # this just refers to the function; nothing happens",
          "greet()   # this runs it",
          "~~~",
          "",
          "## Parameters let a function vary",
          "",
          "~~~py",
          "def greet(name):",
          "    print(f'Hello, {name}!')",
          "",
          "greet('Ada')",
          "greet('Grace')",
          "~~~",
          "~~~out",
          "Hello, Ada!",
          "Hello, Grace!",
          "~~~",
          "",
          "- `name` in the `def` line is a **parameter** — a placeholder.",
          "- `'Ada'` at the call site is an **argument** — the real value.",
          "",
          "Several parameters are separated by commas, and they are matched **by position**:",
          "",
          "~~~py",
          "def describe(animal, sound):",
          "    print(f'The {animal} says {sound}')",
          "",
          "describe('dog', 'woof')     # The dog says woof",
          "describe('woof', 'dog')     # The woof says dog  -- order matters!",
          "~~~",
          "",
          "You can also pass them by name, which is clearer for anything non-obvious:",
          "",
          "~~~py",
          "describe(animal='dog', sound='woof')",
          "~~~",
          "",
          "## Docstrings",
          "",
          "A string on the first line of a function is its documentation:",
          "",
          "~~~py",
          "def area_of_circle(radius):",
          "    \"\"\"Return the area of a circle with the given radius.\"\"\"",
          "    return 3.14159 * radius ** 2",
          "~~~",
          "",
          "Write it as a sentence saying what the function *returns* or *does*, not how. Tools, editors and",
          "`help(area_of_circle)` all read it.",
          "",
          ":::tip Define before you call",
          "Python runs top to bottom, so the `def` must be executed before the call. Put your functions at the top",
          "of the file and the code that uses them at the bottom.",
          ":::"
        ]),
        exercises: [
          {
            kind: "code", title: "Your first function", difficulty: 1,
            concepts: ["def-function"],
            prompt: L([
              "Define a function called `shout` that takes one parameter `word` and prints it in capitals with",
              "an exclamation mark.",
              "",
              "`shout('hello')` must print `HELLO!`",
              "",
              "Call it once with `'hello'` at the end of your file. `word.upper()` gives the capitalised version."
            ]),
            starter: "def shout(word):\n    ",
            hints: ["`print(f'{word.upper()}!')` inside the function.", "Then call `shout('hello')` at the bottom, unindented."],
            tests: [
              { name: "shout exists and is a function", code: "assert callable(shout), 'define a function named shout'" },
              { name: "prints HELLO!", out: "HELLO!" },
              { name: "works for any word", code: "import io, sys\nbuf = io.StringIO()\nold = sys.stdout\nsys.stdout = buf\nshout('bye')\nsys.stdout = old\nassert buf.getvalue().strip() == 'BYE!', 'shout(\"bye\") should print BYE!'" }
            ],
            solution: "def shout(word):\n    print(f'{word.upper()}!')\n\nshout('hello')"
          },
          {
            kind: "code", title: "Two parameters", difficulty: 2,
            concepts: ["parameters"],
            prompt: L([
              "Define `describe_pet(name, kind)` that prints:",
              "",
              "~~~text",
              "Rex is a dog",
              "~~~",
              "",
              "Then call it twice: once for Rex the dog, once for Mia the cat."
            ]),
            starter: "",
            hints: ["Two parameters, comma separated.", "Arguments match by position, so `describe_pet('Rex', 'dog')`."],
            tests: [
              { name: "both pets printed", out_lines: ["Rex is a dog", "Mia is a cat"] },
              { name: "parameters are in the right order", code: "import io, sys\nbuf = io.StringIO()\nold = sys.stdout\nsys.stdout = buf\ndescribe_pet('Bo', 'parrot')\nsys.stdout = old\nassert buf.getvalue().strip() == 'Bo is a parrot'" }
            ],
            solution: "def describe_pet(name, kind):\n    print(f'{name} is a {kind}')\n\ndescribe_pet('Rex', 'dog')\ndescribe_pet('Mia', 'cat')"
          },
          {
            kind: "debug", title: "Defined but never called", difficulty: 1,
            concepts: ["def-function"],
            prompt: "This program produces no output at all. Fix it so it prints `Ready`.",
            starter: "def start():\n    print('Ready')",
            hints: ["Defining a function does not run it.", "Add `start()` on its own line at the bottom."],
            tests: [{ name: "prints Ready", out_exact: "Ready" }],
            solution: "def start():\n    print('Ready')\n\nstart()"
          },
          {
            kind: "predict", title: "Order of arguments", difficulty: 2,
            concepts: ["parameters"],
            prompt: L([
              "What is printed?",
              "",
              "~~~py",
              "def divide(a, b):",
              "    print(a / b)",
              "",
              "divide(2, 10)",
              "~~~"
            ]),
            choices: ["`5.0`", "`0.2`", "`2`", "An error"],
            answer: 1,
            explain: "Arguments bind by position: `a` becomes `2` and `b` becomes `10`, so it computes `2 / 10`. When the order is easy to get wrong, call it with names: `divide(a=10, b=2)`."
          }
        ]
      },

      {
        id: "m06l2", title: "return: the point of functions", minutes: 12,
        concepts: ["return-value", "return-vs-print", "none-value"],
        content: L([
          "## Printing is not returning",
          "",
          "This is the most important distinction in the module, and possibly in Tier 1.",
          "",
          "~~~py",
          "def add_printing(a, b):",
          "    print(a + b)",
          "",
          "def add_returning(a, b):",
          "    return a + b",
          "~~~",
          "",
          "They look similar and are completely different:",
          "",
          "~~~py",
          "x = add_printing(2, 3)    # prints 3? no -- prints 5, and x becomes None",
          "y = add_returning(2, 3)   # prints nothing, and y becomes 5",
          "",
          "print(x)   # None",
          "print(y)   # 5",
          "print(add_returning(2, 3) * 10)   # 50",
          "print(add_printing(2, 3) * 10)    # TypeError!",
          "~~~",
          "",
          "| | `print` | `return` |",
          "|---|---|---|",
          "| Who sees it | a human, on screen | the rest of your program |",
          "| Can be stored | no | yes |",
          "| Can be used in maths | no | yes |",
          "| Can be tested | awkwardly | trivially |",
          "",
          ":::why The rule",
          "**Functions should compute and return. Printing is for the outer layer of your program.**",
          "",
          "A function that prints can only ever be used one way. A function that returns can be printed, stored,",
          "totalled, sorted, tested and reused. Every automated check in this course calls your functions and",
          "inspects what comes back.",
          ":::",
          "",
          "## return ends the function immediately",
          "",
          "~~~py",
          "def check(n):",
          "    if n < 0:",
          "        return 'negative'",
          "    return 'non-negative'",
          "",
          "print(check(-5))",
          "~~~",
          "~~~out",
          "negative",
          "~~~",
          "",
          "Once a `return` runs, the function is over. Nothing after it executes. That is what makes early returns",
          "such a clean way to handle special cases — no `else` needed.",
          "",
          "## Functions that return nothing",
          "",
          "A function with no `return` gives back `None`:",
          "",
          "~~~py",
          "def log(message):",
          "    print(f'[LOG] {message}')",
          "",
          "result = log('saved')",
          "print(result)",
          "~~~",
          "~~~out",
          "[LOG] saved",
          "None",
          "~~~",
          "",
          "`None` is a real value meaning *nothing here*. Seeing an unexpected `None` almost always means a",
          "missing `return`.",
          "",
          ":::trap The silent None",
          "~~~py",
          "def double(n):",
          "    result = n * 2      # computed... and thrown away",
          "",
          "print(double(5))        # None",
          "~~~",
          "The function does the work and then forgets to hand it back. No error, just `None` where you wanted `10`.",
          ":::"
        ]),
        exercises: [
          {
            kind: "code", title: "Return, do not print", difficulty: 2,
            concepts: ["return-value", "return-vs-print"],
            prompt: L([
              "Write `square(n)` that **returns** `n` multiplied by itself.",
              "",
              "The function itself must not print anything. The checks call it directly."
            ]),
            starter: "def square(n):\n    ",
            hints: ["`return n * n`", "No `print` inside the function."],
            forbids: [{ re: "def square[\\s\\S]*?print\\(", msg: "square() must not print" }],
            tests: [
              { name: "square(4) is 16", call: "square(4)", expect: 16 },
              { name: "square(0) is 0", call: "square(0)", expect: 0 },
              { name: "square(-3) is 9", call: "square(-3)", expect: 9 },
              { name: "the result is usable in maths", call: "square(3) + square(4)", expect: 25 }
            ],
            solution: "def square(n):\n    return n * n"
          },
          {
            kind: "debug", title: "Where did my value go?", difficulty: 2,
            concepts: ["return-vs-print", "none-value"],
            prompt: L([
              "This prints `None` instead of `21`. Fix the function — do not change the last two lines."
            ]),
            starter: L([
              "def add_tax(price):",
              "    total = price * 1.05",
              "",
              "result = add_tax(20)",
              "print(round(result))"
            ]),
            hints: ["The function computes `total` and never gives it back.", "Add `return total`."],
            tests: [
              { name: "prints 21", out_exact: "21" },
              { name: "add_tax returns a number", code: "assert add_tax(100) is not None and abs(add_tax(100) - 105) < 1e-9" }
            ],
            solution: "def add_tax(price):\n    total = price * 1.05\n    return total\n\nresult = add_tax(20)\nprint(round(result))",
            takeaway: "An unexpected `None` is almost always a missing `return`. It is the first thing to check."
          },
          {
            kind: "code", title: "Early return", difficulty: 2,
            concepts: ["return-value"],
            prompt: L([
              "Write `sign(n)` that returns the string `'positive'`, `'negative'` or `'zero'`.",
              "",
              "Use early returns — no `else` branches. The checks forbid `else`."
            ]),
            starter: "def sign(n):\n    ",
            forbids: [{ re: "\\belse\\b", msg: "Use early returns instead of else" }],
            hints: [
              "`if n > 0: return 'positive'`",
              "Because `return` exits immediately, the next `if` only runs when the first was false.",
              "The last line needs no condition at all."
            ],
            tests: [
              { name: "positive", call: "sign(5)", expect: "positive" },
              { name: "negative", call: "sign(-2)", expect: "negative" },
              { name: "zero", call: "sign(0)", expect: "zero" }
            ],
            solution: "def sign(n):\n    if n > 0:\n        return 'positive'\n    if n < 0:\n        return 'negative'\n    return 'zero'"
          },
          {
            kind: "code", title: "Compose two functions", difficulty: 3,
            concepts: ["return-value", "decomposition"],
            prompt: L([
              "Write two functions:",
              "",
              "- `celsius_to_fahrenheit(c)` returns `c * 9 / 5 + 32`",
              "- `describe_temperature(c)` returns a sentence like `20C is 68.0F`",
              "",
              "`describe_temperature` must **call** `celsius_to_fahrenheit` rather than repeating the formula."
            ]),
            starter: "def celsius_to_fahrenheit(c):\n    \n\ndef describe_temperature(c):\n    ",
            requires: [{ re: "def describe_temperature[\\s\\S]*celsius_to_fahrenheit\\(", msg: "describe_temperature must call celsius_to_fahrenheit" }],
            hints: [
              "The second function calls the first and uses the result in an f-string.",
              "`return f'{c}C is {celsius_to_fahrenheit(c)}F'`"
            ],
            tests: [
              { name: "0C is 32F", call: "celsius_to_fahrenheit(0)", expect: 32 },
              { name: "100C is 212F", call: "celsius_to_fahrenheit(100)", expect: 212 },
              { name: "the sentence is right", call: "describe_temperature(20)", expect: "20C is 68.0F" },
              { name: "works for another value", call: "describe_temperature(0)", expect: "0C is 32.0F" }
            ],
            solution: L([
              "def celsius_to_fahrenheit(c):",
              "    return c * 9 / 5 + 32",
              "",
              "def describe_temperature(c):",
              "    return f'{c}C is {celsius_to_fahrenheit(c)}F'"
            ]),
            takeaway: "One fact, one place. When the conversion formula changes, there is exactly one line to edit."
          }
        ]
      },

      {
        id: "m06l3", title: "Scope and decomposition", minutes: 11,
        concepts: ["scope-basics", "decomposition"],
        content: L([
          "## Variables inside a function are private",
          "",
          "~~~py",
          "def calculate():",
          "    result = 42",
          "    return result",
          "",
          "calculate()",
          "print(result)     # NameError: name 'result' is not defined",
          "~~~",
          "",
          "`result` is **local**: it is created when the function starts and destroyed when it returns.",
          "The outside world never sees it. That is a feature — it means you can use `total` inside twenty",
          "different functions without them interfering.",
          "",
          "## Reading outer variables",
          "",
          "A function *can* read names from outside:",
          "",
          "~~~py",
          "TAX_RATE = 0.2",
          "",
          "def with_tax(price):",
          "    return price * (1 + TAX_RATE)   # reads the global",
          "~~~",
          "",
          "That is fine for constants (written in `CAPITALS` by convention). But **assigning** to an outer",
          "variable does not work the way you expect:",
          "",
          "~~~py",
          "count = 0",
          "",
          "def increment():",
          "    count = count + 1     # UnboundLocalError",
          "",
          "increment()",
          "~~~",
          "",
          "Assigning to `count` anywhere in the function makes it local for the *whole* function, so the read on",
          "the right-hand side finds nothing. Python has a `global` keyword to force it — and you should almost",
          "never use it. Pass values in, return values out:",
          "",
          "~~~py",
          "def increment(count):",
          "    return count + 1",
          "",
          "count = increment(count)",
          "~~~",
          "",
          ":::why Why globals are avoided",
          "A function that only uses its parameters can be understood, tested and moved on its own. A function that",
          "reaches out and mutates shared state can only be understood by reading the whole program. This is the",
          "difference between code you can maintain and code you are afraid of.",
          ":::",
          "",
          "## Decomposition",
          "",
          "Given a task like *print a receipt*, resist writing one 40-line block. Name the pieces:",
          "",
          "~~~py",
          "def line_total(quantity, price):",
          "    return quantity * price",
          "",
          "def with_tax(amount, rate):",
          "    return amount * (1 + rate)",
          "",
          "def format_money(amount):",
          "    return f'{amount:.2f}'",
          "",
          "subtotal = line_total(3, 2.5)",
          "print(format_money(with_tax(subtotal, 0.2)))",
          "~~~",
          "",
          "Each function does one thing, is 1–3 lines, and can be checked on its own. When something is wrong,",
          "you can test each piece separately instead of staring at 40 lines.",
          "",
          "**A good rule:** if you cannot describe what a function does in one sentence without saying \"and\",",
          "it is doing too much."
        ]),
        exercises: [
          {
            kind: "debug", title: "Local means local", difficulty: 2,
            concepts: ["scope-basics"],
            prompt: L([
              "This crashes with a `NameError`. Fix it so it prints `50` — by returning the value properly,",
              "not by using `global`."
            ]),
            starter: L([
              "def compute():",
              "    answer = 50",
              "",
              "compute()",
              "print(answer)"
            ]),
            forbids: [{ contains: "global", msg: "Solve it with return, not global" }],
            hints: ["Return `answer` from the function.", "Capture it at the call site: `answer = compute()`."],
            tests: [
              { name: "prints 50", out_exact: "50" },
              { name: "compute returns the value", call: "compute()", expect: 50 }
            ],
            solution: "def compute():\n    answer = 50\n    return answer\n\nanswer = compute()\nprint(answer)"
          },
          {
            kind: "predict", title: "Shadowing", difficulty: 3,
            concepts: ["scope-basics"],
            prompt: L([
              "What is printed?",
              "",
              "~~~py",
              "name = 'outer'",
              "",
              "def change():",
              "    name = 'inner'",
              "",
              "change()",
              "print(name)",
              "~~~"
            ]),
            choices: ["`inner`", "`outer`", "`None`", "An error"],
            answer: 1,
            explain: "`name = 'inner'` creates a **new local** variable that happens to share a name. It vanishes when the function returns; the global `name` was never touched."
          },
          {
            kind: "refactor", title: "Break it into functions", difficulty: 3,
            concepts: ["decomposition", "return-value"],
            prompt: L([
              "This works but is one undifferentiated block. Split it into three functions and use them:",
              "",
              "- `rectangle_area(w, h)` → returns the area",
              "- `rectangle_perimeter(w, h)` → returns the perimeter",
              "- `describe_rectangle(w, h)` → returns `'6x4: area 24, perimeter 20'`",
              "",
              "Then print `describe_rectangle(6, 4)`."
            ]),
            starter: L([
              "width = 6",
              "height = 4",
              "area = width * height",
              "perimeter = 2 * (width + height)",
              "print(f'{width}x{height}: area {area}, perimeter {perimeter}')"
            ]),
            hints: [
              "Each of the first two functions is a single `return` line.",
              "`describe_rectangle` calls the other two and builds the f-string.",
              "Do not print inside the functions — return, then print once at the bottom."
            ],
            tests: [
              { name: "area function", call: "rectangle_area(6, 4)", expect: 24 },
              { name: "perimeter function", call: "rectangle_perimeter(6, 4)", expect: 20 },
              { name: "description", call: "describe_rectangle(6, 4)", expect: "6x4: area 24, perimeter 20" },
              { name: "works for another shape", call: "describe_rectangle(2, 3)", expect: "2x3: area 6, perimeter 10" },
              { name: "prints the description once", out_exact: "6x4: area 24, perimeter 20" }
            ],
            solution: L([
              "def rectangle_area(w, h):",
              "    return w * h",
              "",
              "def rectangle_perimeter(w, h):",
              "    return 2 * (w + h)",
              "",
              "def describe_rectangle(w, h):",
              "    return f'{w}x{h}: area {rectangle_area(w, h)}, perimeter {rectangle_perimeter(w, h)}'",
              "",
              "print(describe_rectangle(6, 4))"
            ])
          },
          {
            kind: "code", title: "Build a small toolkit", difficulty: 4,
            concepts: ["decomposition", "return-value", "loop-patterns"],
            prompt: L([
              "Write three functions that each take a whole number `n`:",
              "",
              "- `is_even(n)` → `True` or `False`",
              "- `count_even_up_to(n)` → how many numbers from 1 to `n` inclusive are even",
              "- `summarise(n)` → a string like `'1..10 contains 5 even numbers'`",
              "",
              "`count_even_up_to` must use `is_even`, and `summarise` must use `count_even_up_to`."
            ]),
            starter: "def is_even(n):\n    \n\ndef count_even_up_to(n):\n    \n\ndef summarise(n):\n    ",
            requires: [
              { re: "def count_even_up_to[\\s\\S]*is_even\\(", msg: "count_even_up_to must use is_even" },
              { re: "def summarise[\\s\\S]*count_even_up_to\\(", msg: "summarise must use count_even_up_to" }
            ],
            hints: [
              "`is_even` is one line: `return n % 2 == 0`.",
              "`count_even_up_to` is a counting loop over `range(1, n + 1)`.",
              "`summarise` returns `f'1..{n} contains {count_even_up_to(n)} even numbers'`."
            ],
            tests: [
              { name: "is_even works", call: "[is_even(4), is_even(7)]", expect: [true, false] },
              { name: "counts to 10", call: "count_even_up_to(10)", expect: 5 },
              { name: "counts to 1", call: "count_even_up_to(1)", expect: 0 },
              { name: "counts to 99", call: "count_even_up_to(99)", expect: 49 },
              { name: "summary sentence", call: "summarise(10)", expect: "1..10 contains 5 even numbers" }
            ],
            solution: L([
              "def is_even(n):",
              "    return n % 2 == 0",
              "",
              "def count_even_up_to(n):",
              "    count = 0",
              "    for i in range(1, n + 1):",
              "        if is_even(i):",
              "            count += 1",
              "    return count",
              "",
              "def summarise(n):",
              "    return f'1..{n} contains {count_even_up_to(n)} even numbers'"
            ]),
            takeaway: "Layers: a tiny fact at the bottom, a loop in the middle, presentation at the top. Each layer is independently testable — which is exactly how professional code is built."
          }
        ]
      }
    ],

    checkpoint: {
      id: "m06cp", pass: 0.8,
      title: "Checkpoint: Functions I",
      items: [
        {
          kind: "code", title: "Return a value", difficulty: 2, concepts: ["return-value"],
          prompt: "Write `triple(n)` that returns `n * 3`. It must not print.",
          starter: "def triple(n):\n    ",
          tests: [
            { name: "triple(5) is 15", call: "triple(5)", expect: 15 },
            { name: "usable in an expression", call: "triple(2) + triple(3)", expect: 15 },
            { name: "prints nothing", out_exact: "" }
          ]
        },
        {
          kind: "predict", title: "print vs return", difficulty: 3, concepts: ["return-vs-print"],
          prompt: "What is printed?\n\n~~~py\ndef f(x):\n    print(x * 2)\n\nresult = f(5)\nprint(result)\n~~~",
          choices: ["`10` then `10`", "`10` then `None`", "`None` then `10`", "just `10`"],
          answer: 1,
          explain: "The function prints `10` itself, but returns nothing — so `result` is `None`, and the second print shows `None`."
        },
        {
          kind: "code", title: "Longest of three", difficulty: 3, concepts: ["return-value", "elif"],
          prompt: "Write `longest(a, b, c)` returning the longest of three strings. If there is a tie, return the earliest of the tied ones. Do not use `max`.",
          starter: "def longest(a, b, c):\n    ",
          forbids: [{ contains: "max(", msg: "Do it by hand" }],
          tests: [
            { name: "picks the longest", call: "longest('ab', 'abcd', 'abc')", expect: "abcd" },
            { name: "first wins a tie", call: "longest('aa', 'bb', 'c')", expect: "aa" },
            { name: "third can win", call: "longest('a', 'bb', 'ccc')", expect: "ccc" }
          ]
        },
        {
          kind: "debug", title: "Missing return", difficulty: 2, concepts: ["none-value"],
          prompt: "`half(10)` should give `5.0` but gives `None`. Fix it.",
          starter: "def half(n):\n    n / 2\n\nprint(half(10))",
          tests: [
            { name: "half returns a number", call: "half(10)", expect: 5.0 },
            { name: "prints 5.0", out_exact: "5.0" }
          ]
        },
        {
          kind: "quiz", title: "Scope", difficulty: 3, concepts: ["scope-basics"],
          prompt: "A function assigns to a variable that also exists outside it. What happens to the outer variable?",
          choices: [
            "It is updated",
            "Nothing — a separate local variable is created",
            "A SyntaxError is raised",
            "It becomes None"
          ],
          answer: 1,
          explain: "Assignment inside a function creates a local name, shadowing anything outside. Changing outer state requires passing values in and returning them out — which is what you want anyway."
        }
      ]
    }
  });
})();
