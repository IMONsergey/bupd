#!/usr/bin/env python3
"""Read-only audit of the complete static BAEV site and its eleven native cases.

Usage: python3 scripts/validate_cases.py --repo SITE --output REPORT.json [--url BASE]
No external links, forms, email clients, or embedded players are activated.
"""
import argparse
from collections import Counter
import html
import hashlib
import json
from pathlib import Path
import re
from urllib.parse import unquote, urljoin, urlsplit
from urllib.request import urlopen

from build_static import Document

MAIN_ROUTES = ['/', '/work', '/about', '/blog', '/contact']
LEGACY_ROUTES = ['/work/future-archive', '/work/studio-atlas', '/work/parallel-forms', '/work/silent-motif']
ARTICLE_ROUTES = ['/blog/executive-presentation-how-to-speak', '/blog/how-to-turn-a-set-of-slides-into-a-clear-presentation-script',
                  '/blog/fact-invest-prez', '/blog/pitch-deck-2026-ai', '/blog/why-your-presentation-isnt-persuasive', '/blog/sales-deck-how']
FRAMER = re.compile(r'(^|\.)(framer\.com|framer\.app|framerusercontent\.com|framerstatic\.com|framer\.website)$', re.I)
CSS_URL = re.compile(r'url\(\s*(["\']?)(.*?)\1\s*\)', re.S)
HTTP_URL = re.compile(r'https?://[^\s"\'<>\\)]+')

def text(node):
    return ' '.join(html.unescape(re.sub(r'<!--.*?-->', '', node.text(), flags=re.S)).split())

def has_class(node, value):
    return value in node.attrs.get('class', '').split()

def route_path(root, route):
    return root / ('index.html' if route == '/' else route.lstrip('/') + '/index.html')

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--repo', required=True, type=Path)
    parser.add_argument('--output', required=True, type=Path)
    parser.add_argument('--url')
    args = parser.parse_args()
    root = args.repo.resolve()
    config = json.loads((root / 'content/cases/catalog.json').read_text())['cases']
    case_routes = {item['route']: item for item in config}
    outlines = json.loads((root / 'content/cases/text-outlines.json').read_text())['outlines']
    supplemental = json.loads((root / 'content/cases/supplemental-media.json').read_text())
    routes = MAIN_ROUTES + LEGACY_ROUTES + list(case_routes) + ARTICLE_ROUTES
    origin = args.url.rstrip('/') if args.url else 'https://baev-static.invalid'
    origin_host = urlsplit(origin).netloc
    report = {'ok': False, 'root': str(root), 'origin': args.url, 'routes': [], 'checks': [], 'errors': [],
              'assetReferences': 0, 'localAssetFiles': [], 'externalResourceHosts': [], 'nativeVideos': [],
              'catalogProjects': [], 'nextProjects': {}, 'safety': {'externalLinksOpened': 0, 'formSubmissions': 0, 'mailtoActivations': 0}}
    files, external, parsed, titles, descriptions = set(), set(), {}, {}, {}
    referenced_css = set()
    def check(name, passed, actual=None):
        record = {'name': name, 'passed': bool(passed)}
        if actual is not None: record['actual'] = actual
        report['checks'].append(record)
        if not passed: report['errors'].append(record)
    def resource(raw, base, where):
        raw = html.unescape(str(raw or '')).strip()
        if not raw or raw.startswith(('#', 'data:', 'blob:')): return
        if raw.lower() in {'null', 'undefined'}:
            check('valid media URL', False, {'context': where, 'url': raw}); return
        parts = urlsplit(urljoin(base, raw))
        if FRAMER.search(parts.hostname or ''):
            check('no Framer resource', False, {'context': where, 'host': parts.hostname})
        if parts.netloc and parts.netloc != origin_host:
            external.add(parts.netloc)
            check('localized runtime resource', False, {'context': where, 'host': parts.netloc, 'path': parts.path})
            return
        target = (root / unquote(parts.path).lstrip('/')).resolve()
        report['assetReferences'] += 1
        valid = target.is_relative_to(root) and target.is_file() and target.stat().st_size > 0
        if valid:
            files.add(str(target.relative_to(root)))
            if target.suffix.lower() == '.css': referenced_css.add(target)
        else: check('nonempty local asset', False, {'context': where, 'path': parts.path})
    def css_resources(css, base, where):
        for match in CSS_URL.finditer(css): resource(match[2], base, where)
        for match in re.finditer(r'@import\s+["\']([^"\']+)', css): resource(match[1], base, where)
    check('26 unique expected routes', len(routes) == len(set(routes)) == 26, len(routes))
    check('11 unique native case keys', len(config) == len({c['key'] for c in config}) == 11, len(config))
    for route in routes:
        page_file = route_path(root, route)
        if not page_file.is_file():
            check('route file exists', False, route); continue
        raw = page_file.read_text()
        doc = Document(raw).root
        parsed[route] = doc
        status = None
        if args.url:
            try:
                with urlopen(origin + route, timeout=12) as response:
                    status = response.status
                    served = response.read().decode('utf-8')
                check('route HTTP 200', status == 200, {'route': route, 'status': status})
                check('served HTML matches candidate', served == raw, route)
            except Exception as error:
                check('route response', False, {'route': route, 'error': str(error)})
        nodes = list(doc.walk())
        headings = [text(n) for n in nodes if n.tag == 'h1']
        title = next((text(n) for n in nodes if n.tag == 'title'), '')
        description = next((n.attrs.get('content', '').strip() for n in nodes if n.tag == 'meta' and n.attrs.get('name') == 'description'), '')
        # The preserved source has mutually exclusive desktop/tablet/phone
        # copies. Native case articles share one heading across all widths.
        heading_ok = (len(headings) == 1 if route in case_routes else len(set(headings)) == 1) and bool(headings and headings[0])
        check('one nonempty H1 per native article or original responsive heading', heading_ok, {'route': route, 'headings': headings})
        check('nonempty title and description', bool(title and description), route)
        titles.setdefault(title, []).append(route); descriptions.setdefault(description, []).append(route)
        check('no temporary Figma URL', 'figma.com/api/mcp/asset/' not in raw, route)
        body = next((n for n in nodes if n.tag == 'body'), doc)
        main_node = next((n for n in nodes if n.tag == 'main'), None)
        if main_node: check('no unfinished placeholder', 'Уточнить' not in text(main_node), route)
        base = origin + route
        video_count = 0
        for n in nodes:
            a = n.attrs
            if n.tag in {'img', 'video', 'audio', 'source', 'iframe', 'embed'}:
                for attr in ('src', 'poster'):
                    if a.get(attr): resource(a[attr], base, route + ' ' + n.tag + '.' + attr)
            if n.tag == 'script':
                if a.get('src'): resource(a['src'], base, route + ' script')
                for url in HTTP_URL.findall(n.text()):
                    if FRAMER.search(urlsplit(url).hostname or ''): check('no inline Framer runtime', False, route)
                check('no source platform runtime marker', not any(k in n.text() for k in ['__framer__', 'framer-motion', 'framer_modules']), route)
            if n.tag == 'link' and set(a.get('rel', '').split()) & {'stylesheet', 'preload', 'modulepreload', 'icon'}:
                resource(a.get('href'), base, route + ' link')
            if a.get('srcset') and not a['srcset'].lstrip().startswith('data:'):
                for candidate in a['srcset'].split(','):
                    if candidate.strip(): resource(candidate.strip().split()[0], base, route + ' srcset')
            if a.get('data-baev-cursor-image'):
                resource(a['data-baev-cursor-image'], base, route + ' cursor image')
            if a.get('style'): css_resources(a['style'], base, route + ' inline style')
            if n.tag == 'style': css_resources(n.text(), base, route + ' style')
            if n.tag == 'a' and a.get('href'):
                href = a['href']
                if href.startswith(('mailto:', 'tel:', 'javascript:', 'data:', '#')): continue
                parts = urlsplit(urljoin(base, href))
                if parts.netloc != origin_host: continue
                target_route = unquote(parts.path).rstrip('/') or '/'
                target = (root / unquote(parts.path).lstrip('/')).resolve()
                valid = target_route in routes or (target.is_relative_to(root) and target.is_file())
                if not valid: check('valid internal link', False, {'route': route, 'href': href})
            if n.tag == 'video' and 'data-case-video' in a:
                video_count += 1
                required = ('poster', 'controls', 'muted', 'playsinline', 'loop', 'aria-label')
                check('native video has poster and controls', all(k in a for k in required) and bool(a.get('poster')), {'route': route, 'src': a.get('src')})
                check('native video never has static autoplay', 'autoplay' not in a, {'route': route, 'src': a.get('src')})
                check('native video defers loading', a.get('preload') == 'none', {'route': route, 'src': a.get('src'), 'preload': a.get('preload')})
                report['nativeVideos'].append({'route': route, 'src': a.get('src'), 'poster': a.get('poster'), 'slot': a.get('data-case-video-slot')})
        if route in case_routes:
            expected = case_routes[route]
            mains = [n for n in nodes if n.tag == 'main' and has_class(n, 'baev-case')]
            check('native case main and key', len(mains) == 1 and mains[0].attrs.get('data-case-key') == expected['key'], route)
            scenes = [n for n in nodes if 'data-case-scene' in n.attrs]
            check('case contains scenes', len(scenes) >= 2, {'route': route, 'scenes': len(scenes)})
            artwork = [n for n in nodes if has_class(n, 'baev-case-art')]
            check('artwork has accessible scene descriptions', bool(artwork) and all(
                n.tag == 'figure' and n.attrs.get('aria-label', '').strip() for n in artwork), route)
            expected_outlines = [item for item in outlines if item['case'] == expected['key']]
            actual_outlines = [n for n in nodes if 'data-case-text-outline' in n.attrs]
            check('all exact artwork labels integrated',
                sorted(n.attrs['data-case-text-outline'] for n in actual_outlines) ==
                sorted(item['nodeId'] for item in expected_outlines), route)
            for item in expected_outlines:
                matches = [n for n in actual_outlines if n.attrs['data-case-text-outline'] == item['nodeId']]
                images = [child for n in matches for child in n.walk() if child.tag == 'img']
                asset = root / item['src'].lstrip('/')
                check('artwork label source and accessible text match',
                    len(images) == 1 and images[0].attrs.get('src') == item['src'] and
                    images[0].attrs.get('alt') == item['text'] and asset.is_file() and
                    hashlib.sha256(asset.read_bytes()).hexdigest() == item['svgSha256'],
                    {'route': route, 'node': item['nodeId']})
            for item in supplemental.get(expected['key'], []):
                matches = [n for n in nodes if n.tag == 'video' and
                    n.attrs.get('data-case-video-slot') == item['figma_node_id']]
                asset = root / item['local'].lstrip('/')
                check('supplemental author animation integrated exactly once', len(matches) == 1 and
                    matches[0].attrs.get('src') == item['local'] and asset.is_file() and
                    hashlib.sha256(asset.read_bytes()).hexdigest() == item['video_sha256'],
                    {'route': route, 'slot': item['figma_node_id']})
            for n in nodes:
                if n.tag in {'p', 'h2'} and (has_class(n, 'baev-case-caption-copy') or has_class(n, 'baev-case-caption-title')):
                    check('caption is native text', bool(text(n).replace('\u200b', '').strip()) or n.tag == 'p', {'route': route, 'node': n.attrs.get('data-node-id')})
            check('case retains site navigation/footer', any(n.tag == 'nav' for n in nodes) and any(n.tag == 'footer' for n in nodes), route)
            check('case runtime linked', any(n.tag == 'script' and n.attrs.get('src') == '/scripts/cases.js' for n in nodes), route)
        elif route in LEGACY_ROUTES:
            check('legacy case main retained', main_node is not None and not has_class(main_node, 'baev-case') and bool(text(main_node)), route)
        if route.startswith('/work/'):
            related = next((n for n in nodes if n.attrs.get('data-framer-name') == 'Next projects'), None)
            links = [n.attrs['href'] for n in related.walk() if n.tag == 'a' and n.attrs.get('href', '').startswith('/work/')] if related else []
            report['nextProjects'][route] = links
            check('three distinct next projects without self-link', len(links) == len(set(links)) == 3 and route not in links and all(link in routes for link in links), {'route': route, 'links': links})
        report['routes'].append({'route': route, 'bytes': page_file.stat().st_size, 'status': status, 'title': title, 'h1': headings, 'nativeVideos': video_count})
    for kind, mapping in [('title', titles), ('description', descriptions)]:
        duplicates = {value: pages for value, pages in mapping.items() if not value or len(pages) > 1}
        check('unique nonempty ' + kind, not duplicates, duplicates)
    if '/work' in parsed:
        cards = [n for n in parsed['/work'].walk() if n.tag == 'a' and has_class(n, 'framer-m7m9in')]
        links = [n.attrs.get('href') for n in cards]
        report['catalogProjects'] = links
        check('15 catalog cards and routes', len(links) == len(set(links)) == 15 and set(links) == set(case_routes) | set(LEGACY_ROUTES), links)
    if '/' in parsed:
        rows = [n for n in parsed['/'].walk() if n.tag == 'a' and has_class(n, 'framer-pE5Vm')]
        counts = Counter(n.attrs.get('href') for n in rows)
        check('15 projects in both responsive home indexes', len(rows) == 30 and set(counts) == set(case_routes) | set(LEGACY_ROUTES) and all(count == 2 for count in counts.values()), dict(counts))
    pending_css = set((root / 'styles').rglob('*.css')) | referenced_css
    scanned_css = set()
    while pending_css:
        file = pending_css.pop()
        if file in scanned_css or not file.is_file(): continue
        scanned_css.add(file)
        where = str(file.relative_to(root)); base = origin + '/' + where
        value = file.read_text()
        css_resources(value, base, where)
        check('no temporary URL in stylesheet', 'figma.com/api/mcp/asset/' not in value, where)
        pending_css.update(referenced_css - scanned_css)
    for file in [root / 'scripts/site.js', root / 'scripts/cases.js']:
        if not file.is_file(): continue
        value = file.read_text()
        where = str(file.relative_to(root)); base = origin + '/' + where
        for url in HTTP_URL.findall(value):
            if FRAMER.search(urlsplit(url).hostname or ''): check('no Framer runtime URL', False, where)
        check('no temporary URL in runtime file', 'figma.com/api/mcp/asset/' not in value, where)
    report['localAssetFiles'] = sorted(files)
    report['externalResourceHosts'] = sorted(external)
    report['ok'] = not report['errors'] and len(parsed) == 26
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({'ok': report['ok'], 'routes': len(parsed), 'assets': len(files), 'nativeVideoSlots': len(report['nativeVideos']), 'errors': len(report['errors'])}))
    raise SystemExit(0 if report['ok'] else 1)

if __name__ == '__main__': main()
