# Code-Made Reels

Instagram Reels made **entirely in code**: no video AI, no stock footage. Every character, background, title, caption and
sound is drawn or synthesized by a program, then rendered frame by frame in a headless browser.

This repo holds the film behind the **"pandemonium"** Reel from [@word.oftheday26](https://www.instagram.com/word.oftheday26/):
an 80s anime word-of-the-day short (20 s, vertical 1080x1920) with a neon Hell city, an imp, Milton's desk, and a group
chat exploding into chaos.

It's built on **[Lemo-Opuscar](https://github.com/lemomo-ai/lemo-opuscar)** by LemoLab (MIT), a library of 51 film styles
for coding agents. This film uses its *80s Cel Anime* style and engine.

## What's in here

```
films/pandemonium/
  index.html, main.js   the page: window.DUR, window.render(t), window.READY (what the renderer calls)
  story.js              the timeline: shots, voice lines (single source of truth)
  scenes.js             the 7 shots: painted plates + cel characters, camera, neon, effects
  imp.js                the imp character (original), cel-shaded with bat wings and a spade tail
  hud.js                hook text, word-by-word captions, closing call to action, handle
  lines.json            the script (one line per voice clip)
  voices/voice.py       voice-over with word timings (edge-tts)
  mix.py                soundtrack synthesized in numpy: city-pop groove, foley, ducking under the voice
  cel.js pal.js head80.js post.js bg.js fx.js   engine files from Lemo-Opuscar's cel-anime-80s demo (MIT)
  fonts/                font licences + fetch_fonts.py (free Google Fonts, OFL)
make.sh                 voice -> stills -> render -> mix -> mux
```

## Make it yourself

You need **Node 20+**, **ffmpeg**, **Python 3.11+** and `pip install edge-tts`. Linux or macOS (on Windows, use WSL).

1. Get Lemo-Opuscar and its core tools (pin a commit you've read; this film was made against `ded40b2`):
   ```sh
   git clone https://github.com/lemomo-ai/lemo-opuscar.git
   cd lemo-opuscar && git checkout ded40b25679fe5d5dcfc07a282a25da1ceee3be1
   sh plugin/skills/lemo-opuscar/scripts/setup.sh deps
   ```
2. Build the Reel:
   ```sh
   LIB=/path/to/lemo-opuscar sh make.sh films/pandemonium
   ```
   No GPU (a server, WSL)? Add `LEMO_ANGLE=swiftshader`, or the CRT pass can render blank frames.
3. The finished Reel is `films/pandemonium/out/pandemonium.mp4` (-14 LUFS, yuv420p, ready for Instagram).

## Make your own word

Copy `films/pandemonium` to `films/<your-word>`, then:
- rewrite `lines.json` (hook question, the word, its origin, today's meaning, an example, the closing line),
- set the shot times in `story.js` from the voice lengths `voice.py` prints,
- set `WORD` (and your handle) at the top of `hud.js`,
- redraw the scenes in `scenes.js` for your story. Lemo-Opuscar's `DIRECTOR.md`, `TECHNIQUE.md` and
  `styles/cel-anime-80s/STYLE.md` explain the craft; pick another of its 51 styles for a different look.

Rules these Reels follow: a question hook in the first second (never the word itself), the word at 2-3 s, something new
every 2-3 s, facts checked in a real dictionary, no text in the bottom 20% or at the right edge, and a last frame that
loops into the first.

## Licences

- This repo's own code: MIT ([LICENSE](LICENSE)).
- Engine files from Lemo-Opuscar: MIT, (c) 2026 LemoLab ([LICENSE-lemo-opuscar.txt](LICENSE-lemo-opuscar.txt)); each file says so in its first line.
- Fonts: SIL Open Font License 1.1 (licences in `films/pandemonium/fonts/`); downloaded by `fetch_fonts.py`, not stored here.
- Voice: generated with [edge-tts](https://github.com/rany2/edge-tts) (Microsoft neural voices) when you run `voice.py`; no audio is stored here.
