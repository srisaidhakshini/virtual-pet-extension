import React from 'react';
import { PetAnimState, PetType } from '../../pet/petState';
import { PetRenderer } from './PetRenderer';
import { ActionEffects } from '../Effects/ActionEffects';

export interface PetProps {
  petType: PetType;
  state: PetAnimState;
  direction?: 'left' | 'right';
  size?: number;
  onClick?: (e: React.MouseEvent) => void;
}

export const Pet: React.FC<PetProps> = ({
  petType,
  state,
  direction = 'right',
  size = 120,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={onClick ? 'Interact with your pet' : undefined}
      onKeyDown={e => { if (onClick && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); e.currentTarget.click(); } }}
      className="relative group cursor-pointer inline-block select-none "
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      {/* Layer 1: Pet Base Graphic with Tailored Synced Accessories */}
      <PetRenderer
        petType={petType}
        state={state}
        direction={direction}
        size={size}
      />

      {/* Layer 2: Action & Particle Effects */}
      <ActionEffects state={state} />
    </div>
  );
};
