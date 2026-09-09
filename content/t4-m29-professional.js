/* Tier 4 · Module 29 — Professional Practice */
(function () {
  const L = a => a.join("\n");

  PQ.defineModule({
    id: "m29", tier: 4, order: 29, icon: "🧭",
    title: "Professional Practice",
    blurb: "Readable code, safe configuration, useful logs and the habits that make software survivable.",
    intro: L([
      "The last module before the Capstone is about everything around the code: how it is read, configured,",
      "reviewed, deployed and diagnosed.",
      "",
      "None of it is difficult. All of it is what separates a program that works on your machine from one",
      "other people can rely on."
    ]),
    concepts: [
      { id: "readability", name: "writing for readers", importance: 1.6 },
      { id: "docstrings-pro", name: "useful documentation", importance: 1.3 },
      { id: "code-review", name: "code review", importance: 1.4 },
      { id: "config-env", name: "configuration and environments", importance: 1.4 },
      { id: "secrets", name: "handling secrets", importance: 1.5 },
      { id: "observability", name: "logs and observability", importance: 1.4 },
      { id: "ci", name: "continuous integration", importance: 1.2 },
      { id: "security-basics", name: "security basics", importance: 1.4 }
    ],

    lessons: [
      {
        id: "m29l1", title: "Code is read far more than it is written", minutes: 12,
        concepts: ["readability", "docstrings-pro", "code-review"],
        content: L([
          "## Optimise for the reader",
          "",
          "You will read this code far more often than you wrote it — and so will people who have none of the",
          "context that is in your head today.",
          "",
          "~~~py",
          "def p(d, t=0.2):",
          "    return [x for x in d if x['a'] and x['v'] > t]",
          "~~~",
          "",
          "~~~py",
          "def active_above_threshold(records, threshold=0.2):",
          "    \"\"\"Return the active records whose value exceeds the threshold.\"\"\"",
          "    return [r for r in records if r['active'] and r['value'] > threshold]",
          "~~~",
          "",
          "Same code, same speed. One of them can be understood in two seconds without scrolling anywhere else.",
          "",
          "## PEP 8, briefly",
          "",
          "| Thing | Convention |",
          "|---|---|",
          "| functions, variables | `snake_case` |",
          "| classes | `PascalCase` |",
          "| constants | `UPPER_SNAKE` |",
          "| private | `_leading_underscore` |",
          "| indentation | 4 spaces |",
          "| line length | 79, or your team's limit |",
          "",
          "Do not enforce this by hand. **Use a formatter** — `black` or `ruff format` — and a linter",
          "(`ruff`). They run in a second, they end every style discussion permanently, and they catch real",
          "bugs like unused variables and shadowed names.",
          "",
          "## Comments say why",
          "",
          "~~~py",
          "i += 1                          # increment i          <- useless",
          "",
          "# The upstream API returns prices in cents, despite what its docs claim.",
          "price = raw_price / 100          # <- valuable",
          "~~~",
          "",
          "The code already says *what*. A comment earns its place by explaining *why* — a workaround, a",
          "non-obvious constraint, a decision that looks wrong but is not.",
          "",
          "A comment that repeats the code is worse than none: it will drift out of date and then actively lie.",
          "",
          "## Docstrings worth writing",
          "",
          "~~~py",
          "def transfer(source, target, amount):",
          "    \"\"\"Move amount from source to target.",
          "",
          "    Args:",
          "        source: account to debit; must have sufficient balance",
          "        target: account to credit",
          "        amount: positive number of pence",
          "",
          "    Returns:",
          "        The source account's new balance.",
          "",
          "    Raises:",
          "        ValueError: if amount is not positive or exceeds the balance.",
          "",
          "    Note:",
          "        Both accounts are modified in place.",
          "    \"\"\"",
          "~~~",
          "",
          "The `Raises` and `Note` sections are the ones people skip and the ones readers most need.",
          "*What can go wrong* and *does this modify my arguments* cannot be inferred from the signature.",
          "",
          "## Reviewing code",
          "",
          "**As the author:** keep it small. A 100-line change gets a real review; a 2,000-line change gets",
          "\"looks good to me\". Explain the *why* in the description, and review your own diff first.",
          "",
          "**As the reviewer**, in priority order:",
          "",
          "1. **Correctness** — does it do what it claims? What about the edge cases?",
          "2. **Security** — injection, secrets, unvalidated input.",
          "3. **Design** — will this be painful in six months?",
          "4. **Readability** — will the next person understand it?",
          "5. **Style** — the formatter's job, not yours.",
          "",
          ":::tip How to phrase it",
          "*\"What happens when `items` is empty?\"* invites thought.",
          "*\"This breaks on empty input\"* invites defensiveness — and is sometimes wrong.",
          "",
          "Comment on the code, never the person. Say explicitly which comments are optional",
          "(\"nit:\") so the author knows what actually blocks.",
          ":::"
        ]),
        exercises: [
          {
            kind: "refactor", title: "Make it readable", difficulty: 3,
            concepts: ["readability"],
            prompt: L([
              "This function is correct and unreadable. Rewrite it with meaningful names, a docstring, and no",
              "change in behaviour.",
              "",
              "It returns the names of active users whose score is above a threshold, highest score first.",
              "",
              "The checks require: a function named `top_active_users`, a docstring, and no single-character names."
            ]),
            starter: L([
              "def f(d, t=50):",
              "    r = []",
              "    for x in d:",
              "        if x['a'] and x['s'] > t:",
              "            r.append((x['n'], x['s']))",
              "    r.sort(key=lambda y: -y[1])",
              "    return [z[0] for z in r]"
            ]),
            hints: [
              "Rename to `top_active_users(users, threshold=50)`.",
              "Give the loop variable a real name and unpack the fields clearly.",
              "Add a one-line docstring saying what it returns."
            ],
            tests: [
              {
                name: "same behaviour",
                code: "users = [{'n': 'ada', 'a': True, 's': 90}, {'n': 'bo', 'a': False, 's': 99}, {'n': 'cy', 'a': True, 's': 60}]\nassert top_active_users(users) == ['ada', 'cy']"
              },
              { name: "threshold works", code: "users = [{'n': 'a', 'a': True, 's': 40}]\nassert top_active_users(users) == []\nassert top_active_users(users, threshold=10) == ['a']" },
              { name: "empty input", code: "assert top_active_users([]) == []" },
              { name: "has a docstring", code: "assert top_active_users.__doc__ and len(top_active_users.__doc__.strip()) > 10, 'add a docstring'" },
              {
                name: "no single-letter names remain",
                code: "import re\nbad = re.findall(r'\\\\b(?:for|def)\\\\s+([a-z])\\\\b', _SRC)\nassert not bad, f'single-letter names left: {bad}'"
              }
            ],
            solution: L([
              "def top_active_users(users, threshold=50):",
              "    \"\"\"Return the names of active users scoring above the threshold, highest first.\"\"\"",
              "    qualifying = []",
              "    for user in users:",
              "        if user['a'] and user['s'] > threshold:",
              "            qualifying.append((user['n'], user['s']))",
              "    qualifying.sort(key=lambda pair: -pair[1])",
              "    return [name for name, score in qualifying]"
            ])
          },
          {
            kind: "quiz", title: "What comments are for", difficulty: 2,
            concepts: ["readability"],
            prompt: "Which comment is worth writing?",
            choices: [
              "`# loop over the items`",
              "`# The vendor's API returns dates in local time despite documenting UTC`",
              "`# set x to 5`",
              "`# function definition`"
            ],
            answer: 1,
            explain: "The code already shows what it does. A comment earns its place by carrying information that is *not* in the code — a constraint, a workaround, a reason."
          },
          {
            kind: "quiz", title: "Review priorities", difficulty: 3,
            concepts: ["code-review"],
            prompt: "In a code review, which should get your attention first?",
            choices: [
              "Inconsistent quote style",
              "A query built with string formatting from user input",
              "A function name you would have chosen differently",
              "Missing blank lines between functions"
            ],
            answer: 1,
            explain: "That is SQL injection. Formatting is a tool's job, naming preferences are usually noise, and security defects are the ones that cannot be fixed after the fact."
          },
          {
            kind: "code", title: "Document the contract", difficulty: 3,
            concepts: ["docstrings-pro"],
            prompt: L([
              "Implement `apply_discount(price, percent)` and give it a docstring that documents what it",
              "returns, what it raises, and the valid range of `percent`.",
              "",
              "- returns the discounted price rounded to 2 places",
              "- `percent` must be between 0 and 100 inclusive, otherwise `ValueError`",
              "- a negative price is also a `ValueError`",
              "",
              "The docstring must mention `ValueError`."
            ]),
            starter: "def apply_discount(price, percent):\n    ",
            hints: [
              "Validate both arguments first.",
              "`price * (1 - percent / 100)` then round.",
              "Include a `Raises:` line in the docstring."
            ],
            tests: [
              { name: "applies the discount", call: "apply_discount(100, 20)", expect: 80.0 },
              { name: "zero percent", call: "apply_discount(50, 0)", expect: 50.0 },
              { name: "full discount", call: "apply_discount(50, 100)", expect: 0.0 },
              { name: "rounds", call: "apply_discount(9.99, 33)", expect: 6.69 },
              { name: "out of range percent raises", call: "apply_discount(100, 150)", raises: "ValueError" },
              { name: "negative percent raises", call: "apply_discount(100, -1)", raises: "ValueError" },
              { name: "negative price raises", call: "apply_discount(-1, 10)", raises: "ValueError" },
              {
                name: "the docstring documents the failure mode",
                code: "doc = apply_discount.__doc__ or ''\nassert 'ValueError' in doc, 'document what it raises'"
              }
            ],
            solution: L([
              "def apply_discount(price, percent):",
              "    \"\"\"Return price reduced by percent, rounded to 2 decimal places.",
              "",
              "    Args:",
              "        price: a non-negative amount.",
              "        percent: a discount between 0 and 100 inclusive.",
              "",
              "    Returns:",
              "        The discounted price as a float.",
              "",
              "    Raises:",
              "        ValueError: if price is negative or percent is outside 0-100.",
              "    \"\"\"",
              "    if price < 0:",
              "        raise ValueError(f'price must not be negative: {price}')",
              "    if not 0 <= percent <= 100:",
              "        raise ValueError(f'percent must be 0-100, got {percent}')",
              "    return round(price * (1 - percent / 100), 2)"
            ])
          }
        ]
      },

      {
        id: "m29l2", title: "Configuration and secrets", minutes: 11,
        concepts: ["config-env", "secrets", "security-basics"],
        content: L([
          "## Never hard-code environment-specific values",
          "",
          "~~~py",
          "DATABASE = 'postgres://admin:hunter2@prod-db:5432/app'      # in your repository, forever",
          "~~~",
          "",
          "Two separate problems: the password is now in version control (and in every clone, and in every",
          "branch, permanently), and the code only works in one environment.",
          "",
          "## Configuration from the environment",
          "",
          "~~~py",
          "import os",
          "",
          "DATABASE_URL = os.environ['DATABASE_URL']              # required: fail loudly if missing",
          "PORT = int(os.environ.get('PORT', '8000'))             # optional, with a default",
          "DEBUG = os.environ.get('DEBUG', '').lower() == 'true'",
          "~~~",
          "",
          "Note the asymmetry, and it matters:",
          "",
          "- **required** settings use `os.environ[...]`, so a missing one crashes at startup with a clear",
          "  message rather than at 3am with a confusing one",
          "- **optional** settings use `.get()` with a sensible default",
          "",
          ":::warn Everything from the environment is a string",
          "`os.environ.get('PORT', 8000)` returns the **string** `'3000'` in production and the **int** `8000`",
          "locally. Convert explicitly, and default with a string.",
          ":::",
          "",
          "## Validate configuration at startup",
          "",
          "~~~py",
          "@dataclass(frozen=True)",
          "class Config:",
          "    database_url: str",
          "    port: int",
          "    debug: bool",
          "",
          "    @classmethod",
          "    def from_env(cls):",
          "        try:",
          "            return cls(",
          "                database_url=os.environ['DATABASE_URL'],",
          "                port=int(os.environ.get('PORT', '8000')),",
          "                debug=os.environ.get('DEBUG', '').lower() == 'true',",
          "            )",
          "        except KeyError as missing:",
          "            raise RuntimeError(f'missing required setting: {missing}') from missing",
          "~~~",
          "",
          "**Fail at startup, not on first use.** A typo in a variable name should stop the deploy, not",
          "surface an hour later when someone hits the one endpoint that reads it.",
          "",
          "## Secrets",
          "",
          "The rules, in order of importance:",
          "",
          "1. **Never commit a secret.** Not in code, not in a config file, not in a test fixture, not in a",
          "   comment.",
          "2. **`.env` files are for local development only**, and `.env` goes in `.gitignore` on day one.",
          "3. **In production, use the platform's secret store** — the environment, a vault, the cloud",
          "   provider's secret manager.",
          "4. **Never log them.** A token in a log file is a token in your log aggregator, your backups and",
          "   whatever third party indexes them.",
          "5. **If one leaks, rotate it.** Deleting the commit does not help — git keeps history, and anything",
          "   pushed to a public repository should be assumed already harvested.",
          "",
          "~~~text",
          "# .gitignore",
          ".env",
          "*.key",
          "secrets/",
          "~~~",
          "",
          "## Security basics that catch most of it",
          "",
          "| Risk | Defence |",
          "|---|---|",
          "| SQL injection | parameterised queries, always (Module 23) |",
          "| Command injection | `subprocess.run([...])` with a list, never `shell=True` on user input |",
          "| Path traversal | resolve the path and check it is inside the allowed directory |",
          "| Untrusted deserialisation | never `pickle.loads` data you did not create; use JSON |",
          "| Secrets in logs | redact known keys before logging |",
          "| Outdated dependencies | `pip-audit`, and update regularly |",
          "",
          ":::why The habit that matters",
          "**Never build a command, query or path by concatenating input you did not create.** Almost every",
          "injection vulnerability in existence is that one sentence being violated.",
          ":::"
        ]),
        exercises: [
          {
            kind: "code", title: "Load configuration safely", difficulty: 4,
            concepts: ["config-env"],
            prompt: L([
              "Write `load_config(env)` taking a dictionary of environment variables and returning a config dict:",
              "",
              "- `database_url` — **required**; raise `RuntimeError` naming it if absent",
              "- `port` — optional, defaults to `8000`, converted to `int`; a non-numeric value raises `RuntimeError`",
              "- `debug` — optional, `True` only when the value is `'true'` in any case, otherwise `False`",
              "",
              "Never let a `KeyError` or `ValueError` escape — turn both into a `RuntimeError` that names the setting."
            ]),
            starter: "def load_config(env):\n    ",
            hints: [
              "Check for the required key explicitly and raise with its name in the message.",
              "Wrap the `int()` conversion in `try/except ValueError`.",
              "`env.get('DEBUG', '').lower() == 'true'`"
            ],
            tests: [
              {
                name: "full configuration",
                call: "load_config({'DATABASE_URL': 'x', 'PORT': '3000', 'DEBUG': 'true'})",
                expect: { database_url: "x", port: 3000, debug: true }
              },
              {
                name: "defaults applied",
                call: "load_config({'DATABASE_URL': 'x'})",
                expect: { database_url: "x", port: 8000, debug: false }
              },
              { name: "port is an int", code: "assert isinstance(load_config({'DATABASE_URL': 'x', 'PORT': '80'})['port'], int)" },
              {
                name: "missing required setting raises and names it",
                code: "try:\n    load_config({})\n    raise AssertionError('should raise')\nexcept RuntimeError as error:\n    assert 'DATABASE_URL' in str(error), f'name the missing setting: {error}'"
              },
              {
                name: "a bad port raises RuntimeError, not ValueError",
                code: "try:\n    load_config({'DATABASE_URL': 'x', 'PORT': 'abc'})\n    raise AssertionError('should raise')\nexcept RuntimeError as error:\n    assert 'PORT' in str(error)"
              },
              { name: "DEBUG is case-insensitive", call: "load_config({'DATABASE_URL': 'x', 'DEBUG': 'TRUE'})['debug']", expect: true },
              { name: "any other DEBUG value is False", call: "load_config({'DATABASE_URL': 'x', 'DEBUG': 'yes'})['debug']", expect: false }
            ],
            solution: L([
              "def load_config(env):",
              "    if 'DATABASE_URL' not in env:",
              "        raise RuntimeError('missing required setting: DATABASE_URL')",
              "",
              "    raw_port = env.get('PORT', '8000')",
              "    try:",
              "        port = int(raw_port)",
              "    except (TypeError, ValueError) as error:",
              "        raise RuntimeError(f'PORT must be a number, got {raw_port!r}') from error",
              "",
              "    return {",
              "        'database_url': env['DATABASE_URL'],",
              "        'port': port,",
              "        'debug': env.get('DEBUG', '').lower() == 'true',",
              "    }"
            ]),
            takeaway: "Every failure here happens at startup with a message naming the setting. That is the difference between a five-second fix and an hour of guessing."
          },
          {
            kind: "code", title: "Redact before logging", difficulty: 3,
            concepts: ["secrets"],
            prompt: L([
              "Write `redact(data)` returning a copy of a dictionary with the values of any sensitive key",
              "replaced by `'***'`.",
              "",
              "A key is sensitive if its lowercase form contains `password`, `token`, `secret` or `api_key`.",
              "",
              "Nested dictionaries must be redacted too, and the original must not be modified."
            ]),
            starter: "SENSITIVE = ('password', 'token', 'secret', 'api_key')\n\n\ndef redact(data):\n    ",
            hints: [
              "Loop over `data.items()` building a new dictionary.",
              "If the value is itself a dict, recurse.",
              "Check `any(word in key.lower() for word in SENSITIVE)`."
            ],
            tests: [
              { name: "redacts a password", call: "redact({'user': 'ada', 'password': 'hunter2'})", expect: { user: "ada", password: "***" } },
              { name: "matches partial names", call: "redact({'API_KEY': 'abc', 'access_token': 'xyz'})", expect: { API_KEY: "***", access_token: "***" } },
              {
                name: "redacts nested dictionaries",
                call: "redact({'db': {'host': 'h', 'password': 'p'}})",
                expect: { db: { host: "h", password: "***" } }
              },
              {
                name: "the original is untouched",
                code: "original = {'password': 'hunter2'}\nredact(original)\nassert original == {'password': 'hunter2'}, 'do not modify the input'"
              },
              { name: "nothing sensitive", call: "redact({'a': 1})", expect: { a: 1 } },
              { name: "empty", call: "redact({})", expect: {} }
            ],
            solution: L([
              "SENSITIVE = ('password', 'token', 'secret', 'api_key')",
              "",
              "",
              "def redact(data):",
              "    result = {}",
              "    for key, value in data.items():",
              "        if any(word in key.lower() for word in SENSITIVE):",
              "            result[key] = '***'",
              "        elif isinstance(value, dict):",
              "            result[key] = redact(value)",
              "        else:",
              "            result[key] = value",
              "    return result"
            ])
          },
          {
            kind: "quiz", title: "A leaked secret", difficulty: 3,
            concepts: ["secrets"],
            prompt: "You committed an API key, noticed an hour later, and deleted it in a new commit. What must you do?",
            choices: [
              "Nothing — the deletion is enough",
              "Rotate the key, because it remains in git history and may already have been harvested",
              "Force-push over the branch and move on",
              "Add it to .gitignore"
            ],
            answer: 1,
            explain: "Git keeps every version, and public repositories are scanned continuously by automated tools. Once a secret has been pushed, treat it as compromised: revoke and reissue it."
          },
          {
            kind: "quiz", title: "Required vs optional", difficulty: 3,
            concepts: ["config-env"],
            prompt: "Why read a required setting with `os.environ['X']` rather than `os.environ.get('X')`?",
            choices: [
              "It is faster",
              "A missing required setting crashes immediately at startup with a clear message, instead of becoming a confusing None much later",
              "`.get()` does not work with environment variables",
              "There is no difference"
            ],
            answer: 1,
            explain: "Failing fast at startup means the deploy fails and someone fixes the typo. A `None` travelling into the application surfaces later, somewhere unrelated, as a much harder problem."
          }
        ]
      },

      {
        id: "m29l3", title: "Shipping and observing", minutes: 11,
        concepts: ["ci", "observability", "security-basics"],
        content: L([
          "## Continuous integration",
          "",
          "CI is a machine that runs your checks on every push, so \"it works on my machine\" stops being a",
          "meaningful sentence.",
          "",
          "~~~text",
          "# .github/workflows/ci.yml",
          "on: [push, pull_request]",
          "jobs:",
          "  test:",
          "    runs-on: ubuntu-latest",
          "    steps:",
          "      - uses: actions/checkout@v4",
          "      - uses: actions/setup-python@v5",
          "        with: {python-version: '3.12'}",
          "      - run: pip install -e '.[dev]'",
          "      - run: ruff check .",
          "      - run: mypy src",
          "      - run: pytest",
          "~~~",
          "",
          "A useful pipeline runs, in this order (fastest feedback first):",
          "",
          "1. **format check** — seconds",
          "2. **lint** — seconds",
          "3. **type check** — tens of seconds",
          "4. **tests** — minutes",
          "5. **security audit** of dependencies",
          "",
          "The point is not ceremony. It is that nobody has to *remember* to run these, and a broken main",
          "branch is caught in minutes rather than by a colleague on Monday.",
          "",
          ":::tip Keep it fast",
          "A CI run that takes 40 minutes gets ignored, worked around, and eventually disabled. Under ten",
          "minutes and people actually wait for it.",
          ":::",
          "",
          "## Logging that helps at 3am",
          "",
          "~~~py",
          "logging.info('done')                                   # useless",
          "logging.info('imported %d of %d rows in %.1fs from %s',",
          "             ok, total, elapsed, path)                  # useful",
          "~~~",
          "",
          "A log line is written for the person diagnosing an incident, who has no context and cannot reproduce",
          "the problem. Include:",
          "",
          "- **what** happened, with numbers",
          "- **which** entity — an id, a filename, a user reference",
          "- **why** it matters, if that is not obvious",
          "",
          "Levels, used consistently:",
          "",
          "| Level | Meaning |",
          "|---|---|",
          "| `DEBUG` | detail for investigating; off in production |",
          "| `INFO` | normal, notable events |",
          "| `WARNING` | recovered, but someone should know |",
          "| `ERROR` | this operation failed |",
          "| `CRITICAL` | the service cannot continue |",
          "",
          "~~~py",
          "logging.exception('failed to import %s', path)     # inside except: includes the traceback",
          "~~~",
          "",
          "`logging.exception` is `error` plus the full traceback. Inside an `except` block it is almost always",
          "what you want.",
          "",
          "## The three questions observability answers",
          "",
          "1. **Is it working?** — health checks, error rates",
          "2. **Is it fast enough?** — latency, throughput",
          "3. **What happened to this one request?** — logs with a correlation id",
          "",
          "That third one is why real systems attach a request id to every log line: it lets you follow one",
          "user's journey through five services.",
          "",
          "## When it breaks",
          "",
          "1. **Stop the bleeding** — roll back or disable the feature. Diagnose afterwards.",
          "2. **Preserve evidence** — logs, inputs, timings.",
          "3. **Find the cause**, using the method from Module 20.",
          "4. **Fix it, with a test that would have caught it.**",
          "5. **Write it down** — blameless, focused on the system, not the person.",
          "",
          ":::why Blameless is not politeness",
          "If people are punished for incidents, they stop reporting them and you lose the information you",
          "needed. \"Why was it *possible* to deploy that?\" produces guardrails; \"who deployed that?\" produces",
          "silence.",
          ":::",
          "",
          "## The habits, in one list",
          "",
          "- small, frequent commits with messages that say **why**",
          "- a branch per change, reviewed before it lands",
          "- tests that run automatically and fast",
          "- a formatter and a linter, so style is never discussed",
          "- dependencies pinned and audited",
          "- secrets outside the repository, always",
          "- a README that lets someone run it in five minutes",
          "- leave every file slightly better than you found it"
        ]),
        exercises: [
          {
            kind: "code", title: "Log something useful", difficulty: 3,
            concepts: ["observability"],
            prompt: L([
              "Write `import_rows(rows, source)` that converts each row to an `int` and returns the good ones.",
              "",
              "Logging requirements:",
              "",
              "- one `INFO` line at the end including the count of successes, the total, **and** the source name",
              "- one `WARNING` per bad row, including the offending value **and** the source name",
              "- use lazy `%s` formatting (`logging.warning('...%s...', value)`), not f-strings"
            ]),
            starter: "import logging\n\nlogging.basicConfig(level=logging.INFO)\n\n\ndef import_rows(rows, source):\n    ",
            forbids: [{ re: "logging\\.(info|warning)\\(f", msg: "Use lazy % formatting, not an f-string" }],
            hints: [
              "`logging.warning('bad value %r in %s', row, source)`",
              "Lazy formatting means the string is only built if the level is enabled.",
              "Count successes as you go and log once at the end."
            ],
            tests: [
              { name: "returns the good rows", call: "import_rows(['1', '2', 'x'], 'a.csv')", expect: [1, 2] },
              {
                name: "one warning per bad row, naming the source",
                code: "import logging\nrecords = []\nclass Grab(logging.Handler):\n    def emit(self, r):\n        records.append(r)\nh = Grab()\nlogging.getLogger().addHandler(h)\ntry:\n    import_rows(['1', 'x', 'y'], 'data.csv')\nfinally:\n    logging.getLogger().removeHandler(h)\nwarnings = [r for r in records if r.levelno == logging.WARNING]\nassert len(warnings) == 2, f'expected 2 warnings, got {len(warnings)}'\nassert all('data.csv' in r.getMessage() for r in warnings), 'name the source in each warning'"
              },
              {
                name: "one info summary with the counts",
                code: "import logging\nrecords = []\nclass Grab(logging.Handler):\n    def emit(self, r):\n        records.append(r)\nh = Grab()\nlogging.getLogger().addHandler(h)\ntry:\n    import_rows(['1', '2', 'x'], 'data.csv')\nfinally:\n    logging.getLogger().removeHandler(h)\ninfos = [r for r in records if r.levelno == logging.INFO]\nassert len(infos) == 1, f'expected 1 info line, got {len(infos)}'\nmessage = infos[0].getMessage()\nassert '2' in message and '3' in message and 'data.csv' in message, f'include counts and source: {message}'"
              },
              { name: "empty input", call: "import_rows([], 'x')", expect: [] }
            ],
            solution: L([
              "import logging",
              "",
              "logging.basicConfig(level=logging.INFO)",
              "",
              "",
              "def import_rows(rows, source):",
              "    values = []",
              "    for row in rows:",
              "        try:",
              "            values.append(int(row))",
              "        except (TypeError, ValueError):",
              "            logging.warning('skipping bad value %r in %s', row, source)",
              "    logging.info('imported %d of %d rows from %s', len(values), len(rows), source)",
              "    return values"
            ]),
            takeaway: "Lazy `%s` formatting means a DEBUG line costs nothing when DEBUG is off — which is why you can afford to leave detailed logging in permanently."
          },
          {
            kind: "quiz", title: "logging.exception", difficulty: 2,
            concepts: ["observability"],
            prompt: "Inside an `except` block, why prefer `logging.exception('failed')` over `logging.error('failed')`?",
            choices: [
              "It is shorter",
              "It includes the full traceback, so you can see where the failure came from",
              "It re-raises the exception",
              "It sends an alert automatically"
            ],
            answer: 1,
            explain: "Without the traceback you know something failed but not where or why. `logging.exception` attaches the whole stack, which is usually the difference between a two-minute and a two-hour diagnosis."
          },
          {
            kind: "quiz", title: "CI order", difficulty: 2,
            concepts: ["ci"],
            prompt: "Why run the linter before the test suite in CI?",
            choices: [
              "Tests depend on the linter",
              "It fails in seconds rather than minutes, giving the fastest possible feedback on trivial problems",
              "Linters find more bugs than tests",
              "It is required by GitHub Actions"
            ],
            answer: 1,
            explain: "Cheap checks first. There is no point waiting six minutes for a test suite to tell you about a change that a one-second lint would have rejected."
          },
          {
            kind: "quiz", title: "Command injection", difficulty: 3,
            concepts: ["security-basics"],
            prompt: "Which is safe when `filename` comes from a user?",
            choices: [
              "`os.system(f'cat {filename}')`",
              "`subprocess.run(f'cat {filename}', shell=True)`",
              "`subprocess.run(['cat', filename])`",
              "All three are equivalent"
            ],
            answer: 2,
            explain: "Passing a list means no shell is involved, so `; rm -rf /` is just an odd filename rather than a second command. Anything with `shell=True` and interpolated input is command injection."
          }
        ]
      }
    ],

    checkpoint: {
      id: "m29cp", pass: 0.8,
      title: "Checkpoint: Professional Practice",
      items: [
        {
          kind: "code", title: "Fail fast on config", difficulty: 3, concepts: ["config-env"],
          prompt: "Write `require(env, key)` returning `env[key]` or raising `RuntimeError` whose message contains the key name.",
          starter: "def require(env, key):\n    ",
          tests: [
            { name: "returns the value", call: "require({'A': '1'}, 'A')", expect: "1" },
            { name: "raises for a missing key", call: "require({}, 'DATABASE_URL')", raises: "RuntimeError" },
            { name: "names the key", call: "require({}, 'DATABASE_URL')", raises: "RuntimeError", message: "DATABASE_URL" }
          ]
        },
        {
          kind: "quiz", title: "Comments", difficulty: 2, concepts: ["readability"],
          prompt: "What makes a comment actively harmful?",
          choices: [
            "Being too long",
            "Restating what the code does, because it drifts out of date and then misleads",
            "Using full sentences",
            "Being above the code rather than beside it"
          ],
          answer: 1,
          explain: "A comment that duplicates the code adds no information and will eventually disagree with it. At that point it is worse than nothing, because readers trust it."
        },
        {
          kind: "code", title: "Hide the secrets", difficulty: 3, concepts: ["secrets"],
          prompt: "Write `safe_repr(config)` returning a string of `key=value` pairs joined by `, `, with any key containing `secret` or `password` shown as `key=***`. Keys in sorted order.",
          starter: "def safe_repr(config):\n    ",
          tests: [
            { name: "redacts", call: "safe_repr({'user': 'ada', 'password': 'x'})", expect: "password=***, user=ada" },
            { name: "case-insensitive", call: "safe_repr({'API_SECRET': 'x'})", expect: "API_SECRET=***" },
            { name: "nothing sensitive", call: "safe_repr({'b': 2, 'a': 1})", expect: "a=1, b=2" },
            { name: "empty", call: "safe_repr({})", expect: "" }
          ]
        },
        {
          kind: "quiz", title: "Log levels", difficulty: 2, concepts: ["observability"],
          prompt: "A request failed but was retried successfully. What level fits?",
          choices: ["DEBUG", "INFO", "WARNING", "CRITICAL"],
          answer: 2,
          explain: "Nothing is broken for the user, but a pattern of retries is worth noticing. WARNING means *recovered, but someone should know*."
        },
        {
          kind: "quiz", title: "Blameless review", difficulty: 3, concepts: ["code-review"],
          prompt: "Why are incident reviews conducted without blaming individuals?",
          choices: [
            "To be polite",
            "Because blame suppresses reporting, and you lose the information needed to fix the system",
            "Because incidents are never anyone's fault",
            "To satisfy compliance requirements"
          ],
          answer: 1,
          explain: "Asking *why was this possible* produces guardrails that prevent a whole class of incident. Asking *who did it* produces people who hide problems, and the next one is worse."
        }
      ]
    }
  });
})();
