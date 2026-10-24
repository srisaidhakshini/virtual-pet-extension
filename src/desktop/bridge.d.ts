import type { RoomView, RoomCommand } from '../connection/roomClient';
import type { StoredPetState } from '../storage/storage';

declare global {
  interface Window {
    desktopPet?: {
      roomView(): Promise<RoomView>;
      roomCommand(command: RoomCommand): Promise<void>;
      onRoom(callback: (view: RoomView) => void): () => void;
      loadState(): Promise<Partial<StoredPetState> | null>;
      saveState(changes: Partial<StoredPetState>): Promise<void>;
      behavior(value: { currentState: string; isAutoWalkEnabled: boolean; overlayVisible: boolean; reducedMotion?: boolean; petSize?: number }): void;
      interactive(value: boolean): void;
      drag(value: boolean): void;
      openRoom(): void;
      menu(): void;
      checkIn(text: string): Promise<boolean>;
      onState(callback: (state: Partial<StoredPetState>) => void): () => void;
      onMotion(callback: (motion: { walking: boolean; direction?: 'left' | 'right' }) => void): () => void;
      onAction(callback: (action: string) => void): () => void;
    };
  }
}
