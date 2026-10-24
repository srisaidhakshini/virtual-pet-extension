// App-owned renderer integration tests: no screenshots of other applications.
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const output = path.join(__dirname, '../.desktop-smoke');
fs.mkdirSync(output, { recursive: true });
app.setPath('userData', path.join(output, 'ui-profile'));
let saved = null;
const { offlineRoom } = require('../dist/room-client.cjs');
ipcMain.handle('room:view', () => offlineRoom());
ipcMain.handle('room:command', () => {});
const checkIns = [];
ipcMain.handle('pet:check-in', (_event, text) => { checkIns.push(text); return true; });
ipcMain.handle('pet:load', () => saved);
ipcMain.handle('pet:save', (_event, value) => { saved = { ...saved, ...value }; });
app.whenReady().then(async () => {
  const win = new BrowserWindow({ width: 1360, height: 1040, show: false, webPreferences: { preload: path.join(__dirname, 'preload.cjs'), contextIsolation: true, nodeIntegration: false, sandbox: true, backgroundThrottling: false, offscreen: true } });
  const errors = [];
  win.webContents.on('console-message', event => { if (event.level === 'error' || event.level === 3) errors.push(event.message); });
  const settle = async () => {
    await win.webContents.executeJavaScript(`(async () => {
      for (let i=0; i<100 && !document.querySelector('.care-panel, .popup-shell'); i++) await new Promise(r => setTimeout(r, 30));
      for (let attempt = 0; attempt < 100 && ![...document.images].every(image => image.complete && image.naturalWidth > 0); attempt++) await new Promise(resolve => setTimeout(resolve, 30));
            if (![...document.images].every(image => image.complete && image.naturalWidth > 0)) throw new Error('Current artwork did not finish loading');
      await new Promise(r => setTimeout(r, 250));
    })()`);
  };
  const capture = async name => {
    await settle();
    const image = await win.webContents.capturePage();
    fs.writeFileSync(path.join(output, name + '.png'), image.toPNG());
  };
  try {
    await win.loadFile(path.join(__dirname, '../dist/index.html'));
    await capture('website-wide');
    const check = await win.webContents.executeJavaScript(`({ tabs: [...document.querySelectorAll('.care-tabs button')].map(b=>b.textContent), noOverflow: document.documentElement.scrollWidth <= innerWidth, noNameTag: !document.querySelector('.group .absolute.-top-7') })`);
    if (check.tabs.join(',') !== 'Care,Companion,Connect,Progress' || !check.noOverflow || !check.noNameTag) throw Error(JSON.stringify(check));
    const playback = await win.webContents.executeJavaScript(`(async () => {
      document.querySelector('.secondary-button').click();
      for (let i=0; i<120 && ![...document.images].some(image => image.src.includes('sprout-walk-')); i++) await new Promise(resolve => setTimeout(resolve, 50));
      const frames = new Set();
      for (let i=0; i<12; i++) {
        for (const image of document.images) if (image.src.includes('sprout-walk-')) { if (image.complete && image.naturalWidth > 0) frames.add(image.src); }
        await new Promise(resolve => setTimeout(resolve, 75));
      }
      document.querySelector('.secondary-button').click();
      return frames.size;
    })()`);
    if (playback < 5) throw Error('Walk playback did not advance through the authored frames: ' + playback);
    await win.webContents.executeJavaScript(`document.querySelectorAll('.care-tabs button')[1].click()`);
    await capture('companion-wide');
    await win.webContents.executeJavaScript(`document.querySelector('.companion-settings .primary-button').click()`);
    await settle();
    if (!checkIns.length) throw Error('Companion test check-in was not delivered');
    if (await win.webContents.executeJavaScript(`document.body.textContent.includes('Wardrobe') || !!document.querySelector('.wardrobe-grid')`)) throw Error('Wardrobe is still exposed');
    win.setSize(390, 844);
    await capture('website-narrow');
    if (!await win.webContents.executeJavaScript(`document.documentElement.scrollWidth <= innerWidth`)) throw Error('Narrow viewport overflow');
    await win.loadFile(path.join(__dirname, '../dist/sidepanel.html'));
    await capture('care-narrow');
    const sizing = await win.webContents.executeJavaScript(`(async () => {
      const before = document.querySelector('.stage-pet .sprout-renderer').style.width;
      document.querySelector('[aria-label="Increase pet size"]').click();
      await new Promise(resolve => setTimeout(resolve, 50));
      const after = document.querySelector('.stage-pet .sprout-renderer').style.width;
      document.querySelector('[aria-label="Decrease pet size"]').click();
      return parseFloat(after) === parseFloat(before) + 10;
    })()`);
    if (!sizing) throw Error('Size controls did not update pet rendering');
    await win.webContents.executeJavaScript(`document.querySelectorAll('.care-actions button')[1].click()`);
    await settle();
    if (!await win.webContents.executeJavaScript(`!!document.querySelector('svg.pet-play-toy') && !document.querySelector('.pet-effect')`)) throw Error('Expected graphical play toy and no floating effects');
    await win.webContents.executeJavaScript(`document.querySelector('.care-actions button').click()`);
    await settle();
    if (!await win.webContents.executeJavaScript(`document.querySelector('.stage-caption').textContent.includes('Berry break')`)) throw Error('Feed action feedback failed');
    await win.loadFile(path.join(__dirname, '../dist/popup.html'));
    win.setSize(360, 600);
    await capture('popup');
    if (errors.length) throw Error(errors.join('\n'));
    console.log('PASS: wide/narrow layouts, eight-frame playback, Sprout-only controls, wardrobe removal, manual companion check-in, size controls, graphical play toy, feeding feedback, popup, and local artwork loading');
    app.exit(0);
  } catch (error) { console.error(error); app.exit(1); }
});
setTimeout(() => { console.error('UI review timed out'); app.exit(1); }, 30000).unref();
