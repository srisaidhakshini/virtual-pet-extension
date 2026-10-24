import React, { useEffect, useRef, useState } from 'react';
import { Utensils, Gamepad2, Bath, Moon, Heart, Sparkles, X } from 'lucide-react';
import { usePetStore } from '../../pet/petState';

interface PetInteractionMenuProps {
  isOpen: boolean;
  onClose: () => void;
  anchorRect?: DOMRect | null;
}

export const PetInteractionMenu: React.FC<PetInteractionMenuProps> = ({
  isOpen,
  onClose,
  anchorRect,
}) => {
  const { feed, play, bathe, sleep, pet, currentState } = usePetStore();
  const menuRef = useRef<HTMLDivElement>(null);
  const [positionStyle, setPositionStyle] = useState<React.CSSProperties>({});

  // Viewport edge collision handling
  useEffect(() => {
    if (!isOpen) return;

    const calculatePosition = () => {
      const menuWidth = 220;
      const menuHeight = 260;
      let top = 0;
      let left = 0;

      if (anchorRect) {
        // Place above anchor by default
        top = anchorRect.top - menuHeight - 12;
        left = anchorRect.left + anchorRect.width / 2 - menuWidth / 2;

        // Viewport boundaries check
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // If top extends above viewport, position below pet
        if (top < 10) {
          top = anchorRect.bottom + 12;
        }

        // Clamp left within viewport
        if (left < 10) {
          left = 10;
        } else if (left + menuWidth > viewportWidth - 10) {
          left = viewportWidth - menuWidth - 10;
        }

        // Clamp top within viewport
        if (top + menuHeight > viewportHeight - 10) {
          top = viewportHeight - menuHeight - 10;
        }

        setPositionStyle({
          position: 'fixed',
          top: `${top}px`,
          left: `${left}px`,
          zIndex: 999999,
        });
      } else {
        // Centered fallback
        setPositionStyle({
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 999999,
        });
      }
    };

    calculatePosition();
    window.addEventListener('resize', calculatePosition);
    return () => window.removeEventListener('resize', calculatePosition);
  }, [isOpen, anchorRect]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.composedPath()[0] as Node)) {
        onClose();
      }
    };

    let timer: ReturnType<typeof setTimeout> | undefined;
    if (isOpen) {
      timer = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 50);
    }
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleAction = (actionFn: () => void) => {
    actionFn();
    onClose();
  };

  return (
    <div
      ref={menuRef}
      style={positionStyle}
      className="bg-white/95 backdrop-blur-md w-[220px] p-3 rounded-cozy border-cozy shadow-cozy-hover animate-in fade-in zoom-in-95 duration-150 pointer-events-auto"
    >
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-cozy-border-light">
        <div className="flex items-center space-x-1.5">
          <Sparkles className="w-4 h-4 text-cozy-pink" />
          <span className="text-xs font-bold text-cozy-text tracking-wide">Pet Actions</span>
        </div>
        <button
          onClick={onClose}
          className="text-cozy-subtext hover:text-cozy-text p-1 rounded-full hover:bg-cozy-pink-light transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="space-y-1.5">
        <button
          onClick={() => handleAction(feed)}
          className="w-full flex items-center justify-between p-2 rounded-xl bg-cozy-pink-light/70 hover:bg-cozy-pink-light text-cozy-text font-medium text-xs transition-transform active:scale-95 border border-cozy-pink-border/40"
        >
          <div className="flex items-center space-x-2">
            <span className="p-1 rounded-lg bg-cozy-pink/20 text-cozy-pink">
              <Utensils className="w-3.5 h-3.5" />
            </span>
            <span>Feed Pet</span>
          </div>
          <span className="text-[10px] font-bold text-cozy-pink">+20 🍎</span>
        </button>

        <button
          onClick={() => handleAction(play)}
          className="w-full flex items-center justify-between p-2 rounded-xl bg-cozy-yellow-light/70 hover:bg-cozy-yellow-light text-cozy-text font-medium text-xs transition-transform active:scale-95 border border-cozy-yellow/40"
        >
          <div className="flex items-center space-x-2">
            <span className="p-1 rounded-lg bg-cozy-yellow/20 text-cozy-yellow">
              <Gamepad2 className="w-3.5 h-3.5" />
            </span>
            <span>Play Game</span>
          </div>
          <span className="text-[10px] font-bold text-amber-600">+15 🎾</span>
        </button>

        <button
          onClick={() => handleAction(bathe)}
          className="w-full flex items-center justify-between p-2 rounded-xl bg-cozy-green-light/70 hover:bg-cozy-green-light text-cozy-text font-medium text-xs transition-transform active:scale-95 border border-cozy-green/40"
        >
          <div className="flex items-center space-x-2">
            <span className="p-1 rounded-lg bg-cozy-green/20 text-cozy-green">
              <Bath className="w-3.5 h-3.5" />
            </span>
            <span>Warm Bath</span>
          </div>
          <span className="text-[10px] font-bold text-emerald-600">+25 🫧</span>
        </button>

        <button
          onClick={() => handleAction(sleep)}
          className="w-full flex items-center justify-between p-2 rounded-xl bg-cozy-purple-light/70 hover:bg-cozy-purple-light text-cozy-text font-medium text-xs transition-transform active:scale-95 border border-cozy-purple/40"
        >
          <div className="flex items-center space-x-2">
            <span className="p-1 rounded-lg bg-cozy-purple/20 text-cozy-purple">
              <Moon className="w-3.5 h-3.5" />
            </span>
            <span>{currentState === 'sleeping' ? 'Wake Up' : 'Sleep'}</span>
          </div>
          <span className="text-[10px] font-bold text-indigo-600">+30 ⚡</span>
        </button>

        <button
          onClick={() => handleAction(pet)}
          className="w-full flex items-center justify-between p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-cozy-text font-medium text-xs transition-transform active:scale-95 border border-rose-200"
        >
          <div className="flex items-center space-x-2">
            <span className="p-1 rounded-lg bg-rose-200 text-rose-600">
              <Heart className="w-3.5 h-3.5" />
            </span>
            <span>Pet Head</span>
          </div>
          <span className="text-[10px] font-bold text-rose-500">+10 ❤️</span>
        </button>
      </div>
    </div>
  );
};
