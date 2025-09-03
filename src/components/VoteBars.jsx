import React from 'react'

export default function VoteBars({ title, subtitle, Aname, Bname, totals, votes, width, scale = 1 }) {
  const totalVotes = Math.max(0, (totals?.A || 0) + (totals?.B || 0))
  const pct = (n) => (totalVotes ? Math.round((n / totalVotes) * 100) : 0)
  const aPct = pct(totals?.A || 0)
  const bPct = pct(totals?.B || 0)
  const cardWidth = typeof width === 'number' ? width : 680
  const s = Math.max(1, Number(scale) || 1)

  const styles = {
    card: { padding: 28 * s, width: `min(${cardWidth}px, 95vw)`, margin: '0 auto' },
    header: { marginBottom: 12 * s },
    subtitle: { margin: '4px 0 16px', color: '#6b7280', fontSize: `${14 * s}px` },
    row: { display: 'flex', alignItems: 'center', gap: 12 * s, margin: `${12 * s}px 0` },
    label: { minWidth: 120 * s, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 * s, fontSize: `${16 * s}px` },
    barWrap: { flex: 1, background: '#eee', height: 32 * s, borderRadius: 999, overflow: 'hidden', position: 'relative' },
    fillA: { background: '#ff6ea8', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', color: '#fff', paddingRight: 10 * s, fontSize: `${16 * s}px` },
    fillB: { background: '#60a5fa', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', color: '#fff', paddingRight: 10 * s, fontSize: `${16 * s}px` },
    counts: { fontWeight: 700 },
    totals: { marginTop: 10 * s, color: '#6b7280', fontSize: `${14 * s}px` },
    emojiStream: { marginTop: 16 * s, display: 'flex', flexWrap: 'wrap', gap: 6 * s, fontSize: 22 * s, justifyContent: 'center' },
  }

  const choiceEmoji = (c) => (c === 'A' ? '💖' : '💙')
  const recent = (votes || []).slice(-40)

  return (
    <div className="pw-card" style={styles.card}>
      <div style={styles.header}>
        {!!title && <h1 className="xl" style={{ margin: 0 }}>{title}</h1>}
        {!!subtitle && <p className="muted" style={styles.subtitle}>{subtitle}</p>}
      </div>

      <div style={styles.row}>
        <div style={styles.label}><span>💖</span> {Aname}</div>
        <div style={styles.barWrap}>
          <div style={{ ...styles.fillA, width: `${aPct}%` }}>
            <span style={styles.counts}>{totals?.A || 0} · {aPct}%</span>
          </div>
        </div>
      </div>

      <div style={styles.row}>
        <div style={styles.label}><span>💙</span> {Bname}</div>
        <div style={styles.barWrap}>
          <div style={{ ...styles.fillB, width: `${bPct}%` }}>
            <span style={styles.counts}>{totals?.B || 0} · {bPct}%</span>
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
