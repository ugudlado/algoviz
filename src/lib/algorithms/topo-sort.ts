// @ts-ignore
import TopoSortAlgorithmModule from "./topo-sort-algorithm.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const TopoSortAlgorithm: any = TopoSortAlgorithmModule;

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

export const MAX_NODES: number =
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  TopoSortAlgorithm.MAX_NODES as number;

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
export const presets: Record<string, TopoPreset> =
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  TopoSortAlgorithm.presets as Record<string, TopoPreset>;

export function run(params: {
  nodes: string[];
  edges: TopoEdge[];
}): TopoSortResult {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  return TopoSortAlgorithm.run(params) as TopoSortResult;
}
