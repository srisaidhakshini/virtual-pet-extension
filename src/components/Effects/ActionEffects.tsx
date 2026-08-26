import React from 'react';
import { PetAnimState } from '../../pet/petState';

interface ActionEffectsProps {
  state: PetAnimState;
}

export const ActionEffects: React.FC<ActionEffectsProps> = ({ state }) => {
  if (state === 'idle' || state === 'walking-left' || state === 'walking-right') {
    return null;
  }

  return (
    <div className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center overflow-visible">
      {/* Happy / Petted - Hearts */}
      {(state === 'happy') && (
        <div className="absolute -top-10 flex space-x-2 animate-bounce">
          <span className="text-2xl animate-pulse-heart">❤️</span>
          <span className="text-xl animate-pulse-heart delay-150">✨</span>
          <span className="text-2xl animate-pulse-heart delay-300">💖</span>
        </div>
      )}

      {/* Eating - Cookie */}
      {state === 'eating' && (
        <div className="absolute -top-8 flex flex-col items-center animate-pulse">
          <span className="text-3xl">🍪</span>
          <span className="text-xs font-bold text-cozy-text bg-white/90 px-2 py-0.5 rounded-full border border-cozy shadow-sm">
            Yum yum!
          </span>
        </div>
      )}

      {/* Playing - Ball & Sparkles */}
      {state === 'playing' && (
        <div className="absolute -top-10 flex items-center space-x-2 animate-bounce">
          <span className="text-3xl">🎾</span>
          <span className="text-xl">✨</span>
          <span className="text-2xl">🧸</span>
        </div>
      )}

      {/* Bathing - Bubbles */}
      {state === 'bathing' && (
        <div className="absolute -top-12 flex space-x-3">
          <span className="text-2xl animate-bounce delay-100">🫧</span>
          <span className="text-3xl animate-bounce delay-300">🧼</span>
          <span className="text-2xl animate-bounce delay-200">🫧</span>
        </div>
      )}

      {/* Sleeping - Zzz */}
      {state === 'sleeping' && (
        <div className="absolute -top-12 right-0 flex flex-col items-end animate-pulse">
          <span className="text-sm font-bold text-cozy-purple">Z</span>
          <span className="text-base font-bold text-cozy-purple -mr-2">Z</span>
          <span className="text-xl font-bold text-cozy-purple -mr-4">Z...</span>
        </div>
      )}
    </div>
  );
};
