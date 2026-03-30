import { type ReactNode } from 'react'

interface ProblemFrameProps {
  title: string
  children: ReactNode
}

export function ProblemFrame({ title, children }: ProblemFrameProps) {
  return (
    <div className="algo-problem-panel">
      <h3>{title}</h3>
      {children}
    </div>
  )
}
