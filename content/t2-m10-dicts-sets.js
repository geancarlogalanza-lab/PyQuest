/* Tier 2 · Module 10 — Dictionaries & Sets */
(function () {
  const L = a => a.join("\n");

  PQ.defineModule({
    id: "m10", tier: 2, order: 10, icon: "🗺️",
    title: "Dictionaries & Sets",
    blurb: "Look things up by name instead of by position. The workhorse of real Python.",
    intro: L([
      "If you learn one data structure properly, make it the dictionary. Counting, grouping, caching,",
      "configuration, JSON, records — all dictionaries. Sets are the smaller companion that answers",
      "*have I seen this before?* instantly."
    ]),
    concepts: [
      { id: "dict-create", name: "creating dictionaries", importance: 1.6 },
      { id: "dict-access", name: "lookup and get()", importance: 1.6 },
      { id: "dict-mutate", name: "adding and removing keys", importance: 1.4 },
      { id: "dict-iterate", name: "iterating dictionaries", importance: 1.5 },
      { id: "dict-count", name: "counting with dictionaries", importance: 1.5 },
      { id: "dict-group", name: "grouping with dictionaries", importance: 1.4 },
      { id: "set-type", name: "sets", importance: 1.3 },
      { id: "set-ops", name: "set operations" },
      { id: "hashable", name: "hashability" }
    ],

    lessons: [
      {
        id: "m10l1", title: "Key to value", minutes: 12,
        concepts: ["dict-create", "dict-access", "dict-mutate"],
        content: L([
          "## A dictionary maps keys to values",
          "",
          "~~~py",
          "person = {",
          "    'name': 'ada',",
          "    'age': 36,",
          "    'city': 'london',",
          "}",
          "",
          "print(person['name'])",
          "print(len(person))",
          "~~~",
          "~~~out",
          "ada",
          "3",
          "~~~",
          "",
          "Compare with the list version from last module:",
          "",
          "~~~py",
          "person = ['ada', 36, 'london']",
          "print(person[0])          # what is 0 again?",
          "print(person['name'])     # much better",
          "~~~",
          "",
          "Position tells you nothing; a key tells you everything. **For records, use a dictionary.**",
          "",
          "## Adding, changing, removing",
          "",
          "~~~py",
          "person['email'] = 'ada@example.com'   # add",
          "person['age'] = 37                     # change (same syntax)",
          "del person['city']                     # remove",
          "value = person.pop('email')            # remove and return",
          "~~~",
          "",
          "Assignment adds when the key is new and overwrites when it exists. There is no separate *insert*.",
          "",
          "## The missing key problem",
          "",
          "~~~py",
          "print(person['phone'])    # KeyError: 'phone'",
          "~~~",
          "",
          "Three ways to handle it, in increasing order of usefulness:",
          "",
          "~~~py",
          "if 'phone' in person:              # 1. test first",
          "    print(person['phone'])",
          "",
          "print(person.get('phone'))          # 2. None if missing",
          "print(person.get('phone', 'n/a'))   # 3. your own default",
          "~~~",
          "",
          ":::tip .get() with a default is the workhorse",
          "`counts.get(word, 0) + 1` is how you count things without special-casing the first occurrence.",
          "You will write that exact line many times.",
          ":::",
          "",
          "## What can be a key",
          "",
          "Keys must be **hashable**, which in practice means immutable:",
          "",
          "~~~py",
          "ok = {'text': 1, 42: 2, (0, 0): 3, True: 4}",
          "bad = {[1, 2]: 'nope'}    # TypeError: unhashable type: 'list'",
          "~~~",
          "",
          "Strings and tuples are the two you will use. A tuple key is how you index a grid by coordinate:",
          "`board[(2, 3)] = 'X'`.",
          "",
          "Values can be anything at all — lists, other dictionaries, functions.",
          "",
          "## Nested dictionaries",
          "",
          "~~~py",
          "users = {",
          "    'ada': {'age': 36, 'tags': ['maths', 'engines']},",
          "    'grace': {'age': 45, 'tags': ['compilers']},",
          "}",
          "",
          "print(users['ada']['age'])",
          "print(users['grace']['tags'][0])",
          "~~~",
          "",
          "This is exactly the shape of JSON, which is why dictionaries dominate any code that touches an API."
        ]),
        exercises: [
          {
            kind: "code", title: "Build a record", difficulty: 1,
            concepts: ["dict-create", "dict-access"],
            prompt: L([
              "Write `make_user(name, age)` returning a dictionary with keys `name`, `age` and `active`,",
              "where `active` starts as `True`."
            ]),
            starter: "def make_user(name, age):\n    ",
            hints: ["Return a dictionary literal using the parameters as values."],
            tests: [
              { name: "builds the record", call: "make_user('ada', 36)", expect: { name: "ada", age: 36, active: true } },
              { name: "another user", call: "make_user('bo', 1)['age']", expect: 1 },
              { name: "active defaults to True", code: "assert make_user('x', 0)['active'] is True" }
            ],
            solution: "def make_user(name, age):\n    return {'name': name, 'age': age, 'active': True}"
          },
          {
            kind: "code", title: "Safe lookup", difficulty: 2,
            concepts: ["dict-access"],
            prompt: L([
              "Write `describe(person)` returning `'<name> from <city>'`.",
              "",
              "If there is no `city` key, use `unknown`. If there is no `name` key, use `anonymous`.",
              "The function must never raise a `KeyError`."
            ]),
            starter: "def describe(person):\n    ",
            forbids: [{ re: "\\bexcept\\b", msg: "Use .get() rather than catching the error" }],
            hints: ["`person.get('city', 'unknown')` gives a fallback.", "Do the same for the name."],
            tests: [
              { name: "full record", call: "describe({'name': 'ada', 'city': 'london'})", expect: "ada from london" },
              { name: "missing city", call: "describe({'name': 'ada'})", expect: "ada from unknown" },
              { name: "empty dictionary", call: "describe({})", expect: "anonymous from unknown" }
            ],
            solution: "def describe(person):\n    name = person.get('name', 'anonymous')\n    city = person.get('city', 'unknown')\n    return f'{name} from {city}'"
          },
          {
            kind: "debug", title: "KeyError in production", difficulty: 2,
            concepts: ["dict-access"],
            prompt: L([
              "This crashes when a setting is missing. Make it return the default `10` for any absent key,",
              "without using `try`."
            ]),
            starter: L([
              "settings = {'width': 80}",
              "",
              "def setting(name):",
              "    return settings[name]",
              "",
              "print(setting('width'))",
              "print(setting('height'))"
            ]),
            forbids: [{ re: "\\btry\\b", msg: "Use .get() with a default" }],
            hints: ["`settings.get(name, 10)`"],
            tests: [
              { name: "existing key", call: "setting('width')", expect: 80 },
              { name: "missing key gives 10", call: "setting('height')", expect: 10 },
              { name: "prints both", out_lines: ["80", "10"] }
            ],
            solution: "settings = {'width': 80}\n\ndef setting(name):\n    return settings.get(name, 10)\n\nprint(setting('width'))\nprint(setting('height'))"
          },
          {
            kind: "code", title: "Merge two settings dicts", difficulty: 3,
            concepts: ["dict-mutate", "dict-iterate"],
            prompt: L([
              "Write `merge(defaults, overrides)` returning a **new** dictionary where `overrides` wins on any",
              "shared key. Neither input may be modified.",
              "",
              "`merge({'a': 1, 'b': 2}, {'b': 9})` → `{'a': 1, 'b': 9}`"
            ]),
            starter: "def merge(defaults, overrides):\n    ",
            hints: [
              "Start with `result = defaults.copy()`.",
              "Then loop over `overrides.items()` and assign each key into `result`.",
              "Return `result`."
            ],
            tests: [
              { name: "overrides win", call: "merge({'a': 1, 'b': 2}, {'b': 9})", expect: { a: 1, b: 9 } },
              { name: "new keys are added", call: "merge({'a': 1}, {'c': 3})", expect: { a: 1, c: 3 } },
              { name: "inputs untouched", code: "d = {'a': 1}\no = {'a': 2}\nmerge(d, o)\nassert d == {'a': 1} and o == {'a': 2}, 'neither input may change'" },
              { name: "empty overrides", call: "merge({'a': 1}, {})", expect: { a: 1 } }
            ],
            solution: L([
              "def merge(defaults, overrides):",
              "    result = defaults.copy()",
              "    for key, value in overrides.items():",
              "        result[key] = value",
              "    return result"
            ]),
            solutionNote: "Modern Python can write this as `{**defaults, **overrides}` or `defaults | overrides`. Knowing the loop version is what makes those readable."
          }
        ]
      },

      {
        id: "m10l2", title: "Counting and grouping", minutes: 12,
        concepts: ["dict-iterate", "dict-count", "dict-group"],
        content: L([
          "## Three ways to iterate",
          "",
          "~~~py",
          "scores = {'ada': 90, 'grace': 95}",
          "",
          "for key in scores:                 # keys",
          "    print(key)",
          "",
          "for value in scores.values():      # values",
          "    print(value)",
          "",
          "for key, value in scores.items():  # both -- the one you want most often",
          "    print(f'{key}: {value}')",
          "~~~",
          "",
          "Looping over a dictionary directly gives you **keys**. `.items()` gives you `(key, value)` tuples,",
          "which you unpack — exactly like Module 9.",
          "",
          "Since Python 3.7, dictionaries keep **insertion order**. What you put in first comes out first.",
          "",
          "## The counting pattern",
          "",
          "~~~py",
          "words = ['a', 'b', 'a', 'c', 'a']",
          "",
          "counts = {}",
          "for word in words:",
          "    counts[word] = counts.get(word, 0) + 1",
          "",
          "print(counts)",
          "~~~",
          "~~~out",
          "{'a': 3, 'b': 1, 'c': 1}",
          "~~~",
          "",
          "One line does all the work. `counts.get(word, 0)` gives the current count, or `0` if this is the first",
          "time — so there is no special case for a new key.",
          "",
          "The standard library has `collections.Counter` which does this for you:",
          "",
          "~~~py",
          "from collections import Counter",
          "print(Counter(['a', 'b', 'a']))          # Counter({'a': 2, 'b': 1})",
          "print(Counter('mississippi').most_common(2))",
          "~~~",
          "~~~out",
          "Counter({'a': 2, 'b': 1})",
          "[('i', 4), ('s', 4)]",
          "~~~",
          "",
          "Use `Counter` in real code. Write the loop by hand at least a few times first, so you know what it does.",
          "",
          "## The grouping pattern",
          "",
          "~~~py",
          "people = [('eng', 'ada'), ('sales', 'bo'), ('eng', 'cy')]",
          "",
          "groups = {}",
          "for dept, name in people:",
          "    if dept not in groups:",
          "        groups[dept] = []",
          "    groups[dept].append(name)",
          "",
          "print(groups)",
          "~~~",
          "~~~out",
          "{'eng': ['ada', 'cy'], 'sales': ['bo']}",
          "~~~",
          "",
          "*If the bucket does not exist yet, create an empty one; then append.* `setdefault` shortens it:",
          "",
          "~~~py",
          "groups.setdefault(dept, []).append(name)",
          "~~~",
          "",
          "and `collections.defaultdict(list)` removes the check entirely.",
          "",
          ":::why Counting and grouping are most of data work",
          "\"How many of each?\" and \"which ones belong together?\" are the two questions behind an enormous",
          "fraction of reporting, analytics and log analysis. Both are five lines with a dictionary.",
          ":::",
          "",
          "## Sorting a dictionary by value",
          "",
          "~~~py",
          "counts = {'a': 3, 'b': 1, 'c': 2}",
          "",
          "def by_count(pair):",
          "    return pair[1]",
          "",
          "for word, n in sorted(counts.items(), key=by_count, reverse=True):",
          "    print(word, n)",
          "~~~",
          "~~~out",
          "a 3",
          "c 2",
          "b 1",
          "~~~",
          "",
          "`.items()` gives tuples, and you already know how to sort tuples by a key. Nothing new — just combining."
        ]),
        exercises: [
          {
            kind: "code", title: "Count the letters", difficulty: 2,
            concepts: ["dict-count"],
            prompt: L([
              "Write `letter_counts(text)` returning a dictionary of how many times each character appears.",
              "",
              "`letter_counts('aba')` → `{'a': 2, 'b': 1}`",
              "",
              "The checks forbid `Counter` — write the loop."
            ]),
            starter: "def letter_counts(text):\n    ",
            forbids: [{ contains: "Counter", msg: "Write the counting loop yourself" }],
            hints: ["Start with an empty dictionary.", "`counts[char] = counts.get(char, 0) + 1`"],
            tests: [
              { name: "counts correctly", call: "letter_counts('aba')", expect: { a: 2, b: 1 } },
              { name: "empty text", call: "letter_counts('')", expect: {} },
              { name: "spaces count too", call: "letter_counts('a a')", expect: { a: 2, " ": 1 } },
              { name: "longer word", call: "letter_counts('mississippi')['s']", expect: 4 }
            ],
            solution: L([
              "def letter_counts(text):",
              "    counts = {}",
              "    for char in text:",
              "        counts[char] = counts.get(char, 0) + 1",
              "    return counts"
            ])
          },
          {
            kind: "code", title: "Most common word", difficulty: 3,
            concepts: ["dict-count", "sort-key"],
            prompt: L([
              "Write `most_common(sentence)` returning the word that appears most often.",
              "On a tie, return whichever appeared **first** in the sentence.",
              "An empty sentence returns `None`.",
              "",
              "Words are separated by whitespace and compared case-insensitively."
            ]),
            starter: "def most_common(sentence):\n    ",
            hints: [
              "Lowercase and split first.",
              "Count into a dictionary, then walk `.items()` keeping the best so far.",
              "Because dictionaries keep insertion order, a strict `>` comparison keeps the first winner on a tie."
            ],
            tests: [
              { name: "finds the winner", call: "most_common('the cat the dog the')", expect: "the" },
              { name: "case-insensitive", call: "most_common('Cat cat DOG')", expect: "cat" },
              { name: "first wins a tie", call: "most_common('b b a a')", expect: "b" },
              { name: "empty gives None", code: "assert most_common('') is None" },
              { name: "single word", call: "most_common('solo')", expect: "solo" }
            ],
            solution: L([
              "def most_common(sentence):",
              "    counts = {}",
              "    for word in sentence.lower().split():",
              "        counts[word] = counts.get(word, 0) + 1",
              "",
              "    best = None",
              "    best_count = 0",
              "    for word, count in counts.items():",
              "        if count > best_count:",
              "            best = word",
              "            best_count = count",
              "    return best"
            ]),
            takeaway: "Count into a dictionary, then scan it. Two simple loops beat one clever line you cannot debug."
          },
          {
            kind: "code", title: "Group by first letter", difficulty: 3,
            concepts: ["dict-group"],
            prompt: L([
              "Write `group_by_letter(words)` returning a dictionary mapping each first letter to the list of words",
              "starting with it, in their original order.",
              "",
              "`group_by_letter(['ant', 'bee', 'ape'])` → `{'a': ['ant', 'ape'], 'b': ['bee']}`"
            ]),
            starter: "def group_by_letter(words):\n    ",
            hints: [
              "`word[0]` is the key.",
              "If the key is not in the dictionary yet, set it to an empty list first.",
              "`groups.setdefault(key, []).append(word)` does both in one line."
            ],
            tests: [
              { name: "groups correctly", call: "group_by_letter(['ant', 'bee', 'ape'])", expect: { a: ["ant", "ape"], b: ["bee"] } },
              { name: "single group", call: "group_by_letter(['a', 'at'])", expect: { a: ["a", "at"] } },
              { name: "empty input", call: "group_by_letter([])", expect: {} }
            ],
            solution: L([
              "def group_by_letter(words):",
              "    groups = {}",
              "    for word in words:",
              "        groups.setdefault(word[0], []).append(word)",
              "    return groups"
            ])
          },
          {
            kind: "debug", title: "Overwritten instead of grouped", difficulty: 3,
            concepts: ["dict-group"],
            prompt: L([
              "This should collect all names per department but keeps only the last one.",
              "Fix it so each department maps to a **list** of names."
            ]),
            starter: L([
              "people = [('eng', 'ada'), ('sales', 'bo'), ('eng', 'cy')]",
              "",
              "groups = {}",
              "for dept, name in people:",
              "    groups[dept] = name",
              "",
              "print(groups)"
            ]),
            hints: [
              "`groups[dept] = name` replaces whatever was there.",
              "You need to append to a list instead — create it first if the key is new."
            ],
            tests: [
              { name: "both engineers are kept", call: "groups", expect: { eng: ["ada", "cy"], sales: ["bo"] } }
            ],
            solution: L([
              "people = [('eng', 'ada'), ('sales', 'bo'), ('eng', 'cy')]",
              "",
              "groups = {}",
              "for dept, name in people:",
              "    groups.setdefault(dept, []).append(name)",
              "",
              "print(groups)"
            ]),
            takeaway: "Silently losing all but the last value is a classic grouping bug — and it looks like it works until the data has duplicates."
          }
        ]
      },

      {
        id: "m10l3", title: "Sets", minutes: 10,
        concepts: ["set-type", "set-ops", "hashable"],
        content: L([
          "## A set holds unique things, unordered",
          "",
          "~~~py",
          "tags = {'python', 'web', 'python'}",
          "print(tags)          # {'python', 'web'}  -- duplicate gone",
          "print(len(tags))     # 2",
          "~~~",
          "",
          "Duplicates simply cannot exist in a set. Adding something already present does nothing.",
          "",
          ":::warn The empty set",
          "`{}` is an empty **dictionary**, not an empty set. Use `set()` for an empty set.",
          ":::",
          "",
          "## The two things sets are for",
          "",
          "### 1. Removing duplicates",
          "",
          "~~~py",
          "names = ['ada', 'bo', 'ada', 'cy']",
          "unique = list(set(names))",
          "print(len(unique))     # 3",
          "~~~",
          "",
          "Note the order is not preserved. If you need order **and** uniqueness, use a dictionary:",
          "`list(dict.fromkeys(names))`.",
          "",
          "### 2. Fast membership testing",
          "",
          "~~~py",
          "banned = {'spam', 'junk', 'ads'}",
          "if word in banned:",
          "    print('blocked')",
          "~~~",
          "",
          "`in` on a set is effectively instant no matter how big the set is. `in` on a list has to scan every",
          "item. For 10 items it makes no difference; for 100,000 it is the difference between fast and unusable.",
          "",
          "## Set operations",
          "",
          "~~~py",
          "a = {1, 2, 3}",
          "b = {3, 4}",
          "",
          "print(a | b)    # {1, 2, 3, 4}   union: in either",
          "print(a & b)    # {3}            intersection: in both",
          "print(a - b)    # {1, 2}         difference: in a but not b",
          "print(a ^ b)    # {1, 2, 4}      symmetric difference: in exactly one",
          "~~~",
          "",
          "These replace whole loops:",
          "",
          "~~~py",
          "# who is in both lists?",
          "shared = set(list_a) & set(list_b)",
          "",
          "# what is new since yesterday?",
          "added = set(today) - set(yesterday)",
          "~~~",
          "",
          "## Methods",
          "",
          "~~~py",
          "seen = set()",
          "seen.add('a')          # add one",
          "seen.discard('z')      # remove if present, no error if not",
          "seen.remove('a')       # remove, KeyError if not present",
          "~~~",
          "",
          "## The rule for choosing",
          "",
          "| Question | Structure |",
          "|---|---|",
          "| Ordered sequence, duplicates fine | `list` |",
          "| Fixed-size record by position | `tuple` |",
          "| Look up a value by a name | `dict` |",
          "| Membership and uniqueness only | `set` |",
          "",
          "Choosing the right one is often the whole difference between a hard problem and an easy one."
        ]),
        exercises: [
          {
            kind: "code", title: "Unique in order", difficulty: 2,
            concepts: ["set-type"],
            prompt: L([
              "Write `unique(items)` returning a list with duplicates removed, **keeping the original order**.",
              "",
              "`unique([3, 1, 3, 2, 1])` → `[3, 1, 2]`",
              "",
              "Use a set to remember what you have seen."
            ]),
            starter: "def unique(items):\n    ",
            hints: [
              "Keep a `seen = set()` and a `result = []`.",
              "For each item: if it is not in `seen`, append it and add it to `seen`."
            ],
            tests: [
              { name: "keeps first occurrence order", call: "unique([3, 1, 3, 2, 1])", expect: [3, 1, 2] },
              { name: "no duplicates", call: "unique(['a', 'b'])", expect: ["a", "b"] },
              { name: "all the same", call: "unique([1, 1, 1])", expect: [1] },
              { name: "empty", call: "unique([])", expect: [] }
            ],
            solution: L([
              "def unique(items):",
              "    seen = set()",
              "    result = []",
              "    for item in items:",
              "        if item not in seen:",
              "            seen.add(item)",
              "            result.append(item)",
              "    return result"
            ]),
            takeaway: "The seen-set pattern gives you uniqueness *and* order, and stays fast on huge inputs. `if item not in result` would also work but gets slow quadratically."
          },
          {
            kind: "code", title: "What changed", difficulty: 2,
            concepts: ["set-ops"],
            prompt: L([
              "Write `changes(before, after)` returning a tuple `(added, removed)` where each is a **sorted list**.",
              "",
              "`changes(['a', 'b'], ['b', 'c'])` → `(['c'], ['a'])`"
            ]),
            starter: "def changes(before, after):\n    ",
            hints: ["`set(after) - set(before)` is what was added.", "`sorted(...)` turns a set into an ordered list."],
            tests: [
              { name: "detects both", call: "changes(['a', 'b'], ['b', 'c'])", expect: [["c"], ["a"]] },
              { name: "nothing changed", call: "changes(['a'], ['a'])", expect: [[], []] },
              { name: "everything new", call: "changes([], ['x', 'y'])", expect: [["x", "y"], []] },
              { name: "results are sorted", call: "changes([], ['b', 'a'])[0]", expect: ["a", "b"] }
            ],
            solution: L([
              "def changes(before, after):",
              "    added = sorted(set(after) - set(before))",
              "    removed = sorted(set(before) - set(after))",
              "    return added, removed"
            ])
          },
          {
            kind: "predict", title: "Empty braces", difficulty: 2,
            concepts: ["set-type"],
            prompt: "What does this print?\n\n~~~py\nx = {}\nprint(type(x).__name__)\n~~~",
            choices: ["`set`", "`dict`", "`list`", "`tuple`"],
            answer: 1,
            explain: "`{}` is an empty dictionary — dictionaries claimed the braces first. An empty set must be written `set()`."
          },
          {
            kind: "code", title: "Common interests", difficulty: 3,
            concepts: ["set-ops", "dict-access"],
            prompt: L([
              "`people` maps names to a list of hobbies. Write `shared_hobbies(people, a, b)` returning a sorted",
              "list of hobbies both named people have.",
              "",
              "If either name is missing, return an empty list."
            ]),
            starter: "def shared_hobbies(people, a, b):\n    ",
            hints: [
              "`people.get(a)` returns `None` for a missing name — guard for that.",
              "Turn both lists into sets and use `&`.",
              "`sorted()` the result."
            ],
            tests: [
              {
                name: "finds the overlap",
                call: "shared_hobbies({'ada': ['chess', 'maths'], 'bo': ['maths', 'running']}, 'ada', 'bo')",
                expect: ["maths"]
              },
              {
                name: "no overlap",
                call: "shared_hobbies({'a': ['x'], 'b': ['y']}, 'a', 'b')",
                expect: []
              },
              {
                name: "missing person",
                call: "shared_hobbies({'a': ['x']}, 'a', 'nobody')",
                expect: []
              },
              {
                name: "result is sorted",
                call: "shared_hobbies({'a': ['z', 'y'], 'b': ['y', 'z']}, 'a', 'b')",
                expect: ["y", "z"]
              }
            ],
            solution: L([
              "def shared_hobbies(people, a, b):",
              "    first = people.get(a)",
              "    second = people.get(b)",
              "    if first is None or second is None:",
              "        return []",
              "    return sorted(set(first) & set(second))"
            ])
          }
        ]
      }
    ],

    checkpoint: {
      id: "m10cp", pass: 0.8,
      title: "Checkpoint: Dictionaries & Sets",
      items: [
        {
          kind: "code", title: "Invert a dictionary", difficulty: 3, concepts: ["dict-iterate"],
          prompt: "Write `invert(d)` swapping keys and values. `invert({'a': 1, 'b': 2})` → `{1: 'a', 2: 'b'}`. Assume values are unique and hashable.",
          starter: "def invert(d):\n    ",
          tests: [
            { name: "inverts", call: "invert({'a': 1, 'b': 2})", expect: { 1: "a", 2: "b" } },
            { name: "empty", call: "invert({})", expect: {} }
          ]
        },
        {
          kind: "code", title: "Tally", difficulty: 3, concepts: ["dict-count"],
          prompt: "Write `tally(items)` returning a dictionary of counts. `tally(['a','b','a'])` → `{'a': 2, 'b': 1}`.",
          starter: "def tally(items):\n    ",
          tests: [
            { name: "counts", call: "tally(['a', 'b', 'a'])", expect: { a: 2, b: 1 } },
            { name: "empty", call: "tally([])", expect: {} },
            { name: "numbers work as keys", call: "tally([1, 1, 2])", expect: { 1: 2, 2: 1 } }
          ]
        },
        {
          kind: "quiz", title: "Missing key", difficulty: 2, concepts: ["dict-access"],
          prompt: "What does `{'a': 1}.get('b', 0)` return?",
          choices: ["`KeyError`", "`None`", "`0`", "`1`"],
          answer: 2,
          explain: "`.get()` returns the second argument when the key is absent — no exception. Without the default it would return `None`."
        },
        {
          kind: "code", title: "Deduplicate keeping order", difficulty: 3, concepts: ["set-type"],
          prompt: "Write `dedupe(items)` removing duplicates while preserving first-seen order.",
          starter: "def dedupe(items):\n    ",
          tests: [
            { name: "keeps order", call: "dedupe([2, 1, 2, 3, 1])", expect: [2, 1, 3] },
            { name: "empty", call: "dedupe([])", expect: [] }
          ]
        },
        {
          kind: "quiz", title: "Which structure", difficulty: 3, concepts: ["set-type", "dict-create"],
          prompt: "You need to check, millions of times, whether a username is already taken. What should hold the usernames?",
          choices: ["A list", "A set", "A tuple", "A nested list"],
          answer: 1,
          explain: "Membership testing on a set is effectively constant time; on a list it scans every element. With millions of checks that is the difference between instant and unusable."
        }
      ]
    }
  });
})();
