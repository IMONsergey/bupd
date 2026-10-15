import * as THREE from '../faithful/vendor/three.module.js';
/** A small, generated studio environment. No HDR network request or per-frame capture. */
export function createEnvironment(renderer) {
  const environment = new THREE.Scene();
  environment.background = new THREE.Color('#343841');
  const geometry = new THREE.PlaneGeometry(1, 1);
  const surfaces = [];
  const boxes = [
    { position: [-8, 7, 2], size: [6, 11], power: 4.0, color: '#e5e9ef' },
    { position: [10, 8, -6], size: [3, 13], power: 3.0, color: '#f2e8dc' },
    { position: [0, 15, 0], size: [12, 4], power: 2.5, color: '#f6f4ef' },
  ];
  for (const box of boxes) {
    const material = new THREE.MeshBasicMaterial({
      color: new THREE.Color(box.color).multiplyScalar(box.power),
      side: THREE.DoubleSide,
    });
    surfaces.push(material);
    const plane = new THREE.Mesh(geometry, material);
    plane.position.set(...box.position);
    plane.scale.set(...box.size, 1);
    plane.lookAt(0, 0, 0);
    environment.add(plane);
  }
  const generator = new THREE.PMREMGenerator(renderer);
  const target = generator.fromScene(environment, 0.08, 0.1, 60);
  generator.dispose();
  geometry.dispose();
  for (const material of surfaces) material.dispose();
  environment.clear();
  return target;
}
