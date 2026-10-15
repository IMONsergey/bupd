import * as THREE from '../faithful/vendor/three.module.js';
import { CHAPTERS, CASES, SPACING, clamp, smooth } from './chapters.js';
import { Materials } from './materials.js';
import { buildHall } from './hall.js';
import { buildLayers, buildMeaning, buildStructure, buildForm, buildGallery, buildBackstage } from './sets.js';

/** One renderer, an explicit camera rail, and a finite registry of authored sets. */
export class JourneyEngine {
  constructor(canvas, { reduced = false, onFailure, onAssetStatus, onTravel } = {}) {
    this.canvas = canvas; this.onFailure = onFailure; this.onAssetStatus = onAssetStatus; this.onTravel = onTravel;
    this.reduced = reduced; this.index = 0; this.selectedCase = 0; this.step = 0; this.detail = 0; this.targetDetail = 0;
    this.elapsed = 0; this.sceneTime = 0; this.raf = 0; this.running = false; this.destroyed = false; this.failed = false;
    this.quality = 'auto'; this.autoLow = false; this.frameAverage = 16.7; this.frameCount = 0;
    this.travel = null; this.registry = new Map(); this.pointer = new THREE.Vector2(); this.softPointer = new THREE.Vector2();
    this.basePosition = new THREE.Vector3(); this.baseLook = new THREE.Vector3(); this.abort = new AbortController();
    this.kit = new Materials(); this.scene = new THREE.Scene(); this.scene.background = new THREE.Color('#121710'); this.scene.fog = new THREE.FogExp2('#121710', .015);
    this.camera = new THREE.PerspectiveCamera(49, 1, .08, 170);
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' }); this.renderer.setClearColor('#121710'); this.renderer.outputColorSpace = THREE.SRGBColorSpace; this.renderer.toneMapping = THREE.ACESFilmicToneMapping; this.renderer.toneMappingExposure = 1.25; this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.scene.add(new THREE.HemisphereLight('#dce6c6', '#2e3827', 2.7));
    this.key = new THREE.DirectionalLight('#e9e5ce', 3.5); this.key.position.set(11, 23, 8); this.key.castShadow = true; this.key.shadow.mapSize.set(1024, 1024); Object.assign(this.key.shadow.camera, { left: -28, right: 28, top: 30, bottom: -30, near: 1, far: 90 }); this.key.shadow.bias = -.0005; this.key.shadow.normalBias = .05; this.scene.add(this.key, this.key.target);
    const rim = new THREE.DirectionalLight('#b4c6a1', 1.3); rim.position.set(-12, 8, -18); this.scene.add(rim); this.raycaster = new THREE.Raycaster(); this.resize();
    const options = { signal: this.abort.signal }; window.addEventListener('resize', () => this.resize(), options); canvas.addEventListener('webglcontextlost', event => { event.preventDefault(); this.fail('Графический контекст потерян. Открыта текстовая версия. Для повторного запуска обновите страницу.'); }, options); this.tick = this.tick.bind(this);
  }
  fail(message) { if (this.failed) return; this.failed = true; this.stop(); this.onFailure?.(message); }
  ensure(index) {
    if (this.registry.has(index)) return this.registry.get(index);
    const factories = [() => buildHall(this.kit), () => buildLayers(this.kit), () => buildMeaning(this.kit), () => buildStructure(this.kit), () => buildForm(this.kit), () => buildGallery(this.kit, this.onAssetStatus), () => buildBackstage(this.kit), () => buildHall(this.kit, { final: true })];
    const set = factories[index](); set.group.position.z = -index * SPACING; set.group.visible = false; this.registry.set(index, set); this.scene.add(set.group); set.load?.(); return set;
  }
  pose(index = this.index) {
    const chapter = CHAPTERS[index], mobile = this.canvas.clientWidth < 760, position = new THREE.Vector3(...(mobile ? chapter.mobile : chapter.camera)), look = new THREE.Vector3(...chapter.look);
    if (index === 2) { position.x *= 1 - this.detail; position.y = THREE.MathUtils.lerp(position.y, 4.1, this.detail); look.y = THREE.MathUtils.lerp(look.y, 4.1, this.detail); }
    if (index === 5) { position.x = CASES[this.selectedCase].x; look.x = CASES[this.selectedCase].x; }
    position.z -= index * SPACING; look.z -= index * SPACING; return { position, look };
  }
  async init(index = 0) { this.index = index; this.ensure(index).group.visible = true; const pose = this.pose(index); this.basePosition.copy(pose.position); this.baseLook.copy(pose.look); this.camera.position.copy(pose.position); this.camera.lookAt(pose.look); this.updateLight(); this.renderer.compile(this.scene, this.camera); this.render(0); this.preload(); this.start(); }
  preload() { clearTimeout(this.preloadTimer); this.preloadTimer = window.setTimeout(() => { if (this.destroyed || this.failed || this.travel) return; const next = this.index + 1; if (next < CHAPTERS.length) { try { this.ensure(next); } catch { /* Retry a future set on explicit navigation. */ } } }, 1800); }
  resize() { if (this.destroyed) return; const width = Math.max(1, this.canvas.clientWidth), height = Math.max(1, this.canvas.clientHeight); this.camera.aspect = width / height; this.camera.fov = width < 760 ? 48 : 49; this.camera.updateProjectionMatrix(); this.renderer.setSize(width, height, false); this.applyQuality(); }
  setQuality(value) { this.quality = ['auto', 'high', 'low'].includes(value) ? value : 'auto'; this.autoLow = false; this.frameCount = 0; this.applyQuality(); }
  applyQuality() { const mobile = this.canvas.clientWidth < 760, low = this.quality === 'low' || (this.quality === 'auto' && (mobile || this.autoLow)); this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, low ? 1 : 1.6)); this.renderer.shadowMap.enabled = !low; this.key.castShadow = !low; }
  setReduced(value) { this.reduced = Boolean(value); this.pointer.set(0, 0); this.softPointer.set(0, 0); if (this.reduced && this.travel) this.finishTravel(); if (this.reduced) { this.detail = this.targetDetail; const pose = this.pose(); this.basePosition.copy(pose.position); this.baseLook.copy(pose.look); } }
  go(index) {
    index = clamp(Math.round(index), 0, CHAPTERS.length - 1); if (index === this.index || this.destroyed || this.failed) return false;
    const previous = this.index; this.ensure(index); const position = this.basePosition.clone(), look = this.baseLook.clone(); this.index = index; this.targetDetail = 0; this.detail = 0; this.step = 0;
    const target = this.pose(index), direct = Math.abs(index - previous) !== 1, direction = Math.sign(index - previous), exit = position.clone().lerp(target.position, .34), entry = position.clone().lerp(target.position, .7);
    if (!direct && previous === 0 && index === 1) exit.set(0, 6.55, -25.2); if (!direct && previous === 1 && index === 0) entry.set(0, 6.55, -25.2);
    if (!direct && index !== 7 && previous !== 7) { exit.x *= .25; entry.x *= .4; exit.y = Math.max(4.8, exit.y); entry.y = Math.max(4.8, entry.y); }
    const curve = new THREE.CatmullRomCurve3([position, exit, entry, target.position], false, 'centripetal'); this.travel = { previous, index, position, look, target, curve, elapsed: 0, duration: direct ? .9 : (direction > 0 ? 2.35 : 1.95), direct };
    for (const [key, set] of this.registry) set.group.visible = key === previous || key === index; this.onTravel?.(true, 0, direct); if (this.reduced) this.finishTravel(); return true;
  }
  finishTravel() { if (!this.travel) return; const target = this.pose(); this.basePosition.copy(target.position); this.baseLook.copy(target.look); this.travel = null; this.sceneTime = 0; for (const [key, set] of this.registry) set.group.visible = key === this.index; this.onTravel?.(false, 0, false); this.preload(); }
  toggleDetail() { if (this.index === 3) { this.step = (this.step + 1) % 4; this.targetDetail = 1; } else if (this.index === 6) { this.step = this.targetDetail ? (this.step + 1) % 3 : 0; this.targetDetail = 1; } else this.targetDetail = this.targetDetail ? 0 : 1; return Boolean(this.targetDetail); }
  selectCase(index) { this.selectedCase = (index + CASES.length) % CASES.length; return this.selectedCase; }
  setTitle(value) { this.registry.get(7)?.setTitle?.(String(value).slice(0, 48)); }
  pick(clientX, clientY) { if (this.travel) return null; const rect = this.canvas.getBoundingClientRect(); this.raycaster.setFromCamera(new THREE.Vector2((clientX - rect.left) / rect.width * 2 - 1, -(clientY - rect.top) / rect.height * 2 + 1), this.camera); const set = this.registry.get(this.index); if (!set) return null; for (const { object } of this.raycaster.intersectObject(set.group, true)) { if (Number.isInteger(object.userData.caseIndex)) return { type: 'case', index: object.userData.caseIndex }; if (Number.isInteger(object.userData.step)) return { type: 'step', index: object.userData.step }; } return null; }
  updateLight() { const z = this.travel ? THREE.MathUtils.lerp(-this.travel.previous * SPACING, -this.index * SPACING, smooth(this.travel.elapsed / this.travel.duration)) : -this.index * SPACING; this.key.position.set(11, 23, z + 8); this.key.target.position.set(0, 0, z - 2); this.key.target.updateMatrixWorld(); }
  render(dt) {
    this.elapsed += dt; this.sceneTime += dt; this.detail = this.reduced ? this.targetDetail : THREE.MathUtils.lerp(this.detail, this.targetDetail, 1 - Math.exp(-dt * 3.6));
    if (this.travel) { const travel = this.travel; travel.elapsed += dt; const raw = clamp(travel.elapsed / travel.duration, 0, 1), eased = smooth(raw); if (travel.direct) { this.basePosition.copy(raw < .5 ? travel.position : travel.target.position); this.baseLook.copy(raw < .5 ? travel.look : travel.target.look); } else { this.basePosition.copy(travel.curve.getPoint(eased)); this.baseLook.lerpVectors(travel.look, travel.target.look, eased); } this.onTravel?.(true, raw, travel.direct || travel.previous === 7 || travel.index === 7); if (raw >= 1) this.finishTravel(); }
    else { const target = this.pose(), lerp = this.reduced ? 1 : 1 - Math.exp(-dt * 3.4); this.basePosition.lerp(target.position, lerp); this.baseLook.lerp(target.look, lerp); }
    const parallax = this.reduced || this.travel ? 0 : 1; this.softPointer.lerp(this.pointer, 1 - Math.exp(-dt * 2.1)); this.camera.position.copy(this.basePosition); this.camera.position.x += this.softPointer.x * .35 * parallax; this.camera.position.y += this.softPointer.y * .16 * parallax; this.camera.lookAt(this.baseLook); this.updateLight();
    for (const [index, set] of this.registry) if (set.group.visible) set.update?.(this.reduced ? 10 : this.sceneTime, index === this.index ? this.detail : 0, this.reduced, index === 5 ? this.selectedCase : this.step); this.renderer.render(this.scene, this.camera);
  }
  tick(time) {
    if (!this.running || this.destroyed) return; const actualDelta = this.lastTime ? (time - this.lastTime) / 1000 : 1 / 60; this.lastTime = time;
    try { this.render(clamp(actualDelta, 0, .07)); } catch (error) { console.error('[BAEV] Render failed', error); this.fail('Не удалось продолжить 3D-путешествие. Все материалы доступны в текстовой версии.'); return; }
    if (!this.travel && actualDelta < .25) { this.frameAverage = this.frameAverage * .96 + actualDelta * 1000 * .04; this.frameCount++; if (this.quality === 'auto' && !this.autoLow && this.frameCount > 120 && this.frameAverage > 36) { this.autoLow = true; this.applyQuality(); } } this.raf = requestAnimationFrame(this.tick);
  }
  start() { if (this.running || this.destroyed || this.failed) return; this.running = true; this.lastTime = 0; this.raf = requestAnimationFrame(this.tick); }
  stop() { this.running = false; cancelAnimationFrame(this.raf); this.raf = 0; this.lastTime = 0; }
  stats() { return { scene: this.index, travelling: Boolean(this.travel), setsBuilt: this.registry.size, drawCalls: this.renderer.info.render.calls, triangles: this.renderer.info.render.triangles, textures: this.renderer.info.memory.textures, geometries: this.renderer.info.memory.geometries, averageFrameMs: Math.round(this.frameAverage * 10) / 10, pixelRatio: this.renderer.getPixelRatio(), quality: this.quality, autoLow: this.autoLow, reduced: this.reduced, running: this.running }; }
  dispose() { if (this.destroyed) return; this.stop(); this.destroyed = true; clearTimeout(this.preloadTimer); this.abort.abort(); this.scene.clear(); this.registry.clear(); this.kit.dispose(); this.renderer.dispose(); }
}
