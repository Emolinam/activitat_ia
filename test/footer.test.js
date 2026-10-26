import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const base = '/home/runner/work/activitat_ia/activitat_ia';

test('index inclou el footer amb text i enllaç de contacte', async () => {
  const html = await readFile(`${base}/public/index.html`, 'utf8');
  assert.match(html, /<footer>/);
  assert.match(html, /©\s*<span id="any-actual"><\/span>\s*Botiga Copilot/);
  assert.match(html, /<a href="mailto:contacte@botiga\.example\.com">Contacta'ns<\/a>/);
});

test('l’any del footer es calcula amb JavaScript', async () => {
  const js = await readFile(`${base}/public/app.js`, 'utf8');
  assert.match(js, /#any-actual/);
  assert.match(js, /new Date\(\)\.getFullYear\(\)/);
});

test('els estils del footer estan a styles.css amb variables de :root', async () => {
  const css = await readFile(`${base}/public/styles.css`, 'utf8');
  assert.match(css, /footer\s*\{/);
  assert.match(css, /var\(--color-text\)/);
  assert.match(css, /var\(--color-principal\)/);
  assert.match(css, /text-align:\s*center/);
});
