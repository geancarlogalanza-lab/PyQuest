/* Tier 4 · Module 25 — Type Hints & Contracts */
(function () {
  const L = a => a.join("\n");

  PQ.defineModule({
    id: "m25", tier: 4, order: 25, icon: "🏷️",
    title: "Typing & Contracts",
    blurb: "Say what your functions accept and return — and catch a whole class of bugs before running anything.",
    intro: L([
      "Tier 4 is about working the way professionals work on code that other people depend on.",
      "",
      "Type hints are the cheapest quality tool in Python. They cost a few characters, they are checked by",
      "your editor as you type, and they turn a class of runtime crashes into red squiggles."
    ]),
    concepts: [
      { id: "annotations", name: "type annotations", importance: 1.5 },
      { id: "typing-basics", name: "typing basics", importance: 1.4 },
      { id: "optional-union", name: "Optional and unions", importance: 1.5 },
      { id: "generic-types", name: "generic collections", importance: 1.3 },
      { id: "typed-dataclass", name: "typed dataclasses", importance: 1.2 },
      { id: "protocols", name: "protocols", importance: 1.2 },
      { id: "static-checking", name: "static checking", importance: 1.3 },
      { id: "contracts", name: "design by contract", importance: 1.3 }
    ],

    lessons: [
      {
        id: "m25l1", title: "Annotating functions", minutes: 12,
        concepts: ["annotations", "typing-basics", "generic-types"],
        content: L([
          "## The syntax",
          "",
          "~~~py",
          "def greet(name: str, times: int = 1) -> str:",
          "    return f'hello {name} ' * times",
          "~~~",
          "",
          "`name: str` annotates a parameter, `-> str` annotates the return. Variables can be annotated too:",
          "",
          "~~~py",
          "count: int = 0",
          "names: list[str] = []",
          "~~~",
          "",
          ":::warn Python does not enforce them",
          "~~~py",
          "greet(42)      # runs, and produces nonsense",
          "~~~",
          "Annotations are **documentation that tools can read**. Nothing checks them at runtime. The value",
          "comes from your editor, from `mypy`, and from the next person who reads the signature.",
          ":::",
          "",
          "## Collections",
          "",
          "Since Python 3.9 the built-in types are subscriptable:",
          "",
          "~~~py",
          "def totals(rows: list[dict[str, int]]) -> dict[str, int]:",
          "    ...",
          "",
          "names: list[str]",
          "scores: dict[str, float]",
          "point: tuple[float, float]           # exactly two floats",
          "row: tuple[str, ...]                  # any number of strings",
          "tags: set[str]",
          "~~~",
          "",
          "Be specific about the contents. `list` alone tells the reader nothing; `list[dict[str, int]]`",
          "tells them exactly what to expect.",
          "",
          "## Callables and Any",
          "",
          "~~~py",
          "from typing import Callable, Any",
          "",
          "def apply(func: Callable[[int], str], value: int) -> str:",
          "    return func(value)",
          "",
          "def dump(data: Any) -> None:          # Any means 'I really do not know'",
          "    print(data)",
          "~~~",
          "",
          "`Callable[[int], str]` reads as *takes an int, returns a str*. `-> None` is how you annotate a",
          "function that returns nothing.",
          "",
          "`Any` disables checking for that value. Each `Any` is a hole in your type coverage — sometimes",
          "necessary, never free.",
          "",
          "## What good annotations look like",
          "",
          "~~~py",
          "def load_scores(path: str) -> dict[str, list[int]]:",
          "    ...",
          "~~~",
          "",
          "You now know, without reading the body: it takes a path, and gives back names mapped to lists of",
          "whole numbers. That signature is worth more than a paragraph of docstring.",
          "",
          ":::tip Where to start on an existing codebase",
          "Annotate **public function signatures** first — parameters and returns. Skip local variables; the",
          "checker infers those. Signatures are where the misunderstandings happen.",
          ":::",
          "",
          "## Reading them back",
          "",
          "~~~py",
          "def add(a: int, b: int) -> int:",
          "    return a + b",
          "",
          "print(add.__annotations__)",
          "~~~",
          "~~~out",
          "{'a': <class 'int'>, 'b': <class 'int'>, 'return': <class 'int'>}",
          "~~~",
          "",
          "Libraries use this: `dataclasses` builds `__init__` from annotations, and `pydantic` and `FastAPI`",
          "use them to validate and document real API traffic."
        ]),
        exercises: [
          {
            kind: "code", title: "Annotate the signatures", difficulty: 2,
            concepts: ["annotations", "generic-types"],
            prompt: L([
              "Add complete type annotations to these three functions. Behaviour must not change.",
              "",
              "- `word_count` takes a string and returns an int",
              "- `unique_words` takes a string and returns a list of strings",
              "- `frequencies` takes a list of strings and returns a dict mapping string to int"
            ]),
            starter: L([
              "def word_count(text):",
              "    return len(text.split())",
              "",
              "",
              "def unique_words(text):",
              "    return sorted(set(text.split()))",
              "",
              "",
              "def frequencies(words):",
              "    counts = {}",
              "    for word in words:",
              "        counts[word] = counts.get(word, 0) + 1",
              "    return counts"
            ]),
            hints: [
              "`def word_count(text: str) -> int:`",
              "`-> list[str]` for a list of strings.",
              "`words: list[str]` and `-> dict[str, int]`."
            ],
            tests: [
              { name: "still works", call: "word_count('a b c')", expect: 3 },
              { name: "unique words", call: "unique_words('b a b')", expect: ["a", "b"] },
              { name: "frequencies", call: "frequencies(['a', 'b', 'a'])", expect: { a: 2, b: 1 } },
              {
                name: "word_count is annotated",
                code: "a = word_count.__annotations__\nassert a.get('text') is str and a.get('return') is int, a"
              },
              {
                name: "unique_words returns list[str]",
                code: "a = unique_words.__annotations__\nassert str(a.get('return')) == 'list[str]', a"
              },
              {
                name: "frequencies is fully annotated",
                code: "a = frequencies.__annotations__\nassert str(a.get('words')) == 'list[str]', a\nassert str(a.get('return')) == 'dict[str, int]', a"
              }
            ],
            solution: L([
              "def word_count(text: str) -> int:",
              "    return len(text.split())",
              "",
              "",
              "def unique_words(text: str) -> list[str]:",
              "    return sorted(set(text.split()))",
              "",
              "",
              "def frequencies(words: list[str]) -> dict[str, int]:",
              "    counts: dict[str, int] = {}",
              "    for word in words:",
              "        counts[word] = counts.get(word, 0) + 1",
              "    return counts"
            ])
          },
          {
            kind: "quiz", title: "What annotations do", difficulty: 2,
            concepts: ["annotations"],
            prompt: "What happens at runtime when you call `greet(42)` on `def greet(name: str) -> str:`?",
            choices: [
              "A TypeError is raised immediately",
              "Nothing special — Python ignores annotations and runs the function",
              "The value is converted to a string",
              "A warning is printed"
            ],
            answer: 1,
            explain: "Annotations are metadata. Python stores them on the function and never checks them. The benefit comes from static checkers and editors, which read them *before* the code runs."
          },
          {
            kind: "code", title: "Callable parameters", difficulty: 3,
            concepts: ["typing-basics"],
            prompt: L([
              "Annotate `apply_all(func, items)`, which applies a function taking an `int` and returning a `str`",
              "to every item in a list of ints, returning a list of strings.",
              "",
              "Use `Callable` from `typing`."
            ]),
            starter: "from typing import Callable\n\n\ndef apply_all(func, items):\n    return [func(item) for item in items]",
            requires: [{ contains: "Callable", msg: "Use Callable in the annotation" }],
            hints: ["`func: Callable[[int], str]`", "`items: list[int]` and `-> list[str]`."],
            tests: [
              { name: "still works", call: "apply_all(str, [1, 2])", expect: ["1", "2"] },
              {
                name: "func is annotated as a Callable",
                code: "a = apply_all.__annotations__\nassert 'Callable' in str(a.get('func')), a"
              },
              {
                name: "items and return are annotated",
                code: "a = apply_all.__annotations__\nassert str(a.get('items')) == 'list[int]', a\nassert str(a.get('return')) == 'list[str]', a"
              }
            ],
            solution: L([
              "from typing import Callable",
              "",
              "",
              "def apply_all(func: Callable[[int], str], items: list[int]) -> list[str]:",
              "    return [func(item) for item in items]"
            ])
          },
          {
            kind: "quiz", title: "Any", difficulty: 3,
            concepts: ["typing-basics"],
            prompt: "What is the practical downside of annotating a parameter as `Any`?",
            choices: [
              "It makes the function slower",
              "It switches off type checking for that value, so mistakes involving it are not caught",
              "It prevents the function from being called",
              "It forces a runtime conversion"
            ],
            answer: 1,
            explain: "`Any` is compatible with everything in both directions, so the checker stops reasoning about that value. It is sometimes unavoidable, but every `Any` is a gap in your safety net."
          }
        ]
      },

      {
        id: "m25l2", title: "Optional, unions and dataclasses", minutes: 12,
        concepts: ["optional-union", "typed-dataclass", "static-checking"],
        content: L([
          "## The billion-dollar mistake",
          "",
          "~~~py",
          "def find_user(user_id: int) -> dict:      # a lie: it can return None",
          "    ...",
          "",
          "user = find_user(7)",
          "print(user['name'])                        # crashes when nothing was found",
          "~~~",
          "",
          "Be honest instead:",
          "",
          "~~~py",
          "def find_user(user_id: int) -> dict | None:",
          "    ...",
          "~~~",
          "",
          "Now a type checker **refuses** to let you write `user['name']` until you have handled the `None`:",
          "",
          "~~~py",
          "user = find_user(7)",
          "if user is not None:",
          "    print(user['name'])          # fine here",
          "~~~",
          "",
          "That is the single most valuable thing type hints do. `AttributeError: 'NoneType' object has no",
          "attribute ...` is one of the most common Python errors in production, and this eliminates it as a class.",
          "",
          "## Unions",
          "",
          "~~~py",
          "def parse(value: str | int) -> float:",
          "    return float(value)",
          "~~~",
          "",
          "`X | Y` is modern syntax (3.10+). Older code uses `Union[X, Y]` and `Optional[X]` from `typing` —",
          "`Optional[X]` means exactly `X | None`.",
          "",
          ":::tip Narrowing",
          "~~~py",
          "def describe(value: str | int) -> str:",
          "    if isinstance(value, str):",
          "        return value.upper()      # the checker knows it is a str here",
          "    return str(value * 2)         # ...and an int here",
          "~~~",
          "An `isinstance` check tells the checker which branch it is in. This is called **narrowing**, and it",
          "is how you work with unions safely.",
          ":::",
          "",
          "## Typed dataclasses",
          "",
          "~~~py",
          "from dataclasses import dataclass, field",
          "",
          "@dataclass",
          "class User:",
          "    id: int",
          "    name: str",
          "    email: str | None = None",
          "    tags: list[str] = field(default_factory=list)",
          "",
          "    def display(self) -> str:",
          "        return f'{self.name} <{self.email or \"no email\"}>'",
          "~~~",
          "",
          "The annotations are doing double duty: documenting the field, building `__init__`, and giving the",
          "checker something to verify. `User(1)` is fine; `User('one')` is flagged before you run anything.",
          "",
          "## mypy",
          "",
          "~~~text",
          "pip install mypy",
          "mypy myproject/",
          "~~~",
          "",
          "~~~text",
          "app.py:14: error: Argument 1 to \"greet\" has incompatible type \"int\"; expected \"str\"",
          "app.py:22: error: Item \"None\" of \"dict | None\" has no attribute \"get\"",
          "~~~",
          "",
          "A useful adoption path for an existing codebase:",
          "",
          "1. run `mypy` with default settings and fix what it finds",
          "2. annotate new code as you write it",
          "3. annotate old modules as you touch them",
          "4. turn on `--strict` per module once it is clean",
          "",
          "Trying to make a large untyped codebase strict in one go does not work. Doing it file by file does.",
          "",
          ":::why What this buys you",
          "Renaming a field, changing a return type, or removing a parameter goes from *hope nobody depended on",
          "that* to *the checker lists every call site in two seconds*. On a codebase of any size that is the",
          "difference between refactoring and not daring to.",
          ":::"
        ]),
        exercises: [
          {
            kind: "code", title: "Be honest about None", difficulty: 3,
            concepts: ["optional-union"],
            prompt: L([
              "`find_user` returns `None` when there is no match, but its annotation claims otherwise.",
              "",
              "Fix the annotation, and fix `display_name` so it handles the `None` case by returning `'unknown'`."
            ]),
            starter: L([
              "USERS = [{'id': 1, 'name': 'ada'}, {'id': 2, 'name': 'bo'}]",
              "",
              "",
              "def find_user(user_id: int) -> dict:",
              "    for user in USERS:",
              "        if user['id'] == user_id:",
              "            return user",
              "    return None",
              "",
              "",
              "def display_name(user_id: int) -> str:",
              "    return find_user(user_id)['name']"
            ]),
            hints: [
              "`-> dict | None` tells the truth about what can come back.",
              "In `display_name`, capture the result and check it against `None` before indexing."
            ],
            tests: [
              { name: "finds a user", call: "display_name(1)", expect: "ada" },
              { name: "missing user does not crash", call: "display_name(99)", expect: "unknown" },
              {
                name: "the annotation admits None",
                code: "ann = str(find_user.__annotations__.get('return'))\nassert 'None' in ann, f'the return annotation should include None, got {ann}'"
              },
              { name: "find_user still returns None", code: "assert find_user(99) is None" }
            ],
            solution: L([
              "USERS = [{'id': 1, 'name': 'ada'}, {'id': 2, 'name': 'bo'}]",
              "",
              "",
              "def find_user(user_id: int) -> dict | None:",
              "    for user in USERS:",
              "        if user['id'] == user_id:",
              "            return user",
              "    return None",
              "",
              "",
              "def display_name(user_id: int) -> str:",
              "    user = find_user(user_id)",
              "    if user is None:",
              "        return 'unknown'",
              "    return user['name']"
            ]),
            takeaway: "An annotation that hides `None` is worse than no annotation — it actively tells the reader and the checker that a crash is impossible."
          },
          {
            kind: "code", title: "Narrow a union", difficulty: 3,
            concepts: ["optional-union"],
            prompt: L([
              "Write `normalise(value: str | int | float) -> str` returning:",
              "",
              "- a stripped, lowercased string for a `str`",
              "- the number formatted with two decimals for an `int` or `float`, e.g. `'3.00'`",
              "",
              "Use `isinstance` to narrow. Note `bool` is a subclass of `int` — treat `True` as the number `1`."
            ]),
            starter: "def normalise(value: str | int | float) -> str:\n    ",
            hints: ["`if isinstance(value, str): return value.strip().lower()`", "Otherwise `return f'{value:.2f}'`."],
            tests: [
              { name: "strings", call: "normalise('  HeLLo ')", expect: "hello" },
              { name: "integers", call: "normalise(3)", expect: "3.00" },
              { name: "floats", call: "normalise(3.14159)", expect: "3.14" },
              { name: "negative", call: "normalise(-2)", expect: "-2.00" },
              { name: "annotated", code: "assert 'return' in normalise.__annotations__" }
            ],
            solution: L([
              "def normalise(value: str | int | float) -> str:",
              "    if isinstance(value, str):",
              "        return value.strip().lower()",
              "    return f'{value:.2f}'"
            ])
          },
          {
            kind: "code", title: "A typed dataclass", difficulty: 3,
            concepts: ["typed-dataclass"],
            prompt: L([
              "Write a `@dataclass` called `Task` with:",
              "",
              "- `title: str`",
              "- `done: bool = False`",
              "- `tags: list[str]` defaulting to an empty list (safely)",
              "- `due: str | None = None`",
              "- a method `summary() -> str` returning `'[x] title (2 tags)'` when done, `'[ ] ...'` when not"
            ]),
            starter: "from dataclasses import dataclass, field\n\n\n",
            requires: [{ contains: "default_factory", msg: "Use field(default_factory=list) for the list" }],
            hints: [
              "`tags: list[str] = field(default_factory=list)`",
              "`'[x]' if self.done else '[ ]'`",
              "The tag count goes in brackets: `f'({len(self.tags)} tags)'`."
            ],
            tests: [
              { name: "defaults", code: "t = Task('write tests')\nassert t.done is False and t.tags == [] and t.due is None" },
              { name: "tasks do not share the tag list", code: "a = Task('a')\nb = Task('b')\na.tags.append('x')\nassert b.tags == []" },
              { name: "summary when not done", code: "assert Task('write tests').summary() == '[ ] write tests (0 tags)'" },
              { name: "summary when done", code: "t = Task('ship', done=True, tags=['a', 'b'])\nassert t.summary() == '[x] ship (2 tags)'" },
              { name: "equality comes free", code: "assert Task('a') == Task('a')" },
              { name: "fields are annotated", code: "ann = Task.__annotations__\nassert str(ann['tags']) == 'list[str]' and 'None' in str(ann['due'])" }
            ],
            solution: L([
              "from dataclasses import dataclass, field",
              "",
              "",
              "@dataclass",
              "class Task:",
              "    title: str",
              "    done: bool = False",
              "    tags: list[str] = field(default_factory=list)",
              "    due: str | None = None",
              "",
              "    def summary(self) -> str:",
              "        box = '[x]' if self.done else '[ ]'",
              "        return f'{box} {self.title} ({len(self.tags)} tags)'"
            ])
          },
          {
            kind: "quiz", title: "Optional", difficulty: 2,
            concepts: ["optional-union"],
            prompt: "What does `Optional[str]` mean?",
            choices: [
              "The parameter can be omitted",
              "`str | None` — the value is either a string or None",
              "The annotation is only a suggestion",
              "A string that may be empty"
            ],
            answer: 1,
            explain: "`Optional` is about the *value*, not about whether the argument must be supplied. A parameter with a default is optional to pass; `Optional[str]` says the value itself may be `None`."
          }
        ]
      },

      {
        id: "m25l3", title: "Protocols and contracts", minutes: 11,
        concepts: ["protocols", "contracts", "static-checking"],
        content: L([
          "## Typing duck typing",
          "",
          "Module 17 showed that Python cares whether a method exists, not what a class inherits from.",
          "A `Protocol` lets you *type* that:",
          "",
          "~~~py",
          "from typing import Protocol",
          "",
          "class Drawable(Protocol):",
          "    def draw(self) -> str:",
          "        ...",
          "",
          "",
          "def render(item: Drawable) -> str:",
          "    return item.draw()",
          "~~~",
          "",
          "Any class with a matching `draw` satisfies `Drawable` — **without inheriting from it, and without",
          "knowing it exists**. That is duck typing with a checker behind it, and it is the right tool when you",
          "want to state *what a value must be able to do* rather than *what it must be*.",
          "",
          "Compare with an ABC (Module 17): an ABC requires the class to inherit from it. A Protocol does not.",
          "Use an ABC when you own the classes and want shared behaviour; use a Protocol when you want to accept",
          "anything with the right shape, including classes from libraries you do not control.",
          "",
          "## TypedDict",
          "",
          "For dictionaries with a known shape — JSON payloads, config:",
          "",
          "~~~py",
          "from typing import TypedDict",
          "",
          "class UserRecord(TypedDict):",
          "    id: int",
          "    name: str",
          "    email: str",
          "",
          "def display(user: UserRecord) -> str:",
          "    return user['nmae']       # the checker catches the typo",
          "~~~",
          "",
          "## Design by contract",
          "",
          "Types are only part of a function's contract. The rest is what it **requires** and **guarantees**.",
          "",
          "~~~py",
          "def withdraw(balance: int, amount: int) -> int:",
          "    \"\"\"Return the balance after withdrawing amount.",
          "",
          "    Requires: amount > 0 and amount <= balance",
          "    Guarantees: result >= 0 and result == balance - amount",
          "    Raises: ValueError if the requirements are not met",
          "    \"\"\"",
          "    if amount <= 0:",
          "        raise ValueError('amount must be positive')",
          "    if amount > balance:",
          "        raise ValueError('insufficient funds')",
          "    return balance - amount",
          "~~~",
          "",
          "Writing the contract down forces the questions that produce bugs when left unanswered:",
          "",
          "- what is the valid range of each input?",
          "- what happens at the boundaries?",
          "- what can this raise?",
          "- can it return `None`?",
          "- does it modify its arguments?",
          "",
          ":::why The most valuable line in a docstring",
          "*Does this function modify what I pass it?* Nothing in the signature tells you, and getting it wrong",
          "produces bugs that appear far away from the call. Say it explicitly.",
          ":::",
          "",
          "## Making the contract enforceable",
          "",
          "Three levels, cheapest first:",
          "",
          "1. **Types** — checked before running, by a tool",
          "2. **Validation** — checked at runtime, at the boundary of your system",
          "3. **Tests** — checked in CI, including the failure cases",
          "",
          "Types cannot express *amount must be positive*; validation can. Validation cannot prove your logic;",
          "tests can. They are complementary, and a serious codebase uses all three.",
          "",
          "~~~py",
          "def set_age(age: int) -> int:",
          "    if not 0 <= age <= 130:",
          "        raise ValueError(f'age out of range: {age}')",
          "    return age",
          "~~~",
          "",
          "**Validate at the edges** — where data enters from a user, a file or an API — and trust it inside.",
          "Re-validating in every internal function is noise; not validating at the boundary is how bad data",
          "gets into your database."
        ]),
        exercises: [
          {
            kind: "code", title: "Define a Protocol", difficulty: 4,
            concepts: ["protocols"],
            prompt: L([
              "Define a `Protocol` called `Sized` requiring a `size() -> int` method.",
              "",
              "Then write `total_size(items: list[Sized]) -> int` summing `item.size()` for each.",
              "",
              "It must work with any class providing `size()`, with no inheritance required."
            ]),
            starter: "from typing import Protocol\n\n\n",
            requires: [{ contains: "Protocol", msg: "Use typing.Protocol" }],
            hints: [
              "`class Sized(Protocol):` with `def size(self) -> int: ...`",
              "`total_size` is an ordinary sum over `item.size()`."
            ],
            tests: [
              {
                name: "works with unrelated classes",
                code: "class Box:\n    def size(self): return 3\nclass Bag:\n    def size(self): return 4\nassert total_size([Box(), Bag()]) == 7"
              },
              { name: "empty list", code: "assert total_size([]) == 0" },
              {
                name: "Sized is a Protocol",
                code: "from typing import Protocol\nassert Protocol in Sized.__mro__ or getattr(Sized, '_is_protocol', False), 'Sized must be a Protocol'"
              },
              {
                name: "no inheritance is required",
                code: "class Free:\n    def size(self): return 10\nassert Sized not in Free.__mro__, 'the class must not need to inherit from Sized'\nassert total_size([Free()]) == 10"
              }
            ],
            solution: L([
              "from typing import Protocol",
              "",
              "",
              "class Sized(Protocol):",
              "    def size(self) -> int:",
              "        ...",
              "",
              "",
              "def total_size(items: list[Sized]) -> int:",
              "    return sum(item.size() for item in items)"
            ])
          },
          {
            kind: "code", title: "Write the contract", difficulty: 3,
            concepts: ["contracts"],
            prompt: L([
              "Implement `split_evenly(total: int, parts: int) -> list[int]` dividing `total` into `parts`",
              "whole numbers that differ by at most 1 and sum to exactly `total`.",
              "",
              "`split_evenly(10, 3)` → `[4, 3, 3]` — the larger shares first.",
              "",
              "Contract: `parts` must be at least 1 and `total` must not be negative; otherwise raise `ValueError`.",
              "The result always has exactly `parts` items and always sums to `total`."
            ]),
            starter: "def split_evenly(total: int, parts: int) -> list[int]:\n    ",
            hints: [
              "`base, remainder = divmod(total, parts)`",
              "The first `remainder` shares get `base + 1`, the rest get `base`.",
              "Validate before computing anything."
            ],
            tests: [
              { name: "uneven split", call: "split_evenly(10, 3)", expect: [4, 3, 3] },
              { name: "even split", call: "split_evenly(9, 3)", expect: [3, 3, 3] },
              { name: "one part", call: "split_evenly(7, 1)", expect: [7] },
              { name: "zero total", call: "split_evenly(0, 3)", expect: [0, 0, 0] },
              { name: "more parts than total", call: "split_evenly(2, 5)", expect: [1, 1, 0, 0, 0] },
              { name: "zero parts raises", call: "split_evenly(10, 0)", raises: "ValueError" },
              { name: "negative total raises", call: "split_evenly(-1, 2)", raises: "ValueError" },
              {
                name: "the guarantee holds for many inputs",
                code: "for total in range(0, 40):\n    for parts in range(1, 9):\n        result = split_evenly(total, parts)\n        assert len(result) == parts, (total, parts, result)\n        assert sum(result) == total, (total, parts, result)\n        assert max(result) - min(result) <= 1, (total, parts, result)"
              }
            ],
            solution: L([
              "def split_evenly(total: int, parts: int) -> list[int]:",
              "    if parts < 1:",
              "        raise ValueError('parts must be at least 1')",
              "    if total < 0:",
              "        raise ValueError('total must not be negative')",
              "    base, remainder = divmod(total, parts)",
              "    return [base + 1] * remainder + [base] * (parts - remainder)"
            ]),
            takeaway: "The last check tested the *guarantee* across 300 inputs rather than a handful of examples. When a function has an invariant, testing the invariant beats testing cases."
          },
          {
            kind: "quiz", title: "Protocol or ABC", difficulty: 3,
            concepts: ["protocols"],
            prompt: "You want to accept any object with a `.read()` method, including classes from libraries you do not control. What fits?",
            choices: [
              "An abstract base class they must inherit from",
              "A Protocol describing the `read` method",
              "A union of every known type",
              "`Any`"
            ],
            answer: 1,
            explain: "You cannot make a third-party class inherit from your ABC. A Protocol is satisfied structurally — anything with a matching `read` qualifies, and the checker still verifies it."
          },
          {
            kind: "quiz", title: "Where to validate", difficulty: 3,
            concepts: ["contracts"],
            prompt: "In a program that reads a CSV, transforms rows and writes to a database, where should input validation live?",
            choices: [
              "In every function that touches a row",
              "At the boundary where the CSV is read, so everything downstream can trust the data",
              "Only in the database layer",
              "Nowhere — the type hints handle it"
            ],
            answer: 1,
            explain: "Validate once, at the edge, and convert to trusted internal types. Re-checking everywhere is noise and still misses cases; checking nowhere lets bad data travel until it corrupts something."
          }
        ]
      }
    ],

    checkpoint: {
      id: "m25cp", pass: 0.8,
      title: "Checkpoint: Typing & Contracts",
      items: [
        {
          kind: "code", title: "Annotate it", difficulty: 2, concepts: ["annotations"],
          prompt: "Annotate `average(values)` — it takes a list of floats and returns a float or None for an empty list.",
          starter: "def average(values):\n    if not values:\n        return None\n    return sum(values) / len(values)",
          tests: [
            { name: "still works", call: "average([1.0, 2.0])", expect: 1.5 },
            { name: "empty gives None", code: "assert average([]) is None" },
            {
              name: "fully annotated including None",
              code: "a = average.__annotations__\nassert str(a.get('values')) == 'list[float]', a\nassert 'None' in str(a.get('return')), a"
            }
          ]
        },
        {
          kind: "quiz", title: "Runtime effect", difficulty: 2, concepts: ["annotations"],
          prompt: "Which statement about Python type hints is true?",
          choices: [
            "They are enforced at runtime and raise TypeError",
            "They are metadata used by editors and static checkers; Python itself ignores them",
            "They make code run faster",
            "They are required in Python 3.12"
          ],
          answer: 1,
          explain: "The interpreter stores annotations and never checks them. All the value comes from tools reading them before the code runs."
        },
        {
          kind: "code", title: "Optional handling", difficulty: 3, concepts: ["optional-union"],
          prompt: "Write `first_word(text: str | None) -> str` returning the first word, or `''` when the text is None or blank.",
          starter: "def first_word(text: str | None) -> str:\n    ",
          tests: [
            { name: "normal", call: "first_word('hello world')", expect: "hello" },
            { name: "None", call: "first_word(None)", expect: "" },
            { name: "blank", call: "first_word('   ')", expect: "" }
          ]
        },
        {
          kind: "code", title: "Typed record", difficulty: 3, concepts: ["typed-dataclass"],
          prompt: "Write a `@dataclass` `Point` with `x: float`, `y: float` and a `distance_from_origin() -> float` method.",
          starter: "from dataclasses import dataclass\nimport math\n\n\n",
          tests: [
            { name: "construction", code: "p = Point(3, 4)\nassert p.x == 3 and p.y == 4" },
            { name: "distance", code: "assert Point(3, 4).distance_from_origin() == 5.0" },
            { name: "equality", code: "assert Point(1, 2) == Point(1, 2)" }
          ]
        },
        {
          kind: "quiz", title: "Contracts", difficulty: 3, concepts: ["contracts"],
          prompt: "Which part of a function's contract can type hints NOT express?",
          choices: [
            "The types of the parameters",
            "The return type",
            "That an integer argument must be positive",
            "That a value may be None"
          ],
          answer: 2,
          explain: "Types describe the *kind* of value, not its valid range. Constraints like *positive*, *non-empty* or *a valid email* need runtime validation, and belong at the boundary of your system."
        }
      ]
    }
  });
})();
