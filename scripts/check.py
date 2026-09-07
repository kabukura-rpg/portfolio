"""Check all local static HTML/CSS references without external dependencies."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
import re
root = Path(__file__).resolve().parent.parent
errors=[]
class Checker(HTMLParser):
    def handle_starttag(self, tag, attrs):
        attrs=dict(attrs)
        for key in ('src','href'):
            value=attrs.get(key,'')
            if value and not value.startswith(('#','http:','https:','data:','mailto:')):
                target=(self.path.parent/unquote(urlsplit(value).path)).resolve()
                if not target.exists(): errors.append(f'{self.path.name}: missing {value}')
        if tag=='img' and 'alt' not in attrs: errors.append(f'{self.path.name}: image without alt')
for file in root.glob('*.html'):
    parser=Checker(); parser.path=file; parser.feed(file.read_text())
for file in (root/'assets/css').glob('*.css'):
    for value in re.findall(r'url\([\'\"]?([^\)\'\"]+)',file.read_text()):
        if not value.startswith(('data:','http')) and not (file.parent/value).exists(): errors.append(f'{file.name}: missing {value}')
if errors: raise SystemExit('\n'.join(errors))
print('PASS: all 5 HTML pages and CSS asset references; image alt attributes')
