/* Tier 3 · Module 24 — APIs & the Web */
(function () {
  const L = a => a.join("\n");

  /* A deterministic, offline HTTP simulator the exercises can import. */
  const FAKEAPI = [
    '"""A tiny offline HTTP simulator for PyQuest.',
    "",
    "It behaves like a real JSON API: status codes, paginated collections,",
    "rate limiting and an endpoint that fails a few times before succeeding.",
    '"""',
    "",
    "",
    "class Response:",
    "    def __init__(self, status_code, body=None, headers=None):",
    "        self.status_code = status_code",
    "        self._body = body",
    "        self.headers = headers or {}",
    "",
    "    @property",
    "    def ok(self):",
    "        return 200 <= self.status_code < 300",
    "",
    "    def json(self):",
    "        if self._body is None:",
    "            raise ValueError('response has no JSON body')",
    "        return self._body",
    "",
    "    def __repr__(self):",
    "        return f'Response({self.status_code})'",
    "",
    "",
    "USERS = [{'id': i, 'name': f'user{i}', 'active': i % 3 != 0} for i in range(1, 26)]",
    "",
    "_state = {'flaky_calls': 0, 'requests': 0, 'rate_limit': None}",
    "",
    "",
    "def reset(rate_limit=None):",
    '    """Start again: clears counters and optionally sets a request budget."""',
    "    _state['flaky_calls'] = 0",
    "    _state['requests'] = 0",
    "    _state['rate_limit'] = rate_limit",
    "",
    "",
    "def request_count():",
    "    return _state['requests']",
    "",
    "",
    "def get(path, params=None):",
    '    """GET a path. Supported: /users, /users/<id>, /flaky, /teapot."""',
    "    _state['requests'] += 1",
    "    params = params or {}",
    "",
    "    limit = _state['rate_limit']",
    "    if limit is not None and _state['requests'] > limit:",
    "        return Response(429, {'error': 'too many requests'}, {'Retry-After': '1'})",
    "",
    "    if path == '/users':",
    "        page = int(params.get('page', 1))",
    "        per_page = int(params.get('per_page', 10))",
    "        if page < 1:",
    "            return Response(400, {'error': 'page must be >= 1'})",
    "        start = (page - 1) * per_page",
    "        items = USERS[start:start + per_page]",
    "        total_pages = (len(USERS) + per_page - 1) // per_page",
    "        return Response(200, {",
    "            'items': items,",
    "            'page': page,",
    "            'per_page': per_page,",
    "            'total': len(USERS),",
    "            'total_pages': total_pages,",
    "            'has_next': page < total_pages,",
    "        })",
    "",
    "    if path.startswith('/users/'):",
    "        raw = path.split('/')[-1]",
    "        if not raw.isdigit():",
    "            return Response(400, {'error': 'id must be a number'})",
    "        for user in USERS:",
    "            if user['id'] == int(raw):",
    "                return Response(200, user)",
    "        return Response(404, {'error': 'not found'})",
    "",
    "    if path == '/flaky':",
    "        _state['flaky_calls'] += 1",
    "        if _state['flaky_calls'] < 3:",
    "            return Response(503, {'error': 'service unavailable'})",
    "        return Response(200, {'ok': True, 'attempts': _state['flaky_calls']})",
    "",
    "    if path == '/teapot':",
    "        return Response(418, {'error': \"I'm a teapot\"})",
    "",
    "    return Response(404, {'error': 'unknown path'})",
    ""
  ].join("\n");

  PQ.defineModule({
    id: "m24", tier: 3, order: 24, icon: "🌐",
    title: "APIs & the Web",
    blurb: "How HTTP works, how to consume an API without breaking, and how to design one worth using.",
    intro: L([
      "Almost every program you write professionally will talk to something over HTTP. The mechanics are",
      "simple; doing it *well* — handling failure, pagination and rate limits — is what separates a script",
      "that works on your machine from one that runs unattended.",
      "",
      ":::tip About the network here",
      "PyQuest runs entirely offline, so these exercises use `fakeapi` — a small simulator with real status",
      "codes, pagination, rate limiting and an endpoint that fails before it succeeds. The code you write",
      "against it is the same code you would write against `requests`.",
      ":::"
    ]),
    concepts: [
      { id: "http-model", name: "the HTTP model", importance: 1.4 },
      { id: "http-methods", name: "methods and idempotency", importance: 1.3 },
      { id: "status-codes", name: "status codes", importance: 1.4 },
      { id: "api-json", name: "JSON payloads", importance: 1.3 },
      { id: "api-errors", name: "handling API failures", importance: 1.5 },
      { id: "api-retry", name: "retries and backoff", importance: 1.4 },
      { id: "api-pagination", name: "pagination", importance: 1.4 },
      { id: "api-design", name: "designing an API", importance: 1.3 },
      { id: "api-auth", name: "authentication basics", importance: 1.2 }
    ],

    lessons: [
      {
        id: "m24l1", title: "The HTTP model", minutes: 12,
        concepts: ["http-model", "http-methods", "status-codes", "api-json"],
        content: L([
          "## Request and response",
          "",
          "Every HTTP interaction is one request and one response. There is no ongoing conversation — the",
          "server remembers nothing between them unless you tell it who you are each time.",
          "",
          "**A request has:** a method, a path, headers, and sometimes a body.",
          "**A response has:** a status code, headers, and usually a body.",
          "",
          "~~~text",
          "GET /users/7 HTTP/1.1",
          "Host: api.example.com",
          "Accept: application/json",
          "Authorization: Bearer abc123",
          "",
          "→ 200 OK",
          "  Content-Type: application/json",
          "",
          '  {"id": 7, "name": "ada"}',
          "~~~",
          "",
          "## The methods",
          "",
          "| Method | Means | Safe? | Idempotent? |",
          "|---|---|---|---|",
          "| `GET` | read something | yes | yes |",
          "| `POST` | create something | no | **no** |",
          "| `PUT` | replace something | no | yes |",
          "| `PATCH` | modify part of something | no | usually |",
          "| `DELETE` | remove something | no | yes |",
          "",
          "**Safe** means it changes nothing. **Idempotent** means doing it five times has the same effect as",
          "doing it once.",
          "",
          ":::why Why idempotency matters to you",
          "Networks fail *after* the server acted but *before* you got the response. You cannot tell that apart",
          "from a request that never arrived. Retrying an idempotent request is safe; retrying a `POST` may",
          "create two orders. This is why payment APIs ask for an idempotency key.",
          ":::",
          "",
          "## Status codes",
          "",
          "The first digit tells you who has the problem:",
          "",
          "| Range | Meaning | Common ones |",
          "|---|---|---|",
          "| **2xx** | it worked | `200 OK`, `201 Created`, `204 No Content` |",
          "| **3xx** | look elsewhere | `301 Moved`, `304 Not Modified` |",
          "| **4xx** | **you** got it wrong | `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `429 Too Many Requests` |",
          "| **5xx** | **the server** got it wrong | `500 Internal Error`, `503 Unavailable` |",
          "",
          "That split drives your error handling: **4xx means fix your request — do not retry. 5xx and 429 mean",
          "try again later.**",
          "",
          "`401` means *I do not know who you are*; `403` means *I know, and no*.",
          "",
          "## Making a request",
          "",
          "With the `requests` library, which you will use in real projects:",
          "",
          "~~~py",
          "import requests",
          "",
          "response = requests.get(",
          "    'https://api.example.com/users',",
          "    params={'page': 2},",
          "    headers={'Authorization': 'Bearer ' + token},",
          "    timeout=10,          # ALWAYS set a timeout",
          ")",
          "",
          "if response.ok:",
          "    data = response.json()",
          "~~~",
          "",
          ":::warn Always pass a timeout",
          "Without one, a hung server can block your program **forever**. This is the single most common",
          "production incident caused by HTTP client code.",
          ":::",
          "",
          "## Query strings and bodies",
          "",
          "`params={'page': 2}` becomes `?page=2`, correctly escaped. Never build a query string with",
          "concatenation — a value containing `&` or a space would break it.",
          "",
          "For sending data, `json={'name': 'ada'}` serialises the body and sets `Content-Type` for you.",
          "",
          "## The shape of JSON APIs",
          "",
          "~~~py",
          "{'id': 7, 'name': 'ada'}                       # a single resource",
          "{'items': [...], 'page': 1, 'has_next': True}  # a collection, paginated",
          "{'error': 'not found', 'code': 'user_missing'}  # an error",
          "~~~",
          "",
          "Always check the status code **before** parsing the body. An error response is still JSON, and",
          "reading `data['name']` on a 404 gives you a confusing `KeyError` instead of the real problem."
        ]),
        exercises: [
          {
            kind: "code", title: "Fetch a resource", difficulty: 2,
            concepts: ["http-model", "status-codes"],
            prompt: L([
              "Using `fakeapi.get(path)`, write `get_user(user_id)` returning the user dictionary,",
              "or `None` when the response is a 404.",
              "",
              "Any other non-2xx status must raise `RuntimeError` with the status code in the message."
            ]),
            files: { "fakeapi.py": FAKEAPI },
            starter: "import fakeapi\n\n\ndef get_user(user_id):\n    ",
            hints: [
              "`response = fakeapi.get(f'/users/{user_id}')`",
              "`response.status_code`, `response.ok` and `response.json()` are available.",
              "Check for 404 first, then `ok`, then raise."
            ],
            tests: [
              { name: "fetches a user", code: "import fakeapi\nfakeapi.reset()\nassert get_user(7)['name'] == 'user7'" },
              { name: "missing user gives None", code: "import fakeapi\nfakeapi.reset()\nassert get_user(999) is None" },
              {
                name: "a bad id raises",
                code: "import fakeapi\nfakeapi.reset()\ntry:\n    get_user('abc')\n    raise AssertionError('should raise')\nexcept RuntimeError as e:\n    assert '400' in str(e), f'message should mention the status: {e}'"
              },
              { name: "returns the whole record", code: "import fakeapi\nfakeapi.reset()\nu = get_user(1)\nassert set(u) == {'id', 'name', 'active'}" }
            ],
            solution: L([
              "import fakeapi",
              "",
              "",
              "def get_user(user_id):",
              "    response = fakeapi.get(f'/users/{user_id}')",
              "    if response.status_code == 404:",
              "        return None",
              "    if not response.ok:",
              "        raise RuntimeError(f'request failed with status {response.status_code}')",
              "    return response.json()"
            ])
          },
          {
            kind: "quiz", title: "Which status", difficulty: 3,
            concepts: ["status-codes"],
            prompt: "A client sends a valid request but their token has expired. What should the API return?",
            choices: ["`400 Bad Request`", "`401 Unauthorized`", "`403 Forbidden`", "`500 Internal Server Error`"],
            answer: 1,
            explain: "`401` means *authentication is missing or invalid* — re-authenticate and try again. `403` means *you are authenticated and still not allowed*, which no amount of retrying will fix."
          },
          {
            kind: "quiz", title: "Safe to retry", difficulty: 3,
            concepts: ["http-methods"],
            prompt: "Your connection drops before you see the response. Which request is riskiest to retry blindly?",
            choices: [
              "`GET /orders/7`",
              "`DELETE /orders/7`",
              "`POST /orders` creating a new order",
              "`PUT /orders/7` replacing an order"
            ],
            answer: 2,
            explain: "`POST` is not idempotent — the server may have created the order before the connection failed, so retrying can create a second one. `GET`, `PUT` and `DELETE` all end in the same state however many times you send them."
          },
          {
            kind: "code", title: "Check before you parse", difficulty: 3,
            concepts: ["api-errors"],
            prompt: L([
              "Write `describe(path)` returning a short string for any path:",
              "",
              "- `'ok'` followed by the number of keys for a 2xx JSON object, e.g. `'ok 3'`",
              "- `'client error <code>'` for a 4xx",
              "- `'server error <code>'` for a 5xx",
              "",
              "It must never raise, whatever the path."
            ]),
            files: { "fakeapi.py": FAKEAPI },
            starter: "import fakeapi\n\n\ndef describe(path):\n    ",
            hints: [
              "`code = response.status_code`, then compare ranges.",
              "`400 <= code < 500` is a client error.",
              "For success, `len(response.json())` gives the number of keys."
            ],
            tests: [
              { name: "a successful fetch", code: "import fakeapi\nfakeapi.reset()\nassert describe('/users/1') == 'ok 3'" },
              { name: "not found", code: "import fakeapi\nfakeapi.reset()\nassert describe('/users/999') == 'client error 404'" },
              { name: "unknown path", code: "import fakeapi\nfakeapi.reset()\nassert describe('/nope') == 'client error 404'" },
              { name: "a teapot", code: "import fakeapi\nfakeapi.reset()\nassert describe('/teapot') == 'client error 418'" },
              { name: "server error", code: "import fakeapi\nfakeapi.reset()\nassert describe('/flaky') == 'server error 503'" }
            ],
            solution: L([
              "import fakeapi",
              "",
              "",
              "def describe(path):",
              "    response = fakeapi.get(path)",
              "    code = response.status_code",
              "    if 200 <= code < 300:",
              "        return f'ok {len(response.json())}'",
              "    if 400 <= code < 500:",
              "        return f'client error {code}'",
              "    return f'server error {code}'"
            ])
          }
        ]
      },

      {
        id: "m24l2", title: "Consuming an API without breaking", minutes: 13,
        concepts: ["api-errors", "api-retry", "api-pagination"],
        content: L([
          "## Everything fails eventually",
          "",
          "A network call can: time out, be refused, return 500, return 429, return 200 with unexpected JSON,",
          "or succeed after twelve seconds. Code that assumes success is code that will page someone at 3am.",
          "",
          "~~~py",
          "response = requests.get(url, timeout=10)",
          "response.raise_for_status()       # raises on 4xx and 5xx",
          "data = response.json()",
          "~~~",
          "",
          "## Retry — but only what is worth retrying",
          "",
          "~~~py",
          "import time",
          "",
          "RETRYABLE = {429, 500, 502, 503, 504}",
          "",
          "def get_with_retry(path, attempts=3):",
          "    delay = 1",
          "    for attempt in range(attempts):",
          "        response = client.get(path)",
          "        if response.ok:",
          "            return response",
          "        if response.status_code not in RETRYABLE:",
          "            raise RuntimeError(f'giving up: {response.status_code}')",
          "        if attempt < attempts - 1:",
          "            time.sleep(delay)",
          "            delay *= 2                # exponential backoff",
          "    raise RuntimeError('all attempts failed')",
          "~~~",
          "",
          "Three rules that matter:",
          "",
          "1. **Never retry a 4xx** (except 429). A 404 will still be a 404 in a second, and retrying a 400",
          "   just wastes everyone's time.",
          "2. **Back off exponentially.** Retrying immediately, from every client at once, is how a struggling",
          "   service is turned into a dead one.",
          "3. **Cap the attempts.** Infinite retries turn a transient failure into a stuck process.",
          "",
          "Real systems add **jitter** — a small random offset — so that a thousand clients do not all retry",
          "at exactly the same instant.",
          "",
          "## Rate limits",
          "",
          "`429 Too Many Requests` usually comes with a `Retry-After` header. Honour it — it is the server",
          "telling you exactly how long to wait, and ignoring it typically gets you blocked.",
          "",
          "## Pagination",
          "",
          "APIs never return a million rows at once:",
          "",
          "~~~py",
          "{'items': [...], 'page': 1, 'total_pages': 3, 'has_next': True}",
          "~~~",
          "",
          "~~~py",
          "def all_users():",
          "    page = 1",
          "    while True:",
          "        data = client.get('/users', params={'page': page}).json()",
          "        yield from data['items']",
          "        if not data['has_next']:",
          "            return",
          "        page += 1",
          "~~~",
          "",
          "Making it a **generator** means the caller can stop early, and you never hold every page in memory.",
          "",
          ":::warn Always have a stop condition",
          "A pagination loop that trusts the server to eventually say `has_next: false` will spin forever if the",
          "server misbehaves. Cap the page count, or stop when a page comes back empty.",
          ":::",
          "",
          "## Be conservative in what you read",
          "",
          "~~~py",
          "name = data['user']['profile']['name']          # three ways to KeyError",
          "name = data.get('user', {}).get('profile', {}).get('name', 'unknown')",
          "~~~",
          "",
          "APIs add and rename fields. Code that assumes a field is present will break on a Tuesday when",
          "someone else deploys. Use `.get()` with defaults for anything optional, and validate what you rely on.",
          "",
          "## Other people's APIs are slow",
          "",
          "- **cache** responses that do not change often",
          "- **batch** where the API supports it — one request for 100 ids beats 100 requests",
          "- **do not call an API inside a loop over your database** — that is the N+1 problem again, with",
          "  network latency instead of query latency"
        ]),
        exercises: [
          {
            kind: "code", title: "Retry the retryable", difficulty: 4,
            concepts: ["api-retry", "api-errors"],
            prompt: L([
              "Write `fetch_with_retry(path, attempts=5)` using `fakeapi.get`.",
              "",
              "- return the parsed JSON on a 2xx",
              "- retry on 429 and any 5xx, up to `attempts` times",
              "- raise `RuntimeError` immediately on any other 4xx — **without** retrying",
              "- raise `RuntimeError` if every attempt fails",
              "",
              "`/flaky` fails twice with 503 and then succeeds. Do not call `time.sleep` — the checks would be slow."
            ]),
            files: { "fakeapi.py": FAKEAPI },
            starter: "import fakeapi\n\nRETRYABLE = {429, 500, 502, 503, 504}\n\n\ndef fetch_with_retry(path, attempts=5):\n    ",
            hints: [
              "Loop `for attempt in range(attempts):`",
              "Return `response.json()` as soon as `response.ok`.",
              "If the status is not in `RETRYABLE`, raise straight away.",
              "After the loop, raise because everything failed."
            ],
            tests: [
              {
                name: "succeeds after the flaky endpoint recovers",
                code: "import fakeapi\nfakeapi.reset()\nresult = fetch_with_retry('/flaky')\nassert result['ok'] is True and result['attempts'] == 3"
              },
              {
                name: "a 404 is not retried",
                code: "import fakeapi\nfakeapi.reset()\ntry:\n    fetch_with_retry('/users/999')\n    raise AssertionError('should raise')\nexcept RuntimeError:\n    pass\nassert fakeapi.request_count() == 1, f'404 must not be retried, made {fakeapi.request_count()} requests'"
              },
              {
                name: "gives up after the attempt limit",
                code: "import fakeapi\nfakeapi.reset()\ntry:\n    fetch_with_retry('/flaky', attempts=2)\n    raise AssertionError('should raise')\nexcept RuntimeError:\n    pass\nassert fakeapi.request_count() == 2, f'should try exactly twice, made {fakeapi.request_count()}'"
              },
              {
                name: "a normal request works first time",
                code: "import fakeapi\nfakeapi.reset()\nassert fetch_with_retry('/users/1')['id'] == 1\nassert fakeapi.request_count() == 1"
              },
              {
                name: "rate limiting is retried",
                code: "import fakeapi\nfakeapi.reset(rate_limit=0)\ntry:\n    fetch_with_retry('/users/1', attempts=3)\n    raise AssertionError('should raise')\nexcept RuntimeError:\n    pass\nassert fakeapi.request_count() == 3, '429 should be retried'"
              }
            ],
            solution: L([
              "import fakeapi",
              "",
              "RETRYABLE = {429, 500, 502, 503, 504}",
              "",
              "",
              "def fetch_with_retry(path, attempts=5):",
              "    for _ in range(attempts):",
              "        response = fakeapi.get(path)",
              "        if response.ok:",
              "            return response.json()",
              "        if response.status_code not in RETRYABLE:",
              "            raise RuntimeError(f'request failed: {response.status_code}')",
              "    raise RuntimeError(f'giving up on {path} after {attempts} attempts')"
            ]),
            takeaway: "The important half of this is the *not* retrying. Hammering an endpoint that returns 404 is a bug that shows up as a mysteriously large bill."
          },
          {
            kind: "code", title: "Walk every page", difficulty: 4,
            concepts: ["api-pagination"],
            prompt: L([
              "Write `all_users(per_page=10)` as a **generator** yielding every user across all pages,",
              "using `fakeapi.get('/users', params={'page': n, 'per_page': per_page})`.",
              "",
              "The response has `items` and `has_next`. There are 25 users in total.",
              "",
              "It must stop when there is no next page, and must be lazy — fetching a page only when needed."
            ]),
            files: { "fakeapi.py": FAKEAPI },
            starter: "import fakeapi\n\n\ndef all_users(per_page=10):\n    ",
            requires: [{ contains: "yield", msg: "Make it a generator" }],
            hints: [
              "Start at page 1 and loop.",
              "`yield from data['items']` yields each user.",
              "`return` when `has_next` is false."
            ],
            tests: [
              { name: "yields every user", code: "import fakeapi\nfakeapi.reset()\nusers = list(all_users())\nassert len(users) == 25, len(users)" },
              { name: "in order", code: "import fakeapi\nfakeapi.reset()\nusers = list(all_users())\nassert [u['id'] for u in users] == list(range(1, 26))" },
              { name: "it is a generator", code: "import types, fakeapi\nfakeapi.reset()\nassert isinstance(all_users(), types.GeneratorType)" },
              {
                name: "lazy — one page fetched for the first user",
                code: "import fakeapi\nfakeapi.reset()\ngen = all_users()\nnext(gen)\nassert fakeapi.request_count() == 1, f'made {fakeapi.request_count()} requests before it needed to'"
              },
              {
                name: "a different page size still works",
                code: "import fakeapi\nfakeapi.reset()\nassert len(list(all_users(per_page=5))) == 25\nassert fakeapi.request_count() == 5"
              },
              {
                name: "stops rather than looping forever",
                code: "import fakeapi\nfakeapi.reset()\nlist(all_users())\nassert fakeapi.request_count() == 3, f'expected 3 pages, made {fakeapi.request_count()} requests'"
              }
            ],
            solution: L([
              "import fakeapi",
              "",
              "",
              "def all_users(per_page=10):",
              "    page = 1",
              "    while True:",
              "        response = fakeapi.get('/users', params={'page': page, 'per_page': per_page})",
              "        if not response.ok:",
              "            raise RuntimeError(f'page {page} failed: {response.status_code}')",
              "        data = response.json()",
              "        yield from data['items']",
              "        if not data['has_next']:",
              "            return",
              "        page += 1"
            ]),
            takeaway: "The caller writes `for user in all_users():` and never thinks about pages. Hiding pagination behind a generator is one of the tidiest abstractions in client code."
          },
          {
            kind: "code", title: "Defensive parsing", difficulty: 3,
            concepts: ["api-errors"],
            prompt: L([
              "Write `display_name(payload)` that pulls `payload['user']['profile']['name']` **safely**,",
              "returning `'unknown'` when any level is missing or not a dictionary.",
              "",
              "It must never raise."
            ]),
            starter: "def display_name(payload):\n    ",
            hints: [
              "Chained `.get(key, {})` calls give an empty dict rather than `None` at each level.",
              "Guard against the payload not being a dict at all."
            ],
            tests: [
              { name: "full payload", call: "display_name({'user': {'profile': {'name': 'ada'}}})", expect: "ada" },
              { name: "missing name", call: "display_name({'user': {'profile': {}}})", expect: "unknown" },
              { name: "missing profile", call: "display_name({'user': {}})", expect: "unknown" },
              { name: "empty payload", call: "display_name({})", expect: "unknown" },
              { name: "wrong type inside", call: "display_name({'user': 'not a dict'})", expect: "unknown" },
              { name: "not a dict at all", call: "display_name(None)", expect: "unknown" }
            ],
            solution: L([
              "def display_name(payload):",
              "    if not isinstance(payload, dict):",
              "        return 'unknown'",
              "    user = payload.get('user')",
              "    if not isinstance(user, dict):",
              "        return 'unknown'",
              "    profile = user.get('profile')",
              "    if not isinstance(profile, dict):",
              "        return 'unknown'",
              "    return profile.get('name', 'unknown')"
            ])
          },
          {
            kind: "quiz", title: "Backoff", difficulty: 3,
            concepts: ["api-retry"],
            prompt: "Why retry with exponentially increasing delays rather than immediately?",
            choices: [
              "It makes the code shorter",
              "Immediate retries from many clients pile more load onto a service that is already struggling, often preventing it from recovering",
              "The server ignores fast requests",
              "It avoids using a timeout"
            ],
            answer: 1,
            explain: "A retry storm is a well-known way to turn a brief blip into a full outage. Backing off gives the service room to recover, and jitter stops every client retrying in lockstep."
          }
        ]
      },

      {
        id: "m24l3", title: "Designing an API", minutes: 11,
        concepts: ["api-design", "api-auth"],
        content: L([
          "## Resources, not actions",
          "",
          "URLs name **things**; methods say what to do to them.",
          "",
          "| Instead of | Write |",
          "|---|---|",
          "| `GET /getUser?id=7` | `GET /users/7` |",
          "| `POST /createUser` | `POST /users` |",
          "| `POST /deleteUser` | `DELETE /users/7` |",
          "| `GET /users/7/getOrders` | `GET /users/7/orders` |",
          "",
          "Plural nouns for collections, the id for a member, nesting for relationships. Once a caller has seen",
          "two of your endpoints they can guess the rest — that is the whole benefit.",
          "",
          "## Return the right status",
          "",
          "| Situation | Status |",
          "|---|---|",
          "| read succeeded | `200 OK` |",
          "| created something | `201 Created` + a `Location` header |",
          "| succeeded, nothing to return | `204 No Content` |",
          "| the request was malformed | `400 Bad Request` |",
          "| not authenticated | `401 Unauthorized` |",
          "| authenticated but not allowed | `403 Forbidden` |",
          "| no such resource | `404 Not Found` |",
          "| conflicts with current state | `409 Conflict` |",
          "| valid syntax, invalid content | `422 Unprocessable Entity` |",
          "| the client is going too fast | `429 Too Many Requests` |",
          "| we broke | `500 Internal Server Error` |",
          "",
          ":::warn Never return 200 with an error inside",
          "~~~py",
          '{"status": "error", "message": "not found"}    # with 200 OK',
          "~~~",
          "Every client, proxy, cache and monitoring tool reads the status code. Returning 200 for a failure",
          "means none of them can tell that anything went wrong.",
          ":::",
          "",
          "## Useful errors",
          "",
          "~~~py",
          "{",
          '  "error": "validation_failed",',
          '  "message": "email must contain @",',
          '  "field": "email"',
          "}",
          "~~~",
          "",
          "A machine-readable code, a human-readable message, and where the problem was. `{'error': 'invalid'}`",
          "gives the caller nothing to act on.",
          "",
          "## Pagination and filtering",
          "",
          "~~~text",
          "GET /users?page=2&per_page=50&status=active&sort=-created_at",
          "~~~",
          "",
          "Always paginate collections — even when there are only twelve rows today. Adding pagination later",
          "is a breaking change; having it from the start costs nothing.",
          "",
          "## Versioning",
          "",
          "~~~text",
          "/v1/users",
          "~~~",
          "",
          "Once anyone depends on your API you cannot remove or rename a field without breaking them.",
          "**Adding** is safe; **changing** and **removing** are not. A version in the path lets you make",
          "breaking changes without breaking existing callers.",
          "",
          "## Authentication",
          "",
          "| Approach | Used for |",
          "|---|---|",
          "| API key in a header | server-to-server, simple |",
          "| Bearer token (JWT) | user sessions, short-lived |",
          "| OAuth 2 | acting on behalf of a user of another service |",
          "",
          "Non-negotiables:",
          "",
          "- **HTTPS always** — a token sent over plain HTTP is a public token",
          "- **never in the URL** — query strings end up in logs, browser history and referrer headers",
          "- **never in source control** — read them from environment variables",
          "- **expire and rotate them**",
          "",
          ":::tip The test of a good API",
          "Can someone use it correctly from the documentation, without reading your source and without asking",
          "you a question? Consistency beats cleverness: predictable naming, predictable errors, predictable",
          "pagination.",
          ":::"
        ]),
        exercises: [
          {
            kind: "quiz", title: "Name the endpoint", difficulty: 2,
            concepts: ["api-design"],
            prompt: "Which URL best follows REST conventions for deleting order 42?",
            choices: [
              "`POST /deleteOrder?id=42`",
              "`DELETE /orders/42`",
              "`GET /orders/delete/42`",
              "`POST /orders/42/delete`"
            ],
            answer: 1,
            explain: "The URL names the resource and the method says what to do with it. It is also idempotent — deleting twice leaves the same state — which makes retrying safe."
          },
          {
            kind: "quiz", title: "The right status", difficulty: 3,
            concepts: ["api-design"],
            prompt: "A `POST /users` succeeds and creates a user. What should it return?",
            choices: ["`200 OK`", "`201 Created`", "`204 No Content`", "`202 Accepted`"],
            answer: 1,
            explain: "`201 Created` specifically means a new resource exists, and conventionally comes with a `Location` header pointing at it. `200` is not wrong enough to break anything, but `201` tells the client more."
          },
          {
            kind: "code", title: "Design the response", difficulty: 3,
            concepts: ["api-design"],
            prompt: L([
              "Write `make_response(status, data=None, error=None, message=None)` returning a",
              "`(status_code, body)` tuple following good API conventions:",
              "",
              "- for a 2xx, the body is `{'data': data}`",
              "- for anything else, the body is `{'error': error, 'message': message}`",
              "- a non-2xx with no `error` code raises `ValueError` — errors must always be identifiable",
              "",
              "The status code passes through unchanged."
            ]),
            starter: "def make_response(status, data=None, error=None, message=None):\n    ",
            hints: [
              "`200 <= status < 300` is success.",
              "Validate the error case before building the body."
            ],
            tests: [
              { name: "success wraps data", call: "make_response(200, data={'id': 1})", expect: [200, { data: { id: 1 } }] },
              { name: "created", call: "make_response(201, data={'id': 2})", expect: [201, { data: { id: 2 } }] },
              {
                name: "error body",
                call: "make_response(404, error='not_found', message='no such user')",
                expect: [404, { error: "not_found", message: "no such user" }]
              },
              {
                name: "an error without a code is refused",
                code: "try:\n    make_response(500)\n    raise AssertionError('should raise')\nexcept ValueError:\n    pass"
              },
              { name: "success with no data", call: "make_response(204)", expect: [204, { data: null }] }
            ],
            solution: L([
              "def make_response(status, data=None, error=None, message=None):",
              "    if 200 <= status < 300:",
              "        return status, {'data': data}",
              "    if not error:",
              "        raise ValueError('non-success responses need a machine-readable error code')",
              "    return status, {'error': error, 'message': message}"
            ])
          },
          {
            kind: "quiz", title: "Where not to put a token", difficulty: 3,
            concepts: ["api-auth"],
            prompt: "Why should an API token never be passed in the query string?",
            choices: [
              "Query strings have a length limit",
              "URLs are recorded in server logs, browser history and referrer headers, so the token leaks in several places at once",
              "The server cannot read query strings",
              "It makes the request slower"
            ],
            answer: 1,
            explain: "A header is not logged by default and is not part of the URL, so it does not end up in access logs, bookmarks or the `Referer` header sent to third-party sites."
          }
        ]
      }
    ],

    checkpoint: {
      id: "m24cp", pass: 0.8,
      title: "Checkpoint: APIs & the Web",
      items: [
        {
          kind: "quiz", title: "4xx or 5xx", difficulty: 2, concepts: ["status-codes"],
          prompt: "Which status codes are worth retrying automatically?",
          choices: [
            "All of them",
            "5xx and 429 — but not other 4xx",
            "Only 404",
            "None — always fail immediately"
          ],
          answer: 1,
          explain: "4xx means the request itself is wrong, so repeating it changes nothing. 5xx and 429 are transient conditions on the server side, which is exactly what retries are for."
        },
        {
          kind: "code", title: "Count active users", difficulty: 4, concepts: ["api-pagination"],
          prompt: "Using `fakeapi`, write `count_active()` returning how many users across all pages have `active` set to true. There are 25 users.",
          files: { "fakeapi.py": FAKEAPI },
          starter: "import fakeapi\n\n\ndef count_active():\n    ",
          tests: [
            { name: "counts across pages", code: "import fakeapi\nfakeapi.reset()\nexpected = sum(1 for u in fakeapi.USERS if u['active'])\nassert count_active() == expected" },
            { name: "reads every page", code: "import fakeapi\nfakeapi.reset()\ncount_active()\nassert fakeapi.request_count() >= 3, 'you must read all the pages'" }
          ]
        },
        {
          kind: "quiz", title: "Timeouts", difficulty: 2, concepts: ["api-errors"],
          prompt: "What happens if you call `requests.get(url)` with no timeout and the server hangs?",
          choices: [
            "It fails after 30 seconds",
            "It can block indefinitely, hanging your program",
            "It retries automatically",
            "It raises immediately"
          ],
          answer: 1,
          explain: "There is no default timeout. A hung connection blocks forever, which is why every HTTP call in production code should pass one."
        },
        {
          kind: "code", title: "Safe field access", difficulty: 3, concepts: ["api-errors"],
          prompt: "Write `get_city(payload)` returning `payload['address']['city']` or `'n/a'` if anything is missing or the wrong shape.",
          starter: "def get_city(payload):\n    ",
          tests: [
            { name: "present", call: "get_city({'address': {'city': 'London'}})", expect: "London" },
            { name: "missing city", call: "get_city({'address': {}})", expect: "n/a" },
            { name: "missing address", call: "get_city({})", expect: "n/a" },
            { name: "wrong type", call: "get_city({'address': 5})", expect: "n/a" }
          ]
        },
        {
          kind: "quiz", title: "Breaking changes", difficulty: 3, concepts: ["api-design"],
          prompt: "Which change to a public API is safe to make without a new version?",
          choices: [
            "Renaming a response field",
            "Adding a new optional response field",
            "Changing a field from a string to a number",
            "Removing an endpoint"
          ],
          answer: 1,
          explain: "Existing clients ignore fields they do not know about, so adding one is backwards compatible. Renaming, retyping or removing all break callers that depend on the old shape."
        }
      ]
    }
  });
})();
