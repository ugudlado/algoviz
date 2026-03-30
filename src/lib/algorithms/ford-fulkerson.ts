// @ts-ignore — IIFE + CommonJS bridge from ford-fulkerson-algorithm.js
import FordFulkersonAlgorithmModule from "./ford-fulkerson-algorithm.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const FordFulkersonAlgorithm: any = FordFulkersonAlgorithmModule;

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

export const PRESETS: Record<string, PresetGraph> =
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  FordFulkersonAlgorithm.PRESETS as Record<string, PresetGraph>;

export function maxFlow(
  graph: Record<string, Record<string, number>>,
  source: string,
  sink: string,
): MaxFlowResult {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  return FordFulkersonAlgorithm.maxFlow(graph, source, sink) as MaxFlowResult;
}

export function buildResidual(
  graph: Record<string, Record<string, number>>,
): Record<string, Record<string, number>> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  return FordFulkersonAlgorithm.buildResidual(graph) as Record<
    string,
    Record<string, number>
  >;
}
