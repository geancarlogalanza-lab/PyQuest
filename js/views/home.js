/* PyQuest — dashboard. */
(function (PQ) {
  'use strict';
  const U = PQ.util;
  const { el, esc, md } = U;

  function render(host) {
    const E = PQ.engine, st = E.state;
    const li = E.levelInfo(), rank = E.rank(), streak = E.streakInfo(), jp = E.journeyProgress();
    const wrap = el('div', { class: 'wrap' });
    host.appendChild(wrap);

    PQ.ui.topbar([
      el('div', [
        el('div', { style: 'font-weight:650', text: greeting() }),
        el('div', { class: 'tiny dim', text: new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' }) })
      ]),
      el('span', { class: 'grow' }),
      PQ.ui.statusChip()
    ]);

    /* ---- level + streak ---- */
    const hero = el('div', { class: 'hero' });
    hero.appendChild(el('div', { class: 'row', style: 'gap:var(--s4);flex-wrap:wrap' }, [
      el('div', { class: 'lvl-ring', style: '--p:' + li.pct + '%' }, [el('span', { text: String(li.level) })]),
      el('div', { style: 'flex:1;min-width:180px' }, [
        el('div', { style: 'font-weight:650;font-size:var(--t-md)', text: rank.name }),
        el('div', { class: 'small dim tabular', text: li.max ? 'Maximum level' : (li.span - li.into).toLocaleString() + ' XP to level ' + (li.level + 1) }),
        el('div', { style: 'margin-top:var(--s3)' }, [PQ.ui.bar(li.pct)])
      ]),
      streakBlock(streak)
    ]));

    const days = el('div', { class: 'streak-days', style: 'margin-top:var(--s4)' });
    streak.days.forEach(d => days.appendChild(el('i', {
      class: (d.on ? 'on' : '') + (d.today ? ' today' : ''), text: d.label
    })));
    hero.appendChild(days);
    if (streak.mult > 1) {
      hero.appendChild(el('div', { class: 'tiny dim', style: 'margin-top:var(--s2)',
        text: 'Streak bonus ×' + streak.mult.toFixed(2) + (streak.freezes ? ' · ' + U.plural(streak.freezes, 'freeze') + ' banked' : '') }));
    }
    wrap.appendChild(hero);

    /* ---- up next ---- */
    const next = E.nextUp();
    if (next) {
      const mod = PQ.content.getModule(next.moduleId);
      const kindLabel = { lesson: 'Lesson', checkpoint: 'Checkpoint', project: 'Project' }[next.kind];
      const kindIcon = { lesson: 'lesson', checkpoint: 'checkpoint', project: 'project' }[next.kind];
      const rusty = E.rustyFor(next);

      const card = el('div', { class: 'card pad-lg mt' }, [
        el('div', { class: 'spread', style: 'margin-bottom:var(--s2)' }, [
          el('span', { class: 'section-label', text: 'Up next' }),
          el('span', { class: 'tiny dim', text: 'Tier ' + mod.tier + ' · ' + mod.title })
        ]),
        el('h2', { style: 'margin:0 0 var(--s2)', text: next.title }),
        PQ.ui.metaRow([
          { icon: kindIcon, text: kindLabel },
          next.minutes ? { icon: 'clock', text: next.minutes + ' min' } : null,
          next.kind === 'lesson' ? { text: U.plural((next.exercises || []).length, 'challenge') } : null
        ]),
        rusty.length ? el('div', { class: 'callout warn mt' }, [
          el('span', { class: 'ct', text: 'Shaky prerequisites' }),
          el('div', { class: 'small', style: 'margin-bottom:var(--s2)',
            text: 'Worth reviewing first: ' + rusty.slice(0, 4).map(c => PQ.content.getConcept(c).name).join(', ') }),
          el('button', { class: 'btn sm', text: 'Review these first', onclick: () => PQ.ui.go('#/practice') })
        ]) : null,
        el('button', {
          class: 'btn primary lg block mt', onclick: () => PQ.ui.go('#/unit/' + next.id)
        }, [el('span', { text: 'Continue' }), PQ.icon('chevron', 16)])
      ]);
      wrap.appendChild(card);
    } else {
      const done = el('div', { class: 'card pad-lg mt center' });
      const mark = el('div', { style: 'display:grid;place-items:center;width:48px;height:48px;margin:0 auto var(--s3);border-radius:50%;background:var(--gold-soft);color:var(--gold)' });
      mark.appendChild(PQ.icon('trophy', 24));
      done.appendChild(mark);
      done.appendChild(el('h2', { text: 'The journey is complete' }));
      done.appendChild(el('p', { class: 'muted', text: 'Every lesson, checkpoint and project is done. Keep it alive with review sessions.' }));
      done.appendChild(el('button', { class: 'btn primary mt', text: 'Practice', onclick: () => PQ.ui.go('#/practice') }));
      wrap.appendChild(done);
    }

    /* ---- review due ---- */
    const due = E.dueCount();
    if (due > 0) {
      const card = el('div', { class: 'card mt', style: 'border-color:var(--warn-soft)' });
      const row = el('div', { class: 'spread' });
      const left = el('div', { class: 'row' });
      const badge = el('span', { style: 'display:grid;place-items:center;width:32px;height:32px;border-radius:var(--r-sm);background:var(--warn-soft);color:var(--warn)' });
      badge.appendChild(PQ.icon('review', 17));
      left.appendChild(badge);
      left.appendChild(el('div', [
        el('div', { style: 'font-weight:600;font-size:var(--t-sm)', text: U.plural(due, 'skill') + ' due for review' }),
        el('div', { class: 'tiny dim', text: 'Five minutes now saves relearning later.' })
      ]));
      row.appendChild(left);
      row.appendChild(el('button', { class: 'btn sm', text: 'Review', onclick: () => PQ.ui.go('#/practice') }));
      card.appendChild(row);
      wrap.appendChild(card);
    }

    /* ---- daily quests ---- */
    const day = U.dayKey();
    const quests = E.questsFor(day);
    wrap.appendChild(PQ.ui.sectionHead('Today', el('span', { class: 'tiny dim', text: 'resets at midnight' })));
    const qgrid = el('div', { class: 'stack tight' });
    quests.forEach(q => {
      const p = U.pct(Math.min(q.have, q.goal), q.goal);
      const mark = el('span', { class: 'qi' });
      mark.appendChild(PQ.icon(q.claimed ? 'check' : q.icon, 17));
      qgrid.appendChild(el('div', { class: 'quest' + (q.claimed ? ' done' : '') }, [
        mark,
        el('div', { style: 'flex:1;min-width:0' }, [
          el('div', { class: 'spread' }, [
            el('span', { class: 'qn', text: q.name }),
            el('span', { class: 'tiny dim tabular', text: Math.min(q.have, q.goal) + ' / ' + q.goal })
          ]),
          PQ.ui.bar(p, 'sm')
        ]),
        q.claimed
          ? el('span', { class: 'pill ok', text: '+' + q.xp })
          : el('button', {
            class: 'btn sm ' + (q.done ? 'ok' : ''), disabled: !q.done,
            text: q.done ? 'Claim ' + q.xp : '+' + q.xp + ' XP',
            onclick: () => {
              PQ.ui.reward(PQ.engine.record('quest', { day, qid: q.id, xp: q.xp }), 'quest complete');
              PQ.ui.render();
            }
          })
      ]));
    });
    wrap.appendChild(qgrid);

    /* ---- standing ---- */
    wrap.appendChild(PQ.ui.sectionHead('Where you stand'));
    wrap.appendChild(el('div', { class: 'grid g4' }, [
      PQ.ui.stat(st.stats.solved, 'challenges solved'),
      PQ.ui.stat(jp.pct + '%', 'journey complete'),
      PQ.ui.stat(countStrong(), 'skills mastered'),
      PQ.ui.stat(U.fmtDur(st.stats.timeMs), 'time coding')
    ]));

    /* ---- tier progress ---- */
    wrap.appendChild(PQ.ui.sectionHead('Tiers'));
    const tiers = el('div', { class: 'stack tight' });
    PQ.content.TIERS.forEach(t => {
      const mods = PQ.content.modulesInTier(t.n);
      if (!mods.length) return;
      let done = 0, total = 0;
      mods.forEach(m => { const p = PQ.engine.moduleProgress(m); done += p.done; total += p.total; });
      tiers.appendChild(el('button', {
        class: 'lesson-row', onclick: () => PQ.ui.go('#/path')
      }, [
        el('div', { class: 'lr-ico', text: t.badge }),
        el('div', { class: 'lr-body' }, [
          el('div', { class: 'lr-title', text: t.name }),
          el('div', { class: 'lr-sub', text: t.tag })
        ]),
        el('div', { style: 'width:110px;flex:0 0 auto' }, [PQ.ui.bar(U.pct(done, total), done === total ? 'ok' : '')]),
        el('span', { class: 'tiny dim tabular', style: 'width:52px;text-align:right', text: done + '/' + total })
      ]));
    });
    wrap.appendChild(tiers);
  }

  /** Streak reads as a fact, not a firework — the flame only lights when earned. */
  function streakBlock(streak) {
    const live = streak.current > 0;
    const box = el('div', {
      class: 'row', style: 'gap:var(--s2);padding:var(--s2) var(--s3);border-radius:var(--r-md);' +
        'background:' + (live ? 'var(--gold-soft)' : 'var(--surface-2)') + ';flex:0 0 auto'
    });
    const mark = el('span', { style: 'color:' + (live ? 'var(--gold)' : 'var(--fg-3)') + ';display:grid;place-items:center' });
    mark.appendChild(PQ.icon('flame', 18));
    box.appendChild(mark);
    box.appendChild(el('div', [
      el('div', { class: 'tabular', style: 'font-weight:650;line-height:1.2;color:' + (live ? 'var(--gold)' : 'var(--fg-2)'), text: String(streak.current) }),
      el('div', { class: 'tiny dim', text: streak.current === 1 ? 'day streak' : 'day streak' })
    ]));
    return box;
  }

  function countStrong() {
    return PQ.content.allConcepts().filter(c => PQ.engine.strengthOf(c.id) >= 0.75).length;
  }

  function greeting() {
    const h = new Date().getHours();
    if (h < 5) return 'Still up?';
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  }

  PQ.ui.registerView('home', { nav: 'home', render });
})(window.PQ);
