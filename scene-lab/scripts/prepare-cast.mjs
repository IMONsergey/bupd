import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dedup, prune, meshopt } from '@gltf-transform/functions';
import { MeshoptEncoder, MeshoptDecoder } from 'meshoptimizer';
import fs from 'node:fs/promises';
import { createHash } from 'node:crypto';
import sharp from 'sharp';

const assets = [
  {
    file: 'business-man',
    name: 'Business Man',
    source: 'https://poly.pizza/m/JFrLIKqvCH',
    download:
      'https://static.poly.pizza/e599abbe-7d73-488c-9d7e-3ead281e705c.glb',
  },
  {
    file: 'woman',
    name: 'Animated Woman',
    source: 'https://poly.pizza/m/qJ2gsTUBHL',
    download:
      'https://static.poly.pizza/ba7a1955-ea51-4cb9-a561-188bdef0a6c7.glb',
  },
];
await MeshoptEncoder.ready;
const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({
    'meshopt.encoder': MeshoptEncoder,
    'meshopt.decoder': MeshoptDecoder,
  });
await fs.mkdir('public/models/people', { recursive: true });
for (const asset of assets) {
  const path = `authoring/people/${asset.file}.glb`;
  const bytes = await fs.readFile(path);
  asset.sourceSHA256 = createHash('sha256').update(bytes).digest('hex');
  const doc = await io.read(path);
  for (const clip of doc.getRoot().listAnimations()) {
    const name = clip.getName().split('|').pop();
    if (!['Idle', 'Idle_Neutral', 'Walk', 'Interact'].includes(name))
      clip.dispose();
    else clip.setName(name);
  }
  for (const material of doc.getRoot().listMaterials()) {
    material.setMetallicFactor(0).setRoughnessFactor(0.82);
    const name = material.getName();
    if (/Suit|Grey|Orange/.test(name))
      material.setBaseColorFactor([0.035, 0.045, 0.065, 1]);
    if (name === 'White') material.setBaseColorFactor([0.48, 0.49, 0.46, 1]);
  }
  await doc.transform(
    dedup(),
    prune(),
    meshopt({ encoder: MeshoptEncoder, level: 'medium' }),
  );
  const target = `public/models/people/${asset.file}.glb`;
  await io.write(target, doc);
  asset.webBytes = (await fs.stat(target)).size;
  asset.clips = doc
    .getRoot()
    .listAnimations()
    .map((a) => a.getName());
}
const attribution = {
  creator: 'Quaternius',
  license: 'CC0 1.0',
  licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
  assets,
  modifications:
    'Keep only idle, walking and conversational animations; muted clothing palette; nonmetallic skin/fabric; Meshopt compression. Runtime seated poses and instances are derived from these meshes.',
};
await fs.writeFile(
  'authoring/people/sources.json',
  JSON.stringify(attribution, null, 2),
);
await fs.writeFile(
  'public/licenses/characters.json',
  JSON.stringify(attribution, null, 2),
);
await fs.writeFile(
  'public/licenses/characters.txt',
  'Character assets: Business Man and Animated Woman by Quaternius.\nCC0 1.0 — https://creativecommons.org/publicdomain/zero/1.0/\nSources: https://poly.pizza/m/JFrLIKqvCH and https://poly.pizza/m/qJ2gsTUBHL\nDerived work: muted materials, clip pruning, seated poses, instancing and Meshopt optimization.\n',
);
await fs.mkdir('public/media/projects', { recursive: true });
for (const [file, out] of [
  ['avito-auto-2024.jpg', 'avito'],
  ['linear-identity.jpg', 'haval'],
  ['future-archive.png', 'alfa'],
])
  await sharp(`../front/media/${file}`)
    .resize({
      width: 1500,
      height: 1000,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality: 87 })
    .toFile(`public/media/projects/${out}.webp`);
console.log(JSON.stringify(attribution, null, 2));
