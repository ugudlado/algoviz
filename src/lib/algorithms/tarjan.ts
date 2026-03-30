// @ts-ignore
import TarjanAlgorithmModule from "./tarjan-algorithm.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const TarjanAlgorithm: any = TarjanAlgorithmModule;

export interface TarjanEdge {
  from: string;
  to: string;
}

export interface TarjanStep {
  type: "visit" | "push" | "lowlink-update" | "scc-found" | "done";
  nodeId: string | null;
  discoveryTime: Record<string, number>;
  lowLink: Record<string, number>;
  stack: string[];
  sccs: string[][];
  sccNodes?: string[];
  edgeType: "tree" | "back" | "cross" | null;
  fromNode?: string;
  toNode?: string;
  description: string;
}

interface TarjanPreset {
  name: string;
  nodes: string[];
  edges: TarjanEdge[];
}

export type TarjanPresetKey = "classic" | "simpleCycle" | "dag";

export const PRESETS: Record<TarjanPresetKey, TarjanPreset> =
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  TarjanAlgorithm.PRESETS as Record<TarjanPresetKey, TarjanPreset>;

export function generateSteps(
  nodes: string[],
  edges: TarjanEdge[],
): TarjanStep[] {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  return TarjanAlgorithm.generateSteps(nodes, edges) as TarjanStep[];
}
