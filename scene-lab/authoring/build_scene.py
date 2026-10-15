"""BAEV / First Light. Editable authored venue, cameras and a web export.
Run with Blender 4.5 LTS --background --factory-startup --python this_file -- [--render].
All geometry and art in this set are original. No downloaded executables or addons.
"""
import bpy, math, json, sys, random
from pathlib import Path
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'authoring' / 'cache'
OUT.mkdir(parents=True, exist_ok=True)
REPORTS = ROOT / 'reports'
REPORTS.mkdir(exist_ok=True)
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
scene = bpy.context.scene
scene.unit_settings.system = 'METRIC'
scene.render.engine = 'CYCLES'
scene.cycles.device = 'CPU'
scene.cycles.samples = 24
scene.cycles.use_denoising = True
scene.cycles.max_bounces = 5
scene.cycles.diffuse_bounces = 3
scene.cycles.glossy_bounces = 3
scene.render.threads_mode = 'FIXED'
scene.render.threads = 4
scene.render.resolution_x = 1200
scene.render.resolution_y = 750
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = 'PNG'
scene.render.film_transparent = False
scene.view_settings.view_transform = 'AgX'
scene.view_settings.look = 'AgX - Medium High Contrast'
scene.view_settings.exposure = 0.55
scene.world.use_nodes = True
scene.world.node_tree.nodes['Background'].inputs[0].default_value = (0.045,0.055,0.08,1)
scene.world.node_tree.nodes['Background'].inputs[1].default_value = .16

collections = {}
for name in ['Architecture','Stage','Seating','Lighting','Screens','Cameras']:
 c=bpy.data.collections.new(name); scene.collection.children.link(c); collections[name]=c

def link(obj, collection):
 for c in list(obj.users_collection): c.objects.unlink(obj)
 collections[collection].objects.link(obj)
 return obj

def rgb(h):
 values=[int(h[i:i+2],16)/255 for i in (1,3,5)]
 return tuple(v/12.92 if v<.04045 else ((v+.055)/1.055)**2.4 for v in values)

def mat(name, color, rough=.6, metal=0, emission=0):
 m=bpy.data.materials.new(name); m.diffuse_color=(*rgb(color),1); m.use_nodes=True
 s=m.node_tree.nodes.get('Principled BSDF'); s.inputs['Base Color'].default_value=(*rgb(color),1)
 s.inputs['Roughness'].default_value=rough; s.inputs['Metallic'].default_value=metal
 if emission:
  s.inputs['Emission Color'].default_value=(*rgb(color),1); s.inputs['Emission Strength'].default_value=emission
 return m

velvet=mat('Velvet / charcoal','#393b40',.98)
metal=mat('Powdercoat / black','#25282c',.48,.38)
trim=mat('Satin bronze','#9d8570',.3,.78)
plaster=mat('Acoustic graphite','#33373d',.82)
concrete=mat('Polished concrete','#41434a',.39,.12)
wood=mat('Smoked oak','#4f4039',.62)
black=mat('Screen type','#111419',.85)
cream=mat('Screen / warm white','#eee7dd',.85,0,1.65)
line=mat('Practical / warm','#ffe2b8',.35,0,4)
cool=mat('Practical / ice','#cbdfff',.3,0,3)

# A tiny packed textile roughness map, shared across every chair; no per-chair textures.
import numpy as np
n=256; yy,xx=np.mgrid[0:n,0:n]
a=.80+.12*((xx%4==0)|(yy%4==0)).astype(float)
pixels=np.ones((n,n,4),dtype=np.float32); pixels[:,:,:3]=a[:,:,None]
im=bpy.data.images.new('Textile roughness 256',width=n,height=n); im.colorspace_settings.name='Non-Color'; im.pixels.foreach_set(pixels.ravel()); im.pack()
t=velvet.node_tree.nodes.new('ShaderNodeTexImage'); t.image=im
velvet.node_tree.links.new(t.outputs['Color'],velvet.node_tree.nodes['Principled BSDF'].inputs['Roughness'])

def box(name, location, size, material, bevel=0, collection='Architecture'):
 bpy.ops.mesh.primitive_cube_add(size=1,location=location); o=bpy.context.object; o.name=name
 o.dimensions=size; bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 o.data.materials.append(material)
 if bevel:
  b=o.modifiers.new('Edge radius','BEVEL'); b.width=bevel; b.segments=3
  bpy.context.view_layer.objects.active=o; bpy.ops.object.modifier_apply(modifier=b.name)
  for p in o.data.polygons: p.use_smooth=True
  m=o.modifiers.new('Weighted normals','WEIGHTED_NORMAL'); m.keep_sharp=True
  bpy.ops.object.modifier_apply(modifier=m.name)
 return link(o,collection)

def rod(name,a,b,r,material,collection='Architecture',segments=8):
 a,b=Vector(a),Vector(b); d=b-a
 bpy.ops.mesh.primitive_cylinder_add(vertices=segments,radius=r,depth=d.length,location=(a+b)/2)
 o=bpy.context.object; o.name=name; o.rotation_euler=d.to_track_quat('Z','Y').to_euler(); o.data.materials.append(material)
 for p in o.data.polygons:p.use_smooth=True
 return link(o,collection)

def text(name,body,loc,size,material,align='LEFT'):
 curve=bpy.data.curves.new(name,'FONT'); curve.body=body; curve.size=size; curve.align_x=align
 curve.extrude=.0005; curve.resolution_u=6
 o=bpy.data.objects.new(name,curve); collections['Screens'].objects.link(o); o.location=loc; o.rotation_euler=(math.pi/2,0,0); o.data.materials.append(material)
 return o

def area(name,pos,target,energy,color,size,size_y=None):
 data=bpy.data.lights.new(name,'AREA'); data.energy=energy; data.color=rgb(color); data.shape='RECTANGLE'; data.size=size; data.size_y=size_y or size
 o=bpy.data.objects.new(name,data); collections['Lighting'].objects.link(o); o.location=pos; o.rotation_euler=(Vector(target)-o.location).to_track_quat('-Z','Y').to_euler(); return o

def spot(name,pos,target,energy,color,angle=.65):
 data=bpy.data.lights.new(name,'SPOT'); data.energy=energy; data.color=rgb(color); data.spot_size=angle; data.spot_blend=.6; data.shadow_soft_size=.2
 o=bpy.data.objects.new(name,data); collections['Lighting'].objects.link(o); o.location=pos; o.rotation_euler=(Vector(target)-o.location).to_track_quat('-Z','Y').to_euler(); return o

def camera(name,pos,target,lens=36):
 data=bpy.data.cameras.new(name); data.lens=lens; data.sensor_width=36; data.clip_end=120
 o=bpy.data.objects.new(name,data); collections['Cameras'].objects.link(o); o.location=pos; o.rotation_euler=(Vector(target)-o.location).to_track_quat('-Z','Y').to_euler()
 data.dof.use_dof=False
 return o

bpy.ops.mesh.primitive_plane_add(size=2,location=(0,-2,0))
floor=bpy.context.object;floor.name='Floor';floor.scale=(16.5,26.5,1)
bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
floor.data.materials.append(concrete.copy());link(floor,'Architecture')
box('Aisle carpet',(0,-8,.012),(3.1,30,.016),velvet)
# Recessed architectural envelope. Ceiling stays dark; light has visible sources.
box('Rear wall',(0,-27,5.5),(33,.35,11),plaster)
for side in [-1,1]:
 box('Sidewall',(side*16.5,-2,5.5),(.35,53,11),plaster)
 for y in np.arange(-23,20,1.6):
  box('Acoustic rib',(side*16.18,float(y),5.1),(.18,.11,9.4),wood,.018)
 for y in [-19,-6,7]:
  box('Wall inset',(side*16.0,y,4.2),(.1,1.7,6.7),metal,.02)
  box('Wall sconce',(side*15.92,y-.82,4.2),(.025,.025,5.8),line,collection='Lighting')
box('Dark ceiling',(0,-2,11.4),(33,53,.3),metal)
for x in np.arange(-15,16,1.5):
 box('Suspended acoustic fin',(float(x),-4,10.5),(.075,43,.85),plaster,.02)
# Asymmetric stage canopy and slim, precise reveals. No decorative random 3D.
box('Stage plinth',(0,14,.46),(27,10,.92),metal,.07,'Stage')
box('Stage top',(0,14,.95),(27,10,.08),concrete,.025,'Stage')
box('Stage edge practical',(0,8.98,.81),(26.4,.035,.025),line,collection='Lighting')
for i in range(4):
 box('Side step',(-10.8,7.4+i*.47,.12+i*.225),(3.1,.56,.24),metal,.025,'Stage')
# One sweeping, manufactured wing made from a continuous bent surface.
verts=[]; faces=[]
for i in range(49):
 u=i/48; ang=-.45+u*1.18; x=4.0+12.6*math.cos(ang); y=12+7.0*math.sin(ang)
 verts.extend([(x,y,1.0),(x,y,10.45-u*.95)])
 if i<48: j=i*2; faces.append((j,j+1,j+3,j+2))
mesh=bpy.data.meshes.new('Bent wing mesh');mesh.from_pydata(verts,[],faces);mesh.update()
wing=bpy.data.objects.new('Sculpted right wing',mesh);collections['Stage'].objects.link(wing);wing.data.materials.append(metal)
solid=wing.modifiers.new('Fold thickness','SOLIDIFY');solid.thickness=.14
bpy.context.view_layer.objects.active=wing;bpy.ops.object.modifier_apply(modifier=solid.name)
for p in wing.data.polygons:p.use_smooth=True
# Overhead canopy, offset to leave the central screen as the focal point.
canopy=box('Floating canopy',(-.6,14.0,10.2),(28,7.6,.28),metal,.06,'Stage');canopy.rotation_euler[1]=-.027
box('Canopy luminous reveal',(-.6,10.18,10.1),(27.7,.045,.045),line,collection='Lighting')
# Main LED wall. Original graphic is vector text, never a photograph of a conference.
box('LED chassis',(-1.3,18.25,5.6),(20.8,.22,8.4),metal,.04,'Screens')
screen=box('LED face',(-1.3,18.10,5.6),(20.55,.015,8.12),cream,collection='Screens')
text('Keynote wordmark','BAEV',(-10.4,18.079,3.8),5.65,black)
text('Keynote signature','PUBLIC COMMUNICATION',(-10.05,18.069,8.80),.255,black)
text('Keynote line','THE SHAPE OF AN IDEA.',(-10.05,18.069,2.06),.28,black)
text('Keynote index','01 / OPENING',(8.0,18.069,2.06),.22,black,'RIGHT')
box('Graphic rule',(-1.3,18.065,8.45),(18.35,.009,.013),black,collection='Screens')
# A dark freestanding side blade, physically plausible, not another giant screen.
blade=box('Left wing blade',(-13,15.3,5.6),(2.2,.26,9.2),metal,.03,'Stage');blade.rotation_euler[2]=-.20
box('Left wing light',(-12.0,15.05,5.7),(.025,.035,8.5),cool,collection='Lighting')
# Presenter lectern, confidence monitor, flight-ready visible details.
box('Lectern pillar',(5.8,12.5,1.65),(.42,.48,1.30),metal,.035,'Stage')
desk=box('Lectern top',(5.8,12.5,2.32),(1.04,.75,.055),trim,.025,'Stage');desk.rotation_euler[0]=-.13
rod('Microphone',(6.02,12.5,2.34),(6.02,12.50,2.79),.012,metal,'Stage',10)
rod('Microphone neck',(6.02,12.50,2.79),(5.83,12.23,2.85),.012,metal,'Stage',10)
monitor=box('Confidence monitor',(0,10,1.2),(2.7,.22,1.42),metal,.035,'Stage');monitor.rotation_euler[0]=-.42
# Four reusable components form a padded shell chair. Linked meshes survive glTF export.
seat=box('Seat prototype',(0,0,.53),(.75,.78,.16),velvet,.075,'Seating')
back=box('Back prototype',(0,-.36,1.10),(.77,.17,.93),velvet,.075,'Seating');back.rotation_euler[0]=-.13
base=box('Seat support',(0,0,.28),(.055,.52,.56),metal,.02,'Seating')
arm=box('Arm prototype',(.46,0,.84),(.095,.62,.075),trim,.024,'Seating')
parts=[seat,back,base,arm]
for p in parts:p.hide_render=True;p.hide_viewport=True
# Keep the opening frame architectural; no uncanny crowd of spheres.
random.seed(13)
for row in range(11):
 y=5.2-row*1.80
 for side in [-1,1]:
  for col in range(8):
   x=side*(2.0+col*1.13); rot=-side*.025
   for p in parts:
    offsets=[Vector((0,0,0))]
    if p==arm: offsets.append(Vector((-.92,0,0)))
    for offset in offsets:
     o=p.copy();o.data=p.data;collections['Seating'].objects.link(o);o.hide_render=False;o.hide_viewport=False
     local=p.location+offset; o.location=(x+local.x,y+local.y,local.z);o.rotation_euler=p.rotation_euler.copy();o.rotation_euler[2]+=rot
     o.name='Chair_%02d_%s_%02d_%s'%(row,'L' if side<0 else 'R',col,p.name)
for p in parts:bpy.data.objects.remove(p,do_unlink=True)
# Practical luminaires + understated truss above the visible stage.
for x in [-10,-5,0,5,10]:
 box('Luminaire housing',(x,10.4,9.4),(.40,.48,.48),metal,.04,'Lighting')
 box('Luminaire aperture',(x,10.08,9.29),(.25,.02,.18),line,collection='Lighting')
 spot('Stage spot',(x,10.05,9.1),(x*.55,14.0,1),520,'#e6ecff',.78)
for y in [10.7,17]:
 rod('Rig rail',(-13,y,9.72),(13,y,9.72),.045,metal,'Lighting')
 rod('Rig rail',(-13,y,10.04),(13,y,10.04),.045,metal,'Lighting')
 for x in range(-13,13):rod('Rig diagonal',(x,y,9.72),(x+1,y,10.04),.02,metal,'Lighting',6)
area('Screen soft source',(-1,17.9,5.7),(0,3,1.5),2500,'#fff3dd',17,6)
area('Left cool wash',(-12,12,7),(-4,10,2),1350,'#b9d0f5',6,4)
area('Front quiet fill',(-8,-9,6),(0,11,2),750,'#b5c6e1',8,5)
area('Right warm edge',(12,8,6),(6,5,1),1000,'#ffd5a0',4,4)
# Camera takes: presence -> reveal -> stage. No service-by-service object gallery.
shots=[
 {'id':'arrival','label':'Внутри события','position':[-10.5,-12.3,2.45],'target':[-.8,16,5.2],'lens':32},
 {'id':'reveal','label':'Первый свет','position':[-6.8,-2.3,2.15],'target':[-.8,17.8,5.35],'lens':32},
 {'id':'stage','label':'Ближе к мысли','position':[3.8,5.8,2.35],'target':[-1.4,18,5.5],'lens':32},
]
for shot in shots:camera(shot['id'],shot['position'],shot['target'],shot['lens'])
scene.camera=bpy.data.objects['arrival']
scene.render.fps=24; scene.frame_start=1;scene.frame_end=288
travel=camera('Camera / choreography',shots[0]['position'],shots[0]['target'],32)
for frame,shot in zip([1,145,288],shots):
 travel.location=shot['position'];travel.rotation_euler=(Vector(shot['target'])-travel.location).to_track_quat('-Z','Y').to_euler()
 travel.keyframe_insert(data_path='location',frame=frame);travel.keyframe_insert(data_path='rotation_euler',frame=frame)
scene.frame_set(1)
# GLB orientation matches Three.js after Blender's standard Y-up conversion.
(ROOT/'public'/'shots.json').write_text(json.dumps({'schema':1,'shots':[{**s,'position':[s['position'][0],s['position'][2],-s['position'][1]],'target':[s['target'][0],s['target'][2],-s['target'][1]]} for s in shots]},ensure_ascii=False,indent=2))
floor_materials=None
if '--bake' in sys.argv:
 sys.path.insert(0,str(Path(__file__).parent))
 from bake_floor import bake_floor
 floor_materials=bake_floor(floor,ROOT/'authoring'/'cache'/'floor-light.png')
# Pack the source, including material image; artists can edit it without an addon.
blend=ROOT/'authoring'/'first-light.blend'
bpy.ops.wm.save_as_mainfile(filepath=str(blend),compress=True)
if floor_materials: floor.data.materials[0]=floor_materials[1]
# Export clean browser geometry. Lighting is authored explicitly in the web runtime.
for o in list(collections['Screens'].objects):
 if o.type=='FONT':
  bpy.ops.object.select_all(action='DESELECT');o.select_set(True);bpy.context.view_layer.objects.active=o;bpy.ops.object.convert(target='MESH')
bpy.ops.object.select_all(action='DESELECT')
for o in scene.objects:
 if o.type=='MESH':o.select_set(True)
bpy.ops.export_scene.gltf(filepath=str(OUT/'first-light.raw.glb'),export_format='GLB',use_selection=True,export_apply=True,export_yup=True,export_animations=False,export_cameras=False,export_lights=False,export_extras=True)
if floor_materials: floor.data.materials[0]=floor_materials[0]
report={'bakedFloor':bool(floor_materials),'blender':bpy.app.version_string,'source':'authoring/first-light.blend','meshes':len([o for o in scene.objects if o.type=='MESH']),'rawBytes':(OUT/'first-light.raw.glb').stat().st_size,'cameras':[s['id'] for s in shots],'renderer':'Cycles CPU / 4 threads','assets':'Original authored geometry; Blender bundled font converted to meshes'}
(REPORTS/'authoring.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
print('BAEV_AUTHORING_READY',json.dumps(report),flush=True)
if '--render' in sys.argv:
 scene.camera=bpy.data.objects['arrival'];scene.render.filepath=str(REPORTS/'blender-arrival.png')
 bpy.ops.render.render(write_still=True)
 print('BAEV_RENDER_READY',scene.render.filepath,flush=True)
