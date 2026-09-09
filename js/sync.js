/* PyQuest — synchronisation.
 *
 * One merge rule, two transports:
 *   file   — export/import a JSON backup (always available, no account)
 *   cloud  — optional Supabase project the learner supplies in Settings
 *
 * Merging is a set union of events by id, so syncing can never lose progress
 * and is safe to run twice, half-way, or on a flaky connection.
 */
(function (PQ) {
  'use strict';
  const { el, download } = PQ.util;

  const SB_CDN = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js';
  let sb = null;            // supabase client
  let sbLoaded = false;
  let state = { lastSync: 0, pending: false, busy: false, error: null, user: null };
  const listeners = [];

  const cfg = () => (PQ.engine.settings && PQ.engine.settings.sync) || null;
  const notify = () => listeners.forEach(f => { try { f(status()); } catch (e) { /* ignore */ } });

  function status() {
    const c = cfg();
    return {
      mode: c && c.url ? 'cloud' : 'file',
      configured: !!(c && c.url && c.key),
      signedIn: !!state.user,
      email: state.user ? state.user.email : null,
      online: navigator.onLine,
      lastSync: state.lastSync,
      pending: state.pending,
      busy: state.busy,
      error: state.error
    };
  }

  /* ---------- file transport ---------- */
  function exportFile() {
    const data = PQ.engine.exportData();
    const stamp = new Date().toISOString().slice(0, 10);
    download('pyquest-backup-' + stamp + '.json', JSON.stringify(data));
    return data;
  }

  function importFile() {
    return new Promise((resolve, reject) => {
      const input = el('input', { type: 'file', accept: 'application/json,.json' });
      input.style.display = 'none';
      document.body.appendChild(input);
      input.onchange = () => {
        const f = input.files && input.files[0];
        if (!f) { input.remove(); return reject(new Error('No file chosen')); }
        const rd = new FileReader();
        rd.onload = () => {
          try {
            const res = PQ.engine.mergeData(JSON.parse(rd.result));
            input.remove();
            resolve(res);
          } catch (e) { input.remove(); reject(e); }
        };
        rd.onerror = () => { input.remove(); reject(new Error('Could not read that file')); };
        rd.readAsText(f);
      };
      input.click();
    });
  }

  /* ---------- cloud transport (optional) ---------- */
  function loadSDK() {
    if (sbLoaded) return Promise.resolve();
    return PQ.content.injectScript(SB_CDN).then(() => { sbLoaded = true; });
  }

  async function client() {
    const c = cfg();
    if (!c || !c.url || !c.key) throw new Error('Cloud sync is not configured yet.');
    if (sb) return sb;
    await loadSDK();
    if (!window.supabase) throw new Error('Could not load the sync library (are you offline?).');
    sb = window.supabase.createClient(c.url, c.key, { auth: { persistSession: true, storageKey: 'pq-auth' } });
    const { data } = await sb.auth.getSession();
    state.user = data && data.session ? data.session.user : null;
    sb.auth.onAuthStateChange((_e, session) => { state.user = session ? session.user : null; notify(); });
    return sb;
  }

  async function configure(url, key) {
    PQ.engine.settings.sync = url && key ? { url: url.trim().replace(/\/$/, ''), key: key.trim() } : null;
    sb = null; state.user = null;
    await PQ.engine.saveSettings();
    if (PQ.engine.settings.sync) { try { await client(); } catch (e) { state.error = e.message; } }
    notify();
  }

  async function signIn(email, password, create) {
    const c = await client();
    const fn = create ? c.auth.signUp.bind(c.auth) : c.auth.signInWithPassword.bind(c.auth);
    const { data, error } = await fn({ email, password });
    if (error) throw new Error(error.message);
    state.user = data.user || null;
    notify();
    if (state.user) await syncNow();
    return state.user;
  }

  async function signOut() {
    if (sb) await sb.auth.signOut();
    state.user = null;
    notify();
  }

  async function syncNow() {
    const c = cfg();
    if (!c || !c.url) { state.error = null; return { skipped: 'not-configured' }; }
    if (!navigator.onLine) { state.pending = true; notify(); return { skipped: 'offline' }; }
    if (state.busy) return { skipped: 'busy' };
    state.busy = true; state.error = null; notify();
    try {
      const sup = await client();
      if (!state.user) throw new Error('Sign in to sync.');
      const uid = state.user.id;

      const { data: row, error: readErr } = await sup
        .from('progress').select('payload').eq('user_id', uid).maybeSingle();
      if (readErr) throw new Error(readErr.message);

      if (row && row.payload) {
        try { PQ.engine.mergeData(row.payload); }
        catch (e) { console.warn('[sync] remote payload ignored', e); }
      }

      const payload = PQ.engine.exportData();
      const { error: writeErr } = await sup
        .from('progress').upsert({ user_id: uid, payload, updated_at: new Date().toISOString() });
      if (writeErr) throw new Error(writeErr.message);

      state.lastSync = Date.now();
      state.pending = false;
      return { ok: true };
    } catch (e) {
      state.error = e.message || String(e);
      state.pending = true;
      return { error: state.error };
    } finally {
      state.busy = false;
      notify();
    }
  }

  const auto = PQ.util.debounce(() => { if (cfg() && cfg().url) syncNow(); }, 20000);

  function markDirty() { state.pending = true; auto(); }

  function init() {
    window.addEventListener('online', () => { notify(); if (state.pending) syncNow(); });
    window.addEventListener('offline', notify);
    if (cfg() && cfg().url) client().catch(e => { state.error = e.message; });
  }

  const SCHEMA_SQL = `-- Run this once in your Supabase project's SQL editor.
create table if not exists public.progress (
  user_id    uuid primary key references auth.users on delete cascade,
  payload    jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.progress enable row level security;

create policy "read own progress"   on public.progress
  for select using (auth.uid() = user_id);
create policy "insert own progress" on public.progress
  for insert with check (auth.uid() = user_id);
create policy "update own progress" on public.progress
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);`;

  PQ.sync = {
    init, status, configure, signIn, signOut, syncNow, exportFile, importFile, markDirty,
    SCHEMA_SQL,
    on(fn) { listeners.push(fn); return () => { const i = listeners.indexOf(fn); if (i >= 0) listeners.splice(i, 1); }; }
  };
})(window.PQ);
