/* PyQuest — profile: achievements, statistics, streak history. */
(function (PQ) {
  'use strict';
  const U = PQ.util;
  const { el, esc } = U;

  function render(host) {
    const E = PQ.engine, st = E.state;
    const li = E.levelInfo(), rank = E.rank(), streak = E.streakInfo(), jp = E.journeyProgress();
    const wrap = el('div', { class: 'wrap' });
    host.appendChild(wrap);
    PQ.ui.topbar([
      el('h1', { style: 'margin:0;font-size:1.2rem', text: 'Profile' }),
      el('span', { style: 'flex:1' }),
      el('button', { class: 'btn ghost sm', onclick: () => PQ.ui.go('#/settings') },
        [PQ.icon('settings', 15), el('span', { text: 'Settings' })])
    ]);

    wrap.appendChild(el('div', { class: 'hero' }, [
      el('div', { class: 'row', style: 'gap:16px;flex-wrap:wrap' }, [
        el('div', { class: 'lvl-ring', style: '--p:' + li.pct + '%;width:74px;height:74px' }, [el('span', { style: 'font-size:1.35rem', text: String(li.level) })]),
        el('div', { style: 'flex:1;min-width:180px' }, [
          el('div', { style: 'font-size:var(--t-lg);font-weight:650', text: rank.name }),
          el('div', { class: 'muted small', text: st.xp.toLocaleString() + ' XP' + (li.max ? ' · maximum level' : ' · ' + (li.span - li.into).toLocaleString() + ' XP to level ' + (li.level + 1)) }),
          el('div', { class: 'bar mt', style: 'margin-top:8px' }, [el('i', { style: 'width:' + li.pct + '%' })])
        ])
      ])
    ]));

    wrap.appendChild(el('div', { class: 'grid g4 mt' }, [
      PQ.ui.stat(st.stats.solved, 'solved'),
      PQ.ui.stat(st.stats.firstTry, 'first-try solves'),
      PQ.ui.stat(streak.best, 'best streak'),
      PQ.ui.stat(jp.pct + '%', 'journey')
    ]));

    wrap.appendChild(el('h2', { class: 'mt-lg', text: 'Breakdown' }));
    const k = st.stats.byKind || {};
    wrap.appendChild(el('div', { class: 'grid g4' }, [
      PQ.ui.stat(k.code || 0, 'code challenges'),
      PQ.ui.stat(k.debug || 0, 'bugs fixed'),
      PQ.ui.stat(k.quiz || 0, 'concept checks'),
      PQ.ui.stat(k.predict || 0, 'output predictions'),
      PQ.ui.stat(st.stats.lessons, 'lessons'),
      PQ.ui.stat(st.stats.checkpoints, 'checkpoints'),
      PQ.ui.stat(st.stats.projects, 'projects shipped'),
      PQ.ui.stat(st.stats.reviews, 'review sessions')
    ]));

    wrap.appendChild(el('h2', { class: 'mt-lg', text: 'Habits' }));
    wrap.appendChild(el('div', { class: 'card' }, [
      el('div', { class: 'spread' }, [
        el('div', [el('div', { style: 'font-weight:650', text: U.plural(streak.current, 'day') + ' streak' }),
          el('div', { class: 'tiny dim', text: 'Best: ' + streak.best + ' · ' + U.plural(Object.keys(st.days).length, 'active day') + ' total' })]),
        streak.freezes ? el('span', { class: 'pill acc', text: U.plural(streak.freezes, 'freeze') + ' banked' }) : null
      ]),
      el('div', { class: 'streak-days', style: 'margin-top:12px' },
        streak.days.map(d => el('i', { class: (d.on ? 'on' : '') + (d.today ? ' today' : ''), text: d.label })))
    ]));
    wrap.appendChild(heatmap(st));

    const unlocked = PQ.engine.ACHIEVEMENTS.filter(a => st.achievements[a.id]);
    const locked = PQ.engine.ACHIEVEMENTS.filter(a => !st.achievements[a.id]);
    wrap.appendChild(el('div', { class: 'spread mt-lg' }, [
      el('h2', { style: 'margin:0', text: 'Achievements' }),
      el('span', { class: 'pill', text: unlocked.length + ' / ' + PQ.engine.ACHIEVEMENTS.length })
    ]));
    const grid = el('div', { class: 'grid g2 mt' });
    unlocked.concat(locked).forEach(a => {
      const on = !!st.achievements[a.id];
      grid.appendChild(el('div', { class: 'ach' + (on ? '' : ' locked') }, [
        achMark(on, a),
        el('div', { style: 'min-width:0' }, [
          el('div', { class: 'an', text: a.name }),
          el('div', { class: 'ad', text: a.desc }),
          on ? el('div', { class: 'tiny dim', style: 'margin-top:3px', text: U.ago(st.achievements[a.id]) }) : null
        ])
      ]));
    });
    wrap.appendChild(grid);
  }

  /* Achievements keep their emoji — they are earned badges, and a badge is
     the one place where a picture is the content rather than decoration. */
  function achMark(unlocked, a) {
    if (unlocked) return el('div', { class: 'ai', text: a.icon });
    const m = el('div', { class: 'ai', style: 'display:grid;place-items:center;color:var(--fg-3)' });
    m.appendChild(PQ.icon('lock', 15));
    return m;
  }

  function heatmap(st) {
    const box = el('div', { class: 'card mt' });
    box.appendChild(el('div', { class: 'tiny dim', style: 'font-weight:700;text-transform:uppercase;letter-spacing:.07em;margin-bottom:8px', text: 'Last 10 weeks' }));
    const grid = el('div', { style: 'display:grid;grid-template-rows:repeat(7,1fr);grid-auto-flow:column;gap:3px' });
    const today = U.dayStart();
    const start = today - 69 * U.DAY;
    const startDow = new Date(start).getDay();
    for (let i = 0; i < startDow; i++) grid.appendChild(el('div'));
    for (let d = 0; d < 70; d++) {
      const ts = start + d * U.DAY;
      const key = U.dayKey(ts);
      const on = !!st.days[key];
      const bucketData = st.daily[key];
      const intensity = bucketData ? Math.min(1, (bucketData.xp || 0) / 200) : (on ? 0.4 : 0);
      grid.appendChild(el('div', {
        title: key + (bucketData ? ' · ' + bucketData.xp + ' XP' : on ? ' · active' : ''),
        style: 'width:11px;height:11px;border-radius:3px;background:' +
          (on ? 'color-mix(in srgb, var(--ok) ' + Math.round(35 + intensity * 65) + '%, var(--bg-4))' : 'var(--bg-4)')
      }));
    }
    box.appendChild(grid);
    return box;
  }

  PQ.ui.registerView('profile', { nav: 'profile', render });
})(window.PQ);
