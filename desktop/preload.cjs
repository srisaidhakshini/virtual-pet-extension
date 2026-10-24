const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('desktopPet', {
  roomView: () => ipcRenderer.invoke('room:view'),
  roomCommand: command => ipcRenderer.invoke('room:command', command),
  onRoom: callback => {
    const listener = (_event, value) => callback(value);
    ipcRenderer.on('room:event', listener);
    return () => ipcRenderer.removeListener('room:event', listener);
  },
  loadState: () => ipcRenderer.invoke('pet:load'),
  saveState: changes => ipcRenderer.invoke('pet:save', changes),
  behavior: value => ipcRenderer.send('pet:behavior', value),
  interactive: value => ipcRenderer.send('pet:interactive', value),
  drag: value => ipcRenderer.send('pet:drag', value),
  openRoom: () => ipcRenderer.send('pet:room'),
  checkIn: text => ipcRenderer.invoke('pet:check-in', text),
  menu: () => ipcRenderer.send('pet:menu'),
  onState: callback => {
    const listener = (_event, value) => callback(value);
    ipcRenderer.on('pet:state', listener);
    return () => ipcRenderer.removeListener('pet:state', listener);
  },
  onMotion: callback => {
    const listener = (_event, value) => callback(value);
    ipcRenderer.on('pet:motion', listener);
    return () => ipcRenderer.removeListener('pet:motion', listener);
  },
  onAction: callback => {
    const listener = (_event, value) => callback(value);
    ipcRenderer.on('pet:action', listener);
    return () => ipcRenderer.removeListener('pet:action', listener);
  },
});
