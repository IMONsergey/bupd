/* Independent BAEV interactions. The generated HTML and compiled layout CSS stay authoritative. */
(() => {
  'use strict';
  const doc = document;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const activeAnimations = new Set();
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  const number = (value, fallback) => value !== undefined && value !== '' && Number.isFinite(Number(value)) ? Number(value) : fallback;

  function onMediaChange(query, callback) {
    if (typeof query.addEventListener === 'function') query.addEventListener('change', callback);
    else query.addListener?.(callback);
  }

  function animate(element, frames, options) {
    if (reduce.matches || typeof element.animate !== 'function') return null;
    let animation;
    try {
      animation = element.animate(frames, options);
    } catch {
      try {
        animation = element.animate(frames, { ...options, easing: 'cubic-bezier(.22,1,.36,1)' });
      } catch {
        // The underlying generated markup is already in its visible final state.
        return null;
      }
    }
    activeAnimations.add(animation);
    const finish = () => {
      activeAnimations.delete(animation);
      animation.cancel();
    };
    if (typeof animation.finished?.then === 'function') {
      animation.finished.then(finish).catch(() => activeAnimations.delete(animation));
    } else {
      animation.addEventListener?.('finish', finish, { once: true });
      animation.addEventListener?.('cancel', () => activeAnimations.delete(animation), { once: true });
    }
    return animation;
  }

  function viewport() {
    doc.documentElement.style.setProperty('--framer-viewport-height', innerHeight + 'px');
  }

  function initMenus() {
    const definitions = [
      ['framer-ycabev', 'главная', '/#hero'],
      ['framer-1byjhqs', '   проекты', '/work'],
      ['framer-fbdux6', '      о нас', '/about'],
      ['framer-m8ux20', '         журнал', '/blog'],
      ['framer-1syigrx', '            связь', '/contact']
    ];
    doc.querySelectorAll('nav.framer-Agr03.framer-v-vkgjur, [data-baev-menu]').forEach((nav, index) => {
      const toggle = nav.querySelector('[data-framer-name="Menu Toggle"], .framer-5ags4i');
      if (!toggle) return;
      const label = toggle.querySelector('.framer-5h7v8f p') || toggle.querySelector('p');
      const bar = nav.querySelector('.framer-11e9bp3');
      const background = nav.style.background;
      let open = false;
      let previousFocus = null;
      let inertSiblings = [];
      let openingAnimation = null;
      const linkAnimations = [];
      const menu = doc.createElement('div');
      menu.className = 'framer-1ablnu6 baev-menu-links';
      menu.id = 'baev-menu-' + index;
      menu.hidden = true;
      menu.setAttribute('data-framer-name', 'Menu');
      definitions.forEach(([className, text, href]) => {
        const wrapper = doc.createElement('div');
        wrapper.className = className;
        wrapper.setAttribute('data-framer-component-type', 'RichTextContainer');
        const paragraph = doc.createElement('p');
        paragraph.className = 'framer-text';
        paragraph.dir = 'auto';
        paragraph.style.cssText = '--font-selector:RlI7SW50ZXJEaXNwbGF5;--framer-font-family:"Inter Display", "Inter Display Placeholder", sans-serif;--framer-font-open-type-features:"blwf" on, "cv09" on, "cv03" on, "cv04" on, "cv11" on;--framer-font-size:50px;--framer-letter-spacing:-0.04em;--framer-line-height:1em;--framer-text-color:var(--token-8ae6d15e-f7db-4ef3-9a95-70aca123e10c,rgba(255,255,255,.5));';
        const anchor = doc.createElement('a');
        anchor.className = 'framer-text framer-styles-preset-1g3rdiw';
        anchor.href = href;
        anchor.textContent = text;
        paragraph.append(anchor);
        wrapper.append(paragraph);
        menu.append(wrapper);
      });
      nav.append(menu);
      nav.setAttribute('aria-label', 'Основная навигация');
      toggle.setAttribute('role', 'button');
      toggle.tabIndex = 0;
      toggle.setAttribute('aria-controls', menu.id);
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Открыть меню');

      function isolate() {
        for (let branch = nav; branch && branch.parentElement; branch = branch.parentElement) {
          for (const sibling of branch.parentElement.children) {
            if (sibling === branch || /^(SCRIPT|STYLE|LINK)$/.test(sibling.tagName)) continue;
            inertSiblings.push([sibling, sibling.hasAttribute('inert')]);
            sibling.setAttribute('inert', '');
          }
          if (branch.parentElement === doc.body) break;
        }
      }

      function close(restoreFocus = true) {
        if (!open) return;
        open = false;
        openingAnimation?.cancel();
        linkAnimations.splice(0).forEach(animation => animation.cancel());
        menu.hidden = true;
        nav.classList.replace('framer-v-15h9m50', 'framer-v-vkgjur');
        nav.classList.remove('baev-menu-open');
        nav.setAttribute('data-framer-name', 'Tablet');
        nav.style.background = background;
        if (label) label.textContent = 'Меню';
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Открыть меню');
        inertSiblings.forEach(([element, wasInert]) => { if (!wasInert) element.removeAttribute('inert'); });
        inertSiblings = [];
        doc.documentElement.classList.remove('baev-menu-locked');
        doc.body.classList.remove('baev-menu-locked');
        if (restoreFocus && toggle.getClientRects().length) {
          (previousFocus && nav.contains(previousFocus) ? previousFocus : toggle).focus({ preventScroll: true });
        }
      }

      function show() {
        if (open || !nav.getClientRects().length) return;
        previousFocus = doc.activeElement;
        const barHeight = bar?.getBoundingClientRect().height || 63;
        open = true;
        menu.hidden = false;
        nav.classList.replace('framer-v-vkgjur', 'framer-v-15h9m50');
        nav.classList.add('baev-menu-open');
        nav.setAttribute('data-framer-name', 'Tablet  Open');
        nav.style.background = 'linear-gradient(180deg, rgb(0, 0, 0) 0%, rgb(0, 0, 0) 100%)';
        if (label) label.textContent = 'Закрыть';
        toggle.setAttribute('aria-expanded', 'true');
        toggle.setAttribute('aria-label', 'Закрыть меню');
        isolate();
        doc.documentElement.classList.add('baev-menu-locked');
        doc.body.classList.add('baev-menu-locked');
        openingAnimation = animate(nav, [
          { clipPath: 'inset(0 0 calc(100% - ' + barHeight + 'px) 0)' },
          { clipPath: 'inset(0 0 0 0)' }
        ], { duration: 400, easing: 'cubic-bezier(.25,1,.5,1)' });
        [...menu.children].forEach((item, i) => {
          const animation = animate(item, [
            { opacity: .001, transform: 'translateY(20px)' },
            { opacity: 1, transform: 'translateY(0px)' }
          ], { duration: 1000, delay: [200,230,260,290,290][i], fill: 'both', easing: 'cubic-bezier(.25,1,.5,1)' });
          if (animation) linkAnimations.push(animation);
        });
        menu.querySelector('a').focus({ preventScroll: true });
      }

      toggle.addEventListener('click', event => {
        event.preventDefault();
        event.stopPropagation();
        if (open) close(); else show();
      });
      toggle.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          if (open) close(); else show();
        }
      });
      nav.addEventListener('click', event => {
        if (event.target.closest('a')) close(false);
        else if (open && bar?.contains(event.target)) close();
      });
      doc.addEventListener('keydown', event => {
        if (!open) return;
        if (event.key === 'Escape') {
          event.preventDefault();
          close();
        } else if (event.key === 'Tab') {
          const items = [...nav.querySelectorAll('a[href], [tabindex="0"], button')].filter(element => element.getClientRects().length && !element.disabled);
          const first = items[0];
          const last = items[items.length - 1];
          if (event.shiftKey && (doc.activeElement === first || !nav.contains(doc.activeElement))) {
            event.preventDefault(); last?.focus();
          } else if (!event.shiftKey && (doc.activeElement === last || !nav.contains(doc.activeElement))) {
            event.preventDefault(); first?.focus();
          }
        }
      });
      addEventListener('resize', () => { if (open && !nav.getClientRects().length) close(false); });
      addEventListener('pagehide', () => close(false));
    });
  }

  function neutralTransform(value) {
    if (!value || value === 'none') return 'none';
    return value
      .replace(/translate([XY])?\(\s*(-?[\d.]+)(px)?\s*\)/g, 'translate$1(0px)')
      .replace(/scale([XY])?\([^)]*\)/g, 'scale$1(1)')
      .replace(/(?:rotate|skewX|skewY)\([^)]*\)/g, match => match.replace(/\([^)]*\)/, '(0deg)'));
  }

  const springEasings = new Map();
  function springEasing(duration, bounce = 0) {
    const key = duration + ':' + bounce;
    if (springEasings.has(key)) return springEasings.get(key);
    const damping = clamp(1 - bounce, .05, 1);
    let frequency;
    if (damping === 1) {
      let low = 0, high = 32;
      for (let i = 0; i < 40; i++) {
        const middle = (low + high) / 2;
        if ((1 + middle) * Math.exp(-middle) > .001) low = middle;
        else high = middle;
      }
      frequency = (low + high) / 2;
    } else {
      frequency = Math.log(damping / (.001 * Math.sqrt(1 - damping * damping))) / damping;
    }
    const count = clamp(Math.round(duration / 10), 2, 1000);
    const samples = [];
    for (let i = 0; i < count; i++) {
      const progress = i / (count - 1);
      const time = frequency * progress;
      let value;
      if (damping === 1) value = 1 - Math.exp(-time) * (1 + time);
      else {
        const angular = Math.sqrt(1 - damping * damping);
        value = 1 - Math.exp(-damping * time) *
          (Math.cos(angular * time) + damping / angular * Math.sin(angular * time));
      }
      samples.push(i === count - 1 ? '1' : value.toFixed(4));
    }
    const easing = 'linear(' + samples.join(',') + ')';
    const result = typeof window.CSS?.supports === 'function' && window.CSS.supports('animation-timing-function', easing) ? easing : 'cubic-bezier(.22,1,.36,1)';
    springEasings.set(key, result);
    return result;
  }

  function initDesktopNavigation() {
    const target = doc.querySelector('[data-baev-header-scroll-target], #services.framer-roa8d7, #trigger');
    if (!target) return;
    doc.querySelectorAll('nav.framer-Agr03.framer-v-1lgq14b').forEach(nav => {
      const logo = nav.querySelector('.framer-1o47ks3');
      const paragraph = logo?.querySelector('p');
      if (!logo || !paragraph) return;
      const originalClass = logo.className;
      const properties = ['--framer-font-size', '--framer-letter-spacing', '--framer-line-height'];
      const originals = properties.map(property => paragraph.style.getPropertyValue(property));
      let compact = false, threshold = 0, frame = 0;
      function update() {
        frame = 0;
        const next = scrollY >= threshold;
        if (next === compact) return;
        compact = next;
        nav.classList.toggle('framer-v-r81xlh', compact);
        nav.classList.toggle('framer-v-1lgq14b', !compact);
        nav.setAttribute('data-framer-name', compact ? 'Desktop small' : 'Desktop');
        logo.className = compact ? originalClass.replace('framer-1o47ks3', 'framer-1di1krb') : originalClass;
        const values = compact ? ['43px', '-0.04em', '1em'] : originals;
        properties.forEach((property, i) => {
          if (values[i]) paragraph.style.setProperty(property, values[i]);
          else paragraph.style.removeProperty(property);
        });
        animate(logo, [
          { opacity: .001, filter: 'blur(10px)', transform: 'translateY(10px)' },
          { opacity: 1, filter: 'blur(0px)', transform: 'translateY(0px)' }
        ], { duration: 1000, easing: springEasing(1000, 0) });
      }
      function measure() {
        threshold = Math.max(target.getBoundingClientRect().top + scrollY - 1 - innerHeight * .5, 0);
        update();
      }
      addEventListener('scroll', () => { if (!frame) frame = requestAnimationFrame(update); }, { passive: true });
      addEventListener('resize', measure, { passive: true });
      addEventListener('load', measure, { once: true });
      doc.fonts?.ready.then(measure);
      if (typeof window.ResizeObserver === 'function') new ResizeObserver(measure).observe(target);
      measure();
    });
  }

  function initAboutTextReveal() {
    const containers = [...doc.querySelectorAll('.framer-PP9RZ .framer-18zrs4q')];
    if (!containers.length) return;
    const states = containers.map(container => {
      const chars = [];
      container.querySelectorAll('h1,h2,h3,h4,h5,h6,p').forEach(paragraph => {
        if (!paragraph.hasAttribute('aria-label')) paragraph.setAttribute('aria-label', paragraph.textContent);
        const walker = doc.createTreeWalker(paragraph, NodeFilter.SHOW_TEXT);
        const textNodes = [];
        while (walker.nextNode()) textNodes.push(walker.currentNode);
        textNodes.forEach(node => {
          const fragment = doc.createDocumentFragment();
          node.nodeValue.split(/(\s+)/).forEach(part => {
            if (!part || /^\s+$/.test(part)) { fragment.append(doc.createTextNode(part)); return; }
            const word = doc.createElement('span');
            word.className = 'baev-scrub-word';
            word.setAttribute('aria-hidden', 'true');
            for (const character of Array.from(part)) {
              const span = doc.createElement('span');
              span.className = 'baev-scrub-char';
              span.textContent = character;
              word.append(span);
              chars.push(span);
            }
            fragment.append(word);
          });
          node.replaceWith(fragment);
        });
      });
      return { container, chars, values: [], start: 0, length: 1, visible: false };
    });
    let frame = 0;
    function render() {
      frame = 0;
      for (const state of states) {
        if (!state.visible) continue;
        const progress = reduce.matches ? 1 : clamp((scrollY - state.start) / state.length, 0, 1);
        state.chars.forEach((character, i) => {
          const local = clamp(progress * state.chars.length - i, 0, 1);
          // The source's unregistered "ease-in-out" falls back to GSAP's quad.out.
          const opacity = Number((.1 + .9 * (1 - (1 - local) ** 2)).toFixed(5));
          if (state.values[i] !== opacity) {
            character.style.opacity = String(opacity);
            state.values[i] = opacity;
          }
        });
      }
    }
    function measure() {
      for (const state of states) {
        state.visible = state.container.getClientRects().length > 0;
        if (!state.visible) continue;
        const rect = state.container.getBoundingClientRect();
        state.start = rect.top + scrollY - innerHeight * .9;
        state.length = Math.max(rect.height + innerHeight * .4, 1);
      }
      render();
    }
    addEventListener('scroll', () => { if (!frame) frame = requestAnimationFrame(render); }, { passive: true });
    addEventListener('resize', measure, { passive: true });
    addEventListener('load', measure, { once: true });
    doc.fonts?.ready.then(measure);
    if (typeof window.ResizeObserver === 'function') {
      const observer = new ResizeObserver(measure);
      states.forEach(state => observer.observe(state.container));
    }
    onMediaChange(reduce, render);
    measure();
  }

  function initReveals() {
    const explicit = [...doc.querySelectorAll('[data-baev-reveal]')];
    const candidates = new Set(explicit);
    doc.querySelectorAll('span[style], [data-framer-appear-id], .framer-Ng5E0, .framer-pquBv, [data-framer-component-type="RichTextContainer"][style]').forEach(element => {
      const opacity = element.style.opacity;
      if (opacity !== '' && Number(opacity) <= .01 && (element.textContent.trim() || element.querySelector('img, video'))) candidates.add(element);
    });
    const records = new Map();
    const groups = new Map();
    const groupIndexes = new Map();
    for (const element of candidates) {
      if (!element.textContent.trim() && !element.querySelector('img,video')) continue;
      const data = element.dataset;
      const fromOpacity = number(data.baevFromOpacity, number(element.style.opacity, .001));
      const fromTransform = data.baevFromTransform || element.style.transform || 'none';
      const fromFilter = data.baevFromFilter || element.style.filter || 'none';
      // Older captures may still contain their initial state. Only reset identified reveal nodes.
      if (element.style.opacity !== '' && Number(element.style.opacity) <= .01) element.style.removeProperty('opacity');
      if (element.style.filter === fromFilter && /blur\(/.test(fromFilter)) element.style.removeProperty('filter');
      if (element.style.transform === fromTransform) {
        const neutral = neutralTransform(fromTransform);
        if (neutral === 'none') element.style.removeProperty('transform');
        else element.style.transform = neutral;
      }
      if (reduce.matches || !element.animate) {
        element.setAttribute('data-baev-revealed', '');
        continue;
      }
      const computed = getComputedStyle(element);
      const isSpan = element.tagName === 'SPAN';
      const group = isSpan ? element.closest('[data-framer-component-type="RichTextContainer"]') || element.parentElement : element;
      const index = groupIndexes.get(group) || 0;
      if (isSpan) groupIndexes.set(group, index + 1);
      const hero = element.closest('.framer-1iekwd5, .framer-fgsgtp');
      const service = element.closest('.framer-6PoLP');
      const mobile = matchMedia('(max-width: 809.98px)').matches;
      const stagger = number(data.baevStagger, hero || service ? 100 : 50);
      const delay = number(mobile ? data.baevDelayMobile : undefined,
        number(data.baevDelay, isSpan ? 100 + index * stagger : 100));
      const duration = number(mobile ? data.baevDurationMobile : undefined,
        number(data.baevDuration, hero && isSpan ? 1200 : 1000));
      const transitionType = data.baevTransitionType || data.baevSourceTransitionType || 'spring';
      const bounce = number(data.baevBounce || data.baevSourceBounce,
        !isSpan && element.hasAttribute('data-framer-appear-id') ? .2 : 0);
      const easing = data.baevEasing || (transitionType === 'spring' ? springEasing(duration, bounce) : 'cubic-bezier(.25,1,.5,1)');
      const finalTransform = data.baevToTransform || computed.transform || 'none';
      const frames = [
        { opacity: fromOpacity, transform: fromTransform, filter: fromFilter },
        { opacity: number(data.baevToOpacity, number(computed.opacity, 1)), transform: finalTransform, filter: computed.filter || 'none' }
      ];
      const animation = animate(element, frames, {
        duration, delay, fill: 'both', easing
      });
      if (!animation) {
        element.setAttribute('data-baev-revealed', '');
        continue;
      }
      animation.pause();
      animation.currentTime = 0;
      records.set(element, animation);
      if (!groups.has(group)) groups.set(group, []);
      groups.get(group).push(element);
      const markRevealed = () => element.setAttribute('data-baev-revealed', '');
      if (typeof animation.finished?.then === 'function') animation.finished.then(markRevealed).catch(() => {});
      else animation.addEventListener?.('finish', markRevealed, { once: true });
    }
    function reveal(group) {
      for (const element of groups.get(group) || []) records.get(element)?.play();
      groups.delete(group);
    }
    if (typeof window.IntersectionObserver !== 'function') {
      for (const group of [...groups.keys()]) reveal(group);
      return;
    }
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) {
        reveal(entry.target);
        observer.unobserve(entry.target);
      }
    }, { threshold: 0 });
    for (const group of groups.keys()) observer.observe(group);
    onMediaChange(reduce, () => {
      if (!reduce.matches) return;
      observer.disconnect();
      for (const [element, animation] of records) {
        animation.cancel();
        element.setAttribute('data-baev-revealed', '');
      }
      groups.clear();
    });
  }

  function initServiceStack() {
    const section = doc.querySelector('#services.framer-roa8d7');
    if (!section) return;
    const selectors = ['.framer-1s9no9h', '.framer-1jt7p9k', '.framer-1ae6zn1', '.framer-t9omzn'];
    const cards = selectors.map(selector => section.querySelector(selector));
    if (cards.some(card => !card)) return;
    let start = 0, length = 1, target = 0, progress = 0, velocity = 0, frame = 0, lastTime = 0;
    const mobile = matchMedia('(max-width: 809.98px)');
    // Analytic overdamped spring: mass 1, stiffness 400, damping 80.
    const r1 = (-80 + Math.sqrt(4800)) / 2;
    const r2 = (-80 - Math.sqrt(4800)) / 2;
    function render() {
      const scales = mobile.matches ? [.5,.6,.7,.8] : [.4,.5,.6,.7];
      const offsets = mobile.matches ? [-170,-150,-130,-100] : [-100,-100,-100,-100];
      cards.forEach((card, i) => {
        card.style.transform = reduce.matches ? 'none' :
          'translateY(' + (offsets[i] * progress).toFixed(4) + 'px) scale(' + (1 + (scales[i] - 1) * progress).toFixed(6) + ')';
      });
      const first = cards[0].querySelector('.framer-6PoLP');
      if (first) first.classList.toggle('baev-service-visible', scrollY >= start);
    }
    function tick(time) {
      frame = 0;
      const dt = lastTime ? Math.min((time - lastTime) / 1000, .064) : 1 / 60;
      lastTime = time;
      const delta = progress - target;
      const c1 = (velocity - r2 * delta) / (r1 - r2);
      const c2 = delta - c1;
      const e1 = Math.exp(r1 * dt), e2 = Math.exp(r2 * dt);
      progress = target + c1 * e1 + c2 * e2;
      velocity = c1 * r1 * e1 + c2 * r2 * e2;
      if (Math.abs(progress - target) < .00001 && Math.abs(velocity) < .0001) {
        progress = target; velocity = 0; lastTime = 0;
      } else frame = requestAnimationFrame(tick);
      render();
    }
    function update() {
      target = clamp((scrollY - start) / length, 0, 1);
      if (reduce.matches) {
        cancelAnimationFrame(frame); frame = 0; progress = target; velocity = 0; render();
      } else if (!frame) frame = requestAnimationFrame(tick);
    }
    function measure() {
      start = Math.max(section.getBoundingClientRect().top + scrollY - 1, 0);
      length = Math.max(section.clientHeight, 1);
      update();
    }
    measure();
    progress = target;
    render();
    addEventListener('scroll', update, { passive: true });
    addEventListener('resize', measure, { passive: true });
    addEventListener('load', measure, { once: true });
    doc.fonts?.ready.then(measure);
    if (typeof window.ResizeObserver === 'function') new ResizeObserver(measure).observe(section);
    onMediaChange(reduce, update);
    if (typeof window.IntersectionObserver === 'function') {
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => entry.target.classList.toggle('baev-service-visible', entry.intersectionRatio >= .5));
      }, { threshold: [0,.5,1] });
      cards.slice(1).forEach(card => {
        const inner = card.querySelector('.framer-6PoLP');
        if (inner) observer.observe(inner);
      });
    }
  }

  function initVideos() {
    const videos = [...doc.querySelectorAll('video')].filter(video => {
      const sources = [video.getAttribute('src'), ...[...video.querySelectorAll('source[src]')].map(source => source.getAttribute('src'))];
      return sources.some(source => {
        if (!source || /^(null|undefined)$/i.test(source.trim())) return false;
        try { return !/\/(null|undefined)\/?$/i.test(new URL(source, location.href).pathname); }
        catch { return false; }
      });
    });
    const nearby = new Set();
    function play(video) {
      if (doc.hidden || reduce.matches || !nearby.has(video)) return;
      const result = video.play();
      if (result?.catch) result.catch(() => video.setAttribute('data-baev-play-blocked', ''));
    }
    for (const video of videos) {
      video.muted = true;
      video.defaultMuted = true;
      video.playsInline = true;
      video.preload = 'none';
      video.addEventListener('playing', () => video.removeAttribute('data-baev-play-blocked'));
      video.addEventListener('loadeddata', () => play(video));
    }
    if (typeof window.IntersectionObserver === 'function') {
      const observer = new IntersectionObserver(entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) { entry.target.preload = 'metadata'; nearby.add(entry.target); play(entry.target); }
          else { nearby.delete(entry.target); entry.target.pause(); }
        }
      }, { rootMargin: '300px 0px', threshold: 0 });
      videos.forEach(video => observer.observe(video));
    } else videos.forEach(video => { nearby.add(video); play(video); });
    doc.addEventListener('visibilitychange', () => videos.forEach(video => doc.hidden ? video.pause() : play(video)));
    doc.addEventListener('pointerdown', () => nearby.forEach(play), { passive: true });
    onMediaChange(reduce, () => videos.forEach(video => reduce.matches ? video.pause() : play(video)));
  }

  function initHovers() {
    doc.querySelectorAll('.framer-Ng5E0, .framer-pquBv, .framer-RYIBq, .framer-pE5Vm').forEach(card => {
      const owner = card.closest('a') || card;
      const heading = card.querySelector('.framer-1u1idt7');
      const originalOpacity = heading?.style.opacity;
      let copy = null;
      if (card.matches('.framer-RYIBq') && !card.querySelector('.framer-kpp89f')) {
        copy = doc.createElement('div');
        copy.className = 'framer-kpp89f baev-hover-copy';
        copy.hidden = true;
        copy.setAttribute('data-framer-component-type', 'RichTextContainer');
        const paragraph = doc.createElement('p');
        paragraph.className = 'framer-text framer-styles-preset-97yi4';
        paragraph.style.cssText = '--framer-text-alignment:center;--framer-text-color:var(--token-54aa1e40-ee72-4fcd-a172-fd98298abc37,#fff)';
        paragraph.textContent = 'Расскажите о задаче. Мы предложим следующий шаг.';
        copy.append(paragraph);
        card.append(copy);
      }
      function apply(on) {
        const enabled = on && fine.matches && !card.matches('.framer-v-fpvale, .framer-v-1665c75, .framer-v-nm9yj7');
        card.classList.toggle('baev-hover', enabled);
        if (heading) heading.style.opacity = enabled ? '1' : originalOpacity || '.7';
        if (copy) copy.hidden = !enabled;
      }
      owner.addEventListener('mouseenter', () => apply(true));
      owner.addEventListener('mouseleave', () => apply(false));
      owner.addEventListener('focusin', () => apply(true));
      owner.addEventListener('focusout', event => { if (!owner.contains(event.relatedTarget)) apply(false); });
      onMediaChange(fine, () => apply(false));
    });
  }

  function initCursors() {
    const cursor = doc.createElement('div');
    cursor.className = 'baev-cursor';
    cursor.hidden = true;
    cursor.setAttribute('aria-hidden', 'true');
    doc.body.append(cursor);
    let current = null, mode = '', x = 0, y = 0, frame = 0;
    const sourceSelector = '[data-framer-cursor], .framer-Ng5E0, .framer-pquBv, .framer-RYIBq, .framer-pE5Vm';
    function hide() { current = null; mode = ''; cursor.hidden = true; }
    function previewFor(element) {
      if (element.dataset.baevCursorImage) return { src: element.dataset.baevCursorImage, srcset: element.dataset.baevCursorSrcset || '' };
      const link = element.closest('a');
      if (!link) return null;
      const match = [...doc.querySelectorAll('a[href]')].find(anchor => anchor.href === link.href && anchor.querySelector('img'));
      const img = match?.querySelector('img');
      return img ? { src: img.currentSrc || img.src, srcset: img.srcset || '' } : null;
    }
    function updateTarget(element) {
      const target = element?.closest?.(sourceSelector);
      if (!target || !fine.matches || doc.documentElement.classList.contains('baev-menu-locked')) { hide(); return; }
      const nextMode = target.matches('.framer-RYIBq') ? 'contact' : target.matches('.framer-pquBv') ? 'read' : target.matches('.framer-pE5Vm') ? 'image' : 'explore';
      if (target === current && nextMode === mode) return;
      current = target; mode = nextMode;
      cursor.replaceChildren();
      cursor.className = 'baev-cursor baev-cursor--' + mode;
      if (mode === 'image') {
        const preview = previewFor(target);
        if (!preview) { hide(); return; }
        const img = doc.createElement('img');
        img.src = preview.src;
        if (preview.srcset) { img.srcset = preview.srcset; img.sizes = '381px'; }
        img.alt = '';
        cursor.append(img);
      } else if (mode === 'contact') {
        const arrow = doc.createElementNS('http://www.w3.org/2000/svg', 'svg');
        arrow.setAttribute('class', 'baev-cursor-arrow');
        arrow.setAttribute('viewBox', '0 0 24 24');
        const path = doc.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', 'M 1 0 L 1 2 L 9.59 2 L 0 11.59 L 1.41 13 L 11 3.41 L 11 12 L 13 12 L 13 0 Z');
        path.setAttribute('transform', 'translate(5.5 5.5)');
        path.setAttribute('fill', '#000');
        arrow.append(path);
        cursor.append(arrow);
      } else cursor.textContent = mode === 'read' ? 'Читать' : 'Cмотреть';
      cursor.hidden = false;
    }
    function place() {
      frame = 0;
      if (!current || cursor.hidden) return;
      const width = cursor.offsetWidth, height = cursor.offsetHeight;
      const desiredY = mode === 'image' ? y + 20 - height / 2 : y + 60 - height;
      cursor.style.left = clamp(x + 20, 8, Math.max(8, innerWidth - width - 8)) + 'px';
      cursor.style.top = clamp(desiredY, 8, Math.max(8, innerHeight - height - 8)) + 'px';
    }
    doc.addEventListener('pointermove', event => {
      if (event.pointerType === 'touch') return;
      x = event.clientX; y = event.clientY;
      updateTarget(event.target);
      if (!frame) frame = requestAnimationFrame(place);
    }, { passive: true });
    doc.addEventListener('pointerout', event => { if (!event.relatedTarget) hide(); }, { passive: true });
    addEventListener('scroll', () => {
      if (!current) return;
      updateTarget(doc.elementFromPoint(x, y));
      if (!frame) frame = requestAnimationFrame(place);
    }, { passive: true });
    addEventListener('blur', hide);
    onMediaChange(fine, hide);
  }

  function initAnchors() {
    doc.addEventListener('click', event => {
      const link = event.target.closest?.('a[href]');
      if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target === '_blank') return;
      const url = new URL(link.href, location.href);
      if (url.origin !== location.origin || url.pathname.replace(/\/+$/, '') !== location.pathname.replace(/\/+$/, '') || url.search !== location.search || !url.hash) return;
      let id;
      try { id = decodeURIComponent(url.hash.slice(1)); } catch { return; }
      const target = doc.getElementById(id);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: reduce.matches ? 'auto' : 'smooth', block: 'start' });
      history.pushState(null, '', url.hash);
    });
  }

  function initContact() {
    doc.querySelectorAll('[data-baev-contact-form], form.framer-hqhav0').forEach(form => {
      form.querySelectorAll('button.framer-2LXrH').forEach(button => {
        button.type = 'button'; button.tabIndex = -1; button.setAttribute('aria-hidden', 'true');
      });
      const name = form.querySelector('[name="Name"]');
      const email = form.querySelector('[name="Email"]');
      const message = form.querySelector('[name="MessageEmail"]');
      if (!name || !email || !message) return;
      name.required = true; email.required = true;
      name.autocomplete = 'name'; email.autocomplete = 'email';
      name.addEventListener('input', () => name.setCustomValidity(''));
      for (const field of [name,email,message]) {
        const update = () => field.classList.toggle('framer-form-input-empty', !field.value);
        field.addEventListener('input', update); update();
      }
      let status = form.querySelector('[data-baev-form-status]');
      if (!status) {
        status = doc.createElement('p');
        status.className = 'baev-form-status';
        status.setAttribute('data-baev-form-status', '');
        status.setAttribute('role', 'status');
        status.setAttribute('aria-live', 'polite');
        status.hidden = true;
        form.append(status);
      }
      const submit = form.querySelector('[type="submit"]');
      if (submit) submit.title = 'Открыть черновик письма в почтовой программе';
      form.addEventListener('submit', event => {
        event.preventDefault();
        name.setCustomValidity(name.value.trim() ? '' : 'Укажите ваше имя');
        if (!form.reportValidity()) return;
        const configured = form.dataset.baevEmail || 'hello@baev.agency';
        const recipient = /^[^\s@?<>]+@[^\s@?<>]+\.[^\s@?<>]+$/.test(configured) ? configured : 'hello@baev.agency';
        const subject = 'Запрос BAEV: ' + name.value.trim();
        const body = 'Имя: ' + name.value.trim() + '\nE-mail: ' + email.value.trim() + '\n\n' + message.value.trim();
        const href = 'mailto:' + recipient + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
        status.hidden = false;
        status.replaceChildren(doc.createTextNode('Подготовлен черновик письма. Проверьте его и отправьте в почтовой программе. Если окно не открылось, '));
        const retry = doc.createElement('a');
        retry.href = href; retry.textContent = 'откройте черновик еще раз';
        status.append(retry, doc.createTextNode(' или напишите на ' + recipient + '.'));
        const launcher = doc.createElement('a');
        launcher.href = href;
        launcher.hidden = true;
        doc.body.append(launcher);
        launcher.click();
        launcher.remove();
      });
    });
  }

  function init() {
    viewport();
    initMenus();
    initReveals();
    initDesktopNavigation();
    initAboutTextReveal();
    initServiceStack();
    initVideos();
    initHovers();
    initCursors();
    initAnchors();
    initContact();
    doc.documentElement.setAttribute('data-baev-ready', '');
  }
  onMediaChange(reduce, () => {
    if (reduce.matches) [...activeAnimations].forEach(animation => animation.cancel());
  });
  addEventListener('resize', viewport, { passive: true });
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
