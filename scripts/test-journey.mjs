import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import {
  CHAPTERS,
  CASES,
  GestureGate,
  indexFromHash,
  smooth,
  clamp,
} from '../front/journey/chapters.js';
import * as THREE from '../front/faithful/vendor/three.module.js';
import { createTravel, sampleTravel } from '../front/journey/director.js';
let passed = 0;
const test = (name, run) => {
  run();
  console.log(`PASS ${name}`);
  passed++;
};
test('exactly eight unique, reachable chapters', () => {
  assert.equal(CHAPTERS.length, 8);
  assert.equal(new Set(CHAPTERS.map((c) => c.id)).size, 8);
  CHAPTERS.forEach((c, i) => assert.equal(indexFromHash('#' + c.id), i));
});
test('legacy approach anchor and malformed hash have deterministic destinations', () => {
  assert.equal(indexFromHash('#approach'), 2);
  assert.equal(indexFromHash('#missing'), 0);
  assert.equal(indexFromHash(null), 0);
});
test('all camera stops have finite vectors and authored mobile compositions', () => {
  for (const c of CHAPTERS)
    for (const key of ['camera', 'look', 'mobile']) {
      assert.equal(c[key].length, 3);
      assert.ok(c[key].every(Number.isFinite));
    }
});
test('all chapters expose real editorial copy and an action', () => {
  for (const c of CHAPTERS) {
    assert.ok(c.title.length > 8);
    assert.ok(c.copy.length > 40);
    assert.ok(c.action);
  }
});
test('only confirmed project routes and local assets are used', () => {
  assert.equal(CASES.length, 3);
  for (const c of CASES) {
    assert.match(c.href, /^\/work\/[a-z0-9-]+$/);
    assert.match(c.image, /^\/front\/media\//);
  }
});
test('camera easing is bounded, monotonic and exact at endpoints', () => {
  assert.equal(smooth(0), 0);
  assert.equal(smooth(1), 1);
  let last = 0;
  for (let i = 0; i <= 100; i++) {
    const value = smooth(i / 100);
    assert.ok(value >= last && value <= 1);
    last = value;
  }
});
test('clamping never permits out-of-range navigation', () => {
  assert.equal(clamp(-20, 0, 7), 0);
  assert.equal(clamp(40, 0, 7), 7);
});
test('one wheel impulse consumes one chapter', () => {
  const gate = new GestureGate();
  assert.equal(gate.feed(30, 0), 0);
  assert.equal(gate.feed(30, 20), 1);
  assert.equal(gate.feed(100, 40), 0);
});
test('long trackpad inertia never queues another chapter', () => {
  const gate = new GestureGate();
  assert.equal(gate.feed(70, 0), 1);
  for (let t = 30; t < 3000; t += 30) assert.equal(gate.feed(20, t), 0);
  assert.equal(gate.feed(70, 3300), 1);
});
test('input during travel is consumed, not replayed on arrival', () => {
  const gate = new GestureGate();
  assert.equal(gate.feed(80, 0, true), 0);
  assert.equal(gate.feed(80, 100), 0);
  assert.equal(gate.feed(80, 350), 1);
});
test('opposite wheel direction resets partial accumulation', () => {
  const gate = new GestureGate();
  assert.equal(gate.feed(40, 0), 0);
  assert.equal(gate.feed(-40, 20), 0);
  assert.equal(gate.feed(-20, 40), -1);
});
test('invalid input cannot trigger navigation', () => {
  const gate = new GestureGate();
  assert.equal(gate.feed(NaN, 0), 0);
  assert.equal(gate.feed(Infinity, 20), 0);
});
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
test('all eight chapters remain available without JavaScript', () => {
  assert.equal((html.match(/<article>/g) || []).length, 8);
  assert.match(html, /id="plain"/);
  assert.match(html, /href="\/contact\/"/);
});
test('entry point is isolated from earlier scroll/intro experiments', () => {
  assert.match(html, /front\/journey\/app.js/);
  assert.doesNotMatch(
    html,
    /faithful\/app.js|conference\/scene.js|ScrollTrigger|gsap/,
  );
});
test('no fake lead form or external runtime script was introduced', () => {
  assert.doesNotMatch(html, /<form|<script[^>]+https?:/);
});
test('runtime code contains no eval, embedded credentials or network submission', () => {
  for (const file of readdirSync(
    new URL('../front/journey', import.meta.url),
  ).filter((f) => f.endsWith('.js'))) {
    const source = readFileSync(
      new URL('../front/journey/' + file, import.meta.url),
      'utf8',
    );
    assert.doesNotMatch(
      source,
      /\beval\(|new Function|api[_-]?key\s*[:=]|method:\s*['"]POST/i,
      file,
    );
  }
});
test('invalid chapter input is clamped rather than crashing the registry', () => {
  assert.equal(clamp(NaN, 0, 7), 0);
  assert.equal(clamp(Infinity, 0, 7), 0);
});
test('every authored connection is finite, reversible and optically occluded at its cut', () => {
  const pose = (i) => ({
    position: new THREE.Vector3(...CHAPTERS[i].camera).add(
      new THREE.Vector3(0, 0, -i * 100),
    ),
    look: new THREE.Vector3(...CHAPTERS[i].look).add(
      new THREE.Vector3(0, 0, -i * 100),
    ),
  });
  for (let i = 0; i < 7; i++)
    for (const [from, to] of [
      [i, i + 1],
      [i + 1, i],
    ]) {
      const start = pose(from),
        end = pose(to),
        travel = createTravel(from, to, start, end);
      assert.ok(
        sampleTravel(travel, 0).position.distanceTo(start.position) < 0.000001,
      );
      assert.ok(
        sampleTravel(travel, 1).position.distanceTo(end.position) < 0.000001,
      );
      for (let j = 0; j <= 100; j++) {
        const frame = sampleTravel(travel, j / 100);
        assert.ok(
          [
            ...frame.position.toArray(),
            ...frame.look.toArray(),
            frame.mask,
          ].every(Number.isFinite),
        );
        assert.ok(frame.position.distanceTo(frame.look) > 0.001);
        assert.equal(frame.index, j < 50 ? from : to);
        assert.ok(frame.mask >= 0 && frame.mask <= 1);
        if (j === 50) assert.equal(frame.mask, 1);
      }
    }
});
test('non-adjacent chapters use a bounded cut, never a long empty fly-through', () => {
  const a = {
    position: new THREE.Vector3(0, 4, 24),
    look: new THREE.Vector3(0, 5, 0),
  };
  const b = {
    position: new THREE.Vector3(0, 4, -500),
    look: new THREE.Vector3(0, 5, -520),
  };
  const travel = createTravel(0, 5, a, b);
  assert.equal(travel.direct, true);
  assert.ok(travel.duration < 1);
  assert.equal(sampleTravel(travel, 0.25).index, 0);
  assert.equal(sampleTravel(travel, 0.75).index, 5);
  assert.equal(sampleTravel(travel, 0.5).mask, 1);
});
console.log(`BAEV journey: ${passed} unit/contract checks passed.`);
