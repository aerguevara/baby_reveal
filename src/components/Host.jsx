
import React, { useMemo, useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import useGame from '../hooks/useGame'
import { startGame, nextQuestion, setRevealTriggered } from '../firebase'

export default function Host() {
  const { gameId } = useParams()
  const navigate = useNavigate()
  const { game, question, votes } = useGame(gameId)
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const spectatorUrl = `${origin}/spectator/${gameId}`
  const playerUrl = `${origin}/play/${gameId}`

  const counts = useMemo(()=>{
    const c = { A:0, B:0 }
    votes.forEach(v => { if (v.choice==='A' || v.choice==='B') c[v.choice]++ })
    return c
  },[votes])

  const [revealing, setRevealing] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(3)
  const [copied, setCopied] = useState({ player: false, spectator: false })

  // Detect finished state and arm the reveal flow once
  useEffect(() => {
    if (!game) return
    const isFinished = game.status === 'finished'
    const alreadyRevealed = !!game.revealTriggered
    if (isFinished && !alreadyRevealed && !revealing) {
      setRevealing(true)
    }
  }, [game?.status, game?.revealTriggered, revealing])

  // When revealing, run countdown and trigger reveal
  useEffect(() => {
    if (!revealing) return
    setSecondsLeft(3)
    const tick = setInterval(()=> setSecondsLeft(s => Math.max(0, s-1)), 1000)
    const to = setTimeout(async ()=>{
      try { await setRevealTriggered(gameId, true) } finally {}
    }, 3000)
    return ()=>{ clearInterval(tick); clearTimeout(to) }
  }, [revealing, gameId])

  if (!game) return <div className="container"><p>Cargando partida…</p></div>

  const isRunning = game.status === 'running'
  const isFinished = game.status === 'finished'

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
      <ConfettiCorner pos="tl" count={50} />
      <ConfettiCorner pos="tr" count={50} />
      <ConfettiCorner pos="bl" count={50} />
      <ConfettiCorner pos="br" count={50} />

      <h1 className="pw-header">🎉 Baby Reveal Trivia 🎉</h1>

      <div className="pw-card" style={{ marginBottom: 12 }}>
        <p className="muted" style={{margin:0}}>ID: {gameId} · Invitados: <strong>{game.playersCount || 0}</strong> · Pregunta {(game.currentQuestionIndex||0)+1}/{game.questionsCount || '-'}</p>
      </div>

      {isRunning ? (
        <div className="pw-card">
          <h3 style={{marginTop:0}}>Pregunta #{(game.currentQuestionIndex||0)+1}</h3>
          <p className="big" style={{color:'#0e1520', fontWeight:800}}>{question?.text || '...'}</p>
          <div className="row">
            <div className="pill">Votos {game.optionsText?.[0] || 'A'}: {counts.A}</div>
            <div className="pill">Votos {game.optionsText?.[1] || 'B'}: {counts.B}</div>
          </div>
          <div className="row">
            <div className="chip">A = {game.optionsText?.[0]}</div>
            <div className="chip">B = {game.optionsText?.[1]}</div>
          </div>
          <div className="pw-row">
            <button className="pw-button" onClick={()=>nextQuestion(gameId)}>Siguiente pregunta</button>
            <Link className="button" to={`/ranking/${gameId}`}>Ver ranking</Link>
            <Link className="button" to={`/spectator/${gameId}`}>Abrir espectador</Link>
          </div>
          <p className="muted">Al terminar la última pregunta, se preparará la revelación automáticamente.</p>
        </div>
      ) : isFinished ? (
        <div className="pw-card center">
          <h3 style={{marginTop:0}}>¡Fin de preguntas!</h3>
          {!game.revealTriggered ? (
            <>
              <p className="big" style={{color:'#0e1520', fontWeight:800}}>Revelamos automáticamente en {secondsLeft}s…</p>
              <p className="muted">La revelación se verá en el espectador y en dispositivos de los jugadores.</p>
              <div className="pw-row" style={{justifyContent:'center'}}>
                <Link className="button" to={`/spectator/${gameId}`}>Ver espectador</Link>
                <Link className="button" to={`/ranking/${gameId}`}>Ver ranking</Link>
              </div>
            </>
          ) : (
            <>
              <p className="ok">¡Revelación lanzada! 🎉</p>
              <div className="pw-row" style={{justifyContent:'center'}}>
                <Link className="button" to={`/spectator/${gameId}`}>Ver espectador</Link>
                <Link className="button" to={`/ranking/${gameId}`}>Ver ranking</Link>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="pw-card">
          <h3 style={{marginTop:0}}>Lobby del presentador</h3>
          <div className="row" style={{alignItems: 'stretch'}}>
            <div style={{ flex: 1 }}>
              <label>URL Jugadores</label>
              <div className="pw-input-wrap" style={{gap:8}}>
                <span className="pw-icon">🔗</span>
                <input readOnly value={playerUrl} onFocus={(e)=>e.target.select()} />
              </div>
              <div className="pw-row" style={{marginTop:8}}>
                <button className="pw-button" style={{width:'auto'}} onClick={async()=>{
                  try { await navigator.clipboard.writeText(playerUrl); setCopied(s=>({...s, player:true})); setTimeout(()=>setCopied(s=>({...s, player:false})),1200) } catch {}
                }}>{copied.player ? 'Copiado' : 'Copiar URL jugadores'}</button>
              </div>
            </div>
          </div>
          <div className="row" style={{alignItems: 'stretch'}}>
            <div style={{ flex: 1 }}>
              <label>URL Proyección</label>
              <div className="pw-input-wrap" style={{gap:8}}>
                <span className="pw-icon">🔗</span>
                <input readOnly value={spectatorUrl} onFocus={(e)=>e.target.select()} />
              </div>
              <div className="pw-row" style={{marginTop:8}}>
                <button className="pw-button" style={{width:'auto'}} onClick={async()=>{
                  try { await navigator.clipboard.writeText(spectatorUrl); setCopied(s=>({...s, spectator:true})); setTimeout(()=>setCopied(s=>({...s, spectator:false})),1200) } catch {}
                }}>{copied.spectator ? 'Copiado' : 'Copiar URL espectador'}</button>
              </div>
            </div>
          </div>
          <div className="pw-row" style={{marginTop: '8px'}}>
            <a className="button" href={`/spectator/${gameId}`} target="_blank" rel="noopener noreferrer">Abrir espectador en nueva pestaña</a>
            <a className="button" href={`/play/${gameId}`} target="_blank" rel="noopener noreferrer">Abrir jugador en nueva pestaña</a>
          </div>
          <button className="pw-button" onClick={()=>startGame(gameId)}>Iniciar juego</button>
        </div>
      )}
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
