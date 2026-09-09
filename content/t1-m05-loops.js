/* Tier 1 · Module 5 — Loops */
(function () {
  const L = a => a.join("\n");

  PQ.defineModule({
    id: "m05", tier: 1, order: 5, icon: "🔁",
    title: "Loops",
    blurb: "Repetition, the accumulator pattern, and how to stop a loop that will not stop.",
    intro: L([
      "Loops are where programs stop being calculators and start being useful. Nearly every real task —",
      "totalling a bill, searching a list, retrying a request, drawing a grid — is a loop with a pattern",
      "you will recognise instantly once you have written it four or five times."
    ]),
    concepts: [
      { id: "while-loop", name: "while loops", importance: 1.4 },
      { id: "for-loop", name: "for loops", importance: 1.6 },
      { id: "range-fn", name: "range()", importance: 1.4 },
      { id: "accumulator", name: "accumulator pattern", importance: 1.5 },
      { id: "break-continue", name: "break and continue", importance: 1.3 },
      { id: "infinite-loop", name: "avoiding infinite loops", importance: 1.3 },
      { id: "loop-patterns", name: "counting and searching", importance: 1.4 },
      { id: "nested-loop", name: "nested loops" }
    ],

    lessons: [
      {
        id: "m05l1", title: "while: repeat until done", minutes: 11,
        concepts: ["while-loop", "infinite-loop", "accumulator"],
        content: L([
          "## The shape of a while loop",
          "",
          "~~~py",
          "count = 3",
          "while count > 0:",
          "    print(count)",
          "    count -= 1",
          "print('Go!')",
          "~~~",
          "~~~out",
          "3",
          "2",
          "1",
          "Go!",
          "~~~",
          "",
          "Python checks the condition, runs the block if it is true, then checks **again**. It keeps going until",
          "the condition is false, and only then moves on.",
          "",
          "Three things must be true or the loop misbehaves:",
          "",
          "1. something is set up **before** the loop (`count = 3`)",
          "2. the condition mentions that something (`count > 0`)",
          "3. the body **changes** it (`count -= 1`)",
          "",
          "Drop step 3 and the loop never ends.",
          "",
          ":::trap The infinite loop",
          "~~~py",
          "count = 3",
          "while count > 0:",
          "    print(count)      # count never changes!",
          "~~~",
          "",
          "This prints `3` forever. PyQuest stops your program after 12 seconds and tells you — but on your own",
          "machine you would hit `Ctrl+C`. When a loop hangs, the first question is always:",
          "*what inside the body is supposed to move the condition toward false?*",
          ":::",
          "",
          "## The accumulator pattern",
          "",
          "This is the single most reused shape in programming:",
          "",
          "~~~py",
          "total = 0          # 1. start empty",
          "n = 1",
          "while n <= 5:",
          "    total += n     # 2. add to it each time round",
          "    n += 1",
          "print(total)       # 3. use it after",
          "~~~",
          "~~~out",
          "15",
          "~~~",
          "",
          "Start with an empty accumulator (`0` for sums, `1` for products, `''` for text, `[]` for lists),",
          "add to it inside the loop, use it after. You will write this hundreds of times.",
          "",
          "## while with a sentinel",
          "",
          "`while` shines when you do not know how many times you will loop:",
          "",
          "~~~py",
          "total = 0",
          "line = input()",
          "while line != 'done':",
          "    total += int(line)",
          "    line = input()",
          "print(total)",
          "~~~",
          "",
          "Read, check, act, read again. Notice `input()` appears twice — once before the loop and once at the",
          "bottom of it. That duplication is the classic shape, and you will meet a cleaner alternative",
          "(`while True` plus `break`) in the next lesson but one."
        ]),
        exercises: [
          {
            kind: "code", title: "Countdown", difficulty: 1,
            concepts: ["while-loop"],
            prompt: L([
              "Print the numbers from 5 down to 1, one per line, then `Liftoff!`.",
              "",
              "Use a `while` loop — the checks require it."
            ]),
            starter: "count = 5\n\n",
            requires: [{ contains: "while", msg: "Use a while loop" }],
            hints: ["Loop while `count > 0`.", "Print, then decrease `count` by 1 inside the loop."],
            tests: [
              { name: "counts down then lifts off", out_lines: ["5", "4", "3", "2", "1", "Liftoff!"] }
            ],
            solution: "count = 5\n\nwhile count > 0:\n    print(count)\n    count -= 1\nprint('Liftoff!')"
          },
          {
            kind: "debug", title: "It never stops", difficulty: 2,
            concepts: ["infinite-loop", "while-loop"],
            prompt: L([
              "This loop runs forever. Run it, watch PyQuest stop it, then fix it so it prints 1 to 5.",
              "",
              "Change as little as possible."
            ]),
            starter: "n = 1\nwhile n <= 5:\n    print(n)",
            hints: ["Nothing in the body changes `n`.", "Add `n += 1` inside the loop, at the same indentation as the print."],
            tests: [
              { name: "prints 1 to 5 and stops", out_lines: ["1", "2", "3", "4", "5"] }
            ],
            solution: "n = 1\nwhile n <= 5:\n    print(n)\n    n += 1",
            takeaway: "Every `while` needs an escape route. Before you run one, find the line that moves the condition toward false. If you cannot find it, it is not there."
          },
          {
            kind: "code", title: "Sum until done", difficulty: 3,
            concepts: ["while-loop", "accumulator"],
            prompt: L([
              "Read numbers one per line until the word `done` arrives. Print the total.",
              "",
              "For the inputs `4`, `10`, `6`, `done` the output is `20`. The word `done` must not be added to anything."
            ]),
            stdin: ["4", "10", "6", "done"],
            starter: "total = 0\n\n",
            hints: [
              "Read one line before the loop starts.",
              "`while line != 'done':` — add it to the total, then read the next line.",
              "Remember `input()` gives text, so convert with `int()`."
            ],
            tests: [
              { name: "4 + 10 + 6 is 20", out_exact: "20" },
              { name: "works with different numbers", stdin: ["1", "2", "3", "4", "done"], out_exact: "10" },
              { name: "handles an immediate done", stdin: ["done"], out_exact: "0" }
            ],
            solution: L([
              "total = 0",
              "",
              "line = input()",
              "while line != 'done':",
              "    total += int(line)",
              "    line = input()",
              "print(total)"
            ]),
            takeaway: "Read-before-loop, read-at-the-bottom is the standard sentinel shape. The empty case (`done` first) is the one people forget to test."
          },
          {
            kind: "code", title: "Digits, backwards", difficulty: 3,
            concepts: ["while-loop", "modulo", "floor-div"],
            prompt: L([
              "Using a `while` loop and arithmetic only — no strings, no `str()` — print the digits of `number`",
              "one per line, starting from the last.",
              "",
              "For `4728` print `8`, `2`, `7`, `4`."
            ]),
            starter: "number = 4728\n\n",
            forbids: [{ contains: "str(", msg: "Arithmetic only, no str()" }],
            hints: [
              "`number % 10` gives the last digit.",
              "`number // 10` removes the last digit.",
              "Loop while `number > 0`."
            ],
            tests: [
              { name: "4728 prints backwards", out_lines: ["8", "2", "7", "4"] }
            ],
            solution: L([
              "number = 4728",
              "",
              "while number > 0:",
              "    print(number % 10)",
              "    number = number // 10"
            ]),
            takeaway: "`% 10` and `// 10` together take a number apart digit by digit. This trick appears in checksum, hashing and puzzle code constantly."
          }
        ]
      },

      {
        id: "m05l2", title: "for and range", minutes: 11,
        concepts: ["for-loop", "range-fn", "accumulator"],
        content: L([
          "## for: do this for each thing",
          "",
          "~~~py",
          "for letter in 'cat':",
          "    print(letter)",
          "~~~",
          "~~~out",
          "c",
          "a",
          "t",
          "~~~",
          "",
          "`for` walks through a collection and hands you one item at a time. No counter to set up, no counter to",
          "increment, no way to forget and loop forever. **When you know what you are looping over, use `for`.**",
          "",
          "## range: numbers to loop over",
          "",
          "| Call | Produces |",
          "|---|---|",
          "| `range(5)` | 0 1 2 3 4 |",
          "| `range(2, 6)` | 2 3 4 5 |",
          "| `range(0, 10, 2)` | 0 2 4 6 8 |",
          "| `range(5, 0, -1)` | 5 4 3 2 1 |",
          "",
          "~~~py",
          "for i in range(5):",
          "    print(i)",
          "~~~",
          "~~~out",
          "0",
          "1",
          "2",
          "3",
          "4",
          "~~~",
          "",
          ":::warn Two things about range",
          "1. It starts at **0** by default.",
          "2. The end value is **excluded**. `range(1, 5)` gives 1, 2, 3, 4 — no 5.",
          "",
          "Both of those trip people up daily. `range(1, n + 1)` is how you count 1 to n.",
          ":::",
          "",
          "## The same accumulator, cleaner",
          "",
          "~~~py",
          "total = 0",
          "for n in range(1, 6):",
          "    total += n",
          "print(total)",
          "~~~",
          "~~~out",
          "15",
          "~~~",
          "",
          "Compare that to the `while` version: no `n = 1` beforehand, no `n += 1` to forget. This is why `for` is",
          "the default choice.",
          "",
          "## Nested loops",
          "",
          "A loop inside a loop runs the inner one completely for every step of the outer one:",
          "",
          "~~~py",
          "for row in range(1, 4):",
          "    for col in range(1, 4):",
          "        print(row * col, end=' ')",
          "    print()",
          "~~~",
          "~~~out",
          "1 2 3 ",
          "2 4 6 ",
          "3 6 9 ",
          "~~~",
          "",
          "`end=' '` tells `print` to finish with a space instead of a newline, and the bare `print()` at the end",
          "of each row emits the newline. Nested loops multiply: 3 rows × 3 columns is 9 iterations."
        ]),
        exercises: [
          {
            kind: "code", title: "One to ten", difficulty: 1,
            concepts: ["for-loop", "range-fn"],
            prompt: "Print the numbers 1 to 10, one per line. Use `for` and `range`.",
            starter: "",
            requires: [{ contains: "range", msg: "Use range()" }],
            hints: ["`range(10)` starts at 0 and stops at 9.", "You want `range(1, 11)`."],
            tests: [
              { name: "prints 1 through 10", out_lines: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"] }
            ],
            solution: "for n in range(1, 11):\n    print(n)"
          },
          {
            kind: "predict", title: "Off by one", difficulty: 2,
            concepts: ["range-fn"],
            prompt: L([
              "How many lines does this print, and what is the last one?",
              "",
              "~~~py",
              "for i in range(3, 8):",
              "    print(i)",
              "~~~"
            ]),
            choices: ["5 lines, last is 7", "5 lines, last is 8", "6 lines, last is 8", "4 lines, last is 7"],
            answer: 0,
            explain: "`range(3, 8)` yields 3, 4, 5, 6, 7 — the stop value is never included. The count is `stop - start` = 5."
          },
          {
            kind: "code", title: "Times table", difficulty: 2,
            concepts: ["for-loop", "range-fn"],
            prompt: L([
              "Print the 7 times table from 1 to 10, formatted like this:",
              "",
              "~~~text",
              "7 x 1 = 7",
              "7 x 2 = 14",
              "...",
              "7 x 10 = 70",
              "~~~"
            ]),
            starter: "n = 7\n\n",
            hints: ["Loop `i` over `range(1, 11)`.", "`print(f'{n} x {i} = {n * i}')`"],
            tests: [
              { name: "first line correct", out: "7 x 1 = 7" },
              { name: "last line correct", out: "7 x 10 = 70" },
              { name: "ten lines exactly", code: "assert len([l for l in _OUT.strip().split('\\n') if l.strip()]) == 10, 'expected exactly 10 lines'" },
              { name: "middle line correct", out: "7 x 6 = 42" }
            ],
            solution: "n = 7\n\nfor i in range(1, 11):\n    print(f'{n} x {i} = {n * i}')"
          },
          {
            kind: "code", title: "Sum of even numbers", difficulty: 2,
            concepts: ["accumulator", "range-fn"],
            prompt: L([
              "Store in `total` the sum of every even number from 1 to 100 inclusive, then print it.",
              "",
              "The answer is `2550`. Solve it with a loop — the checks forbid `sum()`."
            ]),
            starter: "total = 0\n\n",
            forbids: [{ contains: "sum(", msg: "Use a loop, not sum()" }],
            hints: [
              "`range(2, 101, 2)` walks the even numbers directly.",
              "Or loop over all of them and skip the odd ones with `%`."
            ],
            tests: [
              { name: "total is 2550", call: "total", expect: 2550 },
              { name: "prints 2550", out_exact: "2550" }
            ],
            solution: "total = 0\n\nfor n in range(2, 101, 2):\n    total += n\n\nprint(total)"
          },
          {
            kind: "code", title: "Triangle", difficulty: 3,
            concepts: ["nested-loop", "for-loop"],
            prompt: L([
              "Print a left-aligned triangle of stars with `height` rows:",
              "",
              "~~~text",
              "*",
              "**",
              "***",
              "****",
              "*****",
              "~~~"
            ]),
            starter: "height = 5\n\n",
            hints: [
              "Row `i` has `i` stars.",
              "You can build the line with a nested loop and `end=''`, or with string repetition: `'*' * i`."
            ],
            tests: [
              { name: "five rows of stars", out_lines: ["*", "**", "***", "****", "*****"] }
            ],
            solution: "height = 5\n\nfor i in range(1, height + 1):\n    print('*' * i)",
            solutionNote: "`'*' * i` repeats a string — often clearer than a nested loop when the inner loop only builds text."
          }
        ]
      },

      {
        id: "m05l3", title: "break, continue and loop patterns", minutes: 12,
        concepts: ["break-continue", "loop-patterns", "for-loop"],
        content: L([
          "## break: leave the loop now",
          "",
          "~~~py",
          "for n in range(1, 100):",
          "    if n * n > 50:",
          "        print(f'{n} is the first whose square exceeds 50')",
          "        break",
          "~~~",
          "~~~out",
          "8 is the first whose square exceeds 50",
          "~~~",
          "",
          "`break` abandons the loop immediately. Nothing else in the body runs and no further iterations happen.",
          "",
          "## continue: skip to the next round",
          "",
          "~~~py",
          "for n in range(1, 11):",
          "    if n % 2 == 0:",
          "        continue",
          "    print(n)",
          "~~~",
          "~~~out",
          "1",
          "3",
          "5",
          "7",
          "9",
          "~~~",
          "",
          "`continue` skips the rest of *this* iteration and goes back to the top. It is a guard clause for loops.",
          "",
          "## while True + break",
          "",
          "This removes the duplicated `input()` from the sentinel pattern:",
          "",
          "~~~py",
          "total = 0",
          "while True:",
          "    line = input()",
          "    if line == 'done':",
          "        break",
          "    total += int(line)",
          "print(total)",
          "~~~",
          "",
          "Read once, decide, act. It is the shape most professionals reach for.",
          "",
          ":::warn Use break honestly",
          "`while True` with a `break` is fine and idiomatic. `while True` **without** a reachable `break` is a hang.",
          "Every `while True` you write should have an obvious exit you can point at.",
          ":::",
          "",
          "## The four patterns worth memorising",
          "",
          "**Accumulate**",
          "~~~py",
          "total = 0",
          "for x in values:",
          "    total += x",
          "~~~",
          "",
          "**Count matches**",
          "~~~py",
          "count = 0",
          "for x in values:",
          "    if x > 10:",
          "        count += 1",
          "~~~",
          "",
          "**Track the best so far**",
          "~~~py",
          "biggest = values[0]",
          "for x in values:",
          "    if x > biggest:",
          "        biggest = x",
          "~~~",
          "",
          "**Search and stop**",
          "~~~py",
          "found = None",
          "for x in values:",
          "    if x.startswith('a'):",
          "        found = x",
          "        break",
          "~~~",
          "",
          "Almost every loop you write for the next year will be one of these four, or two of them combined."
        ]),
        exercises: [
          {
            kind: "code", title: "First multiple", difficulty: 2,
            concepts: ["break-continue"],
            prompt: L([
              "Find and print the first number above 100 that divides exactly by both 7 and 11.",
              "",
              "Print only that one number, then stop looping."
            ]),
            starter: "",
            requires: [{ contains: "break", msg: "Stop the loop with break once you find it" }],
            hints: ["Loop from 101 upwards.", "Check `n % 7 == 0 and n % 11 == 0`.", "`break` after printing."],
            tests: [
              { name: "prints 154 and nothing else", out_exact: "154" }
            ],
            solution: "for n in range(101, 1000):\n    if n % 7 == 0 and n % 11 == 0:\n        print(n)\n        break"
          },
          {
            kind: "code", title: "Skip the bad rows", difficulty: 2,
            concepts: ["break-continue"],
            prompt: L([
              "Read 6 lines. Some are numbers and some are the word `skip`.",
              "Add up only the numbers and print the total, using `continue` to skip the others.",
              "",
              "For `10`, `skip`, `5`, `skip`, `7`, `3` the total is `25`."
            ]),
            stdin: ["10", "skip", "5", "skip", "7", "3"],
            starter: "total = 0\n\nfor _ in range(6):\n    line = input()\n",
            requires: [{ contains: "continue", msg: "Use continue" }],
            hints: ["`if line == 'skip': continue`", "Otherwise add `int(line)` to the total."],
            tests: [
              { name: "total is 25", out_exact: "25" },
              { name: "works when all are skipped", stdin: ["skip", "skip", "skip", "skip", "skip", "skip"], out_exact: "0" }
            ],
            solution: L([
              "total = 0",
              "",
              "for _ in range(6):",
              "    line = input()",
              "    if line == 'skip':",
              "        continue",
              "    total += int(line)",
              "",
              "print(total)"
            ]),
            solutionNote: "`_` is the conventional name for a loop variable you do not use."
          },
          {
            kind: "code", title: "Largest so far", difficulty: 3,
            concepts: ["loop-patterns"],
            prompt: L([
              "Read 5 numbers and print the largest one. Use the *track the best so far* pattern —",
              "the checks forbid `max()` and `sorted()`.",
              "",
              "For `12`, `45`, `7`, `45`, `3` print `45`."
            ]),
            stdin: ["12", "45", "7", "45", "3"],
            starter: "",
            forbids: [
              { contains: "max(", msg: "Do it by hand, without max()" },
              { contains: "sorted(", msg: "Do it by hand, without sorted()" }
            ],
            hints: [
              "Read the first number before the loop and treat it as the best so far.",
              "Then loop 4 more times, replacing the best whenever you see something larger.",
              "Alternatively start `biggest` at a very small number — but reading the first value is more robust."
            ],
            tests: [
              { name: "finds 45", out_exact: "45" },
              { name: "works when the largest is first", stdin: ["99", "1", "2", "3", "4"], out_exact: "99" },
              { name: "works with negatives", stdin: ["-5", "-2", "-9", "-40", "-3"], out_exact: "-2" }
            ],
            solution: L([
              "biggest = int(input())",
              "",
              "for _ in range(4):",
              "    n = int(input())",
              "    if n > biggest:",
              "        biggest = n",
              "",
              "print(biggest)"
            ]),
            takeaway: "Starting `biggest = 0` is the classic bug: it breaks the moment every value is negative. Seed from real data instead."
          },
          {
            kind: "code", title: "Prime check", difficulty: 4,
            concepts: ["loop-patterns", "break-continue", "modulo"],
            prompt: L([
              "Read a number of 2 or more and print `prime` or `not prime`.",
              "",
              "A number is prime when nothing between 2 and `n - 1` divides it exactly.",
              "Stop checking as soon as you find a divisor — do not keep going pointlessly."
            ]),
            stdin: ["97"],
            starter: "n = int(input())\n\n",
            hints: [
              "Use a flag: `is_prime = True` before the loop.",
              "Inside, `if n % d == 0:` set the flag to `False` and `break`.",
              "You only need to test divisors up to the square root of `n`, but `range(2, n)` is fine here."
            ],
            tests: [
              { name: "97 is prime", out_exact: "prime" },
              { name: "91 is not (7 x 13)", stdin: ["91"], out_exact: "not prime" },
              { name: "2 is prime", stdin: ["2"], out_exact: "prime" },
              { name: "9 is not", stdin: ["9"], out_exact: "not prime" },
              { name: "large prime is fast enough", stdin: ["7919"], out_exact: "prime" }
            ],
            solution: L([
              "n = int(input())",
              "",
              "is_prime = True",
              "for d in range(2, n):",
              "    if n % d == 0:",
              "        is_prime = False",
              "        break",
              "",
              "if is_prime:",
              "    print('prime')",
              "else:",
              "    print('not prime')"
            ]),
            takeaway: "The flag-plus-break pattern answers *does any item satisfy this?* Later you will write the same thing as `any(...)` in one line — but knowing the loop underneath is what lets you debug it."
          }
        ]
      }
    ],

    checkpoint: {
      id: "m05cp", pass: 0.8,
      title: "Checkpoint: Loops",
      items: [
        {
          kind: "code", title: "Factorial", difficulty: 3, concepts: ["accumulator", "for-loop"],
          prompt: "Read a number `n` and print `n` factorial — the product of every whole number from 1 to n. For `5` print `120`. For `0` print `1`.",
          stdin: ["5"],
          starter: "n = int(input())\n\n",
          tests: [
            { name: "5! is 120", out_exact: "120" },
            { name: "0! is 1", stdin: ["0"], out_exact: "1" },
            { name: "1! is 1", stdin: ["1"], out_exact: "1" },
            { name: "10! is 3628800", stdin: ["10"], out_exact: "3628800" }
          ]
        },
        {
          kind: "predict", title: "range boundaries", difficulty: 2, concepts: ["range-fn"],
          prompt: "How many times does the body run?\n\n~~~py\nfor i in range(2, 20, 3):\n    pass\n~~~",
          choices: ["6", "7", "18", "5"],
          answer: 0,
          explain: "It yields 2, 5, 8, 11, 14, 17 — the next would be 20, which is excluded. Six iterations."
        },
        {
          kind: "debug", title: "Stop the hang", difficulty: 3, concepts: ["infinite-loop"],
          prompt: "This should print 10, 8, 6, 4, 2 and stop. Fix it.",
          starter: "n = 10\nwhile n > 0:\n    print(n)\n    n -= 0",
          tests: [{ name: "counts down by two", out_lines: ["10", "8", "6", "4", "2"] }]
        },
        {
          kind: "code", title: "Count the vowels", difficulty: 3, concepts: ["loop-patterns", "for-loop"],
          prompt: "Read a word and print how many vowels (`a e i o u`) it contains. Assume lower case. For `programming` print `3`.",
          stdin: ["programming"],
          starter: "word = input()\n\n",
          tests: [
            { name: "programming has 3", out_exact: "3" },
            { name: "aeiou has 5", stdin: ["aeiou"], out_exact: "5" },
            { name: "rhythm has 0", stdin: ["rhythm"], out_exact: "0" }
          ]
        },
        {
          kind: "code", title: "FizzBuzz, properly", difficulty: 3, concepts: ["for-loop", "elif", "modulo"],
          prompt: "Print 1 to 20, one per line, replacing multiples of 3 with `Fizz`, multiples of 5 with `Buzz`, and multiples of both with `FizzBuzz`.",
          starter: "",
          tests: [
            { name: "starts 1, 2, Fizz", out: "1\n2\nFizz\n" },
            { name: "15 is FizzBuzz", out: "\nFizzBuzz\n" },
            { name: "exactly 20 lines", code: "assert len([l for l in _OUT.strip().split('\\n') if l.strip()]) == 20" },
            { name: "ends with 19 then Buzz", out: "19\nBuzz" }
          ]
        }
      ]
    }
  });
})();
