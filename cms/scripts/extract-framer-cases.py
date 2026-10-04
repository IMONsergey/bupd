"""Rebuild the editorial manifest from the checked-in Framer export (no invented content).
Run from cms: python scripts/extract-framer-cases.py. Requires beautifulsoup4.
"""
import json
import re
from pathlib import Path
from urllib.parse import urlsplit
from bs4 import BeautifulSoup

root = Path(__file__).resolve().parents[2]
slugs = ['avito-auto-2024', 'linear-identity', 'future-archive', 'studio-atlas',
         'parallel-forms', 'silent-motif', 'pattern-language', 'spectrum-project']

def text(element):
    paragraphs = element.find_all(['p', 'h1', 'h2', 'h3', 'h4'])
    return '\n\n'.join(p.get_text(' ', strip=True).replace('\u200b', '') for p in paragraphs) if paragraphs else element.get_text(' ', strip=True)

def asset(element):
    url = element.get('src')
    if not url:
        source = element.find('source')
        url = source.get('src') if source else None
    if not url or url == 'null' or not url.startswith('https://'):
        return None
    # Preserve intrinsic image proportions and use originals rather than cropped thumbnails.
    parts = urlsplit(url)
    return {'source': parts.scheme + '://' + parts.netloc + parts.path,
            'mimeType': 'video/mp4' if element.name == 'video' else 'image/' + ('jpeg' if parts.path.endswith(('.jpg','.jpeg')) else 'png')}

cases = []
palette = {}
report = {}
for slug in slugs:
    html = (root / 'work' / slug / 'index.html').read_text()
    soup = BeautifulSoup(html, 'html.parser')
    heading = soup.find('h4')
    main = heading.find_parent('main')
    rail, story = main.find_all(recursive=False)
    color = re.search(r'--btyvnt:([^;]+)',rail.get('style',''))
    palette[slug] = color[1] if color else '#080808'
    meta = [text(e) for e in rail.find_all(attrs={'data-framer-component-type': 'RichTextContainer'})]
    title, summary, _, categories, _, client, _, year = meta
    hero = asset(story.find('img'))
    blocks = [{'blockType':'caseHero', 'blockName':'framer:hero', 'title':title,
               'media':hero, 'layout':'editorial', 'theme':'dark'}]
    previous = None
    report[slug] = {'emptyText':0, 'emptyVideo':0}
    for element in story.find('section').find_all(['img','video','div']):
        if element.name not in ['img','video'] and element.get('data-framer-component-type') != 'RichTextContainer':
            continue
        # Desktop export variants: hidden-17s6gpi is the mobile/tablet-only branch.
        if any('hidden-17s6gpi' in parent.get('class', []) for parent in [element, *element.parents] if parent.name):
            continue
        if element.name in ['img','video']:
            media = asset(element)
            if not media:
                report[slug]['emptyVideo'] += 1
                continue
            signature = media['source']
            block = ({'blockType':'videoChapter', 'video':media, 'autoplay':True,'loop':True,'mode':'inline'}
                     if element.name == 'video' else {'blockType':'fullBleedMedia','media':media,'height':'auto','fit':'contain'})
            block.update(blockName='framer:media', theme='dark')
        else:
            content = text(element)
            if not content:
                report[slug]['emptyText'] += 1
                continue
            signature = content
            style = element.find(['p','h2','h3']).get('style','')
            size = re.search(r'--framer-font-size:([^;]+)',style)
            large = size and float(size[1].replace('px','')) >= 30
            block = {'blockType':'manifesto','blockName':'framer:copy','text':content,
                     'size':'l' if large else 'm', 'align':'left' if large else 'right','theme':'dark'}
        if signature == previous:
            continue
        previous = signature
        blocks.append(block)
    cases.append({'slug':slug,'title':title,'summary':summary,'client':client,'year':int(year),
                  'categories':[{'label':s.strip()} for s in categories.split(',')],
                  'pageTheme':'dark','cover':hero,'sourceURL':'https://stale-darling-800892.framer.app/work/'+slug,
                  'blocks':blocks})
    print(f'{slug}: {len(blocks)} scenes, {sum(b["blockType"]=="videoChapter" for b in blocks)} videos')

(root/'cms/src/content/framer-cases.json').write_text(json.dumps(cases,ensure_ascii=False,indent=2)+'\n')
(root/'cms/src/content/framer-palette.json').write_text(json.dumps(palette,indent=2)+'\n')
(root/'cms/src/content/framer-import-report.json').write_text(json.dumps(report,indent=2)+'\n')
# Retain the source font faces including Unicode subsets for Cyrillic typography.
fonts = [face for face in re.findall(r'@font-face\s*\{[^}]+\}',html)
         if re.search(r'font-family: "(Inter Display|Inter|Bebas Neue)";',face)
         and any('font-weight: '+weight in face for weight in ['400','500','600'])]
(root/'cms/src/app/(frontend)/preview/[slug]/source-fonts.css').write_text('\n'.join(dict.fromkeys(fonts))+'\n')
