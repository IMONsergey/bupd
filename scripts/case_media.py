"""Attach verified author videos to the corresponding Figma poster slots.

The scene geometry and every overlay stay in the design tree. This module changes
only the identified poster image into a local, accessible native media element.
"""
import html, json, re
from pathlib import Path
from build_static import Node, props

DIRECT_SLOTS = {
    'orla': ['216:179','216:197','216:211','216:228','216:235','216:258','216:266','216:289'],
    'gm8': ['166:12','166:72','166:128','166:208','166:232','166:254','166:273','166:298','166:319'],
    'rocket': ['170:41','170:48','170:51','170:52','170:58','170:63','170:66'],
    'vrt': ['166:3666'],
}

def style(node, values=None, remove=()):
    current=props(node.attrs.get('style',''))
    for key in remove: current.pop(key,None)
    current.update(values or {})
    node.attrs['style']=';'.join(k+':'+v for k,v in current.items())

def find_path(root, target):
    if root is target: return [root]
    for child in root.children:
        if isinstance(child,Node):
            tail=find_path(child,target)
            if tail:return [root]+tail
    return None

def replace_poster(root, slot_id, video, poster_url=None):
    slots=[n for n in root.walk() if n.attrs.get('data-node-id')==slot_id]
    if len(slots)!=1:raise ValueError(f'{slot_id}: expected one video slot, found {len(slots)}')
    slot=slots[0]
    images=[n for n in slot.walk() if n.tag=='img' and (not poster_url or n.attrs.get('src')==poster_url)]
    if not images:raise ValueError(f'{slot_id}: no matching poster image')
    poster=images[-1]
    path=find_path(root,poster)
    for ancestor in path:
        ancestor.attrs.pop('aria-hidden',None)
        if 'pointer-events' in props(ancestor.attrs.get('style','')):
            style(ancestor,{'pointer-events':'auto'})
    src=video['local']
    if not src.startswith('/assets/') or not src.endswith('.mp4'):
        raise ValueError('Native case video must be a localized MP4')
    label=video.get('label') or video.get('figma_name') or slot.attrs.get('data-name','Видео проекта')
    label=re.sub(r'^\d+\s*[·.]\s*','',label)
    label=re.sub(r'\s*·?\s*(Стоп-кадр|Статичный постер|Исходный постер).*','',label,flags=re.I)
    poster.tag='video'
    poster.attrs.update({'src':src,'poster':poster.attrs['src'],'preload':'none','controls':None,
                         'muted':None,'playsinline':None,'loop':None,'data-case-video':'loop',
                         'data-case-video-slot':slot_id,'aria-label':label,'tabindex':'0'})
    poster.attrs.pop('alt',None)
    poster.attrs.pop('loading',None)
    poster.attrs.pop('decoding',None)
    style(poster,{'pointer-events':'auto'})
    poster.children=[html.escape('Ваш браузер не поддерживает видео. '),Node('a',{'href':src})]
    poster.children[-1].children=['Открыть видео']
    return poster.attrs['poster']

def make_hook(mapping_file, asset_keys_file=None, supplemental_file=None):
    mapping=json.loads(Path(mapping_file).read_text())
    if supplemental_file and Path(supplemental_file).is_file():
        extra=json.loads(Path(supplemental_file).read_text())
        for case, rows in extra.items():
            existing={row.get('figma_node_id') for row in mapping.get(case,[]) if row.get('figma_node_id')}
            if any(row.get('figma_node_id') in existing for row in rows):
                raise ValueError('Duplicate supplemental media slot in '+case)
            mapping.setdefault(case,[]).extend(rows)
    asset_keys=json.loads(Path(asset_keys_file).read_text()) if asset_keys_file else {}
    changes=[]
    def hook(case, root):
        rows=mapping.get(case,[])
        direct=[r for r in rows if r.get('kind')=='video' and not r.get('figma_node_id')]
        slots=DIRECT_SLOTS.get(case,[])
        if direct and len(direct)!=len(slots):
            raise ValueError(f'{case}: {len(direct)} source videos but {len(slots)} mapped slots')
        for i,row in enumerate(rows):
            slot=row.get('figma_node_id')
            if not slot:
                if row not in direct:continue
                slot=slots[direct.index(row)]
            poster=asset_keys.get(case,{}).get(row.get('figma_poster_key'))
            actual_poster=replace_poster(root,slot,row,poster)
            changes.append({'case':case,'node':slot,'path':row['local'],'poster':actual_poster,
                            'basis':row.get('mapping_status','source_order_and_design_slot')})
        return root
    hook.changes=changes
    return hook
