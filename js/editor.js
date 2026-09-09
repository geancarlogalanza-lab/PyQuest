/* PyQuest — code editor. CodeMirror 5 + a touch key bar so phones stay usable. */
(function (PQ) {
  'use strict';
  const { el } = PQ.util;

  const KEYS = [
    { l: ':', i: ':' }, { l: '(', i: '(' }, { l: ')', i: ')' }, { l: '[', i: '[' }, { l: ']', i: ']' },
    { l: '{', i: '{' }, { l: '}', i: '}' }, { l: '"', i: '"' }, { l: "'", i: "'" },
    { l: '=', i: '=' }, { l: '==', i: '==' }, { l: '_', i: '_' }, { l: '.', i: '.' },
    { l: ',', i: ', ' }, { l: '+', i: ' + ' }, { l: '-', i: ' - ' }, { l: '*', i: '*' },
    { l: '%', i: ' % ' }, { l: '#', i: '# ' }, { l: '<', i: ' < ' }, { l: '>', i: ' > ' },
    { l: 'f"', i: 'f"' }, { l: '{}', i: '{}', back: 1 }
  ];

  function create(host, opts) {
    opts = opts || {};
    const wrap = el('div', { class: 'ed-wrap' });
    const bar = el('div', { class: 'ed-bar' });
    const fname = el('span', { class: 'fname', text: opts.filename || 'your_code.py' });
    bar.appendChild(fname);
    bar.appendChild(el('span', { class: 'grow', style: 'flex:1' }));
    if (opts.barExtra) opts.barExtra.forEach(b => bar.appendChild(b));
    wrap.appendChild(bar);

    const ta = el('textarea');
    ta.value = opts.value || '';
    wrap.appendChild(ta);

    const keybar = el('div', { class: 'keybar' });
    wrap.appendChild(keybar);
    host.appendChild(wrap);

    const size = (PQ.engine && PQ.engine.settings && PQ.engine.settings.codeSize) || 14;

    const cm = CodeMirror.fromTextArea(ta, {
      mode: { name: 'python', version: 3, singleLineStringErrors: false },
      theme: 'pyquest',
      lineNumbers: true,
      indentUnit: 4,
      tabSize: 4,
      indentWithTabs: false,
      smartIndent: true,
      lineWrapping: true,
      autoCloseBrackets: true,
      styleActiveLine: true,
      matchBrackets: true,
      readOnly: opts.readOnly ? 'nocursor' : false,
      viewportMargin: Infinity,
      extraKeys: {
        Tab: cmi => {
          if (cmi.somethingSelected()) cmi.indentSelection('add');
          else cmi.replaceSelection('    ', 'end');
        },
        'Shift-Tab': cmi => cmi.indentSelection('subtract'),
        'Ctrl-Enter': () => opts.onRun && opts.onRun(),
        'Cmd-Enter': () => opts.onRun && opts.onRun(),
        'Shift-Enter': () => opts.onTest && opts.onTest(),
        'Ctrl-/': cmi => cmi.toggleComment(),
        'Cmd-/': cmi => cmi.toggleComment(),
        'Ctrl-S': () => false,
        'Cmd-S': () => false
      }
    });

    cm.getWrapperElement().style.fontSize = size + 'px';
    if (opts.minHeight) cm.getWrapperElement().style.minHeight = opts.minHeight;

    // touch key bar
    KEYS.forEach(k => {
      keybar.appendChild(el('button', {
        type: 'button', text: k.l, class: k.l.length > 2 ? 'wide' : '',
        onmousedown: e => e.preventDefault(),
        onclick: () => {
          cm.replaceSelection(k.i, 'end');
          if (k.back) { const c = cm.getCursor(); cm.setCursor({ line: c.line, ch: c.ch - k.back }); }
          cm.focus();
        }
      }));
    });
    const mk = (label, fn, cls) => el('button', {
      type: 'button', text: label, class: 'wide ' + (cls || ''),
      onmousedown: e => e.preventDefault(),
      onclick: () => { fn(); cm.focus(); }
    });
    keybar.appendChild(mk('⇥', () => cm.replaceSelection('    ', 'end')));
    keybar.appendChild(mk('⇤', () => cm.indentSelection('subtract')));
    keybar.appendChild(mk('↶', () => cm.undo()));
    keybar.appendChild(mk('↷', () => cm.redo()));

    if (opts.onChange) cm.on('change', () => opts.onChange(cm.getValue()));

    let marks = [];
    const api = {
      cm,
      wrap,
      get value() { return cm.getValue(); },
      set value(v) { cm.setValue(v); },
      focus() { cm.focus(); },
      refresh() { cm.refresh(); },
      setSize(px) { cm.getWrapperElement().style.fontSize = px + 'px'; cm.refresh(); },
      setReadOnly(b) { cm.setOption('readOnly', b ? 'nocursor' : false); },
      clearMarks() { marks.forEach(m => cm.removeLineClass(m, 'background', 'cm-err-line')); marks = []; },
      markError(line) {
        api.clearMarks();
        if (!line) return;
        const h = cm.getLineHandle(line - 1);
        if (h) { cm.addLineClass(h, 'background', 'cm-err-line'); marks.push(h); }
      },
      destroy() { try { cm.toTextArea(); } catch (e) { /* ignore */ } wrap.remove(); }
    };
    setTimeout(() => cm.refresh(), 20);
    return api;
  }

  /* read-only snippet renderer used inside lesson prose */
  function snippet(host, code) {
    return create(host, { value: code, readOnly: true });
  }

  PQ.editor = { create, snippet };
})(window.PQ);
