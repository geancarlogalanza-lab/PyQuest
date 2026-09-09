/* PyQuest — progression engine.
 *
 * Source of truth is an append-only event log. Every piece of visible state
 * (XP, level, streak, mastery, achievements, unlocks) is a pure fold over that
 * log. That makes cross-device merging a set union by event id: no conflicts,
 * no lost progress, no "which copy wins" dialog.
 */
(function (PQ) {
  'use strict';
  const U = PQ.util;
  const C = () => PQ.content;

  const MAX_EVENTS = 6000;
  const XP_CURVE = n => Math.round(22 * Math.pow(Math.max(0, n - 1), 1.7));
  const MAX_LEVEL = 60;

  const RANKS = [
    [1, 'Novice'], [5, 'Apprentice'], [10, 'Coder'],
    [17, 'Developer'], [25, 'Engineer'], [34, 'Architect'],
    [43, 'Pythonista'], [53, 'Grandmaster']
  ];

  /* ==================================================================== */
  /* state                                                                 */
  /* ==================================================================== */

  function blank() {
    return {
      xp: 0, level: 1,
      exercises: {},        // exId -> {solved, tries, hints, firstTry, q, lastAt, solves}
      units: {},            // unitId -> {done, at, score}
      projects: {},         // projectId -> {stages:{}, done, at}
      concepts: {},         // cId -> {reps, ease, ivl, lapses, dueAt, lastAt, q}
      days: {},             // 'YYYY-MM-DD' -> true
      daily: {},            // last 21 days of counters
      streak: { current: 0, best: 0, last: null, freezes: 0 },
      achievements: {},     // achId -> unlockedAt
      quests: {},           // day -> {claimed:{qid:true}}
      stats: {
        solved: 0, firstTry: 0, attempts: 0, fails: 0, hintsUsed: 0,
        lessons: 0, checkpoints: 0, projects: 0, reviews: 0,
        timeMs: 0, runs: 0, byKind: {}, byTier: {}, revealed: 0,
        maxCombo: 0, combo: 0
      },
      firstEventAt: null, lastEventAt: null
    };
  }

  const S = { events: [], drafts: {}, state: blank(), settings: null, ready: false };

  /* ==================================================================== */
  /* fold                                                                  */
  /* ==================================================================== */

  function dailyBucket(st, day) {
    if (!st.daily[day]) st.daily[day] = { xp: 0, solved: 0, firstTry: 0, debug: 0, lessons: 0, reviews: 0, mins: 0 };
    // keep memory bounded
    const keys = Object.keys(st.daily);
    if (keys.length > 21) { keys.sort(); delete st.daily[keys[0]]; }
    return st.daily[day];
  }

  function touchDay(st, ts) {
    const day = U.dayKey(ts);
    if (st.days[day]) return;
    st.days[day] = true;
    const s = st.streak;
    if (s.last === null) { s.current = 1; }
    else {
      const gap = U.daysBetween(new Date(s.last + 'T12:00:00').getTime(), ts);
      if (gap <= 0) { /* same day */ }
      else if (gap === 1) s.current += 1;
      else {
        const missed = gap - 1;
        if (s.freezes >= missed) { s.freezes -= missed; s.current += 1; }
        else s.current = 1;
      }
    }
    s.last = day;
    if (s.current > s.best) s.best = s.current;
    // earn a freeze every 7 consecutive days, max 2 banked
    if (s.current > 0 && s.current % 7 === 0 && s.freezes < 2) s.freezes += 1;
    dailyBucket(st, day);
  }

  function streakMult(st) {
    const c = st.streak.current;
    if (c >= 30) return 1.5;
    if (c >= 14) return 1.35;
    if (c >= 7) return 1.25;
    if (c >= 3) return 1.1;
    return 1;
  }

  /* --- spaced repetition (SM-2 flavoured) ------------------------------ */
  function conceptState(st, cid) {
    if (!st.concepts[cid]) st.concepts[cid] = { reps: 0, ease: 2.3, ivl: 0, lapses: 0, dueAt: 0, lastAt: 0, q: 0 };
    return st.concepts[cid];
  }

  function updateConcept(st, cid, q, ts) {
    const c = conceptState(st, cid);
    if (q >= 3) {
      c.reps += 1;
      c.ease = U.clamp(c.ease + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)), 1.3, 2.8);
      c.ivl = c.reps === 1 ? 1 : (c.reps === 2 ? 3 : Math.round(Math.max(1, c.ivl) * c.ease));
      c.ivl = Math.min(c.ivl, 180);
    } else {
      c.lapses += 1;
      c.reps = Math.max(0, c.reps - 1);
      c.ease = Math.max(1.3, c.ease - 0.2);
      c.ivl = 1;
    }
    c.q = q;
    c.lastAt = ts;
    c.dueAt = ts + c.ivl * U.DAY;
  }

  /** Live strength 0..1 — decays with time so the skill map stays honest. */
  function strengthOf(cid, now) {
    const c = S.state.concepts[cid];
    if (!c || !c.lastAt) return 0;
    now = now || Date.now();
    const maturity = U.clamp(
      U.clamp(c.reps / 4, 0, 1) * (0.7 + 0.3 * U.clamp((c.ease - 1.3) / 1.2, 0, 1)) - c.lapses * 0.03,
      0, 1);
    const elapsedDays = Math.max(0, (now - c.lastAt) / U.DAY);
    const halfLife = Math.max(1.5, (c.ivl || 1) * 1.3);
    const floor = U.clamp(0.2 + 0.1 * c.reps, 0, 0.6);
    const recency = Math.max(floor, Math.pow(0.5, elapsedDays / halfLife));
    return U.clamp(maturity * recency, 0, 1);
  }

  function qualityOf(ev) {
    if (ev.revealed) return 2;
    if (!ev.ok) return 1;
    if ((ev.tries || 1) === 1 && !(ev.hints || 0)) return 5;
    if ((ev.hints || 0) <= 1 && (ev.tries || 1) <= 2) return 4;
    return 3;
  }

  /* --- XP -------------------------------------------------------------- */
  function xpForAttempt(st, ev, ex) {
    if (!ev.ok) return 0;
    const base = ex ? C().xpFor(ex) : 12;
    const rec = st.exercises[ev.ex];
    const already = rec && rec.solved;
    if (already) return Math.max(3, Math.round(base * 0.15));  // practice trickle
    let mult = 1;
    if ((ev.tries || 1) === 1) mult += 0.25;
    if (!(ev.hints || 0)) mult += 0.15;
    if (ev.revealed) mult = 0.35;
    if (ev.cp) mult += 0.2;
    return Math.round(base * mult * streakMult(st));
  }

  function levelFor(xp) {
    let n = 1;
    while (n < MAX_LEVEL && xp >= XP_CURVE(n + 1)) n++;
    return n;
  }

  /* --- apply ----------------------------------------------------------- */
  function apply(st, ev) {
    const ts = ev.t;
    if (!st.firstEventAt) st.firstEventAt = ts;
    st.lastEventAt = Math.max(st.lastEventAt || 0, ts);
    touchDay(st, ts);
    const day = U.dayKey(ts);
    const bucket = dailyBucket(st, day);
    const S_ = st.stats;

    switch (ev.type) {
      case 'attempt': {
        const ex = C().getExercise(ev.ex);
        S_.attempts += 1;
        S_.hintsUsed += (ev.hints || 0);
        S_.timeMs += (ev.ms || 0);
        S_.runs += (ev.runs || 0);
        if (ev.revealed) S_.revealed += 1;
        const kind = (ex && ex.kind) || ev.kind || 'code';
        const gained = xpForAttempt(st, ev, ex);
        const rec = st.exercises[ev.ex] || { solved: false, tries: 0, hints: 0, firstTry: false, q: 0, solves: 0, lastAt: 0 };
        rec.tries += (ev.tries || 1);
        rec.hints += (ev.hints || 0);
        rec.lastAt = ts;
        if (ev.ok) {
          if (!rec.solved) {
            rec.solved = true;
            rec.firstTry = (ev.tries || 1) === 1 && !(ev.hints || 0) && !ev.revealed;
            S_.solved += 1;
            if (rec.firstTry) S_.firstTry += 1;
            S_.byKind[kind] = (S_.byKind[kind] || 0) + 1;
            const tier = ex ? ex.tier || (C().getModule(ex.moduleId) || {}).tier : 0;
            if (tier) S_.byTier[tier] = (S_.byTier[tier] || 0) + 1;
            bucket.solved += 1;
            if (rec.firstTry) bucket.firstTry += 1;
            if (kind === 'debug') bucket.debug += 1;
          } else {
            rec.solves = (rec.solves || 0) + 1;
          }
          S_.combo += 1;
          if (S_.combo > S_.maxCombo) S_.maxCombo = S_.combo;
        } else {
          S_.fails += 1;
          S_.combo = 0;
        }
        rec.solves = rec.solves || 0;
        rec.q = Math.max(rec.q || 0, qualityOf(ev));
        st.exercises[ev.ex] = rec;

        const q = qualityOf(ev);
        const cs = (ev.concepts && ev.concepts.length) ? ev.concepts : (ex ? ex.concepts : []) || [];
        cs.forEach(cid => updateConcept(st, cid, q, ts));

        st.xp += gained;
        bucket.xp += gained;
        if (ev.review) { S_.reviews += 0; bucket.reviews += 1; }
        break;
      }
      case 'unit': {
        const prev = st.units[ev.unit];
        st.units[ev.unit] = { done: true, at: (prev && prev.at) || ts, score: Math.max((prev && prev.score) || 0, ev.score || 1) };
        if (!prev) {
          if (ev.kind === 'checkpoint') { S_.checkpoints += 1; st.xp += 120; bucket.xp += 120; }
          else { S_.lessons += 1; st.xp += 25; bucket.xp += 25; bucket.lessons += 1; }
        }
        break;
      }
      case 'stage': {
        const p = st.projects[ev.project] || { stages: {}, done: false, at: 0 };
        if (!p.stages[ev.stage]) {
          p.stages[ev.stage] = ts;
          st.xp += ev.xp || 40;
          bucket.xp += ev.xp || 40;
        }
        st.projects[ev.project] = p;
        (ev.concepts || []).forEach(cid => updateConcept(st, cid, 4, ts));
        break;
      }
      case 'project': {
        const p = st.projects[ev.project] || { stages: {}, done: false, at: 0 };
        if (!p.done) { p.done = true; p.at = ts; S_.projects += 1; st.xp += ev.xp || 200; bucket.xp += ev.xp || 200; }
        st.projects[ev.project] = p;
        st.units[ev.project] = { done: true, at: p.at, score: 1 };
        break;
      }
      case 'review': {
        S_.reviews += 1;
        bucket.reviews += 1;
        st.xp += ev.xp || 30;
        bucket.xp += ev.xp || 30;
        break;
      }
      case 'quest': {
        if (!st.quests[ev.day]) st.quests[ev.day] = { claimed: {} };
        if (!st.quests[ev.day].claimed[ev.qid]) {
          st.quests[ev.day].claimed[ev.qid] = ts;
          st.xp += ev.xp || 40;
          bucket.xp += ev.xp || 40;
        }
        break;
      }
      case 'playground': {
        S_.runs += (ev.runs || 1);
        break;
      }
      default: break;
    }

    st.level = levelFor(st.xp);
    checkAchievements(st, ts);
  }

  function fold(events) {
    const st = blank();
    events.slice().sort((a, b) => a.t - b.t || (a.id < b.id ? -1 : 1)).forEach(ev => {
      try { apply(st, ev); } catch (e) { console.warn('[engine] bad event', ev, e); }
    });
    return st;
  }

  /* ==================================================================== */
  /* achievements                                                          */
  /* ==================================================================== */

  const ACHIEVEMENTS = [
    { id: 'hello', icon: '👋', name: 'Hello, World', desc: 'Run your very first Python program', f: s => s.stats.attempts >= 1 },
    { id: 'first_solve', icon: '✅', name: 'It Works!', desc: 'Solve your first exercise', f: s => s.stats.solved >= 1 },
    { id: 'solve10', icon: '🔟', name: 'Getting Warm', desc: 'Solve 10 exercises', f: s => s.stats.solved >= 10 },
    { id: 'solve50', icon: '🏋️', name: 'Repetition Is Learning', desc: 'Solve 50 exercises', f: s => s.stats.solved >= 50 },
    { id: 'solve150', icon: '🧱', name: 'Bricklayer', desc: 'Solve 150 exercises', f: s => s.stats.solved >= 150 },
    { id: 'solve300', icon: '🏛️', name: 'Prolific', desc: 'Solve 300 exercises', f: s => s.stats.solved >= 300 },
    { id: 'ft10', icon: '🎯', name: 'Sharpshooter', desc: 'Solve 10 exercises on the first try, no hints', f: s => s.stats.firstTry >= 10 },
    { id: 'ft50', icon: '🏹', name: 'Dead Eye', desc: '50 first-try, no-hint solves', f: s => s.stats.firstTry >= 50 },
    { id: 'combo10', icon: '🔥', name: 'On a Roll', desc: '10 correct submissions in a row', f: s => s.stats.maxCombo >= 10 },
    { id: 'combo25', icon: '☄️', name: 'Unstoppable', desc: '25 correct submissions in a row', f: s => s.stats.maxCombo >= 25 },
    { id: 'debug1', icon: '🐛', name: 'Bug Hunter', desc: 'Fix your first broken program', f: s => (s.stats.byKind.debug || 0) >= 1 },
    { id: 'debug15', icon: '🔬', name: 'Exterminator', desc: 'Fix 15 broken programs', f: s => (s.stats.byKind.debug || 0) >= 15 },
    { id: 'debug40', icon: '🕵️', name: 'Forensic Coder', desc: 'Fix 40 broken programs', f: s => (s.stats.byKind.debug || 0) >= 40 },
    { id: 'predict10', icon: '🔮', name: 'Mental Interpreter', desc: 'Correctly predict 10 program outputs', f: s => (s.stats.byKind.predict || 0) >= 10 },
    { id: 'refactor5', icon: '♻️', name: 'Code Gardener', desc: 'Complete 5 refactoring challenges', f: s => (s.stats.byKind.refactor || 0) >= 5 },
    { id: 'lesson1', icon: '📖', name: 'Day One', desc: 'Complete your first lesson', f: s => s.stats.lessons >= 1 },
    { id: 'lesson25', icon: '📚', name: 'Well Read', desc: 'Complete 25 lessons', f: s => s.stats.lessons >= 25 },
    { id: 'lesson60', icon: '🎓', name: 'Scholar', desc: 'Complete 60 lessons', f: s => s.stats.lessons >= 60 },
    { id: 'cp1', icon: '🛡️', name: 'Checkpoint Cleared', desc: 'Pass your first module checkpoint', f: s => s.stats.checkpoints >= 1 },
    { id: 'cp5', icon: '⚔️', name: 'Boss Slayer', desc: 'Pass 5 module checkpoints', f: s => s.stats.checkpoints >= 5 },
    { id: 'cp15', icon: '🏆', name: 'Gauntlet Runner', desc: 'Pass 15 module checkpoints', f: s => s.stats.checkpoints >= 15 },
    { id: 'proj1', icon: '🚢', name: 'Shipped It', desc: 'Finish your first project', f: s => s.stats.projects >= 1 },
    { id: 'proj3', icon: '🏗️', name: 'Builder', desc: 'Finish 3 projects', f: s => s.stats.projects >= 3 },
    { id: 'proj6', icon: '🌆', name: 'Portfolio', desc: 'Finish 6 projects', f: s => s.stats.projects >= 6 },
    { id: 'streak3', icon: '🔥', name: 'Three in a Row', desc: 'Practise 3 days running', f: s => s.streak.best >= 3 },
    { id: 'streak7', icon: '📅', name: 'Full Week', desc: 'A 7-day streak', f: s => s.streak.best >= 7 },
    { id: 'streak30', icon: '🗓️', name: 'Habit Formed', desc: 'A 30-day streak', f: s => s.streak.best >= 30 },
    { id: 'streak100', icon: '💯', name: 'Centurion', desc: 'A 100-day streak', f: s => s.streak.best >= 100 },
    { id: 'lvl5', icon: '⭐', name: 'Apprentice', desc: 'Reach level 5', f: s => s.level >= 5 },
    { id: 'lvl10', icon: '🌟', name: 'Coder', desc: 'Reach level 10', f: s => s.level >= 10 },
    { id: 'lvl25', icon: '✨', name: 'Engineer', desc: 'Reach level 25', f: s => s.level >= 25 },
    { id: 'lvl43', icon: '🐍', name: 'Pythonista', desc: 'Reach level 43', f: s => s.level >= 43 },
    { id: 'review5', icon: '🔁', name: 'Spaced Out', desc: 'Complete 5 review sessions', f: s => s.stats.reviews >= 5 },
    { id: 'review25', icon: '🧠', name: 'Memory Palace', desc: 'Complete 25 review sessions', f: s => s.stats.reviews >= 25 },
    { id: 'mastery10', icon: '💪', name: 'Ten Strong', desc: '10 concepts at strong mastery', f: s => countStrong(s, 0.8) >= 10 },
    { id: 'mastery40', icon: '🧗', name: 'Deep Roots', desc: '40 concepts at strong mastery', f: s => countStrong(s, 0.8) >= 40 },
    { id: 'mastery90', icon: '🏔️', name: 'Broad Command', desc: '90 concepts at strong mastery', f: s => countStrong(s, 0.8) >= 90 },
    { id: 'tier1', icon: '🥉', name: 'Beginner Complete', desc: 'Finish every Tier 1 module', f: s => tierDone(s, 1) },
    { id: 'tier2', icon: '🥈', name: 'Intermediate Complete', desc: 'Finish every Tier 2 module', f: s => tierDone(s, 2) },
    { id: 'tier3', icon: '🥇', name: 'Advanced Complete', desc: 'Finish every Tier 3 module', f: s => tierDone(s, 3) },
    { id: 'tier4', icon: '👑', name: 'Mastery Complete', desc: 'Finish the entire journey', f: s => tierDone(s, 4) },
    { id: 'night', icon: '🦉', name: 'Night Owl', desc: 'Solve something after midnight', f: (s, t) => new Date(t).getHours() < 5 },
    { id: 'early', icon: '🌅', name: 'Early Bird', desc: 'Solve something before 7am', f: (s, t) => { const h = new Date(t).getHours(); return h >= 4 && h < 7; } },
    { id: 'marathon', icon: '⏱️', name: 'Marathon', desc: 'Spend 10 hours writing code', f: s => s.stats.timeMs >= 10 * 3600e3 },
    { id: 'grind', icon: '🧗‍♂️', name: 'Persistence', desc: 'Solve an exercise after 5+ failed attempts', f: s => Object.values(s.exercises).some(e => e.solved && e.tries >= 6) },
    { id: 'comeback', icon: '🔙', name: 'Comeback', desc: 'Return after a 7+ day break', f: s => s._comeback === true },
    { id: 'nohints', icon: '🧊', name: 'Cold Solver', desc: 'Solve 25 exercises without opening a hint', f: s => s.stats.solved >= 25 && s.stats.hintsUsed <= 4 }
  ];

  function countStrong(st, th) {
    let n = 0;
    for (const cid in st.concepts) {
      const c = st.concepts[cid];
      const mat = U.clamp(U.clamp(c.reps / 4, 0, 1) * (0.7 + 0.3 * U.clamp((c.ease - 1.3) / 1.2, 0, 1)) - c.lapses * 0.03, 0, 1);
      if (mat >= th) n++;
    }
    return n;
  }
  function tierDone(st, tier) {
    const mods = C().modulesInTier ? C().modulesInTier(tier) : [];
    if (!mods.length) return false;
    return mods.every(m => (m.units || []).every(u => st.units[u.id] && st.units[u.id].done));
  }

  function checkAchievements(st, ts) {
    for (let i = 0; i < ACHIEVEMENTS.length; i++) {
      const a = ACHIEVEMENTS[i];
      if (st.achievements[a.id]) continue;
      let ok = false;
      try { ok = !!a.f(st, ts); } catch (e) { ok = false; }
      if (ok) {
        st.achievements[a.id] = ts;
        if (st === S.state && S.ready) pendingUnlocks.push(a);
      }
    }
  }
  const pendingUnlocks = [];

  /* ==================================================================== */
  /* daily quests (deterministic from the date — stable offline)           */
  /* ==================================================================== */

  const QUEST_POOL = [
    { id: 'solve3', icon: 'check', name: 'Solve 3 exercises', goal: 3, xp: 40, m: d => d.solved },
    { id: 'solve6', icon: 'check', name: 'Solve 6 exercises', goal: 6, xp: 70, m: d => d.solved },
    { id: 'xp120', icon: 'xp', name: 'Earn 120 XP', goal: 120, xp: 45, m: d => d.xp },
    { id: 'xp250', icon: 'xp', name: 'Earn 250 XP', goal: 250, xp: 80, m: d => d.xp },
    { id: 'ft2', icon: 'target', name: '2 first-try solves', goal: 2, xp: 55, m: d => d.firstTry },
    { id: 'debug1', icon: 'debug', name: 'Squash a bug', goal: 1, xp: 50, m: d => d.debug },
    { id: 'lesson1', icon: 'lesson', name: 'Finish a lesson', goal: 1, xp: 45, m: d => d.lessons },
    { id: 'review1', icon: 'review', name: 'Do a review session', goal: 1, xp: 50, m: d => d.reviews }
  ];

  function questsFor(day) {
    const r = U.rng(U.hashStr('pyquest-' + day));
    const pool = QUEST_POOL.slice();
    const picked = [];
    while (picked.length < 3 && pool.length) picked.push(pool.splice(Math.floor(r() * pool.length), 1)[0]);
    const bucket = S.state.daily[day] || { xp: 0, solved: 0, firstTry: 0, debug: 0, lessons: 0, reviews: 0 };
    const claimed = (S.state.quests[day] || { claimed: {} }).claimed;
    return picked.map(q => {
      const have = q.m(bucket);
      return { ...q, have, done: have >= q.goal, claimed: !!claimed[q.id] };
    });
  }

  /* ==================================================================== */
  /* gating & navigation                                                   */
  /* ==================================================================== */

  const isDone = id => !!(S.state.units[id] && S.state.units[id].done);

  function moduleProgress(mod) {
    const us = mod.units || [];
    const done = us.filter(u => isDone(u.id)).length;
    return { done, total: us.length, pct: U.pct(done, us.length), complete: us.length > 0 && done === us.length };
  }

  function moduleUnlocked(mod) {
    const all = C().allModules();
    const i = all.indexOf(mod);
    if (i <= 0) return true;
    const prev = all[i - 1];
    return moduleProgress(prev).complete;
  }

  function unitUnlocked(unit) {
    const mod = C().getModule(unit.moduleId);
    if (!mod || !moduleUnlocked(mod)) return false;
    const idx = mod.units.indexOf(unit);
    if (idx <= 0) return true;
    return isDone(mod.units[idx - 1].id);
  }

  /** The single "do this next" unit. */
  function nextUp() {
    const units = C().allUnits();
    for (const u of units) if (!isDone(u.id)) return u;
    return null;
  }

  /* Prerequisite health: concepts a unit relies on that have gone weak. */
  function rustyFor(unit, th) {
    th = th === undefined ? 0.45 : th;
    const cs = new Set();
    (unit.concepts || []).forEach(c => cs.add(c));
    C().unitExercises(unit).forEach(e => (e.concepts || []).forEach(c => cs.add(c)));
    const out = [];
    cs.forEach(cid => {
      const st = S.state.concepts[cid];
      if (st && st.lastAt && strengthOf(cid) < th) out.push(cid);
    });
    return out;
  }

  /* ==================================================================== */
  /* review engine                                                         */
  /* ==================================================================== */

  function conceptRanking(now) {
    now = now || Date.now();
    const rows = [];
    for (const cid in S.state.concepts) {
      const c = S.state.concepts[cid];
      if (!c.lastAt) continue;
      const meta = C().getConcept(cid);
      const s = strengthOf(cid, now);
      const overdue = (now - c.dueAt) / U.DAY;
      const dueness = c.dueAt <= now ? U.clamp(1 + overdue / 3, 1, 3) : 0.25;
      rows.push({ cid, name: meta.name, strength: s, due: c.dueAt, dueness, score: (1 - s) * dueness * (meta.importance || 1) });
    }
    rows.sort((a, b) => b.score - a.score);
    return rows;
  }

  function dueCount(now) {
    now = now || Date.now();
    let n = 0;
    for (const cid in S.state.concepts) {
      const c = S.state.concepts[cid];
      if (c.lastAt && c.dueAt <= now) n++;
    }
    return n;
  }

  /** Build a retrieval-practice session: items tagged with the weakest/most-due concepts. */
  function buildReview(size) {
    size = size || 8;
    const ranking = conceptRanking().slice(0, 24);
    if (!ranking.length) return [];
    const solved = S.state.exercises;
    const pool = C().allExercises().filter(e => solved[e.id] && solved[e.id].solved);
    if (!pool.length) return [];
    const picked = [];
    const used = new Set();
    for (const row of ranking) {
      if (picked.length >= size) break;
      const cands = pool.filter(e => !used.has(e.id) && (e.concepts || []).includes(row.cid));
      if (!cands.length) continue;
      cands.sort((a, b) => {
        const ra = solved[a.id], rb = solved[b.id];
        return (ra.lastAt - rb.lastAt) || ((b.difficulty || 2) - (a.difficulty || 2));
      });
      const pick = cands[0];
      used.add(pick.id);
      picked.push({ ex: pick, forConcept: row.cid });
    }
    // top up with anything stale
    if (picked.length < size) {
      pool.filter(e => !used.has(e.id))
        .sort((a, b) => solved[a.id].lastAt - solved[b.id].lastAt)
        .slice(0, size - picked.length)
        .forEach(e => { used.add(e.id); picked.push({ ex: e, forConcept: (e.concepts || [])[0] }); });
    }
    return picked;
  }

  /* ==================================================================== */
  /* persistence                                                           */
  /* ==================================================================== */

  const saveEvents = U.debounce(() => PQ.store.set('events', S.events), 250);
  const saveDrafts = U.debounce(() => PQ.store.set('drafts', S.drafts), 500);

  async function init() {
    S.events = (await PQ.store.get('events', [])) || [];
    S.drafts = (await PQ.store.get('drafts', {})) || {};
    S.settings = (await PQ.store.get('settings', null)) || {
      theme: 'dark', codeSize: 14, sound: false, reduceMotion: false, sync: null, offlinePython: false
    };
    recompute();
    S.ready = true;
    return S;
  }

  function recompute() {
    // detect "comeback" before folding wipes it
    const last = S.events.length ? Math.max(...S.events.map(e => e.t)) : 0;
    S.state = fold(S.events);
    if (last && U.daysBetween(last, Date.now()) >= 7 && S.events.length > 5) S.state._comeback = true;
    S.state.level = levelFor(S.state.xp);
  }

  function record(type, payload) {
    const ev = Object.assign({ id: U.uid(), t: Date.now(), type }, payload || {});
    S.events.push(ev);
    const before = { xp: S.state.xp, level: S.state.level };
    apply(S.state, ev);
    if (S.events.length > MAX_EVENTS) compact();
    saveEvents();
    const unlocks = pendingUnlocks.splice(0, pendingUnlocks.length);
    return {
      event: ev,
      xpGained: S.state.xp - before.xp,
      leveledUp: S.state.level > before.level ? S.state.level : 0,
      unlocked: unlocks
    };
  }

  /** Keep the log bounded without losing derived progress. */
  function compact() {
    const keep = S.events.slice(-2000);
    const older = S.events.slice(0, -2000);
    if (!older.length) return;
    // Replace old events with one snapshot event that reproduces their effect.
    const snapState = fold(older);
    const snap = { id: 'snapshot-' + U.uid(), t: older[0].t, type: 'snapshot', state: snapState };
    S.events = [snap].concat(keep);
    // snapshot application
    applySnapshot(S.state, snapState);
  }
  function applySnapshot() { /* handled by fold via 'snapshot' below */ }

  // fold support for snapshots
  const origApply = apply;
  apply = function (st, ev) {                                   // eslint-disable-line
    if (ev.type === 'snapshot') { Object.assign(st, ev.state); return; }
    return origApply(st, ev);
  };

  async function saveNow() {
    await PQ.store.set('events', S.events);
    await PQ.store.set('drafts', S.drafts);
    await PQ.store.set('settings', S.settings);
  }
  async function saveSettings() { await PQ.store.set('settings', S.settings); }

  /* drafts -------------------------------------------------------------- */
  function getDraft(key) { const d = S.drafts[key]; return d ? d.code : null; }
  function setDraft(key, code) {
    S.drafts[key] = { code, t: Date.now() };
    saveDrafts();
  }
  function clearDraft(key) { delete S.drafts[key]; saveDrafts(); }

  /* export / import (the always-available sync transport) ---------------- */
  function exportData() {
    return {
      app: 'pyquest', version: 1, exportedAt: Date.now(),
      events: S.events, drafts: S.drafts,
      settings: { theme: S.settings.theme, codeSize: S.settings.codeSize }
    };
  }

  /** Merge, never overwrite: union events by id, newest draft per key. */
  function mergeData(incoming) {
    if (!incoming || incoming.app !== 'pyquest') throw new Error('Not a PyQuest backup file.');
    const seen = new Set(S.events.map(e => e.id));
    let added = 0;
    (incoming.events || []).forEach(e => {
      if (e && e.id && !seen.has(e.id)) { S.events.push(e); seen.add(e.id); added++; }
    });
    let drafts = 0;
    for (const k in (incoming.drafts || {})) {
      const inc = incoming.drafts[k], cur = S.drafts[k];
      if (!cur || (inc.t || 0) > (cur.t || 0)) { S.drafts[k] = inc; drafts++; }
    }
    S.events.sort((a, b) => a.t - b.t);
    recompute();
    saveNow();
    return { added, drafts };
  }

  async function wipe() {
    S.events = []; S.drafts = {};
    await PQ.store.set('events', []);
    await PQ.store.set('drafts', {});
    recompute();
  }

  /* ==================================================================== */
  /* view helpers                                                          */
  /* ==================================================================== */

  function levelInfo() {
    const xp = S.state.xp, lvl = S.state.level;
    const cur = XP_CURVE(lvl), next = lvl >= MAX_LEVEL ? cur : XP_CURVE(lvl + 1);
    const into = xp - cur, span = Math.max(1, next - cur);
    return { level: lvl, xp, into, span, pct: U.clamp(Math.round((into / span) * 100), 0, 100), next, max: lvl >= MAX_LEVEL };
  }
  function rank() {
    let r = RANKS[0];
    for (const x of RANKS) if (S.state.level >= x[0]) r = x;
    return { name: r[1] };
  }
  function journeyProgress() {
    const units = C().allUnits();
    const done = units.filter(u => isDone(u.id)).length;
    return { done, total: units.length, pct: U.pct(done, units.length) };
  }
  function streakInfo() {
    const s = S.state.streak;
    const today = U.dayKey();
    const activeToday = !!S.state.days[today];
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const k = U.dayKey(Date.now() - i * U.DAY);
      days.push({ key: k, on: !!S.state.days[k], today: i === 0, label: new Date(Date.now() - i * U.DAY).toLocaleDateString(undefined, { weekday: 'narrow' }) });
    }
    return { current: s.current, best: s.best, freezes: s.freezes, activeToday, days, mult: streakMult(S.state) };
  }

  PQ.engine = {
    init, record, recompute, saveNow, saveSettings,
    get state() { return S.state; },
    get events() { return S.events; },
    get settings() { return S.settings; },
    set events(v) { S.events = v; },
    get drafts() { return S.drafts; },
    set drafts(v) { S.drafts = v; },
    ACHIEVEMENTS, RANKS,
    strengthOf, conceptRanking, dueCount, buildReview, questsFor,
    isDone, moduleProgress, moduleUnlocked, unitUnlocked, nextUp, rustyFor,
    levelInfo, rank, journeyProgress, streakInfo, levelFor, XP_CURVE,
    getDraft, setDraft, clearDraft,
    exportData, mergeData, wipe, fold
  };
})(window.PQ);
