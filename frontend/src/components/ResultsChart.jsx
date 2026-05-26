import React from 'react'

const COLORS = ['#2563eb', '#7dd3fc', '#34d399', '#f59e0b', '#ef4444', '#a78bfa']

export default function ResultsChart({ results = [] }) {
  if (!results || results.length === 0) {
    return <div style={{ padding: 12 }}>No results yet.</div>
  }

  const total = results.reduce((s, r) => s + (r.vote_count || 0), 0) || 1

  const configuredRadius = 64
  const strokeWidth = 36
  const circumference = 2 * Math.PI * configuredRadius

  let acc = 0
  const arcs = results.map((r, i) => {
    const votes = r.vote_count || 0
    const fraction = votes / total
    const dash = Math.max(fraction * circumference, 1)
    const offset = acc
    acc += dash
    return { id: r.id, name: r.name, votes, color: COLORS[i % COLORS.length], dash, offset, percentage: Math.round(fraction * 100) }
  })

  const top = arcs.reduce((m, a) => (a.votes > (m.votes || 0) ? a : m), arcs[0])

  return (
    <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
      <div style={{ width: 220, height: 220 }}>
        <svg width="220" height="220" viewBox="0 0 220 220">
          <g transform="translate(110,110) rotate(-90)">
            {/* background ring */}
            <circle cx={0} cy={0} r={configuredRadius} fill="none" stroke="#f1f5f9" strokeWidth={strokeWidth} />

            {arcs.map((a) => (
              <circle
                key={a.id}
                cx={0}
                cy={0}
                r={configuredRadius}
                fill="none"
                stroke={a.color}
                strokeWidth={strokeWidth}
                strokeOpacity={0.98}
                strokeLinecap="butt"
                strokeDasharray={`${a.dash} ${Math.max(circumference - a.dash, 0.1)}`}
                strokeDashoffset={-a.offset}
              />
            ))}

            {/* inner hole */}
            <circle cx={0} cy={0} r={configuredRadius - strokeWidth + 8} fill="#ffffff" transform="rotate(90)" />

            {/* center percentage (rotate back) */}
            <g transform="rotate(90)">
              <text x={0} y={0} fontSize="20" fontWeight={800} fill="#0f172a" textAnchor="middle" dominantBaseline="middle">
                {top.percentage}%
              </text>
            </g>
          </g>
        </svg>
      </div>

      <div style={{ minWidth: 220 }}>
        {arcs.map((a) => (
          <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <span style={{ width: 14, height: 14, background: a.color, display: 'inline-block', borderRadius: 4 }} />
            <div>
              <div style={{ fontWeight: 700 }}>{a.name}</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>{a.votes} votes · {a.percentage}%</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
