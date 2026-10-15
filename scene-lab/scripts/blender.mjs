import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
const candidates = [
  process.env.BLENDER_BIN,
  path.join(
    os.homedir(),
    'Applications/Blender-4.5.14.app/Contents/MacOS/Blender',
  ),
  '/Applications/Blender.app/Contents/MacOS/Blender',
  '/usr/bin/blender',
].filter(Boolean);
const exe = candidates.find((p) => fs.existsSync(p));
if (!exe) throw new Error('Set BLENDER_BIN to a Blender 4.5 LTS executable.');
const child = spawn(
  exe,
  [
    '--background',
    '--factory-startup',
    '--disable-autoexec',
    '--threads',
    '4',
    '--python',
    new URL('../authoring/build_scene.py', import.meta.url).pathname,
    '--',
    '--bake',
    ...process.argv.slice(2),
  ],
  { stdio: 'inherit' },
);
child.on('error', (e) => {
  console.error(e.message);
  process.exitCode = 1;
});
child.on('exit', (code) => {
  process.exitCode = code ?? 1;
});
