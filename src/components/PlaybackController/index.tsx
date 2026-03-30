import { useState, useEffect, useRef, useCallback } from 'react'

interface PlaybackControllerProps {
  steps: unknown[]
  currentStep: number
  onStep: (n: number) => void
  onReset: () => void
}

const SPEEDS = [
  { label: '0.5x', ms: 1200 },
  { label: '1x', ms: 600 },
  { label: '2x', ms: 300 },
  { label: '4x', ms: 150 },
]

export function PlaybackController({
  steps,
  currentStep,
  onStep,
  onReset,
}: PlaybackControllerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [speedIdx, setSpeedIdx] = useState(1) // default 1x
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const total = steps.length
  const atStart = currentStep <= 0
  const atEnd = currentStep >= total - 1

  const advance = useCallback(() => {
    onStep(currentStep + 1)
  }, [currentStep, onStep])

  useEffect(() => {
    if (isPlaying && !atEnd) {
      timerRef.current = setTimeout(() => {
        advance()
      }, SPEEDS[speedIdx].ms)
    } else if (atEnd) {
      setIsPlaying(false)
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isPlaying, atEnd, speedIdx, advance])

  const handleReset = () => {
    setIsPlaying(false)
    onReset()
  }

  const handlePlayPause = () => {
    if (atEnd) {
      onStep(0)
      setIsPlaying(true)
    } else {
      setIsPlaying((p) => !p)
    }
  }

  const cycleSpeed = () => {
    setSpeedIdx((i) => (i + 1) % SPEEDS.length)
  }

  return (
    <div className="playback-controls">
      <div className="playback-btns">
        {/* Reset */}
        <button
          className="icon-btn"
          onClick={handleReset}
          title="Reset"
          aria-label="Reset"
        >
          ↺
        </button>
        {/* Step back */}
        <button
          className="icon-btn"
          onClick={() => onStep(currentStep - 1)}
          disabled={atStart}
          title="Step back"
          aria-label="Step back"
        >
          ⏮
        </button>
        {/* Play / Pause */}
        <button
          className={`icon-btn${isPlaying ? ' active' : ''}`}
          onClick={handlePlayPause}
          title={isPlaying ? 'Pause' : 'Play'}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>
        {/* Step forward */}
        <button
          className="icon-btn"
          onClick={() => onStep(currentStep + 1)}
          disabled={atEnd}
          title="Step forward"
          aria-label="Step forward"
        >
          ⏭
        </button>
      </div>

      {/* Step counter */}
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.8rem',
          color: 'var(--text-secondary)',
        }}
      >
        Step {total > 0 ? currentStep + 1 : 0} / {total}
      </span>

      {/* Speed */}
      <button
        className="icon-btn"
        onClick={cycleSpeed}
        title="Cycle speed"
        style={{ width: 'auto', padding: '0 0.6rem', fontSize: '0.72rem' }}
      >
        {SPEEDS[speedIdx].label}
      </button>
    </div>
  )
}
