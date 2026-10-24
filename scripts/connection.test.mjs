import { test } from 'node:test';
import assert from 'node:assert/strict';
import WebSocket from 'ws';
import { build } from 'esbuild';
import { createRoomServer, cleanSnapshot } from '../server/index.mjs';

const initial = { x: .2, y: .4, petSize: 140, currentState: 'idle', direction: 'right', hunger: 80, happiness: 90, energy: 60, cleanliness: 70, health: 85 };
function peer(url) {
  const socket = new WebSocket(url), messages = [], waiting = [];
  socket.on('message', bytes => {
    const message = JSON.parse(String(bytes));
    const index = waiting.findIndex(waiter => waiter.match(message));
    if (index >= 0) { const [waiter] = waiting.splice(index, 1); clearTimeout(waiter.timer); waiter.resolve(message); }
    else messages.push(message);
  });
  return {
    socket,
    send: value => socket.send(JSON.stringify(value)),
    next: match => {
      const index = messages.findIndex(match);
      if (index >= 0) return Promise.resolve(messages.splice(index, 1)[0]);
      return new Promise((resolve, reject) => { const waiter = { match, resolve, timer: setTimeout(() => reject(Error('Message timed out')), 3000) }; waiting.push(waiter); });
    },
  };
}
test('two-device rooms enforce control, relay pet state, hand off, recover on leave, and reject a third peer', async () => {
  const service = createRoomServer({ port: 0 });
  const address = await service.ready;
  const url = `ws://127.0.0.1:${address.port}/rooms`;
  const host = peer(url), guest = peer(url), third = peer(url);
  try {
    const a = await host.next(message => message.type === 'welcome');
    const b = await guest.next(message => message.type === 'welcome');
    await third.next(message => message.type === 'welcome');
    host.send({ type: 'create', snapshot: { ...initial, focusTopic: 'private', screen: 'not shared' } });
    const created = await host.next(message => message.type === 'room');
    assert.match(created.code, /^[A-Z2-9]{10}$/);
    assert.equal(created.controllerId, a.id);
    assert.equal(created.snapshot.focusTopic, undefined);
    guest.send({ type: 'join', code: 'AAAAAAAAAA' });
    assert.match((await guest.next(message => message.type === 'error')).message, /not found/);
    guest.send({ type: 'join', code: created.code });
    const joined = await guest.next(message => message.type === 'room');
    assert.equal(joined.participants.length, 2);
    await host.next(message => message.type === 'room' && message.participants.length === 2);
    third.send({ type: 'join', code: created.code });
    assert.match((await third.next(message => message.type === 'error')).message, /two people/);
    guest.send({ type: 'snapshot', snapshot: { ...initial, x: .9 } });
    assert.match((await guest.next(message => message.type === 'error')).message, /friend currently/);
    host.send({ type: 'snapshot', snapshot: { ...initial, x: .9, currentState: 'playing' } });
    assert.equal((await guest.next(message => message.type === 'snapshot')).snapshot.x, .9);
    guest.send({ type: 'request-control' });
    assert.equal((await host.next(message => message.type === 'room' && !!message.requesterId)).requesterId, b.id);
    guest.send({ type: 'pass-control' });
    assert.match((await guest.next(message => message.type === 'error')).message, /Only the controller/);
    host.send({ type: 'pass-control' });
    assert.equal((await guest.next(message => message.type === 'room' && message.controllerId === b.id)).controllerId, b.id);
    await host.next(message => message.type === 'room' && message.controllerId === b.id);
    host.send({ type: 'snapshot', snapshot: initial });
    assert.match((await host.next(message => message.type === 'error')).message, /friend currently/);
    guest.send({ type: 'snapshot', snapshot: { ...initial, x: .1, currentState: 'eating' } });
    assert.equal((await host.next(message => message.type === 'snapshot' && message.snapshot.currentState === 'eating')).snapshot.x, .1);
    guest.send({ type: 'leave' });
    assert.equal((await host.next(message => message.type === 'room' && message.participants.length === 1)).controllerId, a.id);
    host.send({ type: 'leave' });
    await host.next(message => message.type === 'ended');
    third.send({ type: 'join', code: created.code });
    assert.match((await third.next(message => message.type === 'error')).message, /not found/);
  } finally { host.socket.terminate(); guest.socket.terminate(); third.socket.terminate(); await service.close(); }
});

test('snapshot validation rejects non-finite coordinates, extra privileges, and invalid actions', () => {
  assert.equal(cleanSnapshot({ ...initial, x: 2 }), null);
  assert.equal(cleanSnapshot({ ...initial, energy: NaN }), null);
  assert.equal(cleanSnapshot({ ...initial, currentState: 'execute' }), null);
  assert.equal(cleanSnapshot({ ...initial, clipboard: 'private' }).clipboard, undefined);
});

test('actual room clients connect, normalize pasted codes, receive movements and hand off control', async () => {
  const output = await build({ entryPoints: ['src/connection/roomClient.ts'], bundle: true, platform: 'node', format: 'esm', write: false });
  const { RoomClient, roomUrl } = await import(`data:text/javascript;base64,${Buffer.from(output.outputFiles[0].text).toString('base64')}`);
  assert.throws(() => roomUrl('ws://public.example/rooms'), /secure/);
  assert.throws(() => roomUrl('wss://user:secret@example.com/rooms'), /credentials/);
  const service = createRoomServer({ port: 0 });
  const address = await service.ready, url = `ws://127.0.0.1:${address.port}`;
  const host = new RoomClient(() => {}, value => new WebSocket(value));
  const guest = new RoomClient(() => {}, value => new WebSocket(value));
  const until = async predicate => { const end = Date.now() + 3000; while (!predicate()) { if (Date.now() > end) throw Error('Client timed out'); await new Promise(resolve => setTimeout(resolve, 10)); } };
  try {
    host.command({ type: 'create', url, snapshot: initial });
    await until(() => host.view.code);
    guest.command({ type: 'join', url, code: host.view.code.slice(0,5).toLowerCase() + '–' + host.view.code.slice(5) });
    await until(() => guest.view.status === 'connected');
    host.publish({ ...initial, x: .75 });
    await until(() => guest.view.snapshot.x === .75);
    host.command({ type: 'pass-control' });
    await until(() => guest.view.controllerId === guest.view.id);
    guest.publish({ ...initial, y: .8 });
    await until(() => host.view.snapshot.y === .8);
    guest.disconnect();
    await until(() => host.view.controllerId === host.view.id);
  } finally { host.disconnect(); guest.disconnect(); await service.close(); }
});

test('expired room codes stop accepting state and end the session', async () => {
  const service = createRoomServer({ port: 0, lifetime: 20 });
  const address = await service.ready, host = peer(`ws://127.0.0.1:${address.port}/rooms`);
  try {
    await host.next(message => message.type === 'welcome');
    host.send({ type: 'create', snapshot: initial });
    await host.next(message => message.type === 'room');
    await new Promise(resolve => setTimeout(resolve, 30));
    host.send({ type: 'snapshot', snapshot: initial });
    assert.match((await host.next(message => message.type === 'ended')).message, /expired/);
  } finally { host.socket.terminate(); await service.close(); }
});
