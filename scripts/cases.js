/* Native case media and galleries. The complete article remains readable without JavaScript. */
(() => {
  'use strict';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const conserve = Boolean(navigator.connection && navigator.connection.saveData);
  const videos = [...document.querySelectorAll('video[data-case-video]')];
  const states = new Map();

  function pause(video) {
    const state = states.get(video);
    if (!video.paused) {
      state.policyPause = true;
      video.pause();
    }
  }

  function play(video) {
    const state = states.get(video);
    if (!state.visible || state.userPaused || state.pending || document.hidden || reduce.matches || conserve) return;
    if (!video.paused && !video.ended) return;
    state.pending = true;
    const attempt = video.play();
    Promise.resolve(attempt).then(() => {
      video.removeAttribute('data-play-blocked');
      state.blocked = false;
    }).catch(() => {
      state.blocked = true;
      video.setAttribute('data-play-blocked', '');
    }).finally(() => { state.pending = false; });
  }

  for (const video of videos) {
    const state = { visible: false, userPaused: false, policyPause: false, pending: false, blocked: false };
    states.set(video, state);
    video.autoplay = false;
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.controls = true;
    video.preload = 'none';
    video.addEventListener('pause', () => {
      if (state.policyPause) { state.policyPause = false; return; }
      if (state.visible && !document.hidden) state.userPaused = true;
    });
    video.addEventListener('play', () => {
      if (!state.pending) state.userPaused = false;
      video.removeAttribute('data-play-blocked');
    });
    video.addEventListener('error', () => video.setAttribute('data-media-error', ''));
  }

  // A deliberately cropped artwork can hide the native control bar. Its
  // external button controls the same video without changing the source crop.
  document.querySelectorAll('[data-case-video-toggle]').forEach(button => {
    const video = document.getElementById(button.dataset.caseVideoToggle);
    if (!states.has(video)) return;
    const sync = () => {
      button.textContent = video.paused ? 'Воспроизвести' : 'Пауза';
      button.setAttribute('aria-label', (video.paused ? 'Воспроизвести' : 'Приостановить') + ' видео VRT World');
    };
    button.addEventListener('click', async () => {
      if (!video.paused) video.pause();
      else {
        try { await video.play(); }
        catch { video.setAttribute('data-play-blocked', ''); }
      }
      sync();
    });
    ['play', 'pause', 'ended'].forEach(event => video.addEventListener(event, sync));
    video.controls = false;
    video.tabIndex = -1;
    button.hidden = false;
    sync();
  });

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        const video = entry.target;
        const state = states.get(video);
        state.visible = entry.isIntersecting;
        if (state.visible) play(video); else pause(video);
      }
    }, { threshold: 0.01 });
    videos.forEach(video => observer.observe(video));
  }
  // Without IntersectionObserver, native controls and posters stay usable; no page-wide autoplay.
  document.addEventListener('visibilitychange', () => {
    videos.forEach(video => document.hidden ? pause(video) : play(video));
  });
  const motionChange = () => videos.forEach(video => {
    if (reduce.matches) pause(video); else play(video);
  });
  if (reduce.addEventListener) reduce.addEventListener('change', motionChange);
  else reduce.addListener(motionChange);

  document.querySelectorAll('[data-case-embed]').forEach(button => {
    button.addEventListener('click', event => {
      if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      const url = new URL(button.dataset.caseEmbed, location.origin);
      if (!['vk.com', 'vkvideo.ru', 'kinescope.io'].includes(url.hostname)) return;
      event.preventDefault();
      const iframe = document.createElement('iframe');
      iframe.src = url.href;
      iframe.title = button.getAttribute('aria-label') || 'Видео проекта';
      iframe.allow = 'fullscreen; picture-in-picture; encrypted-media';
      iframe.allowFullscreen = true;
      iframe.referrerPolicy = 'strict-origin-when-cross-origin';
      iframe.className = 'baev-case-embed-frame';
      iframe.style.cssText = button.style.cssText;
      button.replaceWith(iframe);
      iframe.focus();
    });
  });

  document.querySelectorAll('[data-case-carousel]').forEach((track, index) => {
    track.tabIndex = 0;
    if (!track.hasAttribute('aria-label')) track.setAttribute('aria-label', 'Материалы проекта, горизонтальная галерея');
    if (!track.id) track.id = 'case-gallery-' + index;
    const controls = document.createElement('div');
    controls.className = 'baev-gallery-controls';
    const previous = document.createElement('button');
    const next = document.createElement('button');
    previous.type = next.type = 'button';
    previous.textContent = '←'; next.textContent = '→';
    previous.setAttribute('aria-label', 'Предыдущий материал');
    next.setAttribute('aria-label', 'Следующий материал');
    previous.setAttribute('aria-controls', track.id); next.setAttribute('aria-controls', track.id);
    const status = document.createElement('span');
    status.setAttribute('aria-live', 'polite');
    controls.append(previous, status, next);
    track.after(controls);
    const items = [...track.children];
    function move(direction) {
      const width = items[0]?.getBoundingClientRect().width || track.clientWidth * 0.9;
      const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 20;
      track.scrollBy({ left: direction * (width + gap), behavior: reduce.matches ? 'auto' : 'smooth' });
    }
    function update() {
      const max = track.scrollWidth - track.clientWidth;
      previous.disabled = track.scrollLeft < 2;
      next.disabled = track.scrollLeft >= max - 2;
      const width = items[0]?.getBoundingClientRect().width || 1;
      const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 20;
      const current = Math.max(1, Math.min(items.length, Math.round(track.scrollLeft / (width + gap)) + 1));
      status.textContent = current + ' / ' + items.length;
    }
    previous.addEventListener('click', () => move(-1));
    next.addEventListener('click', () => move(1));
    track.addEventListener('keydown', event => {
      if (event.target !== track || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
      event.preventDefault(); move(event.key === 'ArrowLeft' ? -1 : 1);
    });
    track.addEventListener('scroll', update, { passive: true });
    if ('ResizeObserver' in window) new ResizeObserver(update).observe(track);
    else window.addEventListener('resize', update, { passive: true });
    update();
  });
})();
