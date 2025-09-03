
import React from 'react'
import { useParams } from 'react-router-dom'
import { listenAllVotes, listenPlayers, listenGame, listenQuestion } from '../firebase'
import VoteBars from './VoteBars'

export default function Ranking() {
  const { gameId } = useParams()
  const [votes, setVotes] = React.useState([])
  const [players, setPlayers] = React.useState({})
  const [game, setGame] = React.useState(null)
  const [sending, setSending] = React.useState(false)
  const [questions, setQuestions] = React.useState({})

  React.useEffect(()=>{
    const offV = listenAllVotes(gameId, setVotes)
    const offP = listenPlayers(gameId, setPlayers)
    const offG = listenGame(gameId, setGame)
    return ()=>{ offV && offV(); offP && offP(); offG && offG() }
  },[gameId])

  // Cargar textos de preguntas para mostrarlos en el detalle
  React.useEffect(() => {
    if (!game?.questionsCount) return
    const offs = []
    for (let i = 0; i < (game.questionsCount || 0); i++) {
      const off = listenQuestion(gameId, i, (q) => {
        if (!q) return
        setQuestions(prev => ({ ...prev, [i]: q }))
      })
      offs.push(off)
    }
    return () => { offs.forEach(fn => fn && fn()) }
  }, [gameId, game?.questionsCount])

  const Aname = game?.optionsText?.[0] || 'A'
  const Bname = game?.optionsText?.[1] || 'B'

  const totals = votes.reduce((acc,v)=>{
    if (v.choice === 'A') acc.A++
    if (v.choice === 'B') acc.B++
    return acc
  }, {A:0,B:0})

  const votersA = votes.filter(v=>v.choice==='A').map(v=>players[v.playerId]?.name || 'Anónimo')
  const votersB = votes.filter(v=>v.choice==='B').map(v=>players[v.playerId]?.name || 'Anónimo')

  // Agrupar por pregunta con nombres de votantes
  const byQuestion = React.useMemo(() => {
    const g = {}
    for (const v of votes) {
      const idx = typeof v.questionIndex === 'number' ? v.questionIndex : 0
      if (!g[idx]) g[idx] = { A: [], B: [] }
      if (v.choice === 'A') g[idx].A.push(v.playerId)
      if (v.choice === 'B') g[idx].B.push(v.playerId)
    }
    return g
  }, [votes])

  const questionIndices = React.useMemo(() => {
    if (typeof game?.questionsCount === 'number' && game.questionsCount > 0) {
      return Array.from({ length: game.questionsCount }, (_, i) => i)
    }
    return Object.keys(byQuestion).map(n => parseInt(n, 10)).sort((a,b)=>a-b)
  }, [game?.questionsCount, byQuestion])

  // Auto-reveal is handled by Host now; no manual button here

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

      <h1 className="pw-header">🎉 Baby Reveal Trivia 🎉</h1>

      <div className="pw-card" style={{ textAlign: 'center' }}>
        <h3 style={{marginTop:0}}>{game?.title || 'Ranking de votos'}</h3>
        {!game && <p className="muted">Cargando…</p>}
        <div className="row" style={{ justifyContent: 'center' }}>
          <div className="pill">{Aname}: <strong>{totals.A}</strong></div>
          <div className="pill">{Bname}: <strong>{totals.B}</strong></div>
        </div>
        <div className="row" style={{marginTop: '8px', justifyContent: 'center'}}>
          <div className="status-chip">Revelación: {game?.revealTriggered ? 'Lanzada 🎉' : (game?.status==='finished' ? 'Automática desde Host…' : 'En juego')}</div>
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <VoteBars
          title={null}
          subtitle="Resumen global de votos"
          Aname={Aname}
          Bname={Bname}
          totals={totals}
          votes={votes}
          width={560}
        />
      </div>

      <div className="pw-card" style={{ marginTop: 12 }}>
        <h3 style={{marginTop:0}}>Resumen por pregunta</h3>
        {questionIndices.length === 0 && (
          <p className="muted">Sin preguntas registradas aún.</p>
        )}
        {questionIndices.map((qi) => {
          const grp = byQuestion[qi] || { A: [], B: [] }
          const listA = grp.A.map(pid => ({ id: pid, name: players[pid]?.name || 'Anónimo', avatar: players[pid]?.avatar }))
          const listB = grp.B.map(pid => ({ id: pid, name: players[pid]?.name || 'Anónimo', avatar: players[pid]?.avatar }))
          return (
            <div key={qi} className="card" style={{ background:'rgba(255,255,255,0.22)', border:'1px solid rgba(255,255,255,0.45)', borderRadius:12, padding:12, margin:'10px 0' }}>
              <div className="row" style={{justifyContent:'space-between', alignItems:'center'}}>
                <div className="pill" style={{maxWidth:'100%', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
                  {questions[qi]?.text || `Pregunta #${qi+1}`}
                </div>
                <div className="row" style={{gap:8}}>
                  <div className="pill">{Aname}: <strong>{listA.length}</strong></div>
                  <div className="pill">{Bname}: <strong>{listB.length}</strong></div>
                </div>
              </div>
              <div className="row" style={{alignItems:'flex-start', marginTop:8}}>
                <div style={{flex:1}}>
                  <h4 style={{margin:'8px 0'}}>{Aname}</h4>
                  <ul style={{ listStyle: 'none', paddingLeft: 0, margin: '6px 0' }}>
                    {listA.length ? listA.map((p,i)=>(
                      <li key={p.id || i} style={{ display:'flex', alignItems:'center', gap:8, minHeight: 28 }}>
                        <span style={{ fontSize: 24, lineHeight: 1, width: 28, textAlign: 'center' }}>{p.avatar || '🧑'}</span>
                        <span>{p.name}</span>
                      </li>
                    )) : <li className="muted">Sin votos</li>}
                  </ul>
                </div>
                <div style={{flex:1}}>
                  <h4 style={{margin:'8px 0'}}>{Bname}</h4>
                  <ul style={{ listStyle: 'none', paddingLeft: 0, margin: '6px 0' }}>
                    {listB.length ? listB.map((p,i)=>(
                      <li key={p.id || i} style={{ display:'flex', alignItems:'center', gap:8, minHeight: 28 }}>
                        <span style={{ fontSize: 24, lineHeight: 1, width: 28, textAlign: 'center' }}>{p.avatar || '🧑'}</span>
                        <span>{p.name}</span>
                      </li>
                    )) : <li className="muted">Sin votos</li>}
                  </ul>
                </div>
              </div>
            </div>
          )
        })}
      </div>
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
