import { app, BrowserWindow, globalShortcut, ipcMain } from 'electron'
import { join } from 'path'
import { startHook, stopHook } from './keyboardHook.js'
import * as timerManager from './timerManager.js'
import store from './store.js'
import { ATTACK_TYPES } from './attackTypes.js'

let mainWindow
let resultsWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 260,
    height: 380,
    alwaysOnTop: true,
    transparent: true,
    frame: false,
    resizable: false,
    skipTaskbar: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  // Set alwaysOnTop level to appear over fullscreen games
  mainWindow.setAlwaysOnTop(true, 'screen-saver')

  if (process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

function createResultsWindow() {
  if (resultsWindow && !resultsWindow.isDestroyed()) {
    resultsWindow.focus()
    return
  }

  const mainBounds = mainWindow.getBounds()
  resultsWindow = new BrowserWindow({
    width: 320,
    height: mainBounds.height,
    x: mainBounds.x + mainBounds.width + 8,
    y: mainBounds.y,
    alwaysOnTop: true,
    transparent: true,
    frame: false,
    resizable: false,
    skipTaskbar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  resultsWindow.setAlwaysOnTop(true, 'screen-saver')

  if (process.env.ELECTRON_RENDERER_URL) {
    resultsWindow.loadURL(process.env.ELECTRON_RENDERER_URL + '#results')
  } else {
    resultsWindow.loadFile(join(__dirname, '../renderer/index.html'), { hash: 'results' })
  }

  resultsWindow.on('closed', () => { resultsWindow = null })
}

function closeResultsWindow() {
  if (resultsWindow && !resultsWindow.isDestroyed()) {
    resultsWindow.close()
  }
  resultsWindow = null
}

function registerHotkeys() {
  globalShortcut.unregisterAll()

  const hotkeys = store.get('hotkeys')

  try {
    globalShortcut.register(hotkeys.start, () => {
      mainWindow?.webContents.send('hotkey:start-triggered')
    })
  } catch (e) {
    console.error('[hotkey] Failed to register start hotkey:', e)
  }

  try {
    globalShortcut.register(hotkeys.stop, () => {
      timerManager.stop()
    })
  } catch (e) {
    console.error('[hotkey] Failed to register stop hotkey:', e)
  }
}

// IPC handlers
ipcMain.handle('timer:start', (_event, type) => {
  closeResultsWindow()
  timerManager.start(type)
})

ipcMain.handle('timer:stop', () => {
  return timerManager.stop()
})

ipcMain.handle('hotkey:get', () => {
  return store.get('hotkeys')
})

ipcMain.handle('hotkey:set', (_event, hotkeys) => {
  store.set('hotkeys', hotkeys)
  registerHotkeys()
  return store.get('hotkeys')
})

ipcMain.handle('results:get', () => {
  return store.get('results', [])
})

ipcMain.handle('attackTypes:get', () => {
  return ATTACK_TYPES
})

ipcMain.handle('results:open', () => createResultsWindow())
ipcMain.handle('results:close', () => closeResultsWindow())

ipcMain.handle('results:delete', (_event, id) => {
  const results = store.get('results', []).filter((r) => r.id !== id)
  store.set('results', results)
  return results
})

ipcMain.handle('results:clear', () => {
  store.set('results', [])
  return []
})

ipcMain.handle('app:quit', () => {
  app.quit()
})

app.whenReady().then(() => {
  createWindow()
  registerHotkeys()
  startHook()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  globalShortcut.unregisterAll()
  stopHook()
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
