import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { clamp, smooth, frameBudget } from './settings.js';

/** One authored GLB, one renderer. Editor code is not part of the production build. */
export class CinemaScene {
  constructor(canvas, shots, onState) {
    this.canvas = canvas;
    this.shots = shots;
    this.onState = onState;
    this.params = {
      progress: 0,
      exposure: 1.05,
      bloom: 0.045,
      screenLight: 4.5,
      fillLight: 0.28,
      parallax: 0.035,
      quality: 'auto',
    };
    this.reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.playing = false;
    this.suspended = false;
    this.disposed = false;
    this.raf = 0;
    this.elapsed = 0;
    this.last = 0;
    this.frames = 0;
    this.averageMs = 16.7;
    this.pointer = new THREE.Vector2();
    this.softPointer = new THREE.Vector2();
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#080b11');
    this.scene.fog = new THREE.FogExp2('#080b11', 0.01);
    this.camera = new THREE.PerspectiveCamera(40, 1, 0.08, 110);
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.shadowMap.autoUpdate = false;
    this.renderer.info.autoReset = false;
    const generator = new THREE.PMREMGenerator(this.renderer);
    const room = new RoomEnvironment();
    this.environment = generator.fromScene(room, 0.06);
    this.scene.environment = this.environment.texture;
    this.scene.environmentIntensity = 0.14;
    room.dispose();
    generator.dispose();
    RectAreaLightUniformsLib.init();
    this.screenLight = new THREE.RectAreaLight(
      '#fff1df',
      this.params.screenLight,
      19,
      7,
    );
    this.screenLight.position.set(-1.3, 5.6, -17.95);
    this.screenLight.lookAt(0, 2, 0);
    this.scene.add(this.screenLight);
    this.fill = new THREE.HemisphereLight(
      '#b6cbea',
      '#131016',
      this.params.fillLight,
    );
    this.scene.add(this.fill);
    this.key = new THREE.DirectionalLight('#d6e4ff', 1.4);
    this.key.position.set(-9, 8, -10);
    this.key.target.position.set(0, 0, 3);
    this.key.castShadow = true;
    this.key.shadow.mapSize.set(1536, 1536);
    this.key.shadow.camera.left = -22;
    this.key.shadow.camera.right = 22;
    this.key.shadow.camera.top = 24;
    this.key.shadow.camera.bottom = -24;
    this.key.shadow.camera.far = 80;
    this.key.shadow.bias = -0.0003;
    this.key.shadow.normalBias = 0.025;
    this.scene.add(this.key, this.key.target);
    const side = new THREE.RectAreaLight('#ffcea1', 3.2, 4, 6);
    side.position.set(14, 6, -7);
    side.lookAt(1, 2, -8);
    this.scene.add(side);
    this.positions = new THREE.CatmullRomCurve3(
      shots.map((s) => new THREE.Vector3(...s.position)),
      false,
      'centripetal',
    );
    this.targets = new THREE.CatmullRomCurve3(
      shots.map((s) => new THREE.Vector3(...s.target)),
      false,
      'centripetal',
    );
    const target = new THREE.WebGLRenderTarget(1, 1, {
      type: THREE.HalfFloatType,
      samples: Math.min(4, this.renderer.capabilities.maxSamples),
    });
    this.composer = new EffectComposer(this.renderer, target);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.bloom = new UnrealBloomPass(
      new THREE.Vector2(1, 1),
      this.params.bloom,
      0.3,
      2.0,
    );
    this.composer.addPass(this.bloom);
    this.output = new OutputPass();
    this.composer.addPass(this.output);
    this.abort = new AbortController();
    this.tick = this.tick.bind(this);
    canvas.addEventListener(
      'webglcontextlost',
      (e) => {
        e.preventDefault();
        this.pause();
        this.onState({
          error: 'Графика недоступна. Показан статичный кадр.',
          lost: true,
        });
      },
      { signal: this.abort.signal },
    );
    this.resize();
  }
  async load() {
    const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
    const gltf = await loader.loadAsync(
      `${import.meta.env.BASE_URL}models/first-light.glb`,
    );
    this.model = gltf.scene;
    this.model.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = !o.material.name?.startsWith('Screen');
        o.receiveShadow = true;
        o.frustumCulled = true;
      }
    });
    const led = new THREE.MeshBasicMaterial({ color: '#eee7dd' });
    const ink = new THREE.MeshBasicMaterial({ color: '#111419' });
    const replaced = new Set();
    this.model.traverse((o) => {
      if (!o.isMesh) return;
      if (o.material.name === 'Screen / warm white') {
        replaced.add(o.material);
        o.material = led;
      } else if (o.material.name === 'Screen type') {
        replaced.add(o.material);
        o.material = ink;
      }
    });
    for (const mat of replaced) mat.dispose();
    this.scene.add(this.model);
    this.renderer.shadowMap.needsUpdate = true;
    await this.renderer.compileAsync(this.scene, this.camera);
    this.render();
    this.onState({ ready: true });
  }
  resize() {
    const w = Math.max(1, this.canvas.clientWidth),
      h = Math.max(1, this.canvas.clientHeight);
    const budget = frameBudget(w, h, devicePixelRatio, this.params.quality);
    this.renderer.setPixelRatio(budget.dpr);
    this.renderer.setSize(w, h, false);
    this.composer.setPixelRatio(budget.dpr);
    this.composer.setSize(w, h);
    this.renderer.shadowMap.enabled = !budget.low;
    this.key.castShadow = !budget.low;
    this.renderer.shadowMap.needsUpdate = true;
    this.bloom.enabled = !budget.low;
    this.composer.renderTarget1.samples = this.composer.renderTarget2.samples =
      Math.min(budget.low ? 2 : 4, this.renderer.capabilities.maxSamples);
    this.camera.aspect = w / h;
    this.camera.fov = w < 700 ? 54 : 40;
    this.camera.updateProjectionMatrix();
    this.invalidate();
  }
  pose() {
    const t = smooth(clamp(this.params.progress, 0, 1));
    const p = this.positions.getPoint(t),
      target = this.targets.getPoint(t);
    if (this.canvas.clientWidth < 700) {
      p.x = p.x * 0.18;
      p.z += 12;
      p.y += 0.05;
    }
    if (!this.reduced && !this.editing) {
      p.x += this.softPointer.x * this.params.parallax;
      p.y += this.softPointer.y * this.params.parallax * 0.5;
    }
    if (!this.editing) {
      this.camera.position.copy(p);
      this.camera.lookAt(target);
    }
  }
  render() {
    if (this.disposed || this.suspended) return;
    this.pose();
    this.renderer.toneMappingExposure = this.params.exposure;
    this.bloom.strength = this.params.bloom;
    this.screenLight.intensity = this.params.screenLight;
    this.fill.intensity = this.params.fillLight;
    this.renderer.info.reset();
    this.composer.render();
    this.frames++;
  }
  tick(now) {
    this.raf = 0;
    if (this.disposed || this.suspended) return;
    const dt = this.last ? Math.min((now - this.last) / 1000, 0.06) : 0;
    this.last = now;
    if (dt > 0) this.averageMs = this.averageMs * 0.95 + dt * 1000 * 0.05;
    if (this.playing && !this.reduced) {
      this.params.progress = Math.min(1, this.params.progress + dt / 14);
      if (this.params.progress >= 1) this.playing = false;
      this.onState({ progress: this.params.progress, playing: this.playing });
    }
    this.softPointer.lerp(this.pointer, 0.12);
    this.render();
    if (
      this.playing ||
      (!this.reduced && this.softPointer.distanceTo(this.pointer) > 0.001)
    )
      this.invalidate();
    else this.last = 0;
  }
  invalidate() {
    if (!this.raf && !this.disposed && !this.suspended)
      this.raf = requestAnimationFrame(this.tick);
  }
  seek(value) {
    this.params.progress = clamp(value, 0, 1);
    this.playing = false;
    this.editing = false;
    this.onState({ progress: this.params.progress, playing: false });
    this.invalidate();
  }
  play() {
    if (this.reduced) {
      this.seek(this.params.progress < 0.5 ? 0.5 : 1);
      return;
    }
    if (this.params.progress >= 0.999) this.params.progress = 0;
    this.playing = !this.playing;
    this.onState({ playing: this.playing });
    this.last = 0;
    this.invalidate();
  }
  pause() {
    this.suspended = true;
    cancelAnimationFrame(this.raf);
    this.raf = 0;
    this.last = 0;
  }
  resume() {
    this.suspended = false;
    this.invalidate();
  }
  setReduced(value) {
    this.reduced = value;
    this.playing = false;
    this.pointer.set(0, 0);
    this.softPointer.set(0, 0);
    this.onState({ playing: false });
    this.invalidate();
  }
  stats() {
    return {
      frames: this.frames,
      progress: this.params.progress,
      playing: this.playing,
      running: !!this.raf,
      calls: this.renderer.info.render.calls,
      triangles: this.renderer.info.render.triangles,
      textures: this.renderer.info.memory.textures,
      geometries: this.renderer.info.memory.geometries,
      dpr: this.renderer.getPixelRatio(),
      buffer: [this.renderer.domElement.width, this.renderer.domElement.height],
      reduced: this.reduced,
      modelLoaded: !!this.model,
    };
  }
  dispose() {
    if (this.disposed) return;
    this.pause();
    this.disposed = true;
    this.abort.abort();
    const geometries = new Set(),
      materials = new Set(),
      textures = new Set();
    this.scene.traverse((o) => {
      if (o.geometry) geometries.add(o.geometry);
      for (const m of o.material
        ? Array.isArray(o.material)
          ? o.material
          : [o.material]
        : []) {
        materials.add(m);
        for (const v of Object.values(m)) if (v?.isTexture) textures.add(v);
      }
    });
    geometries.forEach((g) => g.dispose());
    materials.forEach((m) => m.dispose());
    textures.forEach((t) => {
      t.source?.data?.close?.();
      t.dispose();
    });
    this.scene.clear();
    this.environment.dispose();
    this.bloom.dispose();
    this.output.dispose();
    this.composer.dispose();
    this.renderer.dispose();
  }
}
