import * as THREE from '../faithful/vendor/three.module.js';
import { titleGraphic } from './materials.js';
import { CASES, STORYBOARD } from './chapters.js';
import { buildTypeSculpture } from './typography.js';

function room(kit, name, warm = false) {
  const group = new THREE.Group();
  group.name = name;
  // A continuous floor-to-wall sweep removes the artificial horizon of a finite plane.
  const profile = [
    [0.0, 60],
    [0.0, -25],
  ];
  for (let i = 1; i <= 24; i++) {
    const angle = ((i / 24) * Math.PI) / 2;
    profile.push([12 * (1 - Math.cos(angle)), -25 - 12 * Math.sin(angle)]);
  }
  profile.push([45, -37]);
  const vertices = [],
    uv = [],
    indices = [];
  profile.forEach(([y, z], i) => {
    for (const x of [-85, 85]) {
      vertices.push(x, y - 0.14, z);
      uv.push(x < 0 ? 0 : 1, i / (profile.length - 1));
    }
    if (i < profile.length - 1) {
      const k = i * 2;
      indices.push(k, k + 1, k + 2, k + 1, k + 3, k + 2);
    }
  });
  const sweep = kit.own(new THREE.BufferGeometry());
  sweep.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  sweep.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  sweep.setIndex(indices);
  sweep.computeVertexNormals();
  const backdrop = kit.own(kit.surface().clone());
  backdrop.color.set('#343840');
  backdrop.roughness = 0.94;
  backdrop.metalness = 0.03;
  backdrop.side = THREE.DoubleSide;
  const cyc = kit.mesh(group, sweep, backdrop);
  cyc.receiveShadow = true;
  const slats = [];
  for (let x = -22; x <= 22; x += name === 'structure' ? 7.3 : 11)
    slats.push({ p: [x, 13.8, -8] });
  kit.instances(
    group,
    kit.box(0.09, 0.06, 29),
    kit.light(warm ? '#e1c6a8' : '#b4bac6', 0.45),
    slats,
  );
  const light = new THREE.PointLight(warm ? '#f0d9bd' : '#e3e9f4', 110, 45, 2);
  light.position.set(0, 12, 4);
  group.add(light);
  return group;
}
function dimension(kit, group, from, to) {
  kit.rods(group, [[from, to]], kit.light('#9aa4b6', 0.65), 0.008, 4);
}

export function buildLayers(kit) {
  const group = room(kit, 'inside'),
    parts = [],
    z = [-7, -4, -0.7, 2.7];
  parts.push(
    kit.block(
      group,
      [16, 9, 0.15],
      kit.solid('#dddeda', 0.76),
      [0, 5, z[0]],
      0.035,
    ),
  );
  const graphic = kit.canvas(1400, 788),
    c = graphic.context;
  c.strokeStyle = '#9496a0';
  c.lineWidth = 3;
  for (let i = 0; i < 5; i++) {
    c.beginPath();
    c.moveTo(780 + i * 55, 730);
    c.lineTo(600 + i * 65, 425);
    c.lineTo(840 + i * 70, 82);
    c.stroke();
  }
  c.fillStyle = '#353c49';
  c.fillRect(970, 480, 310, 210);
  graphic.texture.needsUpdate = true;
  parts.push(kit.plane(group, 16, 9, graphic.texture, [0, 5, z[1]], true));
  const label = kit.text('МЫСЛЬ.\nИМЕЕТ ВЕС.', {
    width: 1400,
    height: 788,
    size: 132,
    color: '#202126',
    padding: 75,
    weight: 600,
  });
  parts.push(kit.plane(group, 16, 9, label.texture, [0, 5, z[2]], true));
  const heading = kit.text('', {
    width: 1400,
    height: 788,
    color: '#656970',
    overline: 'BAEV / ДЕМОНСТРАЦИОННАЯ КОМПОЗИЦИЯ',
    subtitle: 'СОДЕРЖАНИЕ                  СЦЕНАРИЙ                  ФОРМА',
    padding: 75,
  });
  parts.push(kit.plane(group, 16, 9, heading.texture, [0, 5, z[3]], true));
  const frames = [];
  for (let i = 0; i < 4; i++) {
    const frame = new THREE.Group();
    group.add(frame);
    kit.frame(frame, 16, 9, 0.055, [0, 5, 0], kit.solid('#9b9ea5', 0.45, 0.4));
    frame.position.z = z[i];
    frames.push(frame);
  }
  dimension(kit, group, [-9.5, 0.18, -8], [-9.5, 0.18, 4]);
  for (let i = 0; i < 4; i++)
    dimension(kit, group, [-9.8, 0.18, z[i]], [-9.1, 0.18, z[i]]);
  return {
    group,
    update(t, detail) {
      parts.forEach((part, i) => {
        part.position.z = THREE.MathUtils.lerp(z[i], -1 + i * 0.08, detail);
        frames[i].position.z = part.position.z;
      });
    },
  };
}

export function buildMeaning(kit) {
  return buildTypeSculpture(kit, room(kit, 'meaning'));
}

export function buildStructure(kit) {
  const group = room(kit, 'structure');
  const positions = STORYBOARD.map((step) => step.position);
  const titles = STORYBOARD.map((step) => step.title);
  const subtitles = STORYBOARD.map((step) => step.subtitle);
  const paper = kit.solid('#deded9', 0.82, 0.02);
  const panels = [];
  for (let i = 0; i < positions.length; i++) {
    const panel = new THREE.Group();
    panel.position.set(...positions[i]);
    panel.rotation.y = STORYBOARD[i].yaw;
    group.add(panel);
    kit.block(panel, [7.7, 4.45, 0.04], paper, [0, 0, -0.055], 0.012);
    const face = kit.text(titles[i], {
      width: 1000,
      height: 580,
      size: 117,
      color: '#25262b',
      background: '#deded9',
      padding: 55,
      overline: `0${i + 1} / СЦЕНАРИЙ`,
      subtitle: subtitles[i],
    });
    panel.userData.face = kit.plane(panel, 7.6, 4.4, face.texture, [0, 0, 0]);
    panel.userData.face.userData.step = i;
    panel.updateMatrixWorld(true);
    panels.push(panel);
  }
  // The chapter is one folded storyboard, not four cards on poles.
  const vertices = [],
    indices = [];
  for (let i = 0; i < panels.length - 1; i++) {
    const left = panels[i],
      right = panels[i + 1];
    const points = [
      left.localToWorld(new THREE.Vector3(3.85, -2.225, -0.055)),
      left.localToWorld(new THREE.Vector3(3.85, 2.225, -0.055)),
      right.localToWorld(new THREE.Vector3(-3.85, -2.225, -0.055)),
      right.localToWorld(new THREE.Vector3(-3.85, 2.225, -0.055)),
    ];
    const offset = vertices.length / 3;
    points.forEach((point) => vertices.push(...point.toArray()));
    indices.push(
      offset,
      offset + 1,
      offset + 2,
      offset + 1,
      offset + 3,
      offset + 2,
    );
  }
  const fold = kit.own(new THREE.BufferGeometry());
  fold.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  fold.setIndex(indices);
  fold.computeVertexNormals();
  const reverse = kit.own(paper.clone());
  reverse.side = THREE.DoubleSide;
  const connected = kit.mesh(group, fold, reverse);
  connected.castShadow = true;
  kit.contactShadow(group, 32, 42, [0, -0.01, -6], 0.45);
  return {
    group,
    update(t, detail, reduced, step = 0) {
      panels.forEach((panel, i) =>
        panel.userData.face.material.color.setScalar(i === step ? 1 : 0.82),
      );
    },
  };
}
export function buildForm(kit) {
  const group = room(kit, 'form'),
    elements = [],
    guidelines = new THREE.Group();
  group.add(guidelines);
  const back = kit.block(
    group,
    [17.1, 9.6, 0.2],
    kit.solid('#dfdeda'),
    [0, 5, -2],
    0.035,
  );
  back.castShadow = true;
  const headline = kit.canvas(1400, 788),
    c = headline.context;
  c.fillStyle = '#21252b';
  c.font = '600 110px Arial';
  c.fillText('ВНИМАНИЕ', 65, 350, 740);
  c.fillText('К ГЛАВНОМУ.', 65, 490, 740);
  headline.texture.needsUpdate = true;
  elements.push(
    kit.plane(group, 17, 9.56, headline.texture, [0, 5.02, -1.87], true),
  );
  const heights = [1.2, 2.0, 2.7, 3.5, 4.3];
  for (let i = 0; i < 5; i++)
    elements.push(
      kit.block(
        group,
        [0.69, heights[i], 0.55],
        kit.solid(i === 4 ? '#343d50' : '#b1b1ae', 0.68),
        [3.6 + i * 0.82, 2.8 + heights[i] / 2, -1.73],
        0.025,
      ),
    );
  const footer = kit.text('', {
    width: 1400,
    height: 788,
    color: '#5e606b',
    overline: 'BAEV / ФОРМА СЛЕДУЕТ ЗА МЫСЛЬЮ',
    subtitle: 'КОМПОЗИЦИОННЫЙ ЭТЮД — НЕ КЛИЕНТСКИЕ ДАННЫЕ',
    padding: 65,
  });
  elements.push(
    kit.plane(group, 17, 9.56, footer.texture, [0, 5.03, -1.6], true),
  );
  for (let x = -7.7; x < 8.1; x += 1.31)
    dimension(kit, guidelines, [x, 0.95, -0.8], [x, 9.07, -0.8]);
  for (let y = 1; y < 9.2; y += 1.02)
    dimension(kit, guidelines, [-7.7, y, -0.8], [7.7, y, -0.8]);
  return {
    group,
    update(t, detail) {
      guidelines.visible = detail > 0.03;
      elements.forEach((element, i) => {
        element.position.z = -1.87 + i * 0.03 + detail * (i < 1 ? 2.0 : 4.0);
      });
    },
  };
}
export function buildGallery(kit, onAssetStatus) {
  const group = room(kit, 'projects'),
    paintings = [];
  const frames = CASES.map((entry, i) => {
    const wall = new THREE.Group();
    wall.position.set(entry.x, 5.2, 0);
    group.add(wall);
    kit.block(
      wall,
      [12.75, 8.7, 0.44],
      kit.solid('#20232a'),
      [0, -0.15, -0.15],
      0.03,
    );
    const placeholder = kit.text(entry.title, {
      width: 1200,
      height: 750,
      background: '#d1d0cc',
      color: '#23242b',
      size: 145,
      weight: 600,
      subtitle: entry.subtitle,
      overline: 'BAEV / ИЗБРАННЫЙ ПРОЕКТ',
    });
    const plane = kit.plane(
      wall,
      12.3,
      7.5,
      placeholder.texture,
      [0, 0.35, 0.1],
    );
    plane.userData.caseIndex = i;
    paintings.push(plane);
    kit.frame(
      wall,
      12.35,
      7.55,
      0.18,
      [0, 0.35, 0.08],
      kit.solid('#737781', 0.37, 0.65),
    );
    const label = kit.text(
      `${String(i + 1).padStart(2, '0')} / ${entry.title}`,
      { width: 1200, height: 90, color: '#d8d7d2', size: 35, padding: 20 },
    );
    kit.plane(wall, 12, 0.9, label.texture, [0, -4, 0.12], true);
    kit.block(
      wall,
      [9, 0.025, 0.025],
      kit.light('#dcd9ce', 0.8),
      [0, 4.6, 1.0],
    );
    const light = new THREE.PointLight('#d8ddef', 35, 15, 2);
    light.position.set(0, 5.2, 3);
    wall.add(light);
    const load = () =>
      new Promise((resolve) => {
        const image = new Image();
        image.decoding = 'async';
        image.onload = () => {
          if (kit.disposed) {
            resolve(false);
            return;
          }
          const max = 1600,
            ratio = Math.min(
              1,
              max / image.naturalWidth,
              max / image.naturalHeight,
            ),
            canvas = document.createElement('canvas');
          canvas.width = Math.max(1, Math.round(image.naturalWidth * ratio));
          canvas.height = Math.max(1, Math.round(image.naturalHeight * ratio));
          const c = canvas.getContext('2d');
          if (!c) {
            onAssetStatus?.(i, false);
            resolve(false);
            return;
          }
          c.drawImage(image, 0, 0, canvas.width, canvas.height);
          const texture = kit.texture(canvas);
          plane.material.map = texture;
          plane.material.needsUpdate = true;
          const aspect = canvas.width / canvas.height,
            frameAspect = 12.3 / 7.5;
          plane.scale.set(
            aspect > frameAspect ? 1 : aspect / frameAspect,
            aspect > frameAspect ? frameAspect / aspect : 1,
            1,
          );
          onAssetStatus?.(i, true);
          resolve(true);
        };
        image.onerror = () => {
          onAssetStatus?.(i, false);
          resolve(false);
        };
        image.src = entry.image;
      });
    return { load };
  });
  let loaded = false;
  return {
    group,
    load() {
      if (!loaded) {
        loaded = true;
        frames.forEach((frame) => frame.load());
      }
    },
    update(t, detail, reduced, selected = 0) {
      paintings.forEach((painting, i) =>
        painting.material.color.setScalar(i === selected ? 1 : 0.68),
      );
    },
  };
}
export function buildBackstage(kit) {
  const group = room(kit, 'backstage', true),
    steel = kit.solid('#707782', 0.4, 0.55),
    black = kit.solid('#202127', 0.8);
  const table = kit.block(
    group,
    [12, 0.22, 5.5],
    kit.solid('#909195', 0.77),
    [0, 1.8, -1],
    0.06,
  );
  table.castShadow = true;
  table.receiveShadow = true;
  for (const x of [-5.2, 5.2])
    for (const z of [-3.2, 1.2])
      kit.block(group, [0.12, 1.75, 0.12], steel, [x, 0.88, z]);
  kit.block(group, [11, 0.035, 0.11], kit.light('#e9ddd0', 0.9), [0, 8.1, -1]);
  kit.rods(
    group,
    [
      [
        [-4.5, 8.1, -1],
        [-4.5, 15.5, -1],
      ],
      [
        [4.5, 8.1, -1],
        [4.5, 15.5, -1],
      ],
    ],
    black,
    0.013,
    5,
  );
  kit.contactShadow(group, 15, 8, [0, -0.01, -1], 0.55);
  const sheets = [];
  ['СОДЕРЖАНИЕ', 'СТРУКТУРА', 'ФОРМА'].forEach((title, i) => {
    const paper = new THREE.Group();
    paper.position.set(-3.6 + i * 3.1, 1.95, 0.1);
    paper.rotation.set(-Math.PI / 2, 0, (i - 1) * -0.06);
    group.add(paper);
    kit.block(paper, [2.35, 3.1, 0.015], kit.solid('#e5e2dc'), [0, 0, -0.01]);
    const sheet = kit.canvas(600, 800),
      c = sheet.context;
    c.fillStyle = '#e9e6df';
    c.fillRect(0, 0, 600, 800);
    c.fillStyle = '#24252a';
    c.font = '600 45px Arial';
    c.fillText(title, 35, 85, 530);
    c.font = '400 20px Arial';
    c.fillText('BAEV / ДЕМОНСТРАЦИЯ ПОДХОДА', 35, 745);
    for (let j = 0; j < 5; j++) {
      c.fillStyle = '#adafab';
      c.fillRect(35, 165 + j * 95, 525, 1);
      c.fillStyle = '#323338';
      c.font = '400 26px Arial';
      c.fillText(
        [
          'Кому говорим',
          'Что объясняем',
          'Ключевой аргумент',
          'Главная мысль',
          'Следующий шаг',
        ][j],
        35,
        205 + j * 95,
      );
    }
    sheet.texture.needsUpdate = true;
    kit.plane(paper, 2.3, 3.07, sheet.texture, [0, 0, 0.01]);
    sheets.push(paper);
  });
  const monitor = new THREE.Group();
  monitor.position.set(0, 3.65, -2.9);
  group.add(monitor);
  kit.block(monitor, [4.3, 2.1, 0.18], black, [0, 0, 0], 0.04);
  const graphic = titleGraphic(kit);
  kit.plane(monitor, 4.1, 1.794, graphic.texture, [0, 0, 0.102]);
  kit.block(monitor, [0.12, 1.55, 0.12], steel, [0, -1.45, -0.07]);
  kit.block(monitor, [1.55, 0.04, 0.64], steel, [0, -1.72, -0.02], 0.012);
  const keyboard = [];
  for (let row = 0; row < 4; row++)
    for (let col = 0; col < 12; col++)
      keyboard.push({ p: [3.0 + col * 0.11, 1.955, -2.05 + row * 0.12] });
  kit.instances(
    group,
    kit.box(0.09, 0.045, 0.09, 0.006),
    kit.solid('#c1c2c2'),
    keyboard,
  );
  for (let j = 0; j < 7; j++)
    kit.block(
      group,
      [1.6, 0.018, 2.1],
      kit.solid(j % 2 ? '#b0b0b0' : '#e2dfd7'),
      [-4.4, 1.94 + j * 0.02, -2.25],
      0.005,
      [0, j * 0.006, 0],
    );
  kit.rods(
    group,
    [
      [
        [5, 1.9, -2],
        [5, 4.3, -2],
      ],
      [
        [5, 4.3, -2],
        [3.8, 4.5, -2],
      ],
    ],
    steel,
    0.04,
    10,
  );
  kit.block(group, [1.1, 0.1, 0.45], black, [3.8, 4.48, -2], 0.035);
  kit.block(
    group,
    [0.91, 0.015, 0.35],
    kit.light('#f3debf', 1),
    [3.8, 4.42, -2],
  );
  const bulb = new THREE.PointLight('#ffdfab', 13, 6, 2);
  bulb.position.set(3.8, 4.3, -2);
  group.add(bulb);
  return {
    group,
    update(t, detail, reduced, selected = 0) {
      sheets.forEach((sheet, i) => {
        sheet.position.y = 1.95 + (i === selected ? detail * 0.6 : 0);
        sheet.rotation.x = -Math.PI / 2 + (i === selected ? detail * 0.28 : 0);
      });
    },
  };
}
