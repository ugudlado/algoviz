// @ts-ignore — IIFE + CommonJS bridge from astar-algorithm.js
import AStarAlgorithmModule from "./astar-algorithm.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const AStarAlgorithm: any = AStarAlgorithmModule;

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

export function runAStar(options: AStarRunOptions): AStarResult {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  return AStarAlgorithm.run(options) as AStarResult;
}

export function runBFS(options: AStarRunOptions): AStarResult {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  return AStarAlgorithm.runBFS(options) as AStarResult;
}
