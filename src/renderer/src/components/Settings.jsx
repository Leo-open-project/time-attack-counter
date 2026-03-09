import { useState, useEffect } from 'react'

// globalShortcut 방식 (시작/종료): modifier 조합 포함, e.key 사용
function HotkeyCapture({ label, value, onSave }) {
  const [capturing, setCapturing] = useState(false)
  const [pending, setPending] = useState(value)

  useEffect(() => {
    if (!capturing) return

    const handler = (e) => {
      e.preventDefault()
      const parts = []
      if (e.ctrlKey) parts.push('Control')
      if (e.altKey) parts.push('Alt')
      if (e.shiftKey) parts.push('Shift')
      if (['Control', 'Alt', 'Shift', 'Meta'].includes(e.key)) return
      parts.push(e.key)
      const combo = parts.join('+')
      setPending(combo)
      setCapturing(false)
      onSave(combo)
    }

    window.addEventListener('keydown', handler, true)
    return () => window.removeEventListener('keydown', handler, true)
  }, [capturing, onSave])

  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-gray-400 text-xs">{label}</span>
      <button
        onClick={() => setCapturing(true)}
        className={`px-2 py-0.5 rounded text-xs font-mono border ${
          capturing
            ? 'border-yellow-400 text-yellow-400 bg-yellow-400/10 animate-pulse'
            : 'border-gray-600 text-gray-300 bg-gray-800 hover:border-gray-400'
        }`}
      >
        {capturing ? '키를 눌러주세요...' : pending}
      </button>
    </div>
  )
}

// uiohook 방식 (페이즈): modifier 없이 단일 키, e.code 사용
function PhaseKeyCapture({ label, value, onSave }) {
  const [capturing, setCapturing] = useState(false)
  const [pending, setPending] = useState(value)

  useEffect(() => {
    if (!capturing) return

    const handler = (e) => {
      e.preventDefault()
      // modifier 단독 입력 무시
      if (['Control', 'Alt', 'Shift', 'Meta'].includes(e.key)) return
      const code = e.code  // e.g. "F9", "Insert", "Numpad0"
      setPending(code)
      setCapturing(false)
      onSave(code)
    }

    window.addEventListener('keydown', handler, true)
    return () => window.removeEventListener('keydown', handler, true)
  }, [capturing, onSave])

  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-gray-400 text-xs">{label}</span>
      <button
        onClick={() => setCapturing(true)}
        className={`px-2 py-0.5 rounded text-xs font-mono border ${
          capturing
            ? 'border-yellow-400 text-yellow-400 bg-yellow-400/10 animate-pulse'
            : 'border-gray-600 text-gray-300 bg-gray-800 hover:border-gray-400'
        }`}
      >
        {capturing ? '키를 눌러주세요...' : pending}
      </button>
    </div>
  )
}

export default function Settings({ onClose }) {
  const [hotkeys, setHotkeys] = useState({ start: 'F7', stop: 'F8', phase: 'F9' })

  useEffect(() => {
    window.api.hotkeyGet().then(setHotkeys)
  }, [])

  async function handleSave(key, value) {
    const updated = { ...hotkeys, [key]: value }
    const saved = await window.api.hotkeySet(updated)
    setHotkeys(saved)
  }

  return (
    <div className="bg-gray-900/95 border border-gray-700 rounded p-3 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-white text-sm font-semibold">단축키 설정</span>
        <button onClick={onClose} className="text-gray-400 hover:text-white text-xs">✕</button>
      </div>
      <div className="space-y-2">
        <HotkeyCapture
          label="시작"
          value={hotkeys.start}
          onSave={(v) => handleSave('start', v)}
        />
        <HotkeyCapture
          label="종료"
          value={hotkeys.stop}
          onSave={(v) => handleSave('stop', v)}
        />
        <div className="border-t border-gray-700/50 pt-2">
          <PhaseKeyCapture
            label="페이즈 전환"
            value={hotkeys.phase ?? 'F9'}
            onSave={(v) => handleSave('phase', v)}
          />
        </div>
      </div>
      <p className="text-gray-500 text-xs">
        * 페이즈 전환 키: F1-F12, Insert, Delete, Numpad 등 단일 키만 지원
      </p>
    </div>
  )
}
