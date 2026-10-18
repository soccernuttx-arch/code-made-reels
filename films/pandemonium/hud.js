// Text recorded on the tape (composited inside the CRT pass, STYLE.md §4): the hook at frame 0, word-by-word captions with the
// spoken word lit cyan, the share line, and the handle. Reel rules: nothing in the bottom 20% (y > 1536) and
// nothing at the right edge (Instagram's buttons): text stays in the column x 70..890.
import { W, H, rgba } from './cel.js';
import { VO } from './story.js';

const COL = { x: 70, w: 820 }, CX = COL.x + COL.w / 2, GOLD = '#e8c27a', WORD = 'PANDEMONIUM';

function wrap(c, text, maxW) {
  const out = []; let cur = '';
  for (const w of text.split(' ')) { const t = cur ? cur + ' ' + w : w; if (c.measureText(t).width > maxW && cur) { out.push(cur); cur = w; } else cur = t; }
  if (cur) out.push(cur); return out;
}
function outlined(c, text, x, y, fill, stroke, lw) {
  c.lineJoin = 'round'; c.shadowColor = 'rgba(0,0,0,.55)'; c.shadowBlur = 12; c.shadowOffsetY = 4;
  c.strokeStyle = stroke; c.lineWidth = lw; c.strokeText(text, x, y); c.shadowColor = 'transparent';
  c.fillStyle = fill; c.fillText(text, x, y);
}
function bigLines(c, text, y, size, fill = '#ffffff', stroke = '#3a0626') {
  c.font = `italic 900 ${size}px Kanit`; c.textAlign = 'center'; c.textBaseline = 'middle';
  const lines = wrap(c, text, COL.w); lines.forEach((ln, i) => outlined(c, ln, CX, y + i * size * 1.08, fill, stroke, size * .2));
  return y + lines.length * size * 1.08;   // where the next text can start
}

// Captions: up to 3 words at a time, the one being spoken lights up cyan with a small pop.
function captions(c, t, WORDS) {
  const v = VO.filter(x => x.cap).find(x => t >= x.t - .05 && t < x.t + ((WORDS[x.id] || []).slice(-1)[0]?.t ?? 0) + .9);
  if (!v) return;
  const ws = WORDS[v.id] || [], lt = t - v.t; let i = -1;
  ws.forEach((w, j) => { if (lt >= w.t) i = j; });
  if (i < 0) return;
  const from = i - (i % 3), chunk = ws.slice(from, from + 3);
  c.font = '700 74px "Barlow SC"'; c.textBaseline = 'middle'; c.textAlign = 'left';
  const gap = 22, widths = chunk.map(w => c.measureText(w.w).width), total = widths.reduce((a, b) => a + b, 0) + gap * (chunk.length - 1);
  const k = Math.min(1, COL.w / total); let x = CX - total * k / 2;
  c.save(); c.translate(0, 0);
  chunk.forEach((w, j) => {
    const on = from + j === i, pop = on ? Math.max(0, 1 - (lt - w.t) * 6) : 0, s = k * (1 + pop * .12);
    c.save(); c.translate(x + widths[j] * k / 2, 1290); c.scale(s, s); c.textAlign = 'center';
    outlined(c, w.w, 0, 0, on ? '#8ff4ff' : '#fff0a0', '#120a1e', 12); c.restore();
    x += (widths[j] + gap) * k;
  });
  c.restore();
}

export function hud(c, t, WORDS) {
  c.clearRect(0, 0, W, H);
  if (t < 2.3) bigLines(c, "What's the capital of Hell called?", 300, 92);                 // the hook, on screen from frame 0
  if (t >= 16.1) {   // closing call to action: comment the word
    const below = bigLines(c, `Comment ${WORD}`, 290, 100, '#fff0a0');
    c.font = '600 54px "Barlow SC"'; c.textAlign = 'center';
    wrap(c, 'to get my GitHub repo to make videos like this', COL.w).forEach((ln, i) => outlined(c, ln, CX, below + 10 + i * 62, '#8ff4ff', '#120a1e', 10));
  }
  captions(c, t, WORDS);
  // the brand: same handle, same gold bar, same place in every Reel
  c.font = '700 36px "Barlow SC"'; c.textAlign = 'left'; c.textBaseline = 'middle';
  const hw = c.measureText('@word.oftheday26').width;
  c.fillStyle = rgba('#000000', .45); c.fillRect(COL.x, 1416, hw + 40, 50);
  c.fillStyle = GOLD; c.fillRect(COL.x, 1416, 7, 50);
  c.fillStyle = '#ffffff'; c.fillText('@word.oftheday26', COL.x + 24, 1442);
}
