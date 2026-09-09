#!/usr/bin/env node
/* Generate the PyQuest app icons.
 *
 *   node tools/make-icons.js
 *
 * The mark is drawn from geometry rather than text, so it does not depend on a
 * font being installed, and re-running this always produces identical files.
 * PNGs are written by hand (zlib is the only dependency, and it is built in).
 */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const OUT = path.join(__dirname, '..', 'icons');

const BG = [0x0b, 0x0e, 0x14];      // --bg
const MARK = [0xdc, 0xae, 0x62];    // --gold

/* ---------- geometry helpers ---------- */

// distance from a point to a line segment
function segDist(px, py, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay;
  const len2 = dx * dx + dy * dy;
  let t = len2 === 0 ? 0 : ((px - ax) * dx + (py - ay) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  const cx = ax + t * dx, cy = ay + t * dy;
  return Math.hypot(px - cx, py - cy);
}

// signed "inside" test for a rounded rectangle
function insideRoundRect(px, py, size, r) {
  const x = Math.min(px, size - px), y = Math.min(py, size - py);
  if (x >= r || y >= r) return x >= 0 && y >= 0;
  return Math.hypot(r - x, r - y) <= r;
}

/* ---------- the mark ---------- */
// Coordinates are on a 512 grid: a chevron and an underscore, the same shape
// as the ">_" wordmark in the sidebar.
const STROKE = 40;
const SEGMENTS = [
  [150, 176, 238, 256],
  [238, 256, 150, 336],
  [268, 336, 378, 336]
];

function markDist(x, y) {
  let best = Infinity;
  for (const [ax, ay, bx, by] of SEGMENTS) {
    const d = segDist(x, y, ax, ay, bx, by);
    if (d < best) best = d;
  }
  return best;
}

/* ---------- rasteriser ---------- */
function render(size, maskable) {
  const SS = 4;                       // supersampling for smooth edges
  const scale = 512 / size;
  const radius = 114 / scale;
  // a maskable icon must survive being cropped to a circle, so the mark shrinks
  // into the safe zone and the background bleeds to every edge
  const markScale = maskable ? 0.72 : 1;
  const px = Buffer.alloc(size * size * 4);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let bgHits = 0, markHits = 0;
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const fx = x + (sx + 0.5) / SS;
          const fy = y + (sy + 0.5) / SS;
          if (maskable || insideRoundRect(fx, fy, size, radius)) bgHits++;
          // map the pixel back onto the 512 design grid, about the centre
          const gx = (fx - size / 2) * scale / markScale + 256;
          const gy = (fy - size / 2) * scale / markScale + 256;
          if (markDist(gx, gy) <= STROKE / 2) markHits++;
        }
      }
      const total = SS * SS;
      const bgA = bgHits / total;
      const markA = markHits / total;
      const i = (y * size + x) * 4;
      // mark over background, background over transparent
      const a = Math.max(bgA, markA);
      if (a > 0) {
        for (let c = 0; c < 3; c++) {
          px[i + c] = Math.round((MARK[c] * markA + BG[c] * bgA * (1 - markA)) / Math.max(a, 1e-6));
        }
      }
      px[i + 3] = Math.round(a * 255);
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

function png(size, pixels) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;    // bit depth
  ihdr[9] = 6;    // RGBA
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

  // each scanline is prefixed with its filter type (0 = none)
  const raw = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0;
    pixels.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
  }

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0))
  ]);
}

/* ---------- build ---------- */
const TARGETS = [
  ['icon-192.png', 192, false],
  ['icon-512.png', 512, false],
  ['icon-maskable-512.png', 512, true],
  ['apple-touch-icon.png', 180, true]   // iOS crops corners itself, so bleed it
];

fs.mkdirSync(OUT, { recursive: true });
for (const [name, size, maskable] of TARGETS) {
  const file = path.join(OUT, name);
  fs.writeFileSync(file, png(size, render(size, maskable)));
  console.log(`  ${name.padEnd(24)} ${size}x${size}  ${(fs.statSync(file).size / 1024).toFixed(1)} KB`);
}
console.log('\nicons written to icons/');
