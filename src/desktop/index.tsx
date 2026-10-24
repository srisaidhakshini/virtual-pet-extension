import { RoomRuntime } from '../connection/RoomRuntime';
import { canControlPet } from '../connection/guard';
import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { CheckIns } from '../companion/CheckIns';
import { Pet } from '../components/Pet/Pet';
import { usePetStore } from '../pet/petState';
import '../index.css';

function DesktopPet() {
  const pet = usePetStore();
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(preference.matches);
    update(); preference.addEventListener('change', update);
    return () => preference.removeEventListener('change', update);
  }, []);
  const pressedAt = useRef<{ x: number; y: number } | null>(null);
  const hovered = useRef(false);
  useEffect(() => {
    void pet.initFromStorage();
    const bridge = window.desktopPet;
    if (!bridge) return;
    const motion = bridge.onMotion(({ walking, direction }) => {
      const current = usePetStore.getState();
      if (!['idle', 'walking-left', 'walking-right'].includes(current.currentState)) return;
      const state = walking ? (direction === 'left' ? 'walking-left' : 'walking-right') : 'idle';
      if (direction && direction !== current.direction) current.setDirection(direction);
      if (state !== current.currentState) current.setState(state);
    });
    const actions = bridge.onAction(action => {
      const current = usePetStore.getState();
      switch (action) {
        case 'show': if (!current.overlayVisible) current.toggleOverlayVisible(); break;
        case 'feed': current.feed(); break;
        case 'play': current.play(); break;
        case 'sleep': current.sleep(); break;
        case 'pet': current.pet(); break;
        case 'bathe': current.bathe(); break;
        case 'toggleAutoWalk': current.toggleAutoWalk(); break;
      }
    });
    const hitTest = (event: MouseEvent) => {
      const interactive = !!(event.target as Element).closest('[data-pet-interactive]');
      if (interactive !== hovered.current) { hovered.current = interactive; bridge.interactive(interactive); }
    };
    const leave = () => { hovered.current = false; bridge.interactive(false); };
    const stopDrag = () => bridge.drag(false);
    document.addEventListener('mousemove', hitTest);
    document.addEventListener('mouseleave', leave);
    window.addEventListener('blur', stopDrag);
    return () => {
      motion(); actions();
      document.removeEventListener('mousemove', hitTest);
      document.removeEventListener('mouseleave', leave);
      window.removeEventListener('blur', stopDrag);
    };
  }, []);
  useEffect(() => {
    window.desktopPet?.behavior({ currentState: pet.currentState, isAutoWalkEnabled: pet.isAutoWalkEnabled, overlayVisible: pet.overlayVisible, petSize: pet.petSize, reducedMotion });
  }, [pet.currentState, pet.isAutoWalkEnabled, pet.overlayVisible, pet.petSize, reducedMotion]);

  return <div style={{ width: pet.petSize + 24, height: pet.petSize + 44, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 8 }}>
    <RoomRuntime />
    <CheckIns />
    <div data-pet-interactive
      onContextMenu={event => { event.preventDefault(); window.desktopPet?.menu(); }}
      onPointerDown={event => {
        if (!canControlPet() || event.button !== 0) return;
        pressedAt.current = { x: event.screenX, y: event.screenY };
        event.currentTarget.setPointerCapture(event.pointerId);
        window.desktopPet?.drag(true);
      }}
      onPointerUp={event => {
        if (!canControlPet() || event.button !== 0) return;
        window.desktopPet?.drag(false);
        if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
        const start = pressedAt.current;
        pressedAt.current = null;
        if (start && Math.hypot(event.screenX - start.x, event.screenY - start.y) < 6) window.desktopPet?.openRoom();
      }}
      onPointerCancel={() => { pressedAt.current = null; window.desktopPet?.drag(false); }}
      style={{ cursor: 'grab', touchAction: 'none' }}
      role="button" tabIndex={0} aria-label={'Click for room, right-click for care, drag to move'}
      onKeyDown={event => { if (event.key === 'Enter') window.desktopPet?.openRoom(); if (event.key === 'Escape') window.desktopPet?.menu(); }}>
      <Pet petType={pet.petType} state={pet.currentState} direction={pet.direction} size={pet.petSize} />
    </div>
  </div>;
}

createRoot(document.getElementById('desktop-root')!).render(<DesktopPet />);
