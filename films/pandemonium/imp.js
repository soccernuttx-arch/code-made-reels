// The imp: an original chibi demon in 80s cel style (flat fills, hard shadow/highlight crescents, coloured lines, neon rim).
// Local coords: body centre (0,0), about 260 px tall at s = 1, facing the viewer. Characters animate on twos (12 fps):
// callers pass a stepped time. o = { flap (0..1 wing phase), arm, arm2 (deg; 0 = down, 90 = sideways, 160 = up),
// mouth: 'grin'|'open'|'smirk', look: [x,y] (-1..1), lid (0 open .. .6 sly), rim: neon colour, tilt (deg), hold: fn(g) in right hand }
import { cel, path, poly, ribbon, flutter, line, TAU, mix, rgba } from './cel.js';

export const IMP = {
  skin: { f: '#e8394f', s: '#93203f', h: '#ff8f8a', l: '#4c0f26' },
  belly: { f: '#ff7a6e', s: '#c8424f', l: '#4c0f26' },
  horn: { f: '#ffe7c0', s: '#c99a62', h: '#ffffff', l: '#5a3416' },
  wing: { f: '#5b2a8a', s: '#341655', h: '#9a6ad0', l: '#1e0b36' },
  eye: { w: '#fff6dc', i: '#ffcc2e', p: '#2a0a18' },
  mouth: '#5a0e22', fang: '#fffaf0',
};

function wing(g, side, flap, P, rim) {
  // a bat wing: three finger bones with scalloped membrane between them; flap swings it around the shoulder
  const a = (-.35 + Math.sin(flap * TAU) * .55) * side;
  g.save(); g.translate(side * 52, -40); g.rotate(a); g.scale(side, 1);
  const pts = [[0, 0, 1], [70, -70], [150, -96, 1], [128, -40], [168, -18, 1], [116, 4], [132, 46, 1], [70, 22], [18, 26, 1]];
  cel(g, pts, { f: P.wing.f, s: P.wing.s, so: [-10 * side, 8], h: P.wing.h, l: P.wing.l, lw: 2.4, rim: rim ? { c: rim, d: [4, -3] } : null });
  for (const [x, y] of [[150, -96], [168, -18], [132, 46]]) line(g, [[4, 2], [x * .55, y * .55], [x, y]], P.wing.l, 2.4);
  g.restore();
}

function eye(g, x, y, side, o, P) {
  const lid = o.lid ?? 0, open = o.open ?? 1;
  if (open < .15) { line(g, [[x - 18, y + 2], [x, y + 8], [x + 18, y + 2]], P.skin.l, 3.2); return; }
  const E = new Path2D(); E.ellipse(x, y, 20, 24 * open, side * .25, 0, TAU);
  g.save(); g.clip(E);
  g.fillStyle = P.eye.w; g.fill(E);
  const lx = (o.look?.[0] || 0) * 6, ly = (o.look?.[1] || 0) * 6;
  g.fillStyle = P.eye.i; g.beginPath(); g.ellipse(x + lx, y + ly + 2, 12, 15, 0, 0, TAU); g.fill();
  g.fillStyle = P.eye.p; g.beginPath(); g.ellipse(x + lx, y + ly + 2, 3.6, 11, 0, 0, TAU); g.fill();   // slit pupil
  g.fillStyle = '#ffffff'; g.beginPath(); g.ellipse(x + lx - 5, y + ly - 6, 4.5, 3.4, -.4, 0, TAU); g.fill();
  if (lid > 0) { g.fillStyle = P.skin.s; g.fillRect(x - 30, y - 30, 60, 54 * lid); }   // heavy lid = sly look
  g.restore();
  g.strokeStyle = P.skin.l; g.lineWidth = 3; g.stroke(E);
  line(g, [[x - side * 6 - 16, y - 26 + lid * 10 - (o.brow || 0) * 6], [x + side * 20, y - 34 + (o.brow || 0) * 4]], P.skin.l, 5);   // brow
}

export function imp(g, x, y, s, o = {}, P = IMP) {
  const flap = o.flap ?? 0, rim = o.rim, t = o.t ?? 0;
  g.save(); g.translate(x, y); g.rotate((o.tilt || 0) * Math.PI / 180); g.scale(s * (o.flip ? -1 : 1), s);
  // tail: a swaying ribbon with a spade tip
  const sp = flutter(-20, 70, Math.PI * .85, 150, 12, 16, 1.2, t * 6, -40);
  cel(g, ribbon(sp, u => 14 * (1 - u * .7)), { f: P.skin.f, s: P.skin.s, so: [3, -4], l: P.skin.l, lw: 2.4 });
  const tip = sp[sp.length - 1];
  cel(g, [[tip[0], tip[1] - 16, 1], [tip[0] - 22, tip[1] + 2, 1], [tip[0], tip[1] + 22, 1], [tip[0] + 8, tip[1] + 2, 1]], { f: P.skin.f, s: P.skin.s, so: [4, -4], l: P.skin.l, lw: 2.4 });
  wing(g, -1, flap, P, rim); wing(g, 1, flap + .04, P, rim);
  // feet dangling
  for (const sd of [-1, 1]) cel(g, [[sd * 22, 78], [sd * 34, 104], [sd * 18, 112], [sd * 8, 84]], { f: P.skin.f, s: P.skin.s, so: [sd * 3, -4], l: P.skin.l, lw: 2.4 });
  // arm behind (left)
  limb(g, 46, 20, o.arm2 ?? 25, 1, P);
  // body + head as one chibi shape
  const bodyPts = [[0, -112], [44, -104], [74, -70], [80, -30], [70, 10], [56, 52], [30, 86], [0, 94], [-30, 86], [-56, 52], [-70, 10], [-80, -30], [-74, -70], [-44, -104]];
  cel(g, bodyPts, { f: P.skin.f, s: P.skin.s, so: [10, 10], h: P.skin.h, ho: [-7, -7], l: P.skin.l, lw: 3, rim: rim ? { c: rim, d: [-4, -2] } : null });
  cel(g, [[-30, 30], [0, 22], [30, 30], [36, 62], [0, 84], [-36, 62]], { f: P.belly.f, s: P.belly.s, so: [6, 6], l: P.belly.l, lw: 2 });
  // horns
  for (const sd of [-1, 1]) cel(g, [[sd * 30, -100, 1], [sd * 66, -146], [sd * 80, -170, 1], [sd * 60, -128], [sd * 50, -96, 1]], { f: P.horn.f, s: P.horn.s, so: [sd * 4, 4], h: P.horn.h, ho: [-sd * 2, -2], l: P.horn.l, lw: 2.4 });
  // face
  eye(g, -28, -48, -1, o, P); eye(g, 28, -48, 1, o, P);
  const m = o.mouth || 'grin';
  if (m === 'open') {
    cel(g, [[-30, -14], [0, -8], [30, -14], [20, 14], [0, 22], [-20, 14]], { f: P.mouth, l: P.skin.l, lw: 2.6 });
    g.fillStyle = P.fang; for (const sd of [-1, 1]) { g.beginPath(); g.moveTo(sd * 16, -11); g.lineTo(sd * 10, -11); g.lineTo(sd * 13, 0); g.fill(); }
  } else {
    const wide = m === 'smirk' ? .6 : 1;
    cel(g, [[-40 * wide, -16], [0, -2], [40, -18], [24, 0], [0, 6], [-24 * wide, 0]], { f: P.mouth, l: P.skin.l, lw: 2.6 });
    g.fillStyle = P.fang; for (const sd of [-1, 1]) { g.beginPath(); g.moveTo(sd * 18, -7); g.lineTo(sd * 10, -5); g.lineTo(sd * 15, 5); g.fill(); }
  }
  // arm in front (right), with whatever it holds
  limb(g, -46, 20, o.arm ?? 25, -1, P, o.hold);
  g.restore();
}

// A two-segment arm from the shoulder: ang (deg) 0 = down, 90 = sideways, 160 = up; the forearm bends a little.
function limb(g, x, y, ang, side, P, hold) {
  // side = which way is "outward" on screen (+1 right, -1 left); the forearm bends 25 deg further out
  const a = ang * Math.PI / 180, b = (ang + 25) * Math.PI / 180;
  const ex = x + Math.sin(a) * side * 34, ey = y + Math.cos(a) * 34, hx = ex + Math.sin(b) * side * 30, hy = ey + Math.cos(b) * 30;
  for (const [w, c] of [[24, P.skin.l], [17, P.skin.f]]) { g.strokeStyle = c; g.lineWidth = w; g.lineCap = 'round'; g.beginPath(); g.moveTo(x, y); g.lineTo(ex, ey); g.lineTo(hx, hy); g.stroke(); }
  cel(g, [[hx - 13, hy - 6], [hx, hy - 15], [hx + 13, hy - 6], [hx + 12, hy + 9], [hx, hy + 15], [hx - 12, hy + 9]], { f: P.skin.f, s: P.skin.s, so: [3, 4], l: P.skin.l, lw: 2.4 });
  if (hold) { g.save(); g.translate(hx, hy); hold(g); g.restore(); }
}

// The imp's silhouette in black on the glow canvas, so neon never shines through it (STYLE.md §2).
export function impStamp(e, x, y, s, o = {}) {
  e.save(); e.translate(x, y); e.rotate((o.tilt || 0) * Math.PI / 180); e.scale(s * (o.flip ? -1 : 1), s);
  e.fillStyle = '#000'; e.beginPath(); e.ellipse(0, -10, 84, 110, 0, 0, TAU); e.fill();
  e.restore();
}
