
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createGame } from './firebase'

export default function App() {
  const [title, setTitle] = useState('Baby Reveal Trivia')
  const [optionA, setOptionA] = useState('Albanys')
  const [optionB, setOptionB] = useState('Anyelo')
  const [revealText, setRevealText] = useState('Hacker Etica')
  const [questionsText, setQuestionsText] = useState(
`¿Quién crees que va a cambiar más pañales?
¿Quién crees que se queda dormido primero?
¿Quién crees que hará más fotos?
¿Quién crees que será más consentidor/a?
¿Quién crees que cantará más nanas?
¿Quién crees que será más estricto/a con rutinas?`
  )
  const navigate = useNavigate()

  const onCreate = async () => {
    const questions = questionsText.split('\n').map(s => s.trim()).filter(Boolean)
    const gameId = await createGame({
      title,
      optionsText: [optionA, optionB],
      revealText,
      currentQuestionIndex: 0,
      status: 'lobby',
      questionsCount: questions.length,
      revealTriggered: false
    }, questions)
    navigate(`/host/${gameId}`)
  }

  return (
    <div className="player-welcome">
      <div className="pw-decor pw-balloons left">
        <BalloonSVG color="pink" />
        <BalloonSVG color="blue" />
        <BalloonSVG color="pink" />
      </div>
      <div className="pw-decor pw-balloons right">
        <BalloonSVG color="blue" />
        <BalloonSVG color="pink" />
        <BalloonSVG color="blue" />
      </div>
      <div className="pw-decor pw-balloons bottom-left">
        <BalloonSVG color="pink" />
        <BalloonSVG color="blue" />
      </div>
      <div className="pw-decor pw-balloons bottom-right">
        <BalloonSVG color="blue" />
        <BalloonSVG color="pink" />
      </div>
      <ConfettiCorner pos="tl" count={60} />
      <ConfettiCorner pos="tr" count={60} />
      <ConfettiCorner pos="bl" count={60} />
      <ConfettiCorner pos="br" count={60} />

      <h1 className="pw-header">🎉 Baby Reveal Trivia 🎉</h1>

      <div className="pw-card">
        <label>Título</label>
        <div className="pw-input-wrap">
          <span className="pw-icon">📝</span>
          <input value={title} onChange={e=>setTitle(e.target.value)} />
        </div>

        <label>Nombre 1 (opción A)</label>
        <div className="pw-input-wrap">
          <span className="pw-icon">💖</span>
          <input value={optionA} onChange={e=>setOptionA(e.target.value)} disabled />
        </div>

        <label>Nombre 2 (opción B)</label>
        <div className="pw-input-wrap">
          <span className="pw-icon">💙</span>
          <input value={optionB} onChange={e=>setOptionB(e.target.value)} disabled />
        </div>

        <label>Texto de revelación</label>
        <div className="pw-input-wrap">
          <span className="pw-icon">🎯</span>
          <select value={revealText} onChange={e=>setRevealText(e.target.value)}>
            <option value="Hacker Etica">Hacker Etica</option>
            <option value="Ingeniero de IA">Ingeniero de IA</option>
          </select>
        </div>

        <label>Preguntas (una por línea)</label>
        <div className="pw-input-wrap">
          <span className="pw-icon">✍️</span>
          <textarea rows="8" value={questionsText} onChange={e=>setQuestionsText(e.target.value)} />
        </div>

        <button className="pw-button" onClick={onCreate}>Crear partida</button>
      </div>

      <div className="pw-card" style={{ marginTop: 16 }}>
        <h3 style={{ marginTop: 0 }}>Enlaces</h3>
        <p className="muted">Host: <code>/host/&lt;gameId&gt;</code> · Jugadores: <code>/play/&lt;gameId&gt;</code> · Ranking: <code>/ranking/&lt;gameId&gt;</code> · Revelación: <code>/reveal/&lt;gameId&gt;</code> · <strong>Espectador</strong>: <code>/spectator/&lt;gameId&gt;</code></p>
      </div>
      <p className="pw-footer">Configura tu juego y comparte los enlaces 💙💖</p>
    </div>
  )
}

function ConfettiCorner({ pos, count = 40 }) {
  const items = Array.from({ length: count })
  return (
    <div className={`pw-decor pw-confetti ${pos}`}>
      {items.map((_, i) => {
        const size = 6 + Math.random()*6
        const dur = 4 + Math.random()*3
        const delay = Math.random()*2
        const dxBase = 140 + Math.random()*220
        const dyBase = 200 + Math.random()*280
        const signs = { tl: [1,1], tr: [-1,1], bl: [1,-1], br: [-1,-1] }[pos] || [1,1]
        const dx = signs[0] * dxBase
        const dy = signs[1] * dyBase
        return (
          <span
            key={i}
            style={{
              left: `${Math.random()*100}%`,
              top: `${Math.random()*100}%`,
              width: `${size}px`,
              height: `${size}px`,
              borderRadius: `${Math.random() < 0.3 ? 50 : 2}%`,
              background: ['#ff7eb3','#7ebaff','#ffd36e','#7cffcb'][Math.floor(Math.random()*4)],
              animationDelay: `${delay}s`,
              animationDuration: `${dur}s`,
              '--dx': `${dx}px`,
              '--dy': `${dy}px`,
            }}
          />
        )
      })}
    </div>
  )
}

function BalloonSVG({ color = 'pink' }) {
  const gradId = `g_${color}`
  const stops = color === 'pink'
    ? [ ['0%','#ffb6c1'], ['100%','#ff7eb3'] ]
    : [ ['0%','#add8e6'], ['100%','#7ebaff'] ]
  return (
    <svg className="pw-balloon" width="44" height="66" viewBox="0 0 44 66" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          {stops.map(([o,c],i)=>(<stop key={i} offset={o} stopColor={c} />))}
        </linearGradient>
      </defs>
      <ellipse cx="22" cy="22" rx="18" ry="22" fill={`url(#${gradId})`} />
      <path d="M22 44 L19 48 L25 48 Z" fill="#c48" opacity="0.6" />
      <path d="M22 48 C 22 60, 12 64, 10 66" stroke="#555" strokeWidth="1" fill="none" />
    </svg>
  )
}
