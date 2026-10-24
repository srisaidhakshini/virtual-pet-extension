import React, { useEffect, useState } from 'react';
import { Copy, Link, LogOut, ArrowLeftRight } from 'lucide-react';
import { roomCommand, startRoomTransport, useRoomStore } from './transport';
import { petSnapshot } from './RoomRuntime';

export function ConnectPanel() {
  const room = useRoomStore();
  const [url, setUrl] = useState(() => localStorage.getItem('sprout-room-service') || import.meta.env.VITE_ROOM_SERVICE_URL || '');
  const [code, setCode] = useState('');
  const [copied, setCopied] = useState(false);
  useEffect(startRoomTransport, []);
  const connect = (type: 'create' | 'join') => {
    localStorage.setItem('sprout-room-service', url.trim());
    roomCommand({ type, url: url.trim(), code, snapshot: petSnapshot() });
  };
  const mine = room.id === room.controllerId;
  return <section className="connection-panel" aria-label="Connect with a friend">
    <h2>A little company, together</h2>
    <p>Share one pet with a friend on Mac or Windows. You both see its movements and actions; one person controls it at a time.</p>
    {room.status === 'connected' ? <>
      <div className="room-code"><span>Room code</span><strong>{room.code.slice(0,5)}–{room.code.slice(5)}</strong><button aria-label="Copy room code" onClick={() => { void navigator.clipboard.writeText(room.code).then(() => setCopied(true)).catch(() => setCopied(false)); }}><Copy size={15} />{copied ? 'Copied' : 'Copy'}</button></div>
      <p className="room-presence" role="status">{room.participants.length === 2 ? 'Your friend is connected.' : 'Waiting for your friend to join.'} {mine ? 'You have control.' : 'Your friend has control.'}</p>
      {room.requesterId && mine && <p className="room-request">Your friend would like control. Pass it over when you’re ready.</p>}
      <button className="primary-button" disabled={room.participants.length < 2 || (!mine && room.requesterId === room.id)} onClick={() => roomCommand({ type: mine ? 'pass-control' : 'request-control' })}><ArrowLeftRight size={15} />{mine ? 'Pass control to friend' : room.requesterId === room.id ? 'Control requested' : 'Request control'}</button>
      <button className="secondary-button" onClick={() => roomCommand({ type: 'leave' })}><LogOut size={14} />Leave room</button>
      <p className="connection-note">Only pet position, size, animation, and care stats are shared. Screen contents, check-ins, and your focus topic stay private. Rooms expire after two hours.</p>
    </> : <>
      <details className="room-service" open={!url}><summary>Connection service</summary><label>Service address<input aria-label="Connection service address" placeholder="wss://your-service.example/rooms" value={url} onChange={event => setUrl(event.target.value)} /></label><p>Both people use the same service address. A room code works only while the service is online.</p></details>
      <button className="primary-button" disabled={!url.trim() || room.status === 'connecting'} onClick={() => connect('create')}><Link size={15} />{room.status === 'connecting' ? 'Connecting…' : 'Create room'}</button>
      <div className="room-join"><label htmlFor="friend-code">Or join your friend</label><input id="friend-code" autoComplete="off" spellCheck={false} placeholder="Enter room code" maxLength={15} value={code} onChange={event => setCode(event.target.value.toUpperCase())} /><button className="secondary-button" disabled={code.replace(/[\s–-]/g,'').length !== 10 || !url.trim() || room.status === 'connecting'} onClick={() => connect('join')}>Join with code</button></div>
      {room.status === 'connecting' && <p role="status">The service may take about a minute to wake up on its first connection.</p>}
      {room.status === 'connecting' && <button className="text-button" onClick={() => roomCommand({ type: 'leave' })}>Cancel connection</button>}
    </>}
    {room.error && <p role="alert" className="connection-error">{room.error}</p>}
  </section>;
}
