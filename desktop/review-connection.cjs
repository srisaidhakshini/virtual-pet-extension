// Two isolated app renderers exercising the real website and real room service.
const { app, BrowserWindow } = require('electron');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { pathToFileURL } = require('node:url');
app.setPath('userData', path.join(__dirname, '../.desktop-smoke/connection-profile'));
app.whenReady().then(async () => {
  let service, assets;
  const windows = [];
  const failures = [];
  try {
    const { createRoomServer } = await import(pathToFileURL(path.join(__dirname, '../server/index.mjs')).href);
    service = createRoomServer({ port: 0 });
    const address = await service.ready;
    const root = path.resolve(__dirname, '../dist');
    const types = { '.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html', '.png': 'image/png' };
    assets = http.createServer((request, response) => {
      const file = path.resolve(root, '.' + new URL(request.url, 'http://localhost').pathname);
      if (!file.startsWith(root + path.sep)) { response.writeHead(403); response.end(); return; }
      fs.readFile(file, (error, bytes) => { if (error) { response.writeHead(404); response.end(); } else { response.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream'); response.end(bytes); } });
    });
    await new Promise(resolve => assets.listen(0, '127.0.0.1', resolve));
    const endpoint = `ws://127.0.0.1:${address.port}/rooms`;
    for (const [index, width] of [[0, 1000], [1, 640]]) {
      const win = new BrowserWindow({ width, height: 950, show: false, webPreferences: { offscreen: true, backgroundThrottling: false, sandbox: true, partition: `isolated-room-${index}-${Date.now()}` } });
      win.webContents.on('console-message', event => { if (event.level === 'error') failures.push(event.message); });
      windows.push(win);
      await win.loadURL(`http://127.0.0.1:${assets.address().port}/index.html`);
      await win.webContents.executeJavaScript(`(async () => {
        for(let i=0;i<100&&!document.querySelector('.care-tabs');i++) await new Promise(r=>setTimeout(r,30));
        document.hasFocus = () => true;
        document.querySelectorAll('.care-tabs button')[2].click();
        await new Promise(r=>setTimeout(r,100));
        const input = document.querySelector('[aria-label="Connection service address"]');
        Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(input, ${JSON.stringify(endpoint)});
        input.dispatchEvent(new Event('input',{bubbles:true}));
      })()`);
    }
    const [host, guest] = windows;
    const until = async (win, expression) => {
      const result = await win.webContents.executeJavaScript(`(async()=>{ for(let i=0;i<150;i++){if(${expression})return true;await new Promise(r=>setTimeout(r,40));}return false;})()`);
      if (!result) throw Error('UI condition failed: ' + expression);
    };
    await host.webContents.executeJavaScript(`document.querySelector('.connection-panel .primary-button').click()`);
    await until(host, `!!document.querySelector('.room-code strong')`);
    const code = await host.webContents.executeJavaScript(`document.querySelector('.room-code strong').textContent`);
    await guest.webContents.executeJavaScript(`(()=>{
      const input=document.querySelector('#friend-code');
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(input,${JSON.stringify(code)});
      input.dispatchEvent(new Event('input',{bubbles:true}));
    })()`);
    await guest.webContents.executeJavaScript(`document.querySelector('.room-join button').click()`);
    await until(guest, `document.querySelector('.room-presence')?.textContent.includes('Your friend has control')`);
    await until(host, `document.querySelector('.room-presence')?.textContent.includes('Your friend is connected')`);
    await host.webContents.executeJavaScript(`document.querySelector('.secondary-button').click()`);
    await guest.webContents.executeJavaScript(`document.querySelector('.secondary-button').click()`);
    await host.webContents.executeJavaScript(`(()=>{
      const pet=[...document.querySelectorAll('.group')].at(-1), box=pet.getBoundingClientRect();
      pet.dispatchEvent(new MouseEvent('mousedown',{bubbles:true,button:0,clientX:box.x+20,clientY:box.y+20}));
      window.dispatchEvent(new MouseEvent('mousemove',{clientX:170,clientY:280}));
      window.dispatchEvent(new MouseEvent('mouseup'));
    })()`);
    await new Promise(resolve => setTimeout(resolve, 350));
    const normalized = [];
    for (const win of windows) normalized.push(await win.webContents.executeJavaScript(`(()=>{const box=[...document.querySelectorAll('.group')].at(-1).getBoundingClientRect();return {x:box.x/(innerWidth-box.width),y:box.y/(innerHeight-box.height)};})()`));
    if (Math.abs(normalized[0].x - normalized[1].x) > .04 || Math.abs(normalized[0].y - normalized[1].y) > .04) throw Error('Normalized drag did not reach peer: '+JSON.stringify(normalized));
    await guest.webContents.executeJavaScript(`document.querySelector('.connection-panel .primary-button').click()`);
    await until(host, `!!document.querySelector('.room-request')`);
    await host.webContents.executeJavaScript(`document.querySelector('.connection-panel .primary-button').click()`);
    await until(guest, `document.querySelector('.room-presence')?.textContent.includes('You have control')`);
    await until(host, `document.querySelector('.room-presence')?.textContent.includes('Your friend has control')`);
    await guest.webContents.executeJavaScript(`document.querySelectorAll('.care-tabs button')[0].click()`);
    await guest.webContents.executeJavaScript(`document.querySelector('.care-actions button').click()`);
    await until(host, `document.querySelector('.stage-caption')?.textContent.includes('Berry break')`);
    await host.webContents.executeJavaScript(`document.querySelectorAll('.care-tabs button')[0].click()`);
    if (!await host.webContents.executeJavaScript(`document.querySelector('.care-actions button').disabled`)) throw Error('Viewer care controls should be disabled');
    const image = await guest.webContents.capturePage();
    fs.mkdirSync(path.join(__dirname, '../.desktop-smoke'), { recursive: true });
    fs.writeFileSync(path.join(__dirname, '../.desktop-smoke/connected-peers.png'), image.toPNG());
    if (failures.length) throw Error(failures.join('\n'));
    console.log('PASS: two isolated website clients create/join, drag across different viewport sizes, request/pass control, share feeding, and disable viewer actions');
    for (const win of windows) win.destroy();
    await service.close(); assets.close(); app.exit(0);
  } catch (error) {
    console.error(error);
    for (const win of windows) if (!win.isDestroyed()) win.destroy();
    if (service) await service.close(); if (assets) assets.close(); app.exit(1);
  }
});
setTimeout(() => { console.error('Connection UI review timed out'); app.exit(1); }, 40000).unref();
