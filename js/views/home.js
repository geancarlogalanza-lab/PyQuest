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
      el('div', [el('div', { style: 'font-weight:700', text: greeting() }),
        el('div', { class: 'tiny dim', text: new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' }) })]),
      el('span', { style: 'flex:1' }),
      PQ.ui.statusChip()
    ]);

    /* ---- hero ---- */
    const next = E.nextUp();
    const hero = el('div', { class: 'hero' });
    hero.appendChild(el('div', { class: 'row', style: 'gap:14px;flex-wrap:wrap' }, [
      el('div', { class: 'lvl-ring', style: '--p:' + li.pct + '%' }, [el('span', { text: String(li.level) })]),
      el('div', { style: 'flex:1;min-width:170px' }, [
        el('div', { style: 'font-weight:800;font-size:1.1rem', text: rank.icon + ' ' + rank.name }),
        el('div', { class: 'small muted', text: li.max ? 'Max level' : (li.span - li.into) + ' XP to level ' + (li.level + 1) }),
        el('div', { class: 'bar mt', style: 'margin-top:8px' }, [el('i', { style: 'width:' + li.pct + '%' })])
      ]),
      el('div', { class: 'center', style: 'min-width:86px' }, [
        el('div', { style: 'font-size:1.6rem;font-weight:800;color:' + (streak.activeToday ? 'var(--py)' : 'var(--fg-3)'), text: '🔥 ' + streak.current }),
        el('div', { class: 'tiny dim', text: 'day streak' })
      ])
    ]));
    const days = el('div', { class: 'streak-days mt', style: 'margin-top:14px' });
    streak.days.forEach(d => days.appendChild(el('i', { class: (d.on ? 'on' : '') + (d.today ? ' today' : ''), text: d.label })));
    hero.appendChild(days);
    if (streak.mult > 1) hero.appendChild(el('div', { class: 'tiny dim mt', style: 'margin-top:8px', text: 'Streak bonus: ×' + streak.mult.toFixed(2) + ' XP' + (streak.freezes ? ' · ' + U.plural(streak.freezes, 'freeze') + ' banked' : '') }));
    wrap.appendChild(hero);

    /* ---- continue ---- */
    if (next) {
      const mod = PQ.content.getModule(next.moduleId);
      const kindLabel = { lesson: '📖 Lesson', checkpoint: '🛡️ Checkpoint', project: '🏗️ Project' }[next.kind];
      const rusty = E.rustyFor(next);
      const card = el('div', { class: 'card pad-lg mt' }, [
        el('div', { class: 'spread' }, [
          el('span', { class: 'tiny dim', style: 'font-weight:700;text-transform:uppercase;letter-spacing:.08em', text: 'Up next' }),
          el('span', { class: 'pill', text: 'Tier ' + mod.tier + ' · ' + mod.title })
        ]),
        el('h2', { class: 'mt', style: 'margin:8px 0 2px', text: next.title }),
        el('div', { class: 'muted small', text: kindLabel + (next.minutes ? ' · about ' + next.minutes + ' min' : '') }),
        next.blurb ? el('div', { class: 'muted small mt', text: next.blurb }) : null,
        rusty.length ? el('div', { class: 'callout warn mt' }, [
          el('span', { class: 'ct', text: 'Shaky prerequisites' }),
          el('div', { class: 'small', html: 'Worth reviewing first: ' + rusty.slice(0, 4).map(c => '<code>' + esc(PQ.content.getConcept(c).name) + '</code>').join(' · ') }),
          el('button', { class: 'btn sm mt', text: 'Review these first', onclick: () => PQ.ui.go('#/practice') })
        ]) : null,
        el('button', { class: 'btn primary lg block mt', text: 'Continue →', onclick: () => PQ.ui.go('#/unit/' + next.id) })
      ]);
      wrap.appendChild(card);
    } else {
      wrap.appendChild(el('div', { class: 'card pad-lg mt center' }, [
        el('div', { style: 'font-size:2.4rem', text: '👑' }),
        el('h2', { text: 'The journey is complete' }),
        el('p', { class: 'muted', text: 'Every lesson, checkpoint and project is done. Keep the knowledge alive with review sessions.' }),
        el('button', { class: 'btn primary', text: 'Practice', onclick: () => PQ.ui.go('#/practice') })
      ]));
    }

    /* ---- review due ---- */
    const due = E.dueCount();
    if (due > 0) {
      wrap.appendChild(el('div', { class: 'card mt', style: 'border-color:var(--warn)' }, [
        el('div', { class: 'spread' }, [
          el('div', [el('div', { style: 'font-weight:700', text: '🔁 ' + U.plural(due, 'skill') + ' due for review' }),
            el('div', { class: 'tiny dim', text: 'Retrieval beats re-reading. Five minutes now saves relearning later.' })]),
          el('button', { class: 'btn', text: 'Review', onclick: () => PQ.ui.go('#/practice') })
        ])
      ]));
    }

    /* ---- daily quests ---- */
    const day = U.dayKey();
    const quests = E.questsFor(day);
    wrap.appendChild(el('h2', { class: 'mt-lg', text: "Today's quests" }));
    const qgrid = el('div', { class: 'stack tight' });
    quests.forEach(q => {
      const p = U.pct(Math.min(q.have, q.goal), q.goal);
      const node = el('div', { class: 'quest' + (q.claimed ? ' done' : '') }, [
        el('span', { class: 'qi', text: q.icon }),
        el('div', { style: 'flex:1;min-width:0' }, [
          el('div', { class: 'qn', text: q.name }),
          el('div', { class: 'bar sm' }, [el('i', { style: 'width:' + p + '%' })]),
          el('div', { class: 'tiny dim', style: 'margin-top:3px', text: Math.min(q.have, q.goal) + ' / ' + q.goal })
        ]),
        q.claimed
          ? el('span', { class: 'pill ok', text: '✓ +' + q.xp })
          : el('button', {
            class: 'btn sm ' + (q.done ? 'ok' : ''), disabled: !q.done,
            text: q.done ? 'Claim +' + q.xp : '+' + q.xp + ' XP',
            onclick: () => {
              const res = PQ.engine.record('quest', { day, qid: q.id, xp: q.xp });
              PQ.ui.reward(res, 'quest complete');
              PQ.ui.render();
            }
          })
      ]);
      qgrid.appendChild(node);
    });
    wrap.appendChild(qgrid);

    /* ---- stats ---- */
    wrap.appendChild(el('h2', { class: 'mt-lg', text: 'Where you stand' }));
    wrap.appendChild(el('div', { class: 'grid g4' }, [
      PQ.ui.stat(st.stats.solved, 'challenges solved'),
      PQ.ui.stat(jp.pct + '%', 'journey complete'),
      PQ.ui.stat(countStrong(), 'skills mastered'),
      PQ.ui.stat(U.fmtDur(st.stats.timeMs), 'time coding')
    ]));

    /* ---- tier progress ---- */
    wrap.appendChild(el('h2', { class: 'mt-lg', text: 'Tiers' }));
    const tiers = el('div', { class: 'stack tight' });
    PQ.content.TIERS.forEach(t => {
      const mods = PQ.content.modulesInTier(t.n);
      if (!mods.length) return;
      let done = 0, total = 0;
      mods.forEach(m => { const p = PQ.engine.moduleProgress(m); done += p.done; total += p.total; });
      tiers.appendChild(el('div', { class: 'card', style: 'padding:12px 15px' }, [
        el('div', { class: 'spread' }, [
          el('div', [el('div', { style: 'font-weight:700', text: 'Tier ' + t.n + ' · ' + t.name }),
            el('div', { class: 'tiny dim', text: t.tag })]),
          el('span', { class: 'pill' + (done === total ? ' ok' : ''), text: done + '/' + total })
        ]),
        el('div', { class: 'bar sm', style: 'margin-top:8px' }, [el('i', { style: 'width:' + U.pct(done, total) + '%' })])
      ]));
    });
    wrap.appendChild(tiers);

    wrap.appendChild(el('div', { class: 'center mt-lg' }, [
      el('button', { class: 'btn ghost', text: '🐍 Open the playground', onclick: () => PQ.ui.go('#/playground') })
    ]));
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
