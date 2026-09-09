/* PyQuest — turn Python tracebacks into plain English.
   Reading errors is a skill; this teaches it rather than hiding it. */
(function (PQ) {
  'use strict';

  const RULES = [
    { re: /IndentationError: expected an indented block/,
      t: 'Python wanted an indented block',
      b: 'A line ending in `:` (after `if`, `for`, `while`, `def`, `class`, `try`…) must be followed by an **indented** block. Add 4 spaces at the start of the next line.' },
    { re: /IndentationError: unexpected indent/,
      t: 'This line is indented but nothing opened a block',
      b: 'Indentation is only for code inside an `if`, loop, function, etc. Remove the leading spaces, or check that the line above ends with `:`.' },
    { re: /IndentationError: unindent does not match/,
      t: 'Your indentation levels do not line up',
      b: 'Every line in the same block must be indented by the same amount. Pick 4 spaces per level and keep it consistent.' },
    { re: /TabError/,
      t: 'Tabs and spaces are mixed',
      b: 'Python will not accept a mix. Use spaces only — 4 per level.' },
    { re: /SyntaxError: expected ':'/,
      t: 'A colon is missing',
      b: '`if`, `elif`, `else`, `for`, `while`, `def` and `class` lines all end with `:`.' },
    { re: /SyntaxError: '(\w+)' was never closed/,
      t: 'An opening bracket was never closed',
      b: 'Count your brackets — every `(`, `[` and `{` needs a partner. The error points at the one that opened.' },
    { re: /SyntaxError: invalid syntax\. Perhaps you forgot a comma/,
      t: 'A comma is probably missing',
      b: 'Items in a list, tuple, dict or argument list are separated by commas.' },
    { re: /SyntaxError: cannot assign to literal/,
      t: 'You tried to assign to something that is not a name',
      b: 'Assignment goes `name = value`, never `5 = x`. And remember `==` compares while `=` assigns.' },
    { re: /SyntaxError: invalid syntax/,
      t: 'Python could not parse this line',
      b: 'Look at the line shown **and the one above it**. Usual suspects: a missing `:`, an unclosed bracket or quote, `=` where you meant `==`, or a stray keyword.' },
    { re: /SyntaxError: unterminated string literal/,
      t: 'A quote was never closed',
      b: 'Every `\'` or `"` needs a matching one on the same line. For text spanning lines, use triple quotes.' },
    { re: /NameError: name '(.+?)' is not defined/,
      t: (m) => 'Python has never heard of `' + m[1] + '`',
      b: (m) => 'Either `' + m[1] + '` is misspelled, or it is used before the line that creates it, or it should be a string in quotes (`"' + m[1] + '"`), or it lives inside a function and is not visible here.' },
    { re: /UnboundLocalError.*'(.+?)'/,
      t: (m) => '`' + m[1] + '` is treated as local, but read before it is set',
      b: 'Assigning to a name anywhere inside a function makes it local for the whole function. Pass the value in as a parameter, or return it, rather than relying on an outer variable.' },
    { re: /TypeError: can only concatenate str \(not "(\w+)"\) to str/,
      t: (m) => 'You tried to add a ' + m[1] + ' to a string',
      b: 'Python will not silently join text and numbers. Use an f-string — `f"total: {n}"` — or convert with `str(n)`.' },
    { re: /TypeError: unsupported operand type\(s\) for (.+?): '(\w+)' and '(\w+)'/,
      t: (m) => 'You cannot use ' + m[1] + ' between a ' + m[2] + ' and a ' + m[3],
      b: 'Check the types on both sides. Remember `input()` always hands back a **string** — wrap it in `int(...)` or `float(...)` if you meant a number.' },
    { re: /TypeError: '(\w+)' object is not subscriptable/,
      t: (m) => (m[1] === 'function' ? 'You used [ ] on a function' : 'You used [ ] on a ' + m[1] + ', which has no positions'),
      b: 'Square brackets index sequences (`list`, `str`, `tuple`) and map keys (`dict`). Numbers and functions cannot be indexed — did you mean `()` to call it?' },
    { re: /TypeError: '(\w+)' object is not callable/,
      t: (m) => 'You put `()` after a ' + m[1] + ', so Python tried to call it',
      b: 'Only functions and classes can be called. A common cause: a variable that shadows a built-in, e.g. `list = [1,2]` and then `list(...)`.' },
    { re: /TypeError: '(\w+)' object is not iterable/,
      t: (m) => 'You tried to loop over a ' + m[1],
      b: 'Only sequences and other iterables work with `for`. To count, use `range(n)`.' },
    { re: /TypeError: (.+?)\(\) missing (\d+) required positional argument/,
      t: (m) => m[1] + '() was called with too few arguments',
      b: 'Look at the `def` line: every parameter without a default must be supplied at the call site.' },
    { re: /TypeError: (.+?)\(\) takes (\d+) positional arguments? but (\d+) (?:was|were) given/,
      t: (m) => m[1] + '() got too many arguments',
      b: 'If this is a method inside a class, remember the first parameter must be `self` — and you do **not** pass it yourself.' },
    { re: /TypeError: object of type '(\w+)' has no len/,
      t: (m) => 'len() does not work on a ' + m[1],
      b: '`len()` needs something with a length: a string, list, tuple, dict or set.' },
    { re: /TypeError: (.+?) argument must be/,
      t: 'A function got the wrong type of argument',
      b: 'Read what type the function expected and convert before you pass it.' },
    { re: /ValueError: invalid literal for int\(\) with base 10: (.+)/,
      t: (m) => 'int() could not turn ' + m[1] + ' into a whole number',
      b: 'Only strings made of digits convert. `"3.5"`, `"abc"` and `""` do not — use `float()` for decimals, and validate input before converting.' },
    { re: /ValueError: not enough values to unpack \(expected (\d+), got (\d+)\)/,
      t: (m) => 'Unpacking wanted ' + m[1] + ' values but got ' + m[2],
      b: 'The left-hand side must have exactly as many names as the right-hand side has items.' },
    { re: /ValueError: too many values to unpack/,
      t: 'Unpacking got more values than names',
      b: 'Add another name on the left, or use `a, *rest = items` to sweep up the remainder.' },
    { re: /ValueError: (.+?) is not in list/,
      t: 'That item is not in the list',
      b: '`.index()` and `.remove()` raise when the item is missing. Check with `if x in items:` first.' },
    { re: /IndexError: (list|string|tuple) index out of range/,
      t: (m) => 'You asked for a position that does not exist in the ' + m[1],
      b: 'Positions run from `0` to `len(x) - 1`. Looping with `for item in x:` avoids the whole problem.' },
    { re: /KeyError: (.+)/,
      t: (m) => 'The dictionary has no key ' + m[1],
      b: 'Check spelling and type (`"1"` is not `1`). Use `d.get(key)` to get `None` instead of an error, or `if key in d:` to test first.' },
    { re: /AttributeError: '(\w+)' object has no attribute '(\w+)'/,
      t: (m) => "A " + m[1] + " has no `." + m[2] + "`",
      b: (m) => 'Either the name is misspelled, or the value is not the type you thought. `' + m[1] + '` is what you actually have — print it and check.' },
    { re: /AttributeError: module '(.+?)' has no attribute '(.+?)'/,
      t: (m) => m[1] + ' has no ' + m[2],
      b: 'Check the spelling, or whether you needed a different module. Also make sure a file of your own is not shadowing the real module.' },
    { re: /ZeroDivisionError/,
      t: 'Something was divided by zero',
      b: 'Guard the divisor: `if n != 0:` before dividing. This often means a list was empty when you averaged it.' },
    { re: /ModuleNotFoundError: No module named '(.+?)'/,
      t: (m) => 'No module named ' + m[1],
      b: 'Check the spelling. In PyQuest only the Python standard library is available — that is deliberate, and it is plenty.' },
    { re: /RecursionError/,
      t: 'A function called itself too many times',
      b: 'Your recursion never reaches its base case. Make sure every recursive call moves closer to the stopping condition, and that the condition can actually be hit.' },
    { re: /FileNotFoundError/,
      t: 'That file does not exist',
      b: 'Check the filename and that you created it before reading it. Exercises that use files list the ones provided.' },
    { re: /EOFError: Your program asked for more input/,
      t: 'Your program asked for more input than the exercise gives',
      b: 'Count your `input()` calls against the inputs listed for this exercise — you probably have one too many, or one inside a loop that runs too often.' },
    { re: /StopIteration/,
      t: 'An iterator ran out of values',
      b: '`next()` raises this at the end. Give it a default — `next(it, None)` — or use a `for` loop, which stops on its own.' },
    { re: /AssertionError/,
      t: 'An assert failed',
      b: 'The condition you asserted was false. Print the values involved just before the assert to see why.' },
    { re: /TypeError: unhashable type: '(\w+)'/,
      t: (m) => 'A ' + m[1] + ' cannot be a dict key or set member',
      b: 'Only immutable values can be hashed. Use a `tuple` instead of a `list`, or `frozenset` instead of `set`.' }
  ];

  function explain(text) {
    if (!text) return null;
    for (const r of RULES) {
      const m = text.match(r.re);
      if (m) {
        return {
          title: typeof r.t === 'function' ? r.t(m) : r.t,
          body: typeof r.b === 'function' ? r.b(m) : r.b
        };
      }
    }
    const last = String(text).trim().split('\n').pop();
    const generic = last.match(/^(\w+Error|\w+Exception|\w+Warning):?\s*(.*)$/);
    if (generic) {
      return { title: generic[1] + (generic[2] ? ': ' + generic[2] : ''), body: 'Read the traceback bottom-up: the last line says *what* went wrong, the lines above say *where*.' };
    }
    return null;
  }

  /** Point at the line number inside the learner's own file. */
  function errorLine(text) {
    const m = String(text || '').match(/File "your_code\.py", line (\d+)/g);
    if (!m || !m.length) return null;
    const last = m[m.length - 1].match(/line (\d+)/);
    return last ? parseInt(last[1], 10) : null;
  }

  PQ.errors = { explain, errorLine, RULES };
})(window.PQ);
