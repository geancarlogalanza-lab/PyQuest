/* PyQuest — the skill map. The honest scoreboard. */
(function (PQ) {
  'use strict';
  const U = PQ.util;
  const { el, esc, md } = U;

  function bucket(s) { return s <= 0 ? 0 : s < 0.35 ? 1 : s < 0.6 ? 2 : s < 0.8 ? 3 : 4; }
  const LABEL = ['not started', 'shaky', 'learning', 'solid', 'mastered'];

  function render(host) {
    const wrap = el('div', { class: 'wrap wide' });
    host.appendChild(wrap);
    PQ.ui.topbar([el('h1', { style: 'margin:0;font-size:1.2rem', text: 'Skill map' }), el('span', { style: 'flex:1' })]);

    const all = PQ.content.allConcepts();
    const counts = [0, 0, 0, 0, 0];
    all.forEach(c => counts[bucket(PQ.engine.strengthOf(c.id))]++);

    wrap.appendChild(el('p', { class: 'muted', text: 'Strength is evidence-based and decays with time. It goes up when you solve something unaided, and down when you need help or let it go stale.' }));

    wrap.appendChild(el('div', { class: 'grid g4 mt' }, [
      PQ.ui.stat(counts[4], 'mastered'),
      PQ.ui.stat(counts[3], 'solid'),
      PQ.ui.stat(counts[2] + counts[1], 'in progress'),
      PQ.ui.stat(counts[0], 'not started')
    ]));

    const legend = el('div', { class: 'row wrap mt', style: 'gap:10px' });
    [4, 3, 2, 1, 0].forEach(b => {
      legend.appendChild(el('span', { class: 'row tiny dim', style: 'gap:5px' }, [
        el('span', { class: 'bar s' + b, style: 'width:22px;height:6px;display:inline-block' }, [el('i', { style: 'width:100%' })]),
        el('span', { text: LABEL[b] })
      ]));
    });
    wrap.appendChild(legend);

    PQ.content.TIERS.forEach(t => {
      const mods = PQ.content.modulesInTier(t.n);
      if (!mods.length) return;
      const sec = el('section', { class: 'tier tier-' + t.n, style: 'margin-top:26px' });
      sec.appendChild(el('div', { class: 'tier-head' }, [
        el('div', { class: 'tier-badge', text: t.badge }),
        el('div', { style: 'font-weight:800', text: 'Tier ' + t.n + ' — ' + t.name })
      ]));
      mods.forEach(m => {
        if (!(m.concepts || []).length) return;
        sec.appendChild(el('div', { class: 'small muted', style: 'margin:12px 0 6px;font-weight:700', text: m.icon + ' ' + m.title }));
        const grid = el('div', { class: 'skillgrid' });
        m.concepts.forEach(c => {
          const s = PQ.engine.strengthOf(c.id);
          const b = bucket(s);
          const cs = PQ.engine.state.concepts[c.id];
          const title = LABEL[b] + (cs && cs.lastAt ? ' · last practised ' + U.ago(cs.lastAt) + (cs.dueAt ? ' · due ' + dueLabel(cs.dueAt) : '') : '');
          grid.appendChild(el('div', { class: 'skill', title }, [
            el('div', { class: 'sn', text: c.name }),
            el('div', { class: 'bar s' + b }, [el('i', { style: 'width:' + Math.max(3, Math.round(s * 100)) + '%' })])
          ]));
        });
        sec.appendChild(grid);
      });
      wrap.appendChild(sec);
    });

    const ranking = PQ.engine.conceptRanking().slice(0, 10);
    if (ranking.length) {
      wrap.appendChild(el('h2', { class: 'mt-lg', text: 'Needs attention most' }));
      const list = el('div', { class: 'stack tight' });
      ranking.forEach(r => {
        list.appendChild(el('div', { class: 'card', style: 'padding:10px 14px' }, [
          el('div', { class: 'spread' }, [
            el('div', { style: 'font-weight:600;font-size:.9rem', text: r.name }),
            el('span', { class: 'tiny dim', text: r.due <= Date.now() ? 'due now' : 'due ' + dueLabel(r.due) })
          ]),
          el('div', { class: 'bar sm s' + bucket(r.strength), style: 'margin-top:6px' }, [el('i', { style: 'width:' + Math.max(3, Math.round(r.strength * 100)) + '%' })])
        ]));
      });
      wrap.appendChild(list);
      wrap.appendChild(el('button', { class: 'btn primary mt block', text: 'Review these now', onclick: () => PQ.ui.go('#/practice') }));
    }
  }

  function dueLabel(ts) {
    const d = U.daysBetween(Date.now(), ts);
    if (d <= 0) return 'now';
    if (d === 1) return 'tomorrow';
    if (d < 14) return 'in ' + d + ' days';
    return 'in ' + Math.round(d / 7) + ' weeks';
  }

  PQ.ui.registerView('skills', { nav: 'skills', render });
})(window.PQ);
