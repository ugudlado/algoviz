import PrimsAlgorithmModule from "./prims-algorithm";

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

type PrimsAlgorithmModuleType = {
  createGraph: (numVertices: number) => PrimsGraph;
  addEdge: (graph: PrimsGraph, u: number, v: number, weight: number) => void;
  primsMST: (graph: PrimsGraph, startNode: number) => PrimsResult;
};

const PrimsAlgorithm = PrimsAlgorithmModule as PrimsAlgorithmModuleType;

export const createGraph = (numVertices: number): PrimsGraph =>
  PrimsAlgorithm.createGraph(numVertices);

export const addEdge = (
  graph: PrimsGraph,
  u: number,
  v: number,
  weight: number,
): void => PrimsAlgorithm.addEdge(graph, u, v, weight);

export const primsMST = (graph: PrimsGraph, startNode: number): PrimsResult =>
  PrimsAlgorithm.primsMST(graph, startNode);
