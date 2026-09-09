/* PyQuest service worker — offline-first.
 *
 * app shell + curriculum : precached on install (small, always available)
 * CDN assets (CodeMirror) : cached the first time they load
 * Pyodide (~12 MB)        : cached the first time Python runs, so the learner
 *                           opts in simply by using it once while online
 */
const VERSION = 'pyquest-v4';
const SHELL = VERSION + '-shell';
const RUNTIME = VERSION + '-runtime';

const CORE = [
  './',
  'index.html',
  'manifest.webmanifest',
  'css/app.css',
  'js/util.js', 'js/icons.js', 'js/store.js', 'js/content.js', 'js/engine.js', 'js/errors.js',
  'js/runner.js', 'js/py-worker.js', 'js/editor.js', 'js/sync.js', 'js/ui.js', 'js/app.js',
  'js/views/home.js', 'js/views/path.js', 'js/views/lesson.js', 'js/views/practice.js',
  'js/views/skills.js', 'js/views/profile.js', 'js/views/settings.js', 'js/views/playground.js',
  'content/manifest.js',
  'icons/icon.svg',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/icon-maskable-512.png',
  'icons/apple-touch-icon.png'
];

const RUNTIME_HOSTS = [
  'cdn.jsdelivr.net',
  'cdnjs.cloudflare.com',
  'fonts.googleapis.com',
  'fonts.gstatic.com'
];

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const cache = await caches.open(SHELL);
    // Content files are listed in content/manifest.js — fetch and parse it so the
    // precache list never drifts from the curriculum.
    let contentFiles = [];
    try {
      const res = await fetch('content/manifest.js', { cache: 'no-cache' });
      const txt = await res.text();
      const m = txt.match(/\[([\s\S]*?)\]/);
      if (m) contentFiles = (m[1].match(/'[^']+'|"[^"]+"/g) || []).map(s => 'content/' + s.slice(1, -1));
    } catch (err) { /* offline install — CORE still works */ }
    await Promise.allSettled(CORE.concat(contentFiles).map(u => cache.add(new Request(u, { cache: 'reload' }))));
    self.skipWaiting();
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => !k.startsWith(VERSION)).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Cross-origin: cache-first, then network (Pyodide, CodeMirror, fonts).
  if (url.origin !== self.location.origin) {
    if (!RUNTIME_HOSTS.includes(url.hostname)) return;
    e.respondWith((async () => {
      const cached = await caches.match(req);
      if (cached) return cached;
      try {
        const res = await fetch(req);
        if (res && (res.ok || res.type === 'opaque')) {
          const cache = await caches.open(RUNTIME);
          cache.put(req, res.clone());
        }
        return res;
      } catch (err) {
        return new Response('Offline and not cached: ' + url.href, { status: 504, statusText: 'Offline' });
      }
    })());
    return;
  }

  // Same-origin: network-first for navigations (so updates land), cache-first for assets.
  if (req.mode === 'navigate') {
    e.respondWith((async () => {
      try {
        const res = await fetch(req);
        const cache = await caches.open(SHELL);
        cache.put('index.html', res.clone());
        return res;
      } catch (err) {
        return (await caches.match('index.html')) || (await caches.match('./')) ||
          new Response('PyQuest is offline and has not been cached yet.', { status: 503 });
      }
    })());
    return;
  }

  e.respondWith((async () => {
    const cached = await caches.match(req);
    if (cached) {
      // refresh in the background
      fetch(req).then(res => { if (res && res.ok) caches.open(SHELL).then(c => c.put(req, res)); }).catch(() => {});
      return cached;
    }
    try {
      const res = await fetch(req);
      if (res && res.ok) { const cache = await caches.open(SHELL); cache.put(req, res.clone()); }
      return res;
    } catch (err) {
      return new Response('Offline: ' + url.pathname, { status: 504 });
    }
  })());
});

self.addEventListener('message', e => {
  if (e.data === 'skipWaiting') self.skipWaiting();
});
