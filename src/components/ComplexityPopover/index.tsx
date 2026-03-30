import { useState } from 'react'

interface ComplexityPopoverProps {
  best: string
  avg: string
  worst: string
  space: string
  bestNote?: string
  avgNote?: string
  worstNote?: string
  spaceNote?: string
  why?: string
}

export function ComplexityPopover({
  best,
  avg,
  worst,
  space,
  bestNote,
  avgNote,
  worstNote,
  spaceNote,
  why,
}: ComplexityPopoverProps) {
  const [open, setOpen] = useState(false)

  return (
    <div
      className="complexity-badge"
      style={{ display: 'inline-block' }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <span
        className="badge badge-accent"
        style={{ cursor: 'pointer' }}
        onClick={() => setOpen((o) => !o)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') setOpen((o) => !o)
        }}
        aria-label="Show complexity details"
      >
        O(n²) / O(1)
      </span>

      {open && (
        <div className="complexity-popover" style={{ top: '100%', left: 0 }}>
          <div className="cp-row">
            <span className="cp-label">Best</span>
            <span className="cp-value">{best}</span>
            {bestNote && <span className="cp-note">{bestNote}</span>}
          </div>
          <div className="cp-row">
            <span className="cp-label">Avg</span>
            <span className="cp-value">{avg}</span>
            {avgNote && <span className="cp-note">{avgNote}</span>}
          </div>
          <div className="cp-row">
            <span className="cp-label">Worst</span>
            <span className="cp-value">{worst}</span>
            {worstNote && <span className="cp-note">{worstNote}</span>}
          </div>
          <div className="cp-row">
            <span className="cp-label">Space</span>
            <span className="cp-value">{space}</span>
            {spaceNote && <span className="cp-note">{spaceNote}</span>}
          </div>
          {why && (
            <div className="cp-why">
              <div className="cp-why-label">Why?</div>
              <div className="cp-why-text">{why}</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
