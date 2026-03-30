// @ts-ignore
import PrimsAlgorithmModule from "./prims-algorithm.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const PrimsAlgorithm: any = PrimsAlgorithmModule;

export interface PrimsEdge {
  u: number;
  v: number;
  weight: number;
}

export interface PrimsStep {
  type: "visit" | "add_edge" | "skip_edge";
  node: number;
  edge: PrimsEdge | null;
  priorityQueue: PrimsEdge[];
  mstSoFar: PrimsEdge[];
  visited: number[];
  totalWeight: number;
}

interface PrimsResult {
  mstEdges: PrimsEdge[];
  totalWeight: number;
  steps: PrimsStep[];
}

interface PrimsGraph {
  numVertices: number;
  adjacency: Record<number, Array<{ to: number; weight: number }>>;
}

export function createGraph(numVertices: number): PrimsGraph {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  return PrimsAlgorithm.createGraph(numVertices) as PrimsGraph;
}

export function addEdge(
  graph: PrimsGraph,
  u: number,
  v: number,
  weight: number,
): void {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  PrimsAlgorithm.addEdge(graph, u, v, weight);
}

export function primsMST(graph: PrimsGraph, startNode: number): PrimsResult {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  return PrimsAlgorithm.primsMST(graph, startNode) as PrimsResult;
}
