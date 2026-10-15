import * as THREE from 'three';
import { PROJECTS } from './story.js';

export function graphicTexture(kind = 'keynote') {
  const canvas = document.createElement('canvas');
  canvas.width = 1600;
  canvas.height = 660;
  const c = canvas.getContext('2d');
  c.fillStyle = '#e9e4da';
  c.fillRect(0, 0, 1600, 660);
  c.fillStyle = '#1c2027';
  c.textBaseline = 'alphabetic';
  c.font = '600 34px Arial';
  c.fillText('BAEV', 70, 64);
  c.font = '400 17px Arial';
  c.textAlign = 'right';
  c.fillText('ПУБЛИЧНАЯ КОММУНИКАЦИЯ', 1530, 61);
  c.textAlign = 'left';
  c.strokeStyle = '#b5b0a8';
  c.lineWidth = 1;
  c.beginPath();
  c.moveTo(70, 97);
  c.lineTo(1530, 97);
  c.stroke();
  c.font = '500 111px Arial';
  const lines =
    kind === 'keynote'
      ? ['У каждой идеи', 'есть аудитория.']
      : kind === 'meaning'
        ? ['Сложное.', 'Понятно.']
        : ['Содержание.', 'Структура. Форма.'];
  lines.forEach((line, i) => c.fillText(line, 70, 300 + i * 125, 1400));
  c.font = '400 20px Arial';
  c.fillText(
    kind === 'keynote' ? 'ОТ МЫСЛИ К ВПЕЧАТЛЕНИЮ' : 'BAEV / АВТОРСКИЙ ЭТЮД',
    70,
    600,
  );
  c.strokeStyle = '#a48360';
  c.lineWidth = 3;
  for (let n = 0; n < 6; n++) {
    c.beginPath();
    c.moveTo(1030 + n * 22, 630);
    c.bezierCurveTo(1540, 460, 1020, 70, 1500 + n * 7, 140);
    c.stroke();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}
export function createKeynote(hall) {
  hall.traverse((o) => {
    if (
      o.isMesh &&
      ['Screen type', 'Screen / warm white'].includes(o.material.name)
    )
      o.visible = false;
  });
  const texture = graphicTexture();
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    toneMapped: false,
    fog: false,
  });
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(20.55, 8.12), material);
  plane.position.set(-1.3, 5.6, -18.06);
  hall.add(plane);
  const stripMaterial = new THREE.MeshBasicMaterial({
    color: '#dec098',
    toneMapped: false,
  });
  const strip = new THREE.Mesh(
    new THREE.TorusGeometry(1.8, 0.012, 5, 70, Math.PI * 1.6),
    stripMaterial,
  );
  strip.position.set(5, 5.7, -18);
  strip.rotation.z = -0.8;
  hall.add(strip);
  return {
    texture,
    update(progress, seconds, reduced) {
      const reveal = reduced ? 1 : THREE.MathUtils.smoothstep(seconds, 0, 2.5);
      material.color.setScalar(0.08 + 0.92 * reveal);
      strip.visible = progress > 0.34 && progress < 0.465;
      strip.position.z =
        -18 + THREE.MathUtils.smoothstep(progress, 0.34, 0.45) * 0.8;
    },
  };
}
function sheet(width, height, curve = 0, segments = 48) {
  const geo = new THREE.PlaneGeometry(width, height, segments, 8),
    p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i);
    p.setZ(i, curve * x * x);
  }
  geo.computeVertexNormals();
  return geo;
}
function ribbon(points, width, twist = 0) {
  const curve = new THREE.CatmullRomCurve3(
      points.map((p) => new THREE.Vector3(...p)),
    ),
    vs = [],
    uvs = [],
    indices = [];
  for (let i = 0; i <= 180; i++) {
    const t = i / 180,
      p = curve.getPoint(t),
      tangent = curve.getTangent(t);
    let side = new THREE.Vector3(0, 1, 0).cross(tangent).normalize();
    if (side.length() < 0.1) side.set(1, 0, 0);
    side.applyAxisAngle(tangent, Math.sin(t * Math.PI * 2 + twist) * 1.35);
    const w = width * (0.7 + 0.3 * Math.sin(t * Math.PI));
    for (const sign of [-1, 1]) {
      const v = p.clone().addScaledVector(side, (sign * w) / 2);
      vs.push(...v.toArray());
      uvs.push(sign < 0 ? 0 : 1, t);
    }
    if (i < 180) {
      const j = i * 2;
      indices.push(j, j + 1, j + 2, j + 1, j + 3, j + 2);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(vs, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}
export function createThoughtWorld() {
  const group = new THREE.Group();
  group.name = 'Inside the presentation';
  group.position.z = -100;
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(90, 105),
    new THREE.MeshStandardMaterial({
      color: '#191d25',
      roughness: 0.43,
      metalness: 0.16,
    }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, -0.04, -12);
  floor.receiveShadow = true;
  group.add(floor);
  const shell = new THREE.MeshStandardMaterial({
    color: '#e5ded1',
    roughness: 0.37,
    metalness: 0.23,
    side: THREE.DoubleSide,
  });
  const band = new THREE.Mesh(
    ribbon(
      [
        [0, 4, 20],
        [-8, 3, 8],
        [2, 9, -1],
        [9, 3, -8],
        [-3, 1, -19],
        [0, 3, -28],
      ],
      4.1,
    ),
    shell,
  );
  band.castShadow = true;
  band.receiveShadow = true;
  group.add(band);
  const inner = new THREE.Mesh(
    ribbon(
      [
        [3, 5, 17],
        [-6, 6, 5],
        [1, 11, -3],
        [12, 6, -8],
        [5, 1, -21],
      ],
      0.16,
      1.3,
    ),
    new THREE.MeshStandardMaterial({
      color: '#bea07b',
      roughness: 0.27,
      metalness: 0.72,
    }),
  );
  group.add(inner);
  const seams = new THREE.Group();
  group.add(seams);
  for (let n = 0; n < 12; n++) {
    const path = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-17 + n * 0.25, 0.06, 15),
      new THREE.Vector3(-14 + n * 0.25, 0.06, -2),
      new THREE.Vector3(5 + n * 0.25, 0.06, -21),
      new THREE.Vector3(12 + n * 0.25, 0.06, -39),
    ]);
    const mesh = new THREE.Mesh(
      new THREE.TubeGeometry(path, 60, 0.012, 4, false),
      new THREE.MeshBasicMaterial({
        color: n % 3 === 0 ? '#a98c67' : '#566473',
      }),
    );
    seams.add(mesh);
  }
  const lamp = new THREE.PointLight('#d8e5ff', 60, 45, 2);
  lamp.position.set(-5, 12, 0);
  group.add(lamp);
  const warm = new THREE.PointLight('#ffd9aa', 80, 35, 2);
  warm.position.set(10, 9, -23);
  group.add(warm);
  const portal = new THREE.Mesh(
    new THREE.PlaneGeometry(32, 16),
    new THREE.MeshBasicMaterial({
      map: graphicTexture(),
      toneMapped: false,
      side: THREE.DoubleSide,
    }),
  );
  portal.position.set(0, 5, 20);
  group.add(portal);
  const gallery = new THREE.Group();
  gallery.position.set(0, 5.7, -35);
  group.add(gallery);
  const face = new THREE.Mesh(
    sheet(18, 10, 0.006),
    new THREE.MeshBasicMaterial({
      color: '#161b24',
      toneMapped: false,
      side: THREE.DoubleSide,
    }),
  );
  gallery.add(face);
  const images = [],
    errors = new Set();
  let started = false,
    disposed = false,
    selected = 0;
  const loader = new THREE.TextureLoader();
  const projectLight = new THREE.RectAreaLight('#e6efff', 4, 18, 8);
  projectLight.position.set(0, 6, -34);
  projectLight.lookAt(0, 2, -20);
  group.add(projectLight);
  function select(index) {
    selected = index;
    const tex = images[index];
    if (!tex) return;
    face.material.map = tex;
    face.material.color.set('#ffffff');
    face.material.needsUpdate = true;
    const aspect = tex.image.width / tex.image.height;
    face.scale.set(
      aspect >= 1.8 ? 1 : aspect / 1.8,
      aspect >= 1.8 ? 1.8 / aspect : 1,
      1,
    );
  }
  function loadProjects(notify) {
    if (started) return;
    started = true;
    PROJECTS.forEach((p, i) =>
      loader.load(
        `${import.meta.env.BASE_URL}media/projects/${p.image}`,
        (tex) => {
          if (disposed) {
            tex.dispose();
            return;
          }
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.anisotropy = 4;
          images[i] = tex;
          if (i === selected) select(i);
          notify?.();
        },
        undefined,
        () => {
          errors.add(i);
          notify?.();
        },
      ),
    );
  }
  return {
    group,
    loadProjects,
    select,
    get failedProject() {
      return errors.has(selected);
    },
    get projectsLoaded() {
      return images.filter(Boolean).length;
    },
    update(progress) {
      gallery.visible = progress >= 0.73;
      portal.visible = progress < 0.5;
      band.scale.x =
        1 - THREE.MathUtils.smoothstep(progress, 0.56, 0.75) * 0.28;
      inner.rotation.y =
        THREE.MathUtils.smoothstep(progress, 0.56, 0.75) * 0.15;
    },
    dispose() {
      disposed = true;
      images.forEach((t) => t.dispose());
    },
  };
}
