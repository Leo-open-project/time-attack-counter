import Store from 'electron-store'

const store = new Store({
  defaults: {
    hotkeys: {
      start: 'F7',
      stop: 'F8',
      phase: 'F9',
    },
    results: [],
  },
})

export default store
