"""Optional static packaging. Site runs without this script or npm."""
from pathlib import Path
import shutil
root = Path(__file__).resolve().parent.parent
out = root / 'dist'
out.mkdir(exist_ok=True)
for name in ['index.html', 'about.html', 'characters.html', 'games-pc.html', 'games-mobile.html', '.nojekyll']:
    shutil.copy2(root / name, out / name)
for name in ['assets', 'data', 'games']:
    shutil.copytree(root / name, out / name, dirs_exist_ok=True)
print('Static site packaged in dist/')
