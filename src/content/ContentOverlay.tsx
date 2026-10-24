import { RoomRuntime } from '../connection/RoomRuntime';
import { canControlPet } from '../connection/guard';
import React, { useEffect, useState, useRef } from 'react';
import { usePetStore } from '../pet/petState';
import { CheckIns } from '../companion/CheckIns';
import { Pet } from '../components/Pet/Pet';
import { PetInteractionMenu } from '../components/PetMenu/PetInteractionMenu';
import { PetControlPanel } from '../components/SidePanel/PetControlPanel';
import { Apple, Eye, Zap, Droplets, Footprints, X, PanelRightOpen } from 'lucide-react';

export const ContentOverlay: React.FC<{ withCheckIns?: boolean; withRoomRuntime?: boolean }> = ({ withCheckIns = true, withRoomRuntime = true }) => {
  const {
    petSize,
    petType,
    happiness,
    currentState,
    setState,
    direction,
    setDirection,
    overlayVisible,
    position,
    setPosition,
    isAutoWalkEnabled,
    toggleAutoWalk,
    addStepsWalked,
    initFromStorage,
  } = usePetStore();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  
  const pageCountedRef = useRef(false);
  const petRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const draggedRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  
  // Auto-walking state refs
  const targetPosRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    void initFromStorage().then(() => {
      if (pageCountedRef.current) return;
      pageCountedRef.current = true;
      const pet = usePetStore.getState();
      usePetStore.setState({ journal: { ...pet.journal, pagesVisited: pet.journal.pagesVisited + 1 } });
      pet.setPosition(pet.position);
    });
  }, [initFromStorage]);

  // Message listener from extension popup or background worker
  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.runtime?.onMessage) {
      const handleMessage = (msg: any) => {
        if (msg.type === 'FOCUS_PET' && petRef.current) {
          usePetStore.getState().setPosition({ x: Math.max(0, window.innerWidth / 2 - 55), y: Math.max(35, window.innerHeight / 2 - 55) });
          petRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      };
      chrome.runtime.onMessage.addListener(handleMessage);
      return () => chrome.runtime.onMessage.removeListener(handleMessage);
    }
  }, []);

  // Read live store values inside one animation loop, independent of React renders.
  useEffect(() => {
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    let previous = 0;
    let nextWalkAt = performance.now() + 2200;
    let distanceWalked = 0;
    const tick = (now: number) => {
      const dt = Math.min((now - (previous || now)) / 1000, 0.05);
      previous = now;
      const pet = usePetStore.getState();
      if (!canControlPet()) { targetPosRef.current = null; frame = requestAnimationFrame(tick); return; }
      const busy = !['idle', 'happy', 'walking-left', 'walking-right'].includes(pet.currentState);
      const paused = !pet.overlayVisible || !pet.isAutoWalkEnabled || isDraggingRef.current || isMenuOpen || isSidePanelOpen || document.hidden || motionPreference.matches;
      if (busy || paused) {
        targetPosRef.current = null;
        nextWalkAt = now + 1800;
        if (pet.currentState.startsWith('walking')) pet.setState('idle');
      } else {
        const maxX = Math.max(0, window.innerWidth - pet.petSize - 12);
        const maxY = Math.max(0, window.innerHeight - pet.petSize - 12);
        const x = Math.max(0, Math.min(maxX, pet.position.x));
        const y = Math.max(35, Math.min(Math.max(35, maxY), pet.position.y));
        if (x !== pet.position.x || y !== pet.position.y) pet.setPosition({ x, y });
        if (!targetPosRef.current && now >= nextWalkAt) {
          targetPosRef.current = { x: Math.random() * maxX, y: 35 + Math.random() * Math.max(0, maxY - 35) };
        }
        const target = targetPosRef.current;
        if (target) {
          const dx = target.x - x, dy = target.y - y;
          const distance = Math.hypot(dx, dy);
          const step = Math.min(distance, 75 * dt);
          if (distance < 2) {
            targetPosRef.current = null;
            pet.setState('idle');
            nextWalkAt = now + 2000 + Math.random() * 3500;
          } else {
            const facing = dx < 0 ? 'left' : 'right';
            if (pet.direction !== facing) pet.setDirection(facing);
            const gait = facing === 'left' ? 'walking-left' : 'walking-right';
            if (pet.currentState !== gait) pet.setState(gait);
            pet.setPosition({ x: x + dx / distance * step, y: y + dy / distance * step });
            distanceWalked += step;
            if (distanceWalked >= 20) { pet.addStepsWalked(1); distanceWalked -= 20; }
          }
        }
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [isMenuOpen, isSidePanelOpen]);

  useEffect(() => {
    const clamp = () => {
      const pet = usePetStore.getState();
      const next = { x: Math.max(0, Math.min(Math.max(0, innerWidth - petSize), pet.position.x)), y: Math.max(0, Math.min(Math.max(0, innerHeight - petSize), pet.position.y)) };
      if (next.x !== pet.position.x || next.y !== pet.position.y) pet.setPosition(next);
    };
    clamp(); window.addEventListener('resize', clamp);
    return () => window.removeEventListener('resize', clamp);
  }, [petSize]);

  if (!overlayVisible) return null;

  // Handle Dragging pet around the webpage smoothly
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!canControlPet() || e.button !== 0) return; // Only left click
    isDraggingRef.current = true;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    draggedRef.current = false;
    targetPosRef.current = null; // Pause auto walk destination when user grabs pet

    dragOffsetRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };

    const handleMouseMove = (moveEv: MouseEvent) => {
      if (Math.hypot(moveEv.clientX - dragStartRef.current.x, moveEv.clientY - dragStartRef.current.y) > 5) draggedRef.current = true;
      const newX = Math.max(20, Math.min(window.innerWidth - petSize - 12, moveEv.clientX - dragOffsetRef.current.x));
      const newY = Math.max(20, Math.min(window.innerHeight - petSize - 12, moveEv.clientY - dragOffsetRef.current.y));
      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      isDraggingRef.current = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handlePetClick = (e: React.MouseEvent) => {
    if (draggedRef.current) return;
    if (petRef.current) {
      setAnchorRect(petRef.current.getBoundingClientRect());
    }
    setIsMenuOpen(true);
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-[999999] overflow-hidden font-sans">
      {withRoomRuntime && <RoomRuntime movement />}
      {withCheckIns && <CheckIns webpage />}
      {/* Floating Pet on Webpage */}
      <div
        ref={petRef}
        onMouseDown={handleMouseDown}
        style={{
          position: 'fixed',
          left: `${position.x}px`,
          top: `${position.y}px`,
          pointerEvents: 'auto',
          cursor: 'grab',
        }}
        className="active:cursor-grabbing transition-transform duration-75"
      >
        <Pet
          petType={petType}
          state={currentState}
          direction={direction}
          size={petSize}
          onClick={handlePetClick}
        />
      </div>

      {/* Pet Interaction Menu near Pet */}
      <PetInteractionMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        anchorRect={anchorRect}
      />

      <div className="fixed bottom-5 right-5 pointer-events-auto flex items-center gap-2 bg-white/95 px-2 py-2 rounded-full border border-cozy-border-light shadow-sm">
        <button onClick={toggleAutoWalk} className="flex items-center gap-2 px-3 py-2 text-xs text-cozy-text rounded-full hover:bg-cozy-pink-light" aria-pressed={isAutoWalkEnabled}>
          <Footprints size={14} />{isAutoWalkEnabled ? 'Pause wandering' : 'Resume wandering'}
        </button>
        <button onClick={() => setIsSidePanelOpen(true)} className="px-3 py-2 rounded-full bg-cozy-pink-light text-cozy-text text-xs" aria-label="Open care and companion">Care</button>
      </div>

      {/* Sliding Side Control Panel Drawer */}
      {isSidePanelOpen && (
        <div className="fixed inset-y-0 right-0 w-[380px] max-w-full bg-cozy-pink-light shadow-2xl border-l-2 border-cozy pointer-events-auto z-[9999999] overflow-y-auto animate-in slide-in-from-right duration-200">
          <div className="sticky top-0 bg-white border-b border-cozy-border-light p-2 flex justify-end z-40">
            <button
              onClick={() => setIsSidePanelOpen(false)}
              className="p-1.5 rounded-full bg-cozy-pink-light hover:bg-cozy-pink text-cozy-text hover:text-white transition-colors border border-cozy"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <PetControlPanel />
        </div>
      )}
    </div>
  );
};

