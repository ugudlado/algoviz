import { useAlgovizProgress } from "@/contexts/AlgovizProgressContext";
import { useLocation } from "react-router-dom";

export function AlgorithmComplete() {
  const { isAlgorithmComplete, toggleAlgorithmComplete } = useAlgovizProgress();
  const location = useLocation();
  const path = location.pathname;
  const done = isAlgorithmComplete(path);
  return (
    <button
      type="button"
      className="algo-complete-btn"
      onClick={() => toggleAlgorithmComplete(path)}
      aria-pressed={done}
      aria-label={done ? "Mark as not completed" : "Mark as completed"}
    >
      <span className="algo-complete-check" aria-hidden>
        {done ? "\u2713" : ""}
      </span>
      {done ? "Completed" : "Mark complete"}
    </button>
  );
}
