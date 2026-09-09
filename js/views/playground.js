/* PyQuest — free playground. Real Python, no grading. */
(function (PQ) {
  'use strict';
  const U = PQ.util;
  const { el, esc, md } = U;

  const SAMPLES = {
    'Blank': '',
    'FizzBuzz': 'for n in range(1, 21):\n    if n % 15 == 0:\n        print("FizzBuzz")\n    elif n % 3 == 0:\n        print("Fizz")\n    elif n % 5 == 0:\n        print("Buzz")\n    else:\n        print(n)\n',
    'Word count': 'text = """the quick brown fox jumps over the lazy dog\nthe dog barks and the fox runs"""\n\ncounts = {}\nfor word in text.split():\n    counts[word] = counts.get(word, 0) + 1\n\nfor word, n in sorted(counts.items(), key=lambda kv: -kv[1])[:5]:\n    print(f"{word:>6} {n}")\n',
    'Classes': 'from dataclasses import dataclass\n\n@dataclass\nclass Point:\n    x: float\n    y: float\n\n    def dist(self, other):\n        return ((self.x - other.x) ** 2 + (self.y - other.y) ** 2) ** 0.5\n\na, b = Point(0, 0), Point(3, 4)\nprint(a, b, a.dist(b))\n',
    'Files': 'from pathlib import Path\n\nPath("notes.txt").write_text("line one\\nline two\\n")\nfor i, line in enumerate(Path("notes.txt").read_text().splitlines(), 1):\n    print(i, line)\n',
    'SQLite': 'import sqlite3\n\ncon = sqlite3.connect(":memory:")\ncon.execute("create table pets (name text, kind text, age int)")\ncon.executemany("insert into pets values (?,?,?)",\n                [("Rex", "dog", 3), ("Mia", "cat", 7), ("Bo", "dog", 1)])\n\nfor row in con.execute("select kind, count(*), avg(age) from pets group by kind"):\n    print(row)\n'
  };

  function render(host) {
    const wrap = el('div', { class: 'wrap wide' });
    host.appendChild(wrap);
    PQ.ui.topbar([
      el('h1', { text: 'Playground' }),
      el('span', { style: 'flex:1' }),
      PQ.ui.statusChip()
    ]);
    wrap.appendChild(el('p', { class: 'muted small', text: 'A scratch pad with the real interpreter. Nothing here is graded — use it to try an idea, test a hunch, or debug something from a lesson. Your code is saved automatically.' }));

    const picker = el('div', { class: 'row wrap mt', style: 'gap:6px' });
    Object.keys(SAMPLES).forEach(k => {
      picker.appendChild(el('button', {
        class: 'btn sm ghost', text: k,
        onclick: () => { ed.value = SAMPLES[k]; PQ.engine.setDraft('playground', ed.value); }
      }));
    });
    wrap.appendChild(picker);

    const edHost = el('div', { class: 'mt' });
    wrap.appendChild(edHost);
    const saved = PQ.engine.getDraft('playground');
    const ed = PQ.editor.create(edHost, {
      value: saved === null || saved === undefined ? SAMPLES.FizzBuzz : saved,
      filename: 'scratch.py',
      minHeight: '300px',
      onChange: v => PQ.engine.setDraft('playground', v),
      onRun: () => run()
    });

    const stdinBox = el('textarea', { rows: '2', placeholder: 'Optional input() lines — one per line' });
    const stdinWrap = el('details', { class: 'mt' }, [
      el('summary', { class: 'small muted', style: 'cursor:pointer', text: 'Provide input for input()' }),
      el('div', { class: 'mt' }, [stdinBox])
    ]);
    wrap.appendChild(stdinWrap);

    const runBtn = el('button', { class: 'btn primary lg', onclick: () => run() },
      [PQ.icon('play', 14), el('span', { text: 'Run' })]);
    wrap.appendChild(el('div', { class: 'btn-group sticky-actions' }, [
      runBtn,
      el('button', { class: 'btn ghost', text: 'Clear output', onclick: () => { out.classList.add('hidden'); } }),
      el('span', { class: 'tiny dim hide-mobile', style: 'align-self:center;margin-left:auto', html: '<span class="kbd">Ctrl</span>+<span class="kbd">↵</span> to run' })
    ]));

    const out = el('div', { class: 'console mt hidden', style: 'max-height:420px' });
    wrap.appendChild(out);

    async function run() {
      runBtn.disabled = true; runBtn.innerHTML = '';
      runBtn.appendChild(el('span', { class: 'spinner' }));
      runBtn.appendChild(el('span', { text: 'Running' }));
      const stdin = stdinBox.value ? stdinBox.value.split('\n') : [];
      const t0 = performance.now();
      const r = await PQ.runner.exec({ code: ed.value, stdin });
      const ms = Math.round(performance.now() - t0);
      runBtn.disabled = false; runBtn.innerHTML = '';
      runBtn.appendChild(PQ.icon('play', 14));
      runBtn.appendChild(el('span', { text: 'Run' }));
      PQ.engine.record('playground', { runs: 1 });
      out.classList.remove('hidden');
      out.innerHTML = '';
      out.appendChild(el('div', { class: 'c-head', text: (r.error ? 'Error' : 'Output') + ' · ' + ms + ' ms' }));
      const text = (r.stdout || '').replace(/\n+$/, '');
      if (text) out.appendChild(el('pre', { text }));
      else if (!r.error) out.appendChild(el('div', { class: 'empty', text: 'No output.' }));
      if (r.error) {
        out.appendChild(el('pre', { class: 'err', text: r.error }));
        ed.markError(PQ.errors.errorLine(r.error));
        const ex = PQ.errors.explain(r.error);
        if (ex) out.appendChild(el('div', { class: 'callout trap', style: 'margin:0' }, [
          el('span', { class: 'ct', text: 'What that means' }),
          el('div', { class: 'prose', html: md('**' + ex.title + '**\n\n' + ex.body) })
        ]));
      } else ed.clearMarks();
    }
  }

  PQ.ui.registerView('playground', { nav: 'playground', render });
})(window.PQ);
