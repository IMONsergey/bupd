import {
  CHAPTERS,
  CASES,
  GestureGate,
  indexFromHash,
  clamp,
} from './chapters.js';

const $ = (id) => document.getElementById(id);
const body = document.body,
  experience = $('experience'),
  plain = $('plain'),
  dialog = $('chapter-dialog');
const media = matchMedia('(prefers-reduced-motion: reduce)'),
  gate = new GestureGate(),
  params = new URLSearchParams(location.search);
const state = {
  engine: null,
  current: indexFromHash(location.hash),
  reduced: media.matches,
  motionOverridden: false,
  ready: false,
  plain: params.get('view') === 'plain',
  travelling: false,
  caseIndex: 0,
  assets: new Map(),
  returnFocus: null,
};
const abort = new AbortController(),
  listen = (target, event, callback, options = {}) =>
    target.addEventListener(event, callback, {
      ...options,
      signal: abort.signal,
    });
const interactive = (target) =>
  target instanceof Element &&
  Boolean(
    target.closest(
      'button, a, input, textarea, select, summary, [contenteditable], dialog',
    ),
  );
function titleLines(element, text) {
  const nodes = [];
  text.split('\n').forEach((line, index) => {
    if (index) nodes.push(document.createElement('br'));
    nodes.push(document.createTextNode(line));
  });
  element.replaceChildren(...nodes);
}
function updateCase(index) {
  state.caseIndex = (index + CASES.length) % CASES.length;
  state.engine?.selectCase(state.caseIndex);
  const project = CASES[state.caseIndex];
  $('case-title').textContent = project.title;
  $('case-subtitle').textContent = project.subtitle;
  $('case-link').href = project.href;
  $('case-count').textContent =
    `${String(state.caseIndex + 1).padStart(2, '0')} / 03`;
  $('asset-notice').hidden = state.assets.get(state.caseIndex) !== false;
}
function updateChapter(announce = true) {
  const chapter = CHAPTERS[state.current],
    number = String(state.current + 1).padStart(2, '0');
  titleLines($('scene-title'), chapter.title);
  $('scene-description').textContent = chapter.copy;
  $('chapter-label').textContent = `${number} — ${chapter.label}`;
  $('chapter-top').textContent = `${number} / ${chapter.label}`;
  $('chapter-counter').textContent = number;
  $('next-label').textContent = chapter.action;
  $('scene-next').hidden = state.current === 7;
  $('scene-contact').hidden = state.current !== 7;
  $('scene-detail').hidden = !chapter.detail;
  $('scene-detail').textContent = chapter.detail || '';
  $('scene-detail').setAttribute('aria-pressed', 'false');
  $('case-panel').hidden = state.current !== 5;
  $('brief-panel').hidden = state.current !== 7;
  $('chapter-prev').disabled = state.current === 0;
  $('chapter-next').disabled = state.current === 7;
  $('scene-note').textContent = [1, 3, 4, 6].includes(state.current)
    ? 'Демонстрационный материал BAEV'
    : state.current === 5
      ? 'Оригинальные материалы проектов'
      : state.current === 7
        ? 'Ваша следующая история начинается здесь'
        : 'Колесо, свайп или стрелки — следующая глава';
  for (const button of document.querySelectorAll('[data-chapter]')) {
    if (Number(button.dataset.chapter) === state.current)
      button.setAttribute('aria-current', 'step');
    else button.removeAttribute('aria-current');
  }
  body.dataset.scene = chapter.id;
  if (announce)
    $('scene-announcement').textContent =
      `Глава ${state.current + 1} из 8. ${chapter.label}. ${chapter.title.replace('\n', ' ')}`;
  if (state.current === 5) updateCase(state.caseIndex);
  if (state.current === 7) state.engine?.setTitle($('project-title').value);
}
function go(index, { historyMode = 'push' } = {}) {
  index = clamp(Math.round(index), 0, CHAPTERS.length - 1);
  if (!state.ready || state.plain || index === state.current) return;
  try {
    state.engine.go(index);
  } catch (error) {
    console.error('[BAEV] Navigation failed', error);
    showPlain('Не удалось открыть 3D-сцену. Все главы доступны ниже.');
    return;
  }
  state.current = index;
  updateChapter();
  if (historyMode !== 'none')
    history[historyMode === 'replace' ? 'replaceState' : 'pushState'](
      { chapter: index },
      '',
      `#${CHAPTERS[index].id}`,
    );
}
function motionLabel() {
  body.dataset.motion = state.reduced ? 'reduce' : 'full';
  $('motion-toggle').setAttribute('aria-pressed', String(!state.reduced));
  $('motion-toggle').replaceChildren(document.createTextNode('Движение '));
  const span = document.createElement('span');
  span.textContent = state.reduced ? 'выкл.' : 'вкл.';
  $('motion-toggle').append(span);
}
function showPlain(reason = '') {
  state.plain = true;
  body.classList.remove('is-enhanced', 'is-travelling');
  experience.hidden = true;
  plain.hidden = false;
  $('fallback-reason').textContent = reason;
  $('return-3d').hidden = !state.ready || Boolean(state.engine?.failed);
  state.engine?.stop();
  if (dialog.open) dialog.close();
  window.scrollTo(0, 0);
  body.dataset.mode = 'plain';
}
function returnTo3D() {
  if (!state.ready || state.engine.failed) return;
  state.plain = false;
  body.classList.add('is-enhanced');
  experience.hidden = false;
  plain.hidden = true;
  body.dataset.mode = '3d';
  state.engine.resize();
  state.engine.start();
  $('scene-next').hidden ? $('scene-contact').focus() : $('scene-next').focus();
}
function openMap(trigger) {
  if (!state.ready || state.plain) return;
  state.returnFocus = trigger;
  dialog.showModal();
  state.engine.stop();
  dialog.querySelector('[aria-current=step]')?.focus();
}
function closeMap() {
  dialog.close();
  if (!state.plain && !document.hidden) state.engine?.start();
  state.returnFocus?.focus();
}
CHAPTERS.forEach((chapter, index) => {
  const number = String(index + 1).padStart(2, '0'),
    track = document.createElement('button');
  track.type = 'button';
  track.dataset.chapter = index;
  track.setAttribute('aria-label', `${number}. ${chapter.label}`);
  track.title = chapter.label;
  const n = document.createElement('span');
  n.className = 'track-index';
  n.textContent = number;
  track.append(n, document.createTextNode(chapter.label));
  $('chapter-track').append(track);
  const map = document.createElement('button');
  map.type = 'button';
  map.dataset.chapter = index;
  const prefix = document.createElement('span');
  prefix.textContent = number;
  const arrow = document.createElement('span');
  arrow.textContent = '↗';
  arrow.setAttribute('aria-hidden', 'true');
  map.append(prefix, document.createTextNode(chapter.label), arrow);
  $('map-items').append(map);
  listen(track, 'click', () => go(index));
  listen(map, 'click', () => {
    closeMap();
    go(index);
  });
});
listen($('scene-next'), 'click', () => {
  if (!state.travelling) go(state.current + 1);
});
listen($('chapter-next'), 'click', () => {
  if (!state.travelling) go(state.current + 1);
});
listen($('chapter-prev'), 'click', () => {
  if (!state.travelling) go(state.current - 1);
});
listen($('scene-detail'), 'click', () => {
  if (!state.ready || state.travelling) return;
  const active = state.engine.toggleDetail();
  $('scene-detail').setAttribute('aria-pressed', String(active));
  if (state.current === 1)
    $('scene-detail').textContent = active ? 'Раскрыть слои' : 'Собрать кадр';
  if (state.current === 2)
    $('scene-detail').textContent = active ? 'Сменить ракурс' : 'Найти фокус';
  if (state.current === 4)
    $('scene-detail').textContent = active
      ? 'Скрыть устройство'
      : 'Показать устройство';
  if (state.current === 3)
    $('scene-announcement').textContent =
      `Сценарий: ${['контекст', 'аргумент', 'решение', 'следующий шаг'][state.engine.step]}.`;
});
listen($('case-prev'), 'click', () => updateCase(state.caseIndex - 1));
listen($('case-next'), 'click', () => updateCase(state.caseIndex + 1));
listen($('project-title'), 'input', (event) =>
  state.engine?.setTitle(event.target.value),
);
listen($('plain-toggle'), 'click', () => {
  showPlain();
  $('return-3d').focus();
});
listen($('return-3d'), 'click', returnTo3D);
listen(document.querySelector('.skip'), 'click', (event) => {
  event.preventDefault();
  showPlain();
  plain.tabIndex = -1;
  plain.focus();
});
listen($('motion-toggle'), 'click', () => {
  state.reduced = !state.reduced;
  state.motionOverridden = true;
  state.engine?.setReduced(state.reduced);
  motionLabel();
});
listen(media, 'change', () => {
  if (!state.motionOverridden) {
    state.reduced = media.matches;
    state.engine?.setReduced(state.reduced);
    motionLabel();
  }
});
listen($('quality'), 'change', (event) =>
  state.engine?.setQuality(event.target.value),
);
listen($('map-open'), 'click', (event) => openMap(event.currentTarget));
listen($('chapter-map'), 'click', (event) => openMap(event.currentTarget));
listen($('map-close'), 'click', closeMap);
listen(dialog, 'cancel', (event) => {
  event.preventDefault();
  closeMap();
});
listen(dialog, 'click', (event) => {
  if (event.target === dialog) closeMap();
});
listen(window, 'popstate', () => {
  if (state.ready) go(indexFromHash(location.hash), { historyMode: 'none' });
});
listen(window, 'hashchange', () => {
  if (state.ready && indexFromHash(location.hash) !== state.current)
    go(indexFromHash(location.hash), { historyMode: 'none' });
});
listen(window, 'keydown', (event) => {
  if (
    !state.ready ||
    state.plain ||
    dialog.open ||
    interactive(event.target) ||
    event.ctrlKey ||
    event.metaKey ||
    event.altKey
  )
    return;
  if (['ArrowDown', 'ArrowRight', 'PageDown', ' '].includes(event.key)) {
    event.preventDefault();
    if (!event.repeat && !state.travelling) go(state.current + 1);
  }
  if (['ArrowUp', 'ArrowLeft', 'PageUp'].includes(event.key)) {
    event.preventDefault();
    if (!event.repeat && !state.travelling) go(state.current - 1);
  }
  if (event.key === 'Home') {
    event.preventDefault();
    go(0);
  }
  if (event.key === 'End') {
    event.preventDefault();
    go(7);
  }
  if (event.key.toLowerCase() === 'm') openMap($('map-open'));
});
listen(
  experience,
  'wheel',
  (event) => {
    if (
      !state.ready ||
      state.plain ||
      dialog.open ||
      interactive(event.target) ||
      event.ctrlKey ||
      Math.abs(event.deltaX) > Math.abs(event.deltaY)
    )
      return;
    event.preventDefault();
    const delta =
      event.deltaY *
      (event.deltaMode === 1
        ? 16
        : event.deltaMode === 2
          ? window.innerHeight
          : 1);
    const direction = gate.feed(delta, performance.now(), state.travelling);
    if (direction) go(state.current + direction);
  },
  { passive: false },
);
const pointers = new Set();
let touch = null;
listen($('world'), 'pointerdown', (event) => {
  pointers.add(event.pointerId);
  if (pointers.size > 1) {
    touch = null;
    return;
  }
  touch = {
    x: event.clientX,
    y: event.clientY,
    time: performance.now(),
    id: event.pointerId,
  };
});
listen(window, 'pointerup', (event) => {
  pointers.delete(event.pointerId);
  if (
    !touch ||
    touch.id !== event.pointerId ||
    !state.ready ||
    state.plain ||
    dialog.open
  )
    return;
  const dx = event.clientX - touch.x,
    dy = event.clientY - touch.y,
    age = performance.now() - touch.time;
  if (
    age < 1500 &&
    Math.abs(dy) > 60 &&
    Math.abs(dy) > Math.abs(dx) * 1.25 &&
    !state.travelling
  )
    go(state.current + (dy < 0 ? 1 : -1));
  else if (Math.hypot(dx, dy) < 8 && age < 600 && !interactive(event.target)) {
    const hit = state.engine.pick(event.clientX, event.clientY);
    if (hit?.type === 'case') updateCase(hit.index);
    if (hit?.type === 'step') {
      state.engine.selectStep(hit.index);
      $('scene-announcement').textContent = `Аргумент ${hit.index + 1} из 4.`;
    }
  }
  touch = null;
});
listen(window, 'pointercancel', (event) => {
  pointers.delete(event.pointerId);
  touch = null;
});
listen(experience, 'pointermove', (event) => {
  if (!state.engine || state.reduced || event.pointerType !== 'mouse') return;
  state.engine.setPointer(
    (event.clientX / window.innerWidth - 0.5) * 2,
    -(event.clientY / window.innerHeight - 0.5) * 2,
  );
});
listen(experience, 'pointerleave', () => state.engine?.setPointer(0, 0));
listen(document, 'visibilitychange', () => {
  if (!state.engine) return;
  if (document.hidden) state.engine.stop();
  else if (!state.plain && !dialog.open) state.engine.start();
});
listen(window, 'pagehide', (event) => {
  state.engine?.stop();
  if (!event.persisted) {
    state.engine?.dispose();
    abort.abort();
  }
});
listen(window, 'pageshow', (event) => {
  if (event.persisted && !state.plain && !dialog.open) state.engine?.start();
});
motionLabel();
updateChapter(false);
async function boot() {
  if (state.plain) {
    showPlain();
    return;
  }
  const capability = document.createElement('canvas');
  let context;
  try {
    context = capability.getContext('webgl2');
  } catch {
    context = null;
  }
  if (!context || params.get('renderer') === 'none') {
    showPlain(
      '3D недоступно на этом устройстве. Содержание, проекты и контакты доступны без него.',
    );
    body.dataset.ready = 'fallback';
    experience.setAttribute('aria-busy', 'false');
    return;
  }
  context.getExtension('WEBGL_lose_context')?.loseContext();
  body.classList.add('is-enhanced');
  experience.hidden = false;
  plain.hidden = true;
  body.dataset.mode = '3d';
  const timeout = window.setTimeout(() => {
    if (!state.ready)
      showPlain(
        'Загрузка 3D заняла слишком много времени. Можно продолжить без неё.',
      );
  }, 12000);
  try {
    const { JourneyEngine } = await import('./engine.js');
    state.engine = new JourneyEngine($('world'), {
      reduced: state.reduced,
      onFailure: (message) => {
        state.ready = false;
        body.dataset.ready = 'fallback';
        showPlain(message);
      },
      onAssetStatus: (index, success) => {
        state.assets.set(index, success);
        if (state.current === 5) updateCase(state.caseIndex);
      },
      onTravel: (travelling, opacity, color) => {
        state.travelling = travelling;
        body.classList.toggle('is-travelling', travelling);
        body.dataset.travelling = String(travelling);
        experience.setAttribute('aria-busy', String(travelling));
        $('transition-mask').style.backgroundColor = color;
        $('transition-mask').style.opacity = String(opacity);
      },
    });
    await state.engine.init(state.current);
    if (state.engine.failed) return;
    state.ready = true;
    experience.setAttribute('aria-busy', 'false');
    $('loading').hidden = true;
    body.dataset.ready = 'true';
    if (state.plain) {
      state.engine.stop();
      $('return-3d').hidden = false;
    } else if (document.hidden) state.engine.stop();
    if (!location.hash)
      history.replaceState({ chapter: state.current }, '', '#opening');
    updateChapter(false);
    Object.defineProperty(window, '__BAEV_JOURNEY__', {
      configurable: true,
      value: Object.freeze({
        get ready() {
          return state.ready;
        },
        get current() {
          return state.current;
        },
        go: (index) => go(index),
        stats: () => state.engine.stats(),
        get engine() {
          return params.has('debug') ? state.engine : undefined;
        },
      }),
    });
    if (params.has('debug')) {
      const output = document.createElement('output');
      output.className = 'debug-stats';
      output.setAttribute('aria-hidden', 'true');
      experience.append(output);
      const interval = setInterval(() => {
        if (state.engine.destroyed) {
          clearInterval(interval);
          return;
        }
        const s = state.engine.stats();
        output.textContent = `SCENE ${s.scene + 1}/8\n${s.drawCalls} draws · ${s.triangles} triangles\n${s.averageFrameMs} ms · DPR ${s.pixelRatio}\n${s.textures} textures · ${s.geometries} geometries`;
      }, 800);
    }
  } catch (error) {
    console.error('[BAEV] 3D unavailable', error);
    state.engine?.dispose();
    state.ready = false;
    body.dataset.ready = 'fallback';
    showPlain(
      'Не удалось загрузить 3D. Все главы, проекты и контакты доступны в текстовой версии.',
    );
  } finally {
    clearTimeout(timeout);
  }
}
boot();
