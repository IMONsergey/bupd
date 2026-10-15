import './style.css';
import { validateShots } from './settings.js';
const $ = (id) => document.getElementById(id);
const canvas = $('viewport'),
  notice = $('notice');
const media = matchMedia('(prefers-reduced-motion: reduce)');
let scene,
  staticMode = false,
  editor,
  pointerStart;
const abort = new AbortController();
const on = (target, name, fn, options = {}) =>
  target.addEventListener(name, fn, { ...options, signal: abort.signal });
const isControl = (target) =>
  target instanceof Element &&
  !!target.closest('a,button,input,select,textarea,[contenteditable],.tp-dfwv');
function update(change = {}) {
  if (change.error) {
    document.body.dataset.ready = 'fallback';
    canvas.hidden = true;
    document.querySelector('.controls').hidden = true;
    notice.textContent = change.error;
    notice.hidden = false;
    return;
  }
  if (change.ready) {
    document.body.dataset.ready = 'true';
    document.body.classList.add('ready');
    notice.hidden = true;
    document.querySelector('.controls').hidden = false;
  }
  const s = scene?.stats();
  if (!s) return;
  const index = Math.min(2, Math.round(s.progress * 2));
  document.querySelectorAll('[data-shot]').forEach((button) => {
    if (+button.dataset.shot === index)
      button.setAttribute('aria-current', 'step');
    else button.removeAttribute('aria-current');
  });
  $('timeline').value = s.progress;
  $('timeline').setAttribute(
    'aria-valuetext',
    `Путь камеры: ${Math.round(s.progress * 100)}%`,
  );
  $('position').textContent = `0${index + 1} / 03`;
  $('play').setAttribute('aria-pressed', String(s.playing));
  $('play-symbol').textContent = s.playing ? 'Ⅱ' : '▶';
  $('play-text').textContent = s.playing
    ? 'Остановить камеру'
    : s.progress > 0.999
      ? 'Повторить эпизод'
      : 'Пройти к сцене';
  $('motion').setAttribute('aria-pressed', String(!s.reduced));
  $('motion').textContent = `Движение: ${s.reduced ? 'выкл.' : 'вкл.'}`;
}
async function boot() {
  try {
    const response = await fetch(`${import.meta.env.BASE_URL}shots.json`);
    if (!response.ok) throw new Error('Camera data unavailable.');
    const shots = validateShots(await response.json());
    const { CinemaScene } = await import('./scene.js');
    scene = new CinemaScene(canvas, shots, update);
    const hash = Number(location.hash.replace('#', ''));
    if (Number.isFinite(hash) && hash >= 0 && hash <= 1)
      scene.params.progress = hash;
    await scene.load();
    update();
    Object.defineProperty(window, '__BAEV_LAB__', {
      value: Object.freeze({
        stats: () => scene.stats(),
        seek: (value) => scene.seek(value),
        get scene() {
          return import.meta.env.DEV ? scene : undefined;
        },
      }),
    });
    if (import.meta.env.DEV) {
      $('editor-link').hidden = false;
      const openEditor = async () => {
        if (!editor) {
          const module = await import('./editor.js');
          editor = module.createEditor(scene);
        } else editor.toggle();
      };
      on($('editor-link'), 'click', openEditor);
      if (new URLSearchParams(location.search).has('edit')) await openEditor();
    }
    if (document.hidden) scene.pause();
  } catch (error) {
    console.error('[BAEV Scene Lab]', error);
    update({
      error:
        '3D недоступно. Показан рендер сцены; проекты и контакты работают.',
    });
    scene?.dispose();
  }
}
on($('play'), 'click', () => {
  if (!staticMode) scene?.play();
});
on($('timeline'), 'input', (e) => scene?.seek(+e.target.value));
document.querySelectorAll('[data-shot]').forEach((button) =>
  on(button, 'click', () => {
    const value = +button.dataset.shot / 2;
    scene?.seek(value);
    history.replaceState(null, '', `#${value}`);
  }),
);
on($('motion'), 'click', () => scene?.setReduced(!scene.reduced));
on(media, 'change', () => scene?.setReduced(media.matches));
on($('static'), 'click', () => {
  staticMode = !staticMode;
  canvas.hidden = staticMode;
  $('static').textContent = staticMode ? 'Вернуть 3D' : 'Без 3D';
  if (staticMode) scene.pause();
  else scene.resume();
});
on(window, 'resize', () => scene?.resize());
on(document, 'visibilitychange', () => {
  if (document.hidden || staticMode) scene?.pause();
  else scene?.resume();
});
on(window, 'pagehide', (e) => {
  scene?.pause();
  if (!e.persisted) {
    editor?.dispose();
    scene?.dispose();
    abort.abort();
  }
});
on(window, 'pageshow', (e) => {
  if (e.persisted && !staticMode) scene?.resume();
});
on(canvas, 'pointermove', (e) => {
  if (scene && !scene.reduced && e.pointerType === 'mouse') {
    scene.pointer.set(
      (e.clientX / innerWidth) * 2 - 1,
      1 - (e.clientY / innerHeight) * 2,
    );
    scene.invalidate();
  }
});
on(canvas, 'pointerleave', () => {
  scene?.pointer.set(0, 0);
  scene?.invalidate();
});
on(canvas, 'pointerdown', (e) => {
  if (e.isPrimary) pointerStart = { x: e.clientX, y: e.clientY };
  else pointerStart = null;
});
on(canvas, 'pointerup', (e) => {
  if (!pointerStart || !scene) return;
  const dx = e.clientX - pointerStart.x,
    dy = e.clientY - pointerStart.y;
  if (Math.abs(dy) > 60 && Math.abs(dy) > Math.abs(dx) * 1.3)
    scene.seek(
      Math.round(scene.params.progress * 2) / 2 + (dy < 0 ? 0.5 : -0.5),
    );
  pointerStart = null;
});
on(canvas, 'pointercancel', () => {
  pointerStart = null;
});
on(window, 'keydown', (e) => {
  if (
    isControl(e.target) ||
    !scene ||
    staticMode ||
    e.ctrlKey ||
    e.metaKey ||
    e.altKey
  )
    return;
  if (['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp'].includes(e.key)) {
    e.preventDefault();
    scene.seek(
      Math.round(scene.params.progress * 2) / 2 +
        (['ArrowRight', 'ArrowDown'].includes(e.key) ? 0.5 : -0.5),
    );
  }
  if (e.key === ' ') {
    e.preventDefault();
    scene.play();
  }
});
let wheelSpent = false,
  wheelTimer;
on(
  canvas,
  'wheel',
  (e) => {
    if (
      e.ctrlKey ||
      !scene ||
      staticMode ||
      Math.abs(e.deltaY) < 10 ||
      Math.abs(e.deltaX) > Math.abs(e.deltaY)
    )
      return;
    e.preventDefault();
    clearTimeout(wheelTimer);
    wheelTimer = setTimeout(() => {
      wheelSpent = false;
    }, 250);
    if (!wheelSpent) {
      wheelSpent = true;
      scene.seek(
        Math.round(scene.params.progress * 2) / 2 + Math.sign(e.deltaY) * 0.5,
      );
    }
  },
  { passive: false },
);
boot();
