import { create } from 'zustand';
import { RoomClient, offlineRoom, type RoomCommand, type RoomView, type Snapshot } from './roomClient';
import { setSharedControl } from './guard';

export const useRoomStore = create<RoomView>(() => offlineRoom());
const receive = (view: RoomView) => {
  setSharedControl(view.status === 'connected', view.controllerId === view.id);
  useRoomStore.setState(view, true);
};
const extension = () => typeof chrome !== 'undefined' && !!chrome.runtime?.id && !!chrome.storage?.local;
let started = false;
let local: RoomClient | undefined;
export function startRoomTransport() {
  if (started) return;
  started = true;
  if (window.desktopPet) {
    window.desktopPet.onRoom(receive);
    void window.desktopPet.roomView().then(receive).catch(() => {});
  } else if (extension()) {
    chrome.runtime.onMessage.addListener(message => { if (message.type === 'ROOM_EVENT') receive(message.view); });
    void chrome.runtime.sendMessage({ type: 'ROOM_VIEW' }).then(receive).catch(() => {});
  } else local = new RoomClient(receive);
}
export function roomCommand(command: RoomCommand) {
  startRoomTransport();
  if (window.desktopPet) void window.desktopPet.roomCommand(command).catch(() => {});
  else if (extension()) void chrome.runtime.sendMessage({ type: 'ROOM_COMMAND', command }).catch(() => receive({ ...offlineRoom(), error: 'Reload the extension and refresh this tab.' }));
  else local?.command(command);
}
export function publishRoom(snapshot: Snapshot) {
  if (window.desktopPet) return; // Native positions are published by the desktop main process.
  if (extension()) void chrome.runtime.sendMessage({ type: 'ROOM_PUBLISH', snapshot }).catch(() => {});
  else local?.publish(snapshot);
}
