import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dedup, instance, prune, meshopt } from '@gltf-transform/functions';
import { MeshoptEncoder, MeshoptDecoder } from 'meshoptimizer';
import validator from 'gltf-validator';
import fs from 'node:fs/promises';
import sharp from 'sharp';
await MeshoptEncoder.ready;
const input = new URL(
  '../authoring/cache/first-light.raw.glb',
  import.meta.url,
);
const output = new URL('../public/models/first-light.glb', import.meta.url);
const raw = new Uint8Array(await fs.readFile(input));
const validation = await validator.validateBytes(raw, { maxIssues: 100 });
if (validation.issues.numErrors)
  throw new Error(JSON.stringify(validation.issues));
const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({
    'meshopt.encoder': MeshoptEncoder,
    'meshopt.decoder': MeshoptDecoder,
  });
const doc = await io.read(input.pathname);
const floor = doc
  .getRoot()
  .listMaterials()
  .find((m) => m.getName() === 'Floor / baked diffuse');
const floorTexture =
  floor?.getBaseColorTexture() || floor?.getEmissiveTexture();
if (!floorTexture)
  throw new Error('Missing baked floor texture. Build with --bake first.');
for (const texture of doc.getRoot().listTextures()) {
  if (texture === floorTexture) {
    const jpeg = await sharp(texture.getImage())
      .removeAlpha()
      .jpeg({ quality: 86, mozjpeg: true })
      .toBuffer();
    texture.setImage(new Uint8Array(jpeg)).setMimeType('image/jpeg');
  }
}
await doc.transform(
  dedup(),
  instance({ min: 2 }),
  prune(),
  meshopt({ encoder: MeshoptEncoder, level: 'medium' }),
);
await io.write(output.pathname, doc);
const compact = await fs.stat(output);
if (compact.size > 3000000)
  throw new Error('Scene exceeds the 3 MB model budget.');
const info = {
  rawBytes: raw.length,
  optimizedBytes: compact.size,
  reductionPercent: +(100 * (1 - compact.size / raw.length)).toFixed(1),
  rawValidationErrors: validation.issues.numErrors,
  rawValidationWarnings: validation.issues.numWarnings,
  meshes: doc.getRoot().listMeshes().length,
  materials: doc.getRoot().listMaterials().length,
  textures: doc.getRoot().listTextures().length,
};
await fs.writeFile(
  new URL('../reports/model.json', import.meta.url),
  JSON.stringify(info, null, 2),
);
console.log(info);
