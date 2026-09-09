/* Tier 3 · Module 20 — Testing & Debugging */
(function () {
  const L = a => a.join("\n");

  PQ.defineModule({
    id: "m20", tier: 3, order: 20, icon: "🧪",
    title: "Testing & Debugging",
    blurb: "Write tests that actually catch bugs, and find the ones that get through methodically.",
    intro: L([
      "Everything you have written so far was checked by tests someone else wrote. This module puts you on",
      "the other side of that.",
      "",
      "Tests are not about proving code works. They are about **making change safe** — so that six months",
      "from now you can refactor without fear. And when something still slips through, debugging is a",
      "method, not a talent."
    ]),
    concepts: [
      { id: "assertions", name: "assertions", importance: 1.4 },
      { id: "test-structure", name: "arrange-act-assert", importance: 1.4 },
      { id: "unittest-mod", name: "unittest", importance: 1.3 },
      { id: "edge-cases", name: "edge cases", importance: 1.6 },
      { id: "test-design", name: "designing a test suite", importance: 1.5 },
      { id: "tdd", name: "test-first development", importance: 1.2 },
      { id: "debugging-method", name: "systematic debugging", importance: 1.6 },
      { id: "logging-mod", name: "logging", importance: 1.3 }
    ],

    lessons: [
      {
        id: "m20l1", title: "What a test is", minutes: 12,
        concepts: ["assertions", "test-structure", "unittest-mod"],
        content: L([
          "## The simplest test is an assert",
          "",
          "~~~py",
          "def add(a, b):",
          "    return a + b",
          "",
          "assert add(2, 3) == 5",
          "assert add(-1, 1) == 0",
          "assert add(0, 0) == 0",
          "print('all good')",
          "~~~",
          "",
          "`assert condition` does nothing when the condition is true and raises `AssertionError` when it is",
          "false. That is the entire mechanism behind every testing framework.",
          "",
          "Add a message and failures explain themselves:",
          "",
          "~~~py",
          "assert add(2, 3) == 5, f'expected 5, got {add(2, 3)}'",
          "~~~",
          "",
          ":::warn assert is for tests, not for validation",
          "Python can be run with `-O`, which **removes every assert statement**. Never use `assert` to check",
          "user input or enforce a rule your program depends on — use `if ...: raise ValueError(...)`.",
          "Asserts are for stating what you believe is already true.",
          ":::",
          "",
          "## Arrange, Act, Assert",
          "",
          "Every good test has three parts, in this order:",
          "",
          "~~~py",
          "def test_withdraw_reduces_balance():",
          "    account = Account('ada', 100)      # arrange: set up",
          "    account.withdraw(30)               # act: do the one thing",
          "    assert account.balance == 70       # assert: check the outcome",
          "~~~",
          "",
          "One behaviour per test. When a test fails, its **name** should tell you what broke without reading",
          "the body — `test_withdraw_reduces_balance` does; `test_account_2` does not.",
          "",
          "## unittest",
          "",
          "The standard library's framework, available everywhere with no install:",
          "",
          "~~~py",
          "import unittest",
          "",
          "class TestAdd(unittest.TestCase):",
          "    def test_positive(self):",
          "        self.assertEqual(add(2, 3), 5)",
          "",
          "    def test_negative(self):",
          "        self.assertEqual(add(-1, -1), -2)",
          "",
          "    def test_type_error(self):",
          "        with self.assertRaises(TypeError):",
          "            add('a', 1)",
          "",
          "",
          "if __name__ == '__main__':",
          "    unittest.main()",
          "~~~",
          "",
          "| Method | Checks |",
          "|---|---|",
          "| `assertEqual(a, b)` | `a == b` |",
          "| `assertTrue(x)` / `assertFalse(x)` | truthiness |",
          "| `assertIn(a, b)` | `a in b` |",
          "| `assertIsNone(x)` | `x is None` |",
          "| `assertRaises(E)` | the block raises `E` |",
          "| `assertAlmostEqual(a, b)` | floats, to 7 places |",
          "",
          "`setUp` runs before **every** test method — use it for shared arrangement.",
          "",
          "## pytest",
          "",
          "The tool most professional projects actually use. It needs no classes:",
          "",
          "~~~py",
          "def test_positive():",
          "    assert add(2, 3) == 5",
          "",
          "def test_raises():",
          "    with pytest.raises(TypeError):",
          "        add('a', 1)",
          "~~~",
          "",
          "Plain functions, plain `assert`, and failure output that shows you both values. It is a third-party",
          "package (`pip install pytest`), so PyQuest uses plain asserts and `unittest` — but the *thinking* is",
          "identical, and that is the part that transfers.",
          "",
          "## What makes a test worth having",
          "",
          "A test that only ever passes is decoration. **A good test fails when the code is wrong.**",
          "",
          "Try it: break your function on purpose and check the test goes red. If it does not, the test is not",
          "testing what you think."
        ]),
        exercises: [
          {
            kind: "code", title: "Write the assertions", difficulty: 2,
            concepts: ["assertions"],
            prompt: L([
              "`clamp(value, low, high)` should return the value limited to the range.",
              "",
              "Implement it, then add at least **four** `assert` statements below it covering:",
              "a value inside the range, one below, one above, and a boundary."
            ]),
            starter: "def clamp(value, low, high):\n    \n\n# assertions below\n",
            requires: [{ re: "assert[\\s\\S]*assert[\\s\\S]*assert[\\s\\S]*assert", msg: "Write at least four assert statements" }],
            hints: [
              "`if value < low: return low` then `if value > high: return high` then `return value`.",
              "Or use `max(low, min(value, high))`.",
              "Your asserts must pass — they run when the file runs."
            ],
            tests: [
              { name: "inside the range", call: "clamp(5, 0, 10)", expect: 5 },
              { name: "below the range", call: "clamp(-5, 0, 10)", expect: 0 },
              { name: "above the range", call: "clamp(50, 0, 10)", expect: 10 },
              { name: "at the boundary", call: "clamp(10, 0, 10)", expect: 10 },
              { name: "your assertions all pass", code: "assert 'assert' in _SRC" }
            ],
            solution: L([
              "def clamp(value, low, high):",
              "    return max(low, min(value, high))",
              "",
              "",
              "assert clamp(5, 0, 10) == 5",
              "assert clamp(-5, 0, 10) == 0",
              "assert clamp(50, 0, 10) == 10",
              "assert clamp(0, 0, 10) == 0",
              "assert clamp(10, 0, 10) == 10"
            ])
          },
          {
            kind: "code", title: "A unittest case", difficulty: 3,
            concepts: ["unittest-mod"],
            prompt: L([
              "`Stack` is given. Write a `TestStack(unittest.TestCase)` class with **at least three** test methods:",
              "",
              "- pushing then popping returns the item",
              "- a new stack has length 0",
              "- popping an empty stack raises `IndexError`",
              "",
              "Do not call `unittest.main()` — the checks run your tests themselves."
            ]),
            starter: L([
              "import unittest",
              "",
              "",
              "class Stack:",
              "    def __init__(self):",
              "        self.items = []",
              "",
              "    def push(self, item):",
              "        self.items.append(item)",
              "",
              "    def pop(self):",
              "        if not self.items:",
              "            raise IndexError('empty')",
              "        return self.items.pop()",
              "",
              "    def __len__(self):",
              "        return len(self.items)",
              "",
              "",
              "class TestStack(unittest.TestCase):",
              "    "
            ]),
            hints: [
              "Each test is a method starting with `test_` and taking `self`.",
              "`self.assertEqual(...)` and `with self.assertRaises(IndexError):`.",
              "Method names should describe the behaviour, not be numbered."
            ],
            tests: [
              { name: "TestStack is a TestCase", code: "import unittest\nassert issubclass(TestStack, unittest.TestCase)" },
              { name: "at least three test methods", code: "names = [n for n in dir(TestStack) if n.startswith('test')]\nassert len(names) >= 3, f'found {names}'" },
              {
                name: "your tests all pass against the correct Stack",
                code: "import unittest, io\nsuite = unittest.TestLoader().loadTestsFromTestCase(TestStack)\nresult = unittest.TextTestRunner(stream=io.StringIO(), verbosity=0).run(suite)\nassert result.wasSuccessful(), f'failures: {result.failures} errors: {result.errors}'"
              },
              {
                name: "your tests catch a broken pop",
                code: "import unittest, io\nclass BrokenStack(Stack):\n    def pop(self):\n        if not self.items:\n            raise IndexError('empty')\n        return self.items[0]\nmethods = [getattr(TestStack, n) for n in dir(TestStack) if n.startswith('test')]\ngl = methods[0].__globals__\noriginal = gl['Stack']\ngl['Stack'] = BrokenStack\ntry:\n    suite = unittest.TestLoader().loadTestsFromTestCase(TestStack)\n    result = unittest.TextTestRunner(stream=io.StringIO(), verbosity=0).run(suite)\n    assert not result.wasSuccessful(), 'your tests should fail when pop returns the wrong end'\nfinally:\n    gl['Stack'] = original"
              }
            ],
            solution: L([
              "import unittest",
              "",
              "",
              "class Stack:",
              "    def __init__(self):",
              "        self.items = []",
              "",
              "    def push(self, item):",
              "        self.items.append(item)",
              "",
              "    def pop(self):",
              "        if not self.items:",
              "            raise IndexError('empty')",
              "        return self.items.pop()",
              "",
              "    def __len__(self):",
              "        return len(self.items)",
              "",
              "",
              "class TestStack(unittest.TestCase):",
              "    def test_push_then_pop_returns_the_item(self):",
              "        s = Stack()",
              "        s.push('a')",
              "        s.push('b')",
              "        self.assertEqual(s.pop(), 'b')",
              "",
              "    def test_new_stack_is_empty(self):",
              "        self.assertEqual(len(Stack()), 0)",
              "",
              "    def test_pop_on_empty_raises(self):",
              "        with self.assertRaises(IndexError):",
              "            Stack().pop()"
            ]),
            takeaway: "The last check swapped in a broken implementation. A test suite that still passes against broken code is worse than no suite, because it creates false confidence."
          },
          {
            kind: "quiz", title: "assert in production", difficulty: 3,
            concepts: ["assertions"],
            prompt: "Why should `assert user_input > 0` never be used to validate real input?",
            choices: [
              "It is slower than an if statement",
              "Running Python with -O removes all assert statements, so the check silently disappears",
              "assert cannot compare numbers",
              "It only works inside functions"
            ],
            answer: 1,
            explain: "Assertions are a development aid and are stripped under optimisation. A validation rule your program depends on must be an explicit `if ...: raise`."
          },
          {
            kind: "quiz", title: "What makes a good test name", difficulty: 2,
            concepts: ["test-structure"],
            prompt: "Which test name is most useful when it appears in a failure report?",
            choices: [
              "`test_1`",
              "`test_account`",
              "`test_withdraw_more_than_balance_raises`",
              "`test_works`"
            ],
            answer: 2,
            explain: "A failure report often shows only the name. `test_withdraw_more_than_balance_raises` tells you the scenario and the expectation without opening the file."
          }
        ]
      },

      {
        id: "m20l2", title: "Tests that catch real bugs", minutes: 13,
        concepts: ["edge-cases", "test-design", "tdd"],
        content: L([
          "## Test the edges, not the middle",
          "",
          "`add(2, 3) == 5` almost never catches anything. Bugs live at the boundaries:",
          "",
          "| Category | Ask |",
          "|---|---|",
          "| **Empty** | empty list, empty string, no arguments, zero |",
          "| **One** | a single element — off-by-one bugs surface here |",
          "| **Boundary** | exactly at the limit, one below, one above |",
          "| **Negative / zero** | does the maths still hold? |",
          "| **Duplicates** | repeated values, ties |",
          "| **Wrong type** | does it fail usefully or corrupt data? |",
          "| **Big** | does it still finish? |",
          "",
          "For `def average(numbers)`, the interesting tests are `[]`, `[5]`, `[-1, 1]` and floats —",
          "not `[1, 2, 3]`.",
          "",
          ":::why The rule that finds the most bugs",
          "For any threshold in your code, test **exactly at it, one below, and one above**. `>=` versus `>` is",
          "one character and one of the most common defects in software.",
          ":::",
          "",
          "## Test behaviour, not implementation",
          "",
          "~~~py",
          "def test_bad():",
          "    cart = Cart()",
          "    cart.add('apple')",
          "    assert cart._items == ['apple']        # depends on internals",
          "",
          "def test_good():",
          "    cart = Cart()",
          "    cart.add('apple')",
          "    assert cart.total_items() == 1         # depends on the promise",
          "~~~",
          "",
          "The first breaks when you rename a private attribute even though nothing is actually broken.",
          "Tests coupled to internals make refactoring painful — the exact opposite of what tests are for.",
          "",
          "## Test-first",
          "",
          "The loop is: **red → green → refactor**.",
          "",
          "1. Write a failing test for the next small behaviour.",
          "2. Write the least code that passes it.",
          "3. Clean up, with the test protecting you.",
          "",
          "The value is not ceremony. Writing the test first forces you to decide what the function should be",
          "*called*, what it should *take* and what it should *return* before you are lost in how it works.",
          "",
          "## Coverage is a floor, not a goal",
          "",
          "100% coverage means every line ran, not that every line is correct:",
          "",
          "~~~py",
          "def divide(a, b):",
          "    return a / b",
          "",
          "def test_divide():",
          "    assert divide(10, 2) == 5      # 100% coverage, and b == 0 is untested",
          "~~~",
          "",
          "Low coverage reliably tells you something is untested. High coverage tells you very little.",
          "",
          "## What not to test",
          "",
          "- the standard library (`sorted` works)",
          "- trivial getters with no logic",
          "- exact log message wording",
          "- private helpers, directly — test them through the public behaviour they support",
          "",
          "Every test is code you have to maintain. Spend them where a bug would actually hurt."
        ]),
        exercises: [
          {
            kind: "code", title: "Find the edge cases", difficulty: 4,
            concepts: ["edge-cases", "test-design"],
            prompt: L([
              "Write test functions for a `median(numbers)` function.",
              "",
              "Each test must be a function named `test_something` that takes **one parameter** — the",
              "implementation to test — and uses `assert`.",
              "",
              "~~~py",
              "def test_odd_length(median):",
              "    assert median([3, 1, 2]) == 2",
              "~~~",
              "",
              "Write at least **four** such tests. They must all pass against a correct implementation and",
              "**catch** each of three broken ones: one that forgets to sort, one that mishandles even lengths,",
              "and one that crashes on an empty list (a correct implementation returns `None` for empty)."
            ]),
            starter: "# median(numbers) returns the middle value of a sorted list,\n# the mean of the two middle values for an even length,\n# and None for an empty list.\n\ndef test_odd_length(median):\n    assert median([3, 1, 2]) == 2\n\n",
            hints: [
              "Unsorted input catches the no-sort bug: `median([3, 1, 2])` must be `2`, not `1`.",
              "An even-length list catches the averaging bug: `median([1, 2, 3, 4])` must be `2.5`.",
              "`median([])` must be `None` — that catches the crashing one.",
              "Add a single-element case too."
            ],
            tests: [
              {
                name: "at least four tests taking one parameter",
                code: "tests = [v for k, v in list(globals().items()) if k.startswith('test_') and callable(v)]\nassert len(tests) >= 4, f'found {len(tests)} tests'"
              },
              {
                name: "all pass against a correct median",
                code: "import statistics\ndef good(numbers):\n    if not numbers:\n        return None\n    return statistics.median(numbers)\ntests = [v for k, v in list(globals().items()) if k.startswith('test_') and callable(v)]\nfor t in tests:\n    t(good)"
              },
              {
                name: "catches an implementation that forgets to sort",
                code: "def unsorted(numbers):\n    if not numbers:\n        return None\n    n = len(numbers)\n    if n % 2 == 1:\n        return numbers[n // 2]\n    return (numbers[n // 2 - 1] + numbers[n // 2]) / 2\ntests = [v for k, v in list(globals().items()) if k.startswith('test_') and callable(v)]\nfailed = False\nfor t in tests:\n    try:\n        t(unsorted)\n    except AssertionError:\n        failed = True\nassert failed, 'no test caught the missing sort'"
              },
              {
                name: "catches an implementation that mishandles even lengths",
                code: "def even_bug(numbers):\n    if not numbers:\n        return None\n    o = sorted(numbers)\n    return o[len(o) // 2]\ntests = [v for k, v in list(globals().items()) if k.startswith('test_') and callable(v)]\nfailed = False\nfor t in tests:\n    try:\n        t(even_bug)\n    except AssertionError:\n        failed = True\nassert failed, 'no test caught the even-length bug'"
              },
              {
                name: "catches an implementation that crashes on empty input",
                code: "import statistics\ndef crashes(numbers):\n    return statistics.median(numbers)\ntests = [v for k, v in list(globals().items()) if k.startswith('test_') and callable(v)]\nfailed = False\nfor t in tests:\n    try:\n        t(crashes)\n    except (AssertionError, statistics.StatisticsError):\n        failed = True\nassert failed, 'no test covered the empty list'"
              }
            ],
            solution: L([
              "def test_odd_length(median):",
              "    assert median([3, 1, 2]) == 2",
              "",
              "",
              "def test_even_length_averages_the_middle_two(median):",
              "    assert median([1, 2, 3, 4]) == 2.5",
              "",
              "",
              "def test_empty_returns_none(median):",
              "    assert median([]) is None",
              "",
              "",
              "def test_single_value(median):",
              "    assert median([7]) == 7",
              "",
              "",
              "def test_unsorted_input_is_sorted_first(median):",
              "    assert median([9, 1, 5]) == 5"
            ]),
            takeaway: "You just did what a test suite is for: proving that three specific, plausible bugs cannot survive. That is a much sharper target than 'write some tests'."
          },
          {
            kind: "code", title: "Test-first", difficulty: 3,
            concepts: ["tdd", "edge-cases"],
            prompt: L([
              "Implement `initials(full_name)` returning the capitalised initials joined by dots:",
              "",
              "- `'ada lovelace'` → `'A.L.'`",
              "- `'grace brewster murray hopper'` → `'G.B.M.H.'`",
              "- `''` → `''`",
              "- extra whitespace is ignored",
              "",
              "Write the function **and** at least three asserts covering the empty case, a single name, and",
              "messy whitespace."
            ]),
            starter: "def initials(full_name):\n    \n\n# your assertions\n",
            requires: [{ re: "assert[\\s\\S]*assert[\\s\\S]*assert", msg: "Add at least three assertions" }],
            hints: [
              "`full_name.split()` handles all the whitespace cases for you.",
              "Build `word[0].upper() + '.'` for each word and join with `''`.",
              "The empty string splits to `[]`, so the loop simply produces nothing."
            ],
            tests: [
              { name: "two names", call: "initials('ada lovelace')", expect: "A.L." },
              { name: "four names", call: "initials('grace brewster murray hopper')", expect: "G.B.M.H." },
              { name: "empty string", call: "initials('')", expect: "" },
              { name: "single name", call: "initials('prince')", expect: "P." },
              { name: "messy whitespace", call: "initials('  ada   lovelace  ')", expect: "A.L." },
              { name: "already capitalised", call: "initials('Ada Lovelace')", expect: "A.L." }
            ],
            solution: L([
              "def initials(full_name):",
              "    return ''.join(word[0].upper() + '.' for word in full_name.split())",
              "",
              "",
              "assert initials('ada lovelace') == 'A.L.'",
              "assert initials('') == ''",
              "assert initials('prince') == 'P.'",
              "assert initials('  ada   lovelace  ') == 'A.L.'"
            ])
          },
          {
            kind: "quiz", title: "Testing internals", difficulty: 3,
            concepts: ["test-design"],
            prompt: "Why is `assert cart._items == ['apple']` a worse test than `assert cart.total_items() == 1`?",
            choices: [
              "It is slower",
              "It couples the test to a private implementation detail, so harmless refactoring breaks the test",
              "Private attributes cannot be read in Python",
              "Lists cannot be compared with =="
            ],
            answer: 1,
            explain: "Tests exist to make change safe. A test that fails when you rename an internal attribute — without any behaviour changing — makes change *less* safe, which defeats the purpose."
          },
          {
            kind: "quiz", title: "Coverage", difficulty: 3,
            concepts: ["test-design"],
            prompt: "Your test suite reports 100% line coverage. What does that guarantee?",
            choices: [
              "The code has no bugs",
              "Every line ran at least once during the tests — nothing more",
              "Every input has been tested",
              "Every branch has been tested"
            ],
            answer: 1,
            explain: "Coverage measures execution, not correctness. A single `divide(10, 2)` test gives 100% coverage of a function that crashes on `divide(1, 0)`."
          }
        ]
      },

      {
        id: "m20l3", title: "Debugging as a method", minutes: 12,
        concepts: ["debugging-method", "logging-mod"],
        content: L([
          "## The method",
          "",
          "Debugging feels like intuition when you watch an expert. It is not — it is a loop:",
          "",
          "1. **Reproduce it reliably.** A bug you cannot trigger on demand cannot be fixed, only guessed at.",
          "2. **Reduce it.** Cut the input and the code until you have the smallest thing that still fails.",
          "3. **Form one hypothesis.** *I think `total` is a string by line 40.*",
          "4. **Test that hypothesis.** Print it. Look.",
          "5. **Change one thing.** Then go back to step 1.",
          "",
          "The failure mode is skipping to step 5 and changing four things while hoping. That turns a",
          "ten-minute bug into an afternoon and teaches you nothing.",
          "",
          "## Bisecting",
          "",
          "When you have no idea where the problem is, cut the search space in half:",
          "",
          "~~~py",
          "print('checkpoint A', data[:3])",
          "# ... 200 lines ...",
          "print('checkpoint B', data[:3])",
          "~~~",
          "",
          "Good at A, wrong at B? The bug is between them. Repeat. Twenty halvings covers a million lines.",
          "",
          "The same idea applies to history: `git bisect` finds the exact commit that introduced a bug by",
          "halving your commit log.",
          "",
          "## Printing well",
          "",
          "~~~py",
          "print(total)                        # is that the total or something else?",
          "print(f'{total=} {type(total)=}')   # total=42 type(total)=<class 'int'>",
          "~~~",
          "",
          "The `=` inside an f-string prints the expression **and** its value. It is the single most useful",
          "debugging trick in modern Python.",
          "",
          "## logging: printing that survives",
          "",
          "~~~py",
          "import logging",
          "",
          "logging.basicConfig(level=logging.INFO, format='%(levelname)s %(message)s')",
          "",
          "logging.debug('loop internals: %s', item)   # noise, off by default",
          "logging.info('processed %d rows', count)     # normal progress",
          "logging.warning('retrying after %s', error)  # something is off",
          "logging.error('could not save %s', path)     # something failed",
          "~~~",
          "",
          "Why this beats `print` in anything real:",
          "",
          "- levels let you turn detail on and off without editing code",
          "- output can go to a file, a service, several places at once",
          "- timestamps and module names come for free",
          "- it can be left in the code permanently",
          "",
          "**`print` for the ten minutes you are looking at a bug; `logging` for anything that stays.**",
          "",
          "## pdb",
          "",
          "~~~py",
          "breakpoint()      # execution stops here and gives you a prompt",
          "~~~",
          "",
          "At the prompt: `n` next line, `s` step into, `c` continue, `p expr` print, `l` list source,",
          "`q` quit. It lets you inspect every variable at the moment of failure instead of guessing which one",
          "to print.",
          "",
          "## Reading a deep traceback",
          "",
          "When the stack is fifteen frames into a library:",
          "",
          "1. Read the **last** line — the exception type and message.",
          "2. Scan **upwards** for the deepest frame in **your own** files. That is where to look.",
          "3. The frames below it are how the library got there — usually context, not cause.",
          "",
          ":::tip Bugs you cannot find are usually assumptions",
          "When a bug makes no sense, one of your assumptions is wrong. Print the thing you are *most sure*",
          "about. It is astonishing how often it turns out to be a string, `None`, or an empty list.",
          ":::"
        ]),
        exercises: [
          {
            kind: "debug", title: "Bisect the pipeline", difficulty: 4,
            concepts: ["debugging-method"],
            prompt: L([
              "`process(['3', '5', '7'])` should return `30` — each value doubled and summed.",
              "It returns `0`.",
              "",
              "There are two bugs. Find them by checking the output of each stage in turn, then fix both."
            ]),
            starter: L([
              "def parse(rows):",
              "    return [int(r) for r in rows]",
              "",
              "",
              "def double(numbers):",
              "    return [n * 2 for n in numbers]",
              "",
              "",
              "def total(numbers):",
              "    result = 0",
              "    for n in numbers:",
              "        result = n",
              "    return result",
              "",
              "",
              "def process(rows):",
              "    numbers = parse(rows)",
              "    doubled = double(numbers)",
              "    return total([])"
            ]),
            hints: [
              "Print the result of each stage: `parse`, then `double`, then `total`.",
              "`process` passes an empty list to `total` instead of `doubled`.",
              "`total` assigns instead of accumulating."
            ],
            tests: [
              { name: "the example works", call: "process(['3', '5', '7'])", expect: 30 },
              { name: "empty input", call: "process([])", expect: 0 },
              { name: "single value", call: "process(['4'])", expect: 8 },
              { name: "total accumulates", call: "total([1, 2, 3])", expect: 6 },
              { name: "the other stages still work", call: "double(parse(['1', '2']))", expect: [2, 4] }
            ],
            solution: L([
              "def parse(rows):",
              "    return [int(r) for r in rows]",
              "",
              "",
              "def double(numbers):",
              "    return [n * 2 for n in numbers]",
              "",
              "",
              "def total(numbers):",
              "    result = 0",
              "    for n in numbers:",
              "        result += n",
              "    return result",
              "",
              "",
              "def process(rows):",
              "    numbers = parse(rows)",
              "    doubled = double(numbers)",
              "    return total(doubled)"
            ]),
            takeaway: "Testing each stage separately located both bugs in seconds. Splitting a pipeline into named functions is not only tidier — it is debuggable."
          },
          {
            kind: "code", title: "Log at the right levels", difficulty: 3,
            concepts: ["logging-mod"],
            prompt: L([
              "Write `import_rows(rows)` that converts each row to an `int` and returns the successful values.",
              "",
              "Use the `logging` module:",
              "",
              "- `logging.info` once at the end with how many rows succeeded",
              "- `logging.warning` for each row that could not be converted",
              "",
              "Do not use `print`. A bad row must not stop the import."
            ]),
            starter: "import logging\n\nlogging.basicConfig(level=logging.INFO, format='%(levelname)s %(message)s')\n\n\ndef import_rows(rows):\n    ",
            forbids: [{ re: "\\bprint\\(", msg: "Use logging, not print" }],
            hints: [
              "`try: value = int(row)` / `except ValueError: logging.warning(...)` / `continue`.",
              "Count successes and log once after the loop."
            ],
            tests: [
              { name: "returns the good rows", call: "import_rows(['1', '2', 'x', '3'])", expect: [1, 2, 3] },
              { name: "all bad rows", call: "import_rows(['a', 'b'])", expect: [] },
              { name: "empty input", call: "import_rows([])", expect: [] },
              { name: "uses logging rather than print", code: "assert 'logging.' in _SRC and 'print(' not in _SRC" },
              {
                name: "warns for each bad row",
                code: "import logging\nrecords = []\nclass Grab(logging.Handler):\n    def emit(self, r):\n        records.append(r)\nh = Grab()\nlogging.getLogger().addHandler(h)\ntry:\n    import_rows(['1', 'x', 'y'])\nfinally:\n    logging.getLogger().removeHandler(h)\nwarnings = [r for r in records if r.levelno == logging.WARNING]\nassert len(warnings) == 2, f'expected 2 warnings, got {len(warnings)}'"
              },
              {
                name: "logs one info summary",
                code: "import logging\nrecords = []\nclass Grab(logging.Handler):\n    def emit(self, r):\n        records.append(r)\nh = Grab()\nlogging.getLogger().addHandler(h)\ntry:\n    import_rows(['1', '2'])\nfinally:\n    logging.getLogger().removeHandler(h)\ninfos = [r for r in records if r.levelno == logging.INFO]\nassert len(infos) == 1, f'expected exactly 1 info line, got {len(infos)}'"
              }
            ],
            solution: L([
              "import logging",
              "",
              "logging.basicConfig(level=logging.INFO, format='%(levelname)s %(message)s')",
              "",
              "",
              "def import_rows(rows):",
              "    values = []",
              "    for row in rows:",
              "        try:",
              "            values.append(int(row))",
              "        except ValueError:",
              "            logging.warning('could not parse row %r', row)",
              "    logging.info('imported %d of %d rows', len(values), len(rows))",
              "    return values"
            ]),
            takeaway: "Levels are the point: run quietly in production, turn on DEBUG when investigating, and change nothing but a configuration line."
          },
          {
            kind: "quiz", title: "Reading a deep traceback", difficulty: 3,
            concepts: ["debugging-method"],
            prompt: "A traceback has 14 frames: 11 inside a third-party library, 3 in your own files. Where do you look first?",
            choices: [
              "The first frame, at the top",
              "The deepest frame that is in your own code",
              "The library frame where the exception was raised",
              "Any frame mentioning the exception name"
            ],
            answer: 1,
            explain: "The library is almost certainly working as designed on the input it was given. The last frame you wrote is where that input came from — and that is nearly always where the fix goes."
          },
          {
            kind: "quiz", title: "print or logging", difficulty: 2,
            concepts: ["logging-mod"],
            prompt: "What is the main practical advantage of `logging` over `print` in code that ships?",
            choices: [
              "It is faster",
              "Output can be filtered by level and redirected without changing the code",
              "It automatically fixes errors",
              "print does not work in production"
            ],
            answer: 1,
            explain: "You can leave `logging.debug` calls in permanently and turn them on only when investigating. Every `print` has to be added and then removed, which is why they always end up committed by accident."
          }
        ]
      }
    ],

    checkpoint: {
      id: "m20cp", pass: 0.8,
      title: "Checkpoint: Testing & Debugging",
      items: [
        {
          kind: "code", title: "Assertions that matter", difficulty: 3, concepts: ["edge-cases"],
          prompt: "Implement `safe_divide(a, b)` returning `a / b` or `None` when `b` is zero, then add at least three asserts covering a normal case, division by zero, and a negative.",
          starter: "def safe_divide(a, b):\n    \n\n",
          requires: [{ re: "assert[\\s\\S]*assert[\\s\\S]*assert", msg: "Add at least three assertions" }],
          tests: [
            { name: "normal", call: "safe_divide(10, 2)", expect: 5.0 },
            { name: "zero divisor", code: "assert safe_divide(1, 0) is None" },
            { name: "negative", call: "safe_divide(-10, 2)", expect: -5.0 }
          ]
        },
        {
          kind: "quiz", title: "Boundary testing", difficulty: 3, concepts: ["edge-cases"],
          prompt: "A function passes when `score >= 50`. Which set of test values is most likely to catch a `>` versus `>=` bug?",
          choices: ["0, 100", "49, 50, 51", "50 only", "25, 75"],
          answer: 1,
          explain: "Testing exactly at the boundary and either side of it is the only way to distinguish `>` from `>=`. Values far from the threshold behave identically under both."
        },
        {
          kind: "debug", title: "Find it methodically", difficulty: 3, concepts: ["debugging-method"],
          prompt: "`summarise([1, 2, 3])` should return `'3 items, total 6'` but returns `'3 items, total 3'`. Fix it.",
          starter: "def summarise(values):\n    total = 0\n    for v in values:\n        total = v\n    return f'{len(values)} items, total {total}'",
          tests: [
            { name: "correct total", call: "summarise([1, 2, 3])", expect: "3 items, total 6" },
            { name: "empty", call: "summarise([])", expect: "0 items, total 0" }
          ]
        },
        {
          kind: "quiz", title: "assert vs raise", difficulty: 2, concepts: ["assertions"],
          prompt: "Which belongs in a function that validates data submitted by a user?",
          choices: [
            "`assert age > 0`",
            "`if age <= 0: raise ValueError(...)`",
            "Either is fine",
            "Neither — validation is unnecessary"
          ],
          answer: 1,
          explain: "Assertions can be stripped with `-O`, so a validation rule written as an assert can silently vanish. Explicit raises always run."
        },
        {
          kind: "code", title: "unittest basics", difficulty: 3, concepts: ["unittest-mod"],
          prompt: "Write `TestMath(unittest.TestCase)` with two tests for the given `half(n)` function: one normal case and one checking that `half('x')` raises `TypeError`.",
          starter: "import unittest\n\n\ndef half(n):\n    return n / 2\n\n\nclass TestMath(unittest.TestCase):\n    ",
          tests: [
            { name: "is a TestCase with two tests", code: "import unittest\nassert issubclass(TestMath, unittest.TestCase)\nassert len([n for n in dir(TestMath) if n.startswith('test')]) >= 2" },
            { name: "the tests pass", code: "import unittest, io\nsuite = unittest.TestLoader().loadTestsFromTestCase(TestMath)\nassert unittest.TextTestRunner(stream=io.StringIO(), verbosity=0).run(suite).wasSuccessful()" }
          ]
        }
      ]
    }
  });
})();
