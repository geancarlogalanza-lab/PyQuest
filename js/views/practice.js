/* PyQuest — spaced review and free practice. */
(function (PQ) {
  'use strict';
  const U = PQ.util;
  const { el, esc, md } = U;

  function render(host) {
    const E = PQ.engine;
    const wrap = el('div', { class: 'wrap' });
    host.appendChild(wrap);
    PQ.ui.topbar([el('h1', { style: 'margin:0;font-size:1.2rem', text: 'Practice' }),
      el('span', { style: 'flex:1' }), PQ.ui.statusChip({ compact: true })]);

    const ranking = E.conceptRanking();
    const due = E.dueCount();
    const solvedCount = Object.values(E.state.exercises).filter(e => e.solved).length;

    if (!solvedCount) {
      const seed = el('div', { class: 'es-ico' });
      seed.appendChild(PQ.icon('review', 22));
      wrap.appendChild(el('div', { class: 'empty-state' }, [
        seed,
        el('h2', { text: 'Nothing to review yet' }),
        el('p', { text: 'Solve a few challenges first. Everything you solve comes back here on a spaced schedule so it actually sticks.' }),
        el('button', { class: 'btn primary mt', text: 'Start learning', onclick: () => PQ.ui.go('#/home') })
      ]));
      return;
    }

    /* review session card */
    const weakest = ranking.slice(0, 6);
    wrap.appendChild(el('div', { class: 'card pad-lg' }, [
      el('div', { class: 'spread' }, [
        el('div', [
          el('h2', { style: 'margin:0', text: 'Review session' }),
          el('div', { class: 'muted small', text: due ? U.plural(due, 'skill') + ' due right now' : 'Nothing overdue — a session still strengthens your weakest skills.' })
        ]),
        el('span', { class: 'pill ' + (due ? 'warn' : 'ok'), text: due ? due + ' due' : 'all fresh' })
      ]),
      weakest.length ? el('div', { class: 'mt' }, [
        el('div', { class: 'tiny dim', style: 'margin-bottom:6px;font-weight:700;text-transform:uppercase;letter-spacing:.07em', text: 'Weakest right now' }),
        el('div', { class: 'row wrap', style: 'gap:6px' },
          weakest.map(r => el('span', { class: 'pill ' + (r.strength < 0.35 ? 'err' : r.strength < 0.65 ? 'warn' : ''), text: r.name + ' · ' + Math.round(r.strength * 100) + '%' })))
      ]) : null,
      el('div', { class: 'btn-group mt' }, [
        el('button', { class: 'btn primary lg', text: 'Start 8-item review', onclick: () => session(host, 8) }),
        el('button', { class: 'btn', text: 'Quick 4', onclick: () => session(host, 4) }),
        el('button', { class: 'btn ghost', text: 'Marathon 15', onclick: () => session(host, 15) })
      ])
    ]));

    /* module drill */
    wrap.appendChild(el('h2', { class: 'mt-lg', text: 'Drill a module' }));
    wrap.appendChild(el('p', { class: 'muted small', text: 'Re-solve challenges from anything you have already been through. Practice XP is small on purpose — the point is retention, not farming.' }));
    const grid = el('div', { class: 'stack tight' });
    PQ.content.allModules().forEach(m => {
      const exs = (m.lessons || []).flatMap(l => l.exercises || []).filter(e => (E.state.exercises[e.id] || {}).solved);
      if (!exs.length) return;
      grid.appendChild(el('button', {
        class: 'lesson-row',
        onclick: () => session(host, Math.min(8, exs.length), exs)
      }, [
        el('div', { class: 'lr-ico' }, [el('span', { text: String(m.order) })]),
        el('div', { class: 'lr-body' }, [
          el('div', { class: 'lr-title', text: m.title }),
          el('div', { class: 'lr-sub', text: U.plural(exs.length, 'solved challenge') + ' available' })
        ]),
        el('span', { class: 'pill tiny', text: 'Tier ' + m.tier })
      ]));
    });
    wrap.appendChild(grid);

    /* skill decay explainer */
    wrap.appendChild(el('div', { class: 'callout why mt-lg' }, [
      el('span', { class: 'ct', text: 'How review scheduling works' }),
      el('div', { class: 'prose', html: md(
        'Each skill has a strength that **decays over time**. Solving something unaided pushes the next review further out; getting it wrong pulls it much closer. ' +
        'That is why the same challenge can reappear a week later — recall practice is what moves knowledge into long-term memory, and re-reading is not.') })
    ]));
  }

  /* ---------------- session runner ---------------- */
  function session(host, size, pool) {
    const items = pool
      ? shuffle(pool.slice()).slice(0, size).map(ex => ({ ex, forConcept: (ex.concepts || [])[0] }))
      : PQ.engine.buildReview(size);
    if (!items.length) { PQ.ui.toast('Nothing available to review yet.', ''); return; }

    let i = 0, right = 0;
    const shell = el('div');
    host.innerHTML = '';
    host.appendChild(shell);

    function paint() {
      shell.innerHTML = '';
      PQ.ui.topbar([
        el('button', { class: 'btn ghost sm', html: '←', onclick: () => PQ.ui.render() }),
        el('b', { text: 'Review' }),
        el('span', { style: 'flex:1' }),
        el('span', { class: 'pill', text: (i + 1) + ' / ' + items.length }),
        PQ.ui.statusChip({ compact: true })
      ]);
      if (i >= items.length) return done();
      const { ex, forConcept } = items[i];
      const wrap = el('div', { class: 'wrap' });
      shell.appendChild(wrap);
      wrap.appendChild(el('div', { class: 'bar ok mb' }, [el('i', { style: 'width:' + U.pct(i, items.length) + '%' })]));
      if (forConcept) wrap.appendChild(el('div', { class: 'tiny dim mb', text: 'Recalling: ' + PQ.content.getConcept(forConcept).name }));
      let counted = false;
      PQ.exercise.mount(wrap, ex, {
        mode: 'review',
        showNext: true,
        nextLabel: i + 1 >= items.length ? 'Finish review →' : 'Next →',
        onSolved: () => { if (!counted) { counted = true; right += 1; } },
        onNext: () => { i += 1; paint(); }
      });
      wrap.appendChild(el('div', { class: 'center mt' }, [
        el('button', {
          class: 'btn ghost sm', text: 'Skip →',
          onclick: () => {
            if (!counted) {
              counted = true;
              PQ.engine.record('attempt', { ex: ex.id, ok: false, tries: 2, hints: 0, kind: ex.kind, review: true, concepts: ex.concepts || [] });
            }
            i += 1; paint();
          }
        })
      ]));
    }

    function done() {
      const bonus = Math.round(20 + 40 * (right / Math.max(1, items.length)));
      const res = PQ.engine.record('review', { xp: bonus, n: items.length, right });
      PQ.ui.reward(res, 'review complete');
      shell.innerHTML = '';
      shell.appendChild(el('div', { class: 'wrap' }, [
        el('div', { class: 'card pad-lg center' }, [
          reviewMark(right, items.length),
          el('h1', { text: 'Review complete' }),
          el('p', { class: 'muted', text: right + ' of ' + items.length + ' recalled without help.' }),
          el('div', { class: 'grid g3 mt' }, [
            PQ.ui.stat(right + '/' + items.length, 'recalled'),
            PQ.ui.stat('+' + res.xpGained, 'xp'),
            PQ.ui.stat(PQ.engine.dueCount(), 'still due')
          ]),
          el('div', { class: 'btn-group mt-lg', style: 'justify-content:center' }, [
            el('button', { class: 'btn primary', text: 'Another session', onclick: () => PQ.ui.render() }),
            el('button', { class: 'btn ghost', text: 'Back to learning', onclick: () => PQ.ui.go('#/home') })
          ])
        ])
      ]));
    }

    paint();
  }

  function reviewMark(right, total) {
    const good = right === total;
    const ok = right >= total / 2;
    const m = el('div', { style: 'display:grid;place-items:center;width:48px;height:48px;margin:0 auto var(--s3);border-radius:50%;background:' + (good ? 'var(--ok-soft);color:var(--ok)' : ok ? 'var(--acc-soft);color:var(--acc)' : 'var(--warn-soft);color:var(--warn)') });
    m.appendChild(PQ.icon(good ? 'check' : 'review', 24));
    return m;
  }

  function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

  PQ.ui.registerView('practice', { nav: 'practice', render });
})(window.PQ);
