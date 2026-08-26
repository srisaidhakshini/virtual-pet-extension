import { PetAnimState, PetType, getGrowthStage } from './petState';

/**
 * Helper to get the correct asset path whether running in Vite preview mode or Chrome Extension.
 */
export function getAssetPath(filename: string): string {
  const relPath = `Virtual_Pet/${filename}`;
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
    try {
      return chrome.runtime.getURL(relPath);
    } catch {
      return `/${relPath}`;
    }
  }
  return `/${relPath}`;
}

/**
 * Maps pet species, growth level, and animation state to one of the images in the Virtual_Pet folder.
 */
export function getPetImageUrl(
  petType: PetType,
  state: PetAnimState,
  level: number = 5,
  walkFrame: number = 0
): string | null {
  const stage = getGrowthStage(level);
  const isWalking = state === 'walking-left' || state === 'walking-right';

  switch (petType) {
    case 'cat':
      if (state === 'eating') {
        return getAssetPath('teen_cat_eating.png');
      }
      if (state === 'playing') {
        return getAssetPath('baby_cat_playing.png');
      }
      if (isWalking) {
        // Alternate between walking legs extended and sitting/mid-step frame to animate physical leg movement
        return walkFrame === 1
          ? getAssetPath('baby_cat_sitting.png')
          : getAssetPath('baby_cat_walking.png');
      }
      // Sitting / Idle based on Growth Stage
      if (stage === 'Baby' || stage === 'Growing') {
        return getAssetPath('baby_cat_sitting.png');
      } else if (stage === 'Young' || stage === 'Teen') {
        return getAssetPath('teen_cat_sitting.png');
      } else {
        return getAssetPath('adult_cat_sitting.png');
      }

    case 'elephant':
      if (isWalking) {
        return walkFrame === 1
          ? getAssetPath('baby_elephant_sitting.png')
          : getAssetPath('baby_elephant_walking.png');
      }
      return getAssetPath('baby_elephant_sitting.png');

    case 'dog':
      if (isWalking) {
        return walkFrame === 1
          ? getAssetPath('baby_dog_sitting.png')
          : getAssetPath('Adult_dog_standing.png');
      }
      if (stage === 'Baby') {
        return getAssetPath('baby_dog_sitting.png');
      }
      return getAssetPath('Adult_dog_standing.png');

    case 'penguin':
      if (isWalking) {
        return walkFrame === 1
          ? getAssetPath('baby_penguin_standing.png')
          : getAssetPath('adult_penguin_standing.png');
      }
      if (stage === 'Baby' || stage === 'Growing') {
        return getAssetPath('baby_penguin_standing.png');
      } else if (stage === 'Young' || stage === 'Teen') {
        return getAssetPath('teen_penguin_standing.png');
      } else {
        return getAssetPath('adult_penguin_standing.png');
      }

    default:
      return null;
  }
}

export function getPetAvatarUrl(petType: PetType): string {
  switch (petType) {
    case 'cat':
      return getAssetPath('baby_cat_sitting.png');
    case 'elephant':
      return getAssetPath('baby_elephant_sitting.png');
    case 'dog':
      return getAssetPath('Adult_dog_standing.png');
    case 'penguin':
      return getAssetPath('adult_penguin_standing.png');
    default:
      return '';
  }
}
