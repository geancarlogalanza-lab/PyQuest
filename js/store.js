/* PyQuest — persistence. IndexedDB primary, localStorage fallback.
   Everything the learner earns lives here and is written the moment it happens. */
(function (PQ) {
  'use strict';

  const DB_NAME = 'pyquest';
  const DB_VER = 1;
  const STORE = 'kv';
  const LS_PREFIX = 'pq:';

  let dbPromise = null;
  let useIDB = typeof indexedDB !== 'undefined';

  function openDB() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
      let req;
      try { req = indexedDB.open(DB_NAME, DB_VER); }
      catch (e) { return reject(e); }
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
      req.onblocked = () => reject(new Error('IndexedDB blocked'));
    }).catch(e => { useIDB = false; console.warn('[store] IndexedDB unavailable, using localStorage', e); return null; });
    return dbPromise;
  }

  function tx(mode, fn) {
    return openDB().then(db => {
      if (!db) return null;
      return new Promise((resolve, reject) => {
        const t = db.transaction(STORE, mode);
        const store = t.objectStore(STORE);
        let req;
        try { req = fn(store); } catch (e) { return reject(e); }
        const isRequest = req && typeof req === 'object' && 'onsuccess' in req;
        t.oncomplete = () => resolve(isRequest ? req.result : req);
        t.onerror = () => reject(t.error);
        t.onabort = () => reject(t.error);
      });
    });
  }

  /* localStorage fallback -------------------------------------------------- */
  function lsGet(key) {
    try { const v = localStorage.getItem(LS_PREFIX + key); return v === null ? undefined : JSON.parse(v); }
    catch (e) { return undefined; }
  }
  function lsSet(key, val) {
    try { localStorage.setItem(LS_PREFIX + key, JSON.stringify(val)); return true; }
    catch (e) { console.error('[store] localStorage write failed', e); return false; }
  }

  /* public API ------------------------------------------------------------- */
  async function get(key, fallback) {
    if (useIDB) {
      try {
        const v = await tx('readonly', s => s.get(key));
        if (v !== undefined && v !== null) return v;
      } catch (e) { console.warn('[store] get failed', key, e); }
    }
    const l = lsGet(key);
    return l === undefined ? fallback : l;
  }

  async function set(key, val) {
    let ok = false;
    if (useIDB) {
      try { await tx('readwrite', s => s.put(val, key)); ok = true; }
      catch (e) { console.warn('[store] set failed, falling back', key, e); }
    }
    // Mirror small critical keys to localStorage so a corrupted IDB never wipes progress.
    if (!ok || key === 'meta' || key === 'settings') lsSet(key, val);
    return ok;
  }

  async function del(key) {
    if (useIDB) { try { await tx('readwrite', s => s.delete(key)); } catch (e) { /* ignore */ } }
    try { localStorage.removeItem(LS_PREFIX + key); } catch (e) { /* ignore */ }
  }

  async function estimate() {
    if (navigator.storage && navigator.storage.estimate) {
      try { return await navigator.storage.estimate(); } catch (e) { /* ignore */ }
    }
    return null;
  }

  /** Ask the browser to not evict our data under storage pressure. */
  async function persist() {
    if (navigator.storage && navigator.storage.persist) {
      try {
        if (await navigator.storage.persisted()) return true;
        return await navigator.storage.persist();
      } catch (e) { return false; }
    }
    return false;
  }

  PQ.store = { get, set, del, estimate, persist, get usingIDB() { return useIDB; } };
})(window.PQ);
