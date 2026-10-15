import * as THREE from '../faithful/vendor/three.module.js';
import { rng, titleGraphic } from './materials.js';

/** A reusable theatre set. The final chapter reverses the visitor's point of view. */
export function buildHall(kit, { final = false } = {}) {
  const group = new THREE.Group(); group.name = final ? 'your-stage' : 'opening';
  const steel = kit.solid('#464d43', .43, .65), black = kit.solid('#181d16', .74), edge = kit.light('#d6dfbf', .8);
  kit.floor(group, [37, .4, 60]);
  const carpet = kit.block(group, [4.2, .03, 47], kit.surface('fabric'), [0, -.025, 2]); carpet.receiveShadow = true;
  kit.block(group, [37, .35, 60], black, [0, 12.3, 0]);
  for (const side of [-1, 1]) {
    kit.block(group, [.5, 12, 59], kit.solid('#2c3328'), [side * 18.5, 6, 0]); const slats = [], panels = [];
    for (let z = -26; z <= 27; z += .75) slats.push({ p: [side * 18.18, 6.2, z] });
    kit.instances(group, kit.box(.2, 9.8, .15), kit.solid('#606652', .96), slats);
    for (let z = -23; z < 26; z += 7) { panels.push({ p: [side * 17.97, 3.9, z] }); kit.block(group, [.12, .035, 3.5], edge, [side * 18.05, 9.9, z]); }
    kit.instances(group, kit.box(.15, 4.9, 3.5), black, panels); kit.block(group, [.025, .022, 45], edge, [side * 2.13, .015, 2.5]);
  }
  kit.block(group, [37, 12, .4], black, [0, 6, 29.6]);
  kit.block(group, [4.2, 4.2, .1], kit.solid('#333e2d'), [0, 2.1, 29.3]); kit.frame(group, 4.2, 4.2, .15, [0, 2.1, 29.15], steel); kit.block(group, [.02, 4, .06], edge, [0, 2.1, 29.1]);
  const exit = kit.text('ВЫХОД', { width: 384, height: 96, color: '#cdd5bd', background: '#263321', size: 45, align: 'center', padding: 12 }); kit.plane(group, 1.25, .31, exit.texture, [0, 4.65, 29.04], false, [0, Math.PI, 0]);
  const cushions = [], backs = [], arms = [], legs = [], bodies = [], heads = [], random = rng(72);
  for (let row = 0; row < 12; row++) for (const side of [-1, 1]) for (let col = 0; col < 9; col++) {
    const x = side * (2.85 + col * 1.29), z = -10.5 + row * 2.7;
    cushions.push({ p: [x, .59, z] }); backs.push({ p: [x, 1.17, z + .36], r: [-.1, 0, 0] });
    for (const s of [-1, 1]) { arms.push({ p: [x + s * .46, .86, z + .02] }); legs.push({ p: [x + s * .34, .29, z] }); }
    // Distant matte silhouettes only: no close-up faces or uncanny animation.
    if (random() > .24 && row < 10) { const height = .94 + random() * .18; bodies.push({ p: [x, height + .12, z - .09], s: [.34, .50, .21], r: [0, (random() - .5) * .12, 0] }); heads.push({ p: [x + (random() - .5) * .09, height + .79, z - .01], s: [.185, .22, .185] }); }
  }
  kit.instances(group, kit.box(.83, .18, .84, .06), kit.surface('fabric'), cushions, true); kit.instances(group, kit.box(.86, .95, .19, .055), kit.surface('fabric'), backs, true); kit.instances(group, kit.box(.12, .1, .7, .025), steel, arms); kit.instances(group, kit.box(.07, .59, .55, .015), steel, legs);
  const bodyGeometry = kit.geometry('audience-body', () => new THREE.SphereGeometry(1, 10, 8)); kit.instances(group, bodyGeometry, kit.solid('#161b15', 1), bodies); kit.instances(group, bodyGeometry, kit.solid('#343c2c', .97), heads);
  kit.block(group, [27, 1.05, 10.5], black, [0, .3, -21.6]);
  const stage = kit.block(group, [27, .11, 10.45], kit.solid('#5a614f', .59, .13), [0, .88, -21.6]); stage.receiveShadow = true;
  kit.block(group, [27, .035, .035], edge, [0, .92, -16.35]);
  for (let i = 0; i < 3; i++) kit.block(group, [3.2, .24, 1.05], black, [9, .06 + i * .26, -14.65 - i * .92]);
  const backdrop = kit.solid('#23271f', .9), curtain = [];
  for (const side of [-1, 1]) for (let x = 10.8; x < 18.1; x += .25) curtain.push({ p: [side * x, 6.05, -26.15] });
  kit.instances(group, kit.geometry('curtain-pleat', () => new THREE.CylinderGeometry(.19, .22, 11.8, 8)), backdrop, curtain);
  kit.block(group, [21.05, 8.56, .22], steel, [0, 6.55, -26.0], .025);
  const graphic = titleGraphic(kit), screen = kit.plane(group, 20.8, 8.4, graphic.texture, [0, 6.55, -25.85]); screen.name = 'main-screen'; kit.frame(group, 20.83, 8.43, .13, [0, 6.55, -25.8], black);
  const sideGraphic = kit.text('BAEV\n/ LIVE', { width: 384, height: 1024, background: '#242b21', color: '#d5ddbf', size: 93, weight: 600, padding: 25, subtitle: 'ПУБЛИЧНАЯ КОММУНИКАЦИЯ' });
  for (const side of [-1, 1]) { const wing = new THREE.Group(); wing.position.set(side * 13.5, 5.5, -23.1); wing.rotation.y = side * -.15; group.add(wing); kit.block(wing, [2.5, 8, .3], steel, [0, 0, 0], .025); kit.plane(wing, 2.35, 7.82, sideGraphic.texture, [0, 0, .17]); }
  const trussLines = [], fixtures = [], lenses = [];
  for (const z of [-22, -13, -3, 9, 22]) {
    for (const y of [10.65, 11.3]) for (const d of [-.28, .28]) trussLines.push([[-16.7, y, z + d], [16.7, y, z + d]]);
    for (let x = -16.5; x < 16; x += 1.3) for (const d of [-.28, .28]) trussLines.push([[x, 10.65, z + d], [x + .65, 11.3, z + d]], [[x + .65, 11.3, z + d], [x + 1.3, 10.65, z + d]]);
    for (const x of [-13.8, -8, -3, 3, 8, 13.8]) { fixtures.push({ p: [x, 10.25, z], r: [.25, 0, .15 * Math.sign(x)] }); lenses.push({ p: [x, 9.98, z + .08], r: [Math.PI / 2 + .25, 0, 0] }); }
  }
  kit.rods(group, trussLines, steel, .036); kit.instances(group, kit.box(.36, .46, .4, .04), black, fixtures); kit.instances(group, kit.geometry('lens', () => new THREE.CircleGeometry(.14, 12)), kit.light('#dce7c7', .9), lenses);
  const beams = [];
  for (const x of [-12, -7, 7, 12]) beams.push(kit.beam(group, [x * .68, 5.2, -16], [0, 0, x * -.018], 13, 1.9));
  for (const x of [-10, 10]) beams.push(kit.beam(group, [x * .65, 5, 4], [.22, 0, x * -.015], 12, 1.6));
  const cables = []; for (const x of [-16, 16]) cables.push([[x, 0, -25], [x, 10.6, -25]], [[x, 10.6, -25], [x, 10.6, 23]]); kit.rods(group, cables, black, .018);
  const podium = new THREE.Group(); podium.position.set(-7.1, .95, -19.4); group.add(podium); kit.block(podium, [.7, 1.13, .64], kit.solid('#9ba389', .44, .2), [0, .56, 0], .035); kit.block(podium, [1.02, .08, .7], steel, [0, 1.17, .04], .02, [.12, 0, 0]); kit.rods(podium, [[[.15, 1.2, 0], [.15, 1.55, .06]], [[.15, 1.55, .06], [.15, 1.65, -.12]]], black, .014, 8);
  const brand = kit.text('BAEV', { width: 384, height: 160, background: '#9ba389', color: '#20271b', size: 103, weight: 600, align: 'center', padding: 12 }); kit.plane(podium, .62, .258, brand.texture, [0, .73, .332]);
  let monitor;
  if (final) { const body = new THREE.Group(); body.position.set(0, 1.5, -15.7); body.rotation.y = Math.PI; body.rotation.x = -.36; group.add(body); kit.block(body, [3.6, 1.8, .22], black, [0, 0, 0], .045); monitor = kit.text('ВАША ИСТОРИЯ', { width: 1024, height: 512, background: '#dfe1d1', color: '#242b21', size: 88, align: 'center', overline: 'BAEV / ЧТО ВАЖНО ОБЪЯСНИТЬ ВАМ?' }); kit.plane(body, 3.37, 1.57, monitor.texture, [0, 0, .12]); }
  const glow = new THREE.PointLight('#d9e5bb', 180, 33, 2); glow.position.set(0, 7, -21); group.add(glow); const fill = new THREE.PointLight('#b8c6a4', 48, 35, 2); fill.position.set(0, 8, 14); group.add(fill);
  return { group,
    update(t, detail, reduced) { const opening = final ? 1 : Math.min(1, .35 + t / 2.4); glow.intensity = 180 * opening; screen.material.color.setScalar(.5 + .5 * opening); beams.forEach((beam, i) => { beam.material.uniforms.uStrength.value = (.085 + (reduced ? 0 : Math.sin(t * .2 + i) * .009)) * opening; }); },
    setTitle(value) { if (!monitor) return; const c = monitor.context; c.fillStyle = '#dfe1d1'; c.fillRect(0, 0, 1024, 512); c.fillStyle = '#242b21'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = '400 21px Arial'; c.fillText('ВАША СЛЕДУЮЩАЯ ИСТОРИЯ', 512, 65); c.font = '500 72px Arial'; c.fillText(value.trim() || 'ВАША ИСТОРИЯ', 512, 256, 930); c.font = '400 23px Arial'; c.fillText('BAEV / ОТ МЫСЛИ К ВПЕЧАТЛЕНИЮ', 512, 455); monitor.texture.needsUpdate = true; }
  };
}
