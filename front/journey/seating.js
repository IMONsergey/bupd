import * as THREE from '../faithful/vendor/three.module.js';

/** Low-tessellation bevels for repeated sub-pixel chair hardware, not the cushions. */
export function seatHardware(kit, width, height, depth, radius) {
  return kit.geometry(`seat-hardware/${width}/${height}/${depth}/${radius}`, () => {
    const r = Math.min(radius, width / 3, height / 3, depth / 3);
    const shape = new THREE.Shape();
    const left = -width / 2, right = width / 2;
    const low = -height / 2, high = height / 2;
    shape.moveTo(left + r, low);
    shape.lineTo(right - r, low);
    shape.quadraticCurveTo(right, low, right, low + r);
    shape.lineTo(right, high - r);
    shape.quadraticCurveTo(right, high, right - r, high);
    shape.lineTo(left + r, high);
    shape.quadraticCurveTo(left, high, left, high - r);
    shape.lineTo(left, low + r);
    shape.quadraticCurveTo(left, low, left + r, low);
    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: Math.max(0.01, depth - r * 2),
      bevelEnabled: true,
      bevelSize: r * 0.5,
      bevelThickness: r,
      bevelSegments: 1,
      curveSegments: 2,
      steps: 1,
    });
    geometry.translate(0, 0, -depth / 2 + r);
    geometry.computeVertexNormals();
    return geometry;
  });
}
