import { useState, useEffect, useCallback, useRef } from 'react'
import TypeSelector from './components/TypeSelector'
import TimerDisplay from './components/TimerDisplay'
import PhaseList from './components/PhaseList'
import Settings from './components/Settings'
import LastResult from './components/LastResult'

function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  const millis = ms % 1000
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(millis).padStart(3, '0')}`
}

const EMPTY_DISPLAY = {
  totalFormatted: '00:00.000',
  phaseFormatted: '00:00.000',
  phaseNumber: 1,
}

export default function App() {
  const [running, setRunning] = useState(false)
  const [display, setDisplay] = useState(EMPTY_DISPLAY)
  const [phases, setPhases] = useState([])
  const [attackTypes, setAttackTypes] = useState([])
  const [selectedType, setSelectedType] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [lastResult, setLastResult] = useState(null)

  const startTimeRef = useRef(null)
  const phaseStartTimeRef = useRef(null)
  const phaseNumberRef = useRef(1)
  const rafRef = useRef(null)

  function startRAF() {
    function loop() {
      const now = Date.now()
      setDisplay({
        totalFormatted: formatTime(now - startTimeRef.current),
        phaseFormatted: formatTime(now - phaseStartTimeRef.current),
        phaseNumber: phaseNumberRef.current,
      })
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
  }

  function stopRAF() {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }

  useEffect(() => {
    window.api.attackTypesGet().then((types) => {
      setAttackTypes(types)
      if (types.length > 0) setSelectedType(types[0].id)
    })
  }, [])

  const handleStart = useCallback(() => {
    if (running) return
    const now = Date.now()
    startTimeRef.current = now
    phaseStartTimeRef.current = now
    phaseNumberRef.current = 1
    setPhases([])
    setDisplay(EMPTY_DISPLAY)
    setLastResult(null)
    setRunning(true)
    window.api.timerStart(selectedType)
    startRAF()
  }, [running, selectedType])

  const handleStop = useCallback(async () => {
    if (!running) return
    stopRAF()
    await window.api.timerStop()
    // 결과는 onTimerStopped 이벤트로 수신
  }, [running])

  useEffect(() => {
    const unsubPhase = window.api.onTimerPhase((data) => {
      const now = Date.now()
      phaseStartTimeRef.current = now
      phaseNumberRef.current = data.newPhaseNumber
      setPhases((prev) => [...prev, data.completedPhase])
    })
    const unsubStopped = window.api.onTimerStopped(({ result }) => {
      stopRAF()
      setRunning(false)
      setDisplay(EMPTY_DISPLAY)
      setPhases([])
      setLastResult(result)
    })
    const unsubHotkey = window.api.onHotkeyStartTriggered(() => {
      handleStart()
    })

    return () => {
      unsubPhase()
      unsubStopped()
      unsubHotkey()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedType, running])

  const totalPhases = attackTypes.find((t) => t.id === selectedType)?.totalPhases

  return (
    <div className="h-screen flex flex-col bg-gray-900/90 text-white select-none overflow-hidden rounded-lg border border-gray-700">
      {/* Header */}
      <div
        className="px-3 py-2 bg-gray-800/80 flex items-center justify-between"
        style={{ WebkitAppRegion: 'drag' }}
      >
        <span className="text-xs text-gray-400 font-semibold tracking-wide">TIME ATTACK</span>
        <div className="flex gap-1" style={{ WebkitAppRegion: 'no-drag' }}>
          {!running && (
            <button
              onClick={() => window.api.resultsOpen()}
              className="text-gray-400 hover:text-white text-xs px-1"
              title="기록 보기"
            >
              기록
            </button>
          )}
          <button
            onClick={() => setShowSettings((v) => !v)}
            className="text-gray-400 hover:text-white text-sm px-1"
            title="설정"
          >
            ⚙
          </button>
          <button
            onClick={() => window.api.appQuit()}
            className="text-gray-500 hover:text-red-400 text-sm px-1"
            title="프로그램 종료"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col gap-1 px-2 py-1 overflow-hidden">
        {showSettings ? (
          <Settings onClose={() => setShowSettings(false)} />
        ) : lastResult ? (
          // 완료 후 결과 화면
          <LastResult
            result={lastResult}
            attackTypes={attackTypes}
            onRestart={handleStart}
          />
        ) : (
          // 타이머 화면
          <>
            <TypeSelector
              types={attackTypes}
              selected={selectedType}
              onChange={setSelectedType}
              disabled={running}
            />

            <TimerDisplay
              running={running}
              totalFormatted={display.totalFormatted}
              phaseFormatted={display.phaseFormatted}
              phaseNumber={display.phaseNumber}
              totalPhases={totalPhases}
            />

            <div className="border-t border-gray-700" />

            <div className="flex-1 overflow-hidden">
              <PhaseList phases={phases} />
            </div>

            <div className="border-t border-gray-700" />

            <div className="flex gap-1.5 pb-1">
              <button
                onClick={handleStart}
                disabled={running}
                className="flex-1 py-1 rounded text-xs font-semibold bg-green-700 hover:bg-green-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                시작
              </button>
              <button
                onClick={handleStop}
                disabled={!running}
                className="flex-1 py-1 rounded text-xs font-semibold bg-red-700 hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                종료
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
