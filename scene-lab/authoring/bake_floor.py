"""Bake static diffuse light for the floor; dynamic objects remain conventional PBR."""
import bpy

def bake_floor(obj, output, samples=16):
    original = obj.data.materials[0]
    image = bpy.data.images.new('Floor light / 1024', width=1024, height=1024, alpha=False)
    image.colorspace_settings.name = 'sRGB'
    node = original.node_tree.nodes.new('ShaderNodeTexImage')
    node.name = 'Baked lighting target'
    node.image = image
    original.node_tree.nodes.active = node
    bpy.ops.object.select_all(action='DESELECT')
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    scene = bpy.context.scene
    old = scene.cycles.samples
    scene.cycles.samples = samples
    scene.render.bake.use_pass_direct = True
    scene.render.bake.use_pass_indirect = True
    scene.render.bake.use_pass_color = True
    bpy.ops.object.bake(type='DIFFUSE', margin=8, use_clear=True)
    scene.cycles.samples = old
    image.filepath_raw = str(output)
    image.file_format = 'PNG'
    image.save()
    image.pack()
    baked = bpy.data.materials.new('Floor / baked diffuse')
    baked.use_nodes = True
    baked.use_fake_user = True
    tree = baked.node_tree
    tree.nodes.clear()
    texture = tree.nodes.new('ShaderNodeTexImage'); texture.image = image
    emission = tree.nodes.new('ShaderNodeEmission')
    out = tree.nodes.new('ShaderNodeOutputMaterial')
    tree.links.new(texture.outputs['Color'], emission.inputs['Color'])
    tree.links.new(emission.outputs[0], out.inputs['Surface'])
    return original, baked
