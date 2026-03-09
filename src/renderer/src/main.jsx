import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import ResultsApp from './ResultsApp'
import './index.css'

const isResults = window.location.hash === '#results'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {isResults ? <ResultsApp /> : <App />}
  </React.StrictMode>
)
