
import React from 'react'
import { useParams } from 'react-router-dom'
import { listenAllVotes, listenPlayers, listenGame } from '../firebase'

export default function Ranking() {
  const { gameId } = useParams()
  const [votes, setVotes] = React.useState([])
  const [players, setPlayers] = React.useState({})
  const [game, setGame] = React.useState(null)
  const [sending, setSending] = React.useState(false)

  React.useEffect(()=>{
    const offV = listenAllVotes(gameId, setVotes)
    const offP = listenPlayers(gameId, setPlayers)
    const offG = listenGame(gameId, setGame)
    return ()=>{ offV && offV(); offP && offP(); offG && offG() }
  },[gameId])

  const Aname = game?.optionsText?.[0] || 'A'
  const Bname = game?.optionsText?.[1] || 'B'

  const totals = votes.reduce((acc,v)=>{
    if (v.choice === 'A') acc.A++
    if (v.choice === 'B') acc.B++
    return acc
  }, {A:0,B:0})

  const votersA = votes.filter(v=>v.choice==='A').map(v=>players[v.playerId]?.name || 'Anónimo')
  const votersB = votes.filter(v=>v.choice==='B').map(v=>players[v.playerId]?.name || 'Anónimo')

  // Auto-reveal is handled by Host now; no manual button here

  return (
    <div className="container">
      <h2>Ranking de votos</h2>
      {!game && <p className="muted">Cargando…</p>}

      {game && (
        <div className="card">
          <h3>{game.title}</h3>
          <div className="row">
            <div className="pill">{Aname}: <strong>{totals.A}</strong></div>
            <div className="pill">{Bname}: <strong>{totals.B}</strong></div>
          </div>
          <div className="row" style={{marginTop: '8px'}}>
            <div className="chip">Revelación: {game.revealTriggered ? 'Lanzada 🎉' : (game.status==='finished' ? 'Automática desde Host…' : 'En juego')}</div>
          </div>
          <p className="muted">La revelación aparece en <code>/spectator/{gameId}</code>. El Host la lanza automáticamente al terminar.</p>
        </div>
      )}

      <div className="card">
        <h3>Detalle de votantes</h3>
        <div className="row" style={{alignItems:'flex-start'}}>
          <div style={{flex:1}}>
            <h4>{Aname}</h4>
            <ul>
              {votersA.length ? votersA.map((n,i)=>(<li key={i}>{n}</li>)) : <li className="muted">Sin votos aún</li>}
            </ul>
          </div>
          <div style={{flex:1}}>
            <h4>{Bname}</h4>
            <ul>
              {votersB.length ? votersB.map((n,i)=>(<li key={i}>{n}</li>)) : <li className="muted">Sin votos aún</li>}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
