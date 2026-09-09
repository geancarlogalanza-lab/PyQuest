/* PyQuest — bootstrap. */
(function (PQ) {
  'use strict';
  const { $, el } = PQ.util;

  function setBoot(msg) { const n = $('#boot-sub'); if (n) n.textContent = msg; }

  async function main() {
    document.body.classList.toggle('touch', matchMedia('(pointer: coarse)').matches);

    setBoot('Loading your progress…');
    await PQ.engine.init();

    const S = PQ.engine.settings;
    document.documentElement.dataset.theme = S.theme || 'dark';
    document.documentElement.style.setProperty('--code-size', (S.codeSize || 14) + 'px');
    const tc = document.querySelector('meta[name=theme-color]');
    if (tc) tc.setAttribute('content', (S.theme || 'dark') === 'dark' ? '#0d1117' : '#f7f9fc');

    setBoot('Loading the curriculum…');
    await PQ.content.loadAll((i, n) => setBoot('Loading the curriculum… ' + i + '/' + n));

    // Note: opening the app deliberately does NOT mark the day active.
    // A streak should mean you practised, not that you launched it.

    PQ.sync.init();

    window.addEventListener('hashchange', PQ.ui.render);
    if (!location.hash) location.hash = '#/home';
    PQ.ui.render();

    $('#app').hidden = false;
    const boot = $('#boot');
    boot.classList.add('fade');
    setTimeout(() => boot.remove(), 300);

    // Warm up Python in the background so the first Run is not a cold start.
    setTimeout(() => PQ.runner.start(), 900);

    // Never lose work on close.
    window.addEventListener('beforeunload', () => { PQ.engine.saveNow(); });
    document.addEventListener('visibilitychange', () => { if (document.hidden) PQ.engine.saveNow(); });

    // Global shortcuts
    document.addEventListener('keydown', e => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); PQ.ui.go('#/path'); }
    });

    if ('serviceWorker' in navigator) {
      try {
        const reg = await navigator.serviceWorker.register('sw.js');
        reg.addEventListener('updatefound', () => {
          const nw = reg.installing;
          if (!nw) return;
          nw.addEventListener('statechange', () => {
            if (nw.state === 'installed' && navigator.serviceWorker.controller) {
              PQ.ui.toast('Update ready — reload to apply', '', 5000);
            }
          });
        });
      } catch (e) { console.warn('[app] service worker not registered', e); }
    }

    PQ.store.persist();
    console.log('%cPyQuest ready', 'color:#ffd43b;font-weight:700', PQ.content.allUnits().length + ' units, ' + PQ.content.allExercises().length + ' exercises');
  }

  window.addEventListener('error', e => {
    if (!document.getElementById('boot')) return;
    setBoot('Something went wrong: ' + (e.message || 'unknown error'));
  });

  main().catch(err => {
    console.error(err);
    setBoot('Failed to start: ' + (err && err.message || err));
  });
})(window.PQ);
