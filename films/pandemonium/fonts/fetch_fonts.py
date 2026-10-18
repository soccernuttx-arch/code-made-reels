"""Download the film's free fonts (SIL Open Font License, licences in this folder) from Google's official fonts repo."""
import os, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
FONTS = {
    'DelaGothicOne-Regular.ttf': 'delagothicone/DelaGothicOne-Regular.ttf',
    'Kanit-BlackItalic.ttf': 'kanit/Kanit-BlackItalic.ttf',
    'Kanit-ExtraBoldItalic.ttf': 'kanit/Kanit-ExtraBoldItalic.ttf',
    'Kanit-SemiBoldItalic.ttf': 'kanit/Kanit-SemiBoldItalic.ttf',
    'BarlowSemiCondensed-Medium.ttf': 'barlowsemicondensed/BarlowSemiCondensed-Medium.ttf',
    'BarlowSemiCondensed-SemiBold.ttf': 'barlowsemicondensed/BarlowSemiCondensed-SemiBold.ttf',
    'BarlowSemiCondensed-Bold.ttf': 'barlowsemicondensed/BarlowSemiCondensed-Bold.ttf',
}
for name, path in FONTS.items():
    data = urllib.request.urlopen('https://github.com/google/fonts/raw/main/ofl/' + path, timeout=60).read()
    assert data[:4] in (b'\x00\x01\x00\x00', b'OTTO', b'true'), f'{name}: not a font file'
    open(os.path.join(HERE, name), 'wb').write(data)
    print(name, len(data))
