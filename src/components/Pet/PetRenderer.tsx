import React, { useEffect, useState } from 'react';
import { PetAnimState, PetType } from '../../pet/petState';
import { getAssetPath, getPetImageUrl } from '../../pet/petAssets';
interface PetRendererProps {
  petType: PetType; state: PetAnimState; direction?: 'left' | 'right';
  className?: string; size?: number; level?: number;
}
export const PetRenderer: React.FC<PetRendererProps> = ({ petType, state, direction = 'right', className = '', size = 120, level = 1 }) => {
  const walking = state.startsWith('walking');
  const [frame, setFrame] = useState(0);
  const [walkReady, setWalkReady] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    const query = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(query.matches);
    update(); query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    let mounted = true;
    const frames = Array.from({ length: 8 }, (_, i) => `sprout-walk-${i}.png`);
    void Promise.all(frames.map(file => {
      const image = new Image(); image.src = getAssetPath(file); return image.decode();
    })).then(() => { if (mounted) setWalkReady(true); }).catch(() => {});
    for (const i of [0, 3, 4, 5]) { const image = new Image(); image.src = getAssetPath(`sprout-${i}.png`); }
    return () => { mounted = false; };
  }, []);
  useEffect(() => {
    setFrame(0);
    if (!walking || reducedMotion || !walkReady) return;
    let animation = 0, start: number | undefined;
    const advance = (time: number) => {
      start ??= time;
      setFrame(Math.floor((time - start) / 90) % 8);
      animation = requestAnimationFrame(advance);
    };
    animation = requestAnimationFrame(advance);
    return () => cancelAnimationFrame(animation);
  }, [walking, reducedMotion, walkReady]);
  const motion = walking ? 'walk' : state === 'sleeping' ? 'sleep' : state === 'happy' || state === 'playing' ? 'happy' : state === 'eating' ? 'eat' : 'idle';
  return <div className={`sprout-renderer ${className}`} style={{ width: size, height: size }}>
    <div className="sprout-facing" style={{ transform: direction === 'left' || state === 'walking-left' ? 'scaleX(-1)' : undefined }}>
      <div className={`sprout-body sprout-motion-${motion}`}>
        <img src={getPetImageUrl(petType, walking && !walkReady ? 'idle' : state, level, frame)} alt="Your pet" draggable={false} className="sprout-art" />

      </div>
    </div>
  </div>;
};
