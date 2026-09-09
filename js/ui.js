/* PyQuest — shell, router, and shared UI pieces. */
(function (PQ) {
  'use strict';
  const U = PQ.util;
  const { $, el, esc, md } = U;

  const NAV = [
    { id: 'home', icon: 'home', label: 'Home', route: '#/home', tab: true },
    { id: 'path', icon: 'journey', label: 'Journey', route: '#/path', tab: true },
    { id: 'practice', icon: 'practice', label: 'Practice', route: '#/practice', tab: true },
    { id: 'skills', icon: 'skills', label: 'Skills', route: '#/skills', tab: true },
    { id: 'profile', icon: 'profile', label: 'Profile', route: '#/profile', tab: true },
    { id: 'playground', icon: 'playground', label: 'Playground', route: '#/playground' },
    { id: 'settings', icon: 'settings', label: 'Settings', route: '#/settings' }
  ];

  /* exercise kinds map to icon names, not emoji */
  const KIND_ICON = {
    code: 'code', debug: 'debug', quiz: 'quiz', predict: 'predict',
    refactor: 'refactor', project: 'project', explore: 'explore'
  };
  const KIND_NAME = {
    code: 'Write code', debug: 'Find the bug', quiz: 'Concept check',
    predict: 'Predict the output', refactor: 'Refactor', project: 'Project', explore: 'Explore'
  };

  let current = null;

  /* ---------------- toasts & modals ---------------- */
  function toast(msg, kind, ms) {
    const host = $('#toasts');
    const iconFor = { xp: 'xp', ach: 'trophy', ok: 'check', err: 'warning' }[kind];
    const t = el('div', { class: 'toast ' + (kind || '') });
    if (iconFor) t.appendChild(PQ.icon(iconFor, 15));
    t.appendChild(el('span', { text: msg }));
    host.appendChild(t);
    setTimeout(() => {
      t.style.transition = 'opacity .3s, transform .3s';
      t.style.opacity = '0'; t.style.transform = 'translateY(8px)';
      setTimeout(() => t.remove(), 320);
    }, ms || 2600);
  }

  function modal(build, opts) {
    opts = opts || {};
    const bg = el('div', { class: 'modal-bg' });
    const box = el('div', { class: 'modal' });
    bg.appendChild(box);
    const close = () => { bg.remove(); document.removeEventListener('keydown', onKey); };
    const onKey = e => { if (e.key === 'Escape' && !opts.sticky) close(); };
    document.addEventListener('keydown', onKey);
    if (!opts.sticky) bg.addEventListener('click', e => { if (e.target === bg) close(); });
    build(box, close);
    $('#modal-root').appendChild(bg);
    return close;
  }

  function confirmBox(title, body, okLabel, danger) {
    return new Promise(res => {
      modal((box, close) => {
        box.appendChild(el('h2', { text: title }));
        box.appendChild(el('div', { class: 'prose', html: md(body) }));
        const row = el('div', { class: 'btn-group mt', style: 'justify-content:flex-end' });
        row.appendChild(el('button', { class: 'btn ghost', text: 'Cancel', onclick: () => { close(); res(false); } }));
        row.appendChild(el('button', { class: 'btn ' + (danger ? 'danger' : 'primary'), text: okLabel || 'OK', onclick: () => { close(); res(true); } }));
        box.appendChild(row);
      });
    });
  }

  /* ---------------- reward feedback ---------------- */
  function reward(res, label) {
    if (!res) return;
    if (res.xpGained > 0) toast(res.xpGained + ' XP' + (label ? ' · ' + label : ''), 'xp');
    (res.unlocked || []).forEach((a, i) => {
      setTimeout(() => toast(a.name, 'ach', 4200), 500 + i * 400);
    });
    if (res.leveledUp) setTimeout(() => levelUpModal(res.leveledUp), 650);
    PQ.sync.markDirty();
    renderShell();
  }

  function levelUpModal(level) {
    const r = PQ.engine.rank();
    modal((box, close) => {
      box.classList.add('center');
      const mark = el('div', {
        style: 'display:grid;place-items:center;width:56px;height:56px;margin:0 auto var(--s4);' +
          'border-radius:50%;background:var(--gold-soft);color:var(--gold)'
      });
      mark.appendChild(PQ.icon('trophy', 28));
      box.appendChild(mark);
      box.appendChild(el('h2', { text: 'Level ' + level }));
      box.appendChild(el('p', { class: 'muted', text: 'You are now ranked ' + r.name + '.' }));
      box.appendChild(el('button', { class: 'btn primary lg mt block', text: 'Keep going', onclick: close }));
    });
  }

  /* ---------------- prose with runnable snippets ---------------- */
  function runLabel(btn) {
    btn.innerHTML = '';
    btn.appendChild(PQ.icon('play', 12));
    btn.appendChild(el('span', { text: 'Run' }));
  }

  function prose(markdown, opts) {
    const box = el('div', { class: 'prose', html: md(markdown) });
    U.$$('.js-runcode', box).forEach(btn => {
      runLabel(btn);
      btn.addEventListener('click', async () => {
        const block = btn.closest('.codeblock');
        const live = block.querySelector('.cb-live');
        const code = block.dataset.code || '';
        btn.disabled = true;
        btn.innerHTML = '';
        btn.appendChild(el('span', { class: 'spinner' }));
        live.innerHTML = '';
        const r = await PQ.runner.exec({ code, stdin: (opts && opts.stdin) || [] });
        btn.disabled = false;
        runLabel(btn);
        const out = (r.stdout || '').trimEnd();
        live.innerHTML = '<div class="cb-out"><b>' + (r.error ? 'Error' : 'Result') + '</b>' +
          esc(out || (r.error ? '' : '(no output)')) + (r.error ? '\n' + esc(r.error) : '') + '</div>';
      });
    });
    return box;
  }

  /* ---------------- shell ---------------- */
  function renderShell() {
    const st = PQ.engine.state;
    const li = PQ.engine.levelInfo();
    const rank = PQ.engine.rank();
    const due = PQ.engine.dueCount();

    const links = $('#rail-links');
    links.innerHTML = '';
    NAV.forEach(n => {
      const b = el('button', {
        class: 'rail-link' + (current === n.id ? ' on' : ''),
        onclick: () => go(n.route)
      }, [PQ.icon(n.icon, 18), el('span', { text: n.label })]);
      if (n.id === 'practice' && due > 0) b.appendChild(el('span', { class: 'badge', text: String(Math.min(due, 99)) }));
      links.appendChild(b);
    });

    const foot = $('#rail-lvl');
    foot.innerHTML = '';
    foot.appendChild(el('div', { class: 'row', style: 'gap:var(--s3)' }, [
      el('div', { class: 'lvl-ring', style: '--p:' + li.pct + '%;width:38px;height:38px' },
        [el('span', { style: 'font-size:var(--t-sm)', text: String(li.level) })]),
      el('div', { style: 'min-width:0' }, [
        el('div', { class: 'small', style: 'font-weight:600', text: rank.name }),
        el('div', { class: 'tiny dim tabular', text: st.xp.toLocaleString() + ' XP' })
      ])
    ]));

    const tabbar = $('#tabbar');
    tabbar.innerHTML = '';
    NAV.filter(n => n.tab).forEach(n => {
      tabbar.appendChild(el('button', {
        class: 'tab' + (current === n.id ? ' on' : ''), onclick: () => go(n.route)
      }, [PQ.icon(n.icon, 20), el('span', { text: n.label })]));
    });
  }

  function topbar(nodes) {
    const bar = $('#topbar');
    bar.innerHTML = '';
    (Array.isArray(nodes) ? nodes : [nodes]).forEach(n => n && bar.appendChild(n));
  }

  function crumb(parts) {
    const c = el('div', { class: 'crumb' });
    parts.forEach((p, i) => {
      if (i) c.appendChild(el('span', { class: 'sep', text: '/' }));
      if (p.route) c.appendChild(el('a', { href: p.route, text: p.label }));
      else c.appendChild(el('b', { text: p.label }));
    });
    return c;
  }

  /** A back control that reads as a control rather than as a stray character. */
  function backButton(onClick, title) {
    const b = el('button', { class: 'icon-btn', title: title || 'Back', onclick: onClick });
    b.appendChild(PQ.icon('back', 18));
    return b;
  }

  function statusChip(opts) {
    const chip = el('span', { class: 'pill', style: 'cursor:pointer' });
    const paint = () => {
      const s = PQ.runner.status;
      const map = {
        ready: ['ok', 'Python ready'], download: ['warn', 'Downloading Python'],
        init: ['warn', 'Starting Python'], error: ['err', 'Python unavailable'],
        idle: ['', 'Python idle']
      };
      const [cls, label] = map[s.stage] || ['', s.msg];
      chip.className = 'pill ' + cls + (opts && opts.compact ? ' hide-mobile' : '');
      chip.innerHTML = '';
      chip.appendChild(el('span', {
        style: 'width:6px;height:6px;border-radius:50%;background:currentColor;flex:0 0 auto;' +
          (cls ? '' : 'opacity:.5')
      }));
      chip.appendChild(el('span', { text: label }));
      chip.title = s.msg;
    };
    paint();
    PQ.runner.on('status', paint);
    chip.onclick = () => { if (PQ.runner.status.stage === 'error') PQ.runner.restart(); else PQ.runner.start(); };
    return chip;
  }

  /* ---------------- router ---------------- */
  function go(route) {
    if (location.hash === route) render();
    else location.hash = route;
  }

  function parse() {
    const h = (location.hash || '#/home').replace(/^#\/?/, '');
    const parts = h.split('/').filter(Boolean);
    return { name: parts[0] || 'home', arg: parts.slice(1).join('/') };
  }

  const VIEWS = {};

  function render() {
    const { name, arg } = parse();
    const view = VIEWS[name] || VIEWS.home;
    current = view.nav || name;
    const host = $('#view');
    host.innerHTML = '';
    document.body.classList.toggle('no-tabs', !!view.fullscreen);
    topbar([]);
    renderShell();
    try {
      view.render(host, decodeURIComponent(arg || ''));
    } catch (e) {
      console.error('[ui] view error', e);
      host.appendChild(el('div', { class: 'wrap' }, [
        el('div', { class: 'card pad-lg' }, [
          el('h2', { text: 'Something broke in this screen' }),
          el('p', { class: 'muted', text: String(e && e.message || e) }),
          el('button', { class: 'btn', text: 'Back to home', onclick: () => go('#/home') })
        ])
      ]));
    }
    window.scrollTo(0, 0);
  }

  function registerView(name, view) { VIEWS[name] = view; }

  /* ---------------- shared widgets ---------------- */
  function bar(pctVal, cls) {
    return el('div', { class: 'bar ' + (cls || '') }, [el('i', { style: 'width:' + pctVal + '%' })]);
  }
  function stat(value, label) {
    return el('div', { class: 'stat' }, [
      el('div', { class: 'sv', text: String(value) }),
      el('div', { class: 'sl', text: label })
    ]);
  }
  function diffDots(n) {
    const d = el('span', { class: 'diff', title: 'Difficulty ' + n + ' of 5' });
    for (let i = 1; i <= 5; i++) d.appendChild(el('i', { class: i <= n ? 'on' : '' }));
    return d;
  }
  /** A dotted metadata row — the replacement for stacks of identical pills. */
  function metaRow(items) {
    const row = el('div', { class: 'meta' });
    items.filter(Boolean).forEach(item => {
      if (typeof item === 'string') { row.appendChild(el('span', { text: item })); return; }
      const span = el('span', { class: 'meta-item' });
      if (item.icon) span.appendChild(PQ.icon(item.icon, 13));
      span.appendChild(el('span', { text: item.text }));
      row.appendChild(span);
    });
    return row;
  }
  function sectionHead(title, right) {
    return el('div', { class: 'section-head' }, [el('h2', { text: title }), right || null]);
  }

  PQ.ui = {
    NAV, go, render, registerView, renderShell, topbar, crumb, backButton, statusChip,
    toast, modal, confirm: confirmBox, reward, prose, bar, stat, diffDots, metaRow, sectionHead,
    KIND_ICON, KIND_NAME, levelUpModal
  };
})(window.PQ);
