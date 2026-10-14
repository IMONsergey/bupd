import { readFileSync, existsSync } from 'node:fs';
import { resolve, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const pages = ['index.html', 'work/index.html', 'about/index.html', 'blog/index.html', 'contact/index.html'];
const files = new Map(pages.map(page => [page, readFileSync(join(root, page), 'utf8')]));
const failures = [];
let checks = 0;
const assert = (condition, description) => {
  checks++;
  if (!condition) failures.push(description);
};
const rootHTML = files.get('index.html');

for (const [file, html] of files) {
  assert(/<html lang="ru"/.test(html), file + ': document language missing');
  assert((html.match(/<h1(?:\s|>)/g) || []).length === 1, file + ': expected exactly one h1');
  assert(/<meta name="description"/.test(html), file + ': meta description missing');
  assert(/<meta name="viewport"/.test(html), file + ': viewport missing');
  assert(html.includes('id="content"'), file + ': skip target missing');
  assert(html.includes('class="site-header"'), file + ': shared navigation missing');
  assert(html.includes('class="mobile-menu"'), file + ': mobile navigation missing');
  assert(html.includes('class="footer page-gutter"'), file + ': footer missing');
  assert(!/Made in Framer|events\.framer\.com|framer\.com\?via=/.test(html), file + ': legacy runtime / badge still present');

  const imageTags = html.match(/<img\b[^>]*>/g) || [];
  imageTags.forEach(tag => assert(/\balt="[^"]+"/.test(tag), file + ': image missing descriptive alt'));

  for (const [, asset] of html.matchAll(/(?:src|href)="(\/front\/[^"]+)"/g)) {
    assert(existsSync(join(root, asset.slice(1))), file + ': asset missing ' + asset);
  }

  for (const [, link] of html.matchAll(/<a\b[^>]*href="([^"]+)"/g)) {
    if (link.startsWith('#')) {
      assert(html.includes('id="' + link.slice(1) + '"'), file + ': in-page anchor has no target: ' + link);
    } else if (link.startsWith('/#')) {
      assert(rootHTML.includes('id="' + link.slice(2) + '"'), file + ': home anchor has no target: ' + link);
    } else if (link.startsWith('/') && !link.startsWith('//')) {
      const path = link.split(/[?#]/)[0];
      const destination = path === '/' ? 'index.html' : join(path.slice(1), 'index.html');
      assert(existsSync(join(root, destination)), file + ': internal route missing: ' + link);
    }
  }
}
assert(files.get('contact/index.html').includes('class="baev-contact-form"'), 'contact: integrated form missing');
for (const name of ['Name', 'Email', 'MessageEmail']) {
  assert(files.get('contact/index.html').includes('name="' + name + '"'), 'contact: payload field missing ' + name);
}
assert(files.get('blog/index.html').match(/class="blog-entry reveal"/g)?.length === 3, 'blog: should link only to three published articles');
assert(files.get('work/index.html').match(/class="project-card reveal"/g)?.length === 8, 'portfolio: published fallback count changed unexpectedly');

if (failures.length) {
  console.error('BAEV public frontend: ' + failures.length + ' failed checks / ' + checks);
  failures.forEach(f => console.error('  - ' + f));
  process.exit(1);
}
console.log('BAEV public frontend: ' + checks + ' checks passed across ' + pages.length + ' routes.');
