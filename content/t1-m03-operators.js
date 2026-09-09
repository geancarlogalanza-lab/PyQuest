/* Tier 1 · Module 3 — Operators & Expressions */
(function () {
  const L = a => a.join("\n");

  PQ.defineModule({
    id: "m03", tier: 1, order: 3, icon: "🧮",
    title: "Operators & Expressions",
    blurb: "Arithmetic, the two operators everyone underestimates, and how truth is calculated.",
    intro: L([
      "An expression is anything Python can work out a value for. Programs are mostly expressions being combined,",
      "compared and stored. Two operators here — `//` and `%` — look like trivia and turn out to solve a surprising",
      "share of real problems."
    ]),
    concepts: [
      { id: "arithmetic", name: "arithmetic operators", importance: 1.3 },
      { id: "precedence", name: "operator precedence", importance: 1.2 },
      { id: "floor-div", name: "floor division //", importance: 1.2 },
      { id: "modulo", name: "modulo %", importance: 1.4 },
      { id: "exponent", name: "powers **" },
      { id: "comparison", name: "comparison operators", importance: 1.3 },
      { id: "logic-ops", name: "and / or / not", importance: 1.4 },
      { id: "augmented", name: "+= and friends" }
    ],

    lessons: [
      {
        id: "m03l1", title: "Arithmetic and precedence", minutes: 9,
        concepts: ["arithmetic", "precedence", "exponent", "augmented"],
        content: L([
          "## The operators",
          "",
          "| Operator | Meaning | Example |",
          "|---|---|---|",
          "| `+` `-` | add, subtract | `7 - 2` is `5` |",
          "| `*` | multiply | `7 * 2` is `14` |",
          "| `/` | divide (always a float) | `7 / 2` is `3.5` |",
          "| `//` | floor divide (whole part) | `7 // 2` is `3` |",
          "| `%` | remainder | `7 % 2` is `1` |",
          "| `**` | power | `7 ** 2` is `49` |",
          "",
          "~~~py",
          "print(7 + 2, 7 - 2, 7 * 2)",
          "print(7 / 2, 7 // 2, 7 % 2, 7 ** 2)",
          "~~~",
          "~~~out",
          "9 5 14",
          "3.5 3 1 49",
          "~~~",
          "",
          "## Precedence",
          "",
          "Python follows the maths rules you already know, with `**` at the top:",
          "",
          "1. `**`",
          "2. `-x` (negation)",
          "3. `*` `/` `//` `%`",
          "4. `+` `-`",
          "",
          "~~~py",
          "print(2 + 3 * 4)",
          "print((2 + 3) * 4)",
          "print(2 ** 3 ** 2)",
          "~~~",
          "~~~out",
          "14",
          "20",
          "512",
          "~~~",
          "",
          "That last one catches people: `**` groups **right to left**, so it is `2 ** (3 ** 2)` = `2 ** 9` = `512`,",
          "not `(2 ** 3) ** 2` = `64`.",
          "",
          ":::tip Brackets are free",
          "Nobody has ever been criticised for writing `(a * b) + c`. If you had to pause to work out the order,",
          "the next reader will too. Add the brackets.",
          ":::",
          "",
          "## Augmented assignment",
          "",
          "~~~py",
          "total = 10",
          "total += 5     # total = total + 5",
          "total -= 3     # 12",
          "total *= 2     # 24",
          "total //= 5    # 4",
          "print(total)",
          "~~~",
          "~~~out",
          "4",
          "~~~",
          "",
          "These are not just shorthand for typing — they say *update this thing* rather than *make a new value*,",
          "which is exactly what you mean when accumulating."
        ]),
        exercises: [
          {
            kind: "code", title: "Rectangle report", difficulty: 1,
            concepts: ["arithmetic"],
            prompt: L([
              "Given `width` and `height`, compute `area` and `perimeter`, then print:",
              "",
              "~~~text",
              "Area: 24",
              "Perimeter: 20",
              "~~~"
            ]),
            starter: "width = 6\nheight = 4\n\n",
            hints: ["Area is width times height.", "Perimeter is two widths plus two heights."],
            tests: [
              { name: "area is right", call: "area", expect: 24 },
              { name: "perimeter is right", call: "perimeter", expect: 20 },
              { name: "prints both lines", out_lines: ["Area: 24", "Perimeter: 20"] }
            ],
            solution: "width = 6\nheight = 4\n\narea = width * height\nperimeter = 2 * (width + height)\nprint(f'Area: {area}')\nprint(f'Perimeter: {perimeter}')"
          },
          {
            kind: "predict", title: "Right to left", difficulty: 3,
            concepts: ["precedence", "exponent"],
            prompt: "What does this print?\n\n~~~py\nprint(3 ** 2 ** 2)\n~~~",
            choices: ["`81`", "`36`", "`12`", "`9`"],
            answer: 0,
            explain: "`**` associates right to left, so this is `3 ** (2 ** 2)` = `3 ** 4` = `81`. Every other arithmetic operator groups left to right — `**` is the exception."
          },
          {
            kind: "debug", title: "Wrong average", difficulty: 2,
            concepts: ["precedence"],
            prompt: L([
              "This should print the average of the three scores (`70.0`), but it prints something much bigger.",
              "Fix it with brackets — do not change the numbers."
            ]),
            starter: "a = 60\nb = 70\nc = 80\naverage = a + b + c / 3\nprint(average)",
            hints: [
              "Division happens before addition, so only `c` is being divided.",
              "Wrap the sum in brackets."
            ],
            tests: [
              { name: "average is 70.0", call: "average", expect: 70.0 },
              { name: "prints 70.0", out_exact: "70.0" }
            ],
            solution: "a = 60\nb = 70\nc = 80\naverage = (a + b + c) / 3\nprint(average)",
            takeaway: "Precedence bugs never crash — they just quietly give the wrong answer. That makes them more dangerous than errors."
          },
          {
            kind: "code", title: "Compound interest", difficulty: 3,
            concepts: ["exponent", "arithmetic"],
            prompt: L([
              "£1000 is invested at 5% per year, compounded annually, for 10 years.",
              "",
              "The formula is `principal * (1 + rate) ** years`.",
              "",
              "Store the answer in `final_amount` and print it rounded to 2 decimal places:",
              "",
              "~~~text",
              "After 10 years: 1628.89",
              "~~~"
            ]),
            starter: "principal = 1000\nrate = 0.05\nyears = 10\n\n",
            hints: [
              "`(1 + rate)` is `1.05`.",
              "`**` raises to a power.",
              "`f'After {years} years: {final_amount:.2f}'`"
            ],
            tests: [
              { name: "final_amount is correct", code: "assert abs(final_amount - 1628.894626777442) < 1e-6, 'check the formula'" },
              { name: "prints the formatted line", out_exact: "After 10 years: 1628.89" }
            ],
            solution: "principal = 1000\nrate = 0.05\nyears = 10\n\nfinal_amount = principal * (1 + rate) ** years\nprint(f'After {years} years: {final_amount:.2f}')"
          }
        ]
      },

      {
        id: "m03l2", title: "The two you will use constantly", minutes: 10,
        concepts: ["floor-div", "modulo"],
        content: L([
          "## // and % are a pair",
          "",
          "Together they answer *how many whole times does this fit, and what is left over?*",
          "",
          "~~~py",
          "total_minutes = 197",
          "hours = total_minutes // 60",
          "minutes = total_minutes % 60",
          "print(f'{hours}h {minutes}m')",
          "~~~",
          "~~~out",
          "3h 17m",
          "~~~",
          "",
          "That one pattern converts seconds to time, pence to pounds, items to pages, inches to feet.",
          "",
          "## What % is really for",
          "",
          "### 1. Testing divisibility",
          "",
          "~~~py",
          "print(10 % 2)   # 0  -> even",
          "print(11 % 2)   # 1  -> odd",
          "print(15 % 5)   # 0  -> a multiple of 5",
          "~~~",
          "",
          "`n % k == 0` means *`n` divides exactly by `k`*. This is how you check for even numbers, multiples,",
          "and \"every 10th item\".",
          "",
          "### 2. Wrapping around",
          "",
          "~~~py",
          "print((9 + 5) % 12)   # 2  -- 5 hours after 9 o'clock",
          "~~~",
          "",
          "Anything that cycles — clock faces, days of the week, positions on a board, colours in a repeating",
          "palette — is `%` in disguise.",
          "",
          "### 3. Taking the last digits",
          "",
          "~~~py",
          "print(4728 % 10)    # 8    last digit",
          "print(4728 % 100)   # 28   last two digits",
          "print(4728 // 10)   # 472  everything except the last digit",
          "~~~",
          "",
          ":::trap Negative numbers",
          "In Python, `-7 // 2` is `-4` (it floors, i.e. rounds *down*, not toward zero) and `-7 % 2` is `1`.",
          "The result of `%` always takes the sign of the right-hand side. This differs from C and Java —",
          "worth knowing before it surprises you.",
          ":::"
        ]),
        exercises: [
          {
            kind: "code", title: "Seconds to h:m:s", difficulty: 2,
            concepts: ["floor-div", "modulo"],
            prompt: L([
              "Convert `total_seconds` into hours, minutes and seconds and print it as `2:46:40`.",
              "",
              "Store the three parts in `hours`, `minutes` and `seconds`."
            ]),
            starter: "total_seconds = 10000\n\n",
            hints: [
              "There are 3600 seconds in an hour.",
              "After removing the hours, `total_seconds % 3600` is what remains.",
              "Then split that remainder with `// 60` and `% 60`."
            ],
            tests: [
              { name: "hours is 2", call: "hours", expect: 2 },
              { name: "minutes is 46", call: "minutes", expect: 46 },
              { name: "seconds is 40", call: "seconds", expect: 40 },
              { name: "prints 2:46:40", out_exact: "2:46:40" }
            ],
            solution: L([
              "total_seconds = 10000",
              "",
              "hours = total_seconds // 3600",
              "remainder = total_seconds % 3600",
              "minutes = remainder // 60",
              "seconds = remainder % 60",
              "print(f'{hours}:{minutes}:{seconds}')"
            ])
          },
          {
            kind: "code", title: "Odd or even", difficulty: 1,
            concepts: ["modulo"],
            prompt: L([
              "Set `is_even` to `True` if `number` is even and `False` if it is odd.",
              "",
              "Write it as a single expression — no `if` needed. A comparison already produces a boolean."
            ]),
            starter: "number = 17\n\nis_even = None  # replace None with your expression\n",
            hints: ["`number % 2` is `0` for even numbers.", "`number % 2 == 0` is already `True` or `False`."],
            forbids: [{ re: "\\bif\\b", msg: "Do it without an if statement" }],
            tests: [
              { name: "17 is not even", call: "is_even", expect: false },
              { name: "the expression works generally", code: "assert (lambda n: n % 2 == 0)(4) is True" }
            ],
            solution: "number = 17\n\nis_even = number % 2 == 0",
            takeaway: "Beginners write `if x: return True else: return False`. A comparison *is* the boolean — just use it."
          },
          {
            kind: "code", title: "Clock arithmetic", difficulty: 2,
            concepts: ["modulo"],
            prompt: L([
              "It is `start_hour` on a 24-hour clock. Print what hour it will be after `elapsed` hours.",
              "",
              "With `start_hour = 22` and `elapsed = 5`, the answer is `3`."
            ]),
            starter: "start_hour = 22\nelapsed = 5\n\n",
            hints: ["Add them, then wrap with `% 24`."],
            tests: [
              { name: "22 + 5 wraps to 3", out_exact: "3" },
              { name: "the formula is right", code: "assert (22 + 5) % 24 == 3" }
            ],
            solution: "start_hour = 22\nelapsed = 5\n\nprint((start_hour + elapsed) % 24)"
          },
          {
            kind: "code", title: "Split the change", difficulty: 3,
            concepts: ["floor-div", "modulo"],
            prompt: L([
              "A bill of `total_pence` is split between `people`. Everyone pays a whole number of pence and any",
              "leftover pennies go to the last person.",
              "",
              "Store the per-person share in `each` and the last person amount in `last`.","","With `total_pence = 1000` and `people = 3`, print:",
              "",
              "~~~text",
              "Each pays 333p",
              "Last person pays 334p",
              "~~~"
            ]),
            starter: "total_pence = 1000\npeople = 3\n\n",
            hints: [
              "`each = total_pence // people`",
              "The leftover is `total_pence % people`.",
              "The last person pays their share plus the whole leftover."
            ],
            tests: [
              { name: "each share is 333", call: "each", expect: 333 },
              { name: "prints both lines", out_lines: ["Each pays 333p", "Last person pays 334p"] },
              { name: "nothing is lost", code: "assert each * (people - 1) + last == total_pence, 'the shares must add up to the total'" }
            ],
            solution: L([
              "total_pence = 1000",
              "people = 3",
              "",
              "each = total_pence // people",
              "last = each + total_pence % people",
              "print(f'Each pays {each}p')",
              "print(f'Last person pays {last}p')"
            ]),
            takeaway: "Splitting money is a `//` and `%` problem. Doing it with `/` and rounding is how you lose a penny — and real accounting systems care."
          }
        ]
      },

      {
        id: "m03l3", title: "Comparing and combining", minutes: 10,
        concepts: ["comparison", "logic-ops", "bool-type"],
        content: L([
          "## Comparisons produce booleans",
          "",
          "| Operator | Means |",
          "|---|---|",
          "| `==` | equal to |",
          "| `!=` | not equal to |",
          "| `<` `>` | less / greater than |",
          "| `<=` `>=` | less / greater than or equal |",
          "",
          "~~~py",
          "age = 20",
          "print(age >= 18)",
          "print(age == 21)",
          "print(age != 21)",
          "~~~",
          "~~~out",
          "True",
          "False",
          "True",
          "~~~",
          "",
          ":::trap = versus ==",
          "`=` assigns. `==` compares. Writing `if age = 18:` is a `SyntaxError` — which is Python doing you a",
          "favour, because in some languages it silently assigns and the bug survives to production.",
          ":::",
          "",
          "## Chaining",
          "",
          "Python lets you write comparisons the way maths does:",
          "",
          "~~~py",
          "score = 75",
          "print(0 <= score <= 100)",
          "~~~",
          "~~~out",
          "True",
          "~~~",
          "",
          "Most languages cannot do this. Use it — `0 <= score <= 100` is clearer than `score >= 0 and score <= 100`.",
          "",
          "## and / or / not",
          "",
          "| Expression | True when |",
          "|---|---|",
          "| `a and b` | **both** are true |",
          "| `a or b` | **at least one** is true |",
          "| `not a` | `a` is false |",
          "",
          "~~~py",
          "has_ticket = True",
          "is_adult = False",
          "",
          "print(has_ticket and is_adult)   # False",
          "print(has_ticket or is_adult)    # True",
          "print(not is_adult)              # True",
          "~~~",
          "",
          "### Short-circuiting",
          "",
          "Python stops as soon as the answer is settled:",
          "",
          "- `False and anything` → `False`, and the right side is **never evaluated**",
          "- `True or anything` → `True`, same",
          "",
          "This is not trivia. It lets you write safe guards:",
          "",
          "~~~py",
          "count = 0",
          "if count != 0 and total / count > 5:",
          "    print('high average')",
          "~~~",
          "",
          "The division never happens when `count` is `0`, so there is no `ZeroDivisionError`. Order matters.",
          "",
          ":::trap The classic mistake",
          "`if name == 'Ada' or 'Grace':` does **not** do what it looks like. It means",
          "`(name == 'Ada') or ('Grace')`, and a non-empty string is always truthy — so it is always `True`.",
          "Write `if name == 'Ada' or name == 'Grace':`, or better, `if name in ('Ada', 'Grace'):`.",
          ":::"
        ]),
        exercises: [
          {
            kind: "code", title: "Eligibility check", difficulty: 2,
            concepts: ["comparison", "logic-ops"],
            prompt: L([
              "Set `can_vote` to `True` only when the person is at least 18 **and** is registered.",
              "",
              "Write it as one expression, no `if`."
            ]),
            starter: "age = 17\nis_registered = True\n\ncan_vote = None  # replace None with your expression\n",
            hints: ["Combine a comparison and a boolean with `and`."],
            forbids: [{ re: "\\bif\\b", msg: "One expression, no if" }],
            tests: [
              { name: "17 and registered cannot vote", call: "can_vote", expect: false },
              { name: "logic is right for 18 + registered", code: "assert (18 >= 18 and True) is True" }
            ],
            solution: "age = 17\nis_registered = True\n\ncan_vote = age >= 18 and is_registered"
          },
          {
            kind: "predict", title: "The or trap", difficulty: 3,
            concepts: ["logic-ops"],
            prompt: L([
              "What does this print?",
              "",
              "~~~py",
              "name = 'Bob'",
              "print(name == 'Ada' or 'Grace')",
              "~~~"
            ]),
            choices: ["`False`", "`True`", "`Grace`", "An error"],
            answer: 2,
            explain: L([
              "Python evaluates `(name == 'Ada')` which is `False`, then falls through to the right side of `or`",
              "and returns **that value itself** — the string `'Grace'`.",
              "",
              "`or` does not return `True`/`False`; it returns the first truthy operand. Here that is `'Grace'`,",
              "which prints as `Grace` and would count as true in an `if`. This is why the shortcut is a real bug",
              "and not just bad style. Write `name in ('Ada', 'Grace')`."
            ])
          },
          {
            kind: "code", title: "Range check", difficulty: 2,
            concepts: ["comparison"],
            prompt: L([
              "Set `is_valid_percentage` to whether `value` sits between 0 and 100 inclusive.",
              "",
              "Use a **chained** comparison — the checks require it."
            ]),
            starter: "value = 142\n\nis_valid_percentage = None  # replace None with your expression\n",
            hints: ["`0 <= value <= 100`"],
            requires: [{ re: "0\\s*<=\\s*value\\s*<=\\s*100", msg: "Use a chained comparison like 0 <= value <= 100" }],
            tests: [
              { name: "142 is not a valid percentage", call: "is_valid_percentage", expect: false }
            ],
            solution: "value = 142\n\nis_valid_percentage = 0 <= value <= 100"
          },
          {
            kind: "debug", title: "Divide by zero, avoided", difficulty: 3,
            concepts: ["logic-ops"],
            prompt: L([
              "This crashes with a `ZeroDivisionError`. Fix it by reordering the condition so short-circuiting",
              "protects the division. It should print `no data` for these values.",
              "",
              "Do not add an `if/else` block — just fix the one condition."
            ]),
            starter: L([
              "total = 0",
              "count = 0",
              "",
              "if total / count > 5 and count != 0:",
              "    print('high average')",
              "else:",
              "    print('no data')"
            ]),
            hints: [
              "`and` evaluates left to right and stops early when the left side is false.",
              "Put the `count != 0` guard **first**."
            ],
            tests: [
              { name: "prints no data without crashing", out_exact: "no data" }
            ],
            solution: L([
              "total = 0",
              "count = 0",
              "",
              "if count != 0 and total / count > 5:",
              "    print('high average')",
              "else:",
              "    print('no data')"
            ]),
            takeaway: "Guard first, use second. `if x is not None and x.value > 3` is the same pattern you will write for the rest of your life."
          }
        ]
      }
    ],

    checkpoint: {
      id: "m03cp", pass: 0.8,
      title: "Checkpoint: Operators & Expressions",
      items: [
        {
          kind: "predict", title: "Order of operations", difficulty: 2, concepts: ["precedence"],
          prompt: "What is printed?\n\n~~~py\nprint(10 - 2 * 3 + 1)\n~~~",
          choices: ["`25`", "`5`", "`-1`", "`23`"],
          answer: 1,
          explain: "`2 * 3` first, giving `10 - 6 + 1`, then left to right: `5`."
        },
        {
          kind: "code", title: "Pounds and pence", difficulty: 2, concepts: ["floor-div", "modulo"],
          prompt: "`pence = 1275`. Print exactly `12 pounds and 75 pence`.",
          starter: "pence = 1275\n",
          tests: [{ name: "exact output", out_exact: "12 pounds and 75 pence" }]
        },
        {
          kind: "code", title: "Multiple of three", difficulty: 2, concepts: ["modulo"],
          prompt: "Set `divisible` to whether `n` divides exactly by 3. One expression, no `if`.",
          starter: "n = 51\n\ndivisible = None  # replace None with your expression\n",
          forbids: [{ re: "\\bif\\b", msg: "No if statement" }],
          tests: [
            { name: "51 is divisible by 3", call: "divisible", expect: true },
            { name: "the rule is % based", code: "assert (52 % 3 == 0) is False" }
          ]
        },
        {
          kind: "quiz", title: "Short circuit", difficulty: 3, concepts: ["logic-ops"],
          prompt: "In `a() and b()`, when is `b()` *not* called?",
          choices: [
            "When `a()` returns something truthy",
            "When `a()` returns something falsy",
            "Never — both always run",
            "Only if `b` is undefined"
          ],
          answer: 1,
          explain: "`and` can settle on a false left side alone, so it skips the right side entirely. That is what makes `if x != 0 and total / x > 1` safe."
        },
        {
          kind: "debug", title: "Fix the average", difficulty: 3, concepts: ["precedence"],
          prompt: "This should print `20.0`. Fix it without changing any numbers.",
          starter: "result = 10 + 30 / 2\nprint(result)",
          tests: [{ name: "prints 20.0", out_exact: "20.0" }]
        }
      ]
    }
  });
})();
