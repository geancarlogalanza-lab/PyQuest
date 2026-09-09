/* Tier 3 · Module 23 — Databases with SQLite + Contacts project */
(function () {
  const L = a => a.join("\n");

  PQ.defineModule({
    id: "m23", tier: 3, order: 23, icon: "🗄️",
    title: "Databases",
    blurb: "SQL, sqlite3, parameterised queries and schema design — persistence that scales past a JSON file.",
    intro: L([
      "A JSON file is fine until two things happen at once, the data outgrows memory, or you need to ask a",
      "question the file was not organised for. Then you want a database.",
      "",
      "SQLite is built into Python, needs no server, stores everything in one file, and is used in phones,",
      "browsers and aircraft. It is a real database, and everything you learn here transfers to PostgreSQL."
    ]),
    concepts: [
      { id: "sql-basics", name: "SQL basics", importance: 1.5 },
      { id: "sqlite-connect", name: "sqlite3 connections", importance: 1.4 },
      { id: "sql-crud", name: "insert, select, update, delete", importance: 1.5 },
      { id: "sql-params", name: "parameterised queries", importance: 1.6 },
      { id: "sql-injection", name: "SQL injection", importance: 1.5 },
      { id: "transactions", name: "transactions", importance: 1.3 },
      { id: "sql-joins", name: "joins", importance: 1.4 },
      { id: "schema-design", name: "schema design", importance: 1.3 },
      { id: "sql-aggregate", name: "aggregation and grouping", importance: 1.3 }
    ],

    lessons: [
      {
        id: "m23l1", title: "Tables, rows and SELECT", minutes: 13,
        concepts: ["sql-basics", "sqlite-connect", "sql-crud"],
        content: L([
          "## Connecting",
          "",
          "~~~py",
          "import sqlite3",
          "",
          "con = sqlite3.connect('app.db')     # a file; ':memory:' for a temporary one",
          "cur = con.cursor()",
          "",
          "cur.execute('''",
          "    CREATE TABLE IF NOT EXISTS pets (",
          "        id INTEGER PRIMARY KEY,",
          "        name TEXT NOT NULL,",
          "        kind TEXT NOT NULL,",
          "        age INTEGER",
          "    )",
          "''')",
          "con.commit()",
          "~~~",
          "",
          "A **connection** is the database; a **cursor** runs statements and holds results.",
          "`INTEGER PRIMARY KEY` auto-numbers itself in SQLite — you never supply it.",
          "",
          ":::tip Use a with block",
          "~~~py",
          "with sqlite3.connect('app.db') as con:",
          "    con.execute('INSERT INTO pets (name, kind) VALUES (?, ?)', ('Rex', 'dog'))",
          "~~~",
          "The `with` block **commits on success and rolls back on an exception**. Note it does not close the",
          "connection — call `con.close()` when you are done with it.",
          ":::",
          "",
          "## Inserting",
          "",
          "~~~py",
          "cur.execute('INSERT INTO pets (name, kind, age) VALUES (?, ?, ?)', ('Rex', 'dog', 3))",
          "cur.executemany('INSERT INTO pets (name, kind, age) VALUES (?, ?, ?)', [",
          "    ('Mia', 'cat', 7),",
          "    ('Bo', 'dog', 1),",
          "])",
          "con.commit()",
          "print(cur.lastrowid)",
          "~~~",
          "",
          "**Nothing is saved until you commit.** Forgetting `con.commit()` is the most common first mistake —",
          "the program works, and the data vanishes when it exits.",
          "",
          "## Selecting",
          "",
          "~~~py",
          "for row in cur.execute('SELECT name, age FROM pets WHERE kind = ?', ('dog',)):",
          "    print(row)          # ('Rex', 3)",
          "",
          "cur.execute('SELECT * FROM pets')",
          "print(cur.fetchone())    # one row, or None",
          "print(cur.fetchall())    # the rest, as a list",
          "~~~",
          "",
          "Rows are **tuples** by default. For readable code, ask for something better:",
          "",
          "~~~py",
          "con.row_factory = sqlite3.Row",
          "row = con.execute('SELECT * FROM pets').fetchone()",
          "print(row['name'], row['age'])",
          "~~~",
          "",
          ":::trap The one-element tuple",
          "`cur.execute(sql, ('dog'))` passes a **string**, not a tuple, and fails. Parameters must be a",
          "sequence: `('dog',)` — with the trailing comma.",
          ":::",
          "",
          "## The SELECT you will write most",
          "",
          "~~~sql",
          "SELECT name, age              -- which columns",
          "FROM pets                     -- from where",
          "WHERE kind = 'dog' AND age > 2",
          "ORDER BY age DESC             -- how to sort",
          "LIMIT 10;                     -- how many",
          "~~~",
          "",
          "| Clause | Does |",
          "|---|---|",
          "| `WHERE` | filter rows |",
          "| `ORDER BY x ASC/DESC` | sort |",
          "| `LIMIT n OFFSET m` | paginate |",
          "| `DISTINCT` | remove duplicates |",
          "| `LIKE 'a%'` | pattern match (`%` is any run of characters) |",
          "| `IS NULL` / `IS NOT NULL` | test for missing values |",
          "",
          "## Aggregation",
          "",
          "~~~sql",
          "SELECT kind, COUNT(*), AVG(age)",
          "FROM pets",
          "GROUP BY kind",
          "HAVING COUNT(*) > 1;",
          "~~~",
          "",
          "`GROUP BY` collapses rows into groups; `WHERE` filters **rows before** grouping and `HAVING` filters",
          "**groups after**. Mixing those two up is the classic SQL beginner error.",
          "",
          "Letting the database aggregate is almost always faster than pulling every row into Python and",
          "counting there — it was built for exactly this."
        ]),
        exercises: [
          {
            kind: "code", title: "Create and insert", difficulty: 3,
            concepts: ["sqlite-connect", "sql-crud"],
            prompt: L([
              "Write `setup(con)` creating a `books` table with columns `id` (integer primary key),",
              "`title` (text, not null) and `year` (integer).",
              "",
              "Then `add_book(con, title, year)` inserting a row and returning its new id.",
              "",
              "You are given an open connection — do not open your own."
            ]),
            starter: "import sqlite3\n\n\ndef setup(con):\n    \n\ndef add_book(con, title, year):\n    ",
            hints: [
              "`con.execute('CREATE TABLE IF NOT EXISTS books (...)')`",
              "`cur = con.execute('INSERT INTO books (title, year) VALUES (?, ?)', (title, year))`",
              "`cur.lastrowid` is the new id. Remember `con.commit()`."
            ],
            tests: [
              {
                name: "creates the table",
                code: "import sqlite3\ncon = sqlite3.connect(':memory:')\nsetup(con)\nnames = [r[1] for r in con.execute('PRAGMA table_info(books)')]\nassert set(names) == {'id', 'title', 'year'}, names"
              },
              {
                name: "inserts and returns an id",
                code: "import sqlite3\ncon = sqlite3.connect(':memory:')\nsetup(con)\nfirst = add_book(con, 'Dune', 1965)\nsecond = add_book(con, 'Neuromancer', 1984)\nassert isinstance(first, int) and second > first"
              },
              {
                name: "the rows are really there",
                code: "import sqlite3\ncon = sqlite3.connect(':memory:')\nsetup(con)\nadd_book(con, 'Dune', 1965)\nrows = con.execute('SELECT title, year FROM books').fetchall()\nassert rows == [('Dune', 1965)], rows"
              },
              {
                name: "setup can run twice",
                code: "import sqlite3\ncon = sqlite3.connect(':memory:')\nsetup(con)\nsetup(con)\nadd_book(con, 'x', 2000)\nassert con.execute('SELECT COUNT(*) FROM books').fetchone()[0] == 1"
              }
            ],
            solution: L([
              "import sqlite3",
              "",
              "",
              "def setup(con):",
              "    con.execute('''",
              "        CREATE TABLE IF NOT EXISTS books (",
              "            id INTEGER PRIMARY KEY,",
              "            title TEXT NOT NULL,",
              "            year INTEGER",
              "        )",
              "    ''')",
              "    con.commit()",
              "",
              "",
              "def add_book(con, title, year):",
              "    cur = con.execute('INSERT INTO books (title, year) VALUES (?, ?)', (title, year))",
              "    con.commit()",
              "    return cur.lastrowid"
            ])
          },
          {
            kind: "code", title: "Query with filters", difficulty: 3,
            concepts: ["sql-basics", "sql-params"],
            prompt: L([
              "Write `books_after(con, year)` returning a list of titles for books published **after** that year,",
              "ordered by year ascending, then title.",
              "",
              "The table is already created and populated by the checks."
            ]),
            starter: "def books_after(con, year):\n    ",
            hints: [
              "`SELECT title FROM books WHERE year > ? ORDER BY year, title`",
              "`fetchall()` gives a list of one-element tuples — take `row[0]` from each."
            ],
            tests: [
              {
                name: "filters and orders",
                code: "import sqlite3\ncon = sqlite3.connect(':memory:')\ncon.execute('CREATE TABLE books (id INTEGER PRIMARY KEY, title TEXT, year INTEGER)')\ncon.executemany('INSERT INTO books (title, year) VALUES (?, ?)', [('Old', 1950), ('Mid', 1990), ('Alpha', 1990), ('New', 2020)])\nassert books_after(con, 1960) == ['Alpha', 'Mid', 'New'], books_after(con, 1960)"
              },
              {
                name: "the boundary is exclusive",
                code: "import sqlite3\ncon = sqlite3.connect(':memory:')\ncon.execute('CREATE TABLE books (id INTEGER PRIMARY KEY, title TEXT, year INTEGER)')\ncon.execute(\"INSERT INTO books (title, year) VALUES ('Exact', 2000)\")\nassert books_after(con, 2000) == []"
              },
              {
                name: "returns plain strings",
                code: "import sqlite3\ncon = sqlite3.connect(':memory:')\ncon.execute('CREATE TABLE books (id INTEGER PRIMARY KEY, title TEXT, year INTEGER)')\ncon.execute(\"INSERT INTO books (title, year) VALUES ('A', 2020)\")\nresult = books_after(con, 1)\nassert result == ['A'] and isinstance(result[0], str)"
              }
            ],
            solution: L([
              "def books_after(con, year):",
              "    rows = con.execute(",
              "        'SELECT title FROM books WHERE year > ? ORDER BY year, title',",
              "        (year,),",
              "    ).fetchall()",
              "    return [row[0] for row in rows]"
            ])
          },
          {
            kind: "code", title: "Group and count", difficulty: 4,
            concepts: ["sql-aggregate"],
            prompt: L([
              "Write `count_by_decade(con)` returning a dictionary mapping each decade (e.g. `1990`) to how many",
              "books were published in it.",
              "",
              "Do the grouping **in SQL**, not in Python — the checks forbid a Python loop over all rows.",
              "",
              "Hint: `(year / 10) * 10` in SQLite integer arithmetic truncates."
            ]),
            starter: "def count_by_decade(con):\n    ",
            forbids: [{ contains: "SELECT year FROM", msg: "Aggregate in SQL, not in Python" }],
            hints: [
              "`SELECT (year / 10) * 10 AS decade, COUNT(*) FROM books GROUP BY decade`",
              "`dict(rows)` turns a list of two-element tuples straight into a dictionary."
            ],
            tests: [
              {
                name: "groups by decade",
                code: "import sqlite3\ncon = sqlite3.connect(':memory:')\ncon.execute('CREATE TABLE books (id INTEGER PRIMARY KEY, title TEXT, year INTEGER)')\ncon.executemany('INSERT INTO books (title, year) VALUES (?, ?)', [('a', 1991), ('b', 1995), ('c', 2001)])\nassert count_by_decade(con) == {1990: 2, 2000: 1}, count_by_decade(con)"
              },
              {
                name: "empty table",
                code: "import sqlite3\ncon = sqlite3.connect(':memory:')\ncon.execute('CREATE TABLE books (id INTEGER PRIMARY KEY, title TEXT, year INTEGER)')\nassert count_by_decade(con) == {}"
              },
              {
                name: "uses GROUP BY",
                code: "assert 'GROUP BY' in _SRC.upper(), 'let the database do the grouping'"
              }
            ],
            solution: L([
              "def count_by_decade(con):",
              "    rows = con.execute('''",
              "        SELECT (year / 10) * 10 AS decade, COUNT(*)",
              "        FROM books",
              "        GROUP BY decade",
              "        ORDER BY decade",
              "    ''').fetchall()",
              "    return dict(rows)"
            ]),
            takeaway: "Aggregating in SQL moves the work to code written in C and indexed for the purpose. Pulling a million rows into Python to count them is the most common cause of a slow report."
          },
          {
            kind: "quiz", title: "WHERE or HAVING", difficulty: 3,
            concepts: ["sql-aggregate"],
            prompt: "You want only the groups whose `COUNT(*)` is above 5. Which clause?",
            choices: [
              "`WHERE COUNT(*) > 5`",
              "`HAVING COUNT(*) > 5`",
              "Either works",
              "`ORDER BY COUNT(*) > 5`"
            ],
            answer: 1,
            explain: "`WHERE` filters individual rows *before* grouping, so the count does not exist yet. `HAVING` filters the groups *after* aggregation."
          }
        ]
      },

      {
        id: "m23l2", title: "Parameters, injection and transactions", minutes: 12,
        concepts: ["sql-params", "sql-injection", "transactions"],
        content: L([
          "## Never build SQL with string formatting",
          "",
          "~~~py",
          "name = input('name: ')",
          "cur.execute(f\"SELECT * FROM users WHERE name = '{name}'\")     # NEVER",
          "~~~",
          "",
          "Type this as the name:",
          "",
          "~~~text",
          "'; DROP TABLE users; --",
          "~~~",
          "",
          "and the statement becomes:",
          "",
          "~~~sql",
          "SELECT * FROM users WHERE name = ''; DROP TABLE users; --'",
          "~~~",
          "",
          "This is **SQL injection**, and it is still one of the most exploited vulnerabilities in the world.",
          "",
          "## The fix is always the same",
          "",
          "~~~py",
          "cur.execute('SELECT * FROM users WHERE name = ?', (name,))",
          "~~~",
          "",
          "The `?` is a **placeholder**. The value is sent separately and is never parsed as SQL, so it cannot",
          "change the meaning of the statement no matter what it contains. It also handles quoting and types",
          "for you.",
          "",
          "Named placeholders work too:",
          "",
          "~~~py",
          "cur.execute('SELECT * FROM users WHERE name = :name AND age > :age',",
          "            {'name': name, 'age': 18})",
          "~~~",
          "",
          ":::warn What cannot be parameterised",
          "Placeholders work for **values**, never for table or column names:",
          "",
          "~~~py",
          "cur.execute('SELECT * FROM ?', ('users',))       # does not work",
          "~~~",
          "",
          "If a column name must be dynamic, validate it against a hard-coded allowlist:",
          "",
          "~~~py",
          "if column not in {'name', 'age', 'created'}:",
          "    raise ValueError('unknown column')",
          "cur.execute(f'SELECT * FROM users ORDER BY {column}')",
          "~~~",
          ":::",
          "",
          "## Transactions",
          "",
          "A transaction is a group of changes that either **all** happen or **none** do.",
          "",
          "~~~py",
          "try:",
          "    con.execute('UPDATE accounts SET balance = balance - ? WHERE id = ?', (100, 1))",
          "    con.execute('UPDATE accounts SET balance = balance + ? WHERE id = ?', (100, 2))",
          "    con.commit()",
          "except Exception:",
          "    con.rollback()",
          "    raise",
          "~~~",
          "",
          "Without this, a crash between the two statements destroys £100. The `with sqlite3.connect(...)`",
          "block does the same thing automatically: commit on success, roll back on exception.",
          "",
          "**ACID** in one line each:",
          "",
          "- **Atomic** — all or nothing",
          "- **Consistent** — constraints always hold",
          "- **Isolated** — concurrent transactions do not see each other's half-finished work",
          "- **Durable** — once committed, it survives a crash",
          "",
          "## Constraints do the checking for you",
          "",
          "~~~sql",
          "CREATE TABLE users (",
          "    id       INTEGER PRIMARY KEY,",
          "    email    TEXT NOT NULL UNIQUE,",
          "    age      INTEGER CHECK (age >= 0),",
          "    team_id  INTEGER REFERENCES teams(id)",
          ");",
          "~~~",
          "",
          "A `UNIQUE` constraint is enforced even when two processes insert at the same instant. Checking",
          "\"does this email exist?\" in Python first is not — between your check and your insert, someone else",
          "can insert. **Let the database enforce what must always be true.**",
          "",
          "In SQLite, foreign keys are off by default:",
          "",
          "~~~py",
          "con.execute('PRAGMA foreign_keys = ON')",
          "~~~"
        ]),
        exercises: [
          {
            kind: "debug", title: "Close the injection hole", difficulty: 3,
            concepts: ["sql-injection", "sql-params"],
            prompt: L([
              "`find_user` builds SQL by string formatting. Rewrite it with a parameterised query.",
              "",
              "It must return a list of matching names, and must survive a malicious input like",
              "`\"' OR '1'='1\"` by returning **no** rows rather than every row."
            ]),
            starter: L([
              "def find_user(con, name):",
              "    rows = con.execute(f\"SELECT name FROM users WHERE name = '{name}'\").fetchall()",
              "    return [r[0] for r in rows]"
            ]),
            forbids: [{ re: "f\"SELECT|f'SELECT|%s|\\.format\\(", msg: "Use a ? placeholder, not string formatting" }],
            hints: [
              "`con.execute('SELECT name FROM users WHERE name = ?', (name,))`",
              "Mind the trailing comma in the one-element tuple."
            ],
            tests: [
              {
                name: "finds a real user",
                code: "import sqlite3\ncon = sqlite3.connect(':memory:')\ncon.execute('CREATE TABLE users (name TEXT)')\ncon.executemany('INSERT INTO users VALUES (?)', [('ada',), ('bo',)])\nassert find_user(con, 'ada') == ['ada']"
              },
              {
                name: "unknown user gives nothing",
                code: "import sqlite3\ncon = sqlite3.connect(':memory:')\ncon.execute('CREATE TABLE users (name TEXT)')\ncon.execute(\"INSERT INTO users VALUES ('ada')\")\nassert find_user(con, 'nobody') == []"
              },
              {
                name: "injection returns no rows",
                code: "import sqlite3\ncon = sqlite3.connect(':memory:')\ncon.execute('CREATE TABLE users (name TEXT)')\ncon.executemany('INSERT INTO users VALUES (?)', [('ada',), ('bo',)])\nresult = find_user(con, \"' OR '1'='1\")\nassert result == [], f'injection succeeded: {result}'"
              },
              {
                name: "quotes in a legitimate name are safe",
                code: "import sqlite3\ncon = sqlite3.connect(':memory:')\ncon.execute('CREATE TABLE users (name TEXT)')\ncon.execute(\"INSERT INTO users VALUES ('O''Brien')\")\nassert find_user(con, \"O'Brien\") == [\"O'Brien\"]"
              }
            ],
            solution: L([
              "def find_user(con, name):",
              "    rows = con.execute('SELECT name FROM users WHERE name = ?', (name,)).fetchall()",
              "    return [r[0] for r in rows]"
            ]),
            takeaway: "The parameterised version is also the one that handles apostrophes in real names correctly. Security and correctness point the same way."
          },
          {
            kind: "code", title: "All or nothing", difficulty: 4,
            concepts: ["transactions"],
            prompt: L([
              "Write `transfer(con, from_id, to_id, amount)` moving money between rows in an `accounts` table",
              "(`id`, `balance`).",
              "",
              "- raise `ValueError` if the amount is not positive",
              "- raise `ValueError` if the sender has insufficient funds",
              "- on **any** failure, the database must be completely unchanged",
              "- on success, commit both updates"
            ]),
            starter: "def transfer(con, from_id, to_id, amount):\n    ",
            hints: [
              "Read the sender's balance first with a `SELECT`.",
              "Validate before making any change.",
              "Wrap the two `UPDATE`s in `try` / `except` with `con.rollback()` and re-raise."
            ],
            tests: [
              {
                name: "a successful transfer",
                code: "import sqlite3\ncon = sqlite3.connect(':memory:')\ncon.execute('CREATE TABLE accounts (id INTEGER PRIMARY KEY, balance INTEGER)')\ncon.executemany('INSERT INTO accounts VALUES (?, ?)', [(1, 100), (2, 50)])\ncon.commit()\ntransfer(con, 1, 2, 30)\nassert con.execute('SELECT balance FROM accounts ORDER BY id').fetchall() == [(70,), (80,)]"
              },
              {
                name: "insufficient funds raises and changes nothing",
                code: "import sqlite3\ncon = sqlite3.connect(':memory:')\ncon.execute('CREATE TABLE accounts (id INTEGER PRIMARY KEY, balance INTEGER)')\ncon.executemany('INSERT INTO accounts VALUES (?, ?)', [(1, 10), (2, 50)])\ncon.commit()\ntry:\n    transfer(con, 1, 2, 100)\n    raise AssertionError('should raise')\nexcept ValueError:\n    pass\nassert con.execute('SELECT balance FROM accounts ORDER BY id').fetchall() == [(10,), (50,)], 'nothing should have changed'"
              },
              {
                name: "non-positive amount raises",
                code: "import sqlite3\ncon = sqlite3.connect(':memory:')\ncon.execute('CREATE TABLE accounts (id INTEGER PRIMARY KEY, balance INTEGER)')\ncon.executemany('INSERT INTO accounts VALUES (?, ?)', [(1, 10), (2, 50)])\ncon.commit()\ntry:\n    transfer(con, 1, 2, 0)\n    raise AssertionError('should raise')\nexcept ValueError:\n    pass"
              },
              {
                name: "the exact balance may be transferred",
                code: "import sqlite3\ncon = sqlite3.connect(':memory:')\ncon.execute('CREATE TABLE accounts (id INTEGER PRIMARY KEY, balance INTEGER)')\ncon.executemany('INSERT INTO accounts VALUES (?, ?)', [(1, 40), (2, 0)])\ncon.commit()\ntransfer(con, 1, 2, 40)\nassert con.execute('SELECT balance FROM accounts ORDER BY id').fetchall() == [(0,), (40,)]"
              }
            ],
            solution: L([
              "def transfer(con, from_id, to_id, amount):",
              "    if amount <= 0:",
              "        raise ValueError('amount must be positive')",
              "",
              "    row = con.execute('SELECT balance FROM accounts WHERE id = ?', (from_id,)).fetchone()",
              "    if row is None:",
              "        raise ValueError('unknown account')",
              "    if row[0] < amount:",
              "        raise ValueError('insufficient funds')",
              "",
              "    try:",
              "        con.execute('UPDATE accounts SET balance = balance - ? WHERE id = ?', (amount, from_id))",
              "        con.execute('UPDATE accounts SET balance = balance + ? WHERE id = ?', (amount, to_id))",
              "        con.commit()",
              "    except Exception:",
              "        con.rollback()",
              "        raise"
            ])
          },
          {
            kind: "quiz", title: "What placeholders protect", difficulty: 3,
            concepts: ["sql-params"],
            prompt: "Why does `execute('... WHERE name = ?', (name,))` make injection impossible?",
            choices: [
              "It escapes dangerous characters in the string",
              "The value is sent to the engine separately from the statement and is never parsed as SQL",
              "It converts the value to lowercase",
              "It rejects any value containing a quote"
            ],
            answer: 1,
            explain: "The SQL is parsed once, with a hole in it. The value is then bound into that hole as data. There is no point at which the value could become part of the statement, whatever it contains."
          },
          {
            kind: "quiz", title: "Uniqueness", difficulty: 3,
            concepts: ["schema-design"],
            prompt: "Why is a `UNIQUE` constraint better than checking `SELECT ... WHERE email = ?` before inserting?",
            choices: [
              "It is easier to type",
              "Between the check and the insert another process can insert the same value; the constraint has no such gap",
              "The check is slower",
              "SELECT cannot compare emails"
            ],
            answer: 1,
            explain: "The check-then-insert pattern has a race condition. A database constraint is enforced atomically, so duplicates are impossible no matter how many processes are running."
          }
        ]
      },

      {
        id: "m23l3", title: "Relationships and schema design", minutes: 12,
        concepts: ["sql-joins", "schema-design"],
        content: L([
          "## One table is rarely enough",
          "",
          "Storing everything in one table means repeating yourself:",
          "",
          "~~~text",
          "id | pet  | owner_name | owner_email",
          " 1 | Rex  | Ada        | ada@example.com",
          " 2 | Mia  | Ada        | ada@example.com      <- duplicated",
          "~~~",
          "",
          "Change Ada's email and you must find every row. Miss one and your data now disagrees with itself.",
          "",
          "**Normalise:** each fact lives in exactly one place.",
          "",
          "~~~sql",
          "CREATE TABLE owners (",
          "    id    INTEGER PRIMARY KEY,",
          "    name  TEXT NOT NULL,",
          "    email TEXT NOT NULL UNIQUE",
          ");",
          "",
          "CREATE TABLE pets (",
          "    id       INTEGER PRIMARY KEY,",
          "    name     TEXT NOT NULL,",
          "    owner_id INTEGER NOT NULL REFERENCES owners(id)",
          ");",
          "~~~",
          "",
          "`owner_id` is a **foreign key**: it points at a row in another table.",
          "",
          "## JOIN puts them back together",
          "",
          "~~~sql",
          "SELECT pets.name, owners.name, owners.email",
          "FROM pets",
          "JOIN owners ON pets.owner_id = owners.id;",
          "~~~",
          "",
          "| Join | Keeps |",
          "|---|---|",
          "| `JOIN` (inner) | only rows with a match on both sides |",
          "| `LEFT JOIN` | every left row; `NULL` where there is no match |",
          "",
          "`LEFT JOIN` is how you ask *which owners have no pets?*:",
          "",
          "~~~sql",
          "SELECT owners.name",
          "FROM owners",
          "LEFT JOIN pets ON pets.owner_id = owners.id",
          "WHERE pets.id IS NULL;",
          "~~~",
          "",
          ":::trap The N+1 query problem",
          "~~~py",
          "for owner in con.execute('SELECT id, name FROM owners'):        # 1 query",
          "    pets = con.execute('SELECT name FROM pets WHERE owner_id = ?', (owner[0],))  # N more",
          "~~~",
          "",
          "1,000 owners means 1,001 round trips. One `JOIN` returns the same data in one. This is the single",
          "most common database performance bug in application code, and ORMs make it very easy to write by accident.",
          ":::",
          "",
          "## Indexes",
          "",
          "~~~sql",
          "CREATE INDEX idx_pets_owner ON pets(owner_id);",
          "~~~",
          "",
          "Without an index, `WHERE owner_id = 5` scans every row. With one, the database jumps straight to the",
          "matching rows — the difference between `O(n)` and `O(log n)`, which is exactly the binary search",
          "idea from Module 21.",
          "",
          "Index the columns you filter and join on. Do not index everything: each index costs storage and slows",
          "down writes.",
          "",
          "## Designing a schema",
          "",
          "1. List the **things** (nouns): users, orders, products.",
          "2. One table per thing, one row per instance.",
          "3. One column per **atomic** fact — never a comma-separated list in a text column.",
          "4. Give every table a primary key.",
          "5. Model relationships with foreign keys.",
          "6. Add constraints (`NOT NULL`, `UNIQUE`, `CHECK`) for everything that must always be true.",
          "7. Index what you will filter and join on.",
          "",
          "**Many-to-many** needs a third table:",
          "",
          "~~~sql",
          "CREATE TABLE student_courses (",
          "    student_id INTEGER REFERENCES students(id),",
          "    course_id  INTEGER REFERENCES courses(id),",
          "    PRIMARY KEY (student_id, course_id)",
          ");",
          "~~~",
          "",
          ":::tip About ORMs",
          "SQLAlchemy and Django's ORM let you write Python instead of SQL. They are genuinely useful — and they",
          "generate SQL you will eventually have to read when something is slow. Learn SQL first; the ORM will",
          "then be a convenience rather than a black box.",
          ":::"
        ]),
        exercises: [
          {
            kind: "code", title: "Join two tables", difficulty: 4,
            concepts: ["sql-joins"],
            prompt: L([
              "Given `owners(id, name)` and `pets(id, name, owner_id)`, write `pets_with_owners(con)` returning",
              "a list of `(pet_name, owner_name)` tuples ordered by pet name.",
              "",
              "Use a single `JOIN` — the checks require it."
            ]),
            starter: "def pets_with_owners(con):\n    ",
            requires: [{ re: "JOIN", msg: "Use a JOIN" }],
            hints: [
              "`SELECT pets.name, owners.name FROM pets JOIN owners ON pets.owner_id = owners.id ORDER BY pets.name`",
              "`fetchall()` already gives you tuples in the right shape."
            ],
            tests: [
              {
                name: "joins correctly",
                code: "import sqlite3\ncon = sqlite3.connect(':memory:')\ncon.execute('CREATE TABLE owners (id INTEGER PRIMARY KEY, name TEXT)')\ncon.execute('CREATE TABLE pets (id INTEGER PRIMARY KEY, name TEXT, owner_id INTEGER)')\ncon.executemany('INSERT INTO owners VALUES (?, ?)', [(1, 'Ada'), (2, 'Bo')])\ncon.executemany('INSERT INTO pets (name, owner_id) VALUES (?, ?)', [('Rex', 1), ('Mia', 1), ('Sam', 2)])\nassert pets_with_owners(con) == [('Mia', 'Ada'), ('Rex', 'Ada'), ('Sam', 'Bo')], pets_with_owners(con)"
              },
              {
                name: "pets with no owner are excluded",
                code: "import sqlite3\ncon = sqlite3.connect(':memory:')\ncon.execute('CREATE TABLE owners (id INTEGER PRIMARY KEY, name TEXT)')\ncon.execute('CREATE TABLE pets (id INTEGER PRIMARY KEY, name TEXT, owner_id INTEGER)')\ncon.execute(\"INSERT INTO owners VALUES (1, 'Ada')\")\ncon.executemany('INSERT INTO pets (name, owner_id) VALUES (?, ?)', [('Rex', 1), ('Ghost', 99)])\nassert pets_with_owners(con) == [('Rex', 'Ada')]"
              },
              {
                name: "empty tables",
                code: "import sqlite3\ncon = sqlite3.connect(':memory:')\ncon.execute('CREATE TABLE owners (id INTEGER PRIMARY KEY, name TEXT)')\ncon.execute('CREATE TABLE pets (id INTEGER PRIMARY KEY, name TEXT, owner_id INTEGER)')\nassert pets_with_owners(con) == []"
              }
            ],
            solution: L([
              "def pets_with_owners(con):",
              "    return con.execute('''",
              "        SELECT pets.name, owners.name",
              "        FROM pets",
              "        JOIN owners ON pets.owner_id = owners.id",
              "        ORDER BY pets.name",
              "    ''').fetchall()"
            ])
          },
          {
            kind: "code", title: "Find the lonely owners", difficulty: 4,
            concepts: ["sql-joins"],
            prompt: L([
              "Write `owners_without_pets(con)` returning a sorted list of the names of owners who have no pets.",
              "",
              "Use a `LEFT JOIN` — the checks require it."
            ]),
            starter: "def owners_without_pets(con):\n    ",
            requires: [{ re: "LEFT JOIN", msg: "Use a LEFT JOIN" }],
            hints: [
              "Left-join pets onto owners, then keep the rows where the pet side is `NULL`.",
              "`WHERE pets.id IS NULL`"
            ],
            tests: [
              {
                name: "finds owners with no pets",
                code: "import sqlite3\ncon = sqlite3.connect(':memory:')\ncon.execute('CREATE TABLE owners (id INTEGER PRIMARY KEY, name TEXT)')\ncon.execute('CREATE TABLE pets (id INTEGER PRIMARY KEY, name TEXT, owner_id INTEGER)')\ncon.executemany('INSERT INTO owners VALUES (?, ?)', [(1, 'Ada'), (2, 'Bo'), (3, 'Cy')])\ncon.execute('INSERT INTO pets (name, owner_id) VALUES (?, ?)', ('Rex', 1))\nassert owners_without_pets(con) == ['Bo', 'Cy'], owners_without_pets(con)"
              },
              {
                name: "everyone has a pet",
                code: "import sqlite3\ncon = sqlite3.connect(':memory:')\ncon.execute('CREATE TABLE owners (id INTEGER PRIMARY KEY, name TEXT)')\ncon.execute('CREATE TABLE pets (id INTEGER PRIMARY KEY, name TEXT, owner_id INTEGER)')\ncon.execute(\"INSERT INTO owners VALUES (1, 'Ada')\")\ncon.execute('INSERT INTO pets (name, owner_id) VALUES (?, ?)', ('Rex', 1))\nassert owners_without_pets(con) == []"
              },
              {
                name: "nobody has a pet",
                code: "import sqlite3\ncon = sqlite3.connect(':memory:')\ncon.execute('CREATE TABLE owners (id INTEGER PRIMARY KEY, name TEXT)')\ncon.execute('CREATE TABLE pets (id INTEGER PRIMARY KEY, name TEXT, owner_id INTEGER)')\ncon.executemany('INSERT INTO owners VALUES (?, ?)', [(1, 'Ada'), (2, 'Bo')])\nassert owners_without_pets(con) == ['Ada', 'Bo']"
              }
            ],
            solution: L([
              "def owners_without_pets(con):",
              "    rows = con.execute('''",
              "        SELECT owners.name",
              "        FROM owners",
              "        LEFT JOIN pets ON pets.owner_id = owners.id",
              "        WHERE pets.id IS NULL",
              "        ORDER BY owners.name",
              "    ''').fetchall()",
              "    return [r[0] for r in rows]"
            ])
          },
          {
            kind: "quiz", title: "N+1 queries", difficulty: 3,
            concepts: ["sql-joins"],
            prompt: "A page shows 200 orders, each with its customer's name, and the code runs one query per order to fetch the customer. What is the problem and the fix?",
            choices: [
              "Nothing is wrong",
              "201 round trips instead of 1 — replace the loop with a single JOIN",
              "The orders should be cached in memory",
              "The database needs more memory"
            ],
            answer: 1,
            explain: "This is the N+1 problem. Each query has fixed overhead, so 201 small queries are far slower than one join returning the same data — usually by one or two orders of magnitude."
          },
          {
            kind: "quiz", title: "Atomic columns", difficulty: 3,
            concepts: ["schema-design"],
            prompt: "Why is storing tags as a comma-separated string in one column a bad idea?",
            choices: [
              "It uses more disk space",
              "You cannot index, filter or join on individual tags without string matching, and adding or removing one means rewriting the whole value",
              "SQLite does not support text columns",
              "Commas are reserved characters"
            ],
            answer: 1,
            explain: "`WHERE tags LIKE '%python%'` also matches `micropython`, cannot use an index, and gets slower as the table grows. A separate `tags` table with a foreign key makes all of those operations correct and fast."
          }
        ]
      }
    ],

    checkpoint: {
      id: "m23cp", pass: 0.8,
      title: "Checkpoint: Databases",
      items: [
        {
          kind: "code", title: "Safe search", difficulty: 3, concepts: ["sql-params"],
          prompt: "Write `search(con, term)` returning titles from `books` whose title contains `term`, using a parameterised `LIKE`. Order by title.",
          starter: "def search(con, term):\n    ",
          tests: [
            {
              name: "finds matches",
              code: "import sqlite3\ncon = sqlite3.connect(':memory:')\ncon.execute('CREATE TABLE books (title TEXT)')\ncon.executemany('INSERT INTO books VALUES (?)', [('Python Basics',), ('Advanced Python',), ('Cooking',)])\nassert search(con, 'Python') == ['Advanced Python', 'Python Basics']"
            },
            {
              name: "no matches",
              code: "import sqlite3\ncon = sqlite3.connect(':memory:')\ncon.execute('CREATE TABLE books (title TEXT)')\ncon.execute(\"INSERT INTO books VALUES ('Cooking')\")\nassert search(con, 'zzz') == []"
            },
            { name: "uses a placeholder", code: "assert '?' in _SRC, 'use a parameterised query'" }
          ]
        },
        {
          kind: "quiz", title: "Forgetting commit", difficulty: 2, concepts: ["transactions"],
          prompt: "You insert rows, the program prints them back correctly, then exits — and the file is empty next run. Why?",
          choices: [
            "The table was not created",
            "The changes were never committed, so they were rolled back when the connection closed",
            "SQLite cannot store text",
            "The file was deleted"
          ],
          answer: 1,
          explain: "Uncommitted changes are visible inside your own transaction, which is why the read-back works. They are discarded when the connection closes without a commit."
        },
        {
          kind: "code", title: "Aggregate in SQL", difficulty: 3, concepts: ["sql-aggregate"],
          prompt: "Write `average_by_kind(con)` returning a dictionary of pet kind to average age, rounded to 1 decimal place. Use GROUP BY.",
          starter: "def average_by_kind(con):\n    ",
          tests: [
            {
              name: "averages per kind",
              code: "import sqlite3\ncon = sqlite3.connect(':memory:')\ncon.execute('CREATE TABLE pets (name TEXT, kind TEXT, age INTEGER)')\ncon.executemany('INSERT INTO pets VALUES (?, ?, ?)', [('a', 'dog', 2), ('b', 'dog', 5), ('c', 'cat', 7)])\nassert average_by_kind(con) == {'dog': 3.5, 'cat': 7.0}, average_by_kind(con)"
            },
            {
              name: "empty table",
              code: "import sqlite3\ncon = sqlite3.connect(':memory:')\ncon.execute('CREATE TABLE pets (name TEXT, kind TEXT, age INTEGER)')\nassert average_by_kind(con) == {}"
            }
          ]
        },
        {
          kind: "quiz", title: "Which index", difficulty: 3, concepts: ["schema-design"],
          prompt: "Your slowest query is `SELECT * FROM orders WHERE customer_id = ?`. What helps most?",
          choices: [
            "An index on `orders(customer_id)`",
            "An index on every column",
            "Removing the WHERE clause",
            "Increasing the page size"
          ],
          answer: 0,
          explain: "Index the column you filter on. Indexing everything costs storage and slows every write, for no benefit on queries that do not use those columns."
        },
        {
          kind: "quiz", title: "Foreign keys", difficulty: 2, concepts: ["schema-design"],
          prompt: "What does `owner_id INTEGER REFERENCES owners(id)` give you?",
          choices: [
            "Faster queries automatically",
            "A guarantee that every owner_id refers to a real owner row",
            "Automatic joins",
            "Nothing — it is a comment"
          ],
          answer: 1,
          explain: "It is a referential-integrity constraint: the database refuses rows pointing at owners that do not exist. (In SQLite you must enable it with `PRAGMA foreign_keys = ON`.)"
        }
      ]
    },

    project: {
      id: "m23proj",
      title: "Project: Contacts Database",
      xp: 480,
      filename: "contacts.py",
      concepts: ["sqlite-connect", "sql-crud", "sql-params", "sql-joins", "schema-design", "class-def", "raise"],
      brief: L([
        "Build a contacts database with a proper schema, safe queries and a clean Python interface.",
        "",
        "Two tables with a relationship, parameterised queries throughout, validation that raises, and search.",
        "This is what a small application's data layer actually looks like.",
        "",
        "Everything runs against an in-memory SQLite database, so each check starts from a clean slate.",
        "",
        ":::tip Design first",
        "Stage 1 is the schema. Everything after it depends on getting the tables right, so read the spec",
        "carefully before writing any code.",
        ":::"
      ]),
      starter: L([
        "\"\"\"Contacts Database — Tier 3 project.\"\"\"",
        "import sqlite3",
        "",
        "",
        "class Contacts:",
        "    def __init__(self, path=':memory:'):",
        "        self.con = sqlite3.connect(path)",
        "        self.setup()",
        "",
        "    def setup(self):",
        "        \"\"\"Create the tables if they do not exist.\"\"\"",
        "",
        "    def close(self):",
        "        self.con.close()"
      ]),
      outro: L([
        "You have built a data layer: a normalised schema, constraints that make bad data impossible,",
        "parameterised queries that cannot be injected, a join, and an aggregate — behind a Python interface",
        "that hides all of it from callers.",
        "",
        "That is genuinely the shape of production code. One module of Tier 3 left."
      ]),
      stages: [
        {
          title: "The schema",
          xp: 90,
          spec: L([
            "Implement `setup()` creating two tables:",
            "",
            "**people**",
            "- `id` INTEGER PRIMARY KEY",
            "- `name` TEXT NOT NULL",
            "- `email` TEXT NOT NULL UNIQUE",
            "",
            "**phones**",
            "- `id` INTEGER PRIMARY KEY",
            "- `person_id` INTEGER NOT NULL, referencing `people(id)`",
            "- `label` TEXT NOT NULL",
            "- `number` TEXT NOT NULL",
            "",
            "Use `CREATE TABLE IF NOT EXISTS` so it is safe to call twice, and commit."
          ]),
          tests: [
            {
              name: "both tables exist",
              code: "c = Contacts()\nnames = {r[0] for r in c.con.execute(\"SELECT name FROM sqlite_master WHERE type='table'\")}\nassert {'people', 'phones'} <= names, names"
            },
            {
              name: "people has the right columns",
              code: "c = Contacts()\ncols = {r[1] for r in c.con.execute('PRAGMA table_info(people)')}\nassert cols == {'id', 'name', 'email'}, cols"
            },
            {
              name: "phones has the right columns",
              code: "c = Contacts()\ncols = {r[1] for r in c.con.execute('PRAGMA table_info(phones)')}\nassert cols == {'id', 'person_id', 'label', 'number'}, cols"
            },
            {
              name: "email is unique",
              code: "import sqlite3\nc = Contacts()\nc.con.execute(\"INSERT INTO people (name, email) VALUES ('a', 'x@y.com')\")\ntry:\n    c.con.execute(\"INSERT INTO people (name, email) VALUES ('b', 'x@y.com')\")\n    raise AssertionError('duplicate email should be rejected')\nexcept sqlite3.IntegrityError:\n    pass"
            },
            {
              name: "name cannot be null",
              code: "import sqlite3\nc = Contacts()\ntry:\n    c.con.execute(\"INSERT INTO people (name, email) VALUES (NULL, 'a@b.com')\")\n    raise AssertionError('null name should be rejected')\nexcept sqlite3.IntegrityError:\n    pass"
            },
            { name: "setup is repeatable", code: "c = Contacts()\nc.setup()\nc.setup()" }
          ]
        },
        {
          title: "Adding people",
          xp: 90,
          spec: L([
            "`add_person(name, email)` inserts a person and returns the new id.",
            "",
            "- raise `ValueError` if the name is empty or the email does not contain `@`",
            "- raise `ValueError` if the email is already used (catch the database error and re-raise as `ValueError`)",
            "- emails are stored lowercased and stripped",
            "",
            "`get_person(person_id)` returns a dictionary with `id`, `name` and `email`, or `None`.",
            "",
            "Use parameterised queries throughout."
          ]),
          tests: [
            { name: "adds and returns an id", code: "c = Contacts()\npid = c.add_person('Ada', 'ada@example.com')\nassert isinstance(pid, int)" },
            {
              name: "get_person returns the record",
              code: "c = Contacts()\npid = c.add_person('Ada', 'ada@example.com')\nassert c.get_person(pid) == {'id': pid, 'name': 'Ada', 'email': 'ada@example.com'}"
            },
            { name: "unknown id gives None", code: "c = Contacts()\nassert c.get_person(999) is None" },
            {
              name: "email is normalised",
              code: "c = Contacts()\npid = c.add_person('Ada', '  ADA@Example.COM ')\nassert c.get_person(pid)['email'] == 'ada@example.com'"
            },
            {
              name: "duplicate email raises ValueError",
              code: "c = Contacts()\nc.add_person('Ada', 'a@b.com')\ntry:\n    c.add_person('Other', 'A@B.com')\n    raise AssertionError('should raise ValueError')\nexcept ValueError:\n    pass"
            },
            {
              name: "empty name raises",
              code: "c = Contacts()\ntry:\n    c.add_person('', 'a@b.com')\n    raise AssertionError('should raise')\nexcept ValueError:\n    pass"
            },
            {
              name: "invalid email raises",
              code: "c = Contacts()\ntry:\n    c.add_person('Ada', 'not-an-email')\n    raise AssertionError('should raise')\nexcept ValueError:\n    pass"
            },
            { name: "uses placeholders", code: "assert '?' in _SRC, 'use parameterised queries'" }
          ]
        },
        {
          title: "Phone numbers",
          xp: 90,
          spec: L([
            "`add_phone(person_id, label, number)` inserts a phone row and returns its id.",
            "",
            "- raise `ValueError` if the person does not exist",
            "- a person may have several numbers",
            "",
            "`phones_for(person_id)` returns a list of `(label, number)` tuples in insertion order.",
            "",
            "`delete_person(person_id)` removes the person **and all their phones**, returning `True` if a person",
            "was removed and `False` otherwise."
          ]),
          tests: [
            {
              name: "adds phones",
              code: "c = Contacts()\npid = c.add_person('Ada', 'a@b.com')\nc.add_phone(pid, 'mobile', '07700 900001')\nc.add_phone(pid, 'work', '020 7946 0000')\nassert c.phones_for(pid) == [('mobile', '07700 900001'), ('work', '020 7946 0000')]"
            },
            {
              name: "unknown person raises",
              code: "c = Contacts()\ntry:\n    c.add_phone(999, 'mobile', '123')\n    raise AssertionError('should raise')\nexcept ValueError:\n    pass"
            },
            { name: "no phones gives an empty list", code: "c = Contacts()\npid = c.add_person('Ada', 'a@b.com')\nassert c.phones_for(pid) == []" },
            {
              name: "delete removes the person",
              code: "c = Contacts()\npid = c.add_person('Ada', 'a@b.com')\nassert c.delete_person(pid) is True\nassert c.get_person(pid) is None"
            },
            {
              name: "delete removes their phones",
              code: "c = Contacts()\npid = c.add_person('Ada', 'a@b.com')\nc.add_phone(pid, 'mobile', '1')\nc.delete_person(pid)\nleft = c.con.execute('SELECT COUNT(*) FROM phones WHERE person_id = ?', (pid,)).fetchone()[0]\nassert left == 0, 'phones must be deleted too'"
            },
            { name: "deleting a missing person returns False", code: "c = Contacts()\nassert c.delete_person(999) is False" }
          ]
        },
        {
          title: "Search and report",
          xp: 110,
          spec: L([
            "`search(term)` returns a list of `{'id', 'name', 'email'}` dictionaries for people whose **name or",
            "email** contains the term, case-insensitively, ordered by name. An empty term returns everyone.",
            "",
            "`directory()` returns a list of `(name, email, phone_count)` tuples for **every** person — including",
            "those with no phones — ordered by name. Use a single `LEFT JOIN` with `GROUP BY`, not a query per person.",
            "",
            "`stats()` returns a dictionary `{'people': n, 'phones': m}`."
          ]),
          tests: [
            {
              name: "search by name",
              code: "c = Contacts()\nc.add_person('Ada Lovelace', 'ada@example.com')\nc.add_person('Bo Diddley', 'bo@example.com')\nassert [p['name'] for p in c.search('ada')] == ['Ada Lovelace']"
            },
            {
              name: "search by email",
              code: "c = Contacts()\nc.add_person('Ada', 'lovelace@example.com')\nassert len(c.search('lovelace')) == 1"
            },
            {
              name: "search is case-insensitive and ordered",
              code: "c = Contacts()\nc.add_person('Zoe', 'z@e.com')\nc.add_person('Amy', 'a@e.com')\nassert [p['name'] for p in c.search('')] == ['Amy', 'Zoe']"
            },
            { name: "no matches", code: "c = Contacts()\nc.add_person('Ada', 'a@b.com')\nassert c.search('zzzz') == []" },
            {
              name: "directory counts phones",
              code: "c = Contacts()\na = c.add_person('Ada', 'a@b.com')\nb = c.add_person('Bo', 'b@b.com')\nc.add_phone(a, 'mobile', '1')\nc.add_phone(a, 'work', '2')\nassert c.directory() == [('Ada', 'a@b.com', 2), ('Bo', 'b@b.com', 0)], c.directory()"
            },
            {
              name: "directory includes people with no phones",
              code: "c = Contacts()\nc.add_person('Solo', 's@b.com')\nassert c.directory() == [('Solo', 's@b.com', 0)]"
            },
            {
              name: "stats",
              code: "c = Contacts()\na = c.add_person('Ada', 'a@b.com')\nc.add_phone(a, 'mobile', '1')\nassert c.stats() == {'people': 1, 'phones': 1}"
            },
            {
              name: "earlier stages still pass",
              code: "c = Contacts()\npid = c.add_person('Ada', 'a@b.com')\nassert c.get_person(pid)['name'] == 'Ada'\nassert c.phones_for(pid) == []"
            }
          ]
        }
      ],
      solution: L([
        "\"\"\"Contacts Database — reference solution.\"\"\"",
        "import sqlite3",
        "",
        "",
        "class Contacts:",
        "    def __init__(self, path=':memory:'):",
        "        self.con = sqlite3.connect(path)",
        "        self.setup()",
        "",
        "    def setup(self):",
        "        self.con.execute('''",
        "            CREATE TABLE IF NOT EXISTS people (",
        "                id    INTEGER PRIMARY KEY,",
        "                name  TEXT NOT NULL,",
        "                email TEXT NOT NULL UNIQUE",
        "            )",
        "        ''')",
        "        self.con.execute('''",
        "            CREATE TABLE IF NOT EXISTS phones (",
        "                id        INTEGER PRIMARY KEY,",
        "                person_id INTEGER NOT NULL REFERENCES people(id),",
        "                label     TEXT NOT NULL,",
        "                number    TEXT NOT NULL",
        "            )",
        "        ''')",
        "        self.con.commit()",
        "",
        "    def close(self):",
        "        self.con.close()",
        "",
        "    def add_person(self, name, email):",
        "        name = (name or '').strip()",
        "        email = (email or '').strip().lower()",
        "        if not name:",
        "            raise ValueError('name is required')",
        "        if '@' not in email:",
        "            raise ValueError(f'invalid email: {email!r}')",
        "        try:",
        "            cur = self.con.execute(",
        "                'INSERT INTO people (name, email) VALUES (?, ?)', (name, email))",
        "        except sqlite3.IntegrityError as error:",
        "            raise ValueError(f'email already in use: {email}') from error",
        "        self.con.commit()",
        "        return cur.lastrowid",
        "",
        "    def get_person(self, person_id):",
        "        row = self.con.execute(",
        "            'SELECT id, name, email FROM people WHERE id = ?', (person_id,)).fetchone()",
        "        if row is None:",
        "            return None",
        "        return {'id': row[0], 'name': row[1], 'email': row[2]}",
        "",
        "    def add_phone(self, person_id, label, number):",
        "        if self.get_person(person_id) is None:",
        "            raise ValueError(f'no person with id {person_id}')",
        "        cur = self.con.execute(",
        "            'INSERT INTO phones (person_id, label, number) VALUES (?, ?, ?)',",
        "            (person_id, label, number))",
        "        self.con.commit()",
        "        return cur.lastrowid",
        "",
        "    def phones_for(self, person_id):",
        "        return self.con.execute(",
        "            'SELECT label, number FROM phones WHERE person_id = ? ORDER BY id',",
        "            (person_id,)).fetchall()",
        "",
        "    def delete_person(self, person_id):",
        "        if self.get_person(person_id) is None:",
        "            return False",
        "        self.con.execute('DELETE FROM phones WHERE person_id = ?', (person_id,))",
        "        self.con.execute('DELETE FROM people WHERE id = ?', (person_id,))",
        "        self.con.commit()",
        "        return True",
        "",
        "    def search(self, term):",
        "        pattern = f'%{term.lower()}%'",
        "        rows = self.con.execute('''",
        "            SELECT id, name, email",
        "            FROM people",
        "            WHERE LOWER(name) LIKE ? OR LOWER(email) LIKE ?",
        "            ORDER BY name",
        "        ''', (pattern, pattern)).fetchall()",
        "        return [{'id': r[0], 'name': r[1], 'email': r[2]} for r in rows]",
        "",
        "    def directory(self):",
        "        return self.con.execute('''",
        "            SELECT people.name, people.email, COUNT(phones.id)",
        "            FROM people",
        "            LEFT JOIN phones ON phones.person_id = people.id",
        "            GROUP BY people.id",
        "            ORDER BY people.name",
        "        ''').fetchall()",
        "",
        "    def stats(self):",
        "        people = self.con.execute('SELECT COUNT(*) FROM people').fetchone()[0]",
        "        phones = self.con.execute('SELECT COUNT(*) FROM phones').fetchone()[0]",
        "        return {'people': people, 'phones': phones}"
      ])
    }
  });
})();
