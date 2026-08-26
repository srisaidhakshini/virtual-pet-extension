import { create } from 'zustand';
import { loadPetStateFromStorage, savePetStateToStorage, StoredPetState } from '../storage/storage';

export type PetType = 'cat' | 'dog' | 'bunny' | 'hamster' | 'bird' | 'penguin' | 'panda' | 'elephant';
export type PetAnimState = 'idle' | 'walking-left' | 'walking-right' | 'happy' | 'eating' | 'playing' | 'bathing' | 'sleeping';

export interface ActivityItem {
  id: string;
  text: string;
  time: string;
  type: string;
}

export interface PetState extends StoredPetState {
  isAutoWalkEnabled: boolean;

  // Actions
  setName: (name: string) => void;
  setPetType: (type: PetType) => void;
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
  
  // Accessories & Customization
  toggleAccessory: (accId: string) => void;
  
  // Internal update & decay
  applyDecay: () => void;
  addXP: (amount: number) => void;
  addLog: (text: string, type: string) => void;
  initFromStorage: () => Promise<void>;
}

const DEFAULT_STATE: StoredPetState & { isAutoWalkEnabled: boolean } = {
  name: 'Mochi',
  petType: 'cat',
  level: 5,
  xp: 340,
  hunger: 82,
  happiness: 94,
  energy: 45,
  cleanliness: 60,
  health: 98,
  mood: 'Super Cozy! ✨',
  accessories: ['glasses', 'bow', 'hat', 'crown', 'scarf'],
  equippedAccessories: ['bow'],
  currentState: 'idle',
  direction: 'right',
  position: { x: 300, y: 150 },
  lastUpdated: Date.now(),
  streak: 7,
  activitiesLog: [
    { id: '1', text: 'Mochi ate a pixel cookie', time: '2m ago', type: 'food' },
    { id: '2', text: 'Mochi found 5 coins!', time: '15m ago', type: 'coin' },
    { id: '3', text: 'Mochi had a bubbly bath', time: '1h ago', type: 'bath' },
  ],
  journal: {
    stepsWalked: 14842,
    pagesVisited: 182,
    daysAlive: 48,
  },
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

export const usePetStore = create<PetState>((set, get) => ({
  ...DEFAULT_STATE,

  initFromStorage: async () => {
    const saved = await loadPetStateFromStorage();
    if (saved) {
      set({ ...saved });
    }
    get().applyDecay();
  },

  setName: (name) => {
    set({ name });
    savePetStateToStorage(get());
  },

  setPetType: (petType) => {
    set({ petType });
    savePetStateToStorage(get());
  },

  setState: (currentState) => {
    set({ currentState });
    savePetStateToStorage(get());
  },

  setDirection: (direction) => {
    set({ direction });
    savePetStateToStorage(get());
  },

  setPosition: (position) => {
    set({ position });
    savePetStateToStorage(get());
  },

  toggleOverlayVisible: () => {
    const next = !get().overlayVisible;
    set({ overlayVisible: next });
    savePetStateToStorage(get());
  },

  toggleAutoWalk: () => {
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
      get().addLog(`🎉 ${state.name} leveled up to Lv. ${newLevel}!`, 'level');
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
    set({ activitiesLog: updated });
    savePetStateToStorage(get());
  },

  feed: () => {
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
    get().addLog(`${state.name} ate a pixel treat`, 'food');
    
    setTimeout(() => {
      if (get().currentState === 'eating') {
        set({ currentState: 'idle' });
        savePetStateToStorage(get());
      }
    }, 3500);

    savePetStateToStorage(get());
  },

  play: () => {
    const state = get();
    set({
      currentState: 'playing',
      happiness: Math.min(100, state.happiness + 15),
      energy: Math.max(0, state.energy - 10),
      mood: 'Super Excited! 🎾',
      lastUpdated: Date.now(),
    });
    get().addXP(25);
    get().addLog(`${state.name} played with toy`, 'play');

    setTimeout(() => {
      if (get().currentState === 'playing') {
        set({ currentState: 'idle' });
        savePetStateToStorage(get());
      }
    }, 4000);

    savePetStateToStorage(get());
  },

  bathe: () => {
    const state = get();
    set({
      currentState: 'bathing',
      cleanliness: Math.min(100, state.cleanliness + 25),
      happiness: Math.min(100, state.happiness + 5),
      mood: 'Squeaky Clean 🫧',
      lastUpdated: Date.now(),
    });
    get().addXP(15);
    get().addLog(`${state.name} had a warm bath`, 'bath');

    setTimeout(() => {
      if (get().currentState === 'bathing') {
        set({ currentState: 'idle' });
        savePetStateToStorage(get());
      }
    }, 4000);

    savePetStateToStorage(get());
  },

  sleep: () => {
    const state = get();
    const isSleeping = state.currentState === 'sleeping';
    if (isSleeping) {
      set({
        currentState: 'idle',
        mood: 'Well Rested ☀️',
      });
      get().addLog(`${state.name} woke up`, 'sleep');
    } else {
      set({
        currentState: 'sleeping',
        energy: Math.min(100, state.energy + 30),
        mood: 'Dreaming Zzz... 💤',
        lastUpdated: Date.now(),
      });
      get().addXP(15);
      get().addLog(`${state.name} went to sleep Zzz...`, 'sleep');
    }
    savePetStateToStorage(get());
  },

  pet: () => {
    const state = get();
    set({
      currentState: 'happy',
      happiness: Math.min(100, state.happiness + 10),
      mood: 'Feeling Loved ❤️',
      lastUpdated: Date.now(),
    });
    get().addXP(8);
    get().addLog(`You petted ${state.name}!`, 'pet');

    setTimeout(() => {
      if (get().currentState === 'happy') {
        set({ currentState: 'idle' });
        savePetStateToStorage(get());
      }
    }, 2500);

    savePetStateToStorage(get());
  },

  toggleAccessory: (accId) => {
    const state = get();
    const isEquipped = state.equippedAccessories.includes(accId);
    const updated = isEquipped
      ? state.equippedAccessories.filter((id) => id !== accId)
      : [...state.equippedAccessories, accId];
    
    set({ equippedAccessories: updated });
    savePetStateToStorage(get());
  },

  applyDecay: () => {
    const state = get();
    const now = Date.now();
    const elapsedMinutes = Math.floor((now - state.lastUpdated) / 60000);

    if (elapsedMinutes <= 0) return;

    // Cozy, relaxed decay rates
    let hungerLoss = Math.floor(elapsedMinutes / 12) * 2;
    let happyLoss = Math.floor(elapsedMinutes / 15) * 1;
    let cleanLoss = Math.floor(elapsedMinutes / 20) * 1;
    let energyDelta = 0;

    if (state.currentState === 'sleeping') {
      energyDelta = Math.floor(elapsedMinutes / 5) * 5;
    } else {
      energyDelta = -Math.floor(elapsedMinutes / 25) * 1;
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
      lastUpdated: now,
    });

    savePetStateToStorage(get());
  },
}));
