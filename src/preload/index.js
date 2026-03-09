import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('api', {
  // Timer control
  timerStart: (type) => ipcRenderer.invoke('timer:start', type),
  timerStop: () => ipcRenderer.invoke('timer:stop'),

  // Hotkey management
  hotkeyGet: () => ipcRenderer.invoke('hotkey:get'),
  hotkeySet: (hotkeys) => ipcRenderer.invoke('hotkey:set', hotkeys),

  // Results
  resultsGet: () => ipcRenderer.invoke('results:get'),
  resultsDelete: (id) => ipcRenderer.invoke('results:delete', id),
  resultsClear: () => ipcRenderer.invoke('results:clear'),

  // Attack types
  attackTypesGet: () => ipcRenderer.invoke('attackTypes:get'),

  // Results window
  resultsOpen: () => ipcRenderer.invoke('results:open'),
  resultsClose: () => ipcRenderer.invoke('results:close'),

  // App control
  appQuit: () => ipcRenderer.invoke('app:quit'),

  // Event listeners (main → renderer)
  onTimerTick: (callback) => {
    const listener = (_event, data) => callback(data)
    ipcRenderer.on('timer:tick', listener)
    return () => ipcRenderer.removeListener('timer:tick', listener)
  },
  onTimerPhase: (callback) => {
    const listener = (_event, data) => callback(data)
    ipcRenderer.on('timer:phase', listener)
    return () => ipcRenderer.removeListener('timer:phase', listener)
  },
  onTimerStopped: (callback) => {
    const listener = (_event, data) => callback(data)
    ipcRenderer.on('timer:stopped', listener)
    return () => ipcRenderer.removeListener('timer:stopped', listener)
  },
  onHotkeyStartTriggered: (callback) => {
    const listener = () => callback()
    ipcRenderer.on('hotkey:start-triggered', listener)
    return () => ipcRenderer.removeListener('hotkey:start-triggered', listener)
  },
})
