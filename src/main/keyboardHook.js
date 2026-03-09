import { BrowserWindow } from 'electron'
import { uIOhook, UiohookKey } from 'uiohook-napi'
import { nextPhase, getStatus } from './timerManager.js'
import store from './store.js'

// DOM e.code → uiohook keycode 매핑
const KEY_MAP = {
  F1: UiohookKey.F1, F2: UiohookKey.F2, F3: UiohookKey.F3,
  F4: UiohookKey.F4, F5: UiohookKey.F5, F6: UiohookKey.F6,
  F7: UiohookKey.F7, F8: UiohookKey.F8, F9: UiohookKey.F9,
  F10: UiohookKey.F10, F11: UiohookKey.F11, F12: UiohookKey.F12,
  Escape: UiohookKey.Escape,
  Insert: UiohookKey.Insert,
  Delete: UiohookKey.Delete,
  Home: UiohookKey.Home,
  End: UiohookKey.End,
  PageUp: UiohookKey.PageUp,
  PageDown: UiohookKey.PageDown,
  Numpad0: UiohookKey.Numpad0, Numpad1: UiohookKey.Numpad1,
  Numpad2: UiohookKey.Numpad2, Numpad3: UiohookKey.Numpad3,
  Numpad4: UiohookKey.Numpad4, Numpad5: UiohookKey.Numpad5,
  Numpad6: UiohookKey.Numpad6, Numpad7: UiohookKey.Numpad7,
  Numpad8: UiohookKey.Numpad8, Numpad9: UiohookKey.Numpad9,
  NumpadAdd: UiohookKey.NumpadAdd,
  NumpadSubtract: UiohookKey.NumpadSubtract,
  NumpadMultiply: UiohookKey.NumpadMultiply,
  NumpadDivide: UiohookKey.NumpadDivide,
  NumpadDecimal: UiohookKey.NumpadDecimal,
  NumpadEnter: UiohookKey.NumpadEnter,
}

function getPhaseKeycode() {
  const key = store.get('hotkeys.phase', 'F9')
  return KEY_MAP[key] ?? UiohookKey.F9
}

function broadcast(channel, payload) {
  BrowserWindow.getAllWindows().forEach((win) => {
    if (!win.isDestroyed()) win.webContents.send(channel, payload)
  })
}

// keydown → keyup 쌍 추적 (중간에 앱이 꺼지는 등의 floating keyup 방지)
let phaseKeyDown = false

export function startHook() {
  uIOhook.on('keydown', (event) => {
    if (event.keycode === getPhaseKeycode()) {
      phaseKeyDown = true
    }
  })

  uIOhook.on('keyup', (event) => {
    if (event.keycode !== getPhaseKeycode()) return
    if (!phaseKeyDown) return
    phaseKeyDown = false

    if (getStatus() === 'running') {
      // 실행 중 → 페이즈 전환
      nextPhase()
    } else {
      // 대기 중 → 타이머 시작 (렌더러에서 선택된 유형으로 시작)
      broadcast('hotkey:start-triggered')
    }
  })

  uIOhook.start()
  console.log('[keyboardHook] uiohook started')
}

export function stopHook() {
  phaseKeyDown = false
  uIOhook.stop()
  console.log('[keyboardHook] uiohook stopped')
}
