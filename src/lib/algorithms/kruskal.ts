// @ts-ignore
import KruskalAlgorithmModule from "./kruskal-algorithm.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const KruskalAlgorithm: any = KruskalAlgorithmModule;

export interface KruskalEdge {
  u: number;
  v: number;
  w: number;
}

export interface KruskalStep {
  phase: "sort" | "consider";
  edgeIdx: number;
  edge: KruskalEdge | null;
  accepted: boolean | null;
  mstEdges: KruskalEdge[];
  totalWeight: number;
  sortedEdges: KruskalEdge[];
  explanation: string;
}

interface KruskalResult {
  steps: KruskalStep[];
  mstEdges: KruskalEdge[];
  totalWeight: number;
}

export function findMST(numNodes: number, edges: KruskalEdge[]): KruskalResult {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  return KruskalAlgorithm.findMST(numNodes, edges) as KruskalResult;
}
