// @ts-ignore — IIFE + CommonJS bridge from dijkstra-algorithm.js
import DijkstraAlgorithmModule from "./dijkstra-algorithm.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DijkstraAlgorithm: any = DijkstraAlgorithmModule;

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

export function run(options: RunOptions): DijkstraResult {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  return DijkstraAlgorithm.run(options) as DijkstraResult;
}
