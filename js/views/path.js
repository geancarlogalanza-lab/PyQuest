/* PyQuest — the journey map and module detail. */
(function (PQ) {
  'use strict';
  const U = PQ.util;
  const { el, esc, md } = U;

  function pathView(host) {
    const wrap = el('div', { class: 'wrap wide' });
    host.appendChild(wrap);
    PQ.ui.topbar([el('h1', { style: 'margin:0;font-size:1.2rem', text: 'The journey' }),
      el('span', { style: 'flex:1' }),
      el('span', { class: 'pill', text: PQ.engine.journeyProgress().pct + '% complete' })]);

    PQ.content.TIERS.forEach(t => {
      const mods = PQ.content.modulesInTier(t.n);
      if (!mods.length) return;
      const sec = el('section', { class: 'tier tier-' + t.n });
      const allDone = mods.every(m => PQ.engine.moduleProgress(m).complete);
      sec.appendChild(el('div', { class: 'tier-head' }, [
        el('div', { class: 'tier-badge', text: t.badge }),
        el('div', { style: 'flex:1;min-width:0' }, [
          el('div', { style: 'font-weight:800;font-size:1.08rem', text: 'Tier ' + t.n + ' — ' + t.name }),
          el('div', { class: 'tiny dim', text: t.tag })
        ]),
        allDone ? el('span', { class: 'pill ok', text: '✓ complete' }) : null
      ]));
      const grid = el('div', { class: 'mods' });
      mods.forEach(m => grid.appendChild(moduleCard(m)));
      sec.appendChild(grid);
      wrap.appendChild(sec);
    });
  }

  function moduleCard(m) {
    const prog = PQ.engine.moduleProgress(m);
    const unlocked = PQ.engine.moduleUnlocked(m);
    const card = el('button', {
      class: 'mod' + (prog.complete ? ' done' : '') + (unlocked ? '' : ' locked'),
      onclick: () => unlocked ? PQ.ui.go('#/module/' + m.id) : PQ.ui.toast('Finish the previous module first.', '')
    }, [
      el('div', { class: 'mod-top' }, [
        el('div', { class: 'mod-ico', text: unlocked ? (m.icon || '📘') : '🔒' }),
        el('div', { style: 'flex:1;min-width:0' }, [
          el('div', { class: 'mod-name', text: m.title }),
          el('div', { class: 'mod-blurb', text: m.blurb || '' })
        ]),
        prog.complete ? el('span', { class: 'pill ok', text: '✓' }) : null
      ]),
      el('div', { class: 'bar sm' }, [el('i', { style: 'width:' + prog.pct + '%' })]),
      el('div', { class: 'mod-meta' }, [
        el('span', { text: prog.done + '/' + prog.total + ' done' }),
        el('span', { text: '·' }),
        el('span', { text: U.plural((m.lessons || []).length, 'lesson') }),
        m.project ? el('span', { class: 'pill py tiny', style: 'margin-left:auto', text: '🏗️ project' }) : null
      ])
    ]);
    return card;
  }

  function moduleView(host, id) {
    const m = PQ.content.getModule(id);
    if (!m) { host.appendChild(el('div', { class: 'wrap' }, [el('p', { text: 'Unknown module.' })])); return; }
    const prog = PQ.engine.moduleProgress(m);
    const wrap = el('div', { class: 'wrap' });
    host.appendChild(wrap);

    PQ.ui.topbar([
      el('button', { class: 'btn ghost sm', html: '←', onclick: () => PQ.ui.go('#/path') }),
      PQ.ui.crumb([{ label: 'Journey', route: '#/path' }, { label: m.title }]),
      el('span', { style: 'flex:1' }),
      el('span', { class: 'pill', text: prog.done + '/' + prog.total })
    ]);

    wrap.appendChild(el('div', { class: 'row', style: 'gap:14px;align-items:flex-start' }, [
      el('div', { style: 'font-size:2.4rem;line-height:1', text: m.icon || '📘' }),
      el('div', { style: 'flex:1;min-width:0' }, [
        el('div', { class: 'row wrap', style: 'gap:6px;margin-bottom:4px' }, [
          el('span', { class: 'pill', text: 'Tier ' + m.tier }),
          el('span', { class: 'pill', text: 'Module ' + m.order })
        ]),
        el('h1', { style: 'margin:0 0 4px', text: m.title }),
        el('div', { class: 'muted', text: m.blurb || '' })
      ])
    ]));

    wrap.appendChild(el('div', { class: 'bar ok mt' }, [el('i', { style: 'width:' + prog.pct + '%' })]));

    if (m.intro) wrap.appendChild(el('div', { class: 'callout why mt' }, [
      el('span', { class: 'ct', text: 'What this module is for' }),
      el('div', { class: 'prose', html: md(m.intro) })
    ]));

    if ((m.concepts || []).length) {
      wrap.appendChild(el('h2', { class: 'mt-lg', text: 'Skills you will build' }));
      const chips = el('div', { class: 'row wrap', style: 'gap:6px' });
      m.concepts.forEach(c => {
        const s = PQ.engine.strengthOf(c.id);
        const cls = s >= 0.75 ? 'ok' : s >= 0.4 ? 'warn' : s > 0 ? 'err' : '';
        chips.appendChild(el('span', { class: 'pill ' + cls, text: c.name, title: s > 0 ? Math.round(s * 100) + '% mastery' : 'not started' }));
      });
      wrap.appendChild(chips);
    }

    wrap.appendChild(el('h2', { class: 'mt-lg', text: 'Contents' }));
    const list = el('div', { class: 'stack tight' });
    m.units.forEach((u, i) => {
      const done = PQ.engine.isDone(u.id);
      const unlocked = PQ.engine.unitUnlocked(u);
      const cls = u.kind === 'checkpoint' ? ' boss' : u.kind === 'project' ? ' project' : '';
      const icon = done ? '✓' : (u.kind === 'checkpoint' ? '🛡️' : u.kind === 'project' ? '🏗️' : String(i + 1));
      const exCount = PQ.content.unitExercises(u).length;
      const sub = u.kind === 'checkpoint' ? U.plural((u.items || []).length, 'question') + ' · no hints'
        : u.kind === 'project' ? U.plural((u.stages || []).length, 'stage') + ' · +' + (u.xp || 300) + ' XP'
          : '~' + (u.minutes || 10) + ' min · ' + U.plural(exCount, 'challenge');
      list.appendChild(el('button', {
        class: 'lesson-row' + (done ? ' done' : '') + cls + (unlocked ? '' : ' locked'),
        onclick: () => unlocked ? PQ.ui.go('#/unit/' + u.id) : PQ.ui.toast('Complete the step above first.', '')
      }, [
        el('div', { class: 'lr-ico', text: unlocked ? icon : '🔒' }),
        el('div', { class: 'lr-body' }, [
          el('div', { class: 'lr-title', text: u.title }),
          el('div', { class: 'lr-sub', text: sub })
        ]),
        done ? el('span', { class: 'pill ok tiny', text: 'done' }) : null
      ]));
    });
    wrap.appendChild(list);
  }

  PQ.ui.registerView('path', { nav: 'path', render: pathView });
  PQ.ui.registerView('module', { nav: 'path', render: moduleView });
})(window.PQ);
