import { CHAPTERS } from './story.js';
import { Pane } from 'tweakpane';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
/** Development-only controls; Vite removes the caller and this chunk in production. */
export function createEditor(scene) {
  const pane = new Pane({ title: 'BAEV / Scene Lab' });
  const orbit = new OrbitControls(scene.camera, scene.canvas);
  orbit.enableDamping = false;
  orbit.enabled = false;
  orbit.minDistance = 1;
  orbit.maxDistance = 70;
  const state = { orbit: false, shot: 0 };
  const camera = pane.addFolder({ title: 'Камера', expanded: true });
  camera
    .addBinding(state, 'shot', {
      label: 'Кадр',
      options: Object.fromEntries(
        CHAPTERS.map((chapter, i) => [
          `${i + 1} / ${chapter.label}`,
          chapter.at,
        ]),
      ),
    })
    .on('change', (e) => {
      state.orbit = false;
      orbit.enabled = false;
      scene.seek(e.value);
      pane.refresh();
    });
  camera
    .addBinding(scene.params, 'progress', {
      label: 'Путь',
      min: 0,
      max: 1,
      step: 0.001,
    })
    .on('change', () => {
      scene.playing = false;
      scene.editing = false;
      state.orbit = false;
      orbit.enabled = false;
      scene.invalidate();
    });
  camera
    .addBinding(state, 'orbit', { label: 'Свободный ракурс' })
    .on('change', (e) => {
      scene.editing = e.value;
      scene.playing = false;
      orbit.enabled = e.value;
      orbit.target.copy(scene.targets.getPoint(scene.params.progress));
      orbit.update();
      scene.invalidate();
    });
  orbit.addEventListener('change', () => scene.invalidate());
  const light = pane.addFolder({ title: 'Свет и изображение', expanded: true });
  for (const [key, label, min, max] of [
    ['exposure', 'Экспозиция', 0.3, 2.5],
    ['screenLight', 'Свет экрана', 0, 12],
    ['fillLight', 'Заполнение', 0, 2],
    ['bloom', 'Свечение', 0, 0.5],
    ['parallax', 'Параллакс', 0, 0.15],
  ])
    light
      .addBinding(scene.params, key, { label, min, max, step: 0.01 })
      .on('change', () => scene.invalidate());
  light
    .addBinding(scene.params, 'quality', {
      label: 'Качество',
      options: { Авто: 'auto', Лёгкое: 'low', Высокое: 'high' },
    })
    .on('change', () => scene.resize());
  pane
    .addButton({ title: 'Экспортировать настройки кадра' })
    .on('click', () => {
      const data = {
        schema: 'baev-scene-1',
        params: { ...scene.params },
        camera: {
          position: scene.camera.position.toArray(),
          target: orbit.enabled
            ? orbit.target.toArray()
            : scene.targets.getPoint(scene.params.progress).toArray(),
        },
      };
      const url = URL.createObjectURL(
        new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }),
      );
      const a = document.createElement('a');
      a.href = url;
      a.download = 'baev-shot.json';
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    });
  pane.addButton({ title: 'Вернуться к просмотру' }).on('click', toggle);
  let shown = true;
  document.body.classList.add('editor-open');
  function toggle() {
    shown = !shown;
    pane.hidden = !shown;
    document.body.classList.toggle('editor-open', shown);
    if (!shown) {
      orbit.enabled = false;
      scene.editing = false;
      scene.invalidate();
    }
  }
  return {
    toggle,
    dispose() {
      orbit.dispose();
      pane.dispose();
      document.body.classList.remove('editor-open');
    },
  };
}
