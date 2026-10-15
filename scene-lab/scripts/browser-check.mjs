import { chromium } from 'playwright';
import fs from 'node:fs/promises';
const base = process.env.LAB_URL || 'http://127.0.0.1:4186/cinema/';
const browser = await chromium.launch(
  process.platform === 'darwin'
    ? { channel: 'chrome', headless: true }
    : { headless: true },
);
const results = {
  url: base,
  checks: [],
  screens: [],
  errors: [],
  consoleErrors: [],
};
await fs.mkdir('reports', { recursive: true });
const check = (ok, label) => {
  if (!ok) throw new Error(label);
  results.checks.push(label);
  console.log('PASS', label);
};
try {
  for (const [w, h, label] of [
    [1440, 900, 'desktop'],
    [390, 844, 'mobile'],
    [320, 568, 'compact'],
  ]) {
    const page = await browser.newPage({
      viewport: { width: w, height: h },
      reducedMotion: 'reduce',
    });
    page.on('pageerror', (e) => results.errors.push(String(e)));
    page.on('console', (m) => {
      if (m.type() === 'error') results.consoleErrors.push(m.text());
    });
    await page.goto(base, { waitUntil: 'networkidle' });
    await page.waitForFunction(() => document.body.dataset.ready === 'true', {
      timeout: 60000,
    });
    for (const [i, t] of [0, 0.5, 1].entries()) {
      await page.locator(`[data-shot="${i}"]`).click();
      await page.waitForTimeout(180);
      const s = await page.evaluate(() => window.__BAEV_LAB__.stats());
      check(
        s.modelLoaded && s.triangles > 1000,
        `${label}/${i}: actual GLB rendered`,
      );
      check(s.calls < 200, `${label}/${i}: draw-call budget`);
      const layout = await page.evaluate(() => ({
        w: innerWidth,
        h: innerHeight,
        sw: document.documentElement.scrollWidth,
        sh: document.documentElement.scrollHeight,
      }));
      check(
        layout.sw <= w + 1 && layout.sh <= h + 1,
        `${label}/${i}: no page overflow`,
      );
      const b = await page.locator('.controls').boundingBox();
      check(b.y > 0 && b.y + b.height <= h, `${label}/${i}: controls fit`);
      const image = `reports/${label}-${i + 1}.jpg`;
      await page.screenshot({ path: image, type: 'jpeg', quality: 87 });
      results.screens.push({ label, index: i, ...s });
    }
    const f = await page.evaluate(() => window.__BAEV_LAB__.stats().frames);
    await page.waitForTimeout(400);
    check(
      (await page.evaluate(() => window.__BAEV_LAB__.stats().frames)) === f,
      `${label}: idle render loop stopped`,
    );
    await page.locator('#static').click();
    check(
      await page.locator('#viewport').isHidden(),
      `${label}: usable static fallback`,
    );
    await page.locator('#static').click();
    check(
      await page.locator('#viewport').isVisible(),
      `${label}: return to 3D`,
    );
    await page.close();
  }
  const p = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  p.on('pageerror', (e) => results.errors.push(String(e)));
  await p.goto(base, { waitUntil: 'networkidle' });
  await p.waitForFunction(() => document.body.dataset.ready === 'true');
  await p.locator('#play').click();
  await p.waitForTimeout(500);
  check(
    (await p.evaluate(() => window.__BAEV_LAB__.stats().progress)) > 0,
    'camera animation advances',
  );
  await p.locator('#play').click();
  check(
    !(await p.evaluate(() => window.__BAEV_LAB__.stats().playing)),
    'camera pause works',
  );
  if (base.includes(':4186')) {
    await p.locator('#editor-link').click();
    await p.locator('.tp-dfwv').waitFor({ state: 'visible', timeout: 10000 });
    check(
      (await p.locator('.tp-dfwv').count()) === 1,
      'development editor loads on demand',
    );
    await p.screenshot({
      path: 'reports/editor.jpg',
      type: 'jpeg',
      quality: 85,
    });
  }
  const nojs = await browser.newContext({ javaScriptEnabled: false });
  const fallback = await nojs.newPage();
  await fallback.goto(base);
  check(
    await fallback.locator('.poster img').isVisible(),
    'no-JavaScript poster is available',
  );
  check(
    await fallback.locator('header a[href="/contact/"]').isVisible(),
    'contact remains accessible without JavaScript',
  );
  check(results.errors.length === 0, 'no unhandled JavaScript errors');
  results.status = 'passed';
} catch (error) {
  results.status = 'failed';
  results.failure = String(error);
  process.exitCode = 1;
  console.error(error);
} finally {
  await fs.writeFile('reports/browser.json', JSON.stringify(results, null, 2));
  await browser.close();
  console.log(
    'REPORT',
    JSON.stringify({
      status: results.status,
      checks: results.checks.length,
      failure: results.failure,
      errors: results.errors,
      consoleErrors: results.consoleErrors,
    }),
  );
}
