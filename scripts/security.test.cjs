const { test } = require('node:test');
const assert = require('node:assert/strict');

test('disguised JavaScript fonts are rejected without execution', async () => {
  const { inspectFile } = await import('./security-check.mjs');
  for (const extension of ['woff', 'woff2', 'ttf', 'eot']) {
    assert.ok(inspectFile(`fake.${extension}`, Buffer.from('global["!"] = "injected JavaScript"')).length);
  }
  assert.deepEqual(inspectFile('real.woff2', Buffer.from('wOF2font-data')), []);
});

test('working tree satisfies the static security guard', async () => {
  const { checkTree } = await import('./security-check.mjs');
  assert.deepEqual(await checkTree(), []);
});
