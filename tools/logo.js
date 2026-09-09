/* PyQuest logo — the single source of truth for the mark.
 *
 * The viper head is described as flat polygons on a 1080 grid. Everything else
 * (the SVG, every PNG size) is generated from this, so the icon can never drift
 * between formats and can be re-rendered at any resolution.
 *
 * Fill is even-odd: an odd number of enclosing polygons means "green", so the
 * eyes, nostrils, mouth and the gaps beside the fangs are simply polygons drawn
 * inside the silhouette.
 */
const GRID = 1080;
const GREEN = '#3EAD4A';
const BLACK = '#000000';

/* --- outer silhouette: brow, horns, jaw arms, chin --- */
const SILHOUETTE = [
  [275, 190], [540, 224], [805, 190],   // top edge with its centre dip
  [882, 352], [850, 376],               // right horn, then the notch behind it
  [700, 800], [622, 828], [540, 858],   // right jaw arm down to the chin
  [458, 828], [380, 800],               // left jaw arm
  [230, 376], [198, 352]                // left notch and horn
];

/* --- the angry slits --- */
const EYE_L = [[246, 238], [450, 332], [256, 340]];
const EYE_R = [[834, 238], [630, 332], [824, 340]];

/* --- nostrils --- */
const NOSE_L = [[470, 366], [450, 408], [492, 408]];
const NOSE_R = [[610, 366], [588, 408], [630, 408]];

/* --- mouth cavity: bounded by the inner edge of each fang --- */
const MOUTH = [
  [436, 450], [540, 420], [644, 450],   // roof of the mouth
  [576, 782], [540, 808], [504, 782]    // fang inner edges meeting at the chin
];

/* --- the black slivers separating each fang from its jaw arm --- */
const GAP_L = [[320, 420], [360, 452], [486, 790], [446, 770]];
const GAP_R = [[760, 420], [720, 452], [594, 790], [634, 770]];

const POLYGONS = [SILHOUETTE, EYE_L, EYE_R, NOSE_L, NOSE_R, MOUTH, GAP_L, GAP_R];

/* ---------- helpers shared by the SVG and PNG writers ---------- */

function toPath(poly) {
  return 'M' + poly.map(p => p.join(' ')).join('L') + 'Z';
}

function svgPaths() {
  return POLYGONS.map(toPath).join('');
}

/** Even-odd hit test across every polygon at once. */
function isGreen(x, y) {
  let inside = false;
  for (const poly of POLYGONS) {
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const [xi, yi] = poly[i];
      const [xj, yj] = poly[j];
      if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
    }
  }
  return inside;
}

/** Tight bounding box of the mark: [x, y, w, h]. Every edge is straight, so
    the vertices alone give an exact answer. */
function bbox() {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const poly of POLYGONS) {
    for (const [x, y] of poly) {
      if (x < x0) x0 = x;
      if (y < y0) y0 = y;
      if (x > x1) x1 = x;
      if (y > y1) y1 = y;
    }
  }
  return [x0, y0, x1 - x0, y1 - y0];
}

/** A square box around the mark, padded by a fraction of its longest side.
    This is what the favicon uses: no plate, just the mark filling the frame. */
function squareBox(pad) {
  const [x, y, w, h] = bbox();
  const side = Math.max(w, h) * (1 + (pad || 0));
  return [x + w / 2 - side / 2, y + h / 2 - side / 2, side];
}

module.exports = { GRID, GREEN, BLACK, POLYGONS, svgPaths, toPath, isGreen, bbox, squareBox };
