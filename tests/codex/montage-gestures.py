"""Create small contact sheets from the captured browser frames for visual QA."""
import json
from pathlib import Path
from PIL import Image, ImageDraw

root = Path(__file__).resolve().parents[2]
folder = root / 'reports' / 'codex' / 'gesti-7999-34'
manifest = json.loads((folder / 'manifest.json').read_text(encoding='utf-8'))
for case in manifest['cases']:
    if len(case['files']) != 8:
        continue
    sheet = Image.new('RGB', (824, 976), '#ffffff')
    draw = ImageDraw.Draw(sheet)
    for n, item in enumerate(case['files']):
        source = Image.open(folder / item['file']).convert('RGB')
        source.thumbnail((206, 458))
        x, y = (n % 4) * 206, (n // 4) * 488
        last = item.get('last') or {}
        label = f"{n+1} f{item['target']} {last.get('g') or ''} arc{last.get('arc', '')}"
        draw.text((x + 3, y + 6), label, fill='#000000')
        sheet.paste(source, (x, y + 30))
    name = f"contact-{case['kind']}-gi{case['gi']:03d}.jpg"
    sheet.save(folder / name, quality=86)
    print(name)
