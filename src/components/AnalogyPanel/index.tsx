import { type ReactNode } from "react";

interface AnalogyPanelProps {
  children: ReactNode;
}

export function AnalogyPanel({ children }: AnalogyPanelProps) {
  return (
    <div className="analogy">
      <strong>Real-world analogy:</strong> {children}
    </div>
  );
}
