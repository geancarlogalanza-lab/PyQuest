/* Tier 1 · Module 4 — Making Decisions */
(function () {
  const L = a => a.join("\n");

  PQ.defineModule({
    id: "m04", tier: 1, order: 4, icon: "🔀",
    title: "Making Decisions",
    blurb: "Branching, indentation as structure, and how to write conditions that stay readable.",
    intro: L([
      "Up to now your programs have done exactly the same thing every time. `if` is where a program starts to",
      "*respond*. It is also where indentation stops being cosmetic and starts being the thing that defines",
      "what belongs to what."
    ]),
    concepts: [
      { id: "if-else", name: "if / else", importance: 1.5 },
      { id: "elif", name: "elif chains", importance: 1.3 },
      { id: "indentation", name: "indentation blocks", importance: 1.5 },
      { id: "truthiness", name: "truthiness", importance: 1.3 },
      { id: "nested-if", name: "nested conditions" },
      { id: "condition-design", name: "readable conditions", importance: 1.2 }
    ],

    lessons: [
      {
        id: "m04l1", title: "if and else", minutes: 10,
        concepts: ["if-else", "indentation"],
        content: L([
          "## A fork in the road",
          "",
          "~~~py",
          "temperature = 31",
          "",
          "if temperature > 30:",
          "    print('Too hot')",
          "    print('Stay inside')",
          "",
          "print('Done')",
          "~~~",
          "~~~out",
          "Too hot",
          "Stay inside",
          "Done",
          "~~~",
          "",
          "Four parts, and all four matter:",
          "",
          "1. the keyword `if`",
          "2. a **condition** that evaluates to true or false",
          "3. a colon `:` at the end of the line",
          "4. an **indented block** — everything indented under the `if` runs only when the condition is true",
          "",
          "`print('Done')` is not indented, so it is not part of the `if`. It always runs.",
          "",
          "## Indentation is the structure",
          "",
          "Most languages use `{ }` for this. Python uses whitespace, and it is not optional:",
          "",
          "~~~py",
          "if score > 50:",
          "    print('pass')      # inside",
          "    print('well done') # inside",
          "print('finished')      # outside",
          "~~~",
          "",
          "Change the indentation and you change the meaning of the program. Use **4 spaces** per level, every time.",
          "",
          ":::trap Tabs vs spaces",
          "A tab and four spaces look identical and are different characters. Mixing them gives `TabError`.",
          "The editor here inserts spaces for you — keep it that way.",
          ":::",
          "",
          "## else",
          "",
          "~~~py",
          "age = 15",
          "",
          "if age >= 18:",
          "    print('Adult')",
          "else:",
          "    print('Minor')",
          "~~~",
          "~~~out",
          "Minor",
          "~~~",
          "",
          "`else` needs no condition — it is *everything the `if` did not catch*. Exactly one of the two blocks runs.",
          "Never both, never neither."
        ]),
        exercises: [
          {
            kind: "code", title: "Pass or fail", difficulty: 1,
            concepts: ["if-else"],
            prompt: L([
              "Read a score with `input()`. Print `Pass` if it is 50 or more, otherwise `Fail`.",
              "",
              "With input `73` the output is `Pass`."
            ]),
            stdin: ["73"],
            starter: "score = int(input())\n\n",
            hints: ["`if score >= 50:` then an indented `print('Pass')`.", "Add `else:` with its own indented print."],
            tests: [
              { name: "73 passes", out_exact: "Pass" },
              { name: "49 fails", stdin: ["49"], out_exact: "Fail" },
              { name: "exactly 50 passes", stdin: ["50"], out_exact: "Pass" }
            ],
            solution: "score = int(input())\n\nif score >= 50:\n    print('Pass')\nelse:\n    print('Fail')",
            takeaway: "Always test the boundary. `>= 50` and `> 50` differ by exactly one value, and that value is the one users complain about."
          },
          {
            kind: "debug", title: "Wrong block", difficulty: 2,
            concepts: ["indentation"],
            prompt: L([
              "This should print `Access granted` **only** for the right password, but it prints it every time.",
              "Fix the indentation.",
              "",
              "With input `hunter2` it must print `Access granted`. With anything else, only `Access denied`."
            ]),
            stdin: ["wrongpass"],
            starter: L([
              "password = input()",
              "",
              "if password == 'hunter2':",
              "    print('Checking...')",
              "print('Access granted')",
              "else:",
              "    print('Access denied')"
            ]),
            hints: [
              "`print('Access granted')` is at the outer level, so it always runs.",
              "It also breaks the `else`, because an `if` block cannot be interrupted by unindented code."
            ],
            tests: [
              { name: "wrong password is denied", out_exact: "Access denied" },
              { name: "right password is granted", stdin: ["hunter2"], out_lines: ["Checking...", "Access granted"] }
            ],
            solution: L([
              "password = input()",
              "",
              "if password == 'hunter2':",
              "    print('Checking...')",
              "    print('Access granted')",
              "else:",
              "    print('Access denied')"
            ])
          },
          {
            kind: "predict", title: "Which lines run?", difficulty: 2,
            concepts: ["indentation", "if-else"],
            prompt: L([
              "What is printed?",
              "",
              "~~~py",
              "n = 4",
              "if n > 10:",
              "    print('big')",
              "print('checked')",
              "~~~"
            ]),
            choices: ["`big` then `checked`", "just `checked`", "just `big`", "nothing"],
            answer: 1,
            explain: "`n > 10` is false so the indented block is skipped entirely. `print('checked')` is at the outer level and belongs to no block, so it always runs."
          },
          {
            kind: "code", title: "Absolute value, by hand", difficulty: 2,
            concepts: ["if-else"],
            prompt: L([
              "Without using the built-in `abs()`, print the absolute value of `number` — that is, the number with",
              "any minus sign removed.",
              "",
              "With `number = -12` print `12`."
            ]),
            starter: "number = -12\n\n",
            forbids: [{ contains: "abs(", msg: "Do it without abs()" }],
            hints: ["If the number is negative, print the negative of it: `-number`.", "`-(-12)` is `12`."],
            tests: [
              { name: "-12 becomes 12", out_exact: "12" },
              { name: "the logic works both ways", code: "assert (lambda n: -n if n < 0 else n)(7) == 7" }
            ],
            solution: "number = -12\n\nif number < 0:\n    print(-number)\nelse:\n    print(number)"
          }
        ]
      },

      {
        id: "m04l2", title: "elif and the order of tests", minutes: 10,
        concepts: ["elif", "condition-design"],
        content: L([
          "## More than two outcomes",
          "",
          "~~~py",
          "score = 84",
          "",
          "if score >= 90:",
          "    grade = 'A'",
          "elif score >= 80:",
          "    grade = 'B'",
          "elif score >= 70:",
          "    grade = 'C'",
          "else:",
          "    grade = 'F'",
          "",
          "print(grade)",
          "~~~",
          "~~~out",
          "B",
          "~~~",
          "",
          "Python tries each condition **in order** and stops at the first true one. `84 >= 90` is false;",
          "`84 >= 80` is true, so `grade` becomes `'B'` and the remaining branches are never even looked at.",
          "",
          ":::why Order is the whole design",
          "Reverse the chain and it breaks completely:",
          "",
          "~~~py",
          "if score >= 70:",
          "    grade = 'C'",
          "elif score >= 80:   # never reachable for a 95",
          "    grade = 'B'",
          "~~~",
          "",
          "A 95 hits the first branch and gets a C. The code has no error, no warning, and is simply wrong.",
          "**In a chain of overlapping ranges, put the most specific test first.**",
          ":::",
          "",
          "## if vs elif",
          "",
          "These are not the same:",
          "",
          "~~~py",
          "# A chain: at most one runs",
          "if x > 10: print('big')",
          "elif x > 5: print('medium')",
          "",
          "# Separate ifs: both can run",
          "if x > 10: print('big')",
          "if x > 5:  print('medium')",
          "~~~",
          "",
          "With `x = 20`, the first prints only `big`; the second prints `big` **and** `medium`.",
          "Use `elif` when the cases are alternatives; use separate `if`s when they are independent questions.",
          "",
          "## Multi-line conditions",
          "",
          "When a condition gets long, wrap it in brackets and break the line:",
          "",
          "~~~py",
          "if (age >= 18",
          "        and has_id",
          "        and not is_banned):",
          "    print('let them in')",
          "~~~",
          "",
          "Better still, give the condition a name:",
          "",
          "~~~py",
          "is_eligible = age >= 18 and has_id and not is_banned",
          "if is_eligible:",
          "    print('let them in')",
          "~~~",
          "",
          "The second version reads like English and is far easier to debug — you can print `is_eligible`."
        ]),
        exercises: [
          {
            kind: "code", title: "Grade calculator", difficulty: 2,
            concepts: ["elif"],
            prompt: L([
              "Read a score and print the grade:",
              "",
              "| Score | Grade |",
              "|---|---|",
              "| 90 and above | A |",
              "| 80 to 89 | B |",
              "| 70 to 79 | C |",
              "| 60 to 69 | D |",
              "| below 60 | F |"
            ]),
            stdin: ["84"],
            starter: "score = int(input())\n\n",
            hints: ["Start with the highest threshold and work down.", "Use `elif` so only one branch can run."],
            tests: [
              { name: "84 is a B", out_exact: "B" },
              { name: "95 is an A", stdin: ["95"], out_exact: "A" },
              { name: "70 is a C", stdin: ["70"], out_exact: "C" },
              { name: "60 is a D", stdin: ["60"], out_exact: "D" },
              { name: "12 is an F", stdin: ["12"], out_exact: "F" },
              { name: "89 is a B, not an A", stdin: ["89"], out_exact: "B" }
            ],
            solution: L([
              "score = int(input())",
              "",
              "if score >= 90:",
              "    print('A')",
              "elif score >= 80:",
              "    print('B')",
              "elif score >= 70:",
              "    print('C')",
              "elif score >= 60:",
              "    print('D')",
              "else:",
              "    print('F')"
            ])
          },
          {
            kind: "debug", title: "Unreachable branches", difficulty: 3,
            concepts: ["elif", "condition-design"],
            prompt: L([
              "Every animal comes out as `small` no matter its weight. The conditions are correct individually —",
              "the **order** is wrong. Fix it.",
              "",
              "Rules: 500 kg or more is `huge`, 50 or more is `large`, 5 or more is `medium`, below 5 is `small`."
            ]),
            stdin: ["800"],
            starter: L([
              "weight = int(input())",
              "",
              "if weight >= 0:",
              "    print('small')",
              "elif weight >= 5:",
              "    print('medium')",
              "elif weight >= 50:",
              "    print('large')",
              "elif weight >= 500:",
              "    print('huge')"
            ]),
            hints: [
              "The first condition `weight >= 0` is true for everything.",
              "Most specific (largest threshold) first, least specific last."
            ],
            tests: [
              { name: "800 is huge", out_exact: "huge" },
              { name: "60 is large", stdin: ["60"], out_exact: "large" },
              { name: "9 is medium", stdin: ["9"], out_exact: "medium" },
              { name: "2 is small", stdin: ["2"], out_exact: "small" }
            ],
            solution: L([
              "weight = int(input())",
              "",
              "if weight >= 500:",
              "    print('huge')",
              "elif weight >= 50:",
              "    print('large')",
              "elif weight >= 5:",
              "    print('medium')",
              "else:",
              "    print('small')"
            ]),
            takeaway: "An unreachable branch is invisible: no error, no warning. Reading a chain top to bottom and asking *can this ever be reached?* is a real review skill."
          },
          {
            kind: "predict", title: "elif or two ifs", difficulty: 3,
            concepts: ["elif"],
            prompt: L([
              "What is printed?",
              "",
              "~~~py",
              "x = 20",
              "if x > 10:",
              "    print('big')",
              "if x > 5:",
              "    print('medium')",
              "~~~"
            ]),
            choices: ["just `big`", "`big` then `medium`", "just `medium`", "nothing"],
            answer: 1,
            explain: "These are two independent `if` statements, not a chain. Both conditions are true, so both blocks run. Had the second been `elif`, only `big` would print."
          },
          {
            kind: "refactor", title: "Name the condition", difficulty: 2,
            concepts: ["condition-design"],
            prompt: L([
              "This condition is correct but unreadable. Extract it into a well-named boolean variable called",
              "`can_check_out`, then use that in the `if`.",
              "",
              "The behaviour must not change."
            ]),
            starter: L([
              "age = 22",
              "has_card = True",
              "fines = 0",
              "",
              "if age >= 16 and has_card and fines == 0:",
              "    print('Checkout allowed')",
              "else:",
              "    print('Checkout blocked')"
            ]),
            hints: ["Assign the whole condition to `can_check_out` on its own line.", "Then `if can_check_out:`"],
            requires: [{ contains: "can_check_out", msg: "Create a variable named can_check_out" }],
            tests: [
              { name: "can_check_out is True here", call: "can_check_out", expect: true },
              { name: "still prints the right thing", out_exact: "Checkout allowed" }
            ],
            solution: L([
              "age = 22",
              "has_card = True",
              "fines = 0",
              "",
              "can_check_out = age >= 16 and has_card and fines == 0",
              "",
              "if can_check_out:",
              "    print('Checkout allowed')",
              "else:",
              "    print('Checkout blocked')"
            ])
          }
        ]
      },

      {
        id: "m04l3", title: "Truthiness and nesting", minutes: 11,
        concepts: ["truthiness", "nested-if", "condition-design"],
        content: L([
          "## Anything can be a condition",
          "",
          "`if` does not require a `True`/`False`. It asks *is this truthy?*",
          "",
          "**Falsy values:**",
          "",
          "~~~py",
          "False   0   0.0   ''   []   {}   ()   None",
          "~~~",
          "",
          "**Everything else is truthy** — including `'0'`, `'False'`, `-1` and `[0]`.",
          "",
          "~~~py",
          "name = ''",
          "if name:",
          "    print(f'Hello {name}')",
          "else:",
          "    print('No name given')",
          "~~~",
          "~~~out",
          "No name given",
          "~~~",
          "",
          "`if name:` reads better than `if len(name) > 0:` and is the idiomatic Python. Use it.",
          "",
          ":::trap The string trap",
          "`'0'` and `'False'` are non-empty strings, so both are **truthy**. Text from `input()` is never falsy",
          "unless the user typed nothing at all.",
          ":::",
          "",
          "### Redundant comparisons",
          "",
          "~~~py",
          "if is_ready == True:      # noise",
          "if is_ready:              # say what you mean",
          "",
          "if is_ready == False:     # noise",
          "if not is_ready:          # better",
          "~~~",
          "",
          "## Nesting",
          "",
          "An `if` can live inside another `if`:",
          "",
          "~~~py",
          "if logged_in:",
          "    if is_admin:",
          "        print('admin panel')",
          "    else:",
          "        print('user panel')",
          "else:",
          "    print('please log in')",
          "~~~",
          "",
          "Each level indents another 4 spaces. Two levels is fine. Four levels is a smell.",
          "",
          "## Guard clauses beat deep nesting",
          "",
          "Instead of wrapping everything in success conditions:",
          "",
          "~~~py",
          "if user is not None:",
          "    if user_is_active:",
          "        if has_permission:",
          "            do_the_thing()",
          "~~~",
          "",
          "handle the bad cases first and get them out of the way:",
          "",
          "~~~py",
          "if user is None:",
          "    print('no user')",
          "elif not user_is_active:",
          "    print('inactive')",
          "elif not has_permission:",
          "    print('forbidden')",
          "else:",
          "    do_the_thing()",
          "~~~",
          "",
          "Same logic, flat shape, and each failure has its own clear message. This pattern — *reject early,",
          "succeed at the end* — is one of the highest-value habits in this whole course."
        ]),
        exercises: [
          {
            kind: "code", title: "Empty input", difficulty: 2,
            concepts: ["truthiness"],
            prompt: L([
              "Read a name. If the user typed nothing, print `Hello, stranger`. Otherwise print `Hello, <name>`.",
              "",
              "Use truthiness — the checks forbid `len()` and `== ''`."
            ]),
            stdin: [""],
            starter: "name = input()\n\n",
            forbids: [
              { contains: "len(", msg: "Use truthiness, not len()" },
              { re: "==\\s*''", msg: "Use truthiness, not == ''" }
            ],
            hints: ["An empty string is falsy, so `if name:` is enough.", "Handle the empty case with `if not name:`."],
            tests: [
              { name: "empty input greets a stranger", out_exact: "Hello, stranger" },
              { name: "a real name is greeted", stdin: ["Ada"], out_exact: "Hello, Ada" }
            ],
            solution: "name = input()\n\nif name:\n    print(f'Hello, {name}')\nelse:\n    print('Hello, stranger')"
          },
          {
            kind: "predict", title: "Which are falsy?", difficulty: 3,
            concepts: ["truthiness"],
            prompt: L([
              "How many of these print `yes`?",
              "",
              "~~~py",
              "for value in [0, '0', '', [], [0], 'False', None]:",
              "    if value:",
              "        print('yes')",
              "~~~"
            ]),
            choices: ["2", "3", "4", "5"],
            answer: 1,
            explain: L([
              "Truthy: `'0'` (non-empty string), `[0]` (non-empty list), `'False'` (non-empty string) — that is **3**.",
              "",
              "Falsy: `0`, `''`, `[]`, `None`.",
              "",
              "The lesson: emptiness and zero are falsy; *the text of a falsy thing* is not."
            ])
          },
          {
            kind: "refactor", title: "Flatten it", difficulty: 3,
            concepts: ["condition-design", "nested-if"],
            prompt: L([
              "Rewrite this using **guard clauses** so no line is indented more than one level inside the",
              "if-chain. The printed messages must stay exactly the same.",
              "",
              "The checks require that no line has 12 or more leading spaces."
            ]),
            starter: L([
              "balance = 100",
              "is_open = True",
              "amount = 250",
              "",
              "if is_open:",
              "    if amount > 0:",
              "        if amount <= balance:",
              "            print('Withdrawn')",
              "        else:",
              "            print('Insufficient funds')",
              "    else:",
              "        print('Invalid amount')",
              "else:",
              "    print('Account closed')"
            ]),
            hints: [
              "Start with the failure cases: `if not is_open:` first.",
              "Then `elif amount <= 0:`, then `elif amount > balance:`, then `else:` for the success case."
            ],
            forbids: [{ re: "\\n {12,}\\S", msg: "No line may be indented three levels or more" }],
            tests: [
              { name: "250 from 100 is insufficient", out_exact: "Insufficient funds" },
              { name: "the closed-account case still comes first", code: "assert 'Account closed' in _SRC and _SRC.index('Account closed') < _SRC.index('Withdrawn'), 'handle the failure cases before the success case'" }
            ],
            solution: L([
              "balance = 100",
              "is_open = True",
              "amount = 250",
              "",
              "if not is_open:",
              "    print('Account closed')",
              "elif amount <= 0:",
              "    print('Invalid amount')",
              "elif amount > balance:",
              "    print('Insufficient funds')",
              "else:",
              "    print('Withdrawn')"
            ]),
            takeaway: "Deep nesting hides the happy path at the bottom of a pyramid. Guard clauses put failures first and leave the real work unindented and obvious."
          },
          {
            kind: "code", title: "Leap year", difficulty: 3,
            concepts: ["condition-design", "modulo"],
            prompt: L([
              "A year is a leap year when:",
              "",
              "- it divides by 4, **and**",
              "- it does **not** divide by 100, **unless** it also divides by 400",
              "",
              "So 2024 yes, 1900 no, 2000 yes, 2023 no.",
              "",
              "Read a year and print `Leap year` or `Not a leap year`."
            ]),
            stdin: ["1900"],
            starter: "year = int(input())\n\n",
            hints: [
              "Divisible by 4: `year % 4 == 0`.",
              "The rule as one expression: `year % 4 == 0 and (year % 100 != 0 or year % 400 == 0)`.",
              "Brackets matter here — `and` binds tighter than you might expect."
            ],
            tests: [
              { name: "1900 is not a leap year", out_exact: "Not a leap year" },
              { name: "2024 is", stdin: ["2024"], out_exact: "Leap year" },
              { name: "2000 is", stdin: ["2000"], out_exact: "Leap year" },
              { name: "2023 is not", stdin: ["2023"], out_exact: "Not a leap year" },
              { name: "2100 is not", stdin: ["2100"], out_exact: "Not a leap year" }
            ],
            solution: L([
              "year = int(input())",
              "",
              "is_leap = year % 4 == 0 and (year % 100 != 0 or year % 400 == 0)",
              "",
              "if is_leap:",
              "    print('Leap year')",
              "else:",
              "    print('Not a leap year')"
            ]),
            takeaway: "Real specifications have exceptions to exceptions. Translating an English rule into brackets correctly is most of the job."
          }
        ]
      }
    ],

    checkpoint: {
      id: "m04cp", pass: 0.8,
      title: "Checkpoint: Making Decisions",
      items: [
        {
          kind: "code", title: "Ticket price", difficulty: 2, concepts: ["elif"],
          prompt: "Read an age. Under 5 prints `Free`, under 18 prints `Child`, 65 and over prints `Senior`, everything else prints `Adult`.",
          stdin: ["70"],
          starter: "age = int(input())\n\n",
          tests: [
            { name: "70 is a Senior", out_exact: "Senior" },
            { name: "3 is Free", stdin: ["3"], out_exact: "Free" },
            { name: "12 is a Child", stdin: ["12"], out_exact: "Child" },
            { name: "30 is an Adult", stdin: ["30"], out_exact: "Adult" },
            { name: "65 is a Senior", stdin: ["65"], out_exact: "Senior" },
            { name: "5 is a Child, not Free", stdin: ["5"], out_exact: "Child" }
          ]
        },
        {
          kind: "predict", title: "Truthiness", difficulty: 3, concepts: ["truthiness"],
          prompt: "What prints?\n\n~~~py\nvalue = '0'\nif value:\n    print('A')\nelse:\n    print('B')\n~~~",
          choices: ["`A`", "`B`", "nothing", "an error"],
          answer: 0,
          explain: "`'0'` is a string with one character in it, so it is non-empty and therefore truthy. Only `''` is a falsy string."
        },
        {
          kind: "debug", title: "Broken block", difficulty: 2, concepts: ["indentation"],
          prompt: "Fix the indentation so `n = 3` prints only `small`.",
          starter: "n = 3\nif n > 10:\nprint('big')\nelse:\n    print('small')",
          tests: [{ name: "prints small", out_exact: "small" }]
        },
        {
          kind: "quiz", title: "Chain order", difficulty: 3, concepts: ["elif", "condition-design"],
          prompt: "In an `if/elif` chain testing overlapping ranges, which condition should come first?",
          choices: [
            "The one most likely to be true",
            "The most specific / narrowest one",
            "The shortest to type",
            "It makes no difference"
          ],
          answer: 1,
          explain: "The first matching branch wins, so a broad condition placed early swallows every narrower case below it — silently."
        },
        {
          kind: "code", title: "FizzBuzz, one number", difficulty: 3, concepts: ["elif", "modulo"],
          prompt: "Read one number. Print `FizzBuzz` if it divides by both 3 and 5, `Fizz` if only by 3, `Buzz` if only by 5, otherwise the number itself.",
          stdin: ["15"],
          starter: "n = int(input())\n\n",
          tests: [
            { name: "15 is FizzBuzz", out_exact: "FizzBuzz" },
            { name: "9 is Fizz", stdin: ["9"], out_exact: "Fizz" },
            { name: "10 is Buzz", stdin: ["10"], out_exact: "Buzz" },
            { name: "7 is itself", stdin: ["7"], out_exact: "7" },
            { name: "30 is FizzBuzz", stdin: ["30"], out_exact: "FizzBuzz" }
          ]
        }
      ]
    }
  });
})();
