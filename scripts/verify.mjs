import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { readFile, access } from 'node:fs/promises';
import vm from 'node:vm';

const timers = [];
globalThis.setTimeout = (callback, delay) => { timers.push({ callback, delay }); return timers.length; };
globalThis.setInterval = () => 0;
let stored = { petType: 'dog', characterVersion: 2, name: 'Sprout', equippedAccessories: ['hat', 'glasses'] };
let listener;
globalThis.chrome = {
  storage: {
    local: {
      get: async key => ({ [key]: stored }),
      set: async data => { structuredClone(data); stored = Object.values(data)[0]; },
    },
    onChanged: { addListener: callback => { listener = callback; } },
  },
};
const output = await build({ entryPoints: ['src/pet/petState.ts'], bundle: true, format: 'esm', platform: 'node', write: false });
const { usePetStore: store } = await import(`data:text/javascript;base64,${Buffer.from(output.outputFiles[0].text).toString('base64')}`);
await store.getState().initFromStorage();
assert.equal(store.getState().petType, 'sprout');
assert.equal(store.getState().petSize, 140);
store.getState().setPetSize(500);
assert.equal(store.getState().petSize, 220);
store.getState().setPetSize(-1);
assert.equal(store.getState().petSize, 80);
store.getState().setPetSize(NaN);
assert.equal(store.getState().petSize, 140);
store.setState({ hunger: 40, happiness: 40, energy: 60, cleanliness: 40 });
store.getState().feed();
assert.equal(store.getState().hunger, 60);
assert.equal(store.getState().currentState, 'eating');
store.getState().play();
assert.equal(store.getState().happiness, 60);
assert.equal(store.getState().energy, 48);
store.getState().bathe();
assert.equal(store.getState().cleanliness, 65);
store.getState().sleep();
assert.equal(store.getState().currentState, 'sleeping');
store.getState().sleep();
assert.equal(store.getState().currentState, 'idle');
assert.deepEqual(store.getState().equippedAccessories, []);
store.getState().setCompanion({ checkInMinutes: 5, focusTopic: 'physics exam' });
assert.equal(store.getState().checkInMinutes, 5);
assert.equal(store.getState().focusTopic, 'physics exam');
store.getState().setCompanion({ checkInsEnabled: false });
assert.equal(store.getState().checkInsEnabled, false);
store.getState().setName('   Fern   ');
assert.equal(store.getState().name, 'Fern');
store.getState().setName('  ');
assert.equal(store.getState().name, 'Fern');
store.setState({ lastUpdated: Date.now() - 60 * 60000, hunger: 100 });
store.getState().applyDecay();
assert.equal(store.getState().hunger, 90);
const write = timers.find(timer => timer.delay === 250);
await write.callback();
assert.equal(stored.name, 'Fern');
assert.equal(typeof stored.feed, 'undefined');
listener({ virtual_pet_state_v1: { newValue: { name: 'Willow', petType: 'cat', currentState: 'eating', position: { x: 999, y: 999 } } } }, 'local');
assert.equal(store.getState().name, 'Willow');
assert.equal(store.getState().petType, 'sprout');
assert.equal(store.getState().currentState, 'eating');
assert.notEqual(store.getState().position.x, 999);
console.log('PASS: care, sleep/wake, wardrobe removal and check-in settings, naming, decay, serializable storage, cross-surface updates');

const manifest = JSON.parse(await readFile('dist/manifest.json', 'utf8'));
for (const script of manifest.content_scripts.flatMap(entry => entry.js)) {
  new vm.Script(await readFile(`dist/${script}`, 'utf8'));
}
for (const path of ['dist/assets/overlay.css', 'dist/popup.html', 'dist/sidepanel.html', ...Array.from({ length: 6 }, (_, i) => `dist/Virtual_Pet/sprout-${i}.png`), ...Array.from({ length: 8 }, (_, i) => `dist/Virtual_Pet/sprout-walk-${i}.png`)]) await access(path);
console.log('PASS: classic content-script syntax, overlay CSS, popup, side panel, Sprout-only migration and eight walk frames');
