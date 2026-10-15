import * as THREE from '../faithful/vendor/three.module.js';

const DEPTH = 0.58;
const LETTERS = 'ПОНЯТНО';
const DEPTHS = [2, -3.5, 1, -5, -1, -4, 2];

function polygon(points) {
  const shape = new THREE.Shape();
  points.forEach(([x, y], index) => {
    if (index === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  });
  shape.closePath();
  return shape;
}

/** Original geometric lettering, not font files or images on rectangular boards. */
function outline(letter) {
  if (letter === 'П') {
    return polygon([
      [-0.8, -1.8],
      [-0.8, 1.8],
      [0.8, 1.8],
      [0.8, -1.8],
      [0.32, -1.8],
      [0.32, 1.32],
      [-0.32, 1.32],
      [-0.32, -1.8],
    ]);
  }
  if (letter === 'Н') {
    return polygon([
      [-0.8, -1.8],
      [-0.8, 1.8],
      [-0.32, 1.8],
      [-0.32, 0.24],
      [0.32, 0.24],
      [0.32, 1.8],
      [0.8, 1.8],
      [0.8, -1.8],
      [0.32, -1.8],
      [0.32, -0.24],
      [-0.32, -0.24],
      [-0.32, -1.8],
    ]);
  }
  if (letter === 'Т') {
    return polygon([
      [-0.9, 1.8],
      [0.9, 1.8],
      [0.9, 1.32],
      [0.24, 1.32],
      [0.24, -1.8],
      [-0.24, -1.8],
      [-0.24, 1.32],
      [-0.9, 1.32],
    ]);
  }
  if (letter === 'О') {
    const shape = new THREE.Shape();
    shape.absellipse(0, 0, 0.86, 1.8, 0, Math.PI * 2, false);
    const counter = new THREE.Path();
    counter.absellipse(0, 0, 0.37, 1.31, 0, Math.PI * 2, true);
    shape.holes.push(counter);
    return shape;
  }
  if (letter === 'Я') {
    const shape = new THREE.Shape();
    shape.moveTo(0.8, -1.8);
    shape.lineTo(0.8, 1.8);
    shape.lineTo(-0.03, 1.8);
    shape.bezierCurveTo(-1.06, 1.8, -1.05, 0.18, -0.16, 0.1);
    shape.lineTo(-0.87, -1.8);
    shape.lineTo(-0.3, -1.8);
    shape.lineTo(0.37, -0.08);
    shape.lineTo(0.37, -1.8);
    shape.closePath();
    const counter = new THREE.Path();
    counter.moveTo(0.37, 1.32);
    counter.lineTo(-0.02, 1.32);
    counter.bezierCurveTo(-0.45, 1.32, -0.46, 0.54, -0.01, 0.54);
    counter.lineTo(0.37, 0.54);
    counter.closePath();
    shape.holes.push(counter);
    return shape;
  }
  throw new Error(`Unsupported BAEV display glyph: ${letter}`);
}

export function buildTypeSculpture(kit, group) {
  const front = kit.solid('#e8e5df', 0.48, 0.12);
  const side = kit.solid('#848c99', 0.42, 0.4);
  const letters = [...LETTERS].map((letter, index) => {
    const geometry = kit.geometry(`display-glyph/${letter}`, () => {
      const result = new THREE.ExtrudeGeometry(outline(letter), {
        depth: DEPTH,
        bevelEnabled: true,
        bevelSize: 0.045,
        bevelThickness: 0.045,
        bevelSegments: 3,
        curveSegments: 16,
        steps: 1,
      });
      result.translate(0, 0, -DEPTH / 2);
      result.computeBoundingBox();
      return result;
    });
    const mesh = kit.mesh(group, geometry, [front, side]);
    mesh.name = `glyph-${index}-${letter}`;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  });

  const guideLines = [];
  for (let x = -12; x <= 12; x += 2.18)
    guideLines.push([
      [x, 0.015, -11],
      [x, 0.015, 9],
    ]);
  kit.rods(group, guideLines, kit.light('#8e939e', 0.35), 0.007, 4);
  const caption = kit.text('ОДНА МЫСЛЬ. ТОЧНЫЙ ФОКУС.', {
    width: 1400,
    height: 140,
    size: 46,
    align: 'center',
    color: '#c8c8cd',
  });
  kit.plane(group, 15, 1.5, caption.texture, [0, 0.04, 5], true, [
    -Math.PI / 2,
    0,
    0,
  ]);

  let viewportWidth = 0;
  let viewportHeight = 0;
  // Front surfaces align from each layout's focal point, including portrait.
  function reframe(width) {
    viewportWidth = width;
    viewportHeight = window.innerHeight;
    const distance =
      width < 760 || window.innerWidth / window.innerHeight < 0.9 ? 39 : 24;
    letters.forEach((mesh, index) => {
      const scale = (distance - DEPTHS[index]) / (distance + DEPTH / 2 + 0.045);
      mesh.scale.setScalar(scale);
      mesh.position.set((index - 3) * 2.18 * scale, 4.1, DEPTHS[index]);
    });
  }
  reframe(window.innerWidth);

  return {
    group,
    reframe,
    update(time, detail) {
      if (
        viewportWidth !== window.innerWidth ||
        viewportHeight !== window.innerHeight
      )
        reframe(window.innerWidth);
      letters.forEach((mesh, index) => {
        mesh.rotation.y = (1 - detail) * (index % 2 ? -0.055 : 0.055);
      });
    },
  };
}
