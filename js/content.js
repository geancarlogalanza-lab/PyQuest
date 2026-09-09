/* PyQuest — curriculum registry.
   Content files call PQ.defineModule(...). This module indexes them and
   exposes ordered navigation over the whole journey. */
(function (PQ) {
  'use strict';

  const modules = [];
  const byId = Object.create(null);      // module id -> module
  const units = [];                      // flat ordered list of every unit
  const unitById = Object.create(null);
  const exById = Object.create(null);
  const concepts = Object.create(null);  // concept id -> {id,name,module,tier}

  const TIERS = [
    { n: 1, name: 'Beginner', tag: 'Make the computer do a thing', badge: 'I' },
    { n: 2, name: 'Intermediate', tag: 'Model a problem', badge: 'II' },
    { n: 3, name: 'Advanced', tag: 'Build something real', badge: 'III' },
    { n: 4, name: 'Mastery', tag: 'Work like a professional', badge: 'IV' }
  ];

  function defineModule(mod) {
    if (byId[mod.id]) { console.warn('[content] duplicate module', mod.id); return; }
    mod.lessons = mod.lessons || [];
    modules.push(mod);
    byId[mod.id] = mod;
    (mod.concepts || []).forEach(c => {
      concepts[c.id] = { id: c.id, name: c.name, module: mod.id, tier: mod.tier, importance: c.importance || 1 };
    });
  }

  /** Called once after all content files have executed. */
  function index() {
    modules.sort((a, b) => (a.tier - b.tier) || (a.order - b.order));
    units.length = 0;
    modules.forEach((mod, mi) => {
      mod.index = mi;
      mod.units = [];
      mod.lessons.forEach(l => {
        l.kind = 'lesson'; l.moduleId = mod.id; l.tier = mod.tier;
        l.exercises = l.exercises || [];
        l.exercises.forEach((ex, i) => {
          ex.lessonId = l.id; ex.moduleId = mod.id;
          if (!ex.id) ex.id = l.id + '-e' + (i + 1);
          if (!ex.concepts || !ex.concepts.length) ex.concepts = l.concepts || [];
          exById[ex.id] = ex;
        });
        mod.units.push(l);
      });
      if (mod.checkpoint) {
        const cp = mod.checkpoint;
        cp.kind = 'checkpoint'; cp.moduleId = mod.id; cp.tier = mod.tier;
        cp.title = cp.title || ('Checkpoint: ' + mod.title);
        (cp.items || []).forEach((ex, i) => {
          ex.lessonId = cp.id; ex.moduleId = mod.id; ex.checkpoint = true;
          if (!ex.id) ex.id = cp.id + '-i' + (i + 1);
          exById[ex.id] = ex;
        });
        mod.units.push(cp);
      }
      if (mod.project) {
        const p = mod.project;
        p.kind = 'project'; p.moduleId = mod.id; p.tier = mod.tier;
        (p.stages || []).forEach((s, i) => { if (!s.id) s.id = p.id + '-s' + (i + 1); });
        mod.units.push(p);
      }
      mod.units.forEach(u => { unitById[u.id] = u; units.push(u); });
    });
    units.forEach((u, i) => { u.globalIndex = i; });
  }

  const allModules = () => modules;
  const modulesInTier = t => modules.filter(m => m.tier === t);
  const getModule = id => byId[id];
  const getUnit = id => unitById[id];
  const getExercise = id => exById[id];
  const getConcept = id => concepts[id] || { id, name: id, importance: 1 };
  const allConcepts = () => Object.values(concepts);
  const allUnits = () => units;
  const allExercises = () => Object.values(exById);

  function unitExercises(unit) {
    if (!unit) return [];
    if (unit.kind === 'lesson') return unit.exercises || [];
    if (unit.kind === 'checkpoint') return unit.items || [];
    return [];
  }

  function nextUnit(id) {
    const u = unitById[id];
    if (!u) return null;
    return units[u.globalIndex + 1] || null;
  }
  function prevUnit(id) {
    const u = unitById[id];
    if (!u) return null;
    return units[u.globalIndex - 1] || null;
  }
  function moduleOf(unit) { return byId[unit.moduleId]; }

  /** Total XP available in the whole journey (for progress %). */
  function totalXP() {
    let t = 0;
    allExercises().forEach(e => { t += xpFor(e); });
    modules.forEach(m => { if (m.project) t += (m.project.xp || 300); });
    return t;
  }
  function xpFor(ex) {
    if (ex.xp) return ex.xp;
    const base = { quiz: 8, predict: 10, debug: 22, refactor: 24, code: 20, project: 60 }[ex.kind] || 15;
    return Math.round(base * (0.7 + 0.35 * (ex.difficulty || 2)));
  }

  /* ---------- script loading (works offline via service worker cache) ---- */
  function injectScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src; s.async = false;
      s.onload = () => resolve(src);
      s.onerror = () => reject(new Error('Failed to load ' + src));
      document.head.appendChild(s);
    });
  }

  /* Content files are fetched in PARALLEL. injectScript sets async = false, so
     the browser still executes them in insertion order — this is one round trip
     instead of thirty. Order does not actually matter either way: defineModule
     only appends, and index() sorts by tier and order afterwards. */
  async function loadAll(onProgress) {
    await injectScript('content/manifest.js');
    const files = PQ.CONTENT_FILES || [];
    let done = 0;
    await Promise.all(files.map(name =>
      injectScript('content/' + name)
        .catch(e => { console.warn('[content] skipped ' + name, e); })
        .then(() => { done += 1; if (onProgress) onProgress(done, files.length); })
    ));
    index();
  }


  PQ.defineModule = defineModule;
  PQ.content = {
    TIERS, defineModule, index, loadAll, injectScript,
    allModules, modulesInTier, getModule, getUnit, getExercise, getConcept,
    allConcepts, allUnits, allExercises, unitExercises,
    nextUnit, prevUnit, moduleOf, totalXP, xpFor
  };
})(window.PQ);
