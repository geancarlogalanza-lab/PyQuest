/* PyQuest — utilities: DOM, markdown, dates, ids */
window.PQ = window.PQ || {};
(function (PQ) {
  'use strict';

  /* ---------- DOM ---------- */
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  function el(tag, attrs, children) {
    const n = document.createElement(tag);
    // Allow el(tag, [children]) — otherwise the array is walked as attributes
    // and the children are silently dropped.
    if (Array.isArray(attrs)) { children = attrs; attrs = null; }
    if (attrs) for (const k in attrs) {
      const v = attrs[k];
      if (v === null || v === undefined || v === false) continue;
      if (k === 'class') n.className = v;
      else if (k === 'html') n.innerHTML = v;
      else if (k === 'text') n.textContent = v;
      else if (k === 'dataset') Object.assign(n.dataset, v);
      else if (k.startsWith('on') && typeof v === 'function') n.addEventListener(k.slice(2), v);
      else n.setAttribute(k, v === true ? '' : v);
    }
    if (children) (Array.isArray(children) ? children : [children]).forEach(c => {
      if (c === null || c === undefined || c === false) return;
      n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return n;
  }

  const esc = s => String(s === undefined || s === null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

  /* ---------- ids & math ---------- */
  function uid() {
    return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
  }
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const pct = (a, b) => (b <= 0 ? 0 : clamp(Math.round((a / b) * 100), 0, 100));

  /* deterministic seeded RNG (mulberry32) — used for daily quests */
  function rng(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function hashStr(s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }

  /* ---------- dates ---------- */
  const DAY = 86400000;
  function dayKey(ts) {
    const d = new Date(ts === undefined ? Date.now() : ts);
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function dayStart(ts) { const d = new Date(ts === undefined ? Date.now() : ts); d.setHours(0, 0, 0, 0); return d.getTime(); }
  function daysBetween(a, b) { return Math.round((dayStart(b) - dayStart(a)) / DAY); }
  function fmtDur(ms) {
    const s = Math.round(ms / 1000);
    if (s < 60) return s + 's';
    const m = Math.round(s / 60);
    if (m < 60) return m + 'm';
    const h = Math.floor(m / 60);
    return h + 'h ' + (m % 60) + 'm';
  }
  function ago(ts) {
    const d = daysBetween(ts, Date.now());
    if (d === 0) return 'today';
    if (d === 1) return 'yesterday';
    if (d < 7) return d + ' days ago';
    if (d < 30) return Math.round(d / 7) + ' weeks ago';
    return Math.round(d / 30) + ' months ago';
  }

  /* ---------- mini markdown ---------- */
  // Supports: # h, **b**, *i*, `code`, links, - / 1. lists, > quote, ---,
  // tables, ```py fences (with optional following ```out fence), :::tip callouts.
  const SENT = String.fromCharCode(17);
  const RE_SENT = new RegExp(SENT + '(\\d+)' + SENT, 'g');
  function inline(s) {
    const codes = [];
    s = s.replace(/`([^`]+)`/g, (m, c) => { codes.push(c); return SENT + (codes.length - 1) + SENT; });
    s = esc(s);
    s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/(^|[\s(])\*([^*\n]+)\*/g, '$1<em>$2</em>');
    s = s.replace(RE_SENT, (m, i) => '<code>' + esc(codes[+i]) + '</code>');
    return s;
  }

  function md(src) {
    if (!src) return '';
    const lines = String(src).replace(/\r\n/g, '\n').split('\n');
    let out = '';
    let i = 0;
    let listType = null, listBuf = [];

    function flushList() {
      if (!listType) return;
      out += '<' + listType + '>' + listBuf.map(x => '<li>' + inline(x) + '</li>').join('') + '</' + listType + '>';
      listType = null; listBuf = [];
    }

    while (i < lines.length) {
      const line = lines[i];

      // fenced code — ``` or ~~~ (tildes let curriculum files live in plain JS strings)
      const fence = line.match(/^(```|~~~)(\w*)\s*$/);
      if (fence) {
        flushList();
        const CLOSE = fence[1] === '~~~' ? /^~~~\s*$/ : /^```\s*$/;
        const OUTF = fence[1] === '~~~' ? /^~~~out\s*$/ : /^```out\s*$/;
        const lang = fence[2] || 'text';
        i++;
        const body = [];
        while (i < lines.length && !CLOSE.test(lines[i])) body.push(lines[i++]);
        i++; // closing fence
        // an immediately-following "out" fence becomes the shown output
        let outBody = null;
        let j = i;
        while (j < lines.length && lines[j].trim() === '') j++;
        if (j < lines.length && OUTF.test(lines[j])) {
          j++;
          const ob = [];
          while (j < lines.length && !CLOSE.test(lines[j])) ob.push(lines[j++]);
          j++;
          outBody = ob.join('\n');
          i = j;
        }
        const code = body.join('\n');
        const runnable = (lang === 'py' || lang === 'python');
        out += '<div class="codeblock" data-code="' + esc(code) + '">' +
          '<div class="cb-head"><span class="cb-lang">' + esc(lang === 'py' ? 'python' : lang) + '</span>' +
          (runnable ? '<button class="btn ghost sm js-runcode" type="button">▸ Run</button>' : '') +
          '</div><pre><code>' + esc(code) + '</code></pre>' +
          (outBody !== null ? '<div class="cb-out"><b>Output</b>' + esc(outBody) + '</div>' : '') +
          '<div class="cb-live"></div></div>';
        continue;
      }

      // callout  :::tip Title
      const co = line.match(/^:::(tip|warn|trap|why)\s*(.*)$/);
      if (co) {
        flushList();
        i++;
        const body = [];
        while (i < lines.length && !/^:::\s*$/.test(lines[i])) body.push(lines[i++]);
        i++;
        const titles = { tip: 'Tip', warn: 'Watch out', trap: 'Common trap', why: 'Why it matters' };
        out += '<div class="callout ' + co[1] + '"><span class="ct">' +
          esc(co[2] || titles[co[1]]) + '</span>' + md(body.join('\n')) + '</div>';
        continue;
      }

      // table
      if (/^\|.*\|\s*$/.test(line) && i + 1 < lines.length && /^\|[\s:|-]+\|\s*$/.test(lines[i + 1])) {
        flushList();
        const cells = l => l.trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim());
        const head = cells(line);
        i += 2;
        const rows = [];
        while (i < lines.length && /^\|.*\|\s*$/.test(lines[i])) rows.push(cells(lines[i++]));
        out += '<table><thead><tr>' + head.map(h => '<th>' + inline(h) + '</th>').join('') +
          '</tr></thead><tbody>' + rows.map(r => '<tr>' + r.map(c => '<td>' + inline(c) + '</td>').join('') + '</tr>').join('') +
          '</tbody></table>';
        continue;
      }

      // heading
      const h = line.match(/^(#{1,4})\s+(.*)$/);
      if (h) { flushList(); out += '<h' + (h[1].length + 1) + '>' + inline(h[2]) + '</h' + (h[1].length + 1) + '>'; i++; continue; }

      // hr
      if (/^(---|\*\*\*)\s*$/.test(line)) { flushList(); out += '<hr>'; i++; continue; }

      // blockquote
      if (/^>\s?/.test(line)) {
        flushList();
        const b = [];
        while (i < lines.length && /^>\s?/.test(lines[i])) b.push(lines[i++].replace(/^>\s?/, ''));
        out += '<blockquote>' + md(b.join('\n')) + '</blockquote>';
        continue;
      }

      // lists
      const ul = line.match(/^\s*[-*]\s+(.*)$/);
      const ol = line.match(/^\s*\d+[.)]\s+(.*)$/);
      if (ul || ol) {
        const t = ul ? 'ul' : 'ol';
        if (listType && listType !== t) flushList();
        listType = t;
        listBuf.push((ul || ol)[1]);
        i++;
        continue;
      }

      if (line.trim() === '') { flushList(); i++; continue; }

      // paragraph
      flushList();
      const p = [];
      while (i < lines.length && lines[i].trim() !== '' && !/^(```|~~~|:::|#{1,4}\s|>|\s*[-*]\s|\s*\d+[.)]\s|\||---)/.test(lines[i])) p.push(lines[i++]);
      if (p.length) out += '<p>' + inline(p.join('\n')) + '</p>';
      else if (i < lines.length && lines[i].trim() !== '') { out += '<p>' + inline(lines[i]) + '</p>'; i++; }
    }
    flushList();
    return out;
  }

  /* ---------- misc ---------- */
  function debounce(fn, ms) {
    let t;
    return function () { clearTimeout(t); const a = arguments, c = this; t = setTimeout(() => fn.apply(c, a), ms); };
  }
  function plural(n, one, many) { return n + ' ' + (n === 1 ? one : (many || one + 's')); }
  function copy(text) {
    if (navigator.clipboard) return navigator.clipboard.writeText(text);
    const ta = el('textarea', { text }); document.body.appendChild(ta); ta.select();
    document.execCommand('copy'); ta.remove(); return Promise.resolve();
  }
  function download(name, text, type) {
    const blob = new Blob([text], { type: type || 'application/json' });
    const a = el('a', { href: URL.createObjectURL(blob), download: name });
    document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }

  PQ.util = { $, $$, el, esc, uid, clamp, pct, rng, hashStr, dayKey, dayStart, daysBetween, fmtDur, ago, md, debounce, plural, copy, download, DAY };
})(window.PQ);
