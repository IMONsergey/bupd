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
import { sampleStory, nextStop, CHAPTERS } from './story.js';
import { createPeople } from './people.js';
import { createThoughtWorld, createKeynote } from './thought-world.js';

/** One scene clock controls camera, cast, show lighting and the passage into the work. */
export class CinemaScene {
  constructor(canvas, shots, onState) {
    this.canvas = canvas;
    this.shots = shots;
    this.onState = onState;
    this.params = {
      progress: 0,
      exposure: 1.1,
      bloom: 0.06,
      screenLight: 4.5,
      fillLight: 0.35,
      parallax: 0.022,
      quality: 'auto',
    };
    this.reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.playing = false;
    this.suspended = false;
    this.disposed = false;
    this.failed = false;
    this.loaded = false;
    this.raf = 0;
    this.last = 0;
    this.elapsed = 0;
    this.frames = 0;
    this.averageMs = 16.7;
    this.travel = null;
    this.editing = false;
    this.ambientUntil = 12;
    this.lastDraw = 0;
    this.selectedProject = 0;
    this.pointer = new THREE.Vector2();
    this.softPointer = new THREE.Vector2();
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#080b11');
    this.scene.fog = new THREE.FogExp2('#080b11', 0.006);
    this.camera = new THREE.PerspectiveCamera(43, 1, 0.045, 160);
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.shadowMap.autoUpdate = false;
    this.renderer.info.autoReset = false;
    const generator = new THREE.PMREMGenerator(this.renderer),
      room = new RoomEnvironment();
    this.environment = generator.fromScene(room, 0.06);
    this.scene.environment = this.environment.texture;
    this.scene.environmentIntensity = 0.17;
    room.dispose();
    generator.dispose();
    RectAreaLightUniformsLib.init();
    this.hall = new THREE.Group();
    this.hall.name = 'Conference with audience';
    this.scene.add(this.hall);
    this.screenLight = new THREE.RectAreaLight('#fff1df', 4.5, 19, 7);
    this.screenLight.position.set(-1.3, 5.6, -17.95);
    this.screenLight.lookAt(0, 2, 0);
    this.hall.add(this.screenLight);
    this.fill = new THREE.HemisphereLight('#b6cbea', '#131016', 0.35);
    this.scene.add(this.fill);
    this.key = new THREE.DirectionalLight('#d6e4ff', 1.4);
    this.key.position.set(-9, 8, -10);
    this.key.target.position.set(0, 0, 3);
    this.key.shadow.mapSize.set(1024, 1024);
    Object.assign(this.key.shadow.camera, {
      left: -22,
      right: 22,
      top: 24,
      bottom: -24,
      far: 90,
    });
    this.key.shadow.bias = -0.0003;
    this.key.shadow.normalBias = 0.025;
    this.scene.add(this.key, this.key.target);
    const side = new THREE.RectAreaLight('#ffcea1', 3.2, 4, 6);
    side.position.set(14, 6, -7);
    side.lookAt(1, 2, -8);
    this.hall.add(side);
    this.audienceFill = new THREE.RectAreaLight('#c5d7ee', 3, 12, 5);
    this.audienceFill.position.set(0, 5, -6);
    this.audienceFill.lookAt(0, 1.1, 14);
    this.hall.add(this.audienceFill);
    this.spot = new THREE.SpotLight('#ffe6bd', 75, 25, 0.34, 0.58, 2);
    this.spot.position.set(-1, 9.5, -10);
    this.spot.target.position.set(0, 1.4, -12.4);
    this.hall.add(this.spot, this.spot.target);
    const renderTarget = new THREE.WebGLRenderTarget(1, 1, {
      type: THREE.HalfFloatType,
      samples: Math.min(4, this.renderer.capabilities.maxSamples),
    });
    this.composer = new EffectComposer(this.renderer, renderTarget);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.06, 0.3, 2);
    this.composer.addPass(this.bloom);
    this.output = new OutputPass();
    this.composer.addPass(this.output);
    this.abort = new AbortController();
    this.tick = this.tick.bind(this);
    this.targets = {
      getPoint: (p) =>
        new THREE.Vector3(
          ...sampleStory(p, this.canvas.clientWidth < 700).target,
        ),
    };
    canvas.addEventListener(
      'webglcontextlost',
      (e) => {
        e.preventDefault();
        this.fail('Графический контекст потерян. Доступна версия без 3D.');
      },
      { signal: this.abort.signal },
    );
    this.resize();
  }
  fail(message) {
    this.failed = true;
    this.playing = false;
    this.pause();
    this.onState({ error: message, lost: true });
  }
  async load() {
    const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
    const [venue, man, woman, seated] = await Promise.all(
      [
        'first-light.glb',
        'people/business-man.glb',
        'people/woman.glb',
        'people/seated.glb',
      ].map((file) =>
        loader.loadAsync(`${import.meta.env.BASE_URL}models/${file}`),
      ),
    );
    if (this.disposed) return;
    this.model = venue.scene;
    this.model.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = !o.material.name?.startsWith('Screen');
        o.receiveShadow = true;
      }
    });
    this.hall.add(this.model);
    this.keynote = createKeynote(this.hall);
    this.people = createPeople([man, woman], seated);
    this.hall.add(this.people.group);
    this.thought = createThoughtWorld();
    this.scene.add(this.thought.group);
    this.renderer.shadowMap.needsUpdate = true;
    this.loaded = true;
    this.render();
    this.onState({ ready: true });
    this.invalidate();
  }
  resize() {
    const w = Math.max(1, this.canvas.clientWidth),
      h = Math.max(1, this.canvas.clientHeight);
    const budget = frameBudget(w, h, devicePixelRatio, this.params.quality);
    this.low = budget.low;
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
    this.camera.fov = w < 700 ? 56 : 43;
    this.camera.updateProjectionMatrix();
    this.invalidate();
  }
  render() {
    if (this.disposed || this.suspended || !this.loaded) return;
    const state = sampleStory(
        this.params.progress,
        this.canvas.clientWidth < 700,
      ),
      p = state.progress;
    if (!this.editing) {
      this.camera.position.set(...state.position);
      if (!this.reduced) {
        this.camera.position.x += this.softPointer.x * this.params.parallax;
        this.camera.position.y +=
          this.softPointer.y * this.params.parallax * 0.5;
      }
      this.camera.lookAt(new THREE.Vector3(...state.target));
    }
    const hall = state.world === 'hall';
    this.hall.visible = hall;
    this.thought.group.visible = !hall;
    if (this.lastWorld !== state.world) {
      this.renderer.shadowMap.needsUpdate = true;
      this.lastWorld = state.world;
    }
    this.scene.fog.density = hall ? 0.006 : 0.011;
    this.key.position.set(-9, 8, hall ? -10 : -108);
    this.key.target.position.set(0, 0, hall ? 3 : -110);
    this.key.target.updateMatrixWorld();
    this.fill.intensity = this.params.fillLight * (hall ? 1 : 1.45);
    this.scene.environmentIntensity = hall ? 0.17 : 0.35;
    const show = THREE.MathUtils.smoothstep(p, 0.06, 0.27);
    this.screenLight.intensity = this.params.screenLight * (0.6 + show * 0.4);
    this.audienceFill.intensity =
      p >= 0.92 ? 5.5 : THREE.MathUtils.lerp(3.5, 1.2, show);
    this.spot.intensity = 45 + show * 60;
    if (hall) {
      this.people.update(p, this.elapsed, this.reduced);
      this.keynote.update(p, this.elapsed, this.reduced);
    }
    this.thought.update(p);
    if (p > 0.35 && !this.assetsStarted) {
      this.assetsStarted = true;
      this.thought.loadProjects(() => {
        this.onState({ assets: true });
        this.invalidate();
      });
    }
    this.renderer.toneMappingExposure = this.params.exposure;
    this.bloom.strength = this.params.bloom;
    this.renderer.info.reset();
    this.composer.render();
    this.frames++;
    this.onState({
      progress: p,
      playing: this.playing,
      travelling: !!this.travel,
      mask: state.mask,
      world: state.world,
      chapter: state.chapter,
    });
  }
  tick(now) {
    this.raf = 0;
    if (this.disposed || this.suspended || this.failed) return;
    const moving = this.playing || !!this.travel;
    // Human micro-movement runs at a modest idle cadence, not an unconstrained render loop.
    if (!moving && now - this.lastDraw < 1000 / (this.low ? 18 : 24)) {
      this.invalidate();
      return;
    }
    const dt = this.last ? Math.min((now - this.last) / 1000, 0.1) : 1 / 24;
    this.last = now;
    this.lastDraw = now;
    this.elapsed += dt;
    this.averageMs = this.averageMs * 0.95 + dt * 1000 * 0.05;
    if (this.travel) {
      this.travel.elapsed += dt;
      const u = Math.min(1, this.travel.elapsed / this.travel.duration);
      this.params.progress = THREE.MathUtils.lerp(
        this.travel.from,
        this.travel.to,
        smooth(u),
      );
      if (u >= 1) {
        this.travel = null;
        this.onState({ arrived: true });
      }
    } else if (this.playing && !this.reduced) {
      this.params.progress = Math.min(1, this.params.progress + dt / 44);
      if (this.params.progress >= 1) this.playing = false;
    }
    this.softPointer.lerp(this.pointer, 0.15);
    try {
      this.render();
    } catch (error) {
      console.error('[BAEV story]', error);
      this.fail('Не удалось продолжить 3D. Все главы доступны без него.');
      return;
    }
    const alive =
      !this.reduced &&
      this.lastWorld === 'hall' &&
      this.elapsed < this.ambientUntil;
    if (
      this.playing ||
      this.travel ||
      alive ||
      (!this.reduced && this.softPointer.distanceTo(this.pointer) > 0.001)
    )
      this.invalidate();
    else this.last = 0;
  }
  invalidate() {
    if (!this.raf && !this.disposed && !this.suspended && !this.failed)
      this.raf = requestAnimationFrame(this.tick);
  }
  seek(value) {
    this.params.progress = clamp(value, 0, 1);
    this.playing = false;
    this.travel = null;
    this.editing = false;
    this.ambientUntil = this.elapsed + 8;
    this.render();
    this.invalidate();
  }
  go(value) {
    const to = clamp(value, 0, 1);
    if (this.reduced) {
      this.seek(to);
      return;
    }
    this.playing = false;
    this.editing = false;
    this.travel = {
      from: this.params.progress,
      to,
      elapsed: 0,
      duration: 1.6 + Math.abs(to - this.params.progress) * 8,
    };
    this.ambientUntil = this.elapsed + 10;
    this.invalidate();
  }
  step(direction = 1) {
    if (this.travel) return;
    this.go(nextStop(this.params.progress, direction));
  }
  play() {
    if (this.reduced) {
      this.step(1);
      return;
    }
    this.travel = null;
    if (this.params.progress >= 0.999) this.params.progress = 0;
    this.playing = !this.playing;
    this.last = 0;
    this.ambientUntil = this.elapsed + 10;
    this.onState({ playing: this.playing });
    this.invalidate();
  }
  selectProject(index) {
    this.selectedProject = (index + 3) % 3;
    this.thought?.select(this.selectedProject);
    this.onState({ project: this.selectedProject });
    this.invalidate();
  }
  pause() {
    this.suspended = true;
    cancelAnimationFrame(this.raf);
    this.raf = 0;
    this.last = 0;
  }
  resume() {
    if (this.failed || this.disposed) return;
    this.suspended = false;
    this.ambientUntil = this.elapsed + 8;
    this.invalidate();
  }
  setReduced(value) {
    this.reduced = value;
    this.playing = false;
    if (this.travel) {
      this.params.progress = this.travel.to;
      this.travel = null;
    }
    this.pointer.set(0, 0);
    this.softPointer.set(0, 0);
    this.onState({ playing: false });
    this.render();
    this.invalidate();
  }
  stats() {
    return {
      frames: this.frames,
      progress: this.params.progress,
      chapter: sampleStory(this.params.progress).chapter,
      playing: this.playing,
      travelling: !!this.travel,
      running: !!this.raf,
      world: this.lastWorld,
      calls: this.renderer.info.render.calls,
      triangles: this.renderer.info.render.triangles,
      textures: this.renderer.info.memory.textures,
      geometries: this.renderer.info.memory.geometries,
      dpr: this.renderer.getPixelRatio(),
      buffer: [this.canvas.width, this.canvas.height],
      reduced: this.reduced,
      modelLoaded: !!this.model,
      people: this.people?.count || 0,
      seated: this.people?.seated || 0,
      animatedPeople: this.people?.animated || 0,
      projectsLoaded: this.thought?.projectsLoaded || 0,
      project: this.selectedProject,
      projectError: this.thought?.failedProject || false,
    };
  }
  dispose() {
    if (this.disposed) return;
    this.pause();
    this.disposed = true;
    this.abort.abort();
    this.thought?.dispose();
    const geometries = new Set(),
      materials = new Set(),
      textures = new Set(),
      skeletons = new Set();
    this.scene.traverse((o) => {
      if (o.geometry) geometries.add(o.geometry);
      if (o.skeleton) skeletons.add(o.skeleton);
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
    skeletons.forEach((s) => s.dispose());
    this.scene.clear();
    this.environment.dispose();
    this.bloom.dispose();
    this.output.dispose();
    this.composer.dispose();
    this.renderer.dispose();
  }
}
