/* Tier 2 · Module 14 — Files & Data Formats */
(function () {
  const L = a => a.join("\n");

  const SALES_CSV = "date,product,units,price\n2024-01-03,widget,4,9.99\n2024-01-05,gizmo,2,24.50\n2024-01-05,widget,10,9.99\n2024-02-01,doohickey,1,99.00\n";
  const NOTES_TXT = "first line\nsecond line\n\nfourth line\n";
  const CONFIG_JSON = "{\n  \"name\": \"pyquest\",\n  \"version\": 2,\n  \"features\": [\"offline\", \"sync\"],\n  \"limits\": {\"daily\": 50}\n}\n";

  PQ.defineModule({
    id: "m14", tier: 2, order: 14, icon: "💾",
    title: "Files & Data Formats",
    blurb: "Read from disk, write back safely, and handle the two formats you will actually meet: CSV and JSON.",
    intro: L([
      "Programs that cannot persist anything are toys. This module covers reading and writing files properly,",
      "and the two data formats that carry most of the world's data between systems.",
      "",
      "PyQuest gives your program a real, private filesystem, so everything here behaves exactly as it would",
      "on your own machine."
    ]),
    concepts: [
      { id: "file-open", name: "opening files", importance: 1.5 },
      { id: "with-statement", name: "the with statement", importance: 1.5 },
      { id: "file-read", name: "reading text", importance: 1.4 },
      { id: "file-write", name: "writing text", importance: 1.4 },
      { id: "csv-module", name: "CSV", importance: 1.4 },
      { id: "json-module", name: "JSON", importance: 1.5 },
      { id: "pathlib", name: "pathlib", importance: 1.2 },
      { id: "file-errors", name: "handling missing files", importance: 1.3 }
    ],

    lessons: [
      {
        id: "m14l1", title: "Reading and writing text", minutes: 12,
        concepts: ["file-open", "with-statement", "file-read", "file-write"],
        content: L([
          "## Always use with",
          "",
          "~~~py",
          "with open('notes.txt') as f:",
          "    content = f.read()",
          "",
          "print(content)",
          "~~~",
          "",
          "`with` guarantees the file is closed — even if an exception fires inside the block. The alternative",
          "is `f = open(...)` followed by a `try/finally` you will eventually forget. There is no good reason to",
          "open a file any other way.",
          "",
          "Once the block ends, the file is closed. Anything you want to keep must be read *inside* the block.",
          "",
          "## The three ways to read",
          "",
          "~~~py",
          "with open('notes.txt') as f:",
          "    whole = f.read()             # one big string",
          "",
          "with open('notes.txt') as f:",
          "    lines = f.readlines()        # list of lines, newlines included",
          "",
          "with open('notes.txt') as f:",
          "    for line in f:               # one line at a time -- best for big files",
          "        print(line.rstrip())",
          "~~~",
          "",
          "The third form never loads the whole file into memory. For a 2 GB log file that is the difference",
          "between working and crashing.",
          "",
          ":::warn Lines keep their newline",
          "Reading gives you `'first line\\n'`, not `'first line'`. Use `.rstrip()` — or `.rstrip('\\n')` if",
          "trailing spaces matter — before comparing or storing.",
          ":::",
          "",
          "## Writing",
          "",
          "~~~py",
          "with open('output.txt', 'w') as f:      # 'w' TRUNCATES the file",
          "    f.write('first line\\n')",
          "    f.write('second line\\n')",
          "",
          "with open('output.txt', 'a') as f:      # 'a' appends",
          "    f.write('third line\\n')",
          "~~~",
          "",
          "| Mode | Means |",
          "|---|---|",
          "| `'r'` | read (the default) |",
          "| `'w'` | write — **empties the file immediately** |",
          "| `'a'` | append to the end |",
          "| `'x'` | create, fail if it already exists |",
          "",
          ":::trap 'w' destroys before it writes",
          "Opening for writing empties the file the moment it opens, before you write a single byte. If your",
          "program then crashes, the old contents are gone. When it matters, write to a temporary file and rename.",
          ":::",
          "",
          "`f.write()` does **not** add a newline — unlike `print`. You add `\\n` yourself, or use",
          "`f.writelines()` with lines that already have them.",
          "",
          "## Encoding",
          "",
          "~~~py",
          "with open('notes.txt', encoding='utf-8') as f:",
          "    ...",
          "~~~",
          "",
          "Without `encoding=`, Python uses whatever the operating system prefers — which differs between",
          "Windows and Linux and will eventually give someone a `UnicodeDecodeError` on a name with an accent.",
          "**Always pass `encoding='utf-8'`** unless you have a specific reason not to."
        ]),
        exercises: [
          {
            kind: "code", title: "Count the lines", difficulty: 2,
            concepts: ["file-read", "with-statement"],
            prompt: L([
              "`notes.txt` exists and contains four lines, one of which is blank.",
              "",
              "Write `count_lines(path)` returning the number of **non-blank** lines."
            ]),
            files: { "notes.txt": NOTES_TXT },
            starter: "def count_lines(path):\n    ",
            hints: [
              "Open with `with open(path, encoding='utf-8') as f:`",
              "Loop over `f` and skip lines whose `.strip()` is empty."
            ],
            tests: [
              { name: "counts three non-blank lines", call: "count_lines('notes.txt')", expect: 3 },
              { name: "uses a with block", code: "assert 'with open' in _SRC, 'open the file with a with statement'" }
            ],
            solution: L([
              "def count_lines(path):",
              "    count = 0",
              "    with open(path, encoding='utf-8') as f:",
              "        for line in f:",
              "            if line.strip():",
              "                count += 1",
              "    return count"
            ])
          },
          {
            kind: "code", title: "Write then read back", difficulty: 2,
            concepts: ["file-write", "file-read"],
            prompt: L([
              "Write `save_lines(path, lines)` writing each item on its own line, then",
              "`load_lines(path)` reading them back as a list with no trailing newlines.",
              "",
              "`load_lines` after `save_lines(p, ['a', 'b'])` must give `['a', 'b']`."
            ]),
            starter: "def save_lines(path, lines):\n    \n\ndef load_lines(path):\n    ",
            hints: [
              "In `save_lines`, write `line + '\\n'` for each item.",
              "In `load_lines`, use `.read().splitlines()` — it strips the newlines for you."
            ],
            tests: [
              { name: "round trip", code: "save_lines('out.txt', ['a', 'b'])\nassert load_lines('out.txt') == ['a', 'b']" },
              { name: "empty list", code: "save_lines('empty.txt', [])\nassert load_lines('empty.txt') == []" },
              { name: "overwrites rather than appends", code: "save_lines('o2.txt', ['x'])\nsave_lines('o2.txt', ['y'])\nassert load_lines('o2.txt') == ['y'], 'writing again should replace the contents'" },
              { name: "lines with spaces survive", code: "save_lines('o3.txt', ['hello world'])\nassert load_lines('o3.txt') == ['hello world']" }
            ],
            solution: L([
              "def save_lines(path, lines):",
              "    with open(path, 'w', encoding='utf-8') as f:",
              "        for line in lines:",
              "            f.write(line + '\\n')",
              "",
              "",
              "def load_lines(path):",
              "    with open(path, encoding='utf-8') as f:",
              "        return f.read().splitlines()"
            ])
          },
          {
            kind: "debug", title: "Read after close", difficulty: 2,
            concepts: ["with-statement"],
            prompt: L([
              "This raises `ValueError: I/O operation on closed file`. Fix it so it returns the file's contents."
            ]),
            files: { "notes.txt": NOTES_TXT },
            starter: L([
              "def load(path):",
              "    with open(path, encoding='utf-8') as f:",
              "        pass",
              "    return f.read()"
            ]),
            hints: ["The file is closed as soon as the `with` block ends.", "Do the reading inside the block."],
            tests: [
              { name: "returns the contents", code: "assert load('notes.txt').startswith('first line')" },
              { name: "reads the whole file", code: "assert 'fourth line' in load('notes.txt')" }
            ],
            solution: L([
              "def load(path):",
              "    with open(path, encoding='utf-8') as f:",
              "        return f.read()"
            ]),
            takeaway: "Returning from inside a `with` block still closes the file — `with` cleans up on the way out, including on a return or an exception."
          },
          {
            kind: "code", title: "Append a log entry", difficulty: 3,
            concepts: ["file-write", "file-errors"],
            prompt: L([
              "Write `log(path, message)` that appends `message` on its own line, creating the file if it does",
              "not exist. Existing content must be preserved.",
              "",
              "Also write `read_log(path)` returning the list of messages, or `[]` if the file has never been written."
            ]),
            starter: "def log(path, message):\n    \n\ndef read_log(path):\n    ",
            hints: [
              "Mode `'a'` appends and creates the file if needed.",
              "In `read_log`, catch `FileNotFoundError` and return `[]`."
            ],
            tests: [
              { name: "appends in order", code: "log('app.log', 'one')\nlog('app.log', 'two')\nassert read_log('app.log') == ['one', 'two']" },
              { name: "missing file reads as empty", code: "assert read_log('never-written.log') == []" },
              { name: "does not truncate", code: "log('b.log', 'a')\nlog('b.log', 'b')\nlog('b.log', 'c')\nassert len(read_log('b.log')) == 3" }
            ],
            solution: L([
              "def log(path, message):",
              "    with open(path, 'a', encoding='utf-8') as f:",
              "        f.write(message + '\\n')",
              "",
              "",
              "def read_log(path):",
              "    try:",
              "        with open(path, encoding='utf-8') as f:",
              "            return f.read().splitlines()",
              "    except FileNotFoundError:",
              "        return []"
            ])
          }
        ]
      },

      {
        id: "m14l2", title: "CSV and JSON", minutes: 13,
        concepts: ["csv-module", "json-module"],
        content: L([
          "## CSV: rows and columns",
          "",
          "You could split on commas yourself. Do not — real CSV has quoted fields containing commas,",
          "embedded newlines and escaped quotes. The `csv` module handles all of it.",
          "",
          "~~~py",
          "import csv",
          "",
          "with open('sales.csv', newline='', encoding='utf-8') as f:",
          "    reader = csv.DictReader(f)",
          "    for row in reader:",
          "        print(row['product'], row['units'])",
          "~~~",
          "",
          "`DictReader` uses the first line as headers and gives you a dictionary per row — far more readable",
          "than `row[2]`.",
          "",
          ":::warn Everything comes back as text",
          "`row['units']` is `'4'`, not `4`. CSV has no types. Convert explicitly:",
          "`units = int(row['units'])`.",
          ":::",
          "",
          "The `newline=''` argument is not optional decoration — without it, files with embedded newlines in",
          "quoted fields are parsed wrongly on some platforms.",
          "",
          "### Writing CSV",
          "",
          "~~~py",
          "import csv",
          "",
          "rows = [{'name': 'ada', 'score': 90}, {'name': 'bo', 'score': 75}]",
          "",
          "with open('out.csv', 'w', newline='', encoding='utf-8') as f:",
          "    writer = csv.DictWriter(f, fieldnames=['name', 'score'])",
          "    writer.writeheader()",
          "    writer.writerows(rows)",
          "~~~",
          "",
          "## JSON: structured data",
          "",
          "JSON maps almost exactly onto Python's own types:",
          "",
          "| JSON | Python |",
          "|---|---|",
          "| object | `dict` |",
          "| array | `list` |",
          "| string | `str` |",
          "| number | `int` / `float` |",
          "| `true` / `false` | `True` / `False` |",
          "| `null` | `None` |",
          "",
          "~~~py",
          "import json",
          "",
          "with open('config.json', encoding='utf-8') as f:",
          "    config = json.load(f)",
          "",
          "print(config['name'], config['limits']['daily'])",
          "~~~",
          "",
          "### Four functions, easy to confuse",
          "",
          "| Function | Direction | Works with |",
          "|---|---|---|",
          "| `json.load(f)` | JSON → Python | an open file |",
          "| `json.loads(s)` | JSON → Python | a string |",
          "| `json.dump(obj, f)` | Python → JSON | an open file |",
          "| `json.dumps(obj)` | Python → JSON | returns a string |",
          "",
          "The `s` stands for *string*. That is the whole difference.",
          "",
          "~~~py",
          "with open('out.json', 'w', encoding='utf-8') as f:",
          "    json.dump(data, f, indent=2)",
          "~~~",
          "",
          "`indent=2` makes the output readable and diff-friendly. Use it for anything a human might open.",
          "",
          ":::trap What JSON cannot hold",
          "Tuples become arrays and come back as lists. Sets and dates are not JSON at all and raise",
          "`TypeError: Object of type set is not JSON serializable`. Convert before dumping:",
          "`list(my_set)`, `date.isoformat()`.",
          ":::",
          "",
          "## Which to use",
          "",
          "**CSV** for flat, tabular, spreadsheet-shaped data — one row per record, same columns throughout.",
          "**JSON** for nested or optional structure — configuration, API payloads, anything with lists inside records."
        ]),
        exercises: [
          {
            kind: "code", title: "Total the sales", difficulty: 3,
            concepts: ["csv-module"],
            prompt: L([
              "`sales.csv` has the columns `date,product,units,price`.",
              "",
              "Write `total_revenue(path)` returning the sum of `units * price` across every row, rounded to 2",
              "decimal places.",
              "",
              "The answer for this file is `287.86`."
            ]),
            files: { "sales.csv": SALES_CSV },
            starter: "import csv\n\n\ndef total_revenue(path):\n    ",
            hints: [
              "`csv.DictReader` gives one dictionary per row.",
              "Convert: `int(row['units'])` and `float(row['price'])`.",
              "Accumulate, then `round(total, 2)`."
            ],
            tests: [
              { name: "computes the total", call: "total_revenue('sales.csv')", expect: 287.86 },
              { name: "uses the csv module", code: "assert 'csv' in _SRC, 'use the csv module rather than splitting by hand'" }
            ],
            solution: L([
              "import csv",
              "",
              "",
              "def total_revenue(path):",
              "    total = 0.0",
              "    with open(path, newline='', encoding='utf-8') as f:",
              "        for row in csv.DictReader(f):",
              "            total += int(row['units']) * float(row['price'])",
              "    return round(total, 2)"
            ])
          },
          {
            kind: "code", title: "Units per product", difficulty: 3,
            concepts: ["csv-module", "dict-count"],
            prompt: L([
              "Write `units_by_product(path)` returning a dictionary mapping each product to the total units sold.",
              "",
              "For `sales.csv` that is `{'widget': 14, 'gizmo': 2, 'doohickey': 1}`."
            ]),
            files: { "sales.csv": SALES_CSV },
            starter: "import csv\n\n\ndef units_by_product(path):\n    ",
            hints: ["Read with `DictReader`.", "`totals[product] = totals.get(product, 0) + int(row['units'])`"],
            tests: [
              { name: "aggregates correctly", call: "units_by_product('sales.csv')", expect: { widget: 14, gizmo: 2, doohickey: 1 } },
              { name: "values are integers", code: "assert all(isinstance(v, int) for v in units_by_product('sales.csv').values())" }
            ],
            solution: L([
              "import csv",
              "",
              "",
              "def units_by_product(path):",
              "    totals = {}",
              "    with open(path, newline='', encoding='utf-8') as f:",
              "        for row in csv.DictReader(f):",
              "            product = row['product']",
              "            totals[product] = totals.get(product, 0) + int(row['units'])",
              "    return totals"
            ])
          },
          {
            kind: "code", title: "Read and update config", difficulty: 3,
            concepts: ["json-module"],
            prompt: L([
              "`config.json` holds a JSON object.",
              "",
              "Write `bump_version(path)` that reads it, increases the `version` number by 1, writes it back with",
              "`indent=2`, and returns the new version.",
              "",
              "Reading the file again afterwards must show the new value."
            ]),
            files: { "config.json": CONFIG_JSON },
            starter: "import json\n\n\ndef bump_version(path):\n    ",
            hints: [
              "`json.load(f)` to read, `json.dump(data, f, indent=2)` to write.",
              "Open twice — once to read, once with `'w'` to write.",
              "Do not write while the read handle is still open."
            ],
            tests: [
              { name: "returns the new version", call: "bump_version('config.json')", expect: 3 },
              { name: "the change is persisted", code: "import json\nv = bump_version('config.json')\nwith open('config.json', encoding='utf-8') as f:\n    assert json.load(f)['version'] == v" },
              { name: "other keys survive", code: "import json\nbump_version('config.json')\nwith open('config.json', encoding='utf-8') as f:\n    data = json.load(f)\nassert data['name'] == 'pyquest' and data['features'] == ['offline', 'sync']" }
            ],
            solution: L([
              "import json",
              "",
              "",
              "def bump_version(path):",
              "    with open(path, encoding='utf-8') as f:",
              "        data = json.load(f)",
              "",
              "    data['version'] = data['version'] + 1",
              "",
              "    with open(path, 'w', encoding='utf-8') as f:",
              "        json.dump(data, f, indent=2)",
              "",
              "    return data['version']"
            ])
          },
          {
            kind: "code", title: "CSV to JSON", difficulty: 4,
            concepts: ["csv-module", "json-module"],
            prompt: L([
              "Write `convert(csv_path, json_path)` that reads the sales CSV and writes a JSON **array** of",
              "objects, where `units` is an `int` and `price` is a `float` (not strings).",
              "",
              "Return how many records were written."
            ]),
            files: { "sales.csv": SALES_CSV },
            starter: "import csv\nimport json\n\n\ndef convert(csv_path, json_path):\n    ",
            hints: [
              "Build a list of dictionaries first, converting the numeric fields as you go.",
              "Then `json.dump(records, f, indent=2)`.",
              "Return `len(records)`."
            ],
            tests: [
              { name: "returns the record count", call: "convert('sales.csv', 'sales.json')", expect: 4 },
              { name: "produces a JSON array", code: "import json\nconvert('sales.csv', 's2.json')\nwith open('s2.json', encoding='utf-8') as f:\n    data = json.load(f)\nassert isinstance(data, list) and len(data) == 4" },
              { name: "numeric fields have real types", code: "import json\nconvert('sales.csv', 's3.json')\nwith open('s3.json', encoding='utf-8') as f:\n    data = json.load(f)\nassert isinstance(data[0]['units'], int), 'units must be an int'\nassert isinstance(data[0]['price'], float), 'price must be a float'" },
              { name: "text fields are preserved", code: "import json\nconvert('sales.csv', 's4.json')\nwith open('s4.json', encoding='utf-8') as f:\n    data = json.load(f)\nassert data[0]['product'] == 'widget' and data[0]['date'] == '2024-01-03'" }
            ],
            solution: L([
              "import csv",
              "import json",
              "",
              "",
              "def convert(csv_path, json_path):",
              "    records = []",
              "    with open(csv_path, newline='', encoding='utf-8') as f:",
              "        for row in csv.DictReader(f):",
              "            row['units'] = int(row['units'])",
              "            row['price'] = float(row['price'])",
              "            records.append(row)",
              "",
              "    with open(json_path, 'w', encoding='utf-8') as f:",
              "        json.dump(records, f, indent=2)",
              "",
              "    return len(records)"
            ]),
            takeaway: "Read → convert types → write is the shape of nearly every data pipeline you will ever build."
          }
        ]
      },

      {
        id: "m14l3", title: "Paths and robustness", minutes: 10,
        concepts: ["pathlib", "file-errors"],
        content: L([
          "## pathlib: paths as objects",
          "",
          "~~~py",
          "from pathlib import Path",
          "",
          "p = Path('data') / 'reports' / 'march.csv'",
          "print(p)                  # data/reports/march.csv",
          "print(p.name)             # march.csv",
          "print(p.stem)             # march",
          "print(p.suffix)           # .csv",
          "print(p.parent)           # data/reports",
          "print(p.exists())",
          "~~~",
          "",
          "The `/` operator joins path segments with the right separator for the platform. String concatenation",
          "with `'/'` breaks on Windows; `Path` never does.",
          "",
          "### Shortcuts worth knowing",
          "",
          "~~~py",
          "Path('notes.txt').read_text(encoding='utf-8')",
          "Path('out.txt').write_text('hello', encoding='utf-8')",
          "",
          "Path('logs').mkdir(parents=True, exist_ok=True)   # make it, do not complain if it is there",
          "",
          "for csv_file in Path('data').glob('*.csv'):        # find files by pattern",
          "    print(csv_file.name)",
          "~~~",
          "",
          "`read_text` and `write_text` open, do the work and close in one call — perfect for small files.",
          "For anything large, go back to `with open(...)` and stream it.",
          "",
          "## Handling what goes wrong",
          "",
          "~~~py",
          "from pathlib import Path",
          "import json",
          "",
          "def load_config(path):",
          "    try:",
          "        return json.loads(Path(path).read_text(encoding='utf-8'))",
          "    except FileNotFoundError:",
          "        return {}                       # first run: no config yet",
          "    except json.JSONDecodeError as error:",
          "        raise ValueError(f'{path} is not valid JSON: {error}') from error",
          "~~~",
          "",
          "Two failures, two different responses:",
          "",
          "- **missing file** — normal on first run, so return sensible defaults",
          "- **corrupt file** — not normal, so fail loudly with a message naming the file",
          "",
          "That distinction is the whole skill. A missing file and a corrupt file are not the same problem",
          "and should not be handled the same way.",
          "",
          ":::warn Do not check-then-open",
          "~~~py",
          "if path.exists():          # the file can disappear",
          "    data = path.read_text()   # ...right here",
          "~~~",
          "Just open it and catch `FileNotFoundError`. This is EAFP from Module 13, and here it is not",
          "stylistic — it removes a real race condition.",
          ":::",
          "",
          "## Writing safely",
          "",
          "When a file must never be left half-written:",
          "",
          "~~~py",
          "temp = path.with_suffix('.tmp')",
          "temp.write_text(new_content, encoding='utf-8')",
          "temp.replace(path)          # atomic on the same filesystem",
          "~~~",
          "",
          "If the program dies mid-write, the original is untouched. This is how real applications avoid",
          "corrupting your saved data when the power goes out."
        ]),
        exercises: [
          {
            kind: "code", title: "Path parts", difficulty: 2,
            concepts: ["pathlib"],
            prompt: L([
              "Write `describe_path(path_string)` returning a dictionary with keys `name`, `stem`, `suffix` and",
              "`parent` (each as a **string**).",
              "",
              "`describe_path('data/reports/march.csv')` →",
              "`{'name': 'march.csv', 'stem': 'march', 'suffix': '.csv', 'parent': 'data/reports'}`"
            ]),
            starter: "from pathlib import Path\n\n\ndef describe_path(path_string):\n    ",
            hints: ["`p = Path(path_string)` then read `.name`, `.stem`, `.suffix`.", "`str(p.parent)` converts the parent back to a string."],
            tests: [
              {
                name: "splits a nested path",
                call: "describe_path('data/reports/march.csv')",
                expect: { name: "march.csv", stem: "march", suffix: ".csv", parent: "data/reports" }
              },
              {
                name: "a bare filename",
                call: "describe_path('notes.txt')",
                expect: { name: "notes.txt", stem: "notes", suffix: ".txt", parent: "." }
              },
              { name: "values are strings", code: "d = describe_path('a/b.txt')\nassert all(isinstance(v, str) for v in d.values())" }
            ],
            solution: L([
              "from pathlib import Path",
              "",
              "",
              "def describe_path(path_string):",
              "    p = Path(path_string)",
              "    return {",
              "        'name': p.name,",
              "        'stem': p.stem,",
              "        'suffix': p.suffix,",
              "        'parent': str(p.parent),",
              "    }"
            ])
          },
          {
            kind: "code", title: "Load with defaults", difficulty: 3,
            concepts: ["file-errors", "json-module"],
            prompt: L([
              "Write `load_settings(path)` that returns the parsed JSON object from the file.",
              "",
              "- if the file does not exist, return `{'theme': 'dark'}`",
              "- if the file exists but is not valid JSON, raise `ValueError` with a message containing the path",
              "",
              "The two failures must be handled differently."
            ]),
            files: { "good.json": "{\"theme\": \"light\", \"size\": 14}", "broken.json": "{not json at all" },
            starter: "import json\n\n\ndef load_settings(path):\n    ",
            hints: [
              "Catch `FileNotFoundError` for the missing case.",
              "Catch `json.JSONDecodeError` for the corrupt case and `raise ValueError(...)`.",
              "`JSONDecodeError` is a subclass of `ValueError`, so catch it **before** any broad `ValueError` handler."
            ],
            tests: [
              { name: "reads a valid file", call: "load_settings('good.json')", expect: { theme: "light", size: 14 } },
              { name: "missing file gives defaults", call: "load_settings('nope.json')", expect: { theme: "dark" } },
              { name: "corrupt file raises", call: "load_settings('broken.json')", raises: "ValueError" },
              { name: "the message names the file", call: "load_settings('broken.json')", raises: "ValueError", message: "broken.json" }
            ],
            solution: L([
              "import json",
              "",
              "",
              "def load_settings(path):",
              "    try:",
              "        with open(path, encoding='utf-8') as f:",
              "            return json.load(f)",
              "    except FileNotFoundError:",
              "        return {'theme': 'dark'}",
              "    except json.JSONDecodeError as error:",
              "        raise ValueError(f'{path} is not valid JSON: {error}') from error"
            ]),
            takeaway: "Missing and corrupt are different problems. Treating them the same is how a typo in a config file silently resets everyone's settings."
          },
          {
            kind: "code", title: "Atomic save", difficulty: 4,
            concepts: ["pathlib", "file-write"],
            prompt: L([
              "Write `safe_write(path, text)` that writes via a temporary file and then replaces the target,",
              "so the original is never left half-written.",
              "",
              "Use `Path`. The temporary file must not still exist afterwards."
            ]),
            files: { "important.txt": "original contents\n" },
            starter: "from pathlib import Path\n\n\ndef safe_write(path, text):\n    ",
            hints: [
              "`temp = Path(str(path) + '.tmp')`",
              "`temp.write_text(text, encoding='utf-8')` then `temp.replace(path)`.",
              "`replace` moves the file, so the temporary is gone afterwards."
            ],
            tests: [
              { name: "writes the new content", code: "from pathlib import Path\nsafe_write('important.txt', 'new stuff')\nassert Path('important.txt').read_text(encoding='utf-8') == 'new stuff'" },
              { name: "no temporary file is left behind", code: "from pathlib import Path\nsafe_write('important.txt', 'x')\nleftovers = list(Path('.').glob('*.tmp'))\nassert leftovers == [], f'left behind: {leftovers}'" },
              { name: "works when the target does not exist", code: "from pathlib import Path\nsafe_write('brand-new.txt', 'hello')\nassert Path('brand-new.txt').read_text(encoding='utf-8') == 'hello'" }
            ],
            solution: L([
              "from pathlib import Path",
              "",
              "",
              "def safe_write(path, text):",
              "    target = Path(path)",
              "    temp = Path(str(target) + '.tmp')",
              "    temp.write_text(text, encoding='utf-8')",
              "    temp.replace(target)"
            ]),
            takeaway: "Write-then-rename is how databases, editors and package managers avoid losing your data when something goes wrong mid-save."
          },
          {
            kind: "quiz", title: "Which mode", difficulty: 2,
            concepts: ["file-write"],
            prompt: "You open an existing 5 MB file with `open(path, 'w')` and your program crashes before writing anything. What is in the file?",
            choices: [
              "The original 5 MB, untouched",
              "Nothing — it was emptied when opened",
              "Half the original",
              "The file is deleted"
            ],
            answer: 1,
            explain: "`'w'` truncates the moment the file is opened, before any write happens. That is why irreplaceable data is written to a temporary file and renamed into place."
          }
        ]
      }
    ],

    checkpoint: {
      id: "m14cp", pass: 0.8,
      title: "Checkpoint: Files & Formats",
      items: [
        {
          kind: "code", title: "Longest line", difficulty: 3, concepts: ["file-read"],
          prompt: "Write `longest_line(path)` returning the longest line in the file, without its trailing newline. An empty file returns `''`.",
          files: { "notes.txt": NOTES_TXT },
          starter: "def longest_line(path):\n    ",
          tests: [
            { name: "finds the longest", call: "longest_line('notes.txt')", expect: "second line" },
            { name: "handles an empty file", code: "open('e.txt', 'w').close()\nassert longest_line('e.txt') == ''" }
          ]
        },
        {
          kind: "quiz", title: "load vs loads", difficulty: 2, concepts: ["json-module"],
          prompt: "You have a JSON string in a variable. Which function turns it into a Python dictionary?",
          choices: ["`json.load(text)`", "`json.loads(text)`", "`json.dump(text)`", "`json.dumps(text)`"],
          answer: 1,
          explain: "The `s` means *string*. `load` reads from an open file object; `loads` parses a string. `dump`/`dumps` go the other way."
        },
        {
          kind: "code", title: "Count CSV rows by column", difficulty: 3, concepts: ["csv-module"],
          prompt: "Write `count_by(path, column)` returning a dictionary of how many rows have each distinct value in that column.",
          files: { "sales.csv": SALES_CSV },
          starter: "import csv\n\n\ndef count_by(path, column):\n    ",
          tests: [
            { name: "counts products", call: "count_by('sales.csv', 'product')", expect: { widget: 2, gizmo: 1, doohickey: 1 } },
            { name: "counts dates", call: "count_by('sales.csv', 'date')['2024-01-05']", expect: 2 }
          ]
        },
        {
          kind: "code", title: "Save a dictionary", difficulty: 2, concepts: ["json-module"],
          prompt: "Write `save_json(path, data)` and `load_json(path)` that round-trip a dictionary through a file.",
          starter: "import json\n\n\ndef save_json(path, data):\n    \n\ndef load_json(path):\n    ",
          tests: [
            { name: "round trip", code: "d = {'a': 1, 'b': [1, 2]}\nsave_json('t.json', d)\nassert load_json('t.json') == d" },
            { name: "nested structures survive", code: "d = {'x': {'y': [1, {'z': True}]}}\nsave_json('n.json', d)\nassert load_json('n.json') == d" }
          ]
        },
        {
          kind: "debug", title: "Missing file crash", difficulty: 3, concepts: ["file-errors"],
          prompt: "`read_or_empty` should return `''` when the file is absent instead of crashing. Fix it, catching only the right exception.",
          starter: "def read_or_empty(path):\n    with open(path, encoding='utf-8') as f:\n        return f.read()",
          files: { "here.txt": "content" },
          tests: [
            { name: "reads an existing file", call: "read_or_empty('here.txt')", expect: "content" },
            { name: "missing gives empty string", call: "read_or_empty('gone.txt')", expect: "" }
          ]
        }
      ]
    }
  });
})();
