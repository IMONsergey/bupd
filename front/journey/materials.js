import * as THREE from '../faithful/vendor/three.module.js';

const WHITE = '#eae7e1';
export function rng(seed = 12493) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Shared, bounded resource ownership: every GPU allocation is released on teardown. */
export class Materials {
  constructor() {
    this.disposed = false;
    this.geometries = new Map();
    this.materials = new Map();
    this.textures = new Set();
    this.owned = new Set();
  }
  geometry(key, create) {
    if (!this.geometries.has(key)) this.geometries.set(key, create());
    return this.geometries.get(key);
  }
  material(key, create) {
    if (!this.materials.has(key)) this.materials.set(key, create());
    return this.materials.get(key);
  }
  own(resource) {
    this.owned.add(resource);
    return resource;
  }
  texture(canvas) {
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    this.textures.add(texture);
    return texture;
  }
  canvas(width = 1024, height = 512) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas 2D is unavailable');
    return { canvas, context, texture: this.texture(canvas) };
  }
  surface(kind = 'stone') {
    return this.material(kind, () => {
      const { context: ctx, texture } = this.canvas(256, 256),
        random = rng(kind === 'fabric' ? 22 : 83),
        data = ctx.createImageData(256, 256);
      for (let y = 0; y < 256; y++)
        for (let x = 0; x < 256; x++) {
          const i = (y * 256 + x) * 4,
            weave =
              kind === 'fabric' ? (x % 3 === 0 || y % 3 === 0 ? 9 : -2) : 0,
            value = 105 + random() * 26 + weave;
          data.data[i] = value;
          data.data[i + 1] = value;
          data.data[i + 2] = value;
          data.data[i + 3] = 255;
        }
      ctx.putImageData(data, 0, 0);
      texture.needsUpdate = true;
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.colorSpace = THREE.NoColorSpace;
      texture.repeat.set(
        kind === 'fabric' ? 3 : 14,
        kind === 'fabric' ? 3 : 14,
      );
      return new THREE.MeshStandardMaterial({
        color: kind === 'fabric' ? '#4e5055' : '#565961',
        bumpMap: texture,
        bumpScale: kind === 'fabric' ? 0.025 : 0.045,
        roughness: kind === 'fabric' ? 0.98 : 0.87,
        metalness: 0,
      });
    });
  }
  solid(color = WHITE, roughness = 0.65, metalness = 0) {
    return this.material(
      `${color}/${roughness}/${metalness}`,
      () => new THREE.MeshStandardMaterial({ color, roughness, metalness }),
    );
  }
  light(color = WHITE, intensity = 1) {
    return this.material(
      `light/${color}/${intensity}`,
      () =>
        new THREE.MeshBasicMaterial({
          color: new THREE.Color(color).multiplyScalar(intensity),
          toneMapped: false,
        }),
    );
  }
  box(w, h, d, radius = 0) {
    return this.geometry(`box/${w}/${h}/${d}/${radius}`, () => {
      if (!radius) return new THREE.BoxGeometry(w, h, d);
      const r = Math.min(radius, w / 3, h / 3, d / 3),
        s = new THREE.Shape(),
        left = -w / 2 + r,
        right = w / 2 - r,
        low = -h / 2 + r,
        high = h / 2 - r;
      s.moveTo(left, -h / 2);
      s.lineTo(right, -h / 2);
      s.quadraticCurveTo(w / 2, -h / 2, w / 2, low);
      s.lineTo(w / 2, high);
      s.quadraticCurveTo(w / 2, h / 2, right, h / 2);
      s.lineTo(left, h / 2);
      s.quadraticCurveTo(-w / 2, h / 2, -w / 2, high);
      s.lineTo(-w / 2, low);
      s.quadraticCurveTo(-w / 2, -h / 2, left, -h / 2);
      const geometry = new THREE.ExtrudeGeometry(s, {
        depth: Math.max(0.01, d - r * 2),
        bevelEnabled: true,
        bevelSize: r * 0.5,
        bevelThickness: r,
        bevelSegments: 2,
        curveSegments: 4,
        steps: 1,
      });
      geometry.translate(0, 0, -d / 2 + r);
      geometry.computeVertexNormals();
      return geometry;
    });
  }
  mesh(group, geometry, material, position = [0, 0, 0], rotation = [0, 0, 0]) {
    const object = new THREE.Mesh(geometry, material);
    object.position.set(...position);
    object.rotation.set(...rotation);
    group.add(object);
    return object;
  }
  block(group, size, material, position, radius = 0, rotation = [0, 0, 0]) {
    return this.mesh(
      group,
      this.box(...size, radius),
      material,
      position,
      rotation,
    );
  }
  plane(
    group,
    width,
    height,
    texture,
    position = [0, 0, 0],
    transparent = false,
    rotation = [0, 0, 0],
  ) {
    const material = this.own(
      new THREE.MeshBasicMaterial({
        map: texture,
        transparent,
        side: THREE.DoubleSide,
        toneMapped: false,
        fog: false,
        depthWrite: !transparent,
      }),
    );
    return this.mesh(
      group,
      this.geometry(
        `plane/${width}/${height}`,
        () => new THREE.PlaneGeometry(width, height),
      ),
      material,
      position,
      rotation,
    );
  }
  instances(group, geometry, material, transforms, shadows = false) {
    const object = new THREE.InstancedMesh(
        geometry,
        material,
        transforms.length,
      ),
      dummy = new THREE.Object3D();
    transforms.forEach((transform, index) => {
      dummy.position.set(...transform.p);
      dummy.rotation.set(...(transform.r || [0, 0, 0]));
      dummy.scale.set(...(transform.s || [1, 1, 1]));
      dummy.updateMatrix();
      object.setMatrixAt(index, dummy.matrix);
    });
    object.instanceMatrix.needsUpdate = true;
    object.castShadow = shadows;
    object.receiveShadow = shadows;
    object.computeBoundingSphere?.();
    group.add(object);
    return object;
  }
  rods(group, lines, material, radius = 0.04, sides = 6) {
    const transforms = [],
      up = new THREE.Vector3(0, 1, 0),
      quaternion = new THREE.Quaternion();
    for (const [a, b] of lines) {
      const start = new THREE.Vector3(...a),
        end = new THREE.Vector3(...b),
        vector = end.clone().sub(start),
        mid = start.clone().add(end).multiplyScalar(0.5);
      quaternion.setFromUnitVectors(up, vector.clone().normalize());
      const euler = new THREE.Euler().setFromQuaternion(quaternion);
      transforms.push({
        p: mid.toArray(),
        r: [euler.x, euler.y, euler.z],
        s: [1, vector.length(), 1],
      });
    }
    return this.instances(
      group,
      this.geometry(
        `rod/${radius}/${sides}`,
        () => new THREE.CylinderGeometry(radius, radius, 1, sides),
      ),
      material,
      transforms,
    );
  }
  text(
    text,
    {
      width = 1024,
      height = 512,
      background = null,
      color = WHITE,
      size = 110,
      weight = 500,
      align = 'left',
      padding = 50,
      subtitle = '',
      overline = '',
    } = {},
  ) {
    const result = this.canvas(width, height),
      c = result.context;
    if (background) {
      c.fillStyle = background;
      c.fillRect(0, 0, width, height);
    }
    c.fillStyle = color;
    c.textBaseline = 'middle';
    c.textAlign = align;
    const x = align === 'center' ? width / 2 : padding,
      lines = String(text).split('\n');
    c.font = `${weight} ${size}px Arial, sans-serif`;
    lines.forEach((line, i) =>
      c.fillText(
        line,
        x,
        height / 2 + (i - (lines.length - 1) / 2) * size * 1.06,
        width - padding * 2,
      ),
    );
    if (overline) {
      c.font = '500 21px Arial, sans-serif';
      c.fillText(overline, x, 45, width - padding * 2);
    }
    if (subtitle) {
      c.font = '400 23px Arial, sans-serif';
      c.fillText(subtitle, x, height - 43, width - padding * 2);
    }
    result.texture.needsUpdate = true;
    return result;
  }
  floor(group, size = [44, 0.3, 58]) {
    const floor = this.block(group, size, this.surface(), [0, -0.25, 0]);
    floor.receiveShadow = true;
    return floor;
  }
  frame(
    group,
    width,
    height,
    depth,
    position,
    material = this.solid('#4c5347', 0.4, 0.5),
  ) {
    const [x, y, z] = position;
    this.block(group, [width + 0.12, 0.08, depth], material, [
      x,
      y - height / 2,
      z,
    ]);
    this.block(group, [width + 0.12, 0.08, depth], material, [
      x,
      y + height / 2,
      z,
    ]);
    this.block(group, [0.08, height, depth], material, [x - width / 2, y, z]);
    this.block(group, [0.08, height, depth], material, [x + width / 2, y, z]);
  }
  beam(group, position, rotation, length = 14, width = 2.4, color = '#d0dbea') {
    const material = this.own(
      new THREE.ShaderMaterial({
        uniforms: {
          uColor: { value: new THREE.Color(color) },
          uStrength: { value: 0.105 },
        },
        vertexShader:
          'varying vec2 vUv; varying vec3 vNormal; varying vec3 vView; void main(){vUv=uv;vec4 p=modelViewMatrix*vec4(position,1.0);vNormal=normalize(normalMatrix*normal);vView=normalize(-p.xyz);gl_Position=projectionMatrix*p;}',
        fragmentShader:
          'uniform vec3 uColor;uniform float uStrength;varying vec2 vUv;varying vec3 vNormal;varying vec3 vView;void main(){float edge=pow(abs(dot(normalize(vNormal),normalize(vView))),1.4);float base=smoothstep(0.0,.32,vUv.y)*pow(1.0-vUv.y,.5);gl_FragColor=vec4(uColor,uStrength*edge*base);}',
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
      }),
    );
    return this.mesh(
      group,
      this.geometry(
        `cone/${length}/${width}`,
        () => new THREE.ConeGeometry(width, length, 28, 1, true),
      ),
      material,
      position,
      rotation,
    );
  }

  contactShadow(group, width, depth, position = [0, 0.01, 0], opacity = 0.35) {
    const material = this.material('contact-shadow', () => {
      const { context: c, texture } = this.canvas(128, 128);
      const gradient = c.createRadialGradient(64, 64, 8, 64, 64, 64);
      gradient.addColorStop(0, 'rgba(0,0,0,.65)');
      gradient.addColorStop(0.4, 'rgba(0,0,0,.4)');
      gradient.addColorStop(1, 'rgba(0,0,0,0)');
      c.fillStyle = gradient;
      c.fillRect(0, 0, 128, 128);
      texture.needsUpdate = true;
      return new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        depthWrite: false,
        opacity,
        polygonOffset: true,
        polygonOffsetFactor: -1,
      });
    });
    const mesh = this.mesh(
      group,
      this.geometry(
        'contact-shadow-plane',
        () => new THREE.PlaneGeometry(1, 1),
      ),
      material,
      position,
      [-Math.PI / 2, 0, 0],
    );
    mesh.scale.set(width, depth, 1);
    return mesh;
  }
  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    for (const set of [
      this.geometries.values(),
      this.materials.values(),
      this.textures,
      this.owned,
    ])
      for (const resource of set) resource.dispose?.();
    this.geometries.clear();
    this.materials.clear();
    this.textures.clear();
    this.owned.clear();
  }
}

/** Authored BAEV compositions, not invented client data. */
export function titleGraphic(kit, variant = 'opening') {
  const result = kit.canvas(1600, 700),
    c = result.context;
  c.fillStyle = '#e9e7e1';
  c.fillRect(0, 0, 1600, 700);
  c.fillStyle = '#202329';
  c.font = '500 23px Arial';
  c.fillText('BAEV / ПУБЛИЧНАЯ КОММУНИКАЦИЯ', 64, 58);
  c.textAlign = 'right';
  c.fillText('ПО ТУ СТОРОНУ ЭКРАНА', 1536, 58);
  c.textAlign = 'left';
  c.fillRect(64, 90, 1472, 1);
  c.font = 'bold 226px Arial';
  c.fillText(variant === 'final' ? 'ВАША' : 'МЫСЛЬ.', 58, 337, 1090);
  c.fillText(variant === 'final' ? 'ИСТОРИЯ.' : 'ИМЕЕТ ВЕС.', 58, 555, 1170);
  c.save();
  c.translate(1390, 358);
  c.rotate(-0.13);
  for (let i = 0; i < 17; i++) {
    c.strokeStyle = i % 2 ? '#525a6b' : '#202329';
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(-84 + i * 6, -171);
    c.bezierCurveTo(130 - i * 8, -90, -135 + i * 7, 85, 83 - i * 6, 173);
    c.stroke();
  }
  c.restore();
  c.font = '400 24px Arial';
  c.fillText('От содержания — к впечатлению.', 64, 653);
  c.textAlign = 'right';
  c.fillText('СМЫСЛ / СЦЕНАРИЙ / ФОРМА', 1536, 653);
  result.texture.needsUpdate = true;
  return result;
}
