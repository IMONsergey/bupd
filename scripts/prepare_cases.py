#!/usr/bin/env python3
"""Adapt the eleven captured Figma case designs to native, responsive HTML.

No assets are fetched and no JavaScript is executed. Editorial text stays native;
art scenes preserve the source layers and use their own inline-size container.
prepare_case(slug, asset_urls=None, node_hook=None, source_root=None) -> (main Node, manifest).
node_hook(slug, source_root) runs after source IDs are bound, before decomposition.
source_root contains figma-page9.xml, figma-context/ and figma-cases-context/;
it can be a private archive outside the deployed repository.
"""
from __future__ import annotations

import argparse
import copy
import html
import json
import re
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

from build_static import Node
from figma_static import BASE_CSS, render_context

ROOT = Path(__file__).resolve().parents[1]
CONTEXTS = ROOT / 'figma-cases-context'
SPECS = {
    'orla': ('216:131', 'figma-context/orla.txt', '216:164', None),
    'gm8': ('166:5', 'figma-cases-context/gm8-parent.jsx', '166:573', '166:574'),
    'haval': ('166:575', 'figma-cases-context/haval-parent.jsx', '166:986', '166:987'),
    'serenity': ('166:988', None, '166:2674', '166:2675'),
    'pik': ('166:2676', 'figma-cases-context/pik-parent.jsx', '166:3047', '166:3048'),
    'rocket': ('166:3049', 'figma-cases-context/rocket-parent.jsx', '166:3531', '166:3532'),
    'vrt': ('166:3533', 'figma-cases-context/vrt-parent.jsx', '166:3875', '166:3876'),
    'askona': ('200:115', 'figma-cases-context/askona-parent.jsx', '200:147', '200:159'),
    'tochka': ('200:160', 'figma-cases-context/tochka-parent.jsx', '200:192', '200:204'),
    'avito': ('182:66', 'figma-context/avito.txt', '182:97', '182:109'),
    'vk': ('197:112', 'figma-context/vk.txt', '197:143', '197:155'),
}
INHERITED = {'color', 'font-family', 'font-size', 'font-weight', 'font-style',
             'font-variation-settings', 'line-height', 'letter-spacing', 'text-align',
             'text-transform', 'word-break', 'white-space'}
GEOMETRY = {'position', 'left', 'right', 'top', 'bottom', 'inset', 'width', 'height',
            'min-width', 'min-height', 'max-width', 'max-height', 'transform',
            'grid-column', 'grid-row', 'flex-shrink', 'flex-grow', 'flex-basis'}
PX = re.compile(r'(?<![\w.-])(-?\d+(?:\.\d+)?)px\b')


def nodes(node):
    return [child for child in node.children if isinstance(child, Node)]


def text(node):
    def parts(item):
        if isinstance(item, Node):
            return ' '.join(parts(c) for c in item.children)
        return html.unescape(str(item))
    return re.sub(r'\s+', ' ', parts(node)).strip()


def styles(node):
    return dict((key.strip(), value.strip()) for part in node.attrs.get('style', '').split(';')
                if ':' in part for key, value in [part.split(':', 1)])


def set_style(node, value):
    node.attrs['style'] = ';'.join(key + ':' + str(item) for key, item in value.items())


def element(tag, attrs=None, children=None):
    node = Node(tag, attrs or {})
    node.children = children or []
    return node


def clean_classes(node):
    for item in node.walk():
        item.attrs.pop('class', None)
        item.attrs.pop('data-figma-classes', None)


def bind_metadata(node, metadata):
    """Give expanded component instances their actual canvas ID, retaining template IDs."""
    source_id = metadata.get('id')
    previous = node.attrs.get('data-node-id')
    if previous and previous != source_id:
        node.attrs['data-figma-template-node-id'] = previous
    node.attrs['data-node-id'] = source_id
    node.attrs.setdefault('data-name', metadata.get('name', ''))
    children, declared = nodes(node), list(metadata)
    if children and len(children) == len(declared):
        for child, child_meta in zip(children, declared):
            bind_metadata(child, child_meta)
    elif declared:
        by_id = {c.attrs.get('data-node-id'): c for c in children}
        for child_meta in declared:
            if child_meta.get('id') in by_id:
                bind_metadata(by_id[child_meta.get('id')], child_meta)


def geometry_index(root):
    out = {}
    def visit(node, x=0, y=0):
        g = {key: float(node.get(key, 0)) for key in ['x', 'y', 'width', 'height']}
        g['pageX'], g['pageY'] = x + g['x'], y + g['y']
        out[node.get('id')] = g
        for child in node:
            visit(child, g['pageX'], g['pageY'])
    for child in root:
        visit(child)
    out[root.get('id')] = {'x': 0, 'y': 0, 'pageX': 0, 'pageY': 0,
                           'width': float(root.get('width')), 'height': float(root.get('height'))}
    return out


def load_source(slug, asset_urls, source_root=None):
    capture_root = Path(source_root).resolve() if source_root is not None else ROOT
    contexts = capture_root / 'figma-cases-context'
    case_id, filename, intro_id, materials_id = SPECS[slug]
    xml = ET.fromstring((capture_root / 'figma-page9.xml').read_text())
    metadata = next(n for n in xml.iter() if n.get('id') == case_id)
    if filename:
        source, assets = render_context(capture_root / filename, asset_urls=asset_urls)
        bind_metadata(source, metadata)
        return source, metadata, assets
    # Serenity's imported Lottie makes the parent response sparse. All other
    # visible children have independent high-fidelity design-context responses.
    source = element('div', {'data-node-id': case_id, 'data-name': metadata.get('name'),
                             'style': 'background-color:#fffaf4'})
    assets = {}
    def render_child(meta):
        path = contexts / ('serenity-' + meta.get('id').replace(':', '-') + '.jsx')
        child, mapping = render_context(path, asset_urls=asset_urls)
        bind_metadata(child, meta)
        assets.update({meta.get('id') + ':' + key: value for key, value in mapping.items()})
        return child
    for child_meta in metadata:
        if child_meta.get('id') != '166:2673':
            source.children.append(render_child(child_meta))
            continue
        left_meta, right_meta = list(child_meta)
        body = element('div', {'data-node-id': '166:2673'})
        body.children.append(render_child(left_meta))
        material = element('div', {'data-node-id': materials_id})
        for scene_meta in right_meta:
            if scene_meta.get('id') == '166:1028':
                response = json.loads((contexts / 'serenity-lottie-svg-assets.json').read_text())
                exported = json.loads(next(c['text'] for c in response['content'] if c.get('type') == 'text'))['export']
                original = exported['url']
                local = asset_urls.get(original, original)
                assets['lottie-logo'] = original
                art = element('div', {'data-node-id': '166:1028', 'data-name': scene_meta.get('name'),
                                     'style': 'position:relative;width:1189px;height:569.729187px'}, [
                    element('img', {'src': local, 'alt': '', 'data-figma-asset': 'lottie-logo',
                                    'style': 'display:block;width:100%;height:100%;object-fit:contain'})])
                material.children.append(art)
            else:
                material.children.append(render_child(scene_meta))
        body.children.append(material)
        source.children.append(body)
    return source, metadata, assets


def inherited_index(root):
    result = {}
    def visit(node, inherited):
        value = dict(inherited)
        value.update({k: v for k, v in styles(node).items() if k in INHERITED})
        result[id(node)] = value
        for child in nodes(node):
            visit(child, value)
    visit(root, {})
    return result


def prune_unknown_year(node):
    kept = []
    for child in node.children:
        if isinstance(child, Node):
            value = text(child)
            if value in {'Уточнить', 'Уточнить Год', 'Год Уточнить'}:
                continue
            prune_unknown_year(child)
        kept.append(child)
    node.children = kept


def make_intro(source):
    intro = copy.deepcopy(source)
    clean_classes(intro)
    prune_unknown_year(intro)
    for item in intro.walk():
        value = styles(item)
        full_width = value.get('width') in {'319px', '100%'} or (
            value.get('display') == 'flex' and value.get('flex-direction') == 'column')
        for key in GEOMETRY:
            value.pop(key, None)
        if full_width:
            value['width'] = '100%'
        value.pop('white-space', None)
        value['min-width'] = '0'
        if ('font-family' in value and 'TikTok' in value['font-family']) or 'font-variation-settings' in value:
            value['font-family'] = '"TikTok Sans",sans-serif'
            value['font-weight'] = '300'
            value['font-variation-settings'] = '"opsz" 28,"wdth" 100'
        set_style(item, value)
    intro.tag = 'aside'
    intro.attrs['class'] = 'baev-case-intro'
    title = next((n for n in intro.walk() if 'Заголовок ·' in n.attrs.get('data-name', '') and text(n)), None)
    if title is None:
        title = next((n for n in intro.walk() if n.tag in {'p', 'h1', 'h2'} and text(n)), None)
    if title is None:
        raise ValueError('Missing native case title')
    if title.tag not in {'p', 'h1', 'h2'}:
        lines = [child for child in nodes(title) if child.tag == 'p']
        if lines:
            merged = []
            for index, line in enumerate(lines):
                line.tag = 'span'
                value = styles(line)
                value['display'] = 'block'
                set_style(line, value)
                merged.append(line)
            title.children = merged
    title.tag = 'h1'
    title.attrs['class'] = 'baev-case-title'
    description_names = {'текст · о проекте', 'описание · о проекте', 'о проекте', 'case descr', 'описание проекта'}
    description = next((n for n in intro.walk() if n.attrs.get('data-name', '').lower() in description_names), None)
    if description is None:
        description = next((n for n in intro.walk() if n.tag == 'p' and len(text(n)) > 65
                            and 'Услуги' not in n.attrs.get('data-name', '')), None)
        if description is not None:
            parent = next((n for n in intro.walk() if description in n.children), None)
            if parent is not None and parent.tag == 'div' and len(nodes(parent)) > 1 and all(n.tag == 'p' for n in nodes(parent)):
                description = parent
    if description is not None:
        description.attrs['class'] = 'baev-case-intro-copy'
    copy_text = text(description).replace('\u200b', '') if description is not None else ''
    return intro, text(title), re.sub(r'\s+', ' ', copy_text).strip()


def editorial_blocks(source, inherited):
    result = []
    def visit(node, cascade, column_width=None):
        current = dict(cascade)
        current.update({k: v for k, v in styles(node).items() if k in INHERITED})
        declared_width = styles(node).get('width', '')
        if re.fullmatch(r'[\d.]+px', declared_width):
            column_width = declared_width
        if node.tag in {'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote'}:
            child = copy.deepcopy(node)
            clean_classes(child)
            value = {**current, **styles(child)}
            source_width = value.get('width', '') or column_width or ''
            for key in GEOMETRY:
                value.pop(key, None)
            value.pop('white-space', None)
            value['min-width'] = '0'
            value['max-width'] = '100%'
            child.attrs['data-source-text-width'] = source_width
            if 'TikTok' in value.get('font-family', ''):
                value['font-family'] = '"TikTok Sans",sans-serif'
                value['font-weight'] = '300'
                value['font-variation-settings'] = '"opsz" 28,"wdth" 100'
            font = float(re.sub(r'[^\d.]', '', value.get('font-size', '17')) or 17)
            child.tag = 'h2' if font >= 28 else 'p'
            child.attrs['class'] = 'baev-case-caption-title' if font >= 28 else 'baev-case-caption-copy'
            set_style(child, value)
            result.append(child)
            return
        for child in nodes(node):
            visit(child, current, column_width)
    visit(source, inherited)
    return result


def make_caption(source, inherited, meta, geom):
    children = editorial_blocks(source, inherited)
    if not children:
        raise ValueError('Empty editorial node ' + meta.get('id'))
    heading_count = 0
    while heading_count < len(children) and children[heading_count].tag == 'h2':
        heading_count += 1
    if heading_count > 1:
        heading = children[0]
        lines = []
        for child in children[:heading_count]:
            line = element('span', {'style': 'display:block',
                                    'data-node-id': child.attrs.get('data-node-id', '')}, child.children)
            lines.append(line)
        heading.children = lines
        children = [heading] + children[heading_count:]
    paired = len(children) > 1 and children[0].tag == 'h2' and all(child.tag == 'p' for child in children[1:])
    if paired:
        children = [children[0], element('div', {'class': 'baev-case-caption-body'}, children[1:])]
    kind = 'pair' if paired else 'stack'
    align_end = not paired and any(styles(n).get('justify-content') in {'flex-end', 'end'} for n in source.walk())
    if align_end:
        width = children[0].attrs.get('data-source-text-width', '491px')
        body = element('div', {'class': 'baev-case-caption-body', 'style': 'width:' + width + ';max-width:100%'}, children)
        children = [body]
    wrapper = element('div', {'class': 'baev-case-caption baev-case-caption--' + kind +
                             (' baev-case-caption--end' if align_end else ''),
                             'data-node-id': meta.get('id'), 'data-name': meta.get('name', ''),
                             'style': '--source-caption-height:' + str(geom['height']) + 'px'}, children)
    if len(children) == 1:
        width = children[0].attrs.get('data-source-text-width')
        if width and re.fullmatch(r'[\d.]+px', width):
            children[0].attrs['style'] += ';width:' + width
    return wrapper


def is_editorial(meta, node):
    if any(n.tag in {'img', 'svg', 'video', 'canvas'} for n in node.walk()):
        return False
    name = (meta.get('name', '') + ' ' + node.attrs.get('data-name', '')).lower()
    # A caption about a palette is prose, while the palette/specimen artwork
    # itself stays proportional. Explicit editorial labels take precedence.
    if text(node) and re.search(r'(^|[·\s])(?:текст(?:овый|овая)?|подпись|caption)(?:$|[·\s])', name):
        return True
    if any(word in name for word in ['палитр', 'palette', 'типографика', 'typography']):
        return False
    return bool(text(node)) and (float(meta.get('height', 0)) <= 360 or 'текстов' in name)


def scale_art(node):
    for item in node.walk():
        value = styles(item)
        for key, val in value.items():
            if 'calc(' in val:
                # Figma exports percentage offsets such as calc(50%-0.24px).
                # Keep the binary operator separate before replacing the px
                # literal, and give CSS calc the whitespace it requires.
                val = re.sub(r'(?<=%)\s*([+-])\s*(?=[\d.])', r' \1 ', val)
            value[key] = PX.sub(lambda m: 'calc(100cqw * ' + m[1] + ' / var(--baev-art-base))', val)
        set_style(item, value)


def artwork_description(meta, slug, number, source):
    """Expose audited scene names without reading decorative layers separately.

    Avito and VK still use generic Figma layer names. Describe their known
    project context and position instead of inventing image-specific content.
    """
    name = re.sub(r'^\d+\s*[·.]\s*', '', meta.get('name', '').strip())
    if meta.get('id') == '166:1028':
        # The original archive has a still; supplemental author media can
        # restore its animation before scenes are decomposed. Name what ships.
        if any(node.tag == 'video' for node in source.walk()):
            return 'Анимация логотипа Serenity Aviation.'
        return 'Логотип Serenity Aviation, статичный векторный кадр.'
    if not re.search(r'[А-Яа-яЁё]', name):
        context = {
            'avito': 'Оформление конференции «Авито Авто: Высшая передача»',
            'vk': 'Визуальные материалы благотворительного проекта «СтримМур»',
        }.get(slug)
        if context is None:
            raise ValueError('Missing semantic artwork name: ' + meta.get('id', ''))
        return context + '. Иллюстрация ' + str(number) + '.'
    # The source labels retain capture/format notes that are not scene content.
    parts = [part.strip() for part in name.split('·')]
    notes = {'Стоп-кадр', 'Исходный постер', 'Статичный постер',
             'Полный кадр', 'SVG', 'Исходные SVG'}
    label = ', '.join(part for part in parts if part and part not in notes)
    return label.rstrip('.') + '.'


def make_art(source, width, height, full=False, *, description):
    art = copy.deepcopy(source)
    clean_classes(art)
    value = styles(art)
    for key in ['left', 'right', 'top', 'bottom', 'inset', 'margin', 'flex-shrink']:
        value.pop(key, None)
    value.update({'position': 'absolute', 'left': '0px', 'top': '0px',
                  'width': str(width) + 'px', 'height': str(height) + 'px'})
    set_style(art, value)
    scale_art(art)
    art.attrs['class'] = 'baev-case-art-canvas'
    # A named figure exposes the composition while retaining live text and
    # interactive video descendants; role="img" would flatten those controls.
    wrapper = element('figure', {'class': 'baev-case-art' + (' baev-case-art--full' if full else ''),
                                'aria-label': description,
                                'style': 'margin:0;--baev-art-base:' + str(width) + ';--baev-art-height:' + str(height) +
                                         ';aspect-ratio:' + str(width) + '/' + str(height)}, [art])
    return wrapper


def make_slider(source, meta, geom, description):
    children = nodes(source)
    if not children:
        raise ValueError('Empty video slider ' + meta.get('id'))
    slider = element('div', {'class': 'baev-case-slider', 'data-node-id': meta.get('id'),
                            'data-case-carousel': '',
                            'data-name': meta.get('name', ''), 'role': 'region', 'tabindex': '0',
                            'aria-label': description})
    declared = list(meta)
    for index, card in enumerate(children):
        cg = declared[index].attrib if index < len(declared) else {}
        width, height = float(cg.get('width', 842)), float(cg.get('height', 474))
        slide_description = description + ' Материал ' + str(index + 1) + ' из ' + str(len(children)) + '.'
        slide = element('div', {'class': 'baev-case-slide', 'data-slide-index': str(index)},
                        [make_art(card, width, height, description=slide_description)])
        slider.children.append(slide)
    return slider


def scene_nodes(metadata, source):
    by_id = {node.attrs.get('data-node-id'): node for node in source.walk()}
    _, _, intro_id, material_id = SPECS[next(k for k, v in SPECS.items() if v[0] == metadata.get('id'))]
    scenes = []
    if metadata.get('id') == '216:131':
        for group in metadata:
            if group.get('id') == '216:132':
                continue
            for item in group:
                if item.get('id') != intro_id:
                    scenes.append(item)
    else:
        material = next(n for n in metadata.iter() if n.get('id') == material_id)
        def append(node):
            if node.get('name', '').startswith('Раздел ·'):
                for child in node:
                    append(child)
            else:
                scenes.append(node)
        for node in material:
            append(node)
    for meta in scenes:
        if meta.get('id') not in by_id:
            raise ValueError('Missing converted scene ' + meta.get('id') + ' ' + meta.get('name', ''))
    return [(meta, by_id[meta.get('id')]) for meta in scenes], by_id


def background_specs(metadata, source, geometry):
    by_id = {node.attrs.get('data-node-id'): node for node in source.walk()}
    result = []
    for meta in metadata:
        candidate = by_id.get(meta.get('id'))
        if candidate is None:
            continue
        name = meta.get('name', '')
        if metadata.get('id') == '216:131' and meta.get('id') != '216:132':
            # Section paint becomes a live row background; artwork remains separate.
            paint = {k: v for k, v in styles(candidate).items() if k.startswith('background')}
            if paint:
                clone = element('div', {'data-node-id': meta.get('id'), 'data-name': name})
                set_style(clone, paint)
                result.append((geometry[meta.get('id')], clone))
        elif name.startswith('Фон'):
            # A page-height grouping frame has no paint of its own. Fragment
            # its layers separately: keeping their absolute page offsets inside
            # a row fragment mixes cqw and row-height scaling when text reflows.
            geometry_only = {'position', 'left', 'right', 'top', 'bottom',
                             'width', 'height', 'overflow'}
            layers = list(meta)
            if (layers and set(styles(candidate)) <= geometry_only and
                    all(layer.get('id') in by_id for layer in layers)):
                result.extend((geometry[layer.get('id')], by_id[layer.get('id')])
                              for layer in layers)
            else:
                result.append((geometry[meta.get('id')], candidate))
    return result


def is_solid_background(node):
    """Only uniform rectangles can be fragmented without changing their artwork."""
    value = styles(node)
    rectangular = {'background-color', 'position', 'left', 'right', 'top', 'bottom',
                   'inset', 'width', 'height', 'overflow'}
    return not node.children and 'background-color' in value and set(value) <= rectangular


def row_background_position(offset, gap, height):
    """Map source gap/content separately onto the live row's two height ranges."""
    if offset <= 0:
        return '0px'
    if offset >= height:
        return '100%'
    if offset <= gap:
        return f'calc(var(--baev-row-gap,0px) * {offset / gap:.12g})'
    fraction = (offset - gap) / (height - gap)
    return (f'calc({fraction * 100:.12g}% + '
            f'var(--baev-row-gap,0px) * {1 - fraction:.12g})')


def row_backgrounds(backgrounds, y, height, gap=0.0):
    layers = []
    for geom, source in backgrounds:
        top, bottom = geom['pageY'], geom['pageY'] + geom['height']
        if bottom <= y + 0.01 or top >= y + height - 0.01:
            continue
        clone = copy.deepcopy(source)
        clean_classes(clone)
        scale_art(clone)
        value = styles(clone)
        for key in ['right', 'bottom', 'inset']:
            value.pop(key, None)
        value.update({'position': 'absolute', 'left': str(geom['pageX'] / 16) + '%',
                      'top': str((top-y) / height * 100) + '%',
                      'width': str(geom['width'] / 16) + '%',
                      'height': str(geom['height'] / height * 100) + '%'})
        if (0 < gap < height and is_solid_background(source) and
                (y < top < y + height or y < bottom < y + height)):
            # Native copy can grow independently of the leading padding. A
            # boundary inside that padding must not move into the text. Clip
            # uniform paint to this row, then map each endpoint piecewise.
            value['top'] = row_background_position(top - y, gap, height)
            end = row_background_position(bottom - y, gap, height)
            value['bottom'] = '0px' if end == '100%' else f'calc(100% - {end})'
            value.pop('height', None)
            clone.attrs['data-background-mapping'] = 'gap-content'
        set_style(clone, value)
        clone.attrs['data-background-fragment'] = 'true'
        layers.append(clone)
    return element('div', {'class': 'baev-case-background', 'aria-hidden': 'true',
                           'style': '--baev-art-base:1600'}, layers)


def collect_media(root, assets):
    result = []
    def visit(node, trail):
        current = trail + [{'nodeId': node.attrs.get('data-node-id'), 'name': node.attrs.get('data-name', '')}]
        if node.tag in {'img', 'video'}:
            named = [item for item in current if item['nodeId']]
            media_names = [item for item in named if re.search(r'видео|video|kinescope|lottie', item['name'], re.I)]
            if media_names:
                joined = ' '.join(item['name'] for item in media_names)
                result.append({'tag': node.tag, 'slotNodeId': named[-1]['nodeId'] if named else None,
                               'assetVariable': node.attrs.get('data-figma-asset'),
                               'source': node.attrs.get('src'), 'poster': node.attrs.get('poster'),
                               'candidateAncestors': media_names,
                               'videoFilenames': re.findall(r'[^\s·]+\.(?:mp4|webm|mov|m4v)', joined, re.I),
                               'embeddedMediaURLs': re.findall(r'https://kinescope\.io/[^\s]+', joined),
                               'videoURLVerified': node.tag == 'video'})
        for child in nodes(node):
            visit(child, current)
    visit(root, [])
    return result


def prepare_case(slug, asset_urls=None, node_hook=None, source_root=None):
    asset_urls = asset_urls or {}
    source, metadata, assets = load_source(slug, asset_urls, source_root=source_root)
    for node in source.walk():
        value = styles(node)
        if 'TikTok Sans 28pt' in value.get('font-family', ''):
            value['font-family'] = '"TikTok Sans",sans-serif'
            value['font-weight'] = '300'
            value['font-variation-settings'] = '"opsz" 28,"wdth" 100'
            set_style(node, value)
    if node_hook:
        node_hook(slug, source)
    geometry = geometry_index(metadata)
    scenes, by_id = scene_nodes(metadata, source)
    inherited = inherited_index(source)
    intro, title, description = make_intro(by_id[SPECS[slug][2]])
    if slug == 'askona':
        # The supplied passport retained a light-theme color over the dark
        # #08111b hero. Keep its structure and make the native text readable.
        for item in intro.walk():
            value = styles(item)
            if value.get('color') == '#191b1d': value['color'] = '#fff'
            if value.get('background-color') == 'rgba(25,27,29,0.06)':
                value['background-color'] = 'rgba(255,255,255,0.06)'
            set_style(item, value)
    root_style = {k: v for k, v in styles(source).items() if k.startswith('background') or k in INHERITED}
    backgrounds = background_specs(metadata, source, geometry)
    opening_background = root_style.get('background-color', '#fff')
    for geom, layer in backgrounds:
        color = styles(layer).get('background-color')
        if color and geom['pageX'] <= 0 and geom['pageY'] <= 0 and geom['width'] >= 1600 and geom['pageY'] + geom['height'] > 111:
            opening_background = color
    root_style.update({'--case-source-width': '1600', 'padding-top': '111px',
                       '--case-opening-bg': opening_background,
                       'font-family': '"TikTok Sans",sans-serif', 'font-weight': '300',
                       'font-variation-settings': '"opsz" 28,"wdth" 100'})
    main = element('main', {'class': 'baev-case', 'data-figma-static': 'baev-native-case',
                           'data-case-key': slug, 'data-node-id': metadata.get('id'),
                           'data-case-opening-background': opening_background,
                           'data-case-description': description, 'data-case-cover': ''})
    set_style(main, root_style)
    previous_end = 111.0
    records = []
    artwork_number = 0
    for index, (meta, node) in enumerate(scenes):
        geom = geometry[meta.get('id')]
        gap = max(0.0, geom['pageY'] - previous_end)
        band_y = geom['pageY'] - gap
        band_height = max(1.0, gap + geom['height'])
        slider = node.attrs.get('data-name', '').lower() == 'videoslider' or meta.get('id') in {'182:133', '182:139', '182:148', '182:156'}
        editorial = not slider and is_editorial(meta, node)
        full = not editorial and not slider and geom['width'] >= 1599
        kind = 'slider' if slider else 'editorial' if editorial else 'art'
        row = element('section', {'class': 'baev-case-row' + (' baev-case-row--hero' if index == 0 else '') +
                                 (' baev-case-row--full' if full else ''),
                                 'data-scene-node-id': meta.get('id'), 'data-scene-kind': kind,
                                 'style': '--source-gap:' + str(gap) + 'px'})
        row.children.append(row_backgrounds(backgrounds, band_y, band_height, gap=gap))
        if index == 0:
            row.children.append(intro)
        if editorial:
            content = make_caption(node, inherited[id(node)], meta, geom)
        else:
            artwork_number += 1
            scene_description = artwork_description(meta, slug, artwork_number, node)
            content = (make_slider(node, meta, geom, scene_description) if slider else
                       make_art(node, geom['width'], geom['height'], full, description=scene_description))
        content.attrs['data-case-scene'] = meta.get('id')
        row.children.append(content)
        main.children.append(row)
        records.append({'nodeId': meta.get('id'), 'name': meta.get('name'), 'kind': kind,
                        'sourceGeometry': geom, 'precedingGap': gap,
                        'text': text(node) if editorial else None,
                        'childIds': [c.get('id') for c in meta],
                        'carouselCards': len(nodes(content)) if slider else None})
        if index == 0:
            cover = next((n.attrs.get('poster') or n.attrs.get('src') for n in content.walk()
                          if n.tag in {'img', 'video'} and not (n.attrs.get('src') or '').endswith('.svg')), '')
            main.attrs['data-case-cover'] = cover or ''
        previous_end = geom['pageY'] + geom['height']
    bottom = max(0.0, float(metadata.get('height')) - previous_end)
    if bottom:
        tail = element('div', {'class': 'baev-case-tail', 'style': '--source-tail:' + str(bottom) + 'px'})
        tail.children.append(row_backgrounds(backgrounds, previous_end, bottom))
        main.children.append(tail)
    manifest = {'slug': slug, 'nodeId': metadata.get('id'), 'title': title, 'description': description,
                'cover': main.attrs['data-case-cover'], 'needsCatalogCover': not bool(main.attrs['data-case-cover']),
                'sourceCanvas': {'width': 1600, 'height': float(metadata.get('height'))},
                'scenes': records, 'assets': assets, 'mediaCandidates': collect_media(source, assets),
                'unknownYearHidden': any('Уточнить' in n.get('name', '') for n in metadata.iter()),
                'sourceDesktopOnly': True, 'nativeIntroSelector': '.baev-case-intro',
                'nativeCaptionSelector': '.baev-case-caption', 'sourceBackgroundLayers': len(backgrounds)}
    return main, manifest


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--asset-map', type=Path, default=ROOT / 'case-asset-map.json')
    parser.add_argument('--out', type=Path, default=ROOT / 'generated-cases')
    parser.add_argument('--source-root', type=Path, default=ROOT,
                        help='Private capture directory containing XML and the two context directories')
    parser.add_argument('--cases', nargs='*', choices=SPECS, default=list(SPECS))
    args = parser.parse_args()
    mapping = json.loads(args.asset_map.read_text()) if args.asset_map.exists() else {}
    args.out.mkdir(parents=True, exist_ok=True)
    manifests = []
    for slug in args.cases:
        node, record = prepare_case(slug, mapping, source_root=args.source_root)
        filename = args.out / (slug + '.html')
        filename.write_text(node.render() + '\n')
        record['file'] = str(filename)
        manifests.append(record)
    (args.out / 'manifest.json').write_text(json.dumps({'cases': manifests}, ensure_ascii=False, indent=2) + '\n')
    (args.out / 'figma-base.css').write_text(BASE_CSS + '\n')
    print(json.dumps({'cases': len(manifests), 'out': str(args.out),
                      'sceneCounts': {m['slug']: len(m['scenes']) for m in manifests},
                      'unmappedAssets': sorted({url for m in manifests for url in m['assets'].values() if url not in mapping})}, ensure_ascii=False))


if __name__ == '__main__':
    main()
