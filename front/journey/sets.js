import * as THREE from '../faithful/vendor/three.module.js';
import { titleGraphic } from './materials.js';
import { CASES } from './chapters.js';

function room(kit, name, warm = false) {
  const group = new THREE.Group(); group.name = name; kit.floor(group, [65, .25, 67]); const slats = [];
  for (let x = -27; x <= 27; x += 1.8) slats.push({ p: [x, 15.5, -7] });
  kit.instances(group, kit.box(.06, .06, 45), kit.light(warm ? '#d8c7a1' : '#a9b89b', .45), slats);
  const lines = []; for (const x of [-24, 24]) lines.push([[x, 0, -29], [x, 15.5, -29]], [[x, 15.5, -29], [x, 15.5, 15]]); kit.rods(group, lines, kit.solid('#505847', .52, .5), .05);
  const light = new THREE.PointLight(warm ? '#edd9b6' : '#dce6c8', 140, 45, 2); light.position.set(0, 12, 4); group.add(light); return group;
}
function dimension(kit, group, from, to) { kit.rods(group, [[from, to]], kit.light('#91a180', .65), .008, 4); }

export function buildLayers(kit) {
  const group = room(kit, 'inside'), parts = [], z = [-7, -4, -.7, 2.7];
  parts.push(kit.block(group, [16, 9, .15], kit.solid('#d2d6c1', .76), [0, 5, z[0]], .035));
  const graphic = kit.canvas(1400, 788), c = graphic.context; c.strokeStyle = '#758268'; c.lineWidth = 3;
  for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(780 + i * 55, 730); c.lineTo(600 + i * 65, 425); c.lineTo(840 + i * 70, 82); c.stroke(); } c.fillStyle = '#657c53'; c.fillRect(970, 480, 310, 210); graphic.texture.needsUpdate = true;
  parts.push(kit.plane(group, 16, 9, graphic.texture, [0, 5, z[1]], true));
  const label = kit.text('СЛОЖНОЕ\nСТАНОВИТСЯ\nПОНЯТНЫМ.', { width: 1400, height: 788, size: 132, color: '#252e20', padding: 75, weight: 600 }); parts.push(kit.plane(group, 16, 9, label.texture, [0, 5, z[2]], true));
  const heading = kit.text('', { width: 1400, height: 788, color: '#38432c', overline: 'BAEV / ДЕМОНСТРАЦИОННАЯ КОМПОЗИЦИЯ', subtitle: 'СОДЕРЖАНИЕ                  СЦЕНАРИЙ                  ФОРМА', padding: 75 }); parts.push(kit.plane(group, 16, 9, heading.texture, [0, 5, z[3]], true));
  const frames = []; for (let i = 0; i < 4; i++) { const frame = new THREE.Group(); group.add(frame); kit.frame(frame, 16, 9, .055, [0, 5, 0], kit.solid('#a6b098', .45, .4)); frame.position.z = z[i]; frames.push(frame); }
  dimension(kit, group, [-9.5, .18, -8], [-9.5, .18, 4]); for (let i = 0; i < 4; i++) dimension(kit, group, [-9.8, .18, z[i]], [-9.1, .18, z[i]]);
  return { group, update(t, detail) { parts.forEach((part, i) => { part.position.z = THREE.MathUtils.lerp(z[i], -1 + i * .08, detail); frames[i].position.z = part.position.z; }); } };
}
export function buildMeaning(kit) {
  const group = room(kit, 'meaning'), letters = [], word = 'ПОНЯТНО';
  for (let i = 0; i < word.length; i++) {
    const depth = [2, -3.5, 1, -5, -1, -4, 2][i], ratio = (24 - depth) / 24, part = new THREE.Group(); part.position.set((i - 3) * 1.94 * ratio, 4.1, depth); group.add(part);
    const body = kit.block(part, [1.68 * ratio, 3.6 * ratio, .56], kit.solid('#bdc7ad', .63, .05), [0, 0, 0], .08); body.castShadow = true;
    const letter = kit.text(word[i], { width: 320, height: 560, background: '#bdc7ad', color: '#253020', size: 325, weight: 600, align: 'center', padding: 20 }); kit.plane(part, 1.65 * ratio, 3.55 * ratio, letter.texture, [0, 0, .29]); letters.push(part); dimension(kit, group, [part.position.x, .02, -9], [part.position.x, .02, 10]);
  }
  const focus = kit.text('ОДНА МЫСЛЬ. ТОЧНЫЙ ФОКУС.', { width: 1400, height: 140, size: 46, align: 'center', color: '#a8b49a' }); kit.plane(group, 15, 1.5, focus.texture, [0, .04, 5], true, [-Math.PI / 2, 0, 0]);
  return { group, update(t, detail) { letters.forEach((letter, i) => { letter.rotation.y = (1 - detail) * (i % 2 ? -.035 : .04); }); } };
}
export function buildStructure(kit) {
  const group = room(kit, 'structure'), panels = [], positions = [[-9, 3.7, 7], [3, 4.2, -2], [-4, 5.0, -12], [7, 5.8, -22]], titles = ['Контекст', 'Аргумент', 'Решение', 'Следующий\nшаг'], labels = ['Что происходит', 'Почему это важно', 'Что предлагаем', 'К чему приходим'];
  const points = [[-11, .2, 14], ...positions.map(([x, y, z]) => [x, .8, z + 1]), [10, .2, -29]].map(p => new THREE.Vector3(...p)), curve = new THREE.CatmullRomCurve3(points, false, 'centripetal');
  const vertices = [], indices = [], normals = [], N = 100;
  for (let i = 0; i <= N; i++) { const u = i / N, p = curve.getPoint(u), tangent = curve.getTangent(u), cross = new THREE.Vector3(tangent.z, 0, -tangent.x).normalize(), rise = Math.sin(u * Math.PI * 4) * .3; for (const side of [-1, 1]) { const v = p.clone().addScaledVector(cross, side * 1.05); v.y += rise; vertices.push(v.x, v.y, v.z); normals.push(0, 1, 0); } if (i < N) { const a = i * 2; indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); } }
  const ribbon = kit.own(new THREE.BufferGeometry()); ribbon.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3)); ribbon.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3)); ribbon.setIndex(indices); ribbon.computeVertexNormals();
  kit.mesh(group, ribbon, kit.own(new THREE.MeshStandardMaterial({ color: '#c2ceb0', side: THREE.DoubleSide, roughness: .64, metalness: .16 }))); kit.mesh(group, kit.own(new THREE.TubeGeometry(curve, 100, .025, 6, false)), kit.light('#dae7c9', .9));
  positions.forEach((pos, i) => { const panel = new THREE.Group(); panel.position.set(...pos); panel.rotation.y = i % 2 ? -.14 : .16; group.add(panel); kit.block(panel, [7.7, 4.45, .17], kit.solid('#525e45', .7), [0, 0, -.12], .04); const face = kit.text(titles[i], { width: 1000, height: 580, size: 120, color: '#273021', background: '#d4dcc7', padding: 55, overline: `0${i + 1} / СЦЕНАРИЙ`, subtitle: labels[i] }); const picture = kit.plane(panel, 7.6, 4.4, face.texture, [0, 0, 0]); picture.userData.step = i; kit.rods(panel, [[[-3, -2.2, -.18], [-3, -pos[1], -.18]], [[3, -2.2, -.18], [3, -pos[1], -.18]]], kit.solid('#444f3c', .4, .6), .055); panels.push(panel); });
  return { group, update(t, detail, reduced, step = 0) { panels.forEach((panel, i) => { panel.position.y = positions[i][1] + (i === step ? .38 : 0); panel.children[1].material.color.setScalar(i === step ? 1 : .69); }); } };
}
export function buildForm(kit) {
  const group = room(kit, 'form'), elements = [], guidelines = new THREE.Group(); group.add(guidelines);
  const back = kit.block(group, [17.1, 9.6, .2], kit.solid('#d2d9c3'), [0, 5, -2], .035); back.castShadow = true;
  const headline = kit.canvas(1400, 788), c = headline.context; c.fillStyle = '#263021'; c.font = '600 110px Arial'; c.fillText('ВНИМАНИЕ', 65, 350, 740); c.fillText('К ГЛАВНОМУ.', 65, 490, 740); headline.texture.needsUpdate = true;
  elements.push(kit.plane(group, 17, 9.56, headline.texture, [0, 5.02, -1.87], true));
  const heights = [1.2, 2.0, 2.7, 3.5, 4.3]; for (let i = 0; i < 5; i++) elements.push(kit.block(group, [.69, heights[i], .15], kit.solid(i === 4 ? '#597848' : '#abb997', .68), [3.6 + i * .82, 2.8 + heights[i] / 2, -1.73], .025));
  const footer = kit.text('', { width: 1400, height: 788, color: '#4f5d41', overline: 'BAEV / ФОРМА СЛЕДУЕТ ЗА МЫСЛЬЮ', subtitle: 'КОМПОЗИЦИОННЫЙ ЭТЮД — НЕ КЛИЕНТСКИЕ ДАННЫЕ', padding: 65 }); elements.push(kit.plane(group, 17, 9.56, footer.texture, [0, 5.03, -1.6], true));
  for (let x = -7.7; x < 8.1; x += 1.31) dimension(kit, guidelines, [x, .95, -.8], [x, 9.07, -.8]); for (let y = 1; y < 9.2; y += 1.02) dimension(kit, guidelines, [-7.7, y, -.8], [7.7, y, -.8]);
  return { group, update(t, detail) { guidelines.visible = detail > .03; elements.forEach((element, i) => { element.position.z = -1.87 + i * .03 + detail * (i < 1 ? 2.0 : 4.0); }); } };
}
export function buildGallery(kit, onAssetStatus) {
  const group = room(kit, 'projects'), paintings = [];
  const frames = CASES.map((entry, i) => {
    const wall = new THREE.Group(); wall.position.set(entry.x, 5.2, 0); group.add(wall); kit.block(wall, [12.75, 8.7, .44], kit.solid('#232c1f'), [0, -.15, -.15], .03);
    const placeholder = kit.text(entry.title, { width: 1200, height: 750, background: '#bcc9ad', color: '#273020', size: 145, weight: 600, subtitle: entry.subtitle, overline: 'BAEV / ИЗБРАННЫЙ ПРОЕКТ' });
    const plane = kit.plane(wall, 12.3, 7.5, placeholder.texture, [0, .35, .10]); plane.userData.caseIndex = i; paintings.push(plane); kit.frame(wall, 12.35, 7.55, .18, [0, .35, .08], kit.solid('#7c886c', .37, .65));
    const label = kit.text(`${String(i + 1).padStart(2, '0')} / ${entry.title}`, { width: 1200, height: 90, color: '#cbd7bb', size: 35, padding: 20 }); kit.plane(wall, 12, .9, label.texture, [0, -4, .12], true); kit.block(wall, [9, .025, .025], kit.light('#c2cfac', .8), [0, 4.6, 1.0]); const light = new THREE.PointLight('#dbe5c4', 35, 15, 2); light.position.set(0, 5.2, 3); wall.add(light);
    const load = () => new Promise(resolve => {
      const image = new Image(); image.decoding = 'async'; image.onload = () => { const max = 1600, ratio = Math.min(1, max / image.naturalWidth, max / image.naturalHeight), canvas = document.createElement('canvas'); canvas.width = Math.max(1, Math.round(image.naturalWidth * ratio)); canvas.height = Math.max(1, Math.round(image.naturalHeight * ratio)); const c = canvas.getContext('2d'); c.drawImage(image, 0, 0, canvas.width, canvas.height); const texture = kit.texture(canvas); plane.material.map = texture; plane.material.needsUpdate = true; const aspect = canvas.width / canvas.height, frameAspect = 12.3 / 7.5; plane.scale.set(aspect > frameAspect ? 1 : aspect / frameAspect, aspect > frameAspect ? frameAspect / aspect : 1, 1); onAssetStatus?.(i, true); resolve(true); }; image.onerror = () => { onAssetStatus?.(i, false); resolve(false); }; image.src = entry.image;
    }); return { load };
  });
  let loaded = false; return { group, load() { if (!loaded) { loaded = true; frames.forEach(frame => frame.load()); } }, update(t, detail, reduced, selected = 0) { paintings.forEach((painting, i) => painting.material.color.setScalar(i === selected ? 1 : .68)); } };
}
export function buildBackstage(kit) {
  const group = room(kit, 'backstage', true), steel = kit.solid('#515b44', .4, .55), black = kit.solid('#22271d', .8);
  const table = kit.block(group, [12, .22, 5.5], kit.solid('#939b81', .77), [0, 1.8, -1], .06); table.castShadow = true; table.receiveShadow = true;
  for (const x of [-5.2, 5.2]) for (const z of [-3.2, 1.2]) kit.block(group, [.12, 1.75, .12], steel, [x, .88, z]); kit.block(group, [11, .035, .11], kit.light('#eddfbc', .9), [0, 8.1, -1]); kit.rods(group, [[[-4.5, 8.1, -1], [-4.5, 15.5, -1]], [[4.5, 8.1, -1], [4.5, 15.5, -1]]], black, .013, 5);
  const sheets = []; ['СОДЕРЖАНИЕ', 'СТРУКТУРА', 'ФОРМА'].forEach((title, i) => {
    const paper = new THREE.Group(); paper.position.set(-3.6 + i * 3.1, 1.95, .1); paper.rotation.set(-Math.PI / 2, 0, (i - 1) * -.06); group.add(paper); kit.block(paper, [2.35, 3.1, .015], kit.solid('#dcdece'), [0, 0, -.01]); const sheet = kit.canvas(600, 800), c = sheet.context; c.fillStyle = '#e5e6d8'; c.fillRect(0, 0, 600, 800); c.fillStyle = '#303928'; c.font = '600 45px Arial'; c.fillText(title, 35, 85, 530); c.font = '400 20px Arial'; c.fillText('BAEV / ДЕМОНСТРАЦИЯ ПОДХОДА', 35, 745);
    for (let j = 0; j < 5; j++) { c.fillStyle = '#a8b197'; c.fillRect(35, 165 + j * 95, 525, 1); c.fillStyle = '#35422a'; c.font = '400 26px Arial'; c.fillText(['Кому говорим', 'Что объясняем', 'Ключевой аргумент', 'Главная мысль', 'Следующий шаг'][j], 35, 205 + j * 95); } sheet.texture.needsUpdate = true; kit.plane(paper, 2.3, 3.07, sheet.texture, [0, 0, .01]); sheets.push(paper);
  });
  const monitor = new THREE.Group(); monitor.position.set(0, 3.65, -2.9); group.add(monitor); kit.block(monitor, [4.3, 2.5, .18], black, [0, 0, 0], .04); const graphic = titleGraphic(kit); kit.plane(monitor, 4.1, 2.29, graphic.texture, [0, 0, .102]); kit.block(monitor, [.12, 1.55, .12], steel, [0, -1.45, -.07]); kit.block(monitor, [1.55, .04, .64], steel, [0, -1.72, -.02], .012);
  const keyboard = []; for (let row = 0; row < 4; row++) for (let col = 0; col < 12; col++) keyboard.push({ p: [3.0 + col * .11, 1.955, -2.05 + row * .12] }); kit.instances(group, kit.box(.09, .045, .09, .006), kit.solid('#b9c1a9'), keyboard);
  for (let j = 0; j < 7; j++) kit.block(group, [1.6, .018, 2.1], kit.solid(j % 2 ? '#c1c9b1' : '#dbe0ce'), [-4.4, 1.94 + j * .02, -2.25], .005, [0, j * .006, 0]);
  kit.rods(group, [[[5, 1.9, -2], [5, 4.3, -2]], [[5, 4.3, -2], [3.8, 4.5, -2]]], steel, .04, 10); kit.block(group, [1.1, .10, .45], black, [3.8, 4.48, -2], .035); kit.block(group, [.91, .015, .35], kit.light('#f0dfb8', 1), [3.8, 4.42, -2]); const bulb = new THREE.PointLight('#ffdfab', 13, 6, 2); bulb.position.set(3.8, 4.3, -2); group.add(bulb);
  return { group, update(t, detail, reduced, selected = 0) { sheets.forEach((sheet, i) => { sheet.position.y = 1.95 + (i === selected ? detail * .6 : 0); sheet.rotation.x = -Math.PI / 2 + (i === selected ? detail * .28 : 0); }); } };
}
