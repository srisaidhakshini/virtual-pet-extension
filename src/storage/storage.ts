export interface StoredPetState {
  name: string;
  petType: 'cat' | 'dog' | 'bunny' | 'hamster' | 'bird' | 'penguin' | 'panda' | 'elephant';
  level: number;
  xp: number;
  hunger: number;
  happiness: number;
  energy: number;
  cleanliness: number;
  health: number;
  mood: string;
  accessories: string[];
  equippedAccessories: string[];
  currentState: 'idle' | 'walking-left' | 'walking-right' | 'happy' | 'eating' | 'playing' | 'bathing' | 'sleeping';
  direction: 'left' | 'right';
  position: { x: number; y: number };
  lastUpdated: number;
  streak: number;
  activitiesLog: Array<{ id: string; text: string; time: string; type: string }>;
  journal: { stepsWalked: number; pagesVisited: number; daysAlive: number };
  overlayVisible: boolean;
  isAutoWalkEnabled?: boolean;
}

const STORAGE_KEY = 'virtual_pet_state_v1';

export const isChromeExtension = (): boolean => {
  return typeof chrome !== 'undefined' && !!chrome.storage && !!chrome.storage.local;
};

export const savePetStateToStorage = async (state: Partial<StoredPetState>): Promise<void> => {
  try {
    if (isChromeExtension()) {
      await chrome.storage.local.set({ [STORAGE_KEY]: state });
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  } catch (err) {
    console.warn('Failed to save pet state to storage:', err);
  }
};

export const loadPetStateFromStorage = async (): Promise<Partial<StoredPetState> | null> => {
  try {
    if (isChromeExtension()) {
      const res = await chrome.storage.local.get(STORAGE_KEY);
      return (res[STORAGE_KEY] as Partial<StoredPetState>) || null;
    } else {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    }
  } catch (err) {
    console.warn('Failed to load pet state from storage:', err);
    return null;
  }
};
