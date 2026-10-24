import { useEffect } from 'react';
import { usePetStore } from '../pet/petState';
import { startRoomTransport, useRoomStore, publishRoom } from './transport';
import type { Snapshot } from './roomClient';
import { canControlPet } from './guard';

export function petSnapshot(): Snapshot {
  const state = usePetStore.getState();
  return { x: Math.max(0, Math.min(1, state.position.x / Math.max(1, innerWidth - state.petSize))), y: Math.max(0, Math.min(1, state.position.y / Math.max(1, innerHeight - state.petSize))), currentState: state.currentState, direction: state.direction, petSize: state.petSize, hunger: state.hunger, happiness: state.happiness, energy: state.energy, cleanliness: state.cleanliness, health: state.health };
}
export function RoomRuntime({ movement = false }: { movement?: boolean }) {
  const room = useRoomStore();
  useEffect(startRoomTransport, []);
  useEffect(() => {
    if (!room.code || room.controllerId === room.id || !room.snapshot) return;
    const { x, y, ...state } = room.snapshot;
    usePetStore.setState({ ...state, ...(movement && !window.desktopPet ? { position: { x: x * Math.max(0, innerWidth - state.petSize), y: y * Math.max(0, innerHeight - state.petSize) } } : {}) });
  }, [room.snapshot, room.code, room.controllerId, room.id, movement]);
  useEffect(() => {
    if (movement || window.desktopPet) return;
    return usePetStore.subscribe((state, previous) => {
      const room = useRoomStore.getState();
      if (!room.code || !canControlPet()) return;
      if (['hunger','happiness','energy','cleanliness','health','currentState','petSize'].some(key => state[key as keyof typeof state] !== previous[key as keyof typeof previous])) {
        const snapshot = petSnapshot();
        publishRoom({ ...snapshot, x: room.snapshot?.x ?? snapshot.x, y: room.snapshot?.y ?? snapshot.y });
      }
    });
  }, [movement]);
  useEffect(() => {
    if (!movement || window.desktopPet) return;
    const timer = setInterval(() => {
      if (canControlPet() && document.visibilityState === 'visible' && document.hasFocus()) publishRoom(petSnapshot());
    }, 80);
    return () => clearInterval(timer);
  }, [movement]);
  return null;
}
