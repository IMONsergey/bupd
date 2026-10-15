import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { clamp, smooth, frameBudget, validateShots } from '../src/settings.js';
const source = JSON.parse(
  readFileSync(new URL('../public/shots.json', import.meta.url)),
);
test('three finite authored camera stops', () => {
  assert.equal(validateShots(source).length, 3);
});
test('invalid camera values fail closed', () => {
  assert.throws(() =>
    validateShots({ schema: 1, shots: [{ position: [Infinity, 1, 2] }] }),
  );
});
test('navigation clamps invalid and out-of-range input', () => {
  assert.equal(clamp(NaN, 0, 1), 0);
  assert.equal(clamp(-9, 0, 1), 0);
  assert.equal(clamp(9, 0, 1), 1);
});
test('easing has exact endpoints and is monotone', () => {
  assert.equal(smooth(0), 0);
  assert.equal(smooth(1), 1);
  let last = 0;
  for (let n = 0; n <= 100; n++) {
    const v = smooth(n / 100);
    assert.ok(v >= last && v <= 1);
    last = v;
  }
});
test('desktop buffer never exceeds 2.6 megapixels', () => {
  for (const [w, h] of [
    [1440, 900],
    [2560, 1440],
    [3840, 2160],
  ]) {
    const b = frameBudget(w, h, 3);
    assert.ok(w * h * b.dpr * b.dpr <= 2600001);
    assert.ok(b.dpr <= 1.5);
  }
});
test('mobile uses lightweight rendering and <=1.2 megapixels', () => {
  const b = frameBudget(390, 844, 3);
  assert.equal(b.low, true);
  assert.ok(b.dpr <= 1);
});
test('explicit low mode is respected on a large display', () => {
  const b = frameBudget(1920, 1080, 2, 'low');
  assert.equal(b.low, true);
  assert.ok(b.dpr <= 1);
});
test('standalone entry does not load rejected journey', () => {
  const s = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  assert.doesNotMatch(s, /front\/journey|iframe|autoplay/);
  assert.match(s, /href="\/contact\/"/);
  assert.match(s, /<noscript\b[^>]*>/);
});
test('editor import is development gated', () => {
  const s = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
  assert.match(s, /if\s*\(import\.meta\.env\.DEV\)/);
  assert.match(s, /import\('\.\/editor.js'\)/);
});
