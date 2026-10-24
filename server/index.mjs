import http from 'node:http';
import { randomInt, randomUUID } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { WebSocketServer, WebSocket } from 'ws';

const states = new Set(['idle','walking-left','walking-right','happy','eating','playing','bathing','sleeping']);
export function cleanSnapshot(value) {
  if (!value || typeof value !== 'object') return null;
  const result = {};
  for (const [key, min, max] of [['x',0,1],['y',0,1],['petSize',80,220],['hunger',0,100],['happiness',0,100],['energy',0,100],['cleanliness',0,100],['health',0,100]]) {
    if (typeof value[key] !== 'number' || !Number.isFinite(value[key]) || value[key] < min || value[key] > max) return null;
    result[key] = value[key];
  }
  if (!states.has(value.currentState) || !['left','right'].includes(value.direction)) return null;
  return { ...result, currentState: value.currentState, direction: value.direction };
}

export function createRoomServer({ port = Number(process.env.PORT || 8787), host = process.env.HOST || '127.0.0.1', lifetime = 2 * 60 * 60 * 1000 } = {}) {
  const rooms = new Map();
  const server = http.createServer((request, response) => {
    response.setHeader('Cache-Control', 'no-store');
    if (request.url === '/health') { response.writeHead(200, { 'Content-Type': 'application/json' }); response.end('{"ok":true}'); }
    else { response.writeHead(404); response.end('Not found'); }
  });
  const wss = new WebSocketServer({ server, path: '/rooms', maxPayload: 4096, perMessageDeflate: false });
  const send = (socket, value) => { if (socket.readyState === WebSocket.OPEN && socket.bufferedAmount < 65536) socket.send(JSON.stringify(value)); };
  const error = (socket, text) => send(socket, { type: 'error', message: text });
  const broadcast = room => {
    for (const socket of room.members.values()) send(socket, { type: 'room', code: room.code, controllerId: room.controllerId, participants: [...room.members.keys()], requesterId: room.requesterId, expiresAt: room.expiresAt, snapshot: room.snapshot, sequence: room.sequence });
  };
  function leave(socket) {
    const room = rooms.get(socket.roomCode);
    socket.roomCode = undefined;
    if (!room) return;
    room.members.delete(socket.peerId);
    if (!room.members.size) { rooms.delete(room.code); return; }
    if (room.controllerId === socket.peerId) { room.controllerId = room.members.keys().next().value; room.requesterId = null; }
    if (room.requesterId === socket.peerId) room.requesterId = null;
    broadcast(room);
  }
  function expire(room) {
    rooms.delete(room.code);
    for (const socket of room.members.values()) { socket.roomCode = undefined; send(socket, { type: 'ended', message: 'This room expired. Create a new code to reconnect.' }); }
  }
  wss.on('connection', (socket, request) => {
    // Rooms use random capability codes, never cookies or browser credentials.
    if (wss.clients.size > 500) { socket.close(1013, 'Server busy'); return; }
    const origins = process.env.ALLOWED_ORIGINS?.split(',');
    if (origins && !origins.includes(request.headers.origin || 'null')) { socket.close(1008, 'Origin not allowed'); return; }
    socket.peerId = randomUUID(); socket.alive = true;
    let rateStart = Date.now(), rateCount = 0;
    send(socket, { type: 'welcome', id: socket.peerId });
    socket.on('pong', () => { socket.alive = true; });
    socket.on('error', () => {});
    socket.on('message', (bytes, binary) => {
      if (binary) { socket.close(1003, 'Text messages only'); return; }
      if (Date.now() - rateStart >= 1000) { rateStart = Date.now(); rateCount = 0; }
      if (++rateCount > 40) { socket.close(1008, 'Too many messages'); return; }
      let message;
      try { message = JSON.parse(bytes.toString()); } catch { error(socket, 'Invalid message.'); return; }
      if (!message || typeof message.type !== 'string') { error(socket, 'Invalid message.'); return; }
      if (message.type === 'ping') { send(socket, { type: 'pong' }); return; }
      if (message.type === 'leave') { leave(socket); send(socket, { type: 'ended', message: '' }); return; }
      if (message.type === 'create') {
        if (socket.roomCode) { error(socket, 'Leave your current room first.'); return; }
        if (rooms.size >= 1000) { error(socket, 'Room service is busy. Try later.'); return; }
        const snapshot = cleanSnapshot(message.snapshot);
        if (!snapshot) { error(socket, 'Invalid pet state.'); return; }
        const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code;
        do { code = Array.from({ length: 10 }, () => alphabet[randomInt(alphabet.length)]).join(''); } while (rooms.has(code));
        const room = { code, members: new Map([[socket.peerId, socket]]), controllerId: socket.peerId, requesterId: null, expiresAt: Date.now() + lifetime, snapshot, sequence: 0 };
        rooms.set(code, room); socket.roomCode = code; broadcast(room); return;
      }
      if (message.type === 'join') {
        if (socket.roomCode) { error(socket, 'Leave your current room first.'); return; }
        if (typeof message.code !== 'string' || !/^[A-Z2-9]{10}$/.test(message.code)) { error(socket, 'Enter a valid room code.'); return; }
        const room = rooms.get(message.code);
        if (!room || room.expiresAt <= Date.now()) { error(socket, 'Room not found or expired.'); return; }
        if (room.members.size >= 2) { error(socket, 'This room already has two people.'); return; }
        room.members.set(socket.peerId, socket); socket.roomCode = room.code; broadcast(room); return;
      }
      const room = rooms.get(socket.roomCode);
      if (!room) { error(socket, 'Create or join a room first.'); return; }
      if (room.expiresAt <= Date.now()) { expire(room); return; }
      if (message.type === 'request-control') {
        if (room.controllerId !== socket.peerId) { room.requesterId = socket.peerId; broadcast(room); }
      } else if (message.type === 'pass-control') {
        if (room.controllerId !== socket.peerId) { error(socket, 'Only the controller can pass control.'); return; }
        const next = [...room.members.keys()].find(id => id !== socket.peerId);
        if (next) { room.controllerId = next; room.requesterId = null; broadcast(room); }
      } else if (message.type === 'snapshot') {
        if (room.controllerId !== socket.peerId) { error(socket, 'Your friend currently has control.'); return; }
        const snapshot = cleanSnapshot(message.snapshot);
        if (!snapshot) { error(socket, 'Invalid pet state.'); return; }
        room.snapshot = snapshot; room.sequence++;
        for (const member of room.members.values()) send(member, { type: 'snapshot', snapshot, sequence: room.sequence });
      } else error(socket, 'Unknown message.');
    });
    socket.on('close', () => leave(socket));
  });
  const heartbeat = setInterval(() => {
    for (const room of rooms.values()) if (Date.now() >= room.expiresAt) expire(room);
    for (const socket of wss.clients) { if (!socket.alive) socket.terminate(); else { socket.alive = false; socket.ping(); } }
  }, 20000);
  heartbeat.unref();
  const ready = new Promise(resolve => server.listen(port, host, () => resolve(server.address())));
  const close = async () => { clearInterval(heartbeat); for (const socket of wss.clients) socket.terminate(); await new Promise(resolve => wss.close(resolve)); await new Promise(resolve => server.close(resolve)); };
  return { server, ready, close };
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const service = createRoomServer();
  service.ready.then(address => console.log(`Sprout room service listening on ${address.address}:${address.port}; WebSocket path /rooms`));
  for (const signal of ['SIGINT','SIGTERM']) process.on(signal, () => { void service.close().then(() => process.exit(0)); });
}
