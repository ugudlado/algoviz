import KruskalAlgorithmModule from "./kruskal-algorithm";

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

type KruskalAlgorithmModuleType = {
  findMST: (numNodes: number, edges: KruskalEdge[]) => KruskalResult;
};

const KruskalAlgorithm = KruskalAlgorithmModule as KruskalAlgorithmModuleType;

export const findMST = (
  numNodes: number,
  edges: KruskalEdge[],
): KruskalResult => KruskalAlgorithm.findMST(numNodes, edges);
