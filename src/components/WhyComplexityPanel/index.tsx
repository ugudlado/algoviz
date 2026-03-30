import { useState } from 'react'

interface WhyComplexityPanelProps {
  derivation: string
}

export function WhyComplexityPanel({ derivation }: WhyComplexityPanelProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div
      style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        padding: '0.75rem 1rem',
        marginBottom: '1rem',
        fontSize: '0.85rem',
      }}
    >
      <button
        onClick={() => setExpanded((e) => !e)}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-secondary)',
          cursor: 'pointer',
          padding: 0,
          fontSize: '0.8rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          fontFamily: 'var(--font-body)',
        }}
      >
        <span>{expanded ? '▾' : '▸'}</span>
        Why this complexity?
      </button>
      {expanded && (
        <p
          style={{
            marginTop: '0.6rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            fontSize: '0.82rem',
          }}
        >
          {derivation}
        </p>
      )}
    </div>
  )
}
