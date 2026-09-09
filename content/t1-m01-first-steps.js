/* Tier 1 · Module 1 — First Steps */
(function () {
  const L = a => a.join("\n");

  PQ.defineModule({
    id: "m01", tier: 1, order: 1, icon: "🚀",
    title: "First Steps",
    blurb: "Make the computer say something, then learn to read what it says back.",
    intro: L([
      "Programming is giving precise instructions to something that does exactly what you say and nothing you meant.",
      "This module gets you writing and running real Python immediately, and — just as important — teaches you to read",
      "the error messages you are definitely going to see. Everyone sees them. Good programmers just read them faster."
    ]),
    concepts: [
      { id: "print", name: "print()", importance: 1.3 },
      { id: "strings-literal", name: "string literals" },
      { id: "comments", name: "comments" },
      { id: "program-order", name: "order of execution", importance: 1.2 },
      { id: "read-errors", name: "reading errors", importance: 1.4 },
      { id: "syntax-basics", name: "syntax basics", importance: 1.2 }
    ],

    lessons: [
      /* ---------------------------------------------------------------- */
      {
        id: "m01l1", title: "Your first program", minutes: 9,
        concepts: ["print", "strings-literal", "syntax-basics"],
        content: L([
          "## A program is a list of instructions",
          "",
          "Python reads your file from top to bottom and does each line in turn. That is the whole model. No magic.",
          "",
          "The first instruction worth knowing is `print()`. It shows something on the screen.",
          "",
          "~~~py",
          "print('Hello, world!')",
          "~~~",
          "~~~out",
          "Hello, world!",
          "~~~",
          "",
          "Press **Run** on that block above. Really — press it. Nothing in this app is a screenshot; that is a real",
          "Python interpreter running in your browser.",
          "",
          "### Three things are happening",
          "",
          "1. `print` is the **name** of a built-in tool.",
          "2. The parentheses `(` `)` mean *use it now*.",
          "3. Whatever is inside the parentheses is what gets shown.",
          "",
          "### Text needs quotes",
          "",
          "Text in Python is called a **string**, and a string must be wrapped in quotes so Python knows it is text",
          "rather than the name of something.",
          "",
          "~~~py",
          "print('single quotes work')",
          "print(\"double quotes work too\")",
          "~~~",
          "",
          "Pick one style and stay consistent. This course uses single quotes for short strings.",
          "",
          ":::trap The most common first mistake",
          "`print(Hello)` without quotes makes Python go looking for *something named Hello* — and there is nothing",
          "with that name, so it stops with an error. Quotes are what turn letters into data.",
          ":::",
          "",
          "### Several instructions, one after another",
          "",
          "~~~py",
          "print('Line one')",
          "print('Line two')",
          "print('Line three')",
          "~~~",
          "~~~out",
          "Line one",
          "Line two",
          "Line three",
          "~~~",
          "",
          "Each `print()` starts a new line. Order matters: swap the lines and the output swaps too.",
          "",
          "### Printing more than one thing",
          "",
          "Separate values with commas and `print` joins them with a single space:",
          "",
          "~~~py",
          "print('Python', 'is', 'fun')",
          "print('2 + 3 =', 2 + 3)",
          "~~~",
          "~~~out",
          "Python is fun",
          "2 + 3 = 5",
          "~~~",
          "",
          "Notice the difference: `'2 + 3'` in quotes is *text* and stays as-is; `2 + 3` without quotes is *arithmetic*",
          "and Python works it out. That distinction will matter constantly."
        ]),
        exercises: [
          {
            kind: "code", title: "Say hello", difficulty: 1,
            concepts: ["print", "strings-literal"],
            prompt: L([
              "Write a program that prints exactly this line:",
              "",
              "~~~text",
              "Hello, world!",
              "~~~",
              "",
              "Capital H, a comma, a space, and an exclamation mark. Computers are picky; that is the job."
            ]),
            starter: "# Write your program below\n",
            hints: [
              "Use `print()` and put the text inside the parentheses.",
              "The text must be in quotes: `print('...')`",
              "Check the comma and the exclamation mark are both there."
            ],
            tests: [
              { name: "prints exactly Hello, world!", out_exact: "Hello, world!" }
            ],
            solution: "print('Hello, world!')"
          },
          {
            kind: "code", title: "Three lines about you", difficulty: 1,
            concepts: ["print", "program-order"],
            prompt: L([
              "Print these three lines, in this order:",
              "",
              "~~~text",
              "Name: Ada",
              "Learning: Python",
              "Day: 1",
              "~~~"
            ]),
            starter: "",
            hints: ["One `print()` per line.", "Each line is a single string, colon and space included."],
            tests: [
              { name: "all three lines, in order", out_lines: ["Name: Ada", "Learning: Python", "Day: 1"] }
            ],
            solution: "print('Name: Ada')\nprint('Learning: Python')\nprint('Day: 1')"
          },
          {
            kind: "predict", title: "Quotes change everything", difficulty: 2,
            concepts: ["strings-literal", "print"],
            prompt: L([
              "Read carefully, then answer without running it:",
              "",
              "~~~py",
              "print('7 * 6')",
              "print(7 * 6)",
              "~~~"
            ]),
            choices: [
              "`42` then `42`",
              "`7 * 6` then `42`",
              "`7 * 6` then `7 * 6`",
              "An error, because you cannot multiply inside `print`"
            ],
            answer: 1,
            explain: L([
              "Anything inside quotes is **text** and Python does not look at what it says — it just shows it.",
              "Without quotes, `7 * 6` is an **expression**, so Python calculates it first and prints the result.",
              "",
              "This is the single most useful distinction in your first week: quoted means *data*, unquoted means *evaluate this*."
            ])
          },
          {
            kind: "debug", title: "Two broken lines", difficulty: 2,
            concepts: ["syntax-basics", "read-errors"],
            prompt: L([
              "This program is supposed to print two lines but it will not even start. Fix it.",
              "",
              "Run it first and read the error — that is part of the exercise."
            ]),
            starter: "print('Booting up...'\nprint(Ready)",
            hints: [
              "Count the brackets on the first line. Every `(` needs a `)`.",
              "The second line has no quotes, so Python is looking for something *named* Ready.",
              "The result should print `Booting up...` then `Ready`."
            ],
            tests: [
              { name: "prints both lines", out_lines: ["Booting up...", "Ready"] }
            ],
            solution: "print('Booting up...')\nprint('Ready')",
            takeaway: "An unclosed bracket often makes Python blame the *next* line. When a `SyntaxError` points somewhere that looks fine, look at the line above."
          }
        ]
      },

      /* ---------------------------------------------------------------- */
      {
        id: "m01l2", title: "Comments and the shape of a program", minutes: 8,
        concepts: ["comments", "program-order", "syntax-basics"],
        content: L([
          "## Notes for humans",
          "",
          "A `#` marks the rest of the line as a **comment**. Python ignores it completely.",
          "",
          "~~~py",
          "# This line does nothing at all",
          "print('but this one runs')  # so does this, up to the hash",
          "~~~",
          "",
          "Comments are for the *why*, not the *what*. This is noise:",
          "",
          "~~~py",
          "# print the total",
          "print(total)",
          "~~~",
          "",
          "This earns its space:",
          "",
          "~~~py",
          "# Prices arrive in cents from the payment provider, so divide by 100",
          "print(total / 100)",
          "~~~",
          "",
          "### Commenting out code",
          "",
          "While debugging you will often disable a line rather than delete it:",
          "",
          "~~~py",
          "print('step 1')",
          "# print('step 2')",
          "print('step 3')",
          "~~~",
          "",
          "That is a real technique — narrowing down which line misbehaves by switching lines off.",
          "",
          "## Order is everything",
          "",
          "Python does one line, finishes it, then moves to the next. There is no going back and no looking ahead.",
          "A program that prints a total before calculating it will print the wrong thing — or crash.",
          "",
          "### Blank lines and spaces",
          "",
          "Blank lines between chunks of code are free and make things readable. But **leading** spaces are not free:",
          "",
          "~~~py",
          "print('fine')",
          "    print('not fine')",
          "~~~",
          "",
          "That second line is indented for no reason, and Python treats indentation as meaningful structure",
          "(you will use it deliberately very soon). An unexplained indent is an `IndentationError`.",
          "",
          ":::tip Read this now, thank yourself later",
          "In Python, **indentation is syntax**, not decoration. Four spaces per level, always. Never mix tabs and spaces.",
          ":::"
        ]),
        exercises: [
          {
            kind: "debug", title: "Silence the debug line", difficulty: 1,
            concepts: ["comments"],
            prompt: L([
              "This program prints a leftover debugging line that should not be there.",
              "Comment it out — do not delete it — so the output is just the two real lines."
            ]),
            starter: "print('Welcome to the shop')\nprint('DEBUG: cart = []')\nprint('Have a look around')",
            hints: ["Put a `#` at the very start of the debug line."],
            requires: [{ contains: "DEBUG", msg: "Keep the debug line in the file, just disabled" }],
            tests: [
              { name: "the debug line is not printed", out_not: "DEBUG" },
              { name: "the two real lines still print", out_lines: ["Welcome to the shop", "Have a look around"] }
            ],
            solution: "print('Welcome to the shop')\n# print('DEBUG: cart = []')\nprint('Have a look around')"
          },
          {
            kind: "debug", title: "The mystery indent", difficulty: 2,
            concepts: ["syntax-basics", "read-errors"],
            prompt: "Run this, read the error, then fix it so all three lines print.",
            starter: "print('one')\n  print('two')\nprint('three')",
            hints: [
              "Look at the start of the second line.",
              "Nothing above it opened a block, so it must not be indented."
            ],
            tests: [
              { name: "prints one, two, three", out_lines: ["one", "two", "three"] }
            ],
            solution: "print('one')\nprint('two')\nprint('three')",
            takeaway: "`IndentationError: unexpected indent` always means the same thing: this line is pushed in, but nothing above it opened a block."
          },
          {
            kind: "quiz", title: "What does # do?", difficulty: 1,
            concepts: ["comments"],
            prompt: "What happens to text after a `#` on a line of Python?",
            choices: [
              "It is printed in a different colour when the program runs",
              "It is completely ignored by Python",
              "It is run last, after everything else",
              "It causes an error unless it is at the start of a line"
            ],
            answer: 1,
            explain: "Everything after `#` (to the end of that line) is stripped out before Python runs anything. It exists purely for people reading the code — including you in three weeks."
          },
          {
            kind: "code", title: "Fix the order", difficulty: 2,
            concepts: ["program-order", "print"],
            prompt: L([
              "A recipe app prints its steps in the wrong order. Rearrange the lines so the output reads:",
              "",
              "~~~text",
              "Step 1: Boil water",
              "Step 2: Add pasta",
              "Step 3: Wait 9 minutes",
              "Step 4: Drain",
              "~~~",
              "",
              "Do not retype them — just reorder."
            ]),
            starter: L([
              "print('Step 3: Wait 9 minutes')",
              "print('Step 1: Boil water')",
              "print('Step 4: Drain')",
              "print('Step 2: Add pasta')"
            ]),
            hints: ["Python runs top to bottom, so the order of your lines *is* the order of the output."],
            tests: [
              { name: "steps come out in order", out_lines: ["Step 1: Boil water", "Step 2: Add pasta", "Step 3: Wait 9 minutes", "Step 4: Drain"] }
            ],
            solution: L([
              "print('Step 1: Boil water')",
              "print('Step 2: Add pasta')",
              "print('Step 3: Wait 9 minutes')",
              "print('Step 4: Drain')"
            ])
          }
        ]
      },

      /* ---------------------------------------------------------------- */
      {
        id: "m01l3", title: "When Python complains", minutes: 11,
        concepts: ["read-errors", "syntax-basics"],
        content: L([
          "## Errors are information, not failure",
          "",
          "Every programmer you admire sees errors dozens of times a day. The difference between a beginner and an",
          "expert is not how often they break things — it is how fast they read the message and know what to do.",
          "",
          "### Anatomy of a traceback",
          "",
          "~~~py",
          "print('starting')",
          "print(name)",
          "~~~",
          "~~~out",
          "starting",
          "Traceback (most recent call last):",
          "  File \"your_code.py\", line 2, in <module>",
          "    print(name)",
          "NameError: name 'name' is not defined",
          "~~~",
          "",
          "Read it **bottom-up**:",
          "",
          "1. **Last line** — what went wrong: `NameError: name 'name' is not defined`.",
          "2. **Line above** — where: line 2, and the actual code.",
          "3. **Everything printed before the traceback** happened successfully. `starting` appeared, so the program",
          "   got that far. That is a free clue about how far it got.",
          "",
          "### Two families you will meet today",
          "",
          "**SyntaxError** — Python could not even understand the text, so *nothing ran at all*.",
          "",
          "~~~py",
          "print('hello'",
          "~~~",
          "",
          "**NameError** — the text made sense, but you used a name that does not exist.",
          "",
          "~~~py",
          "print(hello)",
          "~~~",
          "",
          "The tell is simple: if none of your output appeared, it was almost certainly a `SyntaxError`.",
          "If some output appeared and then it stopped, it was a runtime error like `NameError`.",
          "",
          "### A method that always works",
          "",
          "1. Read the **last** line of the traceback.",
          "2. Look at the line number it names — **and the line above it**, since unclosed brackets blame the next line.",
          "3. Change **one** thing.",
          "4. Run again.",
          "",
          "Changing three things at once and hoping is how a five-minute bug becomes an hour.",
          "",
          ":::why This is a career skill",
          "Later you will read errors from inside libraries you did not write, in stacks fifteen frames deep.",
          "The method is identical: bottom line first, find the deepest frame that is *your* code, change one thing.",
          ":::"
        ]),
        exercises: [
          {
            kind: "quiz", title: "Where is the problem?", difficulty: 2,
            concepts: ["read-errors"],
            prompt: L([
              "A program produces this:",
              "",
              "~~~text",
              "Traceback (most recent call last):",
              "  File \"your_code.py\", line 4, in <module>",
              "    print(totl)",
              "NameError: name 'totl' is not defined",
              "~~~",
              "",
              "What do you conclude?"
            ]),
            choices: [
              "Lines 1 to 3 never ran",
              "Lines 1 to 3 ran fine, and line 4 uses a misspelled name",
              "The file has a syntax error somewhere",
              "`print` is broken and must be imported"
            ],
            answer: 1,
            explain: L([
              "A `NameError` happens **while running**, which means everything before line 4 already succeeded.",
              "The name `totl` looks like a typo for `total` — misspelled names are the number one cause of `NameError`."
            ])
          },
          {
            kind: "quiz", title: "Nothing printed at all", difficulty: 2,
            concepts: ["read-errors"],
            prompt: "Your program starts with `print('step 1')` but running it shows no output whatsoever, only an error. What kind of error is it almost certainly?",
            choices: [
              "A NameError on a later line",
              "A SyntaxError somewhere in the file",
              "A ZeroDivisionError",
              "The program printed nothing because print was commented out"
            ],
            answer: 1,
            explain: "Python parses the **whole file** before running any of it. A `SyntaxError` anywhere means nothing runs — not even line 1. If you saw partial output, the problem happened later, at run time.",
          },
          {
            kind: "debug", title: "Three bugs, one program", difficulty: 3,
            concepts: ["read-errors", "syntax-basics", "strings-literal"],
            prompt: L([
              "This little program has three separate problems. Fix them one at a time — run after each fix and let the",
              "error tell you where to go next.",
              "",
              "Target output:",
              "",
              "~~~text",
              "Report for: Ada",
              "Items: 3",
              "Total: 12",
              "~~~"
            ]),
            starter: L([
              "print('Report for: Ada'",
              "  print('Items: 3')",
              "print(Total: 12)"
            ]),
            hints: [
              "Bug 1: the first line never closes its bracket.",
              "Bug 2: the second line is indented but nothing opened a block.",
              "Bug 3: the third line needs its text in quotes — `'Total: 12'`."
            ],
            tests: [
              { name: "all three lines print correctly", out_lines: ["Report for: Ada", "Items: 3", "Total: 12"] }
            ],
            solution: L([
              "print('Report for: Ada')",
              "print('Items: 3')",
              "print('Total: 12')"
            ]),
            takeaway: "One fix, one run. Fixing three things at once means you never learn which fix mattered."
          },
          {
            kind: "code", title: "Prove it stopped there", difficulty: 2,
            concepts: ["read-errors", "print", "program-order"],
            prompt: L([
              "Write a program that prints `A`, then `B`, then `C` — each on its own line.",
              "",
              "Then, as a comment on the last line, write which letter would still appear if a `NameError` happened",
              "on the `B` line. Just the letter, in a comment.",
              "",
              "The checks look at both the output and that comment."
            ]),
            starter: "",
            hints: [
              "Three `print()` calls, then a `#` comment at the end.",
              "Output before an error still appears — the program really did get that far."
            ],
            tests: [
              { name: "prints A, B and C in order", out_lines: ["A", "B", "C"] }
            ],
            requires: [{ re: "#[^\\n]*\\bA\\b", msg: "Add a comment naming the letter that would still appear" }],
            solution: "print('A')\nprint('B')\nprint('C')\n# A  (output before the error still appears)",
            takeaway: "Partial output is diagnostic gold: it tells you exactly how far execution got before it died."
          }
        ]
      }
    ],

    checkpoint: {
      id: "m01cp", pass: 0.8,
      title: "Checkpoint: First Steps",
      brief: L([
        "Five questions, **no hints and no solutions**. Get four right to clear the module.",
        "",
        "If you do not pass, you lose nothing — you will be told exactly which ideas to revisit."
      ]),
      items: [
        {
          kind: "code", title: "Exact output", difficulty: 2, concepts: ["print", "strings-literal"],
          prompt: "Print exactly these two lines:\n\n~~~text\nSystem: online\nUsers: 0\n~~~",
          starter: "",
          tests: [{ name: "exact output", out_lines: ["System: online", "Users: 0"] }]
        },
        {
          kind: "predict", title: "Quoted or not", difficulty: 2, concepts: ["strings-literal"],
          prompt: "What is printed?\n\n~~~py\nprint('10 - 4')\n~~~",
          choices: ["`6`", "`10 - 4`", "An error", "`10-4`"],
          answer: 1,
          explain: "Quoted text is data. Python never looks inside a string to do arithmetic."
        },
        {
          kind: "debug", title: "Make it run", difficulty: 2, concepts: ["syntax-basics", "read-errors"],
          prompt: "Fix this so it prints `done` on its own line.",
          starter: "print('done'",
          tests: [{ name: "prints done", out_exact: "done" }]
        },
        {
          kind: "quiz", title: "First line of output missing", difficulty: 3, concepts: ["read-errors"],
          prompt: "A 20-line program prints nothing at all and raises an error mentioning line 17. What ran?",
          choices: [
            "Lines 1 to 16 ran, then it failed",
            "Nothing ran — it must be a SyntaxError",
            "Only line 17 ran",
            "The whole file ran twice"
          ],
          answer: 1,
          explain: "No output at all means parsing failed, and parsing covers the whole file before execution starts."
        },
        {
          kind: "code", title: "Comment discipline", difficulty: 2, concepts: ["comments", "print"],
          prompt: "Print `Ready` and nothing else. The starter has a line that must stay in the file but must not run.",
          starter: "print('Ready')\nprint('TEMP: remove me')",
          requires: [{ contains: "TEMP", msg: "Keep the TEMP line in the file, disabled" }],
          tests: [
            { name: "prints only Ready", out_exact: "Ready" }
          ]
        }
      ]
    }
  });
})();
