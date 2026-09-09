/* PyQuest — the exercise player and the lesson / checkpoint / project screens. */
(function (PQ) {
  'use strict';
  const U = PQ.util;
  const { el, esc, md } = U;

  /* ==================================================================== */
  /* Exercise player                                                       */
  /* ==================================================================== */

  /* Buttons keep a stable shape while busy: same icon slot, swapped for a spinner. */
  function setBusy(btn, label) {
    btn.innerHTML = '';
    btn.appendChild(el('span', { class: 'spinner' }));
    btn.appendChild(el('span', { text: label }));
  }
  function setLabel(btn, iconName, label) {
    btn.innerHTML = '';
    btn.appendChild(PQ.icon(iconName, iconName === 'play' ? 13 : 15));
    btn.appendChild(el('span', { text: label }));
  }
  function cpMark() {
    const m = el('div', { style: 'display:grid;place-items:center;width:40px;height:40px;border-radius:var(--r-md);background:var(--acc-soft);color:var(--acc);flex:0 0 auto' });
    m.appendChild(PQ.icon('checkpoint', 20));
    return m;
  }
  function resultMark(passed) {
    const m = el('div', { style: 'display:grid;place-items:center;width:48px;height:48px;margin:0 auto var(--s3);border-radius:50%;background:' + (passed ? 'var(--ok-soft);color:var(--ok)' : 'var(--err-soft);color:var(--err)') });
    m.appendChild(PQ.icon(passed ? 'checkpoint' : 'cross', 24));
    return m;
  }
  function stageMark(done, i) {
    const m = el('div', { class: 'lr-ico' });
    if (done) m.appendChild(PQ.icon('check', 15));
    else m.appendChild(el('span', { text: String(i + 1) }));
    return m;
  }

  function staticChecks(ex, code) {
    const out = [];
    (ex.requires || []).forEach(r => {
      const hit = r.re ? new RegExp(r.re).test(code) : code.includes(r.contains);
      if (!hit) out.push({ name: r.msg || ('Must use ' + (r.contains || r.re)), ok: false, msg: 'This exercise asks you to use it — that is the point of the practice.' });
    });
    (ex.forbids || []).forEach(r => {
      const hit = r.re ? new RegExp(r.re).test(code) : code.includes(r.contains);
      if (hit) out.push({ name: r.msg || ('Do it without ' + (r.contains || r.re)), ok: false, msg: 'Solve it the long way here — you are practising the underlying idea.' });
    });
    return out;
  }

  /**
   * Mount an interactive exercise.
   * opts: { onSolved(res), onSkip(), mode:'lesson'|'checkpoint'|'review', showNext }
   */
  function mountExercise(host, ex, opts) {
    opts = opts || {};
    const mode = opts.mode || 'lesson';
    const noHelp = mode === 'checkpoint';
    const draftKey = 'ex:' + ex.id;
    const started = Date.now();
    let tries = 0, hints = 0, runs = 0, revealed = false, solved = false, recorded = false;

    const root = el('div', { class: 'ex-root' });
    host.appendChild(root);

    /* header */
    const kind = ex.kind || 'code';
    const kindMark = el('div', { class: 'ex-kind k-' + kind });
    kindMark.appendChild(PQ.icon(PQ.ui.KIND_ICON[kind] || 'code', 17));
    const metaLine = el('div', { class: 'meta' }, [
      el('span', { text: PQ.ui.KIND_NAME[kind] || 'Exercise' }),
      el('span', { class: 'meta-item' }, [PQ.ui.diffDots(ex.difficulty || 2)]),
      el('span', { text: PQ.content.xpFor(ex) + ' XP' })
    ]);
    const head = el('div', { class: 'ex-head' }, [
      kindMark,
      el('div', { style: 'flex:1;min-width:0' }, [
        metaLine,
        el('h2', { class: 'ex-title', text: ex.title || 'Challenge' })
      ])
    ]);
    root.appendChild(head);

    if (ex.intro) root.appendChild(PQ.ui.prose(ex.intro));
    root.appendChild(PQ.ui.prose(ex.prompt || ''));

    /* ---------------- quiz / predict ---------------- */
    if (kind === 'quiz' || kind === 'predict') {
      let picked = -1, answered = false;
      const list = el('div', { class: 'stack tight mt' });
      const fb = el('div');
      (ex.choices || []).forEach((c, i) => {
        const b = el('button', { class: 'choice', onclick: () => {
          if (answered) return;
          picked = i;
          U.$$('.choice', list).forEach((x, j) => x.classList.toggle('sel', j === i));
          submit.disabled = false;
        } }, [
          el('span', { class: 'cl', text: String.fromCharCode(65 + i) }),
          el('span', { class: 'prose', style: 'flex:1', html: md(c) })
        ]);
        list.appendChild(b);
      });
      const submit = el('button', { class: 'btn primary lg block mt', text: 'Check answer', disabled: true, onclick: () => {
        if (answered) return;
        answered = true; tries += 1;
        const ok = picked === ex.answer;
        U.$$('.choice', list).forEach((x, j) => {
          x.classList.remove('sel');
          if (j === ex.answer) x.classList.add('right');
          else if (j === picked) x.classList.add('wrong');
        });
        submit.disabled = true;
        fb.innerHTML = '';
        fb.appendChild(el('div', { class: 'verdict ' + (ok ? 'win' : 'lose') }, [
          el('h3', { text: ok ? '✓ Correct' : '✗ Not quite' }),
          el('div', { class: 'prose', html: md(ex.explain || '') })
        ]));
        finish(ok);
      } });
      root.appendChild(list);
      root.appendChild(submit);
      root.appendChild(fb);
      return api();
    }

    /* ---------------- code-ish kinds ---------------- */
    const saved = PQ.engine.getDraft(draftKey);
    const startCode = (saved !== null && saved !== undefined && saved !== '') ? saved : (ex.starter || '');

    if (ex.files) {
      const fl = el('div', { class: 'callout tip' }, [el('span', { class: 'ct', text: 'Files available to your program' })]);
      Object.keys(ex.files).forEach(f => {
        fl.appendChild(el('div', { class: 'small', html: '<code>' + esc(f) + '</code>' }));
      });
      root.appendChild(fl);
    }
    if (ex.stdin && ex.stdin.length) {
      root.appendChild(el('div', { class: 'callout tip' }, [
        el('span', { class: 'ct', text: 'Input this program will receive' }),
        el('div', { class: 'small', html: ex.stdin.map(s => '<code>' + esc(s) + '</code>').join(' → ') })
      ]));
    }

    const edHost = el('div', { class: 'mt' });
    root.appendChild(edHost);

    const consoleBox = el('div', { class: 'console mt hidden' });
    const testsBox = el('div', { class: 'tests mt' });
    const verdictBox = el('div');
    const hintBox = el('div');

    const ed = PQ.editor.create(edHost, {
      value: startCode,
      minHeight: (ex.editorHeight || 220) + 'px',
      onChange: v => PQ.engine.setDraft(draftKey, v),
      onRun: () => run(),
      onTest: () => check()
    });

    /* action bar */
    const runBtn = el('button', { class: 'btn', onclick: () => run() },
      [PQ.icon('play', 13), el('span', { text: 'Run' })]);
    const checkBtn = el('button', { class: 'btn primary', onclick: () => check() },
      [PQ.icon('check', 15), el('span', { text: 'Check' })]);
    const hintBtn = el('button', { class: 'btn ghost', onclick: () => showHint() },
      [PQ.icon('hint', 15), el('span', { text: 'Hint' })]);
    const resetBtn = el('button', { class: 'btn ghost', onclick: async () => {
      if (await PQ.ui.confirm('Reset your code?', 'This replaces what you have written with the starting code.', 'Reset')) {
        ed.value = ex.starter || '';
        PQ.engine.clearDraft(draftKey);
      }
    } });
    resetBtn.appendChild(PQ.icon('reset', 15));
    resetBtn.appendChild(el('span', { text: 'Reset' }));
    const solBtn = el('button', { class: 'btn ghost', onclick: () => showSolution() },
      [PQ.icon('reveal', 15), el('span', { text: 'Solution' })]);
    solBtn.classList.add('hidden');

    const actions = el('div', { class: 'btn-group sticky-actions' }, [runBtn, checkBtn]);
    if (!noHelp && (ex.hints || []).length) actions.appendChild(hintBtn);
    actions.appendChild(resetBtn);
    if (!noHelp && ex.solution) actions.appendChild(solBtn);
    actions.appendChild(el('span', { class: 'tiny dim hide-mobile', style: 'margin-left:auto;align-self:center',
      html: '<span class="kbd">Ctrl</span>+<span class="kbd">↵</span> run · <span class="kbd">Shift</span>+<span class="kbd">↵</span> check' }));

    root.appendChild(actions);
    root.appendChild(consoleBox);
    root.appendChild(testsBox);
    root.appendChild(hintBox);
    root.appendChild(verdictBox);

    function showConsole(r) {
      consoleBox.classList.remove('hidden');
      consoleBox.innerHTML = '';
      consoleBox.appendChild(el('div', { class: 'c-head', text: r.error ? 'Output — then an error' : 'Output' }));
      const out = (r.stdout || '').replace(/\n+$/, '');
      if (out) consoleBox.appendChild(el('pre', { text: out }));
      else if (!r.error) consoleBox.appendChild(el('div', { class: 'empty', text: 'Your program printed nothing.' }));
      if (r.error) {
        consoleBox.appendChild(el('pre', { class: 'err', text: r.error }));
        const line = PQ.errors.errorLine(r.error);
        ed.markError(line);
        const ex2 = PQ.errors.explain(r.error);
        if (ex2) {
          const c = el('div', { class: 'callout trap', style: 'margin:0' }, [
            el('span', { class: 'ct', text: 'What that means' }),
            el('div', { class: 'prose', html: md('**' + ex2.title + '**\n\n' + ex2.body) })
          ]);
          consoleBox.appendChild(c);
        }
      } else ed.clearMarks();
    }

    async function run() {
      runBtn.disabled = checkBtn.disabled = true;
      setBusy(runBtn, 'Running');
      runs += 1;
      const r = await PQ.runner.exec({ code: ed.value, stdin: ex.stdin || [], files: ex.files || null });
      runBtn.disabled = checkBtn.disabled = false;
      setLabel(runBtn, 'play', 'Run');
      showConsole(r);
      testsBox.innerHTML = '';
      return r;
    }

    async function check() {
      if (solved && mode !== 'review') { next(); return; }
      runBtn.disabled = checkBtn.disabled = true;
      setBusy(checkBtn, 'Checking');
      const code = ed.value;
      const stat = staticChecks(ex, code);
      let r;
      if (stat.length) {
        r = { ok: false, stdout: '', error: null, tests: stat };
      } else {
        r = await PQ.runner.grade({ code, stdin: ex.stdin || [], files: ex.files || null, tests: ex.tests || [] });
      }
      runBtn.disabled = checkBtn.disabled = false;
      setLabel(checkBtn, 'check', 'Check');
      tries += 1;
      showConsole(r);
      renderTests(r);
      if (r.ok && (!ex.tests || !ex.tests.length) && !r.error) r.ok = true;
      if (r.ok) {
        solved = true;
        verdict(true, r);
        finish(true);
      } else {
        verdict(false, r);
        if (tries >= 3 && ex.solution && !noHelp) solBtn.classList.remove('hidden');
      }
    }

    function renderTests(r) {
      testsBox.innerHTML = '';
      const list = r.tests || [];
      if (!list.length) return;
      const passed = list.filter(t => t.ok).length;
      testsBox.appendChild(el('div', { class: 'spread', style: 'margin-bottom:2px' }, [
        el('span', { class: 'tiny dim', style: 'font-weight:700;text-transform:uppercase;letter-spacing:.07em', text: 'Checks' }),
        el('span', { class: 'tiny ' + (passed === list.length ? 'pill ok' : 'dim'), text: passed + ' / ' + list.length + ' passing' })
      ]));
      list.forEach(t => {
        const mark = el('span', { class: 'ti' });
        mark.appendChild(PQ.icon(t.ok ? 'check' : 'cross', 13));
        const node = el('div', { class: 'test ' + (t.ok ? 'pass' : 'fail') }, [
          mark,
          el('div', { style: 'flex:1;min-width:0' }, [
            el('span', { text: t.hidden && !t.ok && mode === 'checkpoint' ? 'Hidden check' : t.name }),
            (!t.ok && t.msg) ? el('span', { class: 'tmsg', text: t.msg }) : null
          ])
        ]);
        testsBox.appendChild(node);
      });
    }

    function verdict(win, r) {
      verdictBox.innerHTML = '';
      if (win) {
        const msgs = ['Nailed it.', 'All checks green.', 'That is exactly it.', 'Clean solve.', 'Works.'];
        const box = el('div', { class: 'verdict win' }, [
          el('h3', {}, [PQ.icon('check', 17), el('span', { text: msgs[Math.floor(Math.random() * msgs.length)] })]),
          el('div', { class: 'muted small', text: tries === 1 && hints === 0 && !revealed ? 'First try, no hints — that counts double toward mastery.' : 'Solved in ' + U.plural(tries, 'attempt') + (hints ? ' with ' + U.plural(hints, 'hint') : '') + '.' })
        ]);
        if (ex.takeaway) box.appendChild(el('div', { class: 'prose mt', html: md(ex.takeaway) }));
        if (ex.solution && !noHelp) {
          box.appendChild(el('button', {
            class: 'btn sm ghost mt', text: 'Compare with a reference solution',
            onclick: () => PQ.ui.modal(b => {
              b.appendChild(el('h2', { text: 'One way to write it' }));
              b.appendChild(PQ.ui.prose('```py\n' + ex.solution + '\n```' + (ex.solutionNote ? '\n\n' + ex.solutionNote : '')));
            })
          }));
        }
        verdictBox.appendChild(box);
      } else {
        const failed = (r.tests || []).filter(t => !t.ok).length;
        verdictBox.appendChild(el('div', { class: 'verdict lose' }, [
          el('h3', {}, [PQ.icon('cross', 17), el('span', { text: r.error ? 'Your program stopped with an error' : U.plural(failed, 'check') + ' still failing' })]),
          el('div', { class: 'muted small', text: r.error ? 'Fix the error first, then check again. The explanation above tells you what Python is complaining about.' : 'Read the first failing check — it tells you what was expected and what you produced.' })
        ]));
      }
    }

    function showHint() {
      const hs = ex.hints || [];
      if (hints >= hs.length) { PQ.ui.toast('No more hints — you have them all.', ''); return; }
      hintBox.appendChild(el('div', { class: 'hintbox' }, [
        el('span', { class: 'hn', text: 'Hint ' + (hints + 1) + ' of ' + hs.length }),
        el('div', { class: 'prose', html: md(hs[hints]) })
      ]));
      hints += 1;
      if (hints >= hs.length) hintBtn.disabled = true;
      setLabel(hintBtn, 'hint', hints >= hs.length ? 'No hints left' : 'Hint (' + (hs.length - hints) + ')');
    }

    async function showSolution() {
      if (!await PQ.ui.confirm('Reveal the solution?',
        'You will still get credit, but much less XP — and the concept will be scheduled for review sooner, because reading a solution is not the same as producing one.',
        'Show me')) return;
      revealed = true;
      PQ.ui.modal(b => {
        b.appendChild(el('h2', { text: 'Reference solution' }));
        b.appendChild(PQ.ui.prose('```py\n' + (ex.solution || '') + '\n```' + (ex.solutionNote ? '\n\n' + ex.solutionNote : '')));
        b.appendChild(el('button', {
          class: 'btn mt block', text: 'Put it in my editor', onclick: () => { ed.value = ex.solution || ''; }
        }));
      });
    }

    /* ---------------- shared finish path ---------------- */
    function finish(ok) {
      if (ok) solved = true;
      if (ok && !recorded) {
        recorded = true;
        const res = PQ.engine.record('attempt', {
          ex: ex.id, ok: true, tries, hints, runs, revealed,
          ms: Date.now() - started, kind: ex.kind, cp: mode === 'checkpoint',
          review: mode === 'review', concepts: ex.concepts || []
        });
        PQ.ui.reward(res);
        if (opts.onSolved) opts.onSolved(res);
        showNextButton();
      } else if (!ok && opts.onFailed) opts.onFailed();
    }

    function showNextButton() {
      if (!opts.showNext) return;
      const b = el('button', { class: 'btn ok lg block mt', text: opts.nextLabel || 'Continue →', onclick: () => next() });
      verdictBox.appendChild(b);
      setTimeout(() => b.scrollIntoView({ behavior: 'smooth', block: 'center' }), 60);
    }
    function next() { if (opts.onNext) opts.onNext(); }

    function api() {
      return {
        root,
        get solved() { return solved; },
        /** Record an abandoned attempt so mastery stays honest. */
        leave() {
          if (!recorded && tries >= 2 && !solved) {
            recorded = true;
            PQ.engine.record('attempt', {
              ex: ex.id, ok: false, tries, hints, runs, revealed,
              ms: Date.now() - started, kind: ex.kind, concepts: ex.concepts || []
            });
          }
        }
      };
    }
    return api();
  }

  /* ==================================================================== */
  /* Lesson view                                                           */
  /* ==================================================================== */

  function lessonView(host, unitId) {
    const unit = PQ.content.getUnit(unitId);
    if (!unit) { host.appendChild(el('div', { class: 'wrap' }, [el('p', { text: 'That lesson does not exist.' })])); return; }
    if (unit.kind === 'checkpoint') return checkpointView(host, unit);
    if (unit.kind === 'project') return projectView(host, unit);

    const mod = PQ.content.getModule(unit.moduleId);
    const exercises = unit.exercises || [];
    const total = exercises.length + 1;
    let step = 0;
    let player = null;

    // resume at the first unsolved exercise if the learner has been here before
    if (PQ.engine.isDone(unit.id)) step = 0;
    else {
      const firstUnsolved = exercises.findIndex(e => !(PQ.engine.state.exercises[e.id] || {}).solved);
      if (firstUnsolved > 0) step = firstUnsolved + 1;
    }

    const shell = el('div');
    host.appendChild(shell);

    function paintTop() {
      const back = PQ.ui.backButton(() => { if (player) player.leave(); PQ.ui.go('#/module/' + mod.id); }, 'Back to module');
      const prog = el('div', { class: 'progress-line', style: 'flex:1;max-width:320px' }, [
        PQ.ui.bar(U.pct(step, total - 1), 'ok'),
        el('span', { text: step === 0 ? 'read' : step + '/' + (total - 1) })
      ]);
      PQ.ui.topbar([back, PQ.ui.crumb([{ label: mod.title, route: '#/module/' + mod.id }, { label: unit.title }]), el('span', { class: 'grow', style: 'flex:1' }), prog, PQ.ui.statusChip({ compact: true })]);
    }

    function paint() {
      paintTop();
      shell.innerHTML = '';
      if (player) { player.leave(); player = null; }

      if (step === 0) {
        const wrap = el('div', { class: 'wrap' });
        const header = el('div', { class: 'lesson-head' });
        header.appendChild(PQ.ui.metaRow([
          { icon: 'lesson', text: 'Lesson' },
          { icon: 'clock', text: (unit.minutes || 10) + ' min' },
          exercises.length ? { text: U.plural(exercises.length, 'challenge') } : null
        ]));
        header.appendChild(el('h1', { style: 'margin:var(--s2) 0', text: unit.title }));
        if ((unit.concepts || []).length) {
          const chips = el('div', { class: 'chips' });
          unit.concepts.slice(0, 5).forEach(c => chips.appendChild(
            el('span', { class: 'chip', text: PQ.content.getConcept(c).name })));
          header.appendChild(chips);
        }
        wrap.appendChild(header);
        wrap.appendChild(PQ.ui.prose(unit.content || ''));
        wrap.appendChild(el('div', { class: 'sticky-actions' }, [
          el('button', {
            class: 'btn primary lg block', text: exercises.length ? 'Start practising — ' + U.plural(exercises.length, 'challenge') + ' →' : 'Mark complete →',
            onclick: () => { step = 1; if (!exercises.length) return complete(); paint(); }
          })
        ]));
        shell.appendChild(wrap);
        return;
      }

      const ex = exercises[step - 1];
      if (!ex) return complete();
      const wrap = el('div', { class: 'wrap' });
      shell.appendChild(wrap);
      player = mountExercise(wrap, ex, {
        mode: 'lesson',
        showNext: true,
        nextLabel: step >= exercises.length ? 'Finish lesson →' : 'Next challenge →',
        onNext: () => { step += 1; if (step > exercises.length) complete(); else paint(); }
      });
      const skip = el('div', { class: 'center mt' }, [
        el('button', {
          class: 'btn ghost sm', text: 'Skip for now',
          onclick: () => { if (player) player.leave(); step += 1; if (step > exercises.length) complete(); else paint(); }
        })
      ]);
      wrap.appendChild(skip);
    }

    function complete() {
      const allSolved = exercises.every(e => (PQ.engine.state.exercises[e.id] || {}).solved);
      let res = null;
      if (allSolved && !PQ.engine.isDone(unit.id)) {
        res = PQ.engine.record('unit', { unit: unit.id, kind: 'lesson' });
        PQ.ui.reward(res, 'lesson complete');
      }
      const nxt = PQ.content.nextUnit(unit.id);
      shell.innerHTML = '';
      const wrap = el('div', { class: 'wrap' });
      const doneMark = el('div', { style: 'display:grid;place-items:center;width:48px;height:48px;margin:0 auto var(--s3);border-radius:50%;background:' + (allSolved ? 'var(--ok-soft);color:var(--ok)' : 'var(--surface-2);color:var(--fg-3)') });
      doneMark.appendChild(PQ.icon(allSolved ? 'check' : 'clock', 24));
      wrap.appendChild(el('div', { class: 'card pad-lg center' }, [
        doneMark,
        el('h1', { text: allSolved ? 'Lesson complete' : 'Progress saved' }),
        el('p', { class: 'muted', text: allSolved
          ? 'You demonstrated every skill in this lesson. It now counts toward your mastery and will come back in review.'
          : 'Some challenges are still unsolved. The lesson is not marked complete until you have done them — that is the point.' }),
        el('div', { class: 'grid g3 mt' }, [
          PQ.ui.stat(exercises.filter(e => (PQ.engine.state.exercises[e.id] || {}).solved).length + '/' + exercises.length, 'solved'),
          PQ.ui.stat(res ? '+' + res.xpGained : '—', 'xp this lesson'),
          PQ.ui.stat(PQ.engine.state.level, 'level')
        ]),
        el('div', { class: 'btn-group mt-lg', style: 'justify-content:center' }, [
          !allSolved ? el('button', { class: 'btn', text: 'Back to challenges', onclick: () => { step = 1; paint(); } }) : null,
          nxt ? el('button', { class: 'btn primary lg', text: 'Next: ' + nxt.title + ' →', onclick: () => PQ.ui.go('#/unit/' + nxt.id) }) : null,
          el('button', { class: 'btn ghost', text: 'Back to module', onclick: () => PQ.ui.go('#/module/' + mod.id) })
        ])
      ]));
      shell.appendChild(wrap);
      PQ.ui.topbar([PQ.ui.crumb([{ label: mod.title, route: '#/module/' + mod.id }, { label: unit.title }])]);
    }

    paint();
  }

  /* ==================================================================== */
  /* Checkpoint ("boss") view                                              */
  /* ==================================================================== */

  function checkpointView(host, unit) {
    const mod = PQ.content.getModule(unit.moduleId);
    const items = unit.items || [];
    const need = Math.ceil(items.length * (unit.pass || 0.8));
    let idx = -1;
    let correct = 0;
    let player = null;
    const results = [];

    const shell = el('div');
    host.appendChild(shell);

    function top() {
      PQ.ui.topbar([
        PQ.ui.backButton(() => PQ.ui.go('#/module/' + mod.id), 'Back to module'),
        PQ.ui.crumb([{ label: mod.title, route: '#/module/' + mod.id }, { label: 'Checkpoint' }]),
        el('span', { style: 'flex:1' }),
        idx >= 0 ? el('span', { class: 'pill', text: (idx + 1) + ' / ' + items.length }) : null,
        PQ.ui.statusChip({ compact: true })
      ]);
    }

    function intro() {
      top();
      shell.innerHTML = '';
      const done = PQ.engine.isDone(unit.id);
      shell.appendChild(el('div', { class: 'wrap' }, [
        el('div', { class: 'card pad-lg' }, [
          el('div', { class: 'row', style: 'gap:var(--s3)' }, [
            cpMark(),
            el('div', [el('h1', { style: 'margin:0', text: unit.title }),
              el('div', { class: 'muted small', text: 'Module checkpoint' })])
          ]),
          el('div', { class: 'prose mt', html: md(unit.brief ||
            'Prove you own this module. ' + U.plural(items.length, 'question') + ', **no hints and no solutions**, and you need ' + need + ' right to pass.\n\nIf you do not pass, nothing is lost — you will be shown exactly which ideas to go back to.') }),
          done ? el('div', { class: 'callout tip mt' }, [el('span', { class: 'ct', text: 'Already cleared' }), el('p', { text: 'You have passed this checkpoint. Retaking it is good practice and still earns review XP.' })]) : null,
          el('button', { class: 'btn primary lg block mt', text: done ? 'Retake checkpoint' : 'Begin checkpoint', onclick: () => { idx = 0; correct = 0; results.length = 0; paint(); } })
        ])
      ]));
    }

    function paint() {
      top();
      shell.innerHTML = '';
      if (player) { player = null; }
      const ex = items[idx];
      if (!ex) return finish();
      const wrap = el('div', { class: 'wrap' });
      shell.appendChild(wrap);
      wrap.appendChild(el('div', { class: 'bar ok mb' }, [el('i', { style: 'width:' + U.pct(idx, items.length) + '%' })]));
      let answered = false;
      player = mountExercise(wrap, ex, {
        mode: 'checkpoint',
        showNext: true,
        nextLabel: idx + 1 >= items.length ? 'See result →' : 'Next →',
        onSolved: () => { if (!answered) { answered = true; correct += 1; results.push({ ex, ok: true }); } },
        onNext: () => { idx += 1; paint(); }
      });
      // allow moving on after a wrong answer too
      wrap.appendChild(el('div', { class: 'center mt' }, [
        el('button', {
          class: 'btn ghost sm', text: 'Give up on this one →',
          onclick: () => {
            if (!answered) {
              answered = true;
              results.push({ ex, ok: false });
              PQ.engine.record('attempt', { ex: ex.id, ok: false, tries: 2, hints: 0, kind: ex.kind, cp: true, concepts: ex.concepts || [] });
            }
            idx += 1; paint();
          }
        })
      ]));
    }

    function finish() {
      top();
      const passed = correct >= need;
      let res = null;
      if (passed && !PQ.engine.isDone(unit.id)) {
        res = PQ.engine.record('unit', { unit: unit.id, kind: 'checkpoint', score: correct / items.length });
        PQ.ui.reward(res, 'checkpoint cleared');
      }
      const weak = results.filter(r => !r.ok).flatMap(r => r.ex.concepts || []);
      const uniqWeak = Array.from(new Set(weak));
      shell.innerHTML = '';
      const nxt = PQ.content.nextUnit(unit.id);
      shell.appendChild(el('div', { class: 'wrap' }, [
        el('div', { class: 'card pad-lg center' }, [
          resultMark(passed),
          el('h1', { text: passed ? 'Checkpoint cleared' : 'Not this time' }),
          el('p', { class: 'muted', text: correct + ' of ' + items.length + ' correct — you needed ' + need + '.' }),
          el('div', { class: 'bar ok mt', style: 'max-width:320px;margin:14px auto' }, [el('i', { style: 'width:' + U.pct(correct, items.length) + '%' })]),
          uniqWeak.length ? el('div', { class: 'callout warn', style: 'text-align:left' }, [
            el('span', { class: 'ct', text: 'Go back to these ideas' }),
            el('div', { html: uniqWeak.map(c => '<code>' + esc(PQ.content.getConcept(c).name) + '</code>').join(' · ') })
          ]) : null,
          el('div', { class: 'btn-group mt', style: 'justify-content:center' }, [
            !passed ? el('button', { class: 'btn primary lg', text: 'Try again', onclick: () => { idx = 0; correct = 0; results.length = 0; paint(); } }) : null,
            passed && nxt ? el('button', { class: 'btn primary lg', text: 'Next: ' + nxt.title + ' →', onclick: () => PQ.ui.go('#/unit/' + nxt.id) }) : null,
            el('button', { class: 'btn ghost', text: 'Back to module', onclick: () => PQ.ui.go('#/module/' + mod.id) })
          ])
        ])
      ]));
    }

    if (idx < 0) intro();
  }

  /* ==================================================================== */
  /* Project view                                                          */
  /* ==================================================================== */

  function projectView(host, p) {
    const mod = PQ.content.getModule(p.moduleId);
    const st = PQ.engine.state.projects[p.id] || { stages: {}, done: false };
    const draftKey = 'proj:' + p.id;
    let stageIdx = (p.stages || []).findIndex(s => !st.stages[s.id]);
    if (stageIdx < 0) stageIdx = Math.max(0, (p.stages || []).length - 1);

    const shell = el('div');
    host.appendChild(shell);

    PQ.ui.topbar([
      PQ.ui.backButton(() => PQ.ui.go('#/module/' + mod.id), 'Back to module'),
      PQ.ui.crumb([{ label: mod.title, route: '#/module/' + mod.id }, { label: p.title }]),
      el('span', { style: 'flex:1' }),
      PQ.ui.statusChip({ compact: true })
    ]);

    const wrap = el('div', { class: 'wrap wide' });
    shell.appendChild(wrap);

    wrap.appendChild(PQ.ui.metaRow([
      { icon: 'project', text: 'Project' },
      { text: (p.xp || 300) + ' XP' },
      { text: U.plural((p.stages || []).length, 'stage') }
    ]));
    wrap.appendChild(el('h1', { style: 'margin:var(--s2) 0 var(--s4)', text: p.title }));
    wrap.appendChild(PQ.ui.prose(p.brief || ''));

    /* stage list */
    const stageList = el('div', { class: 'stack tight mt' });
    wrap.appendChild(el('h2', { class: 'mt-lg', text: 'Stages' }));
    wrap.appendChild(stageList);

    const edHost = el('div', { class: 'mt-lg' });
    wrap.appendChild(el('h2', { text: 'Your build' }));
    wrap.appendChild(edHost);

    const consoleBox = el('div', { class: 'console mt hidden' });
    const testsBox = el('div', { class: 'tests mt' });
    const verdictBox = el('div');

    const saved = PQ.engine.getDraft(draftKey);
    const ed = PQ.editor.create(edHost, {
      value: (saved === null || saved === undefined || saved === '') ? (p.starter || '') : saved,
      filename: p.filename || 'project.py',
      minHeight: '340px',
      onChange: v => PQ.engine.setDraft(draftKey, v),
      onRun: () => runIt(),
      onTest: () => checkStage(stageIdx)
    });

    const runBtn = el('button', { class: 'btn', onclick: () => runIt() },
      [PQ.icon('play', 13), el('span', { text: 'Run' })]);
    const checkBtn = el('button', { class: 'btn primary', onclick: () => checkStage(stageIdx) },
      [PQ.icon('check', 15), el('span', { text: 'Check stage' })]);
    const allBtn = el('button', { class: 'btn ghost', onclick: () => checkAll() },
      [PQ.icon('checkpoint', 15), el('span', { text: 'Check all stages' })]);
    wrap.appendChild(el('div', { class: 'btn-group sticky-actions' }, [runBtn, checkBtn, allBtn]));
    wrap.appendChild(consoleBox);
    wrap.appendChild(testsBox);
    wrap.appendChild(verdictBox);

    function paintStages() {
      const cur = PQ.engine.state.projects[p.id] || { stages: {} };
      stageList.innerHTML = '';
      (p.stages || []).forEach((s, i) => {
        const done = !!cur.stages[s.id];
        const row = el('button', {
          class: 'lesson-row' + (done ? ' done' : '') + (i === stageIdx ? '' : ''),
          style: i === stageIdx ? 'border-color:var(--acc)' : '',
          onclick: () => { stageIdx = i; paintStages(); showStage(); }
        }, [
          stageMark(done, i),
          el('div', { class: 'lr-body' }, [
            el('div', { class: 'lr-title', text: s.title }),
            el('div', { class: 'lr-sub', text: done ? 'passed' : (i === stageIdx ? 'current stage' : 'not yet checked') })
          ]),
          el('span', { class: 'pill tiny', text: '+' + (s.xp || 40) })
        ]);
        stageList.appendChild(row);
      });
    }

    const specBox = el('div');
    wrap.insertBefore(specBox, edHost.previousSibling);
    function showStage() {
      const s = (p.stages || [])[stageIdx];
      specBox.innerHTML = '';
      if (!s) return;
      specBox.appendChild(el('div', { class: 'callout why mt' }, [
        el('span', { class: 'ct', text: 'Stage ' + (stageIdx + 1) + ' — ' + s.title }),
        el('div', { class: 'prose', html: md(s.spec || '') })
      ]));
    }

    async function runIt() {
      runBtn.disabled = true; setBusy(runBtn, 'Running');
      const r = await PQ.runner.exec({ code: ed.value, stdin: p.stdin || [], files: p.files || null }, 20000);
      runBtn.disabled = false; setLabel(runBtn, 'play', 'Run');
      showConsole(r);
      testsBox.innerHTML = '';
    }

    function showConsole(r) {
      consoleBox.classList.remove('hidden');
      consoleBox.innerHTML = '';
      consoleBox.appendChild(el('div', { class: 'c-head', text: 'Output' }));
      const out = (r.stdout || '').replace(/\n+$/, '');
      if (out) consoleBox.appendChild(el('pre', { text: out }));
      else if (!r.error) consoleBox.appendChild(el('div', { class: 'empty', text: 'No output.' }));
      if (r.error) {
        consoleBox.appendChild(el('pre', { class: 'err', text: r.error }));
        ed.markError(PQ.errors.errorLine(r.error));
        const ex2 = PQ.errors.explain(r.error);
        if (ex2) consoleBox.appendChild(el('div', { class: 'callout trap', style: 'margin:0' }, [
          el('span', { class: 'ct', text: 'What that means' }),
          el('div', { class: 'prose', html: md('**' + ex2.title + '**\n\n' + ex2.body) })
        ]));
      } else ed.clearMarks();
    }

    async function checkStage(i) {
      const s = (p.stages || [])[i];
      if (!s) return;
      checkBtn.disabled = true; setBusy(checkBtn, 'Checking');
      const r = await PQ.runner.grade({ code: ed.value, stdin: s.stdin || p.stdin || [], files: p.files || null, tests: s.tests || [] }, 20000);
      checkBtn.disabled = false; setLabel(checkBtn, 'check', 'Check stage');
      showConsole(r);
      renderTests(r);
      verdictBox.innerHTML = '';
      if (r.ok) {
        const already = (PQ.engine.state.projects[p.id] || { stages: {} }).stages[s.id];
        if (!already) {
          const res = PQ.engine.record('stage', { project: p.id, stage: s.id, xp: s.xp || 40, concepts: s.concepts || p.concepts || [] });
          PQ.ui.reward(res, 'stage ' + (i + 1) + ' passed');
        }
        paintStages();
        const cur = PQ.engine.state.projects[p.id] || { stages: {} };
        const remaining = (p.stages || []).filter(x => !cur.stages[x.id]);
        verdictBox.appendChild(el('div', { class: 'verdict win' }, [
          el('h3', {}, [PQ.icon('check', 17), el('span', { text: 'Stage ' + (i + 1) + ' passed' })]),
          el('div', { class: 'muted small', text: remaining.length ? U.plural(remaining.length, 'stage') + ' to go.' : 'Every stage passes. Run the full check to ship it.' }),
          remaining.length ? el('button', {
            class: 'btn ok mt', text: 'Go to stage ' + ((p.stages || []).indexOf(remaining[0]) + 1) + ' →',
            onclick: () => { stageIdx = (p.stages || []).indexOf(remaining[0]); paintStages(); showStage(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
          }) : el('button', { class: 'btn ok mt', text: 'Ship the project', onclick: () => checkAll() })
        ]));
      } else {
        verdictBox.appendChild(el('div', { class: 'verdict lose' }, [
          el('h3', {}, [PQ.icon('cross', 17), el('span', { text: 'Stage ' + (i + 1) + ' not passing yet' })]),
          el('div', { class: 'muted small', text: 'Only this stage is being checked — earlier stages must keep working too.' })
        ]));
      }
    }

    async function checkAll() {
      allBtn.disabled = true; setBusy(allBtn, 'Checking all');
      const all = [];
      for (const s of (p.stages || [])) {
        const r = await PQ.runner.grade({ code: ed.value, stdin: s.stdin || p.stdin || [], files: p.files || null, tests: s.tests || [] }, 20000);
        all.push({ s, r });
      }
      allBtn.disabled = false; setLabel(allBtn, 'checkpoint', 'Check all stages');
      testsBox.innerHTML = '';
      let passed = 0;
      all.forEach(({ s, r }, i) => {
        if (r.ok) passed++;
        const sMark = el('span', { class: 'ti' });
        sMark.appendChild(PQ.icon(r.ok ? 'check' : 'cross', 13));
        testsBox.appendChild(el('div', { class: 'test ' + (r.ok ? 'pass' : 'fail') }, [
          sMark,
          el('div', [el('span', { text: 'Stage ' + (i + 1) + ' — ' + s.title }),
            !r.ok ? el('span', { class: 'tmsg', text: (r.tests || []).filter(t => !t.ok).map(t => t.name).join(', ') || (r.error || '').split('\n').pop() }) : null])
        ]));
        if (r.ok) {
          const cur = PQ.engine.state.projects[p.id] || { stages: {} };
          if (!cur.stages[s.id]) PQ.engine.record('stage', { project: p.id, stage: s.id, xp: s.xp || 40, concepts: s.concepts || [] });
        }
      });
      paintStages();
      verdictBox.innerHTML = '';
      if (passed === all.length && all.length) {
        if (!(PQ.engine.state.projects[p.id] || {}).done) {
          const res = PQ.engine.record('project', { project: p.id, xp: p.xp || 300 });
          PQ.engine.record('unit', { unit: p.id, kind: 'project' });
          PQ.ui.reward(res, 'project shipped');
        }
        const nxt = PQ.content.nextUnit(p.id);
        verdictBox.appendChild(el('div', { class: 'verdict win' }, [
          el('h3', {}, [PQ.icon('trophy', 17), el('span', { text: 'Project shipped' })]),
          el('div', { class: 'prose', html: md(p.outro || 'Every stage passes. You built a working program from a specification — that is what the job actually is.') }),
          nxt ? el('button', { class: 'btn primary lg mt', text: 'Next: ' + nxt.title + ' →', onclick: () => PQ.ui.go('#/unit/' + nxt.id) }) : null
        ]));
      } else {
        verdictBox.appendChild(el('div', { class: 'verdict lose' }, [
          el('h3', { text: passed + ' of ' + all.length + ' stages passing' }),
          el('div', { class: 'muted small', text: 'A later change can break an earlier stage — that is why the full check exists.' })
        ]));
      }
    }

    function renderTests(r) {
      testsBox.innerHTML = '';
      (r.tests || []).forEach(t => {
        const tMark = el('span', { class: 'ti' });
        tMark.appendChild(PQ.icon(t.ok ? 'check' : 'cross', 13));
        testsBox.appendChild(el('div', { class: 'test ' + (t.ok ? 'pass' : 'fail') }, [
          tMark,
          el('div', { style: 'flex:1;min-width:0' }, [el('span', { text: t.name }), !t.ok && t.msg ? el('span', { class: 'tmsg', text: t.msg }) : null])
        ]));
      });
    }

    paintStages();
    showStage();
  }

  PQ.exercise = { mount: mountExercise };
  PQ.ui.registerView('unit', { nav: 'path', render: lessonView });
})(window.PQ);
