/* PyQuest — Python runner (main-thread client for the Pyodide worker). */
(function (PQ) {
  'use strict';

  let worker = null;
  let ready = false;
  let readyWaiters = [];
  let seq = 0;
  const pending = new Map();
  const listeners = { status: [], ready: [] };
  let lastStatus = { stage: 'idle', msg: 'Python not started' };
  let bootStarted = false;

  function emit(kind, data) { (listeners[kind] || []).forEach(f => { try { f(data); } catch (e) { console.error(e); } }); }

  function spawn() {
    worker = new Worker('js/py-worker.js');
    worker.onmessage = e => {
      const m = e.data || {};
      if (m.type === 'status') { lastStatus = m; emit('status', m); return; }
      if (m.type === 'ready') {
        ready = true;
        lastStatus = { stage: 'ready', msg: 'Python ' + m.version + ' ready' };
        emit('status', lastStatus);
        emit('ready', m);
        readyWaiters.splice(0).forEach(r => r());
        return;
      }
      if (m.type === 'result') {
        const p = pending.get(m.id);
        if (p) { clearTimeout(p.timer); pending.delete(m.id); p.resolve(m.result); }
        return;
      }
    };
    worker.onerror = err => {
      console.error('[runner] worker error', err);
      const msg = 'Python engine could not start. Check your connection the first time you use PyQuest — after that it works offline.';
      lastStatus = { stage: 'error', msg };
      emit('status', lastStatus);
      pending.forEach(p => { clearTimeout(p.timer); p.resolve({ ok: false, stdout: '', tests: [], error: msg, errorType: 'EngineError' }); });
      pending.clear();
      ready = false;
    };
  }

  function start() {
    if (bootStarted) return;
    bootStarted = true;
    spawn();
    worker.postMessage({ type: 'init' });
  }

  function restart() {
    if (worker) { try { worker.terminate(); } catch (e) { /* ignore */ } }
    ready = false;
    pending.forEach(p => { clearTimeout(p.timer); });
    pending.clear();
    bootStarted = false;
    lastStatus = { stage: 'init', msg: 'Restarting Python…' };
    emit('status', lastStatus);
    start();
  }

  function whenReady() {
    start();
    if (ready) return Promise.resolve();
    return new Promise(res => readyWaiters.push(res));
  }

  function send(type, payload, timeoutMs) {
    start();
    const id = ++seq;
    const to = timeoutMs || 12000;
    return new Promise(resolve => {
      const timer = setTimeout(() => {
        pending.delete(id);
        restart();
        resolve({
          ok: false, stdout: '', tests: [], timeout: true,
          errorType: 'Timeout',
          error: 'Your code ran for more than ' + Math.round(to / 1000) + ' seconds and was stopped.\n' +
            'That almost always means an infinite loop — check that something inside your loop\n' +
            'actually changes the condition that keeps it going.'
        });
      }, to);
      pending.set(id, { resolve, timer });
      worker.postMessage({ type, id, payload });
    });
  }

  const exec = (payload, timeoutMs) => send('run', payload, timeoutMs);
  const grade = (payload, timeoutMs) => send('grade', payload, timeoutMs);

  PQ.runner = {
    start, restart, whenReady, exec, grade,
    get isReady() { return ready; },
    get status() { return lastStatus; },
    on(kind, fn) { (listeners[kind] = listeners[kind] || []).push(fn); return () => { listeners[kind] = listeners[kind].filter(f => f !== fn); }; }
  };
})(window.PQ);
