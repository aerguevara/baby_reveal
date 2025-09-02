
import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.jsx'
import Host from './components/Host.jsx'
import Player from './components/Player.jsx'
import Ranking from './components/Ranking.jsx'
import Reveal from './components/Reveal.jsx'
import Spectator from './components/Spectator.jsx'
import './styles.css'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/host/:gameId" element={<Host />} />
        <Route path="/play/:gameId" element={<Player />} />
        <Route path="/ranking/:gameId" element={<Ranking />} />
        <Route path="/reveal/:gameId" element={<Reveal />} />
        <Route path="/spectator/:gameId" element={<Spectator />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
