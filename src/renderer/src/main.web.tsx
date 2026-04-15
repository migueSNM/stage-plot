import './assets/index.css'
import './i18n'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { webApi } from './webApi'
import { DemoGate } from './DemoGate'
import DemoApp from './DemoApp'

// Inject browser mock before any component renders — must happen before Zustand store
// initialises, since the store imports window.api at call-time (not module load time).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(window as any).api = webApi

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <DemoGate>
      <DemoApp />
    </DemoGate>
  </React.StrictMode>
)
