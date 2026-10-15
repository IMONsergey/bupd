import './style.css';
import {
  CHAPTERS,
  PROJECTS,
  chapterFromHash,
  chapterIndex,
  nextStop,
  WheelIntent,
} from './story.js';
const $ = (id) => document.getElementById(id),
  canvas = $('viewport'),
  notice = $('notice');
const media = matchMedia('(prefers-reduced-motion: reduce)'),
  gate = new WheelIntent();
const abort = new AbortController(),
  on = (target, event, fn, options = {}) =>
    target.addEventListener(event, fn, { ...options, signal: abort.signal });
const isControl = (target) =>
  target instanceof Element &&
  !!target.closest('a,button,input,select,textarea,[contenteditable],.tp-dfwv');
let scene,
  editor,
  staticMode = false,
  ready = false,
  motionOverride = false,
  lastChapter = -1,
  activePointers = new Set(),
  pointerStart = null;
function lines(element, text) {
  const nodes = [];
  text.split('\n').forEach((line, i) => {
    if (i) nodes.push(document.createElement('br'));
    nodes.push(document.createTextNode(line));
  });
  element.replaceChildren(...nodes);
}
function projectUI() {
  if (!scene) return;
  const s = scene.stats(),
    p = PROJECTS[s.project];
  $('case-title').textContent = p.title;
  $('case-subtitle').textContent = p.subtitle;
  $('case-link').href = p.href;
  $('case-number').textContent = `0${s.project + 1} / 03`;
  $('case-error').hidden = !s.projectError;
}
function update(change = {}) {
  if (change.error) {
    ready = false;
    document.body.dataset.ready = 'fallback';
    notice.textContent = change.error;
    notice.hidden = false;
    showPlain();
    return;
  }
  if (change.ready) {
    ready = true;
    document.body.dataset.ready = 'true';
    document.body.classList.add('ready');
    notice.hidden = true;
    document.querySelector('.controls').hidden = staticMode;
  }
  if (!scene) return;
  const s = scene.stats(),
    index = chapterIndex(s.progress),
    chapter = CHAPTERS[index];
  if (index !== lastChapter) {
    lastChapter = index;
    lines($('title'), chapter.title);
    $('description').textContent = chapter.text;
    $('chapter-label').textContent =
      `0${index + 1} / ${chapter.label.toUpperCase()}`;
    $('announcement').textContent =
      `Глава ${index + 1} из 8. ${chapter.label}. ${chapter.title.replace('\n', ' ')}`;
    document.body.dataset.chapter = chapter.id;
    document.querySelectorAll('[data-shot]').forEach((button) => {
      if (+button.dataset.shot === index)
        button.setAttribute('aria-current', 'step');
      else button.removeAttribute('aria-current');
    });
  }
  $('timeline').value = s.progress;
  $('timeline').setAttribute(
    'aria-valuetext',
    `${index + 1} из 8: ${chapter.label}`,
  );
  $('position').textContent = `0${index + 1} / 08`;
  $('advance').hidden = s.progress >= 0.999;
  $('contact-cta').hidden = s.progress < 0.999;
  $('advance').firstChild.textContent =
    index === 0
      ? 'Внутрь истории '
      : index === 3
        ? 'По ту сторону экрана '
        : 'Продолжить ';
  $('back').disabled = s.progress < 0.001;
  $('case-panel').hidden = !(s.progress >= 0.77 && s.progress < 0.895);
  $('play').setAttribute('aria-pressed', String(s.playing));
  $('play').setAttribute(
    'aria-label',
    s.playing ? 'Остановить историю' : 'Проиграть всю историю',
  );
  $('play-symbol').textContent = s.playing ? 'Ⅱ' : '▶';
  $('play-text').textContent = s.playing
    ? 'Остановить'
    : s.progress >= 0.999
      ? 'Повторить историю'
      : 'Смотреть историю';
  $('motion').setAttribute('aria-pressed', String(!s.reduced));
  $('motion').textContent = `Движение: ${s.reduced ? 'выкл.' : 'вкл.'}`;
  if (change.mask !== undefined)
    $('passage').style.opacity = String(s.reduced ? 0 : change.mask);
  document.body.classList.toggle('travelling', s.travelling);
  document.body.dataset.world = s.world || 'hall';
  if (change.project !== undefined || change.assets) projectUI();
}
function go(value, instant = false, writeHistory = true) {
  if (!ready || staticMode) return;
  if (instant) scene.seek(value);
  else scene.go(value);
  if (writeHistory) {
    const chapter = CHAPTERS[chapterIndex(value)];
    history.pushState(null, '', `#${chapter.id}`);
  }
}
function showPlain() {
  staticMode = true;
  canvas.hidden = true;
  document.querySelector('.controls').hidden = true;
  $('plain').hidden = false;
  $('return').hidden = !ready;
  document.body.classList.add('plain-mode');
  scene?.pause();
}
function return3D() {
  if (!ready || scene.failed) return;
  staticMode = false;
  canvas.hidden = false;
  $('plain').hidden = true;
  document.querySelector('.controls').hidden = false;
  document.body.classList.remove('plain-mode');
  scene.resize();
  scene.resume();
  $('advance').focus();
}
CHAPTERS.forEach((chapter, i) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.dataset.shot = i;
  button.title = chapter.label;
  button.setAttribute('aria-label', `${i + 1}. ${chapter.label}`);
  const index = document.createElement('span');
  index.textContent = `0${i + 1}`;
  button.append(index);
  $('chapters').append(button);
  on(button, 'click', () => go(chapter.at, true));
});
async function boot() {
  const timer = setTimeout(() => {
    if (!ready) {
      notice.textContent =
        '3D загружается дольше обычного. Содержание доступно ниже.';
      showPlain();
    }
  }, 25000);
  try {
    const { CinemaScene } = await import('./scene.js');
    scene = new CinemaScene(canvas, CHAPTERS, update);
    scene.params.progress = chapterFromHash(location.hash);
    await scene.load();
    Object.defineProperty(window, '__BAEV_LAB__', {
      value: Object.freeze({
        stats: () => scene.stats(),
        seek: (value) => scene.seek(value),
        go: (value) => scene.go(value),
        get scene() {
          return import.meta.env.DEV ? scene : undefined;
        },
      }),
    });
    projectUI();
    update();
    if (import.meta.env.DEV) {
      $('editor-link').hidden = false;
      on($('editor-link'), 'click', async () => {
        if (!editor) {
          const module = await import('./editor.js');
          editor = module.createEditor(scene);
        } else editor.toggle();
      });
    }
    if (staticMode) {
      scene.pause();
      $('return').hidden = false;
    } else if (document.hidden) scene.pause();
    if (!location.hash) history.replaceState(null, '', '#opening');
  } catch (error) {
    console.error('[BAEV]', error);
    update({
      error: 'Не удалось загрузить 3D. Все главы и контакты доступны без него.',
    });
    scene?.dispose();
  } finally {
    clearTimeout(timer);
  }
}
on($('advance'), 'click', () => {
  if (scene && !scene.travel) go(nextStop(scene.params.progress, 1));
});
on($('back'), 'click', () => {
  if (scene && !scene.travel) go(nextStop(scene.params.progress, -1));
});
on($('play'), 'click', () => {
  if (ready && !staticMode) scene.play();
});
on($('timeline'), 'input', (e) => {
  if (ready) scene.seek(+e.target.value);
});
on($('timeline'), 'change', () =>
  history.replaceState(
    null,
    '',
    `#${CHAPTERS[chapterIndex(scene.params.progress)].id}`,
  ),
);
on($('motion'), 'click', () => {
  motionOverride = true;
  scene?.setReduced(!scene.reduced);
});
on(media, 'change', () => {
  if (!motionOverride) scene?.setReduced(media.matches);
});
on($('static'), 'click', showPlain);
on($('return'), 'click', return3D);
on(document.querySelector('.skip'), 'click', (e) => {
  e.preventDefault();
  showPlain();
  $('plain').tabIndex = -1;
  $('plain').focus();
});
on($('case-prev'), 'click', () =>
  scene?.selectProject(scene.selectedProject - 1),
);
on($('case-next'), 'click', () =>
  scene?.selectProject(scene.selectedProject + 1),
);
on(window, 'resize', () => scene?.resize());
on(document, 'visibilitychange', () => {
  if (document.hidden || staticMode) scene?.pause();
  else scene?.resume();
});
on(window, 'popstate', () => {
  if (ready) scene.seek(chapterFromHash(location.hash));
});
on(window, 'hashchange', () => {
  if (
    ready &&
    Math.abs(chapterFromHash(location.hash) - scene.params.progress) > 0.002
  )
    scene.seek(chapterFromHash(location.hash));
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
  activePointers.add(e.pointerId);
  pointerStart =
    activePointers.size === 1
      ? { id: e.pointerId, x: e.clientX, y: e.clientY }
      : null;
});
on(window, 'pointerup', (e) => {
  activePointers.delete(e.pointerId);
  if (!pointerStart || pointerStart.id !== e.pointerId || !ready || staticMode)
    return;
  const dx = e.clientX - pointerStart.x,
    dy = e.clientY - pointerStart.y;
  if (Math.abs(dy) > 60 && Math.abs(dy) > Math.abs(dx) * 1.3 && !scene.travel)
    go(nextStop(scene.params.progress, dy < 0 ? 1 : -1));
  pointerStart = null;
});
on(window, 'pointercancel', (e) => {
  activePointers.delete(e.pointerId);
  pointerStart = null;
});
on(window, 'keydown', (e) => {
  if (
    isControl(e.target) ||
    !ready ||
    staticMode ||
    e.ctrlKey ||
    e.metaKey ||
    e.altKey ||
    e.repeat
  )
    return;
  if (
    [
      'ArrowRight',
      'ArrowDown',
      'PageDown',
      'ArrowLeft',
      'ArrowUp',
      'PageUp',
    ].includes(e.key)
  ) {
    e.preventDefault();
    if (!scene.travel)
      go(
        nextStop(
          scene.params.progress,
          ['ArrowRight', 'ArrowDown', 'PageDown'].includes(e.key) ? 1 : -1,
        ),
      );
  }
  if (e.key === ' ') {
    e.preventDefault();
    scene.play();
  }
  if (e.key === 'Home') {
    e.preventDefault();
    go(0, true);
  }
  if (e.key === 'End') {
    e.preventDefault();
    go(1, true);
  }
});
on(
  canvas,
  'wheel',
  (e) => {
    if (
      e.ctrlKey ||
      !ready ||
      staticMode ||
      Math.abs(e.deltaX) > Math.abs(e.deltaY)
    )
      return;
    e.preventDefault();
    const delta =
      e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? innerHeight : 1);
    const direction = gate.feed(delta, performance.now(), !!scene.travel);
    if (direction) go(nextStop(scene.params.progress, direction));
  },
  { passive: false },
);
boot();
