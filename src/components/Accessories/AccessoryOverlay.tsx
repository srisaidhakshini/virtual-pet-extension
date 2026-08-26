import React from 'react';
import { PetType } from '../../pet/petState';

interface AccessoryOverlayProps {
  accessoryId: string;
  petType?: PetType;
  size?: number;
}

export const AccessoryOverlay: React.FC<AccessoryOverlayProps> = ({
  accessoryId,
  petType = 'cat',
  size = 120,
}) => {
  // Proportional facial positioning for each pet species
  const getProps = () => {
    switch (petType) {
      case 'cat':
        return {
          eyeLeft: { cx: 38, cy: 49 },
          eyeRight: { cx: 62, cy: 49 },
          glassesRadius: 6.5,
          glassesBridgeY: 49,
          glassesTempleY: 47,
          headTopY: 18,
          headbandY: 34,
          earLeftX: 14,
          earRightX: 76,
          neckY: 66,
          bowPos: { x: 64, y: 20 },
        };
      case 'dog':
        return {
          eyeLeft: { cx: 36, cy: 43 },
          eyeRight: { cx: 64, cy: 43 },
          glassesRadius: 6.5,
          glassesBridgeY: 43,
          glassesTempleY: 41,
          headTopY: 16,
          headbandY: 32,
          earLeftX: 16,
          earRightX: 74,
          neckY: 60,
          bowPos: { x: 66, y: 18 },
        };
      case 'elephant':
        return {
          eyeLeft: { cx: 38, cy: 42 },
          eyeRight: { cx: 62, cy: 42 },
          glassesRadius: 6.5,
          glassesBridgeY: 42,
          glassesTempleY: 40,
          headTopY: 20,
          headbandY: 32,
          earLeftX: 18,
          earRightX: 72,
          neckY: 66,
          bowPos: { x: 64, y: 22 },
        };
      case 'penguin':
        return {
          eyeLeft: { cx: 38, cy: 40 },
          eyeRight: { cx: 62, cy: 40 },
          glassesRadius: 6,
          glassesBridgeY: 40,
          glassesTempleY: 38,
          headTopY: 16,
          headbandY: 30,
          earLeftX: 16,
          earRightX: 74,
          neckY: 62,
          bowPos: { x: 64, y: 18 },
        };
      default:
        return {
          eyeLeft: { cx: 38, cy: 44 },
          eyeRight: { cx: 62, cy: 44 },
          glassesRadius: 6.5,
          glassesBridgeY: 44,
          glassesTempleY: 42,
          headTopY: 18,
          headbandY: 34,
          earLeftX: 16,
          earRightX: 74,
          neckY: 62,
          bowPos: { x: 64, y: 20 },
        };
    }
  };

  const p = getProps();

  switch (accessoryId) {
    case 'glasses':
      return (
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full pointer-events-none z-10">
          <circle
            cx={p.eyeLeft.cx}
            cy={p.eyeLeft.cy}
            r={p.glassesRadius}
            fill="none"
            stroke="#2d232e"
            strokeWidth="2.5"
          />
          <circle
            cx={p.eyeRight.cx}
            cy={p.eyeRight.cy}
            r={p.glassesRadius}
            fill="none"
            stroke="#2d232e"
            strokeWidth="2.5"
          />
          <line
            x1={p.eyeLeft.cx + p.glassesRadius - 0.5}
            y1={p.glassesBridgeY}
            x2={p.eyeRight.cx - p.glassesRadius + 0.5}
            y2={p.glassesBridgeY}
            stroke="#2d232e"
            strokeWidth="2.5"
          />
          <line
            x1={p.eyeLeft.cx - p.glassesRadius - 12}
            y1={p.glassesTempleY}
            x2={p.eyeLeft.cx - p.glassesRadius}
            y2={p.glassesBridgeY}
            stroke="#2d232e"
            strokeWidth="2"
          />
          <line
            x1={p.eyeRight.cx + p.glassesRadius}
            y1={p.glassesBridgeY}
            x2={p.eyeRight.cx + p.glassesRadius + 12}
            y2={p.glassesTempleY}
            stroke="#2d232e"
            strokeWidth="2"
          />
        </svg>
      );

    case 'bow':
      return (
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full pointer-events-none z-10">
          <path
            d={`M ${p.bowPos.x} ${p.bowPos.y} L ${p.bowPos.x + 12} ${p.bowPos.y - 6} L ${p.bowPos.x + 6} ${p.bowPos.y + 6} Z`}
            fill="#ff758f"
            stroke="#2d232e"
            strokeWidth="2"
          />
          <path
            d={`M ${p.bowPos.x} ${p.bowPos.y} L ${p.bowPos.x + 12} ${p.bowPos.y + 6} L ${p.bowPos.x + 6} ${p.bowPos.y - 6} Z`}
            fill="#ff758f"
            stroke="#2d232e"
            strokeWidth="2"
          />
          <circle cx={p.bowPos.x} cy={p.bowPos.y} r="3.5" fill="#ff4d6d" stroke="#2d232e" strokeWidth="1.5" />
        </svg>
      );

    case 'crown':
      return (
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full pointer-events-none z-10">
          <path
            d={`M 38 ${p.headTopY} L 40 ${p.headTopY - 12} L 50 ${p.headTopY - 6} L 60 ${p.headTopY - 12} L 62 ${p.headTopY} Z`}
            fill="#ffd43b"
            stroke="#2d232e"
            strokeWidth="2"
          />
          <circle cx="40" cy={p.headTopY - 12} r="2" fill="#ff4d6d" />
          <circle cx="50" cy={p.headTopY - 6} r="2" fill="#4dadf7" />
          <circle cx="60" cy={p.headTopY - 12} r="2" fill="#ff4d6d" />
        </svg>
      );

    case 'hat':
      return (
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full pointer-events-none z-10">
          <polygon
            points={`50,${p.headTopY - 18} 34,${p.headTopY} 66,${p.headTopY}`}
            fill="#845ef7"
            stroke="#2d232e"
            strokeWidth="2"
          />
          <ellipse
            cx="50"
            cy={p.headTopY}
            rx="18"
            ry="4"
            fill="#5c7cfa"
            stroke="#2d232e"
            strokeWidth="2"
          />
          <circle cx="50" cy={p.headTopY - 18} r="3" fill="#ffd43b" />
        </svg>
      );

    case 'scarf':
      return (
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full pointer-events-none z-10">
          <rect x="28" y={p.neckY} width="44" height="9" rx="4" fill="#ff4d6d" stroke="#2d232e" strokeWidth="2" />
          <rect x="58" y={p.neckY + 7} width="9" height="15" rx="3" fill="#ff4d6d" stroke="#2d232e" strokeWidth="2" />
        </svg>
      );

    case 'headphones':
      return (
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full pointer-events-none z-10">
          {/* Headband arch loops high over top of head */}
          <path
            d={`M ${p.earLeftX + 6} ${p.headbandY} A 28 26 0 0 1 ${p.earRightX + 2} ${p.headbandY}`}
            fill="none"
            stroke="#2d232e"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <path
            d={`M ${p.earLeftX + 8} ${p.headbandY} A 26 24 0 0 1 ${p.earRightX} ${p.headbandY}`}
            fill="none"
            stroke="#cc5de8"
            strokeWidth="2"
          />
          {/* Left & Right Ear pads */}
          <rect
            x={p.earLeftX}
            y={p.headbandY - 2}
            width="10"
            height="16"
            rx="5"
            fill="#cc5de8"
            stroke="#2d232e"
            strokeWidth="2"
          />
          <rect
            x={p.earRightX}
            y={p.headbandY - 2}
            width="10"
            height="16"
            rx="5"
            fill="#cc5de8"
            stroke="#2d232e"
            strokeWidth="2"
          />
        </svg>
      );

    default:
      return null;
  }
};
