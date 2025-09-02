
import { initializeApp } from 'firebase/app'
import { getAuth, signInAnonymously } from 'firebase/auth'
import {
  getFirestore, doc, setDoc, collection, onSnapshot, updateDoc, getDoc,
  serverTimestamp, increment, query, where
} from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)

export async function ensureAnonAuth() {
  try { await signInAnonymously(auth) } catch (e) { console.error(e) }
}

export async function createGame(meta, questions) {
  await ensureAnonAuth()
  const gameRef = doc(collection(db, 'games'))
  await setDoc(gameRef, {
    ...meta,
    playersCount: 0,
    createdAt: serverTimestamp()
  })
  const ops = questions.map((q, idx) =>
    setDoc(doc(db, 'games', gameRef.id, 'questions', String(idx)), { index: idx, text: q })
  )
  await Promise.all(ops)
  return gameRef.id
}

export function listenGame(gameId, cb) {
  return onSnapshot(doc(db,'games',gameId), snap => cb({ id: snap.id, ...snap.data() }))
}

export function listenQuestion(gameId, idx, cb) {
  return onSnapshot(doc(db,'games',gameId,'questions',String(idx)), snap => cb(snap.data()))
}

export function listenPlayers(gameId, cb) {
  return onSnapshot(collection(db,'games',gameId,'players'), snap => {
    const players = {}
    snap.forEach(d => { players[d.id] = d.data() })
    cb(players)
  })
}

export function listenAllVotes(gameId, cb) {
  return onSnapshot(collection(db,'games',gameId,'votes'), snap => {
    const votes = []
    snap.forEach(d => votes.push({ id: d.id, ...d.data() }))
    cb(votes)
  })
}

export async function joinGame(gameId, name) {
  await ensureAnonAuth()
  const pRef = doc(collection(db,'games',gameId,'players'))
  await setDoc(pRef, { name, joinedAt: serverTimestamp() })
  await updateDoc(doc(db,'games',gameId), { playersCount: increment(1) })
  return pRef.id
}

export async function submitVote(gameId, playerId, questionIndex, choice) {
  await ensureAnonAuth()
  const voteId = `${playerId}_${questionIndex}`
  const vRef = doc(collection(db,'games',gameId,'votes'), voteId)
  await setDoc(vRef, { playerId, questionIndex, choice, at: serverTimestamp() })
}

export function listenVotes(gameId, questionIndex, cb) {
  const col = collection(db,'games',gameId,'votes')
  const q = query(col, where('questionIndex','==', questionIndex))
  return onSnapshot(q, snap => {
    const votes = []
    snap.forEach(d => votes.push(d.data()))
    cb(votes)
  })
}

export async function nextQuestion(gameId) {
  const gRef = doc(db,'games',gameId)
  const gSnap = await getDoc(gRef)
  const g = gSnap.data()
  const next = (g.currentQuestionIndex || 0) + 1
  const finished = next >= (g.questionsCount || 0)
  await updateDoc(gRef, {
    currentQuestionIndex: next,
    status: finished ? 'finished' : g.status || 'running'
  })
}

export async function startGame(gameId) {
  await updateDoc(doc(db,'games',gameId), { status: 'running' })
}

export async function setRevealTriggered(gameId, value=true) {
  await updateDoc(doc(db,'games',gameId), { revealTriggered: value })
}
