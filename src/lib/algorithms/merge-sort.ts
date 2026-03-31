import MergeSortAlgorithmModule from "./merge-sort-algorithm";
import type { SortAlgorithmModule } from "./module-types";

interface MergeSortStep {
  type: "split" | "merge" | "complete";
  array: number[];
  left?: number[];
  right?: number[];
  merged?: number[];
  depth?: number;
  comparisons: number;
  mergeOps: number;
  explanation: string;
}

interface MergeSortResult {
  steps: MergeSortStep[];
  sortedArray: number[];
}

const MergeSortAlgorithm = MergeSortAlgorithmModule as SortAlgorithmModule<
  [number[]],
  MergeSortResult
>;

export const generateSteps = (arr: number[]): MergeSortResult => {
  return MergeSortAlgorithm.sort(arr);
};
