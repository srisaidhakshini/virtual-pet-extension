import { PetAnimState, PetType } from './petState';

/**
 * Helper to get the correct asset path whether running in Vite preview mode or Chrome Extension.
 */
export function getAssetPath(filename: string): string {
  const relPath = `Virtual_Pet/${filename}`;
  if (typeof window !== 'undefined' && window.desktopPet) return new URL(relPath, window.location.href).href;
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
    try {
      return chrome.runtime.getURL(relPath);
    } catch {
      return `/${relPath}`;
    }
  }
  return `/${relPath}`;
}

/** Only Sprout artwork is shipped. Legacy saved species are migrated by the store. */
export function getPetImageUrl(_petType: PetType, state: PetAnimState, _level = 1, walkFrame = 0): string {
  if (state === 'walking-left' || state === 'walking-right') return getAssetPath(`sprout-walk-${walkFrame % 8}.png`);
  return getAssetPath(`sprout-${state === 'sleeping' ? 5 : state === 'eating' ? 4 : state === 'happy' || state === 'playing' ? 3 : 0}.png`);
}
