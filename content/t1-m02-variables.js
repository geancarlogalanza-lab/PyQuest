/* Tier 1 · Module 2 — Variables & Types */
(function () {
  const L = a => a.join("\n");

  PQ.defineModule({
    id: "m02", tier: 1, order: 2, icon: "📦",
    title: "Variables & Types",
    blurb: "Store things, name them well, and know what kind of thing you are holding.",
    intro: L([
      "A program that cannot remember anything can only print. Variables give your program a memory.",
      "Types tell you what you are allowed to do with what is in that memory — and most beginner bugs are",
      "type confusion in disguise."
    ]),
    concepts: [
      { id: "variables", name: "variables", importance: 1.5 },
      { id: "assignment", name: "assignment", importance: 1.3 },
      { id: "naming", name: "naming things", importance: 1.1 },
      { id: "int-float", name: "int and float", importance: 1.2 },
      { id: "str-type", name: "the str type", importance: 1.2 },
      { id: "bool-type", name: "the bool type" },
      { id: "type-fn", name: "type()" },
      { id: "casting", name: "type conversion", importance: 1.4 },
      { id: "input-fn", name: "input()", importance: 1.3 },
      { id: "fstrings", name: "f-strings", importance: 1.4 }
    ],

    lessons: [
      {
        id: "m02l1", title: "Names for things", minutes: 10,
        concepts: ["variables", "assignment", "naming"],
        content: L([
          "## Storing a value",
          "",
          "~~~py",
          "score = 0",
          "print(score)",
          "~~~",
          "~~~out",
          "0",
          "~~~",
          "",
          "The `=` is **not** a claim that two things are equal. It is an instruction: *evaluate the right side,",
          "then attach the name on the left to the result.* Right to left, always.",
          "",
          "### Reassignment",
          "",
          "A variable can be pointed at something new whenever you like:",
          "",
          "~~~py",
          "score = 0",
          "score = 10",
          "score = score + 5",
          "print(score)",
          "~~~",
          "~~~out",
          "15",
          "~~~",
          "",
          "That third line looks like nonsense in maths and is completely normal in programming. Read it right to left:",
          "*work out `score + 5`, which is `15`; now let `score` mean `15`.*",
          "",
          ":::tip The shorthand you will use daily",
          "`score = score + 5` can be written `score += 5`. The same works for `-=`, `*=`, `/=`.",
          ":::",
          "",
          "### Using a variable before it exists",
          "",
          "~~~py",
          "print(total)",
          "total = 5",
          "~~~",
          "",
          "This is a `NameError`. Python runs top to bottom and has not reached line 2 yet. Order is not a suggestion.",
          "",
          "## Naming",
          "",
          "The rules Python enforces:",
          "",
          "- letters, digits and underscores only",
          "- cannot start with a digit",
          "- case sensitive, so `score` and `Score` are different variables",
          "",
          "The conventions professionals enforce, which matter more:",
          "",
          "| Instead of | Write | Because |",
          "|---|---|---|",
          "| `x`, `a`, `tmp` | `total_price` | code is read far more often than written |",
          "| `TotalPrice` | `total_price` | Python uses `snake_case` for variables |",
          "| `l`, `O` | anything else | they look like `1` and `0` |",
          "| `list`, `str`, `sum` | `items`, `text`, `total` | these shadow built-in tools |",
          "",
          ":::trap Shadowing built-ins",
          "Writing `list = [1, 2, 3]` works — and then `list(...)` anywhere later in the program breaks with",
          "*TypeError: list object is not callable*, because you replaced the built-in tool with your own data.",
          ":::"
        ]),
        exercises: [
          {
            kind: "code", title: "A running total", difficulty: 1,
            concepts: ["variables", "assignment"],
            prompt: L([
              "Create a variable `total` starting at `0`, then add `12`, then add `30`, then print it.",
              "",
              "Use three separate steps, not one sum — you are practising reassignment."
            ]),
            starter: "total = 0\n",
            hints: ["`total = total + 12` or the shorthand `total += 12`.", "Print at the end, not after each step."],
            tests: [
              { name: "total ends at 42", call: "total", expect: 42 },
              { name: "prints 42", out_exact: "42" }
            ],
            solution: "total = 0\ntotal += 12\ntotal += 30\nprint(total)"
          },
          {
            kind: "predict", title: "Right to left", difficulty: 2,
            concepts: ["assignment"],
            prompt: L([
              "What is printed?",
              "",
              "~~~py",
              "a = 3",
              "b = a",
              "a = 10",
              "print(b)",
              "~~~"
            ]),
            choices: ["`10`", "`3`", "`13`", "An error"],
            answer: 1,
            explain: L([
              "Line 2 evaluates `a` **right now**, getting `3`, and attaches the name `b` to that value.",
              "It does not create a permanent link between `a` and `b`. Changing `a` afterwards has no effect on `b`."
            ])
          },
          {
            kind: "debug", title: "Used too early", difficulty: 2,
            concepts: ["variables", "read-errors"],
            prompt: "Run it, read the error, then fix it so it prints `Welcome, Ada`.",
            starter: "print('Welcome,', name)\nname = 'Ada'",
            hints: ["The error names the exact problem.", "Python has not reached the line that creates `name` yet."],
            tests: [{ name: "prints the greeting", out_exact: "Welcome, Ada" }],
            solution: "name = 'Ada'\nprint('Welcome,', name)"
          },
          {
            kind: "refactor", title: "Name it properly", difficulty: 2,
            concepts: ["naming"],
            prompt: L([
              "This code works but is hostile to read, and one name shadows a built-in.",
              "",
              "Rewrite it so it prints the same number using clear `snake_case` names and no shadowing.",
              "The checks require the variables `price_per_item`, `item_count` and `total_price`."
            ]),
            starter: "x = 4\nsum = 3\nl = x * sum\nprint(l)",
            hints: [
              "`x` is the price of one item, `sum` is how many there are.",
              "Do not use `sum` as a variable — it is a built-in function."
            ],
            forbids: [{ re: "^\\s*sum\\s*=", msg: "Do not shadow the built-in sum" }],
            tests: [
              { name: "price_per_item exists", call: "price_per_item", expect: 4 },
              { name: "item_count exists", call: "item_count", expect: 3 },
              { name: "total_price is correct", call: "total_price", expect: 12 },
              { name: "prints 12", out_exact: "12" }
            ],
            solution: "price_per_item = 4\nitem_count = 3\ntotal_price = price_per_item * item_count\nprint(total_price)",
            takeaway: "Good names remove the need for comments. `total_price` needs no explanation; `l` needs a paragraph."
          }
        ]
      },

      {
        id: "m02l2", title: "Kinds of data", minutes: 10,
        concepts: ["int-float", "str-type", "bool-type", "type-fn"],
        content: L([
          "## Four types carry most of Python",
          "",
          "| Type | Looks like | Holds |",
          "|---|---|---|",
          "| `int` | `42`, `-7`, `0` | whole numbers, any size |",
          "| `float` | `3.14`, `-0.5`, `2.0` | numbers with a decimal point |",
          "| `str` | `'hi'`, `\"hi\"` | text |",
          "| `bool` | `True`, `False` | yes / no |",
          "",
          "~~~py",
          "count = 42",
          "price = 19.99",
          "label = 'widget'",
          "in_stock = True",
          "",
          "print(type(count), type(price), type(label), type(in_stock))",
          "~~~",
          "~~~out",
          "<class 'int'> <class 'float'> <class 'str'> <class 'bool'>",
          "~~~",
          "",
          "`type()` is a debugging tool, not something you scatter through finished code. When something behaves",
          "strangely, printing the type is usually the fastest way to see why.",
          "",
          "### int vs float",
          "",
          "`2` and `2.0` are equal in value but different types. Dividing with `/` **always** gives a float:",
          "",
          "~~~py",
          "print(10 / 2)",
          "print(type(10 / 2))",
          "~~~",
          "~~~out",
          "5.0",
          "<class 'float'>",
          "~~~",
          "",
          ":::trap Floats are approximations",
          "~~~py",
          "print(0.1 + 0.2)",
          "~~~",
          "prints `0.30000000000000004`. This is not a Python bug — it is how binary fractions work in every",
          "mainstream language. Never compare floats with `==` for exactness, and never store money as a float.",
          ":::",
          "",
          "### bool",
          "",
          "`True` and `False` are capitalised, and they are the results of comparisons:",
          "",
          "~~~py",
          "print(5 > 3)",
          "print(5 == 3)",
          "print(type(5 > 3))",
          "~~~",
          "~~~out",
          "True",
          "False",
          "<class 'bool'>",
          "~~~",
          "",
          "### Everything is an object",
          "",
          "In Python, a value carries its own type with it. The variable is just a label; the type belongs to the",
          "value. That is why you never declare types to create a variable — but you very much need to know what",
          "type a value is before you use it."
        ]),
        exercises: [
          {
            kind: "code", title: "One of each", difficulty: 1,
            concepts: ["int-float", "str-type", "bool-type"],
            prompt: L([
              "Create four variables:",
              "",
              "- `age` holding the whole number `30`",
              "- `height` holding `1.75`",
              "- `city` holding the text `Lagos`",
              "- `is_student` holding false",
              "",
              "Print nothing — the checks read the variables directly."
            ]),
            starter: "",
            hints: ["`False` starts with a capital F.", "Text needs quotes; numbers do not."],
            tests: [
              { name: "age is the int 30", code: "assert age == 30 and isinstance(age, int), 'age must be the whole number 30, not text'" },
              { name: "height is 1.75", call: "height", expect: 1.75 },
              { name: "city is Lagos", call: "city", expect: "Lagos" },
              { name: "is_student is False", code: "assert is_student is False, 'is_student must be exactly False'" }
            ],
            solution: "age = 30\nheight = 1.75\ncity = 'Lagos'\nis_student = False"
          },
          {
            kind: "predict", title: "What type comes out?", difficulty: 2,
            concepts: ["int-float"],
            prompt: L([
              "What does this print?",
              "",
              "~~~py",
              "print(8 / 4)",
              "~~~"
            ]),
            choices: ["`2`", "`2.0`", "`4`", "`2.00`"],
            answer: 1,
            explain: "`/` is *true division* and always produces a `float`, even when the result is a whole number. If you want an `int`, use `//` (floor division) or wrap it in `int(...)`."
          },
          {
            kind: "code", title: "Type detective", difficulty: 2,
            concepts: ["type-fn"],
            prompt: L([
              "Four values are given. Print the **name** of each one's type, one per line, in order:",
              "",
              "~~~text",
              "int",
              "str",
              "float",
              "bool",
              "~~~",
              "",
              "`type(x)` prints as `<class 'int'>`, which is not what we want. `type(x).__name__` gives you just `int`."
            ]),
            starter: "a = 7\nb = '7'\nc = 7.0\nd = True\n\n# print the four type names below\n",
            hints: [
              "`print(type(a).__name__)`",
              "Four print lines, in the order a, b, c, d."
            ],
            tests: [
              { name: "prints the four type names in order", out_lines: ["int", "str", "float", "bool"] }
            ],
            solution: "a = 7\nb = '7'\nc = 7.0\nd = True\n\nprint(type(a).__name__)\nprint(type(b).__name__)\nprint(type(c).__name__)\nprint(type(d).__name__)",
            takeaway: "`'7'` and `7` look identical when printed and behave completely differently. Printing the type is how you tell them apart."
          },
          {
            kind: "debug", title: "The float surprise", difficulty: 3,
            concepts: ["int-float"],
            prompt: L([
              "This is supposed to print `True` but prints `False`. Do not change the arithmetic — fix the **comparison**",
              "so it correctly reports that the two sides are (as good as) equal.",
              "",
              "Hint: comparing floats for exact equality is the bug."
            ]),
            starter: "total = 0.1 + 0.2\nprint(total == 0.3)",
            hints: [
              "Print `total` first and look at it closely.",
              "`math.isclose(a, b)` is the correct tool for comparing floats.",
              "`import math` at the top, then `print(math.isclose(total, 0.3))`."
            ],
            tests: [
              { name: "prints True", out_exact: "True" },
              { name: "still computes 0.1 + 0.2", code: "assert abs(total - 0.3) < 1e-9" }
            ],
            solution: "import math\n\ntotal = 0.1 + 0.2\nprint(math.isclose(total, 0.3))",
            takeaway: "Two floats that should be equal often differ in the last bit. `math.isclose` is the professional answer."
          }
        ]
      },

      {
        id: "m02l3", title: "Converting between types", minutes: 9,
        concepts: ["casting", "int-float", "str-type"],
        content: L([
          "## Python will not guess",
          "",
          "~~~py",
          "age = '30'",
          "print(age + 1)",
          "~~~",
          "~~~out",
          "TypeError: can only concatenate str (not \"int\") to str",
          "~~~",
          "",
          "Some languages would quietly turn `'30'` into `30`. Python refuses, because guessing is how silent",
          "data-corruption bugs are born. You must say what you mean.",
          "",
          "### The three conversion functions",
          "",
          "~~~py",
          "int('30')      # 30",
          "float('3.5')   # 3.5",
          "str(30)        # '30'",
          "int(3.9)       # 3   -- truncates toward zero, does NOT round",
          "int('3.9')     # ValueError!",
          "~~~",
          "",
          "Two of those deserve attention:",
          "",
          "- `int(3.9)` gives `3`. It chops, it does not round. Use `round(3.9)` if you want `4`.",
          "- `int('3.9')` **fails**. `int()` on a string only accepts something that is entirely digits",
          "  (with an optional sign). Go through `float` first: `int(float('3.9'))`.",
          "",
          "### What blows up",
          "",
          "~~~py",
          "int('twelve')   # ValueError: invalid literal for int() with base 10: 'twelve'",
          "int('')         # ValueError",
          "int('12 ')      # fine, surrounding whitespace is ignored",
          "~~~",
          "",
          ":::why This is where real bugs live",
          "Data from files, forms, APIs and users arrives as **text**. Almost every real program starts by converting",
          "text into the types it actually needs — and almost every crash in a beginner program happens because it did not.",
          ":::",
          "",
          "### Booleans convert too",
          "",
          "~~~py",
          "print(int(True), int(False))",
          "print(bool(0), bool(3), bool(''), bool('hi'))",
          "~~~",
          "~~~out",
          "1 0",
          "False True False True",
          "~~~",
          "",
          "Zero, empty text and empty containers are *falsy*; nearly everything else is *truthy*. That fact powers",
          "a lot of clean Python you will write later."
        ]),
        exercises: [
          {
            kind: "debug", title: "Text pretending to be a number", difficulty: 2,
            concepts: ["casting"],
            prompt: "Fix this so it prints `35` — the sum of the two quantities.",
            starter: "quantity_a = '20'\nquantity_b = 15\nprint(quantity_a + quantity_b)",
            hints: [
              "`quantity_a` is a string, and `+` between a string and an int is not allowed.",
              "Convert with `int(quantity_a)`."
            ],
            tests: [{ name: "prints 35", out_exact: "35" }],
            solution: "quantity_a = '20'\nquantity_b = 15\nprint(int(quantity_a) + quantity_b)"
          },
          {
            kind: "predict", title: "Chop, not round", difficulty: 2,
            concepts: ["casting"],
            prompt: L([
              "What is printed?",
              "",
              "~~~py",
              "print(int(7.99), round(7.99))",
              "~~~"
            ]),
            choices: ["`8 8`", "`7 8`", "`7 7`", "`8 7`"],
            answer: 1,
            explain: "`int()` truncates toward zero, so `7.99` becomes `7`. `round()` rounds to the nearest whole number, giving `8`. Mixing these up quietly loses a penny per transaction — a classic real-world bug."
          },
          {
            kind: "code", title: "Safe price parser", difficulty: 3,
            concepts: ["casting"],
            prompt: L([
              "You receive three price strings. Convert each to a number and print the total, rounded to 2 decimal places.",
              "",
              "~~~text",
              "Total: 46.47",
              "~~~",
              "",
              "The strings contain decimals, so `int()` will not work directly."
            ]),
            starter: "price_a = '19.99'\nprice_b = '5.49'\nprice_c = '20.99'\n\n",
            hints: [
              "`float('19.99')` gives `19.99`.",
              "`round(total, 2)` rounds to two decimal places.",
              "Print with `print('Total:', round(total, 2))`."
            ],
            tests: [
              { name: "prints the right total line", out_exact: "Total: 46.47" }
            ],
            solution: "price_a = '19.99'\nprice_b = '5.49'\nprice_c = '20.99'\n\ntotal = float(price_a) + float(price_b) + float(price_c)\nprint('Total:', round(total, 2))"
          },
          {
            kind: "code", title: "Round trip", difficulty: 2,
            concepts: ["casting", "str-type"],
            prompt: L([
              "Start from the integer `2024`. Turn it into a string, and set `digit_count` to how many characters",
              "that string has — using `len()`.",
              "",
              "Then print `2024 has 4 digits`."
            ]),
            starter: "year = 2024\n",
            hints: ["`str(year)` converts it to text.", "`len('2024')` is `4`.", "Print with commas: `print(year, 'has', digit_count, 'digits')`."],
            tests: [
              { name: "digit_count is 4", call: "digit_count", expect: 4 },
              { name: "prints the sentence", out_exact: "2024 has 4 digits" }
            ],
            solution: "year = 2024\ndigit_count = len(str(year))\nprint(year, 'has', digit_count, 'digits')",
            takeaway: "`len()` does not work on an int — you cannot ask a number how long it is. Converting to `str` first is a normal, deliberate move."
          }
        ]
      },

      {
        id: "m02l4", title: "Talking to the user", minutes: 10,
        concepts: ["input-fn", "casting", "fstrings"],
        content: L([
          "## input() always gives you a string",
          "",
          "~~~py",
          "name = input('What is your name? ')",
          "print('Hello,', name)",
          "~~~",
          "",
          "`input()` shows the prompt, waits, and hands back whatever was typed **as text** — always, without exception.",
          "Type `42` and you get the string `'42'`, not the number `42`.",
          "",
          "~~~py",
          "age = input('Age: ')",
          "print(age + 1)      # TypeError",
          "print(int(age) + 1) # works",
          "~~~",
          "",
          ":::tip In PyQuest",
          "Exercises that use `input()` list the exact inputs your program will receive. There is no keyboard involved —",
          "the values are fed in automatically, in order, so you can test reliably.",
          ":::",
          "",
          "## f-strings: the good way to build text",
          "",
          "Putting an `f` before a quote lets you drop values straight into the text with `{ }`:",
          "",
          "~~~py",
          "name = 'Ada'",
          "age = 36",
          "print(f'{name} is {age} years old')",
          "print(f'Next year she turns {age + 1}')",
          "~~~",
          "~~~out",
          "Ada is 36 years old",
          "Next year she turns 37",
          "~~~",
          "",
          "Anything inside `{ }` is a normal Python expression. Compare the alternatives:",
          "",
          "~~~py",
          "print('Total: ' + str(total) + ' pounds')   # clumsy, needs str()",
          "print('Total:', total, 'pounds')            # fine, but spacing is fixed",
          "print(f'Total: {total} pounds')             # clear and flexible",
          "~~~",
          "",
          "### Formatting numbers",
          "",
          "~~~py",
          "price = 3.14159",
          "print(f'{price:.2f}')      # 3.14   -- 2 decimal places",
          "print(f'{1234567:,}')      # 1,234,567",
          "print(f'{7:>5}|')          # '    7|'  right-aligned in 5 characters",
          "~~~",
          "",
          "The `:.2f` part is a *format specification*. You will reach for `.2f` constantly for money and averages."
        ]),
        exercises: [
          {
            kind: "code", title: "Greet by name", difficulty: 1,
            concepts: ["input-fn", "fstrings"],
            prompt: L([
              "Read a name with `input()` and print `Hello, <name>!` using an f-string.",
              "",
              "With the input `Ada`, the output must be exactly `Hello, Ada!`"
            ]),
            stdin: ["Ada"],
            starter: "name = input()\n",
            hints: ["`print(f'Hello, {name}!')`"],
            requires: [{ contains: "f'", msg: "Use an f-string" }],
            tests: [
              { name: "greets Ada", out: "Hello, Ada!" },
              { name: "works for another name too", stdin: ["Grace"], out: "Hello, Grace!" }
            ],
            solution: "name = input()\nprint(f'Hello, {name}!')"
          },
          {
            kind: "code", title: "Age in dog years", difficulty: 2,
            concepts: ["input-fn", "casting", "fstrings"],
            prompt: L([
              "Read an age (a whole number) and print:",
              "",
              "~~~text",
              "You are 7 in human years and 49 in dog years",
              "~~~",
              "",
              "Dog years are human years times 7. Remember what `input()` hands you."
            ]),
            stdin: ["7"],
            starter: "",
            hints: [
              "`age = int(input())` converts as you read.",
              "`print(f'You are {age} in human years and {age * 7} in dog years')`"
            ],
            tests: [
              { name: "correct for 7", out: "You are 7 in human years and 49 in dog years" },
              { name: "correct for 12", stdin: ["12"], out: "You are 12 in human years and 84 in dog years" }
            ],
            solution: "age = int(input())\nprint(f'You are {age} in human years and {age * 7} in dog years')"
          },
          {
            kind: "debug", title: "The string that would not add up", difficulty: 2,
            concepts: ["input-fn", "casting"],
            prompt: L([
              "This program should read two numbers and print their sum. With inputs `5` and `8` it must print `13`,",
              "but right now it prints `58`. Fix it."
            ]),
            stdin: ["5", "8"],
            starter: "a = input()\nb = input()\nprint(a + b)",
            hints: [
              "`'5' + '8'` joins two strings, giving `'58'`.",
              "Convert both to `int` before adding."
            ],
            tests: [
              { name: "5 + 8 is 13", out_exact: "13" },
              { name: "20 + 22 is 42", stdin: ["20", "22"], out_exact: "42" }
            ],
            solution: "a = int(input())\nb = int(input())\nprint(a + b)",
            takeaway: "`+` means *add* for numbers and *join* for strings. Getting `58` instead of `13` is the signature of forgetting to convert."
          },
          {
            kind: "code", title: "Receipt line", difficulty: 3,
            concepts: ["fstrings", "casting", "input-fn"],
            prompt: L([
              "Read an item name, a quantity and a unit price (in that order), then print one receipt line:",
              "",
              "~~~text",
              "3 x Coffee @ 2.50 = 7.50",
              "~~~",
              "",
              "Both money values must show exactly two decimal places, even when the number is whole."
            ]),
            stdin: ["Coffee", "3", "2.5"],
            starter: "",
            hints: [
              "Three `input()` calls, in the order given.",
              "Quantity is an `int`, price is a `float`.",
              "`f'{price:.2f}'` forces two decimal places."
            ],
            tests: [
              { name: "coffee line is exact", out_exact: "3 x Coffee @ 2.50 = 7.50" },
              { name: "works for another order", stdin: ["Tea", "2", "1.2"], out_exact: "2 x Tea @ 1.20 = 2.40" }
            ],
            solution: L([
              "name = input()",
              "quantity = int(input())",
              "price = float(input())",
              "print(f'{quantity} x {name} @ {price:.2f} = {quantity * price:.2f}')"
            ]),
            takeaway: "`:.2f` is how money is printed. Without it, `2.5` shows as `2.5` and your receipts look broken."
          }
        ]
      }
    ],

    checkpoint: {
      id: "m02cp", pass: 0.8,
      title: "Checkpoint: Variables & Types",
      items: [
        {
          kind: "predict", title: "Reassignment", difficulty: 2, concepts: ["assignment"],
          prompt: "What is printed?\n\n~~~py\nn = 4\nn = n * n\nn = n - 1\nprint(n)\n~~~",
          choices: ["`15`", "`16`", "`7`", "`3`"],
          answer: 0,
          explain: "`4 * 4` is `16`, then `16 - 1` is `15`. Each line uses the value the variable has *at that moment*."
        },
        {
          kind: "code", title: "Convert and compute", difficulty: 2, concepts: ["casting"],
          prompt: "`raw` holds the string `'48'`. Print half of it as a whole number — the output must be exactly `24`.",
          starter: "raw = '48'\n",
          tests: [{ name: "prints 24", out_exact: "24" }]
        },
        {
          kind: "quiz", title: "What does input() return?", difficulty: 2, concepts: ["input-fn"],
          prompt: "The user types `100` at an `input()` prompt. What type is the value your program receives?",
          choices: ["`int`", "`str`", "`float`", "It depends on what was typed"],
          answer: 1,
          explain: "`input()` returns a `str` every single time. Converting is your job, and forgetting is the most common beginner bug."
        },
        {
          kind: "code", title: "Format a total", difficulty: 3, concepts: ["fstrings"],
          prompt: "Print exactly `Balance: 1,234.50` using the variable given. Use an f-string with a thousands separator and two decimal places.",
          starter: "balance = 1234.5\n",
          requires: [{ contains: "f'", msg: "Use an f-string" }],
          tests: [{ name: "exact formatting", out_exact: "Balance: 1,234.50" }]
        },
        {
          kind: "debug", title: "Two type bugs", difficulty: 3, concepts: ["casting", "input-fn"],
          prompt: "With input `9`, this must print `Next year you are 10`. Fix it.",
          starter: "age = input()\nprint('Next year you are ' + age + 1)",
          stdin: ["9"],
          tests: [
            { name: "prints the sentence", out_exact: "Next year you are 10" },
            { name: "works for 41 too", stdin: ["41"], out_exact: "Next year you are 42" }
          ]
        }
      ]
    }
  });
})();
