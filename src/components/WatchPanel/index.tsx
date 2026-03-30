interface WatchVar {
  label: string;
  value: string | number;
  highlight?: boolean;
}

interface WatchPanelProps {
  vars: WatchVar[];
  title?: string;
}

export function WatchPanel({ vars, title = "Watch" }: WatchPanelProps) {
  return (
    <div className="algo-watch">
      <div className="algo-watch-title">{title}</div>
      {vars.map((v) => (
        <div key={v.label} className="algo-watch-row">
          <span className="algo-watch-label">{v.label}</span>
          <span
            className={`algo-watch-value${v.highlight ? " aw-highlight" : " aw-neutral"}`}
          >
            {String(v.value)}
          </span>
        </div>
      ))}
    </div>
  );
}
