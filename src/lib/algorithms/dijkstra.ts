import DijkstraAlgorithmModule from "./dijkstra-algorithm";
import type { RunAlgorithmModule } from "./module-types";

export const MAX_WEIGHT: number = 999;

export interface DijkstraNode {
  id: string;
  x: number;
  y: number;
}

export interface DijkstraEdge {
  from: string;
  to: string;
  weight: number;
}

export interface PriorityQueueEntry {
  node: string;
  distance: number;
}

export interface DijkstraSnapshot {
  current: string;
  distances: Record<string, number>;
  priorityQueue: PriorityQueueEntry[];
  visited: string[];
  relaxedEdge: { from: string; to: string } | null;
}

interface DijkstraResult {
  distances: Record<string, number>;
  previous: Record<string, string | null>;
  snapshots: DijkstraSnapshot[];
  path: (target: string) => string[] | null;
  error: string | null;
}

interface RunOptions {
  nodes: string[];
  edges: DijkstraEdge[];
  source: string;
}

type DijkstraAlgorithmModuleType = RunAlgorithmModule<
  RunOptions,
  DijkstraResult
>;

const DijkstraAlgorithm =
  DijkstraAlgorithmModule as DijkstraAlgorithmModuleType;

export const run = (options: RunOptions): DijkstraResult =>
  DijkstraAlgorithm.run(options);
