/* Tier 1 · Module 7 — Strings I */
(function () {
  const L = a => a.join("\n");

  PQ.defineModule({
    id: "m07", tier: 1, order: 7, icon: "🔤",
    title: "Strings I",
    blurb: "Slice text, clean it, search it, and take it apart — the daily work of real programs.",
    intro: L([
      "Most data arrives as text: form fields, file lines, API responses, log entries, user names.",
      "Being fluent with strings is not a side topic — it is a very large fraction of everyday programming."
    ]),
    concepts: [
      { id: "str-index", name: "string indexing", importance: 1.3 },
      { id: "str-slice", name: "slicing", importance: 1.5 },
      { id: "str-methods", name: "string methods", importance: 1.5 },
      { id: "str-immutable", name: "immutability", importance: 1.3 },
      { id: "str-split-join", name: "split and join", importance: 1.5 },
      { id: "str-search", name: "searching in text", importance: 1.3 },
      { id: "str-iterate", name: "looping over text" }
    ],

    lessons: [
      {
        id: "m07l1", title: "Indexing and slicing", minutes: 11,
        concepts: ["str-index", "str-slice", "str-iterate"],
        content: L([
          "## Every character has a position",
          "",
          "~~~py",
          "word = 'python'",
          "print(word[0])    # p   -- counting starts at 0",
          "print(word[1])    # y",
          "print(word[-1])   # n   -- negative counts from the end",
          "print(word[-2])   # o",
          "print(len(word))  # 6",
          "~~~",
          "",
          "```text",
          " p  y  t  h  o  n",
          " 0  1  2  3  4  5",
          "-6 -5 -4 -3 -2 -1",
          "```",
          "",
          "The last valid index is `len(word) - 1`. Asking for `word[6]` gives `IndexError: string index out of range`.",
          "",
          "## Slicing: a range of characters",
          "",
          "`text[start:stop]` takes from `start` **up to but not including** `stop` — the same rule as `range`.",
          "",
          "~~~py",
          "word = 'programming'",
          "print(word[0:4])     # prog",
          "print(word[4:7])     # ram",
          "print(word[:4])      # prog   -- from the beginning",
          "print(word[4:])      # ramming -- to the end",
          "print(word[-4:])     # ming   -- last four",
          "print(word[:-4])     # program -- everything except the last four",
          "print(word[::2])     # pormig  -- every second character",
          "print(word[::-1])    # gnimmargorp -- reversed",
          "~~~",
          "",
          ":::tip The four you will actually use",
          "`text[:n]` first n · `text[n:]` skip n · `text[-n:]` last n · `text[::-1]` reverse.",
          "Everything else you can look up.",
          ":::",
          "",
          "### Slices never crash",
          "",
          "~~~py",
          "word = 'hi'",
          "print(word[5])      # IndexError",
          "print(word[0:99])   # 'hi'  -- perfectly happy",
          "~~~",
          "",
          "Indexing is strict; slicing is forgiving. That asymmetry is genuinely useful — `text[:100]` safely",
          "truncates anything.",
          "",
          "## Looping over characters",
          "",
          "~~~py",
          "for char in 'cat':",
          "    print(char)",
          "~~~",
          "",
          "A string is a sequence, so `for` walks it directly. You almost never need `for i in range(len(text))`.",
          "",
          "And `in` tests membership:",
          "",
          "~~~py",
          "print('gram' in 'programming')   # True",
          "print('z' in 'programming')      # False",
          "~~~"
        ]),
        exercises: [
          {
            kind: "code", title: "First and last", difficulty: 1,
            concepts: ["str-index"],
            prompt: L([
              "Write `first_and_last(text)` that returns a string made of the first and last characters.",
              "",
              "`first_and_last('python')` → `'pn'`"
            ]),
            starter: "def first_and_last(text):\n    ",
            hints: ["`text[0]` and `text[-1]`.", "Join them with `+`."],
            tests: [
              { name: "python gives pn", call: "first_and_last('python')", expect: "pn" },
              { name: "a single character doubles", call: "first_and_last('x')", expect: "xx" },
              { name: "works on a sentence", call: "first_and_last('hello world')", expect: "hd" }
            ],
            solution: "def first_and_last(text):\n    return text[0] + text[-1]"
          },
          {
            kind: "code", title: "Initials", difficulty: 2,
            concepts: ["str-index", "str-split-join"],
            prompt: L([
              "Write `initials(first, last)` returning the two initials in capitals, separated by a dot.",
              "",
              "`initials('ada', 'lovelace')` → `'A.L'`"
            ]),
            starter: "def initials(first, last):\n    ",
            hints: ["`first[0]` is the first character.", "`.upper()` capitalises it."],
            tests: [
              { name: "ada lovelace", call: "initials('ada', 'lovelace')", expect: "A.L" },
              { name: "already capitalised works", call: "initials('Grace', 'Hopper')", expect: "G.H" }
            ],
            solution: "def initials(first, last):\n    return f'{first[0].upper()}.{last[0].upper()}'"
          },
          {
            kind: "code", title: "Palindrome", difficulty: 3,
            concepts: ["str-slice"],
            prompt: L([
              "Write `is_palindrome(text)` that returns whether the text reads the same backwards.",
              "",
              "Compare the string to its reverse. Assume the input is already lower case with no spaces."
            ]),
            starter: "def is_palindrome(text):\n    ",
            hints: ["`text[::-1]` reverses a string.", "Compare with `==` and return the result directly — no `if` needed."],
            tests: [
              { name: "racecar is a palindrome", call: "is_palindrome('racecar')", expect: true },
              { name: "python is not", call: "is_palindrome('python')", expect: false },
              { name: "single letter is", call: "is_palindrome('a')", expect: true },
              { name: "empty string is", call: "is_palindrome('')", expect: true },
              { name: "even length works", call: "is_palindrome('abba')", expect: true }
            ],
            solution: "def is_palindrome(text):\n    return text == text[::-1]"
          },
          {
            kind: "debug", title: "Off the end", difficulty: 2,
            concepts: ["str-index"],
            prompt: L([
              "`last_char('hello')` should return `'o'` but raises an `IndexError`. Fix it."
            ]),
            starter: "def last_char(text):\n    return text[len(text)]\n\nprint(last_char('hello'))",
            hints: ["Positions run from 0 to `len(text) - 1`.", "`text[-1]` is the simplest fix."],
            tests: [
              { name: "hello gives o", call: "last_char('hello')", expect: "o" },
              { name: "works on one character", call: "last_char('z')", expect: "z" }
            ],
            solution: "def last_char(text):\n    return text[-1]\n\nprint(last_char('hello'))",
            takeaway: "`len(text)` is one past the last valid index. Off-by-one at the end of a sequence is the most common indexing bug there is."
          }
        ]
      },

      {
        id: "m07l2", title: "String methods", minutes: 11,
        concepts: ["str-methods", "str-immutable", "str-search"],
        content: L([
          "## Calling a method on a value",
          "",
          "~~~py",
          "name = '  Ada Lovelace  '",
          "print(name.strip())",
          "print(name.strip().upper())",
          "~~~",
          "~~~out",
          "Ada Lovelace",
          "ADA LOVELACE",
          "~~~",
          "",
          "A **method** is a function attached to a value: `value.method(args)`. Methods can be chained,",
          "left to right.",
          "",
          "## The ones worth knowing by heart",
          "",
          "| Method | Does | Example |",
          "|---|---|---|",
          "| `.upper()` `.lower()` | change case | `'Hi'.lower()` → `'hi'` |",
          "| `.strip()` | remove surrounding whitespace | `' hi '.strip()` → `'hi'` |",
          "| `.replace(a, b)` | swap every occurrence | `'a-b'.replace('-', ' ')` → `'a b'` |",
          "| `.split(sep)` | break into a list | `'a,b'.split(',')` → `['a', 'b']` |",
          "| `.startswith(s)` `.endswith(s)` | test the ends | `'file.txt'.endswith('.txt')` → `True` |",
          "| `.find(s)` | position, or `-1` if absent | `'hello'.find('ll')` → `2` |",
          "| `.count(s)` | how many times | `'banana'.count('a')` → `3` |",
          "| `.title()` `.capitalize()` | title case | `'ada l'.title()` → `'Ada L'` |",
          "| `.isdigit()` `.isalpha()` | what is in it | `'42'.isdigit()` → `True` |",
          "",
          "## Strings are immutable",
          "",
          "This is the trap that catches everybody once:",
          "",
          "~~~py",
          "name = 'ada'",
          "name.upper()",
          "print(name)      # still 'ada'!",
          "~~~",
          "",
          "String methods **never change the original**. They return a new string. You must capture it:",
          "",
          "~~~py",
          "name = name.upper()",
          "print(name)      # 'ADA'",
          "~~~",
          "",
          "And you cannot edit a character in place:",
          "",
          "~~~py",
          "name[0] = 'A'    # TypeError: 'str' object does not support item assignment",
          "~~~",
          "",
          ":::why Why immutable is good",
          "Because a string can never change under you, it is safe to pass around, use as a dictionary key,",
          "and share between parts of a program without defensive copying. You will meet the opposite — mutable",
          "lists — in the very next module, and the contrast is the point.",
          ":::",
          "",
          "## Searching safely",
          "",
          "~~~py",
          "text = 'error: disk full'",
          "",
          "if 'error' in text:            # simplest membership test",
          "    print('problem!')",
          "",
          "position = text.find('disk')   # 7, or -1 if not found",
          "~~~",
          "",
          "`.find()` returns `-1` when there is no match — it does not raise. `.index()` is the same but raises",
          "`ValueError`. Prefer `in` when you only need yes/no."
        ]),
        exercises: [
          {
            kind: "debug", title: "Nothing changed", difficulty: 2,
            concepts: ["str-immutable"],
            prompt: "This should print `HELLO   WORLD` cleaned up as `HELLO WORLD`, but prints the original untouched. Fix it.",
            starter: L([
              "text = '  hello   world  '",
              "text.strip()",
              "text.upper()",
              "text.replace('   ', ' ')",
              "print(text)"
            ]),
            hints: [
              "String methods return a new string — they never modify the original.",
              "Assign the result back: `text = text.strip()`.",
              "You can chain them all in one line."
            ],
            tests: [
              { name: "prints HELLO WORLD", out_exact: "HELLO WORLD" }
            ],
            solution: "text = '  hello   world  '\ntext = text.strip().upper().replace('   ', ' ')\nprint(text)",
            takeaway: "If a line calls a method and does nothing with the result, it is almost certainly a bug in Python."
          },
          {
            kind: "code", title: "Clean a username", difficulty: 2,
            concepts: ["str-methods"],
            prompt: L([
              "Write `clean_username(raw)` that:",
              "",
              "1. removes surrounding whitespace",
              "2. lowercases it",
              "3. replaces spaces with underscores",
              "",
              "`clean_username('  Ada Lovelace ')` → `'ada_lovelace'`"
            ]),
            starter: "def clean_username(raw):\n    ",
            hints: ["Chain `.strip()`, `.lower()` and `.replace(' ', '_')`.", "Order matters — strip first so leading spaces do not become underscores."],
            tests: [
              { name: "the example works", call: "clean_username('  Ada Lovelace ')", expect: "ada_lovelace" },
              { name: "already clean stays clean", call: "clean_username('grace')", expect: "grace" },
              { name: "multiple words", call: "clean_username(' Alan M Turing ')", expect: "alan_m_turing" }
            ],
            solution: "def clean_username(raw):\n    return raw.strip().lower().replace(' ', '_')"
          },
          {
            kind: "code", title: "Count a letter", difficulty: 2,
            concepts: ["str-iterate", "loop-patterns"],
            prompt: L([
              "Write `count_letter(text, letter)` returning how many times `letter` appears — **without** using",
              "`.count()`. Loop over the characters yourself.",
              "",
              "The comparison should ignore case: `count_letter('Banana', 'A')` → `3`."
            ]),
            starter: "def count_letter(text, letter):\n    ",
            forbids: [{ contains: ".count(", msg: "Write the loop yourself" }],
            hints: [
              "Lower-case both the text and the letter first.",
              "Counting pattern: start at 0, add 1 on each match, return at the end."
            ],
            tests: [
              { name: "banana has 3 a", call: "count_letter('Banana', 'A')", expect: 3 },
              { name: "no match gives 0", call: "count_letter('python', 'z')", expect: 0 },
              { name: "case is ignored both ways", call: "count_letter('AAA', 'a')", expect: 3 },
              { name: "empty text gives 0", call: "count_letter('', 'a')", expect: 0 }
            ],
            solution: L([
              "def count_letter(text, letter):",
              "    target = letter.lower()",
              "    count = 0",
              "    for char in text.lower():",
              "        if char == target:",
              "            count += 1",
              "    return count"
            ])
          },
          {
            kind: "code", title: "File type checker", difficulty: 3,
            concepts: ["str-methods", "str-search"],
            prompt: L([
              "Write `file_kind(filename)` returning:",
              "",
              "- `'image'` for `.png`, `.jpg` or `.gif`",
              "- `'document'` for `.txt`, `.pdf` or `.docx`",
              "- `'unknown'` for anything else",
              "",
              "The check must be case-insensitive, so `PHOTO.PNG` is an image."
            ]),
            starter: "def file_kind(filename):\n    ",
            hints: [
              "Lowercase the filename first.",
              "`.endswith()` accepts a tuple: `name.endswith(('.png', '.jpg', '.gif'))`.",
              "Return early from each branch."
            ],
            tests: [
              { name: "png is an image", call: "file_kind('photo.png')", expect: "image" },
              { name: "uppercase works", call: "file_kind('PHOTO.PNG')", expect: "image" },
              { name: "pdf is a document", call: "file_kind('report.pdf')", expect: "document" },
              { name: "docx is a document", call: "file_kind('Notes.DOCX')", expect: "document" },
              { name: "exe is unknown", call: "file_kind('setup.exe')", expect: "unknown" },
              { name: "no extension is unknown", call: "file_kind('README')", expect: "unknown" }
            ],
            solution: L([
              "def file_kind(filename):",
              "    name = filename.lower()",
              "    if name.endswith(('.png', '.jpg', '.gif')):",
              "        return 'image'",
              "    if name.endswith(('.txt', '.pdf', '.docx')):",
              "        return 'document'",
              "    return 'unknown'"
            ]),
            solutionNote: "`.endswith()` and `.startswith()` both accept a tuple of options — much tidier than three chained `or`s."
          }
        ]
      },

      {
        id: "m07l3", title: "Splitting and joining", minutes: 10,
        concepts: ["str-split-join", "str-methods"],
        content: L([
          "## split: text into pieces",
          "",
          "~~~py",
          "line = 'ada,lovelace,1815'",
          "parts = line.split(',')",
          "print(parts)",
          "~~~",
          "~~~out",
          "['ada', 'lovelace', '1815']",
          "~~~",
          "",
          "With no argument, `.split()` splits on any run of whitespace **and** discards empties — which is",
          "almost always what you want for words:",
          "",
          "~~~py",
          "print('the   quick  brown'.split())",
          "~~~",
          "~~~out",
          "['the', 'quick', 'brown']",
          "~~~",
          "",
          "Compare with `.split(' ')`, which splits on each single space and leaves empty strings behind:",
          "",
          "~~~py",
          "print('the   quick'.split(' '))",
          "~~~",
          "~~~out",
          "['the', '', '', 'quick']",
          "~~~",
          "",
          ":::tip Rule of thumb",
          "Splitting **words**? Use `.split()` with nothing. Splitting **structured data** on a known separator?",
          "Use `.split(',')` or whatever the separator is.",
          ":::",
          "",
          "## join: pieces back into text",
          "",
          "~~~py",
          "words = ['never', 'gonna', 'give']",
          "print(' '.join(words))",
          "print('-'.join(words))",
          "~~~",
          "~~~out",
          "never gonna give",
          "never-gonna-give",
          "~~~",
          "",
          "The separator goes first and calls `.join()`. It reads backwards at first — *glue dot join the pieces* —",
          "but you get used to it fast.",
          "",
          ":::trap join only works on strings",
          "`', '.join([1, 2, 3])` raises `TypeError`. Convert first:",
          "~~~py",
          "', '.join(str(n) for n in [1, 2, 3])   # '1, 2, 3'",
          "~~~",
          ":::",
          "",
          "## The split → process → join pipeline",
          "",
          "This shape solves an enormous number of text problems:",
          "",
          "~~~py",
          "sentence = 'the quick brown fox'",
          "",
          "words = sentence.split()          # split",
          "capitalised = []",
          "for word in words:",
          "    capitalised.append(word.capitalize())   # process",
          "print(' '.join(capitalised))      # join",
          "~~~",
          "~~~out",
          "The Quick Brown Fox",
          "~~~",
          "",
          "Learn to see text problems in those three stages and most of them stop being hard.",
          "",
          "## Multi-line text",
          "",
          "~~~py",
          "log = 'start\\nrunning\\ndone'",
          "for line in log.splitlines():",
          "    print(f'> {line}')",
          "~~~",
          "",
          "`\\n` inside a string is a newline character. `.splitlines()` breaks text into its lines — you will use",
          "it constantly once you start reading files."
          ]),
        exercises: [
          {
            kind: "code", title: "Word count", difficulty: 1,
            concepts: ["str-split-join"],
            prompt: L([
              "Write `word_count(sentence)` returning how many words it contains.",
              "",
              "Extra spaces must not count as words: `word_count('  a  b  ')` → `2`."
            ]),
            starter: "def word_count(sentence):\n    ",
            hints: ["`.split()` with no argument handles runs of whitespace.", "`len()` of the resulting list is the answer."],
            tests: [
              { name: "four words", call: "word_count('the quick brown fox')", expect: 4 },
              { name: "extra spaces ignored", call: "word_count('  a  b  ')", expect: 2 },
              { name: "empty is zero", call: "word_count('')", expect: 0 },
              { name: "one word", call: "word_count('hello')", expect: 1 }
            ],
            solution: "def word_count(sentence):\n    return len(sentence.split())"
          },
          {
            kind: "code", title: "Swap a CSV line", difficulty: 2,
            concepts: ["str-split-join"],
            prompt: L([
              "A line holds `last,first`. Write `swap_name(line)` returning `'first last'`.",
              "",
              "`swap_name('lovelace,ada')` → `'ada lovelace'`"
            ]),
            starter: "def swap_name(line):\n    ",
            hints: ["Split on the comma to get two parts.", "`parts[0]` is the surname, `parts[1]` the first name.", "Build the result with an f-string or `' '.join(...)`."],
            tests: [
              { name: "the example works", call: "swap_name('lovelace,ada')", expect: "ada lovelace" },
              { name: "another name", call: "swap_name('hopper,grace')", expect: "grace hopper" }
            ],
            solution: "def swap_name(line):\n    last, first = line.split(',')\n    return f'{first} {last}'",
            solutionNote: "`last, first = line.split(',')` is *unpacking* — assigning both parts at once. You will meet it properly in Tier 2."
          },
          {
            kind: "code", title: "Title case a headline", difficulty: 3,
            concepts: ["str-split-join", "str-methods"],
            prompt: L([
              "Write `headline(text)` that capitalises the first letter of every word and joins them with single",
              "spaces — collapsing any extra whitespace.",
              "",
              "`headline('  the   quick brown FOX ')` → `'The Quick Brown Fox'`",
              "",
              "The checks forbid `.title()` — do the split/process/join pipeline yourself."
            ]),
            starter: "def headline(text):\n    ",
            forbids: [{ contains: ".title()", msg: "Build it with split and join instead" }],
            hints: [
              "`.split()` gives you clean words with no empties.",
              "`word.capitalize()` uppercases the first letter and lowercases the rest.",
              "`' '.join(...)` puts it back together."
            ],
            tests: [
              { name: "messy input is cleaned", call: "headline('  the   quick brown FOX ')", expect: "The Quick Brown Fox" },
              { name: "already tidy", call: "headline('hello world')", expect: "Hello World" },
              { name: "single word", call: "headline('python')", expect: "Python" },
              { name: "empty stays empty", call: "headline('   ')", expect: "" }
            ],
            solution: L([
              "def headline(text):",
              "    words = []",
              "    for word in text.split():",
              "        words.append(word.capitalize())",
              "    return ' '.join(words)"
            ])
          },
          {
            kind: "code", title: "Parse a log line", difficulty: 4,
            concepts: ["str-split-join", "str-methods", "return-value"],
            prompt: L([
              "Log lines look like this:",
              "",
              "~~~text",
              "2024-03-11 ERROR disk full",
              "~~~",
              "",
              "Write `parse_log(line)` returning a formatted summary:",
              "",
              "~~~text",
              "[ERROR] disk full (2024-03-11)",
              "~~~",
              "",
              "The message is everything after the level, and may contain spaces."
            ]),
            starter: "def parse_log(line):\n    ",
            hints: [
              "`line.split()` gives `['2024-03-11', 'ERROR', 'disk', 'full']`.",
              "`parts[0]` is the date and `parts[1]` is the level.",
              "Rejoin the rest with `' '.join(parts[2:])` — slicing works on lists too."
            ],
            tests: [
              { name: "the example works", call: "parse_log('2024-03-11 ERROR disk full')", expect: "[ERROR] disk full (2024-03-11)" },
              { name: "single-word message", call: "parse_log('2024-01-01 INFO started')", expect: "[INFO] started (2024-01-01)" },
              { name: "long message", call: "parse_log('2024-06-02 WARN low memory on node 3')", expect: "[WARN] low memory on node 3 (2024-06-02)" }
            ],
            solution: L([
              "def parse_log(line):",
              "    parts = line.split()",
              "    date = parts[0]",
              "    level = parts[1]",
              "    message = ' '.join(parts[2:])",
              "    return f'[{level}] {message} ({date})'"
            ]),
            takeaway: "Splitting into a known number of leading fields and rejoining the rest is the standard way to parse log-style text. You will do this for real in Tier 3."
          }
        ]
      }
    ],

    checkpoint: {
      id: "m07cp", pass: 0.8,
      title: "Checkpoint: Strings I",
      items: [
        {
          kind: "predict", title: "Slice bounds", difficulty: 2, concepts: ["str-slice"],
          prompt: "What is printed?\n\n~~~py\nprint('abcdef'[1:4])\n~~~",
          choices: ["`bcd`", "`bcde`", "`abcd`", "`cd`"],
          answer: 0,
          explain: "Start at index 1 (`b`), stop **before** index 4 (`e`). That gives `bcd`."
        },
        {
          kind: "code", title: "Reverse the words", difficulty: 3, concepts: ["str-split-join"],
          prompt: "Write `reverse_words(sentence)` that reverses the *order* of the words, not the letters.\n\n`reverse_words('a b c')` → `'c b a'`",
          starter: "def reverse_words(sentence):\n    ",
          tests: [
            { name: "three words", call: "reverse_words('a b c')", expect: "c b a" },
            { name: "a sentence", call: "reverse_words('the quick brown fox')", expect: "fox brown quick the" },
            { name: "one word", call: "reverse_words('hello')", expect: "hello" }
          ]
        },
        {
          kind: "debug", title: "The lost result", difficulty: 2, concepts: ["str-immutable"],
          prompt: "`shout('hi')` should return `'HI'` but returns `'hi'`. Fix it.",
          starter: "def shout(text):\n    text.upper()\n    return text",
          tests: [
            { name: "returns HI", call: "shout('hi')", expect: "HI" },
            { name: "works on a sentence", call: "shout('be quiet')", expect: "BE QUIET" }
          ]
        },
        {
          kind: "code", title: "Domain from an email", difficulty: 3, concepts: ["str-split-join", "str-search"],
          prompt: "Write `domain(email)` returning the part after the `@`, lowercased. `domain('Ada@Example.COM')` → `'example.com'`. If there is no `@`, return `''`.",
          starter: "def domain(email):\n    ",
          tests: [
            { name: "normal email", call: "domain('Ada@Example.COM')", expect: "example.com" },
            { name: "already lowercase", call: "domain('a@b.org')", expect: "b.org" },
            { name: "no at sign gives empty", call: "domain('not-an-email')", expect: "" }
          ]
        },
        {
          kind: "quiz", title: "split with no argument", difficulty: 2, concepts: ["str-split-join"],
          prompt: "What does `'a  b'.split()` return? (two spaces between a and b)",
          choices: ["`['a', '', 'b']`", "`['a', 'b']`", "`['a  b']`", "`['a', ' ', 'b']`"],
          answer: 1,
          explain: "`.split()` with no argument treats any run of whitespace as one separator and drops empty pieces. `.split(' ')` would have given `['a', '', 'b']`."
        }
      ]
    }
  });
})();
