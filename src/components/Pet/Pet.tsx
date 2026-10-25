import React, { useEffect, useRef, useState } from 'react';
import { PetAnimState, PetType } from '../../pet/petState';
import { PetRenderer } from './PetRenderer';
import { getAssetPath } from '../../pet/petAssets';
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
  const [hovered, setHovered] = useState(false);
  const [heartBursts, setHeartBursts] = useState<number[]>([]);
  const nextBurst = useRef(0);
  useEffect(() => {
    if (!hovered) return;
    const emit = () => {
      const id = ++nextBurst.current;
      setHeartBursts(bursts => [...bursts, id]);
    };
    emit();
    const interval = window.setInterval(emit, 1650);
    const stop = () => setHovered(false);
    window.addEventListener('blur', stop);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener('blur', stop);
    };
  }, [hovered]);
  return (
    <div
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onPointerCancel={() => setHovered(false)}
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
      {heartBursts.map(burst => <div key={burst} className="pet-hearts" aria-hidden="true">
        {[0, 1, 2].map(index => <img key={index} className={`pet-heart pet-heart-${index}`} src={getAssetPath('heart-3d.png')} alt="" draggable={false}
          onAnimationEnd={index === 0 ? () => setHeartBursts(bursts => bursts.filter(id => id !== burst)) : undefined} />)}
      </div>)}
    </div>
  );
};
