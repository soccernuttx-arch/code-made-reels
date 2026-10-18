// The seven shots. Painted plates are built once at load (colour + emissive pair, STYLE.md §2); cels are drawn per frame,
// characters on twos (12 fps), blinks and bubbles on threes (8 fps), camera, light and embers on ones.
import { W, H, TAU, canvas, cel, path, poly, line, rgba, mix, rng, hash, airbrush, vgrad } from './cel.js';
import { skylinePlate } from './bg.js';
import { speedLines, flare, lamp, trail } from './fx.js';
import { head80 } from './head80.js';
import { PAL } from './pal.js';
import { imp, impStamp } from './imp.js';
import { step, wordTime } from './story.js';

const ease = u => u < 0 ? 0 : u > 1 ? 1 : u * u * (3 - 2 * u);
const lerp = (a, b, u) => a + (b - a) * u;
const NEON = { pink: '#ff3fa4', cyan: '#35e7ff', gold: '#ffd23f', red: '#ff5a3c', violet: '#b36bff', green: '#4dff9a' };
const FLICK = [0, 1, 0, 1, 1, 0, 1];   // a neon tube catching, one entry per 12 fps drawing (~0.6 s, quick enough for speech)
const flick = (lt0, t) => { const k = Math.floor((t - lt0) * 12); return k < 0 ? 0 : k >= FLICK.length ? 1 : FLICK[k]; };

// ---------- plates ----------
function hellPlate() {   // 1080 x 2600: sky, red moon, spires, plaza with lava cracks, the gate (without its sign)
  const PW = 1080, PH = 2600, [c, g] = canvas(PW, PH), [ec, e] = canvas(PW, PH), R = rng(66);
  e.fillStyle = '#000'; e.fillRect(0, 0, PW, PH);
  vgrad(g, 0, 0, PW, 1800, [[0, '#07020f'], [.3, '#1b0630'], [.62, '#4d0f3c'], [.85, '#a3213a'], [1, '#ff6a3a']]);
  for (let i = 0; i < 220; i++) { g.fillStyle = rgba('#ffd9e8', .25 + R() * .5); g.beginPath(); g.arc(R() * PW, R() * 1100, R() < .1 ? 1.8 : .9, 0, TAU); g.fill(); }
  airbrush(g, 760, 420, 150, 150, '#ff7a5a', .9, .15); airbrush(e, 760, 420, 260, 260, '#ff3a2a', .5, .8);   // red moon
  g.fillStyle = '#ffb08a'; g.beginPath(); g.arc(760, 420, 120, 0, TAU); g.fill(); g.fillStyle = rgba('#d0503a', .5); g.beginPath(); g.arc(790, 400, 26, 0, TAU); g.arc(720, 460, 18, 0, TAU); g.fill();
  for (const [k, col, base] of [[0, '#2a0a26', 1560], [1, '#1a0618', 1700]]) {   // two rows of spires
    for (let x = -40; x < PW + 40;) {
      const w = 50 + R() * 90, h = 220 + R() * (k ? 360 : 520), y = base - h;
      g.fillStyle = col; g.beginPath(); g.moveTo(x, base + 200); g.lineTo(x, y + 60); g.lineTo(x + w / 2, y); g.lineTo(x + w, y + 60); g.lineTo(x + w, base + 200); g.fill();
      for (let j = 0; j < 6; j++) if (R() < .5) { const wx = x + 10 + R() * (w - 20), wy = y + 80 + R() * (h - 100); g.fillStyle = rgba('#ff9a3c', .8); g.fillRect(wx, wy, 6, 10); e.fillStyle = rgba('#ff6a1a', .5); e.fillRect(wx - 2, wy - 2, 10, 14); }
      x += w + R() * 20;
    }
  }
  vgrad(g, 0, 1450, PW, 350, [[0, rgba('#ff4a2a', 0)], [1, rgba('#ff5a2a', .35)]]);
  vgrad(g, 0, 1780, PW, 820, [[0, '#3a0d1c'], [.4, '#2a0812'], [1, '#12030a']]);                     // plaza
  for (let i = 0; i < 26; i++) {                                                                   // lava cracks
    const x0 = R() * PW, y0 = 1820 + R() * 760, pts = [[x0, y0]];
    for (let k = 0; k < 4; k++) pts.push([pts[k][0] + (R() - .5) * 140, pts[k][1] + R() * 40]);
    for (const [ctx, col, w] of [[g, '#ff8a3a', 3], [e, '#ff4a1a', 9]]) { ctx.strokeStyle = col; ctx.lineWidth = w; ctx.beginPath(); pts.forEach((p, k) => ctx[k ? 'lineTo' : 'moveTo'](p[0], p[1])); ctx.stroke(); }
  }
  // the gate: two pillars and a pointed arch, black iron with a hot rim
  const gate = { f: '#1c0a16', s: '#0c040a', h: '#4a1a2a', l: '#ff6a3a' };
  for (const x of [130, 950]) cel(g, poly([[x - 70, 2380], [x - 56, 1560], [x + 56, 1560], [x + 70, 2380]]), { ...gate, so: [x < 540 ? 14 : -14, 0], lw: 3 });
  cel(g, path([[60, 1580, 1], [100, 1420], [300, 1250], [540, 1130, 1], [780, 1250], [980, 1420], [1020, 1580, 1], [880, 1580, 1], [840, 1470], [700, 1330], [540, 1260, 1], [380, 1330], [240, 1470], [200, 1580, 1]]), { ...gate, so: [0, 12], lw: 3 });
  for (const x of [130, 950]) { lamp(g, e, x, 1520, 22, '#ff7a2a'); }
  return { c, e: ec, w: PW, h: PH };
}

function studyPlate() {   // candlelit study, 1080 x 1920
  const [c, g] = canvas(W, H), [ec, e] = canvas(W, H), R = rng(12);
  e.fillStyle = '#000'; e.fillRect(0, 0, W, H);
  vgrad(g, 0, 0, W, H, [[0, '#0e0814'], [.5, '#2a1612'], [1, '#140a08']]);
  g.fillStyle = '#1a2240'; g.fillRect(80, 180, 330, 420); airbrush(g, 245, 330, 60, 60, '#dfe8ff', .9, .2);   // window + moon
  g.strokeStyle = '#3a2418'; g.lineWidth = 18; g.strokeRect(80, 180, 330, 420); g.beginPath(); g.moveTo(245, 180); g.lineTo(245, 600); g.moveTo(80, 390); g.lineTo(410, 390); g.stroke();
  for (let s = 0; s < 4; s++) for (let b = 0; b < 14; b++) {                                     // bookshelf
    const x = 520 + b * 36 + R() * 6, y = 200 + s * 170, h = 110 + R() * 40;
    g.fillStyle = ['#5a2a1e', '#2e3a5a', '#4a3a1a', '#3a1a2a'][(b + s) % 4]; g.fillRect(x, y + 150 - h, 30, h);
  }
  vgrad(g, 0, 1150, W, 770, [[0, '#5a3418'], [.15, '#3e220f'], [1, '#1a0c06']]);                  // desk
  airbrush(e, 860, 980, 360, 300, '#ff9a3a', .35, 1);                                              // candle warmth
  return { c, e: ec };
}

function roomPlate() {   // her room at night: a window full of neon city, cool shadows
  const [c, g] = canvas(W, H), [ec, e] = canvas(W, H);
  e.fillStyle = '#000'; e.fillRect(0, 0, W, H);
  vgrad(g, 0, 0, W, H, [[0, '#0b0a24'], [.6, '#1a1238'], [1, '#0a0818']]);
  const city = skylinePlate(900, 700, 4, 'night');
  g.save(); g.beginPath(); g.rect(420, 120, 600, 760); g.clip(); vgrad(g, 420, 120, 600, 760, [[0, '#06041a'], [1, '#3a1452']]); g.drawImage(city.c, 300, 260); g.restore();
  e.save(); e.beginPath(); e.rect(420, 120, 600, 760); e.clip(); e.drawImage(city.e, 300, 260); e.restore();
  g.strokeStyle = '#140f2a'; g.lineWidth = 22; g.strokeRect(420, 120, 600, 760); g.beginPath(); g.moveTo(720, 120); g.lineTo(720, 880); g.stroke();
  airbrush(g, 720, 500, 420, 420, '#ff4fa8', .12, 1);
  return { c, e: ec };
}

export function buildPlates() { return { hell: hellPlate(), study: studyPlate(), room: roomPlate() }; }

// ---------- helpers ----------
function cam(ctxs, z, cx, cy, ox = 0, oy = 0) { for (const x of ctxs) x.setTransform(z, 0, 0, z, cx - cx * z + ox, cy - cy * z + oy); }
function plate(g, e, P, oy) { g.drawImage(P.c, 0, -oy); e.drawImage(P.e, 0, -oy); }

function neon(g, e, txt, x, y, size, col, on, font = 'italic 800 {s}px Kanit') {
  const f = font.replace('{s}', size);
  for (const [ctx, pass] of [[g, 0], [e, 1]]) {
    if (pass && !on) continue;
    ctx.save(); ctx.font = f; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
    if (!on) { ctx.strokeStyle = rgba(mix(col, '#000000', .6), .9); ctx.lineWidth = size * .12; ctx.strokeText(txt, x, y); }
    else if (!pass) { ctx.strokeStyle = rgba(col, .95); ctx.lineWidth = size * .14; ctx.strokeText(txt, x, y); ctx.strokeStyle = mix(col, '#ffffff', .8); ctx.lineWidth = size * .045; ctx.strokeText(txt, x, y); }
    else { ctx.strokeStyle = col; ctx.lineWidth = size * .24; ctx.strokeText(txt, x, y); ctx.strokeStyle = mix(col, '#ffffff', .5); ctx.lineWidth = size * .07; ctx.strokeText(txt, x, y); }
    ctx.restore();
  }
}

function embers(g, e, t, n = 40, seed = 5, area = [0, 0, W, H]) {
  for (let i = 0; i < n; i++) {
    const sp = 60 + hash(i + seed) * 120, x = area[0] + hash(i * 3.1 + seed) * area[2] + Math.sin(t * 2 + i) * 18;
    const y = area[1] + area[3] - ((hash(i * 7.7 + seed) * area[3] + t * sp) % area[3]), r = 2 + hash(i * 1.3) * 3;
    lamp(g, e, x, y, r, i % 3 ? '#ff7a2a' : '#ffd23f', .8);
  }
}

function chrome(c, txt, x, y, size, maxW, glowCol) {   // the 80s title: chrome gradient, dark + neon outlines (STYLE.md §4)
  c.save(); c.font = `italic 900 ${size}px Kanit`; const w = c.measureText(txt).width, k = Math.min(1, maxW / w);
  c.translate(x, y); c.scale(k, k); c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round';
  c.strokeStyle = glowCol; c.lineWidth = size * .2; c.strokeText(txt, 0, 0);
  c.strokeStyle = '#1a0630'; c.lineWidth = size * .11; c.strokeText(txt, 0, 0);
  const gr = c.createLinearGradient(0, -size * .5, 0, size * .5);
  [[0, '#7ad8ff'], [.46, '#e8f6ff'], [.5, '#ffffff'], [.54, '#b36bff'], [.75, '#ff4fa8'], [1, '#ffd23f']].forEach(([o, col]) => gr.addColorStop(o, col));
  c.fillStyle = gr; c.fillText(txt, 0, 0); c.restore();
  return w * k;
}

function chromeGlow(e, txt, x, y, size, maxW, col) {   // only a thin neon outline goes to the glow layer, or the title blooms to white
  e.save(); e.font = `italic 900 ${size}px Kanit`; const k = Math.min(1, maxW / e.measureText(txt).width);
  e.translate(x, y); e.scale(k, k); e.textAlign = 'center'; e.textBaseline = 'middle'; e.lineJoin = 'round';
  e.strokeStyle = rgba(col, .55); e.lineWidth = size * .07; e.strokeText(txt, 0, 0); e.restore();
}

// ---------- shots ----------
// S = { t, lt, u, g, e, A, WORDS }
function gatesScene(S, mode) {
  const { t, lt, g, e, A } = S, ts = step(lt, 12), dur = mode === 'share' ? S.len : 2.3;
  cam([g, e], 1 + .05 * (lt / dur), 540, 1100);
  plate(g, e, A.hell, 680);
  embers(g, e, t, 36, 5, [0, 600, W, 1300]);
  // sign: off at frame 0 (so the end loops into the start), on after the imp pulls the lever
  let on;
  if (mode === 'gates') on = flick(1.35, lt);
  else { const k = Math.floor((lt - (dur - .5)) * 12); on = k < 0 ? 1 : k < 3 ? [0, 1, 0][k] : 0; }   // off for the last frames: loops into frame 0
  neon(g, e, 'WELCOME', 540, 970, 96, NEON.red, on);
  neon(g, e, 'ALL  ARE  WELCOME', 540, 1060, 34, NEON.gold, on, '600 {s}px "Barlow SC"');
  if (on && mode === 'gates' && lt < 1.6) flare(e, 700, 970, .8, '#ffb08a');
  // lever box at right; the handle swings when pulled
  const pull = mode === 'gates' ? ease((ts - .95) / .3) : 1 - ease((ts - (dur - .7)) / .25);
  cel(g, poly([[840, 1300], [940, 1300], [940, 1420], [840, 1420]]), { f: '#3a1a22', s: '#1a0a10', so: [-8, 0], l: '#ff6a3a', lw: 2.6 });
  const ha = (-50 + 100 * pull) * Math.PI / 180, hx = 890 + Math.sin(ha) * 90, hy = 1310 - Math.cos(ha) * 90;
  line(g, [[890, 1310], [hx, hy]], '#120608', 14); line(g, [[890, 1310], [hx, hy]], '#7a3a3a', 8);
  cel(g, (() => { const p = new Path2D(); p.arc(hx, hy, 16, 0, TAU); return p; })(), { f: '#ff4a3a', s: '#a01a20', so: [4, 4], l: '#3a0610', lw: 2.4 });
  // the imp
  let x, y, o = { flap: ts * 2.2, t: ts, rim: NEON.cyan, look: [0, 0] };
  if (mode === 'gates') {
    const fly = ease(ts / .9); x = lerp(1240, 760, fly); y = lerp(1050, 1200, fly) + Math.sin(ts * 7) * 8;
    o.arm2 = ts < .95 ? 60 : lerp(150, 70, ease((ts - .95) / .3)); o.arm = 30;
    o.mouth = ts > 1.3 ? 'grin' : 'smirk'; o.lid = ts > 1.4 ? .35 : .1; o.look = ts > 1.4 ? [-.6, .2] : [-.8, 0]; o.tilt = ts < .9 ? -12 : 0;
  } else {
    const inn = ease(ts / .5), out = ease((ts - (dur - .45)) / .4);
    x = lerp(lerp(540, 600, inn), 1260, out); y = lerp(1700, 1150, inn) - out * 120 + Math.sin(ts * 6) * 8;
    o.arm = 130 + Math.sin(ts * 14) * 25; o.arm2 = 120; o.mouth = 'open'; o.look = [0, .1]; o.lid = .1; o.tilt = out * 18;
    o.hold = gg => { cel(gg, poly([[-14, -60], [14, -60], [14, -8], [-14, -8]]), { f: '#2a2a34', l: '#08080c', lw: 2 }); gg.fillStyle = '#8ff4ff'; gg.fillRect(-10, -55, 20, 40); };
  }
  impStamp(e, x, y, .9, o); imp(g, x, y, .9, o);
}

function titleScene(S) {
  const { lt, g, e } = S;
  vgrad(g, 0, 0, W, H, [[0, '#0a0420'], [.5, '#2a0a40'], [1, '#08031a']]);
  for (let i = 0; i < 18; i++) {   // rotating light rays through the emissive layer
    const a = i * TAU / 18 + lt * .5; e.save(); e.translate(540, 860); e.rotate(a);
    const gr = e.createLinearGradient(0, 0, 1300, 0); gr.addColorStop(0, rgba('#ff3fa4', .35)); gr.addColorStop(1, rgba('#ff3fa4', 0));
    e.fillStyle = gr; e.beginPath(); e.moveTo(0, 0); e.lineTo(1300, -60); e.lineTo(1300, 60); e.fill(); e.restore();
  }
  const fr = Math.floor(lt * 12);
  if (fr < 2) { g.fillStyle = '#ffffff'; g.fillRect(0, 0, W, H); }   // impact frame
  const on = flick(.05, lt);
  if (on) {
    const w = chrome(g, 'PANDEMONIUM', 480, 820, 190, 800, rgba('#ff3fa4', .9));
    chromeGlow(e, 'PANDEMONIUM', 480, 820, 190, 800, '#ff3fa4');
    // light sweep across the title
    const sx = lerp(-200, 1200, ease((lt - .45) / .5));
    g.save(); g.globalCompositeOperation = 'source-atop'; const gr = g.createLinearGradient(sx - 80, 0, sx + 80, 0);
    gr.addColorStop(0, rgba('#ffffff', 0)); gr.addColorStop(.5, rgba('#ffffff', .7)); gr.addColorStop(1, rgba('#ffffff', 0));
    g.fillStyle = gr; g.fillRect(0, 700, W, 240); g.restore();
    if (lt > .9) flare(e, 480 + w / 2 - 20, 760, .55 * (1 - ease((lt - 1.2) / .4)), '#bfe6ff', { ghosts: false });
  }
  neon(g, e, 'パンデモニウム', 480, 975, 70, NEON.cyan, flick(.4, lt), '{s}px "Dela Gothic One"');
  if (lt > .55) { g.font = '600 58px "Barlow SC"'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#fff0a0';
    g.strokeStyle = '#120a1e'; g.lineWidth = 10; g.lineJoin = 'round'; g.strokeText('pan-duh-MOH-nee-um  ·  noun', 480, 1090); g.fillText('pan-duh-MOH-nee-um  ·  noun', 480, 1090); }
}

function miltonScene(S) {
  const { t, lt, g, e, A, WORDS } = S, ts = step(lt, 12);
  cam([g, e], 1.04 + .05 * (lt / 2.95), 540, 1100);
  g.drawImage(A.study.c, 0, 0); e.drawImage(A.study.e, 0, 0);
  // the open book
  const P = { f: '#f3e3bf', s: '#cbb084', h: '#fff6e0', l: '#5a3a1a' };
  cel(g, path([[110, 1100], [530, 1080, 1], [540, 1440, 1], [120, 1420]]), { ...P, so: [10, 6], lw: 2.6 });
  cel(g, path([[550, 1080, 1], [970, 1100], [960, 1420], [540, 1440, 1]]), { ...P, so: [-10, 6], lw: 2.6 });
  g.save(); g.font = 'italic 600 50px Georgia, serif'; g.fillStyle = '#3a220e'; g.textAlign = 'center'; g.fillText('Paradise Lost', 325, 1180);
  g.font = '28px Georgia, serif'; g.fillText('BOOK I', 325, 1230); g.restore();
  for (let k = 0; k < 6; k++) line(g, [[170, 1280 + k * 22], [480, 1280 + k * 22]], rgba('#5a3a1a', .35), 2);
  // ink appears behind the quill, line by line
  const prog = Math.min(1, ts / 2.6) * 6;
  for (let k = 0; k < 6; k++) {
    const u = Math.max(0, Math.min(1, prog - k)); if (!u) continue;
    const pts = []; for (let i = 0; i <= 24 * u; i++) pts.push([600 + i * 13, 1150 + k * 42 + Math.sin(i * 1.7 + k) * 5]);
    if (pts.length > 1) line(g, pts, '#24140a', 3);
  }
  const kk = Math.min(5, Math.floor(prog)), uu = prog - kk, qx = 600 + 24 * 13 * Math.min(1, uu), qy = 1150 + kk * 42;
  // the quill
  g.save(); g.translate(qx, qy); g.rotate(-.7 + Math.sin(ts * 18) * .06);
  cel(g, path([[0, 0, 1], [26, -60], [70, -230], [40, -330, 1], [10, -230], [-6, -60]]), { f: '#fbf6ea', s: '#c8bfa8', so: [6, 0], h: '#ffffff', l: '#5a4a3a', lw: 2.2 });
  line(g, [[0, 0], [38, -320]], '#8a7a6a', 2); g.restore();
  // candle
  cel(g, poly([[840, 1010], [880, 1010], [880, 1130], [840, 1130]]), { f: '#f4ecd8', s: '#c9bda0', so: [-6, 0], l: '#5a4a3a', lw: 2.2 });
  const fl = step(lt, 8), fh = 34 + hash(Math.floor(fl * 8)) * 10;
  cel(g, path([[860, 1010 - fh], [874, 990], [868, 1006, 1], [852, 1006, 1], [846, 990]]), { f: '#ffd27a', l: '#ff8a2a', lw: 2 });
  lamp(null, e, 860, 985, 40, '#ffb04a', 1);
  // "1667" in backlit neon when the year is spoken
  const ty = wordTime(WORDS, 'milton', 'sixteen'), on = ty != null ? flick(ty, t) : 0;
  neon(g, e, '1667', 540, 720, 230, NEON.gold, on, 'italic 900 {s}px Kanit');
}

// fixed once, so the crowd and the bubbles never jump between frames
const CROWD = (() => { const R = rng(77); return Array.from({ length: 14 }, () => ({ delay: R() * .9, s: .32 + R() * .45, tx: 80 + R() * 920, ty: 700 + R() * 900, fromL: R() < .5, look: (R() - .5) * 2, lid: R() * .3 })); })();
const BUBBLES = (() => { const R = rng(31); return Array.from({ length: 34 }, () => ({ a: R() * 1.6 - 2.4, sp: 300 + R() * 500, w: 130 + R() * 80 })); })();

function etymScene(S) {
  const { t, lt, g, e, A, WORDS } = S, ts = step(lt, 12);
  const tPlace = wordTime(WORDS, 'etym', 'the') ?? 9.1, down = ease((t - tPlace) / 1.1);
  const oy = lerp(120, 680, down);
  cam([g, e], 1, 540, 960);
  plate(g, e, A.hell, oy);
  embers(g, e, t, 30, 9, [0, 400, W, 1500]);
  const t1 = wordTime(WORDS, 'etym', 'pan') ?? 7.0, t2 = wordTime(WORDS, 'etym', 'daimon') ?? 8.0;
  neon(g, e, 'PAN = ALL', 480, 520 - (oy - 120), 120, NEON.cyan, flick(t1, t));
  neon(g, e, 'DAIMON = DEMON', 480, 720 - (oy - 120), 104, NEON.pink, flick(t2, t));
  neon(g, e, 'WELCOME', 540, 970 + (680 - oy), 96, NEON.red, down > .6 ? 1 : 0);
  // the place of all demons: a crowd of imps floods in
  for (const [i, c] of CROWD.entries()) {
    const u = ease((t - tPlace - c.delay) / .6); if (u <= 0) continue;
    const x = lerp(c.fromL ? -200 : 1280, c.tx, u), y = c.ty + Math.sin(ts * 6 + i) * 10, s = c.s;
    const o = { flap: ts * 2.4 + i * .3, t: ts + i, rim: [NEON.cyan, NEON.pink, NEON.gold][i % 3], mouth: i % 2 ? 'grin' : 'open', look: [c.look, 0], lid: c.lid, flip: !c.fromL, tilt: (1 - u) * (c.fromL ? 20 : -20) };
    impStamp(e, x, y, s, o); imp(g, x, y, s, o);
  }
}

function todayScene(S) {
  const { lt, g, e } = S, ts = step(lt, 12), fr = Math.floor(lt * 12);
  const jx = (hash(fr * 3.3) - .5) * 14, jy = (hash(fr * 7.1) - .5) * 14;
  cam([g, e], 1, 540, 960, jx, jy);
  vgrad(g, -40, -40, W + 80, H + 80, [[0, '#2a0420'], [1, '#12021a']]);
  speedLines(g, fr, { type: 'radial', cx: 480, cy: 880, n: 110, col: '#ffd0f0', a: .55 });
  if (fr < 2) { g.fillStyle = '#ffffff'; g.fillRect(-40, -40, W + 80, H + 80); }
  for (let i = 0; i < 3; i++) {   // imps zipping through, with light trails
    const u = ((ts * .9 + i * .37) % 1), y = 1080 + i * 120, dir = i % 2 ? -1 : 1, x = dir > 0 ? lerp(-200, 1280, u) : lerp(1280, -200, u);
    trail(g, e, [[x, y], [x - dir * 160, y + 6], [x - dir * 320, y + 10]], [NEON.cyan, NEON.gold, NEON.pink][i], 8);
    const o = { flap: ts * 3 + i, t: ts, rim: NEON.cyan, mouth: 'open', flip: dir < 0, tilt: dir * 14 };
    impStamp(e, x, y, .42, o); imp(g, x, y, .42, o);
  }
  g.font = '600 58px "Barlow SC"'; g.textAlign = 'center'; g.fillStyle = '#fff0a0'; g.strokeStyle = '#120a1e'; g.lineWidth = 10; g.lineJoin = 'round';
  g.strokeText('TODAY:', 480, 690); g.fillText('TODAY:', 480, 690);
  if (fr >= 2) { chrome(g, 'a wild uproar', 480, 840, 150, 800, rgba('#35e7ff', .9)); chromeGlow(e, 'a wild uproar', 480, 840, 150, 800, '#35e7ff'); }
}

function exampleScene(S) {
  const { t, lt, g, e, A, WORDS } = S, ts = step(lt, 12), t8 = step(lt, 8);
  cam([g, e], 1 + .06 * (lt / 3.5), 520, 900);
  g.drawImage(A.room.c, 0, 0); e.drawImage(A.room.e, 0, 0);
  const tPan = wordTime(WORDS, 'example', 'pandemonium') ?? 14, tShot = wordTime(WORDS, 'example', 'screenshot') ?? 15.2;
  let expr = 'neutral', look = [.35, .55], E = {};
  if (t >= tPan) { expr = 'surprised'; look = [.3, .45]; }
  if (t >= tShot) { expr = 'panting'; look = [0, .3]; }
  if (Math.floor(t8 * 8) % 22 === 5 && t < tPan) E.open = .1;   // one-drawing blink
  // her layer on its own canvas, so light bands sweep across only her and her silhouette can be stamped into the glow
  const [hc, h] = canvas(W, H);
  h.setTransform(3.3, 0, 0, 3.3, 520, 860);
  head80(h, PAL.night, { view: 'q', expr, look, E, ph: ts * .5, wind: .15, rim: { c: NEON.pink, d: [-3, -1] } });
  h.setTransform(1, 0, 0, 1, 0, 0);
  const bx = lerp(-300, 1400, ((lt * .55) % 1));
  h.globalCompositeOperation = 'source-atop'; const gr = h.createLinearGradient(bx - 120, 0, bx + 120, 0);
  gr.addColorStop(0, rgba('#35e7ff', 0)); gr.addColorStop(.5, rgba('#35e7ff', .22)); gr.addColorStop(1, rgba('#35e7ff', 0));
  h.fillStyle = gr; h.fillRect(0, 0, W, H); h.globalCompositeOperation = 'source-over';
  e.save(); e.globalCompositeOperation = 'destination-out'; e.drawImage(hc, 0, 0); e.restore();   // keeps the camera push
  g.drawImage(hc, 0, 0);
  // the phone, buzzing harder as the chat explodes
  const buzz = t >= tPan ? (hash(Math.floor(lt * 12) * 5.1) - .5) * 10 : 0, px = 760 + buzz, py = 1330;
  cel(g, poly([[px - 95, py - 170], [px + 95, py - 170], [px + 95, py + 200], [px - 95, py + 200]]), { f: '#22222c', s: '#101016', so: [8, 0], h: '#4a4a5a', l: '#06060a', lw: 3 });
  g.fillStyle = '#9ff6ff'; g.fillRect(px - 80, py - 150, 160, 320); e.fillStyle = rgba('#35e7ff', .9); e.fillRect(px - 80, py - 150, 160, 320);
  for (const sd of [-1, 1]) cel(g, path([[px + sd * 100, py + 60], [px + sd * 70, py + 30], [px + sd * 40, py + 90], [px + sd * 70, py + 210], [px + sd * 120, py + 200]]), { f: PAL.night.skin.f, s: PAL.night.skin.s, so: [sd * 6, 6], l: PAL.night.skin.l, lw: 2.4 });
  // chat bubbles burst out of the phone (on threes), more and more once it hits
  const cols = ['#ffffff', '#4dff9a', '#ff9ad0', '#8ff4ff', '#ffd23f'];
  const n = t < tPan ? Math.floor(t8 * 2) : 2 + Math.floor((t - tPan) * 16);
  for (let i = 0; i < Math.min(n, 34); i++) {
    const born = i / 2, age = t < tPan ? t8 - born : (t - tPan) - (i - 2) / 16, { a, sp, w } = BUBBLES[i];
    if (age < 0) continue;
    const bx2 = px + Math.cos(a) * sp * Math.min(age, 1.2), by = py - 150 + Math.sin(a) * sp * Math.min(age, 1.2) - age * 60;
    const col = cols[i % 5];
    cel(g, (() => { const p = new Path2D(); p.roundRect(bx2 - w / 2, by - 32, w, 64, 24); return p; })(), { f: col, s: mix(col, '#000000', .3), so: [0, 8], l: mix(col, '#000000', .6), lw: 2.4 });
    for (let k = 0; k < 2; k++) line(g, [[bx2 - w / 2 + 18, by - 8 + k * 16], [bx2 + w / 2 - 22 - k * 30, by - 8 + k * 16]], mix(col, '#000000', .45), 5);
    lamp(null, e, bx2, by, 10, col, .1);
  }
}

export const SCENES = {
  gates: S => gatesScene(S, 'gates'), title: titleScene, milton: miltonScene, etym: etymScene,
  today: todayScene, example: exampleScene, share: S => gatesScene(S, 'share'),
};
