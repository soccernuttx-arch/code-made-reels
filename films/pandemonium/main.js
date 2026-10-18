// "Pandemonium": a Word of the Day Reel in the 80s Cel Anime style (Lemo-Opuscar library, engine files copied from its demo, MIT).
import { canvas, W, H } from './cel.js';
import { makePost } from './post.js';
import { DUR, shotAt, VO } from './story.js';
import { buildPlates, SCENES } from './scenes.js';
import { hud } from './hud.js';

const qs = new URLSearchParams(location.search);
const [sc, g] = canvas(W, H), [gc, e] = canvas(W, H), [ovc, ov] = canvas(W, H);
const post = makePost(document.getElementById('gl'));
for (const f of ['60px "Dela Gothic One"', 'italic 900 60px Kanit', 'italic 800 60px Kanit', 'italic 600 60px Kanit', '500 40px "Barlow SC"', '600 40px "Barlow SC"', '700 40px "Barlow SC"'])
  await document.fonts.load(f, 'パンデモニウム ABC abc 1667');
let WORDS = {}; try { const r = await fetch('voices/words.json'); if (r.ok) WORDS = await r.json(); } catch (x) { }
const A = buildPlates();

function render(t) {
  for (const x of [g, e]) { x.setTransform(1, 0, 0, 1, 0, 0); x.globalAlpha = 1; x.globalCompositeOperation = 'source-over'; x.filter = 'none'; }
  g.fillStyle = '#000'; g.fillRect(0, 0, W, H); e.fillStyle = '#000'; e.fillRect(0, 0, W, H);
  const [t0, t1, name] = shotAt(t);
  SCENES[qs.get('shot') || name]({ t, lt: t - t0, u: (t - t0) / (t1 - t0), len: t1 - t0, g, e, A, WORDS });
  for (const x of [g, e]) x.setTransform(1, 0, 0, 1, 0, 0);
  if (qs.get('nosub')) ov.clearRect(0, 0, W, H); else hud(ov, t, WORDS);
  // tape punctuation: a few frames of tracking noise on the cut into the title and into the share shot
  const track = [2.3, 16.1].reduce((a, c) => t >= c && t < c + 6 / 24 ? 1 - (t - c) * 4 : a, 0);
  post.render(sc, gc, Math.round(t * 24), ovc, qs.get('raw') ? { bloom: 0, halo: 0, scan: 0, grille: 0, noiseA: 0, corner: 0, track: 0 } : { track });
}

// sound events for the mix (mix.py reads window.EV through a render step)
window.EV = [
  ...VO.map(v => ({ type: 'voice', id: v.id, t: v.t })),
  { type: 'whoosh', t: .05 }, { type: 'clunk', t: 1.2 }, { type: 'buzz', t: 1.35 }, { type: 'brass', t: 2.32 },
  { type: 'scratch', t: 4.0, d: 2.6 }, { type: 'buzz', t: 7.0 }, { type: 'buzz', t: 8.0 }, { type: 'giggles', t: 9.1, d: 1.4 },
  { type: 'impact', t: 10.6 }, { type: 'whoosh', t: 10.9 }, { type: 'pings', t: 12.75, d: 3.2 }, { type: 'whoosh', t: 16.15 },
  { type: 'clunk', t: 19.4 }, { type: 'whoosh', t: 19.55 },
];
window.render = render; window.DUR = DUR; window.POST = post;
render(parseFloat(qs.get('t') ?? '0'));
window.READY = true;
