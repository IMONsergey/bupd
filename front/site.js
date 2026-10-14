/* BAEV public — progressive interactions, CMS-bound projects, no Framer runtime. */
(() => {
  'use strict';

  const CMS = 'https://baev-cms.vercel.app';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const canAnimate = !reducedMotion.matches;
  const header = document.getElementById('site-header');
  const progress = document.querySelector('.scroll-progress');
  const heroPicture = document.querySelector('.hero__picture');
  const heroVideo = document.querySelector('.hero__video');
  const menu = document.getElementById('mobile-menu');
  const menuToggle = document.querySelector('.menu-toggle');
  const grid = document.getElementById('projects-grid');
  const cards = () => Array.from(grid?.querySelectorAll('.project-card') || []);
  const twoDigits = (value) => String(value).padStart(2, '0');

  document.documentElement.classList.remove('no-js');
  if (canAnimate && 'IntersectionObserver' in window) {
    document.body.classList.add('motion-on');
  }

  // Make animated content visible immediately for people who request less motion,
  // and for clients where IntersectionObserver is unavailable.
  let revealObserver;
  if (document.body.classList.contains('motion-on')) {
    revealObserver = new IntersectionObserver((entries, observer) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    }, { rootMargin: '0px 0px -5% 0px', threshold: 0.05 });
    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
    requestAnimationFrame(() => requestAnimationFrame(() => document.body.classList.add('is-ready')));
  } else {
    document.body.classList.add('is-ready');
  }

  let scheduled = false;
  const updateScroll = () => {
    scheduled = false;
    const scrollTop = Math.max(0, window.scrollY);
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    header?.classList.toggle('is-scrolled', scrollTop > 36);
    if (progress) progress.style.transform = 'scaleX(' + Math.min(1, scrollTop / maxScroll) + ')';
    if (heroPicture && canAnimate && window.innerWidth > 700 && scrollTop <= window.innerHeight * 1.2) {
      heroPicture.style.setProperty('--hero-shift', Math.round(scrollTop * 0.11) + 'px');
    }
  };
  const onScroll = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(updateScroll);
  };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll, { passive: true });
  updateScroll();

  let menuTimer;
  const setMenu = (open) => {
    if (!menu || !menuToggle) return;
    clearTimeout(menuTimer);
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    document.body.classList.toggle('menu-open', open);
    header?.classList.toggle('is-open', open);
    if (open) {
      menu.hidden = false;
      menu.inert = false;
      requestAnimationFrame(() => menu.classList.add('is-open'));
      menu.querySelector('a')?.focus({ preventScroll: true });
    } else {
      menu.classList.remove('is-open');
      menu.inert = true;
      const delay = reducedMotion.matches ? 0 : 340;
      menuTimer = setTimeout(() => { if (menuToggle.getAttribute('aria-expanded') === 'false') menu.hidden = true; }, delay);
    }
  };
  menuToggle?.addEventListener('click', () => setMenu(menuToggle.getAttribute('aria-expanded') !== 'true'));
  menu?.addEventListener('click', (event) => {
    if (event.target.closest('a[href]')) setMenu(false);
  });
  document.addEventListener('keydown', (event) => {
    if (menuToggle?.getAttribute('aria-expanded') !== 'true') return;
    if (event.key === 'Escape') {
      setMenu(false);
      menuToggle.focus();
    }
    if (event.key === 'Tab') {
      const focusables = [menuToggle, ...menu.querySelectorAll('a[href]')];
      const index = focusables.indexOf(document.activeElement);
      if (event.shiftKey && index === 0) {
        event.preventDefault();
        focusables[focusables.length - 1].focus();
      } else if (!event.shiftKey && index === focusables.length - 1) {
        event.preventDefault();
        focusables[0].focus();
      }
    }
  });
  const largeScreen = matchMedia('(min-width: 1051px)');
  const closeOnDesktop = () => {
    if (largeScreen.matches && menuToggle?.getAttribute('aria-expanded') === 'true') setMenu(false);
  };
  largeScreen.addEventListener?.('change', closeOnDesktop);

  // Background video is optional; content remains readable on a still poster.
  if (heroVideo) {
    if (reducedMotion.matches || navigator.connection?.saveData) {
      heroVideo.pause();
      heroVideo.removeAttribute('autoplay');
      heroVideo.removeAttribute('src');
      heroVideo.querySelector('source')?.remove();
      heroVideo.load();
    } else if ('IntersectionObserver' in window) {
      const videoObserver = new IntersectionObserver(entries => {
        const inView = entries[0]?.isIntersecting;
        if (!inView) { heroVideo.pause(); return; }
        const playback = heroVideo.play();
        playback?.catch(() => {});
      }, { threshold: .15 });
      videoObserver.observe(heroVideo);
    }
  }

  // A published project never depends on the static fallback markup.
  // Checked-in cards ensure meaningful content if the CMS is offline.
  async function hydrateProjects() {
    if (!grid) return;
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 7000);
      let response;
      try { response = await fetch(CMS + '/api/baev/projects', { signal: controller.signal, cache: 'no-store' }); }
      finally { clearTimeout(timeout); }
      if (!response.ok) return;
      const payload = await response.json();
      if (!Array.isArray(payload.docs) || !payload.docs.length) return;
      const projects = payload.docs.filter(item => item && typeof item.slug === 'string' && typeof item.title === 'string');
      if (!projects.length) return;
      const visible = document.body.classList.contains('page-work') ? projects : projects.slice(0, 6);
      const existing = new Map(cards().map(card => [card.dataset.slug, card]));
      const template = cards()[0]?.cloneNode(true);
      if (!template) return;
      const fragment = document.createDocumentFragment();
      visible.forEach((project, index) => {
        const card = existing.get(project.slug) || template.cloneNode(true);
        card.dataset.slug = project.slug;
        card.href = '/work/' + encodeURIComponent(project.slug);
        card.setAttribute('aria-label', 'Смотреть проект ' + project.title);
        card.querySelector('.project-card__number').textContent = twoDigits(index + 1);
        card.querySelector('.project-card__overlay-index').textContent = 'BAEV / WORK ' + twoDigits(index + 1);
        card.querySelector('.project-card__title').textContent = project.title;
        card.dataset.categories = Array.isArray(project.categories) ? project.categories.join('|') : '';
        const category = Array.isArray(project.categories) ? project.categories.join(', ') : '';
        card.querySelector('[data-meta]').textContent = [project.client, category].filter(Boolean).join(' / ');
        card.querySelector('[data-year]').textContent = project.year || '';
        const img = card.querySelector('img');
        img.alt = project.alt || project.title;
        img.loading = index === 0 ? 'eager' : 'lazy';
        const remoteCover = typeof project.cover === 'string' && project.cover.startsWith('https://') ? project.cover : '';
        if (remoteCover && img.dataset.cover !== remoteCover) {
          img.dataset.cover = remoteCover;
          img.src = remoteCover;
        } else if (!existing.has(project.slug)) {
          // The cloned template belongs to a different case; never show another client's artwork.
          img.removeAttribute('src');
          img.alt = project.alt || project.title;
          if (remoteCover) img.src = remoteCover;
        }
        if (!existing.has(project.slug)) revealObserver?.observe(card);
        fragment.appendChild(card);
      });
      grid.replaceChildren(fragment);
      const counter = document.querySelector('.project-total');
      if (counter) counter.textContent = projects.length + (projects.length === 1 ? ' работа' : ' работ');
      const allCount = document.getElementById('all-works-count');
      if (allCount) allCount.textContent = '(' + twoDigits(projects.length) + ')';
      applyWorkFilter();
    } catch {
      // Network failure should not blank the index or crash scrolling.
    }
  }
  const filterButtons = Array.from(document.querySelectorAll('.work-filters button[data-filter]'));
  let currentFilter = 'all';
  function applyWorkFilter() {
    if (!filterButtons.length) return;
    let shown = 0;
    for (const card of cards()) {
      const categories = (card.dataset.categories || '').split('|');
      const visible = currentFilter === 'all' || categories.includes(currentFilter);
      card.hidden = !visible;
      if (visible) shown++;
    }
    const summary = document.getElementById('filtered-count');
    if (summary) summary.textContent = 'Показано: ' + shown + ' из ' + cards().length;
  }
  for (const button of filterButtons) {
    button.addEventListener('click', () => {
      currentFilter = button.dataset.filter || 'all';
      for (const item of filterButtons) item.setAttribute('aria-pressed', String(item === button));
      applyWorkFilter();
    });
  }
  applyWorkFilter();
  hydrateProjects();

  // Subtle cursor-reactive lighting on original work, never on touch or reduced motion.
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  if (canAnimate && finePointer.matches && !navigator.connection?.saveData) {
    const hero = document.querySelector('.hero');
    let frame = 0;
    hero?.addEventListener('pointermove', event => {
      if (frame) return;
      const x = event.clientX, y = event.clientY;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const b = hero.getBoundingClientRect();
        hero.style.setProperty('--pointer-x', ((x-b.left)/b.width*100).toFixed(1)+'%');
        hero.style.setProperty('--pointer-y', ((y-b.top)/b.height*100).toFixed(1)+'%');
      });
    }, { passive: true });
    let active = null, cardFrame = 0;
    grid?.addEventListener('pointermove', event => {
      const visual = event.target.closest('.project-card')?.querySelector('.project-card__visual');
      if (!visual) return;
      if (active !== visual) {
        active?.style.removeProperty('--card-x');
        active?.style.removeProperty('--card-y');
        active = visual;
      }
      if (cardFrame) return;
      const x = event.clientX, y = event.clientY;
      cardFrame = requestAnimationFrame(() => {
        cardFrame = 0;
        const b = visual.getBoundingClientRect();
        visual.style.setProperty('--card-x', ((x-b.left)/b.width*100).toFixed(1)+'%');
        visual.style.setProperty('--card-y', ((y-b.top)/b.height*100).toFixed(1)+'%');
      });
    }, { passive: true });
    grid?.addEventListener('pointerleave', () => {
      active?.style.removeProperty('--card-x');
      active?.style.removeProperty('--card-y');
      active = null;
    });
  }

  const copyright = document.getElementById('copyright-year');
  if (copyright) copyright.textContent = new Date().getFullYear();

  // External URLs remain untouched; native anchor navigation is preferable to
  // hijacking clicks and preserves Back, Open in new tab, accessibility, and CMS rewrites.
})();
