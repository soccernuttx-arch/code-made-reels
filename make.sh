#!/bin/sh
# Build a Reel from a film folder:  LIB=/path/to/lemo-opuscar sh make.sh films/pandemonium
# Steps: voice -> preview stills -> render frames -> soundtrack -> mux (two-pass loudnorm to -14 LUFS, yuv420p for Instagram).
set -e
FILM=$(cd "${1:?usage: LIB=/path/to/lemo-opuscar sh make.sh films/<name>}" && pwd)
: "${LIB:?set LIB to your Lemo-Opuscar folder (see README)}"
export PLAYWRIGHT_BROWSERS_PATH="${PLAYWRIGHT_BROWSERS_PATH:-$LIB/.browsers}"
# no GPU (e.g. a server or WSL)? set LEMO_ANGLE=swiftshader, or the WebGL CRT pass can lose its context and render blank frames
PY="$LIB/.venv/bin/python"

[ -f "$FILM/fonts/Kanit-BlackItalic.ttf" ] || python3 "$FILM/fonts/fetch_fonts.py"
python3 "$FILM/voices/voice.py"                                                    # needs: pip install edge-tts
mkdir -p "$FILM/out"
cd "$LIB"
node core/render/still.mjs "$FILM" 1 5 10 15 --size 1080x1920 --out "$FILM/out/stills"
node core/render/video.mjs "$FILM" --fps 30 --size 1080x1920 --workers 3 --out "$FILM/out/video.mp4"
"$PY" "$FILM/mix.py"
LEMO_COLOR=bt709 sh core/render/mux.sh "$FILM/out/video.mp4" "$FILM/out/mix.wav" "$FILM/out/$(basename "$FILM").mp4" 30 0
