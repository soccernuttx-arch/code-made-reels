// Timeline: one source of truth for shots, voice lines and sound events. Voice lengths come from voices/words.json.
export const DUR = 20.0;   // 20 s max for a Reel
// [start, end, shot]
export const SHOTS = [
  [0, 2.3, 'gates'], [2.3, 3.9, 'title'], [3.9, 6.85, 'milton'], [6.85, 10.6, 'etym'],
  [10.6, 12.6, 'today'], [12.6, 16.1, 'example'], [16.1, DUR, 'share'],
];
// voice lines: id (voices/<id>.mp3), start time; cap = word-by-word captions (hook and word have their own big text)
export const VO = [
  { id: 'hook', t: .15 }, { id: 'word', t: 2.45 }, { id: 'milton', t: 4.0, cap: true }, { id: 'etym', t: 7.0, cap: true },
  { id: 'today', t: 10.75, cap: true }, { id: 'example', t: 12.75, cap: true }, { id: 'share', t: 16.15 },
];
export const shotAt = t => SHOTS.find(s => t >= s[0] && t < s[1]) || SHOTS[SHOTS.length - 1];
export const step = (t, fps) => Math.floor(t * fps + 1e-6) / fps;   // characters on twos (12) or threes (8)

// When a given word is spoken (absolute time), from words.json; used to time sign flicks, expressions, bubbles.
export function wordTime(WORDS, id, word, nth = 0) {
  const v = VO.find(x => x.id === id), ws = (WORDS[id] || []).filter(w => w.w.toLowerCase().startsWith(word.toLowerCase()));
  return ws[nth] ? v.t + ws[nth].t : null;
}
