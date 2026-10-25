import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import { pathToFileURL } from 'node:url';

const payloads = new Set([
  '8e9e3befdcdda1bebf77b0e12012e29bef989266edf523aec5d54d15d2eac489',
  'f71f5d07e374f0827b3219f29da0065fa6e42cd62a77a803c0826b43f6414719',
  '5e5d5cf6739e634306217611ce9318a319dce13217f0685ef743b43b5a86fcd7',
]);
export function inspectFile(name, bytes) {
  const problems = [];
  if (payloads.has(createHash('sha256').update(bytes).digest('hex'))) problems.push('known quarantined payload');
  if (['.woff', '.woff2', '.ttf', '.eot'].includes(extname(name))) {
    const expected = { '.woff': 'wOFF', '.woff2': 'wOF2', '.ttf': '\x00\x01\x00\x00' }[extname(name)];
    if (expected && bytes.subarray(0, 4).toString('latin1') !== expected) problems.push('invalid font signature');
    if (extname(name) === '.eot' && (bytes.length < 36 || bytes.readUInt16LE(34) !== 0x504c)) problems.push('invalid EOT signature');
  }
  return problems;
}
export async function checkTree(root = '.') {
  const problems = [];
  async function walk(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      if (['.git', 'node_modules', 'release', '.desktop-smoke'].includes(entry.name)) continue;
      const name = resolve(directory, entry.name);
      if (entry.isSymbolicLink()) { problems.push(`${name}: unexpected symbolic link`); continue; }
      if (entry.isDirectory()) await walk(name);
      else for (const problem of inspectFile(name, await readFile(name))) problems.push(`${name}: ${problem}`);
    }
  }
  await walk(root);
  for (const name of ['package.json', 'server/package.json']) {
    const pkg = JSON.parse(await readFile(resolve(root, name), 'utf8'));
    for (const hook of ['preinstall', 'install', 'postinstall', 'prepare']) if (pkg.scripts?.[hook]) problems.push(`${name}: unexpected ${hook} hook`);
  }
  for (const name of ['package-lock.json', 'server/package-lock.json']) {
    const lock = JSON.parse(await readFile(resolve(root, name), 'utf8'));
    for (const [key, value] of Object.entries(lock.packages || {})) {
      if (value.resolved && !value.resolved.startsWith('https://registry.npmjs.org/')) problems.push(`${name}: unexpected source for ${key}`);
    }
  }
  return problems;
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const problems = await checkTree();
  if (problems.length) { console.error(problems.join('\n')); process.exitCode = 1; }
  else console.log('PASS: known payload hashes, font signatures, package sources and install hooks');
}
