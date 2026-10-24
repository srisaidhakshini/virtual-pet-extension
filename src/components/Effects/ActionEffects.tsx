import React from 'react';
import { PetAnimState } from '../../pet/petState';
/** A ground-level graphical toy. No labels, emoji, or overhead particles. */
export const ActionEffects: React.FC<{state: PetAnimState}> = ({ state }) => {
  if (state !== 'playing') return null;
  return <svg className="pet-play-toy" viewBox="0 0 32 32" aria-hidden="true">
    <ellipse cx="16" cy="28" rx="11" ry="2" fill="#334b39" opacity=".1" />
    <g className="pet-play-ball"><circle cx="16" cy="15" r="11" fill="#b6cb78" stroke="#809952" strokeWidth="1" />
      <path d="M8 5c10 5 10 15 0 20M24 5c-10 5-10 15 0 20" fill="none" stroke="#f4f7dd" strokeWidth="2" />
    </g>
  </svg>;
};
