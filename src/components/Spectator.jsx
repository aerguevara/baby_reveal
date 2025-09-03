
import React from 'react'
import { useParams } from 'react-router-dom'
import { listenAllVotes, listenPlayers, listenGame, listenQuestion } from '../firebase'
import confetti from 'canvas-confetti'
import ShimmerText from './ShimmerText'
import VoteBars from './VoteBars'

const FILLERS = ['BABY','LOVE','FAMILY','HAPPY','WOW','SMILE','👶','🎉','✨','💖','💙','TEAM','MOM','DAD','FRIENDS','JOY']

export default function Spectator() {
  const { gameId } = useParams()
  const [game, setGame] = React.useState(null)
  const [votes, setVotes] = React.useState([])
  const [players, setPlayers] = React.useState({})
  const [question, setQuestion] = React.useState(null)

  // Fullscreen removed

  // Ensure body uses spectator background (prevents dark flash on reload)
  React.useEffect(() => {
    document.body.classList.add('spectator')
    return () => {
      document.body.classList.remove('spectator')
    }
  }, [])

  React.useEffect(()=>{
    const offG = listenGame(gameId, setGame)
    const offV = listenAllVotes(gameId, setVotes)
    const offP = listenPlayers(gameId, setPlayers)
    return ()=>{ offG && offG(); offV && offV(); offP && offP() }
  },[gameId])

  // Listen to current question text to display in results
  React.useEffect(() => {
    if (!game || typeof game.currentQuestionIndex !== 'number') return
    const offQ = listenQuestion(gameId, game.currentQuestionIndex, setQuestion)
    return () => offQ && offQ()
  }, [gameId, game?.currentQuestionIndex])

  // Fullscreen logic removed

  // Old reveal animation removed; handled inside RevealFestive component

  if (!game) return <div className="container spectator"><p>Cargando…</p></div>

  const Aname = game.optionsText?.[0] || 'A'
  const Bname = game.optionsText?.[1] || 'B'
  const phase = game?.phase || 'question'

  const totals = votes.reduce((acc,v)=>{
    if (v.choice === 'A') acc.A++
    if (v.choice === 'B') acc.B++
    return acc
  }, {A:0,B:0})

  const showReveal = game.status === 'finished' && game.revealTriggered

  // Fullscreen toggle removed

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

      {!showReveal && (
        <h1 className="pw-header">🎉 Baby Reveal Trivia 🎉</h1>
      )}

      {!showReveal ? (
        phase === 'results' ? (
          <ResultsList
            questionText={question?.text || ''}
            Aname={Aname}
            Bname={Bname}
            votes={votes.filter(v => v.questionIndex === (game.currentQuestionIndex || 0))}
            players={players}
          />
        ) : (
          <VoteBars
            title={game.title}
            subtitle="En vivo: ranking de votos"
            Aname={Aname}
            Bname={Bname}
            totals={totals}
            votes={votes}
            width={1100}
            scale={1.6}
          />
        )
      ) : (
        <RevealFestive text={(game.revealText || '').toUpperCase()} duration={15000} />
      )}
    </div>
  )
}

function ResultsList({ questionText, Aname, Bname, votes, players }) {
  const animalForId = (id='') => {
    const animals = ['🐶','🐱','🐻','🐼','🐨','🦊','🐯','🦁','🐮','🐷','🐸','🐵','🐔','🐧','🐦','🦄','🦉','🐙','🦕','🦒','🐢','🦁','🐰','🦜']
    let h = 0
    for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0
    return animals[h % animals.length]
  }
  const votersA = votes.filter(v=>v.choice==='A').map(v=>({ id: v.playerId, name: players[v.playerId]?.name || 'Anónimo', avatar: players[v.playerId]?.avatar || animalForId(v.playerId) }))
  const votersB = votes.filter(v=>v.choice==='B').map(v=>({ id: v.playerId, name: players[v.playerId]?.name || 'Anónimo', avatar: players[v.playerId]?.avatar || animalForId(v.playerId) }))
  return (
    <div className="pw-card" style={{ width: 'min(1100px, 95vw)', margin: '0 auto' }}>
      {!!questionText && (
        <>
          <p className="muted" style={{ marginTop: 0 }}>Pregunta:</p>
          <p className="big" style={{ color:'#0e1520', fontWeight:800, marginTop: 0, fontSize: '1.6rem' }}>{questionText}</p>
        </>
      )}
      <div className="row" style={{alignItems:'flex-start'}}>
        <div style={{flex:1, display:'flex', flexDirection:'column', alignItems:'center'}}>
          <h4 style={{margin:'8px 0', textAlign:'center', fontSize: '1.6rem'}}>💖 {Aname}</h4>
          <ul style={{ listStyle: 'none', paddingLeft: 0, margin: '6px 0', display:'flex', flexDirection:'column', alignItems:'center' }}>
            {votersA.length ? votersA.map((p,i)=>(
              <li
                key={p.id || i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  minHeight: 52,
                  padding: '2px 0',
                  justifyContent: 'center'
                }}
              >
                <span style={{ fontSize: 60, width: 68, textAlign: 'center' }}>{p.avatar}</span>
                <span style={{ lineHeight: 1.2, fontSize: '1.3rem', fontWeight: 800 }}>{p.name}</span>
              </li>
            )) : <li className="muted">Sin votos</li>}
          </ul>
        </div>
        <div style={{flex:1, display:'flex', flexDirection:'column', alignItems:'center'}}>
          <h4 style={{margin:'8px 0', textAlign:'center', fontSize: '1.6rem'}}>💙 {Bname}</h4>
          <ul style={{ listStyle: 'none', paddingLeft: 0, margin: '6px 0', display:'flex', flexDirection:'column', alignItems:'center' }}>
            {votersB.length ? votersB.map((p,i)=>(
              <li
                key={p.id || i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  minHeight: 52,
                  padding: '2px 0',
                  justifyContent: 'center'
                }}
              >
                <span style={{ fontSize: 60, width: 68, textAlign: 'center' }}>{p.avatar}</span>
                <span style={{ lineHeight: 1.2, fontSize: '1.3rem', fontWeight: 800 }}>{p.name}</span>
              </li>
            )) : <li className="muted">Sin votos</li>}
          </ul>
        </div>
      </div>
    </div>
  )
}

// VoteBars moved to shared component

function RevealFestive({ text, duration = 15000 }) {
  const [display, setDisplay] = React.useState('')
  const [revealed, setRevealed] = React.useState(false)
  const [tick, setTick] = React.useState(0)

  React.useEffect(() => {
    if (!text) return
    // Center word rolling
    const wordInt = setInterval(() => {
      const next = FILLERS[(Math.random() * FILLERS.length) | 0]
      setDisplay(next)
      setTick(t => t + 1)
    }, 120)

    // Corner confetti loop
    let corner = 0
    const corners = [
      { x: 0.02, y: 0.05 }, // top-left
      { x: 0.98, y: 0.05 }, // top-right
      { x: 0.02, y: 0.98 }, // bottom-left
      { x: 0.98, y: 0.98 }, // bottom-right
    ]
    const confInt = setInterval(() => {
      const o = corners[corner % 4]
      corner++
      confetti({
        particleCount: 16,
        spread: 80,
        startVelocity: 32,
        decay: 0.92,
        gravity: 1.0,
        origin: o,
        scalar: 0.9,
      })
    }, 260)

    // Final reveal
    const fin = setTimeout(() => {
      setRevealed(true)
      setDisplay(text)
      clearInterval(wordInt)

      // Grand finale from all corners
      const blast = (opts) => confetti({ particleCount: 180, spread: 120, scalar: 1.0, ...opts })
      setTimeout(() => blast({ origin: corners[0], startVelocity: 40 }), 0)
      setTimeout(() => blast({ origin: corners[1], startVelocity: 42 }), 200)
      setTimeout(() => blast({ origin: corners[2], startVelocity: 44 }), 400)
      setTimeout(() => blast({ origin: corners[3], startVelocity: 46 }), 600)
    }, duration)

    return () => {
      clearInterval(wordInt)
      clearInterval(confInt)
      clearTimeout(fin)
    }
  }, [text, duration])

  return (
    <div className="reveal-stage">
      {revealed ? (
        <div className="zoom-reveal">
          <ShimmerText>{display}</ShimmerText>
        </div>
      ) : (
        <div className={`center-word rolling`} key={tick}>{display}</div>
      )}
      {!revealed && <div className="reveal-hint">✨ Revelando…</div>}
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

function FinalWordSVG({ text }) {
  // Render gradient-filled text with SVG to control fill separately from CSS
  // Responsive sizing via viewBox and CSS width
  const gradId = 'reveal_grad'
  const filterId = 'reveal_shadow'
  return (
    <svg className="reveal-svg" viewBox="0 0 1000 240" role="img" aria-label={text} preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ff7eb3" />
          <stop offset="100%" stopColor="#7ebaff" />
        </linearGradient>
        <filter id={filterId} x="-20%" y="-40%" width="140%" height="180%" colorInterpolationFilters="sRGB">
          <feDropShadow dx="0" dy="0" stdDeviation="1.2" floodColor="#081224" floodOpacity="0.9" />
          <feDropShadow dx="0" dy="3" stdDeviation="3.2" floodColor="#0a1420" floodOpacity="0.45" />
        </filter>
      </defs>
      <text className="pulse" x="50%" y="50%" textAnchor="middle" dominantBaseline="middle"
        fontFamily="Inter, system-ui, Avenir, Helvetica, Arial, sans-serif"
        fontWeight="900" fontSize="150" fill={`url(#${gradId})`} filter={`url(#${filterId})`}
        lengthAdjust="spacingAndGlyphs" textLength="900">
        {text}
      </text>
    </svg>
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
