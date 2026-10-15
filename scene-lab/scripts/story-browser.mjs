import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import { CHAPTERS } from '../src/story.js';
const base = process.env.LAB_URL || 'http://127.0.0.1:4186/cinema/';
const out = process.env.LAB_OUTPUT || 'reports/story';
await fs.mkdir(out, { recursive: true });
const report = {
  url: base,
  checks: [],
  errors: [],
  networkErrors: [],
  scenes: [],
};
const check = (value, label) => {
  if (!value) throw new Error(label);
  report.checks.push(label);
  console.log('PASS', label);
};
const browser = await chromium.launch(
  process.platform === 'darwin'
    ? { channel: 'chrome', headless: true }
    : { headless: true },
);
function watch(page) {
  page.on('pageerror', (e) => report.errors.push(String(e)));
  page.on('response', (r) => {
    if (r.status() >= 400 && r.url().startsWith(base.split('/cinema')[0]))
      report.networkErrors.push(`${r.status()} ${r.url()}`);
  });
}
async function ready(page) {
  await page.waitForFunction(
    () => document.body.dataset.ready === 'true',
    null,
    { timeout: 90000 },
  );
}
async function still(page, path) {
  await page.screenshot({ path, type: 'jpeg', quality: 86 });
}
try {
  for (const [width, height, label] of [
    [1440, 900, 'desktop'],
    [390, 844, 'mobile'],
    [320, 568, 'compact'],
    [667, 375, 'landscape'],
    [820, 1180, 'tablet'],
  ]) {
    const page = await browser.newPage({
      viewport: { width, height },
      reducedMotion: 'reduce',
    });
    watch(page);
    await page.goto(base, { waitUntil: 'domcontentloaded' });
    await ready(page);
    for (let index = 0; index < CHAPTERS.length; index++) {
      await page.locator(`[data-shot="${index}"]`).click();
      await page.waitForTimeout(150);
      const s = await page.evaluate(() => window.__BAEV_LAB__.stats());
      check(
        s.chapter === index,
        `${label}/${index + 1}: correct narrative chapter`,
      );
      check(
        s.people >= 100 && s.animatedPeople === 5,
        `${label}/${index + 1}: cast and audience loaded`,
      );
      check(
        s.triangles > 1000 && s.triangles < 850000 && s.calls < 180,
        `${label}/${index + 1}: visible geometry within frame budget`,
      );
      const layout = await page.evaluate(() => ({
        w: innerWidth,
        h: innerHeight,
        sw: document.documentElement.scrollWidth,
        sh: document.documentElement.scrollHeight,
      }));
      check(
        layout.sw <= width + 1 && layout.sh <= height + 1,
        `${label}/${index + 1}: no document overflow`,
      );
      const controls = await page.locator('.controls').boundingBox(),
        title = await page.locator('.caption').boundingBox();
      check(
        controls.y > 0 &&
          controls.y + controls.height <= height + 1 &&
          title.y >= 65,
        `${label}/${index + 1}: controls and copy fit`,
      );
      check(
        s.world === (index >= 4 && index <= 6 ? 'thought' : 'hall'),
        `${label}/${index + 1}: expected story space`,
      );
      if (label === 'desktop') report.scenes.push(s);
      if (label === 'desktop' || index === 0 || index === 6 || index === 7)
        await still(page, `${out}/${label}-${index + 1}.jpg`);
      if (index === 6) {
        await page.waitForFunction(
          () => window.__BAEV_LAB__.stats().projectsLoaded === 3,
          null,
          { timeout: 15000 },
        );
        await page.locator('#case-next').click();
        check(
          (await page.locator('#case-title').innerText()) === 'HAVAL',
          `${label}: project switches independently`,
        );
        check(
          (await page.locator('#case-link').getAttribute('href')) ===
            '/work/linear-identity',
          `${label}: correct existing case link`,
        );
      }
    }
    const frame = await page.evaluate(() => window.__BAEV_LAB__.stats().frames);
    await page.waitForTimeout(400);
    check(
      (await page.evaluate(() => window.__BAEV_LAB__.stats().frames)) === frame,
      `${label}: reduced motion has no idle loop`,
    );
    check(
      (await page.locator('#contact-cta').getAttribute('href')) === '/contact/',
      `${label}: studio enquiry, not event registration`,
    );
    await page.locator('#static').click();
    check(
      await page.locator('#plain').isVisible(),
      `${label}: all content survives text mode`,
    );
    check(
      (await page.locator('#plain article').count()) === 8,
      `${label}: eight fallback chapters`,
    );
    check(
      !(await page.evaluate(() => window.__BAEV_LAB__.stats().running)),
      `${label}: renderer suspended in text mode`,
    );
    await page.locator('#return').click();
    check(
      await page.locator('#viewport').isVisible(),
      `${label}: return to 3D`,
    );
    await page.close();
  }
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });
  watch(page);
  await page.goto(base, { waitUntil: 'domcontentloaded' });
  await ready(page);
  let frame = await page.evaluate(() => window.__BAEV_LAB__.stats().frames);
  await page.waitForTimeout(500);
  check(
    (await page.evaluate(() => window.__BAEV_LAB__.stats().frames)) > frame,
    'opening includes bounded live character motion',
  );
  await page.locator('#advance').click();
  await page.waitForFunction(
    () => !window.__BAEV_LAB__.stats().travelling,
    null,
    { timeout: 15000 },
  );
  check(
    Math.abs(
      (await page.evaluate(() => window.__BAEV_LAB__.stats().progress)) - 0.14,
    ) < 0.001,
    'next action moves through the aisle',
  );
  await page.locator('#back').click();
  await page.waitForFunction(() => !window.__BAEV_LAB__.stats().travelling, {
    timeout: 15000,
  });
  check(
    (await page.evaluate(() => window.__BAEV_LAB__.stats().chapter)) === 0,
    'camera route is reversible',
  );
  await page.evaluate(() => window.__BAEV_LAB__.seek(0.43));
  await page.locator('#play').click();
  await page.waitForFunction(
    () => window.__BAEV_LAB__.stats().progress > 0.48,
    null,
    { timeout: 15000 },
  );
  await page.locator('#play').click();
  check(
    (await page.evaluate(() => window.__BAEV_LAB__.stats().world)) ===
      'thought',
    'playback crosses the actual screen plane into the next space',
  );
  await page.locator('[data-shot="6"]').click();
  await page.reload({ waitUntil: 'domcontentloaded' });
  await ready(page);
  check(
    (await page.evaluate(() => window.__BAEV_LAB__.stats().chapter)) === 6,
    'deep link restores the narrative chapter',
  );
  if (base.includes(':4186')) {
    await page.locator('#editor-link').click();
    await page.locator('.tp-dfwv').waitFor();
    check(
      (await page.locator('.tp-dfwv').count()) === 1,
      'development inspector remains available',
    );
    await still(page, `${out}/editor.jpg`);
    await page.evaluate(() =>
      window.__BAEV_LAB__.scene.renderer.forceContextLoss(),
    );
    await page.locator('#plain').waitFor({ state: 'visible' });
    check(
      (await page.locator('#plain article').count()) === 8,
      'context loss exposes readable content',
    );
  } else
    check(
      await page.locator('#editor-link').isHidden(),
      'development inspector is absent from published build',
    );
  await page.close();
  const context = await browser.newContext({ javaScriptEnabled: false });
  const nojs = await context.newPage();
  await nojs.goto(base);
  check(
    await nojs.locator('#plain').isVisible(),
    'no-JavaScript narrative is readable',
  );
  check(
    (await nojs.locator('#plain article').count()) === 8,
    'no-JavaScript content contains all eight chapters',
  );
  check(report.errors.length === 0, 'no unhandled JavaScript errors');
  check(report.networkErrors.length === 0, 'no missing same-origin resources');
  report.status = 'passed';
} catch (error) {
  report.status = 'failed';
  report.failure = String(error);
  console.error(error);
  process.exitCode = 1;
} finally {
  await browser.close();
  await fs.writeFile(`${out}/browser.json`, JSON.stringify(report, null, 2));
  console.log(
    'REPORT',
    JSON.stringify({
      status: report.status,
      checks: report.checks.length,
      failure: report.failure,
      errors: report.errors,
      networkErrors: report.networkErrors,
    }),
  );
}
