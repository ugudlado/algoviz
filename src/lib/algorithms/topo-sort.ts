import TopoSortAlgorithmModule from "./topo-sort-algorithm";
import type { RunAlgorithmModule } from "./module-types";

export interface TopoEdge {
  from: string;
  to: string;
}

export interface TopoSnapshot {
  inDegrees: Record<string, number>;
  queue: string[];
  order: string[];
  action: "init" | "dequeue" | "update-neighbors" | "cycle-detected" | string;
  currentNode: string | null;
}

export interface TopoSortResult {
  order: string[];
  hasCycle: boolean;
  cycleNodes: string[];
  snapshots: TopoSnapshot[];
  error: string | null;
}

export interface TopoPreset {
  name: string;
  nodes: string[];
  edges: TopoEdge[];
}

type TopoSortAlgorithmModuleType = RunAlgorithmModule<
  { nodes: string[]; edges: TopoEdge[] },
  TopoSortResult
> & {
  MAX_NODES: number;
  presets: Record<string, TopoPreset>;
};

const TopoSortAlgorithm =
  TopoSortAlgorithmModule as TopoSortAlgorithmModuleType;

export const MAX_NODES: number = TopoSortAlgorithm.MAX_NODES;

export const presets: Record<string, TopoPreset> = TopoSortAlgorithm.presets;

export const run = (params: {
  nodes: string[];
  edges: TopoEdge[];
}): TopoSortResult => TopoSortAlgorithm.run(params);
