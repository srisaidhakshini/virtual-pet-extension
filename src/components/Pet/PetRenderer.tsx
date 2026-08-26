import React, { useEffect, useState } from 'react';
import { PetAnimState, PetType } from '../../pet/petState';
import { getPetImageUrl } from '../../pet/petAssets';
import { AccessoryOverlay } from '../Accessories/AccessoryOverlay';

interface PetRendererProps {
  petType: PetType;
  state: PetAnimState;
  direction?: 'left' | 'right';
  equippedAccessories?: string[];
  className?: string;
  size?: number;
  level?: number;
}

export const PetRenderer: React.FC<PetRendererProps> = ({
  petType,
  state,
  direction = 'right',
  equippedAccessories = [],
  className = '',
  size = 120,
  level = 5,
}) => {
  const isLeft = direction === 'left' || state === 'walking-left';
  const flipStyle = isLeft ? { transform: 'scaleX(-1)' } : {};

  // Expressive responsive body part animations
  const isWalking = state === 'walking-left' || state === 'walking-right';
  const isSleeping = state === 'sleeping';
  const isHappy = state === 'happy' || state === 'eating' || state === 'playing';

  // Toggle leg-stepping animation frame every 180ms when walking
  const [walkFrame, setWalkFrame] = useState<number>(0);

  useEffect(() => {
    if (!isWalking) {
      setWalkFrame(0);
      return;
    }
    const timer = setInterval(() => {
      setWalkFrame((prev) => (prev === 0 ? 1 : 0));
    }, 180);
    return () => clearInterval(timer);
  }, [isWalking]);

  const imageUrl = getPetImageUrl(petType, state, level, walkFrame);

  const renderPetGraphic = () => {
    if (imageUrl) {
      return (
        <div
          className={`w-full h-full relative flex items-center justify-center transition-transform duration-100 ${
            isWalking ? 'animate-walk-cycle' : isHappy ? 'animate-pulse' : ''
          }`}
          style={flipStyle}
        >
          <img
            src={imageUrl}
            alt={petType}
            className={`w-full h-full object-contain filter drop-shadow-md select-none pointer-events-none transition-all duration-150 ${
              isSleeping ? 'opacity-70 grayscale-[20%]' : ''
            }`}
            style={{ imageRendering: 'pixelated' }}
            onError={(e) => {
              // Fallback if image load fails
              console.warn(`Failed to load pet image: ${imageUrl}`);
            }}
          />

          {/* Equipped Accessories rendered inside the synced flipped container */}
          {equippedAccessories.map((accId) => (
            <AccessoryOverlay key={accId} accessoryId={accId} petType={petType} size={size} />
          ))}
        </div>
      );
    }

    switch (petType) {
      case 'cat':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full pixelated drop-shadow-md overflow-visible" style={flipStyle}>
            {/* Animated Tail */}
            <g className={!isSleeping ? 'animate-tail' : ''}>
              <path d="M 18 64 Q 6 50 14 36" stroke="#2d232e" strokeWidth="6" strokeLinecap="round" fill="none" />
              <path d="M 18 64 Q 6 50 14 36" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" fill="none" />
            </g>

            {/* Feet / Paws */}
            <g className={isWalking ? 'animate-paws' : ''}>
              <ellipse cx="34" cy="88" rx="8" ry="5" fill="#ffffff" stroke="#2d232e" strokeWidth="3" />
              <ellipse cx="66" cy="88" rx="8" ry="5" fill="#ffffff" stroke="#2d232e" strokeWidth="3" />
            </g>

            {/* Body */}
            <rect x="18" y="50" width="64" height="42" rx="22" fill="#ffffff" stroke="#2d232e" strokeWidth="4" />
            
            {/* Blue Collar with Gold Bell */}
            <rect x="28" y="62" width="44" height="8" rx="4" fill="#4dadf7" stroke="#2d232e" strokeWidth="2.5" />
            <circle cx="50" cy="70" r="5" fill="#ffd43b" stroke="#2d232e" strokeWidth="2" />

            {/* Head & Responsive Ears Group */}
            <g className={!isSleeping ? 'animate-head' : ''}>
              {/* Responsive Ears */}
              <g className={!isSleeping ? 'animate-ears' : ''}>
                <path d="M 28 28 L 38 12 L 48 30 Z" fill="#ffffff" stroke="#2d232e" strokeWidth="4" strokeLinejoin="round" />
                <path d="M 32 25 L 38 16 L 44 26 Z" fill="#ffb3c1" />
                <path d="M 72 28 L 62 12 L 52 30 Z" fill="#ffffff" stroke="#2d232e" strokeWidth="4" strokeLinejoin="round" />
                <path d="M 68 25 L 62 16 L 56 26 Z" fill="#ffb3c1" />
              </g>

              {/* Head Base */}
              <rect x="22" y="24" width="56" height="52" rx="26" fill="#ffffff" stroke="#2d232e" strokeWidth="4" />

              {/* Cheeks */}
              <circle cx="30" cy="48" r="5" fill="#ffb3c1" opacity="0.7" />
              <circle cx="70" cy="48" r="5" fill="#ffb3c1" opacity="0.7" />

              {/* Responsive Face Expression */}
              {isSleeping ? (
                <g stroke="#2d232e" strokeWidth="3.5" strokeLinecap="round" fill="none">
                  <path d="M 32 44 Q 38 50 44 44" />
                  <path d="M 56 44 Q 62 50 68 44" />
                  <path d="M 47 52 Q 50 56 53 52" fill="#2d232e" />
                </g>
              ) : isHappy ? (
                <g>
                  <path d="M 32 44 Q 38 36 44 44" stroke="#2d232e" strokeWidth="3.5" strokeLinecap="round" fill="none" />
                  <path d="M 56 44 Q 62 36 68 44" stroke="#2d232e" strokeWidth="3.5" strokeLinecap="round" fill="none" />
                  <ellipse cx="50" cy="52" rx="3" ry="2" fill="#ff758f" />
                  <path d="M 46 54 Q 50 60 54 54" stroke="#2d232e" strokeWidth="3" fill="none" />
                </g>
              ) : (
                <g>
                  {/* Eyes with blink animation */}
                  <g className="animate-blink">
                    <ellipse cx="36" cy="42" rx="6" ry="7" fill="#38d9a9" stroke="#2d232e" strokeWidth="3" />
                    <circle cx="34" cy="40" r="2.5" fill="#ffffff" />
                    <ellipse cx="64" cy="42" rx="6" ry="7" fill="#38d9a9" stroke="#2d232e" strokeWidth="3" />
                    <circle cx="62" cy="40" r="2.5" fill="#ffffff" />
                  </g>
                  <polygon points="50,49 47,46 53,46" fill="#ff85a1" />
                  <path d="M 46 51 Q 50 55 54 51" stroke="#2d232e" strokeWidth="3" strokeLinecap="round" fill="none" />
                </g>
              )}
            </g>
          </svg>
        );

      case 'bunny':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full pixelated drop-shadow-md overflow-visible" style={flipStyle}>
            <g className={!isSleeping ? 'animate-ears' : ''}>
              <rect x="30" y="4" width="14" height="34" rx="7" fill="#ffffff" stroke="#2d232e" strokeWidth="3.5" />
              <rect x="33" y="10" width="8" height="22" rx="4" fill="#ffc078" />
              <rect x="56" y="4" width="14" height="34" rx="7" fill="#ffffff" stroke="#2d232e" strokeWidth="3.5" />
              <rect x="59" y="10" width="8" height="22" rx="4" fill="#ffc078" />
            </g>
            <g className={!isSleeping ? 'animate-head' : ''}>
              <rect x="24" y="28" width="52" height="48" rx="24" fill="#ffffff" stroke="#2d232e" strokeWidth="4" />
              <rect x="22" y="52" width="56" height="40" rx="20" fill="#ffffff" stroke="#2d232e" strokeWidth="4" />
              <circle cx="28" cy="52" r="4.5" fill="#ffb3c1" />
              <circle cx="72" cy="52" r="4.5" fill="#ffb3c1" />
              <g className="animate-blink">
                <circle cx="38" cy="46" r="4.5" fill="#2d232e" />
                <circle cx="62" cy="46" r="4.5" fill="#2d232e" />
              </g>
              <path d="M 50 52 L 47 56 M 50 52 L 53 56" stroke="#2d232e" strokeWidth="3" strokeLinecap="round" />
            </g>
          </svg>
        );

      case 'hamster':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full pixelated drop-shadow-md overflow-visible" style={flipStyle}>
            <g className={!isSleeping ? 'animate-ears' : ''}>
              <circle cx="26" cy="30" r="8" fill="#e67e22" stroke="#2d232e" strokeWidth="3" />
              <circle cx="74" cy="30" r="8" fill="#e67e22" stroke="#2d232e" strokeWidth="3" />
            </g>
            <g className={!isSleeping ? 'animate-head' : ''}>
              <rect x="20" y="26" width="60" height="64" rx="28" fill="#f39c12" stroke="#2d232e" strokeWidth="4" />
              <ellipse cx="50" cy="60" rx="22" ry="24" fill="#fff5eb" />
              <g className="animate-blink">
                <circle cx="36" cy="44" r="5" fill="#2d232e" />
                <circle cx="64" cy="44" r="5" fill="#2d232e" />
              </g>
              <ellipse cx="50" cy="50" rx="4" ry="3" fill="#ff85a1" />
            </g>
          </svg>
        );

      case 'bird':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full pixelated drop-shadow-md overflow-visible" style={flipStyle}>
            <g className={isWalking ? 'animate-paws' : ''}>
              <path d="M 40 76 L 40 88 M 36 88 L 44 88" stroke="#2d232e" strokeWidth="3" strokeLinecap="round" />
              <path d="M 60 76 L 60 88 M 56 88 L 64 88" stroke="#2d232e" strokeWidth="3" strokeLinecap="round" />
            </g>
            <g className={!isSleeping ? 'animate-head' : ''}>
              <circle cx="50" cy="46" r="32" fill="#74c0fc" stroke="#2d232e" strokeWidth="4" />
              <g className={!isSleeping ? 'animate-wings' : ''}>
                <path d="M 20 46 Q 4 30 14 56 Z" fill="#4dadf7" stroke="#2d232e" strokeWidth="3" />
                <path d="M 16 42 Q 8 36 12 48 Z" fill="#ffb3c1" />
              </g>
              <g className={!isSleeping ? 'animate-wings-r' : ''}>
                <path d="M 80 46 Q 96 30 86 56 Z" fill="#4dadf7" stroke="#2d232e" strokeWidth="3" />
                <path d="M 84 42 Q 92 36 88 48 Z" fill="#ffb3c1" />
              </g>
              <circle cx="34" cy="48" r="4" fill="#ffb3c1" />
              <circle cx="66" cy="48" r="4" fill="#ffb3c1" />
              <path d="M 44 48 L 56 48 L 50 56 Z" fill="#ffd43b" stroke="#2d232e" strokeWidth="2.5" />
              {!isSleeping ? (
                <g className="animate-blink">
                  <circle cx="40" cy="38" r="4.5" fill="#2d232e" />
                  <circle cx="38" cy="36" r="1.5" fill="#ffffff" />
                  <circle cx="60" cy="38" r="4.5" fill="#2d232e" />
                  <circle cx="58" cy="36" r="1.5" fill="#ffffff" />
                </g>
              ) : (
                <g stroke="#2d232e" strokeWidth="3" strokeLinecap="round">
                  <line x1="36" y1="38" x2="44" y2="38" />
                  <line x1="56" y1="38" x2="64" y2="38" />
                </g>
              )}
            </g>
          </svg>
        );

      case 'panda':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full pixelated drop-shadow-md overflow-visible" style={flipStyle}>
            <g className={!isSleeping ? 'animate-ears' : ''}>
              <circle cx="24" cy="24" r="12" fill="#2d232e" />
              <circle cx="76" cy="24" r="12" fill="#2d232e" />
            </g>
            <g className={!isSleeping ? 'animate-head' : ''}>
              <rect x="20" y="24" width="60" height="52" rx="26" fill="#ffffff" stroke="#2d232e" strokeWidth="4" />
              <rect x="18" y="52" width="64" height="40" rx="20" fill="#ffffff" stroke="#2d232e" strokeWidth="4" />
              <ellipse cx="36" cy="44" rx="9" ry="7" fill="#2d232e" />
              <ellipse cx="64" cy="44" rx="9" ry="7" fill="#2d232e" />
              <g className="animate-blink">
                <circle cx="36" cy="44" r="3" fill="#ffffff" />
                <circle cx="64" cy="44" r="3" fill="#ffffff" />
              </g>
              <ellipse cx="50" cy="54" rx="5" ry="3" fill="#2d232e" />
            </g>
          </svg>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center transition-transform duration-200 ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      {renderPetGraphic()}
    </div>
  );
};

