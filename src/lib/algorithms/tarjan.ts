import TarjanAlgorithmModule from "./tarjan-algorithm";

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

type TarjanAlgorithmModuleType = {
  PRESETS: Record<TarjanPresetKey, TarjanPreset>;
  generateSteps: (nodes: string[], edges: TarjanEdge[]) => TarjanStep[];
};

const TarjanAlgorithm = TarjanAlgorithmModule as TarjanAlgorithmModuleType;

export const PRESETS: Record<TarjanPresetKey, TarjanPreset> =
  TarjanAlgorithm.PRESETS;

export const generateSteps = (
  nodes: string[],
  edges: TarjanEdge[],
): TarjanStep[] => TarjanAlgorithm.generateSteps(nodes, edges);
