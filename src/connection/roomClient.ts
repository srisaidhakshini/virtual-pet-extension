export type Snapshot = {
  x: number; y: number; petSize: number; hunger: number; happiness: number;
  energy: number; cleanliness: number; health: number; direction: 'left' | 'right';
  currentState: 'idle' | 'walking-left' | 'walking-right' | 'happy' | 'eating' | 'playing' | 'bathing' | 'sleeping';
};
export type RoomView = { status: 'offline' | 'connecting' | 'connected'; id: string; code: string; controllerId: string; participants: string[]; requesterId: string | null; expiresAt: number; snapshot: Snapshot | null; error: string };
export const offlineRoom = (): RoomView => ({ status: 'offline', id: '', code: '', controllerId: '', participants: [], requesterId: null, expiresAt: 0, snapshot: null, error: '' });
export type RoomCommand = { type: 'create' | 'join' | 'leave' | 'request-control' | 'pass-control'; url?: string; code?: string; snapshot?: Snapshot };

function validSnapshot(value: Snapshot): boolean {
  if (!value || typeof value !== 'object') return false;
  for (const key of ['x','y'] as const) if (!Number.isFinite(value[key]) || value[key] < 0 || value[key] > 1) return false;
  for (const key of ['hunger','happiness','energy','cleanliness','health'] as const) if (!Number.isFinite(value[key]) || value[key] < 0 || value[key] > 100) return false;
  return Number.isFinite(value.petSize) && value.petSize >= 80 && value.petSize <= 220 && ['left','right'].includes(value.direction) && ['idle','walking-left','walking-right','happy','eating','playing','bathing','sleeping'].includes(value.currentState);
}

export function roomUrl(value: string): string {
  const url = new URL(value);
  const local = ['localhost','127.0.0.1','[::1]'].includes(url.hostname);
  if (url.protocol !== 'wss:' && !(local && url.protocol === 'ws:')) throw new Error('Use a secure wss:// service URL (ws://localhost is allowed for testing).');
  if (url.username || url.password || url.search || url.hash) throw new Error('Use a service URL without credentials, query parameters, or fragments.');
  if (url.pathname === '/') url.pathname = '/rooms';
  return url.href;
}
export class RoomClient {
  view = offlineRoom();
  socket: WebSocket | null = null;
  private heartbeat: ReturnType<typeof setInterval> | undefined;
  private timeout: ReturnType<typeof setTimeout> | undefined;
  constructor(private notify: (view: RoomView) => void, private makeSocket: (url: string) => WebSocket = url => new WebSocket(url)) {}
  private emit(patch: Partial<RoomView>) { this.view = { ...this.view, ...patch }; this.notify(this.view); }
  command(command: RoomCommand) {
    if (command.type === 'leave') { this.disconnect(); return; }
    if (command.type === 'create' || command.type === 'join') {
      if (this.view.code) { this.emit({ error: 'Leave your current room first.' }); return; }
      let url;
      try { url = roomUrl(command.url || ''); } catch (error) { this.emit({ error: String((error as Error).message) }); return; }
      this.disconnect(); this.emit({ status: 'connecting', error: '' });
      let socket: WebSocket;
      try { socket = this.makeSocket(url); } catch { this.emit({ status: 'offline', error: 'Could not open the connection service.' }); return; }
      this.socket = socket;
      this.timeout = setTimeout(() => { if (this.socket === socket && !this.view.code) { this.disconnect(); this.emit({ error: 'Connection timed out. Check the service URL.' }); } }, 90000);
      socket.onopen = () => {
        if (this.socket !== socket) return;
        socket.send(JSON.stringify({ ...command, url: undefined, code: command.code?.toUpperCase().replace(/[^A-Z2-9]/g, '') }));
        this.heartbeat = setInterval(() => { if (socket.readyState === 1) socket.send('{"type":"ping"}'); }, 20000);
      };
      socket.onmessage = event => {
        if (this.socket !== socket) return;
        const data = String(event.data);
        if (data.length > 8192) { this.disconnect(); this.emit({ error: 'Invalid response from connection service.' }); return; }
        let message; try { message = JSON.parse(data); } catch { return; }
        if (!message || typeof message !== 'object') return;
        if (message.type === 'welcome' && typeof message.id === 'string' && message.id.length <= 64) this.emit({ id: message.id });
        if (message.type === 'room') {
          if (!validSnapshot(message.snapshot) || !/^[A-Z2-9]{10}$/.test(message.code) || !Array.isArray(message.participants) || message.participants.length > 2 || !message.participants.includes(this.view.id) || !message.participants.includes(message.controllerId) || !message.participants.every((id: unknown) => typeof id === 'string' && id.length <= 64)) return;
          clearTimeout(this.timeout); this.emit({ status: 'connected', code: message.code, controllerId: message.controllerId, participants: message.participants, requesterId: message.requesterId, expiresAt: message.expiresAt, snapshot: message.snapshot, error: '' });
        }
        if (message.type === 'snapshot' && this.view.code && validSnapshot(message.snapshot)) this.emit({ snapshot: message.snapshot });
        if (message.type === 'error' && typeof message.message === 'string') { clearTimeout(this.timeout); if (!this.view.code) this.disconnect(); this.emit({ error: message.message.slice(0, 200) }); }
        if (message.type === 'ended') { this.disconnect(); if (message.message) this.emit({ error: message.message }); }
      };
      socket.onerror = () => { if (this.socket === socket) this.emit({ error: 'Connection failed. Check that the room service is running and reachable.' }); };
      socket.onclose = () => { if (this.socket === socket) { this.disconnect(); this.emit({ error: 'Connection closed. Create or join a room again.' }); } };
    } else if (this.socket?.readyState === 1) this.socket.send(JSON.stringify(command));
  }
  publish(snapshot: Snapshot) {
    if (this.view.code && this.view.controllerId === this.view.id && this.socket?.readyState === 1 && this.socket.bufferedAmount < 16384) this.socket.send(JSON.stringify({ type: 'snapshot', snapshot }));
  }
  disconnect() {
    clearInterval(this.heartbeat); clearTimeout(this.timeout);
    const socket = this.socket; this.socket = null;
    if (socket) { socket.onclose = null; socket.onerror = null; socket.close(); }
    this.view = offlineRoom(); this.notify(this.view);
  }
}
