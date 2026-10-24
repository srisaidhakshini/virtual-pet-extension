import { RoomClient } from '../connection/roomClient';
// Background Service Worker for Virtual Pet Extension

chrome.runtime.onInstalled.addListener(() => {
  console.log('Virtual Pet Extension Installed!');
});

// Configure Side Panel behavior if supported
if (chrome.sidePanel?.setPanelBehavior) {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false }).catch(() => {});
}

const room = new RoomClient(view => {
  void chrome.runtime.sendMessage({ type: 'ROOM_EVENT', view }).catch(() => {});
  void chrome.tabs.query({ active: true }).then(tabs => Promise.all(tabs.filter(tab => tab.id).map(tab => chrome.tabs.sendMessage(tab.id!, { type: 'ROOM_EVENT', view }).catch(() => {}))));
});
chrome.runtime.onMessage.addListener((request, sender, respond) => {
  if (sender.id !== chrome.runtime.id) return;
  if (request.type === 'ROOM_VIEW') respond(room.view);
  if (request.type === 'ROOM_COMMAND' && request.command && ['create','join','leave','request-control','pass-control'].includes(request.command.type)) { room.command(request.command); respond({ ok: true }); }
  if (request.type === 'ROOM_PUBLISH') { room.publish(request.snapshot); respond({ ok: true }); }
  if (request.type === 'PING') respond({ status: 'PONG' });
});
chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== 'local' || !changes.virtual_pet_state_v1?.newValue || !room.view.snapshot || room.view.id !== room.view.controllerId) return;
  const value = changes.virtual_pet_state_v1.newValue;
  const { petSize, hunger, happiness, energy, cleanliness, health, currentState, direction } = value;
  room.publish({ ...room.view.snapshot, petSize, hunger, happiness, energy, cleanliness, health, currentState, direction });
});
