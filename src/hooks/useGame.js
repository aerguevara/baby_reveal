
import { useEffect, useState } from 'react'
import { listenGame, listenQuestion, listenVotes } from '../firebase'

export default function useGame(gameId) {
  const [game, setGame] = useState(null)
  const [question, setQuestion] = useState(null)
  const [votes, setVotes] = useState([])

  useEffect(()=>{
    const unsub = listenGame(gameId, setGame)
    return () => unsub && unsub()
  },[gameId])

  useEffect(()=>{
    if (!game) return
    const idx = game.currentQuestionIndex || 0
    const offQ = listenQuestion(gameId, idx, setQuestion)
    const offV = listenVotes(gameId, idx, setVotes)
    return () => { offQ && offQ(); offV && offV() }
  },[gameId, game?.currentQuestionIndex])

  return { game, question, votes }
}
