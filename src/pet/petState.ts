import { canControlPet } from '../connection/guard';
import { create } from 'zustand';
import { normalizePetSize, PET_SIZE } from './petSize';
import { loadPetStateFromStorage, savePetStateToStorage, StoredPetState, observePetStorage } from '../storage/storage';

export type PetType = 'sprout';
export type PetAnimState = 'idle' | 'walking-left' | 'walking-right' | 'happy' | 'eating' | 'playing' | 'bathing' | 'sleeping';

export interface ActivityItem {
  id: string;
  text: string;
  time: string;
  type: string;
}

export interface PetState extends StoredPetState {
  isAutoWalkEnabled: boolean;

  setPetSize: (size: number) => void;

  // Actions
  setName: (name: string) => void;
  setState: (state: PetAnimState) => void;
  setDirection: (direction: 'left' | 'right') => void;
  setPosition: (pos: { x: number; y: number }) => void;
  toggleOverlayVisible: () => void;
  toggleAutoWalk: () => void;
  addStepsWalked: (steps: number) => void;
  
  // Activities
  feed: () => void;
  play: () => void;
  bathe: () => void;
  sleep: () => void;
  pet: () => void;
  
  setCompanion: (settings: Partial<Pick<StoredPetState, 'checkInsEnabled' | 'checkInMinutes' | 'checkInVoice' | 'pageContextEnabled' | 'focusTopic'>>) => void;
  requestCheckIn: () => void;
  markCheckIn: () => void;
  
  // Internal update & decay
  applyDecay: () => void;
  addXP: (amount: number) => void;
  addLog: (text: string, type: string) => void;
  initFromStorage: () => Promise<void>;
}

const DEFAULT_STATE: StoredPetState & { isAutoWalkEnabled: boolean } = {
  checkInsEnabled: true,
  checkInMinutes: 10,
  checkInVoice: false,
  pageContextEnabled: false,
  focusTopic: '',
  lastCheckInAt: Date.now(),
  checkInRequest: 0,
  petSize: PET_SIZE.default,
  characterVersion: 2,
  adoptedAt: Date.now(),
  lastCareAt: Date.now(),
  name: 'Sprout',
  petType: 'sprout',
  level: 1,
  xp: 0,
  hunger: 82,
  happiness: 94,
  energy: 45,
  cleanliness: 60,
  health: 98,
  mood: 'Super Cozy! ✨',
  accessories: [],
  equippedAccessories: [],
  currentState: 'idle',
  direction: 'right',
  position: { x: 300, y: 150 },
  lastUpdated: Date.now(),
  streak: 1,
  activitiesLog: [],
  journal: { stepsWalked: 0, pagesVisited: 0, daysAlive: 1 },
  overlayVisible: true,
  isAutoWalkEnabled: true,
};

export const getNextLevelXP = (level: number) => {
  return level * 100 + (level - 1) * 50;
};

export const getGrowthStage = (level: number) => {
  if (level <= 1) return 'Baby';
  if (level === 2) return 'Growing';
  if (level === 3) return 'Young';
  if (level === 4) return 'Teen';
  return 'Adult';
};

let initialization: Promise<void> | undefined;

export const usePetStore = create<PetState>((set, get) => ({
  ...DEFAULT_STATE,

  initFromStorage: () => {
    if (initialization) return initialization;
    initialization = (async () => {
      const saved = await loadPetStateFromStorage();
      if (saved) {
        set({ ...saved, accessories: [], equippedAccessories: [], checkInRequest: 0, checkInMinutes: saved.checkInMinutes === 5 ? 5 : 10, petSize: normalizePetSize(saved.petSize), petType: 'sprout', ...(saved.characterVersion !== 2 ? { characterVersion: 2, petType: 'sprout' as PetType, name: saved.name === 'Mochi' ? 'Sprout' : saved.name || 'Sprout' } : {}),
          currentState: saved.currentState === 'sleeping' ? 'sleeping' : 'idle', isAutoWalkEnabled: saved.isAutoWalkEnabled ?? true });
      }
      get().applyDecay();
      savePetStateToStorage(get());
    })();
    return initialization;
  },

  setPetSize: (size) => {
    if (!canControlPet()) return;
    set({ petSize: normalizePetSize(size) });
    savePetStateToStorage(get());
  },

  setName: (name) => {
    set({ name: name.trim().slice(0, 24) || get().name });
    savePetStateToStorage(get());
  },


  setState: (currentState) => {
    if (!canControlPet()) return;
    set({ currentState });
    savePetStateToStorage(get());
  },

  setDirection: (direction) => {
    if (!canControlPet()) return;
    set({ direction });
    savePetStateToStorage(get());
  },

  setPosition: (position) => {
    if (!canControlPet()) return;
    set({ position });
    savePetStateToStorage(get());
  },

  toggleOverlayVisible: () => {
    const next = !get().overlayVisible;
    set({ overlayVisible: next });
    savePetStateToStorage(get());
  },

  toggleAutoWalk: () => {
    if (!canControlPet()) return;
    const next = !get().isAutoWalkEnabled;
    set({ isAutoWalkEnabled: next });
    savePetStateToStorage(get());
  },

  addStepsWalked: (steps) => {
    const currentJournal = get().journal;
    const updatedJournal = {
      ...currentJournal,
      stepsWalked: currentJournal.stepsWalked + steps,
    };
    set({ journal: updatedJournal });
    savePetStateToStorage(get());
  },

  addXP: (amount) => {
    const state = get();
    let newXP = state.xp + amount;
    let newLevel = state.level;
    let maxXP = getNextLevelXP(newLevel);

    while (newXP >= maxXP) {
      newXP -= maxXP;
      newLevel += 1;
      maxXP = getNextLevelXP(newLevel);
      get().addLog(`🎉 Your pet leveled up to Lv. ${newLevel}!`, 'level');
    }

    set({ xp: newXP, level: newLevel });
    savePetStateToStorage(get());
  },

  addLog: (text, type) => {
    const newLog: ActivityItem = {
      id: Date.now().toString(),
      text,
      time: 'Just now',
      type,
    };
    const updated = [newLog, ...get().activitiesLog.slice(0, 9)];
    const now = Date.now();
    const dayNumber = (time: number) => { const date = new Date(time); return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000; };
    const daysSinceCare = dayNumber(now) - dayNumber(get().lastCareAt || now);
    set({ activitiesLog: updated, lastCareAt: now, streak: daysSinceCare === 1 ? get().streak + 1 : daysSinceCare > 1 ? 1 : get().streak });
    savePetStateToStorage(get());
  },

  feed: () => {
    if (!canControlPet()) return;
    const state = get();
    set({
      currentState: 'eating',
      hunger: Math.min(100, state.hunger + 20),
      happiness: Math.min(100, state.happiness + 5),
      energy: Math.max(0, state.energy - 2),
      mood: 'Full & Happy 🍪',
      lastUpdated: Date.now(),
    });
    get().addXP(10);
    get().addLog(`Your pet ate a pixel treat`, 'food');
    

    savePetStateToStorage(get());
  },

  play: () => {
    if (!canControlPet()) return;
    const state = get();
    set({
      currentState: 'playing',
      happiness: Math.min(100, state.happiness + 15),
      energy: Math.max(0, state.energy - 10),
      mood: 'Super Excited! 🎾',
      lastUpdated: Date.now(),
    });
    get().addXP(25);
    get().addLog(`Your pet played with toy`, 'play');


    savePetStateToStorage(get());
  },

  bathe: () => {
    if (!canControlPet()) return;
    const state = get();
    set({
      currentState: 'bathing',
      cleanliness: Math.min(100, state.cleanliness + 25),
      happiness: Math.min(100, state.happiness + 5),
      mood: 'Squeaky Clean 🫧',
      lastUpdated: Date.now(),
    });
    get().addXP(15);
    get().addLog(`Your pet had a warm bath`, 'bath');


    savePetStateToStorage(get());
  },

  sleep: () => {
    if (!canControlPet()) return;
    const state = get();
    const isSleeping = state.currentState === 'sleeping';
    if (isSleeping) {
      set({
        currentState: 'idle',
        mood: 'Well Rested ☀️',
      });
      get().addLog(`Your pet woke up`, 'sleep');
    } else {
      set({
        currentState: 'sleeping',
        energy: Math.min(100, state.energy + 30),
        mood: 'Dreaming Zzz... 💤',
        lastUpdated: Date.now(),
      });
      get().addXP(15);
      get().addLog(`Your pet went to sleep Zzz...`, 'sleep');
    }
    savePetStateToStorage(get());
  },

  pet: () => {
    if (!canControlPet()) return;
    const state = get();
    set({
      currentState: 'happy',
      happiness: Math.min(100, state.happiness + 10),
      mood: 'Feeling Loved ❤️',
      lastUpdated: Date.now(),
    });
    get().addXP(8);
    get().addLog(`You petted Your pet!`, 'pet');


    savePetStateToStorage(get());
  },

  setCompanion: settings => {
    const update = { ...settings };
    if (update.checkInMinutes !== undefined) update.checkInMinutes = update.checkInMinutes === 5 ? 5 : 10;
    if (update.focusTopic !== undefined) update.focusTopic = update.focusTopic.slice(0, 120);
    set({ ...update, ...(update.checkInMinutes !== undefined || update.checkInsEnabled !== undefined ? { lastCheckInAt: Date.now() } : {}) });
    savePetStateToStorage(get());
  },
  requestCheckIn: () => { set({ checkInRequest: Date.now() }); savePetStateToStorage(get()); },
  markCheckIn: () => { set({ lastCheckInAt: Date.now() }); savePetStateToStorage(get()); },

  applyDecay: () => {
    if (!canControlPet()) return;
    const state = get();
    const now = Date.now();
    const elapsedMinutes = Math.floor((now - state.lastUpdated) / 60000);

    if (elapsedMinutes <= 0) return;

    // Cozy, relaxed decay rates
    const ticks = (minutes: number) => Math.floor(now / (minutes * 60000)) - Math.floor(state.lastUpdated / (minutes * 60000));
    let hungerLoss = ticks(12) * 2;
    let happyLoss = ticks(15);
    let cleanLoss = ticks(20);
    let energyDelta = 0;

    if (state.currentState === 'sleeping') {
      energyDelta = ticks(5) * 5;
    } else {
      energyDelta = -ticks(25);
    }

    const newHunger = Math.max(0, state.hunger - hungerLoss);
    const newHappy = Math.max(0, state.happiness - happyLoss);
    const newClean = Math.max(0, state.cleanliness - cleanLoss);
    const newEnergy = Math.min(100, Math.max(0, state.energy + energyDelta));

    // Health calculation based on stats
    const avgStats = (newHunger + newHappy + newClean + newEnergy) / 4;
    const newHealth = Math.min(100, Math.max(10, Math.round(avgStats)));

    set({
      hunger: newHunger,
      happiness: newHappy,
      cleanliness: newClean,
      energy: newEnergy,
      health: newHealth,
      journal: { ...state.journal, daysAlive: Math.max(1, Math.floor((now - (state.adoptedAt || now)) / 86400000) + 1) },
      lastUpdated: now,
    });

    savePetStateToStorage(get());
  },
}));

// One observer per extension surface, without writing received changes back.
observePetStorage(state => usePetStore.setState(state));
setInterval(() => {
  if (typeof document === 'undefined' || !document.hidden) usePetStore.getState().applyDecay();
}, 60000);

// Every surface completes received actions, even if the initiating popup closes.
let actionTimer: ReturnType<typeof setTimeout> | undefined;
usePetStore.subscribe((state, previous) => {
  if (state.currentState === previous.currentState && state.lastUpdated === previous.lastUpdated) return;
  clearTimeout(actionTimer);
  const duration: Partial<Record<PetAnimState, number>> = { eating: 3500, playing: 4000, bathing: 4000, happy: 2500 };
  const delay = duration[state.currentState];
  if (delay) actionTimer = setTimeout(() => usePetStore.getState().setState('idle'), delay);
});
