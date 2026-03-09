import { BrowserWindow } from 'electron'
import store from './store.js'

const state = {
  status: 'idle', // 'idle' | 'running'
  type: null,
  startTime: null,
  phaseStartTime: null,
  phases: [],
  tickInterval: null,
}

function broadcast(channel, payload) {
  BrowserWindow.getAllWindows().forEach((win) => {
    if (!win.isDestroyed()) {
      win.webContents.send(channel, payload)
    }
  })
}

function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  const millis = ms % 1000
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(millis).padStart(3, '0')}`
}

export function start(type) {
  if (state.status === 'running') return

  const now = Date.now()
  state.status = 'running'
  state.type = type
  state.startTime = now
  state.phaseStartTime = now
  state.phases = []

  state.tickInterval = setInterval(() => {
    if (state.status !== 'running') return
    const now = Date.now()
    const totalElapsed = now - state.startTime
    const phaseElapsed = now - state.phaseStartTime
    broadcast('timer:tick', {
      total: totalElapsed,
      totalFormatted: formatTime(totalElapsed),
      phase: phaseElapsed,
      phaseFormatted: formatTime(phaseElapsed),
      phaseNumber: state.phases.length + 1,
    })
  }, 100)

  broadcast('timer:tick', {
    total: 0,
    totalFormatted: formatTime(0),
    phase: 0,
    phaseFormatted: formatTime(0),
    phaseNumber: 1,
  })
}

export function nextPhase() {
  if (state.status !== 'running') return

  const now = Date.now()
  const phaseElapsed = now - state.phaseStartTime
  const completedPhase = {
    number: state.phases.length + 1,
    duration: phaseElapsed,
    durationFormatted: formatTime(phaseElapsed),
  }
  state.phases.push(completedPhase)
  state.phaseStartTime = now

  broadcast('timer:phase', {
    completedPhase,
    newPhaseNumber: state.phases.length + 1,
  })
}

export function stop() {
  if (state.status !== 'running') return

  clearInterval(state.tickInterval)
  state.tickInterval = null

  const now = Date.now()
  const totalElapsed = now - state.startTime

  // Close out last phase
  const lastPhaseElapsed = now - state.phaseStartTime
  state.phases.push({
    number: state.phases.length + 1,
    duration: lastPhaseElapsed,
    durationFormatted: formatTime(lastPhaseElapsed),
  })

  const result = {
    id: Date.now(),
    type: state.type,
    date: new Date().toISOString(),
    totalDuration: totalElapsed,
    totalFormatted: formatTime(totalElapsed),
    phases: state.phases,
  }

  const results = store.get('results', [])
  results.unshift(result)
  // Keep last 100 results
  if (results.length > 100) results.length = 100
  store.set('results', results)

  state.status = 'idle'
  state.type = null
  state.startTime = null
  state.phaseStartTime = null
  state.phases = []

  broadcast('timer:stopped', { result })
  return result
}

export function getStatus() {
  return state.status
}
