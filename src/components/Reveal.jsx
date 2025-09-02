
import React from 'react'
import { useParams } from 'react-router-dom'
import { listenGame } from '../firebase'
import confetti from 'canvas-confetti'

const FILLERS = ['BABY','LOVE','FAMILY','HAPPY','WOW','SMILE','👶','🎉','✨','💖','💙','TEAM','MOM','DAD','FRIENDS','JOY']

export default function Reveal() {
  const { gameId } = useParams()
  const [game, setGame] = React.useState(null)
  const [tiles, setTiles] = React.useState([])
  const [lockedLetters, setLockedLetters] = React.useState(0)
  const DURATION = 15000 // 15s

  React.useEffect(()=>{
    const off = listenGame(gameId, setGame)
    return ()=> off && off()
  },[gameId])

  React.useEffect(()=>{
    if (!game?.revealText) return
    setLockedLetters(0) // reset
    const word = game.revealText.toUpperCase()
    const totalTiles = 140
    setTiles(Array.from({length: totalTiles}, ()=> FILLERS[(Math.random()*FILLERS.length)|0]))

    const shuffleInt = setInterval(()=>{
      setTiles(prev => prev.map((t)=> (Math.random() < 0.12 ? FILLERS[(Math.random()*FILLERS.length)|0] : t)))
      confetti({ particleCount: 14, spread: 80, startVelocity: 26, origin: { y: 0.9 }, gravity: 1.15, scalar: 0.8 })
    }, 110)

    const lockTotalTime = DURATION * 0.6
    const perLetter = Math.max(120, lockTotalTime / Math.max(1, word.length))
    let letterIndex = 0
    const lockTimer = setInterval(()=>{
      letterIndex++
      setLockedLetters(i => Math.min(word.length, i+1))
      if (letterIndex >= word.length) clearInterval(lockTimer)
    }, perLetter)

    setTimeout(()=>{
      confetti({ particleCount: 220, spread: 120, origin: { y: 0.8 } })
      setTimeout(()=> confetti({ particleCount: 320, spread: 140, origin: { y: 0.7 } }), 420)
      setTimeout(()=> confetti({ particleCount: 480, spread: 160, origin: { y: 0.6 } }), 920)
    }, DURATION - 1200)

    const stopTimeout = setTimeout(()=>{
      clearInterval(shuffleInt)
      clearInterval(lockTimer)
    }, DURATION)

    return ()=>{
      clearInterval(shuffleInt)
      clearInterval(lockTimer)
      clearTimeout(stopTimeout)
    }
  },[game?.revealText])

  if (!game) return <div className="container"><p>Cargando…</p></div>
  const word = (game.revealText || '').toUpperCase()
  const shown = word.split('').map((ch, idx)=> idx < lockedLetters ? ch : '•').join('')

  return (
    <div className="container celebration">
      <h2 className="glow">¡Revelación!</h2>
      <p className="muted">15s · confeti + mosaico</p>

      <div className="mosaic colorful">
        {tiles.map((t,i)=>(
          <div className="tile" key={i}>{t}</div>
        ))}
      </div>

      <div className="reveal center">
        <div className="label">Resultado:</div>
        <div className="result badge">{shown}</div>
      </div>
    </div>
  )
}
