/* Tier 4 · Module 28 — Design & Architecture + refactoring project */
(function () {
  const L = a => a.join("\n");

  PQ.defineModule({
    id: "m28", tier: 4, order: 28, icon: "📐",
    title: "Design & Architecture",
    blurb: "Cohesion, coupling, dependency inversion and refactoring — how code stays workable for years.",
    intro: L([
      "Every program works on the day it is written. The question that separates professional code from the",
      "rest is what it costs to change six months later, by someone else.",
      "",
      "This module is about the small number of principles that actually determine that cost."
    ]),
    concepts: [
      { id: "cohesion", name: "cohesion", importance: 1.5 },
      { id: "coupling", name: "coupling", importance: 1.5 },
      { id: "separation", name: "separation of concerns", importance: 1.6 },
      { id: "single-responsibility", name: "single responsibility", importance: 1.4 },
      { id: "dependency-injection", name: "dependency injection", importance: 1.5 },
      { id: "open-closed", name: "extension without modification", importance: 1.2 },
      { id: "refactoring", name: "refactoring", importance: 1.5 },
      { id: "project-layout", name: "project layout", importance: 1.2 },
      { id: "packaging", name: "packaging" }
    ],

    lessons: [
      {
        id: "m28l1", title: "Cohesion, coupling and layers", minutes: 13,
        concepts: ["cohesion", "coupling", "separation", "single-responsibility"],
        content: L([
          "## The two words that matter most",
          "",
          "**Cohesion** — how related the things inside one unit are. High is good.",
          "**Coupling** — how much one unit depends on the internals of another. Low is good.",
          "",
          "~~~py",
          "class UserManager:              # low cohesion: unrelated jobs bundled together",
          "    def create_user(self): ...",
          "    def send_email(self): ...",
          "    def generate_pdf_report(self): ...",
          "    def connect_to_database(self): ...",
          "~~~",
          "",
          "Four unrelated responsibilities. Changing the email provider means editing the class that also",
          "creates users. Everything that touches users now also depends on the PDF library.",
          "",
          "## Separation of concerns",
          "",
          "Almost every program has the same three layers, and mixing them is the most common structural mistake:",
          "",
          "| Layer | Responsible for | Should not know about |",
          "|---|---|---|",
          "| **Presentation** | input and output, formatting | business rules, storage |",
          "| **Logic** | rules, calculations, decisions | files, HTTP, the terminal |",
          "| **Data** | reading and writing, persistence | why the data is needed |",
          "",
          "~~~py",
          "def process_order(order_id):           # all three tangled together",
          "    row = db.execute('SELECT ...').fetchone()",
          "    total = row[2] * 1.2",
          "    if total > 100:",
          "        print('Free shipping!')",
          "    db.execute('UPDATE ...')",
          "    print(f'Total: £{total:.2f}')",
          "~~~",
          "",
          "This cannot be tested without a database, cannot be reused from a web handler, and cannot have its",
          "tax rule checked without capturing printed output.",
          "",
          "~~~py",
          "def calculate_total(price, quantity, tax_rate=0.2):     # pure logic",
          "    return price * quantity * (1 + tax_rate)",
          "",
          "def qualifies_for_free_shipping(total):                  # pure logic",
          "    return total > 100",
          "",
          "def load_order(db, order_id):                            # data",
          "    ...",
          "",
          "def show_order(order, total):                            # presentation",
          "    ...",
          "~~~",
          "",
          "Now the tax rule is four characters to test, and it works identically from a CLI, a web request or",
          "a batch job.",
          "",
          ":::why The single most useful habit in this module",
          "**Keep the logic pure.** A function that takes values and returns values, touching no database, no",
          "network, no clock and no terminal, is trivially testable and endlessly reusable. Push the messy",
          "parts — I/O, time, randomness — to the edges.",
          ":::",
          "",
          "## Single responsibility",
          "",
          "*A class or function should have one reason to change.*",
          "",
          "The useful test is not \"does it do one thing\" — that is too vague. It is: **who would ask for this",
          "to change?** If the finance team would change the tax rule and the design team would change the",
          "output format, those are two responsibilities and belong in two places.",
          "",
          "## Signs of trouble",
          "",
          "| Smell | What it means |",
          "|---|---|",
          "| a function longer than a screen | it is doing several things |",
          "| a name containing \"and\" or \"Manager\" | unclear or multiple responsibilities |",
          "| you must read three files to understand one function | coupling is too high |",
          "| a small change touches many files | the boundaries are in the wrong place |",
          "| tests need a database to check arithmetic | layers are mixed |",
          "| a parameter that is only passed through | a layer that should not exist |",
          "",
          ":::warn Do not over-engineer either",
          "The opposite failure is real: seven layers of abstraction for a 200-line script, interfaces with one",
          "implementation, factories producing factories. Abstraction is a cost you pay now against a change you",
          "*might* need later. Add it when the second case actually arrives, not in anticipation.",
          ":::"
        ]),
        exercises: [
          {
            kind: "refactor", title: "Separate the layers", difficulty: 4,
            concepts: ["separation", "single-responsibility"],
            prompt: L([
              "This function mixes calculation, formatting and output. Split it into three:",
              "",
              "- `calculate_total(items, tax_rate=0.2) -> float` — pure arithmetic, rounded to 2 places",
              "- `format_receipt(items, total) -> str` — builds the text, returns it, prints nothing",
              "- `print_receipt(items)` — calls the other two and prints the result",
              "",
              "Each item is a dict with `name`, `price` and `quantity`.",
              "",
              "Expected receipt for one coffee at 2.50 × 2:",
              "",
              "~~~text",
              "Coffee x2  5.00",
              "TOTAL      6.00",
              "~~~",
              "",
              "The name and quantity are joined as `name xN`, left-aligned in 10 characters, then the line total",
              "to 2 decimals. `TOTAL` is left-aligned in 10 characters too."
            ]),
            starter: L([
              "def print_receipt(items):",
              "    total = 0",
              "    for item in items:",
              "        line = item['price'] * item['quantity']",
              "        total += line",
              "        label = item['name'] + ' x' + str(item['quantity'])",
              "        print(f'{label:<10} {line:.2f}')",
              "    total = round(total * 1.2, 2)",
              "    print(f\"{'TOTAL':<10} {total:.2f}\")"
            ]),
            hints: [
              "`calculate_total` sums `price * quantity` then multiplies by `1 + tax_rate` and rounds.",
              "`format_receipt` builds a list of lines and joins them with `'\\n'`.",
              "`print_receipt` is three lines: compute, format, print."
            ],
            tests: [
              { name: "calculation is pure", call: "calculate_total([{'name': 'Coffee', 'price': 2.5, 'quantity': 2}])", expect: 6.0 },
              { name: "tax rate can be changed", call: "calculate_total([{'name': 'x', 'price': 10, 'quantity': 1}], tax_rate=0)", expect: 10.0 },
              { name: "empty basket", call: "calculate_total([])", expect: 0.0 },
              {
                name: "formatting returns a string and prints nothing",
                code: "import io, sys\nitems = [{'name': 'Coffee', 'price': 2.5, 'quantity': 2}]\nbuf = io.StringIO()\nold = sys.stdout\nsys.stdout = buf\nresult = format_receipt(items, calculate_total(items))\nsys.stdout = old\nassert buf.getvalue() == '', 'format_receipt must not print'\nassert result == 'Coffee x2  5.00\\nTOTAL      6.00', repr(result)"
              },
              {
                name: "print_receipt still prints the same thing",
                code: "import io, sys\nbuf = io.StringIO()\nold = sys.stdout\nsys.stdout = buf\nprint_receipt([{'name': 'Coffee', 'price': 2.5, 'quantity': 2}])\nsys.stdout = old\nassert buf.getvalue().strip() == 'Coffee x2  5.00\\nTOTAL      6.00'"
              },
              {
                name: "calculate_total does not print",
                code: "import io, sys\nbuf = io.StringIO()\nold = sys.stdout\nsys.stdout = buf\ncalculate_total([{'name': 'x', 'price': 1, 'quantity': 1}])\nsys.stdout = old\nassert buf.getvalue() == '', 'the calculation must not print'"
              }
            ],
            solution: L([
              "def calculate_total(items, tax_rate=0.2):",
              "    subtotal = sum(item['price'] * item['quantity'] for item in items)",
              "    return round(subtotal * (1 + tax_rate), 2)",
              "",
              "",
              "def format_receipt(items, total):",
              "    lines = []",
              "    for item in items:",
              "        line_total = item['price'] * item['quantity']",
              "        label = f\"{item['name']} x{item['quantity']}\"",
              "        lines.append(f'{label:<10} {line_total:.2f}')",
              "    lines.append(f\"{'TOTAL':<10} {total:.2f}\")",
              "    return '\\n'.join(lines)",
              "",
              "",
              "def print_receipt(items):",
              "    total = calculate_total(items)",
              "    print(format_receipt(items, total))"
            ]),
            takeaway: "The tax rule is now testable in one line, and the same calculation serves a receipt, an invoice and an API response without change."
          },
          {
            kind: "quiz", title: "Single responsibility", difficulty: 3,
            concepts: ["single-responsibility"],
            prompt: "What is the most useful test of whether a class has one responsibility?",
            choices: [
              "It has fewer than five methods",
              "There is only one kind of person or requirement that would cause it to change",
              "It fits on one screen",
              "It has only one public method"
            ],
            answer: 1,
            explain: "Counting methods or lines is a proxy. The real question is *who asks for changes here*. If two different concerns drive edits to the same class, they will keep colliding."
          },
          {
            kind: "quiz", title: "Testing tells you", difficulty: 3,
            concepts: ["separation"],
            prompt: "Testing a pricing rule requires setting up a database and capturing printed output. What does that indicate?",
            choices: [
              "The tests are badly written",
              "The pricing logic is entangled with data access and presentation and should be extracted",
              "You need a bigger test database",
              "Nothing — this is normal"
            ],
            answer: 1,
            explain: "Difficulty testing is a design signal, not a testing problem. Pure logic needs no infrastructure; if a test needs infrastructure to check arithmetic, the arithmetic is in the wrong place."
          },
          {
            kind: "quiz", title: "Over-engineering", difficulty: 3,
            concepts: ["separation"],
            prompt: "A 150-line script has five abstract base classes, each with exactly one implementation. What is wrong?",
            choices: [
              "Nothing — it is well designed",
              "Abstraction has been added for flexibility that is not needed, making the code harder to read for no benefit",
              "It needs more classes",
              "Abstract classes are always wrong"
            ],
            answer: 1,
            explain: "An interface with one implementation is indirection without flexibility. Abstraction pays off when there is a genuine second case; adding it speculatively is a cost with no return."
          }
        ]
      },

      {
        id: "m28l2", title: "Dependency inversion", minutes: 12,
        concepts: ["dependency-injection", "open-closed", "coupling"],
        content: L([
          "## Depend on what you need, not on what provides it",
          "",
          "~~~py",
          "class ReportGenerator:",
          "    def __init__(self):",
          "        self.db = PostgresConnection('prod-server')     # welded in",
          "        self.emailer = SmtpEmailer('smtp.company.com')",
          "",
          "    def run(self):",
          "        rows = self.db.query('SELECT ...')",
          "        self.emailer.send('boss@company.com', summarise(rows))",
          "~~~",
          "",
          "Problems, all of them practical:",
          "",
          "- you cannot test it without a live database and a mail server",
          "- running it against a test database means editing the class",
          "- it will happily email your boss during a unit test",
          "",
          "## Pass dependencies in",
          "",
          "~~~py",
          "class ReportGenerator:",
          "    def __init__(self, db, emailer):",
          "        self.db = db",
          "        self.emailer = emailer",
          "",
          "    def run(self, recipient):",
          "        rows = self.db.query('SELECT ...')",
          "        self.emailer.send(recipient, summarise(rows))",
          "~~~",
          "",
          "~~~py",
          "generator = ReportGenerator(PostgresConnection('prod'), SmtpEmailer(...))   # production",
          "generator = ReportGenerator(FakeDb([...]), CollectingEmailer())              # tests",
          "~~~",
          "",
          "That is **dependency injection**, and despite the intimidating name it is exactly this: pass the",
          "thing in instead of constructing it inside.",
          "",
          ":::why The test is the point",
          "`CollectingEmailer` records what would have been sent, so you can assert on it. No network, no",
          "waiting, no risk. Code that is easy to test is easy to test *because* its dependencies are visible",
          "and replaceable — which is the same property that makes it easy to change.",
          ":::",
          "",
          "## The same idea for functions",
          "",
          "~~~py",
          "def process(path):",
          "    with open(path) as f:              # hard-wired to the filesystem",
          "        ...",
          "",
          "def process(lines):                     # works with a file, a list, a network stream",
          "    ...",
          "~~~",
          "",
          "**Take the data, not the source of the data.** This one habit makes a surprising proportion of code",
          "reusable and testable for free.",
          "",
          "## Injecting time and randomness",
          "",
          "~~~py",
          "def is_expired(created_at, now=None):",
          "    now = now or datetime.now()",
          "    return (now - created_at).days > 30",
          "~~~",
          "",
          "Now the boundary case is testable: pass a specific `now` and assert. Otherwise you are writing a test",
          "that only fails on a particular day.",
          "",
          "## Extension without modification",
          "",
          "~~~py",
          "def export(rows, format):",
          "    if format == 'csv': ...",
          "    elif format == 'json': ...",
          "    elif format == 'xml': ...        # every new format edits this function",
          "~~~",
          "",
          "~~~py",
          "EXPORTERS = {'csv': export_csv, 'json': export_json}",
          "",
          "def export(rows, format):",
          "    exporter = EXPORTERS.get(format)",
          "    if exporter is None:",
          "        raise ValueError(f'unknown format: {format}')",
          "    return exporter(rows)",
          "~~~",
          "",
          "Adding XML now means adding a function and a dictionary entry — the existing, working, tested code",
          "is not touched. That is the useful half of the *open/closed principle*: **open to extension, closed",
          "to modification**.",
          "",
          "The dispatch table from Module 12 turns out to be an architectural pattern.",
          "",
          ":::warn The limit of this idea",
          "You cannot make code open to *every* possible extension. Predicting the wrong axis of change costs",
          "more than the rigidity it was meant to avoid. Apply it where variation has actually shown up —",
          "typically the second or third time you add a similar case.",
          ":::"
        ]),
        exercises: [
          {
            kind: "refactor", title: "Inject the dependencies", difficulty: 4,
            concepts: ["dependency-injection"],
            prompt: L([
              "`Notifier` constructs its own sender and clock, so it cannot be tested. Refactor it so both are",
              "passed to `__init__`, with sensible defaults.",
              "",
              "- `__init__(self, sender=None, clock=None)`",
              "- `sender` defaults to `print_sender`, `clock` defaults to `real_clock`",
              "- `notify(message)` calls `self.sender(f'[{self.clock()}] {message}')` and returns what the sender returns",
              "",
              "The behaviour with no arguments must be unchanged."
            ]),
            starter: L([
              "def print_sender(text):",
              "    print(text)",
              "    return True",
              "",
              "",
              "def real_clock():",
              "    return '2024-03-11'",
              "",
              "",
              "class Notifier:",
              "    def __init__(self):",
              "        self.sender = print_sender",
              "        self.clock = real_clock",
              "",
              "    def notify(self, message):",
              "        return self.sender(f'[{self.clock()}] {message}')"
            ]),
            hints: [
              "`def __init__(self, sender=None, clock=None):`",
              "`self.sender = sender or print_sender`",
              "Keep `notify` exactly as it is."
            ],
            tests: [
              {
                name: "defaults still work",
                code: "import io, sys\nbuf = io.StringIO()\nold = sys.stdout\nsys.stdout = buf\nresult = Notifier().notify('hello')\nsys.stdout = old\nassert result is True\nassert buf.getvalue().strip() == '[2024-03-11] hello'"
              },
              {
                name: "a fake sender can be injected",
                code: "sent = []\nn = Notifier(sender=sent.append)\nn.notify('hi')\nassert sent == ['[2024-03-11] hi'], sent"
              },
              {
                name: "the clock can be injected",
                code: "sent = []\nn = Notifier(sender=sent.append, clock=lambda: '1999-12-31')\nn.notify('party')\nassert sent == ['[1999-12-31] party']"
              },
              {
                name: "nothing is printed when a fake sender is used",
                code: "import io, sys\nbuf = io.StringIO()\nold = sys.stdout\nsys.stdout = buf\nNotifier(sender=lambda t: None).notify('quiet')\nsys.stdout = old\nassert buf.getvalue() == '', 'the injected sender should replace printing entirely'"
              }
            ],
            solution: L([
              "def print_sender(text):",
              "    print(text)",
              "    return True",
              "",
              "",
              "def real_clock():",
              "    return '2024-03-11'",
              "",
              "",
              "class Notifier:",
              "    def __init__(self, sender=None, clock=None):",
              "        self.sender = sender or print_sender",
              "        self.clock = clock or real_clock",
              "",
              "    def notify(self, message):",
              "        return self.sender(f'[{self.clock()}] {message}')"
            ]),
            takeaway: "Two default parameters turned untestable code into code you can assert on exactly, with no mocking library and no change to how production uses it."
          },
          {
            kind: "refactor", title: "Open for extension", difficulty: 4,
            concepts: ["open-closed"],
            prompt: L([
              "Replace this `if/elif` chain with a registry so that adding a format requires **no change** to",
              "`export`.",
              "",
              "- keep a module-level dict `EXPORTERS` mapping a name to a function",
              "- `export(rows, fmt)` looks it up and raises `ValueError` for an unknown format",
              "- add a `register(name, func)` function so new formats can be added from outside"
            ]),
            starter: L([
              "def export(rows, fmt):",
              "    if fmt == 'csv':",
              "        return '\\n'.join(','.join(r) for r in rows)",
              "    elif fmt == 'lines':",
              "        return '\\n'.join(' '.join(r) for r in rows)",
              "    else:",
              "        raise ValueError(f'unknown format: {fmt}')"
            ]),
            forbids: [{ re: "\\belif\\b", msg: "Replace the chain with a registry" }],
            hints: [
              "Write `export_csv(rows)` and `export_lines(rows)` as separate functions.",
              "`EXPORTERS = {'csv': export_csv, 'lines': export_lines}`",
              "`register(name, func)` just assigns into the dict."
            ],
            tests: [
              { name: "csv still works", call: "export([['a', 'b'], ['c', 'd']], 'csv')", expect: "a,b\nc,d" },
              { name: "lines still works", call: "export([['a', 'b']], 'lines')", expect: "a b" },
              { name: "unknown format raises", call: "export([], 'xml')", raises: "ValueError" },
              {
                name: "a new format can be added without touching export",
                code: "register('upper', lambda rows: '|'.join(c.upper() for r in rows for c in r))\nassert export([['a', 'b']], 'upper') == 'A|B'"
              },
              { name: "EXPORTERS is a dict", code: "assert isinstance(EXPORTERS, dict) and 'csv' in EXPORTERS" }
            ],
            solution: L([
              "def export_csv(rows):",
              "    return '\\n'.join(','.join(r) for r in rows)",
              "",
              "",
              "def export_lines(rows):",
              "    return '\\n'.join(' '.join(r) for r in rows)",
              "",
              "",
              "EXPORTERS = {",
              "    'csv': export_csv,",
              "    'lines': export_lines,",
              "}",
              "",
              "",
              "def register(name, func):",
              "    EXPORTERS[name] = func",
              "",
              "",
              "def export(rows, fmt):",
              "    exporter = EXPORTERS.get(fmt)",
              "    if exporter is None:",
              "        raise ValueError(f'unknown format: {fmt}')",
              "    return exporter(rows)"
            ])
          },
          {
            kind: "code", title: "Injectable clock", difficulty: 3,
            concepts: ["dependency-injection"],
            prompt: L([
              "Write `is_expired(created_day, ttl_days, today=None)` where days are plain integers",
              "(day numbers since some epoch).",
              "",
              "It returns whether more than `ttl_days` have passed. When `today` is not given, it uses",
              "`current_day()` — provided for you.",
              "",
              "The boundary is exclusive: exactly `ttl_days` later is **not** expired."
            ]),
            starter: "def current_day():\n    return 100\n\n\ndef is_expired(created_day, ttl_days, today=None):\n    ",
            hints: [
              "`if today is None: today = current_day()` — note `or` would be wrong here, because day 0 is falsy.",
              "`return today - created_day > ttl_days`"
            ],
            tests: [
              { name: "not yet expired", call: "is_expired(95, 30)", expect: false },
              { name: "expired", call: "is_expired(50, 30)", expect: true },
              { name: "exactly at the boundary", call: "is_expired(70, 30)", expect: false },
              { name: "one day past", call: "is_expired(69, 30)", expect: true },
              { name: "injected today", call: "is_expired(0, 5, today=10)", expect: true },
              { name: "day zero is handled", call: "is_expired(0, 5, today=3)", expect: false }
            ],
            solution: L([
              "def current_day():",
              "    return 100",
              "",
              "",
              "def is_expired(created_day, ttl_days, today=None):",
              "    if today is None:",
              "        today = current_day()",
              "    return today - created_day > ttl_days"
            ]),
            takeaway: "`today or current_day()` would break when `today=0`, because 0 is falsy. For optional parameters that can legitimately be zero or empty, always test against `None`."
          },
          {
            kind: "quiz", title: "Why inject", difficulty: 3,
            concepts: ["dependency-injection"],
            prompt: "What is the main practical benefit of passing a database connection into a class rather than creating it inside?",
            choices: [
              "It is faster",
              "The class can be used with a real connection, a test double or a different database without modification",
              "It uses less memory",
              "It avoids import statements"
            ],
            answer: 1,
            explain: "The class states what it needs rather than deciding where it comes from. That makes it testable, reusable across environments, and unaffected by changes to how connections are created."
          }
        ]
      },

      {
        id: "m28l3", title: "Refactoring and project structure", minutes: 12,
        concepts: ["refactoring", "project-layout", "packaging"],
        content: L([
          "## Refactoring means behaviour does not change",
          "",
          "Changing structure **and** behaviour at once is not refactoring — it is a rewrite, and when it",
          "breaks you cannot tell which half caused it.",
          "",
          "**The loop:**",
          "",
          "1. Make sure there are tests (write them first if not).",
          "2. Make one small structural change.",
          "3. Run the tests.",
          "4. Commit.",
          "5. Repeat.",
          "",
          "Committing after each green step means you are never more than one `git reset` from working code.",
          "",
          "## The moves worth knowing by name",
          "",
          "| Move | When |",
          "|---|---|",
          "| **Extract function** | a block needs a comment to explain it |",
          "| **Rename** | the name no longer says what it does |",
          "| **Introduce variable** | a complex expression appears inline |",
          "| **Replace conditional with dispatch** | a growing `if/elif` chain |",
          "| **Extract class** | several functions share the same arguments |",
          "| **Inline** | an abstraction that adds nothing |",
          "| **Guard clauses** | deeply nested conditionals |",
          "",
          "Extract function is the workhorse. If you were about to write a comment saying *now calculate the",
          "discount*, that block wants to be `calculate_discount(...)` instead — the name replaces the comment",
          "and the code becomes testable.",
          "",
          "## Project layout",
          "",
          "```text",
          "myproject/",
          "├── pyproject.toml        metadata and dependencies",
          "├── README.md             what it is and how to run it",
          "├── .gitignore",
          "├── src/",
          "│   └── myapp/",
          "│       ├── __init__.py",
          "│       ├── __main__.py   entry point: python -m myapp",
          "│       ├── core.py       business logic (pure)",
          "│       ├── storage.py    database and files",
          "│       └── cli.py        argument parsing and output",
          "└── tests/",
          "    ├── test_core.py",
          "    └── test_storage.py",
          "```",
          "",
          "Two things to notice:",
          "",
          "- the module names are the **layers** from lesson one — the structure on disk mirrors the design",
          "- `src/` means your tests import the installed package, not whatever happens to be in the current",
          "  directory. That catches packaging mistakes before your users do.",
          "",
          "## pyproject.toml",
          "",
          "~~~text",
          "[project]",
          "name = \"myapp\"",
          "version = \"0.1.0\"",
          "requires-python = \">=3.10\"",
          "dependencies = [\"requests>=2.31\"]",
          "",
          "[project.scripts]",
          "myapp = \"myapp.cli:main\"",
          "",
          "[build-system]",
          "requires = [\"hatchling\"]",
          "build-backend = \"hatchling.build\"",
          "~~~",
          "",
          "`pip install -e .` installs it in editable mode; `[project.scripts]` creates a real `myapp` command",
          "on the user's path.",
          "",
          "## Semantic versioning",
          "",
          "`MAJOR.MINOR.PATCH`:",
          "",
          "- **PATCH** — a bug fix, nothing else changes",
          "- **MINOR** — new functionality, existing code keeps working",
          "- **MAJOR** — something that was working now breaks",
          "",
          "The contract is for *your users*: a MINOR upgrade should never require them to change code.",
          "",
          ":::tip Leave it better than you found it",
          "You will rarely be given time for a dedicated refactoring project. What works is the boy-scout rule:",
          "every time you touch a file, improve one thing — a name, an extracted function, a test. Over a year",
          "that transforms a codebase, and it never needs approval.",
          ":::"
        ]),
        exercises: [
          {
            kind: "refactor", title: "Extract until it reads", difficulty: 4,
            concepts: ["refactoring"],
            prompt: L([
              "This function does four things and needs comments to explain itself. Refactor it into",
              "well-named helpers so the main function reads as a summary.",
              "",
              "Required functions: `is_valid(row)`, `normalise(row)`, `calculate_score(row)` and",
              "`process(rows)` which uses all three.",
              "",
              "`process` returns a list of `(name, score)` tuples for the valid rows, sorted by score descending.",
              "",
              "Behaviour must not change."
            ]),
            starter: L([
              "def process(rows):",
              "    results = []",
              "    for row in rows:",
              "        # skip invalid rows",
              "        if not row.get('name') or row.get('points') is None:",
              "            continue",
              "        if not isinstance(row['points'], (int, float)):",
              "            continue",
              "        # normalise the name",
              "        name = row['name'].strip().title()",
              "        # calculate the score",
              "        score = row['points'] * 10",
              "        if row.get('bonus'):",
              "            score += 50",
              "        results.append((name, score))",
              "    results.sort(key=lambda pair: -pair[1])",
              "    return results"
            ]),
            requires: [
              { contains: "def is_valid", msg: "Extract is_valid" },
              { contains: "def normalise", msg: "Extract normalise" },
              { contains: "def calculate_score", msg: "Extract calculate_score" }
            ],
            hints: [
              "`is_valid(row)` returns a boolean and contains the two skip conditions.",
              "`normalise(row)` returns the cleaned name.",
              "`calculate_score(row)` returns the number.",
              "`process` becomes a short loop that calls all three."
            ],
            tests: [
              {
                name: "same results",
                code: "rows = [{'name': ' ada ', 'points': 3}, {'name': 'bo', 'points': 5, 'bonus': True}, {'name': '', 'points': 9}]\nassert process(rows) == [('Bo', 100), ('Ada', 30)], process(rows)"
              },
              { name: "invalid rows are skipped", code: "assert process([{'name': 'x', 'points': None}]) == []" },
              { name: "non-numeric points are skipped", code: "assert process([{'name': 'x', 'points': 'lots'}]) == []" },
              { name: "empty input", code: "assert process([]) == []" },
              { name: "is_valid works alone", code: "assert is_valid({'name': 'a', 'points': 1}) is True\nassert is_valid({'name': '', 'points': 1}) is False" },
              { name: "normalise works alone", code: "assert normalise({'name': '  ada lovelace '}) == 'Ada Lovelace'" },
              { name: "calculate_score works alone", code: "assert calculate_score({'points': 2}) == 20\nassert calculate_score({'points': 2, 'bonus': True}) == 70" },
              {
                name: "process is now short",
                code: "import inspect, textwrap\nbody = textwrap.dedent(inspect.getsource(process))\nlines = [l for l in body.split('\\n') if l.strip()]\nassert len(lines) <= 10, f'process is still {len(lines)} lines — extract more'"
              }
            ],
            solution: L([
              "def is_valid(row):",
              "    if not row.get('name') or row.get('points') is None:",
              "        return False",
              "    return isinstance(row['points'], (int, float))",
              "",
              "",
              "def normalise(row):",
              "    return row['name'].strip().title()",
              "",
              "",
              "def calculate_score(row):",
              "    score = row['points'] * 10",
              "    if row.get('bonus'):",
              "        score += 50",
              "    return score",
              "",
              "",
              "def process(rows):",
              "    results = []",
              "    for row in rows:",
              "        if not is_valid(row):",
              "            continue",
              "        results.append((normalise(row), calculate_score(row)))",
              "    results.sort(key=lambda pair: -pair[1])",
              "    return results"
            ]),
            takeaway: "Every comment became a function name, and each rule is now independently testable — which is why the checks could test them separately."
          },
          {
            kind: "quiz", title: "What refactoring is", difficulty: 2,
            concepts: ["refactoring"],
            prompt: "Which of these is refactoring?",
            choices: [
              "Adding a new feature while tidying the code",
              "Changing the structure of the code without changing what it does",
              "Rewriting the module from scratch",
              "Fixing a bug"
            ],
            answer: 1,
            explain: "Refactoring changes structure only, so the existing tests are the safety net. Mixing it with behaviour changes removes that net exactly when you need it."
          },
          {
            kind: "quiz", title: "Layout", difficulty: 3,
            concepts: ["project-layout"],
            prompt: "Why put your package under `src/` rather than at the repository root?",
            choices: [
              "It looks tidier",
              "Tests then import the installed package rather than the local directory, so packaging mistakes are caught",
              "It is required by pip",
              "It makes imports faster"
            ],
            answer: 1,
            explain: "With the package at the root, Python finds it via the current directory whether or not it was packaged correctly. `src/` forces the import to go through the real installation."
          },
          {
            kind: "quiz", title: "Version numbers", difficulty: 2,
            concepts: ["packaging"],
            prompt: "You rename a public function's parameter. Under semantic versioning, what kind of release is that?",
            choices: ["PATCH", "MINOR", "MAJOR", "No version change needed"],
            answer: 2,
            explain: "Anyone calling it with that keyword argument breaks. Any change that can break existing correct usage is a MAJOR release, however small it looks in the diff."
          }
        ]
      }
    ],

    checkpoint: {
      id: "m28cp", pass: 0.8,
      title: "Checkpoint: Design & Architecture",
      items: [
        {
          kind: "refactor", title: "Pure logic out", difficulty: 3, concepts: ["separation"],
          prompt: "Extract the calculation from this function into `net_pay(gross, tax_rate)` returning a float rounded to 2 places, and have `report_pay` use it and print.",
          starter: "def report_pay(gross, tax_rate):\n    net = round(gross * (1 - tax_rate), 2)\n    print(f'Net: {net:.2f}')",
          tests: [
            { name: "pure function", call: "net_pay(1000, 0.2)", expect: 800.0 },
            { name: "rounds", call: "net_pay(1000, 0.333)", expect: 667.0 },
            {
              name: "report still prints",
              code: "import io, sys\nbuf = io.StringIO()\nold = sys.stdout\nsys.stdout = buf\nreport_pay(1000, 0.2)\nsys.stdout = old\nassert buf.getvalue().strip() == 'Net: 800.00'"
            },
            { name: "net_pay does not print", code: "import io, sys\nbuf = io.StringIO()\nold = sys.stdout\nsys.stdout = buf\nnet_pay(1, 0)\nsys.stdout = old\nassert buf.getvalue() == ''" }
          ]
        },
        {
          kind: "quiz", title: "Coupling", difficulty: 3, concepts: ["coupling"],
          prompt: "Which is the strongest sign of excessive coupling?",
          choices: [
            "A module has many functions",
            "A one-line change requires edits in five other files",
            "A class has a long name",
            "There are many imports at the top of a file"
          ],
          answer: 1,
          explain: "Change amplification is the practical cost of coupling. If one conceptual change ripples across the codebase, the boundaries are in the wrong places."
        },
        {
          kind: "code", title: "Injectable dependency", difficulty: 3, concepts: ["dependency-injection"],
          prompt: "Write `Audit` with `__init__(self, writer=None)` defaulting to `print`, and `record(event)` calling the writer with `f'AUDIT: {event}'`.",
          starter: "class Audit:\n    ",
          tests: [
            { name: "injected writer", code: "log = []\nAudit(writer=log.append).record('login')\nassert log == ['AUDIT: login']" },
            {
              name: "defaults to printing",
              code: "import io, sys\nbuf = io.StringIO()\nold = sys.stdout\nsys.stdout = buf\nAudit().record('x')\nsys.stdout = old\nassert buf.getvalue().strip() == 'AUDIT: x'"
            }
          ]
        },
        {
          kind: "quiz", title: "Open/closed", difficulty: 3, concepts: ["open-closed"],
          prompt: "A dispatch dictionary replaces a growing if/elif chain. What is the benefit?",
          choices: [
            "It runs faster",
            "New cases are added without editing existing, tested code",
            "It uses less memory",
            "It removes the need for tests"
          ],
          answer: 1,
          explain: "Every edit to working code risks breaking it. Adding an entry to a registry leaves the dispatch logic untouched, so existing behaviour cannot regress."
        },
        {
          kind: "quiz", title: "Abstraction cost", difficulty: 3, concepts: ["separation"],
          prompt: "When is the right time to introduce an abstraction for variation?",
          choices: [
            "Before writing any code, to be safe",
            "When a second real case appears and the shared shape is now visible",
            "Never",
            "Whenever a function exceeds ten lines"
          ],
          answer: 1,
          explain: "One case gives you no information about which parts vary. The second case shows you where the seam actually is, and guessing earlier usually puts it in the wrong place."
        }
      ]
    },

    project: {
      id: "m28proj",
      title: "Project: Rescue the Legacy Script",
      xp: 520,
      filename: "inventory.py",
      concepts: ["separation", "dependency-injection", "refactoring", "single-responsibility", "class-def", "raise"],
      brief: L([
        "You have inherited a 60-line script that works and is unmaintainable. Everything is in one function:",
        "parsing, validation, business rules, storage and printing.",
        "",
        "Your job is the one you will do most often as a professional: **restructure it without changing what",
        "it does**, so that it can be tested, extended and understood.",
        "",
        "Each stage extracts one layer. The final stage proves the whole thing still behaves identically —",
        "and that the parts now work independently.",
        "",
        "~~~py",
        "# The original, for reference",
        "def run(raw_lines):",
        "    inventory = {}",
        "    for line in raw_lines:",
        "        parts = line.split(',')",
        "        if len(parts) != 3:",
        "            print('bad line')",
        "            continue",
        "        name = parts[0].strip().lower()",
        "        qty = int(parts[1])",
        "        price = float(parts[2])",
        "        if qty < 0:",
        "            print('bad qty')",
        "            continue",
        "        inventory[name] = {'qty': qty, 'price': price}",
        "        print(f'{name}: {qty} @ {price}')",
        "    total = 0",
        "    for item in inventory.values():",
        "        total += item['qty'] * item['price']",
        "    print(f'TOTAL {total:.2f}')",
        "~~~",
        "",
        ":::tip This is the real skill",
        "Nobody will thank you for the rewrite that broke production. Every stage here keeps the behaviour",
        "identical while making the structure better — which is exactly how it is done in practice.",
        ":::"
      ]),
      starter: L([
        "\"\"\"Inventory — rescued from a legacy script.\"\"\"",
        "",
        "",
        "# Stage 1: parsing",
        "def parse_line(line):",
        "    ...",
        "",
        "",
        "# Stage 2: pure logic",
        "def total_value(inventory):",
        "    ...",
        "",
        "",
        "# Stage 3: storage",
        "class Inventory:",
        "    ...",
        "",
        "",
        "# Stage 4: presentation and wiring",
        "def run(raw_lines, output=None):",
        "    ..."
      ]),
      outro: L([
        "The behaviour is identical and the code is a different thing entirely: parsing that can be tested",
        "against malformed input, business rules with no I/O anywhere near them, storage that enforces its own",
        "invariants, and presentation injected so a test can capture it.",
        "",
        "**This is the work.** Most professional programming is not writing new systems — it is making existing",
        "ones safe to change.",
        "",
        "One module of preparation left, and then the Capstone."
      ]),
      stages: [
        {
          title: "Extract the parser",
          xp: 110,
          spec: L([
            "Write `parse_line(line)` returning a dictionary `{'name', 'qty', 'price'}` for a valid line,",
            "or raising `ValueError` with a useful message for an invalid one.",
            "",
            "A line is `name,quantity,price`. Rules:",
            "",
            "- exactly three comma-separated fields, or `ValueError`",
            "- the name is stripped and lowercased, and must not be empty",
            "- the quantity must parse as an `int` and be zero or more",
            "- the price must parse as a `float` and be zero or more",
            "",
            "Parsing must not print anything."
          ]),
          tests: [
            { name: "parses a valid line", code: "assert parse_line(' Widget , 4, 9.99') == {'name': 'widget', 'qty': 4, 'price': 9.99}" },
            { name: "zero quantity is allowed", code: "assert parse_line('a,0,1.0')['qty'] == 0" },
            { name: "wrong field count raises", code: "for bad in ['a,1', 'a,1,2,3', '']:\n    try:\n        parse_line(bad)\n        raise AssertionError(f'{bad!r} should raise')\n    except ValueError:\n        pass" },
            { name: "empty name raises", code: "try:\n    parse_line(' ,1,2')\n    raise AssertionError('should raise')\nexcept ValueError:\n    pass" },
            { name: "non-numeric quantity raises", code: "try:\n    parse_line('a,lots,2')\n    raise AssertionError('should raise')\nexcept ValueError:\n    pass" },
            { name: "negative quantity raises", code: "try:\n    parse_line('a,-1,2')\n    raise AssertionError('should raise')\nexcept ValueError:\n    pass" },
            { name: "negative price raises", code: "try:\n    parse_line('a,1,-2')\n    raise AssertionError('should raise')\nexcept ValueError:\n    pass" },
            { name: "the parser is silent", code: "import io, sys\nbuf = io.StringIO()\nold = sys.stdout\nsys.stdout = buf\nparse_line('a,1,2')\nsys.stdout = old\nassert buf.getvalue() == '', 'parsing must not print'" }
          ]
        },
        {
          title: "Extract the logic",
          xp: 110,
          spec: L([
            "Write two **pure** functions — no I/O, no printing, no globals:",
            "",
            "- `total_value(inventory)` — the sum of `qty * price` across a dict of items, rounded to 2 places",
            "- `low_stock(inventory, threshold)` — a sorted list of names whose quantity is below the threshold",
            "",
            "`inventory` maps a name to `{'qty': int, 'price': float}`."
          ]),
          tests: [
            {
              name: "totals correctly",
              code: "inv = {'a': {'qty': 2, 'price': 3.0}, 'b': {'qty': 1, 'price': 0.5}}\nassert total_value(inv) == 6.5"
            },
            { name: "empty inventory", code: "assert total_value({}) == 0" },
            { name: "rounds to two places", code: "assert total_value({'a': {'qty': 3, 'price': 0.333}}) == 1.0" },
            {
              name: "low stock is sorted",
              code: "inv = {'zebra': {'qty': 1, 'price': 1}, 'apple': {'qty': 0, 'price': 1}, 'big': {'qty': 99, 'price': 1}}\nassert low_stock(inv, 5) == ['apple', 'zebra']"
            },
            { name: "threshold is exclusive", code: "assert low_stock({'a': {'qty': 5, 'price': 1}}, 5) == []" },
            { name: "nothing low", code: "assert low_stock({'a': {'qty': 100, 'price': 1}}, 5) == []" },
            {
              name: "the logic is pure",
              code: "import io, sys\nbuf = io.StringIO()\nold = sys.stdout\nsys.stdout = buf\ntotal_value({'a': {'qty': 1, 'price': 1}})\nlow_stock({}, 1)\nsys.stdout = old\nassert buf.getvalue() == '', 'the logic layer must not print'"
            }
          ]
        },
        {
          title: "Extract the storage",
          xp: 130,
          spec: L([
            "Write an `Inventory` class holding the items and protecting its own state:",
            "",
            "- `__init__(self)` starts empty",
            "- `add(item)` takes a parsed dict and stores it by name; adding the same name again **replaces** it",
            "- `get(name)` returns the item dict or `None`",
            "- `items()` returns the underlying dict",
            "- `__len__` returns the number of distinct items",
            "- `total()` returns `total_value` of its contents",
            "",
            "`add` raises `ValueError` if the dict is missing any of `name`, `qty` or `price`."
          ]),
          tests: [
            { name: "starts empty", code: "inv = Inventory()\nassert len(inv) == 0 and inv.total() == 0" },
            {
              name: "adds and reads back",
              code: "inv = Inventory()\ninv.add({'name': 'widget', 'qty': 2, 'price': 3.0})\nassert len(inv) == 1\nassert inv.get('widget') == {'name': 'widget', 'qty': 2, 'price': 3.0}"
            },
            { name: "unknown name gives None", code: "assert Inventory().get('nope') is None" },
            {
              name: "adding the same name replaces",
              code: "inv = Inventory()\ninv.add({'name': 'a', 'qty': 1, 'price': 1.0})\ninv.add({'name': 'a', 'qty': 5, 'price': 1.0})\nassert len(inv) == 1 and inv.get('a')['qty'] == 5"
            },
            {
              name: "total uses the logic layer",
              code: "inv = Inventory()\ninv.add({'name': 'a', 'qty': 2, 'price': 3.0})\ninv.add({'name': 'b', 'qty': 1, 'price': 0.5})\nassert inv.total() == 6.5"
            },
            {
              name: "incomplete items are refused",
              code: "inv = Inventory()\nfor bad in [{'qty': 1, 'price': 1}, {'name': 'a', 'price': 1}, {'name': 'a', 'qty': 1}]:\n    try:\n        inv.add(bad)\n        raise AssertionError(f'{bad} should raise')\n    except ValueError:\n        pass"
            },
            { name: "instances are independent", code: "a = Inventory()\nb = Inventory()\na.add({'name': 'x', 'qty': 1, 'price': 1.0})\nassert len(b) == 0" }
          ]
        },
        {
          title: "Wire it together",
          xp: 170,
          spec: L([
            "Write `run(raw_lines, output=None)` doing what the original did — but with the output **injected**.",
            "",
            "- `output` is a function taking one string; when not given it defaults to `print`",
            "- for each line: parse it, add it to an `Inventory`, and emit `'<name>: <qty> @ <price>'`",
            "- for a line that fails to parse, emit `'skipped: <the error message>'` and carry on",
            "- at the end, emit `'TOTAL <total>'` with the total to 2 decimal places",
            "- return the `Inventory`",
            "",
            "Example — for the lines `Widget,2,3.00` and `bad line`:",
            "",
            "~~~text",
            "widget: 2 @ 3.0",
            "skipped: expected 3 fields, got 1",
            "TOTAL 6.00",
            "~~~",
            "",
            "The exact wording of a parse error is yours; the checks only require that the skipped line is",
            "reported and that processing continues."
          ]),
          tests: [
            {
              name: "emits a line per item and a total",
              code: "out = []\nrun(['Widget,2,3.00'], output=out.append)\nassert out[0] == 'widget: 2 @ 3.0', out\nassert out[-1] == 'TOTAL 6.00', out"
            },
            {
              name: "bad lines are reported and skipped",
              code: "out = []\ninv = run(['a,1,1.0', 'garbage', 'b,2,2.0'], output=out.append)\nassert len(inv) == 2, 'valid lines must still be processed'\nassert any(line.startswith('skipped') for line in out), out\nassert out[-1] == 'TOTAL 5.00', out"
            },
            { name: "returns the inventory", code: "inv = run(['a,1,1.0'], output=lambda t: None)\nassert isinstance(inv, Inventory) and len(inv) == 1" },
            { name: "no lines still totals", code: "out = []\nrun([], output=out.append)\nassert out == ['TOTAL 0.00'], out" },
            {
              name: "output really is injected",
              code: "import io, sys\nbuf = io.StringIO()\nold = sys.stdout\nsys.stdout = buf\nrun(['a,1,1.0'], output=lambda t: None)\nsys.stdout = old\nassert buf.getvalue() == '', 'nothing should be printed when output is injected'"
            },
            {
              name: "defaults to printing",
              code: "import io, sys\nbuf = io.StringIO()\nold = sys.stdout\nsys.stdout = buf\nrun(['a,1,1.0'])\nsys.stdout = old\nassert 'TOTAL 1.00' in buf.getvalue()"
            },
            {
              name: "every earlier stage still passes",
              code: "assert parse_line('a,1,2.0')['name'] == 'a'\nassert total_value({'a': {'qty': 1, 'price': 2.0}}) == 2.0\nassert low_stock({'a': {'qty': 0, 'price': 1}}, 1) == ['a']\nassert len(Inventory()) == 0"
            }
          ]
        }
      ],
      solution: L([
        "\"\"\"Inventory — rescued from a legacy script (reference solution).\"\"\"",
        "",
        "",
        "def parse_line(line):",
        "    parts = line.split(',')",
        "    if len(parts) != 3:",
        "        raise ValueError(f'expected 3 fields, got {len(parts)}')",
        "",
        "    name = parts[0].strip().lower()",
        "    if not name:",
        "        raise ValueError('name must not be empty')",
        "",
        "    try:",
        "        qty = int(parts[1].strip())",
        "    except ValueError as error:",
        "        raise ValueError(f'quantity is not a whole number: {parts[1]!r}') from error",
        "    if qty < 0:",
        "        raise ValueError(f'quantity must not be negative: {qty}')",
        "",
        "    try:",
        "        price = float(parts[2].strip())",
        "    except ValueError as error:",
        "        raise ValueError(f'price is not a number: {parts[2]!r}') from error",
        "    if price < 0:",
        "        raise ValueError(f'price must not be negative: {price}')",
        "",
        "    return {'name': name, 'qty': qty, 'price': price}",
        "",
        "",
        "def total_value(inventory):",
        "    return round(sum(i['qty'] * i['price'] for i in inventory.values()), 2)",
        "",
        "",
        "def low_stock(inventory, threshold):",
        "    return sorted(name for name, item in inventory.items() if item['qty'] < threshold)",
        "",
        "",
        "class Inventory:",
        "    def __init__(self):",
        "        self._items = {}",
        "",
        "    def add(self, item):",
        "        for key in ('name', 'qty', 'price'):",
        "            if key not in item:",
        "                raise ValueError(f'item is missing {key!r}')",
        "        self._items[item['name']] = item",
        "",
        "    def get(self, name):",
        "        return self._items.get(name)",
        "",
        "    def items(self):",
        "        return self._items",
        "",
        "    def total(self):",
        "        return total_value(self._items)",
        "",
        "    def __len__(self):",
        "        return len(self._items)",
        "",
        "",
        "def run(raw_lines, output=None):",
        "    emit = output or print",
        "    inventory = Inventory()",
        "",
        "    for line in raw_lines:",
        "        try:",
        "            item = parse_line(line)",
        "        except ValueError as error:",
        "            emit(f'skipped: {error}')",
        "            continue",
        "        inventory.add(item)",
        "        emit(f\"{item['name']}: {item['qty']} @ {item['price']}\")",
        "",
        "    emit(f'TOTAL {inventory.total():.2f}')",
        "    return inventory"
      ])
    }
  });
})();
