/* Tier 3 · Module 22 — Regular Expressions & Text Processing + Log Analyser project */
(function () {
  const L = a => a.join("\n");

  const LOG = [
    "2024-03-11 09:14:02 INFO  user=ada action=login ip=10.0.0.5 ms=42",
    "2024-03-11 09:14:19 INFO  user=bo action=view ip=10.0.0.9 ms=17",
    "2024-03-11 09:15:41 WARN  user=ada action=upload ip=10.0.0.5 ms=1902",
    "2024-03-11 09:16:03 ERROR user=cy action=login ip=10.0.1.7 ms=88 error=bad_password",
    "2024-03-11 09:16:08 ERROR user=cy action=login ip=10.0.1.7 ms=91 error=bad_password",
    "2024-03-11 09:17:55 INFO  user=bo action=logout ip=10.0.0.9 ms=12",
    "not a valid line at all",
    "2024-03-11 09:20:00 ERROR user=ada action=upload ip=10.0.0.5 ms=5310 error=timeout",
    "2024-03-12 08:02:11 INFO  user=ada action=login ip=10.0.0.5 ms=39",
    "2024-03-12 08:31:47 WARN  user=dee action=view ip=10.0.2.2 ms=805",
    ""
  ].join("\n");

  PQ.defineModule({
    id: "m22", tier: 3, order: 22, icon: "🔍",
    title: "Regex & Text Processing",
    blurb: "Describe the shape of text, extract what you need, and know when a regex is the wrong tool.",
    intro: L([
      "Regular expressions are a tiny language for describing patterns in text. They are dense, easy to write",
      "badly, and occasionally exactly right.",
      "",
      "This module teaches enough to read and write the 90% you will actually meet — and, just as importantly,",
      "when to reach for something else."
    ]),
    concepts: [
      { id: "regex-basics", name: "regex syntax", importance: 1.4 },
      { id: "regex-classes", name: "character classes", importance: 1.4 },
      { id: "regex-quantifiers", name: "quantifiers", importance: 1.4 },
      { id: "regex-anchors", name: "anchors" },
      { id: "regex-groups", name: "capture groups", importance: 1.5 },
      { id: "regex-api", name: "the re module", importance: 1.4 },
      { id: "regex-sub", name: "search and replace", importance: 1.2 },
      { id: "regex-limits", name: "when not to use regex", importance: 1.3 }
    ],

    lessons: [
      {
        id: "m22l1", title: "Describing a shape", minutes: 13,
        concepts: ["regex-basics", "regex-classes", "regex-quantifiers", "regex-anchors"],
        content: L([
          "## The building blocks",
          "",
          "| Pattern | Matches |",
          "|---|---|",
          "| `abc` | the literal text `abc` |",
          "| `.` | any single character except a newline |",
          "| `\\d` | a digit `0-9` |",
          "| `\\w` | a word character: letter, digit or underscore |",
          "| `\\s` | any whitespace |",
          "| `\\D` `\\W` `\\S` | the opposite of each |",
          "| `[abc]` | one of a, b or c |",
          "| `[a-z]` | any lowercase letter |",
          "| `[^abc]` | any character **except** a, b or c |",
          "",
          "## Quantifiers: how many",
          "",
          "| Pattern | Means |",
          "|---|---|",
          "| `a*` | zero or more |",
          "| `a+` | one or more |",
          "| `a?` | zero or one (optional) |",
          "| `a{3}` | exactly three |",
          "| `a{2,4}` | two to four |",
          "| `a{2,}` | two or more |",
          "",
          "~~~py",
          "import re",
          "",
          "print(re.findall(r'\\d+', 'order 66 shipped in 3 days'))",
          "~~~",
          "~~~out",
          "['66', '3']",
          "~~~",
          "",
          ":::warn Always use a raw string",
          "Write `r'\\d+'`, not `'\\d+'`. In a normal string, `\\d` happens to survive but `\\b` becomes a",
          "backspace character and your pattern silently stops working. The `r` prefix turns off Python's own",
          "escape handling so the regex engine sees exactly what you typed.",
          ":::",
          "",
          "## Anchors: where",
          "",
          "| Pattern | Means |",
          "|---|---|",
          "| `^` | start of the string (or line, with `re.M`) |",
          "| `$` | end of the string |",
          "| `\\b` | a word boundary |",
          "",
          "~~~py",
          "re.search(r'cat', 'concatenate')       # matches -- probably not what you wanted",
          "re.search(r'\\bcat\\b', 'concatenate')   # no match",
          "re.search(r'\\bcat\\b', 'the cat sat')   # matches",
          "~~~",
          "",
          "Forgetting anchors is the most common regex bug. `^\\d{4}$` means *exactly four digits and nothing",
          "else*; `\\d{4}` matches four digits **anywhere**, including inside `abc12345xyz`.",
          "",
          "## Greedy vs lazy",
          "",
          "~~~py",
          "text = '<b>bold</b> and <i>italic</i>'",
          "print(re.findall(r'<.+>', text))     # ['<b>bold</b> and <i>italic</i>']",
          "print(re.findall(r'<.+?>', text))    # ['<b>', '</b>', '<i>', '</i>']",
          "~~~",
          "",
          "`+` and `*` are **greedy** — they take as much as possible and give back only if forced. Adding `?`",
          "makes them **lazy**, taking as little as possible. When a pattern grabs far more than expected,",
          "greediness is almost always why.",
          "",
          "## Putting it together",
          "",
          "| Goal | Pattern |",
          "|---|---|",
          "| ISO date | `\\d{4}-\\d{2}-\\d{2}` |",
          "| whole line is digits | `^\\d+$` |",
          "| UK-ish postcode | `[A-Z]{1,2}\\d[A-Z\\d]? ?\\d[A-Z]{2}` |",
          "| word repeated twice | `\\b(\\w+) \\1\\b` |",
          "",
          ":::tip Build patterns incrementally",
          "Do not write a 60-character regex in one go. Match the first field, check it, add the next.",
          "Test on real data — including the lines you expect to fail.",
          ":::"
        ]),
        exercises: [
          {
            kind: "code", title: "Extract the numbers", difficulty: 2,
            concepts: ["regex-basics", "regex-api"],
            prompt: L([
              "Write `numbers_in(text)` returning every run of digits as a list of **integers**.",
              "",
              "`numbers_in('order 66 shipped in 3 days')` → `[66, 3]`"
            ]),
            starter: "import re\n\n\ndef numbers_in(text):\n    ",
            requires: [{ contains: "re.", msg: "Use the re module" }],
            hints: ["`re.findall(r'\\d+', text)` gives strings.", "Convert each with `int`."],
            tests: [
              { name: "finds numbers", call: "numbers_in('order 66 shipped in 3 days')", expect: [66, 3] },
              { name: "no numbers", call: "numbers_in('nothing here')", expect: [] },
              { name: "multi-digit runs stay together", call: "numbers_in('a1234b')", expect: [1234] },
              { name: "returns integers", code: "assert all(isinstance(n, int) for n in numbers_in('1 2'))" }
            ],
            solution: "import re\n\n\ndef numbers_in(text):\n    return [int(n) for n in re.findall(r'\\d+', text)]"
          },
          {
            kind: "code", title: "Validate a code", difficulty: 3,
            concepts: ["regex-anchors", "regex-quantifiers"],
            prompt: L([
              "Product codes look like two uppercase letters, a hyphen, then four digits: `AB-1234`.",
              "",
              "Write `is_valid_code(text)` returning `True` only when the **whole string** is exactly that.",
              "",
              "`'AB-1234'` yes; `'xAB-1234'`, `'AB-123'`, `'ab-1234'` and `'AB-12345'` all no."
            ]),
            starter: "import re\n\n\ndef is_valid_code(text):\n    ",
            hints: [
              "Anchor both ends: `^` and `$`.",
              "`[A-Z]{2}-\\d{4}`",
              "`re.fullmatch` anchors for you, or use `bool(re.match(r'^...$', text))`."
            ],
            tests: [
              { name: "valid code", call: "is_valid_code('AB-1234')", expect: true },
              { name: "extra prefix rejected", call: "is_valid_code('xAB-1234')", expect: false },
              { name: "too few digits", call: "is_valid_code('AB-123')", expect: false },
              { name: "too many digits", call: "is_valid_code('AB-12345')", expect: false },
              { name: "lowercase rejected", call: "is_valid_code('ab-1234')", expect: false },
              { name: "empty string", call: "is_valid_code('')", expect: false },
              { name: "trailing text rejected", call: "is_valid_code('AB-1234x')", expect: false }
            ],
            solution: "import re\n\n\ndef is_valid_code(text):\n    return re.fullmatch(r'[A-Z]{2}-\\d{4}', text) is not None"
          },
          {
            kind: "predict", title: "Greedy", difficulty: 3,
            concepts: ["regex-quantifiers"],
            prompt: L([
              "How many matches?",
              "",
              "~~~py",
              "import re",
              "print(len(re.findall(r'\\[.+\\]', '[a] and [b] and [c]')))",
              "~~~"
            ]),
            choices: ["3", "1", "0", "2"],
            answer: 1,
            explain: "`.+` is greedy, so it stretches from the first `[` to the **last** `]`, swallowing everything between. `\\[.+?\\]` would give three matches."
          },
          {
            kind: "debug", title: "Missing word boundaries", difficulty: 3,
            concepts: ["regex-anchors"],
            prompt: L([
              "`count_word(text, word)` should count whole words only, but `count_word('concatenate cat', 'cat')`",
              "returns `2` instead of `1`. Fix it.",
              "",
              "Matching must stay case-sensitive."
            ]),
            starter: L([
              "import re",
              "",
              "",
              "def count_word(text, word):",
              "    return len(re.findall(word, text))"
            ]),
            hints: [
              "`\\b` matches a word boundary.",
              "Build the pattern with an f-string: `rf'\\b{word}\\b'`.",
              "`re.escape(word)` protects against special characters in the word."
            ],
            tests: [
              { name: "whole words only", call: "count_word('concatenate cat', 'cat')", expect: 1 },
              { name: "several occurrences", call: "count_word('cat cat dog', 'cat')", expect: 2 },
              { name: "no match", call: "count_word('dog', 'cat')", expect: 0 },
              { name: "case-sensitive", call: "count_word('Cat cat', 'cat')", expect: 1 },
              { name: "punctuation counts as a boundary", call: "count_word('the cat, sat', 'cat')", expect: 1 }
            ],
            solution: L([
              "import re",
              "",
              "",
              "def count_word(text, word):",
              "    return len(re.findall(rf'\\b{re.escape(word)}\\b', text))"
            ]),
            takeaway: "`re.escape` matters the moment the search term comes from a user — a `.` or `(` in the input would otherwise change the pattern's meaning."
          }
        ]
      },

      {
        id: "m22l2", title: "Groups, extraction and replacement", minutes: 13,
        concepts: ["regex-groups", "regex-api", "regex-sub"],
        content: L([
          "## The re API",
          "",
          "| Function | Returns |",
          "|---|---|",
          "| `re.search(p, s)` | first match anywhere, or `None` |",
          "| `re.match(p, s)` | match at the **start** only |",
          "| `re.fullmatch(p, s)` | match of the **whole** string |",
          "| `re.findall(p, s)` | list of all matches (or of groups) |",
          "| `re.finditer(p, s)` | iterator of match objects |",
          "| `re.sub(p, repl, s)` | string with replacements |",
          "| `re.split(p, s)` | split on the pattern |",
          "",
          ":::trap search vs match",
          "`re.match` is anchored at the start, `re.search` is not. Using `match` when you meant `search` is a",
          "classic source of \"why does my pattern not work\". If you want the whole string, use `fullmatch`.",
          ":::",
          "",
          "## Capture groups",
          "",
          "Parentheses capture the part you want:",
          "",
          "~~~py",
          "import re",
          "",
          "m = re.search(r'(\\d{4})-(\\d{2})-(\\d{2})', 'due 2024-03-11 ok')",
          "print(m.group(0))    # 2024-03-11  -- the whole match",
          "print(m.group(1))    # 2024",
          "print(m.groups())    # ('2024', '03', '11')",
          "~~~",
          "",
          "**Always check for `None` first** — `re.search` returns `None` when there is no match, and",
          "`None.group(1)` is an `AttributeError`:",
          "",
          "~~~py",
          "m = re.search(pattern, text)",
          "if m:",
          "    year = m.group(1)",
          "~~~",
          "",
          "## Named groups",
          "",
          "~~~py",
          "pattern = r'(?P<user>\\w+)@(?P<domain>[\\w.]+)'",
          "m = re.search(pattern, 'contact ada@example.com today')",
          "print(m.group('user'))       # ada",
          "print(m.groupdict())         # {'user': 'ada', 'domain': 'example.com'}",
          "~~~",
          "",
          "For anything with more than two groups, name them. `m.group(4)` is unreadable and breaks the moment",
          "someone adds a group in the middle.",
          "",
          "## findall with groups",
          "",
          "~~~py",
          "text = 'ada=36, bo=20'",
          "print(re.findall(r'(\\w+)=(\\d+)', text))",
          "~~~",
          "~~~out",
          "[('ada', '36'), ('bo', '20')]",
          "~~~",
          "",
          "With **one** group, `findall` returns a list of strings. With **several**, a list of tuples.",
          "With none, the whole matches. That inconsistency surprises people — `finditer` is more predictable",
          "when it matters.",
          "",
          "## Substitution",
          "",
          "~~~py",
          "print(re.sub(r'\\s+', ' ', 'too    many   spaces'))",
          "print(re.sub(r'(\\d{4})-(\\d{2})-(\\d{2})', r'\\3/\\2/\\1', 'on 2024-03-11'))",
          "~~~",
          "~~~out",
          "too many spaces",
          "on 11/03/2024",
          "~~~",
          "",
          "`\\1` in the replacement refers to the first group. The replacement can also be a **function**:",
          "",
          "~~~py",
          "def redact(match):",
          "    return '*' * len(match.group(0))",
          "",
          "print(re.sub(r'\\d{4,}', redact, 'card 4111111111111111 ok'))",
          "~~~",
          "",
          "## Compile when reused",
          "",
          "~~~py",
          "PATTERN = re.compile(r'^(\\d{4})-(\\d{2})-(\\d{2})')",
          "",
          "for line in lines:",
          "    m = PATTERN.match(line)",
          "~~~",
          "",
          "Compiling once at module level is faster in a loop and, more usefully, gives the pattern a **name**",
          "at the top of the file where a reader can find it.",
          "",
          ":::tip re.VERBOSE for anything complex",
          "~~~py",
          "PATTERN = re.compile(r'''",
          "    (?P<date>\\d{4}-\\d{2}-\\d{2})   # the date",
          "    \\s+",
          "    (?P<level>[A-Z]+)              # log level",
          "''', re.VERBOSE)",
          "~~~",
          "Whitespace and comments are ignored, so the pattern can be laid out and explained.",
          ":::"
        ]),
        exercises: [
          {
            kind: "code", title: "Parse a date", difficulty: 3,
            concepts: ["regex-groups"],
            prompt: L([
              "Write `parse_date(text)` finding the first ISO date (`YYYY-MM-DD`) anywhere in the text and",
              "returning `(year, month, day)` as **integers**.",
              "",
              "Return `None` if there is no date."
            ]),
            starter: "import re\n\n\ndef parse_date(text):\n    ",
            hints: [
              "`re.search(r'(\\d{4})-(\\d{2})-(\\d{2})', text)`",
              "Check for `None` before calling `.groups()`.",
              "`tuple(int(g) for g in m.groups())`"
            ],
            tests: [
              { name: "finds a date", call: "parse_date('due 2024-03-11 ok')", expect: [2024, 3, 11] },
              { name: "at the start", call: "parse_date('2020-01-05')", expect: [2020, 1, 5] },
              { name: "no date gives None", code: "assert parse_date('no dates here') is None" },
              { name: "first date wins", call: "parse_date('2024-01-01 and 2025-02-02')", expect: [2024, 1, 1] },
              { name: "returns integers", code: "assert all(isinstance(v, int) for v in parse_date('2024-03-11'))" }
            ],
            solution: L([
              "import re",
              "",
              "",
              "def parse_date(text):",
              "    m = re.search(r'(\\d{4})-(\\d{2})-(\\d{2})', text)",
              "    if m is None:",
              "        return None",
              "    return tuple(int(part) for part in m.groups())"
            ])
          },
          {
            kind: "code", title: "Key-value pairs", difficulty: 3,
            concepts: ["regex-groups", "regex-api"],
            prompt: L([
              "Log lines contain `key=value` pairs. Write `extract_pairs(line)` returning them as a dictionary.",
              "",
              "`extract_pairs('user=ada action=login ms=42')` → `{'user': 'ada', 'action': 'login', 'ms': '42'}`",
              "",
              "Values are runs of non-space characters. Keys are word characters."
            ]),
            starter: "import re\n\n\ndef extract_pairs(line):\n    ",
            hints: [
              "`re.findall(r'(\\w+)=(\\S+)', line)` gives a list of tuples.",
              "`dict(...)` turns a list of pairs straight into a dictionary."
            ],
            tests: [
              {
                name: "extracts pairs",
                call: "extract_pairs('user=ada action=login ms=42')",
                expect: { user: "ada", action: "login", ms: "42" }
              },
              { name: "no pairs", call: "extract_pairs('nothing here')", expect: {} },
              { name: "ignores surrounding text", call: "extract_pairs('INFO user=bo done')", expect: { user: "bo" } },
              { name: "values may contain punctuation", call: "extract_pairs('ip=10.0.0.5')", expect: { ip: "10.0.0.5" } }
            ],
            solution: L([
              "import re",
              "",
              "",
              "def extract_pairs(line):",
              "    return dict(re.findall(r'(\\w+)=(\\S+)', line))"
            ])
          },
          {
            kind: "code", title: "Redact card numbers", difficulty: 4,
            concepts: ["regex-sub"],
            prompt: L([
              "Write `redact(text)` replacing every run of **12 or more** digits with the same number of `*`.",
              "",
              "`redact('card 4111111111111111 ok')` → `'card **************** ok'`",
              "",
              "Shorter numbers must be left alone. Use a replacement **function**."
            ]),
            starter: "import re\n\n\ndef redact(text):\n    ",
            hints: [
              "Pattern: `\\d{12,}`.",
              "The replacement function receives a match object; return `'*' * len(match.group(0))`."
            ],
            tests: [
              { name: "redacts a card number", call: "redact('card 4111111111111111 ok')", expect: "card **************** ok" },
              { name: "leaves short numbers", call: "redact('order 66 in 2024')", expect: "order 66 in 2024" },
              { name: "exactly 12 digits is redacted", call: "redact('123456789012')", expect: "************" },
              { name: "11 digits is left alone", call: "redact('12345678901')", expect: "12345678901" },
              { name: "several numbers", call: "redact('a 123456789012 b 999999999999 c')", expect: "a ************ b ************ c" }
            ],
            solution: L([
              "import re",
              "",
              "",
              "def redact(text):",
              "    def mask(match):",
              "        return '*' * len(match.group(0))",
              "    return re.sub(r'\\d{12,}', mask, text)"
            ])
          },
          {
            kind: "code", title: "Named groups", difficulty: 4,
            concepts: ["regex-groups"],
            prompt: L([
              "Write `parse_log_line(line)` for lines like:",
              "",
              "~~~text",
              "2024-03-11 09:14:02 INFO user=ada",
              "~~~",
              "",
              "Return a dictionary with keys `date`, `time` and `level` using **named groups**.",
              "Lines that do not match this shape return `None`.",
              "",
              "The level is one or more uppercase letters."
            ]),
            starter: "import re\n\n\ndef parse_log_line(line):\n    ",
            requires: [{ contains: "?P<", msg: "Use named groups" }],
            hints: [
              "`(?P<date>\\d{4}-\\d{2}-\\d{2})` names a group.",
              "Anchor the start with `^` so junk lines are rejected.",
              "`m.groupdict()` gives you the dictionary directly."
            ],
            tests: [
              {
                name: "parses a valid line",
                call: "parse_log_line('2024-03-11 09:14:02 INFO user=ada')",
                expect: { date: "2024-03-11", time: "09:14:02", level: "INFO" }
              },
              { name: "another level", call: "parse_log_line('2024-01-01 00:00:00 ERROR x=1')['level']", expect: "ERROR" },
              { name: "junk line gives None", code: "assert parse_log_line('not a valid line at all') is None" },
              { name: "empty line gives None", code: "assert parse_log_line('') is None" },
              { name: "a missing level is rejected", code: "assert parse_log_line('2024-03-11 09:14:02 user=ada') is None" }
            ],
            solution: L([
              "import re",
              "",
              "",
              "PATTERN = re.compile(",
              "    r'^(?P<date>\\d{4}-\\d{2}-\\d{2})\\s+'",
              "    r'(?P<time>\\d{2}:\\d{2}:\\d{2})\\s+'",
              "    r'(?P<level>[A-Z]+)\\b'",
              ")",
              "",
              "",
              "def parse_log_line(line):",
              "    m = PATTERN.match(line)",
              "    if m is None:",
              "        return None",
              "    return m.groupdict()"
            ]),
            takeaway: "Named groups turn a regex from write-only into something a colleague can read. For anything with more than two groups, always name them."
          }
        ]
      },

      {
        id: "m22l3", title: "When not to use a regex", minutes: 9,
        concepts: ["regex-limits", "str-methods"],
        content: L([
          "## String methods first",
          "",
          "~~~py",
          "re.match(r'^https://', url)         # slower and harder to read than",
          "url.startswith('https://')",
          "",
          "re.split(r',', line)                 # than",
          "line.split(',')",
          "",
          "re.search(r'error', line)            # than",
          "'error' in line",
          "~~~",
          "",
          "If a string method does it, use the string method. It is faster, clearer, and cannot be subtly wrong.",
          "",
          "## Do not parse structured formats with regex",
          "",
          "**Never** use regex for:",
          "",
          "| Format | Use instead |",
          "|---|---|",
          "| HTML / XML | a parser (`html.parser`, `lxml`, `BeautifulSoup`) |",
          "| JSON | `json.loads` |",
          "| CSV | the `csv` module |",
          "| URLs | `urllib.parse` |",
          "| Email addresses | a library — the real specification is 80 lines of regex and still wrong |",
          "| Dates | `datetime.fromisoformat` or `strptime` |",
          "",
          "These formats have nesting, escaping and quoting rules that regular expressions **cannot** express.",
          "A regex for CSV works until a field contains a quoted comma; a regex for HTML works until an",
          "attribute contains a `>`.",
          "",
          ":::warn Catastrophic backtracking",
          "~~~py",
          "re.match(r'(a+)+b', 'a' * 30)",
          "~~~",
          "",
          "This can take **years**. Nested quantifiers make the engine try exponentially many ways to split the",
          "input. It is a real denial-of-service vector — user-supplied patterns, or a naive pattern run on",
          "user-supplied text, have taken production systems down.",
          "",
          "Avoid nesting quantifiers, and be specific: `[^\"]*` instead of `.*`.",
          ":::",
          "",
          "## When a regex is right",
          "",
          "- the pattern is genuinely a pattern (a date, a code, an identifier)",
          "- you need to find matches **anywhere** in unstructured text",
          "- you need to split on something more complex than a fixed string",
          "- you are replacing by pattern rather than by literal",
          "",
          "## Keep them readable",
          "",
          "~~~py",
          "# unreadable",
          "if re.match(r'^[\\w.+-]+@[\\w-]+\\.[\\w.]+$', value): ...",
          "",
          "# better: name it",
          "EMAIL_SHAPE = re.compile(r'^[\\w.+-]+@[\\w-]+\\.[\\w.]+$')",
          "if EMAIL_SHAPE.match(value): ...",
          "~~~",
          "",
          "A named, compiled pattern at the top of the module is documentation. An inline regex in the middle",
          "of a function is a puzzle for whoever reads it next — often you."
        ]),
        exercises: [
          {
            kind: "refactor", title: "Regex was the wrong tool", difficulty: 2,
            concepts: ["regex-limits"],
            prompt: L([
              "Every one of these uses a regex where a string method is clearer and faster. Rewrite all four",
              "without `re`.",
              "",
              "The behaviour must not change."
            ]),
            starter: L([
              "import re",
              "",
              "",
              "def is_secure(url):",
              "    return bool(re.match(r'^https://', url))",
              "",
              "",
              "def fields(line):",
              "    return re.split(r',', line)",
              "",
              "",
              "def has_error(line):",
              "    return bool(re.search(r'ERROR', line))",
              "",
              "",
              "def strip_spaces(text):",
              "    return re.sub(r'^\\s+|\\s+$', '', text)"
            ]),
            forbids: [{ contains: "re.", msg: "Use string methods instead" }],
            hints: [
              "`.startswith()`, `.split(',')`, `in`, `.strip()`."
            ],
            tests: [
              { name: "is_secure", call: "[is_secure('https://a'), is_secure('http://a')]", expect: [true, false] },
              { name: "fields", call: "fields('a,b,c')", expect: ["a", "b", "c"] },
              { name: "has_error", call: "[has_error('an ERROR here'), has_error('fine')]", expect: [true, false] },
              { name: "strip_spaces", call: "strip_spaces('  hi  ')", expect: "hi" },
              { name: "strip keeps inner spaces", call: "strip_spaces('  a b  ')", expect: "a b" }
            ],
            solution: L([
              "def is_secure(url):",
              "    return url.startswith('https://')",
              "",
              "",
              "def fields(line):",
              "    return line.split(',')",
              "",
              "",
              "def has_error(line):",
              "    return 'ERROR' in line",
              "",
              "",
              "def strip_spaces(text):",
              "    return text.strip()"
            ])
          },
          {
            kind: "quiz", title: "Parsing HTML", difficulty: 2,
            concepts: ["regex-limits"],
            prompt: "Why should you not extract links from HTML with a regular expression?",
            choices: [
              "Regexes are too slow for HTML",
              "HTML is nested and can contain quoted characters that look like markup, which regular expressions cannot correctly handle",
              "The re module cannot read angle brackets",
              "It is only a style preference"
            ],
            answer: 1,
            explain: "Regular expressions cannot express arbitrary nesting, and attributes can legally contain `>` or `<`. A parser understands the grammar; a regex only sees characters."
          },
          {
            kind: "code", title: "Split on multiple separators", difficulty: 3,
            concepts: ["regex-api"],
            prompt: L([
              "Write `tokenise(text)` splitting on any run of commas, semicolons or whitespace, dropping empty",
              "pieces.",
              "",
              "`tokenise('a, b;c   d')` → `['a', 'b', 'c', 'd']`",
              "",
              "This is a case where a regex genuinely is the right tool."
            ]),
            starter: "import re\n\n\ndef tokenise(text):\n    ",
            hints: [
              "`re.split(r'[,;\\s]+', text)` splits on any run of those characters.",
              "Leading or trailing separators produce empty strings — filter them out."
            ],
            tests: [
              { name: "mixed separators", call: "tokenise('a, b;c   d')", expect: ["a", "b", "c", "d"] },
              { name: "leading and trailing", call: "tokenise('  ,a, ')", expect: ["a"] },
              { name: "empty input", call: "tokenise('')", expect: [] },
              { name: "single token", call: "tokenise('solo')", expect: ["solo"] },
              { name: "only separators", call: "tokenise(' ,; ')", expect: [] }
            ],
            solution: L([
              "import re",
              "",
              "",
              "def tokenise(text):",
              "    return [part for part in re.split(r'[,;\\s]+', text) if part]"
            ])
          },
          {
            kind: "quiz", title: "Catastrophic backtracking", difficulty: 4,
            concepts: ["regex-limits"],
            prompt: "Why can `(a+)+b` take effectively forever on a long string of `a`s with no `b`?",
            choices: [
              "The regex module has a bug",
              "Nested quantifiers create exponentially many ways to divide the input, and the engine tries them all before failing",
              "It runs out of memory",
              "It is waiting for input"
            ],
            answer: 1,
            explain: "Each `a` can belong to the inner or the outer repetition, so the number of arrangements doubles with every character. With no `b` to succeed on, the engine must exhaust all of them. Avoid nesting quantifiers and prefer specific classes over `.`."
          }
        ]
      }
    ],

    checkpoint: {
      id: "m22cp", pass: 0.8,
      title: "Checkpoint: Regex & Text Processing",
      items: [
        {
          kind: "code", title: "Find the hashtags", difficulty: 3, concepts: ["regex-basics"],
          prompt: "Write `hashtags(text)` returning every hashtag **without** the `#`, in order. A hashtag is `#` followed by one or more word characters.",
          starter: "import re\n\n\ndef hashtags(text):\n    ",
          tests: [
            { name: "finds hashtags", call: "hashtags('love #python and #code')", expect: ["python", "code"] },
            { name: "none", call: "hashtags('nothing')", expect: [] },
            { name: "a bare hash is not a hashtag", call: "hashtags('# alone')", expect: [] }
          ]
        },
        {
          kind: "predict", title: "match vs search", difficulty: 3, concepts: ["regex-api"],
          prompt: "What does `re.match(r'world', 'hello world')` return?",
          choices: ["A match object", "`None`", "`'world'`", "An error"],
          answer: 1,
          explain: "`re.match` only matches at the **start** of the string. `re.search` would find it anywhere."
        },
        {
          kind: "code", title: "Normalise whitespace", difficulty: 2, concepts: ["regex-sub"],
          prompt: "Write `squash(text)` collapsing every run of whitespace to a single space and stripping the ends.",
          starter: "import re\n\n\ndef squash(text):\n    ",
          tests: [
            { name: "collapses", call: "squash('too    many   spaces')", expect: "too many spaces" },
            { name: "strips ends", call: "squash('  a b  ')", expect: "a b" },
            { name: "newlines and tabs count", call: "squash('a\\n\\tb')", expect: "a b" },
            { name: "empty", call: "squash('   ')", expect: "" }
          ]
        },
        {
          kind: "code", title: "Extract quoted strings", difficulty: 4, concepts: ["regex-quantifiers"],
          prompt: "Write `quoted(text)` returning the contents of every double-quoted section, without the quotes. Use a non-greedy or negated class so adjacent strings are separate.",
          starter: "import re\n\n\ndef quoted(text):\n    ",
          tests: [
            { name: "two strings", call: "quoted('say \"hi\" and \"bye\"')", expect: ["hi", "bye"] },
            { name: "none", call: "quoted('no quotes')", expect: [] },
            { name: "empty quotes", call: "quoted('a \"\" b')", expect: [""] }
          ]
        },
        {
          kind: "quiz", title: "Raw strings", difficulty: 2, concepts: ["regex-basics"],
          prompt: "Why write `r'\\bword\\b'` rather than `'\\bword\\b'`?",
          choices: [
            "Raw strings are faster",
            "Without the r prefix, Python turns `\\b` into a backspace character before the regex engine ever sees it",
            "The r prefix makes the pattern case-insensitive",
            "There is no difference"
          ],
          answer: 1,
          explain: "`\\b` is a real escape sequence in Python strings. The `r` prefix stops Python interpreting backslashes so the regex engine receives them intact."
        }
      ]
    },

    project: {
      id: "m22proj",
      title: "Project: Log Analyser",
      xp: 460,
      filename: "loganalyser.py",
      files: { "app.log": LOG },
      concepts: ["regex-groups", "dict-count", "dict-group", "sort-key", "file-read", "generator-fn", "error-design"],
      brief: L([
        "A real log analyser: read a file, parse the lines that are valid, ignore the ones that are not, and",
        "answer questions about what happened.",
        "",
        "This is the shape of an enormous amount of practical engineering work — and everything you have",
        "learned in Tier 3 shows up: regex, generators, dictionaries, sorting and sensible failure handling.",
        "",
        "A file `app.log` is provided. It contains 10 lines, one of which is deliberately malformed.",
        "",
        "~~~text",
        "2024-03-11 09:14:02 INFO  user=ada action=login ip=10.0.0.5 ms=42",
        "2024-03-11 09:16:03 ERROR user=cy action=login ip=10.0.1.7 ms=88 error=bad_password",
        "not a valid line at all",
        "~~~",
        "",
        ":::tip Build it stage by stage",
        "Stage 1 is the parser everything else depends on. Get it exactly right before moving on.",
        ":::"
      ]),
      starter: L([
        "\"\"\"Log Analyser — Tier 3 project.\"\"\"",
        "import re",
        "",
        "",
        "def parse_line(line):",
        "    \"\"\"Parse one log line into a dict, or return None if it is malformed.\"\"\"",
        "",
        "",
        "def read_log(path):",
        "    \"\"\"Yield parsed entries from a log file, skipping malformed lines.\"\"\"",
        "",
        "",
        "def count_by(entries, field):",
        "    \"\"\"Count entries per distinct value of a field.\"\"\"",
        "",
        "",
        "def slowest(entries, n):",
        "    \"\"\"Return the n slowest entries.\"\"\"",
        "",
        "",
        "def report(path):",
        "    \"\"\"Return the full analysis report.\"\"\""
      ]),
      outro: L([
        "You have written a tool that turns unstructured text into structured data, survives bad input, and",
        "answers real operational questions. Swap the regex and it works on a different log format.",
        "",
        "**Tier 3 is nearly done.** Two modules left — databases and APIs — and then Mastery."
      ]),
      stages: [
        {
          title: "Parse a line",
          xp: 90,
          spec: L([
            "Write `parse_line(line)`.",
            "",
            "A valid line is: an ISO date, a `HH:MM:SS` time, an uppercase level, then any number of",
            "`key=value` pairs separated by whitespace.",
            "",
            "Return a dictionary with:",
            "",
            "- `date` and `time` as strings",
            "- `level` as a string",
            "- every `key=value` pair, with `ms` converted to an **int** if present",
            "",
            "Anything that does not match this shape returns `None`.",
            "",
            "~~~py",
            "parse_line('2024-03-11 09:14:02 INFO  user=ada action=login ip=10.0.0.5 ms=42')",
            "# {'date': '2024-03-11', 'time': '09:14:02', 'level': 'INFO',",
            "#  'user': 'ada', 'action': 'login', 'ip': '10.0.0.5', 'ms': 42}",
            "~~~"
          ]),
          tests: [
            {
              name: "parses a full line",
              code: "r = parse_line('2024-03-11 09:14:02 INFO  user=ada action=login ip=10.0.0.5 ms=42')\nassert r == {'date': '2024-03-11', 'time': '09:14:02', 'level': 'INFO', 'user': 'ada', 'action': 'login', 'ip': '10.0.0.5', 'ms': 42}, r"
            },
            { name: "ms is an integer", code: "r = parse_line('2024-03-11 09:14:02 INFO user=ada ms=42')\nassert isinstance(r['ms'], int)" },
            { name: "extra fields are kept", code: "r = parse_line('2024-03-11 09:16:03 ERROR user=cy ms=88 error=bad_password')\nassert r['error'] == 'bad_password'" },
            { name: "malformed lines give None", code: "assert parse_line('not a valid line at all') is None" },
            { name: "empty line gives None", code: "assert parse_line('') is None" },
            { name: "a missing level is rejected", code: "assert parse_line('2024-03-11 09:14:02 user=ada') is None" },
            { name: "no pairs is still valid", code: "r = parse_line('2024-03-11 09:14:02 INFO')\nassert r is not None and r['level'] == 'INFO'" }
          ]
        },
        {
          title: "Read the file lazily",
          xp: 80,
          spec: L([
            "Write `read_log(path)` as a **generator** yielding one parsed dictionary per valid line,",
            "silently skipping malformed ones.",
            "",
            "It must be lazy — it must not build a list of every entry — and it must close the file properly.",
            "",
            "A missing file raises `FileNotFoundError` (do not swallow it)."
          ]),
          tests: [
            { name: "yields the valid entries", code: "entries = list(read_log('app.log'))\nassert len(entries) == 9, f'expected 9 valid lines, got {len(entries)}'" },
            { name: "skips the malformed line", code: "assert all(e is not None for e in read_log('app.log'))" },
            { name: "it is a generator", code: "import types\nassert isinstance(read_log('app.log'), types.GeneratorType), 'read_log must be a generator'" },
            { name: "entries are parsed dictionaries", code: "first = next(read_log('app.log'))\nassert first['user'] == 'ada' and first['level'] == 'INFO'" },
            { name: "missing file still raises", code: "try:\n    list(read_log('nope.log'))\n    raise AssertionError('should raise')\nexcept FileNotFoundError:\n    pass" }
          ]
        },
        {
          title: "Aggregate",
          xp: 90,
          spec: L([
            "Write two analysis functions.",
            "",
            "`count_by(entries, field)` → a dictionary mapping each distinct value of that field to how many",
            "entries have it. Entries missing the field are ignored.",
            "",
            "`slowest(entries, n)` → the `n` entries with the largest `ms`, highest first. Entries with no `ms`",
            "are ignored. Fewer than `n` matching entries simply returns what there is.",
            "",
            "Both must accept **any iterable** of entries, including a generator."
          ]),
          tests: [
            {
              name: "counts levels",
              code: "counts = count_by(read_log('app.log'), 'level')\nassert counts == {'INFO': 4, 'WARN': 2, 'ERROR': 3}, counts"
            },
            {
              name: "counts users",
              code: "counts = count_by(read_log('app.log'), 'user')\nassert counts['ada'] == 4 and counts['cy'] == 2"
            },
            { name: "missing fields are ignored", code: "counts = count_by(read_log('app.log'), 'error')\nassert counts == {'bad_password': 2, 'timeout': 1}, counts" },
            { name: "unknown field gives empty", code: "assert count_by(read_log('app.log'), 'nope') == {}" },
            {
              name: "finds the slowest",
              code: "top = slowest(read_log('app.log'), 2)\nassert [e['ms'] for e in top] == [5310, 1902], [e['ms'] for e in top]"
            },
            { name: "asking for more than exists is fine", code: "assert len(slowest(read_log('app.log'), 100)) == 9" },
            { name: "works on a plain list too", code: "entries = list(read_log('app.log'))\nassert count_by(entries, 'level')['ERROR'] == 3" }
          ]
        },
        {
          title: "The report",
          xp: 100,
          spec: L([
            "Write `report(path)` returning a multi-line string:",
            "",
            "~~~text",
            "Log report: app.log",
            "Entries: 9 (1 malformed)",
            "",
            "Levels",
            "  INFO     4",
            "  ERROR    3",
            "  WARN     2",
            "",
            "Slowest",
            "  5310ms  ada  upload",
            "  1902ms  ada  upload",
            "  805ms   dee  view",
            "~~~",
            "",
            "Rules:",
            "",
            "- the first line names the file exactly as passed in",
            "- the count line gives valid entries and malformed lines (a blank final line does not count as malformed)",
            "- levels are listed by count descending, ties alphabetically; the level is left-aligned in 8 characters,",
            "  indented by two spaces",
            "- the three slowest entries follow, formatted `  {ms}ms` left-aligned in 8 characters after the indent,",
            "  then user, then action, separated by two spaces",
            "- blank lines exactly as shown, no trailing newline"
          ]),
          tests: [
            {
              name: "the header",
              code: "lines = report('app.log').split('\\n')\nassert lines[0] == 'Log report: app.log', lines[0]\nassert lines[1] == 'Entries: 9 (1 malformed)', lines[1]"
            },
            {
              name: "the levels section",
              code: "lines = report('app.log').split('\\n')\nassert lines[3] == 'Levels', lines[3]\nassert lines[4] == '  INFO     4', repr(lines[4])\nassert lines[5] == '  ERROR    3', repr(lines[5])\nassert lines[6] == '  WARN     2', repr(lines[6])"
            },
            {
              name: "the slowest section",
              code: "lines = report('app.log').split('\\n')\nassert lines[8] == 'Slowest', lines[8]\nassert lines[9] == '  5310ms  ada  upload', repr(lines[9])\nassert lines[10] == '  1902ms  ada  upload', repr(lines[10])\nassert lines[11] == '  805ms   dee  view', repr(lines[11])"
            },
            { name: "no trailing newline", code: "assert not report('app.log').endswith('\\n')" },
            { name: "earlier stages still work", code: "assert count_by(read_log('app.log'), 'level')['INFO'] == 4\nassert parse_line('bad') is None" }
          ]
        }
      ],
      solution: L([
        "\"\"\"Log Analyser — reference solution.\"\"\"",
        "import re",
        "",
        "LINE = re.compile(",
        "    r'^(?P<date>\\d{4}-\\d{2}-\\d{2})\\s+'",
        "    r'(?P<time>\\d{2}:\\d{2}:\\d{2})\\s+'",
        "    r'(?P<level>[A-Z]+)(?P<rest>(\\s+\\w+=\\S+)*)\\s*$'",
        ")",
        "PAIR = re.compile(r'(\\w+)=(\\S+)')",
        "",
        "",
        "def parse_line(line):",
        "    match = LINE.match(line)",
        "    if match is None:",
        "        return None",
        "    entry = {",
        "        'date': match.group('date'),",
        "        'time': match.group('time'),",
        "        'level': match.group('level'),",
        "    }",
        "    for key, value in PAIR.findall(match.group('rest') or ''):",
        "        entry[key] = int(value) if key == 'ms' else value",
        "    return entry",
        "",
        "",
        "def read_log(path):",
        "    with open(path, encoding='utf-8') as f:",
        "        for line in f:",
        "            line = line.rstrip('\\n')",
        "            if not line.strip():",
        "                continue",
        "            entry = parse_line(line)",
        "            if entry is not None:",
        "                yield entry",
        "",
        "",
        "def count_by(entries, field):",
        "    counts = {}",
        "    for entry in entries:",
        "        if field in entry:",
        "            value = entry[field]",
        "            counts[value] = counts.get(value, 0) + 1",
        "    return counts",
        "",
        "",
        "def slowest(entries, n):",
        "    timed = [e for e in entries if 'ms' in e]",
        "    return sorted(timed, key=lambda e: -e['ms'])[:n]",
        "",
        "",
        "def _malformed_count(path):",
        "    bad = 0",
        "    with open(path, encoding='utf-8') as f:",
        "        for line in f:",
        "            if not line.strip():",
        "                continue",
        "            if parse_line(line.rstrip('\\n')) is None:",
        "                bad += 1",
        "    return bad",
        "",
        "",
        "def report(path):",
        "    entries = list(read_log(path))",
        "    bad = _malformed_count(path)",
        "",
        "    lines = [",
        "        f'Log report: {path}',",
        "        f'Entries: {len(entries)} ({bad} malformed)',",
        "        '',",
        "        'Levels',",
        "    ]",
        "",
        "    levels = count_by(entries, 'level')",
        "    for level, count in sorted(levels.items(), key=lambda kv: (-kv[1], kv[0])):",
        "        lines.append(f'  {level:<8} {count}')",
        "",
        "    lines.append('')",
        "    lines.append('Slowest')",
        "    for entry in slowest(entries, 3):",
        "        stamp = f\"{entry['ms']}ms\"",
        "        lines.append(f\"  {stamp:<8}{entry.get('user', '?')}  {entry.get('action', '?')}\")",
        "",
        "    return '\\n'.join(lines)"
      ])
    }
  });
})();
