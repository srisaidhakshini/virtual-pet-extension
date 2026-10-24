"""Package built extension and minimal server sources, never profiles or workspace files."""
from pathlib import Path
import json
import zipfile

root = Path(__file__).resolve().parent.parent
version = json.loads((root / 'package.json').read_text(encoding='utf-8'))['version']
release = root / 'release'
release.mkdir(exist_ok=True)
dist = root / 'dist'
if not (dist / 'manifest.json').is_file():
    raise SystemExit('Run npm run build first.')

extension = release / f'Sprout-Chrome-{version}.zip'
with zipfile.ZipFile(extension, 'w', zipfile.ZIP_DEFLATED) as archive:
    for file in sorted(dist.rglob('*')):
        if file.is_file() and not file.is_symlink() and file.name != 'room-client.cjs':
            archive.write(file, Path('Sprout-Chrome') / file.relative_to(dist))
    archive.writestr('Sprout-Chrome/INSTALL.txt', '''SPROUT - CHROME (MAC AND WINDOWS)

1. Extract this entire ZIP. Keep the extracted folder.
2. Open chrome://extensions in Chrome (version 116 or later).
3. Enable Developer mode, choose Load unpacked, and select Sprout-Chrome.
4. Pin the extension and refresh your webpage tabs.
5. Open care controls, then Connect. Both people enter the same deployed
   wss://YOUR-SERVICE.onrender.com/rooms address.
6. One person creates a room; the other joins with the code.
7. Request control and Pass control switch who moves and cares for the pet.

The server address must come from your deployed room service. No public server
is bundled into this ZIP. This is a browser extension, not a Mac desktop app.
''')

service = release / f'Sprout-Room-Service-{version}.zip'
with zipfile.ZipFile(service, 'w', zipfile.ZIP_DEFLATED) as archive:
    for name in ['index.mjs', 'package.json', 'package-lock.json', 'Dockerfile']:
        archive.write(root / 'server' / name, Path('Sprout-Room-Service/server') / name)
    for name in ['render.yaml', 'CONNECTION.md']:
        archive.write(root / name, Path('Sprout-Room-Service') / name)

for file in [extension, service]:
    with zipfile.ZipFile(file) as archive:
        assert archive.testzip() is None
        assert all('node_modules' not in name and '.git/' not in name and 'pet-state.json' not in name for name in archive.namelist())
    print(f'{file}: {file.stat().st_size:,} bytes')
