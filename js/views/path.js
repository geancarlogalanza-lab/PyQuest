/* PyQuest — the journey map and module detail. */
(function (PQ) {
  'use strict';
  const U = PQ.util;
  const { el, esc, md } = U;

  /* Mastery bucket → chip class. Colour here is information, not decoration. */
  function chipClass(strength) {
    if (strength >= 0.75) return 'chip on';
    if (strength >= 0.4) return 'chip mid';
    if (strength > 0) return 'chip low';
    return 'chip';
  }

  function pathView(host) {
    const wrap = el('div', { class: 'wrap wide' });
    host.appendChild(wrap);
    const jp = PQ.engine.journeyProgress();
    PQ.ui.topbar([
      el('h1', { text: 'The journey' }),
      el('span', { class: 'grow' }),
      el('span', { class: 'progress-line hide-mobile', style: 'width:200px' }, [
        PQ.ui.bar(jp.pct, 'ok'),
        el('span', { text: jp.done + ' / ' + jp.total })
      ])
    ]);

    PQ.content.TIERS.forEach(t => {
      const mods = PQ.content.modulesInTier(t.n);
      if (!mods.length) return;
      const done = mods.filter(m => PQ.engine.moduleProgress(m).complete).length;
      const sec = el('section', { class: 'tier tier-' + t.n });
      sec.appendChild(el('div', { class: 'tier-head' }, [
        el('div', { class: 'tier-badge', text: t.badge }),
        el('div', { style: 'flex:1;min-width:0' }, [
          el('div', { class: 'tier-title', text: 'Tier ' + t.n + ' — ' + t.name }),
          el('div', { class: 'tiny dim', text: t.tag })
        ]),
        el('span', { class: 'tiny dim tabular', text: done + ' of ' + mods.length + ' complete' })
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

    /* The module number replaces the emoji: it occupies the same space and
       tells you where you are in a thirty-module sequence. */
    const mark = el('div', { class: 'mod-ico' });
    if (!unlocked) mark.appendChild(PQ.icon('lock', 15));
    else if (prog.complete) mark.appendChild(PQ.icon('check', 16));
    else mark.appendChild(el('span', { text: String(m.order) }));

    return el('button', {
      class: 'mod' + (prog.complete ? ' done' : '') + (unlocked ? '' : ' locked'),
      onclick: () => unlocked ? PQ.ui.go('#/module/' + m.id) : PQ.ui.toast('Finish the previous module first.', '')
    }, [
      el('div', { class: 'mod-top' }, [
        mark,
        el('div', { style: 'flex:1;min-width:0' }, [
          el('div', { class: 'mod-name', text: m.title }),
          el('div', { class: 'mod-blurb', text: m.blurb || '' })
        ])
      ]),
      unlocked ? PQ.ui.bar(prog.pct, prog.complete ? 'ok' : '') : null,
      el('div', { class: 'mod-meta' }, [
        el('span', { text: unlocked ? prog.done + ' of ' + prog.total : U.plural((m.lessons || []).length, 'lesson') }),
        m.project ? el('span', { class: 'pill py tiny', style: 'margin-left:auto', text: 'Project' }) : null
      ])
    ]);
  }

  function moduleView(host, id) {
    const m = PQ.content.getModule(id);
    if (!m) { host.appendChild(el('div', { class: 'wrap' }, [el('p', { text: 'Unknown module.' })])); return; }
    const prog = PQ.engine.moduleProgress(m);
    const wrap = el('div', { class: 'wrap' });
    host.appendChild(wrap);

    PQ.ui.topbar([
      PQ.ui.backButton(() => PQ.ui.go('#/path'), 'Back to the journey'),
      PQ.ui.crumb([{ label: 'Journey', route: '#/path' }, { label: m.title }]),
      el('span', { class: 'grow' }),
      el('span', { class: 'tiny dim tabular hide-mobile', text: prog.done + ' / ' + prog.total })
    ]);

    /* Header: label, title, lead — a clear hierarchy instead of a floating icon */
    wrap.appendChild(el('div', { class: 'section-label', text: 'Tier ' + m.tier + ' · Module ' + m.order }));
    wrap.appendChild(el('h1', { style: 'margin:var(--s2) 0', text: m.title }));
    wrap.appendChild(el('p', { class: 'muted', style: 'font-size:var(--t-md);margin-bottom:var(--s4)', text: m.blurb || '' }));

    wrap.appendChild(el('div', { class: 'row', style: 'gap:var(--s3)' }, [
      PQ.ui.bar(prog.pct, prog.complete ? 'ok' : ''),
      el('span', { class: 'tiny dim tabular', style: 'flex:0 0 auto', text: prog.pct + '%' })
    ]));

    if (m.intro) {
      wrap.appendChild(el('div', { class: 'callout why mt' }, [
        el('span', { class: 'ct', text: 'Why this module exists' }),
        el('div', { class: 'prose', html: md(m.intro) })
      ]));
    }

    if ((m.concepts || []).length) {
      wrap.appendChild(PQ.ui.sectionHead('Skills you will build',
        el('span', { class: 'tiny dim', text: 'colour shows your current mastery' })));
      const chips = el('div', { class: 'chips' });
      m.concepts.forEach(c => {
        const s = PQ.engine.strengthOf(c.id);
        chips.appendChild(el('span', {
          class: chipClass(s), text: c.name,
          title: s > 0 ? Math.round(s * 100) + '% mastery' : 'not started'
        }));
      });
      wrap.appendChild(chips);
    }

    wrap.appendChild(PQ.ui.sectionHead('Contents'));
    const list = el('div', { class: 'stack tight' });
    m.units.forEach((u, i) => {
      const done = PQ.engine.isDone(u.id);
      const unlocked = PQ.engine.unitUnlocked(u);
      const cls = u.kind === 'checkpoint' ? ' boss' : u.kind === 'project' ? ' project' : '';
      const exCount = PQ.content.unitExercises(u).length;
      const sub = u.kind === 'checkpoint'
        ? U.plural((u.items || []).length, 'question') + ' · no hints'
        : u.kind === 'project'
          ? U.plural((u.stages || []).length, 'stage') + ' · ' + (u.xp || 300) + ' XP'
          : (u.minutes || 10) + ' min · ' + U.plural(exCount, 'challenge');

      const mark = el('div', { class: 'lr-ico' });
      if (!unlocked) mark.appendChild(PQ.icon('lock', 14));
      else if (done) mark.appendChild(PQ.icon('check', 15));
      else if (u.kind === 'checkpoint') mark.appendChild(PQ.icon('checkpoint', 15));
      else if (u.kind === 'project') mark.appendChild(PQ.icon('project', 15));
      else mark.appendChild(el('span', { text: String(i + 1) }));

      const row = el('button', {
        class: 'lesson-row' + (done ? ' done' : '') + cls + (unlocked ? '' : ' locked'),
        onclick: () => unlocked ? PQ.ui.go('#/unit/' + u.id) : PQ.ui.toast('Complete the step above first.', '')
      }, [
        mark,
        el('div', { class: 'lr-body' }, [
          el('div', { class: 'lr-title', text: u.title }),
          el('div', { class: 'lr-sub', text: sub })
        ])
      ]);
      if (unlocked) {
        const go = el('span', { class: 'lr-go' });
        go.appendChild(PQ.icon('chevron', 16));
        row.appendChild(go);
      }
      list.appendChild(row);
    });
    wrap.appendChild(list);
  }

  PQ.ui.registerView('path', { nav: 'path', render: pathView });
  PQ.ui.registerView('module', { nav: 'path', render: moduleView });
})(window.PQ);
