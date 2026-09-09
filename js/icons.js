/* PyQuest — icon set.
 *
 * A small stroke-icon system replacing the emoji that used to carry the UI.
 * Every icon is one consistent grid, one stroke weight, and inherits
 * currentColor — so an icon always matches the text it sits beside, at any
 * size, on any platform. Emoji could do none of those things.
 */
(function (PQ) {
  'use strict';

  const P = {
    /* navigation */
    home: '<path d="M3 9.5 12 3l9 6.5V20a1.5 1.5 0 0 1-1.5 1.5H15V14H9v7.5H4.5A1.5 1.5 0 0 1 3 20z"/>',
    journey: '<path d="M2 6.5 8.5 3 15.5 6.5 22 3v14.5L15.5 21 8.5 17.5 2 21z"/><path d="M8.5 3v14.5M15.5 6.5V21"/>',
    practice: '<path d="M17 2.5 20.5 6 17 9.5"/><path d="M3.5 11.5V10A4 4 0 0 1 7.5 6h13"/><path d="M7 21.5 3.5 18 7 14.5"/><path d="M20.5 12.5V14a4 4 0 0 1-4 4h-13"/>',
    skills: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none"/>',
    profile: '<circle cx="12" cy="9" r="6"/><path d="M8.5 14.3 7.5 21.5l4.5-2.6 4.5 2.6-1-7.2"/>',
    playground: '<rect x="2.5" y="3.5" width="19" height="17" rx="2.5"/><path d="M7 9.5 10 12l-3 2.5M13 15h4"/>',
    settings: '<path d="M4 21v-6M4 11V3M12 21v-9M12 8V3M20 21v-4M20 13V3"/><path d="M1.5 15h5M9.5 8h5M17.5 17h5"/>',

    /* exercise kinds */
    code: '<path d="m15.5 17.5 5.5-5.5-5.5-5.5M8.5 6.5 3 12l5.5 5.5"/>',
    debug: '<path d="M8.5 6.5a3.5 3.5 0 0 1 7 0"/><path d="M6 10.5h12V15a6 6 0 0 1-12 0z"/><path d="M2.5 12.5h3.5M18 12.5h3.5M4 6.5 6.5 9M20 6.5 17.5 9M4 18.5 6.5 16.5M20 18.5 17.5 16.5"/>',
    quiz: '<circle cx="12" cy="12" r="9"/><path d="M9.4 9.2a2.7 2.7 0 0 1 5.2.8c0 1.8-2.6 2.4-2.6 2.4"/><path d="M12 16.6h.01" stroke-width="2.2"/>',
    predict: '<path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z"/><circle cx="12" cy="12" r="2.6"/>',
    refactor: '<path d="m12 3 1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M18.5 16.5 19.4 19l2.5.9-2.5.9-.9 2.5-.9-2.5-2.5-.9 2.5-.9z"/>',
    project: '<path d="m12 2.5 8.5 4.7v9.6L12 21.5l-8.5-4.7V7.2z"/><path d="M12 12.2 20.5 7.2M12 12.2v9.3M12 12.2 3.5 7.2"/>',
    explore: '<path d="M9 3.5v6.2L4.3 18a2 2 0 0 0 1.7 3h12a2 2 0 0 0 1.7-3L15 9.7V3.5"/><path d="M8 3.5h8M8.2 14h7.6"/>',

    /* status and objects */
    lesson: '<path d="M4 19.2A2.7 2.7 0 0 1 6.7 16.5H20"/><path d="M6.7 2.5H20v19H6.7A2.7 2.7 0 0 1 4 18.8V5.2a2.7 2.7 0 0 1 2.7-2.7z"/>',
    checkpoint: '<path d="M12 21.5s7.8-3.6 7.8-9.6V5.3L12 2.5 4.2 5.3v6.6c0 6 7.8 9.6 7.8 9.6z"/><path d="m9 12 2.2 2.2L15.4 10"/>',
    lock: '<rect x="4" y="10.5" width="16" height="10.5" rx="2"/><path d="M7.8 10.5V7.2a4.2 4.2 0 0 1 8.4 0v3.3"/>',
    check: '<path d="m4.5 12.5 5 5 10-11"/>',
    cross: '<path d="M18 6 6 18M6 6l12 12"/>',
    chevron: '<path d="m9 5.5 6.5 6.5L9 18.5"/>',
    back: '<path d="m14 5.5-6.5 6.5L14 18.5"/>',
    play: '<path d="M7 4.5 19.5 12 7 19.5z"/>',
    flame: '<path d="M12 21.5c3.9 0 6.8-2.6 6.8-6.3 0-2.9-1.9-5.3-3.4-7.2C14 6.2 13 4.3 12 2.5c-1 2.9-2.9 4.4-4.4 6.3-1.5 1.9-2.4 4.3-2.4 6.4 0 3.7 2.9 6.3 6.8 6.3z"/>',
    xp: '<path d="M13.2 2.5 3.8 13.8h7l-1.2 7.7 9.6-11.3h-7z"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 6.8V12l3.4 2.2"/>',
    review: '<path d="M20.5 12a8.5 8.5 0 1 1-2.6-6.1"/><path d="M20.8 3.5v5h-5"/>',
    download: '<path d="M12 3.5v11.5M7.5 10.5 12 15l4.5-4.5"/><path d="M4 17.5v1.5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-1.5"/>',
    upload: '<path d="M12 15V3.5M7.5 8 12 3.5 16.5 8"/><path d="M4 17.5v1.5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-1.5"/>',
    warning: '<path d="M10.3 3.8 2.4 17.5a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.8a2 2 0 0 0-3.4 0z"/><path d="M12 9v4.5M12 17.3h.01" stroke-width="2.2"/>',
    hint: '<path d="M9.2 18h5.6M10 21.5h4"/><path d="M12 2.5a6.5 6.5 0 0 0-3.8 11.8c.6.5 1 1.2 1 1.9v.3h5.6v-.3c0-.7.4-1.4 1-1.9A6.5 6.5 0 0 0 12 2.5z"/>',
    reset: '<path d="M3.2 12a8.8 8.8 0 1 0 2.7-6.3"/><path d="M3 3.5v5h5"/>',
    reveal: '<rect x="4" y="10.5" width="16" height="10.5" rx="2"/><path d="M7.8 10.5V7.2a4.2 4.2 0 0 1 8.2-1.2"/>',
    trophy: '<path d="M7.5 3.5h9v6a4.5 4.5 0 0 1-9 0z"/><path d="M7.5 5.5H4.8v1.7a3 3 0 0 0 2.7 3M16.5 5.5h2.7v1.7a3 3 0 0 1-2.7 3"/><path d="M12 14v3.5M8.5 20.5h7l-.7-3h-5.6z"/>',
    target: '<circle cx="12" cy="12" r="3"/><path d="M12 2.5V6M12 18v3.5M21.5 12H18M6 12H2.5"/>',
    sparkle: '<path d="m12 3 2.1 5.7L20 11l-5.9 2.3L12 19l-2.1-5.7L4 11l5.9-2.3z"/>',
    python: '<path d="M12 2.5c-3 0-4.6 1.2-4.6 3.4v2.4h4.8v.9H5.5C3.3 9.2 2 10.7 2 13.9c0 3 1.1 4.7 3.3 4.7h1.6v-2.9c0-2.3 1.8-3.9 4-3.9h4.5c2 0 3.3-1.4 3.3-3.3V5.9c0-2-1.5-3.4-3.6-3.4z"/><path d="M9.4 5.4h.01" stroke-width="2"/>',
    empty: '<circle cx="12" cy="12" r="9"/><path d="M8.5 14.5s1.3-1.5 3.5-1.5 3.5 1.5 3.5 1.5"/><path d="M9 9.5h.01M15 9.5h.01" stroke-width="2.2"/>'
  };

  const NS = 'http://www.w3.org/2000/svg';

  function svgHTML(name, size) {
    const body = P[name];
    if (!body) return '';
    return '<svg class="ico" viewBox="0 0 24 24" width="' + size + '" height="' + size + '" ' +
      'fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" ' +
      'stroke-linejoin="round" aria-hidden="true" focusable="false">' + body + '</svg>';
  }

  /** Returns an <svg> element. Sizes in px; inherits colour from its parent. */
  function icon(name, size) {
    const holder = document.createElementNS(NS, 'svg');
    holder.setAttribute('viewBox', '0 0 24 24');
    holder.setAttribute('width', size || 18);
    holder.setAttribute('height', size || 18);
    holder.setAttribute('fill', 'none');
    holder.setAttribute('stroke', 'currentColor');
    holder.setAttribute('stroke-width', '1.7');
    holder.setAttribute('stroke-linecap', 'round');
    holder.setAttribute('stroke-linejoin', 'round');
    holder.setAttribute('aria-hidden', 'true');
    holder.setAttribute('focusable', 'false');
    holder.setAttribute('class', 'ico');
    holder.innerHTML = P[name] || '';
    return holder;
  }

  /** Solid variant, for the few places that need weight rather than line. */
  function iconFilled(name, size) {
    const el = icon(name, size);
    el.setAttribute('fill', 'currentColor');
    el.setAttribute('stroke', 'none');
    return el;
  }

  /* ---------- brand mark ----------
     The viper head, same geometry as the app icon (tools/logo.js). Kept here
     so the sidebar, the boot screen and the installed icon are one shape. */
  const LOGO_PATH = 'M275 190L540 224L805 190L882 352L850 376L700 800L622 828L540 858L458 828L380 800L230 376L198 352ZM246 238L450 332L256 340ZM834 238L630 332L824 340ZM470 366L450 408L492 408ZM610 366L588 408L630 408ZM436 450L540 420L644 450L576 782L540 808L504 782ZM320 420L360 452L486 790L446 770ZM760 420L720 452L594 790L634 770Z';
  const LOGO_GREEN = '#3EAD4A';

  function logo(size) {
    const el = document.createElementNS(NS, 'svg');
    el.setAttribute('viewBox', '0 0 1080 1080');
    el.setAttribute('width', size || 24);
    el.setAttribute('height', size || 24);
    el.setAttribute('aria-hidden', 'true');
    el.setAttribute('focusable', 'false');
    el.setAttribute('class', 'logo-mark');
    el.innerHTML = '<path fill="' + LOGO_GREEN + '" fill-rule="evenodd" d="' + LOGO_PATH + '"/>';
    return el;
  }

  // Any element with data-logo="<px>" gets the mark, so markup stays declarative.
  function paintLogos(root) {
    (root || document).querySelectorAll('[data-logo]').forEach(n => {
      n.innerHTML = '';
      n.appendChild(logo(parseInt(n.dataset.logo, 10) || 24));
    });
  }
  // Paint now, for the shell markup that sits above this script: waiting for
  // DOMContentLoaded would hold the boot mark behind the CodeMirror download.
  // The listener below then catches anything declared after it.
  paintLogos();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => paintLogos());

  PQ.logo = logo;
  PQ.paintLogos = paintLogos;
  PQ.LOGO_PATH = LOGO_PATH;
  PQ.icon = icon;
  PQ.iconFilled = iconFilled;
  PQ.iconHTML = svgHTML;
  PQ.ICON_NAMES = Object.keys(P);
})(window.PQ);
