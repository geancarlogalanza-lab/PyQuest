#!/usr/bin/env node
/* Generate every PyQuest icon from tools/logo.js.
 *
 *   node tools/make-icons.js
 *
 * The mark is flat polygons, so the PNGs are rasterised here with an even-odd
 * hit test and 4x supersampling — no image library, and the SVG and the PNGs
 * can never drift apart because both come from the same coordinates.
 */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const logo = require('./logo.js');

const OUT = path.join(__dirname, '..', 'icons');
const BG = [0x00, 0x00, 0x00];
const FG = [0x3e, 0xad, 0x4a];   // logo.GREEN

/* ---------- shapes ---------- */

// rounded-square mask for the standard icon; maskable icons bleed to the edge
function insideRoundRect(px, py, size, r) {
  const x = Math.min(px, size - px), y = Math.min(py, size - py);
  if (x < 0 || y < 0) return false;
  if (x >= r || y >= r) return true;
  return Math.hypot(r - x, r - y) <= r;
}

/* ---------- rasteriser ---------- */
function render(size, maskable) {
  const SS = 4;
  const radius = size * 0.222;
  // a maskable icon may be cropped to a circle, so the mark shrinks into the
  // safe zone rather than risking its horns being clipped off
  const markScale = maskable ? 0.68 : 0.84;
  const px = Buffer.alloc(size * size * 4);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let bgHits = 0, fgHits = 0;
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const fx = x + (sx + 0.5) / SS;
          const fy = y + (sy + 0.5) / SS;
          if (maskable || insideRoundRect(fx, fy, size, radius)) bgHits++;
          // map the pixel back onto the 1080 design grid, about the centre
          const g = logo.GRID / size / markScale;
          const gx = (fx - size / 2) * g + logo.GRID / 2;
          const gy = (fy - size / 2) * g + logo.GRID / 2;
          if (logo.isGreen(gx, gy)) fgHits++;
        }
      }
      const total = SS * SS;
      const bgA = bgHits / total;
      const fgA = fgHits / total;
      const a = Math.max(bgA, fgA);
      const i = (y * size + x) * 4;
      if (a > 0) {
        for (let c = 0; c < 3; c++) {
          px[i + c] = Math.round((FG[c] * fgA + BG[c] * bgA * (1 - fgA)) / Math.max(a, 1e-6));
        }
      }
      px[i + 3] = Math.round(a * 255);
    }
  }
  return px;
}

/* A tab icon is a different problem from an app icon. At 16px the rounded black
   plate eats a third of the width and the mark inside it turns to mush, so the
   favicon drops the plate and fills the frame with the mark. The cut-outs then
   go transparent, which means they pick up the tab strip and stay legible on a
   light theme and a dark one alike. */
function renderGlyph(size) {
  const SS = 4;
  const [bx, by, bs] = logo.squareBox(0.06);
  const px = Buffer.alloc(size * size * 4);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let hits = 0;
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const gx = bx + ((x + (sx + 0.5) / SS) / size) * bs;
          const gy = by + ((y + (sy + 0.5) / SS) / size) * bs;
          if (logo.isGreen(gx, gy)) hits++;
        }
      }
      const i = (y * size + x) * 4;
      for (let c = 0; c < 3; c++) px[i + c] = FG[c];
      px[i + 3] = Math.round((hits / (SS * SS)) * 255);
    }
  }
  return px;
}

/* The link-preview card: not square, no rounded corners, and the mark simply
   centred on black. The words come from the og:title beside it, so the image
   stays the mark and nothing else. */
function renderCard(w, h) {
  const SS = 3;
  const gridPx = h * 0.72;          // how big the 1080 design grid is drawn
  const px = Buffer.alloc(w * h * 4);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let fgHits = 0;
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const fx = x + (sx + 0.5) / SS;
          const fy = y + (sy + 0.5) / SS;
          const g = logo.GRID / gridPx;
          if (logo.isGreen((fx - w / 2) * g + logo.GRID / 2,
                           (fy - h / 2) * g + logo.GRID / 2)) fgHits++;
        }
      }
      const fgA = fgHits / (SS * SS);
      const i = (y * w + x) * 4;
      for (let c = 0; c < 3; c++) px[i + c] = Math.round(FG[c] * fgA + BG[c] * (1 - fgA));
      px[i + 3] = 255;              // the card is fully opaque
    }
  }
  return px;
}

/* ---------- minimal PNG writer ---------- */
const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = -1;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}

function png(w, h, pixels) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 6;   // 8-bit RGBA
  const stride = w * 4 + 1;
  const raw = Buffer.alloc(h * stride);
  for (let y = 0; y < h; y++) {
    raw[y * stride] = 0;      // filter: none
    pixels.copy(raw, y * stride + 1, y * w * 4, (y + 1) * w * 4);
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0))
  ]);
}

/* ---------- ICO ---------- */
/* An .ico is a directory of images; PNG payloads are valid and every browser
   still in use reads them. Bundling 16/32/48 means the browser picks rather
   than downscaling one bitmap badly. */
function ico(parts) {
  const dir = Buffer.alloc(6 + 16 * parts.length);
  dir.writeUInt16LE(0, 0);
  dir.writeUInt16LE(1, 2);              // type 1 = icon
  dir.writeUInt16LE(parts.length, 4);

  let offset = dir.length;
  parts.forEach((part, i) => {
    const o = 6 + i * 16;
    dir[o] = part.size >= 256 ? 0 : part.size;   // 0 means 256
    dir[o + 1] = part.size >= 256 ? 0 : part.size;
    dir.writeUInt16LE(1, o + 4);        // colour planes
    dir.writeUInt16LE(32, o + 6);       // bits per pixel
    dir.writeUInt32LE(part.data.length, o + 8);
    dir.writeUInt32LE(offset, o + 12);
    offset += part.data.length;
  });
  return Buffer.concat([dir, ...parts.map(p => p.data)]);
}

/* ---------- svg ---------- */
function svg(maskable) {
  const G = logo.GRID;
  const scale = maskable ? 0.68 : 0.84;
  const inset = (G - G * scale) / 2;
  const shape = `<g transform="translate(${inset} ${inset}) scale(${scale})">` +
    `<path fill="${logo.GREEN}" fill-rule="evenodd" d="${logo.svgPaths()}"/></g>`;
  const bg = maskable
    ? `<rect width="${G}" height="${G}" fill="#000"/>`
    : `<rect width="${G}" height="${G}" rx="${G * 0.222}" fill="#000"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${G} ${G}">\n  ${bg}\n  ${shape}\n</svg>\n`;
}

/* The same mark, framed for a tab rather than a home screen. */
function faviconSvg() {
  const [x, y, s] = logo.squareBox(0.06);
  const r = n => Math.round(n * 100) / 100;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${r(x)} ${r(y)} ${r(s)} ${r(s)}">
` +
    `  <path fill="${logo.GREEN}" fill-rule="evenodd" d="${logo.svgPaths()}"/>
</svg>
`;
}

/* ---------- build ---------- */
const PNGS = [
  ['icon-192.png', 192, false],
  ['icon-512.png', 512, false],
  ['icon-maskable-512.png', 512, true],
  ['apple-touch-icon.png', 180, true]
];

fs.mkdirSync(OUT, { recursive: true });
for (const [name, size, maskable] of PNGS) {
  const file = path.join(OUT, name);
  fs.writeFileSync(file, png(size, size, render(size, maskable)));
  console.log(`  ${name.padEnd(24)} ${size}x${size}  ${(fs.statSync(file).size / 1024).toFixed(1)} KB`);
}
/* tab icons: mark only, no plate */
const GLYPHS = [16, 32, 48];
const glyphPngs = GLYPHS.map(size => ({ size, data: png(size, size, renderGlyph(size)) }));
glyphPngs.forEach(({ size, data }) => {
  const file = path.join(OUT, `icon-${size}.png`);
  fs.writeFileSync(file, data);
  console.log(`  ${(`icon-${size}.png`).padEnd(24)} ${size}x${size}  ${(data.length / 1024).toFixed(1)} KB`);
});

const icoFile = path.join(__dirname, '..', 'favicon.ico');
fs.writeFileSync(icoFile, ico(glyphPngs));
console.log(`  ${'favicon.ico'.padEnd(24)} 16/32/48  ${(fs.statSync(icoFile).size / 1024).toFixed(1)} KB`);

fs.writeFileSync(path.join(OUT, 'favicon.svg'), faviconSvg());
console.log('  favicon.svg');

const CARD = [1200, 630];
const cardFile = path.join(OUT, 'social.png');
fs.writeFileSync(cardFile, png(CARD[0], CARD[1], renderCard(CARD[0], CARD[1])));
console.log(`  ${'social.png'.padEnd(24)} ${CARD[0]}x${CARD[1]}  ${(fs.statSync(cardFile).size / 1024).toFixed(1)} KB`);

fs.writeFileSync(path.join(OUT, 'icon.svg'), svg(false));
fs.writeFileSync(path.join(OUT, 'icon-maskable.svg'), svg(true));
console.log('  icon.svg / icon-maskable.svg');
console.log('\nicons written to icons/');

/* ---------- keep the in-app mark in step ---------- */
/* js/icons.js draws the same viper in the sidebar and on the boot screen. It
   carries its own copy of the path so the app needs no build step — so the
   generator rewrites it here, and the two can never disagree. */
const ICONS_JS = path.join(__dirname, '..', 'js', 'icons.js');
const src = fs.readFileSync(ICONS_JS, 'utf8');
const next = src
  .replace(/const LOGO_PATH = '[^']*';/, "const LOGO_PATH = '" + logo.svgPaths() + "';")
  .replace(/const LOGO_GREEN = '[^']*';/, "const LOGO_GREEN = '" + logo.GREEN + "';");
if (next !== src) {
  fs.writeFileSync(ICONS_JS, next);
  console.log('  js/icons.js updated to match');
} else {
  console.log('  js/icons.js already in sync');
}
