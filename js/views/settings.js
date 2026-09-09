/* PyQuest — settings: appearance, offline, sync, data. */
(function (PQ) {
  'use strict';
  const U = PQ.util;
  const { el, esc, md } = U;

  function render(host) {
    const S = PQ.engine.settings;
    const wrap = el('div', { class: 'wrap' });
    host.appendChild(wrap);
    PQ.ui.topbar([el('h1', { text: 'Settings' }), el('span', { class: 'grow' })]);

    /* ---------- install ---------- */
    const installBox = el('div');
    wrap.appendChild(section('Install as an app', [installBox]));
    paintInstall(installBox);

    /* ---------- appearance ---------- */
    wrap.appendChild(section('Appearance', [
      row('Theme', seg(['dark', 'light'], S.theme, v => {
        S.theme = v; document.documentElement.dataset.theme = v;
        document.querySelector('meta[name=theme-color]').setAttribute('content', v === 'dark' ? '#0b0e14' : '#f6f8fb');
        PQ.engine.saveSettings();
      })),
      row('Code size', seg(['13', '14', '16', '18'], String(S.codeSize), v => {
        S.codeSize = parseInt(v, 10);
        document.documentElement.style.setProperty('--code-size', S.codeSize + 'px');
        PQ.engine.saveSettings();
      }))
    ]));

    /* ---------- offline ---------- */
    const offlineBox = el('div', { class: 'stack tight' });
    wrap.appendChild(section('Offline', [
      el('p', { class: 'muted small', text: 'Lessons and challenges are stored on this device already. The Python engine itself is about 12 MB and is cached the first time it runs, so start it once while you have a connection.' }),
      offlineBox
    ]));
    paintOffline(offlineBox);

    /* ---------- sync ---------- */
    wrap.appendChild(section('Backup & sync', [syncPanel()]));

    /* ---------- data ---------- */
    const st = PQ.engine.state;
    wrap.appendChild(section('Your data', [
      el('div', { class: 'grid g3' }, [
        PQ.ui.stat(PQ.engine.events.length, 'events logged'),
        PQ.ui.stat(Object.keys(PQ.engine.drafts).length, 'saved drafts'),
        PQ.ui.stat(st.xp.toLocaleString(), 'xp')
      ]),
      el('p', { class: 'muted small mt', text: 'Progress is stored in this browser (IndexedDB). Clearing site data for this page would erase it — export a backup first if you plan to.' }),
      el('div', { class: 'btn-group mt' }, [
        el('button', { class: 'btn danger', text: 'Reset all progress', onclick: resetAll })
      ])
    ]));

    /* ---------- about ---------- */
    wrap.appendChild(section('About', [
      el('div', { class: 'prose', html: md(
        'PyQuest runs real CPython in your browser via Pyodide — the same interpreter semantics, the same tracebacks, no server involved.\n\n' +
        '**Keyboard:** `Ctrl`/`Cmd`+`Enter` runs your code, `Shift`+`Enter` checks it, `Ctrl`/`Cmd`+`/` toggles a comment.\n\n' +
        '**Install it:** use your browser\'s *Install app* / *Add to Home Screen* to get a full-screen icon on phone or laptop.') })
    ]));
  }

  /* ---------------- install ---------------- */
  /* Three states, because the browsers genuinely differ: Chrome and Edge hand
     us a real prompt, iOS Safari has no API at all and needs instructions, and
     an already-installed app should say so rather than offer a dead button. */
  function paintInstall(box) {
    const inst = PQ.install || {};
    box.innerHTML = '';

    if (inst.standalone) {
      box.appendChild(el('div', { class: 'row' }, [
        el('span', { class: 'pill ok', text: 'Installed' }),
        el('span', { class: 'small muted', text: 'You are running PyQuest as an app.' })
      ]));
      return;
    }

    box.appendChild(el('p', { class: 'muted small',
      text: 'Installing gives PyQuest its own icon and a full-screen window, and it keeps working with no connection. It is the same app — nothing is downloaded from a store.' }));

    if (inst.available) {
      const btn = el('button', { class: 'btn primary', onclick: async () => {
        btn.disabled = true;
        const outcome = await inst.prompt();
        btn.disabled = false;
        if (outcome === 'dismissed') PQ.ui.toast('Install cancelled', '');
        paintInstall(box);
      } }, [PQ.icon('download', 15), el('span', { text: 'Install PyQuest' })]);
      box.appendChild(btn);
      return;
    }

    /* No prompt available — tell them exactly where the control lives. */
    const ua = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isAndroid = /Android/.test(ua);
    const steps = isIOS
      ? ['Open this page in **Safari** (other iOS browsers cannot install apps).', 'Tap the **Share** button.', 'Choose **Add to Home Screen**.']
      : isAndroid
        ? ['Tap the **⋮** menu in your browser.', 'Choose **Add to Home screen** or **Install app**.']
        : ['Look for the **install icon** in the address bar.', 'Or open the browser menu and choose **Install PyQuest**.'];

    box.appendChild(el('div', { class: 'callout tip' }, [
      el('span', { class: 'ct', text: isIOS ? 'On iPhone and iPad' : isAndroid ? 'On Android' : 'On this browser' }),
      el('div', { class: 'prose', html: PQ.util.md(steps.map((t, i) => (i + 1) + '. ' + t).join('\n')) })
    ]));
  }

  /* ---------------- pieces ---------------- */
  function section(title, children) {
    return el('div', { class: 'card pad-lg mt' }, [el('h2', { style: 'margin-top:0', text: title })].concat(children));
  }
  function row(label, control) {
    return el('div', { class: 'spread', style: 'padding:8px 0;flex-wrap:wrap;gap:10px' }, [
      el('span', { style: 'font-weight:600;font-size:.92rem', text: label }), control
    ]);
  }
  function seg(options, value, onPick) {
    const s = el('div', { class: 'seg' });
    options.forEach(o => {
      s.appendChild(el('button', {
        class: o === value ? 'on' : '', text: o,
        onclick: () => { onPick(o); U.$$('button', s).forEach(b => b.classList.toggle('on', b.textContent === o)); }
      }));
    });
    return s;
  }

  async function paintOffline(box) {
    box.innerHTML = '';
    const chip = el('span', { class: 'pill', text: 'checking…' });
    box.appendChild(el('div', { class: 'spread' }, [
      el('span', { style: 'font-weight:600;font-size:.92rem', text: 'Python engine' }), chip
    ]));
    const btn = el('button', {
      class: 'btn primary block mt', text: 'Download Python for offline use',
      onclick: async () => {
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner"></span> downloading (about 12 MB)…';
        PQ.runner.start();
        await PQ.runner.whenReady();
        PQ.engine.settings.offlinePython = true;
        await PQ.engine.saveSettings();
        btn.disabled = false;
        btn.textContent = '✓ Cached — Python now works offline';
        chip.className = 'pill ok'; chip.textContent = 'ready offline';
        PQ.ui.toast('Python cached for offline use', 'ok');
      }
    });
    box.appendChild(btn);

    if (PQ.runner.isReady) { chip.className = 'pill ok'; chip.textContent = 'running'; btn.textContent = '✓ Already downloaded'; }
    else { chip.className = 'pill'; chip.textContent = PQ.engine.settings.offlinePython ? 'cached' : 'not downloaded'; }

    const est = await PQ.store.estimate();
    if (est && est.usage) {
      box.appendChild(el('div', { class: 'tiny dim mt', text: 'Using ' + (est.usage / 1048576).toFixed(1) + ' MB of local storage' + (est.quota ? ' of ' + (est.quota / 1048576).toFixed(0) + ' MB available' : '') }));
    }
    // Offline caching of the app shell depends on the service worker.
    const swReady = 'serviceWorker' in navigator && !!navigator.serviceWorker.controller;
    const swSupported = 'serviceWorker' in navigator;
    box.appendChild(el('div', { class: 'row mt', style: 'gap:8px;flex-wrap:wrap' }, [
      el('span', { style: 'font-weight:600;font-size:.92rem', text: 'Offline app cache' }),
      el('span', {
        class: 'pill ' + (swReady ? 'ok' : 'warn'),
        text: swReady ? 'active' : (swSupported ? 'not registered yet' : 'unsupported here')
      })
    ]));
    if (!swReady) {
      box.appendChild(el('div', { class: 'tiny dim', text: swSupported
        ? 'Reload once to activate it. Service workers need https or localhost, and some embedded browsers block them — open PyQuest in Chrome, Firefox or Safari if this stays off.'
        : 'This browser does not expose service workers, so the app shell cannot be cached. Your progress is still saved locally.' }));
    }

    const persisted = navigator.storage && navigator.storage.persisted ? await navigator.storage.persisted() : false;
    box.appendChild(el('div', { class: 'row mt', style: 'gap:8px' }, [
      el('span', { class: 'pill ' + (persisted ? 'ok' : 'warn'), text: persisted ? 'storage protected' : 'storage evictable' }),
      !persisted ? el('button', {
        class: 'btn sm ghost', text: 'Ask browser to protect it',
        onclick: async () => {
          const ok = await PQ.store.persist();
          PQ.ui.toast(ok ? 'Storage is now protected from eviction' : 'The browser declined — your data is still saved', ok ? 'ok' : '');
          paintOffline(box);
        }
      }) : null
    ]));
  }

  function syncPanel() {
    const box = el('div');
    const paint = () => {
      const s = PQ.sync.status();
      box.innerHTML = '';

      /* file transport */
      box.appendChild(el('div', { class: 'callout tip', style: 'margin-top:0' }, [
        el('span', { class: 'ct', text: 'Backup file — works everywhere, no account' }),
        el('p', { class: 'small', text: 'Export on one device, import on the other. Importing merges: it can only ever add progress, never remove it.' }),
        el('div', { class: 'btn-group' }, [
          el('button', { class: 'btn', onclick: () => { PQ.sync.exportFile(); PQ.ui.toast('Backup downloaded', 'ok'); } },
            [PQ.icon('download', 15), el('span', { text: 'Export backup' })]),
          el('button', {
            class: 'btn', onclick: async () => {
              try {
                const r = await PQ.sync.importFile();
                PQ.ui.toast('Merged ' + r.added + ' new events', 'ok');
                PQ.ui.render();
              } catch (e) { PQ.ui.toast(e.message || 'Import failed', 'err'); }
            }
          }, [PQ.icon('upload', 15), el('span', { text: 'Import backup' })])
        ])
      ]));

      /* cloud transport */
      const cloud = el('div', { class: 'mt' });
      cloud.appendChild(el('div', { class: 'spread' }, [
        el('span', { style: 'font-weight:700', text: 'Cloud sync (optional)' }),
        el('span', { class: 'pill ' + (s.configured ? (s.signedIn ? 'ok' : 'warn') : ''), text: s.configured ? (s.signedIn ? 'signed in' : 'not signed in') : 'not set up' })
      ]));
      cloud.appendChild(el('p', { class: 'muted small', text: 'Point PyQuest at your own free Supabase project and every device syncs automatically. Nothing leaves this device until you set it up.' }));

      if (!s.configured) {
        const url = el('input', { type: 'text', placeholder: 'https://xxxx.supabase.co' });
        const key = el('input', { type: 'text', placeholder: 'anon public key' });
        cloud.appendChild(el('label', { class: 'field' }, [el('span', { text: 'Project URL' }), url]));
        cloud.appendChild(el('label', { class: 'field' }, [el('span', { text: 'Anon key' }), key]));
        cloud.appendChild(el('div', { class: 'btn-group' }, [
          el('button', {
            class: 'btn primary', text: 'Connect', onclick: async () => {
              if (!url.value.trim() || !key.value.trim()) return PQ.ui.toast('Both fields are needed', 'err');
              await PQ.sync.configure(url.value, key.value);
              PQ.ui.toast('Connected — now sign in', 'ok'); paint();
            }
          }),
          el('button', {
            class: 'btn ghost', text: 'Show the SQL to run', onclick: () => PQ.ui.modal(b => {
              b.appendChild(el('h2', { text: 'One-time database setup' }));
              b.appendChild(el('p', { class: 'muted small', text: 'Create a free project at supabase.com, open the SQL editor and run this. Then paste the project URL and anon key here.' }));
              b.appendChild(PQ.ui.prose('```sql\n' + PQ.sync.SCHEMA_SQL + '\n```'));
              b.appendChild(el('button', { class: 'btn mt', text: 'Copy SQL', onclick: () => { U.copy(PQ.sync.SCHEMA_SQL); PQ.ui.toast('Copied', 'ok'); } }));
            })
          })
        ]));
      } else if (!s.signedIn) {
        const email = el('input', { type: 'email', placeholder: 'you@example.com' });
        const pw = el('input', { type: 'password', placeholder: 'password' });
        cloud.appendChild(el('label', { class: 'field' }, [el('span', { text: 'Email' }), email]));
        cloud.appendChild(el('label', { class: 'field' }, [el('span', { text: 'Password' }), pw]));
        const go = async (create) => {
          try {
            await PQ.sync.signIn(email.value.trim(), pw.value, create);
            PQ.ui.toast(create ? 'Account created' : 'Signed in', 'ok'); paint();
          } catch (e) { PQ.ui.toast(e.message, 'err'); }
        };
        cloud.appendChild(el('div', { class: 'btn-group' }, [
          el('button', { class: 'btn primary', text: 'Sign in', onclick: () => go(false) }),
          el('button', { class: 'btn', text: 'Create account', onclick: () => go(true) }),
          el('button', { class: 'btn ghost', text: 'Disconnect', onclick: async () => { await PQ.sync.configure(null, null); paint(); } })
        ]));
      } else {
        cloud.appendChild(el('div', { class: 'small muted', text: 'Signed in as ' + s.email + (s.lastSync ? ' · last synced ' + new Date(s.lastSync).toLocaleTimeString() : '') }));
        if (s.error) cloud.appendChild(el('div', { class: 'callout trap' }, [el('span', { class: 'ct', text: 'Last sync failed' }), el('p', { class: 'small', text: s.error })]));
        cloud.appendChild(el('div', { class: 'btn-group mt' }, [
          el('button', {
            class: 'btn primary', text: s.busy ? 'Syncing…' : 'Sync now', disabled: s.busy,
            onclick: async () => { const r = await PQ.sync.syncNow(); PQ.ui.toast(r.ok ? 'Synced' : (r.error || r.skipped), r.ok ? 'ok' : 'err'); paint(); }
          }),
          el('button', { class: 'btn ghost', text: 'Sign out', onclick: async () => { await PQ.sync.signOut(); paint(); } })
        ]));
      }
      box.appendChild(cloud);
    };
    paint();
    return box;
  }

  async function resetAll() {
    const ok = await PQ.ui.confirm('Erase everything?',
      'This deletes all XP, levels, streaks, achievements, mastery data and saved code on **this device**. It cannot be undone.\n\nExport a backup first if you might want it back.',
      'Erase everything', true);
    if (!ok) return;
    await PQ.engine.wipe();
    PQ.ui.toast('Progress erased', '');
    PQ.ui.go('#/home');
    PQ.ui.render();
  }

  PQ.ui.registerView('settings', { nav: 'settings', render });
})(window.PQ);
