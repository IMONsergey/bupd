import fs from 'node:fs/promises';
import path from 'node:path';
import { gzipSync } from 'node:zlib';
const root = new URL('../../cinema/', import.meta.url).pathname;
const entries = [];
async function walk(dir) {
  for (const file of await fs.readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, file.name);
    if (file.isDirectory()) await walk(p);
    else {
      const b = await fs.readFile(p);
      entries.push({
        file: path.relative(root, p),
        bytes: b.length,
        gzipBytes: /\.(js|css|html|json)$/.test(p) ? gzipSync(b).length : null,
      });
    }
  }
}
await walk(root);
const gzipJs = entries
  .filter((f) => f.file.endsWith('.js'))
  .reduce((a, f) => a + f.gzipBytes, 0);
if (gzipJs > 420000)
  throw new Error(`JavaScript gzip budget exceeded: ${gzipJs}`);
if (
  entries.some((f) =>
    /\.blend$|\.raw\.glb$|node_modules|editor-|tweakpane/.test(f.file),
  )
)
  throw new Error('Authoring resources leaked into the website.');
const modelBytes = entries
  .filter((f) => f.file.endsWith('.glb'))
  .reduce((n, f) => n + f.bytes, 0);
if (modelBytes > 2000000)
  throw new Error(`Geometry payload exceeds 2 MB: ${modelBytes}`);
const report = {
  modelBytes,
  gzipJsBytes: gzipJs,
  totalStaticBytes: entries.reduce((a, f) => a + f.bytes, 0),
  files: entries,
};
await fs.mkdir(new URL('../reports/', import.meta.url), { recursive: true });
await fs.writeFile(
  new URL('../reports/build.json', import.meta.url),
  JSON.stringify(report, null, 2),
);
console.log(JSON.stringify(report, null, 2));
