#!/usr/bin/env node
'use strict';
/* Run once through imon-job with an existing loopback preview. One browser/page at a time. */
const fs = require('node:fs/promises');
const path = require('node:path');
const { chromium, firefox, webkit } = require('/home/sergey/.local/share/imon-toolkit/node/node_modules/playwright');
const arg = (name, fallback) => { const i = process.argv.indexOf(name); return i < 0 ? fallback : process.argv[i + 1]; };
const TARGET = new URL(arg('--url', 'http://127.0.0.1:4187')).origin;
const OUT = path.resolve(arg('--out', './case-browser-report'));
const REPO = path.resolve(arg('--repo', path.dirname(__filename)));
const START = Date.now();
const BUDGET = Number(arg('--budget-seconds', '1800'));
const MODE = arg('--mode', 'full');
const ENGINES = arg('--engines', MODE === 'smoke' ? 'chromium' : 'chromium,firefox,webkit').split(',');
const CASES = arg('--cases', '').split(',').filter(Boolean);
const VIEWPORTS = arg('--viewports', 'desktop,mobile').split(',');
const VP = { desktop: { width: 1600, height: 1000 }, mobile: { width: 390, height: 844 } };
const report = { startedAt: new Date().toISOString(), target: TARGET, output: OUT, budgetSeconds: BUDGET,
  mode: MODE, requestedEngines: ENGINES, requestedCases: CASES, requestedViewports: VIEWPORTS,
  viewports: VP, tests: [], launches: [], safety: { formSubmissions: 0, mailtoActivations: 0 },
  limits: ['Linux WebKit is a browser engine check, not a real macOS/iOS Safari device.', 'VK embedded playback is not automatically activated by this suite.'] };
let activeBrowser;
const slug = s => s.replace(/[^a-zA-Z0-9_-]/g, '_');
function guard() { if (Date.now() - START > BUDGET * 1000) throw new Error('QA time budget exhausted'); }
function check(test, name, passed, actual) { test.checks.push({ name, passed: Boolean(passed), ...(actual === undefined ? {} : { actual }) }); }
async function checkpoint() { await fs.writeFile(path.join(OUT, 'report.json'), JSON.stringify(report, null, 2) + '\n'); }
async function pause(page, ms) { guard(); await page.waitForTimeout(ms); }
function options(engine, viewport, reducedMotion = 'no-preference') {
  return { viewport: VP[viewport], deviceScaleFactor: 1, reducedMotion, locale: 'ru-RU', hasTouch: viewport === 'mobile',
    ...(engine === 'firefox' ? {} : { isMobile: viewport === 'mobile' }), acceptDownloads: false };
}
async function safetyInit() {
  window.__caseQASafety = { submits: 0, mailto: 0 };
  document.addEventListener('submit', e => { window.__caseQASafety.submits++; e.preventDefault(); e.stopImmediatePropagation(); }, true);
  document.addEventListener('click', e => {
    const a = e.target.closest?.('a[href]');
    if (a && /^mailto:/i.test(a.getAttribute('href'))) { window.__caseQASafety.mailto++; e.preventDefault(); e.stopImmediatePropagation(); }
  }, true);
}
async function setupPage(browser, engine, viewport, test, reducedMotion) {
  const context = await browser.newContext(options(engine, viewport, reducedMotion));
  await context.addInitScript(safetyInit);
  const page = await context.newPage();
  page.setDefaultTimeout(15000); page.setDefaultNavigationTimeout(30000);
  test.console = []; test.pageErrors = []; test.failedLocalRequests = []; test.badLocalResponses = []; test.framerRequests = [];
  page.on('pageerror', error => test.pageErrors.push(error.message));
  page.on('console', entry => { if (entry.type() === 'error') test.console.push(entry.text()); });
  page.on('request', req => {
    const u = new URL(req.url());
    if (/(^|\.)(framer\.com|framer\.app|framerusercontent\.com|framerstatic\.com|framer\.website)$/.test(u.hostname)) test.framerRequests.push(req.url());
  });
  page.on('requestfailed', req => {
    // Browser-cancelled media range requests when a page navigates are normal.
    const reason = req.failure()?.errorText || '';
    if (new URL(req.url()).origin === TARGET && !/ABORT|CANCEL|NS_BINDING_ABORTED/i.test(reason)) test.failedLocalRequests.push({ url: req.url(), reason });
  });
  page.on('response', res => {
    if (new URL(res.url()).origin === TARGET && res.status() >= 400) test.badLocalResponses.push({ url: res.url(), status: res.status() });
  });
  return { context, page };
}
async function navigate(page, route, test) {
  const response = await page.goto(TARGET + route, { waitUntil: 'domcontentloaded' });
  check(test, 'HTTP 200', response?.status() === 200, response?.status());
  await page.evaluate(() => Promise.race([document.fonts.ready, new Promise(resolve => setTimeout(resolve, 6000))]));
  await pause(page, 160);
}
async function picture(page, test, name) {
  const filename = slug(test.id + '-' + name) + '.png';
  (test.captureGeometry ||= []).push({ name, ...await page.evaluate(() => {
    const rect = n => { const r = n.getBoundingClientRect(); return {x:r.x,y:r.y,width:r.width,height:r.height}; };
    const visible = n => { const r=n.getBoundingClientRect();return r.width>1&&r.height>1&&r.bottom>0&&r.top<innerHeight&&r.right>0&&r.left<innerWidth; };
    return {scrollY,scenes:[...document.querySelectorAll('[data-case-scene]')].filter(visible).map(n=>({id:n.dataset.caseScene,rect:rect(n)})),
      images:[...document.images].filter(visible).map(n=>({src:n.currentSrc||n.src,rect:rect(n),complete:n.complete,naturalWidth:n.naturalWidth,opacity:getComputedStyle(n).opacity,visibility:getComputedStyle(n).visibility}))};
  })});
  await page.screenshot({ path: path.join(OUT, filename), animations: 'disabled' });
  (test.screenshots ||= []).push(filename);
}
async function visibleImages(page) {
  return page.evaluate(async () => {
    const visible = [...document.images].filter(img => {
      const r = img.getBoundingClientRect(), s = getComputedStyle(img);
      return r.width > 1 && r.height > 1 && r.right > 0 && r.left < innerWidth && r.bottom > 0 && r.top < innerHeight && s.display !== 'none' && s.visibility !== 'hidden' && s.opacity !== '0';
    });
    await Promise.all(visible.map(img => img.complete ? Promise.resolve() : new Promise(resolve => {
      const end = () => resolve(); img.addEventListener('load', end, { once: true }); img.addEventListener('error', end, { once: true }); setTimeout(end, 5000);
    })));
    // Async decoding may finish after the load event, especially after a deep
    // jump to a lazy scene. Wait for actual pixels, then for the next paint.
    await Promise.all(visible.filter(img => img.complete && img.naturalWidth > 0).map(img =>
      Promise.race([img.decode().catch(() => {}), new Promise(resolve => setTimeout(resolve, 5000))])));
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    return visible.filter(img => !img.complete || img.naturalWidth === 0).map(img => ({ src: img.currentSrc || img.src, complete: img.complete }));
  });
}
async function inspectRoute(page, test, fullScroll) {
  const baseline = await page.evaluate(() => ({
    h1: [...document.querySelectorAll('h1')].map(n => n.textContent.trim()),
    scenes: document.querySelectorAll('main.baev-case [data-case-scene]').length,
    renderedSceneIds: [...document.querySelectorAll('main.baev-case [data-case-scene]')].filter(n => n.getBoundingClientRect().height > 0).map(n => n.getAttribute('data-case-scene')),
    temporary: document.documentElement.outerHTML.includes('figma.com/api/mcp/asset/'),
    fontLoaded: [...document.fonts].some(face => face.family.replace(/["']/g, '') === 'TikTok Sans' && face.status === 'loaded') && document.fonts.check('300 17px "TikTok Sans"'),
    nativeCopy: [...document.querySelectorAll('.baev-case-caption p')].filter(n => n.textContent.trim()).length,
    lazyEmbeds: document.querySelectorAll('[data-case-embed]').length,
    initialIframes: document.querySelectorAll('main.baev-case iframe').length,
  }));
  test.structure = baseline;
  check(test, 'one nonempty H1', baseline.h1.length === 1 && Boolean(baseline.h1[0]), baseline.h1);
  check(test, 'case scenes present', baseline.scenes >= 2, baseline.scenes);
  check(test, 'localized Figma assets', !baseline.temporary);
  check(test, 'TikTok Sans loaded', baseline.fontLoaded);
  check(test, 'external players deferred', baseline.initialIframes === 0, baseline);
  const failures = new Map(), seenScenes = new Set(); let maxOverflow = 0; let scanCount = 0;
  async function scan() {
    guard();
    for (const bad of await visibleImages(page)) failures.set(bad.src, bad);
    const dimensions = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth - innerWidth,
      copy: [...document.querySelectorAll('.baev-case-caption,.baev-case-intro')].filter(n => n.scrollWidth > n.clientWidth + 2).map(n => ({ className: n.className, node: n.dataset.nodeId, excess: n.scrollWidth - n.clientWidth })),
      scenes: [...document.querySelectorAll('main.baev-case [data-case-scene]')].filter(n => { const r = n.getBoundingClientRect(); return r.height > 0 && r.bottom > 0 && r.top < innerHeight; }).map(n => n.getAttribute('data-case-scene')),
    }));
    dimensions.scenes.forEach(id => seenScenes.add(id));
    maxOverflow = Math.max(maxOverflow, dimensions.overflow);
    if (dimensions.copy.length) test.copyOverflow = dimensions.copy;
    scanCount++;
  }
  await page.evaluate(() => scrollTo(0, 0)); await scan(); await picture(page, test, 'hero');
  const sceneCount = await page.locator('[data-case-scene]').count();
  const captures = new Set([Math.floor(sceneCount / 3), Math.floor(sceneCount * 2 / 3)]);
  // Preserve visual evidence for the small source-font outline replacements.
  const outlineScenes = await page.locator('[data-case-scene]').evaluateAll(nodes =>
    nodes.flatMap((node, index) => node.querySelector('[data-case-text-outline]') ? [index] : []));
  outlineScenes.forEach(index => captures.add(index));
  const restoredAnimationScenes = await page.locator('[data-case-scene]').evaluateAll(nodes =>
    nodes.flatMap((node, index) => node.querySelector('[data-case-video-slot="166:1028"]') ? [index] : []));
  restoredAnimationScenes.forEach(index => captures.add(index));
  if (fullScroll) {
    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    const step = Math.floor(VP[test.viewport].height * .78);
    for (let y = 0; y <= height; y += step) {
      await page.evaluate(pos => scrollTo(0, pos), y); await pause(page, 80); await scan();
    }
  }
  for (const index of captures) {
    const scene = page.locator('[data-case-scene]').nth(index);
    await scene.scrollIntoViewIfNeeded(); await pause(page, 100); await scan(); await picture(page, test, 'scene-' + index);
  }
  const next = page.locator('[data-framer-name="Next projects"]');
  await next.scrollIntoViewIfNeeded(); await pause(page, 100); await scan(); await picture(page, test, 'next-projects');
  const related = await next.locator('a[href^="/work/"]').evaluateAll(nodes => nodes.map(n => ({ href: new URL(n.href).pathname, visible: Boolean(n.getClientRects().length) && getComputedStyle(n).visibility !== 'hidden' })));
  test.nextProjects = related;
  check(test, 'three real related links', related.length === 3 && new Set(related.map(x => x.href)).size === 3 && related.every(x => x.href !== test.route), related);
  await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight)); await pause(page, 100); await scan(); await picture(page, test, 'footer');
  check(test, 'visible footer retained', await page.locator('footer').evaluateAll(nodes => nodes.some(n => n.getBoundingClientRect().height > 0)));
  check(test, 'no horizontal page overflow', maxOverflow <= 2, maxOverflow);
  check(test, 'native copy fits', !test.copyOverflow, test.copyOverflow || []);
  check(test, 'visible images decode', failures.size === 0, [...failures.values()]);
  if (fullScroll) check(test, 'every rendered scene was viewed', baseline.renderedSceneIds.every(id => seenScenes.has(id)), { seen: seenScenes.size, expected: baseline.renderedSceneIds.length, missed: baseline.renderedSceneIds.filter(id => !seenScenes.has(id)) });
  check(test, 'native media has no decode error', (await page.locator('video[data-case-video]').evaluateAll(nodes => nodes.filter(n => n.error).map(n => ({ src: n.currentSrc || n.src, code: n.error.code })))).length === 0);
  test.scanCount = scanCount;
}
async function galleries(page, test) {
  const tracks = page.locator('[data-case-carousel]');
  check(test, 'four horizontal galleries', await tracks.count() === 4, await tracks.count());
  test.galleries = [];
  for (let i = 0; i < await tracks.count(); i++) {
    const track = tracks.nth(i); await track.scrollIntoViewIfNeeded();
    const id = await track.getAttribute('id');
    const next = page.locator(`button[aria-label="Следующий материал"][aria-controls="${id}"]`);
    const back = page.locator(`button[aria-label="Предыдущий материал"][aria-controls="${id}"]`);
    await track.focus(); await page.keyboard.press('ArrowRight'); await settleGallery(track);
    const moved = await track.evaluate(n => n.scrollLeft);
    check(test, 'gallery keyboard moves ' + i, moved > 1, moved);
    const count = await track.locator('.baev-case-slide').count();
    for (let n = 0; n < count + 1 && await next.isEnabled(); n++) { await next.click(); await settleGallery(track); }
    const end = await track.evaluate(n => ({ left: n.scrollLeft, max: n.scrollWidth - n.clientWidth, lastRight: n.lastElementChild.getBoundingClientRect().right - n.getBoundingClientRect().right }));
    check(test, 'gallery last item reachable ' + i, Math.abs(end.left - end.max) < 3 && end.lastRight < 3 && !(await next.isEnabled()), end);
    if (await back.isEnabled()) { await back.click(); await settleGallery(track); }
    check(test, 'gallery previous button moves ' + i, (await track.evaluate(n => n.scrollLeft)) < end.left - 1);
    await visibleImages(page); await picture(page, test, 'gallery-' + i);
    test.galleries.push({ index: i, cards: count, end });
  }
}
async function settleGallery(track) {
  // WebKit can finish a native smooth scroll after a fixed 550ms delay. Wait
  // for the measured position to settle before testing the next enabled state.
  await track.evaluate(element => new Promise((resolve, reject) => {
    const started = performance.now(); let stableSince = started, last = element.scrollLeft;
    function frame(now) {
      const current = element.scrollLeft;
      if (Math.abs(current - last) > .1) stableSince = now;
      last = current;
      if (now - started >= 200 && now - stableSince >= 150) return resolve();
      if (now - started > 3000) return reject(new Error('Gallery scroll did not settle within 3 seconds'));
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }));
}
async function media(page, test) {
  const video = page.locator('video[data-case-video]').first();
  if (!await video.count()) { test.media = { skipped: 'Case has no native video' }; return; }
  const videoId = await video.getAttribute('id');
  const external = videoId ? page.locator(`[data-case-video-toggle="${videoId}"]`) : null;
  const externalControls = Boolean(external && await external.count());
  async function manual(action) {
    if (externalControls) {
      const paused = await video.evaluate(v => v.paused);
      if ((action === 'play' && paused) || (action === 'pause' && !paused)) await external.click();
    } else await video.evaluate((v, method) => v[method](), action);
  }
  async function availableControls() {
    return video.evaluate(v => v.controls || [...document.querySelectorAll('[data-case-video-toggle]')].some(button =>
      button.getAttribute('aria-controls') === v.id && !button.hidden && !button.disabled && button.getBoundingClientRect().width > 0));
  }
  await video.scrollIntoViewIfNeeded();
  await page.waitForFunction(() => { const v = document.querySelector('video[data-case-video]'); return v && v.readyState >= 2 && !v.paused && v.currentTime > 0; }, null, { timeout: 15000 });
  const first = await video.evaluate(v => ({ time: v.currentTime, controls: v.controls, width: v.videoWidth, poster: v.poster, paused: v.paused }));
  await pause(page, 420); const advanced = await video.evaluate(v => ({ time: v.currentTime, paused: v.paused }));
  check(test, 'visible native H264 video advances', !advanced.paused && advanced.time !== first.time && first.width > 0, { first, advanced });
  await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight)); await pause(page, 250);
  check(test, 'offscreen video pauses', await video.evaluate(v => v.paused));
  await video.scrollIntoViewIfNeeded(); await pause(page, 600);
  check(test, 'visible video resumes', await video.evaluate(v => !v.paused));
  if (externalControls) {
    check(test, 'cropped video has visible external controls', await external.isVisible() && await availableControls());
    const full = external.locator('..').locator('a[href]');
    check(test, 'cropped video has full-player fallback', await full.isVisible() && await full.getAttribute('href') === await video.getAttribute('src'));
  }
  // Use the actual visible button for cropped video, otherwise the public
  // native-media API. Neither path touches the implementation's private state.
  await manual('pause'); await pause(page, 100);
  await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight)); await pause(page, 150);
  await video.scrollIntoViewIfNeeded(); await pause(page, 600);
  check(test, 'manual pause survives leaving and returning', await video.evaluate(v => v.paused));
  await manual('play'); await pause(page, 150);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.waitForFunction(() => matchMedia('(prefers-reduced-motion: reduce)').matches && document.querySelector('video[data-case-video]').paused, null, { timeout: 3000 });
  check(test, 'dynamic reduced motion pauses with controls', await video.evaluate(v => v.paused) && await availableControls());
  await manual('play');
  await page.waitForFunction(() => { const v = document.querySelector('video[data-case-video]'); return !v.paused && v.currentTime > 0; }, null, { timeout: 3000 });
  const manualStart = await video.evaluate(v => v.currentTime); await pause(page, 400);
  check(test, 'manual video play remains available in reduced motion', await video.evaluate((v, before) => !v.paused && v.currentTime !== before, manualStart));
  await video.evaluate(v => v.pause());
  test.media = { first, advanced, manualActivation: externalControls ? 'Visible external playback button click' : 'HTMLMediaElement public play/pause API, not implementation internals' };
}
async function initialReduce(browser, engine, viewport, route) {
  const test = { id: engine + '-' + viewport + '-initial-reduced', engine, viewport, route, checks: [] };
  report.tests.push(test); const { context, page } = await setupPage(browser, engine, viewport, test, 'reduce');
  try {
    await navigate(page, route, test); const video = page.locator('video[data-case-video]').first(); await video.scrollIntoViewIfNeeded(); await pause(page, 350);
    check(test, 'initial reduced motion is paused and has poster/controls', await video.evaluate(v => v.paused && v.controls && Boolean(v.poster)));
    await video.evaluate(v => v.play()); await page.waitForFunction(() => { const v = document.querySelector('video[data-case-video]'); return v && !v.paused && v.currentTime > 0; }, null, { timeout: 15000 });
    check(test, 'initial reduced motion permits manual play', await video.evaluate(v => !v.paused));
    await picture(page, test, 'manual'); await video.evaluate(v => v.pause());
  } catch (e) { check(test, 'test execution', false, e.message); }
  await finish(page, context, test);
}
async function menu(page, test) {
  const toggle = page.locator('nav.framer-Agr03 [role="button"][aria-controls]').filter({ visible: true }).first();
  if (!await toggle.count()) { check(test, 'mobile menu toggle exists', false); return; }
  await page.evaluate(() => scrollTo(0, 0)); await toggle.focus(); await page.keyboard.press('Enter'); await pause(page, 100);
  check(test, 'mobile menu opens', await toggle.getAttribute('aria-expanded') === 'true');
  await page.keyboard.press('Escape'); await pause(page, 100);
  check(test, 'Escape restores menu and focus', await toggle.getAttribute('aria-expanded') === 'false' && await toggle.evaluate(n => n === document.activeElement));
}
async function finish(page, context, test) {
  const safety = await page.evaluate(() => window.__caseQASafety || { submits: 0, mailto: 0 }).catch(() => ({ submits: 0, mailto: 0 }));
  report.safety.formSubmissions += safety.submits; report.safety.mailtoActivations += safety.mailto;
  check(test, 'no JS page errors', test.pageErrors.length === 0, test.pageErrors);
  const unexpectedConsole = test.console.filter(message => !/net::ERR_ABORTED|NS_BINDING_ABORTED/i.test(message));
  check(test, 'no unexpected browser console errors', unexpectedConsole.length === 0, unexpectedConsole);
  check(test, 'no failed local requests', test.failedLocalRequests.length === 0, test.failedLocalRequests);
  check(test, 'no local HTTP errors', test.badLocalResponses.length === 0, test.badLocalResponses);
  check(test, 'no Framer requests', test.framerRequests.length === 0, test.framerRequests);
  test.passed = test.checks.every(c => c.passed);
  await context.close(); await checkpoint();
  console.log(JSON.stringify({ test: test.id, passed: test.passed, failures: test.checks.filter(c => !c.passed).map(c => c.name) }));
}
async function basicPages(browser, config) {
  for (const viewport of ['desktop', 'mobile']) {
    const test = { id: 'chromium-' + viewport + '-catalog-navigation', engine: 'chromium', viewport, route: '/work', checks: [] };
    report.tests.push(test); const { context, page } = await setupPage(browser, 'chromium', viewport, test);
    try {
      await navigate(page, '/work', test);
      const cards = page.locator('a.framer-m7m9in');
      const links = await cards.evaluateAll(nodes => nodes.map(n => new URL(n.href).pathname));
      check(test, '15 catalog projects', links.length === 15 && new Set(links).size === 15, links);
      const heading = await page.locator('h1,h2,h3,h4,h5,h6').evaluateAll(nodes => nodes.filter(n => !n.closest('nav,footer') && n.getBoundingClientRect().height && n.textContent.trim() === 'Проекты').map(n => ({ tag: n.tagName, fontSize: getComputedStyle(n).fontSize })));
      check(test, 'work heading excludes navigation', heading.length > 0 && heading.every(n => parseFloat(n.fontSize) >= 30), heading);
      const target = config.find(c => c.key === 'gm8');
      await page.locator(`a.framer-m7m9in[href="${target.route}"]`).click();
      await page.waitForURL(url => url.origin === TARGET && url.pathname.replace(/\/$/, '') === target.route);
      check(test, 'new case opens from catalog', await page.locator('main.baev-case').getAttribute('data-case-key') === 'gm8');
      await page.locator('[data-framer-name="Next projects"]').scrollIntoViewIfNeeded();
      const related = page.locator('[data-framer-name="Next projects"] a[href^="/work/"]').filter({ visible: true }).first();
      const href = await related.getAttribute('href'); await related.click();
      await page.waitForURL(url => url.origin === TARGET && url.pathname.replace(/\/$/, '') === href.replace(/\/$/, ''));
      check(test, 'bottom project transition opens target', new URL(page.url()).pathname.replace(/\/$/, '') === href.replace(/\/$/, ''));
      await navigate(page, '/', test);
      const rows = await page.locator('a.framer-pE5Vm').evaluateAll(nodes => nodes.filter(n => n.getBoundingClientRect().height > 0).map(n => new URL(n.href).pathname));
      check(test, '15 visible home index rows', rows.length === 15 && new Set(rows).size === 15, rows);
      await navigate(page, '/about', test);
      check(test, 'About has one visible semantic H1', await page.locator('h1').filter({ visible: true }).count() === 1);
    } catch (e) { check(test, 'test execution', false, e.message); }
    await finish(page, context, test);
  }
}
(async () => {
  await fs.mkdir(OUT, { recursive: true });
  const config = JSON.parse(await fs.readFile(path.join(REPO, 'content/cases/catalog.json'), 'utf8')).cases;
  try {
    for (const [engine, driver] of Object.entries({ chromium, firefox, webkit })) {
      if (!ENGINES.includes(engine)) continue;
      guard();
      try { activeBrowser = await driver.launch({ headless: true, ...(engine === 'chromium' ? { args: ['--no-sandbox'] } : {}) }); report.launches.push({ engine, ok: true, version: activeBrowser.version() }); }
      catch (error) { report.launches.push({ engine, ok: false, error: error.message }); continue; }
      const cases = CASES.length ? config.filter(c => CASES.includes(c.key)) : engine === 'chromium' ? config : config.filter(c => ['orla', 'avito', 'gm8'].includes(c.key));
      for (const item of cases) for (const viewport of VIEWPORTS) {
        guard();
        const test = { id: engine + '-' + viewport + '-' + item.key, engine, viewport, route: item.route, checks: [] };
        report.tests.push(test); const { context, page } = await setupPage(activeBrowser, engine, viewport, test);
        try {
          await navigate(page, item.route, test); await inspectRoute(page, test, MODE !== 'smoke' && engine === 'chromium');
          if (MODE !== 'smoke' && item.key === 'avito') await galleries(page, test);
          if (MODE !== 'smoke') await media(page, test);
          if (MODE !== 'smoke' && viewport === 'mobile' && item.key === 'orla') await menu(page, test);
        } catch (error) { check(test, 'test execution', false, error.message); }
        await finish(page, context, test);
      }
      if (MODE !== 'smoke') {
        for (const viewport of VIEWPORTS) await initialReduce(activeBrowser, engine, viewport, config.find(c => c.key === 'orla').route);
        if (engine === 'chromium' && !CASES.length) await basicPages(activeBrowser, config);
      }
      await activeBrowser.close(); activeBrowser = null; await checkpoint();
    }
  } catch (error) { report.fatal = error.message; }
  finally { if (activeBrowser) await activeBrowser.close().catch(() => {}); }
  report.finishedAt = new Date().toISOString(); report.elapsedSeconds = Math.round((Date.now() - START) / 1000);
  report.passed = !report.fatal && report.launches.length === ENGINES.length && report.launches.every(x => x.ok) && report.tests.length > 0 && report.tests.every(x => x.passed) && report.safety.formSubmissions === 0 && report.safety.mailtoActivations === 0;
  report.summary = { tests: report.tests.length, passed: report.tests.filter(x => x.passed).length, failed: report.tests.filter(x => !x.passed).length };
  await checkpoint(); console.log(JSON.stringify({ passed: report.passed, ...report.summary, elapsedSeconds: report.elapsedSeconds }));
  process.exitCode = report.passed ? 0 : 1;
})().catch(error => { console.error(error); process.exitCode = 1; });
