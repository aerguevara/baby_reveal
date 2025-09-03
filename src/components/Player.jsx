
import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import useGame from '../hooks/useGame'
import { joinGame, submitVote } from '../firebase'

export default function Player() {
  const { gameId } = useParams()
  const navigate = useNavigate()
  const { game, question, votes } = useGame(gameId)
  const [name, setName] = useState('')
  const [playerId, setPlayerId] = useState(null)
  const [voted, setVoted] = useState(false)
  const [redirecting, setRedirecting] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(3)
  const [nameError, setNameError] = useState(false)

  useEffect(()=>{ setVoted(false) },[question?.index])


  // Detect end of questions and start redirect flow once
  useEffect(() => {
    const noMore = game?.status === 'finished' || (
      typeof game?.currentQuestionIndex === 'number' && typeof game?.questionsCount === 'number' &&
      game.currentQuestionIndex >= game.questionsCount
    )
    if (noMore && !redirecting) {
      setRedirecting(true)
    }
  }, [game?.status, game?.currentQuestionIndex, game?.questionsCount, redirecting])

  // When redirecting, run a short countdown and navigate
  useEffect(() => {
    if (!redirecting) return
    setSecondsLeft(3)
    const tick = setInterval(() => setSecondsLeft(s => Math.max(0, s - 1)), 1000)
    const to = setTimeout(() => navigate(`/spectator/${gameId}`, { replace: true }), 3000)
    return () => { clearInterval(tick); clearTimeout(to) }
  }, [redirecting, navigate, gameId])

  const doJoin = async () => {
    if (!name.trim()) { setNameError(true); return }
    setNameError(false)
    const id = await joinGame(gameId, name.trim())
    setPlayerId(id)
  }

  const vote = async (choice) => {
    if (!playerId || voted) return
    await submitVote(gameId, playerId, question?.index || 0, choice)
    setVoted(true)
  }

  if (!game) return <div className="container"><p>Conectando…</p></div>

  const A = game?.optionsText?.[0] || 'Albanys'
  const B = game?.optionsText?.[1] || 'Anyelo'
  const phase = game?.phase || 'question'
  const isRunning = game?.status === 'running'

  if (!playerId) return (
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
        <label>Tu nombre o emoji</label>
        <div className={`pw-input-wrap ${nameError ? 'error' : ''}`}>
          <span className="pw-icon">👤</span>
          <input
            value={name}
            onChange={e=>setName(e.target.value)}
            onKeyDown={e=>{ if(e.key==='Enter') doJoin() }}
            placeholder="Ej: Ana, 😍 🚀"
          />
        </div>
        {nameError && (
          <p className="pw-error">Por favor, introduce un nombre o emoji válido</p>
        )}
        <button className="pw-button" onClick={doJoin}>¡Unirme al juego!</button>
      </div>
      <p className="pw-footer">¡Prepárate para descubrir el gran secreto! 💙💖</p>
    </div>
  )

  if (redirecting) return (
    <div className="player-welcome">
      <div className="pw-decor pw-balloons left"><BalloonSVG color="pink" /><BalloonSVG color="blue" /><BalloonSVG color="pink" /></div>
      <div className="pw-decor pw-balloons right"><BalloonSVG color="blue" /><BalloonSVG color="pink" /><BalloonSVG color="blue" /></div>
      <div className="pw-decor pw-balloons bottom-left"><BalloonSVG color="pink" /><BalloonSVG color="blue" /></div>
      <div className="pw-decor pw-balloons bottom-right"><BalloonSVG color="blue" /><BalloonSVG color="pink" /></div>
      <ConfettiCorner pos="tl" count={50} />
      <ConfettiCorner pos="tr" count={50} />
      <ConfettiCorner pos="bl" count={50} />
      <ConfettiCorner pos="br" count={50} />

      <h1 className="pw-header">🎉 Baby Reveal Trivia 🎉</h1>
      <div className="pw-card center">
        <p className="big">¡Se acabaron las preguntas! 🎉</p>
        <p className="muted">Vamos a la revelación en {secondsLeft}s…</p>
      </div>
      <p className="pw-footer">¡Prepárate para descubrir el gran secreto! 💙💖</p>
    </div>
  )

  // Esperar a que el Host inicie la partida (no mostrar preguntas todavía)
  if (!isRunning) return (
    <div className="player-welcome">
      <div className="pw-decor pw-balloons left"><BalloonSVG color="pink" /><BalloonSVG color="blue" /><BalloonSVG color="pink" /></div>
      <div className="pw-decor pw-balloons right"><BalloonSVG color="blue" /><BalloonSVG color="pink" /><BalloonSVG color="blue" /></div>
      <div className="pw-decor pw-balloons bottom-left"><BalloonSVG color="pink" /><BalloonSVG color="blue" /></div>
      <div className="pw-decor pw-balloons bottom-right"><BalloonSVG color="blue" /><BalloonSVG color="pink" /></div>
      <ConfettiCorner pos="tl" count={40} />
      <ConfettiCorner pos="tr" count={40} />
      <ConfettiCorner pos="bl" count={40} />
      <ConfettiCorner pos="br" count={40} />

      <h1 className="pw-header">🎉 Baby Reveal Trivia 🎉</h1>
      <div className="pw-card center">
        <p className="big">Esperando que empiece la partida…</p>
        <p className="muted">El presentador iniciará el juego en breve.</p>
      </div>
      <p className="pw-footer">¡Prepárate para divertirte! 💙💖</p>
    </div>
  )

  // Mostrar resultados entre preguntas: en Player solo se indica que están en resultados en la pantalla
  if (isRunning && phase === 'results') {
    return (
      <div className="player-welcome">
        <div className="pw-decor pw-balloons left"><BalloonSVG color="pink" /><BalloonSVG color="blue" /><BalloonSVG color="pink" /></div>
        <div className="pw-decor pw-balloons right"><BalloonSVG color="blue" /><BalloonSVG color="pink" /><BalloonSVG color="blue" /></div>
        <div className="pw-decor pw-balloons bottom-left"><BalloonSVG color="pink" /><BalloonSVG color="blue" /></div>
        <div className="pw-decor pw-balloons bottom-right"><BalloonSVG color="blue" /><BalloonSVG color="pink" /></div>
        <ConfettiCorner pos="tl" count={40} />
        <ConfettiCorner pos="tr" count={40} />
        <ConfettiCorner pos="bl" count={40} />
        <ConfettiCorner pos="br" count={40} />

        <h1 className="pw-header">🎉 Resultados</h1>
        <div className="pw-card center" style={{ width: 'min(560px, 92vw)', margin: '0 auto' }}>
          <p className="big">Mostrando resultados en la pantalla del espectador…</p>
          <p className="muted">Espera a la siguiente pregunta</p>
        </div>
        <p className="pw-footer">Gracias por jugar 💙💖</p>
      </div>
    )
  }

  return (
    <div className="player-welcome">
      <div className="pw-decor pw-balloons left"><BalloonSVG color="pink" /><BalloonSVG color="blue" /><BalloonSVG color="pink" /></div>
      <div className="pw-decor pw-balloons right"><BalloonSVG color="blue" /><BalloonSVG color="pink" /><BalloonSVG color="blue" /></div>
      <div className="pw-decor pw-balloons bottom-left"><BalloonSVG color="pink" /><BalloonSVG color="blue" /></div>
      <div className="pw-decor pw-balloons bottom-right"><BalloonSVG color="blue" /><BalloonSVG color="pink" /></div>
      <ConfettiCorner pos="tl" count={50} />
      <ConfettiCorner pos="tr" count={50} />
      <ConfettiCorner pos="bl" count={50} />
      <ConfettiCorner pos="br" count={50} />

      <h1 className="pw-header">🎉 Baby Reveal Trivia 🎉</h1>
      <div className="pw-card">
        <p className="muted">Pregunta #{(game.currentQuestionIndex||0)+1} de {game.questionsCount || '-'}</p>
        <p className="big" style={{color:'#0e1520', fontWeight:800}}>{question?.text || 'Esperando…'}</p>
        <div className="pw-row">
          <button className="pw-button pw-optionA" disabled={voted || phase !== 'question'} onClick={()=>vote('A')}>💖 {A}</button>
          <button className="pw-button pw-optionB" disabled={voted || phase !== 'question'} onClick={()=>vote('B')}>💙 {B}</button>
        </div>
        {voted && <p className="ok">¡Voto enviado! Espera la siguiente pregunta.</p>}
        {game?.status === 'finished' && <p className="ok">¡Se acabaron las preguntas! 🎉</p>}
      </div>
      <p className="pw-footer">¡Prepárate para descubrir el gran secreto! 💙💖</p>
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
        // travel vectors based on corner
        const dxBase = 140 + Math.random()*220
        const dyBase = 200 + Math.random()*280
        const signs = {
          tl: [1,1], tr: [-1,1], bl: [1,-1], br: [-1,-1]
        }[pos] || [1,1]
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
