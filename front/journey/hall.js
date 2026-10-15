import * as THREE from '../faithful/vendor/three.module.js';
import { rng, titleGraphic } from './materials.js';

/** A reusable theatre set. The final chapter reverses the visitor's point of view. */
export function buildHall(kit, { final = false } = {}) {
  const group = new THREE.Group();
  group.name = final ? 'your-stage' : 'opening';
  const steel = kit.solid('#85888d', 0.43, 0.65),
    black = kit.solid('#16171a', 0.74),
    edge = kit.light('#d7d8df', 0.8);
  kit.floor(group, [37, 0.4, 60]);
  const carpet = kit.block(
    group,
    [4.2, 0.03, 47],
    kit.surface('fabric'),
    [0, -0.025, 2],
  );
  carpet.receiveShadow = true;
  kit.block(group, [37, 0.35, 60], black, [0, 12.3, 0]);
  for (const side of [-1, 1]) {
    kit.block(group, [0.5, 12, 59], kit.solid('#22252a'), [side * 18.5, 6, 0]);
    const slats = [],
      panels = [];
    for (let z = -26; z <= 27; z += 0.48)
      slats.push({ p: [side * 18.18, 6.2, z] });
    kit.instances(
      group,
      kit.box(0.08, 9.8, 0.09),
      kit.solid('#494b4f', 0.96),
      slats,
    );
    for (let z = -23; z < 26; z += 7) {
      panels.push({ p: [side * 17.97, 3.9, z] });
      kit.block(group, [0.12, 0.035, 3.5], edge, [side * 18.05, 9.9, z]);
    }
    kit.instances(group, kit.box(0.15, 4.9, 3.5), black, panels);
    kit.block(group, [0.025, 0.022, 45], edge, [side * 2.13, 0.015, 2.5]);
  }
  kit.block(group, [37, 12, 0.4], black, [0, 6, 29.6]);
  kit.block(group, [4.2, 4.2, 0.1], kit.solid('#292d32'), [0, 2.1, 29.3]);
  kit.frame(group, 4.2, 4.2, 0.15, [0, 2.1, 29.15], steel);
  kit.block(group, [0.02, 4, 0.06], edge, [0, 2.1, 29.1]);
  const exit = kit.text('ВЫХОД', {
    width: 384,
    height: 96,
    color: '#e8e5dc',
    background: '#272c2d',
    size: 45,
    align: 'center',
    padding: 12,
  });
  kit.plane(group, 1.25, 0.31, exit.texture, [0, 4.65, 29.04], false, [
    0,
    Math.PI,
    0,
  ]);
  const cushions = [],
    backs = [],
    arms = [],
    legs = [],
    bodies = [],
    heads = [],
    random = rng(72);
  for (let row = 0; row < 12; row++)
    for (const side of [-1, 1])
      for (let col = 0; col < 9; col++) {
        const x = side * (2.85 + col * 1.29),
          z = -10.5 + row * 2.7;
        cushions.push({ p: [x, 0.59, z] });
        backs.push({ p: [x, 1.17, z + 0.36], r: [-0.1, 0, 0] });
        for (const s of [-1, 1]) {
          arms.push({ p: [x + s * 0.46, 0.86, z + 0.02] });
          legs.push({ p: [x + s * 0.34, 0.29, z] });
        }
        // Distant matte silhouettes only: no close-up faces or uncanny animation.
        if (random() > 0.24 && row < 8) {
          const height = 0.94 + random() * 0.18;
          bodies.push({
            p: [x, height + 0.12, z - 0.09],
            s: [0.29, 0.46, 0.21],
            r: [0, (random() - 0.5) * 0.12, 0],
          });
          heads.push({
            p: [x + (random() - 0.5) * 0.09, height + 0.79, z - 0.01],
            s: [0.14, 0.19, 0.155],
          });
        }
      }
  kit.instances(
    group,
    kit.box(0.83, 0.18, 0.84, 0.06),
    kit.surface('fabric'),
    cushions,
    true,
  );
  kit.instances(
    group,
    kit.box(0.86, 0.95, 0.19, 0.055),
    kit.surface('fabric'),
    backs,
    true,
  );
  kit.instances(group, kit.box(0.12, 0.1, 0.7, 0.025), steel, arms);
  kit.instances(group, kit.box(0.07, 0.59, 0.55, 0.015), steel, legs);
  const bodyGeometry = kit.geometry(
    'audience-body',
    () => new THREE.SphereGeometry(1, 10, 8),
  );
  kit.instances(group, bodyGeometry, kit.solid('#111316', 1), bodies);
  kit.instances(group, bodyGeometry, kit.solid('#262529', 0.97), heads);
  kit.block(group, [27, 1.05, 10.5], black, [0, 0.3, -21.6]);
  const stage = kit.block(
    group,
    [27, 0.11, 10.45],
    kit.solid('#34363b', 0.59, 0.13),
    [0, 0.88, -21.6],
  );
  stage.receiveShadow = true;
  kit.block(group, [27, 0.035, 0.035], edge, [0, 0.92, -16.35]);
  for (let i = 0; i < 3; i++)
    kit.block(group, [3.2, 0.24, 1.05], black, [
      9,
      0.06 + i * 0.26,
      -14.65 - i * 0.92,
    ]);
  const backdrop = kit.solid('#151519', 0.9),
    curtain = [];
  for (const side of [-1, 1])
    for (let x = 10.8; x < 18.1; x += 0.25)
      curtain.push({ p: [side * x, 6.05, -26.15] });
  kit.instances(
    group,
    kit.geometry(
      'curtain-pleat',
      () => new THREE.CylinderGeometry(0.19, 0.22, 11.8, 8),
    ),
    backdrop,
    curtain,
  );
  kit.block(group, [21.05, 8.56, 0.22], steel, [0, 6.55, -26.0], 0.025);
  const graphic = titleGraphic(kit),
    screen = kit.plane(group, 20.8, 8.4, graphic.texture, [0, 6.55, -25.85]);
  screen.name = 'main-screen';
  kit.frame(group, 20.83, 8.43, 0.13, [0, 6.55, -25.8], black);
  const sideGraphic = kit.text('BAEV\n/ LIVE', {
    width: 384,
    height: 1024,
    background: '#202125',
    color: '#dfdfdf',
    size: 93,
    weight: 600,
    padding: 25,
    subtitle: 'ПУБЛИЧНАЯ КОММУНИКАЦИЯ',
  });
  for (const side of [-1, 1]) {
    const wing = new THREE.Group();
    wing.position.set(side * 13.5, 5.5, -23.1);
    wing.rotation.y = side * -0.15;
    group.add(wing);
    kit.block(wing, [2.5, 8, 0.3], steel, [0, 0, 0], 0.025);
    kit.plane(wing, 2.35, 7.82, sideGraphic.texture, [0, 0, 0.17]);
  }
  const trussLines = [],
    fixtures = [],
    lenses = [];
  for (const z of [-22, -13, -3, 9, 22]) {
    for (const y of [10.65, 11.3])
      for (const d of [-0.28, 0.28])
        trussLines.push([
          [-16.7, y, z + d],
          [16.7, y, z + d],
        ]);
    for (let x = -16.5; x < 16; x += 1.3)
      for (const d of [-0.28, 0.28])
        trussLines.push(
          [
            [x, 10.65, z + d],
            [x + 0.65, 11.3, z + d],
          ],
          [
            [x + 0.65, 11.3, z + d],
            [x + 1.3, 10.65, z + d],
          ],
        );
    for (const x of [-13.8, -8, -3, 3, 8, 13.8]) {
      fixtures.push({ p: [x, 10.25, z], r: [0.25, 0, 0.15 * Math.sign(x)] });
      lenses.push({ p: [x, 9.98, z + 0.08], r: [Math.PI / 2 + 0.25, 0, 0] });
    }
  }
  kit.rods(group, trussLines, steel, 0.036);
  kit.instances(group, kit.box(0.36, 0.46, 0.4, 0.04), black, fixtures);
  kit.instances(
    group,
    kit.geometry('lens', () => new THREE.CircleGeometry(0.14, 12)),
    kit.light('#e1e4ed', 0.9),
    lenses,
  );
  const beams = [];
  for (const x of [-12, -7, 7, 12])
    beams.push(
      kit.beam(group, [x * 0.68, 5.2, -16], [0, 0, x * -0.018], 13, 1.9),
    );
  for (const x of [-10, 10])
    beams.push(
      kit.beam(group, [x * 0.65, 5, 4], [0.22, 0, x * -0.015], 12, 1.6),
    );
  const cables = [];
  for (const x of [-16, 16])
    cables.push(
      [
        [x, 0, -25],
        [x, 10.6, -25],
      ],
      [
        [x, 10.6, -25],
        [x, 10.6, 23],
      ],
    );
  kit.rods(group, cables, black, 0.018);
  const podium = new THREE.Group();
  podium.position.set(-7.1, 0.95, -19.4);
  group.add(podium);
  kit.block(
    podium,
    [0.7, 1.13, 0.64],
    kit.solid('#93979e', 0.44, 0.2),
    [0, 0.56, 0],
    0.035,
  );
  kit.block(
    podium,
    [1.02, 0.08, 0.7],
    steel,
    [0, 1.17, 0.04],
    0.02,
    [0.12, 0, 0],
  );
  kit.rods(
    podium,
    [
      [
        [0.15, 1.2, 0],
        [0.15, 1.55, 0.06],
      ],
      [
        [0.15, 1.55, 0.06],
        [0.15, 1.65, -0.12],
      ],
    ],
    black,
    0.014,
    8,
  );
  const brand = kit.text('BAEV', {
    width: 384,
    height: 160,
    background: '#93979e',
    color: '#24262a',
    size: 103,
    weight: 600,
    align: 'center',
    padding: 12,
  });
  kit.plane(podium, 0.62, 0.258, brand.texture, [0, 0.73, 0.332]);
  const footlights = [];
  for (let x = -12; x <= 12; x += 3) footlights.push({ p: [x, 0.975, -16.7] });
  kit.instances(
    group,
    kit.box(0.38, 0.035, 0.11),
    kit.light('#faf7ee', 0.9),
    footlights,
  );
  let monitor;
  if (final) {
    const body = new THREE.Group();
    body.position.set(0, 1.75, -16.8);
    body.rotation.y = Math.PI;
    body.rotation.x = -0.36;
    group.add(body);
    kit.block(body, [2.65, 1.35, 0.18], black, [0, 0, 0], 0.045);
    monitor = kit.text('ВАША ИСТОРИЯ', {
      width: 1024,
      height: 512,
      background: '#e8e6e1',
      color: '#202125',
      size: 88,
      align: 'center',
      overline: 'BAEV / ЧТО ВАЖНО ОБЪЯСНИТЬ ВАМ?',
    });
    kit.plane(body, 2.49, 1.21, monitor.texture, [0, 0, 0.12]);
  }
  for (const x of [-8, 8]) kit.contactShadow(group, 14, 40, [x, -0.02, 5], 0.5);
  const glow = new THREE.PointLight('#d9e3f3', 580, 65, 2);
  glow.position.set(0, 7, -21);
  group.add(glow);
  const fill = new THREE.PointLight('#adbbd6', 62, 45, 2);
  fill.position.set(0, 8, 14);
  group.add(fill);
  return {
    group,
    update(t, detail, reduced) {
      const opening = final ? 1 : Math.min(1, 0.35 + t / 2.4);
      glow.intensity = 580 * opening;
      screen.material.color.setScalar(0.8 + 0.2 * opening);
      beams.forEach((beam, i) => {
        beam.material.uniforms.uStrength.value =
          (0.27 + (reduced ? 0 : Math.sin(t * 0.21 + i) * 0.013)) * opening;
      });
    },
    setTitle(value) {
      if (!monitor) return;
      const c = monitor.context;
      c.fillStyle = '#e8e6e1';
      c.fillRect(0, 0, 1024, 512);
      c.fillStyle = '#202125';
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      c.font = '400 21px Arial';
      c.fillText('ВАША СЛЕДУЮЩАЯ ИСТОРИЯ', 512, 65);
      c.font = '500 72px Arial';
      c.fillText(value.trim() || 'ВАША ИСТОРИЯ', 512, 256, 930);
      c.font = '400 23px Arial';
      c.fillText('BAEV / ОТ МЫСЛИ К ВПЕЧАТЛЕНИЮ', 512, 455);
      monitor.texture.needsUpdate = true;
    },
  };
}
