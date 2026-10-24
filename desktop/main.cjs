const { RoomClient } = require('../dist/room-client.cjs');
const WebSocket = require('ws');
const { app, BrowserWindow, ipcMain, screen, Tray, Menu, nativeImage, powerMonitor, Notification } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const { PET_WIDTH, PET_HEIGHT, getPetBounds, clampPosition, stepToward } = require('./motion.cjs');

app.setName('Sprout Desktop Pet');
const smokeTest = process.argv.includes('--smoke-test');
if (smokeTest) {
  const testData = path.join(__dirname, '../.desktop-smoke');
  fs.mkdirSync(testData, { recursive: true });
  app.setPath('userData', testData);
}
if (!app.requestSingleInstanceLock()) app.quit();
else {
  let petWindow, roomWindow, tray, timer, state = {}, statePath;
  let behavior = { currentState: 'idle', isAutoWalkEnabled: true, overlayVisible: true };
  let lastPublish = 0;
  let position, target, nextWalk = 0, lastTick = 0, dragging = false, dragOffset, hovering = false, locked = false, hiddenByUser = false;
  const trusted = event => [petWindow, roomWindow].some(win => win && !win.isDestroyed() && win.webContents === event.sender);
  const send = (channel, value) => {
    for (const win of [petWindow, roomWindow]) if (win && !win.isDestroyed()) win.webContents.send(channel, value);
  };
  const room = new RoomClient(view => send('room:event', view), url => new WebSocket(url));
  const controller = () => !room.view.code || room.view.controllerId === room.view.id;
  const nativeSnapshot = () => {
    const bounds = petWindow.getBounds();
    const area = screen.getDisplayMatching(bounds).workArea;
    return { x: Math.max(0, Math.min(1, (bounds.x - area.x) / Math.max(1, area.width - bounds.width))), y: Math.max(0, Math.min(1, (bounds.y - area.y) / Math.max(1, area.height - bounds.height))), petSize: behavior.petSize || state.petSize || 140, currentState: behavior.currentState, direction: state.direction || 'right', hunger: state.hunger ?? 82, happiness: state.happiness ?? 94, energy: state.energy ?? 45, cleanliness: state.cleanliness ?? 60, health: state.health ?? 98 };
  };
  ipcMain.handle('room:view', event => trusted(event) ? room.view : null);
  ipcMain.handle('room:command', (event, command) => {
    if (!trusted(event) || !command || !['create','join','leave','request-control','pass-control'].includes(command.type)) return;
    room.command({ ...command, ...(command.type === 'create' ? { snapshot: nativeSnapshot() } : {}) });
  });
  const action = name => (controller() || name === 'show') && petWindow?.webContents.send('pet:action', name);
  function openRoom() {
    if (roomWindow && !roomWindow.isDestroyed()) { roomWindow.show(); roomWindow.focus(); return; }
    roomWindow = new BrowserWindow({ width: 430, height: 760, minWidth: 360, title: 'Sprout · Care & companion', autoHideMenuBar: true,
      webPreferences: { preload: path.join(__dirname, 'preload.cjs'), contextIsolation: true, nodeIntegration: false, sandbox: true } });
    secure(roomWindow);
    roomWindow.loadFile(path.join(__dirname, '../dist/sidepanel.html'));
    roomWindow.on('closed', () => { roomWindow = null; });
  }
  function recover() {
    hiddenByUser = false;
    const area = screen.getDisplayNearestPoint(screen.getCursorScreenPoint()).workArea;
    position = clampPosition({ x: area.x + area.width - 240, y: area.y + area.height - petWindow.getBounds().height }, area, petWindow.getBounds());
    target = null;
    petWindow.setPosition(position.x, position.y);
    petWindow.showInactive();
  }
  function menu() {
    return Menu.buildFromTemplate([
      { label: 'Open care & companion', click: openRoom },
      { type: 'separator' },
      { label: 'Feed a berry', click: () => action('feed') },
      { label: 'Give affection', click: () => action('pet') },
      { label: 'Bath', click: () => action('bathe') },
      { label: 'Play', click: () => action('play') },
      { label: behavior.currentState === 'sleeping' ? 'Wake up' : 'Sleep', click: () => action('sleep') },
      { label: behavior.isAutoWalkEnabled ? 'Pause wandering' : 'Resume wandering', click: () => action('toggleAutoWalk') },
      { label: petWindow.isVisible() ? 'Hide pet' : 'Show pet', click: () => { if (petWindow.isVisible()) { hiddenByUser = true; petWindow.hide(); } else { action('show'); recover(); } } },
      { label: 'Bring pet to this monitor', click: recover },
      { type: 'separator' },
      { label: 'Quit Sprout', click: () => app.quit() },
    ]);
  }
  function secure(win) {
    win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
    win.webContents.on('will-navigate', event => event.preventDefault());
    win.webContents.session.setPermissionRequestHandler((_contents, _permission, callback) => callback(false));
  }
  app.whenReady().then(() => {
    statePath = path.join(app.getPath('userData'), 'pet-state.json');
    try { state = JSON.parse(fs.readFileSync(statePath, 'utf8')); } catch { state = {}; }
    petWindow = new BrowserWindow({ width: PET_WIDTH, height: PET_HEIGHT, frame: false, transparent: true, backgroundColor: '#00000000',
      hasShadow: false, resizable: false, maximizable: false, minimizable: false, skipTaskbar: true, show: false, alwaysOnTop: true,
      webPreferences: { preload: path.join(__dirname, 'preload.cjs'), contextIsolation: true, nodeIntegration: false, sandbox: true, backgroundThrottling: false } });
    secure(petWindow);
    petWindow.setAlwaysOnTop(true, 'floating');
    petWindow.setIgnoreMouseEvents(true, { forward: true });
    petWindow.loadFile(path.join(__dirname, '../dist/desktop.html'));
    petWindow.once('ready-to-show', recover);
    if (smokeTest) {
      const fail = error => { console.error('DESKTOP_SMOKE_FAIL', error); app.exit(1); };
      petWindow.webContents.on('render-process-gone', (_event, details) => fail(details.reason));
      petWindow.webContents.on('did-fail-load', (_event, code, description) => fail(`${code}: ${description}`));
      petWindow.webContents.once('did-finish-load', async () => {
        try {
          const page = await petWindow.webContents.executeJavaScript(`(async () => {
            for (let attempt = 0; attempt < 60 && !document.querySelector('[data-pet-interactive] img'); attempt++) await new Promise(resolve => setTimeout(resolve, 50));
            for (let attempt = 0; attempt < 100 && ![...document.images].every(image => image.complete && image.naturalWidth > 0); attempt++) await new Promise(resolve => setTimeout(resolve, 30));
            if (![...document.images].every(image => image.complete && image.naturalWidth > 0)) throw new Error('Current artwork did not finish loading');
            return { images: document.images.length, pet: !!document.querySelector('[data-pet-interactive]'), background: getComputedStyle(document.body).backgroundColor, bridge: !!window.desktopPet };
          })()`);
          if (!page.pet || !page.images || !page.bridge || page.background !== 'rgba(0, 0, 0, 0)') throw new Error(JSON.stringify(page));
          const before = petWindow.getPosition();
          setTimeout(() => {
            const after = petWindow.getPosition();
            const result = { ...page, transparent: page.background === 'rgba(0, 0, 0, 0)', alwaysOnTop: petWindow.isAlwaysOnTop(), moved: before[0] !== after[0] || before[1] !== after[1] };
            console.log('DESKTOP_SMOKE_RESULT', JSON.stringify(result));
            fs.writeFileSync(path.join(__dirname, '../.desktop-smoke/result.json'), JSON.stringify(result, null, 2));
            app.exit(result.transparent && result.alwaysOnTop && result.moved ? 0 : 1);
          }, 2200);
        } catch (error) { fail(JSON.stringify(error, Object.getOwnPropertyNames(error))); }
      });
      setTimeout(() => fail('Renderer readiness timed out'), 15000).unref();
    }
    petWindow.on('closed', () => app.quit());
    const icon = nativeImage.createFromPath(path.join(__dirname, '../dist/Virtual_Pet/sprout-0.png')).resize({ width: 32, height: 32 });
    tray = new Tray(icon);
    tray.setToolTip('Sprout · Right-click for care, companion, or quit');
    tray.on('click', openRoom);
    tray.on('right-click', () => menu().popup());
    screen.on('display-removed', recover);
    screen.on('display-metrics-changed', () => {
      position = clampPosition(position, screen.getDisplayMatching(petWindow.getBounds()).workArea, petWindow.getBounds());
      petWindow.setPosition(position.x, position.y); target = null;
    });
    powerMonitor.on('lock-screen', () => { locked = true; });
    powerMonitor.on('unlock-screen', () => { locked = false; lastTick = 0; });
    timer = setInterval(() => {
      if (!position || petWindow.isDestroyed()) return;
      if (!controller() && room.view.snapshot) {
        dragging = false; target = null;
        const area = screen.getDisplayMatching(petWindow.getBounds()).workArea;
        const bounds = petWindow.getBounds();
        position = clampPosition({ x: area.x + room.view.snapshot.x * Math.max(0, area.width - bounds.width), y: area.y + room.view.snapshot.y * Math.max(0, area.height - bounds.height) }, area, bounds);
        petWindow.setPosition(position.x, position.y);
        return;
      }
      if (performance.now() - lastPublish >= 80) { room.publish(nativeSnapshot()); lastPublish = performance.now(); }
      const now = performance.now(), dt = lastTick ? (now - lastTick) / 1000 : 0;
      lastTick = now;
      const area = screen.getDisplayMatching(petWindow.getBounds()).workArea;
      if (dragging) {
        const cursor = screen.getCursorScreenPoint();
        position = clampPosition({ x: cursor.x - dragOffset.x, y: cursor.y - dragOffset.y }, screen.getDisplayNearestPoint(cursor).workArea, petWindow.getBounds());
        petWindow.setPosition(position.x, position.y); target = null; return;
      }
      const busy = !['idle', 'walking-left', 'walking-right'].includes(behavior.currentState);
      if (busy || behavior.reducedMotion || hovering || locked || !petWindow.isVisible() || !behavior.overlayVisible || !behavior.isAutoWalkEnabled) {
        target = null; nextWalk = now + 1800; send('pet:motion', { walking: false }); return;
      }
      if (!target && now >= nextWalk) target = clampPosition({ x: area.x + Math.random() * area.width, y: area.y + area.height - petWindow.getBounds().height - Math.random() * Math.min(260, area.height / 3) }, area, petWindow.getBounds());
      if (!target) return;
      const next = stepToward(position, target, dt);
      position = { x: next.x, y: next.y };
      petWindow.setPosition(Math.round(next.x), Math.round(next.y));
      send('pet:motion', { walking: !next.arrived, direction: next.direction });
      if (next.arrived) { target = null; nextWalk = now + 2200 + Math.random() * 4000; }
    }, 33);
  });
  ipcMain.handle('pet:load', event => trusted(event) ? state : null);
  ipcMain.handle('pet:save', (event, changes) => {
    if (!trusted(event) || !changes || typeof changes !== 'object' || Array.isArray(changes) || JSON.stringify(changes).length > 100000) return;
    // Fixed state keys only; the renderer has no filesystem access.
    const keys = ['checkInsEnabled','checkInMinutes','checkInVoice','pageContextEnabled','focusTopic','lastCheckInAt','checkInRequest','petSize','characterVersion','adoptedAt','lastCareAt','name','petType','level','xp','hunger','happiness','energy','cleanliness','health','mood','accessories','equippedAccessories','currentState','direction','position','lastUpdated','streak','activitiesLog','journal','overlayVisible','isAutoWalkEnabled'];
    for (const key of keys) if (Object.hasOwn(changes, key)) state[key] = changes[key];
    const temporary = statePath + '.tmp';
    fs.writeFileSync(temporary, JSON.stringify(state)); fs.renameSync(temporary, statePath);
    send('pet:state', state);
  });
  ipcMain.on('pet:behavior', (event, value) => {
    if (!trusted(event) || event.sender !== petWindow.webContents) return;
    behavior = value;
    const bounds = getPetBounds(value.petSize);
    const currentBounds = petWindow.getBounds();
    if (bounds.width !== currentBounds.width || bounds.height !== currentBounds.height) {
      const clamped = clampPosition(position || currentBounds, screen.getDisplayMatching(currentBounds).workArea, bounds);
      position = clamped; target = null;
      petWindow.setBounds({ ...clamped, ...bounds });
    }
    if (!behavior.overlayVisible) petWindow.hide();
    else if (!hiddenByUser && !petWindow.isVisible()) petWindow.showInactive();
  });
  ipcMain.on('pet:interactive', (event, value) => {
    if (!trusted(event) || event.sender !== petWindow.webContents) return;
    hovering = value === true; petWindow.setIgnoreMouseEvents(!hovering, { forward: true });
  });
  ipcMain.on('pet:drag', (event, value) => {
    if (!trusted(event) || event.sender !== petWindow.webContents) return;
    if (!controller()) return;
    dragging = value === true;
    if (dragging) { const cursor = screen.getCursorScreenPoint(); dragOffset = { x: cursor.x - position.x, y: cursor.y - position.y }; }
    else { nextWalk = performance.now() + 2500; position = petWindow.getPosition().reduce((result, coordinate, i) => ({ ...result, [i ? 'y' : 'x']: coordinate }), {}); }
  });
  let lastNotification = 0;
  ipcMain.handle('pet:check-in', (event, text) => {
    if (!trusted(event) || event.sender !== petWindow.webContents || locked || typeof text !== 'string' || !text.length || text.length > 500 || Date.now() - lastNotification < 3000) return false;
    lastNotification = Date.now();
    if (Notification.isSupported()) {
      const notification = new Notification({ title: 'A little check-in', body: text, silent: true });
      notification.on('click', openRoom); notification.show();
    }
    return true;
  });
  ipcMain.on('pet:room', event => { if (trusted(event)) openRoom(); });
  ipcMain.on('pet:menu', event => { if (trusted(event)) menu().popup(); });
  app.on('second-instance', () => { if (petWindow) recover(); });
  app.on('before-quit', () => { clearInterval(timer); room.disconnect(); });
  app.on('window-all-closed', () => app.quit());
}
