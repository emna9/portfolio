import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { installAudioFetchCompat } from './utils/audioFetchCompat'

// Must run before three.js starts loading the scene audio.
installAudioFetchCompat()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
