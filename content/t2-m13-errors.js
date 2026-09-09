/* Tier 2 · Module 13 — Errors & Exceptions */
(function () {
  const L = a => a.join("\n");

  PQ.defineModule({
    id: "m13", tier: 2, order: 13, icon: "🛟",
    title: "Errors & Exceptions",
    blurb: "Decide what happens when things go wrong, instead of letting the program decide for you.",
    intro: L([
      "Up to now an error meant your program stopped. Real programs meet bad input, missing files and broken",
      "networks constantly, and they have to keep working. Exception handling is how you make failure a case",
      "you designed rather than an accident."
    ]),
    concepts: [
      { id: "try-except", name: "try / except", importance: 1.6 },
      { id: "exception-types", name: "specific exception types", importance: 1.5 },
      { id: "raise", name: "raising exceptions", importance: 1.4 },
      { id: "custom-exception", name: "custom exceptions", importance: 1.2 },
      { id: "else-finally", name: "else and finally", importance: 1.2 },
      { id: "eafp", name: "EAFP vs LBYL", importance: 1.3 },
      { id: "error-design", name: "designing failure behaviour", importance: 1.4 }
    ],

    lessons: [
      {
        id: "m13l1", title: "Catching what you expect", minutes: 12,
        concepts: ["try-except", "exception-types"],
        content: L([
          "## try / except",
          "",
          "~~~py",
          "text = 'not a number'",
          "",
          "try:",
          "    value = int(text)",
          "    print(f'Got {value}')",
          "except ValueError:",
          "    print('That was not a number')",
          "",
          "print('Still running')",
          "~~~",
          "~~~out",
          "That was not a number",
          "Still running",
          "~~~",
          "",
          "Python tries the block. If the named exception happens, it jumps straight to `except` and carries on",
          "afterwards. Without the `try`, the program would have stopped dead.",
          "",
          "**Important:** when an exception fires part-way through the `try` block, the rest of that block is",
          "skipped. `print(f'Got {value}')` never ran above.",
          "",
          "## Catch the specific exception",
          "",
          "~~~py",
          "try:",
          "    risky()",
          "except:                # never do this",
          "    pass",
          "~~~",
          "",
          "A bare `except` catches **everything** — typos in your own code, out-of-memory, even `Ctrl+C`.",
          "You will silently swallow bugs and spend a day finding out why nothing happens.",
          "",
          "~~~py",
          "try:",
          "    value = int(text)",
          "except ValueError:     # exactly what you expect",
          "    value = 0",
          "~~~",
          "",
          ":::warn The rule",
          "**Catch the narrowest exception you can actually handle.** If you cannot say what your `except` block",
          "will *do* about it, you probably should not be catching it.",
          ":::",
          "",
          "## Several handlers",
          "",
          "~~~py",
          "try:",
          "    result = int(a) / int(b)",
          "except ValueError:",
          "    print('not numbers')",
          "except ZeroDivisionError:",
          "    print('cannot divide by zero')",
          "~~~",
          "",
          "Or group them when the response is the same:",
          "",
          "~~~py",
          "except (ValueError, TypeError):",
          "    print('bad input')",
          "~~~",
          "",
          "## Seeing the exception itself",
          "",
          "~~~py",
          "try:",
          "    int('abc')",
          "except ValueError as error:",
          "    print(f'Failed: {error}')",
          "~~~",
          "~~~out",
          "Failed: invalid literal for int() with base 10: 'abc'",
          "~~~",
          "",
          "`as error` gives you the exception object. Its message is usually worth logging — throwing it away",
          "makes debugging much harder later.",
          "",
          "## The exception family tree",
          "",
          "```text",
          "BaseException",
          " └── Exception            <- catch things under here",
          "      ├── ArithmeticError",
          "      │    └── ZeroDivisionError",
          "      ├── LookupError",
          "      │    ├── IndexError",
          "      │    └── KeyError",
          "      ├── ValueError",
          "      ├── TypeError",
          "      └── OSError",
          "           └── FileNotFoundError",
          "```",
          "",
          "Catching a parent catches all its children: `except LookupError` catches both `IndexError` and",
          "`KeyError`. `except Exception` catches almost everything — occasionally right at the top level of a",
          "program, almost never anywhere else."
        ]),
        exercises: [
          {
            kind: "code", title: "Safe integer parsing", difficulty: 2,
            concepts: ["try-except"],
            prompt: L([
              "Write `to_int(text, default=0)` returning the number, or `default` when the text is not a valid",
              "whole number.",
              "",
              "`to_int('42')` → `42`, `to_int('abc')` → `0`, `to_int('', -1)` → `-1`"
            ]),
            starter: "def to_int(text, default=0):\n    ",
            hints: ["Wrap `int(text)` in a `try`.", "Catch `ValueError` and return the default."],
            tests: [
              { name: "valid number", call: "to_int('42')", expect: 42 },
              { name: "invalid text", call: "to_int('abc')", expect: 0 },
              { name: "empty string", call: "to_int('', -1)", expect: -1 },
              { name: "negative numbers work", call: "to_int('-7')", expect: -7 },
              { name: "decimals are not integers", call: "to_int('3.5', 99)", expect: 99 }
            ],
            solution: L([
              "def to_int(text, default=0):",
              "    try:",
              "        return int(text)",
              "    except ValueError:",
              "        return default"
            ])
          },
          {
            kind: "debug", title: "Too broad a net", difficulty: 3,
            concepts: ["exception-types", "error-design"],
            prompt: L([
              "This function hides a genuine bug: `divide('10', 2)` silently returns `None` instead of failing",
              "loudly, because a bare `except` swallows the `TypeError`.",
              "",
              "Narrow the handler so only `ZeroDivisionError` is caught (returning `None`), and everything else",
              "still propagates."
            ]),
            starter: L([
              "def divide(a, b):",
              "    try:",
              "        return a / b",
              "    except:",
              "        return None"
            ]),
            forbids: [{ re: "except\\s*:", msg: "Do not use a bare except" }],
            hints: ["`except ZeroDivisionError:` catches only what you meant.", "Let the `TypeError` escape — it means the caller passed something wrong."],
            tests: [
              { name: "normal division", call: "divide(10, 2)", expect: 5.0 },
              { name: "division by zero gives None", code: "assert divide(1, 0) is None" },
              { name: "bad types still raise", call: "divide('10', 2)", raises: "TypeError" }
            ],
            solution: L([
              "def divide(a, b):",
              "    try:",
              "        return a / b",
              "    except ZeroDivisionError:",
              "        return None"
            ]),
            takeaway: "A bare `except` turns your own typos into silent wrong answers. Narrow handlers keep real bugs visible."
          },
          {
            kind: "code", title: "Two failure modes", difficulty: 3,
            concepts: ["exception-types"],
            prompt: L([
              "Write `safe_divide(a, b)` returning a string:",
              "",
              "- the result as a float for valid numeric text, e.g. `'5.0'`",
              "- `'not a number'` when either input cannot be converted",
              "- `'cannot divide by zero'` when the divisor is zero",
              "",
              "`a` and `b` arrive as strings."
            ]),
            starter: "def safe_divide(a, b):\n    ",
            hints: [
              "Convert both with `float()` inside the `try`.",
              "Two `except` clauses: `ValueError` and `ZeroDivisionError`.",
              "Return `str(result)` on success."
            ],
            tests: [
              { name: "valid division", call: "safe_divide('10', '2')", expect: "5.0" },
              { name: "bad numerator", call: "safe_divide('x', '2')", expect: "not a number" },
              { name: "bad denominator", call: "safe_divide('10', 'y')", expect: "not a number" },
              { name: "zero divisor", call: "safe_divide('10', '0')", expect: "cannot divide by zero" },
              { name: "decimals work", call: "safe_divide('7.5', '2.5')", expect: "3.0" }
            ],
            solution: L([
              "def safe_divide(a, b):",
              "    try:",
              "        return str(float(a) / float(b))",
              "    except ValueError:",
              "        return 'not a number'",
              "    except ZeroDivisionError:",
              "        return 'cannot divide by zero'"
            ])
          },
          {
            kind: "predict", title: "What gets skipped", difficulty: 3,
            concepts: ["try-except"],
            prompt: L([
              "What is printed?",
              "",
              "~~~py",
              "try:",
              "    print('a')",
              "    int('boom')",
              "    print('b')",
              "except ValueError:",
              "    print('c')",
              "print('d')",
              "~~~"
            ]),
            choices: ["`a c d`", "`a b c d`", "`a d`", "`a c`"],
            answer: 0,
            explain: "`print('a')` runs, then `int('boom')` raises. Everything remaining in the `try` block is abandoned — so `b` never prints — control jumps to the handler (`c`), and execution continues normally after the whole statement (`d`)."
          }
        ]
      },

      {
        id: "m13l2", title: "Raising and designing errors", minutes: 12,
        concepts: ["raise", "custom-exception", "else-finally", "error-design"],
        content: L([
          "## raise: refuse to continue",
          "",
          "~~~py",
          "def withdraw(balance, amount):",
          "    if amount <= 0:",
          "        raise ValueError('amount must be positive')",
          "    if amount > balance:",
          "        raise ValueError('insufficient funds')",
          "    return balance - amount",
          "~~~",
          "",
          "Returning `None` or `-1` for an error forces every caller to remember to check, and they will not.",
          "Raising makes the failure impossible to ignore.",
          "",
          "**Choose the right built-in:**",
          "",
          "| Situation | Exception |",
          "|---|---|",
          "| right type, impossible value | `ValueError` |",
          "| wrong type entirely | `TypeError` |",
          "| key or index missing | `KeyError` / `IndexError` |",
          "| operation not allowed right now | `RuntimeError` |",
          "| not written yet | `NotImplementedError` |",
          "",
          "## Custom exceptions",
          "",
          "~~~py",
          "class InsufficientFunds(Exception):",
          "    pass",
          "",
          "raise InsufficientFunds('balance too low')",
          "~~~",
          "",
          "One line gives you an exception type callers can catch **specifically**:",
          "",
          "~~~py",
          "try:",
          "    withdraw(account, 500)",
          "except InsufficientFunds:",
          "    offer_overdraft()",
          "except ValueError:",
          "    show_form_error()",
          "~~~",
          "",
          "Define custom exceptions when callers need to react differently to different failures. If everyone",
          "handles it the same way, a built-in is fine.",
          "",
          "## else and finally",
          "",
          "~~~py",
          "try:",
          "    value = int(text)",
          "except ValueError:",
          "    print('bad input')",
          "else:",
          "    print(f'parsed {value}')     # only when nothing was raised",
          "finally:",
          "    print('always runs')          # even on an exception or a return",
          "~~~",
          "",
          "- `else` — the success path. Keeping it out of the `try` means you are not accidentally catching",
          "  exceptions from code that was never meant to be guarded.",
          "- `finally` — cleanup that must happen regardless: closing files, releasing locks, restoring state.",
          "  It runs even if the `try` block returns.",
          "",
          ":::why Keep the try block small",
          "~~~py",
          "try:",
          "    data = load(path)",
          "    result = transform(data)      # a ValueError in here is caught by mistake",
          "except ValueError:",
          "    ...",
          "~~~",
          "Guard only the line that can fail in the way you are handling. Everything else goes in `else`.",
          ":::",
          "",
          "## Failing well",
          "",
          "Three rules that hold up in real systems:",
          "",
          "1. **Fail fast at the boundary.** Validate input where it enters and raise immediately. Do not let",
          "   bad data travel three layers deep and corrupt something.",
          "2. **Say what and why.** `raise ValueError(f'age must be 0-130, got {age}')` beats `raise ValueError`.",
          "3. **Never swallow silently.** `except Exception: pass` is how a system fails invisibly for months."
        ]),
        exercises: [
          {
            kind: "code", title: "Validate and raise", difficulty: 3,
            concepts: ["raise"],
            prompt: L([
              "Write `set_age(age)` that returns the age when it is valid, and raises a `ValueError` otherwise.",
              "",
              "Valid means an `int` between 0 and 130 inclusive. A non-integer must raise `TypeError`.",
              "",
              "The `ValueError` message must contain the offending value."
            ]),
            starter: "def set_age(age):\n    ",
            hints: [
              "`isinstance(age, int)` checks the type. Note `bool` is a subclass of `int` — that is fine here.",
              "`raise TypeError('age must be a whole number')`",
              "`raise ValueError(f'age must be 0-130, got {age}')`"
            ],
            tests: [
              { name: "valid age returns", call: "set_age(30)", expect: 30 },
              { name: "zero is valid", call: "set_age(0)", expect: 0 },
              { name: "130 is valid", call: "set_age(130)", expect: 130 },
              { name: "too large raises ValueError", call: "set_age(200)", raises: "ValueError" },
              { name: "negative raises ValueError", call: "set_age(-1)", raises: "ValueError" },
              { name: "the message names the value", call: "set_age(200)", raises: "ValueError", message: "200" },
              { name: "wrong type raises TypeError", call: "set_age('30')", raises: "TypeError" }
            ],
            solution: L([
              "def set_age(age):",
              "    if not isinstance(age, int):",
              "        raise TypeError('age must be a whole number')",
              "    if age < 0 or age > 130:",
              "        raise ValueError(f'age must be 0-130, got {age}')",
              "    return age"
            ])
          },
          {
            kind: "code", title: "A custom exception", difficulty: 3,
            concepts: ["custom-exception"],
            prompt: L([
              "Define an exception class `InsufficientFunds` that inherits from `Exception`.",
              "",
              "Then write `withdraw(balance, amount)` returning the new balance, raising:",
              "",
              "- `ValueError` when `amount` is zero or negative",
              "- `InsufficientFunds` when `amount` is more than `balance`"
            ]),
            starter: "class InsufficientFunds(Exception):\n    pass\n\n\ndef withdraw(balance, amount):\n    ",
            hints: ["Check the invalid amount first, then the balance.", "Return `balance - amount` when all is well."],
            tests: [
              { name: "successful withdrawal", call: "withdraw(100, 30)", expect: 70 },
              { name: "exact balance is allowed", call: "withdraw(50, 50)", expect: 0 },
              { name: "too much raises InsufficientFunds", call: "withdraw(10, 50)", raises: "InsufficientFunds" },
              { name: "zero raises ValueError", call: "withdraw(10, 0)", raises: "ValueError" },
              { name: "it is a real Exception subclass", code: "assert issubclass(InsufficientFunds, Exception)" },
              { name: "callers can catch it specifically", code: "try:\n    withdraw(1, 5)\n    raise AssertionError('should have raised')\nexcept InsufficientFunds:\n    pass" }
            ],
            solution: L([
              "class InsufficientFunds(Exception):",
              "    pass",
              "",
              "",
              "def withdraw(balance, amount):",
              "    if amount <= 0:",
              "        raise ValueError('amount must be positive')",
              "    if amount > balance:",
              "        raise InsufficientFunds(f'balance {balance} is less than {amount}')",
              "    return balance - amount"
            ])
          },
          {
            kind: "code", title: "Cleanup with finally", difficulty: 3,
            concepts: ["else-finally"],
            prompt: L([
              "Complete `process(items)` so that it:",
              "",
              "- appends `'start'` to `log` before doing anything",
              "- appends `'ok'` when the whole list processed without error",
              "- appends `'failed'` when a `TypeError` occurs (and does not re-raise)",
              "- **always** appends `'done'` last, in either case",
              "",
              "`log` is a module-level list. The function returns the total of the items.",
              "A non-numeric item causes the `TypeError`, and then the function returns `None`."
            ]),
            starter: L([
              "log = []",
              "",
              "def process(items):",
              "    total = 0",
              "    log.append('start')",
              "    "
            ]),
            hints: [
              "`try:` sum the items, `except TypeError:` log the failure, `else:` log success, `finally:` log done.",
              "Returning from inside `try` still runs `finally`."
            ],
            tests: [
              { name: "success path", code: "log.clear()\nassert process([1, 2, 3]) == 6\nassert log == ['start', 'ok', 'done'], f'got {log}'" },
              { name: "failure path", code: "log.clear()\nassert process([1, 'x']) is None\nassert log == ['start', 'failed', 'done'], f'got {log}'" },
              { name: "empty list succeeds", code: "log.clear()\nassert process([]) == 0\nassert log == ['start', 'ok', 'done']" }
            ],
            solution: L([
              "log = []",
              "",
              "def process(items):",
              "    total = 0",
              "    log.append('start')",
              "    try:",
              "        for item in items:",
              "            total += item",
              "    except TypeError:",
              "        log.append('failed')",
              "        return None",
              "    else:",
              "        log.append('ok')",
              "        return total",
              "    finally:",
              "        log.append('done')"
            ]),
            takeaway: "`finally` runs even when the `try` or `except` block returns. That is exactly why it is the right place for cleanup."
          },
          {
            kind: "predict", title: "finally wins", difficulty: 4,
            concepts: ["else-finally"],
            prompt: L([
              "What does this return?",
              "",
              "~~~py",
              "def f():",
              "    try:",
              "        return 'try'",
              "    finally:",
              "        print('cleanup')",
              "",
              "print(f())",
              "~~~"
            ]),
            choices: [
              "`try` only",
              "`cleanup` then `try`",
              "`try` then `cleanup`",
              "`cleanup` only"
            ],
            answer: 1,
            explain: "The return value is computed, then `finally` runs **before** the function actually returns — so `cleanup` prints first, and then `print(f())` prints `try`."
          }
        ]
      },

      {
        id: "m13l3", title: "EAFP and where to handle failure", minutes: 10,
        concepts: ["eafp", "error-design"],
        content: L([
          "## Two philosophies",
          "",
          "**LBYL** — Look Before You Leap:",
          "",
          "~~~py",
          "if 'name' in data and data['name']:",
          "    print(data['name'].upper())",
          "~~~",
          "",
          "**EAFP** — Easier to Ask Forgiveness than Permission:",
          "",
          "~~~py",
          "try:",
          "    print(data['name'].upper())",
          "except (KeyError, AttributeError):",
          "    print('no name')",
          "~~~",
          "",
          "Python leans EAFP, for two concrete reasons:",
          "",
          "1. **It is not racy.** Checking `if os.path.exists(path)` and then opening the file leaves a gap in",
          "   which the file can vanish. `try: open(path)` cannot have that gap.",
          "2. **It covers every failure**, not just the ones you thought to check for.",
          "",
          "But LBYL is better when the check is cheap and the failure is *expected and normal* —",
          "`if not items: return 0` beats catching `ZeroDivisionError` from an average.",
          "",
          ":::tip A working rule",
          "Expected, ordinary condition → check it (`if`).",
          "Exceptional, should-not-normally-happen → let it raise and catch it.",
          "",
          "The word *exception* is doing real work: it is for the exceptional.",
          ":::",
          "",
          "## Where to catch",
          "",
          "This is the design question that matters most, and it has a good general answer:",
          "**catch where you can actually do something about it.**",
          "",
          "~~~py",
          "def read_config(path):          # low level: knows nothing about the app",
          "    with open(path) as f:       # let FileNotFoundError escape",
          "        return json.load(f)",
          "",
          "def start_app():                # high level: knows what to do",
          "    try:",
          "        config = read_config('app.json')",
          "    except FileNotFoundError:",
          "        config = DEFAULTS",
          "        print('No config found, using defaults')",
          "~~~",
          "",
          "The low-level function has no idea whether a missing file is fatal. The caller does. Catching too",
          "early forces every function to invent a policy it is not qualified to decide.",
          "",
          "## Adding context as it travels",
          "",
          "~~~py",
          "try:",
          "    value = int(row['age'])",
          "except ValueError as error:",
          "    raise ValueError(f'bad age in row {row_number}') from error",
          "~~~",
          "",
          "`raise ... from error` keeps the original as the cause, so the traceback shows both: what broke and",
          "where in your data it broke. That single habit saves hours when processing thousands of rows.",
          "",
          "## What never to do",
          "",
          "~~~py",
          "try:",
          "    do_everything()",
          "except Exception:",
          "    pass",
          "~~~",
          "",
          "This is how a system fails silently for six months. If you truly must continue, at minimum log it."
        ]),
        exercises: [
          {
            kind: "refactor", title: "LBYL to EAFP", difficulty: 3,
            concepts: ["eafp"],
            prompt: L([
              "Rewrite `first_score` using EAFP — one `try` and one `except` — instead of the chain of checks.",
              "",
              "Behaviour must be identical: return the first score as an `int`, or `None` if anything is missing",
              "or unusable."
            ]),
            starter: L([
              "def first_score(data):",
              "    if 'scores' not in data:",
              "        return None",
              "    if not isinstance(data['scores'], list):",
              "        return None",
              "    if len(data['scores']) == 0:",
              "        return None",
              "    if not str(data['scores'][0]).isdigit():",
              "        return None",
              "    return int(data['scores'][0])"
            ]),
            forbids: [{ re: "if\\s+'scores'", msg: "Use try/except rather than pre-checking" }],
            hints: [
              "`return int(data['scores'][0])` inside a `try`.",
              "Catch `(KeyError, IndexError, TypeError, ValueError)` and return `None`."
            ],
            tests: [
              { name: "normal case", call: "first_score({'scores': ['90', '80']})", expect: 90 },
              { name: "integers work too", call: "first_score({'scores': [7]})", expect: 7 },
              { name: "missing key", code: "assert first_score({}) is None" },
              { name: "empty list", code: "assert first_score({'scores': []}) is None" },
              { name: "not a list", code: "assert first_score({'scores': 5}) is None" },
              { name: "unparseable value", code: "assert first_score({'scores': ['abc']}) is None" }
            ],
            solution: L([
              "def first_score(data):",
              "    try:",
              "        return int(data['scores'][0])",
              "    except (KeyError, IndexError, TypeError, ValueError):",
              "        return None"
            ]),
            takeaway: "Six lines of defensive checks became two, and the EAFP version also survives failure modes the checks never anticipated."
          },
          {
            kind: "code", title: "Parse rows, report the bad ones", difficulty: 4,
            concepts: ["error-design", "try-except"],
            prompt: L([
              "Write `parse_ages(rows)` where each row is a string like `'ada:36'`.",
              "",
              "Return a tuple `(good, errors)`:",
              "",
              "- `good` is a list of `(name, age)` tuples for rows that parsed",
              "- `errors` is a list of strings `'row N: <the row text>'` (1-based) for rows that did not",
              "",
              "A row fails if it has no colon or the age is not a whole number. One bad row must never stop the rest."
            ]),
            starter: "def parse_ages(rows):\n    ",
            hints: [
              "Use `enumerate(rows, start=1)` to get the row number.",
              "Inside the loop, `try:` split and convert; `except (ValueError, IndexError):` append the error.",
              "`'ada'.split(':')` gives a one-element list, so unpacking into two names raises `ValueError`."
            ],
            tests: [
              {
                name: "all good rows",
                call: "parse_ages(['ada:36', 'bo:20'])",
                expect: [[["ada", 36], ["bo", 20]], []]
              },
              {
                name: "one bad row is reported",
                call: "parse_ages(['ada:36', 'broken'])",
                expect: [[["ada", 36]], ["row 2: broken"]]
              },
              {
                name: "non-numeric age",
                call: "parse_ages(['ada:old'])",
                expect: [[], ["row 1: ada:old"]]
              },
              {
                name: "processing continues after a failure",
                call: "parse_ages(['bad', 'bo:20'])",
                expect: [[["bo", 20]], ["row 1: bad"]]
              },
              { name: "empty input", call: "parse_ages([])", expect: [[], []] }
            ],
            solution: L([
              "def parse_ages(rows):",
              "    good = []",
              "    errors = []",
              "    for number, row in enumerate(rows, start=1):",
              "        try:",
              "            name, age = row.split(':')",
              "            good.append((name, int(age)))",
              "        except ValueError:",
              "            errors.append(f'row {number}: {row}')",
              "    return good, errors"
            ]),
            takeaway: "Collect failures instead of stopping at the first one. Any real import tool has to tell the user *which* rows were bad, not just that something went wrong."
          },
          {
            kind: "quiz", title: "Where to catch", difficulty: 3,
            concepts: ["error-design"],
            prompt: L([
              "A low-level `read_file(path)` helper is used by ten different features. A file is sometimes",
              "legitimately missing. Where should the `FileNotFoundError` be handled?"
            ]),
            choices: [
              "Inside `read_file`, returning an empty string",
              "In each caller, which knows whether a missing file is fatal or fine",
              "Nowhere — let the program crash",
              "In a single global handler at the very top"
            ],
            answer: 1,
            explain: "`read_file` cannot know whether a missing file means *use defaults* or *abort the transfer*. Handling it there forces one policy on all ten callers. Raise from the low level, decide at the level that has the context.",
          },
          {
            kind: "debug", title: "Silent failure", difficulty: 3,
            concepts: ["error-design"],
            prompt: L([
              "`load_all` silently returns an empty list whenever anything goes wrong, so the caller cannot tell",
              "\"no data\" from \"broken\".",
              "",
              "Change it to collect what it can and **raise** `ValueError` listing the failing indexes when any",
              "item fails. The message must contain the failing index numbers.",
              "",
              "With `['1', '2']` it returns `[1, 2]`. With `['1', 'x']` it raises `ValueError` mentioning `1`",
              "(the 0-based index of the bad item)."
            ]),
            starter: L([
              "def load_all(items):",
              "    try:",
              "        return [int(i) for i in items]",
              "    except Exception:",
              "        return []"
            ]),
            forbids: [{ re: "except\\s+Exception\\s*:\\s*\\n\\s*return\\s*\\[\\]", msg: "Do not swallow the failure" }],
            hints: [
              "Loop with `enumerate` instead of a comprehension so you know which index failed.",
              "Collect `bad = []` of failing indexes; raise at the end if it is non-empty.",
              "`raise ValueError(f'bad items at {bad}')`"
            ],
            tests: [
              { name: "all valid", call: "load_all(['1', '2'])", expect: [1, 2] },
              { name: "empty input", call: "load_all([])", expect: [] },
              { name: "raises on bad data", call: "load_all(['1', 'x'])", raises: "ValueError" },
              { name: "message names the index", call: "load_all(['1', 'x'])", raises: "ValueError", message: "1" },
              { name: "reports every bad index", call: "load_all(['x', '1', 'y'])", raises: "ValueError", message: "2" }
            ],
            solution: L([
              "def load_all(items):",
              "    result = []",
              "    bad = []",
              "    for index, item in enumerate(items):",
              "        try:",
              "            result.append(int(item))",
              "        except ValueError:",
              "            bad.append(index)",
              "    if bad:",
              "        raise ValueError(f'bad items at {bad}')",
              "    return result"
            ])
          }
        ]
      }
    ],

    checkpoint: {
      id: "m13cp", pass: 0.8,
      title: "Checkpoint: Errors & Exceptions",
      items: [
        {
          kind: "code", title: "Safe float", difficulty: 2, concepts: ["try-except"],
          prompt: "Write `to_float(text)` returning the float, or `None` if it cannot be parsed.",
          starter: "def to_float(text):\n    ",
          tests: [
            { name: "valid", call: "to_float('3.5')", expect: 3.5 },
            { name: "invalid gives None", code: "assert to_float('abc') is None" },
            { name: "empty gives None", code: "assert to_float('') is None" }
          ]
        },
        {
          kind: "predict", title: "Order of execution", difficulty: 3, concepts: ["else-finally"],
          prompt: "What prints?\n\n~~~py\ntry:\n    print('a')\nexcept ValueError:\n    print('b')\nelse:\n    print('c')\nfinally:\n    print('d')\n~~~",
          choices: ["`a c d`", "`a b d`", "`a d`", "`a c`"],
          answer: 0,
          explain: "Nothing raised, so `except` is skipped, `else` runs (the success path), and `finally` always runs."
        },
        {
          kind: "code", title: "Raise on bad input", difficulty: 3, concepts: ["raise"],
          prompt: "Write `percentage(part, whole)` returning `part / whole * 100`, raising `ValueError` when `whole` is zero.",
          starter: "def percentage(part, whole):\n    ",
          tests: [
            { name: "normal case", call: "percentage(25, 50)", expect: 50.0 },
            { name: "zero whole raises", call: "percentage(1, 0)", raises: "ValueError" }
          ]
        },
        {
          kind: "quiz", title: "Bare except", difficulty: 2, concepts: ["exception-types"],
          prompt: "Why is a bare `except:` dangerous?",
          choices: [
            "It is slower than naming the exception",
            "It catches everything, including your own typos and interrupts, hiding real bugs",
            "It only catches the first exception",
            "It is a syntax error in Python 3"
          ],
          answer: 1,
          explain: "It catches every exception type, so a `NameError` from a misspelling looks exactly like the failure you expected — and gets silently handled."
        },
        {
          kind: "code", title: "Custom error type", difficulty: 3, concepts: ["custom-exception"],
          prompt: "Define `ValidationError(Exception)` and `check(value)` which returns the value if it is a non-empty string, and raises `ValidationError` otherwise.",
          starter: "",
          tests: [
            { name: "valid value", call: "check('ok')", expect: "ok" },
            { name: "empty string raises", call: "check('')", raises: "ValidationError" },
            { name: "wrong type raises", call: "check(5)", raises: "ValidationError" },
            { name: "subclasses Exception", code: "assert issubclass(ValidationError, Exception)" }
          ]
        }
      ]
    }
  });
})();
