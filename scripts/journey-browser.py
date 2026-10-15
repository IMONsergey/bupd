"""Browser acceptance for the isolated BAEV homepage. Never submits client forms."""
from __future__ import annotations
import json
import os
import pathlib
from playwright.sync_api import sync_playwright

BASE = os.getenv('BAEV_QA_URL', 'http://127.0.0.1:4173')
OUT = pathlib.Path(os.getenv('BAEV_QA_OUTPUT', 'journey-qa'))
OUT.mkdir(exist_ok=True)
report = {'checks': [], 'scenes': [], 'errors': []}

def check(condition, label):
    if not condition:
        raise AssertionError(label)
    report['checks'].append(label)
    print('PASS', label, flush=True)

def wait_ready(page):
    page.wait_for_function("document.body.dataset.ready === 'true'", timeout=90000)
    page.wait_for_function("!window.__BAEV_JOURNEY__.stats().travelling", timeout=60000)

def go(page, index):
    page.locator(f'#chapter-track [data-chapter="{index}"]').click()
    page.wait_for_function('(i) => window.__BAEV_JOURNEY__.current === i && !window.__BAEV_JOURNEY__.stats().travelling', arg=index, timeout=60000)
    page.wait_for_timeout(150)

def no_overflow(page, label):
    d = page.evaluate('({w:innerWidth,h:innerHeight,sw:document.documentElement.scrollWidth,sh:document.documentElement.scrollHeight})')
    check(d['sw'] <= d['w'] + 1 and d['sh'] <= d['h'] + 1, label)

def watch_errors(page):
    page.on('pageerror', lambda error: report['errors'].append(str(error)))
    page.on('console', lambda message: report['errors'].append(message.text) if message.type == 'error' and ('THREE.WebGLProgram' in message.text or 'Shader Error' in message.text) else None)

try:
    with sync_playwright() as p:
        browser_name = os.getenv('BAEV_BROWSER', 'chromium')
        args = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--enable-webgl'] if browser_name == 'chromium' else []
        browser = getattr(p, browser_name).launch(headless=True, args=args)
        context = browser.new_context(viewport={'width': 1440, 'height': 900}, reduced_motion='no-preference')
        page = context.new_page()
        watch_errors(page)
        page.goto(BASE + '/?debug=1', wait_until='domcontentloaded')
        page.wait_for_function("['true','fallback'].includes(document.body.dataset.ready)", timeout=90000)
        is_fallback = page.evaluate("document.body.dataset.ready === 'fallback'")
        if is_fallback and browser_name != 'chromium':
            check(page.locator('#plain').is_visible(), f'{browser_name}: readable graphics fallback')
            check(page.locator('#plain article').count() == 8, f'{browser_name}: all chapters survive fallback')
            page.screenshot(path=str(OUT / f'{browser_name}-fallback.png'), full_page=True)
        else:
            wait_ready(page)
            stats = page.evaluate('window.__BAEV_JOURNEY__.stats()')
            check(stats['drawCalls'] > 0 and stats['triangles'] > 1000, 'real WebGL geometry renders on the opening frame')
            for index in range(8):
                if index:
                    go(page, index)
                check(page.locator('#scene-title').inner_text().strip() != '', f'chapter {index + 1}: readable DOM title')
                no_overflow(page, f'chapter {index + 1}: no horizontal or vertical document scroll')
                stats = page.evaluate('window.__BAEV_JOURNEY__.stats()')
                check(stats['drawCalls'] > 0, f'chapter {index + 1}: rendered scene')
                report['scenes'].append(stats)
                page.screenshot(path=str(OUT / f'desktop-{index + 1:02}.png'))
                if index in [1, 2, 3, 4, 6]:
                    page.locator('#scene-detail').click()
                    check(page.locator('#scene-detail').get_attribute('aria-pressed') == 'true', f'chapter {index + 1}: working detail interaction')
                if index == 2:
                    glyphs = page.evaluate("window.__BAEV_JOURNEY__.engine.registry.get(2).group.children.filter(o => o.name.startsWith('glyph-')).map(o => o.geometry.type)")
                    check(len(glyphs) == 7 and all(g == 'ExtrudeGeometry' for g in glyphs), 'meaning uses seven volumetric glyphs, not textured boards')
                    page.wait_for_function('window.__BAEV_JOURNEY__.engine.detail > .98', timeout=30000)
                    page.screenshot(path=str(OUT / 'desktop-03-focused.png'))
                if index == 5:
                    page.locator('#case-next').click()
                    check(page.locator('#case-title').inner_text() == 'HAVAL', 'project selector updates title')
                    check(page.locator('#case-link').get_attribute('href').endswith('/work/linear-identity'), 'project selector preserves correct case route')
                    check(page.request.get(BASE + '/work/linear-identity').ok, 'existing full case URL resolves')
                if index == 7:
                    page.locator('#project-title').fill('Проверка презентации')
                    page.locator('#project-title').press('ArrowLeft')
                    check(page.evaluate('window.__BAEV_JOURNEY__.current') == 7, 'typing and arrow keys in the brief do not navigate')
                    check(page.locator('#scene-contact').get_attribute('href') == '/contact/', 'final CTA uses the existing contact route')
            page.locator('#project-title').blur()
            page.locator('#map-open').click()
            check(page.locator('#chapter-dialog').is_visible(), 'chapter map opens as a native dialog')
            check(not page.evaluate('window.__BAEV_JOURNEY__.stats().running'), 'renderer pauses behind the modal')
            page.keyboard.press('Escape')
            check(not page.locator('#chapter-dialog').is_visible(), 'Escape closes the map')
            check(page.evaluate("document.activeElement.id === 'map-open'"), 'dialog restores keyboard focus')
            page.locator('#motion-toggle').click()
            check(page.evaluate('window.__BAEV_JOURNEY__.stats().reduced'), 'motion toggle changes the renderer mode')
            go(page, 1)
            check(not page.evaluate('window.__BAEV_JOURNEY__.stats().travelling'), 'reduced mode has no fly-through transition')
            page.locator('#quality').select_option('low')
            check(page.evaluate('window.__BAEV_JOURNEY__.stats().pixelRatio') <= 1, 'explicit lightweight mode caps pixel ratio')
            go(page, 2)
            page.go_back()
            page.wait_for_function('window.__BAEV_JOURNEY__.current === 1')
            check(page.evaluate('window.__BAEV_JOURNEY__.current') == 1, 'browser Back restores the previous chapter')
            page.reload(wait_until='domcontentloaded')
            wait_ready(page)
            check(page.evaluate('window.__BAEV_JOURNEY__.current') == 1, 'reloading a deep link restores its chapter')
            page.locator('#plain-toggle').click()
            check(page.locator('#plain').is_visible(), 'manual text mode is available')
            check(not page.evaluate('window.__BAEV_JOURNEY__.stats().running'), 'text mode stops the render loop')
            page.locator('#return-3d').click()
            wait_ready(page)
            check(page.locator('#experience').is_visible(), 'returning from text mode restores the experience')
            page.evaluate("window.__BAEV_JOURNEY__.engine.renderer.getContext().getExtension('WEBGL_lose_context').loseContext()")
            page.wait_for_selector('#plain', state='visible')
            check(page.locator('#plain article').count() == 8, 'WebGL context loss retains all content')
        for width, height, label in [(390, 844, 'mobile'), (390, 667, 'compact-mobile'), (820, 1180, 'tablet'), (667, 375, 'landscape')]:
            mobile = browser.new_context(viewport={'width': width, 'height': height}, is_mobile=browser_name != 'firefox', has_touch=True, reduced_motion='reduce')
            mp = mobile.new_page()
            watch_errors(mp)
            mp.goto(BASE + '/', wait_until='domcontentloaded')
            mp.wait_for_function("['true','fallback'].includes(document.body.dataset.ready)", timeout=90000)
            if mp.evaluate("document.body.dataset.ready === 'true'"):
                wait_ready(mp)
                check(mp.evaluate('window.__BAEV_JOURNEY__.stats().reduced'), f'{label}: system reduced-motion preference is respected')
                for index in range(8):
                    if index:
                        go(mp, index)
                    no_overflow(mp, f'{label}, chapter {index + 1}: no overflow')
                    box = mp.locator('.scene-copy').bounding_box()
                    check(box['y'] >= 65 and box['y'] + box['height'] <= height - 70, f'{label}, chapter {index + 1}: title/actions inside safe area')
                mp.screenshot(path=str(OUT / f'{label}-final.png'))
                go(mp, 0)
                mp.screenshot(path=str(OUT / f'{label}-opening.png'))
            else:
                check(mp.locator('#plain').is_visible(), f'{label}: usable fallback')
            mobile.close()
        fallback = browser.new_page(viewport={'width': 1280, 'height': 800})
        fallback.goto(BASE + '/?renderer=none', wait_until='domcontentloaded')
        fallback.wait_for_selector('#plain', state='visible')
        check(fallback.locator('#plain article').count() == 8, 'forced no-WebGL fallback contains all eight chapters')
        nojs = browser.new_context(java_script_enabled=False)
        nojs_page = nojs.new_page()
        nojs_page.goto(BASE + '/')
        check(nojs_page.locator('#plain').is_visible(), 'no-JavaScript visitor receives meaningful content')
        check(nojs_page.locator('a[href="/contact/"]').first.is_visible(), 'no-JavaScript visitor can contact BAEV')
        check(not report['errors'], 'no uncaught JavaScript or shader errors')
        browser.close()
    report['status'] = 'passed'
except Exception as error:
    report['status'] = 'failed'
    report['failure'] = str(error)
    print('FAILED', error, flush=True)
    raise
finally:
    (OUT / 'report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2))
    print('BAEV_QA_REPORT=' + json.dumps(report, ensure_ascii=False), flush=True)
