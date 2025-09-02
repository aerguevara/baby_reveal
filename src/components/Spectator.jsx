
import React from 'react'
import { useParams } from 'react-router-dom'
import { listenAllVotes, listenPlayers, listenGame } from '../firebase'
import confetti from 'canvas-confetti'

const FILLERS = ['BABY','LOVE','FAMILY','HAPPY','WOW','SMILE','👶','🎉','✨','💖','💙','TEAM','MOM','DAD','FRIENDS','JOY']

export default function Spectator() {
  const { gameId } = useParams()
  const [game, setGame] = React.useState(null)
  const [votes, setVotes] = React.useState([])
  const [players, setPlayers] = React.useState({})

  // Fullscreen removed

  React.useEffect(()=>{
    const offG = listenGame(gameId, setGame)
    const offV = listenAllVotes(gameId, setVotes)
    const offP = listenPlayers(gameId, setPlayers)
    return ()=>{ offG && offG(); offV && offV(); offP && offP() }
  },[gameId])

  // Fullscreen logic removed

  // Old reveal animation removed; handled inside RevealFestive component

  if (!game) return <div className="container spectator"><p>Cargando…</p></div>

  const Aname = game.optionsText?.[0] || 'A'
  const Bname = game.optionsText?.[1] || 'B'

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
        <VoteBars
          title={game.title}
          subtitle="En vivo: ranking de votos"
          Aname={Aname}
          Bname={Bname}
          totals={totals}
          votes={votes}
        />
      ) : (
        <RevealFestive text={(game.revealText || '').toUpperCase()} duration={15000} />
      )}
    </div>
  )
}

function VoteBars({ title, subtitle, Aname, Bname, totals, votes }) {
  const totalVotes = Math.max(0, (totals?.A || 0) + (totals?.B || 0))
  const pct = (n) => (totalVotes ? Math.round((n / totalVotes) * 100) : 0)
  const aPct = pct(totals.A || 0)
  const bPct = pct(totals.B || 0)

  const styles = {
    card: { padding: 28, width: 'min(680px, 92vw)' },
    header: { marginBottom: 12 },
    subtitle: { margin: '4px 0 16px', color: '#6b7280' },
    row: { display: 'flex', alignItems: 'center', gap: 12, margin: '12px 0' },
    label: { minWidth: 120, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 },
    barWrap: { flex: 1, background: '#eee', height: 32, borderRadius: 999, overflow: 'hidden', position: 'relative' },
    fillA: { background: '#ff6ea8', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', color: '#fff', paddingRight: 10 },
    fillB: { background: '#60a5fa', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', color: '#fff', paddingRight: 10 },
    counts: { fontWeight: 700 },
    totals: { marginTop: 10, color: '#6b7280' },
    emojiStream: { marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 6, fontSize: 22 },
  }

  const choiceEmoji = (c) => (c === 'A' ? '💖' : '💙')
  const recent = votes.slice(-40)

  return (
    <div className="pw-card" style={styles.card}>
      <div style={styles.header}>
        <h1 className="xl">{title}</h1>
        <p className="muted" style={styles.subtitle}>{subtitle}</p>
      </div>

      <div style={styles.row}>
        <div style={styles.label}><span>💖</span> {Aname}</div>
        <div style={styles.barWrap}>
          <div style={{ ...styles.fillA, width: `${aPct}%` }}>
            <span style={styles.counts}>{totals.A || 0} · {aPct}%</span>
          </div>
        </div>
      </div>

      <div style={styles.row}>
        <div style={styles.label}><span>💙</span> {Bname}</div>
        <div style={styles.barWrap}>
          <div style={{ ...styles.fillB, width: `${bPct}%` }}>
            <span style={styles.counts}>{totals.B || 0} · {bPct}%</span>
          </div>
        </div>
      </div>

      <div className="muted" style={styles.totals}>{totalVotes} votos totales</div>

      {!!recent.length && (
        <div style={styles.emojiStream} aria-label="Actividad reciente">
          {recent.map((v, i) => (
            <span key={i}>{choiceEmoji(v.choice)}</span>
          ))}
        </div>
      )}
    </div>
  )
}

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
      <div className={`center-word ${revealed ? 'final' : 'rolling'}`} key={tick}>
        {display}
      </div>
      {!revealed && <div className="muted" style={{ marginTop: 8 }}>Revelando…</div>}
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
