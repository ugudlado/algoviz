import FordFulkersonAlgorithmModule from "./ford-fulkerson-algorithm";

export interface NodePosition {
  x: number;
  y: number;
}

export interface PresetGraph {
  name: string;
  description: string;
  nodes: string[];
  source: string;
  sink: string;
  graph: Record<string, Record<string, number>>;
  expectedMaxFlow: number;
  positions: Record<string, NodePosition>;
}

export interface FordFulkersonStep {
  type: "bfs-start" | "bfs-path-found" | "bfs-no-path" | "augment" | "done";
  path: string[] | null;
  bottleneck: number;
  residual: Record<string, Record<string, number>>;
  totalFlow: number;
  description: string;
}

export interface MinCut {
  sideS: string[];
  sideT: string[];
  edges: { from: string; to: string }[];
}

interface MaxFlowResult {
  flow: number;
  steps: FordFulkersonStep[];
  minCut: MinCut;
}

type FordFulkersonAlgorithmModuleType = {
  PRESETS: Record<string, PresetGraph>;
  maxFlow: (
    graph: Record<string, Record<string, number>>,
    source: string,
    sink: string,
  ) => MaxFlowResult;
  buildResidual: (
    graph: Record<string, Record<string, number>>,
  ) => Record<string, Record<string, number>>;
};

const FordFulkersonAlgorithm =
  FordFulkersonAlgorithmModule as FordFulkersonAlgorithmModuleType;

export const PRESETS: Record<string, PresetGraph> =
  FordFulkersonAlgorithm.PRESETS;

export const maxFlow = (
  graph: Record<string, Record<string, number>>,
  source: string,
  sink: string,
): MaxFlowResult => FordFulkersonAlgorithm.maxFlow(graph, source, sink);

export const buildResidual = (
  graph: Record<string, Record<string, number>>,
): Record<string, Record<string, number>> =>
  FordFulkersonAlgorithm.buildResidual(graph);
