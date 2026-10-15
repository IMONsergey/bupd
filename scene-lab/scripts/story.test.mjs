import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  CHAPTERS,
  PROJECTS,
  sampleStory,
  nextStop,
  chapterFromHash,
  chapterIndex,
  WheelIntent,
} from '../src/story.js';
test('eight distinct chapters retain BAEV rather than event registration', () => {
  assert.equal(CHAPTERS.length, 8);
  assert.equal(new Set(CHAPTERS.map((c) => c.id)).size, 8);
  for (const c of CHAPTERS) {
    assert.ok(c.title && c.text);
    assert.doesNotMatch(c.text, /регистрац|стать партнером|билет/i);
  }
});
test('chapter addresses and bidirectional controls are exact', () => {
  CHAPTERS.forEach((c, i) => {
    assert.equal(chapterFromHash('#' + c.id), c.at);
    assert.equal(chapterIndex(c.at), i);
    if (i < 7) assert.equal(nextStop(c.at), CHAPTERS[i + 1].at);
    if (i > 0) assert.equal(nextStop(c.at, -1), CHAPTERS[i - 1].at);
  });
});
test('every camera sample is finite and stays above the floor', () => {
  for (const mobile of [false, true])
    for (let i = 0; i <= 2000; i++) {
      const state = sampleStory(i / 2000, mobile);
      assert.ok([...state.position, ...state.target].every(Number.isFinite));
      assert.ok(state.position[1] > 1.4);
      assert.ok(state.mask >= 0 && state.mask <= 1);
      assert.ok(
        Math.hypot(...state.position.map((v, k) => v - state.target[k])) > 0.01,
      );
    }
});
test('both world cuts are completely occluded', () => {
  for (const p of [0.46, 0.92]) assert.equal(sampleStory(p).mask, 1);
  assert.equal(sampleStory(0.459).world, 'hall');
  assert.equal(sampleStory(0.461).world, 'thought');
  assert.equal(sampleStory(0.921).world, 'hall');
});
test('camera remains inside central aisle before the front-row reveal', () => {
  for (let i = 0; i <= 200; i++) {
    const s = sampleStory(i / 1000);
    assert.ok(Math.abs(s.position[0]) < 1.3);
  }
});
test('only existing full case routes are exposed', () => {
  assert.equal(PROJECTS.length, 3);
  for (const p of PROJECTS) assert.match(p.href, /^\/work\/[a-z0-9-]+$/);
});
test('wheel inertia consumes one intent and cannot replay during a transition', () => {
  const g = new WheelIntent();
  assert.equal(g.feed(30, 0), 0);
  assert.equal(g.feed(30, 20), 1);
  for (let i = 40; i < 1500; i += 20) assert.equal(g.feed(60, i), 0);
  assert.equal(g.feed(80, 1800, true), 0);
  assert.equal(g.feed(80, 1820), 0);
  assert.equal(g.feed(-80, 2100), -1);
});
test('character licenses and pruned clips are present', () => {
  const meta = JSON.parse(fs.readFileSync('public/licenses/characters.json'));
  assert.equal(meta.license, 'CC0 1.0');
  assert.equal(meta.assets.length, 2);
  for (const a of meta.assets) {
    assert.ok(a.sourceSHA256);
    assert.ok(a.clips.includes('Walk'));
    assert.ok(
      a.clips.every((c) =>
        ['Idle', 'Idle_Neutral', 'Walk', 'Interact'].includes(c),
      ),
    );
  }
});
test('readable fallback contains all chapters without JavaScript', () => {
  const html = fs.readFileSync('index.html', 'utf8');
  assert.equal((html.match(/<article\b/g) || []).length, 8);
  assert.match(html, /id="plain"/);
  assert.match(html, /href="\/contact\/"/);
});
test('audience has four compact batches rather than a skeleton per spectator', () => {
  const report = JSON.parse(fs.readFileSync('reports/story/seating.json'));
  assert.equal(report.meshes, 4);
  assert.ok(report.seated >= 100);
  assert.ok(report.bytes < 150000);
  assert.ok(report.trianglesPerTemplate.every((n) => n < 3000));
});
