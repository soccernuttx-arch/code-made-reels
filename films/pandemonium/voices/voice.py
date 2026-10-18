"""Voice for the film: one mp3 per line (edge-tts, en-US-AndrewNeural like the other Word of the Day Reels) plus each word's
start/length, for the captions. Run with Windows Python (edge-tts is installed there):  python voices/voice.py
Writes voices/<id>.mp3, voices/words.json {id: [{t, d, w}]}.
"""
import asyncio, json, os
import edge_tts

HERE = os.path.dirname(os.path.abspath(__file__))
VOICE, RATE = 'en-US-AndrewNeural', '+10%'
LINES = json.load(open(os.path.join(HERE, '..', 'lines.json'), encoding='utf-8'))


async def speak(line):
    words, c = [], edge_tts.Communicate(line.get('say', line['text']), VOICE, rate=line.get('rate', RATE), boundary='WordBoundary')
    with open(os.path.join(HERE, line['id'] + '.mp3'), 'wb') as f:
        async for ch in c.stream():
            if ch['type'] == 'audio': f.write(ch['data'])
            elif ch['type'] == 'WordBoundary': words.append({'t': round(ch['offset'] / 1e7, 3), 'd': round(ch['duration'] / 1e7, 3), 'w': ch['text']})
    return line['id'], words


async def main():
    out = dict(await asyncio.gather(*(speak(l) for l in LINES)))
    json.dump(out, open(os.path.join(HERE, 'words.json'), 'w', encoding='utf-8'), indent=1)
    for k, v in out.items(): print(k, v[-1]['t'] + v[-1]['d'] if v else 0, ' '.join(w['w'] for w in v))

asyncio.run(main())
