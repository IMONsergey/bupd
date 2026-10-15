import * as THREE from '../faithful/vendor/three.module.js';
import { CHAPTERS, CASES, STORYBOARD, SPACING, clamp } from './chapters.js';
import { Materials } from './materials.js';
import { buildHall } from './hall.js';
import {
  buildLayers,
  buildMeaning,
  buildStructure,
  buildForm,
  buildGallery,
  buildBackstage,
} from './sets.js';
import { createEnvironment } from './lighting.js';
import { createTravel, sampleTravel } from './director.js';
/** One canvas, bounded resources and an interruptible, chapter-addressable camera director. */
export class JourneyEngine {
  constructor(
    canvas,
    { reduced = false, onFailure, onAssetStatus, onTravel } = {},
  ) {
    this.canvas = canvas;
    this.onFailure = onFailure;
    this.onAssetStatus = onAssetStatus;
    this.onTravel = onTravel;
    this.reduced = reduced;
    this.index = 0;
    this.activeSet = 0;
    this.selectedCase = 0;
    this.step = 0;
    this.detail = 0;
    this.targetDetail = 0;
    this.sceneTime = 0;
    this.running = false;
    this.destroyed = false;
    this.failed = false;
    this.quality = 'auto';
    this.autoLow = false;
    this.frameAverage = 16.7;
    this.frameCount = 0;
    this.framesRendered = 0;
    this.raf = 0;
    this.dirty = true;
    this.travel = null;
    this.registry = new Map();
    this.pointer = new THREE.Vector2();
    this.softPointer = new THREE.Vector2();
    this.basePosition = new THREE.Vector3();
    this.baseLook = new THREE.Vector3();
    this.abort = new AbortController();
    this.kit = new Materials();
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#111316');
    this.scene.fog = new THREE.FogExp2('#111316', 0.007);
    this.camera = new THREE.PerspectiveCamera(49, 1, 0.08, 190);
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.12;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.shadowMap.autoUpdate = false;
    this.environment = this.kit.own(createEnvironment(this.renderer));
    this.scene.environment = this.environment.texture;
    this.ambient = new THREE.HemisphereLight('#cfd9ee', '#28252c', 0.55);
    this.scene.add(this.ambient);
    this.key = new THREE.DirectionalLight('#efe5dd', 1.35);
    this.key.shadow.mapSize.set(1024, 1024);
    Object.assign(this.key.shadow.camera, {
      left: -25,
      right: 25,
      top: 28,
      bottom: -28,
      near: 1,
      far: 95,
    });
    this.key.shadow.bias = -0.00015;
    this.key.shadow.normalBias = 0.035;
    this.scene.add(this.key, this.key.target);
    this.rim = new THREE.DirectionalLight('#a2b9e3', 0.55);
    this.scene.add(this.rim, this.rim.target);
    this.raycaster = new THREE.Raycaster();
    this.tick = this.tick.bind(this);
    this.resize();
    const options = { signal: this.abort.signal };
    window.addEventListener('resize', () => this.resize(), options);
    canvas.addEventListener(
      'webglcontextlost',
      (event) => {
        event.preventDefault();
        this.fail(
          'Графический контекст потерян. Все материалы доступны без 3D. Для повторного запуска обновите страницу.',
        );
      },
      options,
    );
  }
  fail(message) {
    if (this.failed || this.destroyed) return;
    this.failed = true;
    this.stop();
    clearTimeout(this.preloadTimer);
    this.onFailure?.(message);
  }
  ensure(index) {
    if (this.registry.has(index)) return this.registry.get(index);
    const assetChanged = (i, ok) => {
      if (this.destroyed) return;
      this.onAssetStatus?.(i, ok);
      this.invalidate();
    };
    const factories = [
      () => buildHall(this.kit),
      () => buildLayers(this.kit),
      () => buildMeaning(this.kit),
      () => buildStructure(this.kit),
      () => buildForm(this.kit),
      () => buildGallery(this.kit, assetChanged),
      () => buildBackstage(this.kit),
      () => buildHall(this.kit, { final: true }),
    ];
    const set = factories[index]();
    set.group.position.z = -index * SPACING;
    set.group.visible = false;
    // IBL keeps metal readable without making every surface uniformly bright.
    set.group.traverse((object) => {
      const materials = Array.isArray(object.material)
        ? object.material
        : [object.material];
      for (const material of materials)
        if (material?.isMeshStandardMaterial) material.envMapIntensity = 0.42;
    });
    this.registry.set(index, set);
    this.scene.add(set.group);
    set.load?.();
    return set;
  }
  pose(index = this.index) {
    const chapter = CHAPTERS[index];
    const portrait = this.camera.aspect < 0.9;
    const small = this.canvas.clientWidth < 760;
    const position = new THREE.Vector3(
      ...(small || portrait ? chapter.mobile : chapter.camera),
    );
    const look = new THREE.Vector3(...chapter.look);
    if (index === 2) {
      position.x *= 1 - this.detail;
      position.y = THREE.MathUtils.lerp(position.y, 4.1, this.detail);
      look.y = THREE.MathUtils.lerp(look.y, 4.1, this.detail);
    }
    if (index === 3 && this.targetDetail) {
      const points = STORYBOARD.map((step) => step.position);
      const point = new THREE.Vector3(...points[this.step]);
      position
        .copy(point)
        .add(new THREE.Vector3(small ? 8 : 6, small ? 10 : 6, small ? 30 : 18));
      look.copy(point).add(new THREE.Vector3(0, -1.4, 0));
    }
    if (index === 5) {
      position.x = CASES[this.selectedCase].x;
      look.x = CASES[this.selectedCase].x;
    }
    if (portrait && index !== 2) look.y -= index === 7 ? 0.4 : 2.1;
    position.z -= index * SPACING;
    look.z -= index * SPACING;
    return { position, look };
  }
  async init(index = 0) {
    this.index = clamp(Math.round(index), 0, 7);
    this.activeSet = this.index;
    this.ensure(this.index).group.visible = true;
    const pose = this.pose();
    this.basePosition.copy(pose.position);
    this.baseLook.copy(pose.look);
    this.updateLight();
    this.render(0);
    this.preload();
    this.start();
  }
  preload() {
    clearTimeout(this.preloadTimer);
    this.preloadTimer = window.setTimeout(() => {
      if (this.destroyed || this.failed || this.travel || !this.running) return;
      if (this.index < 7) {
        try {
          this.ensure(this.index + 1);
        } catch (error) {
          console.warn('[BAEV] Chapter will retry on entry', error);
        }
      }
    }, 1800);
  }
  resize() {
    if (this.destroyed) return;
    const width = Math.max(1, this.canvas.clientWidth),
      height = Math.max(1, this.canvas.clientHeight);
    this.camera.aspect = width / height;
    this.camera.fov = width < 760 ? 48 : 49;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
    this.applyQuality();
    this.registry.get(2)?.reframe?.(this.camera.aspect < 0.9 ? 500 : width);
    this.invalidate();
  }
  setQuality(value) {
    this.quality = ['auto', 'high', 'low'].includes(value) ? value : 'auto';
    this.autoLow = false;
    this.frameCount = 0;
    this.applyQuality();
    this.invalidate();
  }
  applyQuality() {
    const compact = this.canvas.clientWidth < 900;
    const low =
      this.quality === 'low' ||
      (this.quality === 'auto' && (compact || this.autoLow));
    const pixels = Math.max(
      1,
      this.canvas.clientWidth * this.canvas.clientHeight,
    );
    const budget = low ? 1300000 : this.quality === 'high' ? 5000000 : 3200000;
    const nextRatio = Math.min(
      window.devicePixelRatio || 1,
      low ? 1 : 1.5,
      Math.sqrt(budget / pixels),
    );
    if (nextRatio !== this.renderer.getPixelRatio())
      this.renderer.setPixelRatio(nextRatio);
    this.renderer.shadowMap.enabled = !low;
    this.renderer.shadowMap.needsUpdate = true;
    this.key.castShadow = !low;
  }
  setReduced(value) {
    this.reduced = Boolean(value);
    this.pointer.set(0, 0);
    this.softPointer.set(0, 0);
    if (this.reduced && this.travel) this.finishTravel();
    if (this.reduced) {
      this.detail = this.targetDetail;
      const target = this.pose();
      this.basePosition.copy(target.position);
      this.baseLook.copy(target.look);
    }
    this.invalidate();
  }
  go(index) {
    index = clamp(Math.round(index), 0, 7);
    if (index === this.index || this.destroyed || this.failed) return false;
    this.ensure(index);
    const from = {
      position: this.basePosition.clone(),
      look: this.baseLook.clone(),
    };
    const previous = this.activeSet;
    this.index = index;
    this.targetDetail = 0;
    this.detail = 0;
    this.step = 0;
    this.travel = createTravel(
      previous,
      index,
      from,
      this.pose(),
      CASES[this.selectedCase].x,
    );
    this.onTravel?.(true, 0, this.travel.color);
    if (this.reduced) this.finishTravel();
    this.invalidate();
    return true;
  }
  finishTravel() {
    if (!this.travel) return;
    this.travel = null;
    this.activeSet = this.index;
    this.sceneTime = 0;
    const target = this.pose();
    this.basePosition.copy(target.position);
    this.baseLook.copy(target.look);
    for (const [index, set] of this.registry)
      set.group.visible = index === this.index;
    this.onTravel?.(false, 0, '#111316');
    this.preload();
    this.dirty = true;
  }
  toggleDetail() {
    if (this.index === 3) {
      this.step = this.targetDetail ? (this.step + 1) % 4 : 0;
      this.targetDetail = 1;
    } else if (this.index === 6) {
      this.step = this.targetDetail ? (this.step + 1) % 3 : 0;
      this.targetDetail = 1;
    } else this.targetDetail = this.targetDetail ? 0 : 1;
    this.invalidate();
    return Boolean(this.targetDetail);
  }
  selectCase(index) {
    const result = (Math.round(index) + CASES.length) % CASES.length;
    this.selectedCase = Number.isFinite(result) ? result : 0;
    this.invalidate();
    return this.selectedCase;
  }
  selectStep(index) {
    this.step = clamp(Math.round(index), 0, 3);
    this.targetDetail = 1;
    this.invalidate();
  }
  setPointer(x, y) {
    this.pointer.set(x, y);
    this.invalidate();
  }
  setTitle(value) {
    this.registry.get(7)?.setTitle?.(String(value).slice(0, 48));
    this.invalidate();
  }
  pick(clientX, clientY) {
    if (this.travel) return null;
    const rect = this.canvas.getBoundingClientRect();
    this.raycaster.setFromCamera(
      new THREE.Vector2(
        ((clientX - rect.left) / rect.width) * 2 - 1,
        (-(clientY - rect.top) / rect.height) * 2 + 1,
      ),
      this.camera,
    );
    const set = this.registry.get(this.index);
    if (!set) return null;
    for (const { object } of this.raycaster.intersectObject(set.group, true)) {
      if (Number.isInteger(object.userData.caseIndex))
        return { type: 'case', index: object.userData.caseIndex };
      if (Number.isInteger(object.userData.step))
        return { type: 'step', index: object.userData.step };
    }
    return null;
  }
  updateLight() {
    const z = -this.activeSet * SPACING;
    const hall = this.activeSet === 0 || this.activeSet === 7;
    this.key.position.set(11, 23, z + 8);
    this.key.target.position.set(0, 0, z - 2);
    this.rim.position.set(-12, 8, z - 18);
    this.rim.target.position.set(0, 0, z);
    this.ambient.intensity = hall ? 0.46 : 1.0;
    this.key.intensity = hall ? 0.95 : 2.3;
    this.rim.intensity = hall ? 0.45 : 0.85;
    this.key.target.updateMatrixWorld();
    this.rim.target.updateMatrixWorld();
  }
  render(dt) {
    this.sceneTime += dt;
    const movingDetail = Math.abs(this.detail - this.targetDetail) > 0.0001;
    this.detail = this.reduced
      ? this.targetDetail
      : THREE.MathUtils.lerp(
          this.detail,
          this.targetDetail,
          1 - Math.exp(-dt * 4.5),
        );
    if (this.travel) {
      this.travel.elapsed += dt;
      const progress = clamp(this.travel.elapsed / this.travel.duration, 0, 1);
      const sample = sampleTravel(this.travel, progress);
      this.basePosition.copy(sample.position);
      this.baseLook.copy(sample.look);
      this.activeSet = sample.index;
      this.onTravel?.(true, sample.mask, this.travel.color);
      for (const [index, set] of this.registry)
        set.group.visible = index === this.activeSet;
      if (progress >= 1) this.finishTravel();
    } else {
      const target = this.pose();
      const blend = this.reduced ? 1 : 1 - Math.exp(-dt * 4.5);
      this.basePosition.lerp(target.position, blend);
      this.baseLook.lerp(target.look, blend);
    }
    const parallax = this.reduced || this.travel ? 0 : 1;
    this.softPointer.lerp(this.pointer, 1 - Math.exp(-dt * 5));
    this.camera.position.copy(this.basePosition);
    this.camera.position.x += this.softPointer.x * 0.25 * parallax;
    this.camera.position.y += this.softPointer.y * 0.13 * parallax;
    this.camera.lookAt(this.baseLook);
    this.updateLight();
    const set = this.registry.get(this.activeSet);
    set?.update?.(
      this.reduced ? 12 : this.sceneTime,
      this.activeSet === this.index ? this.detail : 0,
      this.reduced,
      this.activeSet === 5 ? this.selectedCase : this.step,
    );
    this.renderer.shadowMap.needsUpdate =
      this.dirty || movingDetail || Boolean(this.travel);
    this.renderer.render(this.scene, this.camera);
    this.framesRendered++;
    this.dirty = false;
  }
  needsFrame() {
    if (this.dirty || this.travel) return true;
    if (this.reduced) return false;
    if ((this.index === 0 || this.index === 7) && this.sceneTime < 6)
      return true;
    if (
      Math.abs(this.detail - this.targetDetail) > 0.0001 ||
      this.softPointer.distanceToSquared(this.pointer) > 0.00001
    )
      return true;
    const target = this.pose();
    return (
      this.basePosition.distanceToSquared(target.position) > 0.00001 ||
      this.baseLook.distanceToSquared(target.look) > 0.00001
    );
  }
  tick(time) {
    this.raf = 0;
    if (!this.running || this.destroyed || this.failed) return;
    const delta = this.lastTime
      ? Math.max(0, (time - this.lastTime) / 1000)
      : 1 / 60;
    this.lastTime = time;
    try {
      this.render(Math.min(delta, 0.5));
    } catch (error) {
      console.error('[BAEV] Render failed', error);
      this.fail(
        'Не удалось продолжить 3D. Все материалы доступны в текстовой версии.',
      );
      return;
    }
    if (delta < 0.5 && delta > 0) {
      this.frameAverage = this.frameAverage * 0.94 + delta * 1000 * 0.06;
      this.frameCount++;
      if (
        this.quality === 'auto' &&
        !this.autoLow &&
        this.frameCount > 50 &&
        this.frameAverage > 37
      ) {
        this.autoLow = true;
        this.applyQuality();
        this.dirty = true;
      }
    }
    if (this.needsFrame()) this.raf = requestAnimationFrame(this.tick);
    else this.lastTime = 0;
  }
  invalidate() {
    this.dirty = true;
    if (this.running && !this.raf && !this.destroyed && !this.failed)
      this.raf = requestAnimationFrame(this.tick);
  }
  start() {
    if (this.destroyed || this.failed) return;
    this.running = true;
    this.lastTime = 0;
    this.invalidate();
  }
  stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
    this.raf = 0;
    this.lastTime = 0;
  }
  stats() {
    return {
      scene: this.index,
      activeSet: this.activeSet,
      travelling: Boolean(this.travel),
      setsBuilt: this.registry.size,
      drawCalls: this.renderer.info.render.calls,
      triangles: this.renderer.info.render.triangles,
      textures: this.renderer.info.memory.textures,
      geometries: this.renderer.info.memory.geometries,
      averageFrameMs: Math.round(this.frameAverage * 10) / 10,
      pixelRatio: this.renderer.getPixelRatio(),
      quality: this.quality,
      autoLow: this.autoLow,
      reduced: this.reduced,
      running: this.running,
      pendingFrame: Boolean(this.raf),
      framesRendered: this.framesRendered,
    };
  }
  dispose() {
    if (this.destroyed) return;
    this.stop();
    this.destroyed = true;
    clearTimeout(this.preloadTimer);
    this.abort.abort();
    this.scene.clear();
    this.scene.environment = null;
    this.registry.clear();
    this.kit.dispose();
    this.renderer.dispose();
  }
}
