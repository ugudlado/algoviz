import DFSAlgorithmModule from "./dfs-algorithm";
import type { SearchAlgorithmModule } from "./module-types";

export type DfsCell = [number, number];

export interface DfsSnapshot {
  stack: DfsCell[];
  visited: DfsCell[];
  current: DfsCell | null;
  path: DfsCell[] | null;
  found: boolean;
}

interface DfsSearchResult {
  snapshots: DfsSnapshot[];
  path: DfsCell[] | null;
  found: boolean;
}

interface DfsSearchOptions {
  walls: boolean[][];
  rows: number;
  cols: number;
  start: DfsCell;
  end: DfsCell;
}

const DFSAlgorithm = DFSAlgorithmModule as SearchAlgorithmModule<
  [DfsSearchOptions],
  DfsSearchResult
>;

export const search = (options: DfsSearchOptions): DfsSearchResult => {
  return DFSAlgorithm.search(options);
};
