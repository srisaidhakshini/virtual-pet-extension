import { normalizePetSize } from '../pet/petSize';

export interface StoredPetState {
  checkInsEnabled: boolean;
  checkInMinutes: 5 | 10;
  checkInVoice: boolean;
  pageContextEnabled: boolean;
  focusTopic: string;
  lastCheckInAt: number;
  checkInRequest: number;
  petSize: number;
  characterVersion?: number;
  adoptedAt?: number;
  lastCareAt?: number;
  name: string;
  petType: 'sprout';
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

export const STORAGE_KEY = 'virtual_pet_state_v1';
export const isChromeExtension = (): boolean => typeof chrome !== 'undefined' && !!chrome.storage?.local;
let baseline: Record<string, unknown> = {};
let pending: Record<string, unknown> = {};
let flushTimer: ReturnType<typeof setTimeout> | undefined;

export const savePetStateToStorage = async (state: Partial<StoredPetState>): Promise<void> => {
  // Store data only; Zustand action functions cannot be cloned by Chrome.
  const data = JSON.parse(JSON.stringify(state)) as Record<string, unknown>;
  for (const [key, value] of Object.entries(data)) {
    if (JSON.stringify(value) !== JSON.stringify(baseline[key])) pending[key] = value;
  }
  baseline = data;
  if (flushTimer) return;
  flushTimer = setTimeout(async () => {
    flushTimer = undefined;
    const changes = pending;
    pending = {};
    try {
      if (typeof window !== 'undefined' && window.desktopPet) {
        await window.desktopPet.saveState(changes);
        return;
      }
      const latest = await loadPetStateFromStorage();
      const merged = { ...latest, ...changes };
      if (isChromeExtension()) await chrome.storage.local.set({ [STORAGE_KEY]: merged });
      else localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    } catch (err) { console.warn('Could not save pet', err); }
  }, 250);
};

export const loadPetStateFromStorage = async (): Promise<Partial<StoredPetState> | null> => {
  try {
    if (typeof window !== 'undefined' && window.desktopPet) return window.desktopPet.loadState();
    if (isChromeExtension()) return (await chrome.storage.local.get(STORAGE_KEY))[STORAGE_KEY] || null;
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
  } catch { return null; }
};

export function observePetStorage(apply: (state: Partial<StoredPetState>) => void) {
  const receive = (value: Partial<StoredPetState>) => {
    // Every page keeps its own position and gait; care and companion preferences are shared.
    const { position, direction, currentState, ...shared } = value;
    const next: Partial<StoredPetState> = { ...shared, accessories: [], equippedAccessories: [], ...(shared.petSize !== undefined ? { petSize: normalizePetSize(shared.petSize) } : {}), ...(shared.petType ? { petType: 'sprout' as const } : {}) };
    if (currentState && !currentState.startsWith('walking')) next.currentState = currentState;
    for (const key of Object.keys(pending)) delete (next as Record<string, unknown>)[key];
    baseline = { ...baseline, ...next };
    apply(next);
  };
  if (typeof window !== 'undefined' && window.desktopPet) {
    window.desktopPet.onState(receive);
  } else if (isChromeExtension()) {
    const listener = (changes: Record<string, chrome.storage.StorageChange>, area: string) => {
      if (area === 'local' && changes[STORAGE_KEY]?.newValue) receive(changes[STORAGE_KEY].newValue);
    };
    chrome.storage.onChanged.addListener(listener);
  } else {
    window.addEventListener('storage', event => {
      if (event.key === STORAGE_KEY && event.newValue) {
        try { receive(JSON.parse(event.newValue)); } catch { /* Invalid external data. */ }
      }
    });
  }
}
