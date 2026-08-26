import React from 'react';
import { PetAnimState, PetType } from '../../pet/petState';
import { PetRenderer } from './PetRenderer';
import { AccessoryOverlay } from '../Accessories/AccessoryOverlay';
import { ActionEffects } from '../Effects/ActionEffects';

export interface PetProps {
  name?: string;
  petType: PetType;
  state: PetAnimState;
  direction?: 'left' | 'right';
  equippedAccessories?: string[];
  size?: number;
  onClick?: (e: React.MouseEvent) => void;
  showNameTag?: boolean;
}

export const Pet: React.FC<PetProps> = ({
  name = 'Mochi',
  petType,
  state,
  direction = 'right',
  equippedAccessories = [],
  size = 120,
  onClick,
  showNameTag = true,
}) => {
  return (
    <div
      onClick={onClick}
      className="relative group cursor-pointer inline-block select-none transform transition-transform duration-200 hover:scale-105 active:scale-95"
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      {/* Name Tag above pet matching Figma Design input_file_1.png */}
      {showNameTag && (
        <div className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white/95 px-2.5 py-0.5 rounded-full border border-cozy shadow-sm flex items-center space-x-1 z-30 pointer-events-none">
          <span className="text-[10px] font-bold uppercase tracking-wider text-cozy-text">{name}</span>
          {state === 'happy' && <span className="text-[10px]">❤️</span>}
        </div>
      )}

      {/* Layer 1: Pet Base Graphic with Tailored Synced Accessories */}
      <PetRenderer
        petType={petType}
        state={state}
        direction={direction}
        equippedAccessories={equippedAccessories}
        size={size}
      />

      {/* Layer 2: Action & Particle Effects */}
      <ActionEffects state={state} />
    </div>
  );
};
