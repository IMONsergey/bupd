import * as THREE from '../faithful/vendor/three.module.js';

const WHITE = '#e8e6dc';
export function rng(seed = 12493) {
  return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t ^= t + Math.imul(t ^ t >>> 7, 61 | t); return ((t ^ seed >>> 14) >>> 0) / 4294967296; };
}

/** Shared, bounded resource ownership: every GPU allocation is released on teardown. */
export class Materials {
  constructor() { this.geometries = new Map(); this.materials = new Map(); this.textures = new Set(); this.owned = new Set(); }
  geometry(key, create) { if (!this.geometries.has(key)) this.geometries.set(key, create()); return this.geometries.get(key); }
  material(key, create) { if (!this.materials.has(key)) this.materials.set(key, create()); return this.materials.get(key); }
  own(resource) { this.owned.add(resource); return resource; }
  texture(canvas) { const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; texture.anisotropy = 4; this.textures.add(texture); return texture; }
  canvas(width = 1024, height = 512) { const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height; const context = canvas.getContext('2d'); if (!context) throw new Error('Canvas 2D is unavailable'); return { canvas, context, texture: this.texture(canvas) }; }
  surface(kind = 'stone') {
    return this.material(kind, () => {
      const { context: ctx, texture } = this.canvas(256, 256), random = rng(kind === 'fabric' ? 22 : 83), data = ctx.createImageData(256, 256);
      for (let y = 0; y < 256; y++) for (let x = 0; x < 256; x++) { const i = (y * 256 + x) * 4, weave = kind === 'fabric' ? ((x % 3 === 0 || y % 3 === 0) ? 9 : -2) : 0, value = 105 + random() * 26 + weave; data.data[i] = value; data.data[i + 1] = value; data.data[i + 2] = value; data.data[i + 3] = 255; }
      ctx.putImageData(data, 0, 0); texture.needsUpdate = true; texture.wrapS = texture.wrapT = THREE.RepeatWrapping; texture.repeat.set(kind === 'fabric' ? 3 : 14, kind === 'fabric' ? 3 : 14);
      return new THREE.MeshStandardMaterial({ color: kind === 'fabric' ? '#515b50' : '#34392f', map: texture, bumpMap: texture, bumpScale: kind === 'fabric' ? .025 : .045, roughness: kind === 'fabric' ? .98 : .87, metalness: 0 });
    });
  }
  solid(color = WHITE, roughness = .65, metalness = 0) { return this.material(`${color}/${roughness}/${metalness}`, () => new THREE.MeshStandardMaterial({ color, roughness, metalness })); }
  light(color = WHITE, intensity = 1) { return this.material(`light/${color}/${intensity}`, () => new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(intensity), toneMapped: false })); }
  box(w, h, d, radius = 0) {
    return this.geometry(`box/${w}/${h}/${d}/${radius}`, () => {
      if (!radius) return new THREE.BoxGeometry(w, h, d);
      const r = Math.min(radius, w / 3, h / 3, d / 3), s = new THREE.Shape(), left = -w / 2 + r, right = w / 2 - r, low = -h / 2 + r, high = h / 2 - r;
      s.moveTo(left, -h / 2); s.lineTo(right, -h / 2); s.quadraticCurveTo(w / 2, -h / 2, w / 2, low); s.lineTo(w / 2, high); s.quadraticCurveTo(w / 2, h / 2, right, h / 2); s.lineTo(left, h / 2); s.quadraticCurveTo(-w / 2, h / 2, -w / 2, high); s.lineTo(-w / 2, low); s.quadraticCurveTo(-w / 2, -h / 2, left, -h / 2);
      const geometry = new THREE.ExtrudeGeometry(s, { depth: Math.max(.01, d - r * 2), bevelEnabled: true, bevelSize: r * .5, bevelThickness: r, bevelSegments: 2, curveSegments: 4, steps: 1 }); geometry.translate(0, 0, -d / 2 + r); geometry.computeVertexNormals(); return geometry;
    });
  }
  mesh(group, geometry, material, position = [0, 0, 0], rotation = [0, 0, 0]) { const object = new THREE.Mesh(geometry, material); object.position.set(...position); object.rotation.set(...rotation); group.add(object); return object; }
  block(group, size, material, position, radius = 0, rotation = [0, 0, 0]) { return this.mesh(group, this.box(...size, radius), material, position, rotation); }
  plane(group, width, height, texture, position = [0, 0, 0], transparent = false, rotation = [0, 0, 0]) { const material = this.own(new THREE.MeshBasicMaterial({ map: texture, transparent, side: THREE.DoubleSide, toneMapped: false, depthWrite: !transparent })); return this.mesh(group, this.geometry(`plane/${width}/${height}`, () => new THREE.PlaneGeometry(width, height)), material, position, rotation); }
  instances(group, geometry, material, transforms, shadows = false) {
    const object = new THREE.InstancedMesh(geometry, material, transforms.length), dummy = new THREE.Object3D();
    transforms.forEach((transform, index) => { dummy.position.set(...transform.p); dummy.rotation.set(...(transform.r || [0, 0, 0])); dummy.scale.set(...(transform.s || [1, 1, 1])); dummy.updateMatrix(); object.setMatrixAt(index, dummy.matrix); }); object.instanceMatrix.needsUpdate = true; object.castShadow = shadows; object.receiveShadow = shadows; object.computeBoundingSphere?.(); group.add(object); return object;
  }
  rods(group, lines, material, radius = .04, sides = 6) {
    const transforms = [], up = new THREE.Vector3(0, 1, 0), quaternion = new THREE.Quaternion();
    for (const [a, b] of lines) { const start = new THREE.Vector3(...a), end = new THREE.Vector3(...b), vector = end.clone().sub(start), mid = start.clone().add(end).multiplyScalar(.5); quaternion.setFromUnitVectors(up, vector.clone().normalize()); const euler = new THREE.Euler().setFromQuaternion(quaternion); transforms.push({ p: mid.toArray(), r: [euler.x, euler.y, euler.z], s: [1, vector.length(), 1] }); }
    return this.instances(group, this.geometry(`rod/${radius}/${sides}`, () => new THREE.CylinderGeometry(radius, radius, 1, sides)), material, transforms);
  }
  text(text, { width = 1024, height = 512, background = null, color = WHITE, size = 110, weight = 500, align = 'left', padding = 50, subtitle = '', overline = '' } = {}) {
    const result = this.canvas(width, height), c = result.context; if (background) { c.fillStyle = background; c.fillRect(0, 0, width, height); }
    c.fillStyle = color; c.textBaseline = 'middle'; c.textAlign = align; const x = align === 'center' ? width / 2 : padding, lines = String(text).split('\n'); c.font = `${weight} ${size}px Arial, sans-serif`;
    lines.forEach((line, i) => c.fillText(line, x, height / 2 + (i - (lines.length - 1) / 2) * size * 1.06, width - padding * 2));
    if (overline) { c.font = '500 21px Arial, sans-serif'; c.fillText(overline, x, 45, width - padding * 2); } if (subtitle) { c.font = '400 23px Arial, sans-serif'; c.fillText(subtitle, x, height - 43, width - padding * 2); } result.texture.needsUpdate = true; return result;
  }
  floor(group, size = [44, .3, 58]) { const floor = this.block(group, size, this.surface(), [0, -.25, 0]); floor.receiveShadow = true; return floor; }
  frame(group, width, height, depth, position, material = this.solid('#4c5347', .4, .5)) { const [x, y, z] = position; this.block(group, [width + .12, .08, depth], material, [x, y - height / 2, z]); this.block(group, [width + .12, .08, depth], material, [x, y + height / 2, z]); this.block(group, [.08, height, depth], material, [x - width / 2, y, z]); this.block(group, [.08, height, depth], material, [x + width / 2, y, z]); }
  beam(group, position, rotation, length = 14, width = 2.4, color = '#d2d9bd') {
    const material = this.own(new THREE.ShaderMaterial({ uniforms: { uColor: { value: new THREE.Color(color) }, uStrength: { value: .105 } }, vertexShader: 'varying vec2 vUv; varying vec3 vNormal; varying vec3 vView; void main(){vUv=uv;vec4 p=modelViewMatrix*vec4(position,1.0);vNormal=normalize(normalMatrix*normal);vView=normalize(-p.xyz);gl_Position=projectionMatrix*p;}', fragmentShader: 'uniform vec3 uColor;uniform float uStrength;varying vec2 vUv;varying vec3 vNormal;varying vec3 vView;void main(){float edge=pow(abs(dot(normalize(vNormal),normalize(vView))),1.4);float base=smoothstep(0.0,.32,vUv.y)*pow(1.0-vUv.y,.5);gl_FragColor=vec4(uColor,uStrength*edge*base);}', transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending }));
    return this.mesh(group, this.geometry(`cone/${length}/${width}`, () => new THREE.ConeGeometry(width, length, 28, 1, true)), material, position, rotation);
  }
  dispose() { for (const set of [this.geometries.values(), this.materials.values(), this.textures, this.owned]) for (const resource of set) resource.dispose?.(); this.geometries.clear(); this.materials.clear(); this.textures.clear(); this.owned.clear(); }
}

/** Authored BAEV compositions, not invented client data. */
export function titleGraphic(kit, variant = 'opening') {
  const result = kit.canvas(1600, 700), c = result.context; c.fillStyle = '#dfdfcf'; c.fillRect(0, 0, 1600, 700); c.fillStyle = '#242b21'; c.font = '500 21px Arial'; c.fillText('BAEV / ПУБЛИЧНАЯ КОММУНИКАЦИЯ', 66, 59); c.textAlign = 'right'; c.fillText('ПО ТУ СТОРОНУ ЭКРАНА', 1534, 59); c.textAlign = 'left'; c.fillRect(66, 87, 1468, 1); c.font = 'bold 340px Arial'; c.fillText(variant === 'final' ? 'ВАША ИДЕЯ' : 'BAEV', 48, 479, 1450); c.font = '400 25px Arial'; c.fillText('От мысли к впечатлению.', 68, 632); c.textAlign = 'right'; c.fillText('СОДЕРЖАНИЕ / СЦЕНАРИЙ / ФОРМА', 1534, 632); result.texture.needsUpdate = true; return result;
}
