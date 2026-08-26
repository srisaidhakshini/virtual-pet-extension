import React, { useEffect, useState, useRef } from 'react';
import { usePetStore } from '../pet/petState';
import { Pet } from '../components/Pet/Pet';
import { PetInteractionMenu } from '../components/PetMenu/PetInteractionMenu';
import { PetControlPanel } from '../components/SidePanel/PetControlPanel';
import { Apple, Eye, Zap, Droplets, Footprints, X, PanelRightOpen, Play, Pause } from 'lucide-react';

interface Footprint {
  id: number;
  x: number;
  y: number;
  opacity: number;
}

export const ContentOverlay: React.FC = () => {
  const {
    name,
    petType,
    happiness,
    currentState,
    setState,
    direction,
    setDirection,
    equippedAccessories,
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
  const [footprints, setFootprints] = useState<Footprint[]>([]);
  
  const petRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  
  // Auto-walking state refs
  const targetPosRef = useRef<{ x: number; y: number } | null>(null);
  const isWaitingNextWalkRef = useRef(false);
  const lastFootprintTimeRef = useRef(0);

  useEffect(() => {
    initFromStorage();
  }, [initFromStorage]);

  // Message listener from extension popup or background worker
  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.runtime?.onMessage) {
      const handleMessage = (msg: any) => {
        if (msg.type === 'FOCUS_PET' && petRef.current) {
          petRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      };
      chrome.runtime.onMessage.addListener(handleMessage);
      return () => chrome.runtime.onMessage.removeListener(handleMessage);
    }
  }, []);

  // Autonomous Screen Walking Engine
  useEffect(() => {
    if (!overlayVisible || !isAutoWalkEnabled) return;

    // Do not walk if performing an active non-walking action (sleeping, eating, bathing, playing)
    const isBusy = currentState === 'sleeping' || currentState === 'eating' || currentState === 'bathing' || currentState === 'playing';
    if (isBusy || isDraggingRef.current) {
      targetPosRef.current = null;
      return;
    }

    let animationFrameId: number;

    const pickNewTarget = () => {
      if (isWaitingNextWalkRef.current || isDraggingRef.current) return;

      const padding = 80;
      const maxX = Math.max(padding, window.innerWidth - 160);
      const maxY = Math.max(padding, window.innerHeight - 160);

      const targetX = Math.floor(Math.random() * (maxX - padding)) + padding;
      const targetY = Math.floor(Math.random() * (maxY - padding)) + padding;

      targetPosRef.current = { x: targetX, y: targetY };

      const newDir = targetX < position.x ? 'left' : 'right';
      setDirection(newDir);
      setState(newDir === 'left' ? 'walking-left' : 'walking-right');
    };

    const updateMovement = () => {
      if (!isAutoWalkEnabled || isDraggingRef.current) return;

      // If pet has no target and is currently idle, schedule next walk target
      if (!targetPosRef.current && (currentState === 'idle' || currentState === 'happy')) {
        if (!isWaitingNextWalkRef.current) {
          isWaitingNextWalkRef.current = true;
          const waitTime = Math.floor(Math.random() * 3000) + 2000; // wait 2-5 seconds
          setTimeout(() => {
            isWaitingNextWalkRef.current = false;
            pickNewTarget();
          }, waitTime);
        }
        return;
      }

      if (targetPosRef.current) {
        const target = targetPosRef.current;
        const dx = target.x - position.x;
        const dy = target.y - position.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 6) {
          // Reached destination!
          setPosition(target);
          targetPosRef.current = null;
          setState('idle');
          addStepsWalked(Math.floor(dist));
        } else {
          // Walk step by step
          const speed = 1.6; // comfortable walking speed
          const vx = (dx / dist) * speed;
          const vy = (dy / dist) * speed;

          const nextX = position.x + vx;
          const nextY = position.y + vy;
          const nextDir = dx < 0 ? 'left' : 'right';

          if (direction !== nextDir) {
            setDirection(nextDir);
          }

          const nextAnimState = nextDir === 'left' ? 'walking-left' : 'walking-right';
          if (currentState !== nextAnimState) {
            setState(nextAnimState);
          }

          setPosition({ x: nextX, y: nextY });
          addStepsWalked(1);

          // Add visual footprint trail
          const now = Date.now();
          if (now - lastFootprintTimeRef.current > 350) {
            lastFootprintTimeRef.current = now;
            setFootprints((prev) => [
              ...prev.slice(-8), // Keep maximum 8 footprints
              {
                id: now,
                x: nextX + 40,
                y: nextY + 85,
                opacity: 0.6,
              },
            ]);
          }
        }
      }

      animationFrameId = requestAnimationFrame(updateMovement);
    };

    animationFrameId = requestAnimationFrame(updateMovement);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [
    overlayVisible,
    isAutoWalkEnabled,
    currentState,
    position,
    direction,
    setPosition,
    setDirection,
    setState,
    addStepsWalked,
  ]);

  // Fade out footprint trails
  useEffect(() => {
    if (footprints.length === 0) return;
    const timer = setTimeout(() => {
      setFootprints((prev) =>
        prev
          .map((f) => ({ ...f, opacity: f.opacity - 0.1 }))
          .filter((f) => f.opacity > 0)
      );
    }, 400);
    return () => clearTimeout(timer);
  }, [footprints]);

  if (!overlayVisible) return null;

  // Handle Dragging pet around the webpage smoothly
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left click
    isDraggingRef.current = true;
    targetPosRef.current = null; // Pause auto walk destination when user grabs pet

    dragOffsetRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };

    const handleMouseMove = (moveEv: MouseEvent) => {
      const newX = Math.max(20, Math.min(window.innerWidth - 120, moveEv.clientX - dragOffsetRef.current.x));
      const newY = Math.max(20, Math.min(window.innerHeight - 120, moveEv.clientY - dragOffsetRef.current.y));
      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      // Wait briefly after releasing before resuming auto walk
      setTimeout(() => {
        isDraggingRef.current = false;
      }, 1500);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handlePetClick = (e: React.MouseEvent) => {
    if (petRef.current) {
      setAnchorRect(petRef.current.getBoundingClientRect());
    }
    setIsMenuOpen(true);
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-[999999] overflow-hidden font-sans">
      {/* Soft Dotted Footprint Trails left behind as pet walks */}
      {footprints.map((fp) => (
        <div
          key={fp.id}
          className="fixed pointer-events-none text-cozy-pink transition-opacity duration-500"
          style={{
            left: `${fp.x}px`,
            top: `${fp.y}px`,
            opacity: fp.opacity,
            transform: 'scale(0.8)',
          }}
        >
          <span className="text-xs">🐾</span>
        </div>
      ))}

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
          name={name}
          petType={petType}
          state={currentState}
          equippedAccessories={equippedAccessories}
          size={110}
          onClick={handlePetClick}
        />
      </div>

      {/* Pet Interaction Menu near Pet */}
      <PetInteractionMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        anchorRect={anchorRect}
      />

      {/* Bottom Right Quick Status Bar Pill matching input_file_1.png */}
      <div className="fixed bottom-6 right-6 pointer-events-auto flex items-center space-x-2 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-full border-cozy shadow-cozy-hover transition-all hover:scale-105">
        <div className="w-8 h-8 rounded-full bg-rose-100 border border-cozy flex items-center justify-center text-rose-500" title="Hunger">
          <Apple className="w-4 h-4" />
        </div>
        <div className="w-8 h-8 rounded-full bg-amber-100 border border-cozy flex items-center justify-center text-amber-600" title="Happiness">
          <Eye className="w-4 h-4" />
        </div>
        <div className="w-8 h-8 rounded-full bg-purple-100 border border-cozy flex items-center justify-center text-purple-600" title="Energy">
          <Zap className="w-4 h-4" />
        </div>
        <div className="w-8 h-8 rounded-full bg-emerald-100 border border-cozy flex items-center justify-center text-emerald-600" title="Hygiene">
          <Droplets className="w-4 h-4" />
        </div>
        <span className="font-extrabold text-xs text-cozy-text pl-1 pr-1">
          {happiness}% Happy
        </span>

        {/* Auto Walk Toggle Button */}
        <button
          onClick={toggleAutoWalk}
          className={`flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold transition-all border ${
            isAutoWalkEnabled
              ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
              : 'bg-slate-100 text-slate-500 border-slate-300'
          }`}
          title={isAutoWalkEnabled ? 'Auto-Walking Active (Click to Pause)' : 'Auto-Walking Paused (Click to Walk)'}
        >
          <Footprints className="w-3.5 h-3.5" />
          <span>{isAutoWalkEnabled ? 'Walking' : 'Paused'}</span>
        </button>

        <button
          onClick={() => setIsSidePanelOpen(true)}
          className="ml-1 p-1.5 rounded-full bg-cozy-pink text-white hover:bg-cozy-pink/90 transition-colors shadow-sm"
          title="Open Control Panel"
        >
          <PanelRightOpen className="w-4 h-4" />
        </button>
      </div>

      {/* Sliding Side Control Panel Drawer */}
      {isSidePanelOpen && (
        <div className="fixed inset-y-0 right-0 w-[380px] bg-cozy-pink-light shadow-2xl border-l-2 border-cozy pointer-events-auto z-[9999999] overflow-y-auto animate-in slide-in-from-right duration-200">
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

