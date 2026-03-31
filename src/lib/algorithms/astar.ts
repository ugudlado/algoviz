import AStarAlgorithmModule from "./astar-algorithm";
import type { RunAlgorithmModule } from "./module-types";

export type AStarCell = [number, number];

export interface CellCost {
  g: number;
  h: number;
  f: number;
}

export interface AStarSnapshot {
  current: AStarCell;
  openSet: AStarCell[];
  closedSet: AStarCell[];
  costs: Record<string, CellCost>;
}

export interface AStarResult {
  path: AStarCell[] | null;
  snapshots: AStarSnapshot[];
  explored: number;
  pathLength: number;
  error: string | null;
}

interface AStarRunOptions {
  grid: {
    rows: number;
    cols: number;
    walls: AStarCell[];
  };
  start: AStarCell;
  end: AStarCell;
  heuristic: "manhattan" | "euclidean";
}

type AStarAlgorithmModuleType = RunAlgorithmModule<
  AStarRunOptions,
  AStarResult
> & {
  runBFS: (options: AStarRunOptions) => AStarResult;
};

const AStarAlgorithm = AStarAlgorithmModule as AStarAlgorithmModuleType;

export const runAStar = (options: AStarRunOptions): AStarResult =>
  AStarAlgorithm.run(options);
export const runBFS = (options: AStarRunOptions): AStarResult =>
  AStarAlgorithm.runBFS(options);
