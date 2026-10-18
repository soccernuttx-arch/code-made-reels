"""Soundtrack for "pandemonium", synthesized from scratch (no stock audio): a city-pop / synthwave groove, foley, the voice.
Run with the Lemo-Opuscar library's Python:  $LIB/.venv/bin/python films/pandemonium/mix.py
Writes out/mix.wav (48 kHz stereo); mux.sh then does the two-pass loudnorm to -14 LUFS.
"""
import json, os, re, subprocess, sys
import numpy as np
import soundfile as sf
sys.path.insert(0, os.path.join(os.environ.get('LIB', '/opt/lemo-opuscar'), 'core', 'audio'))   # the library's sfx tools
from sfx import SR, t_, env_exp, bp, lp, hp, noise, norm, whoosh, thump, crash, compress, limit, add

HERE = os.path.dirname(os.path.abspath(__file__))
STORY = open(os.path.join(HERE, 'story.js'), encoding='utf-8').read()
DUR = float(re.search(r'export const DUR = ([\d.]+)', STORY).group(1))
VO = [(m[0], float(m[1])) for m in re.findall(r"\{ id: '(\w+)', t: ([\d.]+)", STORY)]
N = int(DUR * SR)
BPM = 112; BEAT = 60 / BPM; BAR = 4 * BEAT
TITLE, IMPACT, SHARE = 2.3, 10.6, 16.1

def midi(n): return 440 * 2 ** ((n - 69) / 12)
def saw(f, d): ph = (t_(d) * f) % 1; return 2 * ph - 1
def sq(f, d): return np.sign(np.sin(2 * np.pi * f * t_(d)))
def sine(f, d): return np.sin(2 * np.pi * f * t_(d))
def adsr(d, a=.01, r=.1):
    n = len(t_(d)); e = np.ones(n); na, nr = max(1, int(a * SR)), max(1, int(r * SR))
    e[:na] = np.linspace(0, 1, na); e[-nr:] *= np.linspace(1, 0, nr); return e

# Fmaj7 - Em7 - Dm7 - Cmaj7 (city pop), voiced around middle C
CHORDS = [[53, 57, 60, 64], [52, 55, 59, 62], [50, 53, 57, 60], [48, 52, 55, 59]]

def music():
    mus = np.zeros((N, 2)); drums = np.zeros((N, 2))
    nb = int(DUR / BAR) + 1
    for b in range(nb):
        t0, ch = b * BAR, CHORDS[b % 4]
        # pad: detuned saws, low-passed, slow attack (always on; it is the bed under the hook too)
        pad = sum(saw(midi(n), BAR) + saw(midi(n) * 1.004, BAR) for n in ch)
        add(mus, lp(pad, 1800) * adsr(BAR, .25, .3) * .05, t0, 1, -.2)
        add(mus, lp(pad, 1800) * adsr(BAR, .25, .3) * .05, t0, 1, .2)
        for k in range(8):   # bass: root octave pumping on eighths
            tt = t0 + k * BEAT / 2; f = midi(ch[0] - 24 + (12 if k % 2 else 0))
            x = (sine(f, BEAT / 2) * .8 + lp(saw(f, BEAT / 2), 900) * .4) * env_exp(BEAT / 2, .12)
            add(mus, x * .32, tt)
        if t0 + BAR > TITLE:   # arpeggio: 16ths of the chord tones once the title hits
            for k in range(16):
                tt = t0 + k * BEAT / 4
                if tt < TITLE: continue
                n = ch[[0, 1, 2, 3, 2, 1, 3, 2][k % 8]] + 12
                add(mus, lp(sq(midi(n), BEAT / 4), 3000) * env_exp(BEAT / 4, .06) * .045, tt, 1, .35 if k % 2 else -.35)
        for k in range(4):   # drums from the title on: kick 1 & 3, gated snare 2 & 4, hats on eighths
            tt = t0 + k * BEAT
            if tt < TITLE - .01: continue
            if k % 2 == 0:
                d = .35; f = 110 * np.exp(-t_(d) * 18) + 45; kick = np.sin(2 * np.pi * np.cumsum(f) / SR) * env_exp(d, .12)
                add(drums, kick * .9, tt)
            else:
                d = .32; sn = bp(noise(d), 300, 7000) * env_exp(d, .09) + sine(190, d) * env_exp(d, .05) * .6
                gate = (t_(d) < .22).astype(float); add(drums, sn * gate * .45, tt)
            for h in range(2): add(drums, hp(noise(.05), 7000) * env_exp(.05, .012) * .18, tt + h * BEAT / 2, 1, .3)
    # one beat of true silence before the impact peak, then the music comes back
    s0, s1 = int((IMPACT - BEAT) * SR), int(IMPACT * SR)
    for buf in (mus, drums): buf[s0:s1] *= .02
    # last half second thins to the pad-like start, so the loop joins smoothly
    e0 = int((DUR - .5) * SR); drums[e0:] *= np.linspace(1, 0, N - e0)[:, None]
    return mus + drums

def brass(d=.6):   # synth-brass stab on the title (Fmaj9)
    x = sum(saw(midi(n), d) for n in [53, 57, 60, 64, 67])
    cut = 800 + 4000 * env_exp(d, .08)
    y = np.zeros_like(x)
    for i in range(0, len(x), 256): y[i:i + 256] = lp(x[i:i + 256], float(cut[i]))
    return y * adsr(d, .005, .3) * .35

def buzz(d=.5):    # neon tube catching: mains hum + crackle
    return (lp(saw(120, d), 600) * .3 + bp(noise(d), 2000, 6000) * (np.random.default_rng(3).random(len(t_(d))) > .97) * .8) * adsr(d, .01, .15)

def scratch(d):    # quill on paper
    m = (np.sin(2 * np.pi * 6 * t_(d)) > 0).astype(float) * .7 + .3
    return bp(noise(d), 2500, 8000) * m * .25 * adsr(d, .05, .2)

def giggle(pitch):  # a tiny imp "hee-hee"
    d = .09; return sum(sine(pitch * k, d) / k for k in (1, 2, 3)) * env_exp(d, .03) * (1 + .5 * sine(30, d))

def ping(f):       # phone notification
    d = .18; return (sine(f, d) + .5 * sine(f * 1.5, d)) * env_exp(d, .05)

def voice(id_):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', os.path.join(HERE, 'voices', id_ + '.mp3'), '-f', 'f32le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).astype(float)

def build():
    sfxb, vox = np.zeros((N, 2)), np.zeros((N, 2))
    for i, (id_, t) in enumerate(VO):
        x = compress(norm(voice(id_), .9)); add(vox, x * (1.1 if id_ == 'word' else 1.0), t)
    add(sfxb, whoosh(.5) * .5, .05, 1, .6)                                   # imp flies in
    add(sfxb, thump(.8, 90) * .7, 1.2, 1, .4)                                # lever
    for t in (1.35, 7.1, 7.92): add(sfxb, buzz() * .5, t)                     # neon signs
    if 2.3 < DUR: add(sfxb, brass() * .9, TITLE + .02)
    add(sfxb, crash(.5) * .35, TITLE)
    add(sfxb, scratch(2.6), 4.0, 1, -.2)                                     # quill
    R = np.random.default_rng(9)
    for k in range(14): add(sfxb, giggle(900 + R.random() * 700) * .25, 9.15 + k * .1 + R.random() * .05, 1, R.random() * 1.6 - .8)
    add(sfxb, crash(1.0) * .5 + 0, IMPACT); add(sfxb, thump(1.0, 55) * .9, IMPACT)
    add(sfxb, whoosh(.4) * .4, 10.9, 1, -.5)
    tp = 12.75 + 1.03                                                          # pings accelerate from "pandemonium"
    for k in range(5): add(sfxb, ping(1760) * .25, 12.9 + k * .22, 1, .3)
    k, t = 0, tp
    while t < 15.9: add(sfxb, ping([1760, 2093, 2349, 2637][k % 4]) * .22, t, 1, (k % 5) / 2.5 - .8); k += 1; t += max(.045, .16 - k * .006)
    add(sfxb, whoosh(.45) * .45, SHARE + .05, 1, -.4)
    add(sfxb, thump(.6, 90) * .5, DUR - .6, 1, .4); add(sfxb, whoosh(.5) * .5, DUR - .45, 1, .7)   # lever back, imp leaves
    mus = music()
    # duck the music ~9 dB under the voice (smoothed envelope of the voice)
    env = np.abs(vox).max(axis=1); k = int(.08 * SR); env = np.convolve(env, np.ones(k) / k, 'same')
    duck = 1 - .65 * np.clip(env / (env.max() + 1e-9) * 3, 0, 1)
    out = mus * duck[:, None] * .9 + sfxb * .8 + vox * 1.0
    out = np.stack([limit(out[:, c], .9) for c in range(2)], axis=1)
    os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
    sf.write(os.path.join(HERE, 'out', 'mix.wav'), out.astype(np.float32), SR)
    print('mix.wav', round(len(out) / SR, 2), 's, peak', round(float(np.abs(out).max()), 3))

if __name__ == '__main__':
    assert VO and abs(DUR - 18.6) < 5, (VO, DUR)
    build()
