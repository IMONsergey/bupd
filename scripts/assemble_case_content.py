#!/usr/bin/env python3
"""Prepare portable case HTML from captured Figma context and verified author media.

This optional preparation step uses private source captures. The normal site build
only reads content/cases/*.html and never needs Figma, JSX, or an external service.
"""
import argparse, hashlib, html, json
from pathlib import Path
from build_static import Node, props
from case_media import make_hook
import prepare_cases

def credits_section(people):
    if not people:return None
    section=Node('section',{'class':'baev-case-credits','aria-label':'Команда проекта'})
    title=Node('h2');title.children=['Команда проекта']
    listing=Node('ul')
    for person in people:
        item=Node('li');link=Node('a',{'href':person['profile_url'],'target':'_blank','rel':'noopener noreferrer'})
        link.children=[html.escape(person['name'])];item.children=[link];listing.children.append(item)
    section.children=[title,listing]
    return section

def add_vk_players(main):
    """Keep the Figma art intact; add the two author players in their story order.

    These are documentary/promo clips, not animations of the static 3D cat cover.
    The ordinary links work without JavaScript. A player loads only after a click.
    """
    players = [
        ('197:156','https://vkvideo.ru/video_ext.php?oid=-214150675&id=456239841&hd=2',
         'СтримМур: видео о проекте · 1 минута'),
        ('197:159','https://vkvideo.ru/video_ext.php?oid=-214150675&id=456239831&hd=2',
         'Видеоматериалы СтримМур'),
    ]
    for after,url,label in players:
        row=Node('section',{'class':'baev-case-row baev-case-video-row','data-case-external-video':'vk',
                            'style':'--source-gap:32px;color:#fff'})
        box=Node('div',{'class':'baev-case-embed-box'})
        play=Node('a',{'class':'baev-case-embed-link','data-case-embed':url,'href':url,
                       'aria-label':'Смотреть: '+label,'target':'_blank','rel':'noopener noreferrer'})
        play.children=[html.escape(label)]
        origin=Node('a',{'class':'baev-case-embed-source','href':url,'target':'_blank','rel':'noopener noreferrer'})
        origin.children=['Открыть в VK Видео']
        box.children=[play,origin];row.children=[box]
        index=next(i for i,n in enumerate(main.children) if isinstance(n,Node) and n.attrs.get('data-scene-node-id')==after)
        main.children.insert(index+1,row)

def prune_opaque_fills(main, approved_paths):
    """Remove obsolete fills fully covered by an audited opaque final image.

    Several Figma rectangles retain images from older versions underneath their
    final fill. Keeping these hidden images causes wrong-image flashes while
    lazily decoding. The QA pipeline verifies the top assets' alpha channel.
    """
    removed = 0
    for parent in list(main.walk()):
        children = [n for n in parent.children if isinstance(n, Node)]
        if len(children) < 2: continue
        last = children[-1]
        value = props(last.attrs.get('style', ''))
        asset = last.attrs.get('poster') or last.attrs.get('src')
        if last.tag not in {'img', 'video'} or asset not in approved_paths: continue
        if not (value.get('width') == value.get('height') == '100%' and value.get('object-fit') == 'cover'): continue
        if not all(n.tag in {'div','img','video'} for n in children): continue
        obsolete = [n for n in children[:-1] if any(c.tag in {'img','video'} for c in n.walk())]
        removed += sum(sum(c.tag in {'img','video'} for c in n.walk()) for n in obsolete)
        parent.children = [n for n in parent.children if n not in obsolete]
    return removed

def add_cropped_video_controls(main):
    """Keep the VRT crop while putting its playback controls outside the mask."""
    video=next(n for n in main.walk() if n.tag=='video' and n.attrs.get('data-case-video-slot')=='166:3666')
    video_id='case-video-vrt-social'
    video.attrs['id']=video_id
    video.attrs['data-case-cropped-video']='true'
    row=next(n for n in main.children if isinstance(n,Node) and video in list(n.walk()))
    controls=Node('div',{'class':'baev-video-controls','role':'group','aria-label':'Управление видео VRT World'})
    button=Node('button',{'type':'button','hidden':None,'data-case-video-toggle':video_id,'aria-controls':video_id})
    button.children=['Воспроизвести']
    link=Node('a',{'href':video.attrs['src'],'target':'_blank','rel':'noopener noreferrer'})
    link.children=['Открыть видео целиком']
    controls.children=[button,link]
    row.children.append(controls)

def apply_text_outlines(main, key, outlines, repo):
    """Keep small artwork labels exact without shipping unavailable font files.

    The SVGs are genuine Figma text-node exports with outlined glyphs. Article
    headings/captions stay live HTML; each artwork label retains accessible text.
    """
    applied = []
    for item in (entry for entry in outlines if entry['case'] == key):
        matches = [node for node in main.walk() if node.attrs.get('data-node-id') == item['nodeId']]
        if len(matches) != 1:
            raise ValueError('Expected one artwork label: ' + item['nodeId'])
        node = matches[0]
        if prepare_cases.text(node) != ' '.join(item['text'].split()):
            raise ValueError('Artwork label text changed: ' + item['nodeId'])
        if not item['src'].startswith('/assets/cases/text-outlines/'):
            raise ValueError('Unexpected artwork outline path')
        asset = repo / item['src'].lstrip('/')
        raw = asset.read_bytes()
        if hashlib.sha256(raw).hexdigest() != item['svgSha256']:
            raise ValueError('Artwork outline hash mismatch: ' + item['nodeId'])
        if b'<text' in raw or b'<script' in raw:
            raise ValueError('Artwork export must contain outlined glyphs only')
        style = props(node.attrs.get('style', ''))
        for name in prepare_cases.INHERITED:
            style.pop(name, None)
        scale = lambda number: 'calc(100cqw * ' + str(number) + ' / var(--baev-art-base))'
        style.update({'width': scale(item['width']), 'height': scale(item['height']),
                      'font-size': '0', 'line-height': '0'})
        node.tag = 'div'
        node.attrs['style'] = ';'.join(name + ':' + value for name, value in style.items())
        node.attrs['data-case-text-outline'] = item['nodeId']
        image = Node('img', {'src': item['src'], 'alt': item['text'],
                            'width': str(item['exportWidth']), 'height': str(item['exportHeight']),
                            'style': 'display:block;max-width:none;width:' + scale(item['exportWidth']) + ';height:auto',
                            'data-outline-source': item['nodeId']})
        node.children = [image]
        applied.append(item['nodeId'])
    return applied

def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--source',type=Path,required=True)
    p.add_argument('--output',type=Path,required=True)
    p.add_argument('--credits',type=Path,required=True)
    a=p.parse_args()
    source=a.source.resolve();output=a.output.resolve()
    asset_map=json.loads((source/'case-asset-map.json').read_text())
    catalog=json.loads((output/'catalog.json').read_text())
    case_settings={item['key']:item for item in catalog['cases']}
    approved_fills=set(json.loads((output/'opaque-fills.json').read_text())['opaqueAssets'])
    credits={item['case']:item['credits'] for item in json.loads(a.credits.read_text())['cases']}
    hook=make_hook(source/'case-video-map.json', source/'case-asset-keys.json', output/'supplemental-media.json')
    output.mkdir(parents=True,exist_ok=True)
    outline_file = output/'text-outlines.json'
    outlines = json.loads(outline_file.read_text())['outlines'] if outline_file.exists() else []
    manifests=[]
    for key in prepare_cases.SPECS:
        node,record=prepare_cases.prepare_case(key,asset_map,node_hook=hook,source_root=source)
        record['removedOccludedImages']=prune_opaque_fills(node, approved_fills)
        record['outlinedArtworkLabels']=apply_text_outlines(node, key, outlines, output.parent.parent)
        # The Figma title component still has an unfinished name. The full title
        # is confirmed in the existing BAEV project and author portfolio.
        if key=='avito':
            title=next(n for n in node.walk() if n.tag=='h1')
            title.children=[html.escape(case_settings[key]['title'])]
            record['title']=case_settings[key]['title']
        if key=='vk':
            add_vk_players(node)
            record['onDemandExternalPlayers']=2
        if key=='vrt':
            add_cropped_video_controls(node)
            record['externalNativeVideoControls']=1
        people=credits.get(key,[])
        credit=credits_section(people)
        if credit:node.children.append(credit)
        for n in node.walk():
            if n.tag=='img':
                n.attrs.setdefault('loading','lazy')
                n.attrs.setdefault('decoding','async')
        first_image=next((n for n in node.walk() if n.tag=='img'),None)
        if first_image:
            first_image.attrs['loading']='eager'
            first_image.attrs['fetchpriority']='high'
        content=node.render()+'\n'
        if 'https://www.figma.com/api/mcp/asset/' in content:
            raise SystemExit('Temporary Figma asset URL remains in '+key)
        (output/(key+'.html')).write_text(content)
        manifests.append({k:v for k,v in record.items() if k not in {'assets','mediaCandidates','file'}})
    # This provenance contains stable local paths and design node IDs, never download tokens.
    (output/'scenes.json').write_text(json.dumps({'cases':manifests,'videos':hook.changes},ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({'cases':len(manifests),'nativeVideoSlots':len(hook.changes),
                      'output':str(output)},ensure_ascii=False))

if __name__=='__main__':main()
