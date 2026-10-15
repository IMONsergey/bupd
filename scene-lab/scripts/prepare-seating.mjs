import fs from 'node:fs/promises';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder as RuntimeDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { createPeople } from '../src/people.js';
import { Document, NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import {
  instance,
  dedup,
  prune,
  simplify,
  meshopt,
} from '@gltf-transform/functions';
import {
  MeshoptEncoder,
  MeshoptDecoder,
  MeshoptSimplifier,
} from 'meshoptimizer';
await MeshoptEncoder.ready;
await MeshoptSimplifier.ready;
const loader = new GLTFLoader().setMeshoptDecoder(RuntimeDecoder);
const assets = [];
for (const name of ['business-man', 'woman']) {
  const bytes = await fs.readFile(`public/models/people/${name}.glb`);
  assets.push(
    await loader.parseAsync(
      bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength),
      '',
    ),
  );
}
const cast = createPeople(assets);
const doc = new Document(),
  buffer = doc.createBuffer(),
  scene = doc.createScene('Seated audience');
const material = doc
  .createMaterial('Audience vertex palette')
  .setRoughnessFactor(0.84)
  .setMetallicFactor(0);
const matrix = new THREE.Matrix4(),
  position = new THREE.Vector3(),
  rotation = new THREE.Quaternion(),
  scale = new THREE.Vector3();
for (const batch of cast.group.children.filter((o) => o.isInstancedMesh)) {
  const geometry = batch.geometry,
    primitive = doc.createPrimitive().setMaterial(material);
  for (const [name, type, size] of [
    ['position', 'POSITION', 'VEC3'],
    ['normal', 'NORMAL', 'VEC3'],
    ['color', 'COLOR_0', 'VEC3'],
  ])
    primitive.setAttribute(
      type,
      doc
        .createAccessor(type)
        .setType(size)
        .setArray(new Float32Array(geometry.attributes[name].array))
        .setBuffer(buffer),
    );
  primitive.setIndices(
    doc
      .createAccessor('indices')
      .setType('SCALAR')
      .setArray(new Uint32Array(geometry.index.array))
      .setBuffer(buffer),
  );
  const mesh = doc.createMesh(batch.name).addPrimitive(primitive);
  for (let i = 0; i < batch.count; i++) {
    batch.getMatrixAt(i, matrix);
    matrix.decompose(position, rotation, scale);
    scene.addChild(
      doc
        .createNode(`${batch.name}/${i}`)
        .setMesh(mesh)
        .setTranslation(position.toArray())
        .setRotation(rotation.toArray())
        .setScale(scale.toArray()),
    );
  }
}
await doc.transform(
  simplify({ simplifier: MeshoptSimplifier, ratio: 0.4, error: 0.03 }),
  dedup(),
  instance({ min: 2 }),
  prune(),
  meshopt({ encoder: MeshoptEncoder, level: 'medium' }),
);
const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({
    'meshopt.encoder': MeshoptEncoder,
    'meshopt.decoder': MeshoptDecoder,
  });
await io.write('public/models/people/seated.glb', doc);
const report = {
  seated: cast.seated,
  animated: cast.animated,
  bytes: (await fs.stat('public/models/people/seated.glb')).size,
  meshes: doc.getRoot().listMeshes().length,
  trianglesPerTemplate: doc
    .getRoot()
    .listMeshes()
    .map((m) =>
      m.listPrimitives().reduce((n, p) => n + p.getIndices().getCount() / 3, 0),
    ),
  simplification:
    'Offline error-constrained reduction. Animated foreground rigs are not simplified.',
};
await fs.writeFile(
  'reports/story/seating.json',
  JSON.stringify(report, null, 2),
);
console.log(report);
